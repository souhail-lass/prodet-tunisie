import 'server-only';
import { headers } from 'next/headers';

/**
 * The origin to embed in auth emails (magic links, activation links).
 *
 * In production we trust NEXT_PUBLIC_SITE_URL — never the request's
 * Host/Origin headers (host-header injection would poison login emails).
 * The value is normalized through `new URL().origin`, so common dashboard
 * misconfigurations ("https://site.tn/fr", trailing slash) can't produce a
 * redirect URL that misses Supabase's allowlist and silently bounces users
 * to the home page.
 *
 * In dev we fall back to the request headers so any localhost port works.
 */
export async function resolveAuthOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const normalized = (() => {
    if (!configured) return null;
    try {
      return new URL(configured).origin;
    } catch {
      return null;
    }
  })();

  if (process.env.NODE_ENV === 'production' && normalized) return normalized;

  const headersList = await headers();
  return (
    headersList.get('origin') ||
    (headersList.get('host')
      ? `${headersList.get('x-forwarded-proto') ?? 'http'}://${headersList.get('host')}`
      : (normalized ?? 'http://localhost:3004'))
  );
}
