'use client';

import { useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { Product } from '@/types/product';
import { wrapLoopScroll } from '@/components/home/marquee-scroll';

function initials(name = ''): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

const SPEED = 38; // px / second — slow, continuous drift
/** Ignore layout until the duplicated track has a real width (images/fonts). */
const MIN_LOOP_WIDTH = 80;

/**
 * Continuous product carousel. The track holds the products twice; a
 * requestAnimationFrame loop drifts the content and wraps at the halfway
 * point. Hover / focus pauses it; arrows nudge without smooth-scroll (that
 * fought the RAF loop and could freeze the strip).
 */
export function ProductMarquee({ products }: { products: Product[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const loopingRef = useRef(true);
  const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    loopingRef.current = !reduceMotion;
    if (reduceMotion) return;

    let cancelled = false;
    let raf = 0;
    let last = performance.now();
    let primed = false;

    const half = () => el.scrollWidth / 2;

    const ensurePrimed = () => {
      const h = half();
      if (h < MIN_LOOP_WIDTH) return false;
      if (!primed) {
        el.scrollLeft = h;
        primed = true;
        last = performance.now();
      }
      return true;
    };

    const tick = (now: number) => {
      if (cancelled) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (ensurePrimed() && !pausedRef.current) {
        const h = half();
        el.scrollLeft = wrapLoopScroll(el.scrollLeft - SPEED * dt, h);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    // Images loading later change scrollWidth — re-clamp so we never sit past half.
    const ro = new ResizeObserver(() => {
      if (!primed || cancelled) return;
      const h = half();
      if (h < MIN_LOOP_WIDTH) return;
      el.scrollLeft = wrapLoopScroll(el.scrollLeft, h);
    });
    ro.observe(el);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (resumeRef.current) {
        clearTimeout(resumeRef.current);
        resumeRef.current = null;
      }
    };
  }, [products.length]);

  const pause = useCallback(() => {
    pausedRef.current = true;
  }, []);

  const resume = useCallback(() => {
    // A nudge holds the pause until its own timeout clears.
    if (resumeRef.current) return;
    pausedRef.current = false;
  }, []);

  const nudge = useCallback((dir: 1 | -1) => {
    const el = viewportRef.current;
    if (!el) return;

    pausedRef.current = true;
    if (resumeRef.current) clearTimeout(resumeRef.current);

    // Instant scroll only — `behavior: 'smooth'` raced the RAF wrap and left
    // the strip looking frozen mid-animation.
    const delta = dir * Math.min(el.clientWidth * 0.8, 560);
    let next = el.scrollLeft + delta;
    if (loopingRef.current) {
      const h = el.scrollWidth / 2;
      if (h >= MIN_LOOP_WIDTH) next = wrapLoopScroll(next, h);
    } else {
      const max = Math.max(0, el.scrollWidth - el.clientWidth);
      next = Math.min(max, Math.max(0, next));
    }
    el.scrollLeft = next;

    resumeRef.current = setTimeout(() => {
      resumeRef.current = null;
      pausedRef.current = false;
    }, 1200);
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
                    // Card content box is 204px (248 - 2x22 padding), 136px on
                    // mobile; the stage is 168px tall. object-fit:contain comes
                    // from .pmarquee__stage img.
                    <Image
                      src={p.image}
                      alt={p.name}
                      width={204}
                      height={168}
                      sizes="(max-width: 860px) 136px, 204px"
                      loading="lazy"
                    />
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
