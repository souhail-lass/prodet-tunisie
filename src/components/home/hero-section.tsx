import Image from 'next/image';
import { Link } from '@/i18n/routing';
import {
  publicOfferReferenceImage,
  type PublicOfferSection,
} from '@/data/public-offers';
import { LabelText } from '@/components/typography/label-text';
import { Button } from '@/components/ui/button';

export function HeroSection({ sections }: { sections: readonly PublicOfferSection[] }) {
  const totalProducts = sections.reduce((sum, section) => sum + section.products.length, 0);
  const heroStats = [
    {
      value: `${sections.length}`,
      label: 'services structures',
      body: 'Une lecture par usage metier plutot qu un catalogue grand public.',
    },
    {
      value: `${totalProducts}`,
      label: 'references visibles',
      body: 'Une offre lisible sans prix publics ni tunnel de commande.',
    },
    {
      value: 'B2B',
      label: 'contact direct',
      body: 'Le site sert a cadrer un besoin puis a declencher un devis.',
    },
  ] as const;

  const spotlightSections = sections.slice(0, 3);

  return (
    <section className="relative overflow-hidden border-b border-border/70">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,166,230,0.12),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f4f6f8_56%,#ffffff_100%)]"
      />
      <div aria-hidden className="subtle-grid absolute inset-0 opacity-40" />
      <div
        aria-hidden
        className="absolute left-[8%] top-[16%] h-32 w-32 rounded-full border border-primary/10"
      />
      <div
        aria-hidden
        className="absolute right-[6%] top-[10%] h-72 w-72 rounded-full bg-prodet-sky/8 blur-3xl"
      />

      <div className="section-shell relative z-10 py-10 sm:py-14 lg:py-18">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.03fr)_minmax(430px,0.97fr)] xl:items-start">
          <div className="max-w-3xl pt-2 lg:pt-6">
            <LabelText className="block text-primary/80">
              FOURNISSEUR B2B EN HYGIENE ET ENTRETIEN
            </LabelText>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/72">
              <span className="rounded-full border border-primary/14 bg-white/80 px-3 py-1">
                Fabrication locale
              </span>
              <span className="rounded-full border border-primary/14 bg-white/80 px-3 py-1">
                Sans prix public
              </span>
              <span className="rounded-full border border-primary/14 bg-white/80 px-3 py-1">
                Devis direct
              </span>
            </div>
            <h1 className="mt-7 max-w-4xl text-4xl font-bold leading-[0.96] tracking-[-0.03em] text-prodet-text sm:text-5xl lg:text-[72px]">
              Une presence B2B qui aide a acheter, pas a scroller.
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-8 text-muted-foreground sm:text-[18px]">
              Prodet structure son offre par service reel: restauration, buanderie, housekeeping
              et articles menagers. Le visiteur comprend vite ce qui est propose, puis passe
              directement au devis.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="rounded-full px-6 text-sm font-semibold">
                <Link href="/devis">Demander un devis</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-border bg-white/84 px-6 text-sm font-semibold text-prodet-text hover:bg-white"
              >
                <Link href="/catalogue">Voir le catalogue</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="rounded-full px-4 text-sm font-semibold text-prodet-text"
              >
                <Link href="/contact">Contacter Prodet</Link>
              </Button>
            </div>

            <dl className="mt-10 grid gap-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[26px] border border-border/70 bg-white/78 px-5 py-5 shadow-[0_20px_40px_-36px_rgba(11,61,115,0.35)] backdrop-blur-sm"
                >
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/68">
                    {stat.label}
                  </dt>
                  <dd className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-prodet-text">
                    {stat.value}
                  </dd>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{stat.body}</p>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="grid gap-4 sm:grid-cols-[1.08fr_0.92fr]">
              <div className="relative min-h-[540px] overflow-hidden rounded-[38px] border border-border/70 bg-prodet-navy shadow-industrial">
                <Image
                  src="/images/contexts/manufacturing-band.jpg"
                  alt="Production Prodet"
                  fill
                  priority
                  sizes="(min-width: 1280px) 34vw, (min-width: 640px) 58vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,34,66,0.05)_0%,rgba(7,34,66,0.35)_42%,rgba(7,34,66,0.92)_100%)]" />
                <div aria-hidden className="brand-grid absolute inset-0 opacity-14" />
                <div className="absolute inset-x-6 bottom-6">
                  <div className="rounded-[28px] border border-white/12 bg-white/10 p-5 text-white backdrop-blur-sm">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/58">
                      Lecture B2B
                    </p>
                    <p className="mt-3 max-w-md text-sm leading-7 text-white/84">
                      Une home construite pour un responsable d hotel, de cuisine ou d entretien
                      qui veut identifier vite la bonne famille de produits.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {spotlightSections.map((section, index) => (
                  <Link
                    key={section.id}
                    href={`/catalogue?section=${section.id}`}
                    className="group rounded-[30px] border border-border/70 bg-white/86 p-3 shadow-[0_20px_36px_-32px_rgba(11,61,115,0.35)] backdrop-blur-sm transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] hover:border-primary/30 hover:shadow-[0_28px_48px_-34px_rgba(11,61,115,0.34)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[22px]">
                      <Image
                        src={section.image}
                        alt={section.label}
                        fill
                        sizes="(min-width: 1280px) 18vw, (min-width: 640px) 28vw, 100vw"
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                      />
                    </div>
                    <div className="mt-4 flex items-start justify-between gap-3 px-1">
                      <div>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-primary/58">
                          0{index + 1}
                        </p>
                        <h2 className="mt-2 text-base font-semibold text-prodet-text">
                          {section.anchorTitle}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {section.products.length} references
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}

                <div className="relative overflow-hidden rounded-[30px] border border-border/70 bg-white/92 px-5 py-5 shadow-[0_20px_36px_-32px_rgba(11,61,115,0.35)]">
                  <div
                    aria-hidden
                    className="absolute inset-y-0 right-0 w-24 bg-[radial-gradient(circle_at_center,rgba(37,166,230,0.14),transparent_70%)]"
                  />
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-primary/58">
                    Repere produit
                  </p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="relative h-28 w-24 shrink-0">
                      <Image
                        src={publicOfferReferenceImage}
                        alt="Exemple de visuel produit"
                        fill
                        sizes="96px"
                        className="object-contain"
                      />
                    </div>
                    <p className="max-w-[16rem] text-sm leading-7 text-muted-foreground">
                      Chaque fiche doit mener vite vers l essentiel: photo, usage, dosage, fiche
                      technique et devis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-3 lg:grid-cols-4">
          {sections.map((section) => (
            <Link
              key={section.id}
              href={`/catalogue?section=${section.id}`}
              className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-[24px] border border-border/70 bg-white/78 px-4 py-4 backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-[2px] hover:border-primary/28 hover:shadow-[0_22px_38px_-34px_rgba(11,61,115,0.3)]"
            >
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary/58">
                  {section.anchorTitle}
                </p>
                <p className="mt-2 text-sm font-medium text-prodet-text">{section.label}</p>
              </div>
              <span className="rounded-full bg-prodet-blue/[0.06] px-3 py-1 text-xs font-semibold text-primary">
                {section.products.length}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
