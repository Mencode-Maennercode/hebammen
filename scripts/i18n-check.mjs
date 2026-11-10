// Prueft, ob alle t("...")-Texte in jeder Sprache uebersetzt sind.
// Aufruf: node scripts/i18n-check.mjs [--keys]   (--keys gibt nur die Schluessel als JSON aus)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');

const files = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!['_api_backup', 'i18n'].includes(e.name)) walk(p); }
    else if (/\.tsx?$/.test(e.name)) files.push(p);
  }
};
walk(SRC);

const keys = new Set();
for (const f of files) {
  const sf = ts.createSourceFile(f, fs.readFileSync(f, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = (n) => {
    if (ts.isCallExpression(n) && n.expression.getText() === 't' && n.arguments[0] && ts.isStringLiteralLike(n.arguments[0])) keys.add(n.arguments[0].text);
    ts.forEachChild(n, visit);
  };
  visit(sf);
}
// Daten-Arrays in page.tsx, die per t(variable) uebersetzt werden
const page = fs.readFileSync(path.join(SRC, 'app', 'page.tsx'), 'utf8');
for (const m of page.matchAll(/(?:label|title|description): "([^"]+)"/g)) keys.add(m[1]);
for (const m of fs.readFileSync(path.join(SRC, 'components', 'ThemeSwitcher.tsx'), 'utf8').matchAll(/name: '([^']+)'/g)) keys.add(m[1]);

const sorted = [...keys].sort();
if (process.argv.includes('--keys')) { console.log(JSON.stringify(sorted, null, 1)); process.exit(0); }

let missingTotal = 0;
for (const lang of ['en', 'tr', 'ar', 'ru', 'pl', 'fr', 'es']) {
  const txt = fs.readFileSync(path.join(SRC, 'i18n', 'translations', `${lang}.ts`), 'utf8');
  const dict = new Set([...txt.matchAll(/^\s*("(?:[^"\\]|\\.)*"):/gm)].map((m) => JSON.parse(m[1])));
  const missing = sorted.filter((k) => !dict.has(k));
  const unused = [...dict].filter((k) => !keys.has(k));
  missingTotal += missing.length;
  console.log(`${lang}: ${sorted.length - missing.length}/${sorted.length}` + (missing.length ? `  FEHLT: ${missing.map((k) => k.slice(0, 50)).join(' | ')}` : '') + (unused.length ? `  (unbenutzt: ${unused.length})` : ''));
}
process.exit(missingTotal ? 1 : 0);
