import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { listCategories, listProducts } from '@/data/queries';
import { isLocale } from '@/i18n/routing';
import { CatalogueGrid } from './_grid';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : 'fr';
  const t = await getTranslations({
    locale: safeLocale,
    namespace: 'catalogue.page',
  });
  return { title: t('title'), description: t('subtitle') };
}

export default async function CataloguePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  const products = listProducts();
  const categories = listCategories();

  return <CatalogueGrid locale={locale} categories={categories} products={products} />;
}
