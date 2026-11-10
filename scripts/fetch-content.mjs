// ============================================================
//  Build-Zeit-Inhalts-Abruf
// ------------------------------------------------------------
//  Holt EINMALIG beim Build alle dynamischen Inhalte vom
//  Apps-Script-Backend und schreibt sie nach src/data/content.json.
//
//  Dieses JSON wird dann fest in die Seite eingebacken -> die
//  Website ist beim Aufruf SOFORT da (kein Live-Abruf, kein Spinner).
//
//  Damit geaenderte Sheet-Inhalte sichtbar werden, muss ein neuer
//  Build + Deploy laufen (siehe ANLEITUNG_APPS_SCRIPT.md / CI).
//
//  Wird automatisch vor `next build` ausgefuehrt (npm "prebuild").
// ============================================================

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_FILE = join(ROOT, 'src', 'data', 'content.json');

// --- .env.local minimal einlesen (Node laedt das nicht automatisch) ---
function loadEnv() {
  if (process.env.NEXT_PUBLIC_CONTENT_API_URL) return;
  const envPath = join(ROOT, '.env.local');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

const EMPTY = {
  team: [],
  aktuelles: [],
  faq: [],
  reviews: [],
  overallRating: 0,
  totalReviews: 0,
  generatedAt: null,
};

// --- Bilder lokal ablegen -------------------------------------
//  Team- und Aktuelles-Bilder liegen in Google Drive (lh3.googleusercontent.com).
//  Direkt eingebunden scheitern sie im Browser regelmaessig (Google drosselt
//  bzw. blockt Hotlinks, v. a. bei angemeldeten Google-Konten) und jeder
//  Besuch wuerde Daten an Google senden. Deshalb: beim Build herunterladen,
//  verkleinern und als WebP unter public/ ausliefern. Schlaegt ein Download
//  fehl, bleibt die alte lokale Datei bzw. die Original-URL stehen.
const slug = (s) =>
  String(s || 'bild')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'bild';

async function downloadImage(url, dir, name, width) {
  if (!url || !/^https?:\/\//.test(url)) return url;
  const rel = `/${dir}/${name}.webp`;
  const file = join(ROOT, 'public', dir, `${name}.webp`);
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const sharp = (await import('sharp')).default;
    mkdirSync(dirname(file), { recursive: true });
    await sharp(buf).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(file);
    return rel;
  } catch (err) {
    console.warn(`[content] Bild nicht geladen (${name}): ${err.message}`);
    return existsSync(file) ? rel : url;
  }
}

async function localizeImages(payload) {
  await Promise.all(
    payload.team.map(async (m) => {
      m.image = await downloadImage(m.image, 'team', slug(m.name), 640);
      // Leere bzw. unsichtbare Zeichen (z. B. Zero-Width-Space) aus Kontaktfeldern entfernen
      for (const k of ['email', 'phone', 'area', 'role']) {
        if (typeof m[k] === 'string') m[k] = m[k].replace(/[​-‍﻿]/g, '').trim();
      }
    })
  );
  await Promise.all(
    payload.aktuelles.map(async (a, i) => {
      a.bildname = await downloadImage(a.bildname, 'aktuelles', `${i + 1}-${slug(a.titel)}`, 1400);
    })
  );
}

async function main() {
  loadEnv();
  const base = process.env.NEXT_PUBLIC_CONTENT_API_URL;

  mkdirSync(dirname(OUT_FILE), { recursive: true });

  if (!base) {
    console.warn('[content] NEXT_PUBLIC_CONTENT_API_URL nicht gesetzt – behalte vorhandenes content.json.');
    if (!existsSync(OUT_FILE)) writeFileSync(OUT_FILE, JSON.stringify(EMPTY, null, 2));
    return;
  }

  // nocache=1 -> beim Build die frischesten Daten holen.
  const sep = base.includes('?') ? '&' : '?';
  const url = `${base}${sep}nocache=1`;

  try {
    console.log('[content] Hole Inhalte vom Backend …');
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const payload = {
      team: Array.isArray(data.team) ? data.team : [],
      aktuelles: Array.isArray(data.aktuelles) ? data.aktuelles : [],
      faq: Array.isArray(data.faq) ? data.faq : [],
      reviews: Array.isArray(data.reviews) ? data.reviews : [],
      overallRating: typeof data.overallRating === 'number' ? data.overallRating : 0,
      totalReviews: typeof data.totalReviews === 'number' ? data.totalReviews : 0,
      generatedAt: new Date().toISOString(),
    };

    await localizeImages(payload);
    writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2));
    console.log(
      `[content] OK – Team: ${payload.team.length}, Aktuelles: ${payload.aktuelles.length}, ` +
        `FAQ: ${payload.faq.length}, Bewertungen: ${payload.reviews.length}`
    );
  } catch (err) {
    // Wichtig: bei Fehler NICHT die vorhandenen Daten ueberschreiben.
    console.error(`[content] Fehler beim Abruf (${err.message}).`);
    if (existsSync(OUT_FILE)) {
      console.error('[content] Behalte vorhandenes content.json – Build laeuft mit letzten Daten weiter.');
    } else {
      console.error('[content] Kein vorhandenes content.json – schreibe leeres Geruest.');
      writeFileSync(OUT_FILE, JSON.stringify(EMPTY, null, 2));
    }
  }
}

main();
