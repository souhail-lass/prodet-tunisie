import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { siteContent } from '@/data/site-content';
import { isLocale } from '@/i18n/routing';
import { getCatalogueCategories, getVisibleCatalogue } from '@/features/catalogue/queries';
import { CataloguePageClient, type CatalogueCardProduct } from './_catalogue-page-client';

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

  const [products, categories] = await Promise.all([getVisibleCatalogue(), getCatalogueCategories()]);

  // Ship only what the grid renders/searches — long texts (description,
  // usage, specs) stay on the detail page and out of the page payload.
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

  return <CataloguePageClient products={cards} categories={categories} />;
}
