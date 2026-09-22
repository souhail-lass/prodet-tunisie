/**
 * Local (no network) helpers for Supabase Auth session cookies.
 * Used to skip expensive getUser()/DB checks when the browser has no session.
 */

export const SUPABASE_AUTH_COOKIE_PATTERN = /^sb-[a-zA-Z0-9]+-auth-token(?:\.\d+)?$/;

/** Refresh via getUser() once the access token is within this window of expiry. */
export const TOKEN_FRESHNESS_MARGIN_S = 60;

type CookieLike = { name: string; value: string };

export function listAuthCookieChunks(cookies: readonly CookieLike[]): CookieLike[] {
  return cookies
    .filter((cookie) => SUPABASE_AUTH_COOKIE_PATTERN.test(cookie.name) && cookie.value)
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
}

export function hasSupabaseAuthCookie(cookies: readonly CookieLike[]): boolean {
  return listAuthCookieChunks(cookies).length > 0;
}

function decodeBase64Url(value: string): string {
  const b64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
}

/**
 * Reads the session cookie locally (no signature check). Routing hint only —
 * protected routes still verify via getUser() / require*Access().
 */
export function hasFreshSupabaseSession(
  cookies: readonly CookieLike[],
  nowSec = Math.floor(Date.now() / 1000),
): boolean {
  const chunks = listAuthCookieChunks(cookies);
  if (chunks.length === 0) return false;

  try {
    let raw = chunks.map((cookie) => cookie.value).join('');
    if (raw.startsWith('base64-')) {
      raw = decodeBase64Url(raw.slice('base64-'.length));
    }
    const session = JSON.parse(raw) as { expires_at?: number | string };
    const expiresAt = Number(session.expires_at);
    if (!Number.isFinite(expiresAt)) return false;
    return expiresAt - nowSec > TOKEN_FRESHNESS_MARGIN_S;
  } catch {
    return false;
  }
}
