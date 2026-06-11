import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { defaultLocale, locales } from '@/i18n/routing';

function getLocaleFromPathname(pathname: string): string | null {
  const segments = pathname.split('/');
  const candidate = segments[1];
  return candidate && locales.includes(candidate as (typeof locales)[number]) ? candidate : null;
}

function isLocalizedAdminPath(pathname: string): boolean {
  const segments = pathname.split('/');
  return (
    segments.length >= 3 &&
    locales.includes(segments[1] as (typeof locales)[number]) &&
    segments[2] === 'admin'
  );
}

function isLocalizedClientPath(pathname: string): boolean {
  const segments = pathname.split('/');
  return (
    segments.length >= 3 &&
    locales.includes(segments[1] as (typeof locales)[number]) &&
    segments[2] === 'client'
  );
}

const AUTH_COOKIE_PATTERN = /^sb-[a-zA-Z0-9]+-auth-token(?:\.\d+)?$/;
/** Refresh via getUser() once the access token is within this window of expiry. */
const TOKEN_FRESHNESS_MARGIN_S = 60;

function decodeBase64Url(value: string): string {
  const b64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
}

/**
 * Reads the Supabase session cookie locally (no network, no signature check)
 * and reports whether its access token is comfortably far from expiry.
 *
 * This is only a routing hint to skip the per-navigation Supabase round trip:
 * every /client and /admin page re-verifies the session server-side via
 * requireClientPortalAccess() / requireAdmin(), so a forged cookie only
 * reaches the same login redirect one step later. Near expiry (or when the
 * cookie is unreadable) we fall back to supabase.auth.getUser(), which also
 * refreshes the session cookies.
 */
function hasFreshSession(request: NextRequest): boolean {
  const chunks = request.cookies
    .getAll()
    .filter((cookie) => AUTH_COOKIE_PATTERN.test(cookie.name) && cookie.value)
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
  if (chunks.length === 0) return false;

  try {
    let raw = chunks.map((cookie) => cookie.value).join('');
    if (raw.startsWith('base64-')) {
      raw = decodeBase64Url(raw.slice('base64-'.length));
    }
    const session = JSON.parse(raw) as { expires_at?: number | string };
    const expiresAt = Number(session.expires_at);
    if (!Number.isFinite(expiresAt)) return false;
    return expiresAt - Math.floor(Date.now() / 1000) > TOKEN_FRESHNESS_MARGIN_S;
  } catch {
    return false;
  }
}

function passThroughWithLocale(request: NextRequest, locale: string) {
  const response = NextResponse.next({ request });
  response.cookies.set('NEXT_LOCALE', locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
  });
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const pathnameLocale = getLocaleFromPathname(pathname);

  if (pathname.startsWith('/auth/')) {
    return NextResponse.next();
  }

  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
    return NextResponse.redirect(url);
  }

  if (pathnameLocale) {
    if (isLocalizedAdminPath(pathname)) {
      return protectAdminPath(request, pathnameLocale);
    }

    if (isLocalizedClientPath(pathname)) {
      return protectClientPath(request, pathnameLocale);
    }

    const response = NextResponse.next();
    response.cookies.set('NEXT_LOCALE', pathnameLocale, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
    });
    return response;
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  url.search = search;
  return NextResponse.redirect(url);
}

async function protectClientPath(request: NextRequest, locale: string) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (!supabaseUrl || !supabaseAnonKey) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/connexion-client`;
    url.search = '?error=config';
    return NextResponse.redirect(url);
  }

  // Fast path: token still fresh — skip the Supabase round trip entirely.
  if (hasFreshSession(request)) {
    return passThroughWithLocale(request, locale);
  }

  let response = NextResponse.next();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Dev preview: with no session, let the portal render its demo data instead
    // of redirecting to login. Requires an EXPLICIT opt-in (PORTAL_DEMO_MODE=1)
    // AND a non-production build, so this can never activate in production even
    // if NODE_ENV is misconfigured. Production always enforces the real gate.
    const demoMode =
      process.env.NODE_ENV !== 'production' && process.env.PORTAL_DEMO_MODE === '1';
    if (demoMode) {
      response.cookies.set('NEXT_LOCALE', locale, {
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
        sameSite: 'lax',
      });
      return response;
    }

    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/connexion-client`;
    url.search = `?next=${encodeURIComponent(nextPath)}`;
    return NextResponse.redirect(url);
  }

  response.cookies.set('NEXT_LOCALE', locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
  });

  return response;
}

async function protectAdminPath(request: NextRequest, locale: string) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (!supabaseUrl || !supabaseAnonKey) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/connexion-admin`;
    url.search = '?error=config';
    return NextResponse.redirect(url);
  }

  // Fast path: token still fresh — skip the Supabase round trip entirely.
  if (hasFreshSession(request)) {
    return passThroughWithLocale(request, locale);
  }

  let response = NextResponse.next();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/connexion-admin`;
    url.search = `?next=${encodeURIComponent(nextPath)}`;
    return NextResponse.redirect(url);
  }

  response.cookies.set('NEXT_LOCALE', locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
  });

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
