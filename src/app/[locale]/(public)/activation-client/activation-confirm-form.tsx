'use client';

import { useTranslations } from 'next-intl';

import { useActionState } from 'react';
import { AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import {
  acceptPortalInvite,
  type AcceptInviteResult,
} from '@/features/client-access/activation-actions';

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
  const tc = useTranslations('common.clientAccess');
  const [state, formAction, isPending] = useActionState(acceptPortalInvite, initialState);

  return (
    <form action={formAction} className="mt-6">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="locale" value={locale} />
      <Button type="submit" variant="navy" size="lg" disabled={isPending || state.accepted}>
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

      {state.accepted && state.message ? (
        <div className="mt-4 rounded-sm bg-support/10 px-3 py-2 text-sm leading-6 text-support">
          <p role="status" className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {state.message}
          </p>
          <Button asChild variant="neutral" size="sm" className="mt-3">
            <Link href="/connexion-client">{tc('continueToLogin')}</Link>
          </Button>
        </div>
      ) : null}
    </form>
  );
}
