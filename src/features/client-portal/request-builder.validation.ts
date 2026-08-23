/** Zod payloads for portal request submission — imported by server actions only server-side parsing. */

import { z } from 'zod';
import { portalRecurrenceModes } from './portal-recurrence';

const PortalRequestLineSchema = z.object({
  productId: z.string().uuid('invalidProduct'),
  quantity: z.coerce.number().int().min(1, 'invalidQuantity').max(9999, 'invalidQuantity'),
  note: z.string().trim().max(1000, 'tooLong').optional(),
});

export const SubmitPortalRequestSchema = z
  .object({
    locale: z.enum(['fr', 'en']).default('fr'),
    deliveryText: z.string().trim().max(700, 'tooLong').optional(),
    preferredTiming: z.string().trim().max(160, 'tooLong').optional(),
    message: z.string().trim().max(2000, 'tooLong').optional(),
    recurrenceMode: z.enum(portalRecurrenceModes).default('once'),
    recurrenceDetail: z.string().trim().max(180, 'tooLong').optional(),
    duplicatedFromOrderDraftId: z.string().uuid('invalidSourceRequest').optional(),
    lines: z.array(PortalRequestLineSchema).min(1, 'atLeastOneItem').max(40, 'tooLong'),
  })
  .superRefine((input, ctx) => {
    if (input.recurrenceMode === 'custom') {
      const detail = input.recurrenceDetail?.trim();
      if (!detail || detail.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['recurrenceDetail'],
          message: 'recurrenceCustomRequired',
        });
      }
    }
  })
  .superRefine((input, context) => {
    const seen = new Set<string>();
    input.lines.forEach((line, index) => {
      if (seen.has(line.productId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['lines', index, 'productId'],
          message: 'duplicateProduct',
        });
      }
      seen.add(line.productId);
    });
  });

export type SubmitPortalRequestInput = z.input<typeof SubmitPortalRequestSchema>;
