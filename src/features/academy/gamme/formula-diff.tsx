'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { FormulaRow, Reform } from '../types';

type Lang = 'fr' | 'en';
const t = (lang: Lang, fr: string, en: string) => (lang === 'en' ? en : fr);

/** Parse a FR/EN decimal string ("1,49" / "1.49") to a number, or null. */
function parseCost(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number(v.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/** Normalize an ingredient name so old↔new rows can be matched. */
function key(name: string): string {
  return name
    .toLowerCase()
    .split('/')[0]!
    .replace(/\([^)]*\)/g, '')
    .replace(/[—–-].*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

type DiffStatus = 'added' | 'removed' | 'changed' | 'kept';
type DiffEntry = {
  status: DiffStatus;
  ing: string;
  role: string;
  qty: string;
  oldQty?: string;
  pct: string;
};

const SIGN: Record<DiffStatus, string> = { added: '+', removed: '−', changed: '±', kept: '·' };

function buildDiff(oldF: FormulaRow[], newF: FormulaRow[]): DiffEntry[] {
  const oldByKey = new Map<string, FormulaRow>();
  oldF.forEach((r) => oldByKey.set(key(r.ing), r));
  const consumed = new Set<string>();
  const out: DiffEntry[] = [];

  for (const r of newF) {
    const k = key(r.ing);
    const prev = oldByKey.get(k);
    if (prev) {
      consumed.add(k);
      const changed = prev.qty.replace(/\s/g, '') !== r.qty.replace(/\s/g, '');
      out.push({
        status: changed ? 'changed' : 'kept',
        ing: r.ing,
        role: r.role,
        qty: r.qty,
        oldQty: changed ? prev.qty : undefined,
        pct: r.pct,
      });
    } else {
      out.push({ status: 'added', ing: r.ing, role: r.role, qty: r.qty, pct: r.pct });
    }
  }
  for (const r of oldF) {
    if (!consumed.has(key(r.ing))) {
      out.push({ status: 'removed', ing: r.ing, role: r.role, qty: r.qty, pct: r.pct });
    }
  }
  // Surface the meaningful changes first; keep "unchanged" at the bottom.
  const order: Record<DiffStatus, number> = { added: 0, changed: 1, removed: 2, kept: 3 };
  return out.sort((a, b) => order[a.status] - order[b.status]);
}

export function FormulaDiff({ reform, lang }: { reform: Reform; lang: Lang }) {
  const [showKept, setShowKept] = useState(false);

  const oldF = lang === 'en' ? reform.oldF_en : reform.oldF;
  const newF = lang === 'en' ? reform.newF_en : reform.newF;
  const diff = useMemo(() => buildDiff(oldF, newF), [oldF, newF]);

  const oldCost = parseCost(reform.unitOld);
  const newCost = parseCost(reform.unitNew);
  const hasCost = oldCost !== null && newCost !== null;
  const deltaPct = hasCost && oldCost! > 0 ? Math.round(((newCost! - oldCost!) / oldCost!) * 100) : null;
  const maxCost = hasCost ? Math.max(oldCost!, newCost!) : 1;

  const keptCount = diff.filter((d) => d.status === 'kept').length;
  const visible = showKept ? diff : diff.filter((d) => d.status !== 'kept');

  return (
    <>
      {hasCost ? (
        <div className="cost">
          <div className="cost__top">
            <span className="cost__label">{t(lang, 'Coût matière', 'Material cost')}</span>
            {deltaPct !== null ? (
              <span className={`cost__delta ${deltaPct <= 0 ? 'down' : 'up'}`}>
                {deltaPct > 0 ? '+' : ''}{deltaPct}%
              </span>
            ) : null}
          </div>
          <div className="cost__values">
            <span className="cost__v old">{reform.unitOld}</span>
            <span className="cost__arrow" aria-hidden>→</span>
            <span className="cost__v">{reform.unitNew}</span>
            <span className="cost__unit">DT/kg</span>
          </div>
          <div className="cost__bars">
            <div className="cost__barrow">
              <span className="cost__bartag">{t(lang, 'Ancien', 'Old')}</span>
              <span className="cost__bartrack"><span className="cost__barfill old" style={{ width: `${(oldCost! / maxCost) * 100}%` }} /></span>
              <span className="cost__barval">{reform.unitOld} DT</span>
            </div>
            <div className="cost__barrow">
              <span className="cost__bartag">{t(lang, 'Nouveau', 'New')}</span>
              <span className="cost__bartrack"><span className="cost__barfill new" style={{ width: `${(newCost! / maxCost) * 100}%` }} /></span>
              <span className="cost__barval">{reform.unitNew} DT</span>
            </div>
          </div>
          <p className="cost__verdict">{lang === 'en' ? reform.verdict_en : reform.verdict_fr}</p>
        </div>
      ) : (
        <div className="detail-block" style={{ marginTop: 18 }}>
          <div className="detail-block__label">{t(lang, 'Verdict', 'Verdict')}</div>
          <p>{lang === 'en' ? reform.verdict_en : reform.verdict_fr}</p>
        </div>
      )}

      <div className="diff">
        <div className="diff__head">
          <span className="diff__title">{t(lang, 'Ce qui a changé — ancienne → nouvelle', 'What changed — old → new')}</span>
          <span className="diff__legend">
            <span><span className="diff__legdot" style={{ background: 'var(--ac-green)' }} />{t(lang, 'Ajouté', 'Added')}</span>
            <span><span className="diff__legdot" style={{ background: '#d9941f' }} />{t(lang, 'Modifié', 'Changed')}</span>
            <span><span className="diff__legdot" style={{ background: '#c0392b' }} />{t(lang, 'Retiré', 'Removed')}</span>
          </span>
        </div>

        {visible.map((d, i) => (
          <div key={`${d.ing}-${i}`} className={`diff-row is-${d.status}`}>
            <span className="diff-row__sign" aria-hidden>{SIGN[d.status]}</span>
            <span className="diff-row__ing">{d.ing}</span>
            <span className="diff-row__qty">{d.qty}</span>
            <span className="diff-row__role">{d.role}</span>
            <span className="diff-row__delta">
              {d.status === 'added'
                ? t(lang, 'nouveau', 'new')
                : d.status === 'removed'
                  ? t(lang, 'retiré', 'removed')
                  : d.status === 'changed'
                    ? `${d.oldQty} → ${d.qty}`
                    : d.pct}
            </span>
          </div>
        ))}

        {keptCount > 0 ? (
          <button type="button" className="diff-toggle" onClick={() => setShowKept((v) => !v)} aria-expanded={showKept}>
            {showKept ? <ChevronDown size={15} aria-hidden /> : <ChevronRight size={15} aria-hidden />}
            {showKept
              ? t(lang, 'Masquer les inchangés', 'Hide unchanged')
              : t(lang, `Voir ${keptCount} ingrédient${keptCount > 1 ? 's' : ''} inchangé${keptCount > 1 ? 's' : ''}`, `Show ${keptCount} unchanged`)}
          </button>
        ) : null}
      </div>

      <div className="diff" style={{ marginTop: 18 }}>
        <span className="diff__title" style={{ display: 'block', marginBottom: 8 }}>{t(lang, 'Pourquoi', 'Why')}</span>
        <ul className="academy-why">
          {reform.why.map((w, i) => (
            <li key={i}>
              <span className="academy-why__ico" aria-hidden>✓</span>
              <span>{lang === 'en' ? w.en : w.fr}</span>
            </li>
          ))}
        </ul>
      </div>

      <details className="academy-details">
        <summary>
          {t(lang, 'Procédure de fabrication', 'Manufacturing procedure')}
          <ChevronRight size={15} aria-hidden />
        </summary>
        <div className="academy-details__body">
          <ol className="academy-proc">
            {reform.proc.map((s, i) => (
              <li key={i}>
                <span className="academy-proc__num">{i + 1}</span>
                <span>{lang === 'en' ? s.en : s.fr}</span>
              </li>
            ))}
          </ol>
        </div>
      </details>
    </>
  );
}
