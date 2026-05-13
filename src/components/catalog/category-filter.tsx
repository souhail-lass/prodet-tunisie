'use client';

import { Check } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/routing';
import type { ProductCategory, Sector, UseCase } from '@/data/types';

export interface CategoryFilterProps {
  useCases: readonly UseCase[];
  sectors: readonly Sector[];
  activeUseCaseIds: readonly string[];
  activeSectorIds: readonly string[];
  activeCategory: ProductCategory | 'all';
  useCaseCounts: Record<string, number>;
  sectorCounts: Record<string, number>;
}

export function CategoryFilter({
  useCases,
  sectors,
  activeUseCaseIds,
  activeSectorIds,
  activeCategory,
  useCaseCounts,
  sectorCounts,
}: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParams(mutator: (params: URLSearchParams) => void) {
    const next = new URLSearchParams(searchParams.toString());
    mutator(next);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  function toggleMultiValue(name: 'useCase' | 'sector', value: string, activeValues: readonly string[]) {
    updateParams((params) => {
      const values = new Set(activeValues);
      if (values.has(value)) {
        values.delete(value);
      } else {
        values.add(value);
      }
      params.delete(name);
      [...values].forEach((entry) => params.append(name, entry));
    });
  }

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-primary/72">
          Type de produit
        </legend>
        <div className="mt-3 space-y-2">
          {[
            { value: 'all', label: 'Tous' },
            { value: 'manufactured', label: 'Fabriqué par Prodet' },
            { value: 'commercialized', label: 'Commercialisé' },
          ].map((option) => (
            <label
              key={option.value}
              className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-transparent bg-white px-3 py-3 text-sm transition-colors hover:border-border"
            >
              <input
                type="radio"
                checked={activeCategory === option.value}
                onChange={() =>
                  updateParams((params) => {
                    if (option.value === 'all') {
                      params.delete('category');
                    } else {
                      params.set('category', option.value);
                    }
                  })
                }
                className="peer sr-only"
              />
              <span className="flex h-4 w-4 items-center justify-center rounded-full border-[1.5px] border-[#D1D5DB] bg-white transition-colors peer-checked:border-primary peer-checked:bg-primary">
                <span className="h-2 w-2 rounded-full bg-white opacity-0 transition-opacity peer-checked:opacity-100" />
              </span>
              <span className="transition-colors group-hover:text-primary">{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-primary/72">
          Usages
        </legend>
        <div className="mt-3 space-y-2">
          {useCases.map((useCase) => (
            <label
              key={useCase.id}
              className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-transparent bg-white px-3 py-3 text-sm transition-colors hover:border-border"
            >
              <input
                type="checkbox"
                checked={activeUseCaseIds.includes(useCase.id)}
                onChange={() => toggleMultiValue('useCase', useCase.id, activeUseCaseIds)}
                className="peer sr-only"
              />
              <span className="flex h-4 w-4 items-center justify-center rounded-[4px] border-[1.5px] border-[#D1D5DB] bg-white transition-colors peer-checked:border-primary peer-checked:bg-primary">
                <Check className="h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100" aria-hidden />
              </span>
              <span className="flex-1 transition-colors group-hover:text-primary">{useCase.label}</span>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">
                {useCaseCounts[useCase.id] ?? 0}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-primary/72">
          Secteurs
        </legend>
        <div className="mt-3 space-y-2">
          {sectors.map((sector) => (
            <label
              key={sector.id}
              className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-transparent bg-white px-3 py-3 text-sm transition-colors hover:border-border"
            >
              <input
                type="checkbox"
                checked={activeSectorIds.includes(sector.id)}
                onChange={() => toggleMultiValue('sector', sector.id, activeSectorIds)}
                className="peer sr-only"
              />
              <span className="flex h-4 w-4 items-center justify-center rounded-[4px] border-[1.5px] border-[#D1D5DB] bg-white transition-colors peer-checked:border-primary peer-checked:bg-primary">
                <Check className="h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100" aria-hidden />
              </span>
              <span className="flex-1 transition-colors group-hover:text-primary">{sector.label}</span>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">
                {sectorCounts[sector.id] ?? 0}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
