'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { QuantityControl } from '@/components/ds';
import { Link } from '@/i18n/routing';
import { catalogueSearchPath } from '@/data/familles';
import { searchCatalogue } from '@/lib/product-search';
import { useQuoteSelection } from '@/lib/quote-cart-context';
import type { CatalogueCardProduct } from '@/types/product';

export type ProductQuickSearchProps = {
  /** Whole visible catalogue — the search is global, not scoped to the page. */
  products: CatalogueCardProduct[];
  /** Which edge the results panel hangs from. */
  align?: 'start' | 'end';
  className?: string;
  /** Prefill from the search-results URL. */
  initialQuery?: string;
  /**
   * Stay on this screen: Enter adds nothing extra and the "see all" link is
   * hidden. Used inside the quote drawer so a search does not dump the user
   * onto /produits/recherche.
   */
  embedded?: boolean;
};

/**
 * Catalogue search that can live on any page (famille, sous-catégorie, devis).
 * Results drop down under the field with a quantity control wired straight to
 * the quote selection, so a product can be added without leaving the page.
 * Enter (or the "see all" link) opens the full results page.
 */
export function ProductQuickSearch({
  products,
  align = 'start',
  className,
  initialQuery = '',
  embedded = false,
}: ProductQuickSearchProps) {
  const t = useTranslations('catalogue');
  const ta = useTranslations('common.actions');
  const locale = useLocale();
  const router = useRouter();
  const { getQuantity, setProductQuantity } = useQuoteSelection();
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelId = useId();

  const matches = useMemo(() => searchCatalogue(products, query), [products, query]);
  const hasQuery = query.trim().length > 0;
  const searchHref = `/${locale}${catalogueSearchPath(query)}`;

  // Close on any click outside the field + panel.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  function clear() {
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  }

  function goToResults() {
    if (embedded) return;
    const q = (inputRef.current?.value ?? query).trim();
    if (!q) return;
    setOpen(false);
    router.push(`/${locale}${catalogueSearchPath(q)}`);
  }

  return (
    <div
      ref={containerRef}
      className={['pq-search', align === 'end' ? 'pq-search--end' : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      <form
        className="pq-search__field"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          goToResults();
        }}
      >
        <Search size={17} className="pq-search__icon" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          className="pq-search__input"
          value={query}
          placeholder={t('toolbar.searchPlaceholder')}
          aria-label={t('page.searchLabel')}
          aria-describedby={panelId}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(event.target.value.trim().length > 0);
          }}
          onFocus={() => setOpen(hasQuery)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setOpen(false);
              event.currentTarget.blur();
            }
            if (event.key === 'Enter') {
              event.preventDefault();
              goToResults();
            }
          }}
        />
        {hasQuery ? (
          <button
            type="button"
            className="pq-search__clear"
            onClick={clear}
            aria-label={t('page.searchClear')}
          >
            <X size={15} aria-hidden />
          </button>
        ) : null}
      </form>

      <p className="pq-search__status" id={panelId} role="status">
        {hasQuery ? t('page.resultsCount', { count: matches.length }) : ''}
      </p>

      {open && hasQuery ? (
        <div className="pq-search__panel">
          {matches.length > 0 ? (
            <>
              <ul className="pq-search__list">
                {matches.map((product) => (
                  <li className="pq-search__row" key={product.id}>
                    <Link
                      href={`/catalogue/${product.slug}`}
                      className="pq-search__link"
                      onClick={() => setOpen(false)}
                    >
                      <span className="pq-search__thumb">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt=""
                            fill
                            sizes="56px"
                            style={{ objectFit: 'contain' }}
                          />
                        ) : (
                          <span className="pq-search__thumb-fallback" aria-hidden>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/images/logo/prodet-logo.svg" alt="" />
                          </span>
                        )}
                      </span>
                      <span className="pq-search__text">
                        <span className="pq-search__name">{product.name}</span>
                        <span className="pq-search__meta">
                          {product.tagline || product.formats[0]?.label || ''}
                        </span>
                      </span>
                    </Link>
                    <QuantityControl
                      className="pds-qty--compact pq-search__qty"
                      addLabel={ta('add')}
                      value={getQuantity(product.id)}
                      onChange={(next) =>
                        setProductQuantity(
                          {
                            productId: product.id,
                            productName: product.name,
                            slug: product.slug,
                            imageUrl: product.image,
                            category: product.category,
                            format: product.formats[0]?.label,
                          },
                          next,
                        )
                      }
                    />
                  </li>
                ))}
              </ul>
              {embedded ? null : (
                <a href={searchHref} className="pq-search__more" onClick={() => setOpen(false)}>
                  {t('page.searchAll', { count: matches.length })}
                </a>
              )}
            </>
          ) : (
            <p className="pq-search__empty">{t('empty.text')}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
