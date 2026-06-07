'use client';

/**
 * LiveView – Kamera-Livebild mit minimaler Latenz im Browser.
 *
 * Architektur (bewusst middleware-agnostisch):
 *   EOS 700D --USB--> Middleware (digiCamControl ODER Canon EOS Webcam Utility)
 *                     => stellt eine *virtuelle Webcam* bereit
 *   Browser --getUserMedia--> <video srcObject>  (kein Puffer => niedrigste Latenz)
 *
 * Die EOS 700D ist über USB KEINE UVC-Webcam (sie spricht PTP). Ohne eine der
 * o.g. Middlewares taucht hier KEIN Videogerät auf. Die USB-Latenz liegt
 * physikalisch bei ~200-500 ms – das ist eine Kamera-/USB-Grenze, nicht der Code.
 *
 * Reversibel: Schalter steht standardmäßig auf AUS und wird in localStorage
 * gespeichert. Die öffentliche Seite bleibt unberührt. Komplett entfernen =
 * <LiveView/> + Import in page.tsx löschen und diese Datei löschen.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Settings, X, Camera, RefreshCw, AlertTriangle } from 'lucide-react';

const LS_ENABLED = 'liveview.enabled';
const LS_DEVICE = 'liveview.deviceId';
const LS_MIRROR = 'liveview.mirror';

type VideoDev = { deviceId: string; label: string };

export default function LiveView() {
  const [mounted, setMounted] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [mirror, setMirror] = useState(false);
  const [devices, setDevices] = useState<VideoDev[]>([]);
  const [deviceId, setDeviceId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  // --- Einstellungen aus localStorage laden (nur Client) ---
  useEffect(() => {
    setMounted(true);
    try {
      setEnabled(localStorage.getItem(LS_ENABLED) === '1');
      setMirror(localStorage.getItem(LS_MIRROR) === '1');
      setDeviceId(localStorage.getItem(LS_DEVICE) || '');
    } catch {
      /* localStorage evtl. blockiert – ignorieren */
    }
  }, []);

  const persist = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  };

  // --- Stream sauber stoppen ---
  const stopStream = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setFps(0);
  }, []);

  // --- Geräteliste holen (Labels erscheinen erst nach Permission) ---
  const refreshDevices = useCallback(async () => {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      const cams = all
        .filter((d) => d.kind === 'videoinput')
        .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Kamera ${i + 1}` }));
      setDevices(cams);
      return cams;
    } catch {
      return [];
    }
  }, []);

  // --- Stream starten – möglichst latenzarm konfiguriert ---
  const startStream = useCallback(async () => {
    setError(null);
    stopStream();
    try {
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: 'environment' },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Geräteliste mit echten Labels aktualisieren (jetzt da Permission da ist)
      const cams = await refreshDevices();
      if (!deviceId && cams.length) {
        // Bevorzugt eine Kamera, die nach EOS/Canon aussieht
        const preferred =
          cams.find((c) => /eos|canon|webcam utility|digicam/i.test(c.label)) || cams[0];
        setDeviceId(preferred.deviceId);
        persist(LS_DEVICE, preferred.deviceId);
      }

      const v = videoRef.current;
      if (v) {
        v.srcObject = stream;
        // @ts-expect-error – Hinweis an die Engine: Realtime, nicht puffern
        v.playoutDelayHint = 0;
        await v.play().catch(() => {});
      }

      // FPS-Messung via requestVideoFrameCallback (falls verfügbar)
      const vEl = videoRef.current as HTMLVideoElement & {
        requestVideoFrameCallback?: (cb: (now: number) => void) => number;
      };
      if (vEl?.requestVideoFrameCallback) {
        let last = performance.now();
        let frames = 0;
        const tick = () => {
          frames++;
          const now = performance.now();
          if (now - last >= 1000) {
            setFps(frames);
            frames = 0;
            last = now;
          }
          vEl.requestVideoFrameCallback!(tick);
        };
        vEl.requestVideoFrameCallback(tick);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/NotFoundError|Requested device not found/i.test(msg)) {
        setError(
          'Kein Videogerät gefunden. Ist die Middleware (digiCamControl / EOS Webcam Utility) gestartet und die Kamera im LiveView-Modus?',
        );
      } else if (/NotAllowedError|Permission/i.test(msg)) {
        setError('Kamerazugriff verweigert. Bitte im Browser erlauben.');
      } else {
        setError(msg);
      }
    }
  }, [deviceId, refreshDevices, stopStream]);

  // --- Reagiere auf An/Aus + Gerätewechsel ---
  useEffect(() => {
    if (!mounted) return;
    if (enabled) startStream();
    else stopStream();
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, deviceId, mounted]);

  if (!mounted) return null;

  // Settings-Zahnrad nur sichtbar, wenn aktiviert ODER URL ?liveview gesetzt ist.
  const urlEnabled =
    typeof window !== 'undefined' && window.location.search.includes('liveview');
  const showGear = enabled || urlEnabled || panelOpen;
  if (!showGear) return null;

  return (
    <>
      {/* Livebild-Overlay */}
      {enabled && (
        <div className="fixed bottom-16 left-3 z-[60] w-[320px] max-w-[80vw] rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-auto block bg-black"
            style={{ transform: mirror ? 'scaleX(-1)' : 'none' }}
          />
          <div className="absolute top-2 left-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-red-600/90 px-2 py-0.5 text-[11px] font-medium text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> LIVE
            </span>
            {fps > 0 && (
              <span className="rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white/90">
                {fps} fps
              </span>
            )}
          </div>
          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/80">
              <p className="flex items-start gap-2 text-xs text-amber-300">
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Zahnrad */}
      <button
        onClick={() => setPanelOpen((o) => !o)}
        aria-label="LiveView-Einstellungen"
        className="fixed bottom-3 left-3 z-[61] h-10 w-10 rounded-full bg-[#8B5A6B] text-white shadow-lg hover:bg-[#6B4453] transition-colors flex items-center justify-center"
      >
        {panelOpen ? <X size={18} /> : <Settings size={18} />}
      </button>

      {/* Settings-Panel */}
      {panelOpen && (
        <div className="fixed bottom-16 left-3 z-[61] w-[320px] max-w-[80vw] rounded-2xl bg-white shadow-2xl border border-gray-200 p-4 space-y-4">
          <div className="flex items-center gap-2 text-gray-900">
            <Camera size={18} className="text-[#8B5A6B]" />
            <h3 className="font-semibold">Kamera-LiveView</h3>
          </div>

          {/* An/Aus */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-700">LiveView aktivieren</span>
            <button
              role="switch"
              aria-checked={enabled}
              onClick={() => {
                const next = !enabled;
                setEnabled(next);
                persist(LS_ENABLED, next ? '1' : '0');
              }}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                enabled ? 'bg-[#8B5A6B]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  enabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </label>

          {/* Geräte-Auswahl */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Videoquelle</span>
              <button
                onClick={refreshDevices}
                className="inline-flex items-center gap-1 text-xs text-[#8B5A6B] hover:text-[#6B4453]"
              >
                <RefreshCw size={12} /> neu laden
              </button>
            </div>
            <select
              value={deviceId}
              onChange={(e) => {
                setDeviceId(e.target.value);
                persist(LS_DEVICE, e.target.value);
              }}
              className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-800"
            >
              {devices.length === 0 && <option value="">— keine Geräte gefunden —</option>}
              {devices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Spiegeln */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-700">Bild spiegeln</span>
            <input
              type="checkbox"
              checked={mirror}
              onChange={(e) => {
                setMirror(e.target.checked);
                persist(LS_MIRROR, e.target.checked ? '1' : '0');
              }}
              className="h-4 w-4 accent-[#8B5A6B]"
            />
          </label>

          <p className="text-[11px] leading-snug text-gray-400 border-t border-gray-100 pt-3">
            USB-LiveView braucht eine Middleware (digiCamControl oder Canon EOS
            Webcam Utility), die die EOS 700D als Webcam bereitstellt. Latenz
            über USB: ~200–500&nbsp;ms. Für weniger Latenz: HDMI + Capture-Card.
          </p>
        </div>
      )}
    </>
  );
}
