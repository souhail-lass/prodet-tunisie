import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { defaultLocale, locales } from '@/i18n/routing';

function getLocaleFromPathname(pathname: string): string | null {
  const segments = pathname.split('/');
  const candidate = segments[1];
  return candidate && locales.includes(candidate as (typeof locales)[number]) ? candidate : null;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const pathnameLocale = getLocaleFromPathname(pathname);

  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
    return NextResponse.redirect(url);
  }

  if (pathnameLocale) {
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

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
