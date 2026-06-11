import 'server-only';
import { asc, desc, eq } from 'drizzle-orm';
import {
  sanitizeIncomingAttachments,
  viewAttachments,
  type TicketAttachment,
  type TicketAttachmentView,
} from '@/features/support/attachments';

export type AdminTicketSummary = {
  id: string;
  subject: string;
  status: string;
  lastAuthorRole: string;
  lastMessageAt: Date;
  customerName: string | null;
};

export type AdminTicketDetail = {
  id: string;
  subject: string;
  status: string;
  customerName: string | null;
  messages: {
    id: string;
    authorRole: string;
    authorName: string | null;
    body: string;
    attachments: TicketAttachmentView[];
    createdAt: Date;
  }[];
};

export async function listAllTickets(): Promise<AdminTicketSummary[]> {
  const { db, schema } = await import('@/db/client');
  return db
    .select({
      id: schema.supportTicket.id,
      subject: schema.supportTicket.subject,
      status: schema.supportTicket.status,
      lastAuthorRole: schema.supportTicket.lastAuthorRole,
      lastMessageAt: schema.supportTicket.lastMessageAt,
      customerName: schema.customer.name,
    })
    .from(schema.supportTicket)
    .leftJoin(schema.customer, eq(schema.customer.id, schema.supportTicket.customerId))
    .orderBy(desc(schema.supportTicket.lastMessageAt))
    .limit(200);
}

export async function getAdminTicket(ticketId: string): Promise<AdminTicketDetail | null> {
  const { db, schema } = await import('@/db/client');
  const [ticket] = await db
    .select({
      id: schema.supportTicket.id,
      subject: schema.supportTicket.subject,
      status: schema.supportTicket.status,
      customerName: schema.customer.name,
    })
    .from(schema.supportTicket)
    .leftJoin(schema.customer, eq(schema.customer.id, schema.supportTicket.customerId))
    .where(eq(schema.supportTicket.id, ticketId))
    .limit(1);
  if (!ticket) return null;
  const rows = await db
    .select({
      id: schema.ticketMessage.id,
      authorRole: schema.ticketMessage.authorRole,
      authorName: schema.ticketMessage.authorName,
      body: schema.ticketMessage.body,
      attachments: schema.ticketMessage.attachments,
      createdAt: schema.ticketMessage.createdAt,
    })
    .from(schema.ticketMessage)
    .where(eq(schema.ticketMessage.ticketId, ticket.id))
    .orderBy(asc(schema.ticketMessage.createdAt));
  const messages = rows.map((m) => ({ ...m, attachments: viewAttachments(m.id, m.attachments) }));
  return { ...ticket, messages };
}

export async function adminReply(input: {
  ticketId: string;
  body: string;
  attachments?: TicketAttachment[];
  actorUserId?: string | null;
  authorName?: string | null;
}): Promise<{ ok: boolean }> {
  const body = input.body.trim();
  const attachments = sanitizeIncomingAttachments(input.attachments ?? []);
  if (!body && attachments.length === 0) return { ok: false };
  const { db, schema } = await import('@/db/client');
  const now = new Date();
  await db.insert(schema.ticketMessage).values({
    ticketId: input.ticketId,
    authorUserId: input.actorUserId ?? null,
    authorRole: 'admin',
    authorName: input.authorName ?? 'Prodet',
    body,
    attachments,
  });
  await db
    .update(schema.supportTicket)
    .set({ status: 'open', lastAuthorRole: 'admin', lastMessageAt: now, updatedAt: now })
    .where(eq(schema.supportTicket.id, input.ticketId));
  return { ok: true };
}

export async function setTicketStatus(ticketId: string, status: 'open' | 'closed'): Promise<void> {
  const { db, schema } = await import('@/db/client');
  await db
    .update(schema.supportTicket)
    .set({ status, updatedAt: new Date() })
    .where(eq(schema.supportTicket.id, ticketId));
}
