import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  getRecommendedProductsForSector,
  getSectorBySlug,
  listSectors,
  localizedSectorName,
} from '@/data/queries';
import { Link } from '@/i18n/routing';
import { isLocale } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/catalog/product-card';

export async function generateStaticParams() {
  return listSectors().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const safeLocale = isLocale(locale) ? locale : 'fr';
  const sector = getSectorBySlug(slug);
  if (!sector) return {};
  return {
    title: localizedSectorName(sector, safeLocale),
    description: sector.shortDescByLocale[safeLocale],
  };
}

export default async function SectorDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  const sector = getSectorBySlug(slug);
  if (!sector) notFound();

  const t = await getTranslations({ locale, namespace: 'sectors.detail' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const recommended = getRecommendedProductsForSector(sector);
  const name = localizedSectorName(sector, locale);

  return (
    <div className="mx-auto max-w-(--container-2xl) px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/secteurs"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
        {tCommon('actions.backToSectors')}
      </Link>

      <header className="mt-6 max-w-3xl">
        <h1 className="text-foreground text-3xl font-semibold sm:text-4xl">{name}</h1>
        <p className="text-muted-foreground mt-4 text-base">{sector.longDescByLocale[locale]}</p>
      </header>

      <section className="mt-12">
        <h2 className="text-foreground text-xl font-semibold">{t('recommendedTitle')}</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">{t('recommendedSubtitle')}</p>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recommended.map((product) => (
            <li key={product.slug}>
              <ProductCard product={product} locale={locale} />
            </li>
          ))}
        </ul>
      </section>

      <section className="border-border bg-secondary/30 mt-16 rounded-lg border p-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-foreground text-xl font-semibold">{t('ctaTitle')}</h2>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm">{t('ctaSubtitle')}</p>
          </div>
          <Button asChild size="lg">
            <Link href={`/devis?sector=${sector.key}`}>
              {tCommon('actions.requestQuote')}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
