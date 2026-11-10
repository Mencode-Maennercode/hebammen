// ============================================================
//  Build-Zeit-Uebersetzung der Sheet-Inhalte (FAQ, Aktuelles, Bewertungen)
// ------------------------------------------------------------
//  Uebersetzt alle deutschen Texte aus src/data/content.json mit der
//  Gemini-API in die 7 Sprachen der Website und schreibt sie nach
//  src/data/translations.json  ->  { "en": { "<deutscher Text>": "<Uebersetzung>" } }
//
//  - Bereits uebersetzte Texte kommen aus translations.json (Cache, wird
//    mit eingecheckt) - es wird nur Neues uebersetzt. Pro Sprache und Build
//    hoechstens eine Anfrage je ~40 neue Texte; das Gratis-Kontingent von
//    Gemini (Flash: ca. 10 Anfragen/Minute, 250/Tag) reicht damit weit.
//  - Ohne GEMINI_API_KEY oder bei Fehlern bleibt alles wie es ist:
//    die Seite zeigt dann den deutschen Originaltext. Der Build bricht nie ab.
//
//  Key: Umgebungsvariable GEMINI_API_KEY (GitHub-Secret) oder .env.local
// ============================================================

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'src', 'data', 'content.json');
const OUT = join(ROOT, 'src', 'data', 'translations.json');

const LANGS = {
  en: 'English',
  tr: 'Turkish',
  ar: 'Arabic (Modern Standard)',
  ru: 'Russian',
  pl: 'Polish',
  fr: 'French',
  es: 'Spanish',
};
const MODELS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
const BATCH = 40;

function loadEnv() {
  if (process.env.GEMINI_API_KEY) return;
  const p = join(ROOT, '.env.local');
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function callGemini(key, prompt) {
  let lastErr;
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
            }),
          }
        );
        if (res.status === 429 || res.status >= 500) {
          lastErr = new Error(`HTTP ${res.status}`);
          await sleep(8000 * (attempt + 1)); // Minutenlimit der Gratis-Stufe abwarten
          continue;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
        const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
        return JSON.parse(text);
      } catch (e) {
        lastErr = e;
        if (!/HTTP (429|5)/.test(String(e.message))) break; // anderer Fehler -> naechstes Modell
      }
    }
  }
  throw lastErr ?? new Error('unbekannter Fehler');
}

function collect(content) {
  const set = new Set();
  const add = (v) => typeof v === 'string' && /\p{L}/u.test(v) && set.add(v.trim());
  for (const f of content.faq ?? []) { add(f.kategorie); add(f.frage); add(f.antwort); }
  for (const a of content.aktuelles ?? []) { add(a.titel); add(a.text); add(a.kategorie); }
  for (const r of content.reviews ?? []) { add(r.text); add(r.date); }
  return [...set];
}

async function main() {
  loadEnv();
  const key = process.env.GEMINI_API_KEY;
  if (!existsSync(CONTENT)) return;
  const texts = collect(JSON.parse(readFileSync(CONTENT, 'utf8')));
  const cache = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
  for (const l of Object.keys(LANGS)) cache[l] ??= {};

  if (!key) {
    console.warn('[translate] GEMINI_API_KEY nicht gesetzt – nur bereits vorhandene Uebersetzungen werden genutzt.');
    writeFileSync(OUT, JSON.stringify(cache, null, 1));
    return;
  }

  let added = 0;
  for (const [code, name] of Object.entries(LANGS)) {
    const todo = texts.filter((t) => !cache[code][t]);
    for (let i = 0; i < todo.length; i += BATCH) {
      const chunk = todo.slice(i, i + BATCH);
      const prompt =
        `Translate the following German texts from the website of a midwife team at a hospital (warm, friendly, plain language, polite form) into ${name}. ` +
        `Keep names, phone numbers, URLs and e-mail addresses unchanged. Keep line breaks. ` +
        `Return ONLY a JSON array of exactly ${chunk.length} strings, in the same order.\n\n` +
        JSON.stringify(chunk);
      try {
        const out = await callGemini(key, prompt);
        if (!Array.isArray(out) || out.length !== chunk.length) throw new Error('Antwortlaenge passt nicht');
        chunk.forEach((t, k) => {
          if (typeof out[k] === 'string' && out[k].trim()) { cache[code][t] = out[k].trim(); added++; }
        });
      } catch (e) {
        console.warn(`[translate] ${code}: Stapel uebersprungen (${e.message}) – Originaltext bleibt.`);
      }
      await sleep(1500);
    }
  }

  // Verwaiste Eintraege (Text nicht mehr im Sheet) aufraeumen
  const live = new Set(texts);
  for (const l of Object.keys(cache)) for (const t of Object.keys(cache[l])) if (!live.has(t)) delete cache[l][t];

  writeFileSync(OUT, JSON.stringify(cache, null, 1));
  console.log(`[translate] ${added} neue Uebersetzungen, ${texts.length} Texte x ${Object.keys(LANGS).length} Sprachen.`);
}

main().catch((e) => console.error('[translate] Fehler:', e.message));
