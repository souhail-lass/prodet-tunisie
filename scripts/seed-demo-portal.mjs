#!/usr/bin/env node
// Run scripts/seed-demo-portal.sql against DATABASE_URL.
// Usage: node --env-file=.env.local scripts/seed-demo-portal.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const sqlPath = join(__dirname, 'seed-demo-portal.sql');
const sqlBody = readFileSync(sqlPath, 'utf8');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Run with --env-file=.env.local');
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

try {
  await sql.unsafe(sqlBody);
  console.log('Seed applied successfully.');
} catch (error) {
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
