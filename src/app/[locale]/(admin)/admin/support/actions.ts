'use server';

import { assertRole } from '@/features/admin/auth';
import { adminReply, setTicketStatus } from '@/features/admin/tickets';

export async function adminReplyAction(ticketId: string, body: string) {
  const session = await assertRole(['owner', 'admin', 'operator']);
  return adminReply({
    ticketId,
    body,
    actorUserId: session.appUser?.id ?? null,
    authorName: session.appUser?.fullName || 'Prodet',
  });
}

export async function setTicketStatusAction(input: { ticketId: string; status: 'open' | 'closed' }) {
  await assertRole(['owner', 'admin', 'operator']);
  await setTicketStatus(input.ticketId, input.status);
  return { ok: true };
}
