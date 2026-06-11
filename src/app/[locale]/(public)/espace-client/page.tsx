import type { Metadata } from 'next';
import { ArrowRight, KeyRound, MailCheck, ShieldAlert, ShieldCheck } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { Link, isLocale } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { requestClientMagicLink } from '@/features/client-auth/login-actions';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Espace client Prodet — Connexion professionnelle',
    description:
      'Accès professionnel à votre espace client Prodet. Connexion par lien magique pour les comptes validés.',
  };
}

type SearchParams = Record<string, string | string[] | undefined>;

export default async function EspaceClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<SearchParams>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  const search = searchParams ? await searchParams : {};
  const error = firstParam(search.error);
  const sent = firstParam(search.sent);

  return (
    <div className="bg-prodet-wash">
      <section className="section-shell py-16 lg:py-24">
        <div className="mx-auto grid w-full max-w-5xl items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
          {/*
           * LEFT — value proposition. Trimmed of repetitive marketing.
           * One sentence + four signal items + the secondary CTA.
           */}
          <div className="flex flex-col gap-8 lg:py-2">
            <header className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-prodet-blue">
                Espace client
              </p>
              <h1 className="text-[34px] font-semibold leading-[1.1] text-prodet-text md:text-[40px]">
                Votre poste de réapprovisionnement Prodet.
              </h1>
              <p className="max-w-md text-[15px] leading-7 text-muted-foreground">
                Suivi des demandes, produits habituels, reprise rapide. Accès réservé aux comptes
                professionnels validés par Prodet.
              </p>
            </header>

            <ul className="grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <li
                  key={feature.title}
                  className="rounded-md border border-border bg-card p-4"
                >
                  <p className="text-[13px] font-semibold text-prodet-text">{feature.title}</p>
                  <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
                    {feature.body}
                  </p>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-3 text-[13px]">
              <span className="text-muted-foreground">Pas encore de compte&nbsp;?</span>
              <Button asChild variant="ghost" size="sm" className="text-prodet-blue">
                <Link href="/devenir-client">
                  Demander un accès
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>

          {/*
           * RIGHT — the real login card. No more disabled inputs; the form
           * posts to the same server action used by /connexion-client.
           */}
          <aside className="rounded-md border border-border bg-card p-6 md:p-7">
            <header className="space-y-1">
              <h2 className="text-[18px] font-semibold text-prodet-text">Connexion client</h2>
              <p className="text-[13px] leading-5 text-muted-foreground">
                Recevez un lien sécurisé sur votre email professionnel.
              </p>
            </header>

            <form action={requestClientMagicLink} className="mt-5 space-y-3">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="next" value={`/${locale}/client`} />
              <label className="block">
                <span className="block text-[12px] font-medium text-prodet-text">
                  Email professionnel
                </span>
                <Input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-1.5"
                  placeholder="nom@societe.tn"
                />
              </label>
              <Button type="submit" size="lg" className="w-full">
                <KeyRound className="h-4 w-4" aria-hidden />
                Recevoir le lien
              </Button>
            </form>

            {sent === '1' ? (
              <p
                role="status"
                className="mt-4 inline-flex items-start gap-2 rounded-md border border-prodet-green/20 bg-prodet-green/10 px-3 py-2 text-[12px] leading-5 text-prodet-green"
              >
                <MailCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                Merci. Si cet email a un accès client activé, un lien peut arriver sous peu à cette
                adresse (vérifiez les indésirables). Pour un premier accès, utilisez « Demander un
                accès » ci-contre.
              </p>
            ) : null}

            {error ? (
              <p
                role="alert"
                className="mt-4 inline-flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-[12px] leading-5 text-destructive"
              >
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                {loginErrorMessage(error)}
              </p>
            ) : null}

            <div className="mt-5 border-t border-border pt-4">
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-prodet-blue" aria-hidden />
                Accès validé par Prodet · Sans mot de passe à mémoriser
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

// One sentence per item. No hero-tile gradient nonsense. These are
// status reassurances, not marketing copy.
const features: Array<{ title: string; body: string }> = [
  {
    title: 'Demandes structurées',
    body: 'Lignes, quantités, format et consignes de livraison dans une seule vue.',
  },
  {
    title: 'Produits habituels',
    body: 'Vos références récurrentes pré-enregistrées, ajoutables en un clic.',
  },
  {
    title: 'Suivi temps réel',
    body: 'Statut de chaque demande, du brouillon à la clôture par Prodet.',
  },
  {
    title: 'Reprise rapide',
    body: 'Dupliquez une demande passée pour réapprovisionner en quelques secondes.',
  },
];

function loginErrorMessage(error: string): string {
  switch (error) {
    case 'invalid':
      return "L'adresse email n'est pas valide.";
    case 'not-activated':
      return "Cet email n'a pas d'accès client activé.";
    case 'rate-limited':
      return 'Trop de tentatives. Réessayez dans quelques minutes.';
    case 'config':
      return "La connexion client n'est pas configurée côté serveur.";
    default:
      return 'Impossible d\u2019envoyer le lien pour le moment.';
  }
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
