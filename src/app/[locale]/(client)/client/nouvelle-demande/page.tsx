import { redirect } from 'next/navigation';
import { isLocale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

/**
 * Retired: the portal request builder is consolidated into /client/commander
 * ("Demander un devis"). This route redirects (preserving an optional ?from
 * draft id) so old links keep working without a second, duplicate builder.
 */
export default async function ClientNewRequestRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { locale: localeParam } = await params;
  const { from } = await searchParams;
  const locale = isLocale(localeParam) ? localeParam : 'fr';
  const query = from ? `?from=${encodeURIComponent(from)}` : '';
  redirect(`/${locale}/client/commander${query}`);
}
