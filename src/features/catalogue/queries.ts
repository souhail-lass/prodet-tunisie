import 'server-only';
import { eq, type SQL } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import type { Product, ProductCategory, ProductSpec } from '@/types/product';
import {
  classifyFamille,
  classifySousCategorie,
  familleIds,
  getSousCategoriesForFamille,
  type FamilleId,
} from '@/data/familles';
import { resolveResellImage } from '@/data/resell-images';

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

/** Stable, URL-safe slug for a catalogue row (SKU preferred, falls back to id). */
export function productSlug(row: { sku: string | null; id: string }): string {
  if (row.sku && /^[a-zA-Z0-9._-]+$/.test(row.sku)) return row.sku;
  return row.id;
}

function mapRowToProduct(row: AdminProductRow): Product {
  const category = mapCategory(row.baseCategory);
  const realImage = row.imageUrl || row.baseImageUrl || '';
  // Photo precedence: real Swiver/admin image → committed resell packshot
  // (matched by name) → SIRAFAN packshot for manufactured solutions → none.
  const resellImage = realImage ? '' : resolveResellImage(row.displayName || row.name);
  return {
    id: row.id,
    slug: productSlug(row),
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

/** Public catalogue products (visible), mapped to the website Product shape. */
export async function getVisibleCatalogue(): Promise<Product[]> {
  const rows = await getCachedCatalogueRows();
  return rows.filter((r) => !r.hidden).map(mapRowToProduct);
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
  return counts;
}

/** Visible products belonging to a given famille, in catalogue order. */
export async function getCatalogueByFamille(familleId: FamilleId): Promise<Product[]> {
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
  const match = rows.find((r) => r.sku === slug) ?? rows.find((r) => r.id === slug);
  return match ? mapRowToProduct(match) : null;
}

export async function getFeaturedCatalogue(limit = 4): Promise<Product[]> {
  const visibleRows = (await getCachedCatalogueRows()).filter((r) => !r.hidden);
  const featured = visibleRows.filter((r) => r.featured).map(mapRowToProduct);
  if (featured.length >= limit) return featured.slice(0, limit);

  // Fall back: fill with other visible products (those with an image first).
  const visible = visibleRows
    .map(mapRowToProduct)
    .sort((a, b) => (b.image ? 1 : 0) - (a.image ? 1 : 0));
  const seen = new Set(featured.map((p) => p.id));
  for (const p of visible) {
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
