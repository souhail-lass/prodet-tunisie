import type { HTMLAttributes, ReactNode } from 'react';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode;
  subtitle?: ReactNode;
  interactive?: boolean;
  flat?: boolean;
  navy?: boolean;
  padded?: boolean;
};

/** Mirrors the design-system Card (.pds-card). */
export function Card({
  children,
  title,
  subtitle,
  interactive = false,
  flat = false,
  navy = false,
  padded = true,
  className = '',
  ...rest
}: CardProps) {
  const cls = [
    'pds-card',
    padded ? 'pds-card--pad' : '',
    interactive ? 'pds-card--interactive' : '',
    flat ? 'pds-card--flat' : '',
    navy ? 'pds-card--navy' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={cls} {...rest}>
      {title ? (
        <div className="pds-card__header">
          <div className="pds-card__title">{title}</div>
          {subtitle ? <div className="pds-card__subtitle">{subtitle}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
