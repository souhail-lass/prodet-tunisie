import { describe, expect, it } from 'vitest';
import {
  compareCatalogueRank,
  compareCurationRows,
  pinnedCatalogueRows,
  planCatalogueRankReorder,
  planPlacementChange,
  planReorder,
  resolveRowPlacement,
  rowsInSousCategorie,
  sortCurationRows,
  type CurationRow,
} from './placement';

function row(partial: Partial<CurationRow> & { id: string; name: string }): CurationRow {
  return {
    displayName: null,
    baseCategory: null,
    familleSlug: null,
    sousCategorieSlug: null,
    sortOrder: null,
    catalogueRank: null,
    ...partial,
  };
}

describe('resolveRowPlacement', () => {
  it('classifies on the displayed name, not the raw Swiver name', () => {
    const raw = row({ id: '1', name: 'ART 4512' });
    expect(resolveRowPlacement(raw).familleId).toBe('produits-nettoyage');

    const renamed = resolveRowPlacement({ ...raw, displayName: 'SACHET BRETELLE 30X50' });
    expect(renamed.familleId).toBe('collecte-dechets');
    expect(renamed.sousCategorieSlug).toBe('sacs-poubelle');
  });
});

describe('compareCurationRows', () => {
  it('puts curated products first, in their manual order', () => {
    const a = row({ id: 'a', name: 'ZZZ', sortOrder: 0 });
    const b = row({ id: 'b', name: 'AAA', sortOrder: 1 });
    expect(compareCurationRows(a, b)).toBeLessThan(0);
  });

  it('sorts uncurated products after curated ones (NULLS LAST)', () => {
    const curated = row({ id: 'a', name: 'ZZZ', sortOrder: 7 });
    const loose = row({ id: 'b', name: 'AAA' });
    expect(compareCurationRows(curated, loose)).toBeLessThan(0);
    expect(compareCurationRows(loose, curated)).toBeGreaterThan(0);
  });

  it('falls back to the French alphabetical order of the displayed name', () => {
    const rows = sortCurationRows([
      row({ id: 'c', name: 'Éponge végétale' }),
      row({ id: 'a', name: 'Balai' }),
      row({ id: 'b', name: 'Raw name', displayName: 'Chariot' }),
    ]);
    expect(rows.map((r) => r.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('rowsInSousCategorie', () => {
  const rows = [
    row({ id: 'auto-1', name: 'PROFON DECAPANT BID 05KG' }),
    row({ id: 'auto-2', name: 'GEOCLEAN SOL BID 5KG' }),
    row({ id: 'pinned', name: 'ZZZ NETTOYANT SOL', sortOrder: 0 }),
    row({ id: 'moved-in', name: 'JAVEL PRODET BID 5KG', sousCategorieSlug: 'sols', sortOrder: 1 }),
    row({ id: 'elsewhere', name: 'POUBELLE PM' }),
  ];

  it('collects overrides and classifier matches, curated first', () => {
    expect(rowsInSousCategorie(rows, 'produits-nettoyage', 'sols').map((r) => r.id)).toEqual([
      'pinned',
      'moved-in',
      'auto-2',
      'auto-1',
    ]);
  });

  it('excludes a product whose override sends it to another sous-catégorie', () => {
    expect(
      rowsInSousCategorie(rows, 'produits-nettoyage', 'sanitaires-desinfection').map((r) => r.id),
    ).toEqual([]);
  });
});

describe('planReorder', () => {
  const rows = [
    row({ id: 'a', name: 'POUBELLE A' }),
    row({ id: 'b', name: 'POUBELLE B' }),
    row({ id: 'c', name: 'POUBELLE C' }),
  ];

  it('assigns a dense 0..n-1 sequence in the submitted order', () => {
    const result = planReorder(rows, 'collecte-dechets', 'poubelles', ['c', 'a', 'b']);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.plan.assignments).toEqual([
      { id: 'c', sortOrder: 0 },
      { id: 'a', sortOrder: 1 },
      { id: 'b', sortOrder: 2 },
    ]);
    expect(result.plan.before).toEqual(['a', 'b', 'c']);
    expect(result.plan.after).toEqual(['c', 'a', 'b']);
  });

  it('rejects an id that is not in the sous-catégorie', () => {
    expect(planReorder(rows, 'collecte-dechets', 'poubelles', ['a', 'b', 'zzz'])).toEqual({
      ok: false,
      error: 'unknown-product',
    });
  });

  it('rejects a duplicated id', () => {
    expect(planReorder(rows, 'collecte-dechets', 'poubelles', ['a', 'a', 'b'])).toEqual({
      ok: false,
      error: 'unknown-product',
    });
  });

  it('rejects a partial list rather than silently demoting the rest', () => {
    expect(planReorder(rows, 'collecte-dechets', 'poubelles', ['b', 'a'])).toEqual({
      ok: false,
      error: 'incomplete-order',
    });
  });
});

describe('catalogue rank (the "Tous les produits" axis)', () => {
  const rows = [
    row({ id: 'pinned-2', name: 'ZZZ PRODUIT', catalogueRank: 1, sortOrder: 1 }),
    row({ id: 'loose', name: 'AAA PRODUIT' }),
    row({ id: 'pinned-1', name: 'MMM PRODUIT', catalogueRank: 0, sortOrder: 0 }),
  ];

  it('orders pinned products first, then alphabetically (NULLS LAST)', () => {
    expect([...rows].sort(compareCatalogueRank).map((r) => r.id)).toEqual([
      'pinned-1',
      'pinned-2',
      'loose',
    ]);
  });

  it('is independent of the sous-catégorie order', () => {
    // Same two products, reordered inside their sous-catégorie: the global
    // list must not move.
    const reordered = rows.map((r) =>
      r.id === 'pinned-2' ? { ...r, sortOrder: 0 } : r.id === 'pinned-1' ? { ...r, sortOrder: 1 } : r,
    );
    expect([...reordered].sort(compareCatalogueRank).map((r) => r.id)).toEqual([
      'pinned-1',
      'pinned-2',
      'loose',
    ]);
  });

  it('only lists pinned rows as reorderable', () => {
    expect(pinnedCatalogueRows(rows).map((r) => r.id)).toEqual(['pinned-1', 'pinned-2']);
  });

  it('renumbers the pinned head densely', () => {
    const result = planCatalogueRankReorder(rows, ['pinned-2', 'pinned-1']);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.plan.assignments).toEqual([
      { id: 'pinned-2', sortOrder: 0 },
      { id: 'pinned-1', sortOrder: 1 },
    ]);
  });

  it('refuses a list that silently unpins a product', () => {
    expect(planCatalogueRankReorder(rows, ['pinned-1'])).toEqual({
      ok: false,
      error: 'incomplete-order',
    });
    expect(planCatalogueRankReorder(rows, ['pinned-1', 'loose'])).toEqual({
      ok: false,
      error: 'unknown-product',
    });
  });
});

describe('planPlacementChange', () => {
  const javel = row({ id: 'p1', name: 'JAVEL PRODET BID 5KG', sortOrder: 3 });

  it('keeps the position when the product does not change home', () => {
    const plan = planPlacementChange(javel, {
      familleSlug: 'produits-nettoyage',
      sousCategorieSlug: 'sanitaires-desinfection',
    });
    expect(plan.moved).toBe(false);
    expect(plan.sortOrder).toBe(3);
  });

  it('drops the position when the product moves', () => {
    const plan = planPlacementChange(javel, {
      familleSlug: 'produits-nettoyage',
      sousCategorieSlug: 'sols',
    });
    expect(plan.moved).toBe(true);
    expect(plan.sortOrder).toBeNull();
    expect(plan.from.sousCategorieSlug).toBe('sanitaires-desinfection');
    expect(plan.to.sousCategorieSlug).toBe('sols');
  });

  it('cascades a famille change by clearing a sous-catégorie that no longer fits', () => {
    const plan = planPlacementChange(javel, {
      familleSlug: 'materiel-hygiene',
      sousCategorieSlug: 'sols',
    });
    expect(plan.familleSlug).toBe('materiel-hygiene');
    expect(plan.sousCategorieSlug).toBeNull();
    expect(plan.to.familleId).toBe('materiel-hygiene');
  });

  it('clears both columns when the admin picks "automatique"', () => {
    const curated = row({
      id: 'p2',
      name: 'JAVEL PRODET BID 5KG',
      familleSlug: 'materiel-hygiene',
      sousCategorieSlug: 'seaux-chariots',
      sortOrder: 2,
    });
    const plan = planPlacementChange(curated, { familleSlug: null, sousCategorieSlug: null });
    expect(plan.familleSlug).toBeNull();
    expect(plan.sousCategorieSlug).toBeNull();
    expect(plan.to.familleId).toBe('produits-nettoyage');
    expect(plan.moved).toBe(true);
    expect(plan.sortOrder).toBeNull();
  });
});
