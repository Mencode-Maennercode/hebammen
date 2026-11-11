'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Palette, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import ColorWheel, { hexToRgb, isHex } from './ColorWheel';

const STORAGE_KEY = 'hebammen-theme';
const LONG_PRESS_MS = 550;
const MOVE_TOLERANCE = 10;

export const THEMES = [
  { id: 'rose', name: 'Aktuell', swatch: ['#8B5A6B', '#C9A2AD', '#F5E6E8'] },
  { id: 'logo', name: 'Logo-Farben', swatch: ['#086183', '#98BDCB', '#DCEBF1'] },
  { id: 'sand', name: 'Sand', swatch: ['#7F6D5E', '#C9BDB0', '#F0EBE4'] },
  { id: 'beige', name: 'Beige', swatch: ['#94806A', '#DCCFBD', '#F6EFE4'] },
  { id: 'champagner', name: 'Champagner', swatch: ['#B39B72', '#E9DDC3', '#FBF5E6'] },
  { id: 'petrolsand', name: 'Petrol & Sand', swatch: ['#0E5A6B', '#C9A872', '#F1E8D8'] },
] as const;

type ThemeId = (typeof THEMES)[number]['id'] | 'custom';

/* ---------- Eigenes Farbschema ---------- */
const CUSTOM_KEY = 'hebammen-custom';
const SAVED_KEY = 'hebammen-schemes';

const FIELDS = [
  { key: '--brand', label: 'Hauptfarbe' },
  { key: '--brand-dark', label: 'Dunkel' },
  { key: '--brand-light', label: 'Hell' },
  { key: '--brand-soft', label: 'Fläche' },
  { key: '--brand-cream', label: 'Hintergrund' },
  { key: '--brand-gold', label: 'Akzent' },
  { key: '--foreground', label: 'Text' },
  { key: '--video', label: 'Video' },
] as const;

type FieldKey = (typeof FIELDS)[number]['key'];
type Colors = Record<FieldKey, string> & { videoStrength: number };
type Saved = { id: string; name: string; colors: Colors };

const rgbVar = (hex: string) => hexToRgb(hex).join(' ');

// Alle CSS-Variablen des eigenen Schemas (layout.tsx setzt sie vor dem ersten Rendern)
function cssVars(c: Colors): Record<string, string> {
  const vars: Record<string, string> = {};
  FIELDS.forEach((f) => (vars[f.key] = c[f.key]));
  vars['--brand-rgb'] = rgbVar(c['--brand']);
  vars['--brand-dark-rgb'] = rgbVar(c['--brand-dark']);
  vars['--video-rgb'] = rgbVar(c['--video']);
  vars['--video-a'] = String(c.videoStrength / 100);
  return vars;
}

const CUSTOM_VAR_NAMES = [
  ...FIELDS.map((f) => f.key),
  '--brand-rgb',
  '--brand-dark-rgb',
  '--video-rgb',
  '--video-a',
];

function setCustomVars(c: Colors | null) {
  const root = document.documentElement;
  CUSTOM_VAR_NAMES.forEach((k) => root.style.removeProperty(k));
  if (c) Object.entries(cssVars(c)).forEach(([k, v]) => root.style.setProperty(k, v));
}

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function storeCustom(c: Colors) {
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(c));
    localStorage.setItem(CUSTOM_KEY + '-vars', JSON.stringify(cssVars(c)));
  } catch {}
}

// Startwerte = die gerade sichtbaren Farben
function currentColors(): Colors {
  const cs = getComputedStyle(document.documentElement);
  const read = (k: string, fb: string) => {
    const v = cs.getPropertyValue(k).trim().toUpperCase();
    return isHex(v) ? v : fb;
  };
  const c = Object.fromEntries(FIELDS.map((f) => [f.key, read(f.key, "#1A1A2E")])) as unknown as Colors;
  c['--video'] = read('--video', c['--brand-dark']);
  c.videoStrength = 45;
  return c;
}

