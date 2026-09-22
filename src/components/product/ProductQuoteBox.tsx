'use client';

import { useState } from 'react';
import { ClipboardPlus, MessageCircle } from 'lucide-react';
import { Link, type Locale } from '@/i18n/routing';
import type { Product } from '@/data/types';
import { toQuoteSelectionProduct, useQuoteSelection } from '@/lib/quote-cart-context';
import { useQuoteDrawer } from '@/components/site/quote-drawer';
import { ProductQuantitySelector } from './ProductQuantitySelector';

interface ProductQuoteBoxProps {
  product: Product;
  locale: Locale;
}

export function ProductQuoteBox({ product, locale }: ProductQuoteBoxProps) {
  const [quantity, setQuantity] = useState(1);
  const { addProduct } = useQuoteSelection();
  const { open: openQuoteDrawer } = useQuoteDrawer();
  const isEnglish = locale === 'en';

  return (
    <section className="bg-prodet-green-tint rounded-lg p-4">
      <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">
        {isEnglish
          ? 'Need this product for your facility?'
          : 'Besoin de ce produit pour votre établissement ?'}
      </h2>
      <p className="mt-2 text-[12px] leading-5 text-[var(--color-text-secondary)]">
        {isEnglish
          ? 'Choose an approximate quantity and send a request. Prodet will contact you with a tailored offer.'
          : 'Choisissez une quantité approximative et envoyez une demande. L’équipe Prodet vous contactera avec une offre adaptée.'}
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <ProductQuantitySelector quantity={quantity} onChange={setQuantity} />
        <button
          type="button"
          onClick={() => {
            addProduct(toQuoteSelectionProduct(product), quantity);
            openQuoteDrawer();
          }}
          className="bg-prodet-blue hover:bg-prodet-blue-hover inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-sm px-5 font-semibold text-[var(--type-small)] text-white transition-colors"
        >
          <ClipboardPlus className="h-4 w-4" aria-hidden />
          {isEnglish ? 'Quote' : 'Devis'}
        </button>
      </div>

      <Link
        href="/contact"
        className="text-prodet-blue hover:text-prodet-blue-hover mt-3 inline-flex items-center gap-2 text-[12px] font-semibold transition-colors"
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        {isEnglish ? 'Contact Prodet' : 'Contacter Prodet'}
      </Link>
    </section>
  );
}
