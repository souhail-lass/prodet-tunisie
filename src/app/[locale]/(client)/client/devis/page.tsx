import { Download, FileText, Link2Off, Repeat } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ds';
import { Link } from '@/i18n/routing';
import { listMySwiverDocuments } from '@/features/client-portal/swiver-documents';
import type { SwiverDocumentStatus } from '@/integrations/swiver';

export const dynamic = 'force-dynamic';

const dateFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeZone: 'Africa/Tunis' });
const moneyFmt = new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

function statusBadge(status: SwiverDocumentStatus, t: (k: string) => string) {
  switch (status) {
    case 'paid':
    case 'sent':
      return <Badge tone="blue" dot>{t('quotes.issued')}</Badge>;
    case 'cancelled':
      return <Badge tone="red" dot>{t('quotes.cancelled')}</Badge>;
    case 'draft':
      return <Badge tone="neutral" dot>{t('quotes.draft')}</Badge>;
    default:
      return <Badge tone="neutral" dot>{t('quotes.issued')}</Badge>;
  }
}

export default async function ClientQuotesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'portal' });
  const { linked, documents } = await listMySwiverDocuments(['devis']);

  if (!linked || documents.length === 0) {
    return (
      <div className="portal-list">
        <div className="panel portal-empty">
          <span className="portal-empty__icon">
            {linked ? <FileText size={22} /> : <Link2Off size={22} />}
          </span>
          <h2 className="panel__title">
            {linked ? t('quotes.emptyTitle') : t('quotes.notLinkedTitle')}
          </h2>
          <p className="panel__sub">
            {linked ? t('quotes.emptyBody') : t('quotes.notLinkedBody')}
          </p>
          <Link
            href="/client/commander"
            className="pds-btn pds-btn--primary pds-btn--sm"
            style={{ marginTop: 14 }}
          >
            <Repeat size={15} />
            <span>{t('nav.newOrder')}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-list">
      {documents.map((doc) => (
        <div className="portal-list-row" key={doc.swiverId}>
          <div className="portal-list-row__main">
            <span className="portal-list-row__icon">
              <FileText size={18} />
            </span>
            <div>
              <div className="portal-list-row__id">{doc.documentNumber}</div>
              <div className="portal-list-row__meta">{dateFmt.format(doc.issueDate)}</div>
            </div>
          </div>
          <div className="portal-list-row__actions">
            {doc.totalTtc != null ? (
              <span className="portal-list-row__amount">
                {moneyFmt.format(doc.totalTtc)} <small>{doc.currency}</small>
              </span>
            ) : null}
            {statusBadge(doc.status, t)}
            <a
              className="pds-btn pds-btn--outline pds-btn--sm"
              href={`/api/client/factures/${doc.swiverId}/pdf`}
              target="_blank"
              rel="noopener"
            >
              <Download size={14} />
              <span>{t('invoices.download')}</span>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
