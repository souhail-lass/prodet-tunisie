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

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: ProductCategory;
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
