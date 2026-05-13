import {
  ArrowRight,
  ChefHat,
  Hand,
  Layers,
  Package2,
  ShieldCheck,
  Shirt,
} from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

const categories = [
  {
    id: 'linge-textiles',
    name: 'Linge & buanderie',
    description: 'Lessives et produits pour blanchisseries hôtelières et hospitalières',
    icon: Shirt,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
    alt: 'Blanchisserie hôtelière professionnelle',
    accentColor: '#1B5FA7',
  },
  {
    id: 'cuisine-degraissage',
    name: 'Cuisine & dégraissage',
    description: 'Dégraissants et nettoyants pour cuisines professionnelles',
    icon: ChefHat,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    alt: 'Cuisine professionnelle de restaurant',
    accentColor: '#1F9C49',
  },
  {
    id: 'sols',
    name: 'Nettoyage des sols',
    description: 'Détergents et solutions pour sols de tous types',
    icon: Layers,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    alt: 'Nettoyage sol professionnel',
    accentColor: '#33B5F6',
  },
  {
    id: 'sanitaires-desinfection',
    name: 'Sanitaires & désinfection',
    description: "Désinfectants, Javel et produits d'hygiène sanitaire",
    icon: ShieldCheck,
    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80',
    alt: 'Sanitaires professionnels désinfectés',
    accentColor: '#DC2626',
  },
  {
    id: 'hygiene-mains',
    name: 'Hygiène des mains',
    description: 'Savons liquides et gels pour points de contact',
    icon: Hand,
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80',
    alt: 'Hygiène des mains professionnelle',
    accentColor: '#F59E0B',
  },
  {
    id: 'articles-hygiene',
    name: "Articles d'hygiène",
    description: 'Accessoires, mops et consommables distribués',
    icon: Package2,
    image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&q=80',
    alt: 'Articles et accessoires de nettoyage',
    accentColor: '#7C3AED',
  },
] as const;

export function HomeCategories() {
  return (
    <section className="bg-[#F8F7F4] py-[72px]">
      <div className="mx-auto max-w-[1400px] px-6">
        <header>
          <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#1B5FA7]">
            NOTRE GAMME
          </p>
          <h2 className="mb-2.5 text-[30px] font-semibold leading-[1.2] text-[#1C2B3A]">
            Trouvez les produits adaptés à votre activité
          </h2>
          <p className="mb-9 max-w-[500px] text-[14px] leading-[1.7] text-[#6B7280]">
            Parcourez par usage — chaque catégorie regroupe les solutions pour les professionnels.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.id}
                href={`/catalogue?useCase=${category.id}`}
                className="group overflow-hidden rounded-[12px] border-[0.5px] border-[#E5E7EB] bg-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#1B5FA7] hover:shadow-[0_4px_20px_rgba(27,95,167,0.08)]"
                style={{ borderTop: `3px solid ${category.accentColor}` }}
              >
                <div className="relative h-[120px] overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    unoptimized
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[rgba(13,59,115,0.45)]" aria-hidden />
                  <Icon
                    className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-white"
                    aria-hidden
                  />
                </div>
                <div className="p-4">
                  <h3 className="mb-1 text-[14px] font-medium text-[#1C2B3A]">{category.name}</h3>
                  <p className="mb-2.5 text-[12px] leading-[1.5] text-[#6B7280]">
                    {category.description}
                  </p>
                  <span
                    className="flex items-center gap-1 text-[12px] font-medium"
                    style={{ color: category.accentColor }}
                  >
                    Voir les produits
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
