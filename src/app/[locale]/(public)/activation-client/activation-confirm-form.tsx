'use client';

import { useActionState, useEffect, useRef, type ReactNode } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import {
  acceptPortalInvite,
  type AcceptInviteResult,
} from '@/features/client-access/activation-actions';

const initialState: AcceptInviteResult = {
  ok: false,
};

/**
 * Active l'invitation dès l'arrivée sur la page — un seul clic depuis l'email.
 *
 * L'activation reste un POST (server action) auto-déclenché au montage, et non
 * un effet de bord du GET. C'est délibéré : les antivirus et scanners de liens
 * des messageries suivent les URL des emails, et consommeraient un jeton à
 * usage unique avant même que le client ne clique. Ils n'exécutent pas de JS,
 * donc ce déclenchement côté client les laisse de côté.
 */
export function ActivationConfirmForm({
  token,
  locale,
  fallback,
}: {
  token: string;
  locale: 'fr' | 'en';
  /** Bloc « recevoir un lien de connexion », rendu si l'activation échoue. */
  fallback: ReactNode;
}) {
  const [state, formAction, isPending] = useActionState(acceptPortalInvite, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    formRef.current?.requestSubmit();
  }, []);

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
      {/* Soumis automatiquement au montage ; sans JS, le bouton reste utilisable. */}
      <form ref={formRef} action={formAction} className="mt-6">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="locale" value={locale} />

        {state.formError ? null : (
          <p className="flex items-center gap-2 text-sm leading-6 text-muted-foreground">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
            Activation de votre accès…
          </p>
        )}

        <noscript>
          <Button type="submit" variant="navy" size="lg">
            Confirmer l’activation
          </Button>
        </noscript>

        {state.formError ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-sm bg-red-50 px-3 py-2 text-sm leading-6 text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {state.formError}
          </p>
        ) : null}
      </form>

      {/* L'activation a échoué (jeton consommé entre le chargement et l'envoi,
          ou expiré) : on propose la même issue que la page. */}
      {state.formError && !isPending ? fallback : null}
    </>
  );
}
