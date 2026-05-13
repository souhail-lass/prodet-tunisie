import type { Locale } from '@/i18n/routing';
import { products } from './products';
import { sectors } from './sectors';
import type { Product, ProductCategory, ProductCategoryKey, Sector, SectorId, UseCase, UseCaseId } from './types';
import { useCases } from './use-cases';

export interface ListProductsOptions {
  useCaseId?: UseCaseId;
  useCaseIds?: readonly UseCaseId[];
  category?: ProductCategory | 'all';
  categoryKey?: ProductCategoryKey;
  sectorId?: SectorId;
  sectorIds?: readonly SectorId[];
  sectorKey?: SectorId;
  query?: string;
  featuredOnly?: boolean;
  sort?: ProductSort;
}

export type ProductSort = 'featured' | 'relevance' | 'name-asc' | 'name-desc';

const PRODUCTS = [...products];
const USE_CASES = [...useCases].sort((a, b) => a.displayOrder - b.displayOrder);
const SECTORS = [...sectors].sort((a, b) => a.displayOrder - b.displayOrder);

const PRODUCT_BY_SLUG = new Map(PRODUCTS.map((product) => [product.slug, product]));
const USE_CASE_BY_ID = new Map(USE_CASES.map((useCase) => [useCase.id, useCase]));
const USE_CASE_BY_SLUG = new Map(USE_CASES.map((useCase) => [useCase.slug, useCase]));
const SECTOR_BY_ID = new Map(SECTORS.map((sector) => [sector.id, sector]));
const SECTOR_BY_SLUG = new Map(SECTORS.map((sector) => [sector.slug, sector]));

type ProductSearchDocument = {
  product: Product;
  haystack: string;
  nameText: string;
  taglineText: string;
  descriptionText: string;
  formatText: string;
  useCaseText: string;
  sectorText: string;
  tokens: readonly string[];
};

const PRODUCT_SEARCH_DOCUMENTS = PRODUCTS.map(buildProductSearchDocument);
const SEARCH_DOCUMENT_BY_PRODUCT_ID = new Map(
  PRODUCT_SEARCH_DOCUMENTS.map((document) => [document.product.id, document]),
);
const SEARCH_TOKEN_INDEX = buildSearchTokenIndex(PRODUCT_SEARCH_DOCUMENTS);
const SEARCH_PREFIX_INDEX = buildSearchPrefixIndex(PRODUCT_SEARCH_DOCUMENTS);

export function listProducts(options: ListProductsOptions = {}): readonly Product[] {
  const useCaseFilters = normalizeUseCaseFilters(options);
  const sectorFilters = normalizeSectorFilters(options);
  const query = sanitizeProductQuery(options.query);
  const sort = query ? (options.sort ?? 'relevance') : (options.sort ?? 'featured');
  const candidateProducts = query ? getQueryCandidates(query) : PRODUCTS;

  const filtered = candidateProducts.filter((product) => {
    if (options.featuredOnly && !product.featured) return false;
    if (options.category && options.category !== 'all' && product.category !== options.category) {
      return false;
    }
    if (useCaseFilters.length > 0 && !useCaseFilters.every((id) => product.useCases.includes(id))) {
      return false;
    }
    if (sectorFilters.length > 0 && !sectorFilters.every((id) => product.sectors.includes(id))) {
      return false;
    }
    if (query && !productMatchesQuery(product, query)) return false;
    return true;
  });

  return sortProducts(filtered, sort, query);
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCT_BY_SLUG.get(slug);
}

export function listUseCases(): readonly UseCase[] {
  return USE_CASES;
}

export function listCategories(): readonly UseCase[] {
  return USE_CASES;
}

export function getUseCaseById(id: UseCaseId): UseCase | undefined {
  return USE_CASE_BY_ID.get(id);
}

export function getCategoryByKey(id: ProductCategoryKey): UseCase | undefined {
  return USE_CASE_BY_ID.get(id);
}

export function getUseCaseBySlug(slug: string): UseCase | undefined {
  return USE_CASE_BY_SLUG.get(slug);
}

export function getCategoryBySlug(slug: string): UseCase | undefined {
  return USE_CASE_BY_SLUG.get(slug);
}

export function listSectors(): readonly Sector[] {
  return SECTORS;
}

export function getSectorBySlug(slug: string): Sector | undefined {
  return SECTOR_BY_SLUG.get(slug);
}

export function getSectorById(id: SectorId): Sector | undefined {
  return SECTOR_BY_ID.get(id);
}

