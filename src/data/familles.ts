import type { UseCaseId } from '@/types/use-case';

/**
 * Three-level product browse taxonomy (greenlab-style):
 *   Famille  →  Sous-catégorie  →  Produits
 *
 * The live catalogue is Swiver-synced and its raw `base_category` values are
 * unusable for browsing ("ARTICLES COMMERCIALISES", "Catégorie générale", …),
 * so famille + sous-catégorie are derived from product names with the keyword
 * rules below — applied on the fly, preserved across re-syncs, refined by
 * FAMILLE_OVERRIDES.
 *
 * Category images live in /public/images/categories/{slug}.jpg (swap freely).
 */
export type FamilleId =
  | 'tous-les-produits'
  | 'produits-nettoyage'
  | 'materiel-hygiene'
  | 'papier-epi'
  | 'collecte-dechets'
  | 'parfums-ambiance';

export interface Famille {
  id: FamilleId;
  slug: FamilleId;
  /** Scene/lifestyle photo — used as a cover hero on the famille landing page. */
  image: string;
  /** Detoured (transparent) product packshot — used on the home famille tiles. '' = branded placeholder. */
  packshot: string;
  displayOrder: number;
}

export interface SousCategorie {
  slug: string;
  familleId: FamilleId;
  /** Scene/lifestyle photo — used as the cover hero on the sous-catégorie page. */
  image: string;
  /** Tile art on the sous-catégorie cards. '' = branded placeholder. */
  packshot: string;
  /**
   * How the tile art fills its frame. Detoured packshots sit on the pedestal
   * ("contain", the default); a scene photo fills it edge to edge ("cover").
   */
  tileFit?: 'contain' | 'cover';
  displayOrder: number;
  /** Keywords matched against the normalized product name (non-cleaning familles). */
  keywords: readonly string[];
  /** For produits-nettoyage sous-cats: the usage gamme this maps to. */
  useCaseId?: UseCaseId;
}

const CAT_IMG = (slug: string) => `/images/categories/${slug}.jpg`;
/** Transparent product packshots for the home tiles (swap freely, keep the name). */
const FAM_PACK = (file: string) => `/images/familles/${file}`;
/** Reused resell photos — stand-in tile art until dedicated packshots exist. */
const RESELL = (file: string) => `/images/products/resell/${file}`;

export const familles: readonly Famille[] = [
  {
    id: 'tous-les-produits',
    slug: 'tous-les-produits',
    image: CAT_IMG('produits-nettoyage'),
    packshot: FAM_PACK('produits-nettoyage.png'),
    displayOrder: 0,
  },
  {
    id: 'produits-nettoyage',
    slug: 'produits-nettoyage',
    image: CAT_IMG('produits-nettoyage'),
    packshot: FAM_PACK('produits-nettoyage.png'),
    displayOrder: 10,
  },
  {
    id: 'materiel-hygiene',
    slug: 'materiel-hygiene',
    image: CAT_IMG('materiel-hygiene'),
    packshot: FAM_PACK('materiel-hygiene.png'),
    displayOrder: 20,
  },
  {
    id: 'papier-epi',
    slug: 'papier-epi',
    image: CAT_IMG('papier-epi'),
    packshot: FAM_PACK('papier-epi.png'),
    displayOrder: 30,
  },
  {
    id: 'collecte-dechets',
    slug: 'collecte-dechets',
    image: CAT_IMG('collecte-dechets'),
    packshot: RESELL('sac-poubelle-geant.jpg'),
    displayOrder: 40,
  },
  {
    id: 'parfums-ambiance',
    slug: 'parfums-ambiance',
    image: CAT_IMG('parfums-ambiance'),
    packshot: FAM_PACK('parfums-ambiance.png'),
    displayOrder: 50,
  },
] as const;

export const familleIds: readonly FamilleId[] = familles.map((f) => f.id);

/** Public catalogue landing: famille page with sidebar (not the old stacked browse). */
export const CATALOGUE_PATH = '/produits/produits-nettoyage' as const;

/** Full-catalogue search results. Query string `q` is the typed term. */
export const SEARCH_PATH = '/produits/recherche' as const;

export function produitPath(familleId: FamilleId, sousCategorieSlug?: string): string {
  return sousCategorieSlug
    ? `/produits/${familleId}/${sousCategorieSlug}`
    : `/produits/${familleId}`;
}

