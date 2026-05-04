import { describe, expect, it } from 'vitest';
import { ContactMessageSchema } from './schema';

describe('ContactMessageSchema', () => {
  const valid = {
    company: 'Boulangerie Centrale',
    name: 'Sami Trabelsi',
    email: 'sami@boulangerie.tn',
    phone: '+216 22 100 100',
    subject: 'quote' as const,
    message: "Bonjour, je voudrais un devis pour des produits d'entretien pour notre boulangerie.",
  };

  it('accepts a complete valid message', () => {
    expect(ContactMessageSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts an absent company and an absent phone', () => {
    expect(
      ContactMessageSchema.safeParse({
        ...valid,
        company: undefined,
        phone: undefined,
      }).success,
    ).toBe(true);
  });

  it('rejects a too-short message', () => {
    expect(ContactMessageSchema.safeParse({ ...valid, message: 'court' }).success).toBe(false);
  });

  it('rejects an unknown subject value', () => {
    expect(ContactMessageSchema.safeParse({ ...valid, subject: 'spam' }).success).toBe(false);
  });
});
