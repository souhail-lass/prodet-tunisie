import { cn } from '@/lib/utils';

export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

interface StatusPillProps {
  tone?: StatusTone;
  label: string;
  size?: 'sm' | 'md';
  className?: string;
}

const toneClasses: Record<StatusTone, string> = {
  // Muted semantic colours. Backgrounds at ~12% opacity, text at full opacity.
  // The dot is the loudest pixel; the pill is supporting context.
  neutral: 'border-border bg-prodet-wash text-muted-foreground',
  info: 'border-prodet-blue/20 bg-prodet-blue/10 text-prodet-blue',
  success: 'border-prodet-green/20 bg-prodet-green/10 text-prodet-green',
  warning: 'border-warning/20 bg-warning/10 text-warning',
  danger: 'border-destructive/20 bg-destructive/10 text-destructive',
};

const dotClasses: Record<StatusTone, string> = {
  neutral: 'bg-muted-foreground/70',
  info: 'bg-prodet-blue',
  success: 'bg-prodet-green',
  warning: 'bg-warning',
  danger: 'bg-destructive',
};

/**
 * Single source of truth for status visuals across the client portal and the
 * admin queue. Never colour a status manually with raw Tailwind classes.
 */
export function StatusPill({ tone = 'neutral', label, size = 'sm', className }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium tabular-nums',
        size === 'sm' ? 'h-5 px-2 text-[11px]' : 'h-6 px-2.5 text-xs',
        toneClasses[tone],
        className,
      )}
    >
      <span
        className={cn('inline-block rounded-full', dotClasses[tone], size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2')}
        aria-hidden
      />
      {label}
    </span>
  );
}
