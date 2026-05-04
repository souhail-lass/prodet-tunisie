import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/routing';
import type { Product, ProductCategory } from '@/data/types';
import { CategoryFilter } from '@/components/catalog/category-filter';
import { ProductCard } from '@/components/catalog/product-card';

interface CatalogueGridProps {
  locale: Locale;
  categories: readonly ProductCategory[];
  products: readonly Product[];
  activeCategoryKey?: string;
  pageTitle?: string;
  pageSubtitle?: string;
}

export function CatalogueGrid({
  locale,
  categories,
  products,
  activeCategoryKey,
  pageTitle,
  pageSubtitle,
}: CatalogueGridProps) {
  const t = useTranslations('catalogue.page');

  return (
    <div className="mx-auto max-w-(--container-2xl) px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <h1 className="text-foreground text-3xl font-semibold sm:text-4xl">
          {pageTitle ?? t('title')}
        </h1>
        <p className="text-muted-foreground mt-3">{pageSubtitle ?? t('subtitle')}</p>
        <p className="text-muted-foreground mt-2 text-xs">{t('noStockNotice')}</p>
      </header>

      <div className="mt-8">
        <CategoryFilter
          categories={categories}
          locale={locale}
          activeCategoryKey={activeCategoryKey}
        />
      </div>

      {products.length === 0 ? (
        <div className="border-border mt-16 rounded-lg border border-dashed p-10 text-center">
          <p className="text-foreground text-base font-semibold">{t('emptyTitle')}</p>
          <p className="text-muted-foreground mt-2 text-sm">{t('emptyBody')}</p>
        </div>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <li key={product.slug}>
              <ProductCard product={product} locale={locale} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
