import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link, isLocale } from '@/i18n/routing';
import {
  familleIds,
  getFamilleBySlug,
  getSousCategorie,
  sousCatLabelKey,
} from '@/data/familles';
import { getCatalogueSearchCards, getSousCategorieCounts } from '@/features/catalogue/queries';
import { CategorySidebar } from '@/components/catalogue/category-sidebar';
import { ProductQuickSearch } from '@/components/catalogue/product-quick-search';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbSchema } from '@/lib/seo/structured-data';

// All five familles are known at build time — prerender them (ISR via the
// catalogue cache tag keeps counts fresh after admin edits).
export const revalidate = 300;

export function generateStaticParams() {
  return familleIds.map((famille) => ({ famille }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; famille: string }>;
}): Promise<Metadata> {
  const { locale, famille } = await params;
  const fam = getFamilleBySlug(famille);
  if (!isLocale(locale) || !fam) return {};
  const tf = await getTranslations({ locale, namespace: 'familles' });
  return {
    title: tf(`items.${fam.id}.label`),
    description: tf(`items.${fam.id}.description`),
  };
}

export default async function FamillePage({
  params,
}: {
  params: Promise<{ locale: string; famille: string }>;
}) {
  const { locale, famille } = await params;
  if (!isLocale(locale)) return notFound();
  setRequestLocale(locale);

  const fam = getFamilleBySlug(famille);
  if (!fam) return notFound();

  const tf = await getTranslations({ locale, namespace: 'familles' });
  const tc = await getTranslations({ locale, namespace: 'catalogue' });
  const sousCats = await getSousCategorieCounts(fam.id);
  const total = sousCats.reduce((sum, s) => sum + s.count, 0);
  // Search spans the whole catalogue, not just this famille — someone landing
  // here from Google shouldn't have to walk back up to /catalogue to look.
  const searchCards = await getCatalogueSearchCards();

  return (
    <div className="famille-page">
      <JsonLd
        data={breadcrumbSchema([
          { name: locale === 'en' ? 'Home' : 'Accueil', path: `/${locale}` },
          { name: tf('page.viewAll'), path: `/${locale}/catalogue` },
          { name: tf(`items.${fam.id}.label`), path: `/${locale}/produits/${fam.id}` },
        ])}
      />
      <header className="famille-hero">
        <div className="section-wrap famille-hero__inner">
          <div className="famille-hero__text">
            <nav className="famille-breadcrumb">
              <Link href="/">{locale === 'en' ? 'Home' : 'Accueil'}</Link>
              <span className="famille-breadcrumb__sep">/</span>
              <Link href="/catalogue">{tf('page.viewAll')}</Link>
              <span className="famille-breadcrumb__sep">/</span>
              <span aria-current="page">{tf(`items.${fam.id}.label`)}</span>
            </nav>
            <span className="eyebrow">{tf('page.eyebrow')}</span>
            <h1 className="famille-hero__title">{tf(`items.${fam.id}.label`)}</h1>
            <p className="famille-hero__desc">{tf(`items.${fam.id}.description`)}</p>
            {total > 0 ? (
              <span className="famille-hero__count">{tf('page.productsCount', { count: total })}</span>
            ) : null}
            <div className="famille-hero__search">
              <ProductQuickSearch
                products={searchCards}
                madeLabel={tc('page.manufacturedBadge')}
              />
            </div>
          </div>
          <div className="famille-hero__media">
            <Image src={fam.image} alt="" fill sizes="(max-width: 860px) 100vw, 240px" style={{ objectFit: 'cover' }} />
          </div>
        </div>
      </header>

      <div className="section-wrap famille-layout">
        <CategorySidebar locale={locale} activeFamille={fam.id} />

        <main className="famille-main">
          {sousCats.length === 0 ? (
            <div className="famille-empty">
              <h2>{tf('page.emptyTitle')}</h2>
              <p>{tf('page.emptyBody')}</p>
              <Link className="famille-empty__link" href="/catalogue">
                {tf('page.viewAll')} <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              <h2 className="famille-main__title">{tf('page.browseTitle')}</h2>
              <div className="souscat-grid souscat-grid--product">
                {sousCats.map(({ slug, count }) => {
                  const sub = getSousCategorie(fam.id, slug);
                  return (
                    <Link
                      key={slug}
                      href={`/produits/${fam.id}/${slug}`}
                      className="souscat-card souscat-card--product"
                    >
                      <span className="souscat-card__media">
                        {sub?.packshot ? (
                          <Image
                            src={sub.packshot}
                            alt=""
                            fill
                            sizes="(max-width: 860px) 45vw, 240px"
                            style={{ objectFit: 'contain' }}
                          />
                        ) : (
                          <span className="souscat-card__placeholder" aria-hidden>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/images/logo/prodet-logo.svg" alt="" />
                          </span>
                        )}
                      </span>
                      <span className="souscat-card__body">
                        <span className="souscat-card__label">{tf(`souscats.${sousCatLabelKey(slug)}`)}</span>
                        <span className="souscat-card__count">
                          {tf('page.productsCount', { count })}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </>
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
            <Link className="pds-btn pds-btn--primary pds-btn--lg" href="/devis">
              {tf('page.ctaQuote')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
