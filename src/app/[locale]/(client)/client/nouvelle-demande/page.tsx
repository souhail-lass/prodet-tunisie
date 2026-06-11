import type { Metadata } from 'next';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/portal/page-header';
import { StatusPill } from '@/components/portal/status-pill';
import { requireClientPortalAccess } from '@/features/client-portal/auth';
import {
  getPortalRequestPrefill,
  listPortalProductOptions,
} from '@/features/client-portal/request-builder';
import { listCustomerUsualProducts } from '@/features/client-portal/usual-products';
import { Link, isLocale } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import { RequestBuilderClient } from './request-builder-client';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Nouvelle demande | Espace client Prodet',
    description: 'Préparer une demande de réapprovisionnement protégée.',
  };
}

export default async function ClientNewRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { locale: localeParam } = await params;
  const { from } = await searchParams;
  const locale: Locale = isLocale(localeParam) ? localeParam : 'fr';
  setRequestLocale(locale);
  await connection();

  const access = await requireClientPortalAccess();
  if (from && !isUuid(from)) notFound();

  const [usualProducts, productOptions, prefill] = await Promise.all([
    listCustomerUsualProducts({ customerId: access.customer.id, locale }),
    listPortalProductOptions(locale),
    from
      ? getPortalRequestPrefill({
          customerId: access.customer.id,
          requestId: from,
          locale,
        })
      : Promise.resolve(null),
  ]);

  if (from && !prefill) notFound();

  return (
    <div className="flex flex-col gap-6 lg:gap-7">
      <Link
        href="/client"
        className="inline-flex w-fit items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-prodet-blue"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Retour au tableau de bord
      </Link>

      <PageHeader
        eyebrow={prefill ? `Reprise · ${prefill.referenceCode}` : 'Réapprovisionnement'}
        title={prefill ? 'Modifier la demande' : 'Nouvelle demande'}
        description={
          prefill
            ? 'Adaptez les quantités et les notes, puis renvoyez à Prodet.'
            : 'Sélectionnez vos références, ajustez les quantités, ajoutez vos consignes de livraison.'
        }
        meta={
          prefill ? <StatusPill tone="info" label="Brouillon repris" size="md" /> : null
        }
      />

      <RequestBuilderClient
        locale={locale}
        usualProducts={usualProducts}
        productOptions={productOptions}
        prefill={prefill}
      />
    </div>
  );
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
