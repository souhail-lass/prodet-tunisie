import type { CatalogueCardProduct } from '@/types/product';

/**
 * Shared client-side catalogue search. The public catalogue is small enough to
 * ship to the browser (formats are empty for synced rows, so a card is a few
 * hundred bytes), which keeps search instant and works on statically rendered
 * pages without an API round trip.
 */

/** Lowercase + strip accents so "degraissant" matches "Dégraissant". */
export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLowerCase()
    .trim();
}

function haystack(product: CatalogueCardProduct): string {
  return normalizeSearchText(
    [
      product.name,
      product.tagline ?? '',
      product.slug,
      product.categoryLabel ?? '',
      ...product.formats.map((format) => format.label),
    ].join(' '),
  );
}

/**
 * Catalogue names mix singular and plural ("GANT DE MENAGE", "SERVIETTES
 * ENCHEVETREES"), so a term typed in the plural also matches its singular.
 * The reverse needs no help — "serviette" is already a substring of
 * "serviettes".
 */
function termMatches(hay: string, term: string): boolean {
  if (hay.includes(term)) return true;
  return term.length > 3 && term.endsWith('s') && hay.includes(term.slice(0, -1));
}

/**
 * Rank: a product whose *name* opens with the query beats one that merely
 * contains it, which beats a match found only in the tagline/SKU/format.
 * Lower is better.
 */
function score(product: CatalogueCardProduct, terms: string[]): number {
  const name = normalizeSearchText(product.name);
  const first = terms[0] ?? '';
  const singular = first.endsWith('s') ? first.slice(0, -1) : first;
  if (name.startsWith(first) || name.startsWith(singular)) return 0;
  if (termMatches(name, first)) return 1;
  return 2;
}

/**
 * Products matching every whitespace-separated term ("javel 5" → both), best
 * matches first. Empty query → no results (callers show their normal browse).
 */
export function searchCatalogue<T extends CatalogueCardProduct>(
  products: T[],
  query: string,
  limit?: number,
): T[] {
  const terms = normalizeSearchText(query).split(/\s+/u).filter(Boolean);
  if (terms.length === 0) return [];

  const matches = products.filter((product) => {
    const hay = haystack(product);
    return terms.every((term) => termMatches(hay, term));
  });

  matches.sort((a, b) => score(a, terms) - score(b, terms) || a.name.localeCompare(b.name));
  return typeof limit === 'number' ? matches.slice(0, limit) : matches;
}