export function catalogueSearchPath(query: string): string {
  const q = query.trim();
  return q ? `${SEARCH_PATH}?q=${encodeURIComponent(q)}` : SEARCH_PATH;
}

export function getFamilleBySlug(slug: string): Famille | undefined {
  return familles.find((f) => f.slug === slug);
}

/** Uppercase, accent-stripped, single-spaced — the form all rules match against. */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Manual overrides for the handful of products the keyword rules get wrong.
 * Keyed by the *normalized* product name. Add entries here as you spot them in
 * the admin — they win over the rules and survive Swiver re-syncs.
 */
const FAMILLE_OVERRIDES: Record<string, FamilleId> = {};

type Rule<T> = { id: T; keywords: readonly string[] };

// Ordered: first match wins. Most specific universes first.
const FAMILLE_RULES: Rule<FamilleId>[] = [
  {
    id: 'collecte-dechets',
    keywords: [
      'SAC POUB',
      'SACS POUB',
      'POUBELLE',
      'SAC BRETELLE',
      'SACHET BRETELLE',
      'SAC DE CONG',
      'SACHET CONG',
      'SACHET DE CONG',
      'CORBEILLE',
    ],
  },
  {
    id: 'papier-epi',
    keywords: [
      'ESSUIE TOUT',
      'ESSUIE VAISSELLE',
      'ESSUIE VERRE',
      'PAPIER HYG',
      'PAPIER CUISSON',
      'SERVIETTE',
      'FILM ALIMENTAIRE',
      'ROULEAU ALUMINI',
      'ROULEAU ALUMINUI',
      'GANT LATEX',
      'GANT NITRIL',
      'GANT VINYL',
      'GANT DISPOSABLE',
      'GANT JETABLE',
      'BLOUZE',
      'SURBLOUSE',
      'CALOT',
      'COIFFE',
      'BAVETTE',
      'SUR CHAUSSURE',
      'CURE-DENT',
      'CURE DENT',
      'FLACON POUSSE',
      'DISTRIBUTEUR A PAPIER',
      'JAMBO',
      'JUMBO',
    ],
  },
  {
    id: 'materiel-hygiene',
    keywords: [
      'BALAI',
      'BROSSE',
      'RACLETTE',
      'MANCHE',
      'PERCHE',
      'SERPILL',
      'LAVETTE',
      'EPONGE',
      'SEAU',
      'TETE DE LOUP',
      'FRANGE',
      'PELLE',
      'CHAMOISINE',
      'CACHEMIRE',
      'COTE BOULANGER',
      'GANT DE MENAGE',
      'GANT MENAGE',
      'PULVERISAT',
      'POMPE PERISTAL',
      'DISTRIBUTEUR DE SAVON',
      'GLACIERE',
      'BOUTEILLE CANARD',
      'TAMPON SUR EPONGE',
      'PINCE A LINGE',
    ],
  },
];

// Air-ambiance is checked separately because "DEOFRESH LINGE" must NOT match.
function isParfumAmbiance(n: string): boolean {
  if (/\bAIR FRESH\b|DIFF[IU]SEUR|DIPTOX|DESODOR/.test(n)) return true;
  if (n.includes('DEOFRESH') && !n.includes('LINGE')) return true;
  return false;
}

/** Resolve a product's famille from its name (base category is only a fallback hint). */
export function classifyFamille(name: string, _baseCategory?: string | null): FamilleId {
  const n = normalize(name);
  const override = FAMILLE_OVERRIDES[n];
  if (override) return override;

  if (isParfumAmbiance(n)) return 'parfums-ambiance';
  for (const rule of FAMILLE_RULES) {
    if (rule.keywords.some((kw) => n.includes(kw))) return rule.id;
  }
  return 'produits-nettoyage';
}

// --- Gamme (usage) classification, only meaningful inside produits-nettoyage ---

