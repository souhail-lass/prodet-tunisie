import { describe, expect, it } from 'vitest';
import { classifyFamille, classifyGamme, familleIds } from './familles';

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
    expect(classifyFamille('SIRAFAN DESINFECTANT SANS RINÇAGE BID 05KG')).toBe('produits-nettoyage');
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
