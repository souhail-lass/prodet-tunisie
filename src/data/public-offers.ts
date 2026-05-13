import { products } from './products';
import type { Product } from './types';
import { prodetCatalogSections } from '../../prodet_catalog_web_initial_no_prices';

export type PublicOfferSectionId =
  | 'restauration-cuisine'
  | 'buanderie'
  | 'etage-housekeeping'
  | 'articles-menagers';

export type PublicOfferSort = 'catalogue' | 'relevance' | 'name-asc' | 'name-desc';

export type PublicOfferVariant = {
  unit?: string;
  dosage?: string;
};

export type PublicOffer = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  usageSummary: string;
  sectionId: PublicOfferSectionId;
  sectionLabel: string;
  sectionKind: 'core' | 'commercialized';
  variants: readonly PublicOfferVariant[];
  sourceLines: readonly number[];
  sourceOrder: number;
};

export type PublicOfferSection = {
  id: PublicOfferSectionId;
  label: string;
  description: string;
  ctaLabel: string;
  audience: string;
  highlights: readonly string[];
  image: string;
  kind: 'core' | 'commercialized';
  anchorTitle: string;
  note: string;
  products: readonly PublicOffer[];
};

export interface ListPublicOfferOptions {
  query?: string;
  sectionIds?: readonly PublicOfferSectionId[];
  sort?: PublicOfferSort;
  limitPerSection?: number;
}

type OfferSearchDocument = {
  offer: PublicOffer;
  haystack: string;
  nameText: string;
  usageText: string;
  variantText: string;
  sectionText: string;
  tokens: readonly string[];
};

const SECTION_META: Record<
  PublicOfferSectionId,
  Omit<PublicOfferSection, 'products' | 'label' | 'description' | 'ctaLabel' | 'id'>
> = {
  'restauration-cuisine': {
    audience: 'Restaurants, cuisines centrales, cafes, traiteurs, collectivites',
    highlights: ['Degraissage', 'Vaisselle', 'Sols', 'Desinfection'],
    image: '/images/contexts/kitchen-dishwashing-02.jpg',
    kind: 'core',
    anchorTitle: 'Cuisine professionnelle',
    note:
      "Selection orientee restauration, plonge, hygiene de surface et entretien quotidien des zones de service.",
  },
  buanderie: {
    audience: 'Hotels, blanchisseries, maisons d hotes, institutions, prestataires linge',
    highlights: ['Lavage textile', 'Detachage', 'Blanchiment', 'Formats pro'],
    image: '/images/contexts/laundry-hotel-02.jpg',
    kind: 'core',
    anchorTitle: 'Buanderie et blanchisserie',
    note:
      'Offre construite pour les rotations de linge, le lavage professionnel et les besoins de dosage repetitifs.',
  },
  'etage-housekeeping': {
    audience: 'Hotels, residences, entreprises de nettoyage, bureaux, institutions',
    highlights: ['Sanitaires', 'Vitres', 'Sols', 'Ambiance'],
    image: '/images/contexts/disinfection-02.jpg',
    kind: 'core',
    anchorTitle: 'Housekeeping et entretien etage',
    note:
      'References utiles pour les chambres, sanitaires, couloirs, surfaces visibles et hygiene courante.',
  },
  'articles-menagers': {
    audience: 'Revendeurs, societes de nettoyage, entreprises, institutions, CHR',
    highlights: ['Accessoires', 'Papeterie hygiene', 'Brosses', 'Consommables'],
    image: '/images/contexts/hand-hygiene-02.jpg',
    kind: 'commercialized',
    anchorTitle: 'Articles menagers et hygiene',
    note:
      "Cette section regroupe des articles commercialises et revendus. Ils ne sont pas presentes comme fabriques par Prodet.",
  },
};

export const publicOfferReferenceImage =
  '/images/contexts/RSG%20Nu-Kleen%20All%20%28UL%20Ecologo%29.jpg';

export const publicOfferSectionIds: readonly PublicOfferSectionId[] = [
  'restauration-cuisine',
  'buanderie',
  'etage-housekeeping',
  'articles-menagers',
];

export const futurePublicOfferFamilies = [
  'Distributeurs papier',
  'Distributeurs savon',
  'Consommables sanitaires',
  'Autres references d hygiene institutionnelle',
] as const;

const FRENCH_STOPWORDS = new Set([
  'a',
  'au',
  'aux',
  'avec',
  'd',
  'de',
  'des',
  'du',
  'en',
  'et',
  'l',
  'la',
  'le',
  'les',
  'ou',
  'par',
  'pour',
  'sans',
  'sur',
  'un',
  'une',
]);

