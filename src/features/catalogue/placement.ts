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
export type ExtraPlacement = {
  familleSlug: FamilleId;
  sousCategorieSlug: string;
  sortOrder: number | null;
};

export type CurationRow = {
  id: string;
  name: string;
  displayName: string | null;
  baseCategory: string | null;
  familleSlug: string | null;
  sousCategorieSlug: string | null;
  sortOrder: number | null;
  catalogueRank: number | null;
  extraPlacements: ExtraPlacement[];
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

export function parseExtraPlacements(raw: unknown): ExtraPlacement[] {
  if (!Array.isArray(raw)) return [];
  const out: ExtraPlacement[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const familleSlug = typeof rec.familleSlug === 'string' ? rec.familleSlug : '';
    const sousCategorieSlug =
      typeof rec.sousCategorieSlug === 'string' ? rec.sousCategorieSlug : '';
    if (
      !isCurationFamilleId(familleSlug) ||
      !isSousCategorieOfFamille(familleSlug, sousCategorieSlug)
    )
      continue;
    const sortOrder =
      typeof rec.sortOrder === 'number' && Number.isFinite(rec.sortOrder) ? rec.sortOrder : null;
    out.push({ familleSlug, sousCategorieSlug, sortOrder });
  }
  return out;
}

/**
 * Drop extras that duplicate the primary home, that point at an unknown
 * slug, or that collide with each other. Order is stable so a save without
 * edits does not reshuffle the JSON.
 */
export function sanitizeExtraPlacements(
  extras: readonly ExtraPlacement[] | null | undefined,
  primary: Pick<ResolvedPlacement, 'familleId' | 'sousCategorieSlug'>,
): ExtraPlacement[] {
  const seen = new Set<string>();
  const out: ExtraPlacement[] = [];
  for (const extra of extras ?? []) {
    if (!isCurationFamilleId(extra.familleSlug)) continue;
    if (!isSousCategorieOfFamille(extra.familleSlug, extra.sousCategorieSlug)) continue;
    if (
      extra.familleSlug === primary.familleId &&
      extra.sousCategorieSlug === primary.sousCategorieSlug
    ) {
      continue;
    }
    const key = `${extra.familleSlug}/${extra.sousCategorieSlug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      familleSlug: extra.familleSlug,
      sousCategorieSlug: extra.sousCategorieSlug,
      sortOrder: extra.sortOrder ?? null,
    });
  }
  return out;
}

export type ListingRef = {
  familleId: FamilleId;
  sousCategorieSlug: string;
  sortOrder: number | null;
  origin: 'primary' | 'extra';
};

/** Primary home + extra listings, extras already de-duplicated against home. */
export function listingsOf(row: CurationRow): ListingRef[] {
  const primary = resolveRowPlacement(row);
  const extras = sanitizeExtraPlacements(row.extraPlacements, primary);
  return [
    {
      familleId: primary.familleId,
      sousCategorieSlug: primary.sousCategorieSlug,
      sortOrder: row.sortOrder,
      origin: 'primary',
    },
    ...extras.map((extra) => ({
      familleId: extra.familleSlug,
      sousCategorieSlug: extra.sousCategorieSlug,
      sortOrder: extra.sortOrder,
      origin: 'extra' as const,
    })),
  ];
}

export function famillesOf(row: CurationRow): FamilleId[] {
  return [...new Set(listingsOf(row).map((listing) => listing.familleId))];
}

export function listingSortOrder(
  row: CurationRow,
  familleId: FamilleId,
  sousCategorieSlug: string,
): number | null {
  const listing = listingsOf(row).find(
    (item) => item.familleId === familleId && item.sousCategorieSlug === sousCategorieSlug,
  );
  return listing?.sortOrder ?? null;
}

export function rowAppearsIn(
  row: CurationRow,
  familleId: FamilleId,
  sousCategorieSlug: string,
): boolean {
  return listingsOf(row).some(
    (listing) => listing.familleId === familleId && listing.sousCategorieSlug === sousCategorieSlug,
  );
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

/** Rows resolving into one sous-catégorie (home or extra), in that list's order. */
export function rowsInSousCategorie<T extends CurationRow>(
  rows: readonly T[],
  familleId: FamilleId,
  sousCategorieSlug: string,
): T[] {
  return sortCurationRows(
    rows
      .filter((row) => rowAppearsIn(row, familleId, sousCategorieSlug))
      .map((row) => ({
        ...row,
        sortOrder: listingSortOrder(row, familleId, sousCategorieSlug),
      })),
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
  extraPlacements: ExtraPlacement[];
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
 * came from. Extras that would duplicate the new home are dropped.
 */
export function planPlacementChange(
  row: CurationRow,
  input: PlacementChangeInput & { extraPlacements?: readonly ExtraPlacement[] | null },
): PlacementChangePlan {
  const from = resolveRowPlacement(row);
  const familleSlug = isCurationFamilleId(input.familleSlug) ? input.familleSlug : null;
  const effectiveFamille =
    familleSlug ?? resolveRowPlacement({ ...row, familleSlug: null }).familleId;
  const sousCategorieSlug = isSousCategorieOfFamille(effectiveFamille, input.sousCategorieSlug)
    ? input.sousCategorieSlug
    : null;

  const to = resolveRowPlacement({ ...row, familleSlug, sousCategorieSlug });
  const moved = to.familleId !== from.familleId || to.sousCategorieSlug !== from.sousCategorieSlug;
  const extraPlacements = sanitizeExtraPlacements(input.extraPlacements ?? row.extraPlacements, to);

  return {
    familleSlug,
    sousCategorieSlug,
    sortOrder: moved ? null : row.sortOrder,
    extraPlacements,
    from: { familleId: from.familleId, sousCategorieSlug: from.sousCategorieSlug },
    to: { familleId: to.familleId, sousCategorieSlug: to.sousCategorieSlug },
    moved,
  };
}
