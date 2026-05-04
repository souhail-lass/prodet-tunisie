'use client';

import { useTranslations } from 'next-intl';

const KNOWN_KEYS = new Set([
  'required',
  'invalidEmail',
  'invalidPhone',
  'tooShort',
  'tooLong',
  'invalidQuantity',
  'atLeastOneItem',
]);

export function FieldError({ message }: { message?: string }) {
  const t = useTranslations('common.form.errors');
  if (!message) return null;
  const text = KNOWN_KEYS.has(message) ? t(message as Parameters<typeof t>[0]) : message;
  return (
    <p role="alert" className="text-destructive mt-1 text-sm">
      {text}
    </p>
  );
}
