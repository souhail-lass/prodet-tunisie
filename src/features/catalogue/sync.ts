import 'server-only';
import { sql } from 'drizzle-orm';
import { getSwiverCatalogueProducts } from '@/integrations/swiver/catalogue';

function stripHtml(value: string | null | undefined): string | null {
  if (!value) return null;
  const text = value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  return text || null;
}

/**
 * Mirror the live Swiver catalogue into `catalogue_product`. Base fields are
 * upserted by `swiver_id`; all CMS override fields (tagline, description,
 * sheet, image, hidden, featured) are PRESERVED on existing rows.
 */
export async function syncSwiverCatalogue(): Promise<{ synced: number }> {
  const products = await getSwiverCatalogueProducts();
  if (products.length === 0) return { synced: 0 };

  const { db, schema } = await import('@/db/client');
  const now = new Date();

  const rows = products.map((p) => ({
    source: 'swiver' as const,
    swiverId: p.swiverId,
    sku: p.sku,
    name: p.name,
    baseImageUrl: p.imageUrl,
    baseCategory: p.categoryLabel,
    baseDescription: stripHtml(p.description),
    unitPrice: p.unitPrice != null ? String(p.unitPrice) : null,
    syncedAt: now,
  }));

  // Batched upsert; only base fields are refreshed on conflict.
  const chunkSize = 300;
  for (let i = 0; i < rows.length; i += chunkSize) {
    await db
      .insert(schema.catalogueProduct)
      .values(rows.slice(i, i + chunkSize))
      .onConflictDoUpdate({
        target: schema.catalogueProduct.swiverId,
        set: {
          sku: sql`excluded.sku`,
          name: sql`excluded.name`,
          baseImageUrl: sql`excluded.base_image_url`,
          baseCategory: sql`excluded.base_category`,
          baseDescription: sql`excluded.base_description`,
          unitPrice: sql`excluded.unit_price`,
          syncedAt: sql`excluded.synced_at`,
          updatedAt: now,
        },
      });
  }

  return { synced: rows.length };
}
