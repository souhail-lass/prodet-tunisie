import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { siteContent } from '@/data/site-content';
import { Button } from '@/components/ui/button';
import { LabelText } from '@/components/typography/label-text';

export function ManufacturerBand() {
  const copy = siteContent.home.manufacturing;
  const proofPoints = [
    'Lecture claire des usages et des conditionnements',
    'Relation commerciale directe avec Prodet',
    'Approche adaptee aux volumes professionnels',
    'Parcours oriente devis, sans commande grand public',
  ];

  return (
    <section className="bg-white">
      <div className="section-shell py-18 lg:py-20">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="relative min-h-[560px] overflow-hidden rounded-[40px] border border-border/80 bg-prodet-navy shadow-industrial">
            <Image
              src="/images/contexts/manufacturing-band.jpg"
              alt="Illustration de production industrielle"
              fill
              loading="lazy"
              sizes="(min-width: 1280px) 44vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,34,66,0.04)_0%,rgba(7,34,66,0.26)_44%,rgba(7,34,66,0.92)_100%)]" />
            <div aria-hidden className="factory-pattern brand-grid absolute inset-0 opacity-34" />
            <div className="absolute inset-x-6 bottom-6 grid gap-4 md:grid-cols-[1.08fr_0.92fr]">
              <div className="rounded-[28px] border border-white/12 bg-white/88 p-5 text-prodet-text backdrop-blur-sm">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/70">
                  Production locale
                </p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{copy.caption}</p>
              </div>
              <div className="rounded-[28px] border border-white/12 bg-prodet-navy/76 p-5 text-white backdrop-blur-sm">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/58">
                  Relation directe
                </p>
                <p className="mt-3 text-sm leading-7 text-white/80">
                  Pas de marketplace, pas de commande en ligne. Le contact commercial reste
                  direct avec Prodet.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-[40px] border border-border/80 bg-white p-7 sm:p-8 lg:p-9">
            <div>
              <LabelText>{copy.label}</LabelText>
              <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-[-0.03em] text-prodet-text sm:text-4xl lg:text-[42px]">
                {copy.title}
              </h2>
              <p className="mt-5 max-w-3xl text-[16px] leading-8 text-muted-foreground">
                {copy.body}
              </p>
            </div>

            <ol className="mt-8 space-y-3">
              {proofPoints.map((point, index) => (
                <li
                  key={point}
                  className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 rounded-[24px] border border-border/80 bg-white px-4 py-4"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF4FA] text-sm font-semibold text-primary">
                    0{index + 1}
                  </span>
                  <p className="self-center text-sm font-medium leading-6 text-prodet-text">
                    {point}
                  </p>
                </li>
              ))}
            </ol>

            <Button
              asChild
              variant="outline"
              className="mt-8 w-fit rounded-full border-border bg-white px-6 text-prodet-text hover:bg-[#F5F1E8]"
            >
              <Link href="/catalogue">{copy.cta}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
