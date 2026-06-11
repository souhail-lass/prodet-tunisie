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
    <article className="group flex h-full min-h-[360px] flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-white shadow-card transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-prodet-blue-tint-strong hover:shadow-card-hover">
      <Link href={`/catalogue/${product.slug}`} className="block">
        <div className="relative flex h-[238px] items-center justify-center bg-white px-4 pt-4">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 245px, (min-width: 768px) 33vw, 100vw"
              className="object-contain px-5 pb-2 pt-6 mix-blend-multiply transition-transform duration-200 group-hover:scale-[1.02]"
            />
          ) : (
            <ProductInitials product={product} />
          )}
        </div>

        <div className="px-4 pb-0 pt-2">
          <h3 className="line-clamp-1 text-[var(--type-body)] font-semibold leading-tight text-prodet-blue transition-colors group-hover:text-prodet-blue-hover">
            {product.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-[var(--type-xs)] leading-snug text-[var(--color-text-secondary)]">
            {product.tagline}
          </p>
        </div>
      </Link>

      <div className="mt-auto px-4 pb-4 pt-4">
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
          className="flex h-8 w-full items-center justify-center gap-1.5 rounded-sm border border-prodet-blue bg-transparent px-3 text-center text-[var(--type-xs)] font-medium text-prodet-blue transition-colors duration-150 hover:bg-prodet-blue hover:text-white"
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
            ? 'rounded-l-sm border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)] text-[var(--color-danger)] hover:opacity-80'
            : 'rounded-l-sm bg-prodet-blue text-white hover:bg-prodet-blue-hover',
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
        className="h-8 min-w-0 flex-1 border-y border-prodet-blue border-x-0 bg-white px-2 text-center text-[var(--type-small)] font-semibold outline-none"
      />
      <button
        type="button"
        onClick={() => setProductQuantity(quoteProduct, quantity + 1)}
        className="flex h-8 w-7 shrink-0 items-center justify-center rounded-r-sm bg-prodet-blue text-[16px] font-normal leading-none text-white transition-colors duration-150 hover:bg-prodet-blue-hover"
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
        'flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold text-white',
        isManufactured ? 'bg-prodet-blue' : 'bg-prodet-green',
      )}
    >
      {initials}
    </div>
  );
}
