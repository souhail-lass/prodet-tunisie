import Image from 'next/image';
import { Link } from '@/i18n/routing';
import type { PublicOfferSection } from '@/data/public-offers';
import { AnimateOnScroll } from '@/components/motion/animate-on-scroll';
import { LabelText } from '@/components/typography/label-text';
import { cn } from '@/lib/utils';

export function OfferFamiliesShowcase({
  sections,
}: {
  sections: readonly PublicOfferSection[];
}) {
  const layoutClasses = [
    'xl:col-span-7 xl:row-span-2',
    'xl:col-span-5',
    'xl:col-span-5',
    'xl:col-span-7',
  ] as const;

  const imageAspectClasses = [
    'aspect-[4/4.8] xl:aspect-auto xl:min-h-[620px]',
    'aspect-[4/3]',
    'aspect-[4/3]',
    'aspect-[4/3.1]',
  ] as const;

  return (
    <section className="bg-white">
      <div className="section-shell py-18 lg:py-20">
        <div className="grid gap-8 xl:grid-cols-[0.34fr_0.66fr] xl:items-end">
          <header className="max-w-md xl:pb-6">
            <LabelText>NOS SERVICES</LabelText>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-prodet-text sm:text-4xl lg:text-[46px]">
              Choisissez d abord votre univers de service.
            </h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              La page accueil ne doit pas forcer l utilisateur a lire des blocs abstraits. Elle
              doit lui montrer tout de suite s il est au bon endroit.
            </p>
          </header>

          <AnimateOnScroll
            as="div"
            staggerChildren
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-12 xl:auto-rows-[minmax(180px,auto)]"
          >
            {sections.map((section, index) => (
              <Link
                key={section.id}
                href={`/catalogue?section=${section.id}`}
                data-animate-child
                className={cn('group block', layoutClasses[index] ?? 'xl:col-span-6')}
              >
                <div
                  className={cn(
                    'relative overflow-hidden rounded-[34px] border border-border/70 bg-white shadow-[0_24px_52px_-40px_rgba(11,61,115,0.28)] transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-[4px] group-hover:border-primary/26 group-hover:shadow-[0_28px_52px_-34px_rgba(11,61,115,0.32)]',
                    imageAspectClasses[index] ?? 'aspect-[4/3]',
                  )}
                >
                  <Image
                    src={section.image}
                    alt={section.label}
                    fill
                    sizes="(min-width: 1280px) 32vw, (min-width: 640px) 48vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                  />
                </div>
                <div className="flex items-start justify-between gap-4 px-1 pt-4">
                  <div>
                    <h3 className="text-lg font-semibold text-prodet-text">{section.label}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {section.products.length} references
                    </p>
                  </div>
                  <span className="product-code text-primary/46">0{index + 1}</span>
                </div>
              </Link>
            ))}
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
