import { z } from 'zod';

/**
 * Reusable building blocks. Form-specific schemas live next to the
 * server actions that consume them.
 */

export const TrimmedString = z
  .string()
  .transform((v) => v.trim())
  .pipe(z.string().min(1));

export const OptionalTrimmedString = z
  .string()
  .transform((v) => v.trim())
  .transform((v) => (v.length === 0 ? undefined : v))
  .optional();

export const TunisianOrInternationalPhone = z
  .string()
  .transform((v) => v.replace(/[\s.\-()]/g, ''))
  .pipe(
    z
      .string()
      .min(8, 'invalidPhone')
      .max(16, 'invalidPhone')
      .regex(/^\+?[0-9]+$/u, 'invalidPhone'),
  );

export const Email = z
  .string()
  .transform((v) => v.trim().toLowerCase())
  .pipe(z.string().email('invalidEmail'));

export const Quantity = z.coerce
  .number({ invalid_type_error: 'invalidQuantity' })
  .positive('invalidQuantity')
  .max(99999, 'invalidQuantity');
