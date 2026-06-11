import 'server-only';
import { z } from 'zod';

const ServerEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3004'),
  NEXT_PUBLIC_DEFAULT_WHATSAPP_E164: z
    .string()
    .regex(/^\+?[1-9]\d{6,14}$/u, 'Expected E.164 phone (e.g. +21671000000)')
    .optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  /**
   * Supabase Storage bucket for customer-uploaded documents (PO, invoices,
   * ERP exports, …). Must be created manually with public access disabled.
   */
  SUPABASE_CUSTOMER_DOCUMENTS_BUCKET: z
    .string()
    .min(1)
    .default('customer-documents'),
  /**
   * Swiver ERP integration. `disabled` (default) keeps every Swiver-backed
   * surface in no-op mode. Set to `sandbox` only when the adapter has been
   * pointed at a tenant and the credentials below are populated. See ADR
   * 0012 and `src/integrations/swiver/README.md`.
   */
  SWIVER_MODE: z.enum(['disabled', 'sandbox', 'production']).default('disabled'),
  SWIVER_API_BASE_URL: z.string().url().optional(),
  SWIVER_API_KEY: z.string().min(1).optional(),
  /**
   * Optional shared secret used by the `/api/webhooks/swiver` route to
   * verify incoming webhook signatures. When absent the route still accepts
   * payloads (development) but logs a clear warning and tags the row with
   * `signature_verified = false` so admins can audit it.
   */
  SWIVER_WEBHOOK_SECRET: z.string().min(1).optional(),
  /**
   * Explicit opt-in for the client-portal DEMO preview (renders mock data
   * without a real Supabase session). Security-critical: the auth bypass in
   * the middleware / portal layout activates ONLY when this is `1` AND we are
   * not in production. Never set this in a production environment.
   */
  PORTAL_DEMO_MODE: z.enum(['0', '1']).default('0'),
});

const PublicEnvSchema = ServerEnvSchema.pick({
  NEXT_PUBLIC_SITE_URL: true,
  NEXT_PUBLIC_DEFAULT_WHATSAPP_E164: true,
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;
export type PublicEnv = z.infer<typeof PublicEnvSchema>;

let cachedServer: ServerEnv | null = null;
let cachedPublic: PublicEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cachedServer) return cachedServer;
  const parsed = ServerEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('\n  - ');
    throw new Error(`Invalid environment variables:\n  - ${issues}`);
  }
  cachedServer = parsed.data;
  return cachedServer;
}

export function getPublicEnv(): PublicEnv {
  if (cachedPublic) return cachedPublic;
  cachedPublic = PublicEnvSchema.parse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3004',
    NEXT_PUBLIC_DEFAULT_WHATSAPP_E164: process.env.NEXT_PUBLIC_DEFAULT_WHATSAPP_E164,
  });
  return cachedPublic;
}
