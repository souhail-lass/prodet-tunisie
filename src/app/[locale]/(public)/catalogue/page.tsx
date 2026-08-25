import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { siteContent } from '@/data/site-content';
import { isLocale } from '@/i18n/routing';
import { familles, getSousCategorie } from '@/data/familles';
import { getSousCategorieCounts, getVisibleCatalogue } from '@/features/catalogue/queries';
import type { CatalogueCardProduct } from '@/types/product';
import { CataloguePageClient, type CatalogueBrowseFamille } from './_catalogue-page-client';

// Static + ISR: served from cache, regenerated in the background. Catalogue
// edits in the admin revalidate the 'catalogue' tag, so updates are instant.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: siteContent.catalogue.title,
    description: siteContent.catalogue.subtitle,
  };
}

export default async function CataloguePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  const products = await getVisibleCatalogue();
  const tc = await getTranslations({ locale, namespace: 'catalogue' });

  // One browse model: every famille with its sous-catégories (counts derived
  // from the live catalogue). Each sous-cat links to its product list.
  const ordered = [...familles].sort((a, b) => a.displayOrder - b.displayOrder);
  const browse: CatalogueBrowseFamille[] = [];
  for (const fam of ordered) {
    const sousCats = await getSousCategorieCounts(fam.id);
    if (sousCats.length === 0) continue;
    browse.push({
      id: fam.id,
      packshot: fam.packshot,
      total: sousCats.reduce((sum, s) => sum + s.count, 0),
      sousCats: sousCats.map(({ slug, count }) => ({
        slug,
        count,
        packshot: getSousCategorie(fam.id, slug)?.packshot ?? '',
        tileFit: getSousCategorie(fam.id, slug)?.tileFit,
      })),
    });
  }

  // Shipped only for the in-page search (the grid renders matches on demand).
  const cards: CatalogueCardProduct[] = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    category: p.category,
    categoryLabel: p.categoryLabel,
    image: p.image,
    formats: p.formats,
  }));

  return (
    <CataloguePageClient
      familles={browse}
      products={cards}
      madeLabel={tc('page.manufacturedBadge')}
    />
  );
}
