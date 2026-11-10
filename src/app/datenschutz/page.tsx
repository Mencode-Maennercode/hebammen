import type { Metadata } from 'next';
import { Abschnitt, Rechtsseite } from '@/components/Rechtsseite';
import MatomoWiderspruch from '@/components/MatomoWiderspruch';
import { analyse, kontakt } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Datenschutz | Hebammen am Marienhospital Bonn',
  alternates: { canonical: '/datenschutz/' },
  robots: { index: true, follow: false },
};

export default function DatenschutzSeite() {
  const trackt = Boolean(analyse.matomoUrl && analyse.matomoSiteId);

  return (
    <Rechtsseite titel="Datenschutzerklärung" stand="Stand: November 2026">
      <Abschnitt titel="1. Das Wichtigste auf einen Blick">
        <p>
          Diese Website setzt <strong>keine Cookies</strong> und lädt beim Aufruf{' '}
          <strong>keine Inhalte von fremden Servern</strong>: Schriften, Bilder, Videos und die Bilder unseres
          Instagram-Profils liegen auf demselben Server wie die Seite selbst. Deshalb gibt es auch kein
          Einwilligungsbanner.
        </p>
        <p>
          Die Karte (Google Maps) und unser Film (YouTube) werden erst geladen, wenn Sie das ausdrücklich per Klick
          wünschen. {trackt && 'Zur anonymen Reichweitenmessung nutzen wir ein selbst gehostetes, cookieloses Matomo, dem Sie jederzeit widersprechen können.'}
        </p>
      </Abschnitt>

      <Abschnitt titel="2. Verantwortliche Stelle">
        <p>
          {kontakt.nameLang}
          <br />
          {kontakt.strasse}
          <br />
          {kontakt.plz} {kontakt.ort}
          <br />
          Telefon: <a href={`tel:${kontakt.termine.tel}`}>{kontakt.termine.anzeige}</a>
          <br />
          E-Mail: <a href={`mailto:${kontakt.email}`}>{kontakt.email}</a>
        </p>
        <p>
          Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen
          über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten entscheidet.
        </p>
      </Abschnitt>

      <Abschnitt titel="3. Hosting und Server-Logfiles">
        <p>
          Diese Website wird über <strong>GitHub Pages</strong> ausgeliefert. Anbieter ist die GitHub, Inc., 88 Colin
          P. Kelly Jr. Street, San Francisco, CA 94107, USA. Beim Aufruf der Seite verarbeitet der Anbieter
          technisch notwendige Daten (IP-Adresse, Datum und Uhrzeit, aufgerufene Datei, Browser und Betriebssystem),
          um die Seite auszuliefern und vor Missbrauch zu schützen.
        </p>
        <p>
          Rechtsgrundlage ist unser berechtigtes Interesse an einer sicheren und zuverlässigen Bereitstellung der
          Website (Art. 6 Abs. 1 lit. f DSGVO). GitHub ist nach dem EU-US Data Privacy Framework zertifiziert; die
          Übermittlung in die USA stützt sich auf diesen Angemessenheitsbeschluss. Weitere Informationen:{' '}
          <a href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">
            Datenschutzerklärung von GitHub
          </a>
          .
        </p>
      </Abschnitt>

      <Abschnitt titel="4. Kontakt per E-Mail oder Telefon">
        <p>
          Wenn Sie uns per E-Mail oder Telefon kontaktieren, verarbeiten wir Ihre Angaben (z. B. Name, Kontaktdaten,
          Ihr Anliegen), um Ihre Anfrage zu beantworten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit Ihre
          Anfrage mit einer Behandlung oder deren Vorbereitung zusammenhängt, ansonsten unser berechtigtes Interesse
          an der Beantwortung (Art. 6 Abs. 1 lit. f DSGVO). Gesundheitsdaten verarbeiten wir nur im Rahmen von
          Art. 9 Abs. 2 lit. h DSGVO.
        </p>
        <p>
          Bitte beachten Sie: Eine normale E-Mail ist nicht Ende-zu-Ende-verschlüsselt. Senden Sie uns deshalb
          möglichst keine ausführlichen medizinischen Unterlagen per E-Mail. Ihre Daten löschen wir, sobald sie nicht
          mehr benötigt werden und keine gesetzlichen Aufbewahrungsfristen entgegenstehen.
        </p>
      </Abschnitt>

      {trackt && (
        <Abschnitt titel="5. Reichweitenmessung mit Matomo">
          <p>
            Um zu erkennen, welche Inhalte gelesen werden, und die Website zu verbessern, nutzen wir das
            Open-Source-Werkzeug Matomo. Es läuft auf einem eigenen Server in Deutschland und nicht bei einem fremden
            Analyseanbieter.
          </p>
          <p>
            Matomo ist so eingestellt, dass es <strong>keine Cookies</strong> setzt und nichts auf Ihrem Gerät
            speichert. Erhoben werden aufgerufene Seiten, ungefähre Verweildauer, die verweisende Seite sowie grobe
            technische Angaben wie Bildschirmgröße und Browsertyp. Klicks auf Telefonnummern und E-Mail-Adressen
            werden nur als Ereignis gezählt, nicht mit Inhalt. Ihre IP-Adresse wird vor der Speicherung
            anonymisiert; ein Rückschluss auf Sie persönlich ist nicht möglich.
          </p>
          <p>
            Rechtsgrundlage ist unser berechtigtes Interesse an der Verbesserung unseres Angebots (Art. 6 Abs. 1
            lit. f DSGVO). Da nichts auf Ihrem Gerät gespeichert oder ausgelesen wird, ist keine Einwilligung nach
            § 25 TDDDG erforderlich.
          </p>
          <p>
            <strong>Sie können der Messung jederzeit widersprechen</strong> (Art. 21 DSGVO): <MatomoWiderspruch />
            {' '}Ihr Browser merkt sich diese Entscheidung in einem kleinen, dafür notwendigen Speicherwert.
          </p>
        </Abschnitt>
      )}

      <Abschnitt titel={`${trackt ? 6 : 5}. Google Maps (nur nach Klick)`}>
        <p>
          Im Kontaktbereich können Sie eine Karte von Google Maps einblenden. Anbieter ist die Google Ireland
          Limited, Gordon House, Barrow Street, Dublin 4, Irland. Die Karte wird <strong>erst geladen, wenn Sie
          auf „Karte laden“ klicken</strong>. Erst dann werden Daten wie Ihre IP-Adresse an Google übertragen und
          können dort auch in die USA gelangen.
        </p>
        <p>
          Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG), die Sie durch den
          Klick erteilen und durch Neuladen der Seite jederzeit beenden können. Google ist nach dem EU-US Data
          Privacy Framework zertifiziert. Mehr dazu:{' '}
          <a href="https://policies.google.com/privacy?hl=de" target="_blank" rel="noopener noreferrer">Datenschutzerklärung von Google</a>.
        </p>
      </Abschnitt>

      <Abschnitt titel={`${trackt ? 7 : 6}. YouTube (nur nach Klick)`}>
        <p>
          Unseren Film „Einblick in unseren Kreißsaal“ binden wir über YouTube im erweiterten Datenschutzmodus
          (youtube-nocookie.com) ein. Anbieter ist die Google Ireland Limited, Gordon House, Barrow Street, Dublin 4,
          Irland. Der Film wird <strong>erst geladen, wenn Sie auf „Film abspielen“ klicken</strong>. Dann werden
          Daten wie Ihre IP-Adresse an YouTube/Google übertragen, auch in die USA.
        </p>
        <p>
          Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG). Mehr dazu:{' '}
          <a href="https://policies.google.com/privacy?hl=de" target="_blank" rel="noopener noreferrer">Datenschutzerklärung von Google</a>.
        </p>
      </Abschnitt>

      <Abschnitt titel={`${trackt ? 8 : 7}. Instagram und weitere Links`}>
        <p>
          Die Vorschaubilder unseres Instagram-Profils werden beim Erstellen der Website heruntergeladen und von
          unserem eigenen Server ausgeliefert. Beim Besuch dieser Seite wird deshalb keine Verbindung zu Instagram
          bzw. Meta aufgebaut. Erst wenn Sie einen Beitrag oder unser Profil anklicken, öffnet sich Instagram
          (Meta Platforms Ireland Ltd.) in einem neuen Fenster; dort gilt die{' '}
          <a href="https://privacycenter.instagram.com/policy" target="_blank" rel="noopener noreferrer">Datenschutzerklärung von Instagram</a>.
        </p>
        <p>
          Gleiches gilt für Links zu externen Angeboten wie dem Patientenportal der GFO Kliniken (Online-
          Geburtsanmeldung) oder unseren Bewertungen bei Google: Daten werden erst übertragen, wenn Sie den Link
          aufrufen, und es gilt dann die Datenschutzerklärung des jeweiligen Anbieters.
        </p>
      </Abschnitt>

      <Abschnitt titel={`${trackt ? 9 : 8}. Speicherung im Browser`}>
        <p>
          Wenn Sie eine Sprache oder ein Farbschema auswählen, merkt sich Ihr Browser diese Auswahl im lokalen
          Speicher (localStorage). Diese Information verlässt Ihr Gerät nicht und dient nur dazu, die gewünschte
          Darstellung beim nächsten Besuch beizubehalten (§ 25 Abs. 2 Nr. 2 TDDDG). Sie können sie jederzeit über die
          Einstellungen Ihres Browsers löschen.
        </p>
        <p>
          Schriftarten werden nicht von Google Fonts nachgeladen, sondern zusammen mit der Website von unserem Server
          ausgeliefert.
        </p>
      </Abschnitt>

      <Abschnitt titel={`${trackt ? 10 : 9}. Ihre Rechte`}>
        <p>Sie haben im Rahmen der gesetzlichen Bestimmungen jederzeit das Recht auf</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO),</li>
          <li>Berichtigung (Art. 16 DSGVO) und Löschung (Art. 17 DSGVO),</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO),</li>
          <li>Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO).</li>
        </ul>
        <p className="font-semibold text-gray-900">
          Widerspruchsrecht (Art. 21 DSGVO): Beruht eine Verarbeitung auf Art. 6 Abs. 1 lit. e oder f DSGVO, können
          Sie aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit widersprechen. Wir verarbeiten
          Ihre Daten dann nicht mehr, es sei denn, wir können zwingende schutzwürdige Gründe nachweisen.
        </p>
        <p>
          Außerdem haben Sie ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde, zum Beispiel bei der
          Landesbeauftragten für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (
          <a href="https://www.ldi.nrw.de" target="_blank" rel="noopener noreferrer">www.ldi.nrw.de</a>).
        </p>
        <p>Für alle Fragen zum Datenschutz erreichen Sie uns unter <a href={`mailto:${kontakt.email}`}>{kontakt.email}</a>.</p>
      </Abschnitt>

      <Abschnitt titel={`${trackt ? 11 : 10}. Verschlüsselung`}>
        <p>
          Diese Seite nutzt aus Sicherheitsgründen eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte
          Verbindung erkennen Sie am Schloss-Symbol und an „https://“ in der Adresszeile Ihres Browsers.
        </p>
      </Abschnitt>
    </Rechtsseite>
  );
}
