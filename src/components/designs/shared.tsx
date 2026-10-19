'use client';

// Gemeinsame Bausteine für die alternativen Designs (Magazin, Sanft, Nacht):
// Inhalte, Hilfsfunktionen, Detail-Fenster (Sheets) und das Scroll-Setup.

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Envelope, MapPin, Phone, X } from '@phosphor-icons/react';
import content from '@/data/content.json';
import { BASE_PATH, SERVICES, MARQUEE_WORDS, type Service } from '../neu/neu-data';
import './designs.css';

export { BASE_PATH, SERVICES, MARQUEE_WORDS };
export type { Service };

export const LOGO_URL =
  'https://static.wixstatic.com/media/446934_56e43f0c28704f46bb3b1b221dee9a3f~mv2.png/v1/fill/w_209,h_205,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/446934_56e43f0c28704f46bb3b1b221dee9a3f~mv2.png';
export const HERO_VIDEO = `${BASE_PATH}/4314408-hd_1920_1080_24fps (1).mp4`;
export const GROUP_PHOTO = `${BASE_PATH}/Hebammen Bilder/Gruppe.avif`;
export const PHONE = '0228 - 505 2205';
export const PHONE_HREF = 'tel:+492285052205';
export const MAIL = 'info@hebammen-marienhospital-bonn.de';
export const INSTAGRAM = 'https://www.instagram.com/hebammen_marienhospital_bonn';
export const ADDRESS_1 = 'Robert-Koch-Straße 1';
export const ADDRESS_2 = '53115 Bonn';
export const MAP_SRC =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2517.9376!2d7.1044!3d50.7264!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bee17b0c5d5f0b%3A0x5e0b3c5b5c5b5c5b!2sRobert-Koch-Stra%C3%9Fe%201%2C%2053115%20Bonn!5e0!3m2!1sde!2sde!4v1234567890';

export type TeamMember = {
  name: string;
  role: string;
  area?: string;
  phone?: string;
  email?: string;
  image?: string;
};
export type FaqItem = { frage: string; antwort: string; kategorie?: string };
export type NewsItem = { titel: string; text: string; datum: string; kategorie?: string };
export type Review = { name: string; rating: number; text: string; date: string };

export const team = content.team as TeamMember[];
export const faq = (content.faq as FaqItem[]) ?? [];
export const news = [...((content.aktuelles as NewsItem[]) ?? [])].sort(
  (a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime()
);
export const reviews = (content.reviews as Review[]) ?? [];
export const rating = content.overallRating || 5;
export const totalReviews = content.totalReviews || reviews.length;
export const ratingText = Number(rating).toFixed(1).replace('.', ',');

export const STATEMENT =
  'Wir sind Hebammen in Bonn und arbeiten im Dienstbelegsystem im Marienhospital Bonn. Jede Geburt ist einzigartig, und Ihr Wohlbefinden und das Ihres Kindes stehen dabei immer im Mittelpunkt.';
export const ABOUT_TEXT =
  'Unser Team vereint langjährige Erfahrung mit modernsten Methoden der Geburtshilfe. Wir verstehen es als unsere Aufgabe, Sie individuell und einfühlsam durch diese besondere Zeit zu begleiten.';

export const NAV = [
  { id: 'leistungen', label: 'Leistungen' },
  { id: 'team', label: 'Team' },
  { id: 'ueber-uns', label: 'Über uns' },
  { id: 'aktuelles', label: 'Aktuelles' },
  { id: 'kontakt', label: 'Kontakt' },
];

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export function formatDate(raw: string) {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return { day: raw, year: '' };
  const tz = 'Europe/Berlin';
  return {
    day: d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', timeZone: tz }),
    year: d.toLocaleDateString('de-DE', { year: 'numeric', timeZone: tz }),
  };
}

export function roles(role: string) {
  return role
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean);
}

export function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');
}

export function scrollToId(id: string, offset = -60) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = window.__lenis;
  if (lenis) lenis.scrollTo(el, { offset: id === 'top' ? 0 : offset, duration: 1.4 });
  else el.scrollIntoView({ behavior: 'smooth' });
}

