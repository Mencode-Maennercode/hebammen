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
  Sparkles,
  Calendar,
} from "lucide-react";

const LOGO_URL = "https://static.wixstatic.com/media/446934_56e43f0c28704f46bb3b1b221dee9a3f~mv2.png/v1/fill/w_209,h_205,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/446934_56e43f0c28704f46bb3b1b221dee9a3f~mv2.png";

const PEXELS_IMAGES = {
  hero: "https://images.pexels.com/photos/3845126/pexels-photo-3845126.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
  heroVideo: "/4314408-hd_1920_1080_24fps (1).mp4",
  pregnancy1: "https://images.pexels.com/photos/3662849/pexels-photo-3662849.jpeg?auto=compress&cs=tinysrgb&w=800",
  pregnancy2: "https://images.pexels.com/photos/3845456/pexels-photo-3845456.jpeg?auto=compress&cs=tinysrgb&w=800",
  newborn: "https://images.pexels.com/photos/3875090/pexels-photo-3875090.jpeg?auto=compress&cs=tinysrgb&w=800",
  mother: "https://images.pexels.com/photos/3845747/pexels-photo-3845747.jpeg?auto=compress&cs=tinysrgb&w=800",
  team1: "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=600",
  team2: "https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=600",
  team3: "https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=600",
  team4: "https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=600",
  about: "https://images.pexels.com/photos/3985296/pexels-photo-3985296.jpeg?auto=compress&cs=tinysrgb&w=1200",
  delivery: "https://images.pexels.com/photos/3845455/pexels-photo-3845455.jpeg?auto=compress&cs=tinysrgb&w=800",
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

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
    return () => window.removeEventListener("scroll", handleScroll);
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
      title: "Geburtsvorbereitung",
      description: "Intensive Vorbereitung auf die Geburt mit bewährten Methoden und einfühlsamer Begleitung.",
      image: PEXELS_IMAGES.pregnancy1,
    },
    {
      icon: Heart,
      title: "Während der Geburt",
      description: "Die Geburt ist ein individuelles und unvergessliches Erlebnis. Wir stehen Ihnen mit unserer Expertise zur Seite.",
      image: PEXELS_IMAGES.delivery,
    },
    {
      icon: Users,
      title: "Wochenbettbetreuung",
      description: "Kompetente und einfühlsame Begleitung für einen guten Start in das neue Familienleben.",
      image: PEXELS_IMAGES.newborn,
    },
    {
      icon: Shield,
      title: "Stillberatung",
      description: "Professionelle Unterstützung und Beratung rund um das Stillen für Mutter und Kind.",
      image: PEXELS_IMAGES.mother,
    },
  ];

  const team = [
    { name: "Sanne", role: "Hebamme & Partnerin", image: PEXELS_IMAGES.team1, experience: "15+ Jahre Erfahrung" },
    { name: "Wald", role: "Hebamme & Partnerin", image: PEXELS_IMAGES.team2, experience: "12+ Jahre Erfahrung" },
    { name: "Maria", role: "Hebamme", image: PEXELS_IMAGES.team3, experience: "10+ Jahre Erfahrung" },
    { name: "Sophie", role: "Hebamme", image: PEXELS_IMAGES.team4, experience: "8+ Jahre Erfahrung" },
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
    { number: "2000+", label: "Geburten begleitet" },
    { number: "15+", label: "Jahre Erfahrung" },
    { number: "100%", label: "Hingabe" },
    { number: "24/7", label: "Erreichbarkeit" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "glass-effect shadow-lg py-2"
            : "bg-transparent py-4"
        }`}
        role="banner"
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Hauptnavigation">
          <div className="flex items-center justify-between">
            <a href="#home" className="flex items-center gap-3 group" aria-label="Zur Startseite">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 transition-transform group-hover:scale-105">
                <Image
                  src={LOGO_URL}
                  alt="Hebammen am Marienhospital Bonn Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <p className={`font-semibold text-lg transition-colors ${isScrolled ? "text-[#8B5A6B]" : "text-white"}`}>
                  Hebammen am Marienhospital
                </p>
                <p className={`text-sm transition-colors ${isScrolled ? "text-[#6B4453]" : "text-white/80"}`}>
                  Sanne, Wald & Partnerinnen
                </p>
              </div>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`relative font-medium transition-colors hover:text-[#8B5A6B] ${
                    isScrolled ? "text-gray-700" : "text-white"
                  } ${activeSection === link.href.slice(1) ? "text-[#8B5A6B]" : ""}`}
                >
                  {link.label}
                  {activeSection === link.href.slice(1) && (
                    <motion.span
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#8B5A6B]"
                    />
                  )}
                </a>
              ))}
              <a
                href="tel:+492285052205"
                className="flex items-center gap-2 bg-[#8B5A6B] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#6B4453] transition-all hover:shadow-lg hover:scale-105"
              >
                <Phone size={18} />
                <span>Anrufen</span>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                isScrolled ? "text-[#8B5A6B]" : "text-white"
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
              className="lg:hidden absolute top-full left-0 right-0 glass-effect shadow-xl border-t border-gray-100"
            >
              <div className="flex flex-col p-6 space-y-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-700 font-medium py-2 hover:text-[#8B5A6B] transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href="tel:+492285052205"
                  className="flex items-center justify-center gap-2 bg-[#8B5A6B] text-white px-5 py-3 rounded-full font-medium hover:bg-[#6B4453] transition-colors"
                >
                  <Phone size={18} />
                  <span>0228 - 505 2205</span>
                </a>
              </div>
            </motion.div>
          )}
        </nav>
      </header>

      <main id="main-content">
        {/* Hero Section */}
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Video Background */}
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              poster={PEXELS_IMAGES.hero}
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
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm font-medium">
                <Sparkles size={16} />
                <span>Herzlich willkommen bei uns</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                Ihre Hebammen in
                <span className="block text-[#F5E6E8]">Bonn</span>
              </h1>

              <p className="max-w-2xl mx-auto text-lg sm:text-xl text-white/90 leading-relaxed">
                Die Geburt ist ein individuelles und unvergessliches Erlebnis.
                Wir begleiten Sie einfühlsam und kompetent auf diesem besonderen Weg.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <a
                  href="#kontakt"
                  className="group inline-flex items-center justify-center gap-2 bg-[#8B5A6B] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#6B4453] transition-all hover:shadow-2xl hover:scale-105"
                >
                  <span>Kontakt aufnehmen</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#leistungen"
                  className="group inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/30 transition-all border border-white/30"
                >
                  <Play size={20} />
                  <span>Mehr erfahren</span>
                </a>
              </div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
              <a
                href="#leistungen"
                className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors"
                aria-label="Zu den Leistungen scrollen"
              >
                <span className="text-sm font-medium">Mehr entdecken</span>
                <ChevronDown size={24} className="animate-bounce" />
              </a>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-3xl md:text-4xl font-bold text-[#8B5A6B]">{stat.number}</p>
                  <p className="text-gray-600 mt-1 text-sm md:text-base">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Services Section */}
        <section id="leistungen" className="py-24 md:py-32 bg-gradient-to-b from-white to-[#FDF8F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-flex items-center gap-2 text-[#8B5A6B] font-medium mb-4">
                <Heart size={20} />
                <span>Unsere Leistungen</span>
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                Rundum gut betreut
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-gray-600">
                Von der Schwangerschaft bis zur Nachsorge – wir begleiten Sie in jeder Phase mit Fachwissen und Herz.
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
                  className="group relative bg-white rounded-3xl overflow-hidden shadow-lg card-hover"
                >
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <service.icon size={24} className="text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">{service.title}</h3>
                      </div>
                      <p className="text-white/90">{service.description}</p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <a
                href="#kontakt"
                className="inline-flex items-center gap-2 text-[#8B5A6B] font-semibold hover:gap-4 transition-all"
              >
                <span>Alle Leistungen entdecken</span>
                <ArrowRight size={20} />
              </a>
            </motion.div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="py-24 md:py-32 bg-[#FDF8F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-flex items-center gap-2 text-[#8B5A6B] font-medium mb-4">
                <Users size={20} />
                <span>Unser Team</span>
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                Lernen Sie uns kennen
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-gray-600">
                Erfahrene Hebammen mit Herz und Leidenschaft für ihren Beruf.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <motion.article
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="relative rounded-3xl overflow-hidden mb-6 card-hover">
                    <div className="aspect-[3/4] relative">
                      <Image
                        src={member.image}
                        alt={`${member.name} - ${member.role}`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#8B5A6B]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                        <p className="text-white/90 text-sm">{member.experience}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                    <p className="text-[#8B5A6B] font-medium">{member.role}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="ueber-uns" className="py-24 md:py-32 bg-white overflow-hidden">
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
                      alt="Hebammen am Marienhospital Bonn"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-[#F5E6E8] rounded-full -z-10" />
                <div className="absolute -top-8 -left-8 w-32 h-32 bg-[#8B5A6B]/10 rounded-full -z-10" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <span className="inline-flex items-center gap-2 text-[#8B5A6B] font-medium">
                  <Sparkles size={20} />
                  <span>Über uns</span>
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
                  Mit Herz und Kompetenz an Ihrer Seite
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Wir sind Hebammen in Bonn und arbeiten im Dienstbelegsystem im Marienhospital Bonn. 
                  Unser Team vereint langjährige Erfahrung mit modernsten Methoden der Geburtshilfe.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Jede Geburt ist einzigartig, und wir verstehen es als unsere Aufgabe, Sie individuell 
                  und einfühlsam durch diese besondere Zeit zu begleiten. Ihr Wohlbefinden und das Ihres 
                  Kindes stehen dabei immer im Mittelpunkt.
                </p>

                <div className="grid sm:grid-cols-2 gap-6 pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F5E6E8] flex items-center justify-center flex-shrink-0">
                      <Clock size={24} className="text-[#8B5A6B]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">24/7 Erreichbar</h4>
                      <p className="text-gray-600 text-sm">Rund um die Uhr für Sie da</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F5E6E8] flex items-center justify-center flex-shrink-0">
                      <Shield size={24} className="text-[#8B5A6B]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Geprüfte Qualität</h4>
                      <p className="text-gray-600 text-sm">Höchste Standards</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-24 md:py-32 bg-gradient-to-b from-[#FDF8F5] to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-flex items-center gap-2 text-[#8B5A6B] font-medium mb-4">
                <Star size={20} fill="#8B5A6B" />
                <span>Bewertungen</span>
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                Was Familien sagen
              </h2>
              <div className="flex items-center justify-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={28} className="text-[#D4B896]" fill="#D4B896" />
                ))}
              </div>
              <p className="text-lg text-gray-600">4.9 von 5 Sternen auf Google</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {reviews.map((review, index) => (
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
                      <Star key={i} size={20} className="text-[#D4B896]" fill="#D4B896" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900">{review.name}</p>
                    <p className="text-sm text-gray-500">{review.date}</p>
                  </div>
                </motion.article>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <a
                href="https://www.google.com/maps"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white border-2 border-[#8B5A6B] text-[#8B5A6B] px-6 py-3 rounded-full font-semibold hover:bg-[#8B5A6B] hover:text-white transition-all"
              >
                <span>Alle Bewertungen auf Google</span>
                <ArrowRight size={18} />
              </a>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="kontakt" className="py-24 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-flex items-center gap-2 text-[#8B5A6B] font-medium mb-4">
                <MapPin size={20} />
                <span>Kontakt</span>
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                Wir freuen uns auf Sie
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-gray-600">
                Haben Sie Fragen oder möchten Sie einen Termin vereinbaren? Kontaktieren Sie uns!
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div className="bg-[#FDF8F5] rounded-3xl p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Kontaktdaten</h3>

                  <div className="space-y-6">
                    <a
                      href="tel:+492285052205"
                      className="flex items-center gap-4 group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-[#8B5A6B] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Phone size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Kreißsaal</p>
                        <p className="text-xl font-semibold text-gray-900 group-hover:text-[#8B5A6B] transition-colors">
                          0228 - 505 2205
                        </p>
                      </div>
                    </a>

                    <a
                      href="mailto:info@hebammen-marienhospital-bonn.de"
                      className="flex items-center gap-4 group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-[#8B5A6B] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Mail size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">E-Mail</p>
                        <p className="text-lg font-semibold text-gray-900 group-hover:text-[#8B5A6B] transition-colors break-all">
                          info@hebammen-marienhospital-bonn.de
                        </p>
                      </div>
                    </a>

                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#8B5A6B] flex items-center justify-center">
                        <MapPin size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Adresse</p>
                        <p className="text-lg font-semibold text-gray-900">
                          Robert-Koch-Straße 1<br />53115 Bonn
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="bg-gradient-to-br from-[#8B5A6B] to-[#6B4453] rounded-3xl p-8 text-white">
                  <h3 className="text-xl font-bold mb-4">Folgen Sie uns</h3>
                  <p className="text-white/80 mb-6">
                    Bleiben Sie auf dem Laufenden und folgen Sie uns auf Instagram!
                  </p>
                  
                  {/* Instagram Feed Carousel */}
                  <div className="mb-6">
                    <div className="flex gap-3 overflow-x-auto pb-2 instagram-scroll">
                      <div className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden relative group">
                        <Image
                          src="https://images.pexels.com/photos/3662849/pexels-photo-3662849.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop"
                          alt="Schwangerschaft"
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-white text-xs font-medium">✨ Neues Leben</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden relative group">
                        <Image
                          src="https://images.pexels.com/photos/3875090/pexels-photo-3875090.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop"
                          alt="Neugeborenes"
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-white text-xs font-medium">👶 Willkommen</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden relative group">
                        <Image
                          src="https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop"
                          alt="Hebamme"
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-white text-xs font-medium">👩‍⚕️ Unser Team</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden relative group">
                        <Image
                          src="https://images.pexels.com/photos/3845747/pexels-photo-3845747.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop"
                          alt="Mutter und Kind"
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-white text-xs font-medium">❤️ Für Sie da</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden relative group">
                        <Image
                          src="https://images.pexels.com/photos/3985296/pexels-photo-3985296.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop"
                          alt="Geburtshilfe"
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-white text-xs font-medium">🏥 Kompetenz</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <a
                    href="https://www.instagram.com/hebammen_marienhospital_bonn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full hover:bg-white/30 transition-colors"
                  >
                    <Instagram size={24} />
                    <span className="font-medium">@hebammen_marienhospital_bonn</span>
                  </a>
                </div>
              </motion.div>

              {/* Map */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="rounded-3xl overflow-hidden shadow-2xl h-[500px] lg:h-auto"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2517.9376!2d7.1044!3d50.7264!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bee17b0c5d5f0b%3A0x5e0b3c5b5c5b5c5b!2sRobert-Koch-Stra%C3%9Fe%201%2C%2053115%20Bonn!5e0!3m2!1sde!2sde!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "500px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Standort Marienhospital Bonn"
                ></iframe>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-[#8B5A6B] via-[#8B5A6B] to-[#6B4453] relative overflow-hidden">
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
              <Calendar size={48} className="text-white/80 mx-auto" />
              <h2 className="text-3xl md:text-5xl font-bold text-white">
                Bereit für den nächsten Schritt?
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Vereinbaren Sie jetzt Ihren persönlichen Beratungstermin und lernen Sie uns kennen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <a
                  href="tel:+492285052205"
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#8B5A6B] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#F5E6E8] transition-all hover:shadow-xl hover:scale-105"
                >
                  <Phone size={20} />
                  <span>Jetzt anrufen</span>
                </a>
                <a
                  href="mailto:info@hebammen-marienhospital-bonn.de"
                  className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all"
                >
                  <Mail size={20} />
                  <span>E-Mail schreiben</span>
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
                    src={LOGO_URL}
                    alt="Hebammen am Marienhospital Bonn Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="font-semibold text-lg">Hebammen am Marienhospital</p>
                  <p className="text-gray-400">Sanne, Wald & Partnerinnen</p>
                </div>
              </div>
              <p className="text-gray-400 max-w-md leading-relaxed">
                Die Geburt ist ein individuelles und unvergessliches Erlebnis. Wir begleiten Sie 
                einfühlsam und kompetent auf diesem besonderen Weg.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Navigation</h4>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Rechtliches</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Impressum
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Datenschutz
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Hebammen am Marienhospital Bonn. Alle Rechte vorbehalten.
            </p>
            <a
              href="https://www.instagram.com/hebammen_marienhospital_bonn"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Instagram öffnen"
            >
              <Instagram size={20} />
              <span>Instagram</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
