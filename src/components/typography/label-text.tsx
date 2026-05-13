import type { ComponentPropsWithoutRef, ElementType } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'inverse';

type LabelTextProps<T extends ElementType> = {
  as?: T;
  className?: string;
  variant?: Variant;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'variant'>;

export function LabelText<T extends ElementType = 'span'>({
  as,
  className,
  variant = 'default',
  ...props
}: LabelTextProps<T>) {
  const Comp = as ?? 'span';
  return (
    <Comp
      className={cn(
        variant === 'inverse'
          ? 'font-display inline-block text-[0.72rem] font-semibold tracking-[0.22em] uppercase text-prodet-sky'
          : 'eyebrow-label',
        className,
      )}
      {...props}
    />
  );
}
