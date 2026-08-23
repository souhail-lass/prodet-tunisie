'use client';

import { useActionState, useRef, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  HelpCircle,
  Link2,
  Send,
  ShieldOff,
  XCircle,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ds';
import {
  reviewClientAccessRequest,
  revokePortalInvite,
  sendPortalInvite,
  type ClientAccessReviewResult,
  type PortalInviteActionResult,
} from '@/features/client-access/admin-actions';
import type {
  AccessRequestStatus,
  PortalInviteStatus,
} from '@/features/client-access/admin-queries';

const reviewInitial: ClientAccessReviewResult = { ok: false };
const inviteInitial: PortalInviteActionResult = { ok: false };

const STATUS_LABEL: Record<AccessRequestStatus, string> = {
  new: 'Nouvelle',
  reviewing: 'En cours de revue',
  approved: 'Approuvée',
  rejected: 'Refusée',
  needs_info: 'Infos manquantes',
};

const CONFIRM: Record<string, { title: string; message: string; label: string; danger: boolean }> = {
  approved: {
    title: 'Approuver la demande ?',
    message:
      'Approuver prépare une invitation portail pour cette société. Aucun email n’est envoyé à ce stade — vous l’enverrez ensuite depuis « Invitation portail ».',
    label: 'Approuver',
    danger: false,
  },
  rejected: {
    title: 'Refuser la demande ?',
    message: 'La demande sera marquée comme refusée. Aucun accès ne sera créé.',
    label: 'Refuser',
    danger: true,
  },
};

export function AccessRequestReviewActions({
  locale,
  requestId,
  status,
  reviewerNote,
  invite,
  email,
}: {
  locale: 'fr' | 'en';
  requestId: string;
  status: AccessRequestStatus;
  reviewerNote: string | null;
  invite: { id: string; status: PortalInviteStatus; expiresAt: string | null } | null;
  email: string;
}) {
  const [reviewState, reviewAction, reviewPending] = useActionState(
    reviewClientAccessRequest,
    reviewInitial,
  );
  const [confirming, setConfirming] = useState<string | null>(null);
  const confirmedRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const submitterRef = useRef<HTMLElement | null>(null);

  function guard(event: FormEvent<HTMLFormElement>) {
    if (confirmedRef.current) {
      confirmedRef.current = false;
      return;
    }
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const intent =
      submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement
        ? submitter.value
        : null;
    if (intent && CONFIRM[intent]) {
      event.preventDefault();
      submitterRef.current = submitter;
      setConfirming(intent);
    }
  }

  function proceed() {
    setConfirming(null);
    confirmedRef.current = true;
    const submitter = submitterRef.current;
    if (submitter instanceof HTMLButtonElement) formRef.current?.requestSubmit(submitter);
    else formRef.current?.requestSubmit();
  }

  const confirmCfg = confirming ? CONFIRM[confirming] : null;

  return (
    <>
      <form ref={formRef} action={reviewAction} onSubmit={guard} className="panel">
        <input type="hidden" name="requestId" value={requestId} />
        <input type="hidden" name="locale" value={locale} />

        <div className="panel__head" style={{ marginBottom: 12 }}>
          <div>
            <h2 className="panel__title">Revue Prodet</h2>
            <p className="panel__sub">Statut actuel : {STATUS_LABEL[status]}</p>
          </div>
        </div>

        {reviewState.formError ? (
          <p role="alert" className="admin-alert admin-alert--danger">
            <AlertCircle size={15} />
            {reviewState.formError}
          </p>
        ) : null}
        {reviewState.ok && reviewState.message ? (
          <p role="status" className="admin-alert admin-alert--success">
            <CheckCircle2 size={15} />
            {reviewState.message}
          </p>
        ) : null}

        <label htmlFor="reviewerNote" className="admin-fact__label" style={{ marginBottom: 6 }}>
          Note interne
        </label>
        <textarea
          id="reviewerNote"
          name="reviewerNote"
          rows={3}
          defaultValue={reviewerNote ?? ''}
          placeholder="Contexte, vérification Swiver, points à confirmer…"
          className="pds-textarea"
          style={{ minHeight: 76, marginBottom: 12 }}
        />

        <div style={{ display: 'grid', gap: 10 }}>
          <button
            type="submit"
            name="intent"
            value="approved"
            disabled={reviewPending || status === 'approved'}
            className="pds-btn pds-btn--success pds-btn--md pds-btn--block"
          >
            <CheckCircle2 size={16} />
            <span>Approuver la demande</span>
          </button>
          <button
            type="submit"
            name="intent"
            value="reviewing"
            disabled={reviewPending || status === 'reviewing'}
            className="pds-btn pds-btn--outline pds-btn--md pds-btn--block"
          >
            <Clock3 size={16} />
            <span>Marquer en revue</span>
          </button>
          <button
            type="submit"
            name="intent"
            value="needs_info"
            disabled={reviewPending || status === 'needs_info'}
            className="pds-btn pds-btn--outline pds-btn--md pds-btn--block"
          >
            <HelpCircle size={16} />
            <span>Demander des infos</span>
          </button>
          <button
            type="submit"
            name="intent"
            value="save_note"
            disabled={reviewPending}
            className="pds-btn pds-btn--ghost pds-btn--md pds-btn--block"
          >
            <span>Enregistrer la note seule</span>
          </button>
          <button
            type="submit"
            name="intent"
            value="rejected"
            disabled={reviewPending || status === 'rejected'}
            className="pds-btn pds-btn--ghost pds-btn--md pds-btn--block"
            style={{ color: 'var(--color-danger)' }}
          >
            <XCircle size={16} />
            <span>Refuser</span>
          </button>
        </div>

        <p className="admin-detail__hint">
          Approuver prépare l’invitation. L’accès n’est créé qu’une fois l’invitation envoyée et
          activée par le client.
        </p>
      </form>

      <InvitePanel locale={locale} requestId={requestId} invite={invite} email={email} />

      <ConfirmDialog
        open={confirmCfg != null}
        title={confirmCfg?.title ?? ''}
        message={confirmCfg?.message ?? ''}
        confirmLabel={confirmCfg?.label ?? 'Confirmer'}
        cancelLabel="Retour"
        danger={confirmCfg?.danger ?? false}
        pending={reviewPending}
        onConfirm={proceed}
        onClose={() => setConfirming(null)}
      />
    </>
  );
}

/**
 * Invitation lifecycle. Separate from the review form because it targets a
 * different server action and only exists once the request is approved.
 */
function InvitePanel({
  locale,
  requestId,
  invite,
  email,
}: {
  locale: 'fr' | 'en';
  requestId: string;
  invite: { id: string; status: PortalInviteStatus; expiresAt: string | null } | null;
  email: string;
}) {
  const [sendState, sendAction, sendPending] = useActionState(sendPortalInvite, inviteInitial);
  const [revokeState, revokeAction, revokePending] = useActionState(
    revokePortalInvite,
    inviteInitial,
  );
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const revokeFormRef = useRef<HTMLFormElement>(null);

  if (!invite) {
    return (
      <section className="panel">
        <div className="panel__head" style={{ marginBottom: 8 }}>
          <div>
            <h2 className="panel__title">Invitation portail</h2>
            <p className="panel__sub">Disponible après approbation</p>
          </div>
        </div>
        <p className="admin-detail__hint" style={{ marginTop: 0 }}>
          Approuvez la demande pour préparer une invitation. Le client recevra un lien
          d’activation à usage unique.
        </p>
      </section>
    );
  }

  const state = sendState.ok || sendState.formError ? sendState : revokeState;
  const alreadyAccepted = invite.status === 'accepted';
  const revoked = invite.status === 'revoked';
  const resend = invite.status === 'sent' || invite.status === 'expired';

  return (
    <section className="panel">
      <div className="panel__head" style={{ marginBottom: 12 }}>
        <div>
          <h2 className="panel__title">Invitation portail</h2>
          <p className="panel__sub">{email}</p>
        </div>
      </div>

      {state.formError ? (
        <p role="alert" className="admin-alert admin-alert--danger">
          <AlertCircle size={15} />
          {state.formError}
        </p>
      ) : null}
      {state.ok && state.message ? (
        <p role="status" className="admin-alert admin-alert--success">
          <CheckCircle2 size={15} />
          {state.message}
        </p>
      ) : null}

      {sendState.emailDelivery && sendState.emailDelivery !== 'sent' ? (
        <p role="alert" className="admin-alert admin-alert--danger">
          <AlertCircle size={15} />
          L’email n’est pas parti ({sendState.emailDelivery}). Transmettez le lien ci-dessous
          manuellement.
        </p>
      ) : null}

      {sendState.activationLink ? (
        <div className="admin-note" style={{ marginBottom: 12 }}>
          <span className="admin-fact__label">
            <Link2 size={13} /> Lien d’activation (usage unique)
          </span>
          <p style={{ fontSize: 'var(--text-xs)', wordBreak: 'break-all' }}>
            {sendState.activationLink}
          </p>
        </div>
      ) : null}

      {alreadyAccepted ? (
        <p className="admin-detail__hint" style={{ marginTop: 0 }}>
          Invitation déjà activée — le client a son accès au portail.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          <form action={sendAction}>
            <input type="hidden" name="inviteId" value={invite.id} />
            <input type="hidden" name="requestId" value={requestId} />
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              disabled={sendPending || revoked}
              className="pds-btn pds-btn--primary pds-btn--md pds-btn--block"
            >
              <Send size={16} />
              <span>{resend ? 'Renvoyer l’invitation' : 'Envoyer l’invitation'}</span>
            </button>
          </form>

          <form ref={revokeFormRef} action={revokeAction}>
            <input type="hidden" name="inviteId" value={invite.id} />
            <input type="hidden" name="requestId" value={requestId} />
            <input type="hidden" name="locale" value={locale} />
            <button
              type="button"
              disabled={revokePending || revoked}
              onClick={() => setConfirmRevoke(true)}
              className="pds-btn pds-btn--ghost pds-btn--md pds-btn--block"
              style={{ color: 'var(--color-danger)' }}
            >
              <ShieldOff size={16} />
              <span>Révoquer l’invitation</span>
            </button>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={confirmRevoke}
        title="Révoquer l’invitation ?"
        message="Le lien d’activation cessera immédiatement de fonctionner. Vous pourrez en préparer un nouveau ensuite."
        confirmLabel="Révoquer"
        cancelLabel="Retour"
        danger
        pending={revokePending}
        onConfirm={() => {
          setConfirmRevoke(false);
          revokeFormRef.current?.requestSubmit();
        }}
        onClose={() => setConfirmRevoke(false)}
      />
    </section>
  );
}
