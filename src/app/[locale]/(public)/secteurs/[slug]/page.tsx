import { notFound } from 'next/navigation';
import Image from 'next/image';
import { setRequestLocale } from 'next-intl/server';
import { ArrowRight, FileText } from 'lucide-react';
import { getSectorBySlug, listProducts, listSectors } from '@/data/queries';
import { localizeProducts, localizeSector } from '@/data/i18n/content';
import { isLocale, Link } from '@/i18n/routing';
import { QuoteQuantityControl } from '@/components/catalogue/ProductCard';
import { sectorZones } from '@/components/secteurs/sector-solutions';
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

  // Only Prodet **solutions** (manufactured cleaning products) — no hygiene material.
  const solutions = localizeProducts(listProducts({ category: 'manufactured' }), locale);
  const bySlug = new Map(solutions.map((p) => [p.slug, p]));

  const zones = (sectorZones[sector.id] ?? [])
    .map((zone) => ({
      ...zone,
      products: zone.productSlugs
        .map((s) => bySlug.get(s))
        .filter((p): p is Product => Boolean(p)),
    }))
    .filter((zone) => zone.products.length > 0);

  const solutionCount = new Set(zones.flatMap((z) => z.products.map((p) => p.id))).size;

  return (
    <div className="sector-detail">
      <header className="sector-hero">
        <span className="sector-hero__photo" aria-hidden>
          <Image
            src={`/images/sectors/${sector.id}.jpg`}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </span>
        <span className="sector-hero__scrim" aria-hidden />
        <div className="section-wrap sector-hero__inner">
          <nav className="sector-hero__crumb">
            <Link href="/">{locale === 'ar' ? 'الرئيسية' : locale === 'en' ? 'Home' : 'Accueil'}</Link>
            <span>/</span>
            <Link href="/secteurs">{locale === 'ar' ? 'القطاعات' : locale === 'en' ? 'Sectors' : 'Secteurs'}</Link>
            <span>/</span>
            <span aria-current="page">{sector.label}</span>
          </nav>

          <div className="sector-hero__main">
            <div className="sector-hero__text">
              <span className="eyebrow eyebrow--ondark">Secteur</span>
              <h1 className="sector-hero__title">{sector.label}</h1>
              <p className="sector-hero__lead">{sector.shortDescription}</p>
              <div className="sector-hero__cta">
                <Link href="/devis" className="pds-btn pds-btn--primary pds-btn--lg">
                  <FileText size={17} /> Demander un devis
                </Link>
                <Link href={`/catalogue?sector=${sector.id}`} className="sector-hero__link">
                  Voir le catalogue <ArrowRight size={15} />
                </Link>
              </div>
              <p className="sector-hero__meta">
                <b>{solutionCount}</b> solutions Prodet · réponse sous 24h ouvrées
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="section-wrap sector-zones">
        <div className="section-head">
          <span className="eyebrow">Vos besoins · nos solutions</span>
          <h2 className="section-title">Zone par zone, la solution Prodet.</h2>
          <p className="section-lead">
            Nos produits fabriqués localement, organisés selon le terrain de votre activité.
            Tout se commande en un seul devis.
          </p>
        </div>

        <div className="sector-zones__list">
          {zones.map((zone) => (
            <article className="sector-zone" key={zone.num}>
              <div className="sector-zone__head">
                <span className="sector-zone__num">{zone.num}</span>
                <div>
                  <h3 className="sector-zone__title">{zone.title}</h3>
                  <p className="sector-zone__need">{zone.need}</p>
                </div>
              </div>
              <div className="sector-zone__grid">
                {zone.products.map((product) => (
                  <SolutionCard key={product.id} product={product} />
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <div className="cta-band__inner">
          <div>
            <h2>Construisons votre gamme.</h2>
            <p>Donnez-nous vos zones et vos volumes — nous revenons vers vous sous 24h ouvrées.</p>
          </div>
          <div className="cta-band__actions">
            <Link href="/devis" className="pds-btn pds-btn--primary pds-btn--lg">
              Demander un devis
            </Link>
            <Link
              href={`/catalogue?sector=${sector.id}`}
              className="pds-btn pds-btn--ghost pds-btn--lg cta-band__ghost"
            >
              Voir tout le catalogue <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SolutionCard({ product }: { product: Product }) {
  return (
    <article className="solution-card">
      <Link href={`/catalogue/${product.slug}`} className="solution-card__media">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 700px) 40vw, 180px"
          style={{ objectFit: 'contain' }}
        />
      </Link>
      <Link href={`/catalogue/${product.slug}`} className="solution-card__body">
        <h4 className="solution-card__name">{product.name}</h4>
        {product.formats[0] ? (
          <span className="solution-card__format">{product.formats[0].label}</span>
        ) : null}
      </Link>
      <div className="solution-card__foot">
        <QuoteQuantityControl product={product} />
      </div>
    </article>
  );
}
