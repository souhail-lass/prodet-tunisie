import 'server-only';
import { eq, type SQL } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import type { CatalogueCardProduct, Product, ProductCategory, ProductSpec } from '@/types/product';
import {
  curationFamilleIds,
  familleIds,
  getSousCategoriesForFamille,
  TOUS_LES_PRODUITS,
  type FamilleId,
  type ResolvedPlacement,
} from '@/data/familles';
import { resolveResellImage } from '@/data/resell-images';
import { pickHomepagePopular } from '@/data/homepage-popular';
import {
  assignUniqueProductSlugs,
  findRowForProductSlug,
  legacyProductSlug,
} from '@/lib/product-slug';
import { findCatalogueByBrandKey } from '@/lib/sector-catalogue';
import {
  compareCatalogueRank,
  famillesOf,
  listingsOf,
  parseExtraPlacements,
  pinnedCatalogueRows,
  resolveRowPlacement,
  rowsInSousCategorie,
  sortCurationRows,
  type ExtraPlacement,
} from './placement';

/**
 * Cache tag for everything derived from catalogue_product. Admin mutations
 * call revalidateTag(CATALOGUE_CACHE_TAG) so the public site updates
 * immediately after an edit; the time-based revalidate below is only a
 * safety net for out-of-band DB changes.
 */
export const CATALOGUE_CACHE_TAG = 'catalogue';

export type AdminProductRow = {
  id: string;
  source: string;
  swiverId: string | null;
  sku: string | null;
  name: string;
  displayName: string | null;
  baseImageUrl: string | null;
  imageUrl: string | null;
  baseCategory: string | null;
  unitPrice: string | null;
  tagline: string | null;
  description: string | null;
  baseDescription: string | null;
  howToUse: string | null;
  dosage: string | null;
  specs: ProductSpec[] | null;
  technicalSheetUrl: string | null;
  safetySheetUrl: string | null;
  familleSlug: string | null;
  sousCategorieSlug: string | null;
  sortOrder: number | null;
  catalogueRank: number | null;
  extraPlacements: ExtraPlacement[];
  hidden: boolean;
  featured: boolean;
};

function mapCategory(label: string | null): ProductCategory {
  return (label ?? '').toUpperCase().includes('FINIS') ? 'manufactured' : 'commercialized';
}

/**
 * Default packshot for Prodet-manufactured products that have no synced photo.
 * Per product direction: Prodet solutions always show the SIRAFAN packshot;
 * commercialized articles stay imageless (clean fallback tile) until a real
 * photo is added.
 */
const PRODET_PACKSHOT = '/images/products/sirafan.png';

function mapRowToProduct(row: AdminProductRow, slug: string): Product {
  const category = mapCategory(row.baseCategory);
  const realImage = row.imageUrl || row.baseImageUrl || '';
  // Photo precedence: real Swiver/admin image → committed resell packshot
  // (matched by name) → SIRAFAN packshot for manufactured solutions → none.
  const resellImage = realImage ? '' : resolveResellImage(row.displayName || row.name);
  return {
    id: row.id,
    slug,
    sku: row.sku,
    name: row.displayName || row.name,
    tagline: row.tagline ?? '',
    category,
    categoryLabel: row.baseCategory ?? undefined,
    useCases: [],
    sectors: [],
    description: row.description ?? row.baseDescription ?? '',
    formats: [],
    image: realImage || resellImage || (category === 'manufactured' ? PRODET_PACKSHOT : ''),
    howToUse: row.howToUse ?? undefined,
    dosage: row.dosage ?? undefined,
    specs: row.specs ?? undefined,
    technicalSheetUrl: row.technicalSheetUrl ?? undefined,
    safetySheetUrl: row.safetySheetUrl ?? undefined,
    featured: row.featured,
  };
}

