import { sql } from 'drizzle-orm';
import {
  bigint,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { customerDocumentKindEnum } from './enums';
import { customer } from './customers';
import { orderDraft } from './orders';
import { user } from './users';

/**
 * Customer-owned documents. Stored in Supabase Storage at
 * `customer-documents/<customer_id>/<document_id>/<file_name>`. The bucket
 * is private; signed URLs are minted server-side on demand.
 *
 * Notes:
 * - `byte_size` uses bigint so we can accept up to 25 MB cleanly without
 *   overflow concerns; we enforce the cap server-side, not at the column.
 * - `storage_path` is the canonical key inside the bucket and the audit
 *   anchor for delete/list operations.
 */
export const customerDocument = pgTable(
  'customer_document',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => customer.id, { onDelete: 'cascade' }),
    uploadedByUserId: uuid('uploaded_by_user_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    kind: customerDocumentKindEnum('kind').notNull().default('other'),
    storagePath: text('storage_path').notNull().unique(),
    fileName: text('file_name').notNull(),
    mimeType: text('mime_type').notNull(),
    byteSize: bigint('byte_size', { mode: 'number' }).notNull(),
    label: text('label'),
    notes: text('notes'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    customerCreatedIdx: index('customer_document_customer_created_idx').on(
      t.customerId,
      t.createdAt,
    ),
    customerKindIdx: index('customer_document_customer_kind_idx').on(t.customerId, t.kind),
  }),
);

/**
 * Many-to-many link between a portal request (order_draft) and a customer
 * document. Set up as composite primary key so the same document can be
 * attached to multiple requests without duplication.
 */
export const orderDraftDocument = pgTable(
  'order_draft_document',
  {
    orderDraftId: uuid('order_draft_id')
      .notNull()
      .references(() => orderDraft.id, { onDelete: 'cascade' }),
    customerDocumentId: uuid('customer_document_id')
      .notNull()
      .references(() => customerDocument.id, { onDelete: 'cascade' }),
    attachedByUserId: uuid('attached_by_user_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.orderDraftId, t.customerDocumentId] }),
    documentIdx: index('order_draft_document_document_idx').on(t.customerDocumentId),
  }),
);
