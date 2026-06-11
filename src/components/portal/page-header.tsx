import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  /** Small uppercase label that anchors the page in the IA. Optional. */
  eyebrow?: ReactNode;
  /** Page title (h1). Short. */
  title: ReactNode;
  /** Optional one-sentence subtitle. Don't add three sentences. */
  description?: ReactNode;
  /** Trailing slot: usually the primary CTA. Single button preferred. */
  action?: ReactNode;
  /** Optional small meta slot, e.g. <StatusPill>. Sits between title row
   *  and description on mobile; right-aligned on desktop. */
  meta?: ReactNode;
  className?: string;
}

/**
 * The first thing the user reads on every portal page.
 *
 * One title. One CTA. No background panel. No icon-box. The body of the page
 * is what should be loud — the header just answers "where am I and what is
 * the primary action here?"
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  meta,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-prodet-blue">
            {eyebrow}
          </p>
        ) : null}
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-[24px] font-semibold leading-tight text-prodet-text md:text-[26px]">
            {title}
          </h1>
          {meta ? <span className="shrink-0">{meta}</span> : null}
        </div>
        {description ? (
          <p className="mt-2 max-w-2xl text-[14px] leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {action ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>
      ) : null}
    </header>
  );
}