async function selectRows(where?: SQL): Promise<AdminProductRow[]> {
  const { db, schema } = await import('@/db/client');
  const t = schema.catalogueProduct;
  const cols = {
    id: t.id,
    source: t.source,
    swiverId: t.swiverId,
    sku: t.sku,
    name: t.name,
    displayName: t.displayName,
    baseImageUrl: t.baseImageUrl,
    imageUrl: t.imageUrl,
    baseCategory: t.baseCategory,
    unitPrice: t.unitPrice,
    tagline: t.tagline,
    description: t.description,
    baseDescription: t.baseDescription,
    howToUse: t.howToUse,
    dosage: t.dosage,
    specs: t.specs,
    technicalSheetUrl: t.technicalSheetUrl,
    safetySheetUrl: t.safetySheetUrl,
    familleSlug: t.familleSlug,
    sousCategorieSlug: t.sousCategorieSlug,
    sortOrder: t.sortOrder,
    catalogueRank: t.catalogueRank,
    extraPlacements: t.extraPlacements,
    hidden: t.hidden,
    featured: t.featured,
  };
  const rows = where
    ? await db.select(cols).from(t).where(where).orderBy(t.name)
    : await db.select(cols).from(t).orderBy(t.name);
  return (rows as unknown as AdminProductRow[]).map((row) => ({
    ...row,
    extraPlacements: parseExtraPlacements(row.extraPlacements),
  }));
}

/**
 * All catalogue rows (incl. hidden), fetched once and shared by every public
 * read below. One tagged cache entry means one DB round trip per revalidation
 * window instead of one per page render.
 */
const getCachedCatalogueRows = unstable_cache(
  async (): Promise<AdminProductRow[]> => selectRows(),
  ['catalogue-rows'],
  { revalidate: 300, tags: [CATALOGUE_CACHE_TAG] },
);

export async function getCatalogueCount(): Promise<number> {
  const { db, schema } = await import('@/db/client');
  const rows = await db.select({ id: schema.catalogueProduct.id }).from(schema.catalogueProduct);
  return rows.length;
}

function mapCatalogueRows(rows: AdminProductRow[]): Product[] {
  return mapSelectedRows(rows, rows);
}

/**
 * Map a curated selection while deriving slugs from the full catalogue.
 * `assignUniqueProductSlugs` resolves name collisions in list order, so a
 * subset (or a reordered list) would hand the same product a different URL on
 * different pages — always pass the complete, name-ordered row set.
 */
function mapSelectedRows(allRows: AdminProductRow[], selected: AdminProductRow[]): Product[] {
  const slugs = assignUniqueProductSlugs(allRows);
  return selected.map((row) => mapRowToProduct(row, slugs.get(row.id) ?? legacyProductSlug(row)));
}

/** Public catalogue products (visible), mapped to the website Product shape. */
export async function getVisibleCatalogue(): Promise<Product[]> {
  const rows = await getCachedCatalogueRows();
  const hidden = new Set(rows.filter((r) => r.hidden).map((r) => r.id));
  return mapCatalogueRows(rows).filter((p) => !hidden.has(p.id));
}

/**
 * Slim product cards shipped to the browser so any catalogue page can run the
 * shared client-side search (see `@/lib/product-search`). Kept to the card
 * fields only — descriptions and specs stay on the server.
 */
export async function getCatalogueSearchCards(): Promise<CatalogueCardProduct[]> {
  const products = await getVisibleCatalogue();
  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    category: p.category,
    categoryLabel: p.categoryLabel,
    image: p.image,
    formats: p.formats,
  }));
}

export async function getCatalogueCategories(): Promise<string[]> {
  const products = await getVisibleCatalogue();
  return Array.from(new Set(products.map((p) => p.categoryLabel).filter((c): c is string => Boolean(c)))).sort();
}

async function getVisibleRows(): Promise<AdminProductRow[]> {
  return (await getCachedCatalogueRows()).filter((r) => !r.hidden);
}

/**
 * Number of visible products in each top-level famille. Drives the count badge
 * on the home/catalogue famille cards. Counts follow the admin override when
 * there is one and the keyword classifier otherwise (see resolvePlacement), so
 * a card never advertises a different number than its page lists.
 */
export async function getFamilleCounts(): Promise<Record<FamilleId, number>> {
  const rows = await getVisibleRows();
  const counts = Object.fromEntries(familleIds.map((id) => [id, 0])) as Record<FamilleId, number>;
  for (const row of rows) {
    for (const familleId of famillesOf(row)) counts[familleId] += 1;
  }
  // "Tous les produits" is a listing of the whole catalogue, not a bucket
  // resolvePlacement can return, so its count is the total.
  counts[TOUS_LES_PRODUITS] = rows.length;
  return counts;
}

/** Visible products belonging to a given famille, in curation order. */
export async function getCatalogueByFamille(familleId: FamilleId): Promise<Product[]> {
  const allRows = await getCachedCatalogueRows();
  const rows = allRows.filter((r) => !r.hidden);
  if (familleId === TOUS_LES_PRODUITS) {
    return mapSelectedRows(allRows, [...rows].sort(compareCatalogueRank));
  }
  const selected = sortCurationRows(
    rows.filter((row) => famillesOf(row).includes(familleId)),
  );
  return mapSelectedRows(allRows, selected);
}

