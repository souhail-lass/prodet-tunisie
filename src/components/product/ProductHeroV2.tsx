'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { FileText, Info, Settings, SlidersHorizontal } from 'lucide-react';
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
  sectorLabels: readonly string[];
}

export function ProductHeroV2({
  product,
  locale,
  useCaseLabel,
  sectorLabels,
}: ProductHeroV2Props) {
  const galleryImages = useMemo(() => buildGalleryImages(product), [product]);
  const primaryImage = galleryImages[0]!;
  const [activeImage, setActiveImage] = useState<ProductGalleryImage>(primaryImage);
  const isEnglish = locale === 'en';
  const technicalSheetLabel = product.technicalSheetUrl
    ? isEnglish
      ? 'Available'
      : 'Disponible'
    : isEnglish
      ? 'Available on request'
      : 'Disponible sur demande';

  useEffect(() => {
    setActiveImage(primaryImage);
  }, [primaryImage]);

  return (
    <section className="grid gap-7 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)]">
      <div>
        <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-lg border border-[var(--color-border)] bg-white shadow-card sm:min-h-[420px] md:min-h-[560px] lg:min-h-[600px]">
          <Image
            src={activeImage.src}
            alt={activeImage.alt}
            fill
            priority
            sizes="(min-width: 1024px) 46vw, 100vw"
            className={cn(
              'object-contain p-3 drop-shadow-sm md:p-4',
              activeImage.kind === 'context' ? 'rounded-xl' : '',
            )}
          />
        </div>

        <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
          {galleryImages.map((image) => {
            const isActive = image.src === activeImage.src;

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

        <div className="mt-7 overflow-hidden rounded-[6px]">
          <ProductAccordion
            title={isEnglish ? 'How To Use' : 'Mode d’utilisation'}
            icon={Info}
            defaultOpen={false}
          >
            <p className="text-[13px] leading-6 text-[var(--color-text-secondary)]">
              {product.howToUse ?? (isEnglish ? 'Information to be completed.' : 'Information à compléter.')}
            </p>
          </ProductAccordion>
          <ProductAccordion
            title={isEnglish ? 'Specifications' : 'Spécifications'}
            icon={Settings}
            defaultOpen={false}
          >
            {product.specs?.length ? (
              <ul className="list-disc space-y-1 pl-5 text-[13px] leading-6 text-[var(--color-text-primary)]">
                {product.specs.map((spec) => (
                  <li key={spec.label}>
                    <strong>{spec.label}:</strong> {spec.value}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] leading-6 text-[var(--color-text-secondary)]">
                {isEnglish ? 'Information to be completed.' : 'Information à compléter.'}
              </p>
            )}
          </ProductAccordion>
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
                {product.dosage ?? (isEnglish ? 'Information to be completed.' : 'Information à compléter.')}
              </p>
            )}
          </ProductAccordion>
          <ProductAccordion
            title={isEnglish ? 'Technical Sheet' : 'Fiche technique'}
            icon={FileText}
            defaultOpen={false}
          >
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
          </ProductAccordion>
        </div>

        <div className="mt-6">
          <ProductQuoteBox product={product} locale={locale} />
        </div>

        <ProductMetadataTable
          product={product}
          isEnglish={isEnglish}
          useCaseLabel={useCaseLabel}
          sectorLabels={sectorLabels}
          technicalSheetLabel={technicalSheetLabel}
        />
      </div>
    </section>
  );
}

function ProductMetadataTable({
  product,
  isEnglish,
  useCaseLabel,
  sectorLabels,
  technicalSheetLabel,
}: {
  product: Product;
  isEnglish: boolean;
  useCaseLabel: string;
  sectorLabels: readonly string[];
  technicalSheetLabel: string;
}) {
  const rows = [
    {
      label: isEnglish ? 'Category' : 'Catégorie',
      value: useCaseLabel,
    },
    {
      label: isEnglish ? 'Packaging' : 'Conditionnement',
      value: product.formats.map((format) => format.label).join(', '),
    },
    {
      label: isEnglish ? 'Usage' : 'Usage',
      value: sectorLabels.length > 0 ? sectorLabels.join(', ') : isEnglish ? 'Professional' : 'Professionnel',
    },
    {
      label: isEnglish ? 'Product type' : 'Type de produit',
      value:
        product.category === 'manufactured'
          ? isEnglish
            ? 'Manufactured by Prodet'
            : 'Produit fabriqué par Prodet'
          : isEnglish
            ? 'Commercialized article'
            : 'Article commercialisé',
    },
    {
      label: isEnglish ? 'Technical sheet' : 'Fiche technique',
      value: technicalSheetLabel,
    },
  ].filter((row) => row.value);

  return (
    <dl className="mt-6 border-t border-[var(--color-border)] text-[var(--type-small)]">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[170px_minmax(0,1fr)] border-b border-[var(--color-border)] py-2">
          <dt className="font-medium text-[var(--color-text-tertiary)]">{row.label}:</dt>
          <dd className="text-[var(--color-text-secondary)]">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

type ProductGalleryImage = {
  src: string;
  alt: string;
  kind: 'packshot' | 'context';
};

function buildGalleryImages(product: Product): ProductGalleryImage[] {
  const packshotSources = Array.from(new Set([product.image, ...(product.galleryImages ?? [])]));
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
