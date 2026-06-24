import { Concept, ModuleFooter, ModuleHero, ModuleNav, Section } from '@/features/academy/modules/chrome';
import { BleachLab, EdtaLab, MicelleLab, PhLab, SaltLab, SurfactantTypes } from '@/features/academy/modules/m2-labs';

export const dynamic = 'force-dynamic';

const FAMILIES: { ico: string; bg: string; name: string; desc: string; role: string }[] = [
  { ico: '🧪', bg: '#E6EFF8', name: 'Solvants', desc: 'Le butylglycol dissout les graisses. Miscible à l’eau (contrairement au perchlo).', role: 'Pénétration du gras' },
  { ico: '🦠', bg: '#E8F5EE', name: 'Enzymes', desc: 'Protéase, amylase, lipase. Le niveau premium. Chères et délicates.', role: 'Taches biologiques' },
  { ico: '🛡️', bg: '#FEF3E2', name: 'Conservateurs', desc: 'Empêchent le développement microbien. Le formol est courant mais à moderniser.', role: 'Conservation' },
  { ico: '🌸', bg: '#F3E8F5', name: 'Parfums & encapsulation', desc: 'Les microcapsules libèrent l’odeur quand on frotte le textile — persistance.', role: 'Odeur & perception' },
  { ico: '💧', bg: '#E6EFF8', name: 'Épaississants (amide)', desc: 'L’amide de coco épaissit, stabilise la mousse ET booste. Marche sans SLES.', role: 'Viscosité + mousse' },
  { ico: '✨', bg: '#EDECEA', name: 'Azurants & additifs', desc: 'L’azurant rend le blanc plus éclatant. Colorants, antimousse complètent.', role: 'Finition' },
];

export default function M2Page() {
  return (
    <div className="academy-mod">
      <ModuleNav active="/admin/academie/m2" />
      <ModuleHero
        eyebrow="MODULE 2 — MATIÈRES PREMIÈRES"
        title={<>Les <em>ingrédients</em> et ce qu’ils font vraiment</>}
        lead="Manipule plutôt que lire : glisse les curseurs et regarde la chimie réagir."
      />

      <Section num="01" title="Les tensioactifs — le héros de tes formules">
        <p className="muted">Une molécule à double personnalité : une tête qui aime l’eau, une queue qui aime la graisse.</p>
        <MicelleLab />
        <p>Il existe <strong>4 familles</strong> classées par charge. Clique pour voir où tu les utilises déjà.</p>
        <SurfactantTypes />
        <Concept tone="amber" label="Le piège : mousse ≠ nettoyage">
          La <strong>mousse ne lave pas</strong> — c’est de l’air. Les non-ioniques (excellents dégraissants) moussent
          peu, et une lessive machine mousse volontairement peu. Ne juge jamais un produit à sa mousse.
        </Concept>
      </Section>

      <Section num="02" title="Séquestrants & builders — les héros invisibles">
        <p className="muted">En eau dure, le calcium bloque tes tensioactifs. L’EDTA le capture.</p>
        <EdtaLab />
      </Section>

      <Section num="03" title="Alcalis & acides : tout est pH">
        <p className="muted"><strong>Alcalin</strong> = dégraisse. <strong>Acide</strong> = détartre. Glisse et vois où se placent tes produits.</p>
        <PhLab />
        <Concept tone="red" label="Sécurité vitale">
          <strong>Ne JAMAIS mélanger un acide (Pilax) et de la javel</strong> → chlore gazeux toxique. Règle n°1 à
          enseigner à chaque employé. Un acide + un alcalin s’annulent aussi (et chauffent).
        </Concept>
      </Section>

      <Section num="04" title="Blanchiment : chloré vs oxygéné">
        <p className="muted">Le blanchiment détruit les taches colorées que les tensioactifs ne peuvent pas enlever.</p>
        <BleachLab />
        <Concept tone="green" label="Pour ton futur détachant">
          Le <strong>percarbonate de sodium</strong> est la pièce manquante de ta gamme buanderie : enlève vin et café,
          marche sur couleur, s’active à 60°C. Il transforme ton offre en système « lessive + booster ».
        </Concept>
      </Section>

      <Section num="05" title="La courbe du sel">
        <p className="muted">Le sel épaissit le SLES… mais trop de sel et ça redevient liquide. Découvre la courbe en cloche.</p>
        <SaltLab />
      </Section>

      <Section num="06" title="Les autres familles essentielles">
        <div className="academy-fam-grid">
          {FAMILIES.map((f) => (
            <div className="academy-fam" key={f.name}>
              <div className="academy-fam__ico" style={{ background: f.bg }} aria-hidden>{f.ico}</div>
              <h4>{f.name}</h4>
              <p>{f.desc}</p>
              <div className="role">Rôle : {f.role}</div>
            </div>
          ))}
        </div>
        <ModuleFooter prevHref="/admin/academie/m1" nextHref="/admin/academie/m3" nextLabel="Module 3 — Construire une formule" />
      </Section>
    </div>
  );
}
