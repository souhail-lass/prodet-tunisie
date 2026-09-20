import 'server-only';
import { eq, type SQL } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import type { CatalogueCardProduct, Product, ProductCategory, ProductSpec } from '@/types/product';
import {
  classifyFamille,
  classifySousCategorie,
  familleIds,
  getSousCategoriesForFamille,
  TOUS_LES_PRODUITS,
  type FamilleId,
} from '@/data/familles';
import { sortByPinnedCatalogueSku } from '@/data/catalogue-pin-order';
import { resolveResellImage } from '@/data/resell-images';
import {
  assignUniqueProductSlugs,
  findRowForProductSlug,
  legacyProductSlug,
} from '@/lib/product-slug';

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
    hidden: t.hidden,
    featured: t.featured,
  };
  const rows = where
    ? await db.select(cols).from(t).where(where).orderBy(t.name)
    : await db.select(cols).from(t).orderBy(t.name);
  return rows as unknown as AdminProductRow[];
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
  const slugs = assignUniqueProductSlugs(rows);
  return rows.map((row) => mapRowToProduct(row, slugs.get(row.id) ?? legacyProductSlug(row)));
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

/**
 * Number of visible products in each top-level famille. Drives the count badge
 * on the home/catalogue famille cards. Familles are derived from product names
 * (see classifyFamille) because the raw Swiver categories aren't browsable.
 */
export async function getFamilleCounts(): Promise<Record<FamilleId, number>> {
  const products = await getVisibleCatalogue();
  const counts = Object.fromEntries(familleIds.map((id) => [id, 0])) as Record<FamilleId, number>;
  for (const p of products) counts[classifyFamille(p.name, p.categoryLabel)] += 1;
  counts[TOUS_LES_PRODUITS] = products.length;
  return counts;
}

/** Visible products belonging to a given famille, in catalogue order. */
export async function getCatalogueByFamille(familleId: FamilleId): Promise<Product[]> {
  if (familleId === TOUS_LES_PRODUITS) {
    return sortByPinnedCatalogueSku(await getVisibleCatalogue());
  }
  const products = await getVisibleCatalogue();
  return products.filter((p) => classifyFamille(p.name, p.categoryLabel) === familleId);
}

export type SousCategorieCount = { slug: string; count: number };

/**
 * Product counts per defined sous-catégorie of a famille, plus any leftover
 * "autres" bucket. Drives the sous-catégorie cards on the famille page.
 */
export async function getSousCategorieCounts(familleId: FamilleId): Promise<SousCategorieCount[]> {
  const products = await getCatalogueByFamille(familleId);
  const counts = new Map<string, number>();
  for (const p of products) {
    const slug = classifySousCategorie(familleId, p.name);
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
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
  const products = await getCatalogueByFamille(familleId);
  return products.filter((p) => classifySousCategorie(familleId, p.name) === sousCategorieSlug);
}

export async function getCatalogueProductBySlug(slug: string): Promise<Product | null> {
  const rows = await getCachedCatalogueRows();
  const match = findRowForProductSlug(rows, slug);
  if (!match) return null;
  const slugs = assignUniqueProductSlugs(rows);
  return mapRowToProduct(match, slugs.get(match.id) ?? legacyProductSlug(match));
}

export async function getFeaturedCatalogue(limit = 4): Promise<Product[]> {
  const rows = await getCachedCatalogueRows();
  const hidden = new Set(rows.filter((r) => r.hidden).map((r) => r.id));
  const visible = mapCatalogueRows(rows).filter((p) => !hidden.has(p.id));
  const featured = visible.filter((p) => p.featured);
  if (featured.length >= limit) return featured.slice(0, limit);

  // Fall back: fill with other visible products (those with an image first).
  const ranked = [...visible].sort((a, b) => (b.image ? 1 : 0) - (a.image ? 1 : 0));
  const seen = new Set(featured.map((p) => p.id));
  for (const p of ranked) {
    if (featured.length >= limit) break;
    if (!seen.has(p.id)) featured.push(p);
  }
  return featured.slice(0, limit);
}

/** All rows for the admin manager (incl. hidden). */
export async function listAdminProducts(): Promise<AdminProductRow[]> {
  const rows = await selectRows();
  return [...rows].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
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
