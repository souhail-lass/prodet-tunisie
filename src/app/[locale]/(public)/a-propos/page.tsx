import { FileText } from 'lucide-react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { companyInfo } from '@/data/company';
import { siteContent } from '@/data/site-content';
import { Link, isLocale } from '@/i18n/routing';
import { LabelText } from '@/components/typography/label-text';
import { Button } from '@/components/ui/button';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'À propos',
    description: siteContent.about.intro,
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  const copy = siteContent.about;

  return (
    <article className="section-shell py-12">
      <header className="surface-panel overflow-hidden p-7 sm:p-8">
        <LabelText>{copy.label}</LabelText>
        <h1 className="public-display-title-compact mt-4 max-w-4xl">
          {copy.title}
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">{copy.intro}</p>
      </header>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
        <div className="rounded-2xl border border-border bg-white p-7">
          {copy.story.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-8 text-muted-foreground [&:not(:first-child)]:mt-4">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="factory-pattern brand-grid flex min-h-[320px] items-end rounded-[24px] border border-border p-6">
          <p className="text-sm text-white/58">[Photo usine à venir]</p>
        </div>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {copy.values.map((value) => (
          <div key={value.title} className="rounded-2xl border border-border bg-white p-6">
            <h2 className="text-lg font-semibold text-prodet-text">{value.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{value.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 rounded-2xl border border-border bg-secondary p-7">
        <h2 className="text-2xl font-bold text-prodet-text">{copy.productionTitle}</h2>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-muted-foreground">{copy.productionBody}</p>
        <p className="mt-4 text-sm font-medium text-prodet-text">{companyInfo.addressFull}</p>
      </section>

      <section className="mt-10 rounded-2xl border border-border bg-white p-7">
        <h2 className="text-2xl font-bold text-prodet-text">{copy.documentsTitle}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{copy.documentsBody}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {companyInfo.documents.map((document) => (
            <div key={document.id} className="rounded-2xl border border-border bg-secondary p-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary">
                <FileText className="h-4 w-4" aria-hidden />
                PDF
              </span>
              <h3 className="mt-4 text-lg font-semibold text-prodet-text">{document.label}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{document.description}</p>
              <Button asChild variant="outline" className="mt-5 rounded-full px-5">
                <a href={document.href} download>
                  Télécharger
                </a>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-panel-strong mt-10 flex flex-col gap-5 p-7 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Besoin d’une offre adaptée à votre activité ?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-white/78">
            Décrivez vos usages, vos formats et vos volumes. Nous revenons vers vous avec une
            proposition claire.
          </p>
        </div>
        <Button asChild className="rounded-full bg-white px-6 text-sm font-semibold text-primary hover:bg-white/92">
          <Link href="/devis">Demander un devis</Link>
        </Button>
      </section>
    </article>
  );
}
