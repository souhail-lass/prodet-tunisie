import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getSectorBySlug, getUseCaseById, listProducts } from '@/data/queries';
import { isLocale } from '@/i18n/routing';
import { ProductCard } from '@/components/catalog/product-card';
import { LabelText } from '@/components/typography/label-text';

export default async function SectorPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return notFound();
  setRequestLocale(locale);

  const sector = getSectorBySlug(slug);
  if (!sector) return notFound();

  const products = listProducts({ sectorId: sector.id });

  return (
    <main className="section-shell py-12 lg:py-16">
      <header className="surface-panel overflow-hidden p-7 sm:p-8">
        <LabelText>Secteur</LabelText>
        <h1 className="public-display-title-compact mt-4">{sector.label}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
          {sector.shortDescription}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {sector.relevantUseCases.map((useCaseId) => (
            <span
              key={useCaseId}
              className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-medium text-primary"
            >
              {getUseCaseById(useCaseId)?.label ?? useCaseId}
            </span>
          ))}
        </div>
      </header>

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-prodet-text">Produits adaptés</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
