import { describe, expect, it } from 'vitest';
import { assignReorderBucket } from './reorder-buckets';

describe('assignReorderBucket', () => {
  it('maps sous-catégories to UX buckets', () => {
    expect(
      assignReorderBucket({
        name: 'X',
        familleId: 'produits-nettoyage',
        sousCategorieSlug: 'cuisine-degraissage',
      }),
    ).toBe('cuisine');
    expect(
      assignReorderBucket({
        name: 'X',
        familleId: 'produits-nettoyage',
        sousCategorieSlug: 'linge-textiles',
      }),
    ).toBe('buanderie');
    expect(
      assignReorderBucket({
        name: 'X',
        familleId: 'produits-nettoyage',
        sousCategorieSlug: 'surfaces-vitres',
      }),
    ).toBe('vitres');
    expect(
      assignReorderBucket({
        name: 'X',
        familleId: 'produits-nettoyage',
        sousCategorieSlug: 'sanitaires-desinfection',
      }),
    ).toBe('etage');
  });

  it('maps matériel / papier / déchets to materiel', () => {
    expect(
      assignReorderBucket({
        name: 'BALAI',
        familleId: 'materiel-hygiene',
        sousCategorieSlug: null,
      }),
    ).toBe('materiel');
    expect(
      assignReorderBucket({
        name: 'SAC POUBELLE',
        familleId: 'collecte-dechets',
        sousCategorieSlug: null,
      }),
    ).toBe('materiel');
  });

  it('falls back to keywords then cleaning→étage', () => {
    expect(assignReorderBucket({ name: 'DEGRAISSANT FOUR 5L' })).toBe('cuisine');
    expect(assignReorderBucket({ name: 'SERPILLIERE MICROFIBRE' })).toBe('materiel');
    expect(
      assignReorderBucket({
        name: 'PRODUIT GENERIQUE',
        familleId: 'produits-nettoyage',
        sousCategorieSlug: 'autres',
      }),
    ).toBe('etage');
  });
});
