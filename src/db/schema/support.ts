import { sql } from 'drizzle-orm';
import { index, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { customer } from './customers';
import { user } from './users';

/**
 * Support tickets — a single place for a portal client to talk to Prodet,
 * with full conversation history. Not Swiver-backed; entirely our own.
 */
export const ticketStatusEnum = pgEnum('ticket_status', ['open', 'closed']);

export const supportTicket = pgTable(
  'support_ticket',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => customer.id, { onDelete: 'cascade' }),
    openedByUserId: uuid('opened_by_user_id').references(() => user.id, { onDelete: 'set null' }),
    subject: text('subject').notNull(),
    status: ticketStatusEnum('status').notNull().default('open'),
    /** Role of the last message author ('client' | 'admin') — drives "à répondre". */
    lastAuthorRole: text('last_author_role').notNull().default('client'),
    lastMessageAt: timestamp('last_message_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`now()`),
  },
  (t) => ({
    customerIdx: index('support_ticket_customer_idx').on(t.customerId),
    statusIdx: index('support_ticket_status_idx').on(t.status, t.lastMessageAt),
  }),
);

export const ticketMessage = pgTable(
  'ticket_message',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ticketId: uuid('ticket_id')
      .notNull()
      .references(() => supportTicket.id, { onDelete: 'cascade' }),
    authorUserId: uuid('author_user_id').references(() => user.id, { onDelete: 'set null' }),
    /** 'client' | 'admin' */
    authorRole: text('author_role').notNull(),
    authorName: text('author_name'),
    body: text('body').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
  },
  (t) => ({
    ticketIdx: index('ticket_message_ticket_idx').on(t.ticketId, t.createdAt),
  }),
);