const BASE_SECTIONS: readonly PublicOfferSection[] = prodetCatalogSections.map((section) => {
  const meta = SECTION_META[section.id as PublicOfferSectionId];
  const products = section.products.map((product, index) =>
    toPublicOffer({
      product,
      index,
      sectionId: section.id as PublicOfferSectionId,
      sectionLabel: section.label,
      sectionKind: meta.kind,
    }),
  );

  return {
    id: section.id as PublicOfferSectionId,
    label: section.label,
    description: section.description,
    ctaLabel: section.ctaLabel,
    audience: meta.audience,
    highlights: meta.highlights,
    image: meta.image,
    kind: meta.kind,
    anchorTitle: meta.anchorTitle,
    note: meta.note,
    products,
  };
});

const SECTION_BY_ID = new Map(BASE_SECTIONS.map((section) => [section.id, section]));
const ALL_PUBLIC_OFFERS = BASE_SECTIONS.flatMap((section) => section.products);
const OFFER_BY_ID = new Map(ALL_PUBLIC_OFFERS.map((offer) => [offer.id, offer]));
const OFFER_BY_SLUG = new Map(ALL_PUBLIC_OFFERS.map((offer) => [offer.slug, offer]));
const SEARCH_DOCUMENTS = ALL_PUBLIC_OFFERS.map(buildSearchDocument);
const SEARCH_DOCUMENT_BY_ID = new Map(SEARCH_DOCUMENTS.map((document) => [document.offer.id, document]));
const SEARCH_TOKEN_INDEX = buildSearchTokenIndex(SEARCH_DOCUMENTS);
const SEARCH_PREFIX_INDEX = buildSearchPrefixIndex(SEARCH_DOCUMENTS);
const LEGACY_PRODUCTS = [...products];
const LEGACY_PRODUCT_BY_NORMALIZED_NAME = new Map(
  LEGACY_PRODUCTS.map((product) => [normalizeSearchText(product.name), product]),
);

export function listPublicOfferSections(
  options: ListPublicOfferOptions = {},
): readonly PublicOfferSection[] {
  const activeSectionIds = normalizeSectionIds(options.sectionIds);
  const query = sanitizePublicOfferQuery(options.query);
  const sort = resolveOfferSort(options.sort, query);
  const candidateIds = query ? new Set(getQueryCandidates(query).map((offer) => offer.id)) : null;

  return BASE_SECTIONS.flatMap((section) => {
    if (activeSectionIds.length > 0 && !activeSectionIds.includes(section.id)) {
      return [];
    }

    const sectionProducts = section.products.filter((offer) => {
      if (candidateIds && !candidateIds.has(offer.id)) return false;
      if (query) {
        const document = SEARCH_DOCUMENT_BY_ID.get(offer.id);
        if (!document) return false;
        return productMatchesQuery(document, query);
      }
      return true;
    });

    if (sectionProducts.length === 0) return [];

    const sortedProducts = sortOffers(sectionProducts, sort, query);
    const limitedProducts =
      options.limitPerSection && options.limitPerSection > 0
        ? sortedProducts.slice(0, options.limitPerSection)
        : sortedProducts;

    return [{ ...section, products: limitedProducts }];
  });
}

export function listPublicOffers(options: ListPublicOfferOptions = {}): readonly PublicOffer[] {
  const activeSectionIds = normalizeSectionIds(options.sectionIds);
  const query = sanitizePublicOfferQuery(options.query);
  const sort = resolveOfferSort(options.sort, query);
  const candidateIds = query ? new Set(getQueryCandidates(query).map((offer) => offer.id)) : null;

  const filtered = ALL_PUBLIC_OFFERS.filter((offer) => {
    if (activeSectionIds.length > 0 && !activeSectionIds.includes(offer.sectionId)) {
      return false;
    }
    if (candidateIds && !candidateIds.has(offer.id)) return false;
    if (query) {
      const document = SEARCH_DOCUMENT_BY_ID.get(offer.id);
      if (!document) return false;
      return productMatchesQuery(document, query);
    }
    return true;
  });

  const sorted = sortOffers(filtered, sort, query);
  if (options.limitPerSection && options.limitPerSection > 0) {
    return sorted.slice(0, options.limitPerSection);
  }
  return sorted;
}

export function getPublicOfferSectionById(
  id: PublicOfferSectionId,
): PublicOfferSection | undefined {
  return SECTION_BY_ID.get(id);
}

export function getPublicOfferBySlug(slug: string): PublicOffer | undefined {
  return OFFER_BY_SLUG.get(slug);
}

export function getRelatedPublicOffers(offer: PublicOffer, limit = 4): readonly PublicOffer[] {
  return ALL_PUBLIC_OFFERS.filter(
    (candidate) => candidate.id !== offer.id && candidate.sectionId === offer.sectionId,
  ).slice(0, limit);
}

