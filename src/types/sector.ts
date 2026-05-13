import type { UseCaseId } from './use-case';

export type SectorId =
  | 'hotels'
  | 'restaurants-cafes'
  | 'societes-nettoyage'
  | 'entreprises'
  | 'revendeurs-grossistes'
  | 'institutions';

export type SectorIconName =
  | 'Hotel'
  | 'UtensilsCrossed'
  | 'Sparkles'
  | 'Building2'
  | 'Boxes'
  | 'Landmark';

export interface Sector {
  id: SectorId;
  key: SectorId;
  slug: string;
  label: string;
  shortDescription: string;
  supplyHighlights: string[];
  icon: SectorIconName;
  relevantUseCases: UseCaseId[];
  displayOrder: number;
}
