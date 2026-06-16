/**
 * Photos for resold (commercialized) catalogue articles.
 *
 * The live catalogue is Swiver-synced, and most resold articles arrive without
 * a product photo — so they render as an empty placeholder tile. Rather than
 * uploading each one by hand in the admin, the packshots are committed under
 * `/public/images/products/resell` and mapped to the exact Swiver product names
 * here.
 *
 * `mapRowToProduct` (src/features/catalogue/queries.ts) consults this ONLY as a
 * fallback when a row has no real image: a Swiver `base_image_url` or an
 * admin-uploaded `image_url` always wins. If a product is renamed in Swiver the
 * fallback simply stops applying (no crash) — update the name below to restore
 * it. Add a name to an existing entry to reuse one photo across pack-size
 * variants of the same article.
 *
 * Matching is accent-insensitive, case-insensitive and whitespace-collapsed.
 */

const BASE = '/images/products/resell';

type ResellPhoto = { image: string; names: readonly string[] };

const RESELL_PHOTOS: readonly ResellPhoto[] = [
  // — Matériel d'hygiène : lavettes, éponges, chiffons —
  {
    image: `${BASE}/lavette-microfibre.png`,
    names: ['LAVETTE MICROFIBRE PIECE', 'LAVETTE MICROFIBRE 3P', 'LAVETTE MICRO FIBRE LOT 24PIECES'],
  },
  { image: `${BASE}/cachemire-blanc.webp`, names: ['CACHEMIRE BLANC PIECE', 'CACHEMIRE BLANC LOT 25P', 'CACHEMIRE BLANC LOT 20'] },
  { image: `${BASE}/chamoisine-orange.jpg`, names: ['CHAMOISINE ORANGER PIECE'] },
  { image: `${BASE}/cote-boulangere.webp`, names: ['COTE BOULANGER CRISTAL PIECE'] },
  { image: `${BASE}/eponge-mousse.jpg`, names: ['EPONGE MOUSSE LOT 60P', 'EPONGE MOUSSE PIECE'] },
  { image: `${BASE}/eponge-vegetale.webp`, names: ['EPONGE VEGETAL C PIECE'] },
  { image: `${BASE}/jex-carre.webp`, names: ['JEX CARRE PIECE', 'JEX CARRE SAC DE 100P'] },
  { image: `${BASE}/jex-galvanise.jpg`, names: ['JEX GALVANISE SAC 25P'] },
  { image: `${BASE}/jex-extra-bingo.webp`, names: ['JEX EXTRA BINGO LOT 3P'] },
  { image: `${BASE}/essuie-verre.webp`, names: ['ESSUIE VERRE ET VITRE PIECE'] },

  // — Matériel d'hygiène : balais, brosses, manches, raclettes, pelles —
  { image: `${BASE}/brosse-a-linge.jpg`, names: ['BROSSE A LINGE CRISTAL'] },
  { image: `${BASE}/brosse-metallique.jpg`, names: ['BROSSE METALIQUE AVEC MANCHE CRISTAL', 'BROSSE METALIQUE'] },
  { image: `${BASE}/brosse-wc-socle.png`, names: ['BROSSE WC AVEC SOCLE'] },
  { image: `${BASE}/raclette-lion.webp`, names: ['RACLETTE LION'] },
  { image: `${BASE}/tete-de-loup.webp`, names: ['TETE DE LOUP CRISTAL PIECE'] },
  { image: `${BASE}/manche-bois-120.webp`, names: ['MANCHE EN BOIS 1.2 M'] },
  { image: `${BASE}/pelle-menagere.png`, names: ['PELLE MENAGERE'] },
  { image: `${BASE}/seau.jpg`, names: ['SEAU PRINCE A BEC 11L GRADUE PIECE'] },

  // — Matériel d'hygiène : serpillières —
  { image: `${BASE}/serpillere-microfibre.webp`, names: ['SERPILLIERE MICROFIBRE PIECE', 'SERPILLIERE MICROFIBRE LOT 12PIECES'] },
  { image: `${BASE}/serpillere-sonit.webp`, names: ['SERPILLERE SONIT 0.70 LOT 12P'] },

  // — Papier & EPI jetables —
  { image: `${BASE}/essuie-tout-jumbo-xl.jpg`, names: ['ESSUIE TOUT JUMBO XL LOT 06 P'] },
  { image: `${BASE}/papier-hygienique-lilas-48.jpg`, names: ['PAPIER HYG LILAS ULTRA DOUX LOT DE 48P'] },
  { image: `${BASE}/papier-hygienique-lilas-vrac.webp`, names: ['PAPIER HYGIENIQUE LILAS VRAC 48P'] },
  { image: `${BASE}/rouleau-aluminium-kappo.png`, names: ['ROULEAU ALUMINUIM KAPPO 100M'] },
  { image: `${BASE}/film-alimentaire-kappo.webp`, names: ['FILM ALIMENTAIRE KAPPO 300M'] },
  { image: `${BASE}/gant-de-menage.jpg`, names: ['GANT DE MENAGE PIECE'] },
  { image: `${BASE}/gant-latex.jpg`, names: ['GANT LATEX POUDRE PAQUET 100P'] },
  { image: `${BASE}/gant-vinyl-noir.jpg`, names: ['GANT VINYL NOIR PAQUET 100P'] },

  // — Collecte des déchets —
  { image: `${BASE}/sac-poubelle-geant.jpg`, names: ['SAC POUBELLE GEANT LOT 25P'] },
  { image: `${BASE}/sac-poubelle-mm-noir.jpg`, names: ['SAC POUBELLE NOIR MM LOT 25P'] },
  {
    image: `${BASE}/sac-congelation.jpg`,
    names: ['SAC DE CONGELATION 5KG LOT 50P', 'SACHET DE CONGELATION LOT 1000P', 'SACHET CONGELATION 01 KG LOT 100P'],
  },

  // — Produits revendus (marques tierces) —
  { image: `${BASE}/deboucheur-choc.jpg`, names: ['DEBOUCHEUR CHOC 300GR'] },
  { image: `${BASE}/dexel-poudre.jpg`, names: ['DEXEL POUDRE A MAIN 10KG'] },
  { image: `${BASE}/air-fresh-nassim.jpg`, names: ['AIR FRESH NASSIM 300ML'] },
];

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
}

const IMAGE_BY_NORMALIZED_NAME: ReadonlyMap<string, string> = (() => {
  const map = new Map<string, string>();
  for (const photo of RESELL_PHOTOS) {
    for (const name of photo.names) map.set(normalize(name), photo.image);
  }
  return map;
})();

/** Committed packshot for a resold article, matched by name, or null. */
export function resolveResellImage(name: string | null | undefined): string | null {
  if (!name) return null;
  return IMAGE_BY_NORMALIZED_NAME.get(normalize(name)) ?? null;
}
