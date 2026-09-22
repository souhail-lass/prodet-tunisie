import { describe, expect, it } from 'vitest';
import {
  assignableSousCategorieSlugs,
  classifyFamille,
  classifyGamme,
  classifySousCategorie,
  familleIds,
  curationFamilleIds,
  getSousCategoriesForFamille,
  leftoverSousCategorieSlug,
  produitPath,
  resolvePlacement,
  catalogueSearchPath,
  TOUS_LES_PRODUITS,
} from './familles';

describe('classifyFamille', () => {
  it('routes air fresheners to parfums-ambiance', () => {
    expect(classifyFamille('AIR FRESH GLADE 300ML')).toBe('parfums-ambiance');
    expect(classifyFamille('Diffiseur à tiges 150ml')).toBe('parfums-ambiance');
    expect(classifyFamille('DEOFRESH JASMIN 05KG')).toBe('parfums-ambiance');
  });

  it('keeps DeoFresh LINGE in cleaning products, not air fresheners', () => {
    expect(classifyFamille('DEOFRESH LINGE BID 05 KG')).toBe('produits-nettoyage');
  });

  it('routes bins and bin bags to collecte-dechets', () => {
    expect(classifyFamille('POUBELLE PM')).toBe('collecte-dechets');
    expect(classifyFamille('SAC POUBELLE NOIR 30L 30S10X60 M14')).toBe('collecte-dechets');
  });

  it('routes paper and disposable PPE to papier-epi', () => {
    expect(classifyFamille('ESSUIE TOUT JUMBO XL LOT 06 P')).toBe('papier-epi');
    expect(classifyFamille('GANT NITRIL BLEU PAQUET 100P')).toBe('papier-epi');
    expect(classifyFamille('PAPIER HYGIENIQUE LILAS VRAC 48P')).toBe('papier-epi');
  });

  it('keeps reusable household gloves in materiel, not disposable PPE', () => {
    expect(classifyFamille('GANT DE MENAGE PIECE')).toBe('materiel-hygiene');
  });

  it('routes tools and accessories to materiel-hygiene (accents ignored)', () => {
    expect(classifyFamille('BALAI CRISTAL DEMI TETE PIECE')).toBe('materiel-hygiene');
    expect(classifyFamille('RACLETTE PRESTIGE GM 55CM')).toBe('materiel-hygiene');
    expect(classifyFamille('Éponge végétal C pièce')).toBe('materiel-hygiene');
  });

  it('defaults chemical products to produits-nettoyage', () => {
    expect(classifyFamille('SIRAFAN DESINFECTANT SANS RINÇAGE BID 05KG')).toBe(
      'produits-nettoyage',
    );
    expect(classifyFamille('PROLAX LIQUIDE BID 20KG')).toBe('produits-nettoyage');
  });

  it('only ever returns a known famille id', () => {
    for (const name of ['COLLE A RAT', 'WEICOLUB WL10 FUT 200KG', 'X']) {
      expect(familleIds).toContain(classifyFamille(name));
    }
  });
});

describe('classifyGamme', () => {
  it('maps cleaning products to their usage gamme', () => {
    expect(classifyGamme('PROLAX LIQUIDE BID 20KG')).toBe('linge-textiles');
    expect(classifyGamme('SANIHAND FLACON 500ML')).toBe('hygiene-mains');
    expect(classifyGamme('PROVITRE PULVERISATEUR 750ML')).toBe('surfaces-vitres');
    expect(classifyGamme('PROFOUR DEGRAISSANT FOUR 5KG')).toBe('cuisine-degraissage');
    expect(classifyGamme('JAVEL PRODET BID 5KG')).toBe('sanitaires-desinfection');
    expect(classifyGamme('PROFON DECAPANT FORT BID 05KG')).toBe('sols');
  });

  it('returns null for products with no clear gamme', () => {
    expect(classifyGamme('VINAIGRE MENAGER BIDON 5L')).toBeNull();
  });
});

