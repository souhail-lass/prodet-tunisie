import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getMyTicket } from '@/features/client-portal/tickets';
import { TicketThread } from '@/components/support/ticket-thread';
import { Link } from '@/i18n/routing';
import { replyTicketAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function ClientTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let ticket: Awaited<ReturnType<typeof getMyTicket>> = null;
  try {
    ticket = await getMyTicket(id);
  } catch {
    ticket = null;
  }
  if (!ticket) notFound();

  const reply = replyTicketAction.bind(null, ticket.id);

  return (
    <div className="dash" style={{ maxWidth: 760 }}>
      <Link href="/client/support" className="ghost-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <ArrowLeft size={15} /> Retour au support
      </Link>
      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">{ticket.subject}</h2>
          {ticket.status === 'closed' ? <span className="pds-badge">Clôturé</span> : null}
        </div>
        <TicketThread
          messages={ticket.messages}
          viewerRole="client"
          closed={ticket.status === 'closed'}
          onReply={reply}
        />
      </section>
    </div>
  );
}
