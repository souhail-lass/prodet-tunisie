import { CloudOff } from 'lucide-react';
import { listAllTickets } from '@/features/admin/tickets';
import { AdminSupportClient, type AdminTicketRow } from './support-client';

export const dynamic = 'force-dynamic';

const fmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Africa/Tunis' });

export default async function AdminSupportPage() {
  let rows: AdminTicketRow[] = [];
  let error: string | null = null;
  try {
    const tickets = await listAllTickets();
    rows = tickets.map((t) => ({
      id: t.id,
      subject: t.subject,
      customer: t.customerName,
      status: t.status,
      lastAuthorRole: t.lastAuthorRole,
      dateLabel: fmt.format(t.lastMessageAt),
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
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{error}</p>
      </section>
    );
  }

  return <AdminSupportClient tickets={rows} />;
}
