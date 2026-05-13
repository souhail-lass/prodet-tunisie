import type { SectorId } from '@/types/sector';
import type { UseCaseId } from '@/types/use-case';

export type SectorPageIconName =
  | 'Briefcase'
  | 'Building'
  | 'Landmark'
  | 'Package'
  | 'Sparkles'
  | 'UtensilsCrossed';

export type SectorPageCard = {
  id: SectorId;
  name: string;
  image: string;
  alt: string;
  icon: SectorPageIconName;
  summary: string;
  description: string;
  supplies: readonly string[];
  tags: readonly string[];
  useCases: readonly UseCaseId[];
};

export const sectorPageCards: readonly SectorPageCard[] = [
  {
    id: 'hotels',
    name: 'Hôtels & hébergement',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
    alt: "Couloir d'hôtel professionnel",
    icon: 'Building',
    summary: 'Linge, chambres, sanitaires, espaces communs.',
    description:
      "Les établissements hôteliers ont des exigences élevées en matière d'hygiène, de présentation et de rotation rapide du linge. Prodet fournit des solutions adaptées à chaque zone : chambres, lingerie, cuisine, espaces communs et sanitaires clients.",
    supplies: ['Lessive 20KG', 'Sanitaires', 'Sols & communs'],
    tags: ['Linge & textiles', 'Sanitaires & désinfection', 'Nettoyage des sols'],
    useCases: ['linge-textiles', 'sanitaires-desinfection', 'sols'],
  },
  {
    id: 'restaurants-cafes',
    name: 'Restaurants & cafés',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    alt: 'Cuisine de restaurant professionnelle',
    icon: 'UtensilsCrossed',
    summary: 'Cuisine, plonge, graisses, sols.',
    description:
      "En restauration, la propreté de la cuisine est une obligation réglementaire et un enjeu quotidien. Nos dégraissants concentrés et nos produits vaisselle sont conçus pour les volumes et la fréquence d'utilisation des cuisines professionnelles.",
    supplies: ['Dégraissant 5L/20L', 'Vaisselle', 'Sols cuisine'],
    tags: ['Cuisine & dégraissage', 'Hygiène des mains', 'Nettoyage des sols'],
    useCases: ['cuisine-degraissage', 'hygiene-mains', 'sols'],
  },
  {
    id: 'societes-nettoyage',
    name: 'Sociétés de nettoyage',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    alt: 'Agent de nettoyage professionnel',
    icon: 'Sparkles',
    summary: 'Grands formats, multi-sites, volumes réguliers.',
    description:
      'Les sociétés de nettoyage travaillent sur plusieurs sites avec des contraintes de coût, de volume et de logistique. Prodet propose des formats grands conditionnements (20L+) et des tarifs adaptés aux contrats multi-sites et aux volumes réguliers.',
    supplies: ['Formats 20L+', 'Javel', 'Sols & surfaces'],
    tags: ['Nettoyage des sols', 'Sanitaires & désinfection', 'Surfaces & vitres'],
    useCases: ['sols', 'sanitaires-desinfection', 'surfaces-vitres'],
  },
  {
    id: 'entreprises',
    name: 'Entreprises',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    alt: 'Bureaux et espaces de travail professionnels',
    icon: 'Briefcase',
    summary: 'Bureaux, vitres, sanitaires, points de contact.',
    description:
      "L'entretien des bureaux, espaces communs et sanitaires d'entreprise requiert des produits fiables, sans odeur agressive et compatibles avec un environnement de travail. Prodet couvre tous les besoins de nettoyage quotidien des espaces professionnels.",
    supplies: ['Savon mains', 'Vitres', 'Sanitaires'],
    tags: ['Hygiène des mains', 'Surfaces & vitres', 'Sanitaires & désinfection'],
    useCases: ['hygiene-mains', 'surfaces-vitres', 'sanitaires-desinfection'],
  },
  {
    id: 'revendeurs-grossistes',
    name: 'Revendeurs & grossistes',
    image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&q=80',
    alt: 'Stock de produits de nettoyage professionnels',
    icon: 'Package',
    summary: 'Références claires, formats standards, conditions volume.',
    description:
      "Prodet travaille directement avec les revendeurs et grossistes qui souhaitent référencer une gamme de produits d'entretien tunisiens. Conditionnements standards, références claires et conditions grossiste disponibles selon volume.",
    supplies: ['Gamme complète', '5L / 10L / 20L', 'Tarifs volume'],
    tags: ['Linge & textiles', 'Cuisine & dégraissage', 'Sanitaires & désinfection'],
    useCases: ['linge-textiles', 'cuisine-degraissage', 'sanitaires-desinfection'],
  },
  {
    id: 'institutions',
    name: 'Institutions & collectivités',
    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80',
    alt: 'Établissement public et collectivité',
    icon: 'Landmark',
    summary: 'Hygiène collective, désinfection, sols intensifs.',
    description:
      "Écoles, administrations, hôpitaux et structures publiques ont des besoins récurrents en produits d'hygiène et de désinfection conformes. Prodet accompagne les collectivités avec des produits adaptés aux cahiers des charges institutionnels.",
    supplies: ['Désinfection', 'Savon mains', 'Sols intensifs'],
    tags: ['Sanitaires & désinfection', 'Hygiène des mains', 'Nettoyage des sols'],
    useCases: ['sanitaires-desinfection', 'hygiene-mains', 'sols'],
  },
] as const;
