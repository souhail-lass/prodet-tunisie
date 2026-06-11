import type { HTMLAttributes, ReactNode } from 'react';

type BadgeTone = 'neutral' | 'blue' | 'green' | 'amber' | 'red';
type BadgeVariant = 'soft' | 'solid' | 'outline';
type BadgeSize = 'sm' | 'md';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: ReactNode;
};

/** Mirrors the design-system Badge (.pds-badge). */
export function Badge({
  children,
  tone = 'neutral',
  variant = 'soft',
  size = 'md',
  dot = false,
  icon,
  className = '',
  ...rest
}: BadgeProps) {
  const cls = [
    'pds-badge',
    `pds-badge--${tone}`,
    `pds-badge--${size}`,
    variant === 'solid' ? 'pds-badge--solid' : '',
    variant === 'outline' ? 'pds-badge--outline' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <span className={cls} {...rest}>
      {dot ? <span className="pds-badge__dot" /> : null}
      {icon}
      {children}
    </span>
  );
}

type Status = 'progress' | 'delivered' | 'prep' | 'cancelled';

const STATUS_PRESETS: Record<Status, { cls: string; label: string }> = {
  progress: { cls: 'progress', label: 'En cours' },
  delivered: { cls: 'delivered', label: 'Livré' },
  prep: { cls: 'prep', label: 'En préparation' },
  cancelled: { cls: 'cancelled', label: 'Annulé' },
};

export type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  status?: Status;
  label?: string;
  dot?: boolean;
};

/** Mirrors the design-system StatusBadge (.pds-status). */
export function StatusBadge({ status = 'progress', label, dot = true, className = '', ...rest }: StatusBadgeProps) {
  const preset = STATUS_PRESETS[status] ?? STATUS_PRESETS.progress;
  const cls = ['pds-status', `pds-status--${preset.cls}`, className].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {dot ? <span className="pds-status__dot" /> : null}
      {label ?? preset.label}
    </span>
  );
}
