import type { ComponentPropsWithoutRef, ElementType } from 'react';
import { cn } from '@/lib/utils';

type LabelTextProps<T extends ElementType> = {
  as?: T;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className'>;

export function LabelText<T extends ElementType = 'span'>({
  as,
  className,
  ...props
}: LabelTextProps<T>) {
  const Comp = as ?? 'span';
  return <Comp className={cn('eyebrow-label', className)} {...props} />;
}
