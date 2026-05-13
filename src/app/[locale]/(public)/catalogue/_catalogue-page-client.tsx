'use client';

import { X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CatalogueFilters,
  FORMAT_FILTERS,
  SECTOR_FILTERS,
  USE_CASE_FILTERS,
  type CatalogueFilterCounts,
} from '@/components/catalogue/CatalogueFilters';
import {
  CatalogueToolbar,
  type CatalogueSortOrder,
  type CatalogueViewMode,
} from '@/components/catalogue/CatalogueToolbar';
import { ProductGrid } from '@/components/catalogue/ProductGrid';
import { products } from '@/data/products';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';
import type { SectorId } from '@/types/sector';
import type { UseCaseId } from '@/types/use-case';

type FilterGroupKey = 'useCases' | 'sectors' | 'formats';

type CatalogueFilterState = {
  searchQuery: string;
  activeUseCases: ReadonlySet<UseCaseId>;
  activeSectors: ReadonlySet<SectorId>;
  activeFormats: ReadonlySet<string>;
};

type ParsedUrlState = CatalogueFilterState & {
  viewMode: CatalogueViewMode;
  sortOrder: CatalogueSortOrder;
};

type ActiveFilterChip = {
  key: string;
  label: string;
  onRemove: () => void;
};

type SearchParamsReader = {
  get: (name: string) => string | null;
  getAll: (name: string) => string[];
  toString: () => string;
};

const catalogueProducts = products;

