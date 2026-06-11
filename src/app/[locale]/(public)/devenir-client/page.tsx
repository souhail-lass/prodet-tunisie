import type { Metadata } from 'next';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { Link, isLocale } from '@/i18n/routing';
import { AccessRequestForm } from '@/components/client-space/access-request-form';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Demander un accès client Prodet',
    description:
      "Demande d'activation d'accès client Prodet pour professionnels validés.",
  };
}

export default async function DevenirClientPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  return (
    <div className="bg-prodet-wash">
      <section className="section-shell py-10 lg:py-14">
        <Link
          href="/espace-client"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-strong"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Retour espace client
        </Link>

        <div className="mx-auto mt-8 max-w-4xl">
          <div className="mb-6 rounded-sm border border-border bg-white p-5">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-prodet-ink text-white">
                <ShieldCheck className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="eyebrow-label">Accès contrôlé</p>
                <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-prodet-text">
                  Demander un accès client Prodet
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Prodet vérifie chaque demande avant ouverture. Aucun compte n&apos;est créé automatiquement.
                </p>
              </div>
            </div>
          </div>

          <AccessRequestForm />
        </div>
      </section>
    </div>
  );
}
