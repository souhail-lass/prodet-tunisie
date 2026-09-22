import { describe, expect, it } from 'vitest';
import { hasFreshSupabaseSession, hasSupabaseAuthCookie } from '@/lib/supabase/auth-cookie';

describe('supabase auth cookie helpers', () => {
  it('detects presence of auth token cookies', () => {
    expect(hasSupabaseAuthCookie([])).toBe(false);
    expect(hasSupabaseAuthCookie([{ name: 'other', value: 'x' }])).toBe(false);
    expect(hasSupabaseAuthCookie([{ name: 'sb-abc123-auth-token', value: 'chunk' }])).toBe(true);
    expect(hasSupabaseAuthCookie([{ name: 'sb-abc123-auth-token.0', value: 'a' }])).toBe(true);
  });

  it('reports freshness from expires_at without network', () => {
    const now = 1_700_000_000;
    const fresh = Buffer.from(JSON.stringify({ expires_at: now + 3600 }), 'utf8').toString(
      'base64url',
    );
    const stale = Buffer.from(JSON.stringify({ expires_at: now + 30 }), 'utf8').toString(
      'base64url',
    );

    expect(
      hasFreshSupabaseSession([{ name: 'sb-x-auth-token', value: `base64-${fresh}` }], now),
    ).toBe(true);
    expect(
      hasFreshSupabaseSession([{ name: 'sb-x-auth-token', value: `base64-${stale}` }], now),
    ).toBe(false);
    expect(hasFreshSupabaseSession([], now)).toBe(false);
  });
});
