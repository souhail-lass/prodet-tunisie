import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { downloadSupportAttachment } from '@/features/support/attachments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Streams one support-message attachment, ownership-checked.
 *   GET /api/support/attachment/<messageId>?i=<index>
 *
 * The file is served only to (a) the client who owns the ticket the message
 * belongs to, or (b) an authenticated admin. Anything else is a flat 404 —
 * the storage bucket itself stays private.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> },
) {
  const { messageId } = await params;
  const index = Number(new URL(request.url).searchParams.get('i') ?? '0');
  if (!/^[0-9a-f-]{36}$/i.test(messageId) || !Number.isInteger(index) || index < 0) {
    return notFound();
  }

  const { db, schema } = await import('@/db/client');
  const [row] = await db
    .select({
      attachments: schema.ticketMessage.attachments,
      customerId: schema.supportTicket.customerId,
    })
    .from(schema.ticketMessage)
    .innerJoin(schema.supportTicket, eq(schema.supportTicket.id, schema.ticketMessage.ticketId))
    .where(eq(schema.ticketMessage.id, messageId))
    .limit(1);
  if (!row) return notFound();

  const attachment = row.attachments?.[index];
  if (!attachment) return notFound();

  // Authorize: ticket owner (client) OR any active admin.
  const authorized = await isAuthorized(row.customerId);
  if (!authorized) return notFound();

  const file = await downloadSupportAttachment(attachment.path);
  if (!file) return notFound();

  const safeName = attachment.name.replace(/[^\w.\-() ]+/g, '_') || 'fichier';
  return new NextResponse(Buffer.from(file.bytes), {
    headers: {
      'Content-Type': attachment.type || file.type,
      'Content-Disposition': `inline; filename="${safeName}"`,
      'Cache-Control': 'private, max-age=300',
    },
  });
}

async function isAuthorized(ticketCustomerId: string): Promise<boolean> {
  // Client path: the logged-in customer must own the ticket.
  try {
    const { requireClientPortalAccess } = await import('@/features/client-portal/auth');
    const access = await requireClientPortalAccess();
    if (access.customer.id === ticketCustomerId) return true;
  } catch {
    // not a client session — fall through to the admin check
  }
  // Admin path: any active admin/operator may view client attachments.
  try {
    const { assertRole } = await import('@/features/admin/auth');
    await assertRole(['owner', 'admin', 'operator', 'reviewer']);
    return true;
  } catch {
    return false;
  }
}

function notFound() {
  return new NextResponse('Not found', { status: 404 });
}