/** Foto mit Initialen als Rückfall, wenn das Bild nicht lädt. Styling über die Klasse des Elternteils. */
export function Portrait({ member, eager }: { member: TeamMember; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <>
      <span className="sc-ini" aria-hidden>
        {initials(member.name)}
      </span>
      {member.image && !failed && (
        <img
          src={member.image}
          alt={member.name}
          loading={eager ? 'eager' : 'lazy'}
          draggable={false}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Detail-Fenster                                                      */
/* ------------------------------------------------------------------ */

export type SheetState =
  | { type: 'service'; id: string }
  | { type: 'person'; index: number }
  | { type: 'news'; index: number }
  | { type: 'job' }
  | { type: 'video' }
  | null;

export function useSheets() {
  const [sheet, setSheet] = useState<SheetState>(null);
  const [open, setOpen] = useState(false);
  const openSheet = useCallback((s: Exclude<SheetState, null>) => {
    setSheet(s);
    setOpen(true);
  }, []);
  const closeSheet = useCallback(() => {
    setOpen(false);
    setTimeout(() => setSheet(null), 700);
  }, []);
  return { sheet, open, openSheet, closeSheet };
}

function Sheet({
  open,
  onClose,
  children,
  wide,
  center,
  label,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
  center?: boolean;
  label: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    window.__lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.__lenis?.start();
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <div
      className="sc-sheet"
      data-open={open}
      data-wide={wide ? 'true' : undefined}
      data-center={center ? 'true' : undefined}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      aria-hidden={!open}
    >
      <div className="sc-sheet__bg" onClick={onClose} />
      <div className="sc-sheet__panel" data-lenis-prevent>
        <button ref={closeRef} type="button" className="sc-sheet__x" onClick={onClose} aria-label="Schließen">
          <X size={22} weight="bold" />
        </button>
        <div className="sc-sheet__body">{children}</div>
      </div>
    </div>
  );
}

function ServiceDetail({ service }: { service: Service }) {
  return (
    <>
      <div className="sc-hero">
        <img src={service.image} alt={service.heading} />
      </div>
      <h2>{service.heading}</h2>
      {service.intro && <p className="sc-intro">{service.intro}</p>}
      {service.sections?.map((s) => (
        <section key={s.title} className={`sc-sec ${s.image ? '' : 'sc-sec--solo'}`}>
          <div>
            <h3>{s.title}</h3>
            {s.paras?.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {s.items && (
              <div className="sc-list">
                {s.items.map((it) => (
                  <div key={it.t}>
                    <h4>{it.t}</h4>
                    <p>{it.p}</p>
                  </div>
                ))}
              </div>
            )}
            {s.note && <p className="sc-note">{s.note}</p>}
            {s.phone && (
              <p className="sc-note">
                <strong>{s.phone.label}: </strong>
                <a href={`tel:${s.phone.tel}`} className="sc-link">
                  {s.phone.text}
                </a>
              </p>
            )}
          </div>
          {s.image && (
            <div className="sc-sec__img">
              <img src={s.image} alt={s.title} loading="lazy" />
            </div>
          )}
        </section>
      ))}
      <div className="sc-cta">
        <a href={PHONE_HREF} className="sc-btn sc-btn--accent">
          <Phone size={20} weight="bold" />
          Anrufen
        </a>
      </div>
    </>
  );
}

export function Sheets({
  sheet,
  open,
  closeSheet,
}: {
  sheet: SheetState;
  open: boolean;
  closeSheet: () => void;
}) {
  const service = sheet?.type === 'service' ? SERVICES.find((s) => s.id === sheet.id) : undefined;
  const person = sheet?.type === 'person' ? team[sheet.index] : undefined;
  const item = sheet?.type === 'news' ? news[sheet.index] : undefined;

  return (
    <>
      <Sheet open={open && sheet?.type === 'service'} onClose={closeSheet} wide label="Leistung">
        {service && <ServiceDetail service={service} />}
      </Sheet>

      <Sheet open={open && sheet?.type === 'person'} onClose={closeSheet} label="Hebamme">
        {person && (
          <div className="sc-person">
            <div className="sc-person__img">
              <Portrait member={person} eager />
            </div>
            <div>
              <h2>{person.name}</h2>
              <div className="sc-tags">
                {roles(person.role).map((r, i) => (
                  <span key={i}>{r}</span>
                ))}
              </div>
              {person.area && (
                <p className="sc-note" style={{ display: 'flex', gap: '0.6rem' }}>
                  <MapPin size={22} weight="bold" style={{ flex: 'none', marginTop: 2 }} />
                  {person.area}
                </p>
              )}
              <div className="sc-cta">
                {person.phone && (
                  <a href={`tel:${person.phone.replace(/[^0-9+]/g, '')}`} className="sc-btn sc-btn--accent">
                    <Phone size={20} weight="bold" />
                    Anrufen
                  </a>
                )}
                {person.email && (
                  <a href={`mailto:${person.email}`} className="sc-btn sc-btn--ink">
                    <Envelope size={20} weight="bold" />
                    E-Mail schreiben
                  </a>
                )}
              </div>
              {!person.phone && !person.email && (
                <p className="sc-note">Erreichen Sie das Team rund um die Uhr im Kreißsaal: {PHONE}</p>
              )}
            </div>
          </div>
        )}
      </Sheet>

      <Sheet open={open && sheet?.type === 'news'} onClose={closeSheet} center label="Aktuelles">
        {item && (
          <>
            <h2>{item.titel}</h2>
            <p className="sc-note">
              {formatDate(item.datum).day} {formatDate(item.datum).year}
              {item.kategorie ? `, ${item.kategorie}` : ''}
            </p>
            <p className="sc-intro" style={{ marginTop: '1.2rem' }}>
              {item.text}
            </p>
          </>
        )}
      </Sheet>

      <Sheet open={open && sheet?.type === 'job'} onClose={closeSheet} center label="Stellenangebot">
        <h2>Werde Teil unseres Teams</h2>
        <p className="sc-intro">
          Du suchst einen Ort, an dem dein Können geschätzt wird und du jeden Tag kleine Wunder begleiten darfst? Dann
          bist du bei uns genau richtig.
        </p>
        <div className="sc-box">
          <h3>Wir suchen Verstärkung</h3>
          <p>
            <strong>Dienstbeleghebamme (m/w/d)</strong>
          </p>
        </div>
        <p className="sc-note">
          Schicke deine Bewerbung an folgende E-Mail-Adresse. Wir freuen uns darauf, dich kennenzulernen!
        </p>
        <div className="sc-cta">
          <a href="mailto:bewerbung@hebammen-marienhospital-bonn.de" className="sc-btn sc-btn--accent">
            <Envelope size={20} weight="bold" />
            bewerbung@hebammen-marienhospital-bonn.de
          </a>
        </div>
      </Sheet>

      <Sheet open={open && sheet?.type === 'video'} onClose={closeSheet} center wide label="Einblick in unseren Kreißsaal">
        <h2>Einblick in unseren Kreißsaal</h2>
        {sheet?.type === 'video' && (
          <div className="sc-video">
            <iframe
              src="https://www.youtube.com/embed/H7R-qfjAkik?autoplay=1&vq=hd1080&hd=1&rel=0"
              title="Einblick in unseren Kreißsaal"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </Sheet>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Scroll-Setup                                                        */
/* ------------------------------------------------------------------ */

type PageApi = {
  gsap: typeof gsap;
  ScrollTrigger: typeof ScrollTrigger;
  el: HTMLElement;
  desktop: boolean;
};

/**
 * Weiches Scrollen (Lenis) + GSAP-Kontext. Alles wird bei Bewegungsreduzierung
 * (prefers-reduced-motion) übersprungen. `build` darf eine Aufräumfunktion liefern.
 */
export function useGsapPage(root: RefObject<HTMLElement | null>, build: (api: PageApi) => void | (() => void)) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      mm.add(
        {
          motion: '(prefers-reduced-motion: no-preference)',
          desktop: '(min-width: 900px) and (prefers-reduced-motion: no-preference)',
        },
        (c) => {
          const { motion, desktop } = c.conditions as { motion: boolean; desktop: boolean };
          if (!motion) return;

          const lenis = new Lenis({ lerp: 0.1 });
          window.__lenis = lenis;
          lenis.on('scroll', ScrollTrigger.update);
          const tick = (t: number) => lenis.raf(t * 1000);
          gsap.ticker.add(tick);
          gsap.ticker.lagSmoothing(0);

          const cleanup = build({ gsap, ScrollTrigger, el, desktop });

          const refresh = () => ScrollTrigger.refresh();
          window.addEventListener('load', refresh);
          document.fonts?.ready.then(refresh);

          return () => {
            if (cleanup) cleanup();
            window.removeEventListener('load', refresh);
            gsap.ticker.remove(tick);
            lenis.destroy();
            window.__lenis = undefined;
          };
        }
      );
    }, el);

    return () => {
      ctx.revert();
      mm.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Nur weiches Scrollen (für Seiten, die mit Framer Motion statt GSAP arbeiten). */
export function useLenisOnly() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ lerp: 0.1 });
    window.__lenis = lenis;
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);
}
