// ============================================================
//  Build-Zeit-Abruf des Instagram-Feeds
// ------------------------------------------------------------
//  Holt beim Build die neuesten Beitraege von
//  @hebammen_marienhospital_bonn ueber die "Instagram API with
//  Instagram Login" (funktioniert mit Creator- und Business-Konten)
//  und schreibt sie nach src/data/instagram.json.
//
//  Die Bilder werden heruntergeladen und unter public/instagram/
//  ausgeliefert: Die media_url von Instagram ist signiert und laeuft
//  nach wenigen Tagen ab, ausserdem laedt der Browser der Besucher so
//  nichts von Meta-Servern (keine Einwilligung noetig).
//
//  Token: GitHub-Secret INSTAGRAM_ACCESS_TOKEN (Long-Lived, 60 Tage).
//  Jeder Build verlaengert ihn ueber /refresh_access_token um weitere
//  60 Tage - zusaetzlich laeuft monatlich .github/workflows/instagram-token.yml.
//
//  Ohne Token oder bei Fehlern bleibt das vorhandene instagram.json
//  unveraendert - der Build schlaegt dadurch nie fehl.
// ============================================================

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_FILE = join(ROOT, 'src', 'data', 'instagram.json');
const IMG_DIR = join(ROOT, 'public', 'instagram');
const MAX_POSTS = 8;
const API = 'https://graph.instagram.com';

function loadEnv() {
  if (process.env.INSTAGRAM_ACCESS_TOKEN) return;
  const envPath = join(ROOT, '.env.local');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

async function getJson(url) {
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
  return data;
}

async function main() {
  loadEnv();
  mkdirSync(dirname(OUT_FILE), { recursive: true });
  if (!existsSync(OUT_FILE)) writeFileSync(OUT_FILE, JSON.stringify({ username: null, posts: [], updatedAt: null }, null, 2));

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    console.warn('[instagram] INSTAGRAM_ACCESS_TOKEN nicht gesetzt – behalte vorhandenes instagram.json.');
    return;
  }

  try {
    // Laufzeit verlaengern (geht erst, wenn der Token mind. 24 h alt ist).
    try {
      const r = await getJson(`${API}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`);
      const days = Math.round((r.expires_in || 0) / 86400);
      console.log(`[instagram] Token verlaengert (gueltig noch ca. ${days} Tage).`);
      if (r.access_token && r.access_token !== token) {
        console.warn('[instagram] ACHTUNG: Instagram hat einen NEUEN Token ausgegeben – Secret INSTAGRAM_ACCESS_TOKEN muss aktualisiert werden.');
      }
    } catch (e) {
      console.log(`[instagram] Token nicht verlaengert (${e.message}).`);
    }

    const me = await getJson(`${API}/me?fields=username&access_token=${encodeURIComponent(token)}`);
    const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
    const media = await getJson(`${API}/me/media?fields=${fields}&limit=${MAX_POSTS}&access_token=${encodeURIComponent(token)}`);

    const sharp = (await import('sharp')).default;
    mkdirSync(IMG_DIR, { recursive: true });
    const posts = [];
    for (const m of media.data || []) {
      const src = m.media_type === 'VIDEO' ? m.thumbnail_url : m.media_url;
      if (!src) continue;
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        await sharp(buf).resize(600, 600, { fit: 'cover' }).webp({ quality: 78 }).toFile(join(IMG_DIR, `${m.id}.webp`));
        posts.push({
          id: m.id,
          image: `/instagram/${m.id}.webp`,
          caption: (m.caption || '').slice(0, 300),
          permalink: m.permalink,
          type: m.media_type,
          timestamp: m.timestamp,
        });
      } catch (e) {
        console.warn(`[instagram] Bild ${m.id} uebersprungen (${e.message}).`);
      }
    }

    // Alte Bilder aufraeumen, die nicht mehr im Feed sind
    const keep = new Set(posts.map((p) => `${p.id}.webp`));
    for (const f of readdirSync(IMG_DIR)) if (!keep.has(f)) unlinkSync(join(IMG_DIR, f));

    writeFileSync(OUT_FILE, JSON.stringify({ username: me.username, posts, updatedAt: new Date().toISOString() }, null, 2));
    console.log(`[instagram] OK – ${posts.length} Beitraege von @${me.username}.`);
  } catch (err) {
    console.error(`[instagram] Fehler (${err.message}) – behalte vorhandenes instagram.json.`);
  }
}

main();
