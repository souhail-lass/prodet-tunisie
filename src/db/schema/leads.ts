import { sql } from 'drizzle-orm';
import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { localeEnum } from './enums';
import { customer } from './customers';

/**
 * Quote requests submitted via the public website.
 * Operators triage these and may convert into an order_draft.
 */
export const quoteRequest = pgTable(
  'quote_request',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    referenceCode: text('reference_code').notNull().unique(),
    locale: localeEnum('locale').notNull().default('fr'),
    companyName: text('company_name').notNull(),
    contactName: text('contact_name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    sectorKey: text('sector_key'),
    message: text('message'),
    requestedItems: jsonb('requested_items'),
    sourcePage: text('source_page'),
    utm: jsonb('utm'),
    ipHash: text('ip_hash'),
    userAgent: text('user_agent'),
    customerId: uuid('customer_id').references(() => customer.id, {
      onDelete: 'set null',
    }),
    handledAt: timestamp('handled_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    createdIdx: index('quote_request_created_idx').on(t.createdAt),
  }),
);
