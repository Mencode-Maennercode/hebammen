import Script from 'next/script';
import { analyse } from '@/lib/site';

/**
 * Selbst gehostetes Matomo, cookielos – laedt ohne Einwilligungsbanner.
 *
 *  - `disableCookies` VOR `trackPageView`: ohne Cookie und ohne Speicherung im
 *    Browser greift die Einwilligungspflicht aus § 25 TDDDG nicht.
 *  - IP-Anonymisierung und Loeschfristen sind serverseitig in Matomo eingestellt.
 *  - `tel:`/`mailto:`-Klicks erfasst `enableLinkTracking` nicht – deshalb der
 *    eine Listener am document, der sie als Ereignis "Kontakt" meldet.
 *  - Kein Tracking auf localhost, damit Testlaeufe die Statistik nicht verfaelschen.
 */
export default function Matomo() {
  if (!analyse.matomoUrl || !analyse.matomoSiteId) return null;

  return (
    <Script id="matomo-tracking" strategy="afterInteractive">
      {`
        (function() {
          var h = location.hostname;
          if (h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '[::1]') return;

          var _paq = window._paq = window._paq || [];
          _paq.push(['disableCookies']);
          _paq.push(['enableHeartBeatTimer', 15]);
          _paq.push(['trackPageView']);
          _paq.push(['enableLinkTracking']);

          document.addEventListener('click', function (e) {
            var ziel = e.target && e.target.closest
              ? e.target.closest('a[href^="tel:"], a[href^="mailto:"]')
              : null;
            if (!ziel) return;
            var art = ziel.getAttribute('href').indexOf('tel:') === 0 ? 'Anruf' : 'E-Mail';
            // window._paq statt der lokalen Variable: matomo.js ersetzt das Array nach dem Laden.
            window._paq.push(['trackEvent', 'Kontakt', art, location.pathname]);
          }, true);

          var u = ${JSON.stringify(analyse.matomoUrl)};
          _paq.push(['setTrackerUrl', u + 'matomo.php']);
          _paq.push(['setSiteId', ${JSON.stringify(analyse.matomoSiteId)}]);
          var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
          g.async = true;
          g.src = u + 'matomo.js';
          s.parentNode.insertBefore(g, s);
        })();
      `}
    </Script>
  );
}
