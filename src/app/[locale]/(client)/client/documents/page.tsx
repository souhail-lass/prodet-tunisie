import type { Metadata } from 'next';
import { connection } from 'next/server';
import { setRequestLocale } from 'next-intl/server';
import { FolderArchive, ShieldAlert } from 'lucide-react';
import { EmptyState } from '@/components/portal/empty-state';
import { PageHeader } from '@/components/portal/page-header';
import { Panel } from '@/components/portal/panel';
import { requireClientPortalAccess } from '@/features/client-portal/auth';
import {
  DOCUMENT_KIND_LABELS,
  type DocumentKind,
} from '@/features/client-portal/documents/constants';
import { listCustomerDocuments } from '@/features/client-portal/documents/queries';
import { assertCustomerDocumentsBucketReady } from '@/features/client-portal/documents/storage';
import { isLocale } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import { DocumentUploadForm } from './upload-form';
import { DocumentDownloadButton } from './document-download-button';
import { DocumentDeleteForm } from './document-delete-form';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Documents — Espace client Prodet',
    description: 'Documents partagés avec Prodet : bons de commande, factures, exports ERP.',
  };
}

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ClientDocumentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<SearchParams>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isLocale(localeParam) ? localeParam : 'fr';
  setRequestLocale(locale);
  await connection();

  const access = await requireClientPortalAccess();
  const search = searchParams ? await searchParams : {};
  const statusHint = firstParam(search.status);

  // Probe Storage availability up-front so we can render a clear, actionable
  // empty state when the bucket is missing rather than failing in the action.
  let storageReady = true;
  try {
    await assertCustomerDocumentsBucketReady();
  } catch {
    storageReady = false;
  }

  const documents = storageReady
    ? await listCustomerDocuments(access.customer.id)
    : [];

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <PageHeader
        eyebrow="Documents"
        title="Mes documents"
        description="Bons de commande, factures, exports ERP. Partagés en lecture seule avec Prodet."
      />

      {statusHint ? <StatusBanner hint={statusHint} /> : null}

      {!storageReady ? (
        <Panel padding="normal">
          <EmptyState
            inline
            icon={<ShieldAlert className="h-4 w-4" aria-hidden />}
            title="Module documents non encore activé"
            description="Le stockage Supabase n’est pas encore provisionné côté Prodet. Le module sera activé sous peu."
          />
        </Panel>
      ) : (
        <>
          <DocumentUploadForm locale={locale} variant="page" />

          <Panel
            title="Documents partagés"
            description={
              documents.length > 0
                ? `${documents.length} document${documents.length > 1 ? 's' : ''} disponible${
                    documents.length > 1 ? 's' : ''
                  }.`
                : 'Aucun document partagé pour le moment.'
            }
            padding="flush"
          >
            {documents.length > 0 ? (
              <ul className="divide-y divide-border">
                {documents.map((document) => (
                  <li key={document.id} className="px-5 py-3.5 md:px-6">
                    <article className="grid items-start gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-[14px] font-medium text-prodet-text">
                            {document.label || document.fileName}
                          </p>
                          <span className="inline-flex items-center rounded-sm border border-border bg-prodet-wash px-2 py-0.5 text-[11px] font-medium text-prodet-text">
                            {DOCUMENT_KIND_LABELS[document.kind as DocumentKind]}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-[12px] text-muted-foreground">
                          {document.fileName} · {formatBytes(document.byteSize)} ·{' '}
                          {formatDate(document.createdAt)}
                          {document.uploadedByName
                            ? ` · par ${document.uploadedByName}`
                            : null}
                        </p>
                        {document.notes ? (
                          <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-muted-foreground">
                            {document.notes}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-2 md:justify-self-end">
                        <DocumentDownloadButton documentId={document.id} />
                        <DocumentDeleteForm documentId={document.id} locale={locale} />
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                inline
                icon={<FolderArchive className="h-4 w-4" aria-hidden />}
                title="Aucun document pour le moment"
                description="Téléversez un premier document pour le partager avec Prodet."
              />
            )}
          </Panel>
        </>
      )}

      <p className="text-[12px] leading-5 text-muted-foreground">
        Les documents sont stockés de façon privée. Seuls Prodet et vous y avez accès, via un
        lien temporaire signé à chaque téléchargement.
      </p>
    </div>
  );
}

function StatusBanner({ hint }: { hint: string }) {
  const messages: Record<string, { tone: 'success' | 'error'; text: string }> = {
    deleted: { tone: 'success', text: 'Document supprimé.' },
    'not-found': { tone: 'error', text: 'Document introuvable.' },
    error: { tone: 'error', text: 'Action impossible. Réessayez.' },
  };
  const message = messages[hint];
  if (!message) return null;
  const className =
    message.tone === 'success'
      ? 'border-prodet-green/20 bg-prodet-green/10 text-prodet-green'
      : 'border-destructive/20 bg-destructive/10 text-destructive';
  return (
    <p
      role="status"
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-[12px] ${className}`}
    >
      {message.text}
    </p>
  );
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(value);
}
