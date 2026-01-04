import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hebammen am Marienhospital Bonn | Sanne, Wald & Partnerinnen",
  description: "Die Geburt ist ein individuelles und unvergessliches Erlebnis. Wir, die Hebammen am Marienhospital Bonn, stehen Ihnen mit unserer Expertise unterstützend und beratend zur Seite.",
  keywords: "Hebammen, Bonn, Marienhospital, Geburt, Schwangerschaft, Wochenbett, Geburtshilfe",
  authors: [{ name: "Hebammen am Marienhospital Bonn" }],
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
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#8B5A6B] focus:text-white focus:rounded-lg"
        >
          Zum Hauptinhalt springen
        </a>
        {children}
      </body>
    </html>
  );
}
