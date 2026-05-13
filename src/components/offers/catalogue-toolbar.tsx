'use client';

import { Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import type { PublicOfferSectionId, PublicOfferSort } from '@/data/public-offers';

export function CatalogueToolbar({
  activeSectionIds,
  activeQuery,
  activeSort,
  activeLimit,
  searchLabel,
  searchPlaceholder,
  sortLabel,
}: {
  activeSectionIds: readonly PublicOfferSectionId[];
  activeQuery: string;
  activeSort: PublicOfferSort;
  activeLimit: number | 'all';
  searchLabel: string;
  searchPlaceholder: string;
  sortLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(activeQuery);

  const updateParams = useCallback((mutator: (params: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete('section');
    activeSectionIds.forEach((id) => next.append('section', id));
    const normalizedQuery = query.trim();
    if (normalizedQuery) {
      next.set('q', normalizedQuery);
    } else {
      next.delete('q');
      if (next.get('sort') === 'relevance') next.delete('sort');
    }
    mutator(next);
    const queryString = next.toString();

    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    });
  }, [activeSectionIds, pathname, query, router, searchParams]);

  useEffect(() => {
    setQuery(activeQuery);
  }, [activeQuery]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const normalizedQuery = query.trim();
      if (normalizedQuery === activeQuery) return;

      updateParams((params) => {
        if (normalizedQuery) {
          params.set('q', normalizedQuery);
          if (!params.get('sort')) params.set('sort', 'relevance');
        } else {
          params.delete('q');
          if (params.get('sort') === 'relevance') params.delete('sort');
        }
      });
    }, 220);

    return () => window.clearTimeout(timeoutId);
  }, [activeQuery, query, updateParams]);

  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(280px,1fr)_176px_148px] xl:min-w-[680px]">
      <label className="flex items-center gap-3 rounded-[18px] border border-border bg-white px-4 py-3 shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
        <input
          type="search"
          value={query}
          aria-label={searchLabel}
          placeholder={searchPlaceholder}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full bg-transparent text-sm text-prodet-text outline-none placeholder:text-muted-foreground"
        />
      </label>

      <label className="flex items-center rounded-[18px] border border-border bg-white px-4 py-3 shadow-sm">
        <select
          value={activeSort}
          aria-label={sortLabel}
          disabled={isPending}
          onChange={(event) => {
            const nextSort = event.target.value as PublicOfferSort;
            updateParams((params) => {
              if (nextSort === 'catalogue') {
                params.delete('sort');
              } else if (nextSort === 'relevance' && !query.trim()) {
                params.delete('sort');
              } else {
                params.set('sort', nextSort);
              }
            });
          }}
          className="w-full bg-transparent text-sm font-medium text-prodet-text outline-none"
        >
          <option value="catalogue">Ordre catalogue</option>
          <option value="relevance">Pertinence</option>
          <option value="name-asc">Nom A à Z</option>
          <option value="name-desc">Nom Z à A</option>
        </select>
      </label>

      <label className="flex items-center rounded-[18px] border border-border bg-white px-4 py-3 shadow-sm">
        <select
          value={String(activeLimit)}
          aria-label="Nombre de produits"
          disabled={isPending}
          onChange={(event) => {
            const nextLimit = event.target.value;
            updateParams((params) => {
              if (nextLimit === '20') {
                params.delete('limit');
              } else {
                params.set('limit', nextLimit);
              }
            });
          }}
          className="w-full bg-transparent text-sm font-medium text-prodet-text outline-none"
        >
          <option value="10">10 produits</option>
          <option value="20">20 produits</option>
          <option value="30">30 produits</option>
          <option value="all">Tout afficher</option>
        </select>
      </label>
    </div>
  );
}
