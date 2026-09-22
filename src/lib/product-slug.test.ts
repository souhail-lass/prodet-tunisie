import { describe, expect, it } from 'vitest';
import {
  assignUniqueProductSlugs,
  findRowForProductSlug,
  legacyProductSlug,
  slugifyProductName,
} from './product-slug';

describe('slugifyProductName', () => {
  it('turns a catalogue name into a readable path segment', () => {
    expect(slugifyProductName('PROLAC DETARTRANT INOX BID 06KG')).toBe(
      'prolac-detartrant-inox-bid-06kg',
    );
  });

  it('strips accents and punctuation', () => {
    expect(slugifyProductName("Dégraissant d'entretien — 5L")).toBe('degraissant-d-entretien-5l');
  });

  it('returns empty when nothing URL-safe remains', () => {
    expect(slugifyProductName('---')).toBe('');
  });
});

describe('legacyProductSlug', () => {
  it('prefers a URL-safe SKU', () => {
    expect(legacyProductSlug({ sku: 'P-00176', id: 'uuid-1' })).toBe('P-00176');
  });

  it('falls back to the row id', () => {
    expect(legacyProductSlug({ sku: 'not a sku', id: 'uuid-1' })).toBe('uuid-1');
  });
});

describe('assignUniqueProductSlugs', () => {
  it('uses the name when it is unique', () => {
    const slugs = assignUniqueProductSlugs([
      { id: 'a', sku: 'P-00176', name: 'PROLAC DETARTRANT INOX BID 06KG' },
      { id: 'b', sku: 'P-00002', name: 'PROFOUR 750ML' },
    ]);
    expect(slugs.get('a')).toBe('prolac-detartrant-inox-bid-06kg');
    expect(slugs.get('b')).toBe('profour-750ml');
  });

  it('appends the SKU when two products share a name', () => {
    const slugs = assignUniqueProductSlugs([
      { id: 'a', sku: 'P-001', name: 'PROLAC 5KG' },
      { id: 'b', sku: 'P-002', name: 'PROLAC 5KG' },
    ]);
    expect(slugs.get('a')).toBe('prolac-5kg');
    expect(slugs.get('b')).toBe('prolac-5kg-p-002');
  });

  it('prefers displayName over the raw ERP name', () => {
    const slugs = assignUniqueProductSlugs([
      { id: 'a', sku: 'P-1', name: 'RAW ERP NAME', displayName: 'Prolac 6 kg' },
    ]);
    expect(slugs.get('a')).toBe('prolac-6-kg');
  });
});

describe('findRowForProductSlug', () => {
  const rows = [
    { id: 'uuid-a', sku: 'P-00176', name: 'PROLAC DETARTRANT INOX BID 06KG' },
    { id: 'uuid-b', sku: 'P-00002', name: 'PROFOUR 750ML' },
  ];

  it('finds a product by its name slug', () => {
    expect(findRowForProductSlug(rows, 'prolac-detartrant-inox-bid-06kg')?.id).toBe('uuid-a');
  });

  it('still finds a product by the old SKU', () => {
    expect(findRowForProductSlug(rows, 'P-00176')?.id).toBe('uuid-a');
    expect(findRowForProductSlug(rows, 'p-00176')?.id).toBe('uuid-a');
  });
});
