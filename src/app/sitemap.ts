import type { MetadataRoute } from 'next';
import { listCategories, listProducts, listSectors } from '@/data/queries';
import { locales } from '@/i18n/routing';
import { getPublicEnv } from '@/lib/env';

export default function sitemap(): MetadataRoute.Sitemap {
  const env = getPublicEnv();
  const baseUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');

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
    ...listCategories().map((c) => `/catalogue/categorie/${c.slug}`),
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
