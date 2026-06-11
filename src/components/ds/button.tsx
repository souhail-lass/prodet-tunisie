import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'success' | 'dark';
type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
};

/** Mirrors the design-system Button (.pds-btn). See src/styles/prodet/primitives.css. */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  iconLeft,
  iconRight,
  type = 'button',
  className = '',
  ...rest
}: ButtonProps) {
  const cls = ['pds-btn', `pds-btn--${variant}`, `pds-btn--${size}`, block ? 'pds-btn--block' : '', className]
    .filter(Boolean)
    .join(' ');
  return (
    <button type={type} className={cls} {...rest}>
      {iconLeft}
      {children ? <span>{children}</span> : null}
      {iconRight}
    </button>
  );
}

type IconButtonVariant = 'ghost' | 'outline' | 'solid';
type IconButtonSize = 'sm' | 'md';

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
};

/** Mirrors the design-system IconButton (.pds-iconbtn). */
export function IconButton({
  children,
  variant = 'ghost',
  size = 'md',
  type = 'button',
  className = '',
  ...rest
}: IconButtonProps) {
  const cls = ['pds-iconbtn', `pds-iconbtn--${variant}`, `pds-iconbtn--${size}`, className]
    .filter(Boolean)
    .join(' ');
  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  );
}
