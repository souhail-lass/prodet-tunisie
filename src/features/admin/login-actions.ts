'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { consumeRateLimit } from '@/lib/rate-limit';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const AdminLoginSchema = z.object({
  email: z.string().trim().email(),
  locale: z.enum(['fr', 'ar', 'en']).default('fr'),
  next: z.string().trim().optional(),
});

export async function requestAdminMagicLink(formData: FormData): Promise<never> {
  const parsed = AdminLoginSchema.safeParse({
    email: formData.get('email'),
    locale: formData.get('locale') || 'fr',
    next: formData.get('next') || undefined,
  });

  const locale = parsed.success ? parsed.data.locale : 'fr';
  const nextPath = parsed.success
    ? sanitizeAdminNext(locale, parsed.data.next)
    : `/${locale}/admin/clients`;

  if (!parsed.success) {
    redirect(`/${locale}/connexion-admin?error=invalid`);
  }

  const ipLimit = await consumeRateLimit({
    scope: 'login-admin-ip',
    limit: 10,
    windowMs: 15 * 60_000,
  });
  if (!ipLimit.ok) {
    redirect(`/${locale}/connexion-admin?error=rate-limited`);
  }
  const emailLimit = await consumeRateLimit({
    scope: 'login-admin-email',
    limit: 5,
    windowMs: 15 * 60_000,
    identifier: parsed.data.email.trim().toLowerCase(),
  });
  if (!emailLimit.ok) {
    redirect(`/${locale}/connexion-admin?error=rate-limited`);
  }

  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch {
    redirect(`/${locale}/connexion-admin?error=config`);
  }

  // Trust the configured site URL in production so a spoofed Host/Origin
  // header cannot poison the admin magic-link email (host-header injection).
  const headersList = await headers();
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  const origin =
    process.env.NODE_ENV === 'production' && configuredOrigin
      ? configuredOrigin
      : headersList.get('origin') ||
        `${headersList.get('x-forwarded-proto') ?? 'http'}://${headersList.get('host')}`;
  const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo,
      shouldCreateUser: false,
    },
  });

  if (error) {
    console.error('[admin-login:magic-link-error]', {
      message: error.message,
      status: error.status,
    });
    redirect(`/${locale}/connexion-admin?error=failed`);
  }

  redirect(`/${locale}/connexion-admin?sent=1`);
}

function sanitizeAdminNext(locale: 'fr' | 'ar' | 'en', value?: string): string {
  if (!value) return `/${locale}/admin/clients`;

  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith(`/${locale}/admin/`) && !decoded.startsWith('//')) {
      return decoded;
    }
  } catch {
    // Fall through to default.
  }

  if (value.startsWith(`/${locale}/admin/`) && !value.startsWith('//')) return value;

  return `/${locale}/admin/clients`;
}
