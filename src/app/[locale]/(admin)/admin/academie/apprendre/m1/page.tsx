import { Concept, ModuleFooter, ModuleHero, ModuleNav, Section, Takeaways } from '@/features/academy/modules/chrome';

export const dynamic = 'force-dynamic';

const SOILS: { emoji: string; bg: string; name: string; ex: string; sol: string }[] = [
  { emoji: '🛢️', bg: '#FEF3E2', name: 'Grasses', ex: 'Huile, beurre, friture, sébum.', sol: 'Alcali + solvant + tensioactif' },
  { emoji: '🥚', bg: '#FCEBEB', name: 'Protéinées', ex: 'Sang, œuf, lait, viande.', sol: 'Alcali + enzyme (protéase)' },
  { emoji: '🍷', bg: '#F3E8F5', name: 'Colorées oxydables', ex: 'Vin, café, thé, fruits, herbe.', sol: 'Blanchiment oxygéné' },
  { emoji: '🍝', bg: '#E8F5EE', name: 'Amidonnées', ex: 'Sauces, féculents, pâtes.', sol: 'Enzyme (amylase)' },
  { emoji: '🧂', bg: '#EDECEA', name: 'Minérales / calcaire', ex: 'Tartre, dépôts, rouille.', sol: 'Acide + séquestrant' },
];

