import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const LOGO_URL =
  "https://static.wixstatic.com/media/446934_56e43f0c28704f46bb3b1b221dee9a3f~mv2.png/v1/fill/w_209,h_205,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/446934_56e43f0c28704f46bb3b1b221dee9a3f~mv2.png";

export const metadata: Metadata = {
  title: "Hebammen am Marienhospital Bonn | Sanne, Wald & Partnerinnen",
  description: "Die Geburt ist ein individuelles und unvergessliches Erlebnis. Wir, die Hebammen am Marienhospital Bonn, stehen Ihnen mit unserer Expertise unterstützend und beratend zur Seite.",
  keywords: "Hebammen, Bonn, Marienhospital, Geburt, Schwangerschaft, Wochenbett, Geburtshilfe",
  authors: [{ name: "Hebammen am Marienhospital Bonn" }],
  icons: {
    icon: LOGO_URL,
    apple: LOGO_URL,
  },
  openGraph: {
    title: "Hebammen am Marienhospital Bonn | Sanne, Wald & Partnerinnen",
    description: "Die Geburt ist ein individuelles und unvergessliches Erlebnis. Wir stehen Ihnen mit unserer Expertise unterstützend zur Seite.",
    type: "website",
    locale: "de_DE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        {/* Gespeichertes Farbschema vor dem ersten Paint setzen (kein Aufblitzen) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var p=new URLSearchParams(location.search).get("theme");var t=p||localStorage.getItem("hebammen-theme");if(["logo","glanz","salbei","aprikose","lavendel"].indexOf(t)>-1)document.documentElement.setAttribute("data-theme",t)}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded-lg"
        >
          Zum Hauptinhalt springen
        </a>
        {children}
        <ThemeSwitcher />
      </body>
    </html>
  );
}
