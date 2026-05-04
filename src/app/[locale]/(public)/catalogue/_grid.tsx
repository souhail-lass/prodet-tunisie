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
  const eyebrow = locale === 'ar' ? 'الكتالوج' : locale === 'en' ? 'Catalog' : 'Catalogue';
  const filtersLabel = locale === 'ar' ? 'تصفية' : locale === 'en' ? 'Filters' : 'Filtres';

  return (
    <div className="section-shell py-12">
      <header className="surface-panel overflow-hidden p-7 sm:p-8">
        <p className="eyebrow-label">{eyebrow}</p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{pageTitle ?? t('title')}</h1>
        <p className="text-muted-foreground mt-4 max-w-3xl">{pageSubtitle ?? t('subtitle')}</p>
        <p className="text-muted-foreground mt-3 text-xs">{t('noStockNotice')}</p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="surface-panel h-fit p-5 lg:sticky lg:top-28">
          <p className="eyebrow-label">{filtersLabel}</p>
          <p className="text-muted-foreground mt-3 text-sm">{t('subtitle')}</p>
          <div className="mt-5">
            <CategoryFilter
              categories={categories}
              locale={locale}
              activeCategoryKey={activeCategoryKey}
            />
          </div>
        </aside>

        {products.length === 0 ? (
          <div className="border-border rounded-[var(--radius-xl)] border border-dashed p-10 text-center">
            <p className="text-foreground text-base font-semibold">{t('emptyTitle')}</p>
            <p className="text-muted-foreground mt-2 text-sm">{t('emptyBody')}</p>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <li key={product.slug}>
                <ProductCard product={product} locale={locale} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
