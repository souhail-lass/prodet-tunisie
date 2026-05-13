'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ClipboardPlus } from 'lucide-react';
import { QuoteQuantityControl } from '@/components/catalogue/ProductCard';
import { useRouter } from '@/i18n/routing';
import {
  toQuoteSelectionProduct,
  useQuoteSelection,
} from '@/lib/quote-cart-context';
import { cn } from '@/lib/utils';
import type { Product } from '@/data/types';

interface ProductStickyBarProps {
  product: Product;
}

export function ProductStickyBar({ product }: ProductStickyBarProps) {
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const { addProduct, getQuantity } = useQuoteSelection();

  useEffect(() => {
    const hero = document.getElementById('product-hero-v2');
    if (!hero) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        'fixed inset-x-0 top-[80px] z-40 border-b-[0.5px] border-[#E5E7EB] bg-white transition-transform duration-300 ease-out',
        visible ? 'translate-y-0' : 'pointer-events-none -translate-y-full',
      )}
    >
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-6 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md bg-[#F4F6F8]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="32px"
              className="object-contain p-1"
            />
          </div>
          <p className="truncate text-[13px] font-medium text-[#1C2B3A]">{product.name}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <QuoteQuantityControl product={product} className="hidden w-[150px] sm:flex" />
          <button
            type="button"
            onClick={() => {
              addProduct(toQuoteSelectionProduct(product), Math.max(1, getQuantity(product.id)));
              router.push('/devis');
            }}
            className="inline-flex h-[30px] items-center justify-center gap-1.5 rounded-lg bg-[#1B5FA7] px-3 text-[11px] font-medium text-white transition-colors hover:bg-[#1650A0]"
          >
            <ClipboardPlus className="h-3.5 w-3.5" aria-hidden />
            Ajouter au devis
          </button>
        </div>
      </div>
    </div>
  );
}
