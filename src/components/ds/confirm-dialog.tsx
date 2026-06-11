'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

export type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Destructive styling on the confirm button. */
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/**
 * Small in-app confirmation popup — replaces native `confirm()` (no more
 * "localhost says…"). Overlay click and Escape both dismiss; focus starts on
 * the safe (cancel) button.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  danger = false,
  pending = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="pds-confirm__overlay" onClick={onClose} role="presentation">
      <div
        className="pds-confirm"
        role="alertdialog"
        aria-modal="true"
        aria-label={title ?? message}
        onClick={(e) => e.stopPropagation()}
      >
        <span className={`pds-confirm__icon${danger ? ' pds-confirm__icon--danger' : ''}`}>
          <AlertTriangle size={20} />
        </span>
        {title ? <h3 className="pds-confirm__title">{title}</h3> : null}
        <p className="pds-confirm__message">{message}</p>
        <div className="pds-confirm__actions">
          <button ref={cancelRef} type="button" className="pds-btn pds-btn--ghost pds-btn--md" onClick={onClose}>
            <span>{cancelLabel}</span>
          </button>
          <button
            type="button"
            className={`pds-btn pds-btn--md ${danger ? 'pds-confirm__danger-btn' : 'pds-btn--primary'}`}
            onClick={onConfirm}
            disabled={pending}
          >
            <span>{pending ? '…' : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
