'use client';

import { useMemo, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
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
  /** 'swiver' rows are created in Swiver → read-only (no detail page/cancel). */
  origin: 'portal' | 'swiver';
};

const STATUS: Record<string, { key: string; tone: string }> = {
  parsing: { key: 'parsing', tone: 'neutral' },
  review: { key: 'review', tone: 'blue' },
  approved: { key: 'confirmed', tone: 'green' },
  exported: { key: 'closed', tone: 'green' },
  rejected: { key: 'cancelled', tone: 'neutral' },
};

const TABS = [
  { id: 'all', key: 'all' },
  { id: 'review', key: 'review' },
  { id: 'approved', key: 'confirmed' },
  { id: 'rejected', key: 'cancelled' },
];

export function MyOrdersClient({ orders }: { orders: MyOrderRow[] }) {
  const tr = useTranslations('portal.orders');
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
          <div className="stat-card__label">{tr('tabs.sent')}</div>
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
              {tr(`tabs.${t.key}`)}
            </button>
          ))}
        </div>
        <div className="otable-toolbar__right">
          <div className="otable-search">
            <Search size={15} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tr('searchPlaceholder')}
              aria-label={tr('searchLabel')}
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
            <span>{tr('reference')}</span>
            <span className="otable-hide-sm">Date</span>
            <span className="otable-hide-sm">Articles</span>
            <span style={{ textAlign: 'right' }}>Montant</span>
            <span>Statut</span>
            <span />
          </div>
          {filtered.map((o) => {
            const status = effectiveStatus(o);
            const s = STATUS[status];
            const isCanceled = status === 'rejected';
            const transmitted = o.swiverPushed && !isCanceled;
            const fromSwiver = o.origin === 'swiver';
            const refInner = (
              <>
                {transmitted ? (
                  <CheckCircle2 size={14} className="otable__ref-check" aria-label={tr('savedShort')} />
                ) : null}
                <span>{o.reference}</span>
              </>
            );
            return (
              <div className="otable__row" key={o.id}>
                <span className="otable__refcell">
                  {fromSwiver ? (
                    // Created in Swiver → read-only (no portal detail page).
                    <span className="otable__ref otable__ref--static">{refInner}</span>
                  ) : (
                    <Link href={`/client/commandes/${o.id}`} className="otable__ref">
                      {refInner}
                    </Link>
                  )}
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
                  <span className={`otable-pill otable-pill--${s?.tone ?? 'neutral'}`}>{s ? tr(`status.${s.key}`) : status}</span>
                </span>
                <span className="otable__actions">
                  {fromSwiver ? (
                    <span className="otable__origin" title={tr('savedLong')}>Prodet</span>
                  ) : (
                    <>
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
                    </>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="otable-empty">
          {tab === 'all' && !query
            ? tr('emptyAll')
            : tr('emptyCategory')}
        </div>
      )}

      <ConfirmDialog
        open={confirming != null}
        title={tr('cancelConfirm')}
        message={
          confirming
            ? `La commande ${confirming.reference} sera également annulée chez Prodet.`
            : ''
        }
        confirmLabel={tr('cancel')}
        cancelLabel="Garder"
        danger
        pending={pending}
        onConfirm={() => confirming && cancel(confirming.id)}
        onClose={() => setConfirming(null)}
      />
    </div>
  );
}
