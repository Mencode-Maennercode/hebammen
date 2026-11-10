'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { translations, type LangCode } from './translations';
import contentTranslations from '@/data/translations.json';

/**
 * Mehrsprachigkeit ohne Fremddienst: Die deutschen Texte sind zugleich die
 * Schluessel (`t('Kontakt')`). Fehlt eine Uebersetzung, erscheint der deutsche
 * Text – die Seite bricht also nie. `npm run i18n:check` listet fehlende Texte.
 *
 * Inhalte aus dem Google Sheet (Aktuelles, FAQ, Bewertungen) uebersetzt
 * scripts/translate-content.mjs beim Build (tc()); Team-Daten bleiben unveraendert.
 */

export const LANGUAGES: { code: LangCode; name: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'de', name: 'Deutsch', dir: 'ltr' },
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'ru', name: 'Русский', dir: 'ltr' },
  { code: 'pl', name: 'Polski', dir: 'ltr' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' },
];

const STORAGE_KEY = 'hebammen-lang';

type Ctx = { lang: LangCode; setLang: (l: LangCode) => void; t: (de: string) => string; tc: (de: string) => string };
const I18nContext = createContext<Ctx>({ lang: 'de', setLang: () => {}, t: (s) => s, tc: (s) => s });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>('de');

  const apply = useCallback((l: LangCode) => {
    const meta = LANGUAGES.find((x) => x.code === l) ?? LANGUAGES[0];
    document.documentElement.lang = meta.code;
    document.documentElement.dir = meta.dir;
  }, []);

  useEffect(() => {
    let initial: string | null = null;
    try {
      initial = new URLSearchParams(window.location.search).get('lang') || localStorage.getItem(STORAGE_KEY);
    } catch {}
    if (initial && LANGUAGES.some((x) => x.code === initial)) {
      setLangState(initial as LangCode);
      apply(initial as LangCode);
    }
  }, [apply]);

  const setLang = useCallback(
    (l: LangCode) => {
      setLangState(l);
      apply(l);
      try {
        localStorage.setItem(STORAGE_KEY, l);
      } catch {}
    },
    [apply]
  );

  const t = useCallback(
    (de: string) => {
      if (lang === 'de') return de;
      return translations[lang]?.[de] ?? de;
    },
    [lang]
  );

  // Inhalte aus dem Google Sheet (FAQ, Aktuelles, Bewertungen): beim Build per Gemini uebersetzt
  const tc = useCallback(
    (de: string) => {
      if (lang === 'de' || !de) return de;
      const dict = (contentTranslations as Record<string, Record<string, string>>)[lang];
      return dict?.[de.trim()] ?? de;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t, tc }), [lang, setLang, t, tc]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);

/** Datumsformat passend zur gewaehlten Sprache. */
export const LOCALES: Record<LangCode, string> = {
  de: 'de-DE', en: 'en-GB', tr: 'tr-TR', ar: 'ar', ru: 'ru-RU', pl: 'pl-PL', fr: 'fr-FR', es: 'es-ES',
};
