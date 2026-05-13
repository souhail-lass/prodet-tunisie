'use client';

import Image from 'next/image';
import type { Locale } from '@/i18n/routing';
import type { Product } from '@/data/types';
import { ProdetPackshot } from '@/components/brand/prodet-packshot';
import { cn } from '@/lib/utils';

interface ProductVisualProps {
  product: Product;
  locale?: Locale;
  className?: string;
  priority?: boolean;
  variant?: 'image' | 'packshot' | 'catalogue-photo';
}

const catalogueReferencePhoto =
  '/images/contexts/RSG%20Nu-Kleen%20All%20%28UL%20Ecologo%29.jpg';

export function ProductVisual({
  product,
  className,
  priority,
  variant = 'image',
}: ProductVisualProps) {
  if (variant === 'catalogue-photo') {
    return (
      <div className={cn('product-display-stage relative overflow-hidden rounded-[24px]', className)}>
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0.36)_35%,rgba(15,93,168,0.06)_100%)]"
        />
        <Image
          src={catalogueReferencePhoto}
          alt={`${product.name} photo illustrative`}
          fill
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          sizes="(min-width: 1536px) 240px, (min-width: 1280px) 220px, (min-width: 768px) 30vw, 100vw"
          className="object-contain p-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
        />
      </div>
    );
  }

  if (variant === 'packshot') {
    return (
      <div
        className={cn(
          'product-display-stage relative flex items-center justify-center overflow-hidden rounded-[26px] px-4 py-6',
          className,
        )}
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.58),transparent_38%,rgba(15,93,168,0.08)_100%)]"
        />
        <div
          aria-hidden
          className="absolute -bottom-10 -left-8 h-32 w-32 rounded-full border border-primary/10"
        />
        <div
          aria-hidden
          className="absolute -right-8 top-6 h-24 w-24 rounded-full bg-prodet-sky/8 blur-2xl"
        />
        <div className="relative w-full max-w-[240px]">
          <ProdetPackshot
            compact
            title={product.name}
            subtitle={product.tagline}
            weightLabel={product.formats[0]?.label ?? 'Format pro'}
            manufacturedByLabel={
              product.category === 'manufactured' ? 'Fabrique par Prodet' : 'Selection Prodet'
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('product-display-stage relative overflow-hidden rounded-[26px]', className)}>
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.58),transparent_38%,rgba(15,93,168,0.08)_100%)]"
      />
      <div
        aria-hidden
        className="absolute -bottom-10 -left-8 h-32 w-32 rounded-full border border-primary/10"
      />
      <div
        aria-hidden
        className="absolute -right-8 top-6 h-24 w-24 rounded-full bg-prodet-sky/8 blur-2xl"
      />
      <Image
        src={product.image}
        alt={product.name}
        fill
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        sizes={
          priority
            ? '(min-width: 1024px) 40rem, 100vw'
            : '(min-width: 1280px) 22rem, (min-width: 640px) 50vw, 100vw'
        }
        className="object-contain p-8 transition-transform duration-300 ease-out group-hover:scale-[1.03]"
      />
    </div>
  );
}
