import { CloudOff } from 'lucide-react';
import { getAdminSwiverClients } from '@/features/admin/clients';
import { ClientsClient } from './clients-client';

export const dynamic = 'force-dynamic';

export default async function AdminClientsPage() {
  let clients: Awaited<ReturnType<typeof getAdminSwiverClients>> = [];
  let error: string | null = null;
  try {
    clients = await getAdminSwiverClients();
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
        <p className="panel__sub">Impossible de charger les clients (base de données ou Swiver).</p>
        <p style={{ marginTop: 10, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{error}</p>
      </section>
    );
  }

  return <ClientsClient clients={clients} />;
}
