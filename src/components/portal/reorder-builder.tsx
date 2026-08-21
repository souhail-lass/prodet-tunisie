'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  PackageCheck,
  Repeat,
  Search,
  ShoppingBasket,
  Sparkles,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button, Input, ProductTile, QuantityControl } from '@/components/ds';
import { Link } from '@/i18n/routing';
import { submitPortalQuoteAction } from '@/features/client-portal/quote-actions';
import type { PortalProductRef } from '@/features/client-portal/mock/portal-mock';

/** Cap the grid so a large catalogue never floods the DOM — search narrows it. */
const DISPLAY_CAP = 60;

const FREQUENT = '__frequent__';
const ALL = '__all__';

export function ReorderBuilder({
  catalogue,
  frequent,
  initialQty,
  initialExtra,
  noticeFrom,
  initialQuery,
}: {
  catalogue: PortalProductRef[];
  frequent: PortalProductRef[];
  initialQty: Record<string, number>;
  initialExtra: PortalProductRef[];
  noticeFrom?: string;
  initialQuery?: string;
}) {
  const t = useTranslations('portal');
  const [qty, setQty] = useState<Record<string, number>>(initialQty);
  const [extra, setExtra] = useState<PortalProductRef[]>(initialExtra);
  // Selection order, newest first — drives the basket order.
  const [picked, setPicked] = useState<string[]>(() =>
    Object.keys(initialQty).filter((slug) => (initialQty[slug] ?? 0) > 0),
  );
  const [query, setQuery] = useState(initialQuery ?? '');
  const [filter, setFilter] = useState<string>(frequent.length ? FREQUENT : ALL);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [pushed, setPushed] = useState(false);
  // Which button is mid-flight ('order' | 'devis' | null) and what was submitted.
  const [submitting, setSubmitting] = useState<'order' | 'devis' | null>(null);
  const [submittedKind, setSubmittedKind] = useState<'order' | 'devis'>('order');
  const [submitError, setSubmitError] = useState(false);

  const bySlug = useMemo(() => {
    const map = new Map<string, PortalProductRef>();
    for (const p of catalogue) map.set(p.slug, p);
    for (const p of frequent) map.set(p.slug, p);
    for (const p of extra) map.set(p.slug, p);
    return map;
  }, [catalogue, frequent, extra]);

  // Distinct category labels present in the orderable catalogue.
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of catalogue) if (p.category) set.add(p.category);
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [catalogue]);

  const q = query.trim().toLowerCase();
  const searching = q.length >= 1;

  const visible = useMemo(() => {
    if (searching) {
      return catalogue.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q),
      );
    }
    if (filter === FREQUENT) return frequent;
    if (filter === ALL) return catalogue;
    return catalogue.filter((p) => (p.category ?? '') === filter);
  }, [searching, q, filter, catalogue, frequent]);

  const shown = visible.slice(0, DISPLAY_CAP);
  const overflow = visible.length - shown.length;

  const lines = picked
    .map((slug) => bySlug.get(slug))
    .filter((p): p is PortalProductRef => Boolean(p) && (qty[p!.slug] ?? 0) > 0);
  const totalUnits = lines.reduce((sum, p) => sum + (qty[p.slug] ?? 0), 0);
  const refsCount = lines.length;
  const countKey = `${refsCount}-${totalUnits}`;

  function setProductQty(slug: string, n: number) {
    const next = Math.max(0, n);
    setQty((prev) => ({ ...prev, [slug]: next }));
    setPicked((prev) => {
      if (next <= 0) return prev.filter((s) => s !== slug);
      return prev.includes(slug) ? prev : [slug, ...prev];
    });
  }

  function changeQty(product: PortalProductRef, n: number) {
    setExtra((prev) => (prev.some((p) => p.slug === product.slug) ? prev : [...prev, product]));
    setProductQty(product.slug, n);
  }

  function pickChip(value: string) {
    setFilter(value);
    setQuery('');
  }

  async function handleSubmit(kind: 'order' | 'devis') {
    if (submitting) return;
    setSubmitting(kind);
    setSubmitError(false);
    try {
      const result = await submitPortalQuoteAction(
        lines.map((p) => ({
          name: p.name,
          sku: p.sku ?? null,
          swiverId: p.swiverId ?? null,
          quantity: qty[p.slug] ?? 0,
          unitPrice: p.unitPrice ?? null,
        })),
        kind,
      );
      if (result.ok) {
        if (result.referenceCode) setReference(result.referenceCode);
        setPushed(Boolean(result.swiverPushed));
        setSubmittedKind(kind);
        setSubmitted(true);
      } else {
        setSubmitError(true);
      }
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(null);
    }
  }

  if (submitted) {
    return (
      <div className="reorder">
        <div className="panel reorder-success">
          <span className="reorder-success__icon">
            <Check size={26} />
          </span>
          <h2 className="panel__title" style={{ marginTop: 16 }}>
            {submittedKind === 'devis' ? t('reorder.successTitleDevis') : t('reorder.successTitleOrder')}
          </h2>
          <p className="panel__sub" style={{ marginTop: 6 }}>
            {t('reorder.successBody', { count: lines.length, units: totalUnits })}
          </p>
          {reference ? (
            <p className="reorder-success__ref">
              {pushed ? <CheckCircle2 size={15} /> : <FileText size={15} />}
              <span>{pushed ? t('reorder.transmitted', { reference }) : reference}</span>
            </p>
          ) : null}
          <div
            style={{
              marginTop: 20,
              display: 'inline-flex',
              gap: 10,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <Link
              href={submittedKind === 'devis' ? '/client/devis' : '/client/commandes'}
              className="pds-btn pds-btn--primary pds-btn--md"
            >
              <span>{submittedKind === 'devis' ? t('reorder.viewDevis') : t('reorder.viewOrders')}</span>
            </Link>
            <Link href="/client" className="pds-btn pds-btn--ghost pds-btn--md">
              <span>{t('reorder.backToDashboard')}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cart = (
    <>
      <div className="desk-cart__head">
        <h2 className="desk-cart__title">
          <ShoppingBasket size={18} />
          {t('reorder.selectionTitle')}
        </h2>
        {lines.length ? (
          <button
            type="button"
            className="ghost-link"
            onClick={() => {
              setPicked([]);
              setQty({});
            }}
          >
            {t('reorder.clearAll')}
          </button>
        ) : null}
      </div>

      {lines.length ? (
        <ul className="desk-cart__list">
          {lines.map((product) => (
            <li className="desk-cart__row" key={product.slug}>
              <span className="desk-cart__thumb">
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image} alt="" />
                ) : (
                  <span>{product.name.slice(0, 2).toUpperCase()}</span>
                )}
              </span>
              <div className="desk-cart__info">
                <strong>{product.name}</strong>
                <span>{product.sku || product.category || ''}</span>
              </div>
              <QuantityControl
                className="desk-cart__qty"
                value={qty[product.slug] ?? 0}
                onChange={(n) => setProductQty(product.slug, n)}
              />
              <button
                type="button"
                className="desk-cart__remove"
                onClick={() => setProductQty(product.slug, 0)}
                aria-label={t('reorder.remove')}
                title={t('reorder.remove')}
              >
                <X size={15} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="desk-cart__empty">
          <span className="desk-cart__empty-icon">
            <ShoppingBasket size={24} />
          </span>
          <strong>{t('reorder.cartEmpty')}</strong>
          <span>{t('reorder.cartEmptyHint')}</span>
        </div>
      )}

      <div className="desk-cart__foot">
        <div className="desk-cart__summary">
          <span className="desk-cart__summary-label">{t('reorder.cartTotal')}</span>
          <span key={countKey} className="desk-cart__summary-count">
            {lines.length ? t('reorder.barRefs', { count: refsCount, units: totalUnits }) : '—'}
          </span>
        </div>
        {submitError ? <span className="desk-cart__error">{t('reorder.submitError')}</span> : null}
        <div className="desk-cart__actions">
          <Button
            variant="primary"
            size="lg"
            className="desk-cart__submit"
            disabled={!lines.length || submitting !== null}
            onClick={() => handleSubmit('order')}
            iconRight={submitting ? undefined : <ArrowRight size={18} />}
          >
            {submitting === 'order' ? t('reorder.submitting') : t('reorder.submitOrder')}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="desk-cart__submit"
            disabled={!lines.length || submitting !== null}
            onClick={() => handleSubmit('devis')}
            iconRight={submitting ? undefined : <FileText size={17} />}
          >
            {submitting === 'devis' ? t('reorder.submitting') : t('reorder.submitDevis')}
          </Button>
        </div>
        <p className="desk-cart__note">{t('reorder.reviewNote')}</p>
      </div>
    </>
  );

  return (
    <div className="desk">
      {noticeFrom ? (
        <div className="desk__notice">
          <Repeat size={18} />
          <span>{t('reorder.notice', { order: noticeFrom })}</span>
        </div>
      ) : null}

      <div className="desk__grid">
        {/* ---- Catalogue browser ---- */}
        <section className="desk__catalogue">
          <div className="desk__toolbar">
            <div className="desk__search">
              <Input
                icon={<Search size={17} />}
                placeholder={t('reorder.searchPlaceholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus={Boolean(initialQuery)}
                aria-label={t('reorder.searchPlaceholder')}
              />
            </div>
            <div className="desk__chips" role="tablist" aria-label={t('reorder.catalogueTitle')}>
              {frequent.length ? (
                <button
                  type="button"
                  role="tab"
                  aria-selected={!searching && filter === FREQUENT}
                  className={`desk-chip${!searching && filter === FREQUENT ? ' is-active' : ''}`}
                  onClick={() => pickChip(FREQUENT)}
                >
                  <Sparkles size={14} />
                  {t('reorder.filterFrequent')}
                </button>
              ) : null}
              <button
                type="button"
                role="tab"
                aria-selected={!searching && filter === ALL}
                className={`desk-chip${!searching && filter === ALL ? ' is-active' : ''}`}
                onClick={() => pickChip(ALL)}
              >
                {t('reorder.filterAll')}
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={!searching && filter === c}
                  className={`desk-chip${!searching && filter === c ? ' is-active' : ''}`}
                  onClick={() => pickChip(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {shown.length > 0 ? (
            <>
              <div className="desk__products">
                {shown.map((product) => (
                  <ProductTile
                    key={product.slug}
                    name={product.name}
                    tagline={product.last ?? product.category ?? product.sku ?? ''}
                    image={product.image}
                    manufactured={product.made}
                    addLabel={t('reorder.add')}
                    quantity={qty[product.slug] ?? 0}
                    onQuantityChange={(n) => changeQty(product, n)}
                    className={(qty[product.slug] ?? 0) > 0 ? 'is-selected' : ''}
                  />
                ))}
              </div>
              {overflow > 0 ? (
                <p className="desk__overflow">{t('reorder.more', { count: overflow })}</p>
              ) : null}
            </>
          ) : (
            <div className="desk__empty">
              <PackageCheck size={24} />
              <p>
                {searching
                  ? t('reorder.noMatch', { query: query.trim() })
                  : t('reorder.emptyCatalogue')}
              </p>
            </div>
          )}
        </section>

        {/* ---- Live basket ---- */}
        <aside className="desk__cart" id="cart" aria-label={t('reorder.selectionTitle')}>
          {cart}
        </aside>
      </div>

      {/* ---- Mobile sticky action bar ---- */}
      <div className={`desk-bar${lines.length ? ' is-visible' : ''}`}>
        <a href="#cart" className="desk-bar__info">
          <ShoppingBasket size={20} />
          <span key={countKey} className="desk-bar__count">
            {lines.length ? t('reorder.barRefs', { count: refsCount, units: totalUnits }) : t('reorder.barEmpty')}
          </span>
        </a>
        <div className="desk-bar__actions">
          <Button
            variant="outline"
            size="md"
            disabled={!lines.length || submitting !== null}
            onClick={() => handleSubmit('devis')}
          >
            {submitting === 'devis' ? t('reorder.submitting') : t('reorder.submitDevis')}
          </Button>
          <Button
            variant="primary"
            size="md"
            disabled={!lines.length || submitting !== null}
            onClick={() => handleSubmit('order')}
            iconRight={submitting ? undefined : <ArrowRight size={17} />}
          >
            {submitting === 'order' ? t('reorder.submitting') : t('reorder.submitOrder')}
          </Button>
        </div>
      </div>
    </div>
  );
}
