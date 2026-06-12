import 'server-only';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';

export type AdminOverview = {
  activeClients: number;
  openTickets: number;
  pendingOrders: number;
  visibleProducts: number;
  /** Open support tickets to action, newest first. */
  tickets: { id: string; subject: string; customerName: string | null; dateLabel: string; awaitingProdet: boolean }[];
  /** Portal orders awaiting review. */
  orders: { id: string; reference: string; customerName: string | null; dateLabel: string }[];
  /** Recently active (logged-in) clients. */
  activeNow: { name: string; email: string | null; lastSeenLabel: string }[];
};

const dt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Africa/Tunis' });
const dtDay = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeZone: 'Africa/Tunis' });

export async function getAdminOverview(): Promise<AdminOverview> {
  const { db, schema } = await import('@/db/client');

  const [counts] = await db
    .select({
      activeClients: sql<number>`(select count(*) from app_user where role = 'customer_user' and is_active)`,
      openTickets: sql<number>`(select count(*) from support_ticket where status = 'open')`,
      pendingOrders: sql<number>`(select count(*) from order_draft where source = 'portal' and status = 'review' and deleted_at is null)`,
      visibleProducts: sql<number>`(select count(*) from catalogue_product where not hidden)`,
    })
    .from(sql`(select 1) as _`);

  const tickets = await db
    .select({
      id: schema.supportTicket.id,
      subject: schema.supportTicket.subject,
      customerName: schema.customer.name,
      lastMessageAt: schema.supportTicket.lastMessageAt,
      lastAuthorRole: schema.supportTicket.lastAuthorRole,
    })
    .from(schema.supportTicket)
    .leftJoin(schema.customer, eq(schema.customer.id, schema.supportTicket.customerId))
    .where(eq(schema.supportTicket.status, 'open'))
    .orderBy(desc(schema.supportTicket.lastMessageAt))
    .limit(6);

  const orders = await db
    .select({
      id: schema.orderDraft.id,
      reference: schema.orderDraft.referenceCode,
      customerName: schema.customer.name,
      createdAt: schema.orderDraft.createdAt,
    })
    .from(schema.orderDraft)
    .leftJoin(schema.customer, eq(schema.customer.id, schema.orderDraft.customerId))
    .where(and(eq(schema.orderDraft.source, 'portal'), eq(schema.orderDraft.status, 'review'), isNull(schema.orderDraft.deletedAt)))
    .orderBy(desc(schema.orderDraft.createdAt))
    .limit(6);

  const activeNow = await db
    .select({
      name: schema.customer.name,
      email: schema.customer.email,
      lastSeenAt: schema.user.lastSeenAt,
    })
    .from(schema.user)
    .innerJoin(schema.userCustomer, eq(schema.userCustomer.userId, schema.user.id))
    .innerJoin(schema.customer, eq(schema.customer.id, schema.userCustomer.customerId))
    .where(and(eq(schema.user.role, 'customer_user'), sql`${schema.user.lastSeenAt} is not null`))
    .orderBy(desc(schema.user.lastSeenAt))
    .limit(6);

  return {
    activeClients: Number(counts?.activeClients ?? 0),
    openTickets: Number(counts?.openTickets ?? 0),
    pendingOrders: Number(counts?.pendingOrders ?? 0),
    visibleProducts: Number(counts?.visibleProducts ?? 0),
    tickets: tickets.map((t) => ({
      id: t.id,
      subject: t.subject,
      customerName: t.customerName,
      dateLabel: dt.format(t.lastMessageAt),
      awaitingProdet: t.lastAuthorRole === 'client',
    })),
    orders: orders.map((o) => ({
      id: o.id,
      reference: o.reference,
      customerName: o.customerName,
      dateLabel: dt.format(o.createdAt),
    })),
    activeNow: activeNow.map((a) => ({
      name: a.name,
      email: a.email,
      lastSeenLabel: a.lastSeenAt ? dtDay.format(a.lastSeenAt) : '—',
    })),
  };
}
