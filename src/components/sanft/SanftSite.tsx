'use client';

import { useEffect, useRef, useState } from 'react';
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
  STATEMENT,
  Sheets,
  faq,
  formatDate,
  news,
  ratingText,
  reviews,
  scrollToId,
  team,
  totalReviews,
  useGsapPage,
  useSheets,
} from '../designs/shared';

const CARD_BG = ['sf-tile--sky', 'sf-tile--butter', '', 'sf-tile--navy'];

/** Bewertungen als Kartenstapel: oben liegende Karte lässt sich wegwischen. */
function Deck() {
  const n = reviews.length;
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const topRef = useRef<HTMLElement | null>(null);
  const drag = useRef({ active: false, startX: 0, dx: 0 });

  const next = () => {
    setOpen(false);
    setIdx((i) => (i + 1) % n);
  };
  const prev = () => {
    setOpen(false);
    setIdx((i) => (i - 1 + n) % n);
  };

  const onDown = (e: React.PointerEvent<HTMLElement>) => {
    if (open || (e.target as HTMLElement).closest('button')) return;
    drag.current = { active: true, startX: e.clientX, dx: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.dataset.drag = 'true';
  };
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    drag.current.dx = dx;
    e.currentTarget.style.transform = `translateX(${dx}px) rotate(${dx / 24}deg)`;
  };
  const onUp = (e: React.PointerEvent<HTMLElement>) => {
    if (!drag.current.active) return;
    const el = e.currentTarget;
    const dx = drag.current.dx;
    drag.current.active = false;
    el.dataset.drag = 'false';
    if (Math.abs(dx) > 110) {
      el.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s';
      el.style.transform = `translateX(${dx > 0 ? 140 : -140}%) rotate(${dx > 0 ? 18 : -18}deg)`;
      el.style.opacity = '0';
      setTimeout(next, 280);
    } else {
      el.style.transform = '';
    }
  };

  const order = [2, 1, 0].filter((p) => p < n);

  return (
    <div className="sf-deck" aria-roledescription="Karten" aria-label="Bewertungen">
      {order.map((p) => {
        const r = reviews[(idx + p) % n];
        const key = (idx + p) % n;
        const long = r.text.length > 330;
        const top = p === 0;
        return (
          <article
            key={key}
            ref={top ? (el) => { topRef.current = el; } : undefined}
            className="sf-rcard"
            data-open={top && open ? 'true' : 'false'}
            style={top ? undefined : { transform: `translateY(${p * 14}px) scale(${1 - p * 0.045})`, opacity: 1 - p * 0.25 }}
            onPointerDown={top ? onDown : undefined}
            onPointerMove={top ? onMove : undefined}
            onPointerUp={top ? onUp : undefined}
            onPointerCancel={top ? onUp : undefined}
            aria-hidden={!top}
          >
            <div>
              <blockquote>&bdquo;{r.text}&ldquo;</blockquote>
              {top && long && (
                <button type="button" className="sf-rcard__more" onClick={() => setOpen((v) => !v)}>
                  {open ? 'Weniger anzeigen' : 'Weiterlesen'}
                </button>
              )}
            </div>
            <footer>
              <strong>{r.name}</strong>
              <span>{r.date}</span>
            </footer>
          </article>
        );
      })}
      <div className="sf-deck__ctl">
        <button type="button" className="sf-round" onClick={prev} aria-label="Vorherige Bewertung">
          <ArrowLeft size={22} weight="bold" />
        </button>
        <button type="button" className="sf-round" onClick={next} aria-label="Nächste Bewertung">
          <ArrowRight size={22} weight="bold" />
        </button>
        <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">
          Alle Bewertungen auf Google
        </a>
      </div>
    </div>
  );
}

