'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';
import { ForbiddenAdminError, assertRole } from '@/features/admin/auth';
import { curationFamilleIds, type FamilleId } from '@/data/familles';
import {
  createCustomProduct,
  deleteCustomProduct,
  reorderCatalogueRank,
  reorderSousCategorie,
  saveProductContent,
  setCataloguePin,
  setCategoryHidden,
  setProductHidden,
  setProductPlacement,
  type ProductContent,
} from '@/features/catalogue/mutations';
import { CATALOGUE_CACHE_TAG, getAdminProduct } from '@/features/catalogue/queries';
import { uploadProductAsset } from '@/features/catalogue/storage';
import { syncSwiverCatalogue } from '@/features/catalogue/sync';

function revalidate() {
  // Purges the tagged catalogue data cache, which also marks every static
  // page built from it (home, famille browse, /catalogue/[slug]) for regeneration.
  revalidateTag(CATALOGUE_CACHE_TAG);
  revalidatePath('/[locale]/admin/produits', 'page');
  revalidatePath('/[locale]/admin/produits/rangement', 'page');
  revalidatePath('/[locale]/catalogue', 'page');
  revalidatePath('/[locale]/produits/[famille]', 'page');
}

const familleIdSchema = z.enum(curationFamilleIds as unknown as [FamilleId, ...FamilleId[]]);
const sousCategorieSlugSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9-]+$/);

const extraPlacementSchema = z.object({
  familleSlug: familleIdSchema,
  sousCategorieSlug: sousCategorieSlugSchema,
  sortOrder: z.number().int().nullable().optional(),
});

const placementSchema = z.object({
  id: z.string().uuid(),
  familleSlug: familleIdSchema.nullable(),
  sousCategorieSlug: sousCategorieSlugSchema.nullable(),
  extraPlacements: z.array(extraPlacementSchema).max(40).optional(),
});

const reorderSchema = z.object({
  familleSlug: familleIdSchema,
  sousCategorieSlug: sousCategorieSlugSchema,
  orderedIds: z.array(z.string().uuid()).min(1).max(1000),
});

const rankReorderSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1).max(1000),
});

const pinSchema = z.object({
  id: z.string().uuid(),
  pinned: z.boolean(),
});

export type PlacementActionResult = { ok: true } | { ok: false; error: string };

export async function saveProductAction(id: string, content: ProductContent): Promise<{ ok: boolean }> {
  const session = await assertRole(['owner', 'admin', 'operator']);
  const existing = await getAdminProduct(id);
  if (!existing) return { ok: false };
  await saveProductContent(id, content, existing.source === 'custom', session.appUser?.id ?? null);
  revalidate();
  return { ok: true };
}

export async function createProductAction(content: ProductContent): Promise<{ ok: boolean; id?: string }> {
  const session = await assertRole(['owner', 'admin', 'operator']);
  const id = await createCustomProduct(content, session.appUser?.id ?? null);
  revalidate();
  return { ok: true, id };
}

export async function setProductHiddenAction(input: { id: string; hidden: boolean }): Promise<{ ok: boolean }> {
  const session = await assertRole(['owner', 'admin', 'operator']);
  await setProductHidden(input.id, input.hidden, session.appUser?.id ?? null);
  revalidate();
  return { ok: true };
}

export async function toggleCategoryAction(input: { categoryLabel: string; hidden: boolean }): Promise<{ ok: boolean }> {
  const session = await assertRole(['owner', 'admin']);
  await setCategoryHidden(input.categoryLabel, input.hidden, session.appUser?.id ?? null);
  revalidate();
  return { ok: true };
}

export async function deleteProductAction(input: { id: string }): Promise<{ ok: boolean }> {
  const session = await assertRole(['owner', 'admin']);
  const ok = await deleteCustomProduct(input.id, session.appUser?.id ?? null);
  revalidate();
  return { ok };
}

/**
 * Move a product in the browse taxonomy. Changing the famille is the wider
 * blast radius (it empties and fills sous-catégorie cards), so it keeps the
 * owner/admin bar the other structural actions already use; picking a
 * sous-catégorie inside the same famille stays open to operators.
 */
