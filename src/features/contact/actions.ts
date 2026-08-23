'use server';

import { generateReferenceCode } from '@/lib/reference-code';
import { consumeRateLimit, formatRetryAfterFr } from '@/lib/rate-limit';
import { brandedHtml, publicInboxEmail, sendEmail } from '@/lib/email';
import { ContactMessageSchema, type ContactMessageInput } from './schema';

export interface ContactSubmitResult {
  ok: boolean;
  referenceCode?: string;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
}

/** Human labels for the subject enum, for the notification email. */
const SUBJECT_LABEL: Record<ContactMessageInput['subject'], string> = {
  quote: 'Demande de devis',
  info: 'Demande d’information',
  partnership: 'Partenariat',
  other: 'Autre',
};

/**
 * Server action for the public contact form.
 *
 * The message is not persisted — the notification email IS the delivery
 * mechanism, so a send failure is reported to the visitor rather than
 * swallowed. Silently returning a reference code for a mail that never left
 * would lose the message with no trace anywhere.
 */
export async function submitContactMessage(
  input: ContactMessageInput,
): Promise<ContactSubmitResult> {
  if (input.website?.trim()) {
    return { ok: true, referenceCode: generateReferenceCode('CTC') };
  }

  const limit = await consumeRateLimit({
    scope: 'contact',
    limit: 5,
    windowMs: 10 * 60_000,
  });
  if (!limit.ok) {
    return {
      ok: false,
      formError: `Trop d'envois récents. Réessayez dans ${formatRetryAfterFr(limit.retryAfterMs)}.`,
    };
  }

  const parsed = ContactMessageSchema.safeParse(input);
  if (!parsed.success) {
    const flat = parsed.error.flatten((issue) => issue.message);
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(flat.fieldErrors)) {
      if (value && value.length > 0) fieldErrors[key] = value;
    }
    if (flat.formErrors.length > 0) fieldErrors._root = flat.formErrors;
    return { ok: false, fieldErrors };
  }

  const message = parsed.data;
  const referenceCode = generateReferenceCode('CTC');
  const subjectLabel = SUBJECT_LABEL[message.subject];
  const who = message.company?.trim() || message.name;

  const body = [
    `Référence : ${referenceCode}`,
    `Objet : ${subjectLabel}`,
    '',
    'Coordonnées :',
    `Nom : ${message.name}`,
    `Société : ${message.company?.trim() || 'Non précisé'}`,
    `Email : ${message.email}`,
    `Téléphone : ${message.phone?.trim() || 'Non précisé'}`,
    '',
    'Message :',
    message.message,
  ];

  const delivery = await sendEmail({
    to: publicInboxEmail(),
    subject: `Contact ${referenceCode} — ${subjectLabel} — ${who}`,
    replyTo: message.email,
    text: body.join('\n'),
    html: brandedHtml(`${subjectLabel} — ${who}`, body),
  });

  console.info('[contact-message:received]', {
    referenceCode,
    subject: message.subject,
    delivery,
    receivedAt: new Date().toISOString(),
  });

  if (delivery !== 'sent') {
    return {
      ok: false,
      formError:
        "Impossible d'envoyer votre message pour le moment. Réessayez, ou écrivez-nous directement à contact@prodet.com.tn.",
    };
  }

  return { ok: true, referenceCode };
}
