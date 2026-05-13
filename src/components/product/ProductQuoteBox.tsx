'use client';

import { useState } from 'react';
import { ClipboardPlus, MessageCircle } from 'lucide-react';
import { Link, useRouter, type Locale } from '@/i18n/routing';
import type { Product } from '@/data/types';
import {
  toQuoteSelectionProduct,
  useQuoteSelection,
} from '@/lib/quote-cart-context';
import { ProductQuantitySelector } from './ProductQuantitySelector';

interface ProductQuoteBoxProps {
  product: Product;
  locale: Locale;
}

export function ProductQuoteBox({ product, locale }: ProductQuoteBoxProps) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const { addProduct } = useQuoteSelection();
  const isEnglish = locale === 'en';

  return (
    <section className="rounded-[18px] bg-[#F4F8F5] p-4">
      <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-[#1C2B3A]">
        {isEnglish
          ? 'Need this product for your facility?'
          : 'Besoin de ce produit pour votre établissement ?'}
      </h2>
      <p className="mt-2 text-[12px] leading-5 text-[#6B7280]">
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
            router.push('/devis');
          }}
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#1B5FA7] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1650A0]"
        >
          <ClipboardPlus className="h-4 w-4" aria-hidden />
          {isEnglish ? 'Request a Quote' : 'Demander un devis'}
        </button>
      </div>

      <Link
        href="/contact"
        className="mt-3 inline-flex items-center gap-2 text-[12px] font-semibold text-[#1B5FA7] transition-colors hover:text-[#0D3B73]"
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        {isEnglish ? 'Contact Prodet' : 'Contacter Prodet'}
      </Link>
    </section>
  );
}
