'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronRight, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ds';
import { CatalogueTile } from '@/components/site/catalogue-tile';
import { Link } from '@/i18n/routing';
import { type FamilleId, sousCatLabelKey } from '@/data/familles';
import { useQuoteSelection } from '@/lib/quote-cart-context';
import type { CatalogueCardProduct } from '@/types/product';

export type CatalogueBrowseFamille = {
  id: FamilleId;
  packshot: string;
  total: number;
  sousCats: { slug: string; count: number; packshot: string }[];
};

/**
 * One catalogue, one browse model: famille → sous-catégorie tiles (every
 * sub-category visible), with an in-page search that swaps the browse for a
 * product grid. Sous-cat tiles link to their product list under /produits.
 */
export function CataloguePageClient({
  familles,
  products,
  madeLabel,
}: {
  familles: CatalogueBrowseFamille[];
  products: CatalogueCardProduct[];
  madeLabel?: string;
}) {
  const t = useTranslations('catalogue');
  const tf = useTranslations('familles');
  const { getQuantity, setProductQuantity } = useQuoteSelection();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return [];
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.tagline ?? '').toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q),
    );
  }, [products, q]);

  return (
    <div className="catalogue">
      <div className="catalogue__masthead">
        <div className="section-wrap catalogue__masthead-inner">
          <span className="eyebrow">{t('masthead.eyebrow')}</span>
          <h1 className="catalogue__title">{t('masthead.title')}</h1>
          <p className="catalogue__lead">{t('masthead.lead')}</p>
          <div className="catalogue__search-wrap">
            <Input
              icon={<Search size={17} />}
              placeholder={t('toolbar.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t('toolbar.searchPlaceholder')}
            />
          </div>
        </div>
      </div>

      <div className="section-wrap catalogue__browse">
        {q ? (
          <>
            <p className="catalogue__count">{t('page.resultsCount', { count: results.length })}</p>
            {results.length > 0 ? (
              <div className="catalogue__grid">
                {results.map((product) => (
                  <CatalogueTile
                    key={product.id}
                    product={product}
                    quantity={getQuantity(product.id)}
                    onQuantityChange={setProductQuantity}
                    madeLabel={madeLabel}
                  />
                ))}
              </div>
            ) : (
              <div className="catalogue__empty">
                <Search size={28} />
                <p>{t('empty.text')}</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Univers picker — choose a famille, jump to its sous-catégories. */}
            <nav className="cat-univers famille-grid famille-grid--product" aria-label={t('masthead.title')}>
              {familles.map((famille) => (
                <a key={famille.id} href={`#fam-${famille.id}`} className="famille-card famille-card--product">
                  <span className="famille-card__media">
                    {famille.packshot ? (
                      <Image
                        src={famille.packshot}
                        alt=""
                        fill
                        sizes="(max-width: 620px) 45vw, (max-width: 1080px) 30vw, 200px"
                        style={{ objectFit: 'contain' }}
                      />
                    ) : (
                      <span className="famille-card__placeholder" aria-hidden>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/logo/prodet-logo.svg" alt="" />
                      </span>
                    )}
                  </span>
                  <span className="famille-card__body">
                    <span className="famille-card__label">{tf(`items.${famille.id}.label`)}</span>
                    <span className="famille-card__tagline">{tf(`items.${famille.id}.tagline`)}</span>
                    {famille.total > 0 ? (
                      <span className="famille-card__cta">
                        {tf('page.productsCount', { count: famille.total })}
                        <ChevronRight size={15} className="famille-card__arrow" aria-hidden />
                      </span>
                    ) : null}
                  </span>
                </a>
              ))}
            </nav>

            {familles.map((famille) => (
              <section className="cat-famille" id={`fam-${famille.id}`} key={famille.id}>
                <div className="cat-famille__head">
                <div>
                  <h2 className="cat-famille__title">{tf(`items.${famille.id}.label`)}</h2>
                  <p className="cat-famille__desc">{tf(`items.${famille.id}.description`)}</p>
                </div>
                <Link href={`/produits/${famille.id}`} className="cat-famille__all">
                  {tf('page.viewAll')}
                  <ArrowRight size={15} aria-hidden />
                </Link>
              </div>
              <div className="souscat-grid souscat-grid--product">
                {famille.sousCats.map((sc) => (
                  <Link
                    key={sc.slug}
                    href={`/produits/${famille.id}/${sc.slug}`}
                    className="souscat-card souscat-card--product"
                  >
                    <span className="souscat-card__media">
                      {sc.packshot ? (
                        <Image
                          src={sc.packshot}
                          alt=""
                          fill
                          sizes="(max-width: 620px) 45vw, (max-width: 1080px) 30vw, 220px"
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
                      <span className="souscat-card__label">{tf(`souscats.${sousCatLabelKey(sc.slug)}`)}</span>
                      <span className="souscat-card__count">{tf('page.productsCount', { count: sc.count })}</span>
                    </span>
                  </Link>
                ))}
              </div>
              </section>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
