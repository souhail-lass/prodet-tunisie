import type { ReactNode } from 'react';
import {
  Calculator,
  FileDown,
  FlaskConical,
  MapPinned,
  ShieldCheck,
} from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
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
import { getUseCaseById } from '@/data/queries';
import { classifyFamille, classifySousCategorie } from '@/data/familles';
import { getCatalogueProductBySlug, getVisibleCatalogue } from '@/features/catalogue/queries';
import { localizeUseCase } from '@/data/i18n/content';
import type { Product } from '@/data/types';
import type { CatalogueCardProduct } from '@/types/product';
import { siteContent } from '@/data/site-content';
import { Link, isLocale, type Locale } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/catalogue/product-grid';
import { ProductHeroV2 } from '@/components/product/ProductHeroV2';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';

// Static + ISR per slug: each product page is cached after first render and
// regenerated in the background; admin edits revalidate the 'catalogue' tag.
export const revalidate = 300;

export async function generateStaticParams() {
  // Prebuild the visible catalogue slugs (per locale, Next crosses them with
  // the parent locale params). If the DB is unreachable at build time the
  // pages simply render on demand and get cached then.
  try {
    const products = await getVisibleCatalogue();
    return products.map((product) => ({ slug: product.slug }));
  } catch {
    return [];
  }
}

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

  const product = await getCatalogueProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.tagline || undefined,
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
    return <PublicOfferDetailPage offer={publicOffer} locale={locale} />;
  }

  const product = await getCatalogueProductBySlug(slug);
  if (!product) notFound();

  // Related = same famille, with same sous-catégorie surfaced first. Live DB
  // products carry no useCases, so the family/gamme is derived from the name.
  const famille = classifyFamille(product.name, product.categoryLabel);
  const sousCat = classifySousCategorie(famille, product.name);
  const related = (await getVisibleCatalogue())
    .filter((p) => p.slug !== product.slug && classifyFamille(p.name, p.categoryLabel) === famille)
    .sort(
      (a, b) =>
        Number(classifySousCategorie(famille, b.name) === sousCat) -
        Number(classifySousCategorie(famille, a.name) === sousCat),
    )
    .slice(0, 4);
  const t = await getTranslations({ locale, namespace: 'catalogue' });

  return (
    <>
      <JsonLd
        data={productSchema({
          name: product.name,
          description: product.tagline || product.description,
          slug: product.slug,
          image: product.image,
          category: product.categoryLabel,
          manufactured: product.category === 'manufactured',
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Accueil', path: `/${locale}` },
          { name: 'Catalogue', path: `/${locale}/catalogue` },
          { name: product.name, path: `/${locale}/catalogue/${product.slug}` },
        ])}
      />
      <LegacyProductDetailPage
        product={product}
        locale={locale}
        related={related}
        madeLabel={t('page.manufacturedBadge')}
      />
    </>
  );
}

