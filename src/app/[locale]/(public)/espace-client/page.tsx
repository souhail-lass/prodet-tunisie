import type { Metadata } from 'next';
import { ArrowRight, MailCheck, ShieldAlert, ShieldCheck } from 'lucide-react';
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
      <section className="section-shell flex min-h-[calc(100vh-200px)] items-center justify-center py-16 lg:py-24">
        <div className="w-full max-w-[440px]">
          {/* Heading — one eyebrow, one line, one sub. No marketing wall. */}
          <header className="mb-8 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-prodet-blue">
              Espace client
            </p>
            <h1 className="mt-2.5 text-[28px] font-semibold leading-[1.15] text-prodet-text">
              Accédez à votre espace Prodet
            </h1>
            <p className="mx-auto mt-3 max-w-[320px] text-[14px] leading-6 text-muted-foreground">
              Connexion sans mot de passe, réservée aux comptes professionnels validés.
            </p>
          </header>

          {/* Single focused card — login is primary, access request is the
              clearly separated secondary path. */}
          <div className="rounded-xl border border-border bg-card p-7 shadow-[0_1px_2px_rgba(6,53,97,0.04),0_20px_40px_-24px_rgba(6,53,97,0.22)]">
            <form action={requestClientMagicLink} className="space-y-3.5">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="next" value={`/${locale}/client`} />
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-medium text-prodet-text">
                  Email professionnel
                </span>
                <Input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="nom@societe.tn"
                />
              </label>
              <Button type="submit" size="lg" className="w-full">
                Recevoir le lien de connexion
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </form>

            {sent === '1' ? (
              <p
                role="status"
                className="mt-4 flex items-start gap-2 rounded-md border border-prodet-green/20 bg-prodet-green/10 px-3 py-2.5 text-[12px] leading-5 text-prodet-green"
              >
                <MailCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>
                  Si cet email dispose d&apos;un accès activé, un lien de connexion arrive sous peu
                  (pensez aux indésirables).
                </span>
              </p>
            ) : null}

            {error ? (
              <p
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-[12px] leading-5 text-destructive"
              >
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>{loginErrorMessage(error)}</span>
              </p>
            ) : null}

            {/* Divider */}
            <div className="my-6 flex items-center gap-3" aria-hidden>
              <span className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                ou
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            {/* Secondary path — request access */}
            <div className="text-center">
              <p className="text-[13px] text-muted-foreground">Pas encore client&nbsp;?</p>
              <Button asChild variant="neutral" size="lg" className="mt-2.5 w-full">
                <Link href="/devenir-client">Demander un accès</Link>
              </Button>
            </div>
          </div>

          {/* Trust line */}
          <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-prodet-blue" aria-hidden />
            Accès validé par Prodet · Aucun mot de passe à mémoriser
          </p>
        </div>
      </section>
    </div>
  );
}

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
      return 'Impossible d’envoyer le lien pour le moment.';
  }
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
