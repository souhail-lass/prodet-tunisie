import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Crown,
  FileText,
  PackageCheck,
  Plus,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  Truck,
  Wallet,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { CountUp } from '@/components/portal/count-up';
import { SpendingChart } from '@/components/portal/spending-chart';
import {
  listMyFrequentProducts,
  listMyOrders,
  type FrequentProduct,
  type PortalOrderRow,
} from '@/features/client-portal/orders';
import { getMySpending } from '@/features/client-portal/spending';

export const dynamic = 'force-dynamic';

const dateFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeZone: 'Africa/Tunis' });
const dueDateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Tunis' });
const moneyFmt = new Intl.NumberFormat('fr-TN', { maximumFractionDigits: 0 });

const FALLBACK_TONE = { bg: 'var(--surface-sunken)', fg: 'var(--text-secondary)', label: 'Brouillon' };

const STATUS_TONE: Record<string, { bg: string; fg: string; label: string }> = {
  parsing: FALLBACK_TONE,
  review: { bg: 'var(--prodet-blue-tint)', fg: 'var(--prodet-blue)', label: 'En attente' },
  approved: { bg: 'var(--prodet-green-tint)', fg: 'var(--prodet-green)', label: 'Confirmée' },
  exported: { bg: 'var(--prodet-green-tint)', fg: 'var(--prodet-green)', label: 'Clôturée' },
  rejected: { bg: 'var(--surface-sunken)', fg: 'var(--text-tertiary)', label: 'Annulée' },
};

function heroDateFmt(locale: string): Intl.DateTimeFormat {
  const tag = locale === 'ar' ? 'ar-TN' : locale === 'en' ? 'en' : 'fr-FR';
  return new Intl.DateTimeFormat(tag, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Africa/Tunis',
  });
}

