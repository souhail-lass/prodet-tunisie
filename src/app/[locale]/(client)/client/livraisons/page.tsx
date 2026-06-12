import { CalendarClock, Download, Link2Off, PackageCheck, Truck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ds';
import { listMySwiverDocuments } from '@/features/client-portal/swiver-documents';
import type { SwiverDocumentStatus } from '@/integrations/swiver';

export const dynamic = 'force-dynamic';

const dateFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'Africa/Tunis' });

function deliveryBadge(status: SwiverDocumentStatus) {
  if (status === 'cancelled') return <Badge tone="neutral" dot>Annulée</Badge>;
  if (status === 'draft') return <Badge tone="blue" dot>En préparation</Badge>;
  return <Badge tone="green" dot>Livrée</Badge>;
}

export default async function ClientDeliveriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'portal' });
  const { linked, documents } = await listMySwiverDocuments(['bon_de_livraison']);

  if (!linked) {
    return (
      <div className="portal-list">
        <div className="panel portal-empty">
          <span className="portal-empty__icon"><Link2Off size={22} /></span>
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
          <span className="portal-empty__icon"><Truck size={22} /></span>
          <h2 className="panel__title">Aucune livraison pour le moment</h2>
          <p className="panel__sub">Vos bons de livraison apparaîtront ici dès l’expédition de vos commandes.</p>
        </div>
      </div>
    );
  }

  const delivered = documents.filter((d) => d.status !== 'cancelled').length;
  const lastDelivery = documents[0]!;

  return (
    <div className="dash">
      <div className="dash__stats dash__stats--3">
        <div className="stat-card">
          <span className="stat-card__icon stat-card__icon--green"><PackageCheck size={20} /></span>
          <div className="stat-card__value">{delivered}</div>
          <div className="stat-card__label">Livraisons</div>
        </div>
        <div className="stat-card">
          <span className="stat-card__icon stat-card__icon--blue"><Truck size={20} /></span>
          <div className="stat-card__value">{documents.length}</div>
          <div className="stat-card__label">Bons de livraison</div>
        </div>
        <div className="stat-card">
          <span className="stat-card__icon stat-card__icon--blue"><CalendarClock size={20} /></span>
          <div className="stat-card__value" style={{ fontSize: 'var(--text-base)' }}>
            {dateFmt.format(lastDelivery.issueDate)}
          </div>
          <div className="stat-card__label">Dernière livraison</div>
        </div>
      </div>

      <div className="portal-list">
        {documents.map((doc) => (
          <div className="portal-list-row" key={doc.swiverId}>
            <div className="portal-list-row__main">
              <span className="portal-list-row__icon"><Truck size={18} /></span>
              <div>
                <div className="portal-list-row__id">{doc.documentNumber}</div>
                <div className="portal-list-row__meta">{dateFmt.format(doc.issueDate)}</div>
              </div>
            </div>
            <div className="portal-list-row__actions">
              {deliveryBadge(doc.status)}
              <a
                className="pds-btn pds-btn--ghost pds-btn--sm"
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
