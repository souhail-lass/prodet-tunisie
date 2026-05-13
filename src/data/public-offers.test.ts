import { describe, expect, it } from 'vitest';
import {
  getPublicOfferBySlug,
  getPublicOfferCountsBySection,
  getPublicOfferTotals,
  listPublicOffers,
  listPublicOfferSections,
  sanitizePublicOfferQuery,
} from './public-offers';

describe('public offers catalog', () => {
  it('exposes the four current public offer sections from the extracted source', () => {
    const sections = listPublicOfferSections();

    expect(sections).toHaveLength(4);
    expect(sections.map((section) => section.id)).toEqual([
      'restauration-cuisine',
      'buanderie',
      'etage-housekeeping',
      'articles-menagers',
    ]);
  });

  it('supports fast name-prefix search without scanning unrelated sections in the UI layer', () => {
    const sections = listPublicOfferSections({ query: 'inox' });
    const names = sections.flatMap((section) => section.products.map((product) => product.name));

    expect(names).toContain('Nettoyant inox');
  });

  it('filters by section id while preserving the extracted section ordering', () => {
    const sections = listPublicOfferSections({ sectionIds: ['articles-menagers'] });

    expect(sections).toHaveLength(1);
    expect(sections[0]?.id).toBe('articles-menagers');
    expect(sections[0]?.products.length).toBeGreaterThan(0);
  });

  it('returns stable counts for the public offer navigation', () => {
    const counts = getPublicOfferCountsBySection();
    const totals = getPublicOfferTotals();

    expect(Object.values(counts).reduce((sum, count) => sum + count, 0)).toBe(totals.productCount);
    expect(totals.sectionCount).toBe(4);
  });

  it('normalizes noisy queries before indexing and matching', () => {
    expect(sanitizePublicOfferQuery('  Papier   hygienique  ')).toBe('papier hygienique');
  });

  it('returns flat globally sorted offers for the catalogue grid and resolves them by slug', () => {
    const offers = listPublicOffers({ sectionIds: ['restauration-cuisine'], sort: 'name-asc' });
    const firstOffer = offers[0];

    expect(firstOffer).toBeDefined();
    expect(getPublicOfferBySlug(firstOffer!.slug)?.id).toBe(firstOffer!.id);
  });
});
