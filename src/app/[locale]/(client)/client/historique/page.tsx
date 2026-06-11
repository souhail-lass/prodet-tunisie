import type { Metadata } from 'next';
import { connection } from 'next/server';
import { setRequestLocale } from 'next-intl/server';
import { ArrowRight, ClipboardList, Plus } from 'lucide-react';
import { EmptyState } from '@/components/portal/empty-state';
import { PageHeader } from '@/components/portal/page-header';
import { Panel } from '@/components/portal/panel';
import { StatusPill } from '@/components/portal/status-pill';
import { Button } from '@/components/ui/button';
import { requireClientPortalAccess } from '@/features/client-portal/auth';
import {
  type PortalRequestSummary,
  listPortalRequestSummaries,
  portalStatusLabels,
  portalStatusTones,
} from '@/features/client-portal/request-history';
import { Link, isLocale } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Historique des demandes | Espace client Prodet',
    description: 'Historique protégé des demandes client envoyées à Prodet.',
  };
}

export default async function ClientHistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isLocale(localeParam) ? localeParam : 'fr';
  setRequestLocale(locale);
  await connection();

  const access = await requireClientPortalAccess();
  const requests = await listPortalRequestSummaries(access.customer.id);

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <PageHeader
        eyebrow="Suivi"
        title="Historique des demandes"
        description="Toutes les demandes envoyées à Prodet depuis votre espace client."
        meta={
          <StatusPill
            tone={requests.length > 0 ? 'info' : 'neutral'}
            label={`${requests.length} demande${requests.length > 1 ? 's' : ''}`}
            size="md"
          />
        }
        action={
          <Button asChild>
            <Link href="/client/nouvelle-demande">
              <Plus className="h-4 w-4" aria-hidden />
              Nouvelle demande
            </Link>
          </Button>
        }
      />

      {requests.length > 0 ? (
        <Panel
          padding="flush"
          title="Toutes les demandes"
          description={`${requests.length} envoyée${requests.length > 1 ? 's' : ''}, plus récente en haut.`}
        >
          {/* Sticky column headers (desktop only). On mobile the row layout
           *  stacks so headers would only add noise. */}
          <div className="hidden grid-cols-[160px_140px_1fr_120px_100px] items-center gap-4 border-b border-border bg-prodet-wash/60 px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground lg:grid">
            <span>Référence</span>
            <span>Statut</span>
            <span>Produits</span>
            <span className="text-right">Lignes</span>
            <span className="text-right">Date</span>
          </div>

          <ul className="divide-y divide-border">
            {requests.map((request) => (
              <li key={request.id}>
                <HistoryRow request={request} />
              </li>
            ))}
          </ul>
        </Panel>
      ) : (
        <EmptyState
          icon={<ClipboardList className="h-4 w-4" aria-hidden />}
          title="Votre historique est vide"
          description="Les demandes envoyées depuis votre espace client apparaîtront ici."
          action={{ label: 'Préparer une demande', href: '/client/nouvelle-demande' }}
        />
      )}
    </div>
  );
}

function HistoryRow({ request }: { request: PortalRequestSummary }) {
  const tone = portalStatusTones[request.status];
  const meta = [
    request.metadata.recurrenceSummary,
    request.metadata.deliveryText,
    request.metadata.preferredTiming,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link
      href={`/client/historique/${request.id}`}
      className="group block px-5 py-3.5 transition-colors hover:bg-prodet-wash md:px-6"
    >
      {/* Desktop: dense table row. Mobile: vertical stack with status under reference. */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[160px_140px_1fr_120px_100px] lg:items-center lg:gap-4">
        <div className="flex items-center gap-3 lg:block">
          <span className="text-[14px] font-semibold tabular-nums text-prodet-text group-hover:text-prodet-blue">
            {request.referenceCode}
          </span>
          <span className="lg:hidden">
            <StatusPill tone={tone} label={portalStatusLabels[request.status]} />
          </span>
        </div>

        <div className="hidden lg:block">
          <StatusPill tone={tone} label={portalStatusLabels[request.status]} />
        </div>

        <div className="min-w-0 text-[13px] leading-5 text-muted-foreground">
          <p className="line-clamp-1 text-prodet-text">{request.productSummary || 'Sans produit'}</p>
          {meta ? <p className="line-clamp-1 text-muted-foreground">{meta}</p> : null}
        </div>

        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <span className="text-[11px] font-semibold uppercase text-muted-foreground lg:hidden">
            Lignes
          </span>
          <span className="text-[13px] font-medium tabular-nums text-prodet-text">
            {request.lineCount}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <span className="text-[11px] font-semibold uppercase text-muted-foreground lg:hidden">
            Date
          </span>
          <span className="text-[13px] tabular-nums text-muted-foreground">
            {formatDateShort(request.createdAt)}
          </span>
        </div>
      </div>

      {/* Mobile-only "Voir détail" affordance — the whole row is the link. */}
      <div className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-prodet-blue lg:hidden">
        Voir détail
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </div>
    </Link>
  );
}

function formatDateShort(value: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  }).format(value);
}
