import { getRequestConfig } from 'next-intl/server';
import type { AbstractIntlMessages } from 'next-intl';
import { routing, isLocale, type Locale } from './routing';

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

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = isLocale(requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
    timeZone: 'Africa/Tunis',
    now: new Date(),
  };
});
