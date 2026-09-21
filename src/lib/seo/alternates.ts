import type { Metadata } from 'next';

/** Path after the locale prefix (`''` for the homepage, `/contact`, …). */
export function pageAlternates(locale: string, path = ''): NonNullable<Metadata['alternates']> {
  const suffix = !path || path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return {
    canonical: `/${locale}${suffix}`,
    languages: {
      'fr-TN': `/fr${suffix}`,
      en: `/en${suffix}`,
      'x-default': `/fr${suffix}`,
    },
  };
}
