/**
 * Public catalogue URLs use the product name (`/catalogue/prolac-detartrant-…`)
 * rather than the internal SKU (`/catalogue/P-00176`). SKU and id remain valid
 * lookup keys so existing links still resolve, then redirect to the name slug.
 */

export type ProductSlugSource = {
  id: string;
  sku: string | null;
  name: string;
  displayName?: string | null;
};

const MAX_SLUG_LENGTH = 80;

/** Lowercase, accent-stripped, hyphenated name for a URL path segment. */
export function slugifyProductName(name: string): string {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (slug.length <= MAX_SLUG_LENGTH) return slug;

  const cut = slug.slice(0, MAX_SLUG_LENGTH);
  const lastDash = cut.lastIndexOf('-');
  return (lastDash > 32 ? cut.slice(0, lastDash) : cut).replace(/-+$/g, '');
}

/** Previous URL key (SKU when it is already URL-safe, otherwise the row id). */
export function legacyProductSlug(row: { sku: string | null; id: string }): string {
  if (row.sku && /^[a-zA-Z0-9._-]+$/.test(row.sku)) return row.sku;
  return row.id;
}

function fallbackSlug(row: ProductSlugSource): string {
  const fromLegacy = slugifyProductName(legacyProductSlug(row));
  return fromLegacy || row.id.toLowerCase();
}

/**
 * One canonical slug per catalogue row. First product to claim a name wins;
 * later collisions append a slugified SKU/id so every URL stays unique.
 */
export function assignUniqueProductSlugs(rows: ProductSlugSource[]): Map<string, string> {
  const used = new Set<string>();
  const slugs = new Map<string, string>();

  for (const row of rows) {
    const fromName = slugifyProductName(row.displayName || row.name);
    const fallback = fallbackSlug(row);
    const withFallback = [fromName, fallback].filter(Boolean).join('-');

    let slug = fromName && !used.has(fromName) ? fromName : withFallback;
    if (!slug || used.has(slug)) {
      slug = `${withFallback || 'produit'}-${row.id.slice(0, 8).toLowerCase()}`;
    }

    let unique = slug;
    let n = 2;
    while (used.has(unique)) {
      unique = `${slug}-${n}`;
      n += 1;
    }

    used.add(unique);
    slugs.set(row.id, unique);
  }

  return slugs;
}

export function findRowForProductSlug<T extends ProductSlugSource>(
  rows: T[],
  slug: string,
): T | undefined {
  const slugs = assignUniqueProductSlugs(rows);
  const byCanonical = rows.find((row) => slugs.get(row.id) === slug);
  if (byCanonical) return byCanonical;

  const needle = slug.toLowerCase();
  return rows.find(
    (row) =>
      row.id === slug ||
      row.sku === slug ||
      (row.sku != null && row.sku.toLowerCase() === needle) ||
      row.id.toLowerCase() === needle,
  );
}
