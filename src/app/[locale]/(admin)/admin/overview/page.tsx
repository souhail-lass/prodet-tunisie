import { ArrowRight, Boxes, CheckCircle2, Inbox, LifeBuoy, Users } from 'lucide-react';
import { getAdminOverview } from '@/features/admin/overview';
import { Link } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const o = await getAdminOverview();
  const toAction = o.openTickets + o.pendingOrders;

  return (
    <div className="dash">
      <div className="dash__stats">
        <Stat icon={<Users size={20} />} tone="blue" value={o.activeClients} label="Clients actifs" />
        <Stat icon={<Inbox size={20} />} tone={o.pendingOrders > 0 ? 'amber' : 'blue'} value={o.pendingOrders} label="Commandes à traiter" href="/admin/demandes-portail" />
        <Stat icon={<LifeBuoy size={20} />} tone={o.openTickets > 0 ? 'amber' : 'blue'} value={o.openTickets} label="Tickets ouverts" href="/admin/support" />
        <Stat icon={<Boxes size={20} />} tone="green" value={o.visibleProducts} label="Produits en ligne" href="/admin/produits" />
      </div>

      <div className="dash__cols">
        <section className="panel">
          <div className="panel__head">
            <h2 className="panel__title">À traiter</h2>
            <span className="pds-badge" style={{ background: 'var(--surface-sunken)', color: 'var(--text-secondary)' }}>
              {toAction}
            </span>
          </div>

          {o.orders.length === 0 && o.tickets.length === 0 ? (
            <div className="dash-empty" style={{ padding: '28px 16px' }}>
              <CheckCircle2 size={22} /> <p>Rien en attente. Tout est à jour.</p>
            </div>
          ) : (
            <div className="otable">
              {o.orders.map((r) => (
                <Link href={`/admin/demandes-portail/${r.id}`} key={r.id} className="ov-row">
                  <span className="ov-row__tag ov-row__tag--order">Commande</span>
                  <span className="ov-row__main">
                    <strong>{r.reference}</strong>
                    <span>{r.customerName ?? 'Client'} · {r.dateLabel}</span>
                  </span>
                  <ArrowRight size={16} className="ov-row__arrow" />
                </Link>
              ))}
              {o.tickets.map((t) => (
                <Link href={`/admin/support/${t.id}`} key={t.id} className="ov-row">
                  <span className={`ov-row__tag ${t.awaitingProdet ? 'ov-row__tag--ticket' : 'ov-row__tag--muted'}`}>
                    {t.awaitingProdet ? 'À répondre' : 'Ticket'}
                  </span>
                  <span className="ov-row__main">
                    <strong>{t.subject}</strong>
                    <span>{t.customerName ?? 'Client'} · {t.dateLabel}</span>
                  </span>
                  <ArrowRight size={16} className="ov-row__arrow" />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="panel panel--next">
          <div className="panel__head">
            <h2 className="panel__title">Clients actifs</h2>
            <Link href="/admin/clients" className="panel__link">Tous <ArrowRight size={14} /></Link>
          </div>
          {o.activeNow.length === 0 ? (
            <p className="panel__sub">Aucune connexion récente.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {o.activeNow.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <span className="admin-avatar">
                    {c.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'CL'}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div className="admin-cell-strong">{c.name}</div>
                    <div className="admin-cell-sub">Connecté · {c.lastSeenLabel}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({
  icon,
  tone,
  value,
  label,
  href,
}: {
  icon: React.ReactNode;
  tone: 'blue' | 'green' | 'amber';
  value: number | string;
  label: string;
  href?: string;
}) {
  const inner = (
    <>
      <span className={`stat-card__icon stat-card__icon--${tone}`}>{icon}</span>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
    </>
  );
  return href ? (
    <Link href={href} className="stat-card stat-card--filter">{inner}</Link>
  ) : (
    <div className="stat-card">{inner}</div>
  );
}