export default function SanftSite() {
  const root = useRef<HTMLDivElement>(null);
  const { sheet, open, openSheet, closeSheet } = useSheets();
  const [menu, setMenu] = useState(false);
  const [faqCat, setFaqCat] = useState('Alle');
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  useGsapPage(root, ({ gsap, ScrollTrigger, el, desktop }) => {
    // Hero-Kacheln poppen nacheinander auf
    gsap.fromTo(
      '[data-pop]',
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out', stagger: 0.09, delay: 0.1, clearProps: 'transform' }
    );

    // Zahl zählt hoch
    const num = el.querySelector<HTMLElement>('[data-count]');
    if (num) {
      const o = { v: 0 };
      gsap.to(o, {
        v: Number(num.dataset.count),
        duration: 2.4,
        ease: 'power3.out',
        delay: 0.5,
        onUpdate: () => {
          num.textContent = Math.round(o.v) + (num.dataset.suffix ?? '');
        },
      });
    }

    // Einblenden beim Scrollen
    ScrollTrigger.batch(gsap.utils.toArray<HTMLElement>('[data-reveal]', el), {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => gsap.fromTo(batch, { y: 34 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.07, overwrite: true }),
    });

    // Team-Kacheln neigen sich zum Zeiger
    const cleanups: Array<() => void> = [];
    if (window.matchMedia('(hover: hover)').matches) {
      gsap.utils.toArray<HTMLElement>('.sf-member').forEach((tile) => {
        const rx = gsap.quickTo(tile, 'rotationX', { duration: 0.5, ease: 'power3.out' });
        const ry = gsap.quickTo(tile, 'rotationY', { duration: 0.5, ease: 'power3.out' });
        const move = (e: PointerEvent) => {
          const r = tile.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 14);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 14);
        };
        const leave = () => {
          rx(0);
          ry(0);
        };
        tile.addEventListener('pointermove', move);
        tile.addEventListener('pointerleave', leave);
        cleanups.push(() => {
          tile.removeEventListener('pointermove', move);
          tile.removeEventListener('pointerleave', leave);
        });
      });
    }

    // Leistungen: Karten stapeln sich (Sticky-Stack, nur Desktop)
    if (desktop) {
      const items = gsap.utils.toArray<HTMLElement>('.sf-stack__item', el);
      const last = items[items.length - 1];
      items.forEach((item, i) => {
        if (i === items.length - 1) return;
        ScrollTrigger.create({
          trigger: item,
          start: 'top top',
          endTrigger: last,
          end: 'top top',
          pin: true,
          pinSpacing: false,
        });
        gsap.to(item.querySelector('.sf-svc'), {
          scale: 0.92,
          filter: 'brightness(0.78)',
          ease: 'none',
          scrollTrigger: { trigger: items[i + 1], start: 'top bottom', end: 'top top', scrub: true },
        });
      });
    }

    return () => cleanups.forEach((c) => c());
  });

  const cats = ['Alle', ...Array.from(new Set(faq.map((f) => f.kategorie).filter(Boolean) as string[]))];
  const faqShown = faq.filter((f) => faqCat === 'Alle' || f.kategorie === faqCat);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenu(false);
    setTimeout(() => scrollToId(id, -90), 30);
  };

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu]);

  return (
    <div ref={root}>
      <header className="sf-nav">
        <div className="sf-nav__in">
          <a href="#top" onClick={go('top')} className="sf-brand" aria-label="Zur Startseite">
            <img src={LOGO_URL} alt="" width={40} height={40} />
            <span>Hebammen am Marienhospital</span>
          </a>
          <nav className="sf-nav__links" aria-label="Hauptnavigation">
            {NAV.map((l) => (
              <a key={l.id} href={`#${l.id}`} onClick={go(l.id)}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="sf-nav__r">
            <a href={PHONE_HREF} className="sf-btn sf-btn--butter" aria-label="Anrufen">
              <Phone size={20} weight="bold" />
              <span>Anrufen</span>
            </a>
            <button type="button" className="sf-burger" onClick={() => setMenu((v) => !v)} aria-expanded={menu}>
              {menu ? 'Zu' : 'Menü'}
            </button>
          </div>
        </div>
        {menu && (
          <nav className="sf-drop" aria-label="Menü">
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
        <section id="top" className="sf-hero">
          <div className="sf-wrap sf-hero__grid">
            <div className="sf-tile sf-tile--sky sf-hero__a" data-pop>
              <div>
                <h1 className="sf-h1">
                  Ihre Hebammen
                  <br />
                  in <span className="hl">Bonn</span>
                </h1>
                <p className="sf-hero__sub">
                  Die Geburt ist ein individuelles und unvergessliches Erlebnis. Wir begleiten Sie einfühlsam und kompetent.
                </p>
              </div>
              <div className="sf-hero__cta">
                <a href="#kontakt" onClick={go('kontakt')} className="sf-btn">
                  Kontakt aufnehmen
                  <ArrowRight size={20} weight="bold" />
                </a>
                <a href="#leistungen" onClick={go('leistungen')} className="sf-btn sf-btn--line">
                  Leistungen ansehen
                </a>
              </div>
            </div>
            <div className="sf-tile sf-hero__b" data-pop>
              <video autoPlay muted loop playsInline preload="auto" aria-hidden>
                <source src={HERO_VIDEO} type="video/mp4" />
              </video>
            </div>
            <a href={PHONE_HREF} className="sf-tile sf-tile--butter sf-hero__c" data-pop aria-label={`Anrufen, ${PHONE}`}>
              <span className="sf-callround">
                <Phone size={22} weight="fill" />
              </span>
              <div>
                <div className="sf-num">24/7</div>
                <small>Rund um die Uhr erreichbar</small>
              </div>
            </a>
            <div className="sf-tile sf-tile--navy sf-hero__d" data-pop>
              <div className="sf-num" data-count="2000" data-suffix="+">
                2000+
              </div>
              <small className="sf-muted">Geburten begleitet</small>
            </div>
          </div>
        </section>

        {/* Leistungen */}
        <section id="leistungen" className="sf-sec" style={{ paddingBottom: 0 }}>
          <div className="sf-wrap">
            <div data-reveal>
              <h2 className="sf-h2">Rundum gut betreut</h2>
              <p className="sf-lead">
                Von der Schwangerschaft bis zur Nachsorge begleiten wir Sie in jeder Phase mit Fachwissen und Herz.
              </p>
            </div>
            <div className="sf-stack">
              {SERVICES.map((s, i) => (
                <div className="sf-stack__item" key={s.id}>
                  <button
                    type="button"
                    className={`sf-tile sf-svc ${CARD_BG[i % CARD_BG.length]} ${i % 2 ? 'sf-svc--flip' : ''}`}
                    onClick={() => (s.action === 'team' ? scrollToId('team', -90) : openSheet({ type: 'service', id: s.id }))}
                    aria-label={`${s.title}, mehr erfahren`}
                  >
                    <div className="sf-svc__txt">
                      <div>
                        <h3 className="sf-svc__t">{s.title}</h3>
                        <p className={`sf-svc__p ${i === 3 ? 'sf-muted' : ''}`}>{s.summary}</p>
                      </div>
                      <span className={`sf-btn sf-svc__more ${i === 3 ? 'sf-btn--butter' : ''}`}>
                        {s.action === 'team' ? 'Zur Hebammenliste' : 'Mehr erfahren'}
                        <ArrowRight size={20} weight="bold" />
                      </span>
                    </div>
                    <div className="sf-svc__img">
                      <img src={s.image} alt="" loading="lazy" />
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section id="team" className="sf-sec">
          <div className="sf-wrap">
            <div data-reveal>
              <h2 className="sf-h2">Lernen Sie uns kennen</h2>
              <p className="sf-lead">Erfahrene Hebammen mit Herz und Leidenschaft für ihren Beruf.</p>
            </div>
            <div className="sf-wall">
              {team.map((m, i) => (
                <button
                  key={m.name}
                  type="button"
                  className="sf-member"
                  data-reveal
                  onClick={() => openSheet({ type: 'person', index: i })}
                  aria-label={`${m.name}, Details`}
                >
                  <Portrait member={m} />
                  <span className="sf-member__n">{m.name}</span>
                </button>
              ))}
              <button type="button" className="sf-join" data-reveal onClick={() => openSheet({ type: 'job' })}>
                <h3>Werde Teil unseres Teams</h3>
                <span className="sf-btn">
                  Mehr dazu
                  <ArrowUpRight size={20} weight="bold" />
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Über uns */}
        <section id="ueber-uns" className="sf-sec" style={{ paddingTop: 0 }}>
          <div className="sf-wrap sf-about">
            <div className="sf-tile sf-about__img" data-reveal>
              <img src={GROUP_PHOTO} alt="Das Team der Hebammen am Marienhospital Bonn" />
            </div>
            <div className="sf-about__col">
              <div className="sf-tile sf-tile--sky" data-reveal>
                <h2 className="sf-h2" style={{ fontSize: 'clamp(2rem, 4vw, 3.6rem)', marginBottom: '1.2rem' }}>
                  Mit Herz und Kompetenz an Ihrer Seite
                </h2>
                <p className="sf-about__txt">{ABOUT_TEXT}</p>
              </div>
              <div className="sf-facts">
                <div className="sf-tile sf-tile--butter" data-reveal>
                  <Clock size={32} weight="bold" />
                  <div>
                    <div className="sf-num">15+</div>
                    <small>Jahre Erfahrung</small>
                  </div>
                </div>
                <div className="sf-tile sf-tile--navy" data-reveal>
                  <ShieldCheck size={32} weight="bold" />
                  <div>
                    <div className="sf-num" style={{ fontSize: 'clamp(1.6rem, 2.6vw, 2.4rem)' }}>
                      Geprüfte Qualität
                    </div>
                    <small className="sf-muted">Höchste Standards</small>
                  </div>
                </div>
              </div>
              <div className="sf-tile" data-reveal>
                <p className="sf-about__statement">{STATEMENT}</p>
              </div>
              <button type="button" className="sf-tile sf-tile--butter" data-reveal onClick={() => openSheet({ type: 'video' })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <span className="sf-about__statement" style={{ fontSize: 'clamp(1.4rem, 2.2vw, 2rem)' }}>
                  Einblick in unseren Kreißsaal
                </span>
                <span className="sf-callround" style={{ width: 56, height: 56 }}>
                  <FilmSlate size={26} weight="bold" />
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Bewertungen */}
        {reviews.length > 0 && (
          <section className="sf-sec" style={{ paddingTop: 0 }}>
            <div className="sf-wrap sf-rev" data-reveal>
              <div className="sf-tile sf-tile--navy sf-rev__score">
                <h2 className="sf-h2" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)' }}>
                  Was Familien sagen
                </h2>
                <div>
                  <div className="sf-rev__big">{ratingText}</div>
                  <div className="sf-rev__stars" aria-label={`${ratingText} von 5 Sternen`}>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} size={28} weight="fill" />
                    ))}
                  </div>
                  <p className="sf-muted" style={{ marginTop: '0.8rem' }}>
                    {totalReviews} Bewertungen auf Google
                  </p>
                </div>
              </div>
              <Deck />
            </div>
          </section>
        )}

        {/* Aktuelles + Fragen */}
        <section id="aktuelles" className="sf-sec" style={{ paddingTop: 0 }}>
          <div className="sf-wrap sf-two">
            <div className="sf-tile sf-tile--butter" data-reveal>
              <h2 className="sf-h2" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.6rem)' }}>
                Aktuelles
              </h2>
              {news.map((n, i) => {
                const d = formatDate(n.datum);
                return (
                  <button key={n.titel + i} type="button" className="sf-news" onClick={() => openSheet({ type: 'news', index: i })}>
                    <small>
                      {d.day} {d.year}
                      {n.kategorie ? `, ${n.kategorie}` : ''}
                    </small>
                    <h3>{n.titel}</h3>
                    <p>{n.text}</p>
                  </button>
                );
              })}
              {news.length === 0 && <p className="sf-lead">Aktuell gibt es keine Neuigkeiten.</p>}
            </div>
            <div className="sf-tile" data-reveal>
              <h2 id="faq" className="sf-h2" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.6rem)' }}>
                Häufig gestellte Fragen
              </h2>
              {cats.length > 2 && (
                <div className="sf-chips">
                  {cats.map((c) => (
                    <button key={c} type="button" className="sf-chip" aria-pressed={faqCat === c} onClick={() => { setFaqCat(c); setFaqOpen(0); }}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ marginTop: '1.2rem' }}>
                {faqShown.map((f, i) => (
                  <div key={f.frage} className="sf-q" data-open={faqOpen === i}>
                    <button type="button" className="sf-q__b" aria-expanded={faqOpen === i} onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                      {f.frage}
                      <i>
                        <Plus size={20} weight="bold" />
                      </i>
                    </button>
                    <div className="sf-q__p">
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
        <section id="kontakt" style={{ paddingBottom: 0 }}>
          <div className="sf-wrap">
            <div className="sf-tile sf-tile--navy sf-contact" data-reveal>
              <div>
                <h2 className="sf-h2">Wir freuen uns auf Sie</h2>
                <p className="sf-muted" style={{ marginTop: '1rem', maxWidth: '40ch' }}>
                  Vereinbaren Sie jetzt Ihren persönlichen Beratungstermin und lernen Sie uns kennen.
                </p>
                <a href={PHONE_HREF} className="sf-phone" aria-label={`Anrufen, ${PHONE}`}>
                  {PHONE}
                  <ArrowUpRight weight="bold" />
                </a>
                <div className="sf-crows">
                  <a href={`mailto:${MAIL}`} className="sf-crow">
                    <Envelope size={26} weight="bold" />
                    <div>
                      <small>E-Mail</small>
                      <strong>{MAIL}</strong>
                    </div>
                  </a>
                  <div className="sf-crow">
                    <MapPin size={26} weight="bold" />
                    <div>
                      <small>Adresse</small>
                      <strong>
                        {ADDRESS_1}, {ADDRESS_2}
                      </strong>
                    </div>
                  </div>
                  <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="sf-crow">
                    <InstagramLogo size={26} weight="bold" />
                    <div>
                      <small>Instagram</small>
                      <strong>@hebammen_marienhospital_bonn</strong>
                    </div>
                  </a>
                </div>
              </div>
              <div className="sf-map">
                <iframe src={MAP_SRC} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Standort Marienhospital Bonn" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="sf-wrap">
        <div className="sf-tile sf-foot">
          <div>
            <div className="sf-brand">
              <img src={LOGO_URL} alt="" width={52} height={52} />
              <span style={{ fontSize: '1.3rem' }}>Hebammen am Marienhospital</span>
            </div>
            <p className="sf-muted">Die Geburt ist ein individuelles und unvergessliches Erlebnis. Wir begleiten Sie einfühlsam und kompetent auf diesem besonderen Weg.</p>
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
        <p className="sf-legal">© {new Date().getFullYear()} Hebammen am Marienhospital Bonn. Alle Rechte vorbehalten.</p>
      </footer>

      <Sheets sheet={sheet} open={open} closeSheet={closeSheet} />
    </div>
  );
}
