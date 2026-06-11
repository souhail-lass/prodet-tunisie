'use client';

import { useRef, useState, useTransition } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ds';
import { detachDocumentFromRequestAction } from '@/features/client-portal/documents/actions';
import type { Locale } from '@/i18n/routing';

export function RequestDocumentDetachForm({
  documentId,
  orderDraftId,
  locale,
}: {
  documentId: string;
  orderDraftId: string;
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
      action={detachDocumentFromRequestAction}
      onSubmit={handleSubmit}
      className="inline-flex"
    >
      <input type="hidden" name="documentId" value={documentId} />
      <input type="hidden" name="orderDraftId" value={orderDraftId} />
      <input type="hidden" name="locale" value={locale} />
      <Button
        type="submit"
        variant="ghost"
        size="xs"
        disabled={isPending}
        className="text-muted-foreground hover:bg-prodet-wash hover:text-destructive"
        aria-label="Détacher ce document"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
        Détacher
      </Button>

      <ConfirmDialog
        open={confirming}
        title="Détacher ce document ?"
        message="Le document restera disponible dans vos documents, mais ne sera plus lié à cette demande."
        confirmLabel="Détacher"
        cancelLabel="Garder"
        pending={isPending}
        onConfirm={proceed}
        onClose={() => setConfirming(false)}
      />
    </form>
  );
}
