'use client';

import { Filter, X } from 'lucide-react';
import { useState } from 'react';
import { CategoryFilter, type CategoryFilterProps } from '@/components/catalog/category-filter';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileFilterSheetProps extends CategoryFilterProps {
  title: string;
}

export function MobileFilterSheet({ title, ...props }: MobileFilterSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-center rounded-xl bg-white lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Filter className="h-4 w-4" aria-hidden />
        {title}
      </Button>

      <div className={cn('fixed inset-0 z-[68] lg:hidden', open ? 'pointer-events-auto' : 'pointer-events-none')}>
        <div
          className={cn(
            'absolute inset-0 bg-slate-950/52 transition-opacity duration-200 ease-out',
            open ? 'opacity-100' : 'opacity-0',
          )}
          aria-hidden
          onClick={() => setOpen(false)}
        />
        <aside
          className={cn(
            'absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-[24px] bg-white p-5 shadow-2xl transition-transform duration-200 ease-out',
            open ? 'translate-y-0' : 'translate-y-full',
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/72">
              {title}
            </p>
            <button
              type="button"
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              aria-label="Fermer les filtres"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="mt-5">
            <CategoryFilter {...props} />
          </div>
        </aside>
      </div>
    </>
  );
}
