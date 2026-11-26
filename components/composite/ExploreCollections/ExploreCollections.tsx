'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';
import type { CategoriesContent, CategoryCollectionItem } from '@/lib/actions/site-content-types';
import type { Database } from '@/types/database';

type StorefrontCategoryRow = Database['public']['Tables']['categories']['Row'];

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
  storeCategories?: StorefrontCategoryRow[];
  className?: string;
  style?: React.CSSProperties;
}

export function ExploreCollections({
  categoriesContent,
  storeCategories = [],
  className = '',
  style,
}: ExploreCollectionsProps) {
  const catBySlug = new Map(
    storeCategories.map((cat) => [cat.slug.toLowerCase(), cat])
  );

  // Check if a collection link points to a category that was hidden in Product Categories
  const isCardCategoryHidden = (href?: string) => {
    if (!href) return false;
    const match = href.match(/^\/shop\/([^/?#]+)$/);
    if (!match?.[1]) return false;
    const cat = catBySlug.get(match[1].toLowerCase());
    return Boolean(cat && cat.is_active === false);
  };

  // Use items from categoriesContent if available, falling back to DEFAULT_COLLECTIONS
  const rawItems = categoriesContent?.items && categoriesContent.items.length > 0
    ? categoriesContent.items
    : DEFAULT_COLLECTIONS;

  // Build 8-element list by merging with defaults and overlaying exact DB category updates
  const items: CategoryCollectionItem[] = Array.from({ length: 8 }, (_, idx) => {
    const raw = rawItems[idx];
    const fallback = DEFAULT_COLLECTIONS[idx] || DEFAULT_COLLECTIONS[0]!;
    const resolvedHref = raw?.href || fallback.href;
    const exactMatch = resolvedHref?.match(/^\/shop\/([^/?#]+)$/);
    const dbCat = exactMatch?.[1] ? catBySlug.get(exactMatch[1].toLowerCase()) : undefined;

    return {
      id: raw?.id || fallback.id || `card-${idx + 1}`,
      title: dbCat?.name || raw?.title || fallback.title,
      subtitle: dbCat?.description || raw?.subtitle || fallback.subtitle,
      href: resolvedHref,
      image: raw?.image || dbCat?.image_url || fallback.image,
      cta: raw?.cta || fallback.cta,
      imagePosition: raw?.imagePosition || fallback.imagePosition || 'object-center',
      row: raw?.row || fallback.row,
    };
  });

  const row1 = items
    .slice(0, 3)
    .filter((item) => !isCardCategoryHidden(item.href))
    .map((item, idx) => ({
      id: item.id || `row1-${idx}`,
      title: item.title,
      href: item.href,
      image: item.image,
      imagePosition: item.imagePosition || 'object-center',
    }));

  const row2Item = items[3];
  const row2: CollectionCard | null =
    row2Item && !isCardCategoryHidden(row2Item.href)
      ? {
          id: row2Item.id || 'lehengas',
          title: row2Item.title || 'Lehengas',
          href: row2Item.href || '/shop/lehengas',
          image: row2Item.image || '/images/category-showcase/showcase-lehengas.jpg',
          imagePosition: row2Item.imagePosition || 'object-center',
        }
      : null;

  const row3 = items
    .slice(4, 6)
    .filter((item) => !isCardCategoryHidden(item.href))
    .map((item, idx) => ({
      id: item.id || `row3-${idx}`,
      title: item.title,
      href: item.href,
      image: item.image,
      imagePosition: item.imagePosition || 'object-center',
    }));

  const row4Item = items[6];
  const row4: CollectionCard | null =
    row4Item && !isCardCategoryHidden(row4Item.href)
      ? {
          id: row4Item.id || 'party-wear-sarees',
          title: row4Item.title || 'Party Wear Sarees',
          href: row4Item.href || '/shop/sarees?occasion=party',
          image: row4Item.image || '/images/category-showcase/showcase-party-wear-sarees.jpg',
          imagePosition: row4Item.imagePosition || 'object-center',
        }
      : null;

  const row5Item = items[7];
  const row5: CollectionCard | null =
    row5Item && !isCardCategoryHidden(row5Item.href)
      ? {
          id: row5Item.id || 'womens-frocks',
          title: row5Item.title || "Women's Frocks",
          href: row5Item.href || '/shop/salwars?type=anarkali',
          image: row5Item.image || '/images/category-showcase/showcase-womens-frocks.jpg',
          imagePosition: row5Item.imagePosition || 'object-center',
        }
      : null;

  return (
    <section
      className={cn('relative w-full bg-[#FAF6F0] overflow-hidden mt-[10px]', className)}
      style={{ marginTop: '10px', ...style }}
      aria-label="Explore Our Collections"
    >
      {/* ── 3 + 1 + 2 + 1 + 1 Luxury Editorial Grid ─────────────────────── */}
      <div className="w-full max-w-[1520.8px] mx-auto flex flex-col gap-0.5 sm:gap-1 bg-[#FAF6F0]">
        {/* ROW 1 */}
        {row1.length > 0 && (
          <div className={cn('grid grid-cols-1 gap-0 w-full divide-y md:divide-y-0 md:divide-x divide-[#E5E0D8]', row1.length === 3 ? 'md:grid-cols-3' : row1.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-1')}>
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
        )}

        {/* ROW 2 */}
        {row2 && (
          <div className="w-full">
            <HeroCard
              card={row2}
              sizes="100vw"
              style={FULL_WIDTH_CARD_STYLE}
              heightClass={FULL_WIDTH_CARD_HEIGHT}
            />
          </div>
        )}

        {/* ROW 3 */}
        {row3.length > 0 && (
          <div className={cn('grid grid-cols-1 gap-0 w-full divide-y md:divide-y-0 md:divide-x divide-[#E5E0D8]', row3.length >= 2 ? 'md:grid-cols-2' : 'md:grid-cols-1')}>
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
        )}

        {/* ROW 4 */}
        {row4 && (
          <div className="w-full">
            <HeroCard
              card={row4}
              sizes="100vw"
              style={FULL_WIDTH_CARD_STYLE}
              heightClass={FULL_WIDTH_CARD_HEIGHT}
            />
          </div>
        )}

        {/* ROW 5 */}
        {row5 && (
          <div className="w-full">
            <HeroCard
              card={row5}
              sizes="100vw"
              style={FULL_WIDTH_CARD_STYLE}
              heightClass={FULL_WIDTH_CARD_HEIGHT}
            />
          </div>
        )}
      </div>
    </section>
  );
}

export default ExploreCollections;
