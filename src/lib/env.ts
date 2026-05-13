import { z } from 'zod';

const ServerEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_DEFAULT_WHATSAPP_E164: z
    .string()
    .regex(/^\+?[1-9]\d{6,14}$/u, 'Expected E.164 phone (e.g. +21671000000)')
    .optional(),
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
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    NEXT_PUBLIC_DEFAULT_WHATSAPP_E164: process.env.NEXT_PUBLIC_DEFAULT_WHATSAPP_E164,
  });
  return cachedPublic;
}