export function getSectorByKey(id: SectorId): Sector | undefined {
  return SECTOR_BY_ID.get(id);
}

export function getPublicSectorByKey(id: SectorId): Sector | undefined {
  return SECTOR_BY_ID.get(id);
}

export function getProductsForUseCase(useCaseId: UseCaseId): readonly Product[] {
  return PRODUCTS.filter((product) => product.useCases.includes(useCaseId));
}

export function getProductsForSector(sectorId: SectorId): readonly Product[] {
  return PRODUCTS.filter((product) => product.sectors.includes(sectorId));
}

export function getRecommendedProductsForSector(sector: Sector, limit = 4): readonly Product[] {
  return [...listProducts({ sectorId: sector.id })]
    .sort(sortFeaturedFirst)
    .slice(0, limit);
}

export function getRelatedProducts(product: Product, limit = 4): readonly Product[] {
  const explicit = (product.relatedProductIds ?? [])
    .map((id) => PRODUCTS.find((candidate) => candidate.id === id))
    .filter((candidate): candidate is Product => Boolean(candidate));

  const explicitIds = new Set(explicit.map((candidate) => candidate.id));
  const fallback = PRODUCTS.filter(
    (candidate) =>
      candidate.id !== product.id &&
      !explicitIds.has(candidate.id) &&
      candidate.useCases.some((useCaseId) => product.useCases.includes(useCaseId)),
  );

  return [...explicit, ...fallback].slice(0, limit);
}

export function getFeaturedProducts(limit = 6): readonly Product[] {
  return PRODUCTS.filter((product) => product.featured).slice(0, limit);
}

export function getUseCaseProductCount(useCaseId: UseCaseId): number {
  return getProductsForUseCase(useCaseId).length;
}

export function getSectorProductCount(sectorId: SectorId): number {
  return getProductsForSector(sectorId).length;
}

export function sanitizeProductQuery(query: string | undefined): string {
  return normalizeSearchText(query ?? '')
    .slice(0, 80)
    .trim();
}

export function searchProducts(query: string): readonly Product[] {
  return listProducts({ query });
}

export function localizedProductName(product: Product, _locale: Locale): string {
  return product.name;
}

export function localizedSectorName(sector: Sector, _locale: Locale): string {
  return sector.label;
}

export function localizedCategoryName(useCase: UseCase, _locale: Locale): string {
  return useCase.label;
}

function normalizeUseCaseFilters(options: ListProductsOptions): UseCaseId[] {
  if (options.useCaseIds && options.useCaseIds.length > 0) {
    return [...options.useCaseIds];
  }
  if (options.useCaseId) return [options.useCaseId];
  if (options.categoryKey) return [options.categoryKey];
  return [];
}

function normalizeSectorFilters(options: ListProductsOptions): SectorId[] {
  if (options.sectorIds && options.sectorIds.length > 0) {
    return [...options.sectorIds];
  }
  if (options.sectorId) return [options.sectorId];
  if (options.sectorKey) return [options.sectorKey];
  return [];
}

function productMatchesQuery(product: Product, query: string): boolean {
  const terms = query.split(' ').filter(Boolean);
  const haystack = SEARCH_DOCUMENT_BY_PRODUCT_ID.get(product.id)?.haystack ?? '';
  return terms.every((term) => haystack.includes(term));
}

function buildProductSearchDocument(product: Product): ProductSearchDocument {
  const useCaseTerms = product.useCases
    .map((id) => USE_CASE_BY_ID.get(id)?.label ?? '')
    .join(' ');
  const sectorTerms = product.sectors.map((id) => SECTOR_BY_ID.get(id)?.label ?? '').join(' ');
  const nameText = normalizeSearchText(product.name);
  const taglineText = normalizeSearchText(product.tagline);
  const descriptionText = normalizeSearchText(product.description);
  const formatText = normalizeSearchText(
    [
      ...product.formats.map((format) => format.label),
      ...product.formats.map((format) => format.code ?? ''),
    ].join(' '),
  );
  const useCaseText = normalizeSearchText(useCaseTerms);
  const sectorText = normalizeSearchText(sectorTerms);
  const haystack = normalizeSearchText(
    [
      product.id,
      product.slug,
      product.name,
      product.tagline,
      product.description,
      product.category,
      product.composition ?? '',
      product.dosage ?? '',
      formatText,
      useCaseTerms,
      sectorTerms,
    ].join(' '),
  );

  return {
    product,
    haystack,
    nameText,
    taglineText,
    descriptionText,
    formatText,
    useCaseText,
    sectorText,
    tokens: [...new Set(haystack.split(' ').filter((token) => token.length >= 2))],
  };
}

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{Mark}+/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function sortFeaturedFirst(left: Product, right: Product): number {
  if (left.featured === right.featured) return left.name.localeCompare(right.name, 'fr');
  return left.featured ? -1 : 1;
}

