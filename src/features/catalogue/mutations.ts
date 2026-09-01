import 'server-only';
import { eq } from 'drizzle-orm';
import type { ProductSpec } from '@/types/product';

export type ProductContent = {
  displayName: string | null;
  tagline: string | null;
  description: string | null;
  howToUse: string | null;
  dosage: string | null;
  specs: ProductSpec[] | null;
  technicalSheetUrl: string | null;
  safetySheetUrl: string | null;
  imageUrl: string | null;
  hidden: boolean;
  featured: boolean;
  // custom-only base fields:
  name?: string;
  sku?: string | null;
  baseCategory?: string | null;
};

async function audit(
  action: string,
  entityId: string | null,
  diff: object,
  actorUserId?: string | null,
  metadata: object = {},
) {
  const { db, schema } = await import('@/db/client');
  await db.insert(schema.auditLog).values({
    actorUserId: actorUserId ?? null,
    actorRole: 'admin',
    action,
    entityType: 'catalogue_product',
    entityId,
    diff,
    metadata,
  });
}

/** Edit an existing product. Override fields always; base fields only when allowed (custom). */
export async function saveProductContent(
  id: string,
  content: ProductContent,
  allowBaseEdit: boolean,
  actorUserId?: string | null,
): Promise<void> {
  const { db, schema } = await import('@/db/client');
  const now = new Date();
  await db
    .update(schema.catalogueProduct)
    .set({
      displayName: content.displayName,
      tagline: content.tagline,
      description: content.description,
      howToUse: content.howToUse,
      dosage: content.dosage,
      specs: content.specs,
      technicalSheetUrl: content.technicalSheetUrl,
      safetySheetUrl: content.safetySheetUrl,
      imageUrl: content.imageUrl,
      hidden: content.hidden,
      featured: content.featured,
      updatedByUserId: actorUserId ?? null,
      updatedAt: now,
      ...(allowBaseEdit
        ? {
            name: content.name || 'Produit',
            sku: content.sku ?? null,
            baseCategory: content.baseCategory ?? null,
          }
        : {}),
    })
    .where(eq(schema.catalogueProduct.id, id));
  await audit('catalogue_product.updated', id, { hidden: content.hidden, featured: content.featured }, actorUserId);
}

export async function createCustomProduct(content: ProductContent, actorUserId?: string | null): Promise<string> {
  const { db, schema } = await import('@/db/client');
  const now = new Date();
  const [row] = await db
    .insert(schema.catalogueProduct)
    .values({
      source: 'custom',
      name: content.name || 'Nouveau produit',
      sku: content.sku ?? null,
      baseCategory: content.baseCategory ?? null,
      displayName: content.displayName,
      tagline: content.tagline,
      description: content.description,
      howToUse: content.howToUse,
      dosage: content.dosage,
      specs: content.specs,
      technicalSheetUrl: content.technicalSheetUrl,
      safetySheetUrl: content.safetySheetUrl,
      imageUrl: content.imageUrl,
      hidden: content.hidden,
      featured: content.featured,
      updatedByUserId: actorUserId ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: schema.catalogueProduct.id });
  if (!row) throw new Error('catalogue_product insert returned no row');
  await audit('catalogue_product.created', row.id, { source: 'custom' }, actorUserId);
  return row.id;
}

export async function setProductHidden(id: string, hidden: boolean, actorUserId?: string | null): Promise<void> {
  const { db, schema } = await import('@/db/client');
  await db
    .update(schema.catalogueProduct)
    .set({ hidden, updatedByUserId: actorUserId ?? null, updatedAt: new Date() })
    .where(eq(schema.catalogueProduct.id, id));
  await audit(hidden ? 'catalogue_product.hidden' : 'catalogue_product.shown', id, { hidden }, actorUserId);
}

/** Hide everything in a Swiver category (bulk curation). */
export async function setCategoryHidden(categoryLabel: string, hidden: boolean, actorUserId?: string | null): Promise<void> {
  const { db, schema } = await import('@/db/client');
  await db
    .update(schema.catalogueProduct)
    .set({ hidden, updatedAt: new Date() })
    .where(eq(schema.catalogueProduct.baseCategory, categoryLabel));
  await audit('catalogue_product.category_visibility', null, { hidden }, actorUserId, { categoryLabel });
}

/** Delete a custom product (Swiver products are hidden, never deleted). */
export async function deleteCustomProduct(id: string, actorUserId?: string | null): Promise<boolean> {
  const { db, schema } = await import('@/db/client');
  const [row] = await db
    .select({ source: schema.catalogueProduct.source })
    .from(schema.catalogueProduct)
    .where(eq(schema.catalogueProduct.id, id))
    .limit(1);
  if (!row || row.source !== 'custom') return false;
  await db.delete(schema.catalogueProduct).where(eq(schema.catalogueProduct.id, id));
  await audit('catalogue_product.deleted', id, {}, actorUserId);
  return true;
}
