import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** Optional icon. Keep it monochrome and small. */
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Primary action — if provided, renders an outline button by default. */
  action?: {
    label: string;
    href: string;
  };
  /** Inline mode: no border, no padding, used inside an already-bordered Panel body. */
  inline?: boolean;
  className?: string;
}

/**
 * Single empty-state pattern. Title, one sentence of explanation, one CTA.
 * No illustrations of cute robots. No marketing voice.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  inline,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'text-center',
        inline
          ? 'py-10'
          : 'rounded-md border border-dashed border-border bg-prodet-wash/60 px-6 py-10',
        className,
      )}
    >
      {icon ? (
        <div className="mx-auto mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-prodet-mist text-prodet-blue">
          {icon}
        </div>
      ) : null}
      <h3 className="text-[15px] font-semibold text-prodet-text">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? (
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      ) : null}
    </div>
  );
}
