import { setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/routing';
import { LegalPage } from '../_legal-page';

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);
  return <LegalPage titleKey="cookies.title" introKey="cookies.intro" />;
}
