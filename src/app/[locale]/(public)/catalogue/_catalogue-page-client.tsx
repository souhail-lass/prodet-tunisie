'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Layers, Search, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button, Checkbox, Input, Select } from '@/components/ds';
import { CatalogueTile } from '@/components/site/catalogue-tile';
import { useQuoteSelection } from '@/lib/quote-cart-context';
import type { CatalogueCardProduct } from '@/types/product';

export type { CatalogueCardProduct };

const PAGE_SIZE = 24;

function toggle(set: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

/** Windowed page list: 1 … 4 [5] 6 … 12 (numbers + gaps). */
function pageItems(current: number, total: number): Array<number | 'gap'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const wanted = new Set<number>([1, 2, total - 1, total, current - 1, current, current + 1]);
  const items: Array<number | 'gap'> = [];
  for (let p = 1; p <= total; p += 1) {
    if (wanted.has(p)) {
      items.push(p);
    } else if (items[items.length - 1] !== 'gap') {
      items.push('gap');
    }
  }
  return items;
}

export function CataloguePageClient({
  products,
  categories,
}: {
  products: CatalogueCardProduct[];
  categories: string[];
}) {
  const t = useTranslations('catalogue');
  const { getQuantity, setProductQuantity } = useQuoteSelection();

  const [query, setQuery] = useState('');
  const [activeCategories, setActiveCategories] = useState<ReadonlySet<string>>(new Set());
  const [sort, setSort] = useState<'pertinence' | 'az'>('az');
  const [page, setPage] = useState(1);
  const listTopRef = useRef<HTMLDivElement>(null);

  // Deep links (?page=N): the static HTML is page 1; correct after hydration.
  useEffect(() => {
    const fromUrl = Number(new URLSearchParams(window.location.search).get('page'));
    if (Number.isInteger(fromUrl) && fromUrl > 1) setPage(fromUrl);
  }, []);

  function syncPageToUrl(next: number) {
    const url = new URL(window.location.href);
    if (next > 1) url.searchParams.set('page', String(next));
    else url.searchParams.delete('page');
    window.history.replaceState(null, '', url);
  }

  function goToPage(next: number) {
    setPage(next);
    syncPageToUrl(next);
    listTopRef.current?.scrollIntoView({ block: 'start' });
  }

  function resetToFirstPage() {
    setPage(1);
    syncPageToUrl(1);
  }

  const categoryCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) {
      if (p.categoryLabel) m.set(p.categoryLabel, (m.get(p.categoryLabel) ?? 0) + 1);
    }
    return m;
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = products.filter((p) => {
      if (activeCategories.size && !(p.categoryLabel && activeCategories.has(p.categoryLabel))) return false;
      if (q) {
        return (
          p.name.toLowerCase().includes(q) ||
          (p.tagline ?? '').toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
        );
      }
      return true;
    });
    if (sort === 'az') result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    return result;
  }, [products, query, activeCategories, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  );

  const hasFilters = query.trim().length > 0 || activeCategories.size > 0;

  function reset() {
    setQuery('');
    setActiveCategories(new Set());
    resetToFirstPage();
  }

  return (
    <div className="catalogue">
      <div className="catalogue__masthead">
        <div className="section-wrap catalogue__masthead-inner">
          <div>
            <span className="eyebrow">{t('masthead.eyebrow')}</span>
            <h1 className="catalogue__title">{t('masthead.title')}</h1>
            <p className="catalogue__lead">{t('masthead.lead')}</p>
          </div>
        </div>
      </div>

      <div className="section-wrap catalogue__layout">
        <aside className="catalogue__sidebar">
          <div className="filters-card">
            <div className="filters-card__head">
              <span className="filters-card__label">{t('filters.label')}</span>
              {hasFilters ? (
                <button className="filters-card__clear" onClick={reset}>
                  {t('filters.clear')}
                </button>
              ) : null}
            </div>
            <FilterGroup
              title={t('filters.categories')}
              icon={Layers}
              options={categories}
              active={activeCategories}
              counts={categoryCounts}
              onToggle={(id) => {
                setActiveCategories((prev) => toggle(prev, id));
                resetToFirstPage();
              }}
            />
          </div>

          <div className="filters-help">
            <Shield size={18} />
            <div>
              <strong>{t('help.title')}</strong>
              <span>{t('help.body')}</span>
            </div>
          </div>
        </aside>

        <div className="catalogue__main" ref={listTopRef} style={{ scrollMarginTop: 90 }}>
          <div className="catalogue__toolbar">
            <div className="catalogue__search">
              <Input
                icon={<Search size={17} />}
                placeholder={t('toolbar.searchPlaceholder')}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  resetToFirstPage();
                }}
              />
            </div>
            <div className="catalogue__toolbar-right">
              <span className="catalogue__count">{t('page.resultsCount', { count: filtered.length })}</span>
              <div className="catalogue__sort">
                <Select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as 'pertinence' | 'az');
                    resetToFirstPage();
                  }}
                  options={[
                    { value: 'az', label: t('toolbar.sortAz') },
                    { value: 'pertinence', label: t('toolbar.sortRelevance') },
                  ]}
                />
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="catalogue__empty">
              <Search size={28} />
              <p>{t('empty.text')}</p>
              <Button variant="outline" size="sm" onClick={reset}>
                {t('empty.reset')}
              </Button>
            </div>
          ) : (
            <>
              <div className="catalogue__grid">
                {paginated.map((product) => (
                  <CatalogueTile
                    key={product.id}
                    product={product}
                    quantity={getQuantity(product.id)}
                    onQuantityChange={setProductQuantity}
                  />
                ))}
              </div>

              {totalPages > 1 ? (
                <nav className="catalogue__pagination" aria-label={t('pagination.label')}>
                  <button
                    type="button"
                    className="pds-btn pds-btn--outline pds-btn--sm"
                    disabled={safePage === 1}
                    onClick={() => goToPage(safePage - 1)}
                  >
                    <span>{t('pagination.prev')}</span>
                  </button>
                  <div className="catalogue__pages">
                    {pageItems(safePage, totalPages).map((item, index) =>
                      item === 'gap' ? (
                        <span key={`gap-${index}`} className="catalogue__page-gap" aria-hidden>
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          type="button"
                          className={`catalogue__page${item === safePage ? ' is-active' : ''}`}
                          aria-current={item === safePage ? 'page' : undefined}
                          aria-label={t('pagination.page', { page: item })}
                          onClick={() => goToPage(item)}
                        >
                          {item}
                        </button>
                      ),
                    )}
                  </div>
                  <button
                    type="button"
                    className="pds-btn pds-btn--outline pds-btn--sm"
                    disabled={safePage === totalPages}
                    onClick={() => goToPage(safePage + 1)}
                  >
                    <span>{t('pagination.next')}</span>
                  </button>
                </nav>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  title,
  icon: Icon,
  options,
  active,
  counts,
  onToggle,
}: {
  title: string;
  icon?: React.ComponentType<{ size?: number }>;
  options: string[];
  active: ReadonlySet<string>;
  counts: Map<string, number>;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section className="filter-group">
      <button className="filter-group__head" onClick={() => setOpen((o) => !o)}>
        <span className="filter-group__title">
          {Icon ? <Icon size={14} /> : null}
          {title}
        </span>
        <ChevronDown size={16} className={`filter-group__chev${open ? '' : ' is-closed'}`} />
      </button>
      {open ? (
        <div className="filter-group__body">
          {options.map((option) => (
            <Checkbox
              key={option}
              label={option}
              count={counts.get(option) ?? 0}
              checked={active.has(option)}
              onChange={() => onToggle(option)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
