import type { Metadata } from 'next';
import { connection } from 'next/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight, Layers3, PackageCheck, Plus } from 'lucide-react';
import { EmptyState } from '@/components/portal/empty-state';
import { PageHeader } from '@/components/portal/page-header';
import { StatusPill } from '@/components/portal/status-pill';
import { Button } from '@/components/ui/button';
import { requireClientPortalAccess } from '@/features/client-portal/auth';
import {
  type CustomerUsualProductItem,
  listCustomerUsualProducts,
} from '@/features/client-portal/usual-products';
import { Link, isLocale } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Produits habituels | Espace client Prodet',
    description: 'Produits habituels configurés pour un client Prodet validé.',
  };
}

export default async function ClientUsualProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isLocale(localeParam) ? localeParam : 'fr';
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'portal' });
  await connection();

  const access = await requireClientPortalAccess();
  const usualProducts = await listCustomerUsualProducts({
    customerId: access.customer.id,
    locale,
  });

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <PageHeader
        eyebrow={t('usual.eyebrow')}
        title={t('usual.pageTitle')}
        description={t('usual.lead')}
        meta={
          <StatusPill
            tone={usualProducts.length > 0 ? 'success' : 'neutral'}
            label={
              usualProducts.length > 0
                ? t('usual.count', { n: usualProducts.length })
                : t('usual.toConfigure')
            }
            size="md"
          />
        }
        action={
          <Button asChild>
            <Link href="/client/nouvelle-demande">
              Nouvelle demande
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        }
      />

      {usualProducts.length > 0 ? (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {usualProducts.map((item) => (
            <UsualProductCard key={item.id} item={item} />
          ))}
        </section>
      ) : (
        <EmptyState
          icon={<Layers3 className="h-4 w-4" aria-hidden />}
          title={t('usual.emptyTitle')}
          description={t('usual.toConfigureBody')}
          action={{ label: t('usual.openCatalogue'), href: '/catalogue' }}
        />
      )}
    </div>
  );
}

async function UsualProductCard({ item }: { item: CustomerUsualProductItem }) {
  const t = await getTranslations('portal');
  const format = [item.conditionnement, item.unitOfSale].filter(Boolean).join(' · ');

  return (
    <article className="group flex flex-col rounded-md border border-border bg-card p-4 transition-colors hover:border-prodet-blue/40">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-prodet-mist text-prodet-blue">
          <PackageCheck className="h-4 w-4" aria-hidden />
        </span>
        <span className="inline-flex items-baseline gap-1 rounded-sm border border-border bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          <span className="text-[10px] uppercase tracking-[0.06em]">{t('usual.qty')}</span>
          <span className="text-[13px] font-semibold tabular-nums text-prodet-text">
            {item.defaultQuantity}
          </span>
        </span>
      </div>

      <h2 className="mt-3 text-[15px] font-semibold leading-snug text-prodet-text">
        <Link
          href={`/catalogue/${item.slug}`}
          className="underline-offset-4 hover:text-prodet-blue hover:underline"
        >
          {item.productName}
        </Link>
      </h2>

      <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[12px] text-muted-foreground">
        {item.categoryName ? <span>{item.categoryName}</span> : null}
        {item.categoryName && format ? <span aria-hidden>·</span> : null}
        {format ? <span>{format}</span> : null}
      </div>

      {item.note ? (
        <p className="mt-3 rounded-sm border border-border bg-prodet-wash px-3 py-2 text-[12px] leading-5 text-prodet-text">
          <span className="font-semibold text-muted-foreground">Note Prodet · </span>
          {item.note}
        </p>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
        <Link
          href={`/catalogue/${item.slug}`}
          className="text-[12px] text-muted-foreground transition-colors hover:text-prodet-blue"
        >
          Voir produit
        </Link>
        <Button asChild size="xs">
          <Link href="/client/nouvelle-demande">
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Commander
          </Link>
        </Button>
      </div>
    </article>
  );
}
