'use client';

import { useMemo, useState, useTransition } from 'react';
import { CheckCircle2, Plus, Repeat, Search, X } from 'lucide-react';
import { ConfirmDialog } from '@/components/ds';
import { Link, useRouter } from '@/i18n/routing';
import { cancelOrderAction } from './actions';

export type MyOrderRow = {
  id: string;
  reference: string;
  status: string;
  dateLabel: string;
  lineCount: number;
  swiverPushed: boolean;
  cancellable: boolean;
  /** Real Swiver total, preformatted server-side ("123,456 TND"), or null. */
  totalLabel: string | null;
};

const STATUS: Record<string, { label: string; tone: string }> = {
  parsing: { label: 'Brouillon', tone: 'neutral' },
  review: { label: 'En attente', tone: 'blue' },
  approved: { label: 'Confirmée', tone: 'green' },
  exported: { label: 'Clôturée', tone: 'green' },
  rejected: { label: 'Annulée', tone: 'neutral' },
};

const TABS = [
  { id: 'all', label: 'Toutes' },
  { id: 'review', label: 'En attente' },
  { id: 'approved', label: 'Confirmées' },
  { id: 'rejected', label: 'Annulées' },
];

export function MyOrdersClient({ orders }: { orders: MyOrderRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [canceled, setCanceled] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [confirming, setConfirming] = useState<MyOrderRow | null>(null);

  function cancel(id: string) {
    setConfirming(null);
    setCanceled((p) => new Set(p).add(id));
    startTransition(async () => {
      await cancelOrderAction(id);
      router.refresh();
    });
  }

  const effectiveStatus = (o: MyOrderRow) => (canceled.has(o.id) ? 'rejected' : o.status);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      const st = canceled.has(o.id) ? 'rejected' : o.status;
      if (tab === 'approved' && !['approved', 'exported'].includes(st)) return false;
      if (tab !== 'all' && tab !== 'approved' && st !== tab) return false;
      if (q && !o.reference.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [orders, tab, query, canceled]);

  const pushed = orders.filter((o) => o.swiverPushed && effectiveStatus(o) !== 'rejected').length;

  return (
    <div className="orders">
      <div className="dash__stats" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__value">{orders.length}</div>
          <div className="stat-card__label">Commandes</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value" style={{ color: 'var(--prodet-green)' }}>{pushed}</div>
          <div className="stat-card__label">Transmises à Prodet</div>
        </div>
      </div>

      <div className="otable-toolbar">
        <div className="otable-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`otable-tab${tab === t.id ? ' is-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="otable-toolbar__right">
          <div className="otable-search">
            <Search size={15} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Référence…"
              aria-label="Rechercher une commande"
            />
          </div>
          <Link href="/client/commander" className="pds-btn pds-btn--primary pds-btn--sm">
            <Plus size={15} /> <span>Nouvelle commande</span>
          </Link>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="otable">
          <div className="otable__head">
            <span>Référence</span>
            <span className="otable-hide-sm">Date</span>
            <span className="otable-hide-sm">Articles</span>
            <span style={{ textAlign: 'right' }}>Montant</span>
            <span>Statut</span>
            <span />
          </div>
          {filtered.map((o) => {
            const status = effectiveStatus(o);
            const s = STATUS[status] ?? { label: status, tone: 'neutral' };
            const isCanceled = status === 'rejected';
            const transmitted = o.swiverPushed && !isCanceled;
            return (
              <div className="otable__row" key={o.id}>
                <span className="otable__refcell">
                  <Link href={`/client/commandes/${o.id}`} className="otable__ref">
                    {transmitted ? (
                      <CheckCircle2 size={14} className="otable__ref-check" aria-label="Transmise à Prodet" />
                    ) : null}
                    <span>{o.reference}</span>
                  </Link>
                  <span className="otable__sub otable-only-sm">
                    {o.dateLabel}
                    {o.lineCount > 0 ? ` · ${o.lineCount} réf.` : ''}
                  </span>
                </span>
                <span className="otable__muted otable-hide-sm">{o.dateLabel}</span>
                <span className="otable__muted otable-hide-sm">
                  {o.lineCount > 0 ? `${o.lineCount} réf.` : '—'}
                </span>
                <span className="otable__amount">{o.totalLabel ?? '—'}</span>
                <span>
                  <span className={`otable-pill otable-pill--${s.tone}`}>{s.label}</span>
                </span>
                <span className="otable__actions">
                  <Link
                    href={`/client/commander?from=${o.id}`}
                    className="otable-iconbtn"
                    aria-label="Recommander"
                    title="Recommander"
                  >
                    <Repeat size={15} />
                  </Link>
                  {o.cancellable && !isCanceled ? (
                    <button
                      className="otable-iconbtn otable-iconbtn--danger"
                      onClick={() => setConfirming(o)}
                      disabled={pending}
                      aria-label="Annuler"
                      title="Annuler"
                    >
                      <X size={15} />
                    </button>
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="otable-empty">
          {tab === 'all' && !query
            ? 'Aucune commande pour le moment. Cliquez sur « Nouvelle commande ».'
            : 'Aucune commande dans cette catégorie.'}
        </div>
      )}

      <ConfirmDialog
        open={confirming != null}
        title="Annuler cette commande ?"
        message={
          confirming
            ? `La commande ${confirming.reference} sera également annulée chez Prodet.`
            : ''
        }
        confirmLabel="Annuler la commande"
        cancelLabel="Garder"
        danger
        pending={pending}
        onConfirm={() => confirming && cancel(confirming.id)}
        onClose={() => setConfirming(null)}
      />
    </div>
  );
}
