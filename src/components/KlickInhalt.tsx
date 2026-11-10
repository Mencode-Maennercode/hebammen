'use client';

import { useState } from 'react';
import { MapPin, Navigation, Play } from 'lucide-react';
import { BASE_PATH, kontakt, links } from '@/lib/site';
import { useI18n } from '@/i18n/I18nProvider';

/**
 * Google Maps erst nach Klick laden (Zwei-Klick-Loesung): Vorher wird keine
 * Verbindung zu Google aufgebaut, siehe Datenschutzerklaerung.
 */
export function KarteNachKlick() {
  const { t } = useI18n();
  const [geladen, setGeladen] = useState(false);

  if (geladen) {
    return (
      <iframe
        src="https://www.google.com/maps?q=Marienhospital+Bonn,+Robert-Koch-Stra%C3%9Fe+1,+53115+Bonn&output=embed"
        className="h-full min-h-[420px] w-full border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={t('Standort Marienhospital Bonn')}
      />
    );
  }

  return (
    <div className="relative flex h-full min-h-[420px] w-full flex-col items-center justify-center gap-5 overflow-hidden bg-brand-soft p-8 text-center">
      <div
        aria-hidden
        className="absolute inset-0 opacity-40 [background-image:linear-gradient(var(--brand-light)_1px,transparent_1px),linear-gradient(90deg,var(--brand-light)_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white shadow-lg">
        <MapPin size={30} />
      </div>
      <div className="relative">
        <p className="text-xl font-bold text-gray-900">St. Marien-Hospital Bonn</p>
        <p className="text-gray-700">
          {kontakt.strasse}, {kontakt.plz} {kontakt.ort}
        </p>
      </div>
      <div className="relative flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => setGeladen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-brand-dark"
        >
          <MapPin size={18} />
          {t('Karte laden')}
        </button>
        <a
          href={links.route}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-brand bg-white px-6 py-3 font-semibold text-brand transition-colors hover:bg-brand-cream"
        >
          <Navigation size={18} />
          {t('Route planen')}
        </a>
      </div>
      <p className="relative max-w-sm text-xs leading-relaxed text-gray-600">
        {t('Beim Laden der Karte werden Daten an Google übertragen.')}{' '}
        <a href={`${BASE_PATH}/datenschutz/`} className="underline underline-offset-2 hover:text-brand">
          {t('Mehr dazu')}
        </a>
      </p>
    </div>
  );
}

/** YouTube-Film erst nach Klick laden (youtube-nocookie.com). */
export function FilmNachKlick({ titel }: { titel: string }) {
  const { t } = useI18n();
  const [geladen, setGeladen] = useState(false);

  if (geladen) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${links.youtubeId}?autoplay=1&rel=0&vq=hd1080`}
        title={titel}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full border-0"
      />
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand to-brand-dark p-3 text-center text-white sm:gap-4 sm:p-6">
      <button
        type="button"
        onClick={() => setGeladen(true)}
        className="group flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-brand shadow-2xl transition-transform hover:scale-105 sm:h-20 sm:w-20"
        aria-label={t('Film abspielen')}
      >
        <Play size={28} className="translate-x-0.5" fill="currentColor" />
      </button>
      <p className="hidden text-lg font-semibold sm:block">{t('Film abspielen')}</p>
      <p className="max-w-md text-[11px] leading-snug text-white/85 sm:text-sm sm:leading-relaxed">
        {t('Der Film wird von YouTube geladen. Dabei werden Daten an Google übertragen.')}{' '}
        <a href={`${BASE_PATH}/datenschutz/`} className="underline underline-offset-2">
          {t('Mehr dazu')}
        </a>
      </p>
    </div>
  );
}