describe('resolvePlacement', () => {
  const name = 'JAVEL PRODET BID 5KG';

  it('falls back to the classifier when nothing is curated', () => {
    expect(resolvePlacement({ name })).toEqual({
      familleId: classifyFamille(name),
      sousCategorieSlug: classifySousCategorie('produits-nettoyage', name),
      familleOrigin: 'auto',
      sousCategorieOrigin: 'auto',
    });
  });

  it('prefers the explicit famille and sous-catégorie over the classifier', () => {
    const placement = resolvePlacement({
      name,
      familleSlug: 'materiel-hygiene',
      sousCategorieSlug: 'seaux-chariots',
    });
    expect(placement.familleId).toBe('materiel-hygiene');
    expect(placement.sousCategorieSlug).toBe('seaux-chariots');
    expect(placement.familleOrigin).toBe('manual');
    expect(placement.sousCategorieOrigin).toBe('manual');
  });

  it('keeps the sous-catégorie override while the famille stays automatic', () => {
    const placement = resolvePlacement({ name, sousCategorieSlug: 'sols' });
    expect(placement.familleId).toBe('produits-nettoyage');
    expect(placement.familleOrigin).toBe('auto');
    expect(placement.sousCategorieSlug).toBe('sols');
    expect(placement.sousCategorieOrigin).toBe('manual');
  });

  it('ignores a sous-catégorie that does not belong to the resolved famille', () => {
    const placement = resolvePlacement({
      name,
      familleSlug: 'collecte-dechets',
      sousCategorieSlug: 'sols',
    });
    expect(placement.familleId).toBe('collecte-dechets');
    expect(placement.sousCategorieSlug).toBe(classifySousCategorie('collecte-dechets', name));
    expect(placement.sousCategorieOrigin).toBe('auto');
  });

  it('ignores an unknown famille slug', () => {
    const placement = resolvePlacement({ name, familleSlug: 'famille-inventee' });
    expect(placement.familleId).toBe(classifyFamille(name));
    expect(placement.familleOrigin).toBe('auto');
  });

  it('accepts the leftover bucket of a famille as an explicit target', () => {
    expect(assignableSousCategorieSlugs('papier-epi')).toContain(
      leftoverSousCategorieSlug('papier-epi'),
    );
    const placement = resolvePlacement({
      name,
      familleSlug: 'papier-epi',
      sousCategorieSlug: 'papier-epi-autres',
    });
    expect(placement.sousCategorieSlug).toBe('papier-epi-autres');
    expect(placement.sousCategorieOrigin).toBe('manual');
  });

  it('refuses "Tous les produits" as a placement target', () => {
    expect(curationFamilleIds).not.toContain(TOUS_LES_PRODUITS);
    const placement = resolvePlacement({ name, familleSlug: TOUS_LES_PRODUITS });
    expect(placement.familleId).toBe(classifyFamille(name));
    expect(placement.familleOrigin).toBe('auto');
  });
});

describe('tous-les-produits', () => {
  it('is the first browse category, not a sous-catégorie', () => {
    expect(familleIds[0]).toBe(TOUS_LES_PRODUITS);
    expect(getSousCategoriesForFamille('produits-nettoyage').map((s) => s.slug)).not.toContain(
      TOUS_LES_PRODUITS,
    );
  });

  it('is a listing, not a classified bucket', () => {
    expect(classifyFamille('SOLITAIRE VAISSELLE CITRON 5L')).not.toBe(TOUS_LES_PRODUITS);
    expect(classifyFamille('SAC POUBELLE NOIR GM 90*120 35GR 200P')).not.toBe(TOUS_LES_PRODUITS);
  });
});

describe('produitPath', () => {
  it('points Retour at the sous-catégorie the product belongs to', () => {
    const famille = classifyFamille('PROLAC');
    const sousCat = classifySousCategorie(famille, 'PROLAC');
    expect(produitPath(famille, sousCat)).toBe('/produits/produits-nettoyage/cuisine-degraissage');
  });
});

describe('catalogueSearchPath', () => {
  it('puts the typed query on the search page URL', () => {
    expect(catalogueSearchPath('deofresh')).toBe('/produits/recherche?q=deofresh');
    expect(catalogueSearchPath('  javel 5  ')).toBe('/produits/recherche?q=javel%205');
    expect(catalogueSearchPath('   ')).toBe('/produits/recherche');
  });
});
