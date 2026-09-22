/**
 * Commander browse buckets — usage-oriented UX chips instead of raw Swiver
 * ERP labels like "MATIERES PREMIERES" / "ARTICLES COMMERCIALISES".
 */

export const REORDER_BUCKETS = ['cuisine', 'etage', 'buanderie', 'vitres', 'materiel'] as const;

export type ReorderBucketId = (typeof REORDER_BUCKETS)[number];

const SOUS_CAT_TO_BUCKET: Record<string, ReorderBucketId> = {
  'cuisine-degraissage': 'cuisine',
  'sanitaires-desinfection': 'etage',
  sols: 'etage',
  'hygiene-mains': 'etage',
  'linge-textiles': 'buanderie',
  'surfaces-vitres': 'vitres',
};

const FAMILLE_TO_BUCKET: Record<string, ReorderBucketId> = {
  'materiel-hygiene': 'materiel',
  'papier-epi': 'materiel',
  'collecte-dechets': 'materiel',
  'parfums-ambiance': 'etage',
};

/** Keyword fallback when placement is missing or "autres". First match wins. */
const BUCKET_KEYWORDS: { id: ReorderBucketId; keywords: readonly string[] }[] = [
  {
    id: 'cuisine',
    keywords: [
      'CUISINE',
      'DEGRAIS',
      'FOUR',
      'FRITEUSE',
      'VAISSELLE',
      'LAVE VAISSELLE',
      'DESENCRAS',
      'DETERGENT VAISSEL',
    ],
  },
  {
    id: 'buanderie',
    keywords: ['LESSIVE', 'LINGE', 'BUANDER', 'ASSOUPLIS', 'DETACHEUR', 'BLANCHISS'],
  },
  {
    id: 'vitres',
    keywords: ['VITRE', 'GLACE', 'MIROIR', 'MULTI SURFACE', 'MULTI-SURFACE', 'SURFACES'],
  },
  {
    id: 'materiel',
    keywords: [
      'SAC POUB',
      'POUBELLE',
      'SERPILL',
      'BALAI',
      'BROSSE',
      'SEAU',
      'PAPIER',
      'ESSUIE',
      'SERVIETTE',
      'GANT',
      'FRANGE',
      'MANCHE',
      'RACLETTE',
      'LAVETTE',
      'EPONGE',
    ],
  },
  {
    id: 'etage',
    keywords: [
      'SANITAIRE',
      'WC',
      'TOILETTE',
      'SOL ',
      'SOLS',
      'DESINFECT',
      'JAVEL',
      'SAVON',
      'SAVON LIQUIDE',
      'CHAMBRE',
      'ETAGE',
    ],
  },
];

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Assign a Commander UX bucket from catalogue placement + product name.
 * Returns null only when nothing matches (product still appears under "Tout").
 */
export function assignReorderBucket(input: {
  name: string;
  familleId?: string | null;
  sousCategorieSlug?: string | null;
}): ReorderBucketId | null {
  const sous = input.sousCategorieSlug ?? '';
  if (sous && SOUS_CAT_TO_BUCKET[sous]) return SOUS_CAT_TO_BUCKET[sous];

  const famille = input.familleId ?? '';
  if (famille && FAMILLE_TO_BUCKET[famille]) return FAMILLE_TO_BUCKET[famille];

  const n = normalize(input.name);
  for (const rule of BUCKET_KEYWORDS) {
    if (rule.keywords.some((kw) => n.includes(kw))) return rule.id;
  }

  // Cleaning leftovers → étage (housekeeping default) rather than hiding them.
  if (famille === 'produits-nettoyage') return 'etage';

  return null;
}
