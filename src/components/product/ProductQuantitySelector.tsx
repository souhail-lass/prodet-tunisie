'use client';

import { useTranslations } from 'next-intl';

interface ProductQuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
}

export function ProductQuantitySelector({
  quantity,
  onChange,
  min = 1,
}: ProductQuantitySelectorProps) {
  const t = useTranslations('common.quantity');
  return (
    <div className="inline-flex h-10 items-center overflow-hidden rounded-full border border-[#D1D5DB] bg-white">
      <button
        type="button"
        aria-label={t('decrease')}
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        className="flex h-10 w-10 items-center justify-center text-[18px] font-semibold text-[#1B5FA7] transition-colors hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:text-[#D1D5DB]"
      >
        −
      </button>
      <span className="min-w-10 border-x border-[#E5E7EB] px-3 text-center text-[13px] font-semibold text-[#1C2B3A]">
        {quantity}
      </span>
      <button
        type="button"
        aria-label={t('increase')}
        onClick={() => onChange(quantity + 1)}
        className="flex h-10 w-10 items-center justify-center text-[18px] font-semibold text-[#1B5FA7] transition-colors hover:bg-[#EFF6FF]"
      >
        +
      </button>
    </div>
  );
}
