import 'server-only';
import { after } from 'next/server';
import { eq } from 'drizzle-orm';
import { generateReferenceCode } from '@/lib/reference-code';
import { consumeRateLimit } from '@/lib/rate-limit';
import { getSwiverAdapter } from '@/integrations/swiver';
import { brandedHtml, prodetNotificationEmail, sendEmail } from '@/lib/email';
import { requireClientPortalAccess } from './auth';

export type QuoteLineInput = {
  name: string;
  sku: string | null;
  swiverId: string | null;
  quantity: number;
  unitPrice: number | null;
};

/** Which Swiver document the client wants to raise. */
export type PortalSubmitKind = 'order' | 'devis';

/** Swiver numeric document type per kind (4 = bon de commande, 6 = devis). */
const SWIVER_TYPE_BY_KIND: Record<PortalSubmitKind, number> = { order: 4, devis: 6 };

/**
 * Submit a portal order or devis from the catalogue. Creates a real
 * `order_draft` (source=portal) + `order_line`s, then AUTO-PUSHES it to Swiver
 * as a draft — a sales order (type 4) for `kind='order'` or a devis (type 6)
 * for `kind='devis'` — when the client is linked to a Swiver contact. The push
 * is best-effort: on failure the record is kept (swiver_export_status='none')
 * so nothing is lost and an operator can retry from the admin.
 */
export async function submitPortalQuoteRequest(input: {
  lines: QuoteLineInput[];
  kind?: PortalSubmitKind;
}): Promise<{ ok: boolean; referenceCode?: string; swiverPushed?: boolean; error?: string }> {
  const kind: PortalSubmitKind = input.kind === 'devis' ? 'devis' : 'order';
  const swiverType = SWIVER_TYPE_BY_KIND[kind];
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
  const referenceCode = generateReferenceCode(kind === 'devis' ? 'DEV' : 'ORD');
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
          kind: kind === 'devis' ? 'portal_devis' : 'portal_order',
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
      const created = await swiver.documents.createDraftDocument(swiverType);
      if (created) {
        const ok = await swiver.documents.updateDocument(created.swiverId, {
          contactSwiverId: access.customer.swiverId,
          version: created.version,
          warehouseId: created.warehouseId,
          type: swiverType,
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
    diff: { lineCount: lines.length, swiverPushed, kind },
    metadata: {},
  });

  // Notify Prodet of the new order — after the response, never blocking it.
  const notify = prodetNotificationEmail();
  if (notify) {
    const company = access.customer.name;
    const units = lines.reduce((s, l) => s + l.quantity, 0);
    const isDevis = kind === 'devis';
    const docWord = isDevis ? 'demande de devis' : 'commande';
    const docWordCap = isDevis ? 'Demande de devis' : 'Nouvelle commande';
    const swiverDocWord = isDevis ? 'devis' : 'bon de commande';
    after(async () => {
      await sendEmail({
        to: notify,
        subject: `${docWordCap} ${referenceCode} — ${company}`,
        replyTo: access.appUser.email,
        text: [
          `Nouvelle ${docWord} reçue depuis l'espace client.`,
          ``,
          `Client : ${company}`,
          `Référence : ${referenceCode}`,
          `${lines.length} référence(s) · ${units} unité(s)`,
          swiverPushed ? `Transmise à Swiver (brouillon de ${swiverDocWord}).` : `Non transmise à Swiver — à traiter manuellement.`,
        ].join('\n'),
        html: brandedHtml(
          `${docWordCap} — ${company}`,
          [
            `Référence ${referenceCode} · ${lines.length} référence(s), ${units} unité(s).`,
            swiverPushed ? `Transmise à Swiver en brouillon de ${swiverDocWord}.` : 'Non transmise à Swiver — à traiter manuellement.',
          ],
        ),
      });
    });
  }

  return { ok: true, referenceCode, swiverPushed };
}
