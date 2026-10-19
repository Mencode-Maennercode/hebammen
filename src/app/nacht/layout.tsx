import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./nacht.css";

const display = Outfit({
  variable: "--font-nc-display",
  subsets: ["latin"],
});

const body = DM_Sans({
  variable: "--font-nc-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hebammen am Marienhospital Bonn | Tag und Nacht",
  description:
    "Die Hebammen am Marienhospital Bonn sind rund um die Uhr für Sie da, bei Tag und bei Nacht.",
};

export default function NachtLayout({ children }: { children: React.ReactNode }) {
  return <div className={`night ${display.variable} ${body.variable}`}>{children}</div>;
}