async function PublicOfferDetailPage({ offer, locale }: { offer: PublicOffer; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'catalogue' });
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
      <JsonLd
        data={productSchema({
          name: offer.name,
          description: detailDescription,
          slug: offer.slug,
          image: publicOfferReferenceImage,
          category: section?.label,
          manufactured: offer.sectionKind !== 'commercialized',
        })}
      />
      <nav className="text-[var(--type-small)] text-[var(--color-text-tertiary)]">
        <Link href="/catalogue" className="text-[var(--color-text-secondary)] hover:text-prodet-blue">
          Catalogue
        </Link>
        <span className="mx-2">›</span>
        <span>{section?.label ?? 'Offre Prodet'}</span>
        <span className="mx-2">›</span>
        <span className="text-[var(--color-text-primary)]">{offer.name}</span>
      </nav>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] xl:items-start">
        <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-card sm:p-6">
          <div className="relative overflow-hidden rounded-lg bg-white">
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
                className="rounded-full border border-[var(--color-border)] bg-white px-3 py-2 text-[var(--type-xs)] font-medium text-[var(--color-text-primary)]"
              >
                {variant.unit ?? 'Format pro'}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-card sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-prodet-blue">
              {section?.anchorTitle ?? 'Offre Prodet'}
            </span>
            <span className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-[11px] font-medium text-[var(--color-text-tertiary)]">
              {offer.sectionKind === 'commercialized' ? 'Article commercialise' : 'Offre professionnelle'}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold text-[var(--color-text-primary)] sm:text-[2.2rem]">{offer.name}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-text-secondary)]">{detailDescription}</p>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-5">
              <p className="text-[var(--type-2xs)] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                Description
              </p>
              <p className="mt-3 text-[var(--type-small)] leading-7 text-[var(--color-text-secondary)]">
                {legacyProduct?.howToUse ?? offer.usageSummary}
              </p>
            </div>

            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-5">
              <p className="text-[var(--type-2xs)] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                Dosage
              </p>
              <p className="mt-3 text-[var(--type-small)] leading-7 text-[var(--color-text-primary)]">{dosage}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {homologationDocument ? (
              <a
                href={homologationDocument.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 transition-colors hover:border-prodet-blue-tint-strong hover:text-prodet-blue"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-prodet-green-tint text-prodet-green">
                  <ShieldCheck className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-[var(--type-2xs)] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                    Document disponible
                  </span>
                  <span className="mt-1 block text-[var(--type-small)] font-medium text-[var(--color-text-primary)]">
                    {homologationDocument.label}
                  </span>
                </span>
              </a>
            ) : null}

            {legacyProduct?.biodegradability ? (
              <span className="inline-flex items-center rounded-full bg-prodet-green-tint px-3 py-2 text-[var(--type-xs)] font-semibold text-prodet-green">
                Biodégradabilité {legacyProduct.biodegradability}
              </span>
            ) : null}
            {(legacyProduct?.certifications ?? []).map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-full bg-prodet-green-tint px-3 py-2 text-[var(--type-xs)] font-semibold text-prodet-green"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button asChild className="h-12 text-sm font-semibold">
              <Link href="/devis">{t('detail.requestQuote')}</Link>
            </Button>

            {legacyProduct?.technicalSheetUrl ? (
              <Button asChild variant="outline" className="h-12 text-sm font-semibold">
                <a href={legacyProduct.technicalSheetUrl} download>
                  <FileDown className="h-4 w-4" aria-hidden />
                  {t('detail.downloadSheet')}
                </a>
              </Button>
            ) : (
              <Button asChild variant="outline" className="h-12 text-sm font-semibold">
                <Link href="/devis">{siteContent.product.technicalSheetFallback}</Link>
              </Button>
            )}

            {legacyProduct?.safetySheetUrl ? (
              <Button asChild variant="outline" className="h-12 text-sm font-semibold">
                <a href={legacyProduct.safetySheetUrl} download>
                  <FileDown className="h-4 w-4" aria-hidden />
                  {t('detail.downloadSafetySheet')}
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          icon={<FlaskConical className="h-5 w-5" aria-hidden />}
          title="Comment l utiliser"
        >
          <ul className="space-y-3 text-sm leading-7 text-[var(--color-text-secondary)]">
            {usageSteps.map((item) => (
              <li key={item} className="rounded-lg bg-[var(--color-surface-sunken)] px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </InfoCard>

        <InfoCard icon={<MapPinned className="h-5 w-5" aria-hidden />} title={t('detail.whereToUse')}>
          <ul className="space-y-3 text-sm leading-7 text-[var(--color-text-secondary)]">
            {whereToUse.map((item) => (
              <li key={item} className="rounded-lg bg-[var(--color-surface-sunken)] px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </InfoCard>

        <InfoCard icon={<ShieldCheck className="h-5 w-5" aria-hidden />} title="Specifications">
          <dl className="space-y-4 text-sm">
            {specifications.map((item) => (
              <div key={item.label} className="rounded-lg bg-[var(--color-surface-sunken)] px-4 py-3">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                  {item.label}
                </dt>
                <dd className="mt-2 leading-6 text-[var(--color-text-primary)]">{item.value}</dd>
              </div>
            ))}
          </dl>
        </InfoCard>

        <InfoCard icon={<Calculator className="h-5 w-5" aria-hidden />} title="Calcul d usage">
          <div className="space-y-3 text-sm leading-7 text-[var(--color-text-secondary)]">
            <div className="rounded-lg bg-[var(--color-surface-sunken)] px-4 py-3">{usageCalculation[0]}</div>
            <div className="rounded-lg bg-[var(--color-surface-sunken)] px-4 py-3">{usageCalculation[1]}</div>
            <div className="rounded-lg bg-[var(--color-surface-sunken)] px-4 py-3">{usageCalculation[2]}</div>
          </div>
        </InfoCard>
      </section>

      {relatedOffers.length > 0 ? (
        <section className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-tertiary)]">
                Meme service
              </p>
              <h2 className="mt-3 text-2xl font-bold text-[var(--color-text-primary)]">{t('detail.related')}</h2>
            </div>
            <Button asChild variant="outline" className="rounded-full px-5">
              <Link href={`/catalogue?section=${offer.sectionId}`}>{t('detail.viewSection')}</Link>
            </Button>
          </div>

          <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {relatedOffers.map((relatedOffer) => (
              <li key={relatedOffer.id}>
                <Link
                  href={`/catalogue/${relatedOffer.slug}`}
                  className="block h-full rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-card transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-prodet-blue-tint-strong hover:shadow-card-hover"
                >
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
                    {section?.label}
                  </p>
                  <h3 className="mt-3 text-base font-semibold text-[var(--color-text-primary)]">{relatedOffer.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
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

function LegacyProductDetailPage({
  product,
  locale,
  related,
  madeLabel,
}: {
  product: Product;
  locale: Locale;
  related: CatalogueCardProduct[];
  madeLabel: string;
}) {
  const primaryUseCaseId = product.useCases[0];
  const primaryUseCaseBase = primaryUseCaseId ? getUseCaseById(primaryUseCaseId) : undefined;
  const primaryUseCase = primaryUseCaseBase ? localizeUseCase(primaryUseCaseBase, locale) : undefined;
  return (
    <div className="py-6 md:py-8">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <ProductHeroV2
          product={product}
          locale={locale}
          useCaseLabel={primaryUseCase?.label ?? 'Catalogue'}
        />

        {related.length > 0 ? (
          <section className="pt-10">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-prodet-blue" aria-hidden />
              <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--color-text-primary)]">
                {locale === 'en' ? 'Similar products' : 'Produits similaires'}
              </h2>
            </div>
            <div className="mt-4">
              <ProductGrid products={related} madeLabel={madeLabel} />
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
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
    <div className="h-full rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-card sm:p-6">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-prodet-blue-tint text-prodet-blue">
        {icon}
      </div>
      <h2 className="mt-4 text-xl font-semibold text-[var(--color-text-primary)]">{title}</h2>
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