export function CataloguePageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramsKey = searchParams.toString();
  const initialState = useMemo(() => parseSearchParams(searchParams), [searchParams]);

  const [searchQuery, setSearchQuery] = useState(initialState.searchQuery);
  const [activeUseCases, setActiveUseCases] = useState<Set<UseCaseId>>(
    () => new Set(initialState.activeUseCases),
  );
  const [activeSectors, setActiveSectors] = useState<Set<SectorId>>(
    () => new Set(initialState.activeSectors),
  );
  const [activeFormats, setActiveFormats] = useState<Set<string>>(
    () => new Set(initialState.activeFormats),
  );
  const [viewMode, setViewMode] = useState<CatalogueViewMode>(initialState.viewMode);
  const [sortOrder, setSortOrder] = useState<CatalogueSortOrder>(initialState.sortOrder);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const next = parseSearchParams(searchParams);

    setSearchQuery((current) => (current === next.searchQuery ? current : next.searchQuery));
    setActiveUseCases((current) =>
      areSetsEqual(current, next.activeUseCases) ? current : new Set(next.activeUseCases),
    );
    setActiveSectors((current) =>
      areSetsEqual(current, next.activeSectors) ? current : new Set(next.activeSectors),
    );
    setActiveFormats((current) =>
      areSetsEqual(current, next.activeFormats) ? current : new Set(next.activeFormats),
    );
    setViewMode((current) => (current === next.viewMode ? current : next.viewMode));
    setSortOrder((current) => (current === next.sortOrder ? current : next.sortOrder));
  }, [paramsKey, searchParams]);

  const filterState = useMemo<CatalogueFilterState>(
    () => ({
      searchQuery,
      activeUseCases,
      activeSectors,
      activeFormats,
    }),
    [activeFormats, activeSectors, activeUseCases, searchQuery],
  );

  useEffect(() => {
    const nextParams = buildSearchParams({
      ...filterState,
      viewMode,
      sortOrder,
    });
    const nextQuery = nextParams.toString();

    if (nextQuery !== paramsKey) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    }
  }, [filterState, paramsKey, pathname, router, sortOrder, viewMode]);

  const toggleUseCase = useCallback((id: UseCaseId) => {
    setActiveUseCases((current) => toggleSetValue(current, id));
  }, []);

  const toggleSector = useCallback((id: SectorId) => {
    setActiveSectors((current) => toggleSetValue(current, id));
  }, []);

  const toggleFormat = useCallback((value: string) => {
    setActiveFormats((current) => toggleSetValue(current, value));
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setActiveUseCases(new Set());
    setActiveSectors(new Set());
    setActiveFormats(new Set());
  }, []);

  const filteredProducts = useMemo(() => {
    const next = catalogueProducts.filter((product) => productMatches(product, filterState));

    return sortProducts(next, sortOrder);
  }, [filterState, sortOrder]);

  const filterCounts = useMemo(
    () => calculateFilterCounts(catalogueProducts, filterState),
    [filterState],
  );

  const activeChips = useActiveFilterChips({
    searchQuery,
    activeUseCases,
    activeSectors,
    activeFormats,
    setSearchQuery,
    toggleUseCase,
    toggleSector,
    toggleFormat,
  });
  const hasActiveFilters = activeChips.length > 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[1400px] px-4 md:grid md:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden min-h-screen w-[260px] bg-white md:block">
          <div className="sticky top-[104px] pt-6">
            <CatalogueFilters
              activeUseCases={activeUseCases}
              activeSectors={activeSectors}
              activeFormats={activeFormats}
              counts={filterCounts}
              onToggleUseCase={toggleUseCase}
              onToggleSector={toggleSector}
              onToggleFormat={toggleFormat}
              hasActiveFilters={hasActiveFilters}
              onReset={resetFilters}
              className="min-h-screen"
            />
          </div>
        </aside>

        <section className="min-w-0 bg-white px-4 py-6 md:px-6 lg:px-8">
          <div className="w-full">
            <header className="mb-6">
              <h1 className="public-display-title">Produits</h1>
            </header>

            <CatalogueToolbar
              searchQuery={searchQuery}
              viewMode={viewMode}
              sortOrder={sortOrder}
              onSearchChange={setSearchQuery}
              onViewModeChange={setViewMode}
              onSortOrderChange={setSortOrder}
              onOpenFilters={() => setMobileFiltersOpen(true)}
            />

            <div className="mt-3 flex min-h-7 flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  className="inline-flex items-center gap-1 rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-medium text-[#1B5FA7] transition-colors hover:bg-[#DBEAFE]"
                >
                  {chip.label}
                  <X className="h-3 w-3" aria-hidden />
                </button>
              ))}

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[11px] font-medium text-[#6B7280] underline-offset-4 hover:text-[#1B5FA7] hover:underline"
                >
                  Tout effacer
                </button>
              ) : null}
            </div>

            <div className="mt-5">
              <ProductGrid
                products={filteredProducts}
                viewMode={viewMode}
                onResetFilters={resetFilters}
              />
            </div>
          </div>
        </section>
      </div>

      <MobileFilterSheet
        open={mobileFiltersOpen}
        counts={filterCounts}
        activeUseCases={activeUseCases}
        activeSectors={activeSectors}
        activeFormats={activeFormats}
        onClose={() => setMobileFiltersOpen(false)}
        onApply={() => setMobileFiltersOpen(false)}
        onReset={resetFilters}
        onToggleUseCase={toggleUseCase}
        onToggleSector={toggleSector}
        onToggleFormat={toggleFormat}
      />
    </div>
  );
}

