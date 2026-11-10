import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import Matomo from "@/components/Matomo";
import { I18nProvider } from "@/i18n/I18nProvider";
import { LOGO } from "@/lib/site";

// next/font laedt die Schrift beim Build und liefert sie selbst aus –
// der Browser der Besucher spricht nie mit Google Fonts.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://www.hebammen-marienhospital-bonn.de";
const TITLE = "Hebammen am Marienhospital Bonn | Sanne, Wald & Partnerinnen";
const DESCRIPTION =
  "Die Geburt ist ein individuelles und unvergessliches Erlebnis. Wir, die Hebammen am Marienhospital Bonn, stehen Ihnen mit unserer Expertise unterstützend und beratend zur Seite.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: "Hebammen, Bonn, Marienhospital, Geburt, Schwangerschaft, Wochenbett, Geburtshilfe, Kreißsaal, Geburtsanmeldung",
  authors: [{ name: "Hebammen am Marienhospital Bonn" }],
  alternates: { canonical: "/" },
  icons: {
    icon: LOGO,
    apple: LOGO,
  },
  openGraph: {
    title: TITLE,
    description: "Die Geburt ist ein individuelles und unvergessliches Erlebnis. Wir stehen Ihnen mit unserer Expertise unterstützend zur Seite.",
    url: SITE_URL,
    siteName: "Hebammen am Marienhospital Bonn",
    type: "website",
    locale: "de_DE",
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  // Zoomen nie sperren – fuer manche Besucherinnen die einzige Moeglichkeit zu lesen.
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        {/* Gespeichertes Farbschema und Schreibrichtung vor dem ersten Paint setzen (kein Aufblitzen) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var q=new URLSearchParams(location.search),d=document.documentElement;var t=q.get("theme")||localStorage.getItem("hebammen-theme");if(["logo","sand","beige","champagner"].indexOf(t)>-1)d.setAttribute("data-theme",t);var l=q.get("lang")||localStorage.getItem("hebammen-lang");if(l&&/^(en|tr|ar|ru|pl|fr|es)$/.test(l)){d.lang=l;if(l==="ar")d.dir="rtl"}}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <I18nProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded-lg"
          >
            Zum Hauptinhalt springen
          </a>
          {children}
          <ThemeSwitcher />
        </I18nProvider>
        <Matomo />
      </body>
    </html>
  );
}
