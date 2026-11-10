'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Heart,
  Baby,
  Users,
  Clock,
  Star,
  Instagram,
  ChevronDown,
  ArrowRight,
  Play,
  Shield,
  Calendar,
  HelpCircle,
  Film,
  Check,
} from "lucide-react";
import Aktuelles from "@/components/content/Aktuelles";
import FAQ from "@/components/content/FAQ";
import TeamCarousel from "@/components/TeamCarousel";
import LiveView from "@/components/LiveView";
import { KarteNachKlick, FilmNachKlick } from "@/components/KlickInhalt";
import content from "@/data/content.json";
import instagram from "@/data/instagram.json";
import { BASE_PATH, LOGO, asset, kontakt, links } from "@/lib/site";
import { LANGUAGES, useI18n } from "@/i18n/I18nProvider";
import type { LangCode } from "@/i18n/translations";

const PEXELS_IMAGES = {
  heroVideo: `${BASE_PATH}/4314408-hd_1920_1080_24fps (1).mp4`,
  about: `${BASE_PATH}/Hebammen Bilder/Gruppe.avif`,
};

const GEBURTSANMELDUNG_URL = links.geburtsanmeldung;

type InstagramPost = { id: string; image: string; caption: string; permalink: string };
const instagramPosts = (instagram.posts ?? []) as InstagramPost[];

// Phone number formatting function
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Check if it's a German number (starts with +49 or 0)
  if (cleaned.startsWith('+49')) {
    // Format: +49 228 5052205
    const areaCode = cleaned.slice(3, 6); // Extract area code (e.g., 228)
    const number = cleaned.slice(6); // Extract the rest
    
    // Format the number in groups of 3-4 digits
    const formattedNumber = number.replace(/(\d{3})(\d{4})/, '$1 $2');
    
    return `+49 ${areaCode} ${formattedNumber}`;
  } else if (cleaned.startsWith('0')) {
    // Remove leading 0 and add +49
    const areaCode = cleaned.slice(1, 4); // Extract area code (e.g., 228)
    const number = cleaned.slice(4); // Extract the rest
    
    // Format the number in groups of 3-4 digits
    const formattedNumber = number.replace(/(\d{3})(\d{4})/, '$1 $2');
    
    return `+49 ${areaCode} ${formattedNumber}`;
  }
  
  // If it doesn't match German patterns, return as is but with basic formatting
  return phone;
};

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [showJobModal, setShowJobModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Inhalte werden beim Build eingebacken (siehe scripts/fetch-content.mjs).
  // Dadurch ist die Seite SOFORT da – kein Live-Abruf, kein Ladebalken.
  const team = content.team as any[];
  const aktuellesData = content.aktuelles as any[];
  const faqData = content.faq as any[];
  const googleReviews = content.reviews as any[];
  const overallRating = content.overallRating || 4.9;
  const totalReviews = content.totalReviews || 0;
  const { lang: selectedLanguage, setLang, t, tc } = useI18n();
  const setSelectedLanguage = (code: string) => setLang(code as LangCode);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showHebammenListeModal, setShowHebammenListeModal] = useState(false);

  const FLAGS: Record<string, React.ReactNode> = {
    de: <svg viewBox="0 0 3 2" className="w-7 h-4.5 rounded-sm overflow-hidden"><rect width="3" height="2" fill="#000"/><rect y="0.666" width="3" height="0.666" fill="#DD0000"/><rect y="1.333" width="3" height="0.666" fill="#FFCE00"/></svg>,
    ar: <svg viewBox="0 0 3 2" className="w-7 h-4.5 rounded-sm overflow-hidden"><rect width="3" height="2" fill="#006C35"/><rect x="0.2" y="0.88" width="2.1" height="0.12" fill="#FFF"/><polygon points="0.2,1 0.2,1.25 0.42,1.12" fill="#FFF"/></svg>,
    pl: <svg viewBox="0 0 3 2" className="w-7 h-4.5 rounded-sm overflow-hidden"><rect width="3" height="2" fill="#DC143C"/><rect width="3" height="1" fill="#FFF"/></svg>,
    en: <svg viewBox="0 0 60 30" className="w-7 h-4.5 rounded-sm overflow-hidden"><rect width="60" height="30" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFF" strokeWidth="6"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/><path d="M30,0 v30 M0,15 h60" stroke="#FFF" strokeWidth="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/></svg>,
    fr: <svg viewBox="0 0 3 2" className="w-7 h-4.5 rounded-sm overflow-hidden"><rect width="1" height="2" fill="#002395"/><rect x="1" width="1" height="2" fill="#FFF"/><rect x="2" width="1" height="2" fill="#ED2939"/></svg>,
    es: <svg viewBox="0 0 3 2" className="w-7 h-4.5 rounded-sm overflow-hidden"><rect width="3" height="2" fill="#AA151B"/><rect y="0.25" width="3" height="1.5" fill="#F1BF00"/><rect y="0.416" width="3" height="1.166" fill="#AA151B"/></svg>,
    ru: <svg viewBox="0 0 3 2" className="w-7 h-4.5 rounded-sm overflow-hidden"><rect width="3" height="2" fill="#FFF"/><rect y="0.666" width="3" height="0.666" fill="#0039A6"/><rect y="1.333" width="3" height="0.666" fill="#D52B1E"/></svg>,
    tr: <svg viewBox="0 0 3 2" className="w-7 h-4.5 rounded-sm overflow-hidden"><rect width="3" height="2" fill="#E30A17"/><circle cx="1" cy="1" r="0.6" fill="#FFF"/><circle cx="1.2" cy="1" r="0.5" fill="#E30A17"/><path d="M1.8,1 L2.2,0.8 L2.2,1.2 Z" fill="#FFF"/></svg>,
  };
  const languages = LANGUAGES.map((l) => ({ ...l, svgFlag: FLAGS[l.code] }));

useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const sections = ["home", "leistungen", "team", "ueber-uns", "kontakt"];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Close language dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.language-selector')) {
        setShowLanguageDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);


  const navLinks = [
    { href: "#home", label: "Start" },
    { href: "#leistungen", label: "Leistungen" },
    { href: "#team", label: "Team" },
    { href: "#ueber-uns", label: "Über uns" },
    { href: "#kontakt", label: "Kontakt" },
  ];

  const services = [
    {
      icon: Baby,
      title: "Vor der Geburt",
      description: "Intensive Vorbereitung auf die Geburt mit bewährten Methoden und einfühlsamer Begleitung.",
      image: `${BASE_PATH}/Hebammen Bilder/vorgeburt/446934_415242dd384f414da7debbc433c51982~mv2.avif`,
    },
    {
      icon: Heart,
      title: "Während der Geburt",
      description: "Die Geburt ist ein individuelles und unvergessliches Erlebnis. Wir stehen Ihnen mit unserer Expertise zur Seite.",
      image: `${BASE_PATH}/Hebammen Bilder/geburt/446934_ff804781dba14fbe9da38c9421ddb2f4~mv2.avif`,
    },
    {
      icon: Users,
      title: "Nach der Geburt",
      description: "Kompetente und einfühlsame Begleitung für einen guten Start in das neue Familienleben.",
      image: `${BASE_PATH}/Hebammen Bilder/nachgeburt/446934_78c921d93b4d47f4b6c3c6760bd5cedc~mv2.avif`,
    },
    {
      icon: Shield,
      title: "Hebammenliste",
      description: "Finden Sie die passende Hebamme aus unserem Team mit allen Kontaktdaten und Tätigkeitsbereichen.",
      image: asset('/bilder/zuhause-mutter-kind.webp'),
      isHebammenListe: true,
    },
  ];

  const reviews = [
    {
      name: "Anna M.",
      rating: 5,
      text: "Die einfühlsame Betreuung durch das Team hat mir sehr geholfen. Ich fühlte mich jederzeit gut aufgehoben.",
      date: "vor 2 Wochen",
    },
    {
      name: "Lisa K.",
      rating: 5,
      text: "Professionell, herzlich und kompetent. Ich kann die Hebammen am Marienhospital nur wärmstens empfehlen!",
      date: "vor 1 Monat",
    },
    {
      name: "Sarah B.",
      rating: 5,
      text: "Vom ersten Gespräch bis zur Nachsorge wurde ich wunderbar begleitet. Vielen Dank für alles!",
      date: "vor 3 Wochen",
    },
  ];

  const stats = [
    { number: "2000+", label: "Geburten jährlich" },
    { number: "100%", label: "Hingabe" },
    { number: "24/7", label: "Erreichbarkeit" },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-clip">

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "glass-effect shadow-lg py-2"
            : "bg-transparent py-4"
        }`}
        role="banner"
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label={t("Hauptnavigation")}>
          <div className="flex items-center justify-between">
            <a href="#home" className="flex items-center gap-3 group" aria-label={t("Zur Startseite")}>
              <div className={`relative w-14 h-14 sm:w-16 sm:h-16 transition-all duration-700 group-hover:scale-105 ${isScrolled ? "opacity-100" : "opacity-0"}`}>
                <Image
                  src={LOGO}
                  alt={t("Hebammen am Marienhospital Bonn Logo")}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 150px, 200px"
                  priority
                />
              </div>
              <div className={`hidden sm:block transition-all duration-700 ${isScrolled ? "opacity-100" : "opacity-0"}`}>
                <p className={`font-semibold text-lg transition-colors ${isScrolled ? "text-brand" : "text-white"}`}>
                  Hebammen am Marienhospital
                </p>
                <p className={`text-sm transition-colors ${isScrolled ? "text-brand-dark" : "text-white/80"}`}>
                  Sanne, Wald &amp; Partnerinnen
                </p>
              </div>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`relative font-medium transition-colors hover:text-brand ${
                    isScrolled ? "text-gray-700" : "text-white"
                  } ${activeSection === link.href.slice(1) ? "text-brand" : ""}`}
                >
                  {t(link.label)}
                  {activeSection === link.href.slice(1) && (
                    <motion.span
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand"
                    />
                  )}
                </a>
              ))}
              <a
                href={`tel:${kontakt.pforte.tel}`}
                className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-full font-medium hover:bg-brand-dark transition-all hover:shadow-lg hover:scale-105"
              >
                <Phone size={18} />
                <span>{t("Anrufen")}</span>
              </a>

            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                isScrolled ? "text-brand" : "text-white"
              }`}
              aria-label={isMobileMenuOpen ? "Menü schließen" : "Menü öffnen"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100 max-h-[calc(100svh-5rem)] overflow-y-auto"
            >
              <div className="flex flex-col p-6 space-y-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-700 font-medium py-2 hover:text-brand transition-colors"
                  >
                    {t(link.label)}
                  </a>
                ))}
                <a
                  href={`tel:${kontakt.pforte.tel}`}
                  className="flex items-center justify-center gap-2 bg-brand text-white px-5 py-3 rounded-full font-medium hover:bg-brand-dark transition-colors"
                >
                  <Phone size={18} />
                  <span>0228 - 505 0</span>
                </a>
                {/* Mobile Language Selector */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 language-selector">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      lang={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      aria-pressed={selectedLanguage === lang.code}
                      className={`flex min-h-11 items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-700 transition-all ${
                        selectedLanguage === lang.code
                          ? "bg-brand/10 ring-1 ring-brand/30 font-semibold text-brand"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <span className="w-7 h-4.5 shrink-0">
                        {lang.svgFlag}
                      </span>
                      <span className="truncate">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </nav>

        {/* Language Selector - absolut rechtsbündig, nur Desktop */}
        <div className="absolute right-4 top-0 bottom-0 hidden lg:flex items-center language-selector">
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowLanguageDropdown(!showLanguageDropdown); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all border ${
                isScrolled
                  ? "border-gray-200 hover:border-brand/30 hover:bg-brand/5"
                  : "border-white/30 hover:border-white/60 hover:bg-white/10"
              }`}
              aria-label={t("Sprache auswählen")}
            >
              <div className="w-7 h-4.5 leading-none">
                {languages.find(l => l.code === selectedLanguage)?.svgFlag}
              </div>
              <ChevronDown size={16} className={`transition-transform ${
                isScrolled ? "text-gray-500" : "text-white/80"
              } ${showLanguageDropdown ? "rotate-180" : ""}`} />
            </button>
            {showLanguageDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 min-w-[180px]"
              >
                <div className="py-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLanguage(lang.code);
                        setShowLanguageDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${
                        selectedLanguage === lang.code
                          ? "bg-brand/5 text-brand"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="w-7 h-4.5">
                        {lang.svgFlag}
                      </div>
                      <span className="text-sm font-medium">{lang.name}</span>
                      {selectedLanguage === lang.code && (
                        <Check size={14} className="ml-auto text-brand" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      <main id="main-content">
        {/* Hero Section */}
        <section id="home" className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-28 pb-32 sm:pb-36">
          {/* Video Background */}
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              // Ausschnitt so gewählt, dass der Venenzugang am linken Bildrand nicht zu sehen ist
              className="w-full h-full object-cover object-[72%_50%] md:object-center md:scale-[1.4] md:origin-right"
            >
              <source src={PEXELS_IMAGES.heroVideo} type="video/mp4" />
            </video>
            <div className="video-overlay" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-6 py-2.5 rounded-full text-white text-lg sm:text-xl font-medium">
                <span>{t("Herzlich willkommen bei uns")}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl [@media(max-height:500px)]:text-4xl font-bold text-white leading-tight">
                {t("Ihre Hebammen in")}
                <span className="block text-brand-soft">{t("Bonn")}</span>
              </h1>

              <p className="max-w-2xl mx-auto text-lg sm:text-xl text-white/90 leading-relaxed">
                {t("Die Geburt ist ein individuelles und unvergessliches Erlebnis. Wir begleiten Sie einfühlsam und kompetent auf diesem besonderen Weg.")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <a
                  href="#kontakt"
                  className="group inline-flex items-center justify-center gap-2 bg-brand text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-brand-dark transition-all hover:shadow-2xl hover:scale-105"
                >
                  <span>{t("Kontakt aufnehmen")}</span>
                  <ArrowRight size={20} className="rtl:-scale-x-100 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#leistungen"
                  className="group inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/30 transition-all border border-white/30"
                >
                  <Play size={20} />
                  <span>{t("Mehr erfahren")}</span>
                </a>
              </div>
            </motion.div>

          </div>
        </section>

        {/* Stats Section */}
        <section className="relative -mt-20 z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-effect rounded-3xl shadow-2xl p-8 md:p-12"
          >
            <div className="grid grid-cols-3 gap-4 sm:gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-3xl md:text-4xl font-bold text-brand">{stat.number}</p>
                  <p className="text-gray-600 mt-1 text-sm md:text-base">{t(stat.label)}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Aktuelles Section */}
        <Aktuelles preloadedData={aktuellesData} />

        {/* Services Section */}
        <section id="leistungen" className="py-12 md:py-20 bg-gradient-to-b from-white to-brand-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 md:mb-14"
            >
              <span className="inline-flex items-center gap-2 text-brand font-medium mb-4">
                <span>{t("Unsere Leistungen")}</span>
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                {t("Rundum gut betreut")}
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-gray-600">
                {t("Von der Schwangerschaft bis zur Nachsorge – wir begleiten Sie in jeder Phase mit Fachwissen und Herz.")}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <motion.article
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-white rounded-3xl overflow-hidden shadow-lg card-hover cursor-pointer"
                  onClick={() => {
                    if (service.isHebammenListe) {
                      setShowHebammenListeModal(true);
                    } else {
                      setSelectedService(service.title);
                    }
                  }}
                >
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <Image
                      src={service.image}
                      alt={t(service.title)}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-2xl font-bold text-white mb-3">{t(service.title)}</h3>
                      <p className="text-white/90">{t(service.description)}</p>
                      <div className="mt-3 inline-flex items-center gap-2 text-white/90 text-sm font-medium">
                        <span>{t("Mehr erfahren")}</span>
                        <ArrowRight size={16} className="rtl:-scale-x-100 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <button
                onClick={() => setShowFAQModal(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-brand text-white rounded-full font-semibold hover:bg-brand-dark transition-all hover:scale-105 shadow-lg"
              >
                <HelpCircle size={20} />
                {t("Oft gestellte Fragen")}
              </button>
            </motion.div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="py-12 md:py-20 bg-brand-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 md:mb-14"
            >
              <span className="inline-flex items-center gap-2 text-brand font-medium mb-4">
                <Users size={20} />
                <span>{t("Unser Team")}</span>
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                {t("Lernen Sie uns kennen")}
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-gray-600">
                {t("Erfahrene Hebammen mit Herz und Leidenschaft für ihren Beruf.")}
              </p>
            </motion.div>

            <TeamCarousel team={team} />

            {/* Join Team CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <button
                onClick={() => setShowJobModal(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-brand text-white rounded-full font-semibold hover:bg-brand-dark transition-all hover:scale-105 shadow-lg"
              >
                <Users size={20} />
                {t("Werde Teil unseres Teams")}
              </button>
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section id="ueber-uns" className="py-12 md:py-20 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <div className="aspect-[4/5] relative">
                    <Image
                      src={PEXELS_IMAGES.about}
                      alt={t("Hebammen am Marienhospital Bonn")}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-brand-soft rounded-full -z-10" />
                <div className="absolute -top-8 -left-8 w-32 h-32 bg-brand/10 rounded-full -z-10" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <span className="inline-flex items-center gap-2 text-brand font-medium">
                  <span>{t("Über uns")}</span>
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
                  {t("Mit Herz und Kompetenz an Ihrer Seite")}
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t("Wir Hebammen sind in einem Dienstbelegsystem am St. Marien Hospital in Bonn tätig. Unser Team vereint langjährige Erfahrung mit modernsten Methoden der Geburtshilfe.")}
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t("Jede Geburt ist einzigartig, und wir verstehen es als unsere Aufgabe, Sie individuell und einfühlsam durch diese besondere Zeit zu begleiten. Ihr Wohlbefinden und das Ihres Kindes stehen dabei immer im Mittelpunkt.")}
                </p>

                <div className="grid sm:grid-cols-2 gap-6 pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-soft flex items-center justify-center flex-shrink-0">
                      <Clock size={24} className="text-brand" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{t("24/7 Erreichbar")}</h4>
                      <p className="text-gray-600 text-sm">{t("Rund um die Uhr für Sie da")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-soft flex items-center justify-center flex-shrink-0">
                      <Shield size={24} className="text-brand" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{t("Geprüfte Qualität")}</h4>
                      <p className="text-gray-600 text-sm">{t("Höchste Standards")}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowVideoModal(true)}
                  className="inline-flex items-center gap-2 bg-brand text-white px-8 py-4 rounded-full font-semibold hover:bg-brand-dark transition-all hover:scale-105 shadow-lg mt-4"
                >
                  <Film size={20} />
                  {t("Einblick in unseren Kreißsaal")}
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-12 md:py-20 bg-gradient-to-b from-brand-cream to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 md:mb-14"
            >
              <span className="inline-flex items-center gap-2 text-brand font-medium mb-4">
                <span>{t("Bewertungen")}</span>
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                {t("Was Familien sagen")}
              </h2>
              <div className="flex items-center justify-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={28} className="text-brand-gold" fill="currentColor" />
                ))}
              </div>
              <p className="text-lg text-gray-600">{overallRating} {t("von 5 Sternen auf Google")} ({totalReviews} {t("Bewertungen")})</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {(googleReviews.length > 0 ? googleReviews : reviews).map((review, index) => {
                const isExpanded = expandedReviews.has(index);
                const text = tc(review.text);
                const shouldTruncate = text.length > 150;
                const displayText = shouldTruncate && !isExpanded ? text.substring(0, 150) + '...' : text;

                return (
                  <motion.article
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-3xl p-8 shadow-lg card-hover"
                  >
                    <div className="flex gap-1 mb-4">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} size={20} className="text-brand-gold" fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed">&ldquo;{displayText}&rdquo;</p>
                    {shouldTruncate && (
                      <button
                        onClick={() => {
                          const newExpanded = new Set(expandedReviews);
                          if (isExpanded) {
                            newExpanded.delete(index);
                          } else {
                            newExpanded.add(index);
                          }
                          setExpandedReviews(newExpanded);
                        }}
                        className="text-brand font-semibold text-sm hover:text-brand-dark transition-colors mb-4"
                      >
                        {isExpanded ? t("Weniger anzeigen") : t("Mehr lesen")}
                      </button>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900">{review.name}</p>
                      <p className="text-sm text-gray-500">{tc(review.date)}</p>
                    </div>
                  </motion.article>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <a
                href={links.googleBewertungen}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white border-2 border-brand text-brand px-6 py-3 rounded-full font-semibold hover:bg-brand hover:text-white transition-all"
              >
                <span>{t("Alle Bewertungen auf Google")}</span>
                <ArrowRight size={18} className="rtl:-scale-x-100" />
              </a>
            </motion.div>
          </div>
        </section>


        {/* Contact Section */}
        <section id="kontakt" className="py-12 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 md:mb-14"
            >
              <span className="inline-flex items-center gap-2 text-brand font-medium mb-4">
                <MapPin size={20} />
                <span>{t("Kontakt")}</span>
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                {t("Wir freuen uns auf Sie")}
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-gray-600">
                {t("Haben Sie Fragen oder möchten Sie einen Termin vereinbaren? Kontaktieren Sie uns!")}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div className="bg-brand-cream rounded-3xl p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">{t("Kontaktdaten")}</h3>

                  <div className="space-y-6">
                    <a
                      href={`tel:${kontakt.termine.tel}`}
                      className="flex items-center gap-4 group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Phone size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t("Termine Sprechstunde / Geburtsplanung")}</p>
                        <p className="text-xl font-semibold text-gray-900 group-hover:text-brand transition-colors">
                          0228 - 505 2201
                        </p>
                      </div>
                    </a>

                    <a
                      href={`tel:${kontakt.pforte.tel}`}
                      className="flex items-center gap-4 group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Phone size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t("Zentrale (Pforte)")}</p>
                        <p className="text-xl font-semibold text-gray-900 group-hover:text-brand transition-colors">
                          0228 - 505 0
                        </p>
                      </div>
                    </a>

                    <a
                      href={`mailto:${kontakt.email}`}
                      className="flex items-center gap-4 group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Mail size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t("E-Mail")}</p>
                        <p className="text-lg font-semibold text-gray-900 group-hover:text-brand transition-colors break-words">
                          info@<wbr />hebammen-<wbr />marienhospital-<wbr />bonn.de
                        </p>
                      </div>
                    </a>

                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center">
                        <MapPin size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t("Adresse")}</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {kontakt.strasse}<br />{kontakt.plz} {kontakt.ort}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="bg-gradient-to-br from-brand to-brand-dark rounded-3xl p-8 text-white">
                  <h3 className="text-xl font-bold mb-4">{t("Folgen Sie uns")}</h3>
                  <p className="text-white/80 mb-6">
                    {t("Bleiben Sie auf dem Laufenden und folgen Sie uns auf Instagram!")}
                  </p>
                  
                  {instagramPosts.length > 0 && (
                    <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
                      {instagramPosts.slice(0, 6).map((post) => (
                        <a
                          key={post.id}
                          href={post.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative aspect-square overflow-hidden rounded-xl bg-white/10"
                          aria-label={t("Beitrag auf Instagram öffnen")}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={asset(post.image)}
                            alt={post.caption ? post.caption.slice(0, 120) : "Instagram"}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </a>
                      ))}
                    </div>
                  )}

                  <a
                    href={links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full hover:bg-white/30 transition-colors"
                  >
                    <Instagram size={24} />
                    <span className="font-medium break-words">@hebammen_<wbr />marienhospital_<wbr />bonn</span>
                  </a>
                </div>
              </motion.div>

              {/* Map */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="rounded-3xl overflow-hidden shadow-2xl min-h-[420px] lg:h-auto"
              >
                <KarteNachKlick />
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-brand via-brand to-brand-dark relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white">
                {t("Bereit für den nächsten Schritt?")}
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                {t("Vereinbaren Sie Ihren Termin zur Geburtsanmeldung, melden Sie sich für ein Geburtsplanungsgespräch unter 0228 / 505 2201 oder schicken Sie uns Ihre Fragen per E-Mail.")}
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center pt-4">
                <a
                  href={GEBURTSANMELDUNG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white text-brand px-8 py-4 rounded-full font-semibold text-lg hover:bg-brand-soft transition-all hover:shadow-xl hover:scale-105"
                >
                  <Calendar size={20} />
                  <span>{t("Zur Geburtsanmeldung")}</span>
                </a>
                <a
                  href={`tel:${kontakt.termine.tel}`}
                  className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all"
                >
                  <Phone size={20} />
                  <span>{t("Geburtsplanung")}</span>
                </a>
                <a
                  href={`mailto:${kontakt.email}`}
                  className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all"
                >
                  <Mail size={20} />
                  <span>{t("E-Mail schreiben")}</span>
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative w-16 h-16">
                  <Image
                    src={LOGO}
                    alt={t("Hebammen am Marienhospital Bonn Logo")}
                    fill
                    className="object-contain"
                    sizes="150px"
                  />
                </div>
                <div>
                  <p className="font-semibold text-lg">Hebammen am Marienhospital</p>
                  <p className="text-gray-400">Sanne, Wald &amp; Partnerinnen</p>
                </div>
              </div>
              <p className="text-gray-400 max-w-md leading-relaxed">
                {t("Die Geburt ist ein individuelles und unvergessliches Erlebnis. Wir begleiten Sie einfühlsam und kompetent auf diesem besonderen Weg.")}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">{t("Navigation")}</h4>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {t(link.label)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">{t("Rechtliches")}</h4>
              <ul className="space-y-3">
                <li>
                  <a href={`${BASE_PATH}/impressum/`} className="text-gray-400 hover:text-white transition-colors">
                    {t("Impressum")}
                  </a>
                </li>
                <li>
                  <a href={`${BASE_PATH}/datenschutz/`} className="text-gray-400 hover:text-white transition-colors">
                    {t("Datenschutz")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Hebammen am Marienhospital Bonn. {t("Alle Rechte vorbehalten.")}
            </p>
            <a
              href={links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              aria-label={t("Instagram öffnen")}
            >
              <Instagram size={20} />
              <span>Instagram</span>
            </a>
          </div>
        </div>
      </footer>

      {/* FAQ Modal */}
      {showFAQModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowFAQModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex-shrink-0 px-5 sm:px-8 md:px-12 pt-6 sm:pt-8 md:pt-10 pb-5 sm:pb-6 flex items-center justify-between gap-4 border-b border-gray-100">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                {t("Häufig gestellte Fragen")}
              </h2>
              <button
                onClick={() => setShowFAQModal(false)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
                aria-label={t("Schließen")}
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-8 md:px-12 py-6 sm:py-8">
              <FAQ preloadedData={faqData} compact />
            </div>
          </motion.div>
        </div>
      )}

      {/* Job Application Modal */}
      {showJobModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowJobModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex-shrink-0 px-5 sm:px-8 md:px-12 pt-6 sm:pt-8 md:pt-10 pb-5 sm:pb-6 flex items-center justify-between gap-4 border-b border-gray-100">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                {t("Werde Teil unseres Teams!")}
              </h2>
              <button
                onClick={() => setShowJobModal(false)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
                aria-label={t("Schließen")}
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-8 md:px-12 py-6 sm:py-8">

              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {t("Du suchst einen Ort, an dem dein Können geschätzt wird und du jeden Tag kleine Wunder begleiten darfst?")}
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {t("Dann bist du bei uns genau richtig.")}
                </p>

                <div className="bg-brand-soft rounded-2xl p-6 my-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Heart size={24} className="text-brand" />
                    {t("Wir suchen Verstärkung:")}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-900 font-semibold">
                      <div className="w-2 h-2 rounded-full bg-brand" />
                      {t("Dienstbeleghebamme (m/w/d)")}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail size={20} className="text-brand" />
                    {t("Bewerbung einreichen")}
                  </h4>
                  <p className="text-gray-700 mb-4">
                    {t("Schicke deine Bewerbung an folgende E-Mail-Adresse:")}
                  </p>
                  <a
                    href="mailto:bewerbung@hebammen-marienhospital-bonn.de"
                    className="inline-flex max-w-full items-center gap-2 px-6 py-3 bg-brand text-white rounded-2xl sm:rounded-full font-semibold hover:bg-brand-dark transition-all hover:scale-105 shadow-lg"
                  >
                    <Mail size={20} />
                    <span className="break-words">bewerbung@<wbr />hebammen-<wbr />marienhospital-<wbr />bonn.de</span>
                  </a>
                </div>

                <p className="text-lg text-gray-700 leading-relaxed pt-6 border-t border-gray-200">
                  {t("Wir freuen uns darauf, dich kennenzulernen!")}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowVideoModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full"
          >
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  {t("Einblick in unseren Kreißsaal")}
                </h2>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  aria-label={t("Schließen")}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="aspect-video rounded-2xl overflow-hidden bg-gray-900">
                <FilmNachKlick titel={t("Einblick in unseren Kreißsaal")} />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Service Detail Modals */}
      {selectedService === "Vor der Geburt" && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedService(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Hero Image */}
            <div className="relative h-48 sm:h-72 md:h-96 rounded-t-3xl overflow-hidden flex-shrink-0">
              <Image
                src={`${BASE_PATH}/Hebammen Bilder/vorgeburt/446934_415242dd384f414da7debbc433c51982~mv2.avif`}
                alt={t("Vor der Geburt")}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/35 backdrop-blur-sm hover:bg-black/55 flex items-center justify-center transition-colors text-white"
                aria-label={t("Schließen")}
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-8 sm:right-8">
                <div className="inline-flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
                  <span>{t("Unsere Leistungen")}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{t("Vor der Geburt")}</h2>
              </div>
            </div>

            {/* Article Body */}
            <div className="px-5 sm:px-8 md:px-12 py-7 sm:py-10 space-y-8 sm:space-y-10 overflow-y-auto flex-1 min-h-0">

              {/* Intro */}
              <p className="text-lg text-gray-600 leading-relaxed border-l-4 border-brand pl-5">
                {t("Bei einer unauffälligen Schwangerschaft liegt die Hauptkommunikation zunächst in den bewährten Händen Ihres Facharztes und Ihrer Hebamme. Sollte es zu Wehentätigkeit, Blasensprung oder anderweitigem akutem Bedarf kommen, melden Sie sich telefonisch im Kreißsaal.")}
              </p>

              {/* Geburtsplanung — image right */}
              <div className="grid md:grid-cols-5 gap-6 items-start">
                <div className="md:col-span-3 space-y-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {t("Geburtsplanung")}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {t("Kommt es bei der Schwangerschaft zu Risiken, wird in unserer Schwangerenambulanz durch unser Ärzteteam eine Geburtsplanung durchgeführt. Neben der Beratung wird über Ihre Gedanken und Bedürfnisse gesprochen.")}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {t("All dies verschafft uns einen umfassenden Überblick über die aktuelle Situation. Somit sind wir vorbereitet und können bestmöglich auf Sie und Ihr Kind eingehen.")}
                  </p>
                  <p className="text-sm text-gray-500">{t("Bitte bringen Sie eine Überweisung von Ihrem Facharzt mit.")}</p>
                </div>
                <div className="md:col-span-2 rounded-2xl overflow-hidden relative aspect-[4/3]">
                  <Image
                    src={`${BASE_PATH}/Hebammen Bilder/vorgeburt/446934_ed88da43ae4044118c559a9112671a7e~mv2.avif`}
                    alt={t("Geburtsplanung")}
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Geburtseinleitung — image left */}
              <div className="grid md:grid-cols-5 gap-6 items-start">
                <div className="md:col-span-2 rounded-2xl overflow-hidden relative aspect-[4/3] order-last md:order-first">
                  <Image
                    src={`${BASE_PATH}/Hebammen Bilder/vorgeburt/446934_fdd46a13727f42d3878061231b435ff7~mv2.avif`}
                    alt={t("Geburtseinleitung")}
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                </div>
                <div className="md:col-span-3 space-y-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {t("Geburtseinleitung")}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {t("Wir führen Geburtseinleitungen nach Feststellung einer gegebenen Indikation bei uns im Kreißsaal durch. Die Einleitungsmethode wird individuell auf Sie, Ihren Körper und Ihr Kind abgestimmt.")}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {t("Für die Einleitung werden Sie stationär aufgenommen. Zu den CTG-Kontrollen sind Sie somit jederzeit an den Kreißsaal angebunden.")}
                  </p>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Weitere Angebote — with small inline image */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {t("Stationärer Aufenthalt & weitere Angebote")}
                </h3>
                <div className="grid md:grid-cols-5 gap-6 items-start">
                  <div className="md:col-span-3 space-y-3">
                    <p className="text-gray-600 leading-relaxed">
                      {t("Während eines stationären Aufenthalts führen wir täglich CTG-Kontrollen je nach Bedarf durch und stehen Ihnen bei Fragen und für eine Beratung zur Seite.")}
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      {t("Einige unserer Kolleginnen bieten alternative therapeutische Ansätze an, darunter Akupunktur, Taping und Laser-Therapie – darauf ausgerichtet, das Wohlbefinden werdender Mütter zu fördern.")}
                    </p>
                  </div>
                  <div className="md:col-span-2 rounded-2xl overflow-hidden relative aspect-[4/3]">
                    <Image
                      src={`${BASE_PATH}/Hebammen Bilder/vorgeburt/446934_4c7be112e02a4a9aac7700072e2c5bc3~mv2.avif`}
                      alt={t("Weitere Angebote")}
                      fill
                      className="object-cover"
                      sizes="300px"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Geburtsanmeldung */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900">{t("Geburtsanmeldung")}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t("Ihren Termin zur Geburtsanmeldung vereinbaren Sie bequem online über das Patientenportal der GFO Kliniken.")}
                </p>
              </div>

              {/* CTA */}
              <div className="pt-2 pb-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={GEBURTSANMELDUNG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-brand text-white px-6 py-3 rounded-full font-semibold hover:bg-brand-dark transition-all hover:scale-105 shadow-md"
                >
                  <Calendar size={18} />
                  {t("Zur Geburtsanmeldung")}
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {selectedService === "Während der Geburt" && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedService(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Hero Image */}
            <div className="relative h-48 sm:h-72 md:h-96 rounded-t-3xl overflow-hidden flex-shrink-0">
              <Image
                src={`${BASE_PATH}/Hebammen Bilder/geburt/446934_ff804781dba14fbe9da38c9421ddb2f4~mv2.avif`}
                alt={t("Während der Geburt")}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/35 backdrop-blur-sm hover:bg-black/55 flex items-center justify-center transition-colors text-white"
                aria-label={t("Schließen")}
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-8 sm:right-8">
                <div className="inline-flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
                  <span>{t("Unsere Leistungen")}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{t("Während der Geburt")}</h2>
              </div>
            </div>

            {/* Article Body */}
            <div className="px-5 sm:px-8 md:px-12 py-7 sm:py-10 space-y-8 sm:space-y-10 overflow-y-auto flex-1 min-h-0">

              {/* Intro */}
              <p className="text-lg text-gray-600 leading-relaxed border-l-4 border-brand pl-5">
                {t("Die Geburt ist ein individuelles und unvergessliches Erlebnis. Uns ist wichtig, Ihnen als werdenden Eltern eine ruhige und angenehme Atmosphäre zu schaffen – fachlich kompetent und menschlich nah.")}
              </p>

              {/* Begleitung — image right */}
              <div className="grid md:grid-cols-5 gap-6 items-start">
                <div className="md:col-span-3 space-y-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {t("Ihre Begleitung im Kreißsaal")}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {t("Unsere 5 Kreißsäle bieten genügend Raum, um unter Wehen verschiedene Positionen einzunehmen. Mit Zuspruch und Atemanleitung begleiten wir Sie einfühlsam durch den gesamten Geburtsablauf.")}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {t("Kommunikation ist uns sehr wichtig. Medizinisch notwendige Maßnahmen werden Ihnen vor dem Hintergrund der individuellen Situation genau erläutert – damit Sie sich jederzeit sicher und gut informiert fühlen.")}
                  </p>
                </div>
                <div className="md:col-span-2 rounded-2xl overflow-hidden relative aspect-[4/3]">
                  <Image
                    src={`${BASE_PATH}/Hebammen Bilder/geburt/446934_0604bb0f60274b0ab6373213a874746f~mv2.avif`}
                    alt={t("Begleitung im Kreißsaal")}
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Schmerzerleichterung — image left */}
              <div className="grid md:grid-cols-5 gap-6 items-start">
                <div className="md:col-span-2 rounded-2xl overflow-hidden relative aspect-[4/3] order-last md:order-first">
                  <Image
                    src={`${BASE_PATH}/Hebammen Bilder/geburt/446934_ca8d119777204ecf873fb13209019bb1~mv2.avif`}
                    alt={t("Schmerzerleichterung")}
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                </div>
                <div className="md:col-span-3 space-y-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {t("Schmerzerleichterung")}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {t("Wünschen Sie Schmerzlinderung, stehen wir Ihnen mit verschiedenen Methoden zur Seite: von Wärme, Massage, Aromatherapie und Homöopathie über medikamentöse Schmerzmittel bis zur Periduralanästhesie (PDA). Eigene Düfte in Form von Öl dürfen Sie gerne mitbringen.")}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {t("Wir beraten Sie gerne und wählen gemeinsam das passende Mittel für Ihre individuelle Geburtssituation und -phase aus.")}
                  </p>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Unser Team */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900">
                  {t("Unser Team für Sie")}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t("Wir als Hebammenteam sind primär für Ihre Betreuung zuständig. Verstärkt werden wir durch unsere Medizinischen Fachangestellten und unser Ärzteteam. Darüber hinaus bilden wir Hebammenstudierende aus.")}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {t("Aufgrund der Level-1 Betreuung sind wir im engen Kontakt mit den Kinderärzten/-ärztinnen, die sich direkt im Haus befinden und auf Abruf schnellstmöglich im Kreißsaal sind.")}
                </p>
              </div>

              <hr className="border-gray-100" />

              {/* Besondere Situationen — with image */}
              <div className="grid md:grid-cols-5 gap-6 items-start">
                <div className="md:col-span-3 space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {t("Besondere Geburtssituationen")}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{t("Frühgeburtlichkeit")}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {t("Als Perinatalzentrum Level 1 bieten wir die höchste Versorgungsstufe in jeder Schwangerschaftswoche. Bereits bei vorzeitigen Wehen, Zervixinsuffizienz oder auffälligen CTGs sind wir für Sie da.")}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{t("Beckenendlagen & Zwillinge")}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {t("Bei Beckenendlage oder Zwillingen ist eine natürliche Geburt bei uns möglich. Wir bieten außerdem eine äußere Wendung ab der 37. SSW an.")}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{t("Zustand nach Kaiserschnitt / VBAC")}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {t("Wir bemühen uns, dass Sie nach Möglichkeit vaginal gebären können. Sollte ein Kaiserschnitt notwendig sein, darf Ihre Begleitperson anwesend sein.")}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 bg-brand-soft rounded-xl px-4 py-3">
                      {t("Bei Beckenendlage, Zwillingen oder Zustand nach Kaiserschnitt ist ein Geburtsplanungsgespräch notwendig. Termine unter")}{" "}
                      <a href={`tel:${kontakt.termine.tel}`} className="text-brand hover:underline whitespace-nowrap">0228 / 505 2201</a>.
                    </p>
                  </div>
                </div>
                <div className="md:col-span-2 rounded-2xl overflow-hidden relative aspect-[4/3]">
                  <Image
                    src={`${BASE_PATH}/Hebammen Bilder/geburt/446934_9ed1417ac1634f54a8c4427c9cf3128f~mv2.avif`}
                    alt={t("Besondere Geburtssituationen")}
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}

      {selectedService === "Nach der Geburt" && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedService(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Hero Image */}
            <div className="relative h-48 sm:h-72 md:h-96 rounded-t-3xl overflow-hidden flex-shrink-0">
              <Image
                src={`${BASE_PATH}/Hebammen Bilder/nachgeburt/446934_78c921d93b4d47f4b6c3c6760bd5cedc~mv2.avif`}
                alt={t("Nach der Geburt")}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/35 backdrop-blur-sm hover:bg-black/55 flex items-center justify-center transition-colors text-white"
                aria-label={t("Schließen")}
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-8 sm:right-8">
                <div className="inline-flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
                  <span>{t("Unsere Leistungen")}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{t("Nach der Geburt")}</h2>
              </div>
            </div>

            {/* Article Body */}
            <div className="px-5 sm:px-8 md:px-12 py-7 sm:py-10 space-y-8 sm:space-y-10 overflow-y-auto flex-1 min-h-0">

              {/* Intro */}
              <p className="text-lg text-gray-600 leading-relaxed border-l-4 border-brand pl-5">
                {t("Die ersten Stunden und Tage nach der Geburt sind besonders. Wir begleiten Sie einfühlsam – vom ersten Moment im Kreißsaal und auf der Wochenbettstation.")}
              </p>

              {/* Bonding & erste Stunden — image right */}
              <div className="grid md:grid-cols-5 gap-6 items-start">
                <div className="md:col-span-3 space-y-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {t("Die ersten Stunden")}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {t("Im Anschluss an die Geburt werden Sie für circa 2 Stunden durch uns im Kreißsaal weiter betreut. Wir schauen nach Ihrem Wohlbefinden und dem Ihres Kindes.")}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {t("Der Körperkontakt zwischen Ihnen und Ihrem Kind liegt uns sehr am Herzen. Wir gewährleisten im direkten Anschluss an die Geburt das Bonding – dieser erste gemeinsame Moment ist unersetzlich.")}
                  </p>
                </div>
                <div className="md:col-span-2 rounded-2xl overflow-hidden relative aspect-[4/3]">
                  <Image
                    src={asset('/bilder/bonding-mutter-kind.webp')}
                    alt={t("Bonding nach der Geburt")}
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Stillen & U1 */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900">
                  {t("Stillen & Erstuntersuchung")}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t("Das erste Anlegen erfolgt bei uns im Kreißsaal – wir unterstützen Sie gerne beim Handling und stehen für all Ihre Fragen zur Verfügung.")}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {t("Die Erstuntersuchung (U1) wird von uns Hebammen gemeinsam mit Ihnen durchgeführt. Ein vertrauter Moment, bei dem Sie alles miterleben und nachfragen können.")}
                </p>
              </div>

              <hr className="border-gray-100" />

              {/* Wochenbettstation */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900">
                  {t("Wochenbettstation")}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t("Im Anschluss verlegen wir Sie auf die Wochenbettstation, wo Sie herzlich empfangen werden. Dort werden Sie hauptsächlich durch unsere Kolleginnen der Wochenbett- und Säuglingspflege sowie die Stillberaterinnen begleitet.")}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {t("Durch unsere tägliche Wochenbett-Visite stehen wir Ihnen weiterhin unterstützend und beratend zur Seite – für Ihre Genesung, das Stillen und alles rund um Ihr Neugeborenes.")}
                </p>
              </div>

              {/* CTA */}
              <div className="pt-2 pb-2">
                <a
                  href={`mailto:${kontakt.email}`}
                  className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-full font-semibold hover:bg-brand-dark transition-all hover:scale-105 shadow-md"
                >
                  <Mail size={18} />
                  {t("E-Mail schreiben")}
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Hebammenliste Modal */}
      {showHebammenListeModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowHebammenListeModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="relative">
              <div className="bg-gradient-to-r from-brand to-brand-dark p-5 pr-16 sm:p-8 sm:pr-20 text-white">
                <button
                  onClick={() => setShowHebammenListeModal(false)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/35 backdrop-blur-sm hover:bg-black/55 flex items-center justify-center transition-colors text-white"
                  aria-label={t("Schließen")}
                >
                  <X size={20} />
                </button>
                <h2 className="text-3xl font-bold mb-2">{t("Unsere Hebammen")}</h2>
                <p className="text-white/90">{t("Finden Sie die passende Hebamme mit allen Kontaktdaten")}</p>
              </div>

              <div className="p-4 sm:p-8 overflow-y-auto max-h-[calc(90vh-160px)]">
                {team.length === 0 ? (
                  <div className="text-center py-12">
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">{t("Lade Hebammenliste...")}</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {team
                      .filter(member => member.role && member.role.trim() !== '' && member.role !== 'Hebamme')
                      .map((member, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all border border-gray-100"
                        >
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* Bild */}
                            {member.image && (
                              <div className="flex-shrink-0">
                                <div className="relative w-28 h-40 sm:w-32 sm:h-56 rounded-2xl overflow-hidden">
                                  <Image
                                    src={asset(member.image)}
                                    alt={member.name}
                                    fill
                                    className="object-cover object-top"
                                    sizes="128px"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Info */}
                            <div className="flex-1 space-y-3">
                              <div>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{member.name}</h3>
                                <div className="flex flex-wrap gap-2">
                                  {member.role.split(',').map((activity: string, i: number) => (
                                    <span
                                      key={i}
                                      className="inline-flex max-w-full items-center gap-1 px-3 py-1 bg-brand/10 text-brand rounded-full text-sm font-medium"
                                    >
                                      <Heart size={14} />
                                      {activity.trim()}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Einzugsgebiet */}
                              {member.area && (
                                <div className="flex items-start gap-2 text-gray-600">
                                  <MapPin size={18} className="flex-shrink-0 mt-0.5 text-brand" />
                                  <span className="text-sm">{member.area}</span>
                                </div>
                              )}

                              {/* Kontaktdaten */}
                              <div className="flex flex-wrap gap-4 pt-2">
                                {member.phone && (
                                  <a
                                    href={`tel:${member.phone.replace(/[^0-9+]/g, '')}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-full text-sm font-medium hover:bg-brand-dark transition-all hover:scale-105"
                                  >
                                    <Phone size={16} />
                                    {formatPhoneNumber(member.phone)}
                                  </a>
                                )}
                                {member.email && (
                                  <a
                                    href={`mailto:${member.email}`}
                                    className="inline-flex max-w-full items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-all hover:scale-105 break-all"
                                  >
                                    <Mail size={16} />
                                    {member.email}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                )}

                {/* Hinweis wenn keine Hebammen mit Tätigkeiten */}
                {team.length > 0 && team.filter(m => m.role && m.role.trim() !== '' && m.role !== 'Hebamme').length === 0 && (
                  <div className="text-center py-12">
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">{t("Aktuell sind keine Hebammen mit spezifischen Tätigkeiten verfügbar.")}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Kamera-LiveView (USB) – standardmäßig AUS, Schalter unten links */}
      <LiveView />
    </div>
  );
}
