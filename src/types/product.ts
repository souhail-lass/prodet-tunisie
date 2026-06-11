import type { SectorId } from './sector';
import type { UseCaseId } from './use-case';

export type ProductCategory = 'manufactured' | 'commercialized';

export type ProductFormat = {
  label: string;
  code?: string;
};

export type ProductSpec = {
  label: string;
  value: string;
};

export type ProductContextImage = {
  src: string;
  alt: string;
};

/**
 * Slim projection of Product for the catalogue grid — only what a card
 * renders and searches, so the page payload stays small.
 */
export type CatalogueCardProduct = Pick<
  Product,
  'id' | 'slug' | 'name' | 'tagline' | 'category' | 'categoryLabel' | 'image' | 'formats'
>;

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: ProductCategory;
  /** Raw Swiver category label (e.g. "PRODUITS FINIS PRODET") — drives the catalogue filter. */
  categoryLabel?: string;
  useCases: UseCaseId[];
  sectors: SectorId[];
  description: string;
  formats: ProductFormat[];
  image: string;
  galleryImages?: string[];
  contextImages?: ProductContextImage[];
  howToUse?: string;
  composition?: string;
  dosage?: string;
  precautions?: string[];
  specs?: ProductSpec[];
  dilutionRates?: { label: string; rate: string }[];
  biodegradability?: string;
  certifications?: string[];
  technicalSheetUrl?: string;
  relatedProductIds?: string[];
  featured: boolean;
};
