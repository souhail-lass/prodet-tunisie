import { NextResponse, type NextRequest } from 'next/server';
import { consumeRateLimit } from '@/lib/rate-limit';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Token-hash login (no email send).
 *
 *   /auth/otp?token_hash=<hashed_token>&next=/fr/client
 *
 * Exchanges a Supabase-issued one-time `token_hash` for a real session and
 * writes the auth cookies, then redirects. The token_hash is single-use and
 * short-lived and can only be minted with the service-role key (via
 * admin.generateLink) — so this is exactly as safe as a magic link, but it
 * bypasses the email-send rate limit. Lightly rate-limited per IP.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const next = sanitizeNext(searchParams.get('next'));
  const loginPath = next.includes('/admin') ? '/fr/connexion-admin' : '/fr/connexion-client';

  if (!tokenHash) {
    return NextResponse.redirect(`${origin}${loginPath}?error=missing-token`);
  }

  const limit = await consumeRateLimit({ scope: 'auth-otp', limit: 20, windowMs: 15 * 60_000 });
  if (!limit.ok) {
    return NextResponse.redirect(`${origin}${loginPath}?error=rate-limited`);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ type: 'magiclink', token_hash: tokenHash });
    if (error) {
      return NextResponse.redirect(`${origin}${loginPath}?error=otp`);
    }
  } catch {
    return NextResponse.redirect(`${origin}${loginPath}?error=config`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}

function sanitizeNext(value: string | null): string {
  const fallback = '/fr/client';
  if (!value) return fallback;
  try {
    const decoded = decodeURIComponent(value);
    if (/^\/(fr|ar|en)\/(client|admin)(?:\/|$)/u.test(decoded) && !decoded.startsWith('//')) {
      return decoded;
    }
  } catch {
    // fall through
  }
  return fallback;
}