export function getLegacyProductForPublicOffer(offer: PublicOffer): Product | undefined {
  const directMatch = LEGACY_PRODUCT_BY_NORMALIZED_NAME.get(normalizeSearchText(offer.name));
  if (directMatch) return directMatch;

  const normalizedOfferName = normalizeSearchText(offer.name);
  const offerTokens = normalizedOfferName.split(' ').filter(Boolean);
  if (offerTokens.length === 0) return undefined;

  let bestMatch: Product | undefined;
  let bestScore = 0;

  for (const product of LEGACY_PRODUCTS) {
    const normalizedProductName = normalizeSearchText(product.name);
    if (normalizedProductName.includes(normalizedOfferName) || normalizedOfferName.includes(normalizedProductName)) {
      return product;
    }

    const productTokens = normalizedProductName.split(' ').filter(Boolean);
    const overlap = offerTokens.filter((token) => productTokens.includes(token)).length;
    if (overlap >= 2 && overlap > bestScore) {
      bestScore = overlap;
      bestMatch = product;
    }
  }

  return bestMatch;
}

export function getPublicOfferCountsBySection(): Record<PublicOfferSectionId, number> {
  return BASE_SECTIONS.reduce(
    (acc, section) => {
      acc[section.id] = section.products.length;
      return acc;
    },
    {
      'restauration-cuisine': 0,
      buanderie: 0,
      'etage-housekeeping': 0,
      'articles-menagers': 0,
    },
  );
}

export function getPublicOfferTotals() {
  const sectionCount = BASE_SECTIONS.length;
  const productCount = ALL_PUBLIC_OFFERS.length;

  return { sectionCount, productCount };
}

export function sanitizePublicOfferQuery(query: string | undefined): string {
  return normalizeSearchText(query ?? '')
    .slice(0, 80)
    .trim();
}

export function isPublicOfferSectionId(value: string): value is PublicOfferSectionId {
  return publicOfferSectionIds.includes(value as PublicOfferSectionId);
}

function toPublicOffer({
  product,
  index,
  sectionId,
  sectionLabel,
  sectionKind,
}: {
  product: (typeof prodetCatalogSections)[number]['products'][number];
  index: number;
  sectionId: PublicOfferSectionId;
  sectionLabel: string;
  sectionKind: PublicOfferSection['kind'];
}): PublicOffer {
  const sourceLine = product.sourceLines?.[0];
  const slugBase = slugify(`${product.name}-${sourceLine ?? index + 1}`);

  return {
    id: `${sectionId}-${sourceLine ?? index + 1}-${slugBase}`,
    slug: slugBase,
    name: normalizeProductName(product.name),
    shortDescription: buildShortDescription(product.usages[0] ?? ''),
    usageSummary: buildUsageSummary(product.usages[0] ?? ''),
    sectionId,
    sectionLabel,
    sectionKind,
    variants: product.variants.map((variant) => ({
      unit: cleanCompactText(variant.unit),
      dosage: cleanCompactText(variant.dosage),
    })),
    sourceLines: product.sourceLines ?? [],
    sourceOrder: index,
  };
}

function normalizeSectionIds(
  sectionIds: readonly PublicOfferSectionId[] | undefined,
): readonly PublicOfferSectionId[] {
  if (!sectionIds || sectionIds.length === 0) return [];

  const next = new Set<PublicOfferSectionId>();
  for (const id of sectionIds) {
    if (SECTION_BY_ID.has(id)) next.add(id);
  }

  return [...next];
}

function resolveOfferSort(
  sort: PublicOfferSort | undefined,
  query: string,
): PublicOfferSort {
  if (!sort) return query ? 'relevance' : 'catalogue';
  if (sort === 'relevance' && !query) return 'catalogue';
  return sort;
}

function sortOffers(
  offers: readonly PublicOffer[],
  sort: PublicOfferSort,
  query: string,
): readonly PublicOffer[] {
  if (sort === 'catalogue') {
    return [...offers].sort((left, right) => left.sourceOrder - right.sourceOrder);
  }

  if (sort === 'name-asc') {
    return [...offers].sort((left, right) => left.name.localeCompare(right.name, 'fr'));
  }

  if (sort === 'name-desc') {
    return [...offers].sort((left, right) => right.name.localeCompare(left.name, 'fr'));
  }

  const terms = query.split(' ').filter(Boolean);
  return [...offers].sort((left, right) => {
    const leftDoc = SEARCH_DOCUMENT_BY_ID.get(left.id);
    const rightDoc = SEARCH_DOCUMENT_BY_ID.get(right.id);
    const leftScore = leftDoc ? getRelevanceScore(leftDoc, terms) : 0;
    const rightScore = rightDoc ? getRelevanceScore(rightDoc, terms) : 0;

    if (leftScore !== rightScore) return rightScore - leftScore;
    if (left.name !== right.name) return left.name.localeCompare(right.name, 'fr');
    return left.sourceOrder - right.sourceOrder;
  });
}

