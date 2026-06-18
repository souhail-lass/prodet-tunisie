import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ArrowRight, MailCheck, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Link, isLocale } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { requestClientMagicLink } from '@/features/client-auth/login-actions';
import { requireClientPortalAccess } from '@/features/client-portal/auth';

// Per-user by nature (session check + redirect). Must never be prerendered:
// the try/catch below would swallow the static-bailout signal cookies() throws
// during build and bake a form that ignores existing sessions.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Connexion espace client Prodet',
    description: 'Connexion par lien magique pour les clients Prodet invités.',
    robots: { index: false, follow: false },
  };
}

type PageSearchParams = Record<string, string | string[] | undefined>;

export default async function ClientLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<PageSearchParams>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect('/fr/connexion-client');

  const rawSearchParams = searchParams ? await searchParams : {};
  const error = firstParam(rawSearchParams.error);
  const sent = firstParam(rawSearchParams.sent);
  const next = sanitizeNext(locale, firstParam(rawSearchParams.next));

  // Returning client with a still-valid session: skip the form entirely and
  // go straight to the portal. The magic link is only for the FIRST login on
  // a device (or after sign-out) — never a per-visit requirement.
  let alreadySignedIn = false;
  try {
    await requireClientPortalAccess();
    alreadySignedIn = true;
  } catch {
    // No valid session (or no activated portal access) — show the form.
  }
  if (alreadySignedIn) redirect(next);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-prodet-wash px-5 py-16">
      <div className="w-full max-w-[440px]">
        {/* Heading — mirrors /espace-client for a consistent entry point. */}
        <header className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-prodet-blue">
            Espace client
          </p>
          <h1 className="mt-2.5 text-[28px] font-semibold leading-[1.15] text-prodet-text">
            Connexion à votre espace
          </h1>
          <p className="mx-auto mt-3 max-w-[320px] text-[14px] leading-6 text-muted-foreground">
            Connexion sans mot de passe, réservée aux comptes professionnels validés.
          </p>
        </header>

        <div className="rounded-xl border border-border bg-card p-7 shadow-[0_1px_2px_rgba(6,53,97,0.04),0_20px_40px_-24px_rgba(6,53,97,0.22)]">
          <form action={requestClientMagicLink} className="space-y-3.5">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="next" value={next} />
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
              <span>Lien envoyé. Vérifiez votre boîte mail (pensez aux courriers indésirables).</span>
            </p>
          ) : null}

          {error ? (
            <p
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-[12px] leading-5 text-destructive"
            >
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>{clientLoginErrorMessage(error)}</span>
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

        <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-prodet-blue" aria-hidden />
          Accès validé par Prodet · Aucun mot de passe à mémoriser
        </p>
      </div>
    </main>
  );
}

function clientLoginErrorMessage(error: string): string {
  switch (error) {
    case 'invalid':
      return "L'adresse email n'est pas valide.";
    case 'not-activated':
      return "Cet email n'a pas encore d'accès client activé par Prodet.";
    case 'config':
      return "La connexion client n'est pas configurée côté serveur.";
    case 'failed':
      return "Impossible d'envoyer le lien de connexion pour le moment.";
    case 'missing-code':
    case 'callback':
      return "Le lien magique n'a pas pu être validé. Demandez un nouveau lien.";
    default:
      return 'Connexion impossible pour le moment.';
  }
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function sanitizeNext(locale: 'fr' | 'ar' | 'en', value?: string): string {
  if (!value) return `/${locale}/client`;

  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith(`/${locale}/client`) && !decoded.startsWith('//')) {
      return decoded;
    }
  } catch {
    // Fall through to default.
  }

  if (value.startsWith(`/${locale}/client`) && !value.startsWith('//')) return value;

  return `/${locale}/client`;
}
