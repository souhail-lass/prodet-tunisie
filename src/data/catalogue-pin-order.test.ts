import { describe, expect, it } from 'vitest';
import { PINNED_CATALOGUE_SKUS, sortByPinnedCatalogueSku } from './catalogue-pin-order';

describe('sortByPinnedCatalogueSku', () => {
  it('puts the 15 best-sellers first, in the given SKU order', () => {
    const products = [
      { sku: 'P-00006', name: 'PROVITRE BID 5KG' },
      { sku: 'P-00999', name: 'ZZZ AUTRE' },
      { sku: 'P-00001', name: 'SOLITAIRE VAISSELLE CITRON 5L' },
      { sku: 'P-00014', name: 'PROFOUR DEGRAISSANT FOUR 5KG' },
      { sku: null, name: 'AAA SANS SKU' },
    ];

    const sorted = sortByPinnedCatalogueSku(products);

    expect(sorted.map((p) => p.sku)).toEqual(['P-00001', 'P-00014', 'P-00006', null, 'P-00999']);
  });

  it('keeps the pin list in sales rank order', () => {
    expect(PINNED_CATALOGUE_SKUS[0]).toBe('P-00001');
    expect(PINNED_CATALOGUE_SKUS[14]).toBe('P-00006');
    expect(PINNED_CATALOGUE_SKUS).toHaveLength(15);
  });
});
