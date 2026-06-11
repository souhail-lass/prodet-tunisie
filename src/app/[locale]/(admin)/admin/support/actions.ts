'use server';

import { consumeRateLimit } from '@/lib/rate-limit';
import { assertRole } from '@/features/admin/auth';
import { adminReply, setTicketStatus } from '@/features/admin/tickets';
import { uploadSupportAttachment, type TicketAttachment } from '@/features/support/attachments';
import type { UploadAttachmentResult } from '@/app/[locale]/(client)/client/support/actions';

export async function adminReplyAction(
  ticketId: string,
  body: string,
  attachments: TicketAttachment[] = [],
) {
  const session = await assertRole(['owner', 'admin', 'operator']);
  return adminReply({
    ticketId,
    body,
    attachments,
    actorUserId: session.appUser?.id ?? null,
    authorName: session.appUser?.fullName || 'Prodet',
  });
}

/** Upload one file/photo for an admin support reply (multipart). */
export async function uploadAdminTicketAttachmentAction(formData: FormData): Promise<UploadAttachmentResult> {
  let session;
  try {
    session = await assertRole(['owner', 'admin', 'operator']);
  } catch {
    return { ok: false, error: 'auth' };
  }
  const rl = await consumeRateLimit({
    scope: 'support-upload-admin',
    identifier: session.appUser?.id ?? 'admin',
    limit: 120,
    windowMs: 10 * 60_000,
  });
  if (!rl.ok) return { ok: false, error: 'rate-limited' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: 'invalid' };
  return uploadSupportAttachment({
    name: file.name,
    type: file.type,
    size: file.size,
    bytes: await file.arrayBuffer(),
  });
}

export async function setTicketStatusAction(input: { ticketId: string; status: 'open' | 'closed' }) {
  await assertRole(['owner', 'admin', 'operator']);
  await setTicketStatus(input.ticketId, input.status);
  return { ok: true };
}
