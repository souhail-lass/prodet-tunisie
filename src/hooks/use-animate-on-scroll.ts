'use client';

import { useEffect, useRef } from 'react';

interface UseAnimateOnScrollOptions {
  threshold?: number;
  rootMargin?: string;
  staggerChildren?: boolean;
  childSelector?: string;
}

export function useAnimateOnScroll<T extends HTMLElement>({
  threshold = 0.1,
  rootMargin = '0px 0px -10% 0px',
  staggerChildren = false,
  childSelector = '[data-animate-child]',
}: UseAnimateOnScrollOptions = {}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = staggerChildren
      ? Array.from(element.querySelectorAll<HTMLElement>(childSelector))
      : [element];

    if (targets.length === 0) return undefined;

    targets.forEach((target, index) => {
      target.classList.add('animate-on-scroll');
      target.style.setProperty('--animate-delay', `${index * 80}ms`);
    });

    if (prefersReduced) {
      targets.forEach((target) => target.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold, rootMargin },
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [childSelector, rootMargin, staggerChildren, threshold]);

  return ref;
}
