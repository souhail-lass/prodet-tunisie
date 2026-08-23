import type { Metadata } from 'next';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowLeft, FolderArchive, Paperclip, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/portal/page-header';
import { Panel } from '@/components/portal/panel';
import { StatusPill } from '@/components/portal/status-pill';
import { Button } from '@/components/ui/button';
import { requireClientPortalAccess } from '@/features/client-portal/auth';
import {
  type PortalRequestTimelineEvent,
  getPortalRequestDetail,
  portalStatusLabels,
  portalStatusTones,
} from '@/features/client-portal/request-history';
import {
  DOCUMENT_KIND_LABELS,
  type DocumentKind,
} from '@/features/client-portal/documents/constants';
import { listDocumentsForOrderDraft } from '@/features/client-portal/documents/queries';
import { assertCustomerDocumentsBucketReady } from '@/features/client-portal/documents/storage';
import { Link, isLocale } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import { CopyErpButton } from '../copy-erp-button';
import { DocumentUploadForm } from '../../documents/upload-form';
import { DocumentDownloadButton } from '../../documents/document-download-button';
import { RequestDocumentDetachForm } from './request-document-detach-form';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Détail demande | Espace client Prodet',
    description: 'Détail protégé d’une demande client Prodet.',
  };
}

export default async function ClientHistoryDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: localeParam, id } = await params;
  const locale: Locale = isLocale(localeParam) ? localeParam : 'fr';
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'portal' });
  await connection();

  if (!isUuid(id)) notFound();

  const access = await requireClientPortalAccess();
  const request = await getPortalRequestDetail({
    customerId: access.customer.id,
    requestId: id,
  });
  if (!request) notFound();

  const tone = portalStatusTones[request.status];
  const totalUnits = request.lines.reduce((total, line) => total + parseQuantity(line.quantity), 0);

  // Documents section: only render the upload widget if Supabase Storage
  // is provisioned. Listing always works (returns []) even without storage,
  // because attachments are DB-only metadata.
  let storageReady = true;
  try {
    await assertCustomerDocumentsBucketReady();
  } catch {
    storageReady = false;
  }
  const attachedDocuments = storageReady
    ? await listDocumentsForOrderDraft({
        orderDraftId: request.id,
        customerId: access.customer.id,
      })
    : [];

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <Link
        href="/client/historique"
        className="inline-flex w-fit items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-prodet-blue"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        {t('historyDetail.backToHistory')}
      </Link>

      <PageHeader
        eyebrow="Demande"
        title={
          <span className="font-mono text-[24px] tracking-tight">{request.referenceCode}</span>
        }
        description={`Envoyée le ${formatLong(request.createdAt)}`}
        meta={<StatusPill tone={tone} label={portalStatusLabels[request.status]} size="md" />}
        action={
          <>
            <CopyErpButton copyText={request.copyText} />
            <Button asChild>
              <Link href={`/client/nouvelle-demande?from=${request.id}`}>
                <RotateCcw className="h-4 w-4" aria-hidden />
                Reprendre
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel
          title={t('historyDetail.products')}
          description={`${request.lineCount} ligne${request.lineCount > 1 ? 's' : ''} · ${totalUnits} unité${totalUnits > 1 ? 's' : ''} au total`}
          padding="flush"
        >
          <div className="hidden grid-cols-[44px_1fr_120px_72px] items-center gap-4 border-b border-border bg-prodet-wash/60 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground md:grid">
            <span>Ligne</span>
            <span>Produit</span>
            <span>Note</span>
            <span className="text-right">Qté</span>
          </div>
          <ul className="divide-y divide-border">
            {request.lines.map((line) => (
              <li
                key={line.id}
                className="grid grid-cols-1 gap-2 px-5 py-3 md:grid-cols-[44px_1fr_120px_72px] md:items-center md:gap-4"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground md:text-[12px] md:tabular-nums">
                  {String(line.lineNumber).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-prodet-text">{line.productName}</p>
                </div>
                <p className="text-[12px] leading-5 text-muted-foreground">
                  {line.note || <span className="text-muted-foreground/60">—</span>}
                </p>
                <p className="text-[14px] font-semibold tabular-nums text-prodet-text md:text-right">
                  {line.quantity}
                  {line.unit ? <span className="text-muted-foreground"> {line.unit}</span> : null}
                </p>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel title="Informations">
            <dl className="divide-y divide-border text-[13px]">
              <MetaRow label="Cadence" value={request.metadata.recurrenceSummary} />
              <MetaRow label="Lieu / livraison" value={request.metadata.deliveryText} />
              <MetaRow label={t('historyDetail.leadTime')} value={request.metadata.preferredTiming} />
              <MetaRow label="Message" value={request.metadata.message} multiline />
            </dl>
          </Panel>

          <Panel title={t('historyDetail.tracking')} description={t('historyDetail.stepsNote')}>
            <ol className="space-y-3">
              {request.timeline.map((event, index) => (
                <TimelineEntry
                  key={`${event.label}-${event.createdAt.toISOString()}`}
                  event={event}
                  isLast={index === request.timeline.length - 1}
                />
              ))}
            </ol>
          </Panel>
        </div>
      </div>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel
          title={t('historyDetail.attachments')}
          description={
            attachedDocuments.length > 0
              ? t('historyDetail.attachedCount', { n: attachedDocuments.length })
              : t('historyDetail.noAttachments')
          }
          padding="flush"
        >
          {attachedDocuments.length > 0 ? (
            <ul className="divide-y divide-border">
              {attachedDocuments.map((document) => (
                <li
                  key={document.documentId}
                  className="grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 md:px-6"
                >
                  <Paperclip
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-prodet-text">
                      {document.fileName}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {DOCUMENT_KIND_LABELS[document.kind as DocumentKind]} ·{' '}
                      {formatBytes(document.byteSize)} · {formatLong(document.attachedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 justify-self-end">
                    <DocumentDownloadButton documentId={document.documentId} />
                    <RequestDocumentDetachForm
                      documentId={document.documentId}
                      orderDraftId={request.id}
                      locale={locale}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-6 md:px-6">
              <p className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <FolderArchive className="h-3.5 w-3.5" aria-hidden />
                {t('historyDetail.uploadHint')}
              </p>
            </div>
          )}
        </Panel>

        {storageReady ? (
          <DocumentUploadForm
            locale={locale}
            attachToOrderDraftId={request.id}
            variant="inline"
          />
        ) : (
          <Panel
            title={t('historyDetail.attachmentsUnavailable')}
            description={t('historyDetail.storageOff')}
          >
            <p className="text-[12px] leading-5 text-muted-foreground">
              {t('historyDetail.attachmentsNote')}
            </p>
          </Panel>
        )}
      </section>

      <p className="text-[12px] leading-5 text-muted-foreground">
        {t('historyDetail.portalNote')}
      </p>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function MetaRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string | null;
  multiline?: boolean;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-baseline gap-3 py-2.5 first:pt-0 last:pb-0">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </dt>
      <dd
        className={
          multiline
            ? 'whitespace-pre-line leading-6 text-prodet-text'
            : 'truncate leading-6 text-prodet-text'
        }
      >
        {value || <span className="text-muted-foreground/70">—</span>}
      </dd>
    </div>
  );
}

function TimelineEntry({
  event,
  isLast,
}: {
  event: PortalRequestTimelineEvent;
  isLast: boolean;
}) {
  return (
    <li className="relative ps-6">
      <span
        className="absolute start-[7px] top-[7px] inline-block h-2 w-2 rounded-full bg-prodet-blue"
        aria-hidden
      />
      {!isLast ? (
        <span
          className="absolute start-[11px] top-4 h-[calc(100%+8px)] w-px bg-border"
          aria-hidden
        />
      ) : null}
      <p className="text-[13px] font-medium text-prodet-text">{event.label}</p>
      <p className="mt-0.5 text-[12px] tabular-nums text-muted-foreground">
        {formatLong(event.createdAt)}
      </p>
    </li>
  );
}

function parseQuantity(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatLong(value: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
