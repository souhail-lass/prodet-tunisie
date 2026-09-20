import { permanentRedirect } from 'next/navigation';
import { CATALOGUE_PATH } from '@/data/familles';
import { isLocale } from '@/i18n/routing';

export default async function CataloguePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  permanentRedirect(`/${locale}${CATALOGUE_PATH}`);
}
