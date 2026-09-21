import { redirect } from 'next/navigation';
import { isLocale } from '@/i18n/routing';

/**
 * The standalone /devis form is retired: quote requests go through the
 * right-hand drawer. Keep the URL so old links still work.
 */
export default async function DevisPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safe = isLocale(locale) ? locale : 'fr';
  redirect(`/${safe}?devis=1`);
}
