'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { FAQEntry } from '@/lib/content-types';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function FAQ({ preloadedData }: { preloadedData?: FAQEntry[] }) {
  const [entries, setEntries] = useState<FAQEntry[]>(preloadedData || []);
  const [loading, setLoading] = useState(!preloadedData);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (preloadedData) {
      setEntries(preloadedData);
      setLoading(false);
      return;
    }

    async function fetchFAQ() {
      try {
        const response = await fetch('/api/content/faq');
        const result = await response.json();
        setEntries(result.data || []);
      } catch (error) {
        console.error('Error fetching FAQ:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchFAQ();
  }, [preloadedData]);

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) {
    return (
      <section className="py-24 md:py-32 bg-white">
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

  // Group by category
  const groupedEntries = entries.reduce((acc, entry) => {
    const category = entry.kategorie || 'Allgemein';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(entry);
    return acc;
  }, {} as Record<string, FAQEntry[]>);

  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-[#8B5A6B] font-medium mb-4">
            <HelpCircle size={20} />
            <span>FAQ</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Häufige Fragen
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Hier finden Sie Antworten auf oft gestellte Fragen rund um unsere Leistungen.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8">
          {Object.entries(groupedEntries).map(([category, categoryEntries], groupIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: groupIndex * 0.1 }}
            >
              <h3 className="text-2xl font-bold text-[#8B5A6B] mb-6">{category}</h3>
              <div className="space-y-4">
                {categoryEntries.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: groupIndex * 0.1 + index * 0.05 }}
                    className="bg-[#FDF8F5] rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggleOpen(groupIndex * 100 + index)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[#F5E6E8] transition-colors"
                      aria-expanded={openIndex === groupIndex * 100 + index}
                    >
                      <span className="font-semibold text-gray-900 pr-4">{entry.frage}</span>
                      <motion.div
                        animate={{ rotate: openIndex === groupIndex * 100 + index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown size={20} className="text-[#8B5A6B] flex-shrink-0" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {openIndex === groupIndex * 100 + index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-5 pt-0 text-gray-700 leading-relaxed">
                            {entry.antwort}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
