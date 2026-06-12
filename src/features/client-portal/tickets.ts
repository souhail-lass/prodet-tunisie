import 'server-only';
import { after } from 'next/server';
import { and, asc, desc, eq } from 'drizzle-orm';
import { prodetNotificationEmail, sendEmail } from '@/lib/email';
import { requireClientPortalAccess } from './auth';
import {
  sanitizeIncomingAttachments,
  viewAttachments,
  type TicketAttachment,
  type TicketAttachmentView,
} from '@/features/support/attachments';

/** Best-effort alert to Prodet when a client opens or replies on a ticket. */
function notifyProdetSupport(subject: string, company: string, preview: string, replyTo?: string | null) {
  const to = prodetNotificationEmail();
  if (!to) return;
  after(async () => {
    await sendEmail({
      to,
      subject: `Support — ${company} : ${subject}`.slice(0, 120),
      replyTo: replyTo ?? undefined,
      text: [`Nouveau message support de ${company}.`, ``, `Sujet : ${subject}`, ``, preview].join('\n'),
    });
  });
}

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
  attachments: TicketAttachmentView[];
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
  const messages: TicketMessageView[] = rows.map((m) => ({
    ...m,
    attachments: viewAttachments(m.id, m.attachments),
  }));
  return { id: ticket.id, subject: ticket.subject, status: ticket.status, messages };
}

export async function createMyTicket(
  subject: string,
  body: string,
  attachments: TicketAttachment[] = [],
): Promise<{ ok: boolean; id?: string }> {
  const access = await requireClientPortalAccess();
  const s = subject.trim();
  const b = body.trim();
  const files = sanitizeIncomingAttachments(attachments);
  // A message needs either text or at least one attachment.
  if (!s || (!b && files.length === 0)) return { ok: false };
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
      attachments: files,
    });
    notifyProdetSupport(s, access.customer.name, b || `${files.length} pièce(s) jointe(s)`, access.appUser.email);
    return { ok: true, id: ticket.id };
  });
}

export async function replyMyTicket(
  ticketId: string,
  body: string,
  attachments: TicketAttachment[] = [],
): Promise<{ ok: boolean }> {
  const access = await requireClientPortalAccess();
  const b = body.trim();
  const files = sanitizeIncomingAttachments(attachments);
  if (!b && files.length === 0) return { ok: false };
  const { db, schema } = await import('@/db/client');
  const [ticket] = await db
    .select({ id: schema.supportTicket.id, subject: schema.supportTicket.subject })
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
    attachments: files,
  });
  notifyProdetSupport(ticket.subject, access.customer.name, b || `${files.length} pièce(s) jointe(s)`, access.appUser.email);
  await db
    .update(schema.supportTicket)
    .set({ status: 'open', lastAuthorRole: 'client', lastMessageAt: now, updatedAt: now })
    .where(eq(schema.supportTicket.id, ticket.id));
  return { ok: true };
}
