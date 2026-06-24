'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Lock, Search, X } from 'lucide-react';
import type { AcademyFamily, AcademyFamilyKey, AcademyProduct, FormulaRow } from './types';

type Lang = 'fr' | 'en';
const L = (lang: Lang, fr: string, en: string) => (lang === 'en' ? en : fr);

/** Parse a FR/EN decimal string ("1,49" / "1.49") to a number, or null. */
function parseCost(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number(v.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export function RangeExplorer({
  products,
  families,
}: {
  products: AcademyProduct[];
  families: AcademyFamily[];
}) {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('fr');
  const [fam, setFam] = useState<AcademyFamilyKey | 'all'>('all');
  const [query, setQuery] = useState('');
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const familyByKey = useMemo(() => {
    const map = {} as Record<AcademyFamilyKey, AcademyFamily>;
    for (const f of families) map[f.key] = f;
    return map;
  }, [families]);

  const counts = useMemo(() => {
    const c = {} as Record<AcademyFamilyKey, number>;
    for (const f of families) c[f.key] = 0;
    for (const p of products) c[p.f] += 1;
    return c;
  }, [families, products]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => fam === 'all' || p.f === fam)
      .filter(({ p }) => {
        if (!q) return true;
        const hay = [p.n, p.d_fr, p.d_en, p.cl_fr, p.cl_en, p.lo_fr, p.lo_en].join(' ').toLowerCase();
        return hay.includes(q);
      });
  }, [products, fam, query]);

  async function lock() {
    await fetch('/api/academy/unlock', { method: 'DELETE' }).catch(() => {});
    router.refresh();
  }

  return (
    <div className="academy-range">
      <div className="academy-range__bar">
        <div className="academy-range__search">
          <Search size={16} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={L(lang, 'Rechercher un produit…', 'Search a product…')}
            aria-label={L(lang, 'Rechercher un produit', 'Search a product')}
          />
        </div>
        <div className="academy-range__bar-right">
          <div className="academy-lang" role="group" aria-label="Langue">
            <button className={lang === 'fr' ? 'on' : ''} onClick={() => setLang('fr')} type="button">FR</button>
            <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')} type="button">EN</button>
          </div>
          <button type="button" className="academy-lock-btn" onClick={lock}>
            <Lock size={14} aria-hidden /> {L(lang, 'Verrouiller', 'Lock')}
          </button>
        </div>
      </div>

      <div className="academy-fchips">
        <button className={`academy-fchip${fam === 'all' ? ' on' : ''}`} type="button" onClick={() => setFam('all')}>
          {L(lang, 'Tous', 'All')} <span className="ct">{products.length}</span>
        </button>
        {families.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`academy-fchip${fam === f.key ? ' on' : ''}`}
            onClick={() => setFam(f.key)}
          >
            <span aria-hidden>{f.emoji}</span> {lang === 'en' ? f.en : f.fr} <span className="ct">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="academy-empty">{L(lang, 'Aucun produit ne correspond.', 'No product matches.')}</p>
      ) : (
        <div className="academy-pgrid">
          {visible.map(({ p, i }) => {
            const f = familyByKey[p.f];
            return (
              <button key={p.n} type="button" className="academy-pcard" onClick={() => setOpenIdx(i)}>
                {p.note_fr ? <span className="academy-pcard__flag" title={L(lang, 'Reformulation', 'Reformulation')} /> : null}
                <span className="academy-pcard__top">
                  <span className="academy-pcard__emoji" style={{ background: f.col }} aria-hidden>
                    {f.emoji}
                  </span>
                  <span>
                    <span className="academy-pcard__name">{p.n}</span>
                    <span className="academy-pcard__fam">{lang === 'en' ? f.en : f.fr}</span>
                  </span>
                </span>
                <span className="academy-pcard__desc">{lang === 'en' ? p.d_en : p.d_fr}</span>
                <span className="academy-pcard__open">
                  {L(lang, 'Détails', 'Details')} <ChevronRight size={13} aria-hidden />
                </span>
              </button>
            );
          })}
        </div>
      )}

      {openIdx !== null ? (
        <ProductModal
          product={products[openIdx]!}
          family={familyByKey[products[openIdx]!.f]}
          lang={lang}
          onClose={() => setOpenIdx(null)}
        />
      ) : null}
    </div>
  );
}

