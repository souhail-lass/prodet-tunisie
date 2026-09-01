'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ClipboardList, FileText, Info, SlidersHorizontal } from 'lucide-react';
import type { Locale } from '@/i18n/routing';
import type { Product } from '@/data/types';
import { cn } from '@/lib/utils';
import { ProductAccordion } from './ProductAccordion';
import { ProductBreadcrumb } from './ProductBreadcrumb';
import { ProductQuoteBox } from './ProductQuoteBox';

interface ProductHeroV2Props {
  product: Product;
  locale: Locale;
  useCaseLabel: string;
}

export function ProductHeroV2({ product, locale, useCaseLabel }: ProductHeroV2Props) {
  const galleryImages = useMemo(() => buildGalleryImages(product), [product]);
  const primaryImage = galleryImages[0];
  const [activeImage, setActiveImage] = useState<ProductGalleryImage | undefined>(primaryImage);
  const isEnglish = locale === 'en';
  const hasDilution = Boolean(product.dilutionRates?.length || product.dosage);

  useEffect(() => {
    setActiveImage(primaryImage);
  }, [primaryImage]);

  return (
    <section className="grid gap-7 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)]">
      <div>
        <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-lg border border-[var(--color-border)] bg-white shadow-card sm:min-h-[420px] md:min-h-[560px] lg:min-h-[600px]">
          {activeImage ? (
            <Image
              src={activeImage.src}
              alt={activeImage.alt}
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 100vw"
              className={cn(
                'object-contain p-3 md:p-4',
                activeImage.kind === 'context' ? 'rounded-xl' : 'mix-blend-multiply',
              )}
            />
          ) : (
            <span className="flex items-center justify-center" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo/prodet-logo.svg"
                alt=""
                className="w-1/3 max-w-[180px] opacity-25 grayscale"
              />
            </span>
          )}
        </div>

        {galleryImages.length > 1 ? (
          <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
            {galleryImages.map((image) => {
              const isActive = image.src === activeImage?.src;

              return (
              <button
                type="button"
                key={image.src}
                aria-label={image.alt}
                onClick={() => setActiveImage(image)}
                className={cn(
                  'relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white transition-colors md:h-20 md:w-20',
                  isActive
                    ? 'border-prodet-green ring-2 ring-prodet-green/10'
                    : 'border-[var(--color-border)] hover:border-prodet-blue',
                )}
              >
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="80px"
                  className={cn(
                    'h-full w-full',
                    image.kind === 'packshot' ? 'object-contain p-1.5' : 'object-cover',
                  )}
                />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="pb-8 lg:pt-3">
        <ProductBreadcrumb locale={locale} productName={product.name} />

        <div className="mt-9">
          <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.02em] text-[var(--color-text-primary)] md:text-[34px]">
            {product.name}
          </h1>
          <p className="mt-2 text-[var(--type-small)] font-medium leading-5 text-[var(--color-text-tertiary)]">{product.tagline}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-[var(--type-small)] font-semibold text-[var(--color-text-secondary)]">
            {product.category === 'manufactured'
              ? isEnglish
                ? 'Manufactured by Prodet.'
                : 'Produit fabriqué par Prodet.'
              : isEnglish
                ? 'Selected commercial product.'
                : 'Article commercialisé.'}
          </span>
          <span className="text-[var(--type-small)] font-semibold text-prodet-green">{useCaseLabel}</span>
        </div>

        <div className="mt-5 space-y-4 text-[13px] leading-[1.55] text-[var(--color-text-secondary)]">
          {splitDescription(product.description).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {/* Only surface a panel we can actually fill. A dilution rate on a bin
            bag — or an empty "information à compléter" — reads as neglect, so
            consumables and equipment simply show fewer panels. */}
        <div className="mt-7 overflow-hidden rounded-[6px]">
          {product.specs && product.specs.length > 0 ? (
            <ProductAccordion
              title={isEnglish ? 'Specifications' : 'Spécifications'}
              icon={ClipboardList}
              defaultOpen={false}
            >
              <dl className="overflow-hidden rounded-lg border border-[var(--color-border)]">
                {product.specs.map((spec, index) => (
                  <div
                    key={spec.label}
                    className={cn(
                      'grid grid-cols-[42%_minmax(0,1fr)] gap-3 px-4 py-2.5 text-[13px]',
                      index % 2 === 1 ? 'bg-white' : 'bg-[var(--color-surface-sunken)]',
                    )}
                  >
                    <dt className="font-medium text-[var(--color-text-secondary)]">{spec.label}</dt>
                    <dd className="font-semibold text-[var(--color-text-primary)]">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </ProductAccordion>
          ) : null}
          {product.howToUse ? (
            <ProductAccordion
              title={isEnglish ? 'How To Use' : 'Mode d’utilisation'}
              icon={Info}
              defaultOpen={false}
            >
              <p className="text-[13px] leading-6 text-[var(--color-text-secondary)]">
                {product.howToUse}
              </p>
            </ProductAccordion>
          ) : null}
          {hasDilution ? (
            <ProductAccordion
              title={isEnglish ? 'Dilution Rates' : 'Taux de dilution'}
              icon={SlidersHorizontal}
              defaultOpen={false}
            >
              {product.dilutionRates?.length ? (
                <ul className="list-disc space-y-1 pl-5 text-[13px] leading-6 text-[var(--color-text-primary)]">
                  {product.dilutionRates.map((rate) => (
                    <li key={rate.label}>
                      <strong>{rate.label}:</strong> {rate.rate}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] leading-6 text-[var(--color-text-secondary)]">
                  {product.dosage}
                </p>
              )}
            </ProductAccordion>
          ) : null}
          <ProductAccordion
            title={isEnglish ? 'Documentation' : 'Documentation'}
            icon={FileText}
            defaultOpen={false}
          >
            <div className="flex flex-col gap-2">
              {product.technicalSheetUrl ? (
                <a
                  href={product.technicalSheetUrl}
                  download
                  className="text-[13px] font-semibold text-prodet-green underline-offset-4 hover:underline"
                >
                  {isEnglish ? 'Download technical sheet' : 'Télécharger la fiche technique'}
                </a>
              ) : (
                <p className="text-[13px] leading-6 text-[var(--color-text-secondary)]">
                  {isEnglish
                    ? 'Technical sheet available on request.'
                    : 'Fiche technique disponible sur demande.'}
                </p>
              )}
              {product.safetySheetUrl ? (
                <a
                  href={product.safetySheetUrl}
                  download
                  className="text-[13px] font-semibold text-prodet-green underline-offset-4 hover:underline"
                >
                  {isEnglish
                    ? 'Download safety data sheet (SDS)'
                    : 'Télécharger la fiche de données de sécurité (FDS)'}
                </a>
              ) : (
                <p className="text-[13px] leading-6 text-[var(--color-text-secondary)]">
                  {isEnglish
                    ? 'Safety data sheet available on request.'
                    : 'Fiche de données de sécurité disponible sur demande.'}
                </p>
              )}
            </div>
          </ProductAccordion>
        </div>

        <div className="mt-6">
          <ProductQuoteBox product={product} locale={locale} />
        </div>

      </div>
    </section>
  );
}

type ProductGalleryImage = {
  src: string;
  alt: string;
  kind: 'packshot' | 'context';
};

function buildGalleryImages(product: Product): ProductGalleryImage[] {
  const packshotSources = Array.from(
    new Set([product.image, ...(product.galleryImages ?? [])]),
  ).filter(Boolean);
  const packshots = packshotSources.map((src, index) => ({
    src,
    alt: index === 0 ? `${product.name} - image produit` : `${product.name} - image ${index + 1}`,
    kind: 'packshot' as const,
  }));

  const contextImages =
    product.contextImages?.slice(0, 2).map((image) => ({
      src: image.src,
      alt: image.alt,
      kind: 'context' as const,
    })) ?? [];

  return [...packshots, ...contextImages];
}

function splitDescription(description: string): string[] {
  const paragraphs = description
    .split('\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length > 0) return paragraphs;
  return ['Information à compléter.'];
}
