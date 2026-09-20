import { normalizeSearchText } from '@/lib/product-search';

/**
 * Sector landing pages used to point at the static fixture catalogue
 * (`provitre`, `sanihand`, …). The public PDP now serves the live Swiver
 * rows, whose slugs are the full names (`provitre-bid-5kg`). These keys are
 * the brand stems from the zone copy; we resolve them against the live
 * catalogue so every card is a real, clickable product.
 *
 * Keys that no longer exist as a distinct live reference are aliased to the
 * closest current brand (see BRAND_KEY_ALIASES).
 */
const BRAND_KEY_ALIASES: Record<string, string> = {
  'pronet-plus': 'pronet',
  'vit-net': 'provitre',
  'prolax-couleur': 'prolax-blanc',
};

export type BrandMatchProduct = {
  id: string;
  name: string;
  slug: string;
  category?: string;
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

/** Whole-token match so `pro` never swallows PROFON / PROFOUR. */
function hasToken(hay: string, token: string): boolean {
  return new RegExp(`(?:^|[^a-z0-9])${escapeRegex(token)}(?:[^a-z0-9]|$)`, 'u').test(hay);
}

export function resolveBrandKey(key: string): string {
  return BRAND_KEY_ALIASES[key] ?? key;
}

export function productMatchesBrandKey(product: BrandMatchProduct, key: string): boolean {
  const resolved = resolveBrandKey(key);
  const tokens = resolved.split(/[-_]+/u).filter(Boolean);
  if (tokens.length === 0) return false;

  const hay = normalizeSearchText(`${product.name} ${product.slug}`);
  if (!tokens.every((token) => hasToken(hay, token))) return false;

  // Bare "deofresh" is the ambient range; linge is a separate zone key.
  if (resolved === 'deofresh' && hasToken(hay, 'linge')) return false;

  return true;
}

export function matchCatalogueByBrandKey<T extends BrandMatchProduct>(products: T[], key: string): T[] {
  return products
    .filter((product) => productMatchesBrandKey(product, key))
    .sort(
      (a, b) =>
        Number(b.category === 'manufactured') - Number(a.category === 'manufactured') ||
        a.name.localeCompare(b.name, 'fr'),
    );
}

/** First live product for an old fixture slug (`/catalogue/provitre`). */
export function findCatalogueByBrandKey<T extends BrandMatchProduct>(
  products: T[],
  key: string,
): T | undefined {
  return matchCatalogueByBrandKey(products, key)[0];
}

/**
 * Resolve a zone's brand keys to live catalogue rows, in key order, unique
 * by id. Missing keys are skipped so a re-sync never blanks the whole page.
 */
export function resolveZoneProducts<T extends BrandMatchProduct>(
  catalogue: T[],
  keys: readonly string[],
): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const key of keys) {
    for (const product of matchCatalogueByBrandKey(catalogue, key)) {
      if (seen.has(product.id)) continue;
      seen.add(product.id);
      out.push(product);
    }
  }
  return out;
}
