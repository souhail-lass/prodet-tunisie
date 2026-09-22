import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { isLocale } from '@/i18n/routing';
import { pageAlternates } from '@/lib/seo/alternates';
import { LegalPage } from '../_legal-page';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal.mentions' });
  return {
    title: t('title'),
    description: t('intro'),
    alternates: pageAlternates(locale, '/mentions-legales'),
  };
}

export default async function MentionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);
  return <LegalPage page="mentions" />;
}