// Ordered: first match wins.
const GAMME_RULES: Rule<UseCaseId>[] = [
  {
    id: 'linge-textiles',
    keywords: [
      'PROLAX',
      'PROLINGE',
      'PROGRAS',
      'ARIEL',
      'DETACHEUR',
      'VANISH',
      'CLORAX',
      'DEOFRESH LINGE',
      'CARPET STAIN',
      'DR BECKMANN',
      'MOQUETTE',
      'DETACHANT',
    ],
  },
  {
    id: 'hygiene-mains',
    keywords: [
      'SANIHAND',
      'ALCOGEL',
      'ALCOHAND',
      'MANOCID',
      'GEOHAND',
      'POUDRE A MAIN',
      'POUDRER MAIN',
      'HILAC',
      'DEX POUDRE',
      'DEXEL',
      'SAVON LIQUIDE',
      'SAVON LIRA',
      'SAVON MENAGE',
      'SAVON VERT',
      'SAVON NATUREL',
      'SAVONETTE',
    ],
  },
  {
    id: 'surfaces-vitres',
    keywords: [
      'PROVITRE',
      'VITRE',
      'MR PROPRE',
      'KING NETTOYANT',
      'LILAS',
      'TOUTES SURFACES',
      'SOL ET SURFACE',
      'SOLS ET SURFACES',
      'MULTI USAGE',
      'MULTI-USAGE',
      'MULTIACTION',
      'MULTI ACTION',
      'PLIZ',
      'NETTOYANT INOX',
      'BRINOX',
      'MOLKABIN',
      'SANYTOL',
      'SANITOL',
    ],
  },
  {
    id: 'cuisine-degraissage',
    keywords: [
      'PROFOUR',
      'PROLAV',
      'PRORINSE',
      'SOLITAIRE',
      'PRILL',
      'PROKILL',
      'DEGREASER',
      'DEGRAISS',
      'CAROLIN',
      'VAISSELLE',
      'DEBOUCHEUR',
      'VIT NET',
      'GEOFOAM',
      'GEOGRAP',
      'PROLAC',
      'FORCE EXPRESS',
      'FATEK',
    ],
  },
  {
    id: 'sanitaires-desinfection',
    keywords: [
      'SIRAFAN',
      'JAVEL',
      'PILAX',
      'PROSTAR',
      'PROGERME',
      'WC NET',
      'CHOC WC',
      'BLOC WC',
      'CHOC COMBAT',
      'CHOC POUDRE',
      'DETTOL',
      'DESINFECT',
      'GEOCID',
      'GEOSEPT',
      'GRESIL',
      'BIOSPOT',
      'C SIMPLE',
      'NADHIF',
      'DETARTRANT',
      'ANTI CALCAIRE',
      'JUDY',
      'CLEANGEN',
    ],
  },
  { id: 'sols', keywords: ['PROFON', 'PRONET', 'GEOCLEAN', 'SOL'] },
];

/**
 * Best-effort usage gamme for a cleaning product. Returns null when nothing
 * matches (rendered in an "Autres produits" bucket).
 */
export function classifyGamme(name: string): UseCaseId | null {
  const n = normalize(name);
  for (const rule of GAMME_RULES) {
    if (rule.keywords.some((kw) => n.includes(kw))) return rule.id;
  }
  return null;
}

// --- Sous-catégories (level 2) ---

/** Slug used for cleaning products that match no usage gamme. */
export const AUTRES_NETTOYAGE = 'autres-nettoyage';

/** Virtual listing of the whole catalogue (not a classified bucket). */
export const TOUS_LES_PRODUITS = 'tous-les-produits';

// Cleaning sous-cats mirror the six usage gammes (slug === useCaseId).
const CLEANING_USE_CASES: { useCaseId: UseCaseId; order: number }[] = [
  { useCaseId: 'sols', order: 10 },
  { useCaseId: 'cuisine-degraissage', order: 20 },
  { useCaseId: 'sanitaires-desinfection', order: 30 },
  { useCaseId: 'linge-textiles', order: 40 },
  { useCaseId: 'hygiene-mains', order: 50 },
  { useCaseId: 'surfaces-vitres', order: 60 },
];

// Les 6 gammes de nettoyage portent une photo d'ambiance fournie par Prodet :
// on l'utilise aussi comme visuel de tuile, plus parlant que le flacon
// generique qui etait le meme dessin decline en six couleurs.
const cleaningSousCats: SousCategorie[] = CLEANING_USE_CASES.map(({ useCaseId, order }) => ({
  slug: useCaseId,
  familleId: 'produits-nettoyage',
  image: CAT_IMG(useCaseId),
  packshot: CAT_IMG(useCaseId),
  tileFit: 'cover',
  displayOrder: order,
  keywords: [],
  useCaseId,
}));