export async function setProductPlacementAction(input: unknown): Promise<PlacementActionResult> {
  const parsed = placementSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid' };

  const existing = await getAdminProduct(parsed.data.id);
  if (!existing) return { ok: false, error: 'not-found' };

  const extraPlacements =
    parsed.data.extraPlacements === undefined
      ? undefined
      : parsed.data.extraPlacements.map((extra) => ({
          familleSlug: extra.familleSlug,
          sousCategorieSlug: extra.sousCategorieSlug,
          sortOrder: extra.sortOrder ?? null,
        }));
  const changesFamille = (existing.familleSlug ?? null) !== parsed.data.familleSlug;
  try {
    const session = await assertRole(changesFamille ? ['owner', 'admin'] : ['owner', 'admin', 'operator']);
    await setProductPlacement(
      parsed.data.id,
      {
        familleSlug: parsed.data.familleSlug,
        sousCategorieSlug: parsed.data.sousCategorieSlug,
        ...(extraPlacements !== undefined ? { extraPlacements } : {}),
      },
      session.appUser?.id ?? null,
    );
  } catch (error) {
    if (error instanceof ForbiddenAdminError) return { ok: false, error: 'forbidden' };
    throw error;
  }
  revalidate();
  return { ok: true };
}

/** Persist a dragged/reordered sous-catégorie as one dense sequence. */
export async function reorderSousCategorieAction(input: unknown): Promise<PlacementActionResult> {
  const parsed = reorderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid' };

  const session = await assertRole(['owner', 'admin', 'operator']);
  const result = await reorderSousCategorie(
    {
      familleId: parsed.data.familleSlug,
      sousCategorieSlug: parsed.data.sousCategorieSlug,
      orderedIds: parsed.data.orderedIds,
    },
    session.appUser?.id ?? null,
  );
  if (!result.ok) return { ok: false, error: result.error };
  revalidate();
  return { ok: true };
}

/**
 * Order of the products pinned at the top of "Tous les produits". Distinct
 * from the sous-catégorie order: that list is the whole catalogue, so it has
 * its own rank column (see `catalogue_rank`).
 */
export async function reorderCatalogueRankAction(input: unknown): Promise<PlacementActionResult> {
  const parsed = rankReorderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid' };

  const session = await assertRole(['owner', 'admin', 'operator']);
  const result = await reorderCatalogueRank(parsed.data.orderedIds, session.appUser?.id ?? null);
  if (!result.ok) return { ok: false, error: result.error };
  revalidate();
  return { ok: true };
}

/** Pin a product to the head of "Tous les produits", or remove it from it. */
export async function setCataloguePinAction(input: unknown): Promise<PlacementActionResult> {
  const parsed = pinSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid' };

  const session = await assertRole(['owner', 'admin', 'operator']);
  const ok = await setCataloguePin(parsed.data.id, parsed.data.pinned, session.appUser?.id ?? null);
  if (!ok) return { ok: false, error: 'not-found' };
  revalidate();
  return { ok: true };
}

export async function syncCatalogueAction(): Promise<{ ok: boolean; synced?: number }> {
  await assertRole(['owner', 'admin', 'operator']);
  const { synced } = await syncSwiverCatalogue();
  revalidate();
  return { ok: true, synced };
}

export async function uploadAssetAction(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await assertRole(['owner', 'admin', 'operator']);
  const file = formData.get('file');
  const productId = (formData.get('productId') as string) || 'new';
  const rawKind = formData.get('kind') as string;
  const kind: 'sheet' | 'safety' | 'image' =
    rawKind === 'image' ? 'image' : rawKind === 'safety' ? 'safety' : 'sheet';
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: 'invalid' };
  if (file.size > 10 * 1024 * 1024) return { ok: false, error: 'too-large' };
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const url = await uploadProductAsset({ productId, kind, fileName: file.name, bytes, contentType: file.type });
    return { ok: true, url };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'failed' };
  }
}
