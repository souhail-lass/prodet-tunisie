'use client';

import { createElement, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from 'react';
import { useAnimateOnScroll } from '@/hooks/use-animate-on-scroll';
import { cn } from '@/lib/utils';

type AnimateOnScrollProps<T extends ElementType = 'div'> = {
  as?: T;
  children: ReactNode;
  className?: string;
  staggerChildren?: boolean;
  childSelector?: string;
  threshold?: number;
  rootMargin?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

export function AnimateOnScroll<T extends ElementType = 'div'>({
  as,
  children,
  className,
  staggerChildren = false,
  childSelector,
  threshold,
  rootMargin,
  ...props
}: AnimateOnScrollProps<T>) {
  const Component = (as ?? 'div') as ElementType;
  const ref = useAnimateOnScroll<HTMLElement>({
    threshold,
    rootMargin,
    staggerChildren,
    childSelector,
  });

  return createElement(
    Component,
    {
      ref,
      className: cn(!staggerChildren && 'animate-on-scroll', className),
      ...props,
    },
    children,
  );
}
