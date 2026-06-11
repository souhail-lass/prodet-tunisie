import { NextResponse } from 'next/server';
import { requireClientPortalAccess } from '@/features/client-portal/auth';
import { resolveCurrentPortalSwiverIdentity } from '@/features/client-portal/swiver-identity';
import { getSwiverAdapter } from '@/integrations/swiver';

export const dynamic = 'force-dynamic';

/**
 * Streams the REAL Swiver PDF of one of the client's own documents.
 * Ownership-checked: the document's contact must be the logged-in client's
 * Swiver contact — anything else (or an unknown id) is a plain 404.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return new NextResponse('Not found', { status: 404 });

  try {
    await requireClientPortalAccess();
  } catch {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const identity = await resolveCurrentPortalSwiverIdentity();
  if (!identity.customer?.swiverId) return new NextResponse('Not found', { status: 404 });

  const adapter = getSwiverAdapter();
  const doc = await adapter.documents.getDocument(id).catch(() => null);
  if (!doc || doc.customerSwiverId !== identity.customer.swiverId) {
    return new NextResponse('Not found', { status: 404 });
  }

  const pdf = await adapter.documents.getDocumentPdf(id);
  if (!pdf) return new NextResponse('Not found', { status: 404 });

  const filename = `${doc.documentNumber.replace(/[^\w.-]+/g, '-') || 'document'}.pdf`;
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'private, max-age=300',
    },
  });
}