export type SousCategorieCount = { slug: string; count: number };

/**
 * Product counts per defined sous-catégorie of a famille, plus any leftover
 * "autres" bucket. Drives the sous-catégorie cards on the famille page.
 */
export async function getSousCategorieCounts(familleId: FamilleId): Promise<SousCategorieCount[]> {
  const rows = await getVisibleRows();
  const counts = new Map<string, number>();
  for (const row of rows) {
    for (const listing of listingsOf(row)) {
      if (listing.familleId !== familleId) continue;
      counts.set(listing.sousCategorieSlug, (counts.get(listing.sousCategorieSlug) ?? 0) + 1);
    }
  }
  const ordered: SousCategorieCount[] = getSousCategoriesForFamille(familleId)
    .map((s) => ({ slug: s.slug, count: counts.get(s.slug) ?? 0 }))
    .filter((s) => s.count > 0);
  // Append any leftover bucket (autres-nettoyage / {famille}-autres) last.
  const known = new Set(ordered.map((s) => s.slug));
  for (const [slug, count] of counts) {
    if (!known.has(slug)) ordered.push({ slug, count });
  }
  return ordered;
}

/** Visible products in a famille's sous-catégorie (incl. the "autres" bucket). */
export async function getCatalogueBySousCategorie(
  familleId: FamilleId,
  sousCategorieSlug: string,
): Promise<Product[]> {
  const allRows = await getCachedCatalogueRows();
  const selected = rowsInSousCategorie(
    allRows.filter((r) => !r.hidden),
    familleId,
    sousCategorieSlug,
  );
  return mapSelectedRows(allRows, selected);
}

/** Where a product sits in the browse taxonomy, override included. */
export async function getProductPlacementBySlug(slug: string): Promise<ResolvedPlacement | null> {
  const rows = await getCachedCatalogueRows();
  const match = findRowForProductSlug(rows, slug);
  return match ? resolveRowPlacement(match) : null;
}

/**
 * Products shown under "à découvrir aussi" on a product page: same famille,
 * same sous-catégorie first, then the famille's curation order.
 */
export async function getRelatedCatalogue(slug: string, limit = 4): Promise<Product[]> {
  const allRows = await getCachedCatalogueRows();
  const rows = allRows.filter((r) => !r.hidden);
  const target = findRowForProductSlug(rows, slug);
  if (!target) return [];
  const placement = resolveRowPlacement(target);

  const siblings = sortCurationRows(
    rows.filter((row) => row.id !== target.id && resolveRowPlacement(row).familleId === placement.familleId),
  );
  const selected = siblings
    .sort(
      (a, b) =>
        Number(resolveRowPlacement(b).sousCategorieSlug === placement.sousCategorieSlug) -
        Number(resolveRowPlacement(a).sousCategorieSlug === placement.sousCategorieSlug),
    )
    .slice(0, limit);
  return mapSelectedRows(allRows, selected);
}

export async function getCatalogueProductBySlug(slug: string): Promise<Product | null> {
  const rows = await getCachedCatalogueRows();
  const match = findRowForProductSlug(rows, slug);
  if (match) {
    const slugs = assignUniqueProductSlugs(rows);
    return mapRowToProduct(match, slugs.get(match.id) ?? legacyProductSlug(match));
  }

  // Old sector/fixture URLs (`/catalogue/provitre`) still resolve, then the
  // PDP 308s onto the live name slug.
  const hidden = new Set(rows.filter((r) => r.hidden).map((r) => r.id));
  const visible = mapCatalogueRows(rows).filter((p) => !hidden.has(p.id));
  return findCatalogueByBrandKey(visible, slug) ?? null;
}

export async function getFeaturedCatalogue(limit = 4): Promise<Product[]> {
  const rows = await getCachedCatalogueRows();
  return mapSelectedRows(rows, pickHomepagePopular(rows, limit));
}

