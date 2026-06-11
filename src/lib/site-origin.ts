import 'server-only';
import { headers } from 'next/headers';

const LOCAL_HOST = /^(localhost|127\.|0\.0\.0\.0|\[::1\])/u;

/** A usable https origin from NEXT_PUBLIC_SITE_URL, or null if missing/local. */
function configuredOrigin(): string | null {
  const value = process.env.NEXT_PUBLIC_SITE_URL;
  if (!value) return null;
  try {
    const url = new URL(value);
    // A localhost value must never drive a PRODUCTION auth redirect — that is
    // exactly the misconfiguration that mails clients a login link pointing at
    // their own machine and bounces them to the home page.
    if (process.env.NODE_ENV === 'production' && LOCAL_HOST.test(url.hostname)) return null;
    return url.origin; // strips any path ("/fr"), trailing slash, etc.
  } catch {
    return null;
  }
}

/** Origin derived from the (platform-normalized) request headers. */
async function requestOrigin(): Promise<string | null> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (!host) return h.get('origin');
  const proto = h.get('x-forwarded-proto') ?? (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  return `${proto}://${host}`;
}

/**
 * The origin to embed in auth emails (magic links, activation links).
 *
 * Production: prefer NEXT_PUBLIC_SITE_URL (the stable canonical URL), but if it
 * is missing or points at localhost, fall back to the real request host so the
 * deploy still works. We never emit a localhost redirect in production.
 *
 * Development: follow the request headers so any localhost port just works.
 */
export async function resolveAuthOrigin(): Promise<string> {
  const configured = configuredOrigin();

  if (process.env.NODE_ENV === 'production') {
    return configured ?? (await requestOrigin()) ?? 'http://localhost:3004';
  }

  return (await requestOrigin()) ?? configured ?? 'http://localhost:3004';
}
