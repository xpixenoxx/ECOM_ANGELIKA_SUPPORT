'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface OccasionItem {
  id: string;
  title: string;
  tag: string;
  subtitle: string;
  description: string;
  image: string;
  href: string;
  ctaText?: string;
}

export const DEFAULT_OCCASIONS: OccasionItem[] = [
  {
    id: 'bridal-wedding',
    title: 'Bridal & Wedding',
    tag: 'Royal Celebrations',
    subtitle: 'Intricate Zardozi & Heritage Silks',
    description: 'Regal bridal lehengas, bespoke celebratory silhouettes, and heirloom drapes for unforgettable weddings.',
    image: '/images/collections/lehengas.jpg',
    href: '/shop/lehengas?occasion=wedding',
    ctaText: 'Explore Lehengas',
  },
  {
    id: 'festive-celebrations',
    title: 'Festive Splendor',
    tag: 'Puja & Celebrations',
    subtitle: 'Handloom Kanjivaram & Pure Silks',
    description: 'Auspicious drapes and luminous gold zari borders handcrafted to illuminate every Indian festival.',
    image: '/images/collections/sarees.jpg',
    href: '/shop/sarees?occasion=festive',
    ctaText: 'Explore Sarees',
  },
  {
    id: 'party-evening',
    title: 'Cocktail & Evening',
    tag: 'Soirées & Galas',
    subtitle: 'Modern Shimmer & Contemporary Cuts',
    description: 'Glamorous evening wear and modern fusion gowns curated to mesmerize under ambient chandeliers.',
    image: '/images/collections/party-wear-dresses.jpg',
    href: '/shop?occasion=party',
    ctaText: 'Explore Party Wear',
  },
  {
    id: 'work-office',
    title: 'Office & Work Wear',
    tag: 'Desk to Dinner',
    subtitle: 'Breathable Linens & Tailored Fits',
    description: 'Understated luxury with clean lines, featherlight breathable cottons, and poised ethnic tailoring.',
    image: '/images/collections/office-wear-sets.jpg',
    href: '/shop/salwars?occasion=office',
    ctaText: 'Explore Workwear',
  },
  {
    id: 'coord-sets',
    title: 'Everyday Chic & Co-ords',
    tag: 'Casual Luxe',
    subtitle: 'Matching Sets & Fusion Silhouettes',
    description: 'Effortless coordinated ethnic sets blending traditional artisanal motifs with modern relaxed comfort.',
    image: '/images/collections/coord-sets.jpg',
    href: '/shop/kurtis?occasion=casual',
    ctaText: 'Explore Co-ords',
  },
  {
    id: 'festive-frocks',
    title: 'Anarkalis & Frocks',
    tag: 'Twirl-Worthy Ensembles',
    subtitle: 'Flared Kalis & Artful Embroidery',
    description: 'Voluminous, twirl-ready flared kurtis and festive frocks crafted for joyful celebrations and sangeet nights.',
    image: '/images/collections/womens-frocks.jpg',
    href: '/shop/salwars?type=anarkali',
    ctaText: 'Explore Anarkalis',
  },
];

interface OccasionCoverflowProps {
  occasions?: OccasionItem[];
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  className?: string;
}

