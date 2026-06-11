'use server';

import { createMyTicket, replyMyTicket } from '@/features/client-portal/tickets';

export async function createTicketAction(input: { subject: string; body: string }) {
  return createMyTicket(input.subject, input.body);
}

export async function replyTicketAction(ticketId: string, body: string) {
  return replyMyTicket(ticketId, body);
}
