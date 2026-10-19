'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Envelope,
  FilmSlate,
  InstagramLogo,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  Star,
  X,
} from '@phosphor-icons/react';
import content from '@/data/content.json';
import { BASE_PATH, MARQUEE_WORDS, SERVICES, type Service } from './neu-data';

const LOGO_URL =
  'https://static.wixstatic.com/media/446934_56e43f0c28704f46bb3b1b221dee9a3f~mv2.png/v1/fill/w_209,h_205,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/446934_56e43f0c28704f46bb3b1b221dee9a3f~mv2.png';
const HERO_VIDEO = `${BASE_PATH}/4314408-hd_1920_1080_24fps (1).mp4`;
const GROUP_PHOTO = `${BASE_PATH}/Hebammen Bilder/Gruppe.avif`;
const PHONE = '0228 - 505 2205';
const PHONE_HREF = 'tel:+492285052205';
const MAIL = 'info@hebammen-marienhospital-bonn.de';
const INSTAGRAM = 'https://www.instagram.com/hebammen_marienhospital_bonn';

type TeamMember = {
  name: string;
  role: string;
  area?: string;
  phone?: string;
  email?: string;
  image?: string;
};
type FaqItem = { frage: string; antwort: string; kategorie?: string };
type NewsItem = { titel: string; text: string; datum: string; kategorie?: string };
type Review = { name: string; rating: number; text: string; date: string };

type SheetState =
  | { type: 'service'; id: string }
  | { type: 'person'; index: number }
  | { type: 'news'; index: number }
  | { type: 'job' }
  | { type: 'video' }
  | null;

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

const NAV = [
  { id: 'leistungen', label: 'Leistungen' },
  { id: 'team', label: 'Team' },
  { id: 'ueber-uns', label: 'Über uns' },
  { id: 'aktuelles', label: 'Aktuelles' },
  { id: 'kontakt', label: 'Kontakt' },
];

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = window.__lenis;
  if (lenis) lenis.scrollTo(el, { offset: id === 'top' ? 0 : -60, duration: 1.4 });
  else el.scrollIntoView({ behavior: 'smooth' });
}

function formatDate(raw: string) {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return { day: raw, year: '' };
  const tz = 'Europe/Berlin';
  return {
    day: d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', timeZone: tz }),
    year: d.toLocaleDateString('de-DE', { year: 'numeric', timeZone: tz }),
  };
}

function roles(role: string) {
  return role
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean);
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');
}

function Portrait({ member }: { member: TeamMember }) {
  const [failed, setFailed] = useState(false);
  return (
    <>
      <span className="n-person__ini" aria-hidden>
        {initials(member.name)}
      </span>
      {member.image && !failed && (
        <img
          src={member.image}
          alt={member.name}
          loading="lazy"
          draggable={false}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      )}
    </>
  );
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
      className="n-sheet"
      data-open={open}
      data-wide={wide ? 'true' : undefined}
      data-center={center ? 'true' : undefined}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      aria-hidden={!open}
    >
      <div className="n-sheet__bg" onClick={onClose} />
      <div className="n-sheet__panel" data-lenis-prevent>
        <button ref={closeRef} type="button" className="n-sheet__x" onClick={onClose} aria-label="Schließen">
          <X size={22} weight="bold" />
        </button>
        <div className="n-sheet__body">{children}</div>
      </div>
    </div>
  );
}