export function OccasionCoverflow({
  occasions = DEFAULT_OCCASIONS,
  title = 'Shop by Occasion',
  subtitle = 'Discover handcrafted drapes tailored for life\'s most cherished milestones — from grand weddings to poised everyday elegance.',
  eyebrow = 'Curated Collections',
  className = '',
}: OccasionCoverflowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = occasions.length;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(handleNext, 5500);
    return () => clearInterval(interval);
  }, [isHovered, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inViewport) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlePrev, handleNext]);

  // Calculate circular offset
  const getOffset = (index: number) => {
    let diff = index - activeIndex;
    while (diff > total / 2) diff -= total;
    while (diff < -total / 2) diff += total;
    return diff;
  };

  // Drag handler
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 40 || info.velocity.x > 250) {
      handlePrev();
    } else if (info.offset.x < -40 || info.velocity.x < -250) {
      handleNext();
    }
  };

  // 3D positioning styles
  const getCardTransform = (offset: number) => {
    const abs = Math.abs(offset);

    if (offset === 0) {
      return {
        x: 0,
        z: isMobile ? 40 : 100,
        rotateY: 0,
        scale: 1,
        opacity: 1,
        zIndex: 30,
        filter: 'brightness(1)',
        pointerEvents: 'auto' as const,
      };
    }

    if (abs === 1) {
      const dir = offset > 0 ? 1 : -1;
      const xDistance = isMobile ? 180 : isTablet ? 270 : 330;
      return {
        x: dir * xDistance,
        z: isMobile ? -30 : -60,
        rotateY: dir * (isMobile ? -20 : -35),
        scale: isMobile ? 0.85 : 0.88,
        opacity: 0.85,
        zIndex: 20,
        filter: 'brightness(0.85)',
        pointerEvents: 'auto' as const,
      };
    }

    if (abs === 2) {
      const dir = offset > 0 ? 1 : -1;
      const xDistance = isMobile ? 260 : isTablet ? 420 : 520;
      return {
        x: dir * xDistance,
        z: isMobile ? -90 : -140,
        rotateY: dir * (isMobile ? -28 : -50),
        scale: isMobile ? 0.72 : 0.76,
        opacity: isMobile ? 0 : 0.45,
        zIndex: 10,
        filter: 'brightness(0.65)',
        pointerEvents: isMobile ? ('none' as const) : ('auto' as const),
      };
    }

    const dir = offset > 0 ? 1 : -1;
    return {
      x: dir * (isMobile ? 320 : 600),
      z: -250,
      rotateY: dir * -60,
      scale: 0.55,
      opacity: 0,
      zIndex: 0,
      filter: 'brightness(0.5)',
      pointerEvents: 'none' as const,
    };
  };

  return (
    <section
      ref={containerRef}
      className={cn(
        'relative py-12 sm:py-16 md:py-20 bg-gradient-to-b from-[var(--color-snow)] via-[var(--color-white)] to-[var(--color-snow)] border-b border-[var(--color-whisper)] overflow-hidden',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Shop by Occasion Carousel"
    >
      {/* Background Ambience Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[var(--color-gold)]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-5 h-px bg-[var(--color-gold)]/70" />
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-gold)]">
              {eyebrow}
            </span>
            <span className="w-5 h-px bg-[var(--color-gold)]/70" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-[var(--color-ink)] mb-3 tracking-tight">
            {title}
          </h2>
          <p className="text-[var(--color-slate)] text-xs sm:text-sm md:text-base leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* 3D Coverflow Stage */}
        <div
          className="relative w-full max-w-6xl mx-auto h-[460px] sm:h-[520px] md:h-[560px] flex items-center justify-center select-none"
          style={{ perspective: 1200 }}
        >
          {/* Invisible Drag Area */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 z-30 cursor-grab active:cursor-grabbing"
            style={{ pointerEvents: 'auto' }}
          />

          {/* Previous Button */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous occasion"
            className="absolute left-1 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-[var(--color-ink)] hover:text-[var(--color-gold)] border border-[var(--color-whisper)] shadow-md hover:shadow-xl backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-[var(--color-gold)]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Next Button */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next occasion"
            className="absolute right-1 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-[var(--color-ink)] hover:text-[var(--color-gold)] border border-[var(--color-whisper)] shadow-md hover:shadow-xl backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-[var(--color-gold)]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Cards */}
          {occasions.map((item, index) => {
            const offset = getOffset(index);
            const style = getCardTransform(offset);
            const isCenter = offset === 0;

            return (
              <motion.div
                key={item.id}
                animate={style}
                transition={{
                  type: 'spring',
                  stiffness: 280,
                  damping: 30,
                  mass: 0.8,
                }}
                onClick={() => {
                  if (!isCenter) {
                    setActiveIndex(index);
                  }
                }}
                className={cn(
                  'absolute inset-0 m-auto w-[270px] sm:w-[330px] md:w-[370px] h-[390px] sm:h-[460px] md:h-[500px]',
                  'rounded-2xl overflow-hidden shadow-2xl transition-shadow duration-500',
                  isCenter
                    ? 'ring-1 ring-[var(--color-gold)]/60 shadow-[0_20px_50px_rgba(0,0,0,0.35),0_0_35px_rgba(201,168,76,0.22)] cursor-default'
                    : 'cursor-pointer hover:shadow-xl opacity-90'
                )}
                style={{
                  transformStyle: 'preserve-3d',
                  pointerEvents: style.pointerEvents,
                }}
              >
                {/* Background Image */}
                <Image
                  src={item.image}
                  alt={`Angelika ${item.title} Collection`}
                  fill
                  className={cn(
                    'object-cover transition-transform duration-700 ease-out',
                    isCenter ? 'scale-105' : 'scale-100 hover:scale-105'
                  )}
                  sizes="(max-width: 640px) 270px, (max-width: 1024px) 330px, 370px"
                  priority={isCenter}
                />

                {/* Dark Cinematic Gradient Overlay */}
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-t transition-opacity duration-500',
                    isCenter
                      ? 'from-black/92 via-black/45 via-50% to-black/10'
                      : 'from-black/85 via-black/40 to-transparent'
                  )}
                />

                {/* Top Badge: Occasion Tag */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium uppercase tracking-[0.16em] bg-black/50 backdrop-blur-md text-[var(--color-gold-light)] border border-[var(--color-gold)]/35 shadow-xs">
                    <span className="text-[var(--color-gold)]">✦</span>
                    {item.tag}
                  </span>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 md:p-6 flex flex-col justify-end z-20">
                  <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-gold)] mb-1 block drop-shadow-sm">
                    {item.subtitle}
                  </span>

                  <h3 className="font-display text-2xl sm:text-3xl font-medium text-white mb-2 leading-tight drop-shadow-md">
                    {item.title}
                  </h3>

                  {/* Description only on Center card or larger screens */}
                  {isCenter && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="text-white/85 text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed font-light"
                    >
                      {item.description}
                    </motion.p>
                  )}

                  {/* CTA Button */}
                  <div className="flex items-center pt-1">
                    <Link
                      href={item.href}
                      onClick={(e) => {
                        if (!isCenter) {
                          e.preventDefault();
                          setActiveIndex(index);
                        }
                      }}
                      className={cn(
                        'inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 group',
                        isCenter
                          ? 'bg-[var(--color-gold)] text-black hover:bg-[var(--color-gold-hover)] shadow-lg hover:shadow-[0_0_20px_rgba(201,168,76,0.45)] hover:scale-104'
                          : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-xs'
                      )}
                    >
                      <span>{item.ctaText || 'Explore Collection'}</span>
                      <svg
                        className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Carousel Pagination & Indicator Controls */}
        <div className="flex flex-col items-center justify-center gap-3 mt-6 sm:mt-8 z-30">
          {/* Dot Indicators */}
          <div className="flex items-center justify-center gap-2">
            {occasions.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to ${item.title}`}
                className={cn(
                  'h-2 rounded-full transition-all duration-500',
                  activeIndex === idx
                    ? 'w-8 bg-[var(--color-gold)] shadow-xs shadow-[var(--color-gold)]/60'
                    : 'w-2 bg-[var(--color-slate)]/30 hover:bg-[var(--color-slate)]/60'
                )}
              />
            ))}
          </div>

          {/* Current Collection Badge */}
          <span className="text-[11px] sm:text-xs font-medium text-[var(--color-slate)] tracking-wider uppercase">
            {activeIndex + 1} of {total} &middot;{' '}
            <span className="text-[var(--color-ink)] font-semibold">
              {occasions[activeIndex]?.title}
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}

export default OccasionCoverflow;
