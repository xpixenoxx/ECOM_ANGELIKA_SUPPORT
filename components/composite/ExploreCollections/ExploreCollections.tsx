'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';
import type { CategoriesContent, CategoryCollectionItem } from '@/lib/actions/site-content-types';

export interface CollectionCard {
  id: string;
  title: string;
  href: string;
  image: string;
  ctaText?: string;
  imagePosition?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3 + 1 + 2 + 1 + 1 (8 Collections Total) - Default Fallbacks
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_COLLECTIONS: CategoryCollectionItem[] = [
  {
    id: 'party-wear-dresses',
    title: 'Party Wear Dresses',
    href: '/shop?occasion=party',
    image: '/images/category-showcase/showcase-party-wear-dresses.jpg',
    imagePosition: 'object-center',
    row: 1,
  },
  {
    id: 'office-wear-3piece',
    title: 'Office Wear 3-Piece',
    href: '/shop/salwars?occasion=office',
    image: '/images/category-showcase/showcase-office-wear-3piece.jpg',
    imagePosition: 'object-center',
    row: 1,
  },
  {
    id: 'coord-sets',
    title: 'Co-ord Sets',
    href: '/shop/kurtis?type=coord-sets',
    image: '/images/category-showcase/showcase-coord-sets.jpg',
    imagePosition: 'object-center',
    row: 1,
  },
  {
    id: 'lehengas',
    title: 'Lehengas',
    href: '/shop/lehengas',
    image: '/images/category-showcase/showcase-lehengas.jpg',
    imagePosition: 'object-center',
    row: 2,
  },
  {
    id: 'daily-wear-sarees',
    title: 'Daily Wear Sarees',
    href: '/shop/sarees?occasion=casual',
    image: '/images/category-showcase/showcase-daily-wear-sarees.jpg',
    imagePosition: 'object-center',
    row: 3,
  },
  {
    id: 'office-wear-sarees',
    title: 'Office Wear Sarees',
    href: '/shop/sarees?occasion=office',
    image: '/images/category-showcase/showcase-office-wear-sarees.jpg',
    imagePosition: 'object-center',
    row: 3,
  },
  {
    id: 'party-wear-sarees',
    title: 'Party Wear Sarees',
    href: '/shop/sarees?occasion=party',
    image: '/images/category-showcase/showcase-party-wear-sarees.jpg',
    imagePosition: 'object-center',
    row: 4,
  },
  {
    id: 'womens-frocks',
    title: "Women's Frocks",
    href: '/shop/salwars?type=anarkali',
    image: '/images/category-showcase/showcase-womens-frocks.jpg',
    imagePosition: 'object-center',
    row: 5,
  },
];

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
        'group relative block w-full overflow-hidden bg-[#FAF6F0] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2',
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

      {/* Bottom Content Overlay: Large Poppins Sans-Serif Uppercase Title (No CTA) */}
      <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 md:p-10 lg:p-12 z-10 flex flex-col items-start pointer-events-none">
        <h3
          style={{ fontFamily: "'Poppins', sans-serif" }}
          className="font-poppins font-medium text-2xl sm:text-3xl md:text-4xl lg:text-[38px] uppercase tracking-[0.14em] text-white leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]"
        >
          {card.title}
        </h3>
      </div>
    </Link>
  );
}

interface ExploreCollectionsProps {
  categoriesContent?: CategoriesContent;
  className?: string;
  style?: React.CSSProperties;
}

export function ExploreCollections({
  categoriesContent,
  className = '',
  style,
}: ExploreCollectionsProps) {
  // Use items from categoriesContent if available, falling back to DEFAULT_COLLECTIONS
  const rawItems = categoriesContent?.items && categoriesContent.items.length > 0
    ? categoriesContent.items
    : DEFAULT_COLLECTIONS;

  // Build 8-element list by merging with defaults
  const items: CategoryCollectionItem[] = Array.from({ length: 8 }, (_, idx) => {
    const raw = rawItems[idx];
    const fallback = DEFAULT_COLLECTIONS[idx] || DEFAULT_COLLECTIONS[0]!;
    return {
      id: raw?.id || fallback.id || `card-${idx + 1}`,
      title: raw?.title || fallback.title,
      subtitle: raw?.subtitle || fallback.subtitle,
      href: raw?.href || fallback.href,
      image: raw?.image || fallback.image,
      cta: raw?.cta || fallback.cta,
      imagePosition: raw?.imagePosition || fallback.imagePosition || 'object-center',
      row: raw?.row || fallback.row,
    };
  });

  const row1 = items.slice(0, 3).map((item, idx) => ({
    id: item.id || `row1-${idx}`,
    title: item.title,
    href: item.href,
    image: item.image,
    imagePosition: item.imagePosition || 'object-center',
  }));

  const row2: CollectionCard = {
    id: items[3]?.id || 'lehengas',
    title: items[3]?.title || 'Lehengas',
    href: items[3]?.href || '/shop/lehengas',
    image: items[3]?.image || '/images/category-showcase/showcase-lehengas.jpg',
    imagePosition: items[3]?.imagePosition || 'object-center',
  };

  const row3 = items.slice(4, 6).map((item, idx) => ({
    id: item.id || `row3-${idx}`,
    title: item.title,
    href: item.href,
    image: item.image,
    imagePosition: item.imagePosition || 'object-center',
  }));

  const row4: CollectionCard = {
    id: items[6]?.id || 'party-wear-sarees',
    title: items[6]?.title || 'Party Wear Sarees',
    href: items[6]?.href || '/shop/sarees?occasion=party',
    image: items[6]?.image || '/images/category-showcase/showcase-party-wear-sarees.jpg',
    imagePosition: items[6]?.imagePosition || 'object-center',
  };

  const row5: CollectionCard = {
    id: items[7]?.id || 'womens-frocks',
    title: items[7]?.title || "Women's Frocks",
    href: items[7]?.href || '/shop/salwars?type=anarkali',
    image: items[7]?.image || '/images/category-showcase/showcase-womens-frocks.jpg',
    imagePosition: items[7]?.imagePosition || 'object-center',
  };

  return (
    <section
      className={cn('relative w-full bg-[#FAF6F0] overflow-hidden mt-[10px]', className)}
      style={{ marginTop: '10px', ...style }}
      aria-label="Explore Our Collections"
    >
      {/* ── 3 + 1 + 2 + 1 + 1 Luxury Editorial Grid ─────────────────────── */}
      <div className="w-full max-w-[1520.8px] mx-auto flex flex-col gap-0.5 sm:gap-1 bg-[#FAF6F0]">
        {/* ═════════════════════════════════════════════════════════════════
            ROW 1 (3 items): Party Wear Dresses | Office Wear 3-Piece | Co-ord Sets
            Target Size: 506.93 x 658 each
           ═════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 w-full divide-y md:divide-y-0 md:divide-x divide-[#E5E0D8]">
          {row1.map((card) => (
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
            card={row2}
            sizes="100vw"
            style={FULL_WIDTH_CARD_STYLE}
            heightClass={FULL_WIDTH_CARD_HEIGHT}
          />
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            ROW 3 (2 items): Daily Wear Sarees | Office Wear Sarees (Matches Reference Exactly)
            Target Size: 760.4 x 658 each
           ═════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 w-full divide-y md:divide-y-0 md:divide-x divide-[#E5E0D8]">
          {row3.map((card) => (
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
            card={row4}
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
            card={row5}
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
