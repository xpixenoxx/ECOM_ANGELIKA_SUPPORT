'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface CardHotspot {
  id: string;
  name: string;
  href: string;
  description: string;
  type: 'path' | 'rect';
  d?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rx?: number;
}

const CARD_HOTSPOTS: CardHotspot[] = [
  {
    id: 'explore-all',
    name: 'Explore All Collections',
    href: '/shop',
    description: 'Explore all 8 curated ethnic collections',
    type: 'rect',
    x: 42.5,
    y: 289,
    width: 153.5,
    height: 31,
    rx: 3,
  },
  {
    id: 'party-wear-dresses',
    name: 'Party Wear Dresses',
    href: '/shop?occasion=party',
    description: 'Contemporary evening & party dresses',
    type: 'path',
    d: 'M 256 253.5 L 256 110 A 111.5 108 0 0 1 479 110 L 479 231.5 L 350 231.5 C 300 231.5, 270 242, 256 253.5 Z',
  },
  {
    id: 'office-wear-3piece',
    name: 'Office Wear 3-Piece Sets',
    href: '/shop/salwars?occasion=office',
    description: 'Sophisticated formal 3-piece ethnic sets',
    type: 'path',
    d: 'M 483 232 L 483 110 A 112.5 108 0 0 1 708 110 C 706 145 680 185 650 232 Z',
  },
  {
    id: 'coord-sets',
    name: 'Co-ord Sets',
    href: '/shop/kurtis?type=coord-sets',
    description: 'Modern coordinated jacket & trouser sets',
    type: 'path',
    d: 'M 783 235 C 780 200, 774 150, 776 110 A 116.5 106 0 0 1 1009 110 L 1009 302 C 990 280, 930 240, 880 235 L 783 235 Z',
  },
  {
    id: 'lehengas',
    name: 'Lehengas',
    href: '/shop/lehengas',
    description: 'Royal bridal & celebratory zardozi lehengas',
    type: 'path',
    d: 'M 330 234.5 L 742 234.5 C 760 285, 772 365, 855 388.5 L 171 388.5 C 220 310, 230 255, 330 234.5 Z',
  },
  {
    id: 'daily-wear-sarees',
    name: 'Daily Wear Sarees',
    href: '/shop/sarees?occasion=casual',
    description: 'Lightweight everyday organza & cotton sarees',
    type: 'path',
    d: 'M 94 559 C 114 470, 147 416, 215 391 L 356.5 391 C 345 420, 328 460, 326.5 499 L 326.5 559 Z',
  },
  {
    id: 'office-wear-sarees',
    name: 'Office Wear Sarees',
    href: '/shop/sarees?occasion=office',
    description: 'Elegant formal workwear drapes',
    type: 'path',
    d: 'M 330.5 559 L 330.5 499 C 332 460, 349 420, 370.5 391 L 550.5 391 L 550.5 559 Z',
  },
  {
    id: 'party-wear-sarees',
    name: 'Party Wear Sarees',
    href: '/shop/sarees?occasion=party',
    description: 'Rich royal silk banarasi & occasion sarees',
    type: 'path',
    d: 'M 556 559 L 556 450 A 70 59 0 0 1 626 391 L 780 391 L 780 559 Z',
  },
  {
    id: 'womens-frocks',
    name: "Women's Frocks",
    href: '/shop/salwars?type=anarkali',
    description: 'Flared feminine frock dresses & anarkalis',
    type: 'path',
    d: 'M 784.5 559 L 784.5 450 A 70.5 59 0 0 1 855 391 L 997 391 A 12 12 0 0 1 1009 403 L 1009 559 Z',
  },
];

interface LookByOccasionProps {
  className?: string;
}

