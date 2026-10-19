import type { Metadata } from "next";
import { Cormorant_Garamond, Schibsted_Grotesk } from "next/font/google";
import "./magazin.css";

const display = Cormorant_Garamond({
  variable: "--font-mg-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const body = Schibsted_Grotesk({
  variable: "--font-mg-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hebammen am Marienhospital Bonn | Magazin-Design",
  description:
    "Die Hebammen am Marienhospital Bonn begleiten Sie einfühlsam und kompetent durch Schwangerschaft, Geburt und Wochenbett.",
};

export default function MagazinLayout({ children }: { children: React.ReactNode }) {
  return <div className={`mag ${display.variable} ${body.variable}`}>{children}</div>;
}
