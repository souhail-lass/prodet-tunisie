/**
 * Canonical public origin.
 *
 * Vercel serves www.prodet.com.tn; the apex 308-redirects to www. Canonicals,
 * hreflang, sitemap and JSON-LD must use the final host — Google treats a
 * canonical that itself redirects as a signal to ignore.
 */
const APEX_HOST = 'prodet.com.tn';
const WWW_ORIGIN = 'https://www.prodet.com.tn';

export function normalizePublicOrigin(value: string): string {
  try {
    const url = new URL(value);
    if (url.hostname === APEX_HOST) url.hostname = `www.${APEX_HOST}`;
    return url.origin;
  } catch {
    return value.replace(/\/$/u, '');
  }
}

export function canonicalPublicOrigin(): string {
  const fallback = process.env.NODE_ENV === 'production' ? WWW_ORIGIN : 'http://localhost:3004';
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim() || fallback;
  return normalizePublicOrigin(value);
}
