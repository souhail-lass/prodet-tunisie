import 'server-only';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';

export type AdminOverview = {
  activeClients: number;
  openTickets: number;
  pendingAccessRequests: number;
  visibleProducts: number;
  /** Open support tickets to action, newest first. */
  tickets: { id: string; subject: string; customerName: string | null; dateLabel: string; awaitingProdet: boolean }[];
  /** Portal access requests awaiting a decision. */
  accessRequests: { id: string; company: string; name: string; dateLabel: string }[];
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
      pendingAccessRequests: sql<number>`(select count(*) from client_access_request where status in ('new','reviewing'))`,
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

  const accessRequests = await db
    .select({
      id: schema.clientAccessRequest.id,
      company: schema.clientAccessRequest.companyName,
      name: schema.clientAccessRequest.name,
      createdAt: schema.clientAccessRequest.createdAt,
    })
    .from(schema.clientAccessRequest)
    .where(inArray(schema.clientAccessRequest.status, ['new', 'reviewing']))
    .orderBy(desc(schema.clientAccessRequest.createdAt))
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
    pendingAccessRequests: Number(counts?.pendingAccessRequests ?? 0),
    visibleProducts: Number(counts?.visibleProducts ?? 0),
    tickets: tickets.map((t) => ({
      id: t.id,
      subject: t.subject,
      customerName: t.customerName,
      dateLabel: dt.format(t.lastMessageAt),
      awaitingProdet: t.lastAuthorRole === 'client',
    })),
    accessRequests: accessRequests.map((r) => ({
      id: r.id,
      company: r.company,
      name: r.name,
      dateLabel: dt.format(r.createdAt),
    })),
    activeNow: activeNow.map((a) => ({
      name: a.name,
      email: a.email,
      lastSeenLabel: a.lastSeenAt ? dtDay.format(a.lastSeenAt) : '—',
    })),
  };
}
