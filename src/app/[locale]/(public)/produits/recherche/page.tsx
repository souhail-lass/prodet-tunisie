import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CATALOGUE_PATH, catalogueSearchPath } from '@/data/familles';
import { Link, isLocale } from '@/i18n/routing';
import { getCatalogueSearchCards } from '@/features/catalogue/queries';
import { searchCatalogue } from '@/lib/product-search';
import { CategorySidebar } from '@/components/catalogue/category-sidebar';
import { ProductQuickSearch } from '@/components/catalogue/product-quick-search';
import { ProductGrid } from '@/components/catalogue/product-grid';
import { OpenQuoteButton } from '@/components/site/open-quote-button';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbSchema } from '@/lib/seo/structured-data';

export const revalidate = 300;

const QUERY_MAX_LENGTH = 80;

function readQuery(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? '').slice(0, QUERY_MAX_LENGTH).trim();
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const query = readQuery((await searchParams).q);
  const t = await getTranslations({ locale, namespace: 'catalogue' });
  return {
    title: query ? t('page.searchHeading', { query }) : t('page.searchPromptTitle'),
    robots: { index: false, follow: true },
  };
}

export default async function CatalogueSearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  const query = readQuery((await searchParams).q);
  const t = await getTranslations({ locale, namespace: 'catalogue' });
  const tf = await getTranslations({ locale, namespace: 'familles' });
  const searchCards = await getCatalogueSearchCards();
  const results = query ? searchCatalogue(searchCards, query) : [];

  const catalogLabel = locale === 'en' ? 'Catalog' : 'Catalogue';
  const homeLabel = locale === 'en' ? 'Home' : 'Accueil';
  const heading = query ? t('page.searchHeading', { query }) : t('page.searchPromptTitle');

  return (
    <div className="famille-page">
      <JsonLd
        data={breadcrumbSchema([
          { name: homeLabel, path: `/${locale}` },
          { name: catalogLabel, path: `/${locale}${CATALOGUE_PATH}` },
          { name: heading, path: `/${locale}${catalogueSearchPath(query)}` },
        ])}
      />
      <header className="famille-hero famille-hero--compact">
        <div className="section-wrap famille-hero__inner">
          <div className="famille-hero__text">
            <nav className="famille-breadcrumb">
              <Link href="/">{homeLabel}</Link>
              <span className="famille-breadcrumb__sep">/</span>
              <Link href={CATALOGUE_PATH}>{catalogLabel}</Link>
              <span className="famille-breadcrumb__sep">/</span>
              <span aria-current="page">{heading}</span>
            </nav>
            <span className="eyebrow">{t('page.searchEyebrow')}</span>
            <h1 className="famille-hero__title">{heading}</h1>
            {query ? (
              <span className="famille-hero__count">{t('page.resultsCount', { count: results.length })}</span>
            ) : (
              <p className="famille-hero__desc">{t('page.searchPromptBody')}</p>
            )}
            <div className="famille-hero__search">
              <ProductQuickSearch
                key={query}
                products={searchCards}
                initialQuery={query}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="section-wrap famille-layout">
        <CategorySidebar locale={locale} />
        <main className="famille-main">
          {query && results.length === 0 ? (
            <div className="famille-empty">
              <h2>{t('page.emptySearchTitle')}</h2>
              <p>{t('page.emptySearchBody', { query })}</p>
            </div>
          ) : query ? (
            <ProductGrid products={results} />
          ) : (
            <div className="famille-empty">
              <h2>{t('page.searchPromptTitle')}</h2>
              <p>{t('page.searchPromptBody')}</p>
            </div>
          )}
        </main>
      </div>

      <section className="cta-band">
        <div className="cta-band__inner">
          <div>
            <h2>{tf('page.ctaTitle')}</h2>
            <p>{tf('page.ctaBody')}</p>
          </div>
          <div className="cta-band__actions">
            <OpenQuoteButton className="pds-btn pds-btn--primary pds-btn--lg">
              {tf('page.ctaQuote')}
            </OpenQuoteButton>
          </div>
        </div>
      </section>
    </div>
  );
}
