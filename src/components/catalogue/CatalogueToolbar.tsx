'use client';

import { ArrowUpDown, Filter, LayoutGrid, List, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type CatalogueViewMode = 'grid' | 'list';
export type CatalogueSortOrder = 'default' | 'az' | 'za';

interface CatalogueToolbarProps {
  searchQuery: string;
  viewMode: CatalogueViewMode;
  sortOrder: CatalogueSortOrder;
  onSearchChange: (value: string) => void;
  onViewModeChange: (mode: CatalogueViewMode) => void;
  onSortOrderChange: (order: CatalogueSortOrder) => void;
  onOpenFilters: () => void;
}

const sortOptions = [
  { value: 'az', label: 'A–Z' },
  { value: 'za', label: 'Z–A' },
  { value: 'default', label: 'Nouveautés' },
] as const;

export function CatalogueToolbar({
  searchQuery,
  viewMode,
  sortOrder,
  onSearchChange,
  onViewModeChange,
  onSortOrderChange,
  onOpenFilters,
}: CatalogueToolbarProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!sortRef.current?.contains(event.target as Node)) {
        setSortOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  return (
    <div className="flex flex-col gap-3 bg-white md:flex-row md:items-center">
      <button
        type="button"
        onClick={onOpenFilters}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 text-[12px] font-medium text-[#1C2B3A] shadow-sm transition-colors hover:border-[#1B5FA7] hover:text-[#1B5FA7] md:hidden"
      >
        <Filter className="h-4 w-4" aria-hidden />
        Filtres
      </button>

      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]"
          aria-hidden
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Rechercher dans le catalogue…"
          className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white pl-9 pr-3 text-[13px] text-[#1C2B3A] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#1B5FA7] focus:ring-2 focus:ring-[#1B5FA7]/10"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex h-10 rounded-full border border-[#E5E7EB] bg-white p-1">
          <ViewToggleButton
            label="Vue grille"
            active={viewMode === 'grid'}
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden />
          </ViewToggleButton>
          <ViewToggleButton
            label="Vue liste"
            active={viewMode === 'list'}
            onClick={() => onViewModeChange('list')}
          >
            <List className="h-4 w-4" aria-hidden />
          </ViewToggleButton>
        </div>

        <div ref={sortRef} className="relative">
          <button
            type="button"
            aria-expanded={sortOpen}
            onClick={() => setSortOpen((current) => !current)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 text-[12px] font-medium text-[#1C2B3A] shadow-sm transition-colors hover:border-[#1B5FA7] hover:text-[#1B5FA7]"
          >
            <ArrowUpDown className="h-4 w-4" aria-hidden />
            Trier
          </button>

          {sortOpen ? (
            <div className="absolute right-0 z-30 mt-2 w-36 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-[0_18px_36px_-18px_rgba(13,59,115,0.25)]">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onSortOrderChange(option.value);
                    setSortOpen(false);
                  }}
                  className={cn(
                    'block w-full px-3 py-2 text-left text-[12px] transition-colors hover:bg-[#EFF6FF] hover:text-[#1B5FA7]',
                    sortOrder === option.value
                      ? 'bg-[#EFF6FF] font-semibold text-[#1B5FA7]'
                      : 'text-[#6B7280]',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ViewToggleButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors',
        active ? 'bg-[#1B5FA7] text-white' : 'bg-white text-[#6B7280] hover:text-[#1B5FA7]',
      )}
    >
      {children}
    </button>
  );
}