function ServiceSheet({ service }: { service: Service }) {
  return (
    <>
      <div className="n-sheet__hero">
        <img src={service.image} alt={service.heading} />
      </div>
      <h2>{service.heading}</h2>
      {service.intro && <p className="n-sheet__intro">{service.intro}</p>}
      {service.sections?.map((s) => (
        <section key={s.title} className={`n-sec ${s.image ? '' : 'n-sec--solo'}`}>
          <div>
            <h3>{s.title}</h3>
            {s.paras?.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {s.items && (
              <div className="n-sec__list">
                {s.items.map((it) => (
                  <div key={it.t}>
                    <h4>{it.t}</h4>
                    <p>{it.p}</p>
                  </div>
                ))}
              </div>
            )}
            {s.note && <p className="n-sec__note">{s.note}</p>}
            {s.phone && (
              <p className="n-sec__note">
                <strong style={{ color: 'var(--ink)' }}>{s.phone.label}: </strong>
                <a href={`tel:${s.phone.tel}`} style={{ textDecoration: 'underline', textUnderlineOffset: 4 }}>
                  {s.phone.text}
                </a>
              </p>
            )}
          </div>
          {s.image && (
            <div className="n-sec__img">
              <img src={s.image} alt={s.title} loading="lazy" />
            </div>
          )}
        </section>
      ))}
      <div className="n-sheet__cta">
        <a href={PHONE_HREF} className="n-btn n-btn--poppy">
          <Phone size={20} weight="bold" />
          Anrufen
        </a>
      </div>
    </>
  );
}

export default function NeuSite() {
  const root = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const team = content.team as TeamMember[];
  const faq = (content.faq as FaqItem[]) ?? [];
  const news = [...((content.aktuelles as NewsItem[]) ?? [])].sort(
    (a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime()
  );
  const reviews = (content.reviews as Review[]) ?? [];
  const rating = content.overallRating || 5;
  const totalReviews = content.totalReviews || reviews.length;

  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', dragFree: true, containScroll: 'trimSnaps' });
  const downX = useRef(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const [revIndex, setRevIndex] = useState(0);
  const [revOpen, setRevOpen] = useState(false);
  const [faqCat, setFaqCat] = useState('Alle');
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const openSheet = useCallback((s: Exclude<SheetState, null>) => {
    setSheet(s);
    setSheetOpen(true);
  }, []);
  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    setTimeout(() => setSheet(null), 700);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    update();
    emblaApi.on('select', update).on('reInit', update).on('settle', update);
    return () => {
      emblaApi.off('select', update).off('reInit', update).off('settle', update);
    };
  }, [emblaApi]);

  // Menue: Scroll sperren + Escape
  useEffect(() => {
    if (!menuOpen) return;
    window.__lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.__lenis?.start();
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  // Bewegung: Lenis (weiches Scrollen) + GSAP ScrollTrigger
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

          // Weiches Scrollen, an GSAP-Ticker gekoppelt
          const lenis = new Lenis({ lerp: 0.1 });
          window.__lenis = lenis;
          lenis.on('scroll', ScrollTrigger.update);
          const tick = (t: number) => lenis.raf(t * 1000);
          gsap.ticker.add(tick);
          gsap.ticker.lagSmoothing(0);

          // Navigation: solide Fläche nach dem Hero, beim Runterscrollen ausblenden
          ScrollTrigger.create({
            start: 0,
            end: 'max',
            onUpdate: (self) => {
              const nav = navRef.current;
              if (!nav) return;
              const y = self.scroll();
              nav.dataset.solid = String(y > 40);
              nav.dataset.hidden = String(self.direction === 1 && y > 500);
            },
          });

          // Hero: Zeilen schieben sich aus einer Maske, dann der Rest
          const intro = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.15 });
          intro
            .fromTo('.n-line > span', { yPercent: 110, opacity: 1 }, { yPercent: 0, duration: 1.3, stagger: 0.14 })
            .fromTo('[data-hero="fade"]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, '-=0.9')
            .fromTo(
              '[data-hero="arch"]',
              { opacity: 0, y: 70, scale: 0.94 },
              { opacity: 1, y: 0, scale: 1, duration: 1.4, clearProps: 'transform' },
              0.1
            )
            .fromTo('.n-hero__arch video', { scale: 1.3 }, { scale: 1, duration: 2 }, 0.1)
            .fromTo('.n-hero__call', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, clearProps: 'transform' }, 0.9);

          gsap.to('.n-hero__arch video', {
            yPercent: 8,
            ease: 'none',
            scrollTrigger: { trigger: '.n-hero', start: 'top top', end: 'bottom top', scrub: true },
          });

          // Statement: Wort für Wort dunkel, gekoppelt an das Scrollen
          gsap.to('.n-statement .w', {
            opacity: 1,
            stagger: 0.12,
            ease: 'none',
            scrollTrigger: { trigger: '.n-statement', start: 'top 82%', end: 'bottom 48%', scrub: true },
          });

          // Zahlen zählen hoch, sobald sie sichtbar werden
          gsap.utils.toArray<HTMLElement>('[data-count]').forEach((node) => {
            const end = Number(node.dataset.count);
            const suffix = node.dataset.suffix ?? '';
            const o = { v: 0 };
            gsap.to(o, {
              v: end,
              duration: 2.2,
              ease: 'power3.out',
              scrollTrigger: { trigger: node, start: 'top 88%', once: true },
              onUpdate: () => {
                node.textContent = Math.round(o.v).toLocaleString('de-DE').replace(/\./g, '') + suffix;
              },
            });
          });

          // Einblenden, wenn Elemente ins Bild kommen
          ScrollTrigger.batch(gsap.utils.toArray<HTMLElement>('[data-reveal]', el), {
            start: 'top 90%',
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.09, overwrite: true }),
          });

          if (desktop) {
            // Leistungen: senkrechtes Scrollen schiebt die Karten seitlich
            const pan = el.querySelector<HTMLElement>('.n-pan');
            const track = el.querySelector<HTMLElement>('.n-pan__track');
            const bar = el.querySelector<HTMLElement>('.n-pan__bar');
            if (pan && track) {
              const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
              gsap.to(track, {
                x: () => -dist(),
                ease: 'none',
                scrollTrigger: {
                  trigger: pan,
                  start: 'top top',
                  end: () => `+=${dist()}`,
                  pin: true,
                  scrub: 1,
                  anticipatePin: 1,
                  invalidateOnRefresh: true,
                  onUpdate: (self) => bar && gsap.set(bar, { scaleX: self.progress }),
                },
              });
            }

            // Über uns: Bild wächst aus dem Ausschnitt zum Vollbild
            const zoom = el.querySelector<HTMLElement>('.n-zoom');
            if (zoom) {
              gsap
                .timeline({
                  scrollTrigger: { trigger: zoom, start: 'top top', end: '+=150%', pin: true, scrub: 0.6, anticipatePin: 1 },
                })
                .to('.n-zoom__img', { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', duration: 1 }, 0)
                .to('.n-zoom__img img', { scale: 1, ease: 'none', duration: 1 }, 0)
                .to('.n-zoom__veil', { opacity: 1, ease: 'none', duration: 0.35 }, 0.65)
                .fromTo('.n-zoom__txt', { opacity: 0, y: 50 }, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.4 }, 0.75)
                .to({}, { duration: 0.35 });
            }
          }

          const refresh = () => ScrollTrigger.refresh();
          window.addEventListener('load', refresh);
          document.fonts?.ready.then(refresh);

          return () => {
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
  }, []);

  const go = (id: string) => {
    setMenuOpen(false);
    // Menue schliesst sich, danach scrollen (Scroll-Sperre muss erst fallen)
    setTimeout(() => scrollToId(id), 60);
  };

  const onAnchor = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToId(id);
  };

  const cats = ['Alle', ...Array.from(new Set(faq.map((f) => f.kategorie).filter(Boolean) as string[]))];
  const faqShown = faq.filter((f) => faqCat === 'Alle' || f.kategorie === faqCat);
  const review = reviews[revIndex];
  const ratingText = Number(rating).toFixed(1).replace('.', ',');

  const activeService = sheet?.type === 'service' ? SERVICES.find((s) => s.id === sheet.id) : undefined;
  const activePerson = sheet?.type === 'person' ? team[sheet.index] : undefined;
  const activeNews = sheet?.type === 'news' ? news[sheet.index] : undefined;

  const marquee = [...MARQUEE_WORDS, ...MARQUEE_WORDS];

  return (
    <div ref={root}>
      {/* Navigation */}
      <header ref={navRef} className="n-nav" data-solid="false" data-hidden="false">
        <div className="n-wrap n-nav__in">
          <a href="#top" onClick={onAnchor('top')} className="n-brand" aria-label="Zur Startseite">
            <img src={LOGO_URL} alt="Hebammen am Marienhospital Bonn" width={48} height={48} />
            <span className="n-brand__t">
              Hebammen am Marienhospital
              <small>Sanne, Wald und Partnerinnen</small>
            </span>
          </a>
          <div className="n-nav__r">
            <a href={PHONE_HREF} className="n-btn n-btn--poppy" aria-label="Anrufen">
              <Phone size={20} weight="bold" />
              <span>Anrufen</span>
            </a>
            <button type="button" className="n-burger" onClick={() => setMenuOpen(true)} aria-label="Menü öffnen" aria-expanded={menuOpen}>
              <i aria-hidden />
              <span>Menü</span>
            </button>
          </div>
        </div>
      </header>

      {/* Vollbild-Menü */}
      <div className="n-menu" data-open={menuOpen} aria-hidden={!menuOpen} role="dialog" aria-label="Menü">
        <div className="n-wrap n-menu__top">
          <span className="n-brand">
            <img src={LOGO_URL} alt="" width={48} height={48} />
            <span className="n-brand__t">
              Hebammen am Marienhospital
              <small>Sanne, Wald und Partnerinnen</small>
            </span>
          </span>
          <button type="button" className="n-burger" onClick={() => setMenuOpen(false)} aria-label="Menü schließen">
            <X size={20} weight="bold" />
            <span>Schließen</span>
          </button>
        </div>
        <nav className="n-wrap n-menu__links" aria-label="Hauptnavigation">
          {NAV.map((l, i) => (
            <a key={l.id} href={`#${l.id}`} className="n-menu__link" style={{ '--i': i } as React.CSSProperties} onClick={(e) => { e.preventDefault(); go(l.id); }}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="n-wrap n-menu__foot">
          <a href={PHONE_HREF}>{PHONE}</a>
          <span>Robert-Koch-Straße 1, 53115 Bonn</span>
        </div>
      </div>

      <main id="main-content">
        {/* Hero */}
        <section id="top" className="n-hero">
          <div className="n-wrap n-hero__grid">
            <div>
              <h1 className="n-hero__title">
                <span className="n-line"><span>Ihre Hebammen</span></span>
                <span className="n-line"><span>in <span className="n-accent">Bonn</span></span></span>
              </h1>
              <p className="n-hero__sub" data-hero="fade">
                Die Geburt ist ein individuelles und unvergessliches Erlebnis. Wir begleiten Sie einfühlsam und kompetent.
              </p>
              <div className="n-hero__cta" data-hero="fade">
                <a href="#kontakt" onClick={onAnchor('kontakt')} className="n-btn n-btn--poppy">
                  Kontakt aufnehmen
                  <ArrowRight size={20} weight="bold" />
                </a>
                <a href="#leistungen" onClick={onAnchor('leistungen')} className="n-btn n-btn--line">
                  Leistungen ansehen
                </a>
              </div>
            </div>
            <div className="n-hero__media">
              <div className="n-arch n-hero__arch" data-hero="arch">
                <video autoPlay muted loop playsInline preload="auto" aria-hidden>
                  <source src={HERO_VIDEO} type="video/mp4" />
                </video>
              </div>
              <a href={PHONE_HREF} className="n-hero__call" aria-label={`Kreißsaal anrufen, ${PHONE}`}>
                <img src={LOGO_URL} alt="" width={52} height={52} />
                <div>
                  <span>Kreißsaal, rund um die Uhr</span>
                  <strong>{PHONE}</strong>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* Laufband */}
        <div className="n-marquee" aria-hidden>
          <div className="n-marquee__track">
            {marquee.map((w, i) => (
              <span className="n-marquee__item" key={i}>
                {w}
              </span>
            ))}
          </div>
        </div>

        {/* Statement + Zahlen */}
        <section id="ueber" className="n-section" style={{ paddingTop: 'clamp(3rem, 6vw, 6rem)' }}>
          <div className="n-wrap">
            <p className="n-statement" style={{ maxWidth: '26ch' }}>
              {'Wir sind Hebammen in Bonn und arbeiten im Dienstbelegsystem im Marienhospital Bonn. Jede Geburt ist einzigartig, und Ihr Wohlbefinden und das Ihres Kindes stehen dabei immer im Mittelpunkt.'
                .split(' ')
                .map((w, i) => (
                  <span key={i}>
                    <span className="w">{w}</span>{' '}
                  </span>
                ))}
            </p>
            <div className="n-stats">
              <div className="n-stat" data-reveal>
                <div className="n-stat__n" data-count="2000" data-suffix="+">2000+</div>
                <p className="n-stat__l">Geburten begleitet</p>
              </div>
              <div className="n-stat" data-reveal>
                <div className="n-stat__n" data-count="15" data-suffix="+">15+</div>
                <p className="n-stat__l">Jahre Erfahrung</p>
              </div>
              <div className="n-stat" data-reveal>
                <div className="n-stat__n">24/7</div>
                <p className="n-stat__l">Erreichbarkeit</p>
              </div>
            </div>
          </div>
        </section>

        {/* Leistungen */}
        <section id="leistungen" className="n-pan">
          <div className="n-pan__stage">
            <div className="n-pan__track">
              <div className="n-pan__intro" data-reveal>
                <h2 className="n-h2">
                  Rundum <span className="n-accent">gut betreut</span>
                </h2>
                <p className="n-lead">
                  Von der Schwangerschaft bis zur Nachsorge begleiten wir Sie in jeder Phase mit Fachwissen und Herz.
                </p>
              </div>
              {SERVICES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className="n-card"
                  onClick={() => (s.action === 'team' ? scrollToId('team') : openSheet({ type: 'service', id: s.id }))}
                  aria-label={`${s.title}, mehr erfahren`}
                >
                  <div className="n-card__img">
                    <img src={s.image} alt="" loading="lazy" />
                  </div>
                  <div className="n-card__body">
                    <span className="n-card__no">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="n-card__t">{s.title}</h3>
                    <p className="n-card__p">{s.summary}</p>
                    <span className="n-card__more">
                      <i>
                        <ArrowRight size={20} weight="bold" />
                      </i>
                      {s.action === 'team' ? 'Zur Hebammenliste' : 'Mehr erfahren'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="n-pan__bar" aria-hidden />
        </section>

        {/* Team */}
        <section id="team" className="n-section">
          <div className="n-wrap">
            <div className="n-team__head" data-reveal>
              <h2 className="n-h2">Lernen Sie uns kennen</h2>
              <p className="n-lead">Erfahrene Hebammen mit Herz und Leidenschaft für ihren Beruf.</p>
            </div>
          </div>
          <div className="n-wrap">
            <div className="n-team__vp" ref={emblaRef} data-reveal>
              <div className="n-team__track">
                {team.map((m, i) => (
                  <button
                    key={m.name}
                    type="button"
                    className="n-person"
                    onPointerDown={(e) => (downX.current = e.clientX)}
                    onClick={(e) => Math.abs(e.clientX - downX.current) < 8 && openSheet({ type: 'person', index: i })}
                    aria-label={`${m.name}, Details`}
                  >
                    <div className="n-arch">
                      <Portrait member={m} />
                    </div>
                    <div className="n-person__n">{m.name}</div>
                    <div className="n-person__r">{roles(m.role)[0] ?? 'Hebamme'}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="n-team__ctl">
              <button type="button" className="n-round" onClick={() => emblaApi?.scrollPrev()} disabled={!canPrev} aria-label="Zurück">
                <ArrowLeft size={22} weight="bold" />
              </button>
              <button type="button" className="n-round" onClick={() => emblaApi?.scrollNext()} disabled={!canNext} aria-label="Weiter">
                <ArrowRight size={22} weight="bold" />
              </button>
              <button type="button" className="n-btn n-btn--ink" onClick={() => openSheet({ type: 'job' })}>
                Werde Teil unseres Teams
                <ArrowUpRight size={20} weight="bold" />
              </button>
            </div>
          </div>
        </section>

        {/* Über uns */}
        <section id="ueber-uns" className="n-zoom">
          <div className="n-zoom__img">
            <img src={GROUP_PHOTO} alt="Das Team der Hebammen am Marienhospital Bonn" />
          </div>
          <div className="n-zoom__veil" aria-hidden />
          <div className="n-zoom__txt">
            <h2 className="n-h2">Mit Herz und Kompetenz an Ihrer Seite</h2>
            <p>
              Unser Team vereint langjährige Erfahrung mit modernsten Methoden der Geburtshilfe. Wir verstehen es als unsere
              Aufgabe, Sie individuell und einfühlsam durch diese besondere Zeit zu begleiten.
            </p>
            <div className="n-zoom__facts">
              <span>
                <Clock size={20} weight="bold" /> 24/7 erreichbar
              </span>
              <span>
                <ShieldCheck size={20} weight="bold" /> Geprüfte Qualität
              </span>
            </div>
            <button type="button" className="n-btn n-btn--poppy" onClick={() => openSheet({ type: 'video' })}>
              <FilmSlate size={20} weight="bold" />
              Einblick in den Kreißsaal
            </button>
          </div>
        </section>

        {/* Bewertungen */}
        {review && (
          <section className="n-section n-rev">
            <div className="n-wrap n-rev__grid">
              <div data-reveal>
                <div className="n-rev__score">{ratingText}</div>
                <div className="n-rev__stars" aria-label={`${ratingText} von 5 Sternen`}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} size={30} weight="fill" />
                  ))}
                </div>
                <p className="n-rev__cap">
                  {totalReviews} Bewertungen auf Google
                </p>
              </div>
              <div data-reveal>
                <div className="n-rev__quote">
                  <div key={revIndex} className="n-fade">
                    <p className="n-rev__text" data-clamp={!revOpen && review.text.length > 220}>
                      &bdquo;{review.text}&ldquo;
                    </p>
                    {review.text.length > 220 && (
                      <button type="button" className="n-rev__more" style={{ marginTop: '1rem' }} onClick={() => setRevOpen((v) => !v)}>
                        {revOpen ? 'Weniger anzeigen' : 'Weiterlesen'}
                      </button>
                    )}
                  </div>
                  <div className="n-rev__who">
                    <div>
                      <strong>{review.name}</strong>
                      <span>{review.date}</span>
                    </div>
                    <div className="n-rev__ctl">
                      <button
                        type="button"
                        className="n-round"
                        aria-label="Vorherige Bewertung"
                        onClick={() => { setRevIndex((revIndex - 1 + reviews.length) % reviews.length); setRevOpen(false); }}
                      >
                        <ArrowLeft size={22} weight="bold" />
                      </button>
                      <button
                        type="button"
                        className="n-round"
                        aria-label="Nächste Bewertung"
                        onClick={() => { setRevIndex((revIndex + 1) % reviews.length); setRevOpen(false); }}
                      >
                        <ArrowRight size={22} weight="bold" />
                      </button>
                    </div>
                  </div>
                </div>
                <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="n-btn n-btn--ink n-rev__link">
                  Alle Bewertungen auf Google
                  <ArrowUpRight size={20} weight="bold" />
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Aktuelles + Fragen */}
        <section id="aktuelles" className="n-section">
          <div className="n-wrap n-know__grid">
            <div className="n-know__sticky" data-reveal>
              <h2 className="n-h2">Aktuelles</h2>
              <p className="n-lead" style={{ marginTop: '1.2rem' }}>Neuigkeiten aus unserem Team.</p>
            </div>
            <div data-reveal>
              {news.map((n, i) => {
                const d = formatDate(n.datum);
                return (
                  <button key={n.titel + i} type="button" className="n-news" onClick={() => openSheet({ type: 'news', index: i })}>
                    <div className="n-news__d">
                      {d.day}
                      <small>{[d.year, n.kategorie].filter(Boolean).join(', ')}</small>
                    </div>
                    <div>
                      <h3 className="n-news__t">{n.titel}</h3>
                      <p className="n-news__p">{n.text}</p>
                    </div>
                  </button>
                );
              })}
              {news.length === 0 && <p className="n-lead">Aktuell gibt es keine Neuigkeiten.</p>}

              <div id="faq" className="n-faq">
                <h3 className="n-h2" style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)', marginBottom: '1.6rem' }}>
                  Häufig gestellte Fragen
                </h3>
                {cats.length > 2 && (
                  <div className="n-faq__tabs">
                    {cats.map((c) => (
                      <button key={c} type="button" className="n-chip" aria-pressed={faqCat === c} onClick={() => { setFaqCat(c); setFaqOpen(0); }}>
                        {c}
                      </button>
                    ))}
                  </div>
                )}
                {faqShown.map((f, i) => (
                  <div key={f.frage} className="n-acc" data-open={faqOpen === i}>
                    <button type="button" className="n-acc__b" aria-expanded={faqOpen === i} onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                      {f.frage}
                      <i>
                        <Plus size={20} weight="bold" />
                      </i>
                    </button>
                    <div className="n-acc__p">
                      <div>
                        <p>{f.antwort}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Kontakt */}
        <section id="kontakt" className="n-section" style={{ paddingTop: 0 }}>
          <div className="n-wrap">
            <div data-reveal>
              <h2 className="n-h2">Wir freuen uns auf Sie</h2>
              <p className="n-lead" style={{ marginTop: '1.2rem' }}>
                Vereinbaren Sie jetzt Ihren persönlichen Beratungstermin und lernen Sie uns kennen.
              </p>
              <a href={PHONE_HREF} className="n-contact__phone" aria-label={`Anrufen, ${PHONE}`}>
                {PHONE}
                <ArrowUpRight weight="bold" />
              </a>
            </div>
            <div className="n-contact__grid">
              <div className="n-contact__rows" data-reveal>
                <a href={`mailto:${MAIL}`} className="n-crow">
                  <Envelope size={26} weight="bold" />
                  <div>
                    <small>E-Mail</small>
                    <strong>{MAIL}</strong>
                  </div>
                </a>
                <div className="n-crow">
                  <MapPin size={26} weight="bold" />
                  <div>
                    <small>Adresse</small>
                    <strong>
                      Robert-Koch-Straße 1<br />
                      53115 Bonn
                    </strong>
                  </div>
                </div>
                <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="n-crow">
                  <InstagramLogo size={26} weight="bold" />
                  <div>
                    <small>Instagram</small>
                    <strong>@hebammen_marienhospital_bonn</strong>
                  </div>
                </a>
              </div>
              <div className="n-map" data-reveal>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2517.9376!2d7.1044!3d50.7264!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bee17b0c5d5f0b%3A0x5e0b3c5b5c5b5c5b!2sRobert-Koch-Stra%C3%9Fe%201%2C%2053115%20Bonn!5e0!3m2!1sde!2sde!4v1234567890"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Standort Marienhospital Bonn"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="n-foot">
        <div className="n-wrap">
          <div className="n-foot__cols">
            <div>
              <div className="n-foot__brand">
                <img src={LOGO_URL} alt="" width={64} height={64} />
                <div>
                  <strong>Hebammen am Marienhospital</strong>
                  <span>Sanne, Wald und Partnerinnen</span>
                </div>
              </div>
              <p className="n-foot__lede">
                Die Geburt ist ein individuelles und unvergessliches Erlebnis. Wir begleiten Sie einfühlsam und kompetent auf diesem besonderen Weg.
              </p>
            </div>
            <div>
              <h4>Navigation</h4>
              <ul>
                {NAV.map((l) => (
                  <li key={l.id}>
                    <a href={`#${l.id}`} onClick={onAnchor(l.id)}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Rechtliches</h4>
              <ul>
                <li><a href="#">Impressum</a></li>
                <li><a href="#">Datenschutz</a></li>
                <li>
                  <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="n-foot__word" aria-hidden>
            Hebammen
          </div>
          <div className="n-foot__legal">
            <span>© {new Date().getFullYear()} Hebammen am Marienhospital Bonn. Alle Rechte vorbehalten.</span>
          </div>
        </div>
      </footer>

      {/* Detail-Fenster */}
      <Sheet open={sheetOpen && sheet?.type === 'service'} onClose={closeSheet} wide label="Leistung">
        {activeService && <ServiceSheet service={activeService} />}
      </Sheet>

      <Sheet open={sheetOpen && sheet?.type === 'person'} onClose={closeSheet} label="Hebamme">
        {activePerson && (
          <div className="n-person-d">
            <div className="n-arch">
              <Portrait member={activePerson} />
            </div>
            <div>
              <h2>{activePerson.name}</h2>
              <div className="n-tags">
                {roles(activePerson.role).map((r, i) => (
                  <span key={i}>{r}</span>
                ))}
              </div>
              {activePerson.area && (
                <p style={{ display: 'flex', gap: '0.6rem', color: 'var(--muted)' }}>
                  <MapPin size={22} weight="bold" style={{ flex: 'none', marginTop: 2 }} />
                  {activePerson.area}
                </p>
              )}
              <div className="n-sheet__cta">
                {activePerson.phone && (
                  <a href={`tel:${activePerson.phone.replace(/[^0-9+]/g, '')}`} className="n-btn n-btn--poppy">
                    <Phone size={20} weight="bold" />
                    Anrufen
                  </a>
                )}
                {activePerson.email && (
                  <a href={`mailto:${activePerson.email}`} className="n-btn n-btn--ink">
                    <Envelope size={20} weight="bold" />
                    E-Mail schreiben
                  </a>
                )}
              </div>
              {!activePerson.phone && !activePerson.email && (
                <p style={{ color: 'var(--muted)', marginTop: '1.2rem' }}>
                  Erreichen Sie das Team rund um die Uhr im Kreißsaal: {PHONE}
                </p>
              )}
            </div>
          </div>
        )}
      </Sheet>

      <Sheet open={sheetOpen && sheet?.type === 'news'} onClose={closeSheet} center label="Aktuelles">
        {activeNews && (
          <>
            <h2>{activeNews.titel}</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '1.2rem' }}>
              {formatDate(activeNews.datum).day} {formatDate(activeNews.datum).year}
              {activeNews.kategorie ? `, ${activeNews.kategorie}` : ''}
            </p>
            <p style={{ fontSize: '1.2rem' }}>{activeNews.text}</p>
          </>
        )}
      </Sheet>

      <Sheet open={sheetOpen && sheet?.type === 'job'} onClose={closeSheet} center label="Stellenangebot">
        <h2>Werde Teil unseres Teams</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>
          Du suchst einen Ort, an dem dein Können geschätzt wird und du jeden Tag kleine Wunder begleiten darfst? Dann bist du bei uns genau richtig.
        </p>
        <div style={{ background: 'var(--moss)', borderRadius: 'var(--r)', padding: '1.6rem', margin: '1.8rem 0' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Wir suchen Verstärkung</h3>
          <p style={{ fontWeight: 600 }}>Dienstbeleghebamme (m/w/d)</p>
        </div>
        <p style={{ color: 'var(--muted)' }}>Schicke deine Bewerbung an folgende E-Mail-Adresse. Wir freuen uns darauf, dich kennenzulernen!</p>
        <div className="n-sheet__cta">
          <a href="mailto:bewerbung@hebammen-marienhospital-bonn.de" className="n-btn n-btn--poppy">
            <Envelope size={20} weight="bold" />
            bewerbung@hebammen-marienhospital-bonn.de
          </a>
        </div>
      </Sheet>

      <Sheet open={sheetOpen && sheet?.type === 'video'} onClose={closeSheet} center wide label="Einblick in unseren Kreißsaal">
        <h2>Einblick in unseren Kreißsaal</h2>
        {sheet?.type === 'video' && (
          <div className="n-video">
            <iframe
              src="https://www.youtube.com/embed/H7R-qfjAkik?autoplay=1&vq=hd1080&hd=1&rel=0"
              title="Einblick in unseren Kreißsaal"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </Sheet>
    </div>
  );
}
