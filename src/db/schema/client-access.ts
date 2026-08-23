import { sql } from 'drizzle-orm';
import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import {
  clientAccessRequestSourceEnum,
  clientAccessRequestStatusEnum,
  portalInviteStatusEnum,
} from './enums';

export const clientAccessRequest = pgTable(
  'client_access_request',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    companyName: text('company_name').notNull(),
    sector: text('sector').notNull(),
    phone: text('phone').notNull(),
    email: text('email').notNull(),
    cityOrZone: text('city_or_zone').notNull(),
    needType: text('need_type').notNull(),
    prodetReferenceOptional: text('prodet_reference_optional'),
    message: text('message'),
    status: clientAccessRequestStatusEnum('status').notNull().default('new'),
    source: clientAccessRequestSourceEnum('source').notNull().default('espace_client'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    reviewerNote: text('reviewer_note'),
    /** Client Swiver créé à l'approbation — rattaché au customer à l'activation. */
    swiverCustomerId: text('swiver_customer_id'),
  },
  (t) => ({
    statusCreatedIdx: index('client_access_request_status_created_idx').on(
      t.status,
      t.createdAt,
    ),
    emailCreatedIdx: index('client_access_request_email_created_idx').on(
      t.email,
      t.createdAt,
    ),
  }),
);

export const portalInvite = pgTable(
  'portal_invite',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    accessRequestId: uuid('access_request_id')
      .notNull()
      .references(() => clientAccessRequest.id, { onDelete: 'restrict' }),
    email: text('email').notNull(),
    companyName: text('company_name').notNull(),
    status: portalInviteStatusEnum('status').notNull().default('prepared'),
    tokenHash: text('token_hash'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    accessRequestIdx: uniqueIndex('portal_invite_access_request_idx').on(
      t.accessRequestId,
    ),
    emailStatusIdx: index('portal_invite_email_status_idx').on(t.email, t.status),
  }),
);
