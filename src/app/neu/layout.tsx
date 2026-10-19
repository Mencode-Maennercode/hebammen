import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import "./neu.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

const body = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hebammen am Marienhospital Bonn | Neues Design",
  description:
    "Die Hebammen am Marienhospital Bonn begleiten Sie einfühlsam und kompetent durch Schwangerschaft, Geburt und Wochenbett.",
};

export default function NeuLayout({ children }: { children: React.ReactNode }) {
  return <div className={`neu ${display.variable} ${body.variable}`}>{children}</div>;
}
