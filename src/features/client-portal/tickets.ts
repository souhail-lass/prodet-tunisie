import 'server-only';
import { and, asc, desc, eq } from 'drizzle-orm';
import { requireClientPortalAccess } from './auth';

export type TicketSummary = {
  id: string;
  subject: string;
  status: string;
  lastAuthorRole: string;
  lastMessageAt: Date;
};

export type TicketMessageView = {
  id: string;
  authorRole: string;
  authorName: string | null;
  body: string;
  createdAt: Date;
};

export type TicketDetail = {
  id: string;
  subject: string;
  status: string;
  messages: TicketMessageView[];
};

export async function listMyTickets(): Promise<TicketSummary[]> {
  const access = await requireClientPortalAccess();
  const { db, schema } = await import('@/db/client');
  return db
    .select({
      id: schema.supportTicket.id,
      subject: schema.supportTicket.subject,
      status: schema.supportTicket.status,
      lastAuthorRole: schema.supportTicket.lastAuthorRole,
      lastMessageAt: schema.supportTicket.lastMessageAt,
    })
    .from(schema.supportTicket)
    .where(eq(schema.supportTicket.customerId, access.customer.id))
    .orderBy(desc(schema.supportTicket.lastMessageAt));
}

export async function getMyTicket(ticketId: string): Promise<TicketDetail | null> {
  const access = await requireClientPortalAccess();
  const { db, schema } = await import('@/db/client');
  const [ticket] = await db
    .select()
    .from(schema.supportTicket)
    .where(and(eq(schema.supportTicket.id, ticketId), eq(schema.supportTicket.customerId, access.customer.id)))
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
  return { id: ticket.id, subject: ticket.subject, status: ticket.status, messages };
}

export async function createMyTicket(subject: string, body: string): Promise<{ ok: boolean; id?: string }> {
  const access = await requireClientPortalAccess();
  const s = subject.trim();
  const b = body.trim();
  if (!s || !b) return { ok: false };
  const { db, schema } = await import('@/db/client');
  const now = new Date();
  const name = access.appUser.fullName || access.customer.name;
  return db.transaction(async (tx) => {
    const [ticket] = await tx
      .insert(schema.supportTicket)
      .values({
        customerId: access.customer.id,
        openedByUserId: access.appUser.id,
        subject: s.slice(0, 160),
        status: 'open',
        lastAuthorRole: 'client',
        lastMessageAt: now,
      })
      .returning({ id: schema.supportTicket.id });
    if (!ticket) return { ok: false };
    await tx.insert(schema.ticketMessage).values({
      ticketId: ticket.id,
      authorUserId: access.appUser.id,
      authorRole: 'client',
      authorName: name,
      body: b,
    });
    return { ok: true, id: ticket.id };
  });
}

export async function replyMyTicket(ticketId: string, body: string): Promise<{ ok: boolean }> {
  const access = await requireClientPortalAccess();
  const b = body.trim();
  if (!b) return { ok: false };
  const { db, schema } = await import('@/db/client');
  const [ticket] = await db
    .select({ id: schema.supportTicket.id })
    .from(schema.supportTicket)
    .where(and(eq(schema.supportTicket.id, ticketId), eq(schema.supportTicket.customerId, access.customer.id)))
    .limit(1);
  if (!ticket) return { ok: false };
  const now = new Date();
  await db.insert(schema.ticketMessage).values({
    ticketId: ticket.id,
    authorUserId: access.appUser.id,
    authorRole: 'client',
    authorName: access.appUser.fullName || access.customer.name,
    body: b,
  });
  await db
    .update(schema.supportTicket)
    .set({ status: 'open', lastAuthorRole: 'client', lastMessageAt: now, updatedAt: now })
    .where(eq(schema.supportTicket.id, ticket.id));
  return { ok: true };
}
