'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  Envelope,
  FilmSlate,
  InstagramLogo,
  MapPin,
  Plus,
  Phone,
  ShieldCheck,
  Star,
  X,
} from '@phosphor-icons/react';
import {
  ABOUT_TEXT,
  ADDRESS_1,
  ADDRESS_2,
  GROUP_PHOTO,
  HERO_VIDEO,
  INSTAGRAM,
  LOGO_URL,
  MAIL,
  MAP_SRC,
  NAV,
  PHONE,
  PHONE_HREF,
  Portrait,
  SERVICES,
  Sheets,
  faq,
  formatDate,
  news,
  ratingText,
  reviews,
  roles,
  scrollToId,
  team,
  totalReviews,
  useGsapPage,
  useSheets,
} from '../designs/shared';

// Tageszeiten: Hintergrund, Schrift, gedämpfte Schrift (rgb mit Kommas, damit GSAP sie mischen kann)
const TONES = {
  dawn: { bg: 'rgb(246, 215, 194)', fg: 'rgb(38, 24, 32)', muted: 'rgb(98, 76, 84)' },
  day: { bg: 'rgb(222, 236, 247)', fg: 'rgb(14, 28, 46)', muted: 'rgb(66, 84, 106)' },
  dusk: { bg: 'rgb(30, 52, 92)', fg: 'rgb(250, 236, 222)', muted: 'rgb(196, 200, 214)' },
  night: { bg: 'rgb(8, 16, 30)', fg: 'rgb(244, 238, 230)', muted: 'rgb(170, 180, 196)' },
} as const;

