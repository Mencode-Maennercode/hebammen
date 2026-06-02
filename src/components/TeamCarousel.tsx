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

const CARD_WIDTH = 224; // 200px card + 24px gap (gap-6)
const SCROLL_SPEED = 0.5; // px per frame

export default function TeamCarousel({ team }: TeamCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Duplicate the team so the marquee can loop seamlessly
  const displayTeam = team.length > 0 ? [...team, ...team] : [];
  const singleSetWidth = team.length * CARD_WIDTH;

  const applyTransform = useCallback(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    }
    if (team.length > 0) {
      const idx = Math.floor(offsetRef.current / CARD_WIDTH) % team.length;
      setCurrentIndex(((idx % team.length) + team.length) % team.length);
    }
  }, [team.length]);

  // Continuous auto-scroll using requestAnimationFrame
  useEffect(() => {
    if (team.length === 0) return;

    const tick = () => {
      if (!pausedRef.current) {
        offsetRef.current += SCROLL_SPEED;
        if (offsetRef.current >= singleSetWidth) {
          offsetRef.current -= singleSetWidth;
        }
        applyTransform();
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [team.length, singleSetWidth, applyTransform]);

  const pause = () => { pausedRef.current = true; setIsPaused(true); };
  const resume = () => { pausedRef.current = false; setIsPaused(false); };

  const step = (dir: number) => {
    let next = offsetRef.current + dir * CARD_WIDTH;
    if (next < 0) next += singleSetWidth;
    if (next >= singleSetWidth) next -= singleSetWidth;
    offsetRef.current = next;
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 0.4s ease';
      applyTransform();
      window.setTimeout(() => {
        if (trackRef.current) trackRef.current.style.transition = '';
      }, 400);
    }
  };

  if (team.length === 0) return null;

  return (
    <div
      className="relative group"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        {/* Edge blur overlays for smooth fade effect */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#FDF8F5] via-[#FDF8F5]/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#FDF8F5] via-[#FDF8F5]/80 to-transparent z-10 pointer-events-none" />

        <div className="overflow-hidden py-2">
          <div
            ref={trackRef}
            className="flex gap-6 will-change-transform"
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
      </div>

      {/* Navigation Arrows */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          onClick={() => step(-1)}
          className="w-12 h-12 rounded-full bg-[#8B5A6B] text-white flex items-center justify-center hover:bg-[#6B4453] transition-all hover:scale-110 shadow-lg"
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
          onClick={() => step(1)}
          className="w-12 h-12 rounded-full bg-[#8B5A6B] text-white flex items-center justify-center hover:bg-[#6B4453] transition-all hover:scale-110 shadow-lg"
          aria-label="Nächstes Teammitglied"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
