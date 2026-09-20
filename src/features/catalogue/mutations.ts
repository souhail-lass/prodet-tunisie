import 'server-only';
import { eq } from 'drizzle-orm';
import type { ProductSpec } from '@/types/product';
import type { FamilleId } from '@/data/familles';
import {
  planPlacementChange,
  planReorder,
  rowsInSousCategorie,
  type CurationRow,
  type ReorderError,
} from './placement';

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

async function selectCurationRows(): Promise<CurationRow[]> {
  const { db, schema } = await import('@/db/client');
  const t = schema.catalogueProduct;
  return db
    .select({
      id: t.id,
      name: t.name,
      displayName: t.displayName,
      baseCategory: t.baseCategory,
      familleSlug: t.familleSlug,
      sousCategorieSlug: t.sousCategorieSlug,
      sortOrder: t.sortOrder,
    })
    .from(t);
}

/**
 * Rewrite one sous-catégorie's positions as a dense sequence. Called after a
 * product leaves, so the sous-catégorie it came from keeps a gapless order
 * instead of accumulating holes over time.
 */
async function reindexSousCategorie(
  rows: CurationRow[],
  familleId: FamilleId,
  sousCategorieSlug: string,
): Promise<void> {
  const { db, schema } = await import('@/db/client');
  const curated = rowsInSousCategorie(rows, familleId, sousCategorieSlug).filter(
    (row) => row.sortOrder != null,
  );
  await Promise.all(
    curated.map((row, index) =>
      row.sortOrder === index
        ? Promise.resolve()
        : db
            .update(schema.catalogueProduct)
            .set({ sortOrder: index })
            .where(eq(schema.catalogueProduct.id, row.id)),
    ),
  );
}

export type PlacementInputValues = {
  familleSlug: string | null;
  sousCategorieSlug: string | null;
};

/**
 * Move a product to another famille / sous-catégorie. `null` on either side
 * hands the product back to the keyword classifier.
 */
export async function setProductPlacement(
  id: string,
  input: PlacementInputValues,
  actorUserId?: string | null,
): Promise<boolean> {
  const { db, schema } = await import('@/db/client');
  const rows = await selectCurationRows();
  const row = rows.find((r) => r.id === id);
  if (!row) return false;

  const plan = planPlacementChange(row, input);
  await db
    .update(schema.catalogueProduct)
    .set({
      familleSlug: plan.familleSlug,
      sousCategorieSlug: plan.sousCategorieSlug,
      sortOrder: plan.sortOrder,
      updatedByUserId: actorUserId ?? null,
      updatedAt: new Date(),
    })
    .where(eq(schema.catalogueProduct.id, id));

  if (plan.moved) {
    await reindexSousCategorie(
      rows.filter((r) => r.id !== id),
      plan.from.familleId,
      plan.from.sousCategorieSlug,
    );
  }

  await audit(
    'catalogue_product.placement_changed',
    id,
    { from: plan.from, to: plan.to },
    actorUserId,
    { familleSlug: plan.familleSlug, sousCategorieSlug: plan.sousCategorieSlug },
  );
  return true;
}

/**
 * Persist the manual order of one sous-catégorie. One audit row per save, not
 * per moved product — a drag session that writes thirty rows is noise.
 */
export async function reorderSousCategorie(
  input: { familleId: FamilleId; sousCategorieSlug: string; orderedIds: string[] },
  actorUserId?: string | null,
): Promise<{ ok: true; count: number } | { ok: false; error: ReorderError }> {
  const rows = await selectCurationRows();
  const planned = planReorder(rows, input.familleId, input.sousCategorieSlug, input.orderedIds);
  if (!planned.ok) return planned;

  const { db, schema } = await import('@/db/client');
  const changed = planned.plan.assignments.filter((assignment) => {
    const row = rows.find((r) => r.id === assignment.id);
    return row?.sortOrder !== assignment.sortOrder;
  });

  if (changed.length > 0) {
    await db.transaction(async (tx) => {
      for (const assignment of changed) {
        await tx
          .update(schema.catalogueProduct)
          .set({ sortOrder: assignment.sortOrder, updatedByUserId: actorUserId ?? null, updatedAt: new Date() })
          .where(eq(schema.catalogueProduct.id, assignment.id));
      }
    });
  }

  await audit(
    'catalogue_product.reordered',
    null,
    { before: planned.plan.before, after: planned.plan.after },
    actorUserId,
    { familleSlug: input.familleId, sousCategorieSlug: input.sousCategorieSlug },
  );
  return { ok: true, count: changed.length };
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
