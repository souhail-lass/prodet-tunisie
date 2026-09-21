'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useQuoteDrawer } from '@/components/site/quote-drawer';

type OpenQuoteButtonProps = {
  className?: string;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

/**
 * Opens the right-hand quote drawer instead of navigating to /devis.
 * Drop-in for public "Demander un devis" links that used to be a full page.
 */
export const OpenQuoteButton = forwardRef<HTMLButtonElement, OpenQuoteButtonProps>(
  function OpenQuoteButton({ className, children, onClick, ...rest }, ref) {
    const { open } = useQuoteDrawer();
    return (
      <button
        type="button"
        ref={ref}
        className={className}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) open();
        }}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
