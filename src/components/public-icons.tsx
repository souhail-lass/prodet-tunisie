import {
  ArrowRightLeft,
  Boxes,
  Brush,
  Building2,
  ChefHat,
  Factory,
  FileText,
  Hand,
  HandCoins,
  Hotel,
  Landmark,
  MessageSquareText,
  Package,
  ShieldPlus,
  Shirt,
  Sparkles,
  Truck,
  UtensilsCrossed,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SectorIconName } from '@/types/sector';
import type { UseCaseIconName } from '@/types/use-case';

const useCaseIcons: Record<UseCaseIconName, LucideIcon> = {
  Mop: Brush,
  ChefHat,
  ShieldPlus,
  Shirt,
  HandSoap: Hand,
  Sparkles,
};

const sectorIcons: Record<SectorIconName, LucideIcon> = {
  Hotel,
  UtensilsCrossed,
  Sparkles,
  Building2,
  Boxes,
  Landmark,
};

export const trustIcons = [Factory, Package, HandCoins, FileText, Truck] as const;
export const workflowIcons = [MessageSquareText, ArrowRightLeft, Truck] as const;

export function getUseCaseIcon(icon: UseCaseIconName): LucideIcon {
  return useCaseIcons[icon];
}

export function getSectorIcon(icon: SectorIconName): LucideIcon {
  return sectorIcons[icon];
}
