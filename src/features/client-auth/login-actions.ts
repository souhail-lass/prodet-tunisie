'use server';

import { redirect } from 'next/navigation';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { consumeRateLimit } from '@/lib/rate-limit';
import { resolveAuthOrigin } from '@/lib/site-origin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

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
  const nextPath = parsed.success ? sanitizeClientNext(locale, parsed.data.next) : `/${locale}/client`;

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

  // We intentionally short-circuit on inactive accounts to avoid
  // triggering Supabase magic-link emails for unknown addresses, but
  // we return the same `sent=1` outcome the caller sees on success
  // to avoid user enumeration. Inactive accounts get a friendly
  // "check your email" page without an email actually being sent.
  const hasAccess = await hasActivatedClientAccess(email);
  if (!hasAccess) {
    redirect(`/${locale}/connexion-client?sent=1`);
  }

  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch {
    redirect(`/${locale}/connexion-client?error=config`);
  }

  const origin = await resolveAuthOrigin();
  const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
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
    redirect(`/${locale}/connexion-client?error=failed`);
  }

  redirect(`/${locale}/connexion-client?sent=1`);
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
