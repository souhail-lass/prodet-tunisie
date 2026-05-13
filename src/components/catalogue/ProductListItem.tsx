'use client';

import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';
import { QuoteQuantityControl } from './ProductCard';

interface ProductListItemProps {
  product: Product;
}

export function ProductListItem({ product }: ProductListItemProps) {
  return (
    <article className="group flex h-20 overflow-hidden rounded-[10px] border border-[#E5E7EB] bg-white transition-all duration-200 ease-out hover:border-[#1B5FA7] hover:shadow-[0_12px_24px_-20px_rgba(27,95,167,0.5)]">
      <Link
        href={`/catalogue/${product.slug}`}
        aria-label={`Voir ${product.name}`}
        className="relative flex w-[90px] shrink-0 items-center justify-center border-r border-[#E5E7EB] bg-white p-2"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="90px"
            className="object-contain p-2"
          />
        ) : (
          <ProductInitials product={product} />
        )}
      </Link>

      <div className="min-w-0 flex-1 px-[14px] py-3">
        <Link href={`/catalogue/${product.slug}`} className="block">
          <h3 className="truncate text-[13px] font-medium leading-4 text-[#1C2B3A] transition-colors group-hover:text-[#1B5FA7]">
            {product.name}
          </h3>
          <p className="my-0.5 line-clamp-1 text-[11px] leading-[1.5] text-[#6B7280]">
            {product.tagline}
          </p>
        </Link>

        <div className="flex items-center gap-1.5 overflow-hidden">
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {product.formats.map((format) => (
              <span
                key={format.label}
                className="rounded-[4px] bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-medium leading-4 text-[#374151]"
              >
                {format.label}
              </span>
            ))}
          </div>
          <div className="ml-auto w-full max-w-[160px] shrink-0">
            <QuoteQuantityControl product={product} />
          </div>
        </div>
      </div>

      <Link
        href={`/catalogue/${product.slug}`}
        aria-label={`Ouvrir ${product.name}`}
        className="flex shrink-0 items-center px-[14px] text-[#9CA3AF] transition-colors group-hover:text-[#1B5FA7]"
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </Link>
    </article>
  );
}

function ProductInitials({ product }: { product: Product }) {
  const initials = product.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-semibold text-white',
        product.category === 'manufactured' ? 'bg-[#1B5FA7]' : 'bg-[#1F9C49]',
      )}
    >
      {initials}
    </div>
  );
}
