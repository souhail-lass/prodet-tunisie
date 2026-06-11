import 'server-only';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { getServerEnv } from '@/lib/env';

declare global {
  // Reused across hot reloads in development to prevent connection storms.
  var __prodetDbClient: ReturnType<typeof postgres> | undefined;
}

function makeClient() {
  const env = getServerEnv();
  if (!env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set. The DB client must not be imported by code paths that do not need it.',
    );
  }
  return postgres(env.DATABASE_URL, {
    max: env.NODE_ENV === 'production' ? 10 : 3,
    prepare: false,
  });
}

const client = globalThis.__prodetDbClient ?? makeClient();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__prodetDbClient = client;
}

export const db = drizzle(client, { schema });
export { schema };
