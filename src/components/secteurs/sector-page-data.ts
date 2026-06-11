import type { SectorId } from '@/types/sector';
import type { UseCaseId } from '@/types/use-case';

export type SectorPageIconName =
  | 'Hotel'
  | 'Landmark'
  | 'Boxes'
  | 'Sparkles'
  | 'Building2'
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
    icon: 'Hotel',
    summary: 'Linge, chambres, sanitaires, parfum textile.',
    description:
      'Produits pour lingerie, chambres, sanitaires clients et espaces visibles.',
    supplies: ['Prolax linge', 'Deofresh Linge', 'Sanitaires & vitres'],
    tags: ['Linge & textiles', 'Surfaces & vitres', 'Sanitaires & désinfection'],
    useCases: ['linge-textiles', 'surfaces-vitres', 'sanitaires-desinfection'],
  },
  {
    id: 'restaurants-cafes',
    name: 'Restaurants & cafés',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    alt: 'Cuisine de restaurant professionnelle',
    icon: 'UtensilsCrossed',
    summary: 'Cuisine, plonge, fours, vaisselle machine.',
    description:
      'Produits de dégraissage, plonge, fours, hottes, vaisselle et hygiène de service.',
    supplies: ['Profour', 'Prolav / Prorinse', 'Solitaire Vaisselle'],
    tags: ['Cuisine & dégraissage', 'Vaisselle', 'Hygiène des mains'],
    useCases: ['cuisine-degraissage', 'hygiene-mains', 'sols'],
  },
  {
    id: 'societes-nettoyage',
    name: 'Sociétés de nettoyage',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    alt: 'Agent de nettoyage professionnel',
    icon: 'Sparkles',
    summary: 'Sols, surfaces, sanitaires, grands formats.',
    description:
      'Références pratiques pour interventions récurrentes, multi-sites et réassort fréquent.',
    supplies: ['Sirafan', 'Provitre', 'Formats 5L / 20L'],
    tags: ['Nettoyage des sols', 'Sanitaires & désinfection', 'Surfaces & vitres'],
    useCases: ['sols', 'sanitaires-desinfection', 'surfaces-vitres'],
  },
  {
    id: 'entreprises',
    name: 'Entreprises',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    alt: 'Bureaux et espaces de travail professionnels',
    icon: 'Building2',
    summary: 'Bureaux, vitres, sanitaires, hygiène mains.',
    description:
      'Entretien quotidien des bureaux, zones communes, sanitaires et points de contact.',
    supplies: ['Sanihand', 'Provitre', 'Prostar / Pilax'],
    tags: ['Hygiène des mains', 'Surfaces & vitres', 'Sanitaires & désinfection'],
    useCases: ['hygiene-mains', 'surfaces-vitres', 'sanitaires-desinfection'],
  },
  {
    id: 'revendeurs-grossistes',
    name: 'Revendeurs & grossistes',
    image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&q=80',
    alt: 'Stock de produits de nettoyage professionnels',
    icon: 'Boxes',
    summary: 'Gamme Prodet, formats lisibles, réassort.',
    description:
      "Références d'entretien professionnelles avec formats faciles à relire et à recommander.",
    supplies: ['Bidons 5L', 'Seaux et sacs', 'Références multi-usages'],
    tags: ['Linge & textiles', 'Cuisine & dégraissage', 'Sanitaires & désinfection'],
    useCases: ['linge-textiles', 'cuisine-degraissage', 'sanitaires-desinfection'],
  },
  {
    id: 'institutions',
    name: 'Institutions & collectivités',
    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80',
    alt: 'Établissement public et collectivité',
    icon: 'Landmark',
    summary: 'Sanitaires, mains, sols, espaces collectifs.',
    description:
      "Produits d'hygiène et d'entretien pour structures collectives et achats récurrents.",
    supplies: ['Javel Prodet', 'Manocid', 'Profon / Prostar'],
    tags: ['Sanitaires & désinfection', 'Hygiène des mains', 'Nettoyage des sols'],
    useCases: ['sanitaires-desinfection', 'hygiene-mains', 'sols'],
  },
] as const;
