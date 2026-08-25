'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Reactive `matchMedia`. The server snapshot is always `false`, so components
 * must render their wide-viewport markup first and narrow it after hydration —
 * never the other way round, or the HTML won't match.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === 'undefined') return () => {};
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
