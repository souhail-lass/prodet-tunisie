import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PanelProps {
  /** Section title — rendered as h2. Keep it short, sentence-case. */
  title?: ReactNode;
  /** One-line context, optional. Don't pad with marketing copy. */
  description?: ReactNode;
  /** Right-aligned slot: usually a link or a small button. */
  action?: ReactNode;
  /** Optional padding override (rare). */
  padding?: 'normal' | 'tight' | 'flush';
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

const paddingMap: Record<NonNullable<PanelProps['padding']>, string> = {
  normal: 'p-5 md:p-6',
  tight: 'p-4',
  flush: 'p-0',
};

/**
 * Flat, bordered surface. No shadow. The hierarchy is the title; the panel is
 * scaffolding. If you find yourself nesting panels, you don't need a panel —
 * you need a list row.
 */
export function Panel({
  title,
  description,
  action,
  padding = 'normal',
  className,
  bodyClassName,
  children,
}: PanelProps) {
  const hasHeader = Boolean(title || description || action);

  return (
    <section
      className={cn(
        'rounded-md border border-border bg-card text-card-foreground',
        className,
      )}
    >
      {hasHeader ? (
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-3.5 md:px-6">
          <div className="min-w-0">
            {title ? <h2 className="text-[15px] font-semibold text-prodet-text">{title}</h2> : null}
            {description ? (
              <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}

      <div className={cn(paddingMap[padding], bodyClassName)}>{children}</div>
    </section>
  );
}
