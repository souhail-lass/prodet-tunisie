'use client';

import { AlertTriangle } from 'lucide-react';
import type { AcademyFamily, AcademyProduct } from '../types';
import { FormulaDiff } from './formula-diff';

type Lang = 'fr' | 'en';
const t = (lang: Lang, fr: string, en: string) => (lang === 'en' ? en : fr);

export function ProductDetail({
  product: p,
  family: f,
  lang,
}: {
  product: AcademyProduct;
  family: AcademyFamily;
  lang: Lang;
}) {
  return (
    <div>
      <div className="detail-head">
        <span className="detail-head__emoji" style={{ background: f.col }} aria-hidden>{f.emoji}</span>
        <div style={{ minWidth: 0 }}>
          <h1 className="detail-head__title">
            {p.n}
            {p.reform ? (
              <span className="reform-badge"><AlertTriangle size={12} aria-hidden /> {t(lang, 'Reformulé', 'Reformulated')}</span>
            ) : null}
          </h1>
          <div className="detail-head__fam">{lang === 'en' ? f.en : f.fr}</div>
          <p className="detail-head__lead">{lang === 'en' ? p.d_en : p.d_fr}</p>
        </div>
      </div>

      <div className="spec">
        <div className="spec__cell"><div className="spec__k">pH</div><div className="spec__v">{p.ph}</div></div>
        <div className="spec__cell"><div className="spec__k">{t(lang, 'Mousse', 'Foam')}</div><div className="spec__v">{lang === 'en' ? p.foam_en : p.foam}</div></div>
        <div className="spec__cell"><div className="spec__k">{t(lang, 'Cible', 'Target')}</div><div className="spec__v">{lang === 'en' ? p.cl_en : p.cl_fr}</div></div>
      </div>

      <div className="detail-block">
        <div className="detail-block__label">{t(lang, 'Logique de formule', 'Formula logic')}</div>
        <p>{lang === 'en' ? p.lo_en : p.lo_fr}</p>
      </div>

      {p.note_fr && !p.reform ? (
        <div className="academy-note">
          <strong>{t(lang, 'Reformulation', 'Reformulation')} :</strong> {lang === 'en' ? p.note_en : p.note_fr}
        </div>
      ) : null}

      {p.reform ? <FormulaDiff reform={p.reform} lang={lang} /> : null}
    </div>
  );
}
