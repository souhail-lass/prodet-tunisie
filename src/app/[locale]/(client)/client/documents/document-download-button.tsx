'use client';

import { useState, useTransition } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCustomerDocumentSignedUrlAction } from '@/features/client-portal/documents/actions';

export function DocumentDownloadButton({ documentId }: { documentId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await getCustomerDocumentSignedUrlAction({ documentId });
      if (!result.ok) {
        setError('Lien indisponible.');
        return;
      }
      // Open in a new tab; the Storage signed URL respects the
      // `Content-Disposition: attachment` flag set by the server action.
      window.open(result.url, '_blank', 'noopener,noreferrer');
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="xs"
        onClick={handleClick}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <Download className="h-3.5 w-3.5" aria-hidden />
        )}
        Télécharger
      </Button>
      {error ? <span className="text-[11px] text-destructive">{error}</span> : null}
    </div>
  );
}
