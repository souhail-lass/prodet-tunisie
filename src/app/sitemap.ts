import type { MetadataRoute } from 'next';
import { listProducts, listSectors } from '@/data/queries';
import { familleIds, getSousCategoriesForFamille } from '@/data/familles';
import { listPublicOffers } from '@/data/public-offers';
import { locales } from '@/i18n/routing';
import { resolveAuthOrigin } from '@/lib/site-origin';

type Entry = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (await resolveAuthOrigin()).replace(/\/$/, '');
  const lastModified = new Date();

  const entries: Entry[] = [
    { path: '', priority: 1, changeFrequency: 'weekly' },
    { path: '/catalogue', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/secteurs', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/a-propos', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/devis', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/mentions-legales', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/confidentialite', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/cookies', priority: 0.2, changeFrequency: 'yearly' },
  ];

  // Product family landing pages + their sub-categories — the primary targets
  // for high-intent commercial queries ("produits de nettoyage", "papier
  // hygiénique professionnel", …).
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

  // Sector landing pages.
  for (const sector of listSectors()) {
    entries.push({ path: `/secteurs/${sector.slug}`, priority: 0.7, changeFrequency: 'monthly' });
  }

  // Individual product / offer detail pages (deduped — the catalogue route
  // serves both the legacy fixtures and the public offers).
  const catalogueSlugs = new Set<string>([
    ...listProducts().map((p) => p.slug),
    ...listPublicOffers().map((o) => o.slug),
  ]);
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
