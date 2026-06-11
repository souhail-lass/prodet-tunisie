import type { PortalProductOption } from '@/features/client-portal/request-builder.types';

export function normalizePortalSearchText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{Mark}+/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export function portalProductHaystack(product: PortalProductOption): string {
  const slugPhrase = product.slug.replace(/-/g, ' ');
  return normalizePortalSearchText(
    [product.productName, slugPhrase, product.categoryName, product.conditionnement, product.unitOfSale]
      .filter(Boolean)
      .join(' '),
  );
}

/** Même logique que le catalogue : chaque « mot » du texte doit apparaître dans le champ texte. */
export function portalProductMatchesQuery(
  product: PortalProductOption,
  rawQuery: string,
): boolean {
  const q = normalizePortalSearchText(rawQuery).slice(0, 80);
  if (!q) return false;

  const haystack = portalProductHaystack(product);
  const terms = q.split(/\s+/).filter((term) => term.length > 0);
  if (terms.length === 0) return false;
  return terms.every((term) => haystack.includes(term));
}

export function portalProductSearchRank(product: PortalProductOption, rawQuery: string): number {
  const q = normalizePortalSearchText(rawQuery).slice(0, 80);
  if (!q) return 0;

  const firstTerm = q.split(/\s+/).filter(Boolean)[0] ?? '';
  const nameNorm = normalizePortalSearchText(product.productName);
  const slugNorm = normalizePortalSearchText(product.slug.replace(/-/g, ' '));
  const haystack = portalProductHaystack(product);

  let rank = 0;
  if (firstTerm && nameNorm.startsWith(firstTerm)) rank += 100;
  if (firstTerm && slugNorm.includes(firstTerm)) rank += 40;

  q.split(/\s+/).forEach((term) => {
    if (haystack.includes(term)) rank += 8;
    if (nameNorm.includes(term)) rank += 4;
    if (slugNorm.includes(term)) rank += 6;
  });

  return rank;
}
