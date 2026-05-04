import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Skip all paths that should not be internationalized:
    // - Next.js internals (`/_next`, `/_vercel`)
    // - Static files (anything with a dot in the last segment, e.g. favicon.ico)
    // - API routes (`/api/*`) — they are language-agnostic webhooks/handlers
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
