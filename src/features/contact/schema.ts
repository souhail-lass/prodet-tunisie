import { z } from 'zod';
import { Email, TrimmedString, TunisianOrInternationalPhone } from '@/lib/validation';

export const ContactSubjects = ['quote', 'info', 'partnership', 'other'] as const;
export type ContactSubject = (typeof ContactSubjects)[number];

export const ContactMessageSchema = z.object({
  company: z.string().trim().max(120, 'tooLong').optional(),
  name: TrimmedString.pipe(z.string().min(2, 'tooShort').max(120, 'tooLong')),
  email: Email,
  phone: TunisianOrInternationalPhone.optional(),
  subject: z.enum(ContactSubjects),
  message: TrimmedString.pipe(z.string().min(10, 'tooShort').max(2000, 'tooLong')),
});

export type ContactMessageInput = z.infer<typeof ContactMessageSchema>;