export default function M1Page() {
  return (
    <div className="academy-mod">
      <ModuleNav active="/admin/academie/apprendre/m1" />
      <ModuleHero
        eyebrow="MODULE 1 — FONDAMENTAUX"
        title={<>Comprendre ce que veut dire <em>nettoyer</em></>}
      />

      <Section num="01" title="Le cercle de Sinner : les 4 forces de tout nettoyage">
        <p className="muted">
          Tout nettoyage combine quatre facteurs qui fonctionnent comme un budget : réduis-en un, tu dois augmenter
          les autres pour garder le même résultat.
        </p>
        <figure className="academy-diagram">
          <svg viewBox="0 0 440 300" role="img" aria-label="Cercle de Sinner">
            <circle cx="220" cy="150" r="50" fill="#F7F6F3" stroke="#D8D7D3" />
            <text x="220" y="146" textAnchor="middle" fontSize="13" fontWeight="700" fill="#063561">RÉSULTAT</text>
            <text x="220" y="163" textAnchor="middle" fontSize="13" fontWeight="700" fill="#063561">PROPRE</text>
            <circle cx="120" cy="74" r="44" fill="#E6EFF8" stroke="#095296" strokeWidth="1.5" />
            <text x="120" y="70" textAnchor="middle" fontSize="12" fontWeight="700" fill="#095296">CHIMIE</text>
            <text x="120" y="86" textAnchor="middle" fontSize="9" fill="#6B6B67">le produit</text>
            <circle cx="320" cy="74" r="44" fill="#FEF3E2" stroke="#D9941F" strokeWidth="1.5" />
            <text x="320" y="70" textAnchor="middle" fontSize="12" fontWeight="700" fill="#92400E">CHALEUR</text>
            <text x="320" y="86" textAnchor="middle" fontSize="9" fill="#6B6B67">température</text>
            <circle cx="120" cy="226" r="44" fill="#E8F5EE" stroke="#24883E" strokeWidth="1.5" />
            <text x="120" y="222" textAnchor="middle" fontSize="12" fontWeight="700" fill="#24883E">ACTION</text>
            <text x="120" y="238" textAnchor="middle" fontSize="9" fill="#6B6B67">frottement</text>
            <circle cx="320" cy="226" r="44" fill="#EDECEA" stroke="#6B6B67" strokeWidth="1.5" />
            <text x="320" y="222" textAnchor="middle" fontSize="12" fontWeight="700" fill="#3A3A38">TEMPS</text>
            <text x="320" y="238" textAnchor="middle" fontSize="9" fill="#6B6B67">durée</text>
            <line x1="158" y1="98" x2="185" y2="122" stroke="#D8D7D3" strokeWidth="1.5" />
            <line x1="282" y1="98" x2="255" y2="122" stroke="#D8D7D3" strokeWidth="1.5" />
            <line x1="158" y1="202" x2="185" y2="178" stroke="#D8D7D3" strokeWidth="1.5" />
            <line x1="282" y1="202" x2="255" y2="178" stroke="#D8D7D3" strokeWidth="1.5" />
          </svg>
          <figcaption>
            Un lave-vaisselle mise sur la <strong>chimie</strong> et la chaleur, peu sur l’action mécanique. Un lavage à
            froid doit compenser par plus de chimie ou plus de temps.
          </figcaption>
        </figure>
        <Concept label="Ton outil de diagnostic">
          Quand un client dit « votre produit ne lave pas assez », souvent il lave trop froid, trop vite, ou sans assez
          d’action mécanique. Le cercle de Sinner situe la vraie cause avant d’accuser le produit.
        </Concept>
      </Section>

      <Section num="02" title="Pourquoi l’eau seule ne lave pas">
        <p>
          L’eau et la graisse se repoussent : l’eau est <span className="accent-blue">polaire</span>, la graisse non.
          Comme la plupart des salissures contiennent du gras, l’eau glisse dessus sans les décrocher. C’est le problème
          qu’un <span className="accent-blue">tensioactif</span> résout (Module 2).
        </p>
        <Concept tone="green" label="L’idée à garder">
          Toute la détergence existe pour <strong>réconcilier l’eau et la graisse</strong>. Chaque ingrédient aide l’eau
          à attraper une saleté qu’elle ne pourrait pas seule.
        </Concept>
      </Section>

      <Section num="03" title="Les 5 types de salissures — et leur arme">
        <p className="muted">On ne combat pas toutes les salissures avec la même arme. C’est la clé de l’existence de plusieurs produits.</p>
        <div className="academy-grid2">
          {SOILS.map((s) => (
            <div className="academy-tile" key={s.name}>
              <span className="academy-tile__badge" style={{ background: s.bg }} aria-hidden>{s.emoji}</span>
              <div>
                <h4>{s.name}</h4>
                <p>{s.ex}</p>
                <div className="sol">→ {s.sol}</div>
              </div>
            </div>
          ))}
        </div>
        <Concept tone="amber" label="La règle qui explique ta gamme">
          Un seul produit ne peut pas tout attaquer : les armes sont parfois <strong>incompatibles</strong> (acide +
          alcali s’annulent ; le blanchiment se dégrade). D’où une lessive, un dégraissant, un détartrant séparés. Ce
          n’est pas commercial, c’est chimique.
        </Concept>
      </Section>

      <Section num="04" title="L’eau dure tunisienne : ton facteur n°1">
        <p>
          L’eau tunisienne est très dure (riche en calcium et magnésium). Ces minéraux affectent <strong>chaque produit
          Prodet</strong>.
        </p>
        <div className="academy-water">
          <h3>Ce que le calcaire fait à tes produits</h3>
          <p><strong style={{ color: '#fff' }}>1. Il neutralise tes tensioactifs.</strong> Le calcium s’y lie : une partie de ce que tu paies ne lave pas.</p>
          <p><strong style={{ color: '#fff' }}>2. Il grise et raidit le linge.</strong> Le calcaire se dépose : linge rêche, terne, qui jaunit.</p>
          <p><strong style={{ color: '#fff' }}>3. Il entartre les machines</strong> de tes clients.</p>
        </div>
        <p>
          La solution : un <span className="accent-blue">séquestrant</span> (EDTA) qui capture le calcium et libère les
          tensioactifs. C’est pourquoi on a ajouté de l’EDTA au nouveau Prolax Liquide. Effet en direct au Module 2.
        </p>
      </Section>

      <Section num="05" title="À retenir">
        <Takeaways
          title="4 idées clés"
          items={[
            <><strong>Cercle de Sinner</strong> : chimie + chaleur + action + temps. Ton outil de diagnostic.</>,
            <><strong>L’eau seule ne lave pas</strong> : elle repousse le gras. La détergence réconcilie eau et graisse.</>,
            <><strong>5 salissures, 5 armes</strong> : grasse→alcali, protéine→enzyme, colorée→blanchiment, amidon→enzyme, minérale→acide.</>,
            <><strong>Eau dure tunisienne</strong> = facteur n°1. Le séquestrant (EDTA) est souvent la clé.</>,
          ]}
        />
        <ModuleFooter nextHref="/admin/academie/apprendre/m2" nextLabel="Module 2 — Matières premières" />
      </Section>
    </div>
  );
}