export function LookByOccasion({ className = '' }: LookByOccasionProps) {
  const router = useRouter();
  // View mode: 'translucent' (Default: translucent smoked black) | 'design' (Clean unmasked) | 'wireframe' | 'solid'
  const [viewMode, setViewMode] = useState<'translucent' | 'design' | 'wireframe' | 'solid'>('translucent');

  const getFillColor = () => {
    switch (viewMode) {
      case 'translucent':
        return 'rgba(0, 0, 0, 0.45)';
      case 'solid':
        return '#000000';
      case 'wireframe':
        return 'rgba(0, 0, 0, 0.04)';
      case 'design':
      default:
        return 'transparent';
    }
  };

  const getStrokeColor = () => {
    switch (viewMode) {
      case 'translucent':
        return 'none';
      case 'wireframe':
        return '#C49A45';
      case 'solid':
        return 'none';
      case 'design':
      default:
        return 'none';
    }
  };

  const getStrokeWidth = () => {
    switch (viewMode) {
      case 'translucent':
        return 0;
      case 'wireframe':
        return 2;
      default:
        return 0;
    }
  };

  return (
    <section
      className={cn('relative w-full bg-[#F3EEE8] overflow-hidden py-16 px-0 m-0', className)}
      style={{ padding: '64px 0px' }}
      aria-label="Look by Occasion - Eight Curated Collections"
    >
      {/* View Switcher Controls */}
      <div className="absolute top-3 right-6 z-40 hidden sm:flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] text-white shadow-md border border-white/20">
        <span className="text-[#C49A45] font-semibold text-[10px] uppercase tracking-wider pr-1">Overlay:</span>
        <button
          type="button"
          onClick={() => setViewMode('translucent')}
          className={cn(
            'px-2.5 py-0.5 rounded-full transition-all duration-200 font-medium',
            viewMode === 'translucent'
              ? 'bg-[#C49A45] text-black font-semibold shadow-xs'
              : 'text-white/80 hover:text-white'
          )}
        >
          Translucent Black
        </button>
        <button
          type="button"
          onClick={() => setViewMode('design')}
          className={cn(
            'px-2.5 py-0.5 rounded-full transition-all duration-200 font-medium',
            viewMode === 'design'
              ? 'bg-white text-black font-semibold shadow-xs'
              : 'text-white/80 hover:text-white'
          )}
        >
          Clean (No Tint)
        </button>
        <button
          type="button"
          onClick={() => setViewMode('wireframe')}
          className={cn(
            'px-2.5 py-0.5 rounded-full transition-all duration-200 font-medium',
            viewMode === 'wireframe'
              ? 'bg-white text-black font-semibold shadow-xs'
              : 'text-white/80 hover:text-white'
          )}
        >
          Wireframe
        </button>
        <button
          type="button"
          onClick={() => setViewMode('solid')}
          className={cn(
            'px-2.5 py-0.5 rounded-full transition-all duration-200 font-medium',
            viewMode === 'solid'
              ? 'bg-white text-black font-semibold shadow-xs'
              : 'text-white/80 hover:text-white'
          )}
        >
          Solid Black
        </button>
      </div>

      {/* Main Stage: Full-Width 16:9 Composition With 2K Visual & Translucent Card Overlay */}
      <div className="relative w-full aspect-[1024/576] overflow-hidden bg-[#F3EEE8] select-none p-0 m-0">
        {/* Master Lossless Editorial Composition Calibrated to #F3EEE8 */}
        <Image
          src="/images/category-showcase/look-by-occasion-master-2k.png"
          alt="Look by Occasion - Eight Curated Collections"
          fill
          priority
          className="object-cover w-full h-full pointer-events-none"
          sizes="100vw"
        />

        {/* Translucent Black Card Overlay: Translucent smoked tint showing the models and original typography */}
        <svg
          className="absolute inset-0 w-full h-full z-20 pointer-events-auto"
          viewBox="0 0 1024 576"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {CARD_HOTSPOTS.map((card) => {
            const fill = getFillColor();
            const stroke = getStrokeColor();
            const strokeWidth = getStrokeWidth();

            return (
              <g
                key={card.id}
                role="link"
                tabIndex={0}
                aria-label={`Shop ${card.name} - ${card.description}`}
                className="cursor-pointer focus:outline-hidden"
                onClick={() => router.push(card.href)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(card.href);
                  }
                }}
              >
                {/* Geometric Card Boundary */}
                {card.type === 'rect' ? (
                  <rect
                    x={card.x}
                    y={card.y}
                    width={card.width}
                    height={card.height}
                    rx={card.rx || 0}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                  />
                ) : (
                  <path
                    d={card.d}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Semantic Screen-Reader Navigation */}
      <div className="sr-only">
        <h2>Look by Occasion</h2>
        <p>Eight curated collections for work, celebrations and everyday elegance.</p>
        <ul>
          {CARD_HOTSPOTS.map((c) => (
            <li key={c.id}>
              <Link href={c.href}>
                {c.name}: {c.description}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default LookByOccasion;
