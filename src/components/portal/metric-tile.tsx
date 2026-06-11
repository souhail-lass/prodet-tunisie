import type { ReactNode } from 'react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { StatusPill, type StatusTone } from './status-pill';

interface MetricTileProps {
  label: string;
  /** Primary number / short string. Rendered with tabular numerals. */
  value: ReactNode;
  /** One-line context under the value. Optional. */
  hint?: ReactNode;
  /** Status tone — the only colour signal on the tile. */
  tone?: StatusTone;
  /** Optional status pill label, e.g. "À vérifier". */
  toneLabel?: string;
  /** Optional anchor — entire tile becomes clickable. */
  href?: string;
  className?: string;
}

/**
 * Thin stat tile. No icon. No shadow. No gradient. The label is small,
 * the number is the loudest thing, the hint is muted. If you reach for
 * a third colour, you're overdesigning.
 */
export function MetricTile({
  label,
  value,
  hint,
  tone,
  toneLabel,
  href,
  className,
}: MetricTileProps) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          {label}
        </p>
        {tone && toneLabel ? <StatusPill tone={tone} label={toneLabel} /> : null}
      </div>
      <p className="mt-3 text-[26px] font-semibold leading-none text-prodet-text tabular-nums">
        {value}
      </p>
      {hint ? <p className="mt-2 text-[12px] leading-5 text-muted-foreground">{hint}</p> : null}
    </>
  );

  const baseClass = cn(
    'block rounded-md border border-border bg-card p-4 transition-colors',
    href ? 'hover:border-prodet-blue/40 hover:bg-prodet-mist/50' : null,
    className,
  );

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {body}
      </Link>
    );
  }

  return <article className={baseClass}>{body}</article>;
}
