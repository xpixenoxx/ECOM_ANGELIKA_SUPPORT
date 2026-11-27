'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import type { FeatureItem } from '@/lib/actions/site-content-types';
import { CoutureFeatureIcon } from './CoutureFeatureIcons';

export interface CoutureAssurancesStripProps {
  items: FeatureItem[];
  eyebrow?: string;
  showGrid?: boolean;
  showWaves?: boolean;
  className?: string;
  compactPreview?: boolean;
}

const DEFAULT_EYEBROWS = [
  'Complimentary Dispatch',
  'Effortless Care',
  'Vidhya Atelier',
  'Signature Packaging',
];

export function CoutureAssurancesStrip({
  items,
  eyebrow = 'THE ANGELIKA ATELIER PROMISE',
  showGrid = true,
  showWaves = true,
  className,
  compactPreview = false,
}: CoutureAssurancesStripProps) {
  if (!items || items.length === 0) return null;

  const gridColsClass =
    items.length === 1
      ? 'grid-cols-1'
      : items.length === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : items.length === 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <section
      aria-label="Atelier service assurances"
      className={cn(
        'relative overflow-x-clip border-y-[1.5px] border-[#C9B38C] bg-[#F4ECE0]',
        compactPreview ? 'py-7' : 'py-10 sm:py-12 lg:py-14',
        className
      )}
    >
      {/* Layer 1: Architectural Woven Silk Drafting Grid Background */}
      {showGrid && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 couture-loom-grid opacity-95"
        />
      )}

      {/* Layer 2: Soft Radial Champagne Glow to soften grid edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 75% 88% at 50% 50%, rgba(255, 252, 246, 0.42) 0%, rgba(244, 236, 224, 0.18) 58%, rgba(235, 222, 200, 0.55) 100%)',
        }}
      />

      {/* Layer 3: Flowing Ladies-Wear Saree Pallu / Dupatta Pleated Silk Wave Ribbons */}
      {showWaves && (
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 240"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full block"
        >
          <defs>
            <linearGradient id="angelika-silk-wave-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#B89040" stopOpacity="0.06" />
              <stop offset="28%" stopColor="#9E7628" stopOpacity="0.34" />
              <stop offset="55%" stopColor="#B5836E" stopOpacity="0.30" />
              <stop offset="82%" stopColor="#9E7628" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#B89040" stopOpacity="0.06" />
            </linearGradient>
            <linearGradient id="angelika-silk-wave-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#B5836E" stopOpacity="0.05" />
              <stop offset="35%" stopColor="#B89040" stopOpacity="0.26" />
              <stop offset="70%" stopColor="#8F653C" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#B5836E" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="angelika-silk-drape-fill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E6D7BC" stopOpacity="0.42" />
              <stop offset="50%" stopColor="#F2E2D0" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#D9C49D" stopOpacity="0.36" />
            </linearGradient>
          </defs>

          {/* Translucent folded silk drape veil */}
          <path
            d="M-40 175 C 210 55, 420 225, 720 120 C 990 25, 1210 195, 1480 82 L 1480 245 L -40 245 Z"
            fill="url(#angelika-silk-drape-fill)"
          />

          {/* Pleated couture drape contour threads */}
          <path
            d="M-40 165 C 220 42, 430 218, 720 112 C 995 14, 1215 186, 1480 74"
            fill="none"
            stroke="url(#angelika-silk-wave-1)"
            strokeWidth="1.5"
          />
          <path
            d="M-40 182 C 235 66, 445 232, 735 128 C 1010 34, 1225 198, 1480 94"
            fill="none"
            stroke="url(#angelika-silk-wave-2)"
            strokeWidth="1.25"
          />
          <path
            d="M-40 148 C 205 24, 415 202, 705 96 C 980 -2, 1200 170, 1480 56"
            fill="none"
            stroke="url(#angelika-silk-wave-2)"
            strokeWidth="1.05"
            strokeDasharray="4 6"
          />
          <path
            d="M-40 72 C 260 154, 520 12, 810 118 C 1075 215, 1275 88, 1480 146"
            fill="none"
            stroke="url(#angelika-silk-wave-1)"
            strokeWidth="1.15"
            opacity="0.82"
          />
        </svg>
      )}

      {/* Main Content Container */}
      <div className={cn('relative z-10 max-w-[1440px] mx-auto', compactPreview ? 'px-4' : 'px-5 sm:px-8 lg:px-12')}>
        {/* Refined Atelier Strip Header */}
        {eyebrow && (
          <div className={cn('flex items-center justify-center gap-3.5 sm:gap-4', compactPreview ? 'mb-5' : 'mb-7 sm:mb-8')}>
            <span className="h-[1.5px] w-10 sm:w-20 bg-gradient-to-r from-transparent via-[#B8922E] to-[#74590E]" aria-hidden="true" />
            <span className="text-[9px] text-[#9E7820]" aria-hidden="true">◆</span>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.26em] text-[#4E3808]">
              {eyebrow}
            </span>
            <span className="text-[9px] text-[#9E7820]" aria-hidden="true">◆</span>
            <span className="h-[1.5px] w-10 sm:w-20 bg-gradient-to-l from-transparent via-[#B8922E] to-[#74590E]" aria-hidden="true" />
          </div>
        )}

        {/* Architectural High-Contrast Couture Grid */}
        <div
          className={cn(
            'grid border-[1.5px] border-[#BDA478] bg-[#FFFDF9] shadow-[0_14px_38px_rgba(24,18,10,0.08)] divide-y sm:divide-y-0 lg:divide-x divide-[#C9B38C]',
            gridColsClass
          )}
        >
          {items.map((item, idx) => {
            const description = item.desc || item.description || '';
            const microLabel =
              item.eyebrow?.trim() || DEFAULT_EYEBROWS[idx % DEFAULT_EYEBROWS.length];
            const indexLabel = String(idx + 1).padStart(2, '0');
            const href = item.href?.trim();
            const isExternal = Boolean(href && /^https?:\/\//i.test(href));

            const innerContent = (
              <div
                className={cn(
                  'group relative h-full flex flex-col justify-between transition-all duration-300 hover:bg-[#FAF4E8]',
                  compactPreview ? 'p-4' : 'p-6 sm:p-7'
                )}
              >
                {/* Crisp top gold reveal accent bar */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-[#C9A84C] via-[#8E6914] to-[#C9A84C] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />

                {/* Architectural corner stitch tick (top-right) */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3.5 top-3.5 text-[12px] leading-none text-[#9E7B2C] font-semibold select-none"
                >
                  +
                </span>

                {/* Header Row: Editorial Index & Crisp Micro-Eyebrow */}
                <div className="flex items-center justify-between gap-2 mb-5 pb-3 border-b border-[#E5D7BF]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="font-display italic text-[17px] font-bold text-[#7A5B10] leading-none"
                    >
                      {indexLabel}
                    </span>
                    <span className="h-[1.5px] w-4 bg-[#B89855] shrink-0" aria-hidden="true" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#433A30] truncate">
                      {microLabel}
                    </span>
                  </div>
                </div>

                {/* Main Row: Bespoke Couture Emblem + Bold Editorial Typography */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center border-[1.5px] border-[#B69B6A] bg-[#F7F0E2] text-[#5C4308] shadow-[inset_0_0_0_2px_#FFFDF9] transition-all duration-300 group-hover:border-[#8C6A16] group-hover:bg-[#14110E] group-hover:text-[#ECCD77] group-hover:shadow-none">
                    {/* Inner architectural frame hairline */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-[3px] border border-[#D4BE92] group-hover:border-[#C9A84C]/45 transition-colors duration-300"
                    />
                    <CoutureFeatureIcon
                      icon={item.icon}
                      title={item.title}
                      index={idx}
                      className="h-[23px] w-[23px] relative z-10"
                    />
                  </div>

                  <div className="min-w-0 flex-1 flex flex-col">
                    <h3 className="font-display text-[21px] sm:text-[22px] font-bold leading-[1.18] tracking-[0.005em] text-[#11100E] transition-colors duration-200 group-hover:text-[#6B4E08]">
                      {item.title}
                    </h3>
                    {description && (
                      <p className="mt-2 text-[13.5px] font-medium leading-[1.55] text-[#2F2A24]">
                        {description}
                      </p>
                    )}
                    {href && (
                      <span className="mt-3.5 inline-flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-[0.16em] text-[#6B4E08] transition-all duration-200 group-hover:text-[#11100E] group-hover:gap-2">
                        <span className="border-b border-[#C9A84C]/70 pb-0.5 group-hover:border-[#11100E]">Explore</span>
                        <span aria-hidden="true">→</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );

            if (href) {
              return isExternal ? (
                <a
                  key={`${item.title}-${idx}`}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#74590E]"
                >
                  {innerContent}
                </a>
              ) : (
                <Link
                  key={`${item.title}-${idx}`}
                  href={href}
                  className="block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#74590E]"
                >
                  {innerContent}
                </Link>
              );
            }

            return (
              <div key={`${item.title}-${idx}`} className="h-full">
                {innerContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
