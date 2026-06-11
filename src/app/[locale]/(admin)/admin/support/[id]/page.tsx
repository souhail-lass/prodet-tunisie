import { notFound } from 'next/navigation';
import { ArrowLeft, Building2 } from 'lucide-react';
import { getAdminTicket } from '@/features/admin/tickets';
import { TicketThread } from '@/components/support/ticket-thread';
import { Link } from '@/i18n/routing';
import { adminReplyAction, uploadAdminTicketAttachmentAction } from '../actions';
import { CloseButton } from './close-button';

export const dynamic = 'force-dynamic';

export default async function AdminTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = await getAdminTicket(id);
  if (!ticket) notFound();

  const reply = adminReplyAction.bind(null, ticket.id);

  return (
    <div className="dash" style={{ maxWidth: 780 }}>
      <Link href="/admin/support" className="ghost-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <ArrowLeft size={15} /> Retour aux tickets
      </Link>
      <section className="panel">
        <div className="panel__head">
          <div>
            <h2 className="panel__title">{ticket.subject}</h2>
            <p className="panel__sub" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Building2 size={14} /> {ticket.customerName ?? 'Client'}
            </p>
          </div>
          <CloseButton ticketId={ticket.id} status={ticket.status} />
        </div>
        <TicketThread
          messages={ticket.messages}
          viewerRole="admin"
          closed={ticket.status === 'closed'}
          onReply={reply}
          onUpload={uploadAdminTicketAttachmentAction}
          poll
        />
      </section>
    </div>
  );
}
