import { describe, expect, it } from 'vitest';
import { QuoteRequestSchema } from './schema';

describe('QuoteRequestSchema', () => {
  const validBase = {
    company: 'Hôtel Carthage',
    name: 'Mounir Ben Salah',
    email: 'achat@hotel.tn',
    phone: '+216 71 555 444',
    sectorKey: 'hotels',
    message: 'Livraison hebdomadaire souhaitée.',
    lines: [
      {
        productSlug: 'javel-prodet-bid-5kg',
        freeText: undefined,
        quantity: 12,
        unit: 'BID',
      },
    ],
  };

  it('accepts a complete valid input', () => {
    const result = QuoteRequestSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it('normalises email to lowercase and trims', () => {
    const result = QuoteRequestSchema.safeParse({
      ...validBase,
      email: '  ACHAT@HOTEL.TN  ',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe('achat@hotel.tn');
  });

  it('strips spaces from phone numbers', () => {
    const result = QuoteRequestSchema.safeParse({
      ...validBase,
      phone: '+216 71-555 444',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone).toBe('+21671555444');
  });

  it('rejects when no lines are provided', () => {
    const result = QuoteRequestSchema.safeParse({ ...validBase, lines: [] });
    expect(result.success).toBe(false);
  });

  it('rejects a line without a product nor free text', () => {
    const result = QuoteRequestSchema.safeParse({
      ...validBase,
      lines: [
        {
          productSlug: undefined,
          freeText: undefined,
          quantity: 1,
          unit: '',
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('accepts a line with only free text (operator will map later)', () => {
    const result = QuoteRequestSchema.safeParse({
      ...validBase,
      lines: [
        {
          productSlug: undefined,
          freeText: 'javel 5L',
          quantity: 6,
          unit: '',
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative or zero quantities', () => {
    expect(
      QuoteRequestSchema.safeParse({
        ...validBase,
        lines: [{ ...validBase.lines[0], quantity: 0 }],
      }).success,
    ).toBe(false);
    expect(
      QuoteRequestSchema.safeParse({
        ...validBase,
        lines: [{ ...validBase.lines[0], quantity: -2 }],
      }).success,
    ).toBe(false);
  });

  it('rejects an obviously invalid email', () => {
    const result = QuoteRequestSchema.safeParse({
      ...validBase,
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a phone number with letters', () => {
    const result = QuoteRequestSchema.safeParse({
      ...validBase,
      phone: '+216-CALL-ME',
    });
    expect(result.success).toBe(false);
  });
});
