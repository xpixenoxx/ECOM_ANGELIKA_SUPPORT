'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

interface CollectionCard {
  id: string;
  title: string;
  href: string;
  image: string;
  ctaText?: string;
  imagePosition?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3 + 1 + 2 + 1 + 1 (8 Collections Total)
// ─────────────────────────────────────────────────────────────────────────────

// Row 1: 3 cards
const ROW_1: CollectionCard[] = [
  {
    id: 'party-wear-dresses',
    title: 'Party Wear Dresses',
    href: '/shop?occasion=party',
    image: '/images/category-showcase/showcase-party-wear-dresses.jpg',
    imagePosition: 'object-center',
  },
  {
    id: 'office-wear-3piece',
    title: 'Office Wear 3-Piece',
    href: '/shop/salwars?occasion=office',
    image: '/images/category-showcase/showcase-office-wear-3piece.jpg',
    imagePosition: 'object-center',
  },
  {
    id: 'coord-sets',
    title: 'Co-ord Sets',
    href: '/shop/kurtis?type=coord-sets',
    image: '/images/category-showcase/showcase-coord-sets.jpg',
    imagePosition: 'object-center',
  },
];

// Row 2: 1 card (Full Width)
const ROW_2: CollectionCard = {
  id: 'lehengas',
  title: 'Lehengas',
  href: '/shop/lehengas',
  image: '/images/category-showcase/showcase-lehengas.jpg',
  imagePosition: 'object-center',
};

// Row 3: 2 cards (Exact match to reference photo)
const ROW_3: CollectionCard[] = [
  {
    id: 'daily-wear-sarees',
    title: 'Daily Wear Sarees',
    href: '/shop/sarees?occasion=casual',
    image: '/images/category-showcase/showcase-daily-wear-sarees.jpg',
    imagePosition: 'object-center',
  },
  {
    id: 'office-wear-sarees',
    title: 'Office Wear Sarees',
    href: '/shop/sarees?occasion=office',
    image: '/images/category-showcase/showcase-office-wear-sarees.jpg',
    imagePosition: 'object-center',
  },
];

// Row 4: 1 card (Full Width)
const ROW_4: CollectionCard = {
  id: 'party-wear-sarees',
  title: 'Party Wear Sarees',
  href: '/shop/sarees?occasion=party',
  image: '/images/category-showcase/showcase-party-wear-sarees.jpg',
  imagePosition: 'object-center',
};

// Row 5: 1 card (Full Width)
const ROW_5: CollectionCard = {
  id: 'womens-frocks',
  title: "Women's Frocks",
  href: '/shop/salwars?type=anarkali',
  image: '/images/category-showcase/showcase-womens-frocks.jpg',
  imagePosition: 'object-center',
};

// Row 1 Target size: 506.93 x 658 each (1520.8 / 3 x 658)
const ROW_1_CARD_STYLE: React.CSSProperties = {
  aspectRatio: '506.93 / 658',
};
const ROW_1_CARD_HEIGHT = 'w-full min-h-[420px] lg:h-[658px] max-h-[658px]';

// Target size: 1520.8 x 658
const FULL_WIDTH_CARD_STYLE: React.CSSProperties = {
  aspectRatio: '1520.8 / 658',
};
const FULL_WIDTH_CARD_HEIGHT = 'w-full min-h-[300px] sm:min-h-[400px] lg:h-[658px] max-h-[658px]';

// Row 3 Target size: 760.4 x 658 each (1520.8 / 2 x 658)
const ROW_3_CARD_STYLE: React.CSSProperties = {
  aspectRatio: '760.4 / 658',
};
const ROW_3_CARD_HEIGHT = 'w-full min-h-[420px] lg:h-[658px] max-h-[658px]';

function HeroCard({
  card,
  heightClass = 'h-[520px] sm:h-[600px] lg:h-[680px]',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  className = '',
  style,
}: {
  card: CollectionCard;
  heightClass?: string;
  sizes?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <Link
      href={card.href}
      style={style}
      className={cn(
        'group relative block w-full overflow-hidden bg-black focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2',
        heightClass,
        className
      )}
    >
      {/* Background Editorial Image */}
      <Image
        src={card.image}
        alt={card.title}
        fill
        sizes={sizes}
        className={cn(
          'w-full h-full object-cover',
          card.imagePosition || 'object-top'
        )}
      />

      {/* Lower gradient scrim for contrast and legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 via-40% to-transparent pointer-events-none" />

      {/* Bottom Content Overlay: Large Serif Uppercase Title + Crisp White Button (Exact Reference Match) */}
      <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 md:p-10 lg:p-12 z-10 flex flex-col items-start">
        <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-normal uppercase tracking-[0.14em] text-white leading-tight mb-4 sm:mb-5 drop-shadow-md">
          {card.title}
        </h3>
        <span className="inline-block bg-white text-[#0D0D0D] px-6 sm:px-8 py-2.5 sm:py-3 text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] uppercase hover:bg-[#C9A84C] hover:text-black transition-colors duration-200 shadow-sm">
          {card.ctaText || 'SHOP NOW'}
        </span>
      </div>
    </Link>
  );
}

interface ExploreCollectionsProps {
  className?: string;
}

export function ExploreCollections({ className = '' }: ExploreCollectionsProps) {
  return (
    <section
      className={cn('relative w-full bg-black overflow-hidden', className)}
      aria-label="Explore Our Collections"
    >
      {/* ── Minimalist Section Header ────────────────────────────────────── */}
      <div className="bg-[#FAF6F0] py-14 sm:py-20 px-4 sm:px-6 lg:px-8 text-center border-b border-[#E5E0D8]">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <div className="flex items-center justify-center gap-3 mb-2.5">
            <span className="h-px w-8 bg-[#C9A84C]" />
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.3em] text-[#C9A84C] uppercase font-sans">
              The Collections
            </span>
            <span className="h-px w-8 bg-[#C9A84C]" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#1A1A1A] tracking-tight mb-3">
            Explore Our Collections
          </h2>
          <p className="text-[#6B5E4E] text-xs sm:text-sm tracking-wide uppercase font-sans">
            Eight Curated Edits for Celebrations, Work and Everyday Elegance
          </p>
        </div>
      </div>

      {/* ── 3 + 1 + 2 + 1 + 1 Luxury Editorial Grid ─────────────────────── */}
      <div className="w-full max-w-[1520.8px] mx-auto flex flex-col gap-0.5 sm:gap-1 bg-black">
        {/* ═════════════════════════════════════════════════════════════════
            ROW 1 (3 items): Party Wear Dresses | Office Wear 3-Piece | Co-ord Sets
            Target Size: 506.93 x 658 each
           ═════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 w-full divide-y md:divide-y-0 md:divide-x divide-black">
          {ROW_1.map((card) => (
            <HeroCard
              key={card.id}
              card={card}
              sizes="(max-width: 768px) 100vw, 33vw"
              style={ROW_1_CARD_STYLE}
              heightClass={ROW_1_CARD_HEIGHT}
            />
          ))}
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            ROW 2 (1 item): Lehengas (Target Size: 1520.8 x 658)
           ═════════════════════════════════════════════════════════════════ */}
        <div className="w-full">
          <HeroCard
            card={ROW_2}
            sizes="100vw"
            style={FULL_WIDTH_CARD_STYLE}
            heightClass={FULL_WIDTH_CARD_HEIGHT}
          />
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            ROW 3 (2 items): Daily Wear Sarees | Office Wear Sarees (Matches Reference Exactly)
            Target Size: 760.4 x 658 each
           ═════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 w-full divide-y md:divide-y-0 md:divide-x divide-black">
          {ROW_3.map((card) => (
            <HeroCard
              key={card.id}
              card={card}
              sizes="(max-width: 768px) 100vw, 50vw"
              style={ROW_3_CARD_STYLE}
              heightClass={ROW_3_CARD_HEIGHT}
            />
          ))}
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            ROW 4 (1 item): Party Wear Sarees (Target Size: 1520.8 x 658)
           ═════════════════════════════════════════════════════════════════ */}
        <div className="w-full">
          <HeroCard
            card={ROW_4}
            sizes="100vw"
            style={FULL_WIDTH_CARD_STYLE}
            heightClass={FULL_WIDTH_CARD_HEIGHT}
          />
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            ROW 5 (1 item): Women's Frocks (Target Size: 1520.8 x 658)
           ═════════════════════════════════════════════════════════════════ */}
        <div className="w-full">
          <HeroCard
            card={ROW_5}
            sizes="100vw"
            style={FULL_WIDTH_CARD_STYLE}
            heightClass={FULL_WIDTH_CARD_HEIGHT}
          />
        </div>
      </div>
    </section>
  );
}

export default ExploreCollections;
