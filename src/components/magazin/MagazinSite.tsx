'use client';

import { useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  FilmSlate,
  Plus,
  ShieldCheck,
  Star,
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
  STATEMENT,
  SERVICES,
  Sheets,
  faq,
  formatDate,
  news,
  rating,
  ratingText,
  reviews,
  roles,
  scrollToId,
  team,
  totalReviews,
  useLenisOnly,
  useSheets,
} from '../designs/shared';

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function MagazinSite() {
  useLenisOnly();
  const reduce = useReducedMotion();
  const { sheet, open, openSheet, closeSheet } = useSheets();
  const [menu, setMenu] = useState(false);
  const [strip, setStrip] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [faqCat, setFaqCat] = useState('Alle');
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  // Fortschrittslinie oben
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  // Vorschau-Foto folgt der Maus im Team-Verzeichnis (ohne React-Rendering pro Bewegung)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const fx = useSpring(mx, { stiffness: 260, damping: 28 });
  const fy = useSpring(my, { stiffness: 260, damping: 28 });

  // Parallax im Bild "Über uns"
  const aboutRef = useRef<HTMLElement>(null);
  const { scrollYProgress: aboutP } = useScroll({ target: aboutRef, offset: ['start end', 'end start'] });
  const aboutY = useTransform(aboutP, [0, 1], ['-6%', '6%']);

  const cats = ['Alle', ...Array.from(new Set(faq.map((f) => f.kategorie).filter(Boolean) as string[]))];
  const faqShown = faq.filter((f) => faqCat === 'Alle' || f.kategorie === faqCat);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenu(false);
    setTimeout(() => scrollToId(id, -64), 30);
  };

  const lineAnim = (i: number) =>
    reduce
      ? {}
      : {
          initial: { y: '110%' },
          animate: { y: 0 },
          transition: { duration: 1.2, delay: 0.1 + i * 0.12, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <div>
      <motion.div className="mg-progress" style={{ scaleX: reduce ? 0 : progress }} aria-hidden />

      <header className="mg-nav">
        <div className="mg-wrap mg-nav__in">
          <a href="#top" onClick={go('top')} className="mg-brand" aria-label="Zur Startseite">
            <img src={LOGO_URL} alt="" width={40} height={40} />
            <span>Hebammen am Marienhospital</span>
          </a>
          <nav className="mg-nav__links" aria-label="Hauptnavigation">
            {NAV.map((l) => (
              <a key={l.id} href={`#${l.id}`} onClick={go(l.id)}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mg-nav__r">
            <a href={PHONE_HREF} className="mg-btn" aria-label="Anrufen">
              <span>Anrufen</span>
              <ArrowUpRight size={18} weight="bold" className="mg-arrow" />
            </a>
            <button type="button" className="mg-burger" onClick={() => setMenu((v) => !v)} aria-expanded={menu} aria-label="Menü">
              {menu ? 'Schließen' : 'Menü'}
            </button>
          </div>
        </div>
        {menu && (
          <nav className="mg-drop" aria-label="Menü">
            {NAV.map((l) => (
              <a key={l.id} href={`#${l.id}`} onClick={go(l.id)}>
                {l.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main id="main-content">
        {/* Hero */}
        <section id="top" className="mg-hero">
          <div className="mg-wrap">
            <h1 className="mg-h1">
              <span>
                <motion.span {...lineAnim(0)}>Ihre Hebammen</motion.span>
              </span>
              <span>
                <motion.span {...lineAnim(1)}>
                  in <em>Bonn</em>
                </motion.span>
              </span>
            </h1>
            <div className="mg-hero__row">
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="mg-hero__sub">
                  Die Geburt ist ein individuelles und unvergessliches Erlebnis. Wir begleiten Sie einfühlsam und kompetent.
                </p>
                <div className="mg-hero__cta">
                  <a href="#kontakt" onClick={go('kontakt')} className="mg-btn mg-btn--accent">
                    Kontakt aufnehmen
                    <ArrowRight size={20} weight="bold" className="mg-arrow" />
                  </a>
                  <a href="#leistungen" onClick={go('leistungen')} className="mg-btn mg-btn--line">
                    Leistungen ansehen
                  </a>
                </div>
              </motion.div>
              <motion.figure
                className="mg-fig mg-hero__fig"
                initial={reduce ? false : { clipPath: 'inset(0 0 100% 0)' }}
                animate={{ clipPath: 'inset(0 0 0% 0)' }}
                transition={{ duration: 1.3, delay: 0.3, ease: [0.76, 0, 0.24, 1] }}
              >
                <video autoPlay muted loop playsInline preload="auto" aria-hidden>
                  <source src={HERO_VIDEO} type="video/mp4" />
                </video>
              </motion.figure>
            </div>
          </div>
        </section>

        {/* Statement + Zahlen */}
        <section className="mg-sec" style={{ paddingTop: 'clamp(3rem, 6vw, 6rem)' }}>
          <div className="mg-wrap">
            <Reveal>
              <p className="mg-statement">{STATEMENT}</p>
            </Reveal>
            <div className="mg-stats">
              {[
                ['2000+', 'Geburten begleitet'],
                ['15+', 'Jahre Erfahrung'],
                ['24/7', 'Erreichbarkeit'],
              ].map(([n, l], i) => (
                <Reveal key={l} delay={i * 0.1} className="mg-stat">
                  <b>{n}</b>
                  <span>{l}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Leistungen */}
        <section id="leistungen" className="mg-sec" style={{ paddingTop: 0 }}>
          <div className="mg-wrap">
            <Reveal>
              <h2 className="mg-h2">
                Rundum <em>gut betreut</em>
              </h2>
              <p className="mg-lead">
                Von der Schwangerschaft bis zur Nachsorge begleiten wir Sie in jeder Phase mit Fachwissen und Herz.
              </p>
            </Reveal>
            <div className="mg-strips">
              {SERVICES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className="mg-strip"
                  data-active={strip === i}
                  onMouseEnter={() => setStrip(i)}
                  onFocus={() => setStrip(i)}
                  onClick={() => {
                    if (strip !== i) return setStrip(i);
                    if (s.action === 'team') scrollToId('team');
                    else openSheet({ type: 'service', id: s.id });
                  }}
                  aria-label={`${s.title}${strip === i ? ', mehr erfahren' : ''}`}
                >
                  <img src={s.image} alt="" loading="lazy" />
                  <span className="mg-strip__no">{String(i + 1).padStart(2, '0')}</span>
                  <span className="mg-strip__in">
                    <h3>{s.title}</h3>
                    <p>{s.summary}</p>
                    <span className="mg-more">
                      {s.action === 'team' ? 'Zur Hebammenliste' : 'Mehr erfahren'}
                      <ArrowRight size={18} weight="bold" className="mg-arrow" />
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section id="team" className="mg-sec" style={{ paddingTop: 0 }}>
          <div className="mg-wrap">
            <Reveal>
              <h2 className="mg-h2">
                Lernen Sie uns <em>kennen</em>
              </h2>
              <p className="mg-lead">Erfahrene Hebammen mit Herz und Leidenschaft für ihren Beruf.</p>
            </Reveal>
            <ul
              className="mg-index"
              onMouseMove={(e) => {
                mx.set(e.clientX + 28);
                my.set(e.clientY - 110);
              }}
              onMouseLeave={() => setHover(null)}
            >
              {team.map((m, i) => (
                <li key={m.name}>
                  <button
                    type="button"
                    className="mg-row"
                    onMouseEnter={() => setHover(i)}
                    onClick={() => openSheet({ type: 'person', index: i })}
                    aria-label={`${m.name}, Details`}
                  >
                    <span className="mg-row__thumb">
                      {m.image && <img src={m.image} alt="" loading="lazy" referrerPolicy="no-referrer" />}
                    </span>
                    <span className="mg-row__n">
                      {m.name}
                      <span className="mg-row__r">{roles(m.role)[0] ?? 'Hebamme'}</span>
                    </span>
                    <ArrowUpRight size={22} weight="bold" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            <motion.div
              className="mg-float"
              style={{ x: fx, y: fy }}
              animate={{ opacity: hover === null ? 0 : 1, scale: hover === null ? 0.92 : 1 }}
              transition={{ duration: 0.25 }}
              aria-hidden
            >
              {hover !== null && <Portrait key={hover} member={team[hover]} />}
            </motion.div>
            <div className="mg-team__cta">
              <button type="button" className="mg-btn" onClick={() => openSheet({ type: 'job' })}>
                Werde Teil unseres Teams
                <ArrowUpRight size={20} weight="bold" className="mg-arrow" />
              </button>
            </div>
          </div>
        </section>

        {/* Über uns */}
        <section id="ueber-uns" className="mg-sec" style={{ paddingTop: 0 }} ref={aboutRef}>
          <div className="mg-wrap">
            <figure className="mg-fig mg-about__fig">
              <motion.img
                src={GROUP_PHOTO}
                alt="Das Team der Hebammen am Marienhospital Bonn"
                style={{ y: reduce ? 0 : aboutY }}
              />
            </figure>
            <div className="mg-about__grid">
              <Reveal className="mg-about__h">
                <h2 className="mg-h2" style={{ gridColumn: '1 / -1' }}>
                  Mit Herz und Kompetenz an <em>Ihrer Seite</em>
                </h2>
              </Reveal>
              <Reveal className="mg-about__txt">
                <p>{ABOUT_TEXT}</p>
              </Reveal>
              <Reveal className="mg-about__side" delay={0.1}>
                <ul className="mg-facts">
                  <li>
                    <Clock size={28} weight="regular" /> 24/7 erreichbar
                  </li>
                  <li>
                    <ShieldCheck size={28} weight="regular" /> Geprüfte Qualität
                  </li>
                </ul>
                <button type="button" className="mg-btn mg-btn--accent" onClick={() => openSheet({ type: 'video' })}>
                  <FilmSlate size={20} weight="bold" />
                  Einblick in den Kreißsaal
                </button>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Bewertungen */}
        {reviews.length > 0 && (
          <section className="mg-sec mg-rev">
            <div className="mg-wrap">
              <Reveal className="mg-rev__head">
                <div className="mg-rev__score">{ratingText}</div>
                <div className="mg-rev__meta">
                  <div className="mg-rev__stars" aria-label={`${ratingText} von 5 Sternen`}>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} size={28} weight="fill" />
                    ))}
                  </div>
                  <p>{totalReviews} Bewertungen auf Google</p>
                </div>
              </Reveal>
              <div className="mg-rev__row" tabIndex={0} aria-label="Bewertungen, seitlich scrollen">
                {reviews.map((r, i) => {
                  const long = r.text.length > 240;
                  const isOpen = expanded.has(i);
                  return (
                    <figure className="mg-quote" key={i}>
                      <div>
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
                      </div>
                      <figcaption>
                        <strong>{r.name}</strong>
                        <span>{r.date}</span>
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
              <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="mg-btn mg-rev__link">
                Alle Bewertungen auf Google
                <ArrowUpRight size={20} weight="bold" className="mg-arrow" />
              </a>
            </div>
          </section>
        )}

        {/* Aktuelles + Fragen */}
        <section id="aktuelles" className="mg-sec">
          <div className="mg-wrap mg-two">
            <Reveal>
              <h2 className="mg-h2">Aktuelles</h2>
              {news.map((n, i) => {
                const d = formatDate(n.datum);
                return (
                  <button key={n.titel + i} type="button" className="mg-news" onClick={() => openSheet({ type: 'news', index: i })}>
                    <small>
                      {d.day} {d.year}
                      {n.kategorie ? `, ${n.kategorie}` : ''}
                    </small>
                    <h3>{n.titel}</h3>
                    <p>{n.text}</p>
                    <span className="mg-more">
                      Lesen <ArrowRight size={18} weight="bold" className="mg-arrow" />
                    </span>
                  </button>
                );
              })}
              {news.length === 0 && <p className="mg-lead">Aktuell gibt es keine Neuigkeiten.</p>}
            </Reveal>
            <Reveal delay={0.1}>
              <h2 id="faq" className="mg-h2">
                Häufig gestellte Fragen
              </h2>
              {cats.length > 2 && (
                <div className="mg-faq__tabs">
                  {cats.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="mg-chip"
                      aria-pressed={faqCat === c}
                      onClick={() => {
                        setFaqCat(c);
                        setFaqOpen(0);
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
              <div className="mg-faq">
                {faqShown.map((f, i) => (
                  <div key={f.frage} className="mg-q" data-open={faqOpen === i}>
                    <button type="button" className="mg-q__b" aria-expanded={faqOpen === i} onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                      {f.frage}
                      <Plus size={26} weight="regular" />
                    </button>
                    <div className="mg-q__p">
                      <div>
                        <p>{f.antwort}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Kontakt */}
        <section id="kontakt" className="mg-sec mg-contact">
          <div className="mg-wrap">
            <Reveal>
              <h2 className="mg-h2">
                Wir freuen uns <em>auf Sie</em>
              </h2>
              <p className="mg-lead">Vereinbaren Sie jetzt Ihren persönlichen Beratungstermin und lernen Sie uns kennen.</p>
              <a href={PHONE_HREF} className="mg-phone" aria-label={`Anrufen, ${PHONE}`}>
                {PHONE}
                <ArrowUpRight weight="bold" />
              </a>
            </Reveal>
            <div className="mg-cgrid">
              <a href={`mailto:${MAIL}`} className="mg-cc">
                <small>E-Mail</small>
                <strong>{MAIL}</strong>
              </a>
              <div className="mg-cc">
                <small>Adresse</small>
                <strong>
                  {ADDRESS_1}
                  <br />
                  {ADDRESS_2}
                </strong>
              </div>
              <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="mg-cc">
                <small>Instagram</small>
                <strong>@hebammen_marienhospital_bonn</strong>
              </a>
            </div>
            <div className="mg-map">
              <iframe src={MAP_SRC} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Standort Marienhospital Bonn" />
            </div>
          </div>
        </section>
      </main>

      <footer className="mg-foot">
        <div className="mg-wrap">
          <div className="mg-foot__cols">
            <div>
              <div className="mg-brand">
                <img src={LOGO_URL} alt="" width={56} height={56} />
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
          <p className="mg-foot__legal" style={{ maxWidth: 'none' }}>
            © {new Date().getFullYear()} Hebammen am Marienhospital Bonn. Alle Rechte vorbehalten.
          </p>
        </div>
      </footer>

      <Sheets sheet={sheet} open={open} closeSheet={closeSheet} />
    </div>
  );
}
