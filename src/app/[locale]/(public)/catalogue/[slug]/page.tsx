import type { ReactNode } from 'react';
import {
  Calculator,
  FileDown,
  FlaskConical,
  MapPinned,
  ShieldCheck,
} from 'lucide-react';
import type { Metadata } from 'next';
import { Sora } from 'next/font/google';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { companyInfo } from '@/data/company';
import {
  getLegacyProductForPublicOffer,
  getPublicOfferBySlug,
  getPublicOfferSectionById,
  getRelatedPublicOffers,
  publicOfferReferenceImage,
  type PublicOffer,
  type PublicOfferSectionId,
} from '@/data/public-offers';
import {
  getProductBySlug,
  getSectorById,
  getUseCaseById,
} from '@/data/queries';
import { products } from '@/data/products';
import type { Product } from '@/data/types';
import { siteContent } from '@/data/site-content';
import { Link, isLocale, type Locale } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/catalogue/ProductCard';
import { ProductHeroV2 } from '@/components/product/ProductHeroV2';

const productDisplay = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-product-display',
  display: 'swap',
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const publicOffer = getPublicOfferBySlug(slug);
  if (publicOffer) {
    const section = getPublicOfferSectionById(publicOffer.sectionId);
    return {
      title: publicOffer.name,
      description: buildOfferDescription(publicOffer, section?.label),
    };
  }

  const product = getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.tagline,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  const publicOffer = getPublicOfferBySlug(slug);
  if (publicOffer) {
    return <PublicOfferDetailPage offer={publicOffer} />;
  }

  const product = getProductBySlug(slug);
  if (!product) notFound();

  return <LegacyProductDetailPage product={product} locale={locale} />;
}