function MobileFilterSheet({
  open,
  counts,
  activeUseCases,
  activeSectors,
  activeFormats,
  onClose,
  onApply,
  onReset,
  onToggleUseCase,
  onToggleSector,
  onToggleFormat,
}: {
  open: boolean;
  counts: CatalogueFilterCounts;
  activeUseCases: ReadonlySet<UseCaseId>;
  activeSectors: ReadonlySet<SectorId>;
  activeFormats: ReadonlySet<string>;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
  onToggleUseCase: (id: UseCaseId) => void;
  onToggleSector: (id: SectorId) => void;
  onToggleFormat: (value: string) => void;
}) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-[80] md:hidden',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
    >
      <button
        type="button"
        aria-label="Fermer les filtres"
        className={cn(
          'absolute inset-0 bg-slate-950/45 transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          'absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-hidden rounded-t-[20px] bg-white shadow-2xl transition-transform duration-200 ease-out',
          open ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-[#E5E7EB] px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
            Filtres
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer les filtres"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1B5FA7]"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="max-h-[calc(88vh-116px)] overflow-y-auto">
          <CatalogueFilters
            activeUseCases={activeUseCases}
            activeSectors={activeSectors}
            activeFormats={activeFormats}
            counts={counts}
            onToggleUseCase={onToggleUseCase}
            onToggleSector={onToggleSector}
            onToggleFormat={onToggleFormat}
          />
        </div>

        <div className="flex gap-2 border-t border-[#E5E7EB] bg-white px-5 py-3">
          <button
            type="button"
            onClick={onReset}
            className="h-10 flex-1 rounded-lg border border-[#E5E7EB] text-[12px] font-medium text-[#1C2B3A] transition-colors hover:border-[#1B5FA7] hover:text-[#1B5FA7]"
          >
            Réinitialiser
          </button>
          <button
            type="button"
            onClick={onApply}
            className="h-10 flex-1 rounded-lg bg-[#1B5FA7] text-[12px] font-medium text-white transition-colors hover:bg-[#0D3B73]"
          >
            Appliquer
          </button>
        </div>
      </aside>
    </div>
  );
}

function useActiveFilterChips({
  searchQuery,
  activeUseCases,
  activeSectors,
  activeFormats,
  setSearchQuery,
  toggleUseCase,
  toggleSector,
  toggleFormat,
}: {
  searchQuery: string;
  activeUseCases: ReadonlySet<UseCaseId>;
  activeSectors: ReadonlySet<SectorId>;
  activeFormats: ReadonlySet<string>;
  setSearchQuery: (value: string) => void;
  toggleUseCase: (id: UseCaseId) => void;
  toggleSector: (id: SectorId) => void;
  toggleFormat: (value: string) => void;
}) {
  return useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = [];
    const query = searchQuery.trim();

    if (query) {
      chips.push({
        key: 'search',
        label: `Recherche: ${query}`,
        onRemove: () => setSearchQuery(''),
      });
    }

    USE_CASE_FILTERS.forEach((option) => {
      if (activeUseCases.has(option.id)) {
        chips.push({
          key: `useCase-${option.id}`,
          label: option.label,
          onRemove: () => toggleUseCase(option.id),
        });
      }
    });

    SECTOR_FILTERS.forEach((option) => {
      if (activeSectors.has(option.id)) {
        chips.push({
          key: `sector-${option.id}`,
          label: option.label,
          onRemove: () => toggleSector(option.id),
        });
      }
    });

    FORMAT_FILTERS.forEach((option) => {
      if (activeFormats.has(option.id)) {
        chips.push({
          key: `format-${option.id}`,
          label: option.label,
          onRemove: () => toggleFormat(option.id),
        });
      }
    });

    return chips;
  }, [
    activeFormats,
    activeSectors,
    activeUseCases,
    searchQuery,
    setSearchQuery,
    toggleFormat,
    toggleSector,
    toggleUseCase,
  ]);
}

function calculateFilterCounts(
  productList: readonly Product[],
  state: CatalogueFilterState,
): CatalogueFilterCounts {
  return {
    useCases: Object.fromEntries(
      USE_CASE_FILTERS.map((option) => [
        option.id,
        productList.filter(
          (product) =>
            productMatches(product, state, 'useCases') && product.useCases.includes(option.id),
        ).length,
      ]),
    ) as Record<UseCaseId, number>,
    sectors: Object.fromEntries(
      SECTOR_FILTERS.map((option) => [
        option.id,
        productList.filter(
          (product) =>
            productMatches(product, state, 'sectors') && product.sectors.includes(option.id),
        ).length,
      ]),
    ) as Record<SectorId, number>,
    formats: Object.fromEntries(
      FORMAT_FILTERS.map((option) => [
        option.id,
        productList.filter(
          (product) =>
            productMatches(product, state, 'formats') &&
            getProductFormatFilterValues(product).includes(option.id),
        ).length,
      ]),
    ),
  };
}

function productMatches(
  product: Product,
  state: CatalogueFilterState,
  excludedGroup?: FilterGroupKey,
): boolean {
  const normalizedQuery = state.searchQuery.trim().toLocaleLowerCase('fr');

  if (
    normalizedQuery &&
    !product.name.toLocaleLowerCase('fr').includes(normalizedQuery)
  ) {
    return false;
  }

  if (
    excludedGroup !== 'useCases' &&
    state.activeUseCases.size > 0 &&
    !hasIntersection(product.useCases, state.activeUseCases)
  ) {
    return false;
  }

  if (
    excludedGroup !== 'sectors' &&
    state.activeSectors.size > 0 &&
    !hasIntersection(product.sectors, state.activeSectors)
  ) {
    return false;
  }

  if (excludedGroup !== 'formats' && state.activeFormats.size > 0) {
    const productFormats = getProductFormatFilterValues(product);
    if (!hasIntersection(productFormats, state.activeFormats)) {
      return false;
    }
  }

  return true;
}

