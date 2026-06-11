'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Inbox, PackageCheck, Search } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';

export type PortalRequestRow = {
  id: string;
  reference: string;
  customer: string;
  email: string | null;
  status: string;
  statusLabel: string;
  swiverPushed: boolean;
  dateLabel: string;
  lineCount: number;
  summary: string;
};

const TABS = [
  { id: 'all', label: 'Toutes' },
  { id: 'review', label: 'À vérifier' },
  { id: 'approved', label: 'Confirmées' },
  { id: 'exported', label: 'Clôturées' },
  { id: 'rejected', label: 'Refusées' },
];

const TONE: Record<string, { bg: string; fg: string }> = {
  parsing: { bg: 'var(--surface-sunken)', fg: 'var(--text-secondary)' },
  review: { bg: 'var(--prodet-blue-tint)', fg: 'var(--prodet-blue)' },
  approved: { bg: 'var(--prodet-green-tint)', fg: 'var(--prodet-green)' },
  exported: { bg: 'var(--prodet-green-tint)', fg: 'var(--prodet-green)' },
  rejected: { bg: 'var(--color-danger-bg)', fg: 'var(--color-danger)' },
};

export function PortalRequestsClient({ requests }: { requests: PortalRequestRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  // Near-real-time: re-fetch the server component every 10s.
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 10_000);
    return () => clearInterval(id);
  }, [router]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: requests.length };
    for (const r of requests) map[r.status] = (map[r.status] ?? 0) + 1;
    return map;
  }, [requests]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests.filter((r) => {
      if (status !== 'all' && r.status !== status) return false;
      if (q) {
        return (
          r.reference.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          (r.email ?? '').toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [requests, query, status]);

  const reviewCount = counts.review ?? 0;
  const pushedCount = requests.filter((r) => r.swiverPushed && r.status !== 'rejected').length;

  return (
    <div className="dash">
      <div className="dash__stats dash__stats--3">
        <div className="stat-card">
          <div className="stat-card__value">{requests.length}</div>
          <div className="stat-card__label">Demandes reçues</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value" style={{ color: 'var(--prodet-blue)' }}>{reviewCount}</div>
          <div className="stat-card__label">À vérifier</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value" style={{ color: 'var(--prodet-green)' }}>{pushedCount}</div>
          <div className="stat-card__label">Poussées vers Swiver</div>
        </div>
      </div>

      <div className="orders__tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`orders__tab${status === tab.id ? ' is-active' : ''}`}
            onClick={() => setStatus(tab.id)}
          >
            {tab.label}
            {counts[tab.id] ? ` (${counts[tab.id]})` : ''}
          </button>
        ))}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 'auto', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--prodet-green)' }} />
          Synchronisé en direct
        </div>
      </div>

      <div className="admin-toolbar" style={{ marginBottom: 0 }}>
        <div className="admin-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une référence, un client, un produit…"
          />
        </div>
      </div>

      <div className="orders__list">
        {filtered.map((r) => {
          const tone = TONE[r.status] ?? { bg: 'var(--surface-sunken)', fg: 'var(--text-secondary)' };
          return (
            <Link key={r.id} href={`/admin/demandes-portail/${r.id}`} className="order-row order-row--link">
              <div className="order-row__main">
                <div className="order-row__id-block">
                  <span className="order-row__id">{r.reference}</span>
                  <span className="order-row__date">{r.customer}{r.email ? ` · ${r.email}` : ''}</span>
                </div>
                <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {r.swiverPushed && r.status !== 'rejected' ? (
                    <span
                      className="pds-badge pds-badge--sm"
                      style={{ background: 'var(--prodet-green-tint)', color: 'var(--prodet-green)' }}
                    >
                      <CheckCircle2 size={13} /> Swiver
                    </span>
                  ) : null}
                  <span className="pds-badge pds-badge--sm" style={{ background: tone.bg, color: tone.fg }}>
                    {r.statusLabel}
                  </span>
                </div>
              </div>
              <div className="order-row__meta">
                <span>
                  <PackageCheck size={15} /> {r.lineCount} référence{r.lineCount > 1 ? 's' : ''}
                </span>
                {r.summary ? <span style={{ color: 'var(--text-tertiary)' }}>{r.summary}</span> : null}
                <span className="order-row__eta">
                  <Calendar size={15} /> {r.dateLabel}
                </span>
              </div>
            </Link>
          );
        })}
        {filtered.length === 0 ? (
          <div className="admin-empty">
            <Inbox size={26} style={{ marginBottom: 8, opacity: 0.5 }} />
            <div>Aucune demande pour le moment.</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
