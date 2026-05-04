import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/routing';
import type { Product } from '@/data/types';
import { localizedProductName } from '@/data/queries';
import { cn } from '@/lib/utils';

interface ProductVisualProps {
  product: Product;
  locale: Locale;
  className?: string;
  priority?: boolean;
}

export function ProductVisual({ product, locale, className, priority }: ProductVisualProps) {
  const t = useTranslations('common.labels');
  const name = localizedProductName(product, locale);

  return (
    <div className={cn('relative overflow-hidden rounded-[1.35rem] border border-border bg-white', className)}>
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.98)_0%,rgba(246,249,252,0.96)_56%,rgba(228,239,248,0.94)_100%)]" />
      {product.imageUrl ? (
        <>
          <Image src={product.imageUrl} alt={name} fill priority={priority} className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent_0%,rgba(11,35,63,0.82)_100%)] p-5">
            <p className="product-code text-white">{product.code}</p>
            <p className="mt-2 text-sm text-white/84">{product.conditionnement}</p>
          </div>
        </>
      ) : (
        <>
          <div className="absolute inset-x-0 bottom-0 h-[46%] bg-primary" />
          <div className="absolute bottom-0 end-0 h-[58%] w-[30%] bg-[var(--color-primary-strong)] [clip-path:polygon(42%_0,100%_0,100%_100%,0_100%)]" />
          <div className="absolute start-4 top-4 rounded-full border border-border/70 bg-white/96 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.18em] uppercase text-primary">
            {t('manufactured')}
          </div>
          <div className="absolute inset-x-5 bottom-5">
            <p className="product-code text-white">{product.code}</p>
            <h3 className="font-display mt-2 text-[1.22rem] leading-tight font-semibold text-white">
              {name}
            </h3>
            <p className="mt-2 text-sm text-white/82">{product.conditionnement}</p>
          </div>
        </>
      )}
    </div>
  );
}
