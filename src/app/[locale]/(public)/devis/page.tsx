import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { isLocale, type Locale } from '@/i18n/routing';
import { getCatalogueSearchCards } from '@/features/catalogue/queries';
import { DevisPageClient } from './_devis-page-client';

// The quick-add search reads the live catalogue, so keep this page on the same
// ISR window as the rest of the public catalogue.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Demande de devis',
    description: 'Préparez votre demande de devis pour les produits Prodet Tunisie.',
  };
}

export default async function DevisPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  const searchCards = await getCatalogueSearchCards();
  const tc = await getTranslations({ locale, namespace: 'catalogue' });

  return (
    <DevisPageClient
      locale={locale as Locale}
      searchCards={searchCards}
      madeLabel={tc('page.manufacturedBadge')}
    />
  );
}
