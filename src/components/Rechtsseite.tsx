import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { BASE_PATH, LOGO, kontakt } from '@/lib/site';

/** Gemeinsamer Rahmen fuer Impressum und Datenschutz. */
export function Rechtsseite({ titel, stand, children }: { titel: string; stand?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href={`${BASE_PATH}/`} className="flex min-w-0 items-center gap-3" aria-label="Zur Startseite">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="" width={44} height={44} className="h-11 w-11 shrink-0 object-contain" />
            <span className="min-w-0">
              <span className="block truncate font-semibold text-brand">Hebammen am Marienhospital</span>
              <span className="block truncate text-sm text-gray-500">Sanne, Wald & Partnerinnen</span>
            </span>
          </a>
          <a
            href={`${BASE_PATH}/`}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Zur Startseite</span>
            <span className="sm:hidden">Start</span>
          </a>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-20">
        <h1 className="text-3xl font-bold text-gray-900 md:text-5xl">{titel}</h1>
        {stand && <p className="mt-3 text-sm text-gray-500">{stand}</p>}
        <div className="mt-10 space-y-6 rounded-3xl bg-white p-6 shadow-sm sm:p-10">{children}</div>
      </main>

      <footer className="border-t border-black/5 bg-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-gray-500 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} {kontakt.name}</p>
          <nav className="flex gap-6">
            <a href={`${BASE_PATH}/impressum/`} className="hover:text-brand">Impressum</a>
            <a href={`${BASE_PATH}/datenschutz/`} className="hover:text-brand">Datenschutz</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export function Abschnitt({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <section className="space-y-3 border-b border-gray-100 pb-6 last:border-0 last:pb-0">
      <h2 className="text-xl font-bold text-gray-900 md:text-2xl">{titel}</h2>
      <div className="space-y-3 leading-relaxed text-gray-700 [&_a]:break-words [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2 [&_h3]:pt-2 [&_h3]:font-semibold [&_h3]:text-gray-900">
        {children}
      </div>
    </section>
  );
}