const sameColors = (a: Colors, b: Colors) => JSON.stringify(a) === JSON.stringify(b);

function applyTheme(id: ThemeId) {
  const root = document.documentElement;
  const set = () => {
    if (id === 'custom') {
      setCustomVars(load<Colors>(CUSTOM_KEY) ?? currentColors());
      root.setAttribute('data-theme', 'custom');
      return;
    }
    setCustomVars(null);
    if (id === 'rose') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', id);
  };
  // Weicher Uebergang, wo der Browser View Transitions kennt.
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (doc.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    doc.startViewTransition(set);
  } else {
    set();
  }
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {}
}

function readTheme(): ThemeId {
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'custom' || THEMES.some((t) => t.id === attr) ? (attr as ThemeId) : 'rose';
}

export default function ThemeSwitcher() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [theme, setTheme] = useState<ThemeId>('rose');
  const [showHint, setShowHint] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const suppressClickUntil = useRef(0);
  const [editing, setEditing] = useState(false);
  const [custom, setCustom] = useState<Colors | null>(null);
  const [field, setField] = useState<FieldKey>('--brand');
  const [hexDraft, setHexDraft] = useState('');
  const [saved, setSaved] = useState<Saved[]>([]);
  const [saveName, setSaveName] = useState('');

  const openAt = useCallback((x: number, y: number) => {
    setTheme(readTheme());
    setSaved(load<Saved[]>(SAVED_KEY) ?? []);
    setCustom(load<Colors>(CUSTOM_KEY));
    setPos({ x, y });
    setOpen(true);
    setShowHint(false);
  }, []);

  // Gespeichertes Schema / ?theme=... uebernehmen, Hinweis beim ersten Besuch
  useEffect(() => {
    const touch = window.matchMedia('(pointer: coarse)').matches;
    setIsTouch(touch);
    const q = new URLSearchParams(window.location.search).get('theme');
    if (q && THEMES.some((th) => th.id === q)) {
      applyTheme(q as ThemeId);
    }
    setTheme(readTheme());
    let seen = false;
    try {
      seen = localStorage.getItem('hebammen-hint') === '1';
    } catch {}
    if (!seen) {
      const t1 = setTimeout(() => setShowHint(true), 1800);
      const t2 = setTimeout(() => setShowHint(false), 11000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, []);

  useEffect(() => {
    if (!showHint) return;
    try {
      localStorage.setItem('hebammen-hint', '1');
    } catch {}
  }, [showHint]);

  // Rechtsklick + langer Fingerdruck
  useEffect(() => {
    const blocked = (el: EventTarget | null) =>
      el instanceof Element && !!el.closest('input, textarea, select, [contenteditable="true"], [data-no-theme-menu]');

    const onContext = (e: MouseEvent) => {
      if (blocked(e.target)) return;
      e.preventDefault();
      openAt(e.clientX, e.clientY);
    };

    let timer: ReturnType<typeof setTimeout> | null = null;
    let start = { x: 0, y: 0 };
    const cancel = () => {
      if (timer) clearTimeout(timer);
      timer = null;
    };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || blocked(e.target)) return;
      const t = e.touches[0];
      start = { x: t.clientX, y: t.clientY };
      cancel();
      timer = setTimeout(() => {
        suppressClickUntil.current = Date.now() + 700;
        navigator.vibrate?.(15);
        openAt(start.x, start.y);
      }, LONG_PRESS_MS);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (Math.hypot(t.clientX - start.x, t.clientY - start.y) > MOVE_TOLERANCE) cancel();
    };
    const onClickCapture = (e: MouseEvent) => {
      if (Date.now() < suppressClickUntil.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('contextmenu', onContext);
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', cancel);
    document.addEventListener('touchcancel', cancel);
    document.addEventListener('click', onClickCapture, true);
    return () => {
      cancel();
      document.removeEventListener('contextmenu', onContext);
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', cancel);
      document.removeEventListener('touchcancel', cancel);
      document.removeEventListener('click', onClickCapture, true);
    };
  }, [openAt]);

  // Schliessen: Escape, Klick daneben, Scrollen
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const onDown = (e: Event) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        if (Date.now() < suppressClickUntil.current) return;
        close();
      }
    };
    const t = setTimeout(() => {
      document.addEventListener('pointerdown', onDown);
    }, 50);
    // Nur bei Breitenaenderung schliessen – die Handy-Tastatur aendert nur die Hoehe
    const startW = window.innerWidth;
    const onResize = () => window.innerWidth !== startW && close();
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(t);
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  // Menue im Viewport halten (Mobil: als Sheet unten)
  const [style, setStyle] = useState<React.CSSProperties>({});
  useEffect(() => {
    if (!open) return;
    const w = Math.min(340, window.innerWidth - 24);
    if (window.innerWidth < 640) {
      setStyle({ left: 12, right: 12, bottom: 12, width: 'auto' });
      return;
    }
    const h = menuRef.current?.offsetHeight ?? 340;
    const left = Math.max(12, Math.min(pos.x, window.innerWidth - w - 12));
    const top = Math.max(12, Math.min(pos.y, window.innerHeight - h - 12));
    setStyle({ left, top, width: w });
  }, [open, pos, editing]);

  const choose = (id: ThemeId) => {
    applyTheme(id);
    setTheme(id);
    setEditing(false);
  };

  // Jede Aenderung sofort sichtbar, ohne Bestaetigen
  const updateCustom = (c: Colors) => {
    setCustom(c);
    storeCustom(c);
    setCustomVars(c);
    document.documentElement.setAttribute('data-theme', 'custom');
    setTheme('custom');
    try {
      localStorage.setItem(STORAGE_KEY, 'custom');
    } catch {}
  };

  const startEditing = () => {
    if (editing) return setEditing(false);
    const base = theme === 'custom' && custom ? custom : currentColors();
    updateCustom(base);
    setHexDraft(base[field]);
    setEditing(true);
  };

  const selectField = (k: FieldKey) => {
    setField(k);
    if (custom) setHexDraft(custom[k]);
  };

  const setColor = (hex: string) => {
    if (!custom) return;
    setHexDraft(hex);
    updateCustom({ ...custom, [field]: hex });
  };

  const persistSaved = (list: Saved[]) => {
    setSaved(list);
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(list));
    } catch {}
  };

  const saveScheme = () => {
    if (!custom) return;
    const name = saveName.trim() || `Variante ${saved.length + 1}`;
    persistSaved([...saved, { id: Date.now().toString(36), name, colors: custom }]);
    setSaveName('');
  };

  const chooseSaved = (sv: Saved) => {
    updateCustom(sv.colors);
    setHexDraft(sv.colors[field]);
  };

  return (
    <>
      {showHint && !open && (
        <button
          type="button"
          onClick={() => setShowHint(false)}
          className="fixed z-[70] left-1/2 -translate-x-1/2 bottom-5 w-max max-w-[calc(100vw-2rem)] text-left flex items-center gap-3 rounded-full px-5 py-3 text-sm font-medium shadow-2xl animate-fade-in-up bg-gray-900 text-white"
        >
          <Palette size={18} className="shrink-0" />
          <span>
            {isTouch ? t("Finger lange auf den Bildschirm legen") : t("Rechte Maustaste irgendwo auf der Seite")}
            {": "}{t("Farbschema ändern")}
          </span>
        </button>
      )}

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={t("Farbschema")}
          data-no-theme-menu
          style={style}
          className="fixed z-[80] max-h-[calc(100dvh-24px)] overflow-y-auto overscroll-contain rounded-3xl border border-black/10 bg-white/95 p-2 text-gray-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] backdrop-blur-xl animate-fade-in-up"
        >
          <div className="flex items-center justify-between px-3 pb-1 pt-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {t("Farbschema")}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("Menü schließen")}
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 px-1 pb-1">
              {THEMES.map((th) => {
                const active = theme === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => choose(th.id)}
                    className={`flex items-center gap-2.5 rounded-2xl px-2.5 py-2.5 text-left transition-colors ${
                      active ? 'bg-gray-100 ring-1 ring-gray-300' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex shrink-0 -space-x-2">
                      {th.swatch.map((c, i) => (
                        <span key={i} className="h-6 w-6 rounded-full border-2 border-white shadow" style={{ background: c }} />
                      ))}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight">{t(th.name)}</span>
                    {active && <Check size={16} className="shrink-0 text-gray-900" />}
                  </button>
                );
              })}
              {saved.map((sv) => {
                const active = theme === 'custom' && !!custom && sameColors(custom, sv.colors);
                return (
                  <div
                    key={sv.id}
                    className={`flex items-center gap-2 rounded-2xl px-2.5 py-2.5 transition-colors ${
                      active ? 'bg-gray-100 ring-1 ring-gray-300' : 'hover:bg-gray-50'
                    }`}
                  >
                    <button type="button" onClick={() => chooseSaved(sv)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                      <span className="flex shrink-0 -space-x-2">
                        {[sv.colors['--brand'], sv.colors['--brand-light'], sv.colors['--brand-soft']].map((c, i) => (
                          <span key={i} className="h-6 w-6 rounded-full border-2 border-white shadow" style={{ background: c }} />
                        ))}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight">{sv.name}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`${sv.name} löschen`}
                      onClick={() => persistSaved(saved.filter((x) => x.id !== sv.id))}
                      className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
          </div>

          <button
            type="button"
            onClick={startEditing}
            aria-expanded={editing}
            className={`mx-1 mb-1 flex w-[calc(100%-0.5rem)] items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              editing || theme === 'custom' ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <SlidersHorizontal size={16} />
            Individuell
            {theme === 'custom' && !editing && <Check size={16} className="ml-auto" />}
          </button>

          {editing && custom && (
            <div className="mx-1 mb-1 rounded-2xl bg-gray-50 p-3">
              <div className="grid grid-cols-2 gap-1">
                {FIELDS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => selectField(f.key)}
                    className={`flex items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-colors ${
                      field === f.key ? 'bg-white shadow ring-1 ring-gray-300' : 'hover:bg-white/70'
                    }`}
                  >
                    <span className="h-5 w-5 shrink-0 rounded-full border border-black/10" style={{ background: custom[f.key] }} />
                    <span className="min-w-0 leading-tight">
                      <span className="block truncate text-xs font-semibold">{f.label}</span>
                      <span className="block font-mono text-[11px] text-gray-500">{custom[f.key]}</span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-3">
                <ColorWheel value={custom[field]} onChange={setColor} />
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">Hex</span>
                  <input
                    value={hexDraft}
                    onChange={(e) => {
                      let v = e.target.value.trim().toUpperCase();
                      if (v && !v.startsWith('#')) v = '#' + v;
                      setHexDraft(v);
                      if (isHex(v)) updateCustom({ ...custom, [field]: v });
                    }}
                    onFocus={(e) => e.target.select()}
                    maxLength={7}
                    spellCheck={false}
                    className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1 font-mono text-sm uppercase"
                  />
                </div>
                {field === '--video' && (
                  <label className="mt-3 block">
                    <span className="flex justify-between text-xs font-semibold text-gray-500">
                      Stärke des Farbfilters <span>{custom.videoStrength} %</span>
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={90}
                      value={custom.videoStrength}
                      onChange={(e) => updateCustom({ ...custom, videoStrength: +e.target.value })}
                      className="mt-1 w-full accent-gray-900"
                    />
                  </label>
                )}
              </div>

              <form
                className="mt-3 flex gap-2 border-t border-gray-200 pt-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  saveScheme();
                }}
              >
                <input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder={`Variante ${saved.length + 1}`}
                  aria-label="Name des Farbschemas"
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm"
                />
                <button type="submit" className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white">
                  Speichern
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}
