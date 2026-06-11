import type { Metadata } from 'next';
import { CloudOff } from 'lucide-react';
import {
  adminPortalStatusLabels,
  listAdminPortalRequests,
  type AdminPortalRequestStatus,
} from '@/features/admin/portal-requests';
import { PortalRequestsClient, type PortalRequestRow } from './portal-requests-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Demandes portail — Admin Prodet',
  robots: { index: false, follow: false },
};

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Africa/Tunis',
});

export default async function AdminPortalRequestsPage() {
  let rows: PortalRequestRow[] = [];
  let error: string | null = null;
  try {
    const requests = await listAdminPortalRequests({ query: '', status: 'all' });
    rows = requests.map((r) => ({
      id: r.id,
      reference: r.referenceCode,
      customer: r.customerName,
      email: r.customerEmail,
      status: r.status,
      statusLabel: adminPortalStatusLabels[r.status as AdminPortalRequestStatus] ?? r.status,
      swiverPushed: r.swiverPushed,
      dateLabel: dateFmt.format(r.createdAt),
      lineCount: r.lineCount,
      summary: r.productSummary,
    }));
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  if (error) {
    return (
      <section className="panel" style={{ maxWidth: 560 }}>
        <div className="panel__head">
          <h2 className="panel__title" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <CloudOff size={18} /> Données indisponibles
          </h2>
        </div>
        <p className="panel__sub">Impossible de charger les demandes (base de données).</p>
        <p style={{ marginTop: 10, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{error}</p>
      </section>
    );
  }

  return <PortalRequestsClient requests={rows} />;
}
