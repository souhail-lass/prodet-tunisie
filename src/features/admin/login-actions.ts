'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { consumeRateLimit } from '@/lib/rate-limit';
import { resolveAuthOrigin } from '@/lib/site-origin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const AdminLoginSchema = z.object({
  email: z.string().trim().email(),
  locale: z.enum(['fr', 'en']).default('fr'),
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
    : `/${locale}/admin/overview`;

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

  const origin = await resolveAuthOrigin();
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

function sanitizeAdminNext(locale: 'fr' | 'en', value?: string): string {
  if (!value) return `/${locale}/admin/overview`;

  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith(`/${locale}/admin/`) && !decoded.startsWith('//')) {
      return decoded;
    }
  } catch {
    // Fall through to default.
  }

  if (value.startsWith(`/${locale}/admin/`) && !value.startsWith('//')) return value;

  return `/${locale}/admin/overview`;
}
