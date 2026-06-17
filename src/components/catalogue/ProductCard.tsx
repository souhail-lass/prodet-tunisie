'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  toQuoteSelectionProduct,
  useQuoteSelection,
} from '@/lib/quote-cart-context';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

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
          className="flex h-8 w-full items-center justify-center gap-1 whitespace-nowrap rounded-sm border border-prodet-blue bg-transparent px-2 text-center text-[11px] font-medium leading-none text-prodet-blue transition-colors duration-150 hover:bg-prodet-blue hover:text-white"
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
