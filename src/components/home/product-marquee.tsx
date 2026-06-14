'use client';

import { useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { Product } from '@/types/product';

function initials(name = ''): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

const SPEED = 38; // px / second — slow, continuous drift

/**
 * Continuous product carousel. The track holds the products twice; a
 * requestAnimationFrame loop drifts the content to the right and wraps
 * seamlessly at the halfway point. Hover / focus pauses it, the arrows nudge
 * it (and briefly pause the drift), and reduced-motion leaves a plain scroller.
 */
export function ProductMarquee({ products }: { products: Product[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const half = () => el.scrollWidth / 2;
    el.scrollLeft = half(); // start mid so we can drift right into the duplicate
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!pausedRef.current) {
        el.scrollLeft -= SPEED * dt; // content drifts to the right
        if (el.scrollLeft <= 0) el.scrollLeft += half();
        else if (el.scrollLeft >= half()) el.scrollLeft -= half();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [products.length]);

  const pause = useCallback(() => {
    pausedRef.current = true;
  }, []);
  const resume = useCallback(() => {
    pausedRef.current = false;
  }, []);

  const nudge = useCallback((dir: 1 | -1) => {
    const el = viewportRef.current;
    if (!el) return;
    pausedRef.current = true;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 560), behavior: 'smooth' });
    if (resumeRef.current) clearTimeout(resumeRef.current);
    resumeRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, 1600);
  }, []);

  if (products.length === 0) return null;
  const loop = [...products, ...products];

  return (
    <div className="pmarquee" role="region" aria-label="Produits Prodet">
      <button
        type="button"
        className="pmarquee__nav pmarquee__nav--prev"
        aria-label="Précédent"
        onClick={() => nudge(-1)}
      >
        <ChevronLeft size={20} />
      </button>
      <div
        className="pmarquee__viewport"
        ref={viewportRef}
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocusCapture={pause}
        onBlurCapture={resume}
      >
        <div className="pmarquee__track">
          {loop.map((p, i) => {
            const dupe = i >= products.length;
            return (
              <Link
                key={`${p.slug}-${i}`}
                href={`/catalogue/${p.slug}`}
                className="pmarquee__card"
                aria-hidden={dupe}
                tabIndex={dupe ? -1 : undefined}
              >
                <div className="pmarquee__stage">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.name} loading="lazy" />
                  ) : (
                    <span className="pmarquee__mono">{initials(p.name)}</span>
                  )}
                </div>
                <span className="pmarquee__name">{p.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        className="pmarquee__nav pmarquee__nav--next"
        aria-label="Suivant"
        onClick={() => nudge(1)}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
