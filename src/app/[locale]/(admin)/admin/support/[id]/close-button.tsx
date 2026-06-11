'use client';

import { useTransition } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { setTicketStatusAction } from '../actions';

export function CloseButton({ ticketId, status }: { ticketId: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const closed = status === 'closed';
  return (
    <button
      className="pds-btn pds-btn--outline pds-btn--sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await setTicketStatusAction({ ticketId, status: closed ? 'open' : 'closed' });
          router.refresh();
        })
      }
    >
      {closed ? (
        <>
          <RotateCcw size={14} /> <span>Rouvrir</span>
        </>
      ) : (
        <>
          <CheckCircle2 size={14} /> <span>Clôturer</span>
        </>
      )}
    </button>
  );
}
