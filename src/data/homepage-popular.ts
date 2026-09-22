import { normalizeSearchText } from '@/lib/product-search';

/**
 * Homepage « Produits les plus demandés » — ranked by distinct order count,
 * most sold first. Kept in code (not `featured` / `catalogue_rank`) so the
 * home strip cannot drift when an admin stars or reorders something else.
 */
export const HOMEPAGE_POPULAR_SKUS = [
  'P-00001', // SOLITAIRE VAISSELLE CITRON 5L
  'P-00013', // JAVEL PRODET BID 5KG
  'P-00014', // PROFOUR DEGRAISSANT FOUR 5KG
  'P-00031', // SERPILLERE SONIT 0.70 LOT 12P
  'P-00002', // JAVEL PRODET BID 20KG — skipped if 5KG already listed
  'P-00009', // SAC POUBELLE NOIR GM 90*120 35GR 200P
  'P-00011', // CACHEMIRE BLANC LOT 25P
  'P-00003', // SOLITAIRE VAISSELLE BID 20KG — skipped if 5L already listed
  'P-00012', // JEX CARRE SAC DE 100P
  'P-00029', // SANIHAND SAVON LIQUIDE BID 05KG
  'P-00008', // ESSUIE TOUT JUMBO XXL SAC 06P
  'P-00023', // PROGERME VERT BID 05 KG
  'P-00017', // GRESIL PRODET 5KG
  'P-00049', // DEOFRESH JASMIN 05KG
  'P-00006', // PROVITRE BID 5KG
] as const;

const PACK_TOKEN = /^(bid|bidon|sac|lot|paquet|gm|xxl|xl|l|kg|gr|g|ml|cl|p|pcs|piece|pieces)$/u;
const SIZE_TOKEN = /^\d+[.,]?\d*(l|kg|gr|g|ml|cl|p)?$/u;
const DIM_TOKEN = /^\d+[x*]\d+$/u;

export type PopularPickRow = {
  id: string;
  sku: string | null;
  name: string;
  displayName?: string | null;
  hidden?: boolean;
};

function skuKey(sku: string | null | undefined): string {
  return (sku ?? '').trim().toUpperCase();
}

/**
 * Same product line across pack sizes: "JAVEL PRODET BID 5KG" and
 * "JAVEL PRODET BID 20KG" collapse to `javel prodet`.
 */
export function popularLineKey(name: string): string {
  const tokens = normalizeSearchText(name)
    .split(/[\s/_-]+/u)
    .filter((token) => token.length > 0)
    .filter(
      (token) => !PACK_TOKEN.test(token) && !SIZE_TOKEN.test(token) && !DIM_TOKEN.test(token),
    );
  return tokens.slice(0, 2).join(' ');
}

export function pickHomepagePopular<T extends PopularPickRow>(
  rows: readonly T[],
  limit: number,
): T[] {
  const bySku = new Map<string, T>();
  for (const row of rows) {
    if (row.hidden) continue;
    const key = skuKey(row.sku);
    if (key && !bySku.has(key)) bySku.set(key, row);
  }

  const seenLines = new Set<string>();
  const out: T[] = [];
  for (const sku of HOMEPAGE_POPULAR_SKUS) {
    if (out.length >= limit) break;
    const row = bySku.get(sku);
    if (!row) continue;
    const line = popularLineKey(row.displayName || row.name);
    if (!line || seenLines.has(line)) continue;
    seenLines.add(line);
    out.push(row);
  }
  return out;
}