function sortProducts(
  products: readonly Product[],
  sort: ProductSort,
  query?: string,
): readonly Product[] {
  const next = [...products];

  switch (sort) {
    case 'relevance':
      return next.sort((left, right) => {
        const scoreDelta = getProductSearchScore(right, query) - getProductSearchScore(left, query);
        if (scoreDelta !== 0) return scoreDelta;
        return sortFeaturedFirst(left, right);
      });
    case 'name-asc':
      return next.sort((left, right) => left.name.localeCompare(right.name, 'fr'));
    case 'name-desc':
      return next.sort((left, right) => right.name.localeCompare(left.name, 'fr'));
    case 'featured':
    default:
      return next.sort(sortFeaturedFirst);
  }
}

function getQueryCandidates(query: string): readonly Product[] {
  const terms = query.split(' ').filter(Boolean);
  if (terms.length === 0) return PRODUCTS;

  let candidateIds: Set<string> | null = null;

  for (const term of terms) {
    const idsForTerm = getProductIdsForSearchTerm(term);
    if (idsForTerm.size === 0) return [];

    if (!candidateIds) {
      candidateIds = idsForTerm;
      continue;
    }

    candidateIds = new Set([...candidateIds].filter((id) => idsForTerm.has(id)));
    if (candidateIds.size === 0) return [];
  }

  return PRODUCTS.filter((product) => candidateIds?.has(product.id));
}

function getProductIdsForSearchTerm(term: string): Set<string> {
  const ids = new Set<string>();

  SEARCH_TOKEN_INDEX.get(term)?.forEach((id) => ids.add(id));
  SEARCH_PREFIX_INDEX.get(term)?.forEach((id) => ids.add(id));

  if (ids.size > 0) return ids;

  PRODUCT_SEARCH_DOCUMENTS.forEach((document) => {
    if (document.haystack.includes(term)) {
      ids.add(document.product.id);
    }
  });

  return ids;
}

function getProductSearchScore(product: Product, query: string | undefined): number {
  if (!query) return product.featured ? 10 : 0;

  const document = SEARCH_DOCUMENT_BY_PRODUCT_ID.get(product.id);
  if (!document) return 0;

  let score = 0;
  const terms = query.split(' ').filter(Boolean);

  if (document.nameText.includes(query)) score += 150;
  if (document.taglineText.includes(query)) score += 90;
  if (document.formatText.includes(query)) score += 70;
  if (document.descriptionText.includes(query)) score += 35;
  if (document.useCaseText.includes(query)) score += 20;
  if (document.sectorText.includes(query)) score += 20;

  for (const term of terms) {
    if (document.nameText.startsWith(term)) score += 42;
    if (document.nameText.includes(term)) score += 28;
    if (document.taglineText.includes(term)) score += 18;
    if (document.formatText.includes(term)) score += 15;
    if (document.useCaseText.includes(term) || document.sectorText.includes(term)) score += 12;
    if (document.tokens.some((token) => token === term)) score += 10;
    if (document.tokens.some((token) => token.startsWith(term))) score += 6;
  }

  if (product.featured) score += 4;
  return score;
}

function buildSearchTokenIndex(documents: readonly ProductSearchDocument[]): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();

  documents.forEach((document) => {
    document.tokens.forEach((token) => {
      const ids = index.get(token) ?? new Set<string>();
      ids.add(document.product.id);
      index.set(token, ids);
    });
  });

  return index;
}

function buildSearchPrefixIndex(documents: readonly ProductSearchDocument[]): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();

  documents.forEach((document) => {
    document.tokens.forEach((token) => {
      const maxPrefixLength = Math.min(8, token.length);
      for (let prefixLength = 2; prefixLength <= maxPrefixLength; prefixLength += 1) {
        const prefix = token.slice(0, prefixLength);
        const ids = index.get(prefix) ?? new Set<string>();
        ids.add(document.product.id);
        index.set(prefix, ids);
      }
    });
  });

  return index;
}
