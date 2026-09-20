/**
 * Temporary catalogue pin order: best-sellers first, by distinct order count.
 * The remaining ranking will be replaced by the upcoming catalogue-order
 * feature — keep this list SKU-keyed so that work can take over in place.
 */
export const PINNED_CATALOGUE_SKUS = [
  'P-00001', // SOLITAIRE VAISSELLE CITRON 5L
  'P-00013', // JAVEL PRODET BID 5KG
  'P-00014', // PROFOUR DEGRAISSANT FOUR 5KG
  'P-00031', // SERPILLERE SONIT 0.70 LOT 12P
  'P-00002', // JAVEL PRODET BID 20KG
  'P-00009', // SAC POUBELLE NOIR GM 90*120 35GR 200P
  'P-00011', // CACHEMIRE BLANC LOT 25P
  'P-00003', // SOLITAIRE VAISSELLE BID 20KG
  'P-00012', // JEX CARRE SAC DE 100P
  'P-00029', // SANIHAND SAVON LIQUIDE BID 05KG
  'P-00008', // ESSUIE TOUT JUMBO XXL SAC 06P
  'P-00023', // PROGERME VERT BID 05 KG
  'P-00017', // GRESIL PRODET 5KG
  'P-00049', // DEOFRESH JASMIN 05KG
  'P-00006', // PROVITRE BID 5KG
] as const;

const PINNED_RANK = new Map(
  PINNED_CATALOGUE_SKUS.map((sku, index) => [sku.toUpperCase(), index]),
);

function skuKey(sku: string | null | undefined): string | undefined {
  if (!sku) return undefined;
  const key = sku.trim().toUpperCase();
  return key || undefined;
}

export function pinnedCatalogueRank(sku: string | null | undefined): number | undefined {
  const key = skuKey(sku);
  return key ? PINNED_RANK.get(key) : undefined;
}

/** Pins the best-sellers first; everything else keeps a stable name order. */
export function sortByPinnedCatalogueSku<T extends { sku?: string | null; name: string }>(
  products: readonly T[],
): T[] {
  return [...products].sort((a, b) => {
    const ra = pinnedCatalogueRank(a.sku);
    const rb = pinnedCatalogueRank(b.sku);
    if (ra !== undefined && rb !== undefined) return ra - rb;
    if (ra !== undefined) return -1;
    if (rb !== undefined) return 1;
    return a.name.localeCompare(b.name, 'fr');
  });
}
