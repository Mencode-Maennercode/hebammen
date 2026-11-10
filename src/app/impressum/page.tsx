import type { Metadata } from 'next';
import { Abschnitt, Rechtsseite } from '@/components/Rechtsseite';
import { kontakt, links } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Impressum | Hebammen am Marienhospital Bonn',
  alternates: { canonical: '/impressum/' },
  robots: { index: true, follow: false },
};

const PARTNERINNEN = [
  'Al Arroudi, Chaymae', 'Bauch, Susanne', 'Becker, Manuela', 'Bijaleh, Lea', 'Brenner, Silke',
  'Fenske, Leonie', 'Henke, Jill', 'Karkos, Rahel', 'Leydecker, Vivien', 'Lichtenthal, Anna',
  'Marc, Annika', 'Micha, Christiane', 'Raes, Ana', 'Reis, Jolanta', 'Sanne, Rebekka',
  'Schmellekamp, Stefanie', 'Thielmann, Katharina', 'Wald, Franziska', 'Walter, Valentina',
  'Werner, Laura', 'Zerwas, Heike',
];

export default function ImpressumSeite() {
  return (
    <Rechtsseite titel="Impressum">
      <Abschnitt titel="Geltungsbereich">
        <p>
          Dieses Impressum gilt für diese Website (hebammen-marienhospital-bonn.de) und für unser
          Instagram-Profil <a href={links.instagram} target="_blank" rel="noopener noreferrer">{links.instagramHandle}</a>.
        </p>
      </Abschnitt>

      <Abschnitt titel="Angaben gemäß § 5 DDG">
        <p>
          {kontakt.rechtsform}
          <br />
          {kontakt.strasse}
          <br />
          {kontakt.plz} {kontakt.ort}
        </p>
        <p>
          Partnerschaftsregister: PR 5457
          <br />
          Registergericht: Amtsgericht Bonn
        </p>
        <p>
          Partnerinnen im Sinne des § 3 Abs. 2 Nr. 2 Partnerschaftsgesellschaftsgesetz sind die Hebammen:
        </p>
        <p className="text-gray-600">{PARTNERINNEN.join('; ')}</p>
      </Abschnitt>

      <Abschnitt titel="Kontakt">
        <p>
          Telefon: <a href={`tel:${kontakt.termine.tel}`}>{kontakt.termine.anzeige}</a>
          <br />
          E-Mail: <a href={`mailto:${kontakt.email}`}>{kontakt.email}</a>
        </p>
      </Abschnitt>

      <Abschnitt titel="Zuständige Aufsichtsbehörde">
        <p>
          Gesundheitsamt der Bundesstadt Bonn
          <br />
          Welschnonnenstraße 2
          <br />
          53111 Bonn
          <br />
          <a href="https://www.bonn.de/vv/oe/_/Dez._II/53/Gesundheitsamt.php" target="_blank" rel="noopener noreferrer">
            www.bonn.de – Gesundheitsamt
          </a>
        </p>
      </Abschnitt>

      <Abschnitt titel="Berufsbezeichnung und berufsrechtliche Regelungen">
        <p>
          Berufsbezeichnung: Hebamme
          <br />
          Verliehen in: Deutschland
        </p>
        <p>Es gelten folgende berufsrechtliche Regelungen:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Berufsordnung für Hebammen und Entbindungspfleger NRW (HebBO NRW) –{' '}
            <a href="https://recht.nrw.de/lmi/owa/br_text_anzeigen?v_id=71520170628110740035" target="_blank" rel="noopener noreferrer">recht.nrw.de</a>
          </li>
          <li>
            Gesetz über das Studium und den Beruf von Hebammen (Hebammengesetz – HebG) –{' '}
            <a href="https://www.gesetze-im-internet.de/hebg_2020/index.html" target="_blank" rel="noopener noreferrer">gesetze-im-internet.de</a>
          </li>
          <li>
            Landesgesetz über den Beruf der Hebammen (Landeshebammengesetz – LHebG NRW) –{' '}
            <a href="https://recht.nrw.de/lmi/owa/br_text_anzeigen?v_id=10000000000000000565" target="_blank" rel="noopener noreferrer">recht.nrw.de</a>
          </li>
          <li>
            Hebammengebührenordnung Nordrhein-Westfalen (HebGO NRW) –{' '}
            <a href="https://recht.nrw.de/lmi/owa/br_text_anzeigen?v_id=13620210426145553736" target="_blank" rel="noopener noreferrer">recht.nrw.de</a>
          </li>
          <li>
            Studien- und Prüfungsverordnung für Hebammen (HebStPrV) –{' '}
            <a href="https://www.gesetze-im-internet.de/hebstprv/BJNR003900020.html" target="_blank" rel="noopener noreferrer">gesetze-im-internet.de</a>
          </li>
        </ul>
      </Abschnitt>

      <Abschnitt titel="Berufshaftpflichtversicherung">
        <p>Name und Sitz der Versicherer:</p>
        <p>
          Allianz Deutschland AG
          <br />
          Königinstraße 28, 80802 München
        </p>
        <p>
          Versicherungskammer Bayern, Versicherungsanstalt des öffentlichen Rechts
          <br />
          Maximilianstraße 53, 80530 München
        </p>
        <p>Geltungsraum der Versicherung: Deutschland</p>
      </Abschnitt>

      <Abschnitt titel="Redaktionell verantwortlich (§ 18 Abs. 2 MStV)">
        <p>
          Verantwortlich für die redaktionellen Inhalte dieser Website und unseres Instagram-Profils:
        </p>
        <p>
          Chaymae Al Arroudi und Rebekka Sanne
          <br />
          {kontakt.strasse}, {kontakt.plz} {kontakt.ort}
        </p>
      </Abschnitt>

      <Abschnitt titel="Verbraucherstreitbeilegung">
        <p>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </Abschnitt>

      <Abschnitt titel="Bildnachweise">
        <p>
          Fotos des Teams und aus dem Kreißsaal: Hebammen am Marienhospital Bonn. Einzelne Stimmungsbilder und
          das Video auf der Startseite stammen von <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer">Pexels</a>{' '}
          (lizenzfrei nutzbar).
        </p>
      </Abschnitt>
    </Rechtsseite>
  );
}
