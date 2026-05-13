'use client';

import { Building2, Check, ChevronDown, Layers, type LucideIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { SectorId } from '@/types/sector';
import type { UseCaseId } from '@/types/use-case';

export type CatalogueFilterOption<T extends string> = {
  id: T;
  label: string;
};

export const USE_CASE_FILTERS = [
  { id: 'sols', label: 'Nettoyage des sols' },
  { id: 'cuisine-degraissage', label: 'Cuisine & dégraissage' },
  { id: 'sanitaires-desinfection', label: 'Sanitaires & désinfection' },
  { id: 'linge-textiles', label: 'Linge & textiles' },
  { id: 'hygiene-mains', label: 'Hygiène des mains' },
  { id: 'surfaces-vitres', label: 'Surfaces & vitres' },
] as const satisfies readonly CatalogueFilterOption<UseCaseId>[];

export const SECTOR_FILTERS = [
  { id: 'hotels', label: 'Hôtels & hébergement' },
  { id: 'restaurants-cafes', label: 'Restaurants & cafés' },
  { id: 'societes-nettoyage', label: 'Sociétés de nettoyage' },
  { id: 'entreprises', label: 'Entreprises' },
  { id: 'revendeurs-grossistes', label: 'Revendeurs & grossistes' },
  { id: 'institutions', label: 'Institutions' },
] as const satisfies readonly CatalogueFilterOption<SectorId>[];

export const FORMAT_FILTERS = [
  { id: '1 L', label: '1L' },
  { id: '5 L', label: '5L' },
  { id: '10 L', label: '10L' },
  { id: '20 L', label: '20L' },
  { id: '20 KG', label: '20 KG' },
] as const satisfies readonly CatalogueFilterOption<string>[];

export interface CatalogueFilterCounts {
  useCases: Record<UseCaseId, number>;
  sectors: Record<SectorId, number>;
  formats: Record<string, number>;
}

interface CatalogueFiltersProps {
  activeUseCases: ReadonlySet<UseCaseId>;
  activeSectors: ReadonlySet<SectorId>;
  activeFormats: ReadonlySet<string>;
  counts: CatalogueFilterCounts;
  onToggleUseCase: (id: UseCaseId) => void;
  onToggleSector: (id: SectorId) => void;
  onToggleFormat: (value: string) => void;
  hasActiveFilters?: boolean;
  onReset?: () => void;
  className?: string;
}

export function CatalogueFilters({
  activeUseCases,
  activeSectors,
  activeFormats,
  counts,
  onToggleUseCase,
  onToggleSector,
  onToggleFormat,
  hasActiveFilters,
  onReset,
  className,
}: CatalogueFiltersProps) {
  return (
    <div className={cn('bg-white', className)}>
      <div className="flex items-center justify-between gap-3 px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
          Filtres
        </p>
        {hasActiveFilters && onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] font-medium text-[#1B5FA7] underline-offset-4 hover:underline"
          >
            Tout effacer
          </button>
        ) : null}
      </div>

      <div className="border-t border-[#E5E7EB]">
        <MemoizedFilterGroup
          title="PAR USAGE"
          description="Type de produit recherché"
          icon={Layers}
          options={USE_CASE_FILTERS}
          activeValues={activeUseCases}
          counts={counts.useCases}
          onToggle={onToggleUseCase}
        />
        <MemoizedFilterGroup
          title="PAR SECTEUR"
          description="Votre type d'établissement"
          icon={Building2}
          options={SECTOR_FILTERS}
          activeValues={activeSectors}
          counts={counts.sectors}
          onToggle={onToggleSector}
        />
        <MemoizedFilterGroup
          title="FORMAT"
          options={FORMAT_FILTERS}
          activeValues={activeFormats}
          counts={counts.formats}
          onToggle={onToggleFormat}
          showCounts={false}
        />
      </div>
    </div>
  );
}

interface FilterGroupProps<T extends string> {
  title: string;
  description?: string;
  icon?: LucideIcon;
  options: readonly CatalogueFilterOption<T>[];
  activeValues: ReadonlySet<T>;
  counts: Record<string, number>;
  onToggle: (value: T) => void;
  showCounts?: boolean;
}

function FilterGroup<T extends string>({
  title,
  description,
  icon: Icon,
  options,
  activeValues,
  counts,
  onToggle,
  showCounts = true,
}: FilterGroupProps<T>) {
  const [open, setOpen] = useState(true);

  return (
    <section className="border-b border-[#E5E7EB]">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left hover:text-[#1B5FA7]"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>
          <span className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[#9CA3AF]">
            {Icon ? <Icon className="h-3 w-3" aria-hidden /> : null}
            {title}
          </span>
          {description ? (
            <span className="block text-[10px] italic leading-none text-[#9CA3AF]">
              {description}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            'mt-0.5 h-4 w-4 text-[#6B7280] transition-transform duration-200',
            !open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      <div
        className={cn(
          'grid overflow-hidden transition-[max-height,opacity] duration-300 ease-out',
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="space-y-1 px-5 pb-4">
          {options.map((option) => {
            const checked = activeValues.has(option.id);

            return (
              <label
                key={option.id}
                className="group flex min-h-8 cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-[12px] text-[#6B7280] transition-colors hover:text-[#1B5FA7]"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(option.id)}
                  className="sr-only"
                />
                <span
                  className={cn(
                    'flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-[3px] border-[1.5px] transition-colors',
                    checked
                      ? 'border-[#1B5FA7] bg-[#1B5FA7]'
                      : 'border-[#D1D5DB] bg-white',
                  )}
                  aria-hidden
                >
                  {checked ? <Check className="h-3 w-3 text-white" strokeWidth={3} /> : null}
                </span>
                <span className="min-w-0 flex-1 leading-4">{option.label}</span>
                {showCounts ? (
                  <span className="text-[10px] font-medium leading-none text-[#9CA3AF]">
                    ({counts[option.id] ?? 0})
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const MemoizedFilterGroup = memo(FilterGroup) as typeof FilterGroup;
