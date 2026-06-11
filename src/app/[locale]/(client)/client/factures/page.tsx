import { CalendarClock, Download, FileText, Link2Off, ReceiptText, Wallet } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ds';
import { CountUp } from '@/components/portal/count-up';
import { listMySwiverDocuments } from '@/features/client-portal/swiver-documents';
import { getMySpending } from '@/features/client-portal/spending';
import type { SwiverDocumentStatus } from '@/integrations/swiver';

export const dynamic = 'force-dynamic';

const dateFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeZone: 'Africa/Tunis' });
const moneyFmt = new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

function statusBadge(status: SwiverDocumentStatus, t: (k: string) => string) {
  switch (status) {
    case 'paid':
      return <Badge tone="green" dot>{t('invoices.paid')}</Badge>;
    case 'partially_paid':
      return <Badge tone="amber" dot>{t('invoices.unpaid')}</Badge>;
    case 'cancelled':
      return <Badge tone="red" dot>{t('invoices.cancelled')}</Badge>;
    case 'draft':
      return <Badge tone="neutral" dot>{t('invoices.draft')}</Badge>;
    default:
      return <Badge tone="blue" dot>{t('invoices.issued')}</Badge>;
  }
}

export default async function ClientInvoicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'portal' });
  const [{ linked, documents }, spending] = await Promise.all([
    listMySwiverDocuments(['facture']),
    getMySpending(),
  ]);

  if (!linked) {
    return (
      <div className="portal-list">
        <div className="panel portal-empty">
          <span className="portal-empty__icon">
            <Link2Off size={22} />
          </span>
          <h2 className="panel__title">{t('invoices.notLinkedTitle')}</h2>
          <p className="panel__sub">{t('invoices.notLinkedBody')}</p>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="portal-list">
        <div className="panel portal-empty">
          <span className="portal-empty__icon">
            <FileText size={22} />
          </span>
          <h2 className="panel__title">{t('invoices.emptyTitle')}</h2>
          <p className="panel__sub">{t('invoices.emptyBody')}</p>
        </div>
      </div>
    );
  }

  const year = String(new Date().getFullYear());

  return (
    <div className="dash">
      {spending.linked && spending.invoiceCount > 0 ? (
        <div className="dash__stats dash__stats--3">
          <div className="stat-card">
            <span className="stat-card__icon stat-card__icon--blue">
              <Wallet size={20} />
            </span>
            <div className="stat-card__value">
              <CountUp value={spending.thisYear} /> <small className="stat-card__unit">{spending.currency}</small>
            </div>
            <div className="stat-card__label">{t('spending.yearTotal', { year })}</div>
          </div>
          <div className="stat-card">
            <span className={`stat-card__icon ${spending.outstanding > 0 ? 'stat-card__icon--amber' : 'stat-card__icon--green'}`}>
              <ReceiptText size={20} />
            </span>
            <div className="stat-card__value">
              <CountUp value={spending.outstanding} /> <small className="stat-card__unit">{spending.currency}</small>
            </div>
            <div className="stat-card__label">
              {spending.outstanding > 0 ? t('spending.unpaid', { count: spending.unpaidCount }) : t('spending.allSettled')}
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-card__icon stat-card__icon--blue">
              <FileText size={20} />
            </span>
            <div className="stat-card__value">{spending.invoiceCount}</div>
            <div className="stat-card__label">{t('spending.invoices')}</div>
          </div>
        </div>
      ) : null}

      <div className="portal-list">
      {documents.map((doc) => (
        <div className="portal-list-row" key={doc.swiverId}>
          <div className="portal-list-row__main">
            <span className="portal-list-row__icon">
              <FileText size={18} />
            </span>
            <div>
              <div className="portal-list-row__id">{doc.documentNumber}</div>
              <div className="portal-list-row__meta">
                {dateFmt.format(doc.issueDate)}
                {doc.dueDate ? (
                  <>
                    {' · '}
                    <CalendarClock size={12} style={{ display: 'inline', verticalAlign: '-2px' }} />{' '}
                    {t('invoices.due')} {dateFmt.format(doc.dueDate)}
                  </>
                ) : null}
              </div>
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
    </div>
  );
}
