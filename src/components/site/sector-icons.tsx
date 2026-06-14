import {
  BedDouble,
  Building2,
  Landmark,
  SprayCan,
  UtensilsCrossed,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';
import type { SectorId } from '@/types/sector';

/** Sector → icon mapping. Clear, comprehensible pictograms for the minimalist tiles. */
export const SECTOR_ICON: Record<SectorId, LucideIcon> = {
  hotels: BedDouble,
  'restaurants-cafes': UtensilsCrossed,
  'societes-nettoyage': SprayCan,
  entreprises: Building2,
  'revendeurs-grossistes': Warehouse,
  institutions: Landmark,
};
