'use client';

import { useEffect, useRef, useState } from 'react';

const fmtCache = new Map<number, Intl.NumberFormat>();
function fmt(decimals: number): Intl.NumberFormat {
  let f = fmtCache.get(decimals);
  if (!f) {
    f = new Intl.NumberFormat('fr-TN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    fmtCache.set(decimals, f);
  }
  return f;
}

/**
 * Animated number: server-renders the final value (no layout shift, SEO-safe)
 * then counts up from 0 on mount. Respects prefers-reduced-motion.
 */
export function CountUp({
  value,
  decimals = 0,
  durationMs = 900,
}: {
  value: number;
  decimals?: number;
  durationMs?: number;
}) {
  const [display, setDisplay] = useState(value);
  const frame = useRef<number>(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || value === 0) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    setDisplay(0);
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, durationMs]);

  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(decimals).format(display)}</span>;
}