const otherSousCats: SousCategorie[] = [
  // matériel d'hygiène
  {
    slug: 'balais-brosses',
    familleId: 'materiel-hygiene',
    image: CAT_IMG('balais-brosses'),
    packshot: RESELL('tete-de-loup.webp'),
    displayOrder: 10,
    keywords: ['BALAI', 'BROSSE', 'MANCHE', 'PERCHE', 'TETE DE LOUP', 'FRANGE', 'PINCE A LINGE'],
  },
  {
    slug: 'lavettes-eponges',
    familleId: 'materiel-hygiene',
    image: CAT_IMG('lavettes-eponges'),
    packshot: RESELL('lavette-microfibre.png'),
    displayOrder: 20,
    keywords: [
      'RACLETTE',
      'LAVETTE',
      'EPONGE',
      'CHAMOISINE',
      'CACHEMIRE',
      'COTE BOULANGER',
      'TAMPON',
      'SERPILL',
    ],
  },
  {
    slug: 'seaux-chariots',
    familleId: 'materiel-hygiene',
    image: CAT_IMG('seaux-chariots'),
    packshot: FAM_PACK('materiel-hygiene.png'),
    displayOrder: 30,
    keywords: [
      'SEAU',
      'PELLE',
      'PULVERISAT',
      'POMPE',
      'DISTRIBUTEUR',
      'GLACIERE',
      'BOUTEILLE',
      'GANT DE MENAGE',
      'GANT MENAGE',
      'FLACON POUSSE',
    ],
  },
  // papier & EPI jetables
  {
    slug: 'papier-essuyage',
    familleId: 'papier-epi',
    image: CAT_IMG('papier-essuyage'),
    packshot: FAM_PACK('papier-epi.png'),
    displayOrder: 10,
    keywords: [
      'ESSUIE',
      'PAPIER',
      'SERVIETTE',
      'JUMBO',
      'JAMBO',
      'ROULEAU',
      'FILM',
      'CURE',
      'DISTRIBUTEUR A PAPIER',
    ],
  },
  {
    slug: 'gants-jetables',
    familleId: 'papier-epi',
    image: CAT_IMG('gants-jetables'),
    packshot: RESELL('gant-latex.jpg'),
    displayOrder: 20,
    keywords: ['GANT'],
  },
  {
    slug: 'protections-jetables',
    familleId: 'papier-epi',
    image: CAT_IMG('protections-jetables'),
    packshot: '',
    displayOrder: 30,
    keywords: ['BLOUZE', 'SURBLOUSE', 'CALOT', 'COIFFE', 'BAVETTE', 'SUR CHAUSSURE', 'CHARLOTTE'],
  },
  // collecte des déchets
  {
    slug: 'poubelles',
    familleId: 'collecte-dechets',
    image: CAT_IMG('poubelles'),
    packshot: RESELL('sac-poubelle-geant.jpg'),
    displayOrder: 10,
    keywords: ['POUBELLE', 'CORBEILLE', 'CONTENEUR'],
  },
  {
    slug: 'sacs-poubelle',
    familleId: 'collecte-dechets',
    image: CAT_IMG('sacs-poubelle'),
    packshot: RESELL('sac-poubelle-mm-noir.jpg'),
    displayOrder: 20,
    keywords: ['SAC POUB', 'SACS POUB', 'SAC BRETELLE', 'SACHET', 'SAC DE CONG'],
  },
  // parfums d'ambiance — DeoFresh (marque Prodet) vs sprays / air fresh commercialisés
  {
    slug: 'sprays-desodorisants',
    familleId: 'parfums-ambiance',
    image: CAT_IMG('sprays-desodorisants'),
    packshot: FAM_PACK('deofresh-750ml.png'),
    displayOrder: 10,
    // Prodet DeoFresh only (LINGE stays in produits-nettoyage via isParfumAmbiance).
    keywords: ['DEOFRESH'],
  },
  {
    slug: 'diffuseurs',
    familleId: 'parfums-ambiance',
    image: CAT_IMG('diffuseurs'),
    packshot: FAM_PACK('air-fresh-fleur-de-printemps-500ml.jpeg'),
    displayOrder: 20,
    keywords: [
      'AIR FRESH',
      'SPRAY',
      'BOMBE',
      'DIPTOX',
      'DESODOR',
      'FATEK',
      'DIFFUSEUR',
      'DIFFISEUR',
      'MECHE',
      'TIGE',
      'GLADE',
      'NASSIM',
    ],
  },
];

export const sousCategories: readonly SousCategorie[] = [...cleaningSousCats, ...otherSousCats];

