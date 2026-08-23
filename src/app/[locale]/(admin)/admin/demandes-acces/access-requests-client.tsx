'use client';

import { useEffect, useMemo, useState } from 'react';
import { Building2, Calendar, Inbox, Mail, MapPin, Search, Send } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import type {
  AccessRequestStatus,
  PortalInviteStatus,
} from '@/features/client-access/admin-queries';

export type AccessRequestRow = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  sector: string;
  city: string;
  needType: string;
  status: AccessRequestStatus;
  statusLabel: string;
  inviteStatus: PortalInviteStatus | null;
  inviteLabel: string | null;
  dateLabel: string;
};

const TABS: { id: string; label: string }[] = [
  { id: 'all', label: 'Toutes' },
  { id: 'new', label: 'Nouvelles' },
  { id: 'reviewing', label: 'En revue' },
  { id: 'approved', label: 'Approuvées' },
  { id: 'needs_info', label: 'Infos manquantes' },
  { id: 'rejected', label: 'Refusées' },
];

const TONE: Record<string, { bg: string; fg: string }> = {
  new: { bg: 'var(--prodet-blue-tint)', fg: 'var(--prodet-blue)' },
  reviewing: { bg: 'var(--surface-sunken)', fg: 'var(--text-secondary)' },
  approved: { bg: 'var(--prodet-green-tint)', fg: 'var(--prodet-green)' },
  needs_info: { bg: 'var(--surface-sunken)', fg: 'var(--text-secondary)' },
  rejected: { bg: 'var(--color-danger-bg)', fg: 'var(--color-danger)' },
};

const INVITE_TONE: Record<string, { bg: string; fg: string }> = {
  prepared: { bg: 'var(--surface-sunken)', fg: 'var(--text-secondary)' },
  sent: { bg: 'var(--prodet-blue-tint)', fg: 'var(--prodet-blue)' },
  accepted: { bg: 'var(--prodet-green-tint)', fg: 'var(--prodet-green)' },
  expired: { bg: 'var(--surface-sunken)', fg: 'var(--text-tertiary)' },
  revoked: { bg: 'var(--color-danger-bg)', fg: 'var(--color-danger)' },
};

export function AccessRequestsClient({ requests }: { requests: AccessRequestRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  // Near-real-time, matching the portal-requests queue.
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
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.company.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q)
      );
    });
  }, [requests, query, status]);

  const pending = (counts.new ?? 0) + (counts.reviewing ?? 0);
  const toSend = requests.filter((r) => r.inviteStatus === 'prepared').length;
  const active = requests.filter((r) => r.inviteStatus === 'accepted').length;

  return (
    <div className="dash">
      <div className="dash__stats dash__stats--3">
        <div className="stat-card">
          <div className="stat-card__value" style={{ color: 'var(--prodet-blue)' }}>
            {pending}
          </div>
          <div className="stat-card__label">À traiter</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{toSend}</div>
          <div className="stat-card__label">Invitations à envoyer</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value" style={{ color: 'var(--prodet-green)' }}>
            {active}
          </div>
          <div className="stat-card__label">Accès activés</div>
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
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginLeft: 'auto',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--prodet-green)',
            }}
          />
          Synchronisé en direct
        </div>
      </div>

      <div className="admin-toolbar" style={{ marginBottom: 0 }}>
        <div className="admin-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une société, un nom, un email, une ville…"
          />
        </div>
      </div>

      <div className="orders__list">
        {filtered.map((r) => {
          const tone = TONE[r.status] ?? {
            bg: 'var(--surface-sunken)',
            fg: 'var(--text-secondary)',
          };
          const inviteTone = r.inviteStatus ? INVITE_TONE[r.inviteStatus] : null;
          return (
            <Link
              key={r.id}
              href={`/admin/demandes-acces/${r.id}`}
              className="order-row order-row--link"
            >
              <div className="order-row__main">
                <div className="order-row__id-block">
                  <span className="order-row__id">{r.company}</span>
                  <span className="order-row__date">
                    {r.name} · {r.email}
                  </span>
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    gap: 8,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  {inviteTone && r.inviteLabel ? (
                    <span
                      className="pds-badge pds-badge--sm"
                      style={{ background: inviteTone.bg, color: inviteTone.fg }}
                    >
                      <Send size={13} /> {r.inviteLabel}
                    </span>
                  ) : null}
                  <span
                    className="pds-badge pds-badge--sm"
                    style={{ background: tone.bg, color: tone.fg }}
                  >
                    {r.statusLabel}
                  </span>
                </div>
              </div>
              <div className="order-row__meta">
                <span>
                  <Building2 size={15} /> {r.sector}
                </span>
                <span>
                  <MapPin size={15} /> {r.city}
                </span>
                <span style={{ color: 'var(--text-tertiary)' }}>
                  <Mail size={15} /> {r.phone}
                </span>
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
            <div>Aucune demande d’accès pour le moment.</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
