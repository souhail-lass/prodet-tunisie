import { ArrowRight, Beaker, Factory, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { WhatsAppLink } from '@/components/whatsapp-link';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <SectorsBand />
      <ManufacturingBand />
      <TrustBand />
      <CtaBand />
    </>
  );
}

function Hero() {
  const t = useTranslations('home.hero');
  return (
    <section className="border-border bg-background relative overflow-hidden border-b">
      <div className="mx-auto max-w-(--container-2xl) px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <p className="text-primary text-sm font-medium tracking-wider uppercase">{t('eyebrow')}</p>
        <h1 className="text-foreground mt-4 max-w-3xl text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl">
          {t('title')}
        </h1>
        <p className="text-muted-foreground mt-6 max-w-2xl text-lg">{t('subtitle')}</p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href="/devis">
              {t('primaryCta')}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/catalogue">{t('secondaryCta')}</Link>
          </Button>
          <WhatsAppLink size="lg" />
        </div>
      </div>
    </section>
  );
}

function SectorsBand() {
  const t = useTranslations('home.sectors');
  const sectors = [
    { key: 'hotels', icon: Factory, label: 'Hôtels et hébergement' },
    { key: 'restaurants', icon: Beaker, label: 'Restaurants' },
    { key: 'cleaningCompanies', icon: ShieldCheck, label: 'Sociétés de nettoyage' },
  ] as const;
  return (
    <section className="border-border bg-secondary/30 border-b">
      <div className="mx-auto max-w-(--container-2xl) px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-foreground text-2xl font-semibold sm:text-3xl">{t('title')}</h2>
          <p className="text-muted-foreground mt-3">{t('subtitle')}</p>
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sectors.map((sector) => {
            const Icon = sector.icon;
            return (
              <li
                key={sector.key}
                className="border-border bg-card rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <Icon className="text-primary h-8 w-8" aria-hidden />
                <p className="text-card-foreground mt-4 text-base font-semibold">{sector.label}</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  Solutions adaptées et formats professionnels.
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function ManufacturingBand() {
  const t = useTranslations('home.manufacturing');
  return (
    <section className="border-border border-b">
      <div className="mx-auto grid max-w-(--container-2xl) gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-primary text-sm font-medium tracking-wider uppercase">
            {t('eyebrow')}
          </p>
          <h2 className="text-foreground mt-3 text-2xl font-semibold sm:text-3xl">{t('title')}</h2>
          <p className="text-muted-foreground mt-4">{t('body')}</p>
        </div>
        <div
          aria-hidden
          className="border-border bg-secondary/40 text-muted-foreground flex min-h-[280px] items-center justify-center rounded-lg border border-dashed text-sm"
        >
          [Photo usine — à intégrer Phase 0]
        </div>
      </div>
    </section>
  );
}

function TrustBand() {
  const t = useTranslations('home.trust');
  const stats = [
    { value: '30+', label: t('yearsLabel') },
    { value: '80', label: t('manufacturedLabel') },
    { value: '96', label: t('customersLabel') },
  ] as const;
  return (
    <section className="border-border bg-secondary/30 border-b">
      <div className="mx-auto max-w-(--container-2xl) px-4 py-12 sm:px-6 lg:px-8">
        <ul className="grid gap-8 text-center sm:grid-cols-3">
          {stats.map((s) => (
            <li key={s.label}>
              <p className="text-foreground text-3xl font-semibold sm:text-4xl">{s.value}</p>
              <p className="text-muted-foreground mt-2 text-sm">{s.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CtaBand() {
  const t = useTranslations('home.ctaBand');
  return (
    <section>
      <div className="mx-auto flex max-w-(--container-2xl) flex-col items-start gap-6 px-4 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <h2 className="text-foreground text-2xl font-semibold sm:text-3xl">{t('title')}</h2>
          <p className="text-muted-foreground mt-2 max-w-xl">{t('subtitle')}</p>
        </div>
        <Button asChild size="lg">
          <Link href="/devis">
            {t('cta')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  );
}
