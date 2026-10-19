import type { Metadata } from "next";
import { Gabarito, Figtree } from "next/font/google";
import "./sanft.css";

const display = Gabarito({
  variable: "--font-sf-display",
  subsets: ["latin"],
});

const body = Figtree({
  variable: "--font-sf-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hebammen am Marienhospital Bonn | Sanftes Design",
  description:
    "Die Hebammen am Marienhospital Bonn begleiten Sie einfühlsam und kompetent durch Schwangerschaft, Geburt und Wochenbett.",
};

export default function SanftLayout({ children }: { children: React.ReactNode }) {
  return <div className={`sanft ${display.variable} ${body.variable}`}>{children}</div>;
}