function PublicOfferDetailPage({ offer }: { offer: PublicOffer }) {
  const section = getPublicOfferSectionById(offer.sectionId);
  const legacyProduct = getLegacyProductForPublicOffer(offer);
  const relatedOffers = getRelatedPublicOffers(offer, 4);
  const homologationDocument = companyInfo.documents.find((document) => document.id === 'homologation-ma');
  const primaryVariant = offer.variants[0];
  const detailDescription = legacyProduct?.description ?? buildOfferDescription(offer, section?.label);
  const dosage = legacyProduct?.dosage ?? primaryVariant?.dosage ?? 'Dosage communique selon le produit et le contexte d usage.';
  const usageSteps = buildOfferUsageSteps(offer, legacyProduct);
  const whereToUse = buildOfferWhereToUse(offer.sectionId);
  const specifications = buildOfferSpecifications(offer, legacyProduct, section?.label);
  const usageCalculation = buildOfferUsageCalculation(offer, dosage);

  return (
    <div className="section-shell py-12">
      <nav className="text-sm text-muted-foreground">
        <Link href="/catalogue" className="hover:text-primary">
          Catalogue
        </Link>
        <span className="mx-2">›</span>
        <span>{section?.label ?? 'Offre Prodet'}</span>
        <span className="mx-2">›</span>
        <span className="text-prodet-text">{offer.name}</span>
      </nav>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] xl:items-start">
        <div className="surface-panel overflow-hidden p-5 sm:p-6">
          <div className="product-display-stage relative overflow-hidden rounded-[28px]">
            <div className="relative aspect-[4/5]">
              <Image
                src={publicOfferReferenceImage}
                alt={offer.name}
                fill
                priority
                sizes="(min-width: 1280px) 42vw, 100vw"
                className="object-contain p-6"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {offer.variants.map((variant, index) => (
              <span
                key={`${offer.id}-format-${index}`}
                className="rounded-full border border-border bg-white px-3 py-2 text-xs font-medium text-prodet-text"
              >
                {variant.unit ?? 'Format pro'}
              </span>
            ))}
          </div>
        </div>

        <div className="surface-panel p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              {section?.anchorTitle ?? 'Offre Prodet'}
            </span>
            <span className="rounded-full border border-border bg-white px-3 py-1 text-[11px] font-medium text-muted-foreground">
              {offer.sectionKind === 'commercialized' ? 'Article commercialise' : 'Offre professionnelle'}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold text-prodet-text sm:text-[2.2rem]">{offer.name}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">{detailDescription}</p>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="rounded-[24px] border border-border bg-white p-5">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-primary/72">
                Description
              </p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {legacyProduct?.howToUse ?? offer.usageSummary}
              </p>
            </div>

            <div className="rounded-[24px] border border-border bg-white p-5">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-primary/72">
                Dosage
              </p>
              <p className="mt-3 text-sm leading-7 text-prodet-text">{dosage}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {homologationDocument ? (
              <a
                href={homologationDocument.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-[22px] border border-border bg-white px-4 py-3 transition-colors hover:border-primary/35 hover:text-primary"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF7EF] text-support">
                  <ShieldCheck className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-primary/72">
                    Document disponible
                  </span>
                  <span className="mt-1 block text-sm font-medium text-prodet-text">
                    {homologationDocument.label}
                  </span>
                </span>
              </a>
            ) : null}

            {legacyProduct?.biodegradability ? (
              <span className="inline-flex items-center rounded-full bg-[#EAF7EF] px-3 py-2 text-xs font-semibold text-support">
                Biodégradabilité {legacyProduct.biodegradability}
              </span>
            ) : null}
            {(legacyProduct?.certifications ?? []).map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-full bg-[#EAF7EF] px-3 py-2 text-xs font-semibold text-support"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button asChild className="h-12 rounded-[18px] text-sm font-semibold">
              <Link href="/devis">Demander un devis</Link>
            </Button>

            {legacyProduct?.technicalSheetUrl ? (
              <Button asChild variant="outline" className="h-12 rounded-[18px] text-sm font-semibold">
                <a href={legacyProduct.technicalSheetUrl} download>
                  <FileDown className="h-4 w-4" aria-hidden />
                  Télécharger la fiche technique
                </a>
              </Button>
            ) : (
              <Button asChild variant="outline" className="h-12 rounded-[18px] text-sm font-semibold">
                <Link href="/devis">{siteContent.product.technicalSheetFallback}</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          icon={<FlaskConical className="h-5 w-5" aria-hidden />}
          title="Comment l utiliser"
        >
          <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
            {usageSteps.map((item) => (
              <li key={item} className="rounded-[18px] bg-[#F4F6F8] px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </InfoCard>

        <InfoCard icon={<MapPinned className="h-5 w-5" aria-hidden />} title="Ou l utiliser">
          <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
            {whereToUse.map((item) => (
              <li key={item} className="rounded-[18px] bg-[#F4F6F8] px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </InfoCard>

        <InfoCard icon={<ShieldCheck className="h-5 w-5" aria-hidden />} title="Specifications">
          <dl className="space-y-4 text-sm">
            {specifications.map((item) => (
              <div key={item.label} className="rounded-[18px] bg-[#F4F6F8] px-4 py-3">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/72">
                  {item.label}
                </dt>
                <dd className="mt-2 leading-6 text-prodet-text">{item.value}</dd>
              </div>
            ))}
          </dl>
        </InfoCard>

        <InfoCard icon={<Calculator className="h-5 w-5" aria-hidden />} title="Calcul d usage">
          <div className="space-y-3 text-sm leading-7 text-muted-foreground">
            <div className="rounded-[18px] bg-[#F4F6F8] px-4 py-3">{usageCalculation[0]}</div>
            <div className="rounded-[18px] bg-[#F4F6F8] px-4 py-3">{usageCalculation[1]}</div>
            <div className="rounded-[18px] bg-[#F4F6F8] px-4 py-3">{usageCalculation[2]}</div>
          </div>
        </InfoCard>
      </section>

      {relatedOffers.length > 0 ? (
        <section className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/72">
                Meme service
              </p>
              <h2 className="mt-3 text-2xl font-bold text-prodet-text">Autres références proches</h2>
            </div>
            <Button asChild variant="outline" className="rounded-full px-5">
              <Link href={`/catalogue?section=${offer.sectionId}`}>Voir la section</Link>
            </Button>
          </div>

          <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {relatedOffers.map((relatedOffer) => (
              <li key={relatedOffer.id}>
                <Link
                  href={`/catalogue/${relatedOffer.slug}`}
                  className="surface-panel block h-full rounded-[24px] p-5 transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-[2px] hover:border-primary/28 hover:shadow-card-hover"
                >
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary/68">
                    {section?.label}
                  </p>
                  <h3 className="mt-3 text-base font-semibold text-prodet-text">{relatedOffer.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {relatedOffer.shortDescription}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function LegacyProductDetailPage({ product, locale }: { product: Product; locale: Locale }) {
  const primaryUseCaseId = product.useCases[0];
  const primaryUseCase = primaryUseCaseId ? getUseCaseById(primaryUseCaseId) : undefined;
  const sectorLabels = product.sectors
    .map((sectorId) => getSectorById(sectorId))
    .filter((sector): sector is NonNullable<typeof sector> => Boolean(sector))
    .map((sector) => sector.label);
  const relatedProducts = getSimilarProducts(product);

  return (
    <div className={`${productDisplay.variable} bg-[#FFFFFF] py-6 md:py-8 [font-family:var(--font-product-display)]`}>
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <ProductHeroV2
          product={product}
          locale={locale}
          useCaseLabel={primaryUseCase?.label ?? 'Catalogue'}
          sectorLabels={sectorLabels}
        />

        {relatedProducts.length > 0 ? (
          <section className="pt-10">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#1B5FA7]" aria-hidden />
              <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[#1C2B3A]">
                Produits similaires
              </h2>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function getSimilarProducts(product: Product): readonly Product[] {
  if (product.relatedProductIds?.length) {
    return product.relatedProductIds
      .map((id) => products.find((candidate) => candidate.id === id))
      .filter((candidate): candidate is Product => Boolean(candidate))
      .slice(0, 3);
  }

  const primaryUseCaseId = product.useCases[0];
  if (!primaryUseCaseId) return [];

  return products
    .filter(
      (candidate) =>
        candidate.id !== product.id && candidate.useCases.includes(primaryUseCaseId),
    )
    .slice(0, 3);
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="surface-panel h-full p-5 sm:p-6">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF2FA] text-primary">
        {icon}
      </div>
      <h2 className="mt-4 text-xl font-semibold text-prodet-text">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function buildOfferDescription(offer: PublicOffer, sectionLabel?: string): string {
  const unit = offer.variants[0]?.unit ? ` en ${offer.variants[0]?.unit}` : '';
  return `${offer.name} est une référence présentée dans la section ${sectionLabel ?? 'offres professionnelles'} de Prodet. Cette offre est orientée vers ${offer.usageSummary.toLowerCase()}${unit} et sert à cadrer rapidement une demande de devis B2B adaptée au site, au rythme d usage et au conditionnement recherché.`;
}

function buildOfferUsageSteps(offer: PublicOffer, legacyProduct?: Product): string[] {
  if (legacyProduct?.howToUse) {
    return splitTextIntoSteps(legacyProduct.howToUse);
  }

  const dosage = offer.variants[0]?.dosage;
  return [
    `Identifier le support ou la zone concernee par ${offer.usageSummary.toLowerCase()}.`,
    dosage
      ? `Respecter le dosage indicatif suivant: ${dosage}.`
      : 'Valider le dosage avec Prodet selon le contexte d usage.',
    'Finaliser l application selon le protocole hygiene ou nettoyage du site.',
  ];
}

function buildOfferWhereToUse(sectionId: PublicOfferSectionId): string[] {
  switch (sectionId) {
    case 'restauration-cuisine':
      return [
        'Cuisines professionnelles',
        'Zones de plonge et de preparation',
        'Restaurants, cafes et collectivites',
      ];
    case 'buanderie':
      return [
        'Buanderies d hotel',
        'Blanchisseries et linge professionnel',
        'Institutions et prestataires textiles',
      ];
    case 'etage-housekeeping':
      return [
        'Chambres et sanitaires',
        'Couloirs, parties communes et accueils',
        'Bureaux, residences et services d entretien',
      ];
    case 'articles-menagers':
      return [
        'Chariots et postes de nettoyage',
        'Points de consommation hygiene',
        'Revente et besoins complementaires de site',
      ];
  }
}

function buildOfferSpecifications(
  offer: PublicOffer,
  legacyProduct: Product | undefined,
  sectionLabel: string | undefined,
): Array<{ label: string; value: string }> {
  if (legacyProduct?.specs?.length) {
    return legacyProduct.specs.slice(0, 4);
  }

  return [
    { label: 'Service', value: sectionLabel ?? offer.sectionLabel },
    { label: 'Conditionnement', value: offer.variants[0]?.unit ?? 'Format professionnel' },
    {
      label: 'Dosage',
      value: offer.variants[0]?.dosage || 'Communique selon le contexte d utilisation',
    },
    {
      label: 'Statut',
      value: offer.sectionKind === 'commercialized' ? 'Article commercialise' : 'Offre professionnelle',
    },
  ];
}

function buildOfferUsageCalculation(offer: PublicOffer, dosage: string): [string, string, string] {
  return [
    `Conditionnement de base: ${offer.variants[0]?.unit ?? 'format professionnel'}.`,
    `Dosage indicatif: ${dosage}.`,
    'Le calcul de consommation precise depend du support, de la machine ou de la charge traitee. Prodet le confirme sur devis ou fiche technique.',
  ];
}

function splitTextIntoSteps(value: string): string[] {
  const parts = value
    .split(/(?<=[.!?])\s+/u)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 3) return parts.slice(0, 3);
  if (parts.length === 2) return [...parts, 'Confirmer le protocole final avec Prodet si besoin.'];
  if (parts.length === 1) {
    const firstPart = parts[0] ?? 'Valider l utilisation du produit selon votre protocole.';
    return [
      firstPart,
      'Respecter le dosage et le protocole interne du site.',
      'Demander la fiche technique pour cadrer l usage exact.',
    ];
  }

  return [
    'Valider le protocole d application selon le produit.',
    'Respecter le dosage recommande.',
    'Confirmer les conditions d utilisation avec Prodet en cas de doute.',
  ];
}
