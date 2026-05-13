import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { UseCase } from '@/data/types';
import { AnimateOnScroll } from '@/components/motion/animate-on-scroll';
import { siteContent } from '@/data/site-content';
import { LabelText } from '@/components/typography/label-text';

const useCaseShowcase: Record<
  UseCase['id'],
  {
    eyebrow: string;
    image: string;
    summary: string;
    highlights: string[];
    spanClass: string;
  }
> = {
  'cuisine-degraissage': {
    eyebrow: 'Cuisine professionnelle',
    image: '/images/contexts/kitchen-dishwashing-01.jpg',
    summary:
      'Hottes, plans de travail, fours, friteuses et zones de plonge avec des besoins de nettoyage intensif.',
    highlights: ['Hottes', 'Fours & grills', 'Zones de plonge'],
    spanClass: 'lg:col-span-3',
  },
  'linge-textiles': {
    eyebrow: 'Blanchisserie & hébergement',
    image: '/images/contexts/laundry-hotel-01.jpg',
    summary:
      "Pour les rotations de linge d'hôtel, de collectivité et d'établissements à cadence régulière.",
    highlights: ['Linge de chambre', 'Rotations fréquentes', 'Formats 20 KG'],
    spanClass: 'lg:col-span-3',
  },
  'sanitaires-desinfection': {
    eyebrow: 'Sanitaires & zones sensibles',
    image: '/images/contexts/disinfection-01.jpg',
    summary:
      'Des produits pensés pour les sanitaires, points de contact et espaces collectifs où la propreté doit être lisible immédiatement.',
    highlights: ['Sanitaires', 'Points de contact', 'Espaces collectifs'],
    spanClass: 'lg:col-span-2',
  },
  sols: {
    eyebrow: 'Circulations & sols',
    image: '/images/contexts/disinfection-02.jpg',
    summary:
      'Nettoyage courant des halls, zones de passage et surfaces de sol en exploitation quotidienne.',
    highlights: ['Halls', 'Carrelage', 'Zones de passage'],
    spanClass: 'lg:col-span-2',
  },
  'hygiene-mains': {
    eyebrow: 'Points d’hygiène',
    image: '/images/contexts/hand-hygiene-01.jpg',
    summary:
      "Savons liquides et solutions d'hygiène pour cuisines, entreprises, accueils et collectivités.",
    highlights: ['Distributeurs', 'Accueils', 'Collectivités'],
    spanClass: 'lg:col-span-2',
  },
  'surfaces-vitres': {
    eyebrow: 'Accueil & surfaces visibles',
    image: '/images/contexts/glass-cleaning-01.jpg',
    summary:
      "Vitres, miroirs et surfaces de présentation pour les espaces où l'image du lieu compte dès le premier regard.",
    highlights: ['Vitrages', 'Miroirs', 'Zones d’accueil'],
    spanClass: 'lg:col-span-2',
  },
};

const useCasePriority: Record<UseCase['id'], number> = {
  'cuisine-degraissage': 1,
  'linge-textiles': 2,
  'sanitaires-desinfection': 3,
  sols: 4,
  'hygiene-mains': 5,
  'surfaces-vitres': 6,
};

export function UseCaseNav({ useCases }: { useCases: readonly UseCase[] }) {
  const copy = siteContent.home.useCases;
  const orderedUseCases = [...useCases].sort(
    (left, right) => useCasePriority[left.id] - useCasePriority[right.id],
  );

  return (
    <section className="bg-transparent">
      <div className="section-shell py-18">
        <div className="grid gap-8 xl:grid-cols-[0.82fr_1.18fr]">
          <header className="surface-panel editorial-wash h-fit p-7 sm:p-8">
            <LabelText>{copy.label}</LabelText>
            <h2 className="mt-4 text-3xl font-bold text-prodet-text sm:text-4xl">{copy.title}</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{copy.subtitle}</p>
            <div className="mt-8 rounded-[24px] border border-border/80 bg-white/82 p-5">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/70">
                Navigation métier
              </p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Le visiteur n’a pas besoin de deviner une référence. Il doit pouvoir entrer par le
                besoin réel de son établissement, puis avancer vers un devis sans friction.
              </p>
            </div>
          </header>

          <AnimateOnScroll
            as="div"
            staggerChildren
            className="grid gap-5 lg:grid-cols-6"
          >
            {orderedUseCases.map((useCase) => {
              const showcase = useCaseShowcase[useCase.id];

              return (
                <Link
                  key={useCase.id}
                  href={`/catalogue?useCase=${useCase.id}`}
                  data-animate-child
                  className={`group relative min-h-[270px] overflow-hidden rounded-[30px] border border-white/14 ${showcase.spanClass}`}
                >
                  <Image
                    src={showcase.image}
                    alt={useCase.label}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,25,46,0.16)_0%,rgba(6,25,46,0.42)_36%,rgba(6,25,46,0.88)_100%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,166,230,0.28),transparent_28%)]" />

                  <div className="relative flex h-full flex-col justify-between p-6 text-white sm:p-7">
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/68">
                        {showcase.eyebrow}
                      </p>
                      <h3 className="mt-4 max-w-xl text-[1.55rem] font-semibold leading-tight">
                        {useCase.label}
                      </h3>
                      <p className="mt-3 max-w-xl text-sm leading-7 text-white/78">
                        {showcase.summary}
                      </p>
                    </div>

                    <div>
                      <div className="flex flex-wrap gap-2">
                        {showcase.highlights.map((highlight) => (
                          <span
                            key={highlight}
                            className="rounded-full border border-white/14 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/82 backdrop-blur-sm"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white">
                        {copy.linkLabel}
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
