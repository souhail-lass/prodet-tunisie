'use client';

import { useActionState, useRef, useState, type FormEvent } from 'react';
import { AlertCircle, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { ConfirmDialog } from '@/components/ds';
import {
  updatePortalRequestStatus,
  type PortalRequestStatusActionResult,
} from '@/features/admin/portal-request-actions';

type AdminPortalRequestStatus = 'parsing' | 'review' | 'approved' | 'exported' | 'rejected';

const statusLabels: Record<AdminPortalRequestStatus, string> = {
  parsing: 'Brouillon',
  review: 'À vérifier',
  approved: 'Confirmée',
  exported: 'Clôturée',
  rejected: 'Annulée/refusée',
};

const initialState: PortalRequestStatusActionResult = {
  ok: false,
};

export function PortalRequestStatusActions({
  locale,
  requestId,
  status,
}: {
  locale: 'fr' | 'en';
  requestId: string;
  status: AdminPortalRequestStatus;
}) {
  const [state, formAction, isPending] = useActionState(
    updatePortalRequestStatus,
    initialState,
  );
  const [confirming, setConfirming] = useState<{ status: string; message: string } | null>(null);
  const confirmedRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const submitterRef = useRef<HTMLElement | null>(null);

  const CONFIRM_MESSAGES: Record<string, string> = {
    approved: 'Confirmer cette demande pour traitement interne ? Aucun document Swiver ne sera créé.',
    rejected: 'Annuler ou refuser cette demande portail ?',
  };

  function confirmStatusChange(event: FormEvent<HTMLFormElement>) {
    if (confirmedRef.current) {
      confirmedRef.current = false;
      return;
    }
    const nativeEvent = event.nativeEvent as SubmitEvent;
    const submitter = nativeEvent.submitter;
    const nextStatus =
      submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement
        ? submitter.value
        : null;
    if (nextStatus && CONFIRM_MESSAGES[nextStatus]) {
      event.preventDefault();
      submitterRef.current = submitter;
      setConfirming({ status: nextStatus, message: CONFIRM_MESSAGES[nextStatus] });
    }
  }

  function proceed() {
    setConfirming(null);
    confirmedRef.current = true;
    const submitter = submitterRef.current;
    if (submitter instanceof HTMLButtonElement) formRef.current?.requestSubmit(submitter);
    else formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} action={formAction} onSubmit={confirmStatusChange} className="panel">
      <input type="hidden" name="requestId" value={requestId} />
      <input type="hidden" name="locale" value={locale} />

      <div className="panel__head" style={{ marginBottom: 12 }}>
        <div>
          <h2 className="panel__title">Revue Prodet</h2>
          <p className="panel__sub">Statut actuel : {statusLabels[status]}</p>
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

      <div style={{ display: 'grid', gap: 10 }}>
        <button
          type="submit"
          name="nextStatus"
          value="approved"
          disabled={isPending || status === 'approved'}
          className="pds-btn pds-btn--success pds-btn--md pds-btn--block"
        >
          <CheckCircle2 size={16} />
          <span>Confirmer pour traitement</span>
        </button>
        <button
          type="submit"
          name="nextStatus"
          value="review"
          disabled={isPending || status === 'review'}
          className="pds-btn pds-btn--outline pds-btn--md pds-btn--block"
        >
          <Clock3 size={16} />
          <span>Marquer à vérifier</span>
        </button>
        <button
          type="submit"
          name="nextStatus"
          value="rejected"
          disabled={isPending || status === 'rejected'}
          className="pds-btn pds-btn--ghost pds-btn--md pds-btn--block"
          style={{ color: 'var(--color-danger)' }}
        >
          <XCircle size={16} />
          <span>Annuler / refuser</span>
        </button>
      </div>

      <p className="admin-detail__hint">
        Ces actions changent uniquement le statut interne de la demande. Elles ne créent aucun
        devis, facture, BL ou document Swiver.
      </p>

      <ConfirmDialog
        open={confirming != null}
        title={confirming?.status === 'rejected' ? 'Refuser la demande ?' : 'Confirmer la demande ?'}
        message={confirming?.message ?? ''}
        confirmLabel={confirming?.status === 'rejected' ? 'Refuser' : 'Confirmer'}
        cancelLabel="Retour"
        danger={confirming?.status === 'rejected'}
        pending={isPending}
        onConfirm={proceed}
        onClose={() => setConfirming(null)}
      />
    </form>
  );
}
