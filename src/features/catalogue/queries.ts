import 'server-only';
import { eq, type SQL } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import type { Product, ProductCategory, ProductSpec } from '@/types/product';

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

/** Stable, URL-safe slug for a catalogue row (SKU preferred, falls back to id). */
export function productSlug(row: { sku: string | null; id: string }): string {
  if (row.sku && /^[a-zA-Z0-9._-]+$/.test(row.sku)) return row.sku;
  return row.id;
}

function mapRowToProduct(row: AdminProductRow): Product {
  return {
    id: row.id,
    slug: productSlug(row),
    name: row.displayName || row.name,
    tagline: row.tagline ?? '',
    category: mapCategory(row.baseCategory),
    categoryLabel: row.baseCategory ?? undefined,
    useCases: [],
    sectors: [],
    description: row.description ?? row.baseDescription ?? '',
    formats: [],
    image: row.imageUrl || row.baseImageUrl || '',
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
