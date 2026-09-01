'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { assertRole } from '@/features/admin/auth';
import {
  createCustomProduct,
  deleteCustomProduct,
  saveProductContent,
  setCategoryHidden,
  setProductHidden,
  type ProductContent,
} from '@/features/catalogue/mutations';
import { CATALOGUE_CACHE_TAG, getAdminProduct } from '@/features/catalogue/queries';
import { uploadProductAsset } from '@/features/catalogue/storage';
import { syncSwiverCatalogue } from '@/features/catalogue/sync';

function revalidate() {
  // Purges the tagged catalogue data cache, which also marks every static
  // page built from it (home, /catalogue, /catalogue/[slug]) for regeneration.
  revalidateTag(CATALOGUE_CACHE_TAG);
  revalidatePath('/[locale]/admin/produits', 'page');
  revalidatePath('/[locale]/catalogue', 'page');
}

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
