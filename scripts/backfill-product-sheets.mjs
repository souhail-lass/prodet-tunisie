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

/**
 * Les libellés en base viennent de Swiver et portent le conditionnement :
 * "ALCOGEL ANTISEPTIQUE 500ML", "PROLAX 100 BIDON 20KG". On compare donc des
 * SUITES DE MOTS, pas des chaînes : un produit correspond si son nom est un
 * préfixe de mots du libellé Swiver.
 *
 * Comparer les chaînes brutes casserait les frontières de mots — "prolax100"
 * est un préfixe de "prolax1000". En tokens, ["prolax","100"] ne l'est pas.
 */
const tokens = (s) =>
  (s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

const isPrefix = (needle, hay) =>
  needle.length <= hay.length && needle.every((t, i) => t === hay[i]);

/** slug de fichier -> URL publique. */
function indexDir(sub) {
  const out = new Map();
  for (const file of readdirSync(join(publicDir, sub))) {
    out.set(file.replace(/\.[^.]+$/, ''), `/downloads/${sub}/${file}`);
  }
  return out;
}

const tech = indexDir('technical-sheets');
const safety = indexDir('safety-sheets');

// Pronet Plus n'a pas de FDS propre : sa section est dans le fichier Pronet.
safety.set('pronet-plus', safety.get('pronet'));

/**
 * Candidats triés du plus spécifique au moins spécifique : "PRONET PLUS ..."
 * doit tomber sur pronet-plus et non sur pronet, et "JAVEL PRODET 30° ..." sur
 * la fiche 30° et non sur celle à 12°.
 */
const candidates = [...new Set([...tech.keys(), ...safety.keys()])]
  .map((slug) => ({ slug, words: tokens(slug) }))
  .sort((a, b) => b.words.length - a.words.length);

/**
 * Produits distincts qui n'ont encore AUCUN document. Sans cette réserve, un
 * nom plus court les capterait : "DEOFRESH LINGE" tomberait sur la fiche
 * DEOFRESH, qui est le désodorisant d'ambiance — un autre produit. Mieux vaut
 * aucune fiche qu'une fiche fausse. À retirer d'ici dès que le document arrive.
 */
const RESERVED = ['deofresh linge', 'gresil prodet'].map(tokens);

function matchSlug(name) {
  const words = tokens(name);
  const hit = candidates.find((c) => isPrefix(c.words, words));
  if (!hit) return null;
  const reserved = RESERVED.find((r) => isPrefix(r, words));
  if (reserved && reserved.length > hit.words.length) return null;
  return hit.slug;
}

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
    const label = row.display_name || row.name;
    const slug = matchSlug(label);
    const t = slug ? (tech.get(slug) ?? null) : null;
    const s = slug ? (safety.get(slug) ?? null) : null;
    if (!t && !s) {
      unmatched.push(label);
      continue;
    }
    // On ne remplace jamais une URL déjà posée à la main depuis l'admin.
    const nextT = row.technical_sheet_url ?? t;
    const nextS = row.safety_sheet_url ?? s;
    if (nextT === row.technical_sheet_url && nextS === row.safety_sheet_url) continue;

    console.log(`${dry ? '[dry] ' : ''}${label}  ->  ${slug}`);
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
