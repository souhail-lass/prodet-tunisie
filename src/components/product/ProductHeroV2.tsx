'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Clock, Factory, FileText, Info, ShieldCheck, SlidersHorizontal, Truck } from 'lucide-react';
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
  const primaryImage = galleryImages[0];
  const [activeImage, setActiveImage] = useState<ProductGalleryImage | undefined>(primaryImage);
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

        {product.specs && product.specs.length > 0 ? (
          <div className="mt-7">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
              {isEnglish ? 'Specifications' : 'Spécifications'}
            </h2>
            <dl className="mt-3 overflow-hidden rounded-lg border border-[var(--color-border)]">
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
          </div>
        ) : null}

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

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border border-[var(--color-border)] bg-white p-4">
          {[
            { icon: Factory, title: isEnglish ? 'Made in Tunisia' : 'Fabriqué en Tunisie', accent: true },
            { icon: Truck, title: isEnglish ? 'Regular delivery' : 'Livraison régulière' },
            { icon: ShieldCheck, title: isEnglish ? 'Dosage advice' : 'Conseil sur le dosage' },
            { icon: Clock, title: isEnglish ? 'Reply within 24h' : 'Réponse sous 24h ouvrées' },
          ].map(({ icon: TrustIcon, title, accent }) => (
            <div key={title} className="flex items-center gap-2.5">
              <TrustIcon
                className={cn('h-4 w-4 shrink-0', accent ? 'text-prodet-green' : 'text-prodet-blue')}
                aria-hidden
              />
              <span className="text-[12px] font-medium text-[var(--color-text-primary)]">{title}</span>
            </div>
          ))}
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
