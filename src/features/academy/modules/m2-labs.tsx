'use client';

import { useMemo, useState } from 'react';
import { Zap } from 'lucide-react';

function LabBadge({ children }: { children: string }) {
  return (
    <span className="academy-lab__badge">
      <Zap size={13} aria-hidden /> {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Micelle — surfactant lifts grease                                */
/* ------------------------------------------------------------------ */
export function MicelleLab() {
  const [p, setP] = useState(0);
  const N = 16;
  const count = Math.round((p / 100) * N);
  const lift = p > 70 ? ((p - 70) / 30) * 120 : 0;
  const cx = 300;
  const cy = 175 - lift;

  const surfactants = useMemo(() => {
    const items: { hx: number; hy: number; tx: number; ty: number }[] = [];
    for (let i = 0; i < count; i++) {
      const ang = (i / N) * Math.PI * 2 - Math.PI / 2;
      items.push({
        hx: cx + Math.cos(ang) * 58,
        hy: cy + Math.sin(ang) * 58,
        tx: cx + Math.cos(ang) * 40,
        ty: cy + Math.sin(ang) * 40,
      });
    }
    return items;
  }, [count, cy]);

  return (
    <div className="academy-lab">
      <LabBadge>Simulation interactive</LabBadge>
      <h3>Comment un tensioactif décroche la graisse</h3>
      <p className="academy-lab__sub">Glisse pour ajouter des tensioactifs. Queues dans la graisse, têtes dans l’eau — la saleté se détache.</p>
      <div className="academy-stage">
        <div className="academy-stage__fabric" />
        <svg width="100%" height="100%" viewBox="0 0 600 240" preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0 }}>
          <circle cx={cx} cy={cy} r="42" fill="#E8B84B" stroke="#C99A2E" strokeWidth="2" />
          <text x={cx} y={cy + 5} textAnchor="middle" fontSize="12" fontWeight="600" fill="#7A5C12">graisse</text>
          {surfactants.map((s, i) => (
            <g key={i}>
              <line x1={s.hx} y1={s.hy} x2={s.tx} y2={s.ty} stroke="#7A5C12" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
              <circle cx={s.hx} cy={s.hy} r="7" fill="#41AAE2" stroke="#1E7FB8" strokeWidth="1.5" />
            </g>
          ))}
        </svg>
        {p > 85 ? (
          <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', background: '#24883E', color: '#fff', fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 99 }}>
            ✓ Graisse décrochée !
          </div>
        ) : null}
      </div>
      <div className="academy-slider">
        <label htmlFor="m2-surf">Tensioactifs</label>
        <input id="m2-surf" type="range" min={0} max={100} value={p} onChange={(e) => setP(+e.target.value)} />
        <span className="academy-slider__val">{p}%</span>
      </div>
      <div className="academy-concept green" style={{ margin: 0 }}>
        <div className="academy-concept__label">Ce que tu viens de voir</div>
        <p>Quand assez de tensioactifs entourent la graisse (une <strong>micelle</strong>), elle se détache. C’est tout le principe — d’où l’intérêt de ne pas trop réduire le taux, comme sur le Prolax.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Surfactant types                                                 */
/* ------------------------------------------------------------------ */
const TYPES = [
  { charge: '−', chargeCol: '#C0392B', nm: 'Anionique', d: 'Le plus courant et le moins cher. Lave et mousse bien. Acide sulfonique, texapon, NANSA. Sensible au calcaire (d’où l’EDTA).', ex: ['Acide sulfonique', 'Texapon', 'NANSA'], foam: 4 },
  { charge: '○', chargeCol: '#6B6B67', nm: 'Non-ionique', d: 'Le meilleur dégraissant, surtout à chaud. Mousse peu — idéal lessive machine. NP9 (à remplacer) ou alcool gras éthoxylé.', ex: ['NP9', 'Alcool éthoxylé'], foam: 1 },
  { charge: '+', chargeCol: '#2980B9', nm: 'Cationique', d: 'Ne lave pas — se fixe sur les fibres pour adoucir. Base assouplissant (Dequart). Aussi désinfectant. Incompatible avec les anioniques.', ex: ['Base assouplissant', 'Ammonium quaternaire'], foam: 1 },
  { charge: '±', chargeCol: '#8E44AD', nm: 'Amphotère', d: 'Doux, s’adapte au pH. Améliore la mousse et adoucit l’agressivité. Bétaïne (Saterin). Savon mains et vaisselle.', ex: ['Bétaïne', 'Saterin'], foam: 2 },
];

export function SurfactantTypes() {
  const [i, setI] = useState(0);
  const t = TYPES[i]!;
  return (
    <div className="academy-lab">
      <div className="academy-typetabs">
        {TYPES.map((ty, idx) => (
          <button key={ty.nm} type="button" className={`academy-typetab${idx === i ? ' on' : ''}`} onClick={() => setI(idx)} aria-pressed={idx === i}>
            <div className="charge" style={{ color: ty.chargeCol }}>{ty.charge}</div>
            <div className="nm">{ty.nm}</div>
          </button>
        ))}
      </div>
      <div className="academy-typedetail">
        <h4>{t.nm}</h4>
        <p>{t.d}</p>
        {t.ex.map((e) => <span className="academy-ex" key={e}>{e}</span>)}
        <div className="academy-foam">
          <span>Mousse :</span>
          <div className="academy-foam__dots">
            {[0, 1, 2, 3].map((d) => <div key={d} className={`academy-foam__dot${d < t.foam ? ' fill' : ''}`} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. EDTA vs limescale                                                */
/* ------------------------------------------------------------------ */
export function EdtaLab() {
  const [e, setE] = useState(0);
  const Mn = 24;
  const eff = Math.round(35 + 60 * (1 - Math.exp(-e / 1.3)));
  const freed = Math.round((eff / 100) * Mn);
  return (
    <div className="academy-lab">
      <LabBadge>Simulation eau dure</LabBadge>
      <h3>EDTA vs calcaire</h3>
      <p className="academy-lab__sub">Sans EDTA, le calcium (rouge) neutralise. Ajoute de l’EDTA, vois-les se libérer (vert).</p>
      <div className="academy-stage academy-stage--short">
        <svg width="100%" height="100%" viewBox="0 0 600 160" preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: Mn }).map((_, i) => {
            const c = i % 8;
            const r = Math.floor(i / 8);
            const x = 60 + c * 65;
            const y = 40 + r * 42;
            const free = i < freed;
            const col = free ? '#24883E' : '#C0392B';
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="11" fill={free ? '#E8F5EE' : '#FCEBEB'} stroke={col} strokeWidth="2" />
                {free ? (
                  <path d={`M${x - 4} ${y - 4} L${x} ${y} L${x + 4} ${y - 4} M${x} ${y} L${x} ${y + 5}`} stroke={col} strokeWidth="2" fill="none" />
                ) : (
                  <circle cx={x} cy={y} r="4" fill="#C0392B" />
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="academy-slider">
        <label htmlFor="m2-edta">EDTA</label>
        <input id="m2-edta" type="range" min={0} max={5} step={0.5} value={e} onChange={(ev) => setE(+ev.target.value)} />
        <span className="academy-slider__val">{e}%</span>
      </div>
      <div className="academy-readout">
        <div className="academy-metric"><div className="v" style={{ color: 'var(--ac-green)' }}>{eff}%</div><div className="l">Efficacité</div></div>
        <div className="academy-metric"><div className="v" style={{ color: '#C0392B' }}>{100 - eff}%</div><div className="l">Bloqués</div></div>
      </div>
      <div className="academy-concept green" style={{ margin: '14px 0 0' }}>
        <div className="academy-concept__label">La leçon Prodet</div>
        <p>Les premiers % d’EDTA donnent le plus gros gain, puis ça plafonne. 2-3% suffisent dans le Prolax. Un peu de séquestrant pas cher rend tes tensioactifs chers bien plus efficaces.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4. pH scale                                                         */
/* ------------------------------------------------------------------ */
const PH_ZONES = [
  { max: 2, z: 'Acide fort', c: '#C0392B', t: 'Détartrage puissant, détruit calcaire et rouille. Pilax, Profon. Corrosif.' },
  { max: 6, z: 'Acide doux', c: '#E67E22', t: 'Détartrage léger, rinçage, brillance. Prolac, liquide de rinçage. pH des assouplissants (4-5).' },
  { max: 8, z: 'Neutre', c: '#2ECC71', t: 'Doux pour peau et surfaces délicates. Savons mains. Ne dégraisse pas fort.' },
  { max: 11, z: 'Alcalin', c: '#2980B9', t: 'Dégraissage efficace, saponifie. Tes lessives (Prolax ~10-11).' },
  { max: 14, z: 'Alcalin fort', c: '#6C3483', t: 'Dégraissage extrême, graisses cuites. Profour. Attaque l’aluminium.' },
];
const PH_PRODUCTS = [
  { left: '14%', label: 'Pilax · Profon' },
  { left: '33%', label: 'Prolac' },
  { left: '54%', label: 'Alcohand' },
  { left: '75%', label: 'Prolax' },
  { left: '90%', label: 'Profour' },
];

export function PhLab() {
  const [v, setV] = useState(7);
  const zone = PH_ZONES.find((x) => v <= x.max) ?? PH_ZONES[PH_ZONES.length - 1]!;
  return (
    <div className="academy-lab">
      <div className="academy-phprods">
        {PH_PRODUCTS.map((p) => (
          <span className="academy-phprod" style={{ left: p.left }} key={p.label}>{p.label}</span>
        ))}
      </div>
      <div className="academy-phbar">
        <div className="academy-phmarker" data-ph={v} style={{ left: `${(v / 14) * 100}%` }} />
      </div>
      <div className="academy-slider">
        <label htmlFor="m2-ph">pH</label>
        <input id="m2-ph" type="range" min={0} max={14} step={1} value={v} onChange={(e) => setV(+e.target.value)} />
        <span className="academy-slider__val">{v}</span>
      </div>
      <div className="academy-typedetail" style={{ marginTop: 8, minHeight: 0 }}>
        <span className="academy-zonepill" style={{ background: `${zone.c}22`, color: zone.c }}>{zone.z}</span>
        <p style={{ margin: '8px 0 0' }}>{zone.t}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Bleach: chlorine vs oxygen                                       */
/* ------------------------------------------------------------------ */
const BLEACH = {
  cl: { Puissance: 'Très fort, rapide', Couleur: '❌ Blanc uniquement', Fibres: 'Agressif — use les fibres', Coût: 'Très bon marché', Taches: 'Détruit tout (blanc)', Sécurité: 'Odeur forte, danger avec acide' },
  ox: { Puissance: 'Fort, progressif', Couleur: '✓ Couleur ET blanc', Fibres: 'Doux pour les fibres', Coût: 'Moyen', Taches: 'Vin, café, thé, fruits', Sécurité: 'Sûr, sans odeur agressive' },
};

export function BleachLab() {
  const [b, setB] = useState<'cl' | 'ox'>('cl');
  const d = BLEACH[b];
  return (
    <div className="academy-lab">
      <div className="academy-bleach-toggle">
        <button type="button" className={`academy-bleach-opt${b === 'cl' ? ' on' : ''}`} onClick={() => setB('cl')} aria-pressed={b === 'cl'}>Chloré (javel)</button>
        <button type="button" className={`academy-bleach-opt${b === 'ox' ? ' on' : ''}`} onClick={() => setB('ox')} aria-pressed={b === 'ox'}>Oxygéné (percarbonate)</button>
      </div>
      <div className="academy-bleach-grid">
        {Object.entries(d).map(([k, val]) => (
          <div className="academy-bleach-cell" key={k}>
            <div className="k">{k}</div>
            <div className="vv">{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Salt curve                                                       */
/* ------------------------------------------------------------------ */
const viscAt = (p: number) => Math.exp(-Math.pow((p - 55) / 28, 2));

export function SaltLab() {
  const [p, setP] = useState(0);
  const curve = useMemo(() => {
    let d = 'M';
    for (let x = 0; x <= 100; x += 2) {
      const px = 50 + (x / 100) * 520;
      const py = 240 - viscAt(x) * 200;
      d += (x === 0 ? '' : ' L') + px.toFixed(1) + ' ' + py.toFixed(1);
    }
    return d;
  }, []);
  const v = viscAt(p);
  const dotX = 50 + (p / 100) * 520;
  const dotY = 240 - v * 200;

  let vis: string, zone: string, col: string;
  if (p < 35) { vis = 'Faible'; zone = 'Pas assez de sel'; col = '#6B6B67'; }
  else if (p <= 70) { vis = 'Élevée'; zone = 'Zone optimale ✓'; col = '#24883E'; }
  else { vis = 'Chute !'; zone = 'Sur-salage'; col = '#C0392B'; }

  return (
    <div className="academy-lab">
      <LabBadge>Courbe interactive</LabBadge>
      <h3>Viscosité en fonction du sel</h3>
      <p className="academy-lab__sub">Le sel épaissit les formules au SLES (texapon)… mais trop de sel et ça redevient liquide.</p>
      <svg viewBox="0 0 600 280" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: 'auto', display: 'block' }}>
        <line x1="50" y1="240" x2="570" y2="240" stroke="#D8D7D3" strokeWidth="1.5" />
        <line x1="50" y1="240" x2="50" y2="20" stroke="#D8D7D3" strokeWidth="1.5" />
        <text x="310" y="270" textAnchor="middle" fontSize="12" fill="#6B6B67">Sel ajouté →</text>
        <text x="20" y="130" textAnchor="middle" fontSize="12" fill="#6B6B67" transform="rotate(-90,20,130)">Viscosité</text>
        <path d={curve} fill="none" stroke="#095296" strokeWidth="3" />
        {p >= 45 && p <= 65 ? (
          <text x="310" y="40" textAnchor="middle" fontSize="11" fontWeight="600" fill="#24883E">point optimal</text>
        ) : null}
        <circle cx={dotX} cy={dotY} r="9" fill={col} stroke="#fff" strokeWidth="3" />
      </svg>
      <div className="academy-slider">
        <label htmlFor="m2-salt">Sel ajouté</label>
        <input id="m2-salt" type="range" min={0} max={100} value={p} onChange={(e) => setP(+e.target.value)} />
        <span className="academy-slider__val">{p}%</span>
      </div>
      <div className="academy-readout">
        <div className="academy-metric"><div className="v" style={{ color: col, fontSize: 18 }}>{vis}</div><div className="l">Viscosité</div></div>
        <div className="academy-metric"><div className="v" style={{ color: col, fontSize: 15 }}>{zone}</div><div className="l">État</div></div>
      </div>
      <div className="academy-concept amber" style={{ margin: '14px 0 0' }}>
        <div className="academy-concept__label">Le sur-salage</div>
        <p>« J’ajoute du sel et d’un coup ça reliquéfie ! » → c’est la partie descendante. Ajoute le sel progressivement, arrête-toi au sommet. Et le sel n’épaissit QUE le SLES — sinon, amide de coco.</p>
      </div>
    </div>
  );
}
