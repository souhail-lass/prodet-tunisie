import 'server-only';
import { asc, desc, eq } from 'drizzle-orm';

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
  const messages = await db
    .select({
      id: schema.ticketMessage.id,
      authorRole: schema.ticketMessage.authorRole,
      authorName: schema.ticketMessage.authorName,
      body: schema.ticketMessage.body,
      createdAt: schema.ticketMessage.createdAt,
    })
    .from(schema.ticketMessage)
    .where(eq(schema.ticketMessage.ticketId, ticket.id))
    .orderBy(asc(schema.ticketMessage.createdAt));
  return { ...ticket, messages };
}

export async function adminReply(input: {
  ticketId: string;
  body: string;
  actorUserId?: string | null;
  authorName?: string | null;
}): Promise<{ ok: boolean }> {
  const body = input.body.trim();
  if (!body) return { ok: false };
  const { db, schema } = await import('@/db/client');
  const now = new Date();
  await db.insert(schema.ticketMessage).values({
    ticketId: input.ticketId,
    authorUserId: input.actorUserId ?? null,
    authorRole: 'admin',
    authorName: input.authorName ?? 'Prodet',
    body,
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
