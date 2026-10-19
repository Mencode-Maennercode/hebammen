'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, Palette, X } from 'lucide-react';

const STORAGE_KEY = 'hebammen-theme';
const LONG_PRESS_MS = 550;
const MOVE_TOLERANCE = 10;

export const THEMES = [
  {
    id: 'rose',
    name: 'Aktuell',
    hint: 'Rosé, wie bisher',
    swatch: ['#8B5A6B', '#C9A2AD', '#F5E6E8'],
  },
  {
    id: 'logo',
    name: 'Logo-Farben',
    hint: 'Petrol aus dem Logo',
    swatch: ['#086183', '#98BDCB', '#DCEBF1'],
  },
  {
    id: 'glanz',
    name: 'Logo Glanz',
    hint: 'Petrol mit Glanz und Champagner',
    swatch: ['linear-gradient(135deg,#1CA9D4,#0B7099 50%,#05485F)', '#7FD0EA', '#D9B877'],
  },
] as const;

type ThemeId = (typeof THEMES)[number]['id'];

function applyTheme(id: ThemeId) {
  const root = document.documentElement;
  const set = () => {
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
  return THEMES.some((t) => t.id === attr) ? (attr as ThemeId) : 'rose';
}

export default function ThemeSwitcher() {
  const pathname = usePathname() || '/';
  const onVariant = pathname.startsWith('/neu');
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [theme, setTheme] = useState<ThemeId>('rose');
  const [showHint, setShowHint] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const suppressClickUntil = useRef(0);

  const openAt = useCallback((x: number, y: number) => {
    setTheme(readTheme());
    setPos({ x, y });
    setOpen(true);
    setShowHint(false);
  }, []);

  // Gespeichertes Schema / ?theme=... uebernehmen, Hinweis beim ersten Besuch
  useEffect(() => {
    const touch = window.matchMedia('(pointer: coarse)').matches;
    setIsTouch(touch);
    const q = new URLSearchParams(window.location.search).get('theme');
    if (q && THEMES.some((t) => t.id === q)) {
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
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', close);
    return () => {
      clearTimeout(t);
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  // Menue im Viewport halten (Mobil: als Sheet unten)
  const [style, setStyle] = useState<React.CSSProperties>({});
  useEffect(() => {
    if (!open) return;
    const w = Math.min(300, window.innerWidth - 24);
    if (window.innerWidth < 640) {
      setStyle({ left: 12, right: 12, bottom: 12, width: 'auto' });
      return;
    }
    const h = menuRef.current?.offsetHeight ?? 340;
    const left = Math.max(12, Math.min(pos.x, window.innerWidth - w - 12));
    const top = Math.max(12, Math.min(pos.y, window.innerHeight - h - 12));
    setStyle({ left, top, width: w });
  }, [open, pos]);

  const choose = (id: ThemeId) => {
    applyTheme(id);
    setTheme(id);
  };

  return (
    <>
      {showHint && !open && (
        <button
          type="button"
          onClick={() => setShowHint(false)}
          className={`fixed z-[70] left-1/2 -translate-x-1/2 bottom-5 w-max max-w-[calc(100vw-2rem)] text-left flex items-center gap-3 rounded-full px-5 py-3 text-sm font-medium shadow-2xl animate-fade-in-up ${
            onVariant ? 'bg-[#12302A] text-[#F4F6F1]' : 'bg-gray-900 text-white'
          }`}
        >
          <Palette size={18} className="shrink-0" />
          <span>
            {isTouch ? 'Finger lange auf den Bildschirm legen' : 'Rechte Maustaste irgendwo auf der Seite'}
            {onVariant ? ': Designs wechseln' : ': Farbschema ändern'}
          </span>
        </button>
      )}

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Design und Farbschema"
          data-no-theme-menu
          style={style}
          className="fixed z-[80] rounded-3xl border border-black/10 bg-white/95 p-2 text-gray-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] backdrop-blur-xl animate-fade-in-up"
        >
          <div className="flex items-center justify-between px-3 pb-1 pt-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {onVariant ? 'Design' : 'Farbschema'}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Menü schließen"
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>

          {!onVariant &&
            THEMES.map((t) => {
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => choose(t.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${
                    active ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="flex -space-x-2">
                    {t.swatch.map((c, i) => (
                      <span
                        key={i}
                        className="h-7 w-7 rounded-full border-2 border-white shadow"
                        style={{ background: c }}
                      />
                    ))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold leading-tight">{t.name}</span>
                    <span className="block truncate text-xs text-gray-500">{t.hint}</span>
                  </span>
                  {active && <Check size={18} className="shrink-0 text-gray-900" />}
                </button>
              );
            })}

          <div className={`${onVariant ? '' : 'mt-1 border-t border-gray-100 pt-1'}`}>
            <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              {onVariant ? 'Wechseln' : 'Komplett anderes Design'}
            </p>
            {onVariant ? (
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-sm font-semibold hover:bg-gray-50"
              >
                Zurück zum aktuellen Design
                <span aria-hidden>←</span>
              </Link>
            ) : (
              <Link
                href="/neu/"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-between rounded-2xl bg-gray-900 px-3 py-3 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Neues Design ansehen
                <span aria-hidden>→</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
