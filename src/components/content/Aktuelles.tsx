'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronRight, ChevronLeft, X } from 'lucide-react';
import Image from 'next/image';
import { AktuellesEntry } from '@/lib/content-types';
import { fetchAktuellesData } from '@/lib/google-api-client';

function formatDatum(datum: string): string {
  if (!datum) return '';
  const d = new Date(datum);
  if (isNaN(d.getTime())) return datum;
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Aktuelles({ preloadedData }: { preloadedData?: AktuellesEntry[] }) {
  const [entries, setEntries] = useState<AktuellesEntry[]>(preloadedData || []);
  const [loading, setLoading] = useState(!preloadedData);
  const [selectedPost, setSelectedPost] = useState<AktuellesEntry | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    if (preloadedData) {
      setEntries(preloadedData);
      setLoading(false);
      return;
    }

    async function loadAktuelles() {
      try {
        const data = await fetchAktuellesData();
        setEntries(data || []);
      } catch (error) {
        console.error('Error fetching Aktuelles:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAktuelles();
  }, [preloadedData]);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      ro.disconnect();
    };
  }, [entries, updateArrows]);

  const scrollBy = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector('article') as HTMLElement | null;
    const amount = (card?.offsetWidth ?? 320) + 32;
    el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section className="py-24 md:py-32 bg-gradient-to-b from-white to-[#FDF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#8B5A6B] border-r-transparent"></div>
          </div>
        </div>
      </section>
    );
  }

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-white to-[#FDF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-[#8B5A6B] font-medium mb-4">
            <Calendar size={20} />
            <span>Aktuelles</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Neuigkeiten von uns
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Bleiben Sie informiert über aktuelle Ereignisse und wichtige Informationen.
          </p>
        </motion.div>

        <div className="relative">
          {canScrollLeft && (
            <button
              onClick={() => scrollBy('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-[#8B5A6B] hover:bg-[#F5E6E8] hover:scale-110 transition-all duration-200"
              aria-label="Nach links scrollen"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {entries.map((entry, index) => (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedPost(entry)}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg card-hover cursor-pointer flex-shrink-0 w-80 md:w-96 self-start"
              >
                {entry.bildname && (
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <Image
                      src={entry.bildname}
                      alt={entry.titel}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm font-medium">
                        <Clock size={14} />
                        {entry.kategorie}
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  {!entry.bildname && entry.kategorie && (
                    <span className="inline-flex items-center gap-1 bg-[#F5E6E8] px-3 py-1.5 rounded-full text-[#8B5A6B] text-sm font-medium mb-3 block w-fit">
                      <Clock size={14} />
                      {entry.kategorie}
                    </span>
                  )}
                  {entry.datum && (
                    <p className="text-sm text-[#8B5A6B] font-medium mb-2">{formatDatum(entry.datum)}</p>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#8B5A6B] transition-colors">
                    {entry.titel}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">{entry.text}</p>
                  <div className="flex items-center gap-2 text-[#8B5A6B] font-medium group-hover:gap-3 transition-all">
                    <span>Mehr erfahren</span>
                    <ChevronRight size={18} />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {canScrollRight && (
            <button
              onClick={() => scrollBy('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-[#8B5A6B] hover:bg-[#F5E6E8] hover:scale-110 transition-all duration-200"
              aria-label="Nach rechts scrollen"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* Post Detail Modal */}
        {selectedPost && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              {selectedPost.bildname && (
                <div className="aspect-[16/9] relative">
                  <Image
                    src={selectedPost.bildname}
                    alt={selectedPost.titel}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              )}
              <div className={selectedPost.bildname ? "p-8 md:p-12" : "px-8 md:px-12 pt-6 pb-8 md:pb-12"}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    {selectedPost.datum && (
                      <p className="text-sm text-[#8B5A6B] font-medium mb-2">{formatDatum(selectedPost.datum)}</p>
                    )}
                    {selectedPost.kategorie && (
                      <span className="inline-flex items-center gap-1 bg-[#F5E6E8] px-3 py-1.5 rounded-full text-[#8B5A6B] text-sm font-medium">
                        <Clock size={14} />
                        {selectedPost.kategorie}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    aria-label="Schließen"
                  >
                    <X size={20} />
                  </button>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  {selectedPost.titel}
                </h2>

                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedPost.text}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