export function getSousCategoriesForFamille(familleId: FamilleId): SousCategorie[] {
  return sousCategories
    .filter((s) => s.familleId === familleId)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getSousCategorie(familleId: FamilleId, slug: string): SousCategorie | undefined {
  return sousCategories.find((s) => s.familleId === familleId && s.slug === slug);
}

/** i18n key under `familles.souscats` for a slug, mapping unknown/leftover slugs to "autres". */
export function sousCatLabelKey(slug: string): string {
  if (slug === AUTRES_NETTOYAGE) return AUTRES_NETTOYAGE;
  return sousCategories.some((s) => s.slug === slug) ? slug : 'autres';
}

/**
 * Resolve a product's sous-catégorie slug within its famille. Falls back to
 * `${familleId}-autres` (or AUTRES_NETTOYAGE for cleaning) when nothing matches.
 */
export function classifySousCategorie(familleId: FamilleId, name: string): string {
  if (familleId === TOUS_LES_PRODUITS) return TOUS_LES_PRODUITS;
  if (familleId === 'produits-nettoyage') {
    return classifyGamme(name) ?? AUTRES_NETTOYAGE;
  }
  const n = normalize(name);
  for (const sub of getSousCategoriesForFamille(familleId)) {
    if (sub.keywords.some((kw) => n.includes(kw))) return sub.slug;
  }
  return `${familleId}-autres`;
}

// --- Curation overrides (admin) ---

export function isFamilleId(value: string | null | undefined): value is FamilleId {
  return value != null && familleIds.includes(value as FamilleId);
}

/**
 * Familles a product can actually be placed in. "Tous les produits" is a flat
 * listing of the whole catalogue, not a bucket — placing a product *into* it
 * would take that product out of every real famille page.
 */
export const curationFamilleIds: readonly FamilleId[] = familleIds.filter(
  (id) => id !== TOUS_LES_PRODUITS,
);

export function isCurationFamilleId(value: string | null | undefined): value is FamilleId {
  return isFamilleId(value) && value !== TOUS_LES_PRODUITS;
}

/** Slug of the leftover bucket a famille falls back to when no rule matches. */
export function leftoverSousCategorieSlug(familleId: FamilleId): string {
  return familleId === 'produits-nettoyage' ? AUTRES_NETTOYAGE : `${familleId}-autres`;
}

/** Slugs an admin may assign inside a famille: its sous-catégories + its leftover bucket. */
export function assignableSousCategorieSlugs(familleId: FamilleId): string[] {
  return [
    ...getSousCategoriesForFamille(familleId).map((s) => s.slug),
    leftoverSousCategorieSlug(familleId),
  ];
}

export function isSousCategorieOfFamille(
  familleId: FamilleId,
  slug: string | null | undefined,
): boolean {
  return slug != null && assignableSousCategorieSlugs(familleId).includes(slug);
}

export type PlacementOrigin = 'manual' | 'auto';

export type PlacementInput = {
  /** Name the classifier reads — the displayed name (display_name || name). */
  name: string;
  baseCategory?: string | null;
  familleSlug?: string | null;
  sousCategorieSlug?: string | null;
};

export type ResolvedPlacement = {
  familleId: FamilleId;
  sousCategorieSlug: string;
  familleOrigin: PlacementOrigin;
  sousCategorieOrigin: PlacementOrigin;
};

/**
 * Where a product sits in the browse taxonomy. The admin override wins; the
 * keyword classifier is the fallback for everything left uncurated.
 *
 * A stored sous-catégorie that does not belong to the resolved famille is
 * ignored rather than trusted — the famille can be moved (or the taxonomy
 * edited) after the sous-catégorie was chosen, and a dangling slug would
 * otherwise create a sous-catégorie page nobody can reach.
 */
export function resolvePlacement(input: PlacementInput): ResolvedPlacement {
  const manualFamille = isCurationFamilleId(input.familleSlug) ? input.familleSlug : null;
  const familleId = manualFamille ?? classifyFamille(input.name, input.baseCategory);

  const manualSousCat = isSousCategorieOfFamille(familleId, input.sousCategorieSlug)
    ? (input.sousCategorieSlug as string)
    : null;

  return {
    familleId,
    sousCategorieSlug: manualSousCat ?? classifySousCategorie(familleId, input.name),
    familleOrigin: manualFamille ? 'manual' : 'auto',
    sousCategorieOrigin: manualSousCat ? 'manual' : 'auto',
  };
}