function sortProducts(
  productList: readonly Product[],
  sortOrder: CatalogueSortOrder,
): readonly Product[] {
  const next = [...productList];

  if (sortOrder === 'az') {
    return next.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
  }

  if (sortOrder === 'za') {
    return next.sort((a, b) => b.name.localeCompare(a.name, 'fr', { sensitivity: 'base' }));
  }

  return next;
}

function getProductFormatFilterValues(product: Product): string[] {
  const values = new Set<string>();

  product.formats.forEach((format) => {
    const label = format.label.toUpperCase().replace(/\s+/g, ' ');

    if (/\b0?1\s*L\b/.test(label)) values.add('1 L');
    if (/\b0?5\s*L\b/.test(label)) values.add('5 L');
    if (/\b10\s*L\b/.test(label)) values.add('10 L');
    if (/\b20\s*L\b/.test(label)) values.add('20 L');
    if (/\b20\s*KG\b/.test(label)) values.add('20 KG');
  });

  return [...values];
}

function parseSearchParams(searchParams: SearchParamsReader): ParsedUrlState {
  const sort = searchParams.get('sort');

  return {
    searchQuery: (searchParams.get('q') ?? '').trim().slice(0, 80),
    activeUseCases: new Set(readMultiParam(searchParams, 'useCase').filter(isUseCaseId)),
    activeSectors: new Set(readMultiParam(searchParams, 'sector').filter(isSectorId)),
    activeFormats: new Set(readMultiParam(searchParams, 'format').filter(isFormatFilter)),
    viewMode: searchParams.get('view') === 'list' ? 'list' : 'grid',
    sortOrder: isSortOrder(sort) ? sort : 'default',
  };
}

function buildSearchParams(state: ParsedUrlState): URLSearchParams {
  const params = new URLSearchParams();
  const query = state.searchQuery.trim();

  if (query) params.set('q', query);
  USE_CASE_FILTERS.forEach((option) => {
    if (state.activeUseCases.has(option.id)) params.append('useCase', option.id);
  });
  SECTOR_FILTERS.forEach((option) => {
    if (state.activeSectors.has(option.id)) params.append('sector', option.id);
  });
  FORMAT_FILTERS.forEach((option) => {
    if (state.activeFormats.has(option.id)) params.append('format', option.id);
  });
  if (state.viewMode !== 'grid') params.set('view', state.viewMode);
  if (state.sortOrder !== 'default') params.set('sort', state.sortOrder);

  return params;
}

function readMultiParam(searchParams: SearchParamsReader, key: string): string[] {
  return searchParams
    .getAll(key)
    .flatMap((entry) => entry.split(','))
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toggleSetValue<T>(current: ReadonlySet<T>, value: T): Set<T> {
  const next = new Set(current);

  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }

  return next;
}

function hasIntersection<T>(values: readonly T[], activeValues: ReadonlySet<T>): boolean {
  return values.some((value) => activeValues.has(value));
}

function areSetsEqual<T>(left: ReadonlySet<T>, right: ReadonlySet<T>): boolean {
  if (left.size !== right.size) return false;

  for (const value of left) {
    if (!right.has(value)) return false;
  }

  return true;
}

function isUseCaseId(value: string): value is UseCaseId {
  return USE_CASE_FILTERS.some((option) => option.id === value);
}

function isSectorId(value: string): value is SectorId {
  return SECTOR_FILTERS.some((option) => option.id === value);
}

function isFormatFilter(value: string): boolean {
  return FORMAT_FILTERS.some((option) => option.id === value);
}

function isSortOrder(value: string | null): value is CatalogueSortOrder {
  return value === 'default' || value === 'az' || value === 'za';
}
