import { CloudOff } from 'lucide-react';
import { listCurationGroups, type CurationFamille } from '@/features/catalogue/queries';
import { adminCatalogueListPath, parseAdminCatalogueQuery } from '@/lib/admin-catalogue-query';
import { RangementClient } from './rangement-client';

export const dynamic = 'force-dynamic';

export default async function RangementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const backHref = adminCatalogueListPath(parseAdminCatalogueQuery(await searchParams));
  let groups: CurationFamille[] = [];
  let error: string | null = null;
  try {
    groups = await listCurationGroups();
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

  return <RangementClient groups={groups} backHref={backHref} />;
}
