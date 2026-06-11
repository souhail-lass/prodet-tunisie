'use client';

import { useMemo, useState, useTransition } from 'react';
import { MailX, RefreshCw, Search, Trash2, UserCheck, UserX } from 'lucide-react';
import { ConfirmDialog } from '@/components/ds';
import { useRouter } from '@/i18n/routing';
import type { AdminSwiverClient } from '@/features/admin/clients';
import { grantAccessAction, refreshSwiverClientsAction, removeClientAction, revokeAccessAction } from './actions';

export function ClientsClient({ clients }: { clients: AdminSwiverClient[] }) {
  const router = useRouter();
  const [override, setOverride] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState('');
  const [pending, startTransition] = useTransition();

  const isActive = (c: AdminSwiverClient) => override[c.swiverId] ?? c.active;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.email ?? '').toLowerCase().includes(q) ||
        (c.phone ?? '').includes(q),
    );
  }, [clients, query]);

  const withEmail = clients.filter((c) => c.email).length;
  const activeCount = clients.filter((c) => isActive(c)).length;

  function toggle(c: AdminSwiverClient) {
    if (!c.email) return;
    const next = !isActive(c);
    setOverride((p) => ({ ...p, [c.swiverId]: next }));
    startTransition(async () => {
      if (next) {
        await grantAccessAction({ swiverId: c.swiverId, email: c.email!, name: c.name, phone: c.phone, city: c.city });
      } else if (c.userId) {
        await revokeAccessAction({ userId: c.userId });
      }
      router.refresh();
    });
  }

  const [confirmingRemove, setConfirmingRemove] = useState<AdminSwiverClient | null>(null);

  function remove(c: AdminSwiverClient) {
    if (!c.userId) return;
    setConfirmingRemove(null);
    setOverride((p) => ({ ...p, [c.swiverId]: false }));
    startTransition(async () => {
      await removeClientAction({ userId: c.userId! });
      router.refresh();
    });
  }

  const cols = '2.4fr 2fr 1.5fr auto';

  return (
    <div className="dash">
      <div className="dash__stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <Stat tone="blue" value={clients.length} label="Clients Swiver" />
        <Stat tone="green" value={activeCount} label="Accès actifs" />
        <Stat tone="amber" value={withEmail} label="Avec email" />
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={16} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un client, un email, un téléphone…" />
        </div>
        <button
          className="pds-btn pds-btn--ghost pds-btn--sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await refreshSwiverClientsAction();
              router.refresh();
            })
          }
          title="Recharger la liste depuis Swiver"
        >
          <RefreshCw size={14} /> <span>Rafraîchir</span>
        </button>
        {pending ? <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>…</span> : null}
      </div>

      <div className="admin-table">
        <div className="admin-table__head" style={{ gridTemplateColumns: cols }}>
          <span>Client</span>
          <span className="admin-hide-sm">Contact</span>
          <span className="admin-hide-sm">Connexion</span>
          <span style={{ textAlign: 'right' }}>Accès</span>
        </div>
        {filtered.slice(0, 400).map((c) => {
          const active = isActive(c);
          const initials = c.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'CL';
          return (
            <div key={c.swiverId} className={`admin-row${active ? '' : ' is-dim'}`} style={{ gridTemplateColumns: cols }}>
              <div className="admin-namecell">
                <span className="admin-avatar">{initials}</span>
                <div className="admin-cell">
                  <div className="admin-cell-strong">{c.name}</div>
                  {c.reference ? <div className="admin-cell-sub">Réf. {c.reference}</div> : null}
                </div>
              </div>
              <div className="admin-cell admin-hide-sm">
                <div className="admin-cell-muted">{c.email ?? '—'}</div>
                {c.phone ? <div className="admin-cell-sub">{c.phone}</div> : null}
              </div>
              <div className="admin-cell admin-hide-sm">
                <span className="admin-cell-muted">
                  <span className={`admin-dot ${c.hasLoggedIn ? 'admin-dot--on' : 'admin-dot--off'}`} />
                  {c.hasLoggedIn ? c.lastSeenLabel : 'Jamais connecté'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                {c.email ? (
                  <button
                    onClick={() => toggle(c)}
                    className={`admin-toggle ${active ? 'admin-toggle--on' : 'admin-toggle--off'}`}
                    title={active ? 'Suspendre l’accès' : 'Activer l’accès par email'}
                  >
                    {active ? <UserCheck size={13} /> : <UserX size={13} />}
                    {active ? 'Actif' : 'Activer'}
                  </button>
                ) : (
                  <span className="admin-toggle admin-toggle--off" style={{ cursor: 'default' }} title="Aucun email dans Swiver">
                    <MailX size={13} /> Email manquant
                  </span>
                )}
                {c.userId ? (
                  <button className="ghost-link" onClick={() => setConfirmingRemove(c)} title="Retirer le client">
                    <Trash2 size={14} />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 ? <div className="admin-empty">Aucun client.</div> : null}
        {filtered.length > 400 ? (
          <div className="admin-result-note">{filtered.length} clients — affinez la recherche (400 affichés).</div>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmingRemove != null}
        title="Retirer ce client ?"
        message={confirmingRemove ? `${confirmingRemove.name} perdra son accès au portail.` : ''}
        confirmLabel="Retirer"
        cancelLabel="Garder"
        danger
        pending={pending}
        onConfirm={() => confirmingRemove && remove(confirmingRemove)}
        onClose={() => setConfirmingRemove(null)}
      />
    </div>
  );
}

function Stat({ tone, value, label }: { tone: 'blue' | 'green' | 'amber'; value: number; label: string }) {
  const color = tone === 'green' ? 'var(--prodet-green)' : tone === 'amber' ? 'var(--color-warning)' : 'var(--prodet-blue)';
  return (
    <div className="stat-card">
      <div className="stat-card__value" style={{ color }}>
        {value}
      </div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}
