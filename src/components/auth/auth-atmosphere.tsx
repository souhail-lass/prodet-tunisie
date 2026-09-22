'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

/**
 * Soft Prodet wash for auth screens: fine dot grid + a navy spotlight that
 * follows the pointer. Static pattern only when the user prefers reduced motion.
 */
export function AuthAtmosphere({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [spot, setSpot] = useState({ x: 50, y: 38 });
  const reduceMotionRef = useRef(false);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      reduceMotionRef.current = mq.matches;
    };
    sync();
    mq.addEventListener('change', sync);
    return () => {
      mq.removeEventListener('change', sync);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (reduceMotionRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      setSpot({ x, y });
    });
  }

  return (
    <div
      className={cn(
        'auth-atmosphere relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-5 py-16',
        className,
      )}
      onPointerMove={onPointerMove}
      style={
        {
          '--auth-spot-x': `${spot.x}%`,
          '--auth-spot-y': `${spot.y}%`,
        } as CSSProperties
      }
    >
      <div className="auth-atmosphere__wash" aria-hidden />
      <div className="auth-atmosphere__grid" aria-hidden />
      <div className="auth-atmosphere__spot" aria-hidden />
      <div className="relative z-10 w-full max-w-[440px]">{children}</div>
    </div>
  );
}
