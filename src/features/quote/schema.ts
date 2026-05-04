import { z } from 'zod';
import { Email, Quantity, TrimmedString, TunisianOrInternationalPhone } from '@/lib/validation';

export const QuoteLineSchema = z
  .object({
    productSlug: z.string().optional(),
    freeText: TrimmedString.optional(),
    quantity: Quantity,
    unit: z.string().trim().optional(),
  })
  .refine((line) => Boolean(line.productSlug) || Boolean(line.freeText), {
    message: 'required',
    path: ['freeText'],
  });

export const QuoteRequestSchema = z.object({
  company: TrimmedString.pipe(z.string().min(2, 'tooShort').max(120, 'tooLong')),
  name: TrimmedString.pipe(z.string().min(2, 'tooShort').max(120, 'tooLong')),
  email: Email,
  phone: TunisianOrInternationalPhone,
  sectorKey: z.string().optional(),
  message: z.string().trim().max(2000, 'tooLong').optional(),
  lines: z.array(QuoteLineSchema).min(1, 'atLeastOneItem').max(40, 'tooLong'),
});

export type QuoteRequestInput = z.infer<typeof QuoteRequestSchema>;
export type QuoteLineInput = z.infer<typeof QuoteLineSchema>;
