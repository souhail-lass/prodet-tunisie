import { Building, Droplet, Factory, Shield, ShoppingBag, Sparkles, type LucideIcon } from 'lucide-react';
import type { SectorId } from '@/types/sector';

/** Sector → icon mapping mirroring the design-system home/sectors pages. */
export const SECTOR_ICON: Record<SectorId, LucideIcon> = {
  hotels: Building,
  'restaurants-cafes': Droplet,
  'societes-nettoyage': Sparkles,
  entreprises: Factory,
  'revendeurs-grossistes': ShoppingBag,
  institutions: Shield,
};
