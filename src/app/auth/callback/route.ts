import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { getServerEnv } from '@/lib/env';

type PendingCookie = { name: string; value: string; options: CookieOptions };

/**
 * Completes a magic-link / OTP login.
 *
 * Supports:
 * - `?code=` (PKCE exchange after Supabase /verify redirect)
 * - `?token_hash=&type=` (server-side verifyOtp — works across devices and
 *   survives Gmail link prefetch when the email first lands on /auth/confirm)
 *
 * Session cookies must be written onto the *redirect* response; setting them
 * only via `cookies()` from `next/headers` drops them on `NextResponse.redirect`.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const otpType = searchParams.get('type');
  const next = sanitizeNext(searchParams.get('next'));
  const locale = getLocaleFromNext(next);
  const loginPath = isClientPath(next)
    ? `/${locale}/connexion-client`
    : `/${locale}/connexion-admin`;

  const origin = resolveCallbackOrigin(request);
  const fail = (error: string) => NextResponse.redirect(`${origin}${loginPath}?error=${error}`);

  if (!code && !(tokenHash && otpType)) {
    return fail('missing-code');
  }

  const env = getServerEnv();
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return fail('config');
  }

  const pendingCookies: PendingCookie[] = [];

  const supabase = createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        pendingCookies.length = 0;
        cookiesToSet.forEach(({ name, value, options }) => {
          pendingCookies.push({ name, value, options });
        });
      },
    },
  });

  try {
    if (tokenHash && otpType) {
      const { error } = await supabase.auth.verifyOtp({
        type: otpType as EmailOtpType,
        token_hash: tokenHash,
      });
      if (error) {
        console.error('[auth:callback:verify-otp]', {
          message: error.message,
          status: error.status,
        });
        return fail('callback');
      }
    } else if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('[auth:callback:exchange]', {
          message: error.message,
          status: error.status,
        });
        return fail('callback');
      }
    }
  } catch (error) {
    console.error('[auth:callback:config]', error);
    return fail('config');
  }

  const response = NextResponse.redirect(`${origin}${next}`);
  for (const { name, value, options } of pendingCookies) {
    response.cookies.set(name, value, options);
  }
  return response;
}

function resolveCallbackOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  if (process.env.NODE_ENV !== 'development' && forwardedHost) {
    return `${proto}://${forwardedHost}`;
  }
  return new URL(request.url).origin;
}

function sanitizeNext(value: string | null): string {
  if (!value) return '/fr/client';

  try {
    const decoded = decodeURIComponent(value);
    if (isAllowedAuthRedirect(decoded)) return decoded;
  } catch {
    // Fall through to raw value.
  }

  if (isAllowedAuthRedirect(value)) return value;

  return '/fr/client';
}

function isAllowedAuthRedirect(value: string): boolean {
  return (
    (/^\/(fr|ar|en)\/admin\//u.test(value) || /^\/(fr|ar|en)\/client(?:\/|$)/u.test(value)) &&
    !value.startsWith('//')
  );
}

function isClientPath(value: string): boolean {
  return /^\/(fr|ar|en)\/client(?:\/|$)/u.test(value) && !value.startsWith('//');
}

function getLocaleFromNext(value: string): 'fr' | 'en' {
  const locale = value.split('/')[1];
  return locale === 'en' ? locale : 'fr';
}
