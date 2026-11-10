// Zentrale Angaben der Website. Telefonnummern, Adressen und Links stehen
// nur hier, damit Startseite, Impressum und Datenschutz nie auseinanderlaufen.

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** Lokale Datei unter public/ mit basePath versehen (GitHub Pages: /hebammen). */
export const asset = (path: string) => (path && path.startsWith('/') ? `${BASE_PATH}${path}` : path);

export const LOGO = asset('/bilder/logo.png');

export const kontakt = {
  name: 'Hebammen am Marienhospital Bonn',
  nameLang: 'Hebammen am Marienhospital Bonn – Sanne, Wald & Partnerinnen',
  rechtsform: 'Hebammen am Marienhospital Sanne, Wald und Partnerinnen',
  strasse: 'Robert-Koch-Straße 1',
  plz: '53115',
  ort: 'Bonn',
  email: 'info@hebammen-marienhospital-bonn.de',
  bewerbung: 'bewerbung@hebammen-marienhospital-bonn.de',
  /** Zentrale / Pforte des St. Marien-Hospitals – leitet weiter. */
  pforte: { anzeige: '0228 505 0', tel: '+492285050' },
  /** Sprechstunde / Geburtsplanung. Die Kreißsaal-Durchwahl wird bewusst nicht veröffentlicht. */
  termine: { anzeige: '0228 505 2201', tel: '+492285052201' },
} as const;

export const links = {
  instagram: 'https://www.instagram.com/hebammen_marienhospital_bonn/',
  instagramHandle: '@hebammen_marienhospital_bonn',
  /** Online-Geburtsanmeldung im GFO-Patientenportal */
  geburtsanmeldung: 'https://patientenportal.gfo-online.de/type?clinicId=7&departmentId=26',
  googleBewertungen:
    'https://www.google.com/maps/search/?api=1&query=Hebammen+am+Marienhospital+Bonn+Robert-Koch-Stra%C3%9Fe+1',
  route: 'https://www.google.com/maps/dir/?api=1&destination=Robert-Koch-Stra%C3%9Fe+1%2C+53115+Bonn',
  youtubeId: 'H7R-qfjAkik',
} as const;

/**
 * Selbst gehostetes Matomo (matomo.praesenzwert.de), cookielos.
 * Beide Felder leer = keine Messung, kein Skript.
 */
export const analyse = {
  matomoUrl: 'https://matomo.praesenzwert.de/',
  matomoSiteId: '6',
} as const;
