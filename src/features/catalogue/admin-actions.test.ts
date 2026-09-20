import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as AdminAuth from '@/features/admin/auth';

/**
 * Lives here rather than next to the route: the vitest include glob treats the
 * brackets of `src/app/[locale]/…` as a character class, so a test file inside
 * the route group is never collected.
 */
const assertRole = vi.fn();
const reorderSousCategorie = vi.fn();
const setProductPlacement = vi.fn();
const getAdminProduct = vi.fn();
const revalidateTag = vi.fn();
const revalidatePath = vi.fn();

vi.mock('@/features/admin/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof AdminAuth>()),
  assertRole: (roles: readonly string[]) => assertRole(roles),
}));

vi.mock('@/features/catalogue/mutations', () => ({
  reorderSousCategorie: (...args: unknown[]) => reorderSousCategorie(...args),
  setProductPlacement: (...args: unknown[]) => setProductPlacement(...args),
  saveProductContent: vi.fn(),
  createCustomProduct: vi.fn(),
  setProductHidden: vi.fn(),
  setCategoryHidden: vi.fn(),
  deleteCustomProduct: vi.fn(),
}));

vi.mock('@/features/catalogue/queries', () => ({
  CATALOGUE_CACHE_TAG: 'catalogue',
  getAdminProduct: (...args: unknown[]) => getAdminProduct(...args),
}));

vi.mock('@/features/catalogue/storage', () => ({ uploadProductAsset: vi.fn() }));
vi.mock('@/features/catalogue/sync', () => ({ syncSwiverCatalogue: vi.fn() }));

vi.mock('next/cache', () => ({
  revalidateTag: (...args: unknown[]) => revalidateTag(...args),
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
}));

const { reorderSousCategorieAction, setProductPlacementAction } = await import(
  '@/app/[locale]/(admin)/admin/produits/actions'
);

const SOLS = { familleSlug: 'produits-nettoyage', sousCategorieSlug: 'sols' };
const ID_A = '11111111-1111-4111-8111-111111111111';
const ID_B = '22222222-2222-4222-8222-222222222222';

beforeEach(() => {
  vi.clearAllMocks();
  assertRole.mockResolvedValue({ appUser: { id: 'user-1' } });
  reorderSousCategorie.mockResolvedValue({ ok: true, count: 2 });
  setProductPlacement.mockResolvedValue(true);
});

describe('reorderSousCategorieAction', () => {
  it('persists the submitted order and purges the catalogue cache', async () => {
    const result = await reorderSousCategorieAction({ ...SOLS, orderedIds: [ID_B, ID_A] });

    expect(result).toEqual({ ok: true });
    expect(assertRole).toHaveBeenCalledWith(['owner', 'admin', 'operator']);
    expect(reorderSousCategorie).toHaveBeenCalledWith(
      { familleId: 'produits-nettoyage', sousCategorieSlug: 'sols', orderedIds: [ID_B, ID_A] },
      'user-1',
    );
    expect(revalidateTag).toHaveBeenCalledWith('catalogue');
  });

  it('rejects an unknown famille before hitting the database', async () => {
    const result = await reorderSousCategorieAction({
      familleSlug: 'famille-inventee',
      sousCategorieSlug: 'sols',
      orderedIds: [ID_A],
    });

    expect(result).toEqual({ ok: false, error: 'invalid' });
    expect(assertRole).not.toHaveBeenCalled();
    expect(reorderSousCategorie).not.toHaveBeenCalled();
  });

  it('rejects ids that are not uuids and an empty order', async () => {
    expect(await reorderSousCategorieAction({ ...SOLS, orderedIds: ['nope'] })).toEqual({
      ok: false,
      error: 'invalid',
    });
    expect(await reorderSousCategorieAction({ ...SOLS, orderedIds: [] })).toEqual({
      ok: false,
      error: 'invalid',
    });
    expect(reorderSousCategorie).not.toHaveBeenCalled();
  });

  it('surfaces a rejected plan without revalidating', async () => {
    reorderSousCategorie.mockResolvedValue({ ok: false, error: 'incomplete-order' });

    expect(await reorderSousCategorieAction({ ...SOLS, orderedIds: [ID_A] })).toEqual({
      ok: false,
      error: 'incomplete-order',
    });
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});

describe('setProductPlacementAction', () => {
  it('lets an operator move a product inside its famille', async () => {
    getAdminProduct.mockResolvedValue({ id: ID_A, familleSlug: 'produits-nettoyage' });

    const result = await setProductPlacementAction({
      id: ID_A,
      familleSlug: 'produits-nettoyage',
      sousCategorieSlug: 'sols',
    });

    expect(result).toEqual({ ok: true });
    expect(assertRole).toHaveBeenCalledWith(['owner', 'admin', 'operator']);
    expect(setProductPlacement).toHaveBeenCalledWith(
      ID_A,
      { familleSlug: 'produits-nettoyage', sousCategorieSlug: 'sols' },
      'user-1',
    );
  });

  it('requires owner or admin to change the famille', async () => {
    getAdminProduct.mockResolvedValue({ id: ID_A, familleSlug: null });

    await setProductPlacementAction({
      id: ID_A,
      familleSlug: 'materiel-hygiene',
      sousCategorieSlug: null,
    });

    expect(assertRole).toHaveBeenCalledWith(['owner', 'admin']);
  });

  it('reports a forbidden role instead of throwing at the form', async () => {
    const { ForbiddenAdminError } = await import('@/features/admin/auth');
    getAdminProduct.mockResolvedValue({ id: ID_A, familleSlug: null });
    assertRole.mockRejectedValue(new ForbiddenAdminError());

    expect(
      await setProductPlacementAction({ id: ID_A, familleSlug: 'papier-epi', sousCategorieSlug: null }),
    ).toEqual({ ok: false, error: 'forbidden' });
    expect(setProductPlacement).not.toHaveBeenCalled();
  });
});
