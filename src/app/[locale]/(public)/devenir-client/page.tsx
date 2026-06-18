import type { Metadata } from 'next';
import {
  ArrowLeft,
  BadgeCheck,
  ChevronRight,
  FileText,
  LayoutDashboard,
  MailCheck,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';
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

const STEPS = [
  { icon: FileText, title: 'Votre demande', body: 'Renseignez vos informations société et professionnelles.' },
  { icon: PhoneCall, title: 'Vérification & appel', body: 'Notre équipe vérifie le dossier et vous appelle.' },
  { icon: BadgeCheck, title: 'Approbation', body: 'Prodet valide votre compte client.' },
  { icon: MailCheck, title: "Email d'activation", body: 'Vous recevez un lien pour activer votre accès.' },
  { icon: LayoutDashboard, title: 'Accès au portail', body: 'Commandes, devis, factures et livraisons en ligne.' },
] as const;

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
          <div className="mb-6 rounded-sm border border-border bg-white p-5 md:p-6">
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
                  Réservé aux professionnels. Prodet vérifie chaque demande avant d&apos;ouvrir l&apos;accès.
                </p>
              </div>
            </div>
          </div>

          {/* Process graphic — from request to portal access, in 5 steps. */}
          <div className="mb-6 rounded-sm border border-border bg-white p-5 md:p-6">
            <p className="eyebrow-label">Comment ça marche</p>
            <h2 className="mt-2 font-display text-xl font-bold text-prodet-text">
              De la demande à l&apos;accès, en 5 étapes
            </h2>
            <ol className="mt-6 grid gap-6 md:grid-cols-5">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li key={step.title} className="relative flex gap-4 md:flex-col md:gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-prodet-blue-tint text-prodet-blue">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="md:mt-1">
                      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-prodet-blue">
                        Étape {index + 1}
                      </span>
                      <h3 className="mt-0.5 text-sm font-semibold text-prodet-text">{step.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.body}</p>
                    </div>
                    {index < STEPS.length - 1 ? (
                      <ChevronRight
                        className="absolute -right-3 top-2.5 hidden h-5 w-5 text-border-strong md:block"
                        aria-hidden
                      />
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>

          <AccessRequestForm />
        </div>
      </section>
    </div>
  );
}
