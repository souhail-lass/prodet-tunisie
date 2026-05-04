import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { listCategories, listProducts, localizedCategoryName } from '@/data/queries';
import { isLocale } from '@/i18n/routing';
import { CatalogueGrid } from '../../_grid';

export async function generateStaticParams() {
  return listCategories().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const safeLocale = isLocale(locale) ? locale : 'fr';
  const category = listCategories().find((c) => c.slug === slug);
  if (!category) return {};
  const t = await getTranslations({
    locale: safeLocale,
    namespace: 'catalogue.page',
  });
  return {
    title: localizedCategoryName(category, safeLocale),
    description: t('subtitle'),
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  const category = listCategories().find((c) => c.slug === slug);
  if (!category) notFound();

  const products = listProducts({ categoryKey: category.key });
  const categories = listCategories();

  return (
    <CatalogueGrid
      locale={locale}
      categories={categories}
      products={products}
      activeCategoryKey={category.key}
      pageTitle={localizedCategoryName(category, locale)}
    />
  );
}
