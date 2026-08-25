import { describe, expect, it } from 'vitest';
import { normalizeSearchText, searchCatalogue } from './product-search';
import type { CatalogueCardProduct } from '@/types/product';

function card(partial: Partial<CatalogueCardProduct> & { id: string; name: string }): CatalogueCardProduct {
  return {
    slug: partial.id,
    tagline: '',
    category: 'commercialized',
    image: '',
    formats: [],
    ...partial,
  };
}

const catalogue: CatalogueCardProduct[] = [
  card({ id: 'p1', name: 'Dégraissant PROFOUR', tagline: 'Cuisine professionnelle', category: 'manufactured' }),
  card({ id: 'p2', name: 'Eau de Javel 5L', slug: 'javel-5l' }),
  card({ id: 'p3', name: 'Savon liquide LIRA', tagline: 'Dégraissant mains' }),
  card({ id: 'p4', name: 'Sac poubelle géant', formats: [{ label: 'Rouleau de 10' }] }),
];

describe('normalizeSearchText', () => {
  it('strips accents and case', () => {
    expect(normalizeSearchText('Dégraissant')).toBe('degraissant');
    expect(normalizeSearchText('  Géant ')).toBe('geant');
  });
});

describe('searchCatalogue', () => {
  it('returns nothing for an empty query so callers fall back to browsing', () => {
    expect(searchCatalogue(catalogue, '')).toEqual([]);
    expect(searchCatalogue(catalogue, '   ')).toEqual([]);
  });

  it('matches without accents', () => {
    expect(searchCatalogue(catalogue, 'degraissant').map((p) => p.id)).toEqual(['p1', 'p3']);
  });

  it('requires every term to match (AND, not OR)', () => {
    expect(searchCatalogue(catalogue, 'javel 5').map((p) => p.id)).toEqual(['p2']);
    expect(searchCatalogue(catalogue, 'javel profour')).toEqual([]);
  });

  it('ranks a name prefix above a match found only in the tagline', () => {
    expect(searchCatalogue(catalogue, 'degraissant')[0]?.id).toBe('p1');
  });

  it('searches slug and format labels too', () => {
    expect(searchCatalogue(catalogue, 'javel-5l').map((p) => p.id)).toEqual(['p2']);
    expect(searchCatalogue(catalogue, 'rouleau').map((p) => p.id)).toEqual(['p4']);
  });

  it('matches a plural query against singular catalogue names', () => {
    // Real catalogue names mix both ("GANT DE MENAGE" vs "SERVIETTES ...").
    expect(searchCatalogue(catalogue, 'sacs').map((p) => p.id)).toEqual(['p4']);
    expect(searchCatalogue(catalogue, 'sac').map((p) => p.id)).toEqual(['p4']);
  });

  it('does not strip a trailing s from short terms', () => {
    // "sas" must not be allowed to match "sa" and drag in unrelated products.
    expect(searchCatalogue(catalogue, 'sas')).toEqual([]);
  });

  it('honours the limit', () => {
    expect(searchCatalogue(catalogue, 'a', 2)).toHaveLength(2);
  });
});
