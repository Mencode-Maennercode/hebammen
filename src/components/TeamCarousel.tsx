'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  image: string;
}

interface TeamCarouselProps {
  team: TeamMember[];
}

function MemberCard({ member, priority = false }: { member: TeamMember; priority?: boolean }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <article className="group/card flex-shrink-0 w-[200px]">
      <div className="relative rounded-3xl overflow-hidden card-hover w-full h-[267px]">
        {!imgError && member.image ? (
          <img
            src={member.image}
            alt={`${member.name} - ${member.role}`}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover/card:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading={priority ? 'eager' : 'lazy'}
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              console.error(`[TeamCarousel] Bild fehlgeschlagen: ${member.image}`);
              setImgError(true);
            }}
          />
        ) : null}
        {/* Placeholder while loading or on error */}
        {(!imgLoaded || imgError) && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#8B5A6B]/20 to-[#8B5A6B]/40 flex items-center justify-center">
            <span className="text-4xl text-white/60 font-bold">
              {member.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#8B5A6B]/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
        {/* Glassmorphism name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/10 backdrop-blur-md border-t border-white/20">
          <h3 className="text-lg font-bold text-white drop-shadow-lg leading-tight">
            {member.name.split(' ')[0]}<br />
            {member.name.split(' ').slice(1).join(' ')}
          </h3>
        </div>
      </div>
    </article>
  );
}

export default function TeamCarousel({ team }: TeamCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoScrollRef = useRef<number | null>(null);
  const scrollPositionRef = useRef(0);
  const CARD_WIDTH = 224; // 200px card + 24px gap (gap-6)
  const SCROLL_SPEED = 0.8; // px per frame

  // Build display list: triple the team for seamless looping
  const displayTeam = [...team, ...team, ...team];

  // Continuous auto-scroll using requestAnimationFrame
  const startAutoScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const totalWidth = team.length * CARD_WIDTH;

    const tick = () => {
      scrollPositionRef.current += SCROLL_SPEED;
      // Loop back seamlessly
      if (scrollPositionRef.current >= totalWidth * 2) {
        scrollPositionRef.current -= totalWidth;
      }
      el.scrollLeft = scrollPositionRef.current;
      // Update currentIndex based on scroll position
      const idx = Math.round(scrollPositionRef.current / CARD_WIDTH) % team.length;
      setCurrentIndex(idx);
      autoScrollRef.current = requestAnimationFrame(tick);
    };
    autoScrollRef.current = requestAnimationFrame(tick);
  }, [team.length]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      cancelAnimationFrame(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  }, []);

  // Start/stop auto-scroll based on pause state
  useEffect(() => {
    if (!isPaused && team.length > 0) {
      // Sync scroll position from current state
      if (scrollRef.current) {
        scrollPositionRef.current = scrollRef.current.scrollLeft;
      }
      startAutoScroll();
    } else {
      stopAutoScroll();
      // Save current scroll position when pausing
      if (scrollRef.current) {
        scrollPositionRef.current = scrollRef.current.scrollLeft;
      }
    }
    return () => stopAutoScroll();
  }, [isPaused, team.length, startAutoScroll, stopAutoScroll]);

  // Initialize scroll position to the middle set (so we can scroll back)
  useEffect(() => {
    if (scrollRef.current && team.length > 0) {
      const initialPos = team.length * CARD_WIDTH;
      scrollRef.current.scrollLeft = initialPos;
      scrollPositionRef.current = initialPos;
    }
  }, [team.length]);

  const handlePrevious = () => {
    if (!scrollRef.current) return;
    const newPos = scrollRef.current.scrollLeft - CARD_WIDTH;
    scrollRef.current.scrollTo({ left: newPos, behavior: 'smooth' });
    scrollPositionRef.current = newPos;
    setCurrentIndex((prev) => (prev - 1 + team.length) % team.length);
  };

  const handleNext = () => {
    if (!scrollRef.current) return;
    const newPos = scrollRef.current.scrollLeft + CARD_WIDTH;
    scrollRef.current.scrollTo({ left: newPos, behavior: 'smooth' });
    scrollPositionRef.current = newPos;
    setCurrentIndex((prev) => (prev + 1) % team.length);
  };

  if (team.length === 0) return null;

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        {/* Edge blur overlays for smooth fade effect */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#FDF8F5] via-[#FDF8F5]/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#FDF8F5] via-[#FDF8F5]/80 to-transparent z-10 pointer-events-none" />

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-hidden py-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayTeam.map((member, index) => (
            <MemberCard
              key={`${member.name}-${index}`}
              member={member}
              priority={index < 12}
            />
          ))}
        </div>
      </div>

      {/* Navigation Arrows - Visible on hover */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          onClick={() => { setIsPaused(true); handlePrevious(); }}
          className="w-12 h-12 rounded-full bg-[#8B5A6B] text-white flex items-center justify-center hover:bg-[#6B4453] transition-all hover:scale-110 shadow-lg opacity-0 group-hover:opacity-100"
          aria-label="Vorheriges Teammitglied"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Progress Indicator */}
        <div className="flex gap-1 items-center">
          <span className="text-sm text-gray-500 mr-2">
            {currentIndex + 1} / {team.length}
          </span>
          <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#8B5A6B]"
              animate={{ width: `${((currentIndex + 1) / team.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <button
          onClick={() => { setIsPaused(true); handleNext(); }}
          className="w-12 h-12 rounded-full bg-[#8B5A6B] text-white flex items-center justify-center hover:bg-[#6B4453] transition-all hover:scale-110 shadow-lg opacity-0 group-hover:opacity-100"
          aria-label="Nächstes Teammitglied"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
