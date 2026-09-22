'use server';

import { redirect } from 'next/navigation';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { brandedHtml, sendEmail } from '@/lib/email';
import { consumeRateLimit } from '@/lib/rate-limit';
import { resolveAuthOrigin } from '@/lib/site-origin';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ensureConfirmedAuthUser } from '@/features/admin/clients';

const ClientLoginSchema = z.object({
  email: z.string().trim().email(),
  locale: z.enum(['fr', 'en']).default('fr'),
  next: z.string().trim().optional(),
});

export async function requestClientMagicLink(formData: FormData): Promise<never> {
  const parsed = ClientLoginSchema.safeParse({
    email: formData.get('email'),
    locale: formData.get('locale') || 'fr',
    next: formData.get('next') || undefined,
  });

  const locale = parsed.success ? parsed.data.locale : 'fr';
  const nextPath = parsed.success
    ? sanitizeClientNext(locale, parsed.data.next)
    : `/${locale}/client`;

  if (!parsed.success) {
    redirect(`/${locale}/connexion-client?error=invalid`);
  }

  const email = parsed.data.email.toLowerCase();

  const ipLimit = await consumeRateLimit({
    scope: 'login-client-ip',
    limit: 10,
    windowMs: 15 * 60_000,
  });
  if (!ipLimit.ok) {
    redirect(`/${locale}/connexion-client?error=rate-limited`);
  }
  const emailLimit = await consumeRateLimit({
    scope: 'login-client-email',
    limit: 5,
    windowMs: 15 * 60_000,
    identifier: email,
  });
  if (!emailLimit.ok) {
    redirect(`/${locale}/connexion-client?error=rate-limited`);
  }

  // Same sent=1 for unknown emails — anti-enumeration.
  const hasAccess = await hasActivatedClientAccess(email);
  if (!hasAccess) {
    redirect(`/${locale}/connexion-client?sent=1`);
  }

  const origin = await resolveAuthOrigin();
  const delivered = await sendResendMagicLink({ email, locale, nextPath, origin });
  if (delivered === 'sent') {
    redirect(`/${locale}/connexion-client?sent=1`);
  }
  if (delivered === 'failed') {
    redirect(`/${locale}/connexion-client?error=failed`);
  }

  // Fallback when Resend / service-role is unavailable (local without keys).
  await sendSupabaseHostedMagicLink({ email, nextPath, origin, locale });
  redirect(`/${locale}/connexion-client?sent=1`);
}

/**
 * Mint a token_hash via Admin API and email a direct /auth/callback link via Resend.
 * No intermediate confirm page — click in the mail lands straight in the portal.
 */
async function sendResendMagicLink(input: {
  email: string;
  locale: 'fr' | 'en';
  nextPath: string;
  origin: string;
}): Promise<'sent' | 'skipped' | 'failed'> {
  if (!process.env.RESEND_API_KEY?.trim()) return 'skipped';

  try {
    await ensureConfirmedAuthUser(input.email);
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: input.email,
    });

    const tokenHash = data?.properties?.hashed_token;
    if (error || !tokenHash) {
      console.error('[client-login:generate-link]', {
        message: error?.message,
      });
      return 'failed';
    }

    const loginUrl = `${input.origin}/auth/callback?token_hash=${encodeURIComponent(tokenHash)}&type=magiclink&next=${encodeURIComponent(input.nextPath)}`;
    const isEnglish = input.locale === 'en';
    const subject = isEnglish
      ? 'Your Prodet client sign-in link'
      : 'Votre lien de connexion Prodet';
    const heading = isEnglish ? 'Sign in to your client space' : 'Connexion à votre espace client';
    const lines = isEnglish
      ? [
          'Use the button below to sign in. The link works once and expires shortly.',
          'If you did not request this, you can ignore this email.',
        ]
      : [
          'Utilisez le bouton ci-dessous pour vous connecter. Le lien ne fonctionne qu’une fois et expire rapidement.',
          'Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.',
        ];
    const ctaLabel = isEnglish ? 'Enter client space' : 'Entrer dans l’espace client';

    return sendEmail({
      to: input.email,
      subject,
      text: [...lines, '', loginUrl].join('\n'),
      html: brandedHtml(heading, lines, { label: ctaLabel, url: loginUrl }),
    });
  } catch (error) {
    console.error('[client-login:resend-magic]', error instanceof Error ? error.message : error);
    return 'failed';
  }
}

async function sendSupabaseHostedMagicLink(input: {
  email: string;
  nextPath: string;
  origin: string;
  locale: 'fr' | 'en';
}): Promise<void> {
  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch {
    redirect(`/${input.locale}/connexion-client?error=config`);
  }

  const emailRedirectTo = `${input.origin}/auth/callback?next=${encodeURIComponent(input.nextPath)}`;
  const { error } = await supabase.auth.signInWithOtp({
    email: input.email,
    options: {
      emailRedirectTo,
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error('[client-login:magic-link-error]', {
      message: error.message,
      status: error.status,
    });
    redirect(`/${input.locale}/connexion-client?error=failed`);
  }
}

async function hasActivatedClientAccess(email: string): Promise<boolean> {
  const { db, schema } = await import('@/db/client');
  const [appUser] = await db
    .select()
    .from(schema.user)
    .where(sql`lower(${schema.user.email}) = ${email}`)
    .limit(1);

  if (!appUser || appUser.role !== 'customer_user' || !appUser.isActive) return false;

  const [membership] = await db
    .select({ userId: schema.userCustomer.userId })
    .from(schema.userCustomer)
    .where(eq(schema.userCustomer.userId, appUser.id))
    .limit(1);

  return Boolean(membership);
}

function sanitizeClientNext(locale: 'fr' | 'en', value?: string): string {
  if (!value) return `/${locale}/client`;

  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith(`/${locale}/client`) && !decoded.startsWith('//')) {
      return decoded;
    }
  } catch {
    // Fall through to default.
  }

  if (value.startsWith(`/${locale}/client`) && !value.startsWith('//')) return value;

  return `/${locale}/client`;
}
