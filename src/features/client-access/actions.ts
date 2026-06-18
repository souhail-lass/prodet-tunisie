'use server';

import { companyInfo } from '@/data/company';
import { consumeRateLimit, formatRetryAfterFr } from '@/lib/rate-limit';
import {
  ClientAccessRequestSchema,
  type ClientAccessRequestInput,
} from './schema';

export interface ClientAccessSubmitResult {
  ok: boolean;
  requestId?: string;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
  emailNotification?: 'sent' | 'skipped' | 'failed';
}

export async function submitClientAccessRequest(
  input: ClientAccessRequestInput,
): Promise<ClientAccessSubmitResult> {
  const limit = await consumeRateLimit({
    scope: 'client-access',
    limit: 5,
    windowMs: 30 * 60_000,
  });
  if (!limit.ok) {
    return {
      ok: false,
      formError: `Trop de demandes récentes. Réessayez dans ${formatRetryAfterFr(limit.retryAfterMs)}.`,
    };
  }

  const parsed = ClientAccessRequestSchema.safeParse(input);
  if (!parsed.success) {
    const flat = parsed.error.flatten((issue) => issue.message);
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(flat.fieldErrors)) {
      if (value && value.length > 0) fieldErrors[key] = value;
    }
    if (flat.formErrors.length > 0) fieldErrors._root = flat.formErrors;
    return { ok: false, fieldErrors, formError: mapAccessRequestError(fieldErrors) };
  }

  // Swiver-creation fields aren't dedicated columns yet — keep them with the
  // request (so the admin has everything to create the customer) by folding a
  // structured block into the stored message. Proper columns + a Swiver
  // "create customer" push are a follow-up backend step.
  const swiverDetails = [
    `Matricule fiscal : ${parsed.data.vatNumber}`,
    `Adresse : ${parsed.data.addressLine}`,
    `Code postal : ${parsed.data.postalCode}`,
  ].join('\n');
  const userMessage = parsed.data.message?.trim() || null;
  const combinedMessage = [
    `— Données société (création Swiver) —\n${swiverDetails}`,
    userMessage ? `— Message —\n${userMessage}` : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const normalized = {
    ...parsed.data,
    email: parsed.data.email.toLowerCase(),
    prodetReferenceOptional: parsed.data.prodetReferenceOptional || null,
    message: combinedMessage || null,
  };

  let requestId: string;

  try {
    const { db, schema } = await import('@/db/client');
    const [inserted] = await db
      .insert(schema.clientAccessRequest)
      .values({
        name: normalized.name,
        companyName: normalized.companyName,
        sector: normalized.sector,
        phone: normalized.phone,
        email: normalized.email,
        cityOrZone: normalized.cityOrZone,
        needType: normalized.needType,
        prodetReferenceOptional: normalized.prodetReferenceOptional,
        message: normalized.message,
        status: 'new',
        source: 'espace_client',
      })
      .returning({ id: schema.clientAccessRequest.id });

    if (!inserted) throw new Error('client_access_request_insert_failed');

    requestId = inserted.id;
  } catch (error) {
    console.error('[client-access:db-error]', error);
    return {
      ok: false,
      formError:
        "Impossible d'enregistrer la demande pour le moment. Réessayez ou contactez Prodet directement.",
    };
  }

  const emailNotification = await notifyProdet(requestId, {
    name: normalized.name,
    companyName: normalized.companyName,
    vatNumber: parsed.data.vatNumber,
    addressLine: parsed.data.addressLine,
    postalCode: parsed.data.postalCode,
    sector: normalized.sector,
    phone: normalized.phone,
    email: normalized.email,
    cityOrZone: normalized.cityOrZone,
    needType: normalized.needType,
    prodetReferenceOptional: normalized.prodetReferenceOptional,
    message: userMessage,
  });

  console.info('[client-access:received]', {
    requestId,
    companyName: normalized.companyName,
    sector: normalized.sector,
    emailNotification,
    receivedAt: new Date().toISOString(),
  });

  return { ok: true, requestId, emailNotification };
}

function mapAccessRequestError(fieldErrors: Record<string, string[]>): string {
  const messages = Object.values(fieldErrors).flat();

  if (messages.includes('invalidEmail')) return "L'adresse email n'est pas valide.";
  if (messages.includes('required')) return 'Complétez les champs obligatoires.';

  return 'Vérifiez les informations de la demande.';
}

async function notifyProdet(
  requestId: string,
  input: {
    name: string;
    companyName: string;
    vatNumber: string;
    addressLine: string;
    postalCode: string;
    sector: string;
    phone: string;
    email: string;
    cityOrZone: string;
    needType: string;
    prodetReferenceOptional: string | null;
    message: string | null;
  },
): Promise<'sent' | 'skipped' | 'failed'> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn('[client-access:email-skipped]', {
      requestId,
      reason: 'missing-resend-api-key',
    });
    return 'skipped';
  }

  const from =
    process.env.QUOTE_EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'Prodet Website <onboarding@resend.dev>';
  const to = process.env.QUOTE_NOTIFICATION_EMAIL?.trim() || companyInfo.email;
  const subject = `Demande d'accès client Prodet - ${input.companyName}`;
  const text = [
    `Demande ID: ${requestId}`,
    '',
    'Coordonnées:',
    `Nom / Prénom: ${input.name}`,
    `Société / Établissement: ${input.companyName}`,
    `Matricule fiscal: ${input.vatNumber}`,
    `Secteur: ${input.sector}`,
    `Téléphone: ${input.phone}`,
    `Email: ${input.email}`,
    `Adresse: ${input.addressLine}`,
    `Ville / zone: ${input.cityOrZone}`,
    `Code postal: ${input.postalCode}`,
    `Type de besoin: ${input.needType}`,
    `Référence client Prodet, facture ou BL: ${
      input.prodetReferenceOptional || 'Non précisé'
    }`,
    '',
    'Message:',
    input.message || 'Non précisé',
    '',
    'Statut initial: new',
  ].join('\n');
  const html = `<pre style="font-family:Inter,Arial,sans-serif;white-space:pre-wrap;line-height:1.55;color:#102033">${escapeHtml(text)}</pre>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        text,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[client-access:email-failed]', {
        requestId,
        status: response.status,
        errorText,
      });
      return 'failed';
    }

    return 'sent';
  } catch (error) {
    console.error('[client-access:email-error]', { requestId, error });
    return 'failed';
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/gu, '&amp;')
    .replace(/</gu, '&lt;')
    .replace(/>/gu, '&gt;')
    .replace(/"/gu, '&quot;')
    .replace(/'/gu, '&#39;');
}
