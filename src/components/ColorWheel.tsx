'use client';

import { useEffect, useRef, useState } from 'react';

/* Farbkreis: Winkel = Farbton, Abstand zur Mitte = Sättigung, Regler darunter = Helligkeit. */

type HSV = { h: number; s: number; v: number };

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const toHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('').toUpperCase();

function hsvToHex({ h, s, v }: HSV) {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return toHex(f(5) * 255, f(3) * 255, f(1) * 255);
}

function hexToHsv(hex: string): HSV {
  const [r, g, b] = hexToRgb(hex).map((x) => x / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max ? d / max : 0, v: max };
}

export const isHex = (s: string) => /^#[0-9a-f]{6}$/i.test(s);

const SIZE = 184;

export default function ColorWheel({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(value));

  // Von aussen geaenderte Farbe uebernehmen (Farbton bei Grau behalten)
  useEffect(() => {
    if (hsvToHex(hsv) !== value.toUpperCase()) {
      const next = hexToHsv(value);
      setHsv((old) => (next.s === 0 ? { ...next, h: old.h } : next));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = c.height = SIZE * dpr;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    const r = SIZE / 2;
    const conic = ctx.createConicGradient(0, r, r);
    for (let i = 0; i <= 12; i++) conic.addColorStop(i / 12, `hsl(${i * 30} 100% 50%)`);
    ctx.beginPath();
    ctx.arc(r, r, r, 0, Math.PI * 2);
    ctx.fillStyle = conic;
    ctx.fill();
    const radial = ctx.createRadialGradient(r, r, 0, r, r, r);
    radial.addColorStop(0, '#fff');
    radial.addColorStop(1, 'rgb(255 255 255 / 0)');
    ctx.fillStyle = radial;
    ctx.fill();
  }, []);

  const update = (next: HSV) => {
    setHsv(next);
    onChange(hsvToHex(next));
  };

  const pick = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const dx = e.clientX - rect.left - rect.width / 2;
    const dy = e.clientY - rect.top - rect.height / 2;
    const h = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
    const s = Math.min(1, Math.hypot(dx, dy) / (rect.width / 2));
    update({ ...hsv, h, s, v: hsv.v || 1 });
  };

  const angle = (hsv.h * Math.PI) / 180;
  const mx = SIZE / 2 + Math.cos(angle) * hsv.s * (SIZE / 2);
  const my = SIZE / 2 + Math.sin(angle) * hsv.s * (SIZE / 2);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <canvas
          ref={canvasRef}
          style={{ width: SIZE, height: SIZE, touchAction: 'none', filter: `brightness(${0.25 + hsv.v * 0.75})` }}
          className="cursor-crosshair rounded-full"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            pick(e);
          }}
          onPointerMove={(e) => e.buttons && pick(e)}
        />
        <span
          className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_0_0_1px_rgba(0,0,0,0.35),0_2px_6px_rgba(0,0,0,0.3)]"
          style={{ left: mx, top: my, background: value }}
        />
      </div>
      <label className="w-full">
        <span className="sr-only">Helligkeit</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(hsv.v * 100)}
          onChange={(e) => update({ ...hsv, v: +e.target.value / 100 })}
          className="color-range w-full"
          style={{ background: `linear-gradient(to right, #000, ${hsvToHex({ ...hsv, v: 1 })})` }}
        />
      </label>
    </div>
  );
}
