import type { MetadataRoute } from 'next';
import { listProducts, listSectors } from '@/data/queries';
import { locales } from '@/i18n/routing';
import { resolveAuthOrigin } from '@/lib/site-origin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (await resolveAuthOrigin()).replace(/\/$/, '');

  const staticPaths = [
    '',
    '/catalogue',
    '/secteurs',
    '/a-propos',
    '/contact',
    '/devis',
    '/mentions-legales',
    '/confidentialite',
    '/cookies',
  ];

  const dynamicPaths: string[] = [
    ...listProducts().map((p) => `/catalogue/${p.slug}`),
    ...listSectors().map((s) => `/secteurs/${s.slug}`),
  ];

  const allPaths = [...staticPaths, ...dynamicPaths];
  const lastModified = new Date();

  return allPaths.map((path) => ({
    url: `${baseUrl}/${locales[0]}${path}`,
    lastModified,
    alternates: {
      languages: Object.fromEntries(
        locales.map((locale) => [locale, `${baseUrl}/${locale}${path}`]),
      ),
    },
  }));
}
