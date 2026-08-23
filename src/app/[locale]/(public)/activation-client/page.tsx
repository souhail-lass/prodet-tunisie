import type { Metadata } from 'next';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { AlertCircle, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react';
import { isLocale } from '@/i18n/routing';
import {
  getPortalInviteActivationState,
  type ActivationState,
} from '@/features/client-access/activation-actions';
import { normalizeInviteToken } from '@/features/client-access/invite-token';
import { ActivationConfirmForm } from './activation-confirm-form';

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

          {state.status === 'valid' && token ? (
            <div className="mt-6 rounded-sm border border-border bg-prodet-wash p-4">
              <div className="flex items-start gap-3">
                <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <h2 className="font-display text-xl font-bold text-prodet-text">
                    Confirmer cette invitation
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Cette confirmation active l’identité client Prodet liée à cette invitation.
                    Vous pourrez ensuite demander un lien magique avec le même email.
                  </p>
                  <ActivationConfirmForm token={token} locale={locale} />
                </div>
              </div>
            </div>
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
