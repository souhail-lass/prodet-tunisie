import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

/**
 * Durable journal of every webhook payload Swiver POSTs to us. The
 * `/api/webhooks/swiver` route always inserts a row before doing any work,
 * so we have an audit trail even when processing fails. Processing is then
 * idempotent on `(event_id)` when Swiver supplies one.
 */
export const swiverWebhookEvent = pgTable(
  'swiver_webhook_event',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /**
     * Optional Swiver-provided event id. We do not require it because the
     * exact payload shape is not yet documented; if it appears in a known
     * field (`id`, `event_id`, …) the route extracts it for idempotency.
     */
    eventId: text('event_id').unique(),
    /** Optional Swiver event type (e.g. document.created). */
    eventType: text('event_type'),
    payload: jsonb('payload').notNull(),
    signature: text('signature'),
    signatureVerified: boolean('signature_verified').notNull().default(false),
    sourceIp: text('source_ip'),
    userAgent: text('user_agent'),
    status: text('status').notNull().default('received'),
    /** Surfaced when `status = 'failed'`. */
    error: text('error'),
    attemptCount: integer('attempt_count').notNull().default(0),
    processedAt: timestamp('processed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    statusIdx: index('swiver_webhook_event_status_idx').on(t.status, t.createdAt),
    typeIdx: index('swiver_webhook_event_type_idx').on(t.eventType, t.createdAt),
  }),
);
