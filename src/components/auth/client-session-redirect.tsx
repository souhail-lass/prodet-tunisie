'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { hasSupabaseAuthCookie } from '@/lib/supabase/auth-cookie';

/**
 * After the static login shell paints, send returning clients with a visible
 * session cookie straight to the portal. Anonymous visitors never wait on this.
 */
export function ClientSessionRedirect({
  locale,
  fallbackNext,
}: {
  locale: 'fr' | 'en';
  fallbackNext: string;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const cookies = document.cookie.split('; ').map((part) => {
      const eq = part.indexOf('=');
      return {
        name: eq === -1 ? part : part.slice(0, eq),
        value: eq === -1 ? '' : decodeURIComponent(part.slice(eq + 1)),
      };
    });
    if (!hasSupabaseAuthCookie(cookies)) return;

    const next = sanitizeNext(locale, searchParams.get('next') ?? undefined) ?? fallbackNext;
    window.location.replace(next);
  }, [fallbackNext, locale, searchParams]);

  return null;
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
