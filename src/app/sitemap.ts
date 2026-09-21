import type { MetadataRoute } from 'next';
import { listSectors } from '@/data/queries';
import { familleIds, getSousCategoriesForFamille } from '@/data/familles';
import { getVisibleCatalogue } from '@/features/catalogue/queries';
import { locales } from '@/i18n/routing';
import { canonicalPublicOrigin } from '@/lib/seo/public-origin';

type Entry = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = canonicalPublicOrigin();
  const lastModified = new Date();

  const entries: Entry[] = [
    { path: '', priority: 1, changeFrequency: 'weekly' },
    { path: '/secteurs', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/a-propos', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/mentions-legales', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/confidentialite', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/cookies', priority: 0.2, changeFrequency: 'yearly' },
  ];

  for (const familleId of familleIds) {
    entries.push({ path: `/produits/${familleId}`, priority: 0.9, changeFrequency: 'weekly' });
    for (const sub of getSousCategoriesForFamille(familleId)) {
      entries.push({
        path: `/produits/${familleId}/${sub.slug}`,
        priority: 0.7,
        changeFrequency: 'weekly',
      });
    }
  }

  for (const sector of listSectors()) {
    entries.push({ path: `/secteurs/${sector.slug}`, priority: 0.7, changeFrequency: 'monthly' });
  }

  const catalogueSlugs = await loadCatalogueSlugs();
  for (const slug of catalogueSlugs) {
    entries.push({ path: `/catalogue/${slug}`, priority: 0.6, changeFrequency: 'monthly' });
  }

  return entries.map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}/${locales[0]}${path}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: {
      languages: Object.fromEntries(
        locales.map((locale) => [locale, `${baseUrl}/${locale}${path}`]),
      ),
    },
  }));
}

async function loadCatalogueSlugs(): Promise<string[]> {
  try {
    const products = await getVisibleCatalogue();
    if (products.length > 0) {
      return [...new Set(products.map((product) => product.slug))];
    }
  } catch {
    // Build/runtime without DB: skip product URLs rather than emit stale fixtures.
  }
  return [];
}