function getQueryCandidates(query: string): readonly PublicOffer[] {
  const terms = query.split(' ').filter(Boolean);
  if (terms.length === 0) return ALL_PUBLIC_OFFERS;

  let candidateIds: Set<string> | null = null;

  for (const term of terms) {
    const tokenMatches = SEARCH_TOKEN_INDEX.get(term) ?? new Set<string>();
    const prefixMatches = SEARCH_PREFIX_INDEX.get(term) ?? new Set<string>();
    const matches = new Set<string>([...tokenMatches, ...prefixMatches]);

    if (matches.size === 0) return [];

    candidateIds = candidateIds ? intersect(candidateIds, matches) : new Set(matches);
    if (candidateIds.size === 0) return [];
  }

  if (!candidateIds) return [];

  return [...candidateIds]
    .map((id) => OFFER_BY_ID.get(id))
    .filter((offer): offer is PublicOffer => Boolean(offer));
}

function productMatchesQuery(document: OfferSearchDocument, query: string): boolean {
  const terms = query.split(' ').filter(Boolean);
  return terms.every((term) => document.haystack.includes(term));
}

function getRelevanceScore(document: OfferSearchDocument, terms: readonly string[]): number {
  let score = 0;

  for (const term of terms) {
    if (document.nameText === term) score += 120;
    if (document.nameText.startsWith(term)) score += 60;
    if (document.nameText.includes(term)) score += 24;
    if (document.usageText.includes(term)) score += 14;
    if (document.variantText.includes(term)) score += 10;
    if (document.sectionText.includes(term)) score += 8;
  }

  return score;
}

function buildSearchDocument(offer: PublicOffer): OfferSearchDocument {
  const variantText = normalizeSearchText(
    offer.variants
      .flatMap((variant) => [variant.unit ?? '', variant.dosage ?? ''])
      .join(' '),
  );
  const nameText = normalizeSearchText(offer.name);
  const usageText = normalizeSearchText(`${offer.shortDescription} ${offer.usageSummary}`);
  const sectionText = normalizeSearchText(`${offer.sectionLabel} ${offer.sectionId}`);
  const haystack = normalizeSearchText(
    [offer.name, offer.shortDescription, offer.usageSummary, offer.sectionLabel, variantText].join(
      ' ',
    ),
  );

  return {
    offer,
    haystack,
    nameText,
    usageText,
    variantText,
    sectionText,
    tokens: [...new Set(haystack.split(' ').filter((token) => token.length >= 2))],
  };
}

function buildSearchTokenIndex(
  documents: readonly OfferSearchDocument[],
): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();

  for (const document of documents) {
    for (const token of document.tokens) {
      const bucket = index.get(token) ?? new Set<string>();
      bucket.add(document.offer.id);
      index.set(token, bucket);
    }
  }

  return index;
}

function buildSearchPrefixIndex(
  documents: readonly OfferSearchDocument[],
): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();

  for (const document of documents) {
    for (const token of document.tokens) {
      const maxLength = Math.min(token.length, 8);
      for (let length = 2; length <= maxLength; length += 1) {
        const prefix = token.slice(0, length);
        const bucket = index.get(prefix) ?? new Set<string>();
        bucket.add(document.offer.id);
        index.set(prefix, bucket);
      }
    }
  }

  return index;
}

function intersect(left: ReadonlySet<string>, right: ReadonlySet<string>): Set<string> {
  const next = new Set<string>();
  for (const value of left) {
    if (right.has(value)) next.add(value);
  }
  return next;
}

function buildShortDescription(usage: string): string {
  const keywords = tokenize(usage).filter((token) => !FRENCH_STOPWORDS.has(token));
  if (keywords.length === 0) return 'Usage pro';

  return keywords
    .slice(0, 2)
    .map(capitalize)
    .join(' ');
}

function buildUsageSummary(usage: string): string {
  const cleaned = cleanCompactText(usage);
  if (!cleaned) return 'Usage professionnel';
  return cleaned.length <= 88 ? cleaned : `${cleaned.slice(0, 85).trimEnd()}...`;
}

function normalizeProductName(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function slugify(value: string): string {
  return normalizeSearchText(value).replace(/\s+/g, '-');
}

function cleanCompactText(value: string | undefined): string | undefined {
  const cleaned = value?.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ').trim();
  return cleaned ? cleaned : undefined;
}

function tokenize(value: string): string[] {
  return normalizeSearchText(value).split(' ').filter(Boolean);
}

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{Mark}+/gu, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .toLowerCase()
    .trim();
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
