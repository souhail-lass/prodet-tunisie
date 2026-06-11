import { CloudOff } from 'lucide-react';
import { listAdminProducts } from '@/features/catalogue/queries';
import { ProduitsClient } from './produits-client';

export const dynamic = 'force-dynamic';

export default async function ProduitsPage() {
  let items: Awaited<ReturnType<typeof listAdminProducts>> = [];
  let error: string | null = null;
  try {
    items = await listAdminProducts();
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
        <p className="panel__sub">Impossible de charger le catalogue (base de données).</p>
        <p style={{ marginTop: 10, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{error}</p>
      </section>
    );
  }

  return <ProduitsClient items={items} />;
}
