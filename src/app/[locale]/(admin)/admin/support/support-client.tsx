'use client';

import { useEffect, useMemo, useState } from 'react';
import { LifeBuoy, Search } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';

export type AdminTicketRow = {
  id: string;
  subject: string;
  customer: string | null;
  status: string;
  lastAuthorRole: string;
  dateLabel: string;
};

export function AdminSupportClient({ tickets }: { tickets: AdminTicketRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'todo' | 'closed'>('all');

  useEffect(() => {
    const id = setInterval(() => router.refresh(), 10_000);
    return () => clearInterval(id);
  }, [router]);

  const todo = tickets.filter((t) => t.status !== 'closed' && t.lastAuthorRole === 'client').length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((t) => {
      if (tab === 'todo' && !(t.status !== 'closed' && t.lastAuthorRole === 'client')) return false;
      if (tab === 'closed' && t.status !== 'closed') return false;
      if (q) return t.subject.toLowerCase().includes(q) || (t.customer ?? '').toLowerCase().includes(q);
      return true;
    });
  }, [tickets, query, tab]);

  return (
    <div className="dash">
      <div className="dash__stats" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__value">{tickets.length}</div>
          <div className="stat-card__label">Tickets</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value" style={{ color: 'var(--prodet-blue)' }}>{todo}</div>
          <div className="stat-card__label">À répondre</div>
        </div>
      </div>

      <div className="orders__tabs">
        {[
          { id: 'all', label: 'Tous' },
          { id: 'todo', label: 'À répondre' },
          { id: 'closed', label: 'Clôturés' },
        ].map((t) => (
          <button key={t.id} className={`orders__tab${tab === t.id ? ' is-active' : ''}`} onClick={() => setTab(t.id as typeof tab)}>
            {t.label}
          </button>
        ))}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 'auto', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--prodet-green)' }} /> En direct
        </div>
      </div>

      <div className="admin-toolbar" style={{ marginBottom: 0 }}>
        <div className="admin-search">
          <Search size={16} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un sujet, un client…" />
        </div>
      </div>

      <div className="orders__list">
        {filtered.map((t) => {
          const badge =
            t.status === 'closed'
              ? { bg: 'var(--surface-sunken)', fg: 'var(--text-secondary)', label: 'Clôturé' }
              : t.lastAuthorRole === 'client'
                ? { bg: 'var(--prodet-blue-tint)', fg: 'var(--prodet-blue)', label: 'À répondre' }
                : { bg: 'var(--prodet-green-tint)', fg: 'var(--prodet-green)', label: 'Répondu' };
          return (
            <Link key={t.id} href={`/admin/support/${t.id}`} className="order-row" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="order-row__main">
                <div className="order-row__id-block">
                  <span className="order-row__id">{t.subject}</span>
                  <span className="order-row__date">{t.customer ?? '—'} · {t.dateLabel}</span>
                </div>
                <span className="pds-badge" style={{ background: badge.bg, color: badge.fg }}>{badge.label}</span>
              </div>
            </Link>
          );
        })}
        {filtered.length === 0 ? (
          <div className="admin-empty">
            <LifeBuoy size={26} style={{ marginBottom: 8, opacity: 0.5 }} />
            <div>Aucun ticket.</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
