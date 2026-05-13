'use client';

import { Link } from '@/i18n/routing';
import type { Product } from '@/data/types';
import { ProductVisual } from '@/components/catalog/product-visual';

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group relative mx-auto flex h-full w-full max-w-[248px] flex-col overflow-hidden rounded-[24px] border border-border/90 bg-white transition-[transform,box-shadow,border-color,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] hover:border-primary/38 hover:shadow-[0_26px_50px_-34px_rgba(11,61,115,0.34)]">
      <Link
        href={`/catalogue/${product.slug}`}
        aria-label={`Voir ${product.name}`}
        className="absolute inset-0 z-0 cursor-pointer"
      />
      <div className="pointer-events-none relative z-10 flex h-full flex-col p-3">
        <ProductVisual product={product} variant="catalogue-photo" className="h-[208px]" />
        <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
          <h3 className="text-[1rem] font-semibold leading-6 text-prodet-text transition-colors duration-300 group-hover:text-primary">
            {product.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-muted-foreground">
            {product.tagline}
          </p>
        </div>
      </div>
    </article>
  );
}