export default async function ClientDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'portal' });

  const spendingPromise = getMySpending();
  let orders: PortalOrderRow[] = [];
  let frequent: FrequentProduct[] = [];
  try {
    [orders, frequent] = await Promise.all([listMyOrders(), listMyFrequentProducts(4)]);
  } catch {
    // Unauthenticated/demo — render the onboarding empty state below.
  }
  const spending = await spendingPromise;
  const showFinances = spending.linked && spending.invoiceCount > 0;
  // String, not number: ICU would group-format 2026 as "2 026".
  const year = String(new Date().getFullYear());

  const active = orders.filter((o) => o.status === 'review');
  const confirmed = orders.filter((o) => o.status === 'approved' || o.status === 'exported');
  const lastOrder = orders[0] ?? null;
  const recent = orders.slice(0, 5);

  const deltaChip =
    spending.momDeltaPct != null ? (
      <span className={`fin-delta ${spending.momDeltaPct >= 0 ? 'fin-delta--up' : 'fin-delta--down'}`}>
        {spending.momDeltaPct >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        {spending.momDeltaPct >= 0 ? '+' : ''}
        {spending.momDeltaPct}% {t('spending.vsLastMonth')}
      </span>
    ) : null;

  return (
    <div className="dash">
      {showFinances ? (
        <section className="fin-hero">
          <div className="fin-hero__main">
            <p className="fin-hero__greet">
              {t('spending.greeting')} 👋 <span>· {heroDateFmt(locale).format(new Date())}</span>
            </p>
            <h2 className="fin-hero__title">{t('spending.heroTitle', { year })}</h2>
            <p className="fin-hero__value">
              <CountUp value={spending.thisYear} />
              <span className="fin-hero__currency">{spending.currency}</span>
            </p>
            <div className="fin-hero__meta">
              {spending.tier?.label ? (
                <span className={`fin-tier fin-tier--${spending.tier.id}`}>
                  <Crown size={13} /> Partenaire {spending.tier.label}
                </span>
              ) : null}
              {deltaChip}
              <span className="fin-hero__count">{t('spending.invoiceCount', { count: spending.invoiceCount })}</span>
            </div>
            {spending.tier?.nextLabel && spending.tier.remainingToNext > 0 ? (
              <div className="fin-tier-progress" title={`Progression vers ${spending.tier.nextLabel}`}>
                <div className="fin-tier-progress__bar">
                  <span style={{ width: `${spending.tier.progressPct}%` }} />
                </div>
                <span className="fin-tier-progress__label">
                  Plus que {moneyFmt.format(spending.tier.remainingToNext)} {spending.currency} avant le statut{' '}
                  {spending.tier.nextLabel}
                </span>
              </div>
            ) : null}
            <Link href="/client/factures" className="fin-hero__link">
              {t('spending.viewInvoices')} <ArrowRight size={15} />
            </Link>
          </div>
          <div className="fin-hero__chart">
            <SpendingChart
              monthly={spending.monthly}
              currency={spending.currency}
              locale={locale}
              title={t('spending.chartTitle')}
            />
          </div>
        </section>
      ) : null}

      {showFinances && spending.outstanding > 0 ? (
        <Link href="/client/factures" className="fin-reminder">
          <span className="fin-reminder__icon">
            <ReceiptText size={20} />
          </span>
          <div className="fin-reminder__body">
            <strong>
              {moneyFmt.format(spending.outstanding)} {spending.currency} à régler
            </strong>
            <span>
              {t('spending.unpaid', { count: spending.unpaidCount })}
              {spending.nextDueISO ? ` · échéance ${dueDateFmt.format(new Date(spending.nextDueISO))}` : ''}
            </span>
          </div>
          <ArrowRight size={18} className="fin-reminder__arrow" />
        </Link>
      ) : null}

      <div className="dash__stats">
        {showFinances ? (
          <>
            <div className="stat-card">
              <span className="stat-card__icon stat-card__icon--blue">
                <Wallet size={20} />
              </span>
              <div className="stat-card__value">
                <CountUp value={spending.thisMonth} /> <small className="stat-card__unit">{spending.currency}</small>
              </div>
              <div className="stat-card__label">{t('spending.thisMonth')}</div>
            </div>
            <div className="stat-card">
              <span className={`stat-card__icon ${spending.outstanding > 0 ? 'stat-card__icon--amber' : 'stat-card__icon--green'}`}>
                <ReceiptText size={20} />
              </span>
              <div className="stat-card__value">
                <CountUp value={spending.outstanding} /> <small className="stat-card__unit">{spending.currency}</small>
              </div>
              <div className="stat-card__label">
                {spending.outstanding > 0
                  ? t('spending.unpaid', { count: spending.unpaidCount })
                  : t('spending.allSettled')}
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-card__icon stat-card__icon--amber">
                <Clock size={20} />
              </span>
              <div className="stat-card__value">{active.length}</div>
              <div className="stat-card__label">{t('stats.active')}</div>
            </div>
            <div className="stat-card">
              <span className="stat-card__icon stat-card__icon--blue">
                <Truck size={20} />
              </span>
              <div className="stat-card__value">{lastOrder ? dateFmt.format(lastOrder.createdAt) : '—'}</div>
              <div className="stat-card__label">{t('stats.lastOrder')}</div>
            </div>
          </>
        ) : (
          (
            [
              { id: 'total', value: orders.length, label: t('stats.total'), icon: PackageCheck, tone: 'blue' },
              { id: 'active', value: active.length, label: t('stats.active'), icon: Clock, tone: 'amber' },
              { id: 'confirmed', value: confirmed.length, label: t('stats.confirmed'), icon: CheckCircle2, tone: 'green' },
              {
                id: 'last',
                value: lastOrder ? dateFmt.format(lastOrder.createdAt) : '—',
                label: t('stats.lastOrder'),
                icon: Truck,
                tone: 'blue',
              },
            ] as const
          ).map((stat) => {
            const Icon = stat.icon;
            return (
              <div className="stat-card" key={stat.id}>
                <span className={`stat-card__icon stat-card__icon--${stat.tone}`}>
                  <Icon size={20} />
                </span>
                <div className="stat-card__value">{stat.value}</div>
                <div className="stat-card__label">{stat.label}</div>
              </div>
            );
          })
        )}
      </div>

      <div className="dash__cols">
        <section className="panel">
          <div className="panel__head">
            <h2 className="panel__title">{t('dashboard.recentOrders')}</h2>
            <Link href="/client/commandes" className="panel__link">
              {t('dashboard.seeAll')} <ChevronRight size={15} />
            </Link>
          </div>
          {recent.length > 0 ? (
            <div className="order-table">
              <div className="order-table__head">
                <span>{t('dashboard.colReference')}</span>
                <span>{t('dashboard.colDate')}</span>
                <span>{t('dashboard.colItems')}</span>
                <span>{t('dashboard.colStatus')}</span>
                <span />
              </div>
              {recent.map((order) => {
                const tone = STATUS_TONE[order.status] ?? FALLBACK_TONE;
                return (
                  <div className="order-table__row" key={order.id}>
                    <span className="order-table__id">
                      <Link href={`/client/commandes/${order.id}`} className="order-table__id-link">
                        {order.reference}
                      </Link>
                    </span>
                    <span className="order-table__muted">{dateFmt.format(order.createdAt)}</span>
                    <span className="order-table__muted">
                      {order.lineCount} réf.
                      {order.totalTtc != null ? ` · ${moneyFmt.format(order.totalTtc)} TND` : ''}
                    </span>
                    <span>
                      <span className="pds-badge pds-badge--sm" style={{ background: tone.bg, color: tone.fg }}>
                        {tone.label}
                      </span>
                    </span>
                    <span className="order-table__actions">
                      <Link href={`/client/commander?from=${order.id}`} className="ghost-link">
                        {t('dashboard.reorder')}
                      </Link>
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="dash-empty">
              <PackageCheck size={22} />
              <p>{t('dashboard.noOrders')}</p>
            </div>
          )}
        </section>

        <section className="panel panel--next">
          <div className="panel__head">
            <h2 className="panel__title">{t('dashboard.lastOrderTitle')}</h2>
          </div>
          {lastOrder ? (
            <div className="next-delivery">
              <span className="next-delivery__icon">
                <Truck size={24} />
              </span>
              <div className="next-delivery__date">{lastOrder.reference}</div>
              <div className="next-delivery__order">
                {dateFmt.format(lastOrder.createdAt)} · {lastOrder.lineCount} réf.
              </div>
              <span
                className="pds-badge pds-badge--md"
                style={{
                  background: (STATUS_TONE[lastOrder.status] ?? FALLBACK_TONE).bg,
                  color: (STATUS_TONE[lastOrder.status] ?? FALLBACK_TONE).fg,
                }}
              >
                {lastOrder.swiverPushed
                  ? t('dashboard.transmitted')
                  : (STATUS_TONE[lastOrder.status] ?? FALLBACK_TONE).label}
              </span>
              {spending.lastInvoice ? (
                <div className="next-delivery__order" style={{ marginTop: 2 }}>
                  {t('spending.lastInvoice', { ref: spending.lastInvoice.reference })} ·{' '}
                  {moneyFmt.format(spending.lastInvoice.total)} {spending.currency}
                </div>
              ) : null}
              <Link
                href={`/client/commandes/${lastOrder.id}`}
                className="pds-btn pds-btn--outline pds-btn--md pds-btn--block"
                style={{ marginTop: 10 }}
              >
                <span>{t('dashboard.viewOrder')}</span>
              </Link>
            </div>
          ) : (
            <div className="next-delivery">
              <span className="next-delivery__icon">
                <FileText size={24} />
              </span>
              <div className="next-delivery__date">{t('dashboard.welcomeTitle')}</div>
              <p className="next-delivery__order">{t('dashboard.welcomeBody')}</p>
              <Link
                href="/client/commander"
                className="pds-btn pds-btn--primary pds-btn--md pds-btn--block"
                style={{ marginTop: 10 }}
              >
                <span>{t('nav.newOrder')}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </section>

        {frequent.length > 0 ? (
          <section className="panel panel--quick">
            <div className="panel__head">
              <div>
                <h2 className="panel__title">{t('dashboard.quickReorder')}</h2>
                <p className="panel__sub">{t('dashboard.quickReorderSub')}</p>
              </div>
              <Link href="/client/commander" className="panel__link">
                {t('dashboard.reorderAll')} <ChevronRight size={15} />
              </Link>
            </div>
            <div className="quick-reorder">
              {frequent.map((product) => (
                <div className="quick-item" key={product.slug}>
                  <div className="quick-item__thumb">
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image} alt="" />
                    ) : (
                      <span>{product.name.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="quick-item__info">
                    <strong>{product.name}</strong>
                    <span>
                      {product.sku ?? ''}
                      {product.orderCount > 1 ? ` · ${t('dashboard.orderedTimes', { count: product.orderCount })}` : ''}
                    </span>
                  </div>
                  <Link
                    href={`/client/commander?add=${product.slug}`}
                    className="pds-btn pds-btn--success pds-btn--sm"
                  >
                    <Plus size={15} />
                    <span>{t('dashboard.add')}</span>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
