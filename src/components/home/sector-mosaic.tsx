import { Link } from '@/i18n/routing';
import { siteContent } from '@/data/site-content';
import type { Sector } from '@/data/types';
import { getUseCaseById } from '@/data/queries';
import { AnimateOnScroll } from '@/components/motion/animate-on-scroll';
import { getSectorIcon } from '@/components/public-icons';
import { LabelText } from '@/components/typography/label-text';

export function SectorMosaic({ sectors }: { sectors: readonly Sector[] }) {
  const copy = siteContent.home.sectors;

  return (
    <section className="bg-[#FBF8F1]">
      <div className="section-shell py-18 lg:py-20">
        <div className="grid gap-10 xl:grid-cols-[0.34fr_0.66fr]">
          <header className="xl:sticky xl:top-28 xl:self-start">
            <LabelText>{copy.label}</LabelText>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-prodet-text sm:text-4xl lg:text-[44px]">
              Une offre relue selon les rythmes du terrain.
            </h2>
            <p className="mt-5 max-w-md text-base leading-8 text-muted-foreground">
              Hotels, cuisines, bureaux, institutions et societes de nettoyage n achetent pas de
              la meme maniere. La home doit le montrer avec des entrees claires.
            </p>
            <div className="mt-8 rounded-[30px] border border-border/80 bg-white/82 p-5">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/68">
                Rythmes couverts
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  'rotation quotidienne',
                  'entretien multi-site',
                  'service de chambres',
                  'plonge intensive',
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-prodet-text"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <Link
              href="/secteurs"
              className="mt-8 inline-flex items-center rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-prodet-text transition-colors hover:bg-[#F5F1E8]"
            >
              {copy.cta}
            </Link>
          </header>

          <AnimateOnScroll
            as="div"
            staggerChildren
            className="overflow-hidden rounded-[34px] border border-border/80 bg-white shadow-[0_28px_54px_-44px_rgba(11,61,115,0.28)]"
          >
            {sectors.map((sector, index) => {
              const Icon = getSectorIcon(sector.icon);

              return (
                <Link
                  key={sector.id}
                  href={`/catalogue?sector=${sector.id}`}
                  data-animate-child
                  className="group grid gap-5 border-b border-border/80 px-6 py-6 transition-colors duration-200 ease-out last:border-b-0 hover:bg-[#FAF7F0] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start sm:gap-6 sm:px-7"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF4FA] text-primary shadow-[0_16px_32px_-28px_rgba(15,93,168,0.55)]">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="product-code text-primary/42">0{index + 1}</span>
                      <h3 className="text-xl font-semibold text-prodet-text">{sector.label}</h3>
                    </div>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                      {sector.shortDescription}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {sector.supplyHighlights.slice(0, 2).map((line) => (
                        <span
                          key={line}
                          className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-prodet-text"
                        >
                          {line}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 sm:text-right">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-primary/58">
                      Usages cles
                    </p>
                    <div className="space-y-1 text-sm leading-6 text-muted-foreground">
                      {sector.relevantUseCases.slice(0, 2).map((useCaseId) => (
                        <p key={useCaseId}>{getUseCaseById(useCaseId)?.label ?? useCaseId}</p>
                      ))}
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
