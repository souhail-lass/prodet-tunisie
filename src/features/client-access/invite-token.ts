import { createHash, randomBytes } from 'node:crypto';

const INVITE_TOKEN_BYTES = 32;
const INVITE_TTL_DAYS = 7;

export function generateInviteToken(): string {
  return randomBytes(INVITE_TOKEN_BYTES).toString('base64url');
}

export function hashInviteToken(token: string): string {
  return `sha256:${createHash('sha256').update(token.trim(), 'utf8').digest('hex')}`;
}

export function getInviteExpiresAt(now = new Date()): Date {
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS);
  return expiresAt;
}

export function normalizeInviteToken(value: string | null | undefined): string | null {
  const token = value?.trim();
  if (!token || token.length < 32 || token.length > 256) return null;
  return token;
}
