'use client';

import { useActionState, useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Inbox,
  Mail,
  MapPin,
  Phone,
  X,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ds';
import {
  decideAccessRequest,
  type AccessDecisionResult,
} from '@/features/client-access/admin-actions';
import type { AccessRequestStatus } from '@/features/client-access/admin-queries';

export type AccessRequestRow = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  sector: string;
  city: string;
  needType: string;
  reference: string | null;
  message: string | null;
  status: AccessRequestStatus;
  activated: boolean;
  invited: boolean;
  dateLabel: string;
};

const initialState: AccessDecisionResult = { ok: false };

export function AccessRequestsClient({
  requests,
  locale,
}: {
  requests: AccessRequestRow[];
  locale: 'fr' | 'en';
}) {
  const [state, formAction, isPending] = useActionState(decideAccessRequest, initialState);
  const [showHandled, setShowHandled] = useState(false);

  const pending = useMemo(
    () => requests.filter((r) => r.status === 'new' || r.status === 'reviewing'),
    [requests],
  );
  const handled = useMemo(
    () => requests.filter((r) => r.status !== 'new' && r.status !== 'reviewing'),
    [requests],
  );

  const visible = showHandled ? handled : pending;

  return (
    <div className="dash">
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
      {state.activationLink ? (
        <div className="admin-note">
          <span className="admin-fact__label">Lien d’activation à transmettre</span>
          <p style={{ fontSize: 'var(--text-xs)', wordBreak: 'break-all' }}>
            {state.activationLink}
          </p>
        </div>
      ) : null}

      <div className="acc-switch">
        <button
          type="button"
          className={`orders__tab${!showHandled ? ' is-active' : ''}`}
          onClick={() => setShowHandled(false)}
        >
          En attente{pending.length ? ` (${pending.length})` : ''}
        </button>
        <button
          type="button"
          className={`orders__tab${showHandled ? ' is-active' : ''}`}
          onClick={() => setShowHandled(true)}
        >
          Traitées{handled.length ? ` (${handled.length})` : ''}
        </button>
      </div>

      <div className="acc-list">
        {visible.map((r) => (
          <RequestCard
            key={r.id}
            request={r}
            locale={locale}
            formAction={formAction}
            isPending={isPending}
          />
        ))}

        {visible.length === 0 ? (
          <div className="admin-empty">
            <Inbox size={26} style={{ marginBottom: 8, opacity: 0.5 }} />
            <div>
              {showHandled ? 'Aucune demande traitée.' : 'Aucune demande en attente.'}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function RequestCard({
  request: r,
  locale,
  formAction,
  isPending,
}: {
  request: AccessRequestRow;
  locale: 'fr' | 'en';
  formAction: (payload: FormData) => void;
  isPending: boolean;
}) {
  const [confirming, setConfirming] = useState<'accept' | 'reject' | null>(null);

  function submit(intent: 'accept' | 'reject') {
    const data = new FormData();
    data.set('requestId', r.id);
    data.set('locale', locale);
    data.set('intent', intent);
    formAction(data);
    setConfirming(null);
  }

  return (
    <article className="acc-card">
      <header className="acc-card__head">
        <div style={{ minWidth: 0 }}>
          <h2 className="acc-card__title">{r.company}</h2>
          <p className="acc-card__sub">
            {r.name} · {r.dateLabel}
          </p>
        </div>
        {r.status === 'approved' ? (
          <span
            className="pds-badge pds-badge--sm"
            style={{ background: 'var(--prodet-green-tint)', color: 'var(--prodet-green)' }}
          >
            {r.activated ? 'Accès actif' : 'Invitation envoyée'}
          </span>
        ) : null}
        {r.status === 'rejected' ? (
          <span
            className="pds-badge pds-badge--sm"
            style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}
          >
            Refusée
          </span>
        ) : null}
      </header>

      <div className="acc-card__facts">
        <span>
          <Mail size={14} /> {r.email}
        </span>
        <span>
          <Phone size={14} /> {r.phone}
        </span>
        <span>
          <MapPin size={14} /> {r.city}
        </span>
        <span className="acc-card__muted">{r.sector}</span>
        <span className="acc-card__muted">{r.needType}</span>
        {r.reference ? <span className="acc-card__muted">Réf. {r.reference}</span> : null}
      </div>

      {r.message ? <pre className="acc-card__message">{r.message}</pre> : null}

      <footer className="acc-card__actions">
        {/* Une fois le client activé, renvoyer une invitation n'a plus de sens :
            il a déjà son accès, et un nouveau jeton ne ferait qu'embrouiller. */}
        {r.activated ? (
          <span className="acc-card__done">
            <CheckCircle2 size={15} /> Compte activé par le client
          </span>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() => setConfirming('accept')}
            className="pds-btn pds-btn--success pds-btn--md"
          >
            <Check size={16} />
            <span>{r.status === 'approved' ? 'Renvoyer l’invitation' : 'Accepter'}</span>
          </button>
        )}
        <button
          type="button"
          disabled={isPending || r.status === 'rejected' || r.activated}
          onClick={() => setConfirming('reject')}
          className="pds-btn pds-btn--ghost pds-btn--md"
          style={{ color: 'var(--color-danger)' }}
        >
          <X size={16} />
          <span>Refuser</span>
        </button>
      </footer>

      <ConfirmDialog
        open={confirming != null}
        title={confirming === 'reject' ? 'Refuser la demande ?' : 'Accorder l’accès ?'}
        message={
          confirming === 'reject'
            ? `La demande de ${r.company} sera refusée. Aucun accès ne sera créé.`
            : `${r.company} sera créé comme client dans Swiver, puis recevra un email d’activation à ${r.email} (lien valable 7 jours).`
        }
        confirmLabel={confirming === 'reject' ? 'Refuser' : 'Accepter'}
        cancelLabel="Retour"
        danger={confirming === 'reject'}
        pending={isPending}
        onConfirm={() => submit(confirming ?? 'accept')}
        onClose={() => setConfirming(null)}
      />
    </article>
  );
}