function ProductModal({
  product: p,
  family: f,
  lang,
  onClose,
}: {
  product: AcademyProduct;
  family: AcademyFamily;
  lang: Lang;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const r = p.reform;
  const oldCost = parseCost(r?.unitOld);
  const newCost = parseCost(r?.unitNew);
  const hasCost = oldCost !== null && newCost !== null;
  const deltaPct = hasCost && oldCost > 0 ? Math.round(((newCost - oldCost) / oldCost) * 100) : null;

  return (
    <div className="academy-modal-bg" onClick={onClose}>
      <div
        className={`academy-modal${r ? ' academy-modal--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={p.n}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="academy-modal__head">
          <span className="academy-modal__emoji" style={{ background: f.col }} aria-hidden>
            {f.emoji}
          </span>
          <div>
            <h2>{p.n}</h2>
            <div className="academy-modal__fam">{lang === 'en' ? f.en : f.fr}</div>
          </div>
          <button className="academy-modal__close" onClick={onClose} aria-label={L(lang, 'Fermer', 'Close')} type="button">
            <X size={16} />
          </button>
        </div>

        <div className="academy-modal__body">
          <Block label={L(lang, 'Ce que c’est', 'What it is')}>{lang === 'en' ? p.d_en : p.d_fr}</Block>
          <Block label={L(lang, 'Clients cibles', 'Target clients')}>{lang === 'en' ? p.cl_en : p.cl_fr}</Block>
          <Block label={L(lang, 'Logique de formule', 'Formula logic')}>{lang === 'en' ? p.lo_en : p.lo_fr}</Block>

          <div className="academy-pills">
            <Pill k="pH" v={p.ph} />
            <Pill k={L(lang, 'Mousse', 'Foam')} v={lang === 'en' ? p.foam_en : p.foam} />
            <Pill k={L(lang, 'Famille', 'Family')} v={lang === 'en' ? f.en : f.fr} />
          </div>

          {p.note_fr ? (
            <div className="academy-note">
              <strong>{L(lang, 'Reformulation', 'Reformulation')} :</strong> {lang === 'en' ? p.note_en : p.note_fr}
            </div>
          ) : null}

          {r ? (
            <div className="academy-reform">
              <div className="academy-reform__label">{L(lang, 'Reformulation — ancienne vs nouvelle', 'Reformulation — old vs new')}</div>

              <ul className="academy-why">
                {r.why.map((w, i) => (
                  <li key={i}>
                    <span className="academy-why__ico" aria-hidden>✓</span>
                    <span>{lang === 'en' ? w.en : w.fr}</span>
                  </li>
                ))}
              </ul>

              <div className="academy-compare">
                <FormulaColumn
                  tone="old"
                  title={L(lang, 'Ancienne (réf. 2021)', 'Old (2021 ref.)')}
                  cost={hasCost ? `${r.unitOld} DT/kg` : undefined}
                  rows={lang === 'en' ? r.oldF_en : r.oldF}
                />
                <FormulaColumn
                  tone="new"
                  title={L(lang, 'Nouvelle — lot 5 kg', 'New — 5 kg batch')}
                  cost={hasCost ? `${r.unitNew} DT/kg` : undefined}
                  rows={lang === 'en' ? r.newF_en : r.newF}
                  highlightChanged
                />
              </div>
              <p className="academy-tablenote">
                <span className="academy-changed-dot" aria-hidden />{' '}
                {L(lang, 'ajouté ou modifié vs ancienne', 'added or changed vs old')}
              </p>

              {hasCost ? (
                <div className="academy-costband">
                  <div className="academy-costband__pair">
                    <span className="academy-costband__v old">{r.unitOld}</span>
                    <span aria-hidden>→</span>
                    <span className="academy-costband__v new">{r.unitNew}</span>
                    <span className="academy-costband__unit">DT/kg</span>
                  </div>
                  {deltaPct !== null ? (
                    <span className={`academy-costband__delta ${deltaPct <= 0 ? 'down' : 'up'}`}>
                      {deltaPct > 0 ? '+' : ''}{deltaPct}%
                    </span>
                  ) : null}
                </div>
              ) : null}
              <div className="academy-verdict">{lang === 'en' ? r.verdict_en : r.verdict_fr}</div>

              <details className="academy-details">
                <summary>
                  {L(lang, 'Procédure de fabrication', 'Manufacturing procedure')}
                  <ChevronRight size={15} aria-hidden />
                </summary>
                <div className="academy-details__body">
                  <ol className="academy-proc">
                    {r.proc.map((s, i) => (
                      <li key={i}>
                        <span className="academy-proc__num">{i + 1}</span>
                        <span>{lang === 'en' ? s.en : s.fr}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </details>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FormulaColumn({
  rows,
  title,
  tone,
  cost,
  highlightChanged = false,
}: {
  rows: FormulaRow[];
  title: string;
  tone: 'new' | 'old';
  cost?: string;
  highlightChanged?: boolean;
}) {
  return (
    <div className="academy-fcol">
      <div className={`academy-fcol__head ${tone}`}>
        <span>{title}</span>
        {cost ? <span className="academy-fcol__cost">{cost}</span> : null}
      </div>
      <div className="academy-fcol__rows">
        {rows.map((row, i) => (
          <div key={i} className={`academy-frow${highlightChanged && row.changed ? ' changed' : ''}`}>
            <span className="academy-frow__ing">
              {row.ing}
              {highlightChanged && row.changed ? <span className="academy-changed-dot" aria-hidden /> : null}
            </span>
            <span className="academy-frow__qty">{row.qty}</span>
            <span className="academy-frow__role">{row.role}</span>
            <span className="academy-frow__pct">{row.pct}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="academy-block">
      <div className="academy-block__label">{label}</div>
      <p>{children}</p>
    </div>
  );
}

function Pill({ k, v }: { k: string; v: string }) {
  return (
    <div className="academy-pill">
      <div className="k">{k}</div>
      <div className="v">{v}</div>
    </div>
  );
}
