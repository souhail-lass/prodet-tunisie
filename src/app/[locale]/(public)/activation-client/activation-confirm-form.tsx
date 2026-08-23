'use client';

import { useActionState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, KeyRound, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/routing';
import {
  acceptPortalInvite,
  type AcceptInviteResult,
} from '@/features/client-access/activation-actions';
import { requestClientMagicLink } from '@/features/client-auth/login-actions';

const initialState: AcceptInviteResult = {
  ok: false,
};

export function ActivationConfirmForm({
  token,
  locale,
}: {
  token: string;
  locale: 'fr' | 'en';
}) {
  const [state, formAction, isPending] = useActionState(acceptPortalInvite, initialState);

  // Compte activé : on remplace tout par la confirmation. Le client n'a plus
  // rien à faire ici, la seule action utile est d'entrer dans le portail.
  if (state.accepted) {
    return (
      <div className="mt-6 rounded-sm border border-border bg-white p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-support/10 text-support">
          <CheckCircle2 className="h-6 w-6" aria-hidden />
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold leading-tight text-prodet-text">
          Votre compte est activé
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          Vous pouvez maintenant accéder à votre espace client Prodet : votre catalogue, vos
          produits habituels, vos demandes de devis, vos livraisons et vos documents.
        </p>
        <Button asChild variant="navy" size="lg" className="mt-6">
          <Link href="/connexion-client">
            Accéder à mon espace client
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          Vous recevrez un lien de connexion par email — aucun mot de passe à retenir.
        </p>
      </div>
    );
  }

  return (
    <>
      <form action={formAction} className="mt-6">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="locale" value={locale} />
        <Button type="submit" variant="navy" size="lg" disabled={isPending}>
          <KeyRound className="h-4 w-4" aria-hidden />
          {isPending ? 'Activation...' : 'Confirmer l’activation'}
        </Button>

        {state.formError ? (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-sm bg-red-50 px-3 py-2 text-sm leading-6 text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {state.formError}
          </p>
        ) : null}
      </form>

      {/* Lien périmé ou déjà utilisé : plutôt que d'obliger le client à
          redemander une invitation à Prodet, il récupère lui-même un lien de
          connexion. Son compte existe déjà dès la première activation. */}
      {state.formError ? (
        <form
          action={requestClientMagicLink}
          className="mt-6 rounded-sm border border-border bg-prodet-mist/40 p-5"
        >
          <input type="hidden" name="locale" value={locale} />
          <h3 className="text-sm font-semibold text-prodet-text">
            Lien expiré ou déjà utilisé ?
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Saisissez votre email professionnel : si un accès existe déjà, vous recevrez un lien
            de connexion immédiatement.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="vous@societe.tn"
              className="sm:flex-1"
            />
            <Button type="submit" variant="neutral" size="lg">
              <Mail className="h-4 w-4" aria-hidden />
              Recevoir un lien
            </Button>
          </div>
        </form>
      ) : null}
    </>
  );
}
