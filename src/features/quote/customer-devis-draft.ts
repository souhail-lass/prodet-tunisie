import 'server-only';

import { companyInfo } from '@/data/company';
import { getSwiverAdapter } from '@/integrations/swiver';
import { createGmailDraft, gmailDraftConfigured } from '@/lib/gmail-draft';

export interface CustomerDevisDraftInput {
  swiverId: string;
  referenceCode: string;
  /** Client address. Empty means the operator fills it before sending. */
  to?: string | null;
  /** Shown only in an operator note when `to` is missing. */
  phoneHint?: string | null;
}

/**
 * After Swiver has a devis, leave a ready-to-send message in the Prodet
 * Gmail drafts. Never sends. Never throws — a mail failure must not undo
 * the devis that was just created.
 */
export async function leaveCustomerDevisDraft(input: CustomerDevisDraftInput): Promise<void> {
  try {
    if (!gmailDraftConfigured()) {
      console.warn('[devis-draft:skipped]', {
        referenceCode: input.referenceCode,
        reason: 'gmail-not-configured',
      });
      return;
    }

    const swiver = getSwiverAdapter();
    const [pdf, doc] = await Promise.all([
      swiver.documents.getDocumentPdf(input.swiverId).catch(() => null),
      swiver.documents.getDocument(input.swiverId).catch(() => null),
    ]);
    const swiverRef = usableSwiverRef(doc?.documentNumber);
    const copy = buildCustomerDevisCopy({
      referenceCode: input.referenceCode,
      swiverRef,
      to: input.to,
      phoneHint: input.phoneHint,
      hasPdf: Boolean(pdf && pdf.byteLength > 0),
    });
    const filename = `devis-${safeRef(swiverRef ?? input.referenceCode)}.pdf`;
    const result = await createGmailDraft({
      to: input.to,
      subject: copy.subject,
      text: copy.text,
      html: copy.html,
      attachments:
        pdf && pdf.byteLength > 0
          ? [{ filename, contentType: 'application/pdf', data: pdf }]
          : undefined,
    });
    console.info(`[devis-draft:${result}]`, {
      referenceCode: input.referenceCode,
      swiverId: input.swiverId,
      attached: Boolean(pdf && pdf.byteLength > 0),
    });
  } catch (error) {
    console.error(
      '[devis-draft:failed]',
      input.referenceCode,
      error instanceof Error ? error.message : error,
    );
  }
}

export function buildCustomerDevisCopy(input: {
  referenceCode: string;
  swiverRef: string | null;
  to?: string | null;
  phoneHint?: string | null;
  hasPdf: boolean;
}): { subject: string; text: string; html: string } {
  const label = input.swiverRef ?? input.referenceCode;
  const subject = `Votre devis Prodet - ${label}`;
  const notes: string[] = [];
  if (!input.to?.trim()) {
    const phone = input.phoneHint?.trim();
    notes.push(
      phone
        ? `[Avant d'envoyer : renseigner l'email du client. Tél. ${phone}]`
        : "[Avant d'envoyer : renseigner l'email du client.]",
    );
  }
  if (!input.hasPdf) {
    notes.push(
      `[Avant d'envoyer : le PDF Swiver n'a pas pu être joint. Ajoutez le devis ${label}.]`,
    );
  }

  const text = [
    ...notes,
    notes.length > 0 ? '' : null,
    'Bonjour,',
    '',
    'Voici votre devis.',
    '',
    `Référence : ${label}`,
    '',
    'Vous le trouverez en pièce jointe. Nous restons à votre disposition pour toute question.',
    '',
    'Cordialement,',
    companyInfo.name,
    `Tél. ${companyInfo.phoneDisplay}`,
    companyInfo.email,
  ]
    .filter((line) => line !== null)
    .join('\n');

  const html = `<div style="font-family:Inter,Arial,sans-serif;line-height:1.55;color:#102033;max-width:560px">
    ${notes.map((note) => `<p style="margin:0 0 12px;font-size:13px;color:#8a5a00;background:#fff7e8;border-radius:8px;padding:10px 12px">${escapeHtml(note)}</p>`).join('')}
    <p style="margin:0 0 12px">Bonjour,</p>
    <p style="margin:0 0 12px">Voici votre devis.</p>
    <p style="margin:0 0 12px">Référence : <strong>${escapeHtml(label)}</strong></p>
    <p style="margin:0 0 12px">Vous le trouverez en pièce jointe. Nous restons à votre disposition pour toute question.</p>
    <p style="margin:18px 0 0">Cordialement,<br />${escapeHtml(companyInfo.name)}<br />Tél. ${escapeHtml(companyInfo.phoneDisplay)}<br />${escapeHtml(companyInfo.email)}</p>
  </div>`;

  return { subject, text, html };
}

function usableSwiverRef(documentNumber: string | undefined): string | null {
  const value = documentNumber?.trim();
  if (!value || value.startsWith('(doc #')) return null;
  return value;
}

function safeRef(value: string): string {
  return value
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