/** All rows for the admin manager (incl. hidden). */
export async function listAdminProducts(): Promise<AdminProductRow[]> {
  const rows = await selectRows();
  return [...rows].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

export type CurationProduct = {
  id: string;
  name: string;
  sku: string | null;
  image: string;
  hidden: boolean;
  sortOrder: number | null;
  pinned: boolean;
  origin: 'manual' | 'auto' | 'extra';
};

export type CurationSousCategorie = {
  slug: string;
  familleId: FamilleId;
  products: CurationProduct[];
};

export type CurationFamille = {
  familleId: FamilleId;
  sousCategories: CurationSousCategorie[];
};

/**
 * The whole catalogue grouped the way it is browsed, for the ordering screen.
 * Hidden products are kept (flagged) so the admin reorders the same list they
 * see in the product manager instead of a silently shorter one.
 *
 * "Tous les produits" is a single synthetic group holding only the pinned
 * head of the flat listing — the rest of that page is alphabetical and has
 * nothing to drag.
 */
export async function listCurationGroups(): Promise<CurationFamille[]> {
  const rows = await selectRows();

  const toCurationProduct = (row: AdminProductRow, origin: CurationProduct['origin']): CurationProduct => ({
    id: row.id,
    name: row.displayName || row.name,
    sku: row.sku,
    image: row.imageUrl || row.baseImageUrl || '',
    hidden: row.hidden,
    sortOrder: row.sortOrder,
    pinned: row.catalogueRank != null,
    origin,
  });

  const allProducts: CurationFamille = {
    familleId: TOUS_LES_PRODUITS,
    sousCategories: [
      {
        slug: TOUS_LES_PRODUITS,
        familleId: TOUS_LES_PRODUITS,
        products: pinnedCatalogueRows(rows).map((row) => toCurationProduct(row, 'manual')),
      },
    ],
  };

  const byFamille = curationFamilleIds.map((familleId) => {
    const slugs = new Set<string>();
    for (const row of rows) {
      for (const listing of listingsOf(row)) {
        if (listing.familleId === familleId) slugs.add(listing.sousCategorieSlug);
      }
    }
    const defined = getSousCategoriesForFamille(familleId)
      .map((s) => s.slug)
      .filter((slug) => slugs.has(slug));
    const leftovers = [...slugs].filter((slug) => !defined.includes(slug)).sort();

    return {
      familleId,
      sousCategories: [...defined, ...leftovers].map((slug) => ({
        slug,
        familleId,
        products: rowsInSousCategorie(rows, familleId, slug).map((row) => {
          const listing = listingsOf(row).find(
            (item) => item.familleId === familleId && item.sousCategorieSlug === slug,
          );
          const origin: CurationProduct['origin'] =
            listing?.origin === 'extra' ? 'extra' : resolveRowPlacement(row).sousCategorieOrigin;
          return toCurationProduct(row, origin);
        }),
      })),
    };
  });

  return [allProducts, ...byFamille];
}

export async function getAdminProduct(id: string): Promise<AdminProductRow | null> {
  const { schema } = await import('@/db/client');
  const rows = await selectRows(eq(schema.catalogueProduct.id, id));
  return rows[0] ?? null;
}

export type OrderableProduct = {
  swiverId: string;
  sku: string | null;
  name: string;
  image: string;
  unitPrice: number | null;
  categoryLabel: string | null;
};

/** Visible catalogue products that can be ordered (have a Swiver id). */
export async function getOrderableCatalogue(): Promise<OrderableProduct[]> {
  const rows = (await getCachedCatalogueRows()).filter((r) => !r.hidden);
  return rows
    .filter((r) => r.swiverId)
    .map((r) => ({
      swiverId: r.swiverId as string,
      sku: r.sku,
      name: r.displayName || r.name,
      image: r.imageUrl || r.baseImageUrl || '',
      unitPrice: r.unitPrice != null ? Number(r.unitPrice) : null,
      categoryLabel: r.baseCategory ?? null,
    }));
}

/**
 * Map catalogue product ids to their Swiver ids + unit price, for the public
 * devis push. Products created in the admin (source='local') have no Swiver
 * id and are simply absent from the map — the caller pushes what it can and
 * lists the rest in the notification email.
 */
export async function getSwiverLinesForProductIds(
  ids: string[],
): Promise<Map<string, { swiverId: string; unitPrice: number | null }>> {
  const wanted = new Set(ids);
  const out = new Map<string, { swiverId: string; unitPrice: number | null }>();
  for (const row of await getCachedCatalogueRows()) {
    if (!row.swiverId || !wanted.has(row.id)) continue;
    out.set(row.id, {
      swiverId: row.swiverId,
      unitPrice: row.unitPrice != null ? Number(row.unitPrice) : null,
    });
  }
  return out;
}
