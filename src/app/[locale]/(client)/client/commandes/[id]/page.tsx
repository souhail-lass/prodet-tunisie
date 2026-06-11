import { CheckCircle2, ChevronLeft, PackageCheck, Repeat } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getMyOrderDetail } from '@/features/client-portal/orders';

export const dynamic = 'force-dynamic';

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'Africa/Tunis',
});
const moneyFmt = new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

const FALLBACK_TONE = { bg: 'var(--surface-sunken)', fg: 'var(--text-secondary)', label: 'Brouillon' };

const STATUS_TONE: Record<string, { bg: string; fg: string; label: string }> = {
  parsing: FALLBACK_TONE,
  review: { bg: 'var(--prodet-blue-tint)', fg: 'var(--prodet-blue)', label: 'En attente' },
  approved: { bg: 'var(--prodet-green-tint)', fg: 'var(--prodet-green)', label: 'Confirmée' },
  exported: { bg: 'var(--prodet-green-tint)', fg: 'var(--prodet-green)', label: 'Clôturée' },
  rejected: { bg: 'var(--surface-sunken)', fg: 'var(--text-tertiary)', label: 'Annulée' },
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'portal' });

  let order = null;
  try {
    order = await getMyOrderDetail(id);
  } catch {
    order = null;
  }

  if (!order) {
    return (
      <div className="orders__empty">
        {t('orders.notFound')}{' '}
        <Link href="/client/commandes" className="ghost-link">
          {t('orders.backToOrdersShort')}
        </Link>
      </div>
    );
  }

  const tone = STATUS_TONE[order.status] ?? FALLBACK_TONE;
  const totalUnits = order.lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <div className="orders">
      <Link
        href="/client/commandes"
        className="ghost-link"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
      >
        <ChevronLeft size={15} /> {t('orders.backToOrders')}
      </Link>

      <div className="order-row">
        <div className="order-row__main">
          <div className="order-row__id-block">
            <span className="order-row__id">{order.reference}</span>
            <span className="order-row__date">{dateFmt.format(order.createdAt)}</span>
          </div>
          <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {order.swiverPushed && order.status !== 'rejected' ? (
              <span
                className="pds-badge pds-badge--md"
                style={{ background: 'var(--prodet-green-tint)', color: 'var(--prodet-green)' }}
              >
                <CheckCircle2 size={13} /> {t('orders.transmitted')}
              </span>
            ) : null}
            <span className="pds-badge pds-badge--md" style={{ background: tone.bg, color: tone.fg }}>
              {tone.label}
            </span>
          </div>
        </div>
        <div className="order-row__meta">
          <span>
            <PackageCheck size={15} /> {t('orders.meta', { items: order.lineCount, units: totalUnits })}
          </span>
          {order.totalTtc != null ? (
            <span className="order-row__total">{moneyFmt.format(order.totalTtc)} TND</span>
          ) : null}
        </div>
        <div className="order-row__actions">
          <Link href={`/client/commander?from=${order.id}`} className="pds-btn pds-btn--primary pds-btn--sm">
            <Repeat size={15} />
            <span>{t('orders.reorderList')}</span>
          </Link>
        </div>
      </div>

      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">{t('orders.detailTitle')}</h2>
        </div>
        <div className="order-lines">
          {order.lines.map((line) => (
            <div className="order-line-row" key={line.lineNumber}>
              <div className="order-line-row__thumb">
                {line.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={line.image} alt="" />
                ) : (
                  <span>{line.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="order-line-row__info">
                <strong>{line.name}</strong>
                <span>{[line.sku, line.note].filter(Boolean).join(' · ') || ' '}</span>
              </div>
              <span className="order-line-row__qty">× {line.quantity}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
