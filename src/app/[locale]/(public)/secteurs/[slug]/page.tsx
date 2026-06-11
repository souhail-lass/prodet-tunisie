import { notFound } from 'next/navigation';
import Image from 'next/image';
import { setRequestLocale } from 'next-intl/server';
import { ArrowRight, FileText, PackageCheck } from 'lucide-react';
import { getSectorBySlug, getUseCaseById, listProducts, listSectors } from '@/data/queries';
import { localizeProducts, localizeSector, localizeUseCase } from '@/data/i18n/content';
import { isLocale } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { QuoteQuantityControl } from '@/components/catalogue/ProductCard';
import { sectorPageCards } from '@/components/secteurs/sector-page-data';
import type { Product } from '@/types/product';

// Sector pages are built from static fixture data — prerender them all.
export function generateStaticParams() {
  return listSectors().map((sector) => ({ slug: sector.slug }));
}

export default async function SectorPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return notFound();
  setRequestLocale(locale);

  const sectorBase = getSectorBySlug(slug);
  if (!sectorBase) return notFound();
  const sector = localizeSector(sectorBase, locale);

  const sectorVisual = sectorPageCards.find((card) => card.id === sector.id);
  const products = localizeProducts(
    listProducts({ sectorId: sector.id, category: 'manufactured' }),
    locale,
  );
  const spotlightProducts = products.slice(0, 3);
  const needGroups = sector.relevantUseCases
    .map((useCaseId) => {
      const useCaseBase = getUseCaseById(useCaseId);
      const useCase = useCaseBase ? localizeUseCase(useCaseBase, locale) : undefined;
      const useCaseProducts = products
        .filter((product) => product.useCases.includes(useCaseId))
        .slice(0, 3);

      return { useCaseId, useCase, products: useCaseProducts };
    })
    .filter((group) => group.products.length > 0);

  return (
    <>
      <section className="relative overflow-hidden bg-[#0D3B73] text-white">
        {sectorVisual ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-36"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(8,41,78,0.92), rgba(8,41,78,0.64)), url('${sectorVisual.image}')`,
            }}
            aria-hidden
          />
        ) : null}
        <div className="absolute inset-0 subtle-grid opacity-30" aria-hidden />
        <div className="section-shell relative py-12 lg:py-16">
          <nav className="text-xs text-white/70">
            <Link href="/" className="font-semibold text-white hover:text-prodet-sky">
              Accueil
            </Link>
            <span className="mx-2">/</span>
            <Link href="/secteurs" className="font-semibold text-white hover:text-prodet-sky">
              Secteurs
            </Link>
            <span className="mx-2">/</span>
            <span>{sector.label}</span>
          </nav>

          <div className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(320px,0.48fr)] lg:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase text-prodet-sky">Secteur</p>
              <h1 className="mt-3 max-w-3xl text-[2.65rem] font-bold leading-[1.03] sm:text-[4rem]">
                {sector.label}
              </h1>
              <p className="mt-5 max-w-2xl text-[15px] leading-8 text-white/78">
                {sector.shortDescription}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={`/catalogue?sector=${sector.id}`}
                  className="inline-flex items-center gap-2 rounded-sm bg-white px-5 py-3 text-[13px] font-semibold text-[#0D3B73] transition-colors hover:bg-white/92 hover:text-[#0D3B73]"
                >
                  <PackageCheck className="h-4 w-4" aria-hidden />
                  Voir dans le catalogue
                </Link>
                <Link
                  href="/devis"
                  className="inline-flex items-center gap-2 rounded-sm border border-white/28 px-5 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-white/10 hover:text-white"
                >
                  <FileText className="h-4 w-4" aria-hidden />
                  Devis
                </Link>
              </div>
            </div>

            <div className="rounded-md border border-white/16 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase text-prodet-sky">Besoins clés</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/84">
                {sector.supplyHighlights.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-prodet-sky" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 lg:py-16">
        <div className="section-shell">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:items-start">
            <div>
              <p className="text-[11px] font-semibold uppercase text-primary">Sélection secteur</p>
              <h2 className="mt-3 text-[2rem] font-semibold leading-tight text-prodet-text">
                Produits à regarder en premier.
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Une sélection courte pour démarrer la demande. Le catalogue complet reste accessible
                à tout moment.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {spotlightProducts.map((product) => (
                <SectorProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F8F7F4] py-14 lg:py-16">
        <div className="section-shell">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase text-primary">Par besoin</p>
              <h2 className="mt-3 text-[2rem] font-semibold leading-tight text-prodet-text">
                Cherchez par usage terrain.
              </h2>
            </div>
            <Link
              href={`/catalogue?sector=${sector.id}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-strong"
            >
              Voir tout dans le catalogue
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {needGroups.map((group) => (
              <article key={group.useCaseId} className="rounded-md border border-[#DDE7EF] bg-white p-5">
                <h3 className="text-lg font-semibold text-prodet-text">
                  {group.useCase?.label ?? group.useCaseId}
                </h3>
                <p className="mt-2 min-h-[44px] text-sm leading-6 text-muted-foreground">
                  {group.useCase?.description}
                </p>
                <ul className="mt-5 space-y-3">
                  {group.products.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/catalogue/${product.slug}`}
                        className="grid grid-cols-[54px_minmax(0,1fr)] items-center gap-3 rounded-sm border border-transparent p-2 transition-colors hover:border-[#DDE7EF] hover:bg-[#F8FBFD]"
                      >
                        <ProductThumb product={product} className="h-[54px] w-[54px]" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-prodet-text">
                            {product.name}
                          </p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {product.formats[0]?.label ?? 'Format professionnel'}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="section-shell">
          <div className="rounded-md border border-[#DDE7EF] bg-[#0D3B73] p-6 text-white sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <p className="text-[11px] font-semibold uppercase text-prodet-sky">
                  Catalogue complet
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Voir toutes les références du secteur.</h2>
              </div>
              <Link
                href={`/catalogue?sector=${sector.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-white px-6 py-3 text-sm font-semibold text-[#0D3B73] transition-colors hover:bg-white/92 hover:text-[#0D3B73]"
              >
                Ouvrir le catalogue
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SectorProductCard({ product }: { product: Product }) {
  return (
    <article className="flex h-full flex-col rounded-md border border-[#DDE7EF] bg-white p-4 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-[0_18px_34px_-30px_rgba(8,41,78,0.28)]">
      <Link href={`/catalogue/${product.slug}`} className="block">
        <div className="relative flex h-[210px] items-center justify-center overflow-hidden rounded-sm bg-white">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 220px, 50vw"
            className="object-contain p-5 transition-transform duration-200 hover:scale-[1.02]"
          />
        </div>
        <h3 className="mt-4 line-clamp-1 text-[16px] font-semibold text-primary">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-muted-foreground">
          {product.tagline}
        </p>
      </Link>

      <div className="mt-4 flex flex-wrap gap-2">
        {product.formats.slice(0, 2).map((format) => (
          <span
            key={format.label}
            className="rounded-sm bg-[#F3F6F9] px-2.5 py-1 text-[11px] font-medium text-prodet-text"
          >
            {format.label}
          </span>
        ))}
      </div>

      <div className="mt-auto grid gap-2 pt-5">
        <QuoteQuantityControl product={product} />
        <Link
          href={`/catalogue/${product.slug}`}
          className="inline-flex h-8 items-center justify-center rounded-md border border-[#DDE7EF] text-[12px] font-semibold text-primary transition-colors hover:border-primary/45 hover:bg-[#EFF6FF]"
        >
          Voir fiche
        </Link>
      </div>
    </article>
  );
}

function ProductThumb({ product, className }: { product: Product; className?: string }) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-sm border border-[#E3E7EC] bg-white ${className ?? ''}`}>
      <Image
        src={product.image}
        alt={product.name}
        fill
        sizes="64px"
        className="object-contain p-1.5"
      />
    </div>
  );
}
