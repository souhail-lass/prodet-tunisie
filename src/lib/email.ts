import 'server-only';

export type EmailResult = 'sent' | 'skipped' | 'failed';

function fromAddress(): string {
  return (
    process.env.QUOTE_EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'Prodet <onboarding@resend.dev>'
  );
}

/**
 * The Prodet inbox that public-site submissions must always reach.
 *
 * contact@prodet.com.tn forwards here via ImprovMX, but this is the address
 * the team actually reads, so it is the built-in default: a public contact
 * message or devis is never silently dropped just because an env var is
 * unset in some environment.
 */
export const PRODET_INBOX = 'prodet.tunisie@gmail.com';

/** Internal Prodet inbox for portal notifications (orders, support). */
export function prodetNotificationEmail(): string | null {
  return (
    process.env.QUOTE_NOTIFICATION_EMAIL?.trim() ||
    process.env.PRODET_NOTIFICATION_EMAIL?.trim() ||
    null
  );
}

/** Where public-site form submissions (contact form, public devis) land. */
export function publicInboxEmail(): string {
  return (
    process.env.CONTACT_NOTIFICATION_EMAIL?.trim() ||
    process.env.QUOTE_NOTIFICATION_EMAIL?.trim() ||
    PRODET_INBOX
  );
}

/**
 * Send a transactional email via Resend. Never throws and never blocks a
 * mutation's success: returns `'skipped'` when RESEND_API_KEY is unset (local
 * dev / not yet configured) and `'failed'` on a provider error. Notifications
 * are best-effort by design.
 */
export async function sendEmail(input: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const recipients = (Array.isArray(input.to) ? input.to : [input.to]).filter(Boolean);
  if (!apiKey || recipients.length === 0) return 'skipped';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromAddress(),
        to: recipients,
        subject: input.subject,
        text: input.text,
        html: input.html ?? brandedHtml(input.subject, input.text.split('\n')),
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      console.error('[email:failed]', res.status, await res.text().catch(() => ''));
      return 'failed';
    }
    return 'sent';
  } catch (error) {
    console.error('[email:error]', error instanceof Error ? error.message : error);
    return 'failed';
  }
}

/** Minimal, on-brand HTML wrapper so notifications look intentional. */
export function brandedHtml(
  heading: string,
  paragraphs: string[],
  cta?: { label: string; url: string },
): string {
  const body = paragraphs
    .filter((p) => p.trim())
    .map((p) => `<p style="margin:0 0 12px">${escapeHtml(p)}</p>`)
    .join('');
  const button = cta
    ? `<p style="margin:22px 0 8px"><a href="${escapeHtml(cta.url)}" style="display:inline-block;background:#0B5FAE;color:#fff;text-decoration:none;font-weight:600;padding:11px 20px;border-radius:8px">${escapeHtml(cta.label)}</a></p>`
    : '';
  return `<div style="font-family:Inter,Arial,sans-serif;line-height:1.55;color:#102033;max-width:560px;margin:0 auto;padding:8px">
    <div style="font-weight:800;font-size:18px;color:#08233f;margin-bottom:16px">Prodet</div>
    <h1 style="font-size:18px;font-weight:700;margin:0 0 14px;color:#08233f">${escapeHtml(heading)}</h1>
    ${body}${button}
    <hr style="border:none;border-top:1px solid #e6e8ec;margin:24px 0 12px" />
    <p style="font-size:12px;color:#7a869a;margin:0">Prodet Tunisie · Produits d'hygiène professionnelle</p>
  </div>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}
