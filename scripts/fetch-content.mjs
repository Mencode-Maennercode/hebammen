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
