import { siteContent } from '@/data/site-content';
import { AnimateOnScroll } from '@/components/motion/animate-on-scroll';
import { trustIcons } from '@/components/public-icons';
import { LabelText } from '@/components/typography/label-text';

export function TrustWall() {
  const items = siteContent.home.trustStrip.items;

  return (
    <section className="bg-transparent">
      <div className="section-shell py-14 lg:py-16">
        <div className="grid gap-5 xl:grid-cols-[0.36fr_0.64fr]">
          <div className="ink-panel overflow-hidden rounded-[36px] px-6 py-7 text-white sm:px-8 sm:py-8">
            <LabelText variant="inverse">CADRE COMMERCIAL CLAIR</LabelText>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
              Un site B2B doit aussi dire ce qu il ne fait pas.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/76 sm:text-base">
              Pas de stock public. Pas de commande en ligne. Pas de prix affiches. Le parcours est
              volontaire: comprendre l offre, filtrer vite, puis demander un devis.
            </p>
          </div>

          <AnimateOnScroll
            as="ul"
            staggerChildren
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
          >
            {items.map((item, index) => {
              const Icon = trustIcons[Math.min(index, trustIcons.length - 1)]!;

              return (
                <li
                  key={item}
                  data-animate-child
                  className="group rounded-[28px] border border-border/80 bg-white/86 px-5 py-5 shadow-[0_24px_40px_-36px_rgba(11,61,115,0.24)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-[2px] hover:border-primary/26 hover:shadow-[0_28px_44px_-34px_rgba(11,61,115,0.28)]"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF4FA] text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <p className="mt-4 text-sm font-medium leading-6 text-prodet-text">{item}</p>
                </li>
              );
            })}
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
