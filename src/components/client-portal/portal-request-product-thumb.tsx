'use client';

import Image from 'next/image';
import { Package } from 'lucide-react';
import { getProductBySlug } from '@/data/queries';
import { cn } from '@/lib/utils';

export function PortalRequestProductThumb({
  slug,
  name,
  size = 'md',
}: {
  slug: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const p = getProductBySlug(slug);
  const src = p?.image;

  const fixed =
    size === 'lg' ? '' : size === 'sm' ? 'h-11 w-11' : 'h-14 w-14';

  if (src) {
    return (
      <div
        className={cn(
          'relative shrink-0 overflow-hidden rounded-md border border-border bg-white',
          size === 'lg' ? 'h-[140px] w-full' : fixed,
        )}
      >
        <Image
          src={src}
          alt=""
          fill
          className="object-contain p-2"
          sizes={size === 'lg' ? '(min-width:768px) 240px, 50vw' : '56px'}
        />
      </div>
    );
  }

  const label = name
    .normalize('NFKD')
    .replace(/\p{Mark}+/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, '')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        'flex shrink-0 flex-col items-center justify-center rounded-md border border-dashed border-border bg-prodet-wash text-muted-foreground',
        size === 'lg' ? 'h-[140px] w-full' : fixed,
      )}
    >
      {label.length > 0 ? (
        <span className={cn('font-display font-bold', size === 'lg' ? 'text-lg' : 'text-[10px]')}>
          {label}
        </span>
      ) : (
        <Package className={size === 'lg' ? 'h-10 w-10' : 'h-5 w-5'} aria-hidden />
      )}
    </div>
  );
}