export default function NachtSite() {
  const root = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ down: false, startX: 0, startLeft: 0, moved: 0 });
  const { sheet, open, openSheet, closeSheet } = useSheets();
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [faqCat, setFaqCat] = useState('Alle');
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  useGsapPage(root, ({ gsap, ScrollTrigger, el }) => {
    // Hero
    const intro = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.1 });
    intro
      .fromTo('.nc-h1 > span > span', { yPercent: 110, opacity: 1 }, { yPercent: 0, duration: 1.4, stagger: 0.14 })
      .fromTo('[data-hero]', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.12 }, '-=0.9');

    gsap.to('.nc-hero__vid video', {
      yPercent: 9,
      ease: 'none',
      scrollTrigger: { trigger: '.nc-hero__vid', start: 'top bottom', end: 'bottom top', scrub: true },
    });

    // Tageszeit wechselt, sobald ein Abschnitt in die Bildmitte kommt (Variablen liegen auf dem .night-Wrapper)
    const host = (el.closest('.night') as HTMLElement | null) ?? el;
    el.querySelectorAll<HTMLElement>('[data-tone]').forEach((sec) => {
      const t = TONES[sec.dataset.tone as keyof typeof TONES];
      ScrollTrigger.create({
        trigger: sec,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => {
          if (self.isActive) {
            gsap.to(host, { '--bg': t.bg, '--fg': t.fg, '--muted': t.muted, duration: 1.2, ease: 'power2.inOut', overwrite: 'auto' });
          }
        },
      });
    });

    // Sonne zieht über den Himmel und wird zum Mond
    const orb = orbRef.current;
    if (orb) {
      const h = () => window.innerHeight;
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true },
        })
        .fromTo(orb, { y: () => h() * 0.72 }, { y: () => h() * 0.12, duration: 0.3 })
        .to(orb, { y: () => h() * 0.68, duration: 0.32 })
        .to(orb, { y: () => h() * 0.14, duration: 0.38 }, '>')
        .to('.nc-orb__moon', { opacity: 1, duration: 0.12 }, 0.6)
        .to('.nc-orb__sun', { opacity: 0, duration: 0.12 }, 0.6)
        .to(orb, { boxShadow: '0 0 90px 24px rgba(190, 205, 255, 0.22)', duration: 0.12 }, 0.6);
    }

    // Zahlen zählen hoch
    gsap.utils.toArray<HTMLElement>('[data-count]', el).forEach((node) => {
      const o = { v: 0 };
      gsap.to(o, {
        v: Number(node.dataset.count),
        duration: 2.2,
        ease: 'power3.out',
        scrollTrigger: { trigger: node, start: 'top 88%', once: true },
        onUpdate: () => {
          node.textContent = Math.round(o.v) + (node.dataset.suffix ?? '');
        },
      });
    });

    // Einblenden
    ScrollTrigger.batch(gsap.utils.toArray<HTMLElement>('[data-reveal]', el), {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => gsap.fromTo(batch, { y: 40 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', stagger: 0.09, overwrite: true }),
    });

    // Welche Leistung gerade im Bild steht
    el.querySelectorAll<HTMLElement>('.nc-svc__item').forEach((item, i) => {
      ScrollTrigger.create({ trigger: item, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => s.isActive && setActive(i) });
    });

    // Navigation: beim Runterscrollen ausblenden
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const nav = navRef.current;
        if (nav) nav.dataset.hidden = String(self.direction === 1 && self.scroll() > 600);
      },
    });
  });

  useEffect(() => {
    if (!menu) return;
    window.__lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.__lenis?.start();
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenu(false);
    setTimeout(() => scrollToId(id, -68), 80);
  };

  // Team-Band per Maus ziehen (Touch scrollt nativ)
  const onTeamDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const el = teamRef.current;
    if (!el) return;
    dragRef.current = { down: true, startX: e.clientX, startLeft: el.scrollLeft, moved: 0 };
    el.dataset.drag = 'true';
  };
  const onTeamMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    const el = teamRef.current;
    if (!d.down || !el) return;
    d.moved = Math.abs(e.clientX - d.startX);
    el.scrollLeft = d.startLeft - (e.clientX - d.startX);
  };
  const onTeamUp = () => {
    dragRef.current.down = false;
    if (teamRef.current) teamRef.current.dataset.drag = 'false';
  };

  const cats = ['Alle', ...Array.from(new Set(faq.map((f) => f.kategorie).filter(Boolean) as string[]))];
  const faqShown = faq.filter((f) => faqCat === 'Alle' || f.kategorie === faqCat);

  return (
    <div ref={root}>
      <div className="nc-orb" ref={orbRef} aria-hidden>
        <div className="nc-orb__sun" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #fff6dc 0%, #ffd58a 40%, #ff9d5c 100%)' }} />
        <div className="nc-orb__moon" style={{ position: 'absolute', inset: 0, borderRadius: '50%', opacity: 0, background: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #dfe6f5 45%, #aebbd6 100%)' }} />
      </div>

      <header ref={navRef} className="nc-nav" data-hidden="false">
        <div className="nc-wrap nc-nav__in">
          <a href="#top" onClick={go('top')} className="nc-brand" aria-label="Zur Startseite">
            <img src={LOGO_URL} alt="" width={44} height={44} />
            <span>Hebammen am Marienhospital</span>
          </a>
          <div className="nc-nav__r">
            <a href={PHONE_HREF} className="nc-btn" aria-label="Anrufen">
              <Phone size={20} weight="bold" />
              <span>Anrufen</span>
            </a>
            <button type="button" className="nc-burger" onClick={() => setMenu(true)} aria-expanded={menu} aria-label="Menü öffnen">
              Menü
            </button>
          </div>
        </div>
      </header>

      <div className="nc-menu" data-open={menu} aria-hidden={!menu} role="dialog" aria-label="Menü">
        <div className="nc-wrap nc-menu__top">
          <span className="nc-brand">
            <img src={LOGO_URL} alt="" width={44} height={44} />
            <span>Hebammen am Marienhospital</span>
          </span>
          <button type="button" className="nc-burger" onClick={() => setMenu(false)} aria-label="Menü schließen">
            <X size={18} weight="bold" style={{ display: 'inline', verticalAlign: '-3px', marginRight: 6 }} />
            Schließen
          </button>
        </div>
        <nav className="nc-wrap nc-menu__links" aria-label="Hauptnavigation">
          {NAV.map((l) => (
            <a key={l.id} href={`#${l.id}`} onClick={go(l.id)}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nc-wrap nc-menu__foot">
          <a href={PHONE_HREF}>{PHONE}</a>
          <span>
            {ADDRESS_1}, {ADDRESS_2}
          </span>
        </div>
      </div>

      <main id="main-content">
        {/* Hero (Morgenrot) */}
        <section id="top" className="nc-hero" data-tone="dawn">
          <div className="nc-wrap">
            <h1 className="nc-h1">
              <span>
                <span>Ihre Hebammen</span>
              </span>
              <span>
                <span>
                  in <b>Bonn</b>
                </span>
              </span>
            </h1>
            <div className="nc-hero__row">
              <p className="nc-hero__sub" data-hero>
                Die Geburt ist ein individuelles und unvergessliches Erlebnis. Wir begleiten Sie einfühlsam und kompetent.
              </p>
              <div className="nc-hero__cta" data-hero>
                <a href="#kontakt" onClick={go('kontakt')} className="nc-btn">
                  Kontakt aufnehmen
                  <ArrowRight size={20} weight="bold" />
                </a>
                <a href="#leistungen" onClick={go('leistungen')} className="nc-btn nc-btn--line">
                  Leistungen ansehen
                </a>
              </div>
            </div>
            <div className="nc-hero__vid" data-hero>
              <video autoPlay muted loop playsInline preload="auto" aria-hidden>
                <source src={HERO_VIDEO} type="video/mp4" />
              </video>
            </div>
          </div>
        </section>

        {/* Intro (Tag) */}
        <section className="nc-sec" data-tone="day">
          <div className="nc-wrap">
            <p className="nc-intro" data-reveal>
              Wir sind <b>Hebammen in Bonn</b> und arbeiten im Dienstbelegsystem im Marienhospital Bonn. Jede Geburt ist einzigartig, und Ihr Wohlbefinden und das Ihres Kindes stehen dabei immer im Mittelpunkt.
            </p>
            <div className="nc-stats">
              <div className="nc-stat" data-reveal>
                <b data-count="2000" data-suffix="+">2000+</b>
                <span>Geburten begleitet</span>
              </div>
              <div className="nc-stat" data-reveal>
                <b data-count="15" data-suffix="+">15+</b>
                <span>Jahre Erfahrung</span>
              </div>
              <div className="nc-stat" data-reveal>
                <b>24/7</b>
                <span>Erreichbarkeit</span>
              </div>
            </div>
          </div>
        </section>

        {/* Leistungen */}
        <section id="leistungen" className="nc-sec" data-tone="day" style={{ paddingTop: 0 }}>
          <div className="nc-wrap">
            <div data-reveal>
              <h2 className="nc-h2">
                Rundum <b>gut betreut</b>
              </h2>
              <p className="nc-lead">
                Von der Schwangerschaft bis zur Nachsorge begleiten wir Sie in jeder Phase mit Fachwissen und Herz.
              </p>
            </div>
            <div className="nc-svc">
              <div className="nc-svc__sticky">
                <div className="nc-svc__frame">
                  {SERVICES.map((s, i) => (
                    <img key={s.id} src={s.image} alt="" data-on={active === i} loading="lazy" />
                  ))}
                </div>
              </div>
              <div className="nc-svc__list">
                {SERVICES.map((s, i) => (
                  <div className="nc-svc__item" key={s.id}>
                    <div className="nc-svc__mimg">
                      <img src={s.image} alt="" loading="lazy" />
                    </div>
                    <span className="nc-svc__no">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="nc-svc__t">{s.title}</h3>
                    <p className="nc-svc__p">{s.summary}</p>
                    <button
                      type="button"
                      className="nc-btn nc-svc__more"
                      onClick={() => (s.action === 'team' ? scrollToId('team', -68) : openSheet({ type: 'service', id: s.id }))}
                    >
                      {s.action === 'team' ? 'Zur Hebammenliste' : 'Mehr erfahren'}
                      <ArrowRight size={20} weight="bold" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section id="team" className="nc-sec" data-tone="day" style={{ paddingTop: 0 }}>
          <div className="nc-wrap">
            <div data-reveal>
              <h2 className="nc-h2">
                Lernen Sie uns <b>kennen</b>
              </h2>
              <p className="nc-lead">Erfahrene Hebammen mit Herz und Leidenschaft für ihren Beruf.</p>
            </div>
            <div
              ref={teamRef}
              className="nc-team"
              data-drag="false"
              onPointerDown={onTeamDown}
              onPointerMove={onTeamMove}
              onPointerUp={onTeamUp}
              onPointerLeave={onTeamUp}
              tabIndex={0}
              aria-label="Team, seitlich scrollen"
            >
              {team.map((m, i) => (
                <button
                  key={m.name}
                  type="button"
                  className="nc-person"
                  onClick={() => dragRef.current.moved < 6 && openSheet({ type: 'person', index: i })}
                  aria-label={`${m.name}, Details`}
                >
                  <div className="nc-person__c">
                    <Portrait member={m} />
                  </div>
                  <div className="nc-person__n">{m.name}</div>
                  <div className="nc-person__r">{roles(m.role)[0] ?? 'Hebamme'}</div>
                </button>
              ))}
            </div>
            <div className="nc-team__cta">
              <button type="button" className="nc-btn nc-btn--line" onClick={() => openSheet({ type: 'job' })}>
                Werde Teil unseres Teams
                <ArrowUpRight size={20} weight="bold" />
              </button>
            </div>
          </div>
        </section>

        {/* Über uns (Abend) */}
        <section id="ueber-uns" className="nc-sec" data-tone="dusk">
          <div className="nc-wrap nc-about">
            <div data-reveal>
              <h2 className="nc-h2">
                Mit Herz und Kompetenz an <b>Ihrer Seite</b>
              </h2>
              <p className="nc-about__txt">{ABOUT_TEXT}</p>
              <div className="nc-facts">
                <span>
                  <Clock size={20} weight="bold" /> 24/7 erreichbar
                </span>
                <span>
                  <ShieldCheck size={20} weight="bold" /> Geprüfte Qualität
                </span>
              </div>
              <button type="button" className="nc-btn" onClick={() => openSheet({ type: 'video' })}>
                <FilmSlate size={20} weight="bold" />
                Einblick in den Kreißsaal
              </button>
            </div>
            <div className="nc-about__moon" data-reveal>
              <img src={GROUP_PHOTO} alt="Das Team der Hebammen am Marienhospital Bonn" />
            </div>
          </div>
        </section>

        {/* Bewertungen (Nacht) */}
        {reviews.length > 0 && (
          <section className="nc-sec nc-rev" data-tone="night">
            <div className="nc-wrap">
              <div className="nc-rev__head" data-reveal>
                <div className="nc-rev__score">{ratingText}</div>
                <div className="nc-rev__meta">
                  <div className="nc-rev__stars" aria-label={`${ratingText} von 5 Sternen`}>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} size={28} weight="fill" />
                    ))}
                  </div>
                  <p>{totalReviews} Bewertungen auf Google</p>
                </div>
              </div>
              <div className="nc-rev__cols">
                {reviews.map((r, i) => {
                  const long = r.text.length > 260;
                  const isOpen = expanded.has(i);
                  return (
                    <figure className="nc-quote" key={i} data-reveal>
                      <blockquote data-clamp={long && !isOpen}>&bdquo;{r.text}&ldquo;</blockquote>
                      {long && (
                        <button
                          type="button"
                          onClick={() => {
                            const n = new Set(expanded);
                            if (isOpen) n.delete(i);
                            else n.add(i);
                            setExpanded(n);
                          }}
                        >
                          {isOpen ? 'Weniger anzeigen' : 'Weiterlesen'}
                        </button>
                      )}
                      <footer>
                        <strong>{r.name}</strong>
                        <span>{r.date}</span>
                      </footer>
                    </figure>
                  );
                })}
              </div>
              <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="nc-btn nc-btn--line">
                Alle Bewertungen auf Google
                <ArrowUpRight size={20} weight="bold" />
              </a>
            </div>
          </section>
        )}

        {/* Aktuelles + Fragen */}
        <section id="aktuelles" className="nc-sec" data-tone="night" style={{ paddingTop: 0 }}>
          <div className="nc-wrap nc-two">
            <div data-reveal>
              <h2 className="nc-h2" style={{ fontSize: 'clamp(2.6rem, 5.4vw, 5.2rem)' }}>
                Aktuelles
              </h2>
              {news.map((n, i) => {
                const d = formatDate(n.datum);
                return (
                  <button key={n.titel + i} type="button" className="nc-news" onClick={() => openSheet({ type: 'news', index: i })}>
                    <small>
                      {d.day} {d.year}
                      {n.kategorie ? `, ${n.kategorie}` : ''}
                    </small>
                    <h3>{n.titel}</h3>
                    <p>{n.text}</p>
                  </button>
                );
              })}
              {news.length === 0 && <p className="nc-lead">Aktuell gibt es keine Neuigkeiten.</p>}
            </div>
            <div data-reveal>
              <h2 id="faq" className="nc-h2" style={{ fontSize: 'clamp(2.6rem, 5.4vw, 5.2rem)' }}>
                Häufig gestellte Fragen
              </h2>
              {cats.length > 2 && (
                <div className="nc-chips">
                  {cats.map((c) => (
                    <button key={c} type="button" className="nc-chip" aria-pressed={faqCat === c} onClick={() => { setFaqCat(c); setFaqOpen(0); }}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
              <div className="nc-faq">
                {faqShown.map((f, i) => (
                  <div key={f.frage} className="nc-q" data-open={faqOpen === i}>
                    <button type="button" className="nc-q__b" aria-expanded={faqOpen === i} onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                      {f.frage}
                      <Plus size={28} weight="light" />
                    </button>
                    <div className="nc-q__p">
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
        <section id="kontakt" className="nc-sec" data-tone="night" style={{ paddingTop: 0 }}>
          <div className="nc-wrap">
            <div data-reveal>
              <h2 className="nc-h2">
                Wir freuen uns <b>auf Sie</b>
              </h2>
              <p className="nc-lead">Vereinbaren Sie jetzt Ihren persönlichen Beratungstermin und lernen Sie uns kennen.</p>
              <a href={PHONE_HREF} className="nc-phone" aria-label={`Anrufen, ${PHONE}`}>
                {PHONE}
                <ArrowUpRight weight="light" />
              </a>
            </div>
            <div className="nc-cgrid">
              <div data-reveal>
                <a href={`mailto:${MAIL}`} className="nc-crow">
                  <Envelope size={28} weight="light" />
                  <div>
                    <small>E-Mail</small>
                    <strong>{MAIL}</strong>
                  </div>
                </a>
                <div className="nc-crow">
                  <MapPin size={28} weight="light" />
                  <div>
                    <small>Adresse</small>
                    <strong>
                      {ADDRESS_1}
                      <br />
                      {ADDRESS_2}
                    </strong>
                  </div>
                </div>
                <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="nc-crow">
                  <InstagramLogo size={28} weight="light" />
                  <div>
                    <small>Instagram</small>
                    <strong>@hebammen_marienhospital_bonn</strong>
                  </div>
                </a>
              </div>
              <div className="nc-map" data-reveal>
                <iframe src={MAP_SRC} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Standort Marienhospital Bonn" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="nc-foot" data-tone="night">
        <div className="nc-wrap">
          <div className="nc-foot__row">
            <div>
              <div className="nc-brand">
                <img src={LOGO_URL} alt="" width={44} height={44} />
                <span>Hebammen am Marienhospital</span>
              </div>
              <p>Die Geburt ist ein individuelles und unvergessliches Erlebnis. Wir begleiten Sie einfühlsam und kompetent auf diesem besonderen Weg.</p>
            </div>
            <div>
              <h4>Navigation</h4>
              <ul>
                {NAV.map((l) => (
                  <li key={l.id}>
                    <a href={`#${l.id}`} onClick={go(l.id)}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Rechtliches</h4>
              <ul>
                <li>
                  <a href="#">Impressum</a>
                </li>
                <li>
                  <a href="#">Datenschutz</a>
                </li>
                <li>
                  <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <p className="nc-foot__legal" style={{ maxWidth: 'none' }}>
            © {new Date().getFullYear()} Hebammen am Marienhospital Bonn. Alle Rechte vorbehalten.
          </p>
        </div>
      </footer>

      <Sheets sheet={sheet} open={open} closeSheet={closeSheet} />
    </div>
  );
}
