// ============================================================
//  Inhalts-Client für die statische Website
// ------------------------------------------------------------
//  Holt ALLE dynamischen Inhalte (Team, Aktuelles, FAQ, Bewertungen)
//  mit EINEM einzigen Aufruf von unserem Google-Apps-Script-Backend.
//
//  Vorteil: Funktioniert auf jedem statischen Hosting (Netlify, IONOS, …),
//  kein API-Key im Browser, Bilder werden serverseitig aufgelöst.
//
//  Die URL kommt aus der Umgebungsvariable NEXT_PUBLIC_CONTENT_API_URL
//  (siehe .env.local). Setup-Anleitung: ANLEITUNG_APPS_SCRIPT.md
// ============================================================

const CONTENT_API_URL = process.env.NEXT_PUBLIC_CONTENT_API_URL || '';

interface TeamMember {
  firstName?: string;
  lastName?: string;
  name: string;
  role: string;
  area: string;
  phone: string;
  email: string;
  image: string;
}

interface AktuellesEntry {
  titel: string;
  text: string;
  datum: string;
  kategorie: string;
  bildname: string;
}

interface FAQEntry {
  frage: string;
  antwort: string;
  kategorie: string;
}

interface ReviewEntry {
  name: string;
  rating: number;
  text: string;
  date: string;
}

interface ContentPayload {
  team: TeamMember[];
  aktuelles: AktuellesEntry[];
  faq: FAQEntry[];
  reviews: ReviewEntry[];
  overallRating: number;
  totalReviews: number;
}

const EMPTY_PAYLOAD: ContentPayload = {
  team: [],
  aktuelles: [],
  faq: [],
  reviews: [],
  overallRating: 0,
  totalReviews: 0,
};

// ------------------------------------------------------------
//  Fallback-Bewertungen (nur wenn das Backend keine liefert)
// ------------------------------------------------------------
const FALLBACK_REVIEWS: ReviewEntry[] = [
  {
    name: 'Anna M.',
    rating: 5,
    text: 'Die einfühlsame Betreuung durch das Team hat mir sehr geholfen. Ich fühlte mich jederzeit gut aufgehoben.',
    date: 'vor 2 Wochen',
  },
  {
    name: 'Lisa K.',
    rating: 5,
    text: 'Professionell, herzlich und kompetent. Ich kann die Hebammen am Marienhospital nur wärmstens empfehlen!',
    date: 'vor 1 Monat',
  },
  {
    name: 'Sarah B.',
    rating: 5,
    text: 'Vom ersten Gespräch bis zur Nachsorge wurde ich wunderbar begleitet. Vielen Dank für alles!',
    date: 'vor 3 Wochen',
  },
  {
    name: 'Julia F.',
    rating: 5,
    text: 'Ich habe mich während der gesamten Schwangerschaft bestens betreut gefühlt. Das Team ist unglaublich kompetent und warmherzig.',
    date: 'vor 2 Monaten',
  },
  {
    name: 'Marie S.',
    rating: 5,
    text: 'Absolute Empfehlung! Die Hebammen haben sich immer Zeit genommen und auf alle meine Fragen geduldig geantwortet.',
    date: 'vor 1 Monat',
  },
];

// ------------------------------------------------------------
//  Eine einzige (gecachte) Anfrage für alle vier Funktionen.
//  Pro Seitenaufruf wird das Backend nur EINMAL geladen.
// ------------------------------------------------------------
let contentPromise: Promise<ContentPayload> | null = null;

async function loadContent(): Promise<ContentPayload> {
  if (!CONTENT_API_URL) {
    console.error(
      '[Inhalte] NEXT_PUBLIC_CONTENT_API_URL ist nicht gesetzt. ' +
        'Bitte die Apps-Script-URL in .env.local eintragen (siehe ANLEITUNG_APPS_SCRIPT.md).'
    );
    return EMPTY_PAYLOAD;
  }

  try {
    // Cache-Buster, damit der Browser keine veraltete Antwort liefert.
    // (Das Backend cacht serverseitig selbst – Änderungen erscheinen zeitnah.)
    const sep = CONTENT_API_URL.includes('?') ? '&' : '?';
    const url = `${CONTENT_API_URL}${sep}t=${Date.now()}`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      console.error(`[Inhalte] Backend antwortete mit HTTP ${res.status}`);
      return EMPTY_PAYLOAD;
    }

    const data = await res.json();
    return {
      team: Array.isArray(data.team) ? data.team : [],
      aktuelles: Array.isArray(data.aktuelles) ? data.aktuelles : [],
      faq: Array.isArray(data.faq) ? data.faq : [],
      reviews: Array.isArray(data.reviews) ? data.reviews : [],
      overallRating: typeof data.overallRating === 'number' ? data.overallRating : 0,
      totalReviews: typeof data.totalReviews === 'number' ? data.totalReviews : 0,
    };
  } catch (error) {
    console.error('[Inhalte] Fehler beim Laden vom Backend:', error);
    return EMPTY_PAYLOAD;
  }
}

function getContent(): Promise<ContentPayload> {
  if (!contentPromise) {
    contentPromise = loadContent();
  }
  return contentPromise;
}

// ============================================================
//  Öffentliche Funktionen (Signaturen unverändert)
// ============================================================

export async function fetchTeamData() {
  const { team } = await getContent();
  return team;
}

export async function fetchAktuellesData() {
  const { aktuelles } = await getContent();
  return aktuelles;
}

export async function fetchFAQData() {
  const { faq } = await getContent();
  return faq;
}

export async function fetchGoogleReviews() {
  const { reviews, overallRating, totalReviews } = await getContent();

  // Wenn das Backend (noch) keine echten Bewertungen liefert -> Fallback.
  if (!reviews || reviews.length === 0) {
    return {
      reviews: FALLBACK_REVIEWS,
      overallRating: overallRating || 4.9,
      totalReviews: totalReviews || FALLBACK_REVIEWS.length,
    };
  }

  return {
    reviews,
    overallRating: overallRating || 4.9,
    totalReviews: totalReviews || reviews.length,
  };
}
