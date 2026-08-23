import type { Metadata } from 'next';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { AlertCircle, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link, isLocale } from '@/i18n/routing';
import {
  getPortalInviteActivationState,
  type ActivationState,
} from '@/features/client-access/activation-actions';
import { normalizeInviteToken } from '@/features/client-access/invite-token';
import { ActivationConfirmForm } from './activation-confirm-form';
import { MagicLinkFallback } from './magic-link-fallback';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Activation accès client Prodet',
    description: "Activation contrôlée d'une invitation client Prodet.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

type PageSearchParams = Record<string, string | string[] | undefined>;

export default async function ClientActivationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<PageSearchParams>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  await connection();

  const rawSearchParams = searchParams ? await searchParams : {};
  const rawToken = firstParam(rawSearchParams.token);
  const token = normalizeInviteToken(rawToken);
  const state = await getPortalInviteActivationState(rawToken);

  return (
    <div className="bg-prodet-wash">
      <section className="section-shell flex min-h-[72vh] items-center py-10 lg:py-14">
        <div className="mx-auto w-full max-w-2xl rounded-lg border border-border bg-white p-6 shadow-[0_24px_70px_-60px_rgba(8,41,78,0.55)] md:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-prodet-ink text-white">
              {state.status === 'valid' ? (
                <ShieldCheck className="h-5 w-5" aria-hidden />
              ) : state.status === 'accepted' ? (
                <CheckCircle2 className="h-5 w-5" aria-hidden />
              ) : (
                <AlertCircle className="h-5 w-5" aria-hidden />
              )}
            </span>
            <div>
              <p className="eyebrow-label">Invitation client</p>
              <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-prodet-text">
                {activationTitle(state)}
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {activationMessage(state, locale)}
              </p>
            </div>
          </div>

          {/* Déjà activé (le lien est à usage unique, donc c'est le cas normal
              d'une réouverture) : on propose d'abord d'entrer, pas de ressaisir
              un email. Si la session a expiré, le middleware renverra vers la
              connexion — et le bloc ci-dessous reste disponible. */}
          {state.status === 'accepted' ? (
            <div className="mt-6">
              <Button asChild variant="navy" size="lg">
                <Link href="/client">
                  Accéder à mon espace client
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          ) : null}

          {/* Lien mort : au lieu d'une impasse, le client redemande un lien. */}
          {state.status !== 'valid' ? (
            <MagicLinkFallback
              locale={locale}
              title={
                state.status === 'accepted'
                  ? 'Plus connecté sur cet appareil ?'
                  : 'Recevoir un lien de connexion'
              }
              body={
                state.status === 'accepted'
                  ? 'Saisissez votre email professionnel pour recevoir un lien de connexion.'
                  : 'Ce lien ne peut plus être utilisé. Si votre accès a déjà été ouvert, saisissez votre email professionnel pour recevoir un lien de connexion.'
              }
            />
          ) : null}

          {/* Jeton valide : l'activation se déclenche seule, sans second clic. */}
          {state.status === 'valid' && token ? (
            <ActivationConfirmForm
              token={token}
              locale={locale}
              fallback={
                <MagicLinkFallback
                  locale={locale}
                  title="Recevoir un lien de connexion"
                  body="Ce lien ne peut plus être utilisé. Si votre accès a déjà été ouvert, saisissez votre email professionnel pour recevoir un lien de connexion."
                />
              }
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}

function activationTitle(state: ActivationState): string {
  switch (state.status) {
    case 'valid':
      return 'Invitation valide';
    case 'accepted':
      return 'Invitation déjà acceptée';
    case 'expired':
      return 'Invitation expirée';
    case 'revoked':
      return 'Invitation révoquée';
    case 'missing':
      return 'Lien incomplet';
    case 'invalid':
      return 'Invitation invalide';
  }
}

function activationMessage(state: ActivationState, locale: string): string {
  switch (state.status) {
    case 'valid':
      return `Prodet a préparé une invitation contrôlée. Ce lien expire le ${formatDateTime(
        state.expiresAt,
        locale,
      )}.`;
    case 'accepted':
      return 'Cette invitation a déjà été acceptée. Utilisez la connexion client avec l’email invité.';
    case 'expired':
      return 'Ce lien a expiré. Contactez Prodet pour recevoir une nouvelle invitation.';
    case 'revoked':
      return 'Cette invitation a été révoquée par Prodet.';
    case 'missing':
      return "Le lien d'activation ne contient pas de token.";
    case 'invalid':
      return "Le lien d'activation n'est pas valide ou ne peut plus être utilisé.";
  }
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function formatDateTime(value: Date, locale: string): string {
  const formatterLocale = locale === 'en' ? 'en-GB' : 'fr-TN';
  return new Intl.DateTimeFormat(formatterLocale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}
