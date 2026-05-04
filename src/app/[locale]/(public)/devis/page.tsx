import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  listProducts,
  listSectors,
  localizedProductName,
  localizedSectorName,
} from '@/data/queries';
import { isLocale } from '@/i18n/routing';
import { QuoteForm } from '@/components/forms/quote-form';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : 'fr';
  const t = await getTranslations({ locale: safeLocale, namespace: 'devis.page' });
  return { title: t('title'), description: t('subtitle') };
}

export default async function DevisPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ product?: string; sector?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: 'devis.page' });

  const products = listProducts().map((p) => ({
    slug: p.slug,
    label: `${p.code} — ${localizedProductName(p, locale)}`,
    unit: p.unitOfSale,
  }));

  const sectors = listSectors().map((s) => ({
    key: s.key,
    label: localizedSectorName(s, locale),
  }));

  return (
    <div className="mx-auto max-w-(--container-2xl) px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <h1 className="text-foreground text-3xl font-semibold sm:text-4xl">{t('title')}</h1>
        <p className="text-muted-foreground mt-3">{t('subtitle')}</p>
        <p className="text-muted-foreground mt-2 text-xs">{t('noStockNotice')}</p>
        <p className="text-muted-foreground mt-2 text-xs">{t('alreadyClient')}</p>
      </header>

      <div className="mt-10 max-w-4xl">
        <QuoteForm products={products} sectors={sectors} prefilledProductSlug={sp.product} />
      </div>
    </div>
  );
}
