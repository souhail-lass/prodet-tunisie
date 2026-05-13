import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { isLocale, type Locale } from '@/i18n/routing';
import { DevisPageClient } from './_devis-page-client';

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

  return <DevisPageClient locale={locale as Locale} />;
}
