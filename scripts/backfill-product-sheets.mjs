#!/usr/bin/env node
// Rattache les fiches techniques et les FDS commitées dans public/downloads/
// aux lignes catalogue_product, en rapprochant par nom normalisé.
//
// Le catalogue public lit la base (Swiver sync + overrides admin), pas les
// fixtures : sans ce backfill les fichiers sont en ligne mais aucune fiche
// produit ne les affiche.
//
// Usage : node --env-file=.env.local scripts/backfill-product-sheets.mjs [--dry]
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import postgres from 'postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public', 'downloads');
const dry = process.argv.includes('--dry');

/** "Prolax 100" / "PROLAX-100 " -> "prolax100" : robuste aux libellés Swiver. */
const norm = (s) =>
  (s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

/** slug de fichier -> URL publique, indexé par nom normalisé. */
function indexDir(sub) {
  const out = new Map();
  for (const file of readdirSync(join(publicDir, sub))) {
    const slug = file.replace(/\.[^.]+$/, '');
    out.set(norm(slug), `/downloads/${sub}/${file}`);
  }
  return out;
}

const tech = indexDir('technical-sheets');
const safety = indexDir('safety-sheets');

// Pronet Plus n'a pas de FDS propre : sa section est dans le fichier Pronet.
safety.set('pronetplus', safety.get('pronet'));

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Run with --env-file=.env.local');
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

try {
  const rows = await sql`
    SELECT id, name, display_name, technical_sheet_url, safety_sheet_url
    FROM public.catalogue_product
  `;

  let updated = 0;
  const unmatched = [];

  for (const row of rows) {
    const key = norm(row.display_name || row.name);
    const t = tech.get(key) ?? null;
    const s = safety.get(key) ?? null;
    if (!t && !s) {
      unmatched.push(row.display_name || row.name);
      continue;
    }
    // On ne remplace jamais une URL déjà posée à la main depuis l'admin.
    const nextT = row.technical_sheet_url ?? t;
    const nextS = row.safety_sheet_url ?? s;
    if (nextT === row.technical_sheet_url && nextS === row.safety_sheet_url) continue;

    console.log(`${dry ? '[dry] ' : ''}${row.display_name || row.name}`);
    if (nextT !== row.technical_sheet_url) console.log(`   FT  ${nextT}`);
    if (nextS !== row.safety_sheet_url) console.log(`   FDS ${nextS}`);
    updated += 1;

    if (!dry) {
      await sql`
        UPDATE public.catalogue_product
        SET technical_sheet_url = ${nextT}, safety_sheet_url = ${nextS}
        WHERE id = ${row.id}
      `;
    }
  }

  console.log(`\n${updated} produit(s) ${dry ? 'à mettre à jour' : 'mis à jour'} sur ${rows.length}.`);
  if (unmatched.length) {
    console.log(`\nSans document (${unmatched.length}) :`);
    for (const name of unmatched.sort()) console.log(`  - ${name}`);
  }
} catch (error) {
  console.error('Backfill failed:', error.message);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
