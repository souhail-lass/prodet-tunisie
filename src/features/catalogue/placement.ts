import {
  isCurationFamilleId,
  isSousCategorieOfFamille,
  resolvePlacement,
  type FamilleId,
  type ResolvedPlacement,
} from '@/data/familles';

/**
 * Pure curation helpers shared by the public reads, the admin mutations and
 * the tests. Kept free of `server-only` and of the DB client on purpose: the
 * placement rules are the part worth testing in isolation.
 */
export type CurationRow = {
  id: string;
  name: string;
  displayName: string | null;
  baseCategory: string | null;
  familleSlug: string | null;
  sousCategorieSlug: string | null;
  sortOrder: number | null;
  catalogueRank: number | null;
};

/** The name the site shows, which is also the name the classifier reads. */
export function displayedName(row: Pick<CurationRow, 'name' | 'displayName'>): string {
  return row.displayName || row.name;
}

export function resolveRowPlacement(row: CurationRow): ResolvedPlacement {
  return resolvePlacement({
    name: displayedName(row),
    baseCategory: row.baseCategory,
    familleSlug: row.familleSlug,
    sousCategorieSlug: row.sousCategorieSlug,
  });
}

/**
 * Curated products first, in the order the admin set, then everything else
 * alphabetically — `sort_order NULLS LAST, name`. One comparator for both the
 * public pages and the admin screens, on the displayed name, so accents and
 * renamed products cannot make the two disagree.
 */
export function compareCurationRows(a: CurationRow, b: CurationRow): number {
  const ao = a.sortOrder;
  const bo = b.sortOrder;
  if (ao != null && bo != null && ao !== bo) return ao - bo;
  if (ao != null && bo == null) return -1;
  if (ao == null && bo != null) return 1;
  return displayedName(a).localeCompare(displayedName(b), 'fr');
}

export function sortCurationRows<T extends CurationRow>(rows: readonly T[]): T[] {
  return [...rows].sort(compareCurationRows);
}

/**
 * Order of the flat "Tous les produits" listing: `catalogue_rank NULLS LAST,
 * name`. A separate axis from `sort_order` on purpose — that one is a rank
 * inside a single sous-catégorie, so its values repeat across the catalogue
 * and reordering one sous-catégorie would otherwise silently reshuffle the
 * global list.
 */
export function compareCatalogueRank(a: CurationRow, b: CurationRow): number {
  const ar = a.catalogueRank;
  const br = b.catalogueRank;
  if (ar != null && br != null && ar !== br) return ar - br;
  if (ar != null && br == null) return -1;
  if (ar == null && br != null) return 1;
  return displayedName(a).localeCompare(displayedName(b), 'fr');
}

/** Rows resolving into one sous-catégorie, in curation order. */
export function rowsInSousCategorie<T extends CurationRow>(
  rows: readonly T[],
  familleId: FamilleId,
  sousCategorieSlug: string,
): T[] {
  return sortCurationRows(
    rows.filter((row) => {
      const placement = resolveRowPlacement(row);
      return placement.familleId === familleId && placement.sousCategorieSlug === sousCategorieSlug;
    }),
  );
}

export type ReorderPlan = {
  assignments: { id: string; sortOrder: number }[];
  before: string[];
  after: string[];
};

export type ReorderError = 'unknown-product' | 'incomplete-order';

/**
 * Dense 0..n-1 sequence for one sous-catégorie. The submitted list must be a
 * permutation of what the sous-catégorie currently holds: a partial list would
 * silently drop products to the alphabetical tail, and an unknown id would
 * reorder a product the admin is not looking at.
 */
export function planReorder(
  rows: readonly CurationRow[],
  familleId: FamilleId,
  sousCategorieSlug: string,
  orderedIds: readonly string[],
): { ok: true; plan: ReorderPlan } | { ok: false; error: ReorderError } {
  const current = rowsInSousCategorie(rows, familleId, sousCategorieSlug);
  const before = current.map((row) => row.id);
  const known = new Set(before);
  const seen = new Set<string>();

  for (const id of orderedIds) {
    if (!known.has(id) || seen.has(id)) return { ok: false, error: 'unknown-product' };
    seen.add(id);
  }
  if (seen.size !== known.size) return { ok: false, error: 'incomplete-order' };

  return {
    ok: true,
    plan: {
      assignments: orderedIds.map((id, index) => ({ id, sortOrder: index })),
      before,
      after: [...orderedIds],
    },
  };
}

/** Rows pinned to the top of "Tous les produits", in their pinned order. */
export function pinnedCatalogueRows<T extends CurationRow>(rows: readonly T[]): T[] {
  return rows.filter((row) => row.catalogueRank != null).sort(compareCatalogueRank);
}

/**
 * Dense 0..n-1 sequence for the global pinned list. Same permutation rule as
 * `planReorder`: the submitted list must be exactly what is pinned today, so a
 * stale screen cannot unpin a product by omitting it.
 */
export function planCatalogueRankReorder(
  rows: readonly CurationRow[],
  orderedIds: readonly string[],
): { ok: true; plan: ReorderPlan } | { ok: false; error: ReorderError } {
  const before = pinnedCatalogueRows(rows).map((row) => row.id);
  const known = new Set(before);
  const seen = new Set<string>();

  for (const id of orderedIds) {
    if (!known.has(id) || seen.has(id)) return { ok: false, error: 'unknown-product' };
    seen.add(id);
  }
  if (seen.size !== known.size) return { ok: false, error: 'incomplete-order' };

  return {
    ok: true,
    plan: {
      assignments: orderedIds.map((id, index) => ({ id, sortOrder: index })),
      before,
      after: [...orderedIds],
    },
  };
}

export type PlacementChangeInput = {
  familleSlug: string | null;
  sousCategorieSlug: string | null;
};

export type PlacementChangePlan = {
  familleSlug: FamilleId | null;
  sousCategorieSlug: string | null;
  sortOrder: number | null;
  from: { familleId: FamilleId; sousCategorieSlug: string };
  to: { familleId: FamilleId; sousCategorieSlug: string };
  moved: boolean;
};

/**
 * What to write when an admin changes a product's famille or sous-catégorie.
 *
 * Cascades the famille change: a sous-catégorie that does not belong to the
 * chosen famille is cleared instead of left dangling, so the product falls
 * back to the classifier inside its new famille. A product that changes home
 * loses its position — the number it carried belongs to the sous-catégorie it
 * came from.
 */
export function planPlacementChange(row: CurationRow, input: PlacementChangeInput): PlacementChangePlan {
  const from = resolveRowPlacement(row);
  const familleSlug = isCurationFamilleId(input.familleSlug) ? input.familleSlug : null;
  const effectiveFamille = familleSlug ?? resolveRowPlacement({ ...row, familleSlug: null }).familleId;
  const sousCategorieSlug = isSousCategorieOfFamille(effectiveFamille, input.sousCategorieSlug)
    ? input.sousCategorieSlug
    : null;

  const to = resolveRowPlacement({ ...row, familleSlug, sousCategorieSlug });
  const moved = to.familleId !== from.familleId || to.sousCategorieSlug !== from.sousCategorieSlug;

  return {
    familleSlug,
    sousCategorieSlug,
    sortOrder: moved ? null : row.sortOrder,
    from: { familleId: from.familleId, sousCategorieSlug: from.sousCategorieSlug },
    to: { familleId: to.familleId, sousCategorieSlug: to.sousCategorieSlug },
    moved,
  };
}
