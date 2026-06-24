'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Lock, Search, X } from 'lucide-react';
import type { AcademyFamily, AcademyFamilyKey, AcademyProduct, FormulaRow } from './types';

type Lang = 'fr' | 'en';
const L = (lang: Lang, fr: string, en: string) => (lang === 'en' ? en : fr);

type ReformTab = 'why' | 'new' | 'old' | 'proc' | 'cost';

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
  const [tab, setTab] = useState<ReformTab>('why');

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const r = p.reform;
  const hasCost = Boolean(r && r.unitOld && r.unitNew);

  return (
    <div className="academy-modal-bg" onClick={onClose}>
      <div
        className="academy-modal"
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
              <div className="academy-reform__label">{L(lang, 'Détail de la reformulation', 'Reformulation detail')}</div>
              <div className="academy-reform__tabs" role="tablist">
                <ReformTabBtn id="why" cur={tab} set={setTab}>{L(lang, 'Pourquoi', 'Why')}</ReformTabBtn>
                <ReformTabBtn id="new" cur={tab} set={setTab}>{L(lang, 'Nouvelle', 'New')}</ReformTabBtn>
                <ReformTabBtn id="old" cur={tab} set={setTab}>{L(lang, 'Ancienne', 'Old')}</ReformTabBtn>
                <ReformTabBtn id="proc" cur={tab} set={setTab}>{L(lang, 'Procédure', 'Procedure')}</ReformTabBtn>
                {hasCost ? <ReformTabBtn id="cost" cur={tab} set={setTab}>{L(lang, 'Coûts', 'Cost')}</ReformTabBtn> : null}
              </div>

              {tab === 'why' ? (
                <ul className="academy-why">
                  {r.why.map((w, i) => (
                    <li key={i}>
                      <span className="academy-why__ico" aria-hidden>✓</span>
                      <span>{lang === 'en' ? w.en : w.fr}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {tab === 'new' ? (
                <>
                  <FormulaTable
                    rows={lang === 'en' ? r.newF_en : r.newF}
                    caption={L(lang, 'NOUVELLE FORMULE — lot 5 kg', 'NEW FORMULA — 5 kg batch')}
                    tone="new"
                    highlightChanged
                  />
                  <p className="academy-tablenote">
                    {L(lang, 'Surligné = ajouté/modifié vs ancienne', 'Highlighted = added/changed vs old')}
                  </p>
                </>
              ) : null}

              {tab === 'old' ? (
                <FormulaTable
                  rows={lang === 'en' ? r.oldF_en : r.oldF}
                  caption={L(lang, 'ANCIENNE FORMULE (réf. 2021)', 'OLD FORMULA (2021 ref.)')}
                  tone="old"
                />
              ) : null}

              {tab === 'proc' ? (
                <ol className="academy-proc">
                  {r.proc.map((s, i) => (
                    <li key={i}>
                      <span className="academy-proc__num">{i + 1}</span>
                      <span>{lang === 'en' ? s.en : s.fr}</span>
                    </li>
                  ))}
                </ol>
              ) : null}

              {tab === 'cost' && hasCost ? (
                <>
                  <div className="academy-cost">
                    <div className="academy-cost__box old">
                      <div className="cl">{L(lang, 'Ancienne', 'Old')}</div>
                      <div className="cv">{r.unitOld}</div>
                      <div className="cu">DT/kg</div>
                    </div>
                    <div className="academy-cost__box new">
                      <div className="cl">{L(lang, 'Nouvelle', 'New')}</div>
                      <div className="cv">{r.unitNew}</div>
                      <div className="cu">DT/kg</div>
                    </div>
                  </div>
                  <div className="academy-verdict">{lang === 'en' ? r.verdict_en : r.verdict_fr}</div>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ReformTabBtn({
  id,
  cur,
  set,
  children,
}: {
  id: ReformTab;
  cur: ReformTab;
  set: (t: ReformTab) => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={cur === id}
      className={`academy-reform__tab${cur === id ? ' on' : ''}`}
      onClick={() => set(id)}
    >
      {children}
    </button>
  );
}

function FormulaTable({
  rows,
  caption,
  tone,
  highlightChanged = false,
}: {
  rows: FormulaRow[];
  caption: string;
  tone: 'new' | 'old';
  highlightChanged?: boolean;
}) {
  return (
    <table className="academy-ftable">
      <thead>
        <tr>
          <th className={tone} colSpan={4}>{caption}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className={highlightChanged && row.changed ? 'hl' : ''}>
            <td className="ing">{row.ing}</td>
            <td className="qty">{row.qty}</td>
            <td className="pct">{row.pct}</td>
            <td className="role">{row.role}</td>
          </tr>
        ))}
      </tbody>
    </table>
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
