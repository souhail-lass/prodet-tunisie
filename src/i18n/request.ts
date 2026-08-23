import { headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import type { AbstractIntlMessages } from 'next-intl';
import { routing, isLocale, LOCALE_HEADER, type Locale } from './routing';

const namespaces = [
  'common',
  'home',
  'header',
  'footer',
  'legal',
  'catalogue',
  'familles',
  'sectors',
  'about',
  'contact',
  'devis',
  'portal',
] as const;

async function loadMessages(locale: Locale): Promise<AbstractIntlMessages> {
  const entries = await Promise.all(
    namespaces.map(async (ns) => {
      try {
        const mod = (await import(`../messages/${locale}/${ns}.json`)) as {
          default: AbstractIntlMessages;
        };
        return [ns, mod.default] as const;
      } catch {
        return [ns, {} satisfies AbstractIntlMessages] as const;
      }
    }),
  );
  return Object.fromEntries(entries) as AbstractIntlMessages;
}

/**
 * Resolve the active locale.
 *
 * `requestLocale` (fed by `setRequestLocale()` in the locale layout) is
 * populated during static generation but comes back undefined on the dynamic
 * render path — which is the path every request actually takes, because the
 * middleware sets a NEXT_LOCALE cookie and that makes each response
 * uncacheable. Without a fallback every runtime render silently served the
 * default locale, so /en rendered the whole site in French.
 *
 * The middleware therefore stamps the locale it already parsed out of the
 * pathname onto a request header, and we read that here. `headers()` is only
 * touched when `requestLocale` is missing, so static generation keeps working
 * and does not opt into dynamic rendering.
 */
async function resolveLocale(requestLocale: Promise<string | undefined>): Promise<Locale> {
  const requested = await requestLocale;
  if (isLocale(requested)) return requested;

  try {
    const fromHeader = (await headers()).get(LOCALE_HEADER);
    if (isLocale(fromHeader)) return fromHeader;
  } catch {
    // No request scope (e.g. a fully static render) — fall through.
  }

  return routing.defaultLocale;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await resolveLocale(requestLocale);

  return {
    locale,
    messages: await loadMessages(locale),
    timeZone: 'Africa/Tunis',
    now: new Date(),
  };
});
