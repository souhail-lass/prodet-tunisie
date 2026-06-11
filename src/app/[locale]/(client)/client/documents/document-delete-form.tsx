'use client';

import { useRef, useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ds';
import { deleteCustomerDocumentAction } from '@/features/client-portal/documents/actions';
import type { Locale } from '@/i18n/routing';

export function DocumentDeleteForm({
  documentId,
  locale,
}: {
  documentId: string;
  locale: Locale;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const confirmedRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (confirmedRef.current) {
      confirmedRef.current = false;
      return;
    }
    event.preventDefault();
    setConfirming(true);
  }

  function proceed() {
    setConfirming(false);
    confirmedRef.current = true;
    startTransition(() => formRef.current?.requestSubmit());
  }

  return (
    <form
      ref={formRef}
      action={deleteCustomerDocumentAction}
      onSubmit={handleSubmit}
      className="inline-flex"
    >
      <input type="hidden" name="documentId" value={documentId} />
      <input type="hidden" name="locale" value={locale} />
      <Button
        type="submit"
        variant="outline"
        size="xs"
        disabled={isPending}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        Supprimer
      </Button>

      <ConfirmDialog
        open={confirming}
        title="Supprimer ce document ?"
        message="Cette action ne peut pas être annulée depuis l’espace client."
        confirmLabel="Supprimer"
        cancelLabel="Garder"
        danger
        pending={isPending}
        onConfirm={proceed}
        onClose={() => setConfirming(false)}
      />
    </form>
  );
}
