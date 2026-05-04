import { setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/routing';
import { LegalPage } from '../_legal-page';

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);
  return <LegalPage titleKey="privacy.title" introKey="privacy.intro" />;
}
