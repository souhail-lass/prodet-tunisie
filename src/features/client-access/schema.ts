import { z } from 'zod';

export const ClientAccessRequestSchema = z.object({
  name: z.string().trim().min(1, 'required').max(120, 'tooLong'),
  companyName: z.string().trim().min(1, 'required').max(160, 'tooLong'),
  // Fields needed to create the customer in Swiver.
  vatNumber: z.string().trim().min(1, 'required').max(40, 'tooLong'),
  addressLine: z.string().trim().min(1, 'required').max(200, 'tooLong'),
  postalCode: z.string().trim().min(1, 'required').max(20, 'tooLong'),
  sector: z.string().trim().min(1, 'required').max(120, 'tooLong'),
  phone: z.string().trim().min(1, 'required').max(60, 'tooLong'),
  email: z.string().trim().email('invalidEmail').max(160, 'tooLong'),
  cityOrZone: z.string().trim().min(1, 'required').max(140, 'tooLong'),
  needType: z.string().trim().min(1, 'required').max(120, 'tooLong'),
  prodetReferenceOptional: z.string().trim().max(180, 'tooLong').optional(),
  message: z.string().trim().max(2000, 'tooLong').optional(),
  /** Spam honeypot — must stay empty; see components/site/honeypot-field.tsx. */
  website: z.string().trim().max(200, 'tooLong').optional(),
});

export type ClientAccessRequestInput = z.input<typeof ClientAccessRequestSchema>;
