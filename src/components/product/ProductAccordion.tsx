'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductAccordionProps {
  title: string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  defaultOpen: boolean;
  children: ReactNode;
}

export function ProductAccordion({
  title,
  icon: Icon,
  iconBg = '#EFF6FF',
  iconColor = '#1B5FA7',
  defaultOpen,
  children,
}: ProductAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden border-b border-white last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 bg-[#F4F4F4] px-3 py-2 text-left transition-colors hover:bg-[#EFEFEF]"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span
            className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: iconBg, color: iconColor }}
          >
            <Icon className="h-2.5 w-2.5" aria-hidden />
          </span>
          <span className="truncate text-[13px] font-semibold tracking-[-0.01em] text-[#1F9C49]">
            {title}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'h-[15px] w-[15px] shrink-0 text-[#6B7280] transition-transform duration-200',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      <div
        className={cn(
          'overflow-hidden transition-[max-height,opacity] duration-300 ease-out',
          open ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className={cn('bg-white px-10 py-3')}>
          {children}
        </div>
      </div>
    </section>
  );
}
