'use client';

import { MailCheck, ShieldAlert } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

type ErrorKey =
  | 'errors.invalidEmail'
  | 'errors.notActivated'
  | 'errors.notConfigured'
  | 'errors.sendFailed'
  | 'errors.badLink'
  | 'errors.signInFailed';

const ERROR_KEYS: Record<string, ErrorKey> = {
  invalid: 'errors.invalidEmail',
  'not-activated': 'errors.notActivated',
  config: 'errors.notConfigured',
  failed: 'errors.sendFailed',
  'missing-code': 'errors.badLink',
  callback: 'errors.badLink',
};

/**
 * Reads ?sent= / ?error= on the client so the login page itself can stay static
 * and prefetch like Catalogue / Contact.
 */
export function ClientLoginQueryFeedback({
  messages,
}: {
  messages: { sent: string; errors: Record<ErrorKey, string> };
}) {
  const searchParams = useSearchParams();
  const sent = searchParams.get('sent') === '1';
  const error = searchParams.get('error');
  const errorKey = error ? (ERROR_KEYS[error] ?? 'errors.signInFailed') : null;

  if (!sent && !errorKey) return null;

  return (
    <>
      {sent ? (
        <p
          role="status"
          className="border-prodet-green/20 bg-prodet-green/10 text-prodet-green mt-4 flex items-start gap-2 rounded-md border px-3 py-2.5 text-[12px] leading-5"
        >
          <MailCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>{messages.sent}</span>
        </p>
      ) : null}
      {errorKey ? (
        <p
          role="alert"
          className="border-destructive/20 bg-destructive/10 text-destructive mt-4 flex items-start gap-2 rounded-md border px-3 py-2.5 text-[12px] leading-5"
        >
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>{messages.errors[errorKey]}</span>
        </p>
      ) : null}
    </>
  );
}

/** Keeps the magic-link `next` target in sync with ?next= without dynamizing the page. */
export function ClientLoginNextField({ locale }: { locale: 'fr' | 'en' }) {
  const searchParams = useSearchParams();
  const raw = searchParams.get('next') ?? undefined;
  const next = sanitizeNext(locale, raw);
  return <input type="hidden" name="next" value={next} />;
}

function sanitizeNext(locale: 'fr' | 'en', value?: string): string {
  if (!value) return `/${locale}/client`;
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith(`/${locale}/client`) && !decoded.startsWith('//')) return decoded;
  } catch {
    // fall through
  }
  if (value.startsWith(`/${locale}/client`) && !value.startsWith('//')) return value;
  return `/${locale}/client`;
}
