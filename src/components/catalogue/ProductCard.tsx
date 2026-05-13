'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import {
  toQuoteSelectionProduct,
  useQuoteSelection,
} from '@/lib/quote-cart-context';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[10px] border-[0.5px] border-[#E5E7EB] bg-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#1B5FA7] hover:shadow-[0_4px_16px_rgba(27,95,167,0.08)]">
      <Link href={`/catalogue/${product.slug}`} className="block">
        <div className="relative flex h-[160px] items-center justify-center rounded-t-[10px] bg-[#F8F7F4] p-4">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={240}
              height={140}
              sizes="(min-width: 1024px) 260px, (min-width: 768px) 50vw, 100vw"
              className={cn(
                'h-full w-full object-contain',
                product.slug === 'deofresh' ||
                  product.slug === 'deofresh-linge' ||
                  product.slug === 'sirafan-desinfectant'
                  ? 'translate-y-2 scale-[0.95]'
                  : 'scale-[1.1]',
              )}
            />
          ) : (
            <ProductInitials product={product} />
          )}
        </div>

        <div className="px-3.5 pb-0 pt-3">
          <h3 className="truncate text-[13px] font-semibold leading-[1.3] text-[#1C2B3A] transition-colors group-hover:text-[#1B5FA7]">
            {product.name}
          </h3>
          <p className="mt-[3px] line-clamp-2 text-[11px] leading-[1.4] text-[#6B7280]">
            {product.tagline}
          </p>
        </div>
      </Link>

      <div className="mt-auto px-3.5 pb-3 pt-2.5">
        <QuoteQuantityControl product={product} />
      </div>
    </article>
  );
}

export function QuoteQuantityControl({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const quoteProduct = toQuoteSelectionProduct(product);
  const { getQuantity, setProductQuantity } = useQuoteSelection();
  const quantity = getQuantity(product.id);
  const [draftValue, setDraftValue] = useState(String(quantity));

  useEffect(() => {
    setDraftValue(quantity > 0 ? String(quantity) : '');
  }, [quantity]);

  if (quantity <= 0) {
    return (
      <div className={cn('h-8 overflow-hidden', className)}>
        <button
          type="button"
          onClick={() => setProductQuantity(quoteProduct, 1)}
          className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border-[0.5px] border-[#1B5FA7] bg-transparent px-3 text-center text-[12px] font-medium text-[#1B5FA7] transition-all duration-150 hover:bg-[#1B5FA7] hover:text-white"
        >
          + Ajouter au devis
        </button>
      </div>
    );
  }

  function commitDraft(value: string) {
    const parsed = Number.parseInt(value, 10);

    if (!value || Number.isNaN(parsed) || parsed <= 0) {
      setProductQuantity(quoteProduct, 0);
      return;
    }

    setProductQuantity(quoteProduct, Math.min(parsed, 9999));
  }

  const showTrash = quantity === 1;

  return (
    <div className={cn('flex h-8 w-full overflow-hidden', className)}>
      <button
        type="button"
        onClick={() => setProductQuantity(quoteProduct, showTrash ? 0 : quantity - 1)}
        className={cn(
          'flex h-8 w-7 shrink-0 items-center justify-center transition-colors duration-150',
          showTrash
            ? 'rounded-l-md border-[0.5px] border-[#FCA5A5] bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]'
            : 'rounded-l-md bg-[#1B5FA7] text-white hover:bg-[#1650A0]',
        )}
        aria-label={showTrash ? `Supprimer ${product.name} du devis` : `Retirer ${product.name} du devis`}
      >
        {showTrash ? (
          <Trash2 className="h-[13px] w-[13px]" aria-hidden />
        ) : (
          <span className="text-[16px] font-normal leading-none">−</span>
        )}
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={draftValue}
        onChange={(event) => {
          const nextValue = event.target.value.replace(/\D/gu, '').slice(0, 4);
          setDraftValue(nextValue);
          if (nextValue) {
            const parsed = Number.parseInt(nextValue, 10);
            if (parsed > 0) {
              setProductQuantity(quoteProduct, Math.min(parsed, 9999));
            }
          }
        }}
        onBlur={() => commitDraft(draftValue)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.currentTarget.blur();
          }
        }}
        aria-label={`Quantité de ${product.name}`}
        className="h-8 min-w-0 flex-1 border-y-[0.5px] border-[#1B5FA7] border-x-0 bg-white px-2 text-center text-[13px] font-semibold text-[#1C2B3A] outline-none"
      />
      <button
        type="button"
        onClick={() => setProductQuantity(quoteProduct, quantity + 1)}
        className="flex h-8 w-7 shrink-0 items-center justify-center rounded-r-md bg-[#1B5FA7] text-[16px] font-normal leading-none text-white transition-colors duration-150 hover:bg-[#1650A0]"
        aria-label={`Ajouter ${product.name} au devis`}
      >
        +
      </button>
    </div>
  );
}

function ProductInitials({ product }: { product: Product }) {
  const initials = product.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  const isManufactured = product.category === 'manufactured';

  return (
    <div
      className={cn(
        'flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold text-white shadow-sm',
        isManufactured ? 'bg-[#1B5FA7]' : 'bg-[#1F9C49]',
      )}
    >
      {initials}
    </div>
  );
}
