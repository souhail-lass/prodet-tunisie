import { Concept, ModuleFooter, ModuleHero, ModuleNav, Section, Takeaways } from '@/features/academy/modules/chrome';
import { FormulaBuilder } from '@/features/academy/modules/m3-builder';

export const dynamic = 'force-dynamic';

const QUESTIONS: { n: string; bg: string; q: string; a: string }[] = [
  { n: '1', bg: '#E6EFF8', q: 'Quelle salissure ?', a: 'Grasse, protéinée, colorée, minérale ? Décide l’arme principale (Module 1).' },
  { n: '2', bg: '#E8F5EE', q: 'Quelle eau ?', a: 'Dure (Tunisie) → séquestrant obligatoire. Non négociable ici.' },
  { n: '3', bg: '#FEF3E2', q: 'Quel support ?', a: 'Textile, inox, sol, peau ? Décide le pH max et la douceur nécessaire.' },
  { n: '4', bg: '#F3E8F5', q: 'Quel usage ?', a: 'Machine (peu de mousse) ou manuel (mousse) ? Concentré ou prêt à l’emploi ?' },
];

const ORDER: { ico: string; bg: string; t: string; d: string }[] = [
  { ico: '💧', bg: '#E6EFF8', t: '1. L’eau d’abord', d: 'Toujours commencer par l’eau (adoucie). Tout se dissout dedans.' },
  { ico: '🔗', bg: '#E8F5EE', t: '2. Le séquestrant ensuite', d: 'L’EDTA en premier pour capturer le calcaire AVANT les autres.' },
  { ico: '⚗️', bg: '#FEF3E2', t: '3. Neutraliser à froid', d: 'Acide + soude = exothermique. Lentement, pH-mètre en main.' },
  { ico: '🌀', bg: '#F3E8F5', t: '4. Épaississant sans grumeaux', d: 'Le CMC se saupoudre lentement dans le tourbillon. Jamais d’un coup.' },
  { ico: '🧴', bg: '#E6EFF8', t: '5. Tensioactifs en douceur', d: 'Agitation douce pour ne pas créer trop de mousse.' },
  { ico: '🌸', bg: '#EDECEA', t: '6. Parfum & finition à la fin', d: 'Parfum à froid (pour ne pas l’évaporer), puis ajuster au volume.' },
];

export default function M3Page() {
  return (
    <div className="academy-mod">
      <ModuleNav active="/admin/academie/m3" />
      <ModuleHero
        eyebrow="MODULE 3 — FORMULATION"
        title={<>Construire une <em>formule</em>, étape par étape</>}
        lead="Une formule est une réponse logique à une question : quelle salissure, quelle eau, quel support, quel usage ?"
      />

      <Section num="01" title="La méthode : 4 questions avant tout">
        <p className="muted">Un bon formulateur ne commence jamais par les ingrédients, mais par les questions. Les ingrédients en découlent.</p>
        <div className="academy-grid2">
          {QUESTIONS.map((q) => (
            <div className="academy-tile" key={q.n}>
              <span className="academy-tile__badge" style={{ background: q.bg }} aria-hidden>{q.n}</span>
              <div>
                <h4>{q.q}</h4>
                <p>{q.a}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section num="02" title="Le constructeur de formule">
        <p className="muted">Choisis un type, ajuste les contraintes, et regarde la formule se construire. C’est la logique exacte suivie pour ton Prolax.</p>
        <FormulaBuilder />
        <Concept label="Ce que le constructeur t’apprend">
          La formule <strong>change selon les contraintes</strong>. « Eau dure » → un séquestrant apparaît. « Visqueux »
          → un épaississant s’ajoute. Une formule n’est jamais figée : c’est une réponse à un cahier des charges.
        </Concept>
      </Section>

      <Section num="03" title="L’ordre d’incorporation : pourquoi il est sacré">
        <p>Avoir les bons ingrédients ne suffit pas — l’<strong>ordre</strong> détermine si la formule est stable ou ratée.</p>
        <div className="academy-fam-grid">
          {ORDER.map((o) => (
            <div className="academy-fam" key={o.t}>
              <div className="academy-fam__ico" style={{ background: o.bg }} aria-hidden>{o.ico}</div>
              <h4>{o.t}</h4>
              <p>{o.d}</p>
            </div>
          ))}
        </div>
        <Concept tone="amber" label="La règle d’or de l’essai">
          Toute nouvelle formule se teste en petit (1L ou 5kg), s’observe 24-48h, se compare à l’ancienne, puis se scale.
          <strong> Jamais directement en production.</strong>
        </Concept>
      </Section>

      <Section num="04" title="À retenir">
        <Takeaways
          title="4 idées clés"
          items={[
            <><strong>4 questions avant les ingrédients</strong> : salissure, eau, support, usage.</>,
            <><strong>Une formule est une réponse logique</strong>, pas une recette figée. Les contraintes décident.</>,
            <><strong>L’ordre est sacré</strong> : eau → séquestrant → neutralisation → épaississant → tensioactifs → finition.</>,
            <><strong>Toujours tester petit</strong>, observer 24-48h, comparer, puis scaler.</>,
          ]}
        />
        <ModuleFooter prevHref="/admin/academie/m2" nextHref="/admin/academie/gamme" nextLabel="Module 4 — La gamme Prodet" />
      </Section>
    </div>
  );
}
