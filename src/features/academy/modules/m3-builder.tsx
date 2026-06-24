'use client';

import { useState } from 'react';
import { Check, Zap } from 'lucide-react';

type Row = { name: string; role: string; pct: number; col: string; extra?: boolean };
type Product = {
  key: 'lessive' | 'degraissant' | 'detartrant' | 'assouplissant';
  ico: string;
  label: string;
  base: Row[];
  ph: string;
  foam: number;
  soil: string;
};

const PRODUCTS: Product[] = [
  {
    key: 'lessive', ico: '👕', label: 'Lessive linge', ph: '10–11 (alcalin)', foam: 2, soil: 'Grasse + générale',
    base: [
      { name: 'Eau adoucie', role: 'Base', pct: 62, col: '#41AAE2' },
      { name: 'Acide sulfonique (LAS)', role: 'Tensioactif anionique — lave', pct: 7, col: '#095296' },
      { name: 'Tensioactif non-ionique', role: 'Dégraisse à basse temp.', pct: 4, col: '#095296' },
      { name: 'Métasilicate + carbonate', role: 'Builders alcalins — pH lavant', pct: 7, col: '#24883E' },
      { name: 'Conservateur', role: 'Anti-microbien', pct: 0.2, col: '#92400E' },
    ],
  },
  {
    key: 'degraissant', ico: '🍳', label: 'Dégraissant cuisine', ph: '12–13 (très alcalin)', foam: 1, soil: 'Grasse lourde',
    base: [
      { name: 'Eau adoucie', role: 'Base', pct: 63, col: '#41AAE2' },
      { name: 'Métasilicate de soude', role: 'Alcali — saponifie le gras', pct: 5, col: '#24883E' },
      { name: 'Butylglycol', role: 'Solvant — pénètre le gras', pct: 6, col: '#095296' },
      { name: 'Tensioactif non-ionique', role: 'Dégraissant à chaud', pct: 5, col: '#095296' },
      { name: 'MEA', role: 'Booster gras lourd', pct: 3, col: '#8E44AD' },
    ],
  },
  {
    key: 'detartrant', ico: '🚽', label: 'Détartrant sanitaire', ph: '1–2 (acide fort)', foam: 1, soil: 'Minérale / calcaire',
    base: [
      { name: 'Eau', role: 'Base', pct: 78, col: '#41AAE2' },
      { name: 'Acide (chlorhydrique/phosphorique)', role: 'Détartre — dissout le calcaire', pct: 15, col: '#C0392B' },
      { name: 'Tensioactif', role: 'Mouille la surface', pct: 3, col: '#095296' },
      { name: 'Inhibiteur de corrosion', role: 'Protège les surfaces', pct: 1, col: '#92400E' },
    ],
  },
  {
    key: 'assouplissant', ico: '🧴', label: 'Assouplissant', ph: '4–5 (acide)', foam: 0, soil: '— (soin du linge)',
    base: [
      { name: 'Eau adoucie', role: 'Base', pct: 84, col: '#41AAE2' },
      { name: 'Base cationique (Dequart)', role: 'Adoucit — se fixe sur fibres', pct: 12, col: '#8E44AD' },
      { name: 'Acide citrique', role: 'pH 4–5 — fixe le cationique', pct: 0.5, col: '#E67E22' },
      { name: 'Parfum', role: 'Odeur', pct: 2, col: '#8E44AD' },
    ],
  },
];

const FOAM_LABELS = ['nulle', 'très faible', 'faible', 'moyenne', 'élevée'];

export function FormulaBuilder() {
  const [pi, setPi] = useState(0);
  const [hard, setHard] = useState(true);
  const [color, setColor] = useState(false);
  const [visc, setVisc] = useState(false);
  const p = PRODUCTS[pi]!;

  const rows: Row[] = [...p.base.map((r) => ({ ...r }))];
  if (hard && p.key !== 'detartrant' && p.key !== 'assouplissant') {
    rows.splice(1, 0, { name: 'EDTA (séquestrant)', role: 'Capture le calcaire — Tunisie', pct: 3, col: '#24883E', extra: true });
  }
  if (color && p.key === 'lessive') {
    rows.push({ name: 'Booster oxygéné (percarbonate) — poudre séparée', role: 'Taches vin, café, thé', pct: 0, col: '#2980B9', extra: true });
  }
  if (visc && (p.key === 'lessive' || p.key === 'assouplissant' || p.key === 'degraissant')) {
    const t = p.key === 'assouplissant'
      ? { name: 'Sel (NaCl)', role: 'Épaissit le cationique' }
      : { name: 'Amide de coco (CDEA)', role: 'Épaissit + booste la mousse' };
    rows.push({ name: t.name, role: t.role, pct: 2, col: '#095296', extra: true });
  }

  return (
    <div className="academy-lab">
      <span className="academy-lab__badge"><Zap size={13} aria-hidden /> Constructeur interactif</span>
      <h3>1. Choisis le type de produit</h3>
      <div className="academy-btypes" style={{ marginTop: 12 }}>
        {PRODUCTS.map((prod, idx) => (
          <button key={prod.key} type="button" className={`academy-btype${idx === pi ? ' on' : ''}`} onClick={() => setPi(idx)} aria-pressed={idx === pi}>
            <div className="bi">{prod.ico}</div>
            <div className="bn">{prod.label}</div>
          </button>
        ))}
      </div>

      <h3>2. Ajuste les contraintes</h3>
      <div className="academy-toggles" style={{ marginTop: 12 }}>
        <Toggle on={hard} set={setHard} label="Eau dure (Tunisie)" />
        <Toggle on={color} set={setColor} label="Taches colorées" />
        <Toggle on={visc} set={setVisc} label="Visqueux (clients)" />
      </div>

      <h3>3. Ta formule</h3>
      <div className="academy-canvas" style={{ marginTop: 12 }}>
        {rows.map((r, i) => (
          <div className="academy-fc-row" key={`${r.name}-${i}`}>
            <div className="academy-fc-bar" style={{ background: r.col }} />
            <div className="academy-fc-info">
              <div className="academy-fc-name">{r.name}</div>
              <div className="academy-fc-role">{r.role}</div>
            </div>
            <div className="academy-fc-pct">{r.pct > 0 ? `${r.pct}%` : 'q.s.'}</div>
          </div>
        ))}
      </div>
      <div className="academy-profile">
        <div className="academy-prof"><div className="pk">pH</div><div className="pv">{p.ph}</div></div>
        <div className="academy-prof"><div className="pk">Mousse</div><div className="pv">{FOAM_LABELS[p.foam]}</div></div>
        <div className="academy-prof"><div className="pk">Cible</div><div className="pv">{p.soil}</div></div>
      </div>
    </div>
  );
}

function Toggle({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) {
  return (
    <button type="button" className={`academy-toggle${on ? ' on' : ''}`} onClick={() => set(!on)} aria-pressed={on}>
      <span className="academy-toggle__chk">{on ? <Check size={11} aria-hidden /> : null}</span>
      {label}
    </button>
  );
}
