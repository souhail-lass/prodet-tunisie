'use client';

import Image from 'next/image';
import { Link } from '@/i18n/routing';
import type { PublicOffer } from '@/data/public-offers';
import { publicOfferReferenceImage } from '@/data/public-offers';
import { cn } from '@/lib/utils';

interface OfferCardProps {
  offer: PublicOffer;
  compact?: boolean;
}

export function OfferCard({ offer, compact = false }: OfferCardProps) {
  return (
    <article
      className={cn(
        'group relative h-full overflow-hidden rounded-[26px] border border-border/80 bg-white/94 transition-[transform,box-shadow,border-color,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] hover:border-primary/22 hover:bg-white hover:shadow-[0_24px_44px_-34px_rgba(11,61,115,0.2)]',
        compact ? 'rounded-[22px]' : 'rounded-[26px]',
      )}
    >
      <Link
        href={`/catalogue/${offer.slug}`}
        aria-label={`Ouvrir ${offer.name}`}
        className="absolute inset-0 z-0"
      />
      <div className={cn('pointer-events-none relative z-10 p-3', compact ? 'space-y-3' : 'space-y-4')}>
        <div
          className={cn(
            'product-display-stage relative overflow-hidden rounded-[22px]',
            compact ? 'h-[148px]' : 'h-[178px]',
          )}
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0.42)_38%,rgba(15,93,168,0.08)_100%)]"
          />
          <Image
            src={publicOfferReferenceImage}
            alt={`${offer.name} visuel illustratif`}
            fill
            loading="lazy"
            sizes={compact ? '(min-width: 1024px) 16rem, 100vw' : '(min-width: 1536px) 18rem, (min-width: 768px) 30vw, 100vw'}
            className="object-contain p-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          />
        </div>

        <div className="px-1 pb-2">
          <h3 className="text-[1rem] font-semibold leading-6 text-prodet-text transition-colors duration-300 group-hover:text-primary">
            {offer.name}
          </h3>
          <p
            className="mt-1.5 text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
            title={offer.usageSummary}
          >
            {offer.shortDescription}
          </p>
        </div>
      </div>
    </article>
  );
}
