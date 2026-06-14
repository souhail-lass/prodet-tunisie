import type { SectorId } from '@/types/sector';

/**
 * Per-sector "study of need" — each sector is broken into the real work zones
 * its teams clean every day. Every zone states the operational need and points
 * to the Prodet **solutions** (manufactured cleaning products only, no hygiene
 * material) that answer it.
 *
 * `productSlugs` reference manufactured products in `src/data/products.ts`;
 * the page resolves them, keeps only those that exist and are manufactured,
 * and silently drops the rest — so editing the catalogue never breaks a page.
 */
export type SectorZone = {
  /** Two-digit step number shown in the layout. */
  num: string;
  title: string;
  /** Short, field-level statement of what this zone needs. */
  need: string;
  productSlugs: readonly string[];
};

export const sectorZones: Record<SectorId, readonly SectorZone[]> = {
  hotels: [
    {
      num: '01',
      title: 'Chambres & étages',
      need: 'Surfaces, poussière et vitres à faire briller, chambre après chambre, sans laisser de traces ni d’odeur de produit.',
      productSlugs: ['provitre', 'pronet', 'deofresh'],
    },
    {
      num: '02',
      title: 'Sanitaires clients',
      need: 'Désinfection et détartrage des WC, douches et lavabos — l’exigence d’hygiène la plus visible pour le client.',
      productSlugs: ['sirafan-desinfectant', 'pilax', 'prostar'],
    },
    {
      num: '03',
      title: 'Buanderie & linge',
      need: 'Draps, serviettes et nappes à laver en rotation intensive, avec un linge blanc qui le reste et une odeur fraîche durable.',
      productSlugs: ['prolax-liquide', 'progras', 'deofresh-linge'],
    },
    {
      num: '04',
      title: 'Petit-déjeuner & cuisine',
      need: 'Fours, plans de travail et vaisselle à dégraisser vite entre deux services du matin.',
      productSlugs: ['profour', 'prolav', 'solitaire-vaisselle'],
    },
    {
      num: '05',
      title: 'Hygiène des mains',
      need: 'Savon doux pour les distributeurs des chambres et des espaces communs, gel pour les points de passage.',
      productSlugs: ['sanihand', 'alcogel'],
    },
  ],
  'restaurants-cafes': [
    {
      num: '01',
      title: 'Cuisine & fours',
      need: 'Graisses cuites, hottes et fours à décrasser en profondeur sans relâche, dans le feu du service.',
      productSlugs: ['profour', 'prokill', 'prolac'],
    },
    {
      num: '02',
      title: 'Plonge & vaisselle',
      need: 'Vaisselle, verres et batterie à laver — à la main comme en machine — avec un séchage sans traces.',
      productSlugs: ['prolav', 'prorinse', 'solitaire-vaisselle'],
    },
    {
      num: '03',
      title: 'Sols de cuisine',
      need: 'Sols gras et glissants à dégraisser pour garder une cuisine sûre et conforme aux contrôles.',
      productSlugs: ['profon', 'pronet-plus', 'gresil-prodet'],
    },
    {
      num: '04',
      title: 'Surfaces & désinfection',
      need: 'Plans de travail, inox et zones de contact à désinfecter entre chaque préparation.',
      productSlugs: ['sirafan-desinfectant', 'vit-net', 'deofresh'],
    },
    {
      num: '05',
      title: 'Hygiène des mains',
      need: 'Lavage fréquent et désinfection des mains du personnel — exigence HACCP de premier plan.',
      productSlugs: ['sanihand', 'alcohand', 'alcogel'],
    },
  ],
  'societes-nettoyage': [
    {
      num: '01',
      title: 'Sols tous types',
      need: 'Du carrelage au PVC, des grandes surfaces à nettoyer au rendement, en formats concentrés pour le multi-sites.',
      productSlugs: ['pronet', 'pronet-plus', 'profon'],
    },
    {
      num: '02',
      title: 'Sanitaires & désinfection',
      need: 'Détartrage, désodorisation et désinfection des sanitaires lors d’interventions récurrentes.',
      productSlugs: ['sirafan-desinfectant', 'pilax', 'prostar'],
    },
    {
      num: '03',
      title: 'Surfaces & vitres',
      need: 'Vitres, miroirs et surfaces d’accueil à laisser nets, sans traces, pour une finition irréprochable.',
      productSlugs: ['provitre', 'deofresh', 'progerme'],
    },
    {
      num: '04',
      title: 'Désinfection renforcée',
      need: 'Protocoles de désinfection pour les sites sensibles et la remise en état après chantier.',
      productSlugs: ['prokill', 'gresil-prodet', 'javel-prodet'],
    },
  ],
  entreprises: [
    {
      num: '01',
      title: 'Bureaux & surfaces',
      need: 'Mobilier, écrans, vitres et open-spaces à entretenir chaque jour, discrètement et sans odeur agressive.',
      productSlugs: ['provitre', 'deofresh', 'pronet'],
    },
    {
      num: '02',
      title: 'Sanitaires & zones communes',
      need: 'Sanitaires partagés à désinfecter et détartrer pour rester impeccables toute la journée.',
      productSlugs: ['sirafan-desinfectant', 'pilax', 'prostar'],
    },
    {
      num: '03',
      title: 'Hygiène des mains & points de contact',
      need: 'Savon et gel hydroalcoolique aux sanitaires, à l’accueil et près des espaces de pause.',
      productSlugs: ['sanihand', 'alcogel', 'alcohand'],
    },
    {
      num: '04',
      title: 'Sols & circulations',
      need: 'Halls, couloirs et réfectoires à nettoyer rapidement sur de grandes surfaces de passage.',
      productSlugs: ['pronet-plus', 'profon'],
    },
  ],
  'revendeurs-grossistes': [
    {
      num: '01',
      title: 'Gamme linge',
      need: 'Lessives professionnelles fabriquées localement, en gros conditionnements faciles à relire et à recommander.',
      productSlugs: ['prolax-liquide', 'prolax-couleur', 'progras'],
    },
    {
      num: '02',
      title: 'Dégraissage & cuisine',
      need: 'Références dégraissage et plonge à forte rotation pour la clientèle CHR.',
      productSlugs: ['profour', 'prolav', 'solitaire-vaisselle'],
    },
    {
      num: '03',
      title: 'Désinfection & sanitaires',
      need: 'Désinfectants et détartrants polyvalents, valeurs sûres du réassort hygiène.',
      productSlugs: ['sirafan-desinfectant', 'javel-prodet', 'prostar'],
    },
    {
      num: '04',
      title: 'Sols & surfaces',
      need: 'Nettoyants sols et surfaces multi-usage, formats lisibles pour la revente.',
      productSlugs: ['pronet', 'provitre', 'profon'],
    },
  ],
  institutions: [
    {
      num: '01',
      title: 'Sanitaires collectifs',
      need: 'Sanitaires à fort passage (écoles, administrations) à désinfecter et détartrer selon des protocoles fiables.',
      productSlugs: ['sirafan-desinfectant', 'javel-prodet', 'pilax'],
    },
    {
      num: '02',
      title: 'Sols & espaces collectifs',
      need: 'Couloirs, salles et réfectoires à entretenir sur de grandes surfaces, en achats récurrents.',
      productSlugs: ['pronet', 'profon', 'progerme'],
    },
    {
      num: '03',
      title: 'Hygiène des mains',
      need: 'Savon doux et solutions hydroalcooliques pour les collectivités et les publics sensibles.',
      productSlugs: ['sanihand', 'manocid', 'alcogel'],
    },
    {
      num: '04',
      title: 'Désinfection protocolaire',
      need: 'Désinfection des surfaces et des points de contact selon des protocoles d’hygiène stricts.',
      productSlugs: ['prokill', 'gresil-prodet', 'prostar'],
    },
  ],
};
