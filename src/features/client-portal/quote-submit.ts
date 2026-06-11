import 'server-only';
import { eq } from 'drizzle-orm';
import { generateReferenceCode } from '@/lib/reference-code';
import { consumeRateLimit } from '@/lib/rate-limit';
import { getSwiverAdapter } from '@/integrations/swiver';
import { requireClientPortalAccess } from './auth';

export type QuoteLineInput = {
  name: string;
  sku: string | null;
  swiverId: string | null;
  quantity: number;
  unitPrice: number | null;
};

/**
 * Submit a portal order from the catalogue. Creates a real `order_draft`
 * (source=portal) + `order_line`s, then AUTO-PUSHES it to Swiver as a draft
 * sales order (type 4) when the client is linked to a Swiver contact. The push
 * is best-effort: on failure the order is kept (swiver_export_status='none')
 * so nothing is lost and an operator can retry from the admin.
 */
export async function submitPortalQuoteRequest(input: {
  lines: QuoteLineInput[];
}): Promise<{ ok: boolean; referenceCode?: string; swiverPushed?: boolean; error?: string }> {
  const lines = input.lines.filter((l) => l.quantity > 0 && l.name);
  if (lines.length === 0) return { ok: false, error: 'empty' };

  let access;
  try {
    access = await requireClientPortalAccess();
  } catch {
    return { ok: false, error: 'unauthenticated' };
  }
  if (access.membership.role === 'viewer') return { ok: false, error: 'forbidden' };

  const limit = await consumeRateLimit({
    scope: 'portal-quote',
    limit: 10,
    windowMs: 5 * 60_000,
    identifier: access.appUser.id,
  });
  if (!limit.ok) return { ok: false, error: 'rate-limited' };

  const { db, schema } = await import('@/db/client');
  const referenceCode = generateReferenceCode('ORD');
  const now = new Date();

  // 1) Persist the order_draft + lines.
  const draftId = await db.transaction(async (tx) => {
    const [draft] = await tx
      .insert(schema.orderDraft)
      .values({
        referenceCode,
        customerId: access.customer.id,
        customerSnapshot: {
          id: access.customer.id,
          name: access.customer.name,
          email: access.customer.email,
          phone: access.customer.phone,
          city: access.customer.city,
          swiverId: access.customer.swiverId,
        },
        source: 'portal',
        status: 'review',
        swiverExportStatus: 'none',
        rawInbound: {
          kind: 'portal_quote',
          submittedByAppUserId: access.appUser.id,
          submittedByEmail: access.appUser.email,
          lineCount: lines.length,
          lines: lines.map((l) => ({ swiverId: l.swiverId, sku: l.sku, name: l.name, qty: l.quantity, unitPrice: l.unitPrice })),
        },
        createdBy: access.appUser.id,
        updatedAt: now,
      })
      .returning({ id: schema.orderDraft.id });
    if (!draft) throw new Error('order_draft insert returned no row');

    await tx.insert(schema.orderLine).values(
      lines.map((l, i) => ({
        orderDraftId: draft.id,
        lineNumber: i + 1,
        rawText: l.sku ? `${l.name} (${l.sku})` : l.name,
        quantity: String(l.quantity),
        matchedProductId: null,
      })),
    );
    return draft.id;
  });

  // 2) Auto-push to Swiver (best-effort).
  let swiverPushed = false;
  const pushableLines = lines.filter((l) => l.swiverId);
  if (access.customer.swiverId && pushableLines.length > 0) {
    try {
      const swiver = getSwiverAdapter();
      const created = await swiver.documents.createDraftDocument(4);
      if (created) {
        const ok = await swiver.documents.updateDocument(created.swiverId, {
          contactSwiverId: access.customer.swiverId,
          version: created.version,
          warehouseId: created.warehouseId,
          lines: pushableLines.map((l) => ({
            productSwiverId: l.swiverId as string,
            quantity: l.quantity,
            unitPrice: l.unitPrice ?? null,
            label: l.name,
          })),
        });
        if (ok) {
          swiverPushed = true;
          await db
            .update(schema.orderDraft)
            .set({
              swiverDocumentRef: created.swiverId,
              swiverExportStatus: 'api_pushed',
              status: 'approved',
              exportedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(schema.orderDraft.id, draftId));
        } else {
          // Update failed — cancel the orphaned empty draft so it doesn't clutter Swiver.
          try {
            await swiver.documents.setDocumentState(created.swiverId, 'to_canceled');
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // Keep the order; operator retries from the admin.
    }
  }

  await db.insert(schema.auditLog).values({
    actorUserId: access.appUser.id,
    actorRole: access.appUser.role,
    action: swiverPushed ? 'order_draft.portal_submitted_pushed' : 'order_draft.portal_submitted',
    entityType: 'order_draft',
    entityId: draftId,
    diff: { lineCount: lines.length, swiverPushed },
    metadata: {},
  });

  return { ok: true, referenceCode, swiverPushed };
}
