import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link, isLocale } from '@/i18n/routing';
import {
  familles,
  getFamilleBySlug,
  getSousCategoriesForFamille,
  getSousCategorie,
  sousCatLabelKey,
} from '@/data/familles';
import { getCatalogueBySousCategorie } from '@/features/catalogue/queries';
import { CategorySidebar } from '@/components/catalogue/category-sidebar';
import { ProductGrid } from '@/components/catalogue/product-grid';
import type { CatalogueCardProduct } from '@/types/product';

export const revalidate = 300;

export function generateStaticParams() {
  return familles.flatMap((f) =>
    getSousCategoriesForFamille(f.id).map((s) => ({ famille: f.id, souscategorie: s.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; famille: string; souscategorie: string }>;
}): Promise<Metadata> {
  const { locale, famille, souscategorie } = await params;
  const fam = getFamilleBySlug(famille);
  if (!isLocale(locale) || !fam) return {};
  const tf = await getTranslations({ locale, namespace: 'familles' });
  return { title: tf(`souscats.${sousCatLabelKey(souscategorie)}`) };
}

export default async function SousCategoriePage({
  params,
}: {
  params: Promise<{ locale: string; famille: string; souscategorie: string }>;
}) {
  const { locale, famille, souscategorie } = await params;
  if (!isLocale(locale)) return notFound();
  setRequestLocale(locale);

  const fam = getFamilleBySlug(famille);
  if (!fam) return notFound();

  const products = await getCatalogueBySousCategorie(fam.id, souscategorie);
  if (products.length === 0) return notFound();

  const tf = await getTranslations({ locale, namespace: 'familles' });
  const sub = getSousCategorie(fam.id, souscategorie);
  const label = tf(`souscats.${sousCatLabelKey(souscategorie)}`);

  const cards: CatalogueCardProduct[] = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    category: p.category,
    categoryLabel: p.categoryLabel,
    image: p.image,
    formats: p.formats,
  }));

  return (
    <div className="famille-page">
      <header className="famille-hero famille-hero--compact">
        <div className="section-wrap famille-hero__inner">
          <div className="famille-hero__text">
            <nav className="famille-breadcrumb">
              <Link href="/">{locale === 'ar' ? 'الرئيسية' : locale === 'en' ? 'Home' : 'Accueil'}</Link>
              <span className="famille-breadcrumb__sep">/</span>
              <Link href={`/produits/${fam.id}`}>{tf(`items.${fam.id}.label`)}</Link>
              <span className="famille-breadcrumb__sep">/</span>
              <span aria-current="page">{label}</span>
            </nav>
            <span className="eyebrow">{tf('page.subEyebrow')}</span>
            <h1 className="famille-hero__title">{label}</h1>
            <span className="famille-hero__count">{tf('page.productsCount', { count: cards.length })}</span>
          </div>
          {sub ? (
            <div className="famille-hero__media">
              <Image src={sub.image} alt="" fill sizes="(max-width: 860px) 100vw, 240px" style={{ objectFit: 'cover' }} />
            </div>
          ) : null}
        </div>
      </header>

      <div className="section-wrap famille-layout">
        <CategorySidebar locale={locale} activeFamille={fam.id} activeSousCat={souscategorie} />
        <main className="famille-main">
          <ProductGrid products={cards} />
        </main>
      </div>

      <section className="cta-band">
        <div className="cta-band__inner">
          <div>
            <h2>{tf('page.ctaTitle')}</h2>
            <p>{tf('page.ctaBody')}</p>
          </div>
          <div className="cta-band__actions">
            <Link className="pds-btn pds-btn--primary pds-btn--lg" href="/devis">
              {tf('page.ctaQuote')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
