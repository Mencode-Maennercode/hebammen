'use client';

import { useEffect, useState } from 'react';
import { analyse } from '@/lib/site';

type Paq = unknown[];

/**
 * Widerspruch gegen die Matomo-Reichweitenmessung (Art. 21 DSGVO).
 * Matomo merkt sich die Entscheidung in einem kleinen Speicherwert im
 * Browser – der einzige, der hier ohne Zustimmung gesetzt wird.
 */
export default function MatomoWiderspruch() {
  const [montiert, setMontiert] = useState(false);
  const [abgemeldet, setAbgemeldet] = useState(false);

  useEffect(() => {
    setMontiert(true);
    const paq = (window as { _paq?: Paq })._paq;
    if (Array.isArray(paq)) {
      paq.push(['isUserOptedOut', (optedOut: boolean) => setAbgemeldet(optedOut)]);
    }
  }, []);

  if (!analyse.matomoUrl || !analyse.matomoSiteId || !montiert) return null;

  const umschalten = () => {
    const w = window as { _paq?: Paq };
    w._paq ??= [];
    w._paq.push([abgemeldet ? 'forgetUserOptOut' : 'optUserOut']);
    setAbgemeldet(!abgemeldet);
  };

  return (
    <button
      type="button"
      onClick={umschalten}
      className="inline-flex min-h-11 items-center font-semibold text-brand underline underline-offset-4 hover:text-brand-dark"
    >
      {abgemeldet ? 'Zählung wieder zulassen' : 'Der Zählung widersprechen'}
    </button>
  );
}
