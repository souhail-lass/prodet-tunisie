/**
 * Generates a short, human-readable reference code shown to users
 * after they submit a form ("QUO-2026-A1B2"). When the DB is wired
 * the code becomes the persisted unique key on quote_request /
 * order_draft / contact_message.
 *
 * Not cryptographically strong; only meant to be guessable enough to
 * be useful when humans quote it on the phone.
 */
export function generateReferenceCode(prefix: 'QUO' | 'CTC' | 'ORD' | 'DEV'): string {
  const year = new Date().getUTCFullYear();
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${prefix}-${year}-${suffix}`;
}
