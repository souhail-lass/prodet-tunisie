import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // Drizzle-kit commands need this; the runtime app validates via lib/env.ts.
  // We do not throw to keep `drizzle-kit generate` (offline) working.
  console.warn('DATABASE_URL is not set. Set it before running migrate/push/studio.');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/*.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    url: databaseUrl ?? 'postgresql://placeholder@localhost:5432/placeholder',
  },
  strict: true,
  verbose: true,
});
