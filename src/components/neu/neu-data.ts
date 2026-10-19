// Inhalte der Leistungs-Seiten fuer das neue Design (Texte aus den bestehenden Detail-Fenstern).

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

const img = (folder: string, file: string) => `${BASE_PATH}/Hebammen Bilder/${folder}/${file}`;

export type ServiceSection = {
  title: string;
  paras?: string[];
  note?: string;
  phone?: { label: string; tel: string; text: string };
  image?: string;
  items?: { t: string; p: string }[];
};

export type Service = {
  id: string;
  title: string;
  heading: string;
  summary: string;
  image: string;
  intro?: string;
  sections?: ServiceSection[];
  action?: 'team';
};

export const SERVICES: Service[] = [
  {
    id: 'vorbereitung',
    title: 'Geburtsvorbereitung',
    heading: 'Vor der Geburt',
    summary: 'Intensive Vorbereitung auf die Geburt mit bewährten Methoden und einfühlsamer Begleitung.',
    image: img('vorgeburt', '446934_415242dd384f414da7debbc433c51982~mv2.avif'),
    intro:
      'Bei einer unauffälligen Schwangerschaft liegt die Hauptkommunikation zunächst in den bewährten Händen Ihres Facharztes und Ihrer Hebamme. Sollte es zu Wehentätigkeit, Blasensprung oder anderweitigem akutem Bedarf kommen, melden Sie sich telefonisch im Kreißsaal.',
    sections: [
      {
        title: 'Geburtsplanung',
        paras: [
          'Kommt es bei der Schwangerschaft zu Risiken, wird in unserer Schwangerenambulanz durch unser Ärzteteam eine Geburtsplanung durchgeführt. Neben der Beratung wird über Ihre Gedanken und Bedürfnisse gesprochen.',
          'All dies verschafft uns einen umfassenden Überblick über die aktuelle Situation. Somit sind wir vorbereitet und können auf Sie und Ihr Kind bestmöglich reagieren.',
        ],
        note: 'Bitte bringen Sie eine Überweisung von Ihrem Facharzt mit.',
        phone: { label: 'Für einen Termin', tel: '+492285052201', text: '0228 / 505 2201' },
        image: img('vorgeburt', '446934_ed88da43ae4044118c559a9112671a7e~mv2.avif'),
      },
      {
        title: 'Geburtseinleitung',
        paras: [
          'Wir führen Geburtseinleitungen nach Feststellung einer gegebenen Indikation bei uns im Kreißsaal durch. Die Einleitungsmethode wird individuell auf Sie, Ihren Körper und Ihr Kind abgestimmt.',
          'Für die Einleitung werden Sie stationär aufgenommen. Zu den CTG-Kontrollen sind Sie somit jederzeit an den Kreißsaal angebunden.',
        ],
        image: img('vorgeburt', '446934_fdd46a13727f42d3878061231b435ff7~mv2.avif'),
      },
      {
        title: 'Stationärer Aufenthalt und weitere Angebote',
        paras: [
          'Während eines stationären Aufenthalts führen wir täglich CTG-Kontrollen je nach Bedarf durch und stehen Ihnen bei Fragen und für eine Beratung zur Seite.',
          'Einige unserer Kolleginnen bieten therapeutische Ansätze an, darunter Akupunktur, Taping und Laser-Therapie, darauf ausgerichtet, das Wohlbefinden werdender Mütter zu fördern.',
        ],
        image: img('vorgeburt', '446934_4c7be112e02a4a9aac7700072e2c5bc3~mv2.avif'),
      },
    ],
  },
  {
    id: 'geburt',
    title: 'Während der Geburt',
    heading: 'Während der Geburt',
    summary:
      'Die Geburt ist ein individuelles und unvergessliches Erlebnis. Wir stehen Ihnen mit unserer Expertise zur Seite.',
    image: img('geburt', '446934_ff804781dba14fbe9da38c9421ddb2f4~mv2.avif'),
    intro:
      'Die Geburt ist ein individuelles und unvergessliches Erlebnis. Uns ist wichtig, Ihnen als werdenden Eltern eine ruhige und angenehme Atmosphäre zu schaffen, fachlich kompetent und menschlich nah.',
    sections: [
      {
        title: 'Ihre Begleitung im Kreißsaal',
        paras: [
          'Unsere 5 Kreißsäle bieten genügend Raum, um unter Wehen verschiedene Positionen einzunehmen. Mit Zuspruch und Atemanleitung begleiten wir Sie einfühlsam durch den gesamten Geburtsablauf.',
          'Kommunikation ist uns sehr wichtig. Medizinisch notwendige Maßnahmen werden Ihnen vor dem Hintergrund der individuellen Situation genau erläutert, damit Sie sich jederzeit sicher und gut informiert fühlen.',
        ],
        image: img('geburt', '446934_0604bb0f60274b0ab6373213a874746f~mv2.avif'),
      },
      {
        title: 'Schmerzerleichterung',
        paras: [
          'Wünschen Sie Schmerzlinderung, stehen wir Ihnen mit verschiedenen Methoden zur Seite: von Wärme, Massage und Homöopathie über medikamentöse Schmerzmittel bis zur Periduralanästhesie (PDA).',
          'Wir beraten Sie gerne und wählen gemeinsam das passende Mittel für Ihre individuelle Geburtssituation und -phase aus.',
        ],
        image: img('geburt', '446934_ca8d119777204ecf873fb13209019bb1~mv2.avif'),
      },
      {
        title: 'Unser Team für Sie',
        paras: [
          'Wir als Hebammenteam sind primär für Ihre Betreuung zuständig. Verstärkt werden wir durch unsere Medizinischen Fachangestellten und unser Ärzteteam. Darüber hinaus bilden wir Hebammenstudierende aus.',
          'Aufgrund der Level-1 Betreuung sind wir im engen Kontakt mit den Kinderärzten und Kinderärztinnen, die sich direkt im Haus befinden und auf Abruf schnellstmöglich im Kreißsaal sind.',
        ],
      },
      {
        title: 'Besondere Geburtssituationen',
        image: img('geburt', '446934_9ed1417ac1634f54a8c4427c9cf3128f~mv2.avif'),
        items: [
          {
            t: 'Frühgeburtlichkeit',
            p: 'Als Perinatalzentrum Level 1 bieten wir die höchste Versorgungsstufe. Bereits bei vorzeitigen Wehen, Zervixinsuffizienz oder auffälligen CTGs sind wir für Sie da.',
          },
          {
            t: 'Beckenendlagen und Zwillinge',
            p: 'Bei Beckenendlage oder Zwillingen ist eine natürliche Geburt bei uns möglich. Wir bieten außerdem eine äußere Wendung ab der 37. SSW an.',
          },
          {
            t: 'Zustand nach Kaiserschnitt (VBAC)',
            p: 'Wir bemühen uns, dass Sie nach Möglichkeit vaginal gebären können. Sollte ein Kaiserschnitt notwendig sein, darf Ihre Begleitperson anwesend sein.',
          },
        ],
      },
    ],
  },
  {
    id: 'wochenbett',
    title: 'Wochenbettbetreuung und Stillberatung',
    heading: 'Nach der Geburt',
    summary: 'Kompetente und einfühlsame Begleitung für einen guten Start in das neue Familienleben.',
    image: img('nachgeburt', '446934_78c921d93b4d47f4b6c3c6760bd5cedc~mv2.avif'),
    intro:
      'Die ersten Stunden und Tage nach der Geburt sind besonders. Wir begleiten Sie einfühlsam, vom ersten Moment im Kreißsaal bis hin zur Wochenbettstation.',
    sections: [
      {
        title: 'Die ersten Stunden',
        paras: [
          'Im Anschluss an die Geburt werden Sie für circa 2 Stunden durch uns im Kreißsaal weiter betreut. Wir schauen nach Ihrem Wohlbefinden und dem Ihres Kindes.',
          'Der Körperkontakt zwischen Ihnen und Ihrem Kind liegt uns sehr am Herzen. Wir gewährleisten im direkten Anschluss an die Geburt das Bonding. Dieser erste gemeinsame Moment ist unersetzlich.',
        ],
        image: img('nachgeburt', '446934_119b62e081c947cba0d74697ac59705c~mv2.avif'),
      },
      {
        title: 'Stillen und Erstuntersuchung',
        paras: [
          'Das erste Anlegen erfolgt bei uns im Kreißsaal. Wir unterstützen Sie gerne beim Handling und stehen für all Ihre Fragen zur Verfügung.',
          'Die Erstuntersuchung (U1) wird von den Hebammen gemeinsam mit Ihnen durchgeführt. Ein vertrauter Moment, bei dem Sie alles miterleben und nachfragen können.',
        ],
      },
      {
        title: 'Wochenbettstation',
        paras: [
          'Im Anschluss verlegen wir Sie auf die Wochenbettstation, wo Sie herzlich empfangen werden.',
          'Durch unsere tägliche Wochenbett-Visite stehen wir Ihnen weiterhin unterstützend und beratend zur Seite, für Ihre Genesung, das Stillen und alles rund um Ihr Neugeborenes.',
        ],
      },
    ],
  },
  {
    id: 'liste',
    title: 'Hebammenliste',
    heading: 'Hebammenliste',
    summary:
      'Finden Sie die passende Hebamme aus unserem Team mit allen Kontaktdaten und Tätigkeitsbereichen.',
    image: img('nachgeburt', '446934_119b62e081c947cba0d74697ac59705c~mv2.avif'),
    action: 'team',
  },
];

export const MARQUEE_WORDS = [
  'Geburtsvorbereitung',
  'Geburt',
  'Wochenbett',
  'Stillberatung',
  'Akupunktur',
  'Kinesiotaping',
  'Schwangerenyoga',
  'Rückbildung',
];
