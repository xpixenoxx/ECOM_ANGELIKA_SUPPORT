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
        'relative overflow-x-clip border-y border-[#E5DBC9] bg-[#FAF6EE]',
        compactPreview ? 'py-7' : 'py-10 sm:py-12 lg:py-14',
        className
      )}
    >
      {/* Layer 1: Architectural Woven Silk Drafting Grid Background */}
      {showGrid && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 couture-loom-grid opacity-80"
        />
      )}

      {/* Layer 2: Soft Radial Champagne Glow to soften grid edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 72% 85% at 50% 50%, rgba(255, 252, 246, 0.55) 0%, rgba(246, 239, 226, 0.25) 60%, rgba(242, 233, 217, 0.6) 100%)',
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
              <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.04" />
              <stop offset="28%" stopColor="#B89040" stopOpacity="0.24" />
              <stop offset="55%" stopColor="#C8A08E" stopOpacity="0.22" />
              <stop offset="82%" stopColor="#B89040" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#C9A84C" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="angelika-silk-wave-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C8A08E" stopOpacity="0.03" />
              <stop offset="35%" stopColor="#C9A84C" stopOpacity="0.18" />
              <stop offset="70%" stopColor="#A67C52" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#C8A08E" stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id="angelika-silk-drape-fill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E9DEC8" stopOpacity="0.34" />
              <stop offset="50%" stopColor="#F4E7DA" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#DFCFAF" stopOpacity="0.28" />
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
            strokeWidth="1.25"
          />
          <path
            d="M-40 182 C 235 66, 445 232, 735 128 C 1010 34, 1225 198, 1480 94"
            fill="none"
            stroke="url(#angelika-silk-wave-2)"
            strokeWidth="1"
          />
          <path
            d="M-40 148 C 205 24, 415 202, 705 96 C 980 -2, 1200 170, 1480 56"
            fill="none"
            stroke="url(#angelika-silk-wave-2)"
            strokeWidth="0.85"
            strokeDasharray="4 6"
          />
          <path
            d="M-40 72 C 260 154, 520 12, 810 118 C 1075 215, 1275 88, 1480 146"
            fill="none"
            stroke="url(#angelika-silk-wave-1)"
            strokeWidth="0.9"
            opacity="0.7"
          />
        </svg>
      )}

      {/* Main Content Container */}
      <div className={cn('relative z-10 max-w-[1440px] mx-auto', compactPreview ? 'px-4' : 'px-5 sm:px-8 lg:px-12')}>
        {/* Refined Atelier Strip Header */}
        {eyebrow && (
          <div className={cn('flex items-center justify-center gap-4', compactPreview ? 'mb-5' : 'mb-7 sm:mb-8')}>
            <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#C9A84C]/65" aria-hidden="true" />
            <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.28em] text-[#74590E]">
              {eyebrow}
            </span>
            <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#C9A84C]/65" aria-hidden="true" />
          </div>
        )}

        {/* Architectural Hairline Couture Grid */}
        <div
          className={cn(
            'grid border border-[#E2D6C1] bg-[#FDFBF7]/75 backdrop-blur-[2px] divide-y sm:divide-y-0 lg:divide-x divide-[#E2D6C1]',
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
                  'group relative h-full flex flex-col justify-between transition-colors duration-300 hover:bg-[#FFFFFF]/85',
                  compactPreview ? 'p-4' : 'p-6 sm:p-7'
                )}
              >
                {/* Delicate top gold reveal hairline */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />

                {/* Architectural corner stitch tick (top-right) */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-3 text-[10px] leading-none text-[#C9A84C]/45 font-light select-none"
                >
                  +
                </span>

                {/* Header Row: Editorial Index & Micro-Eyebrow */}
                <div className="flex items-center justify-between gap-2 mb-5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="font-serif italic text-[14px] text-[#8E6F24] leading-none"
                      style={{ fontFamily: 'var(--font-cormorant)' }}
                    >
                      {indexLabel}
                    </span>
                    <span className="h-px w-4 bg-[#D8C9AE] shrink-0" aria-hidden="true" />
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[#7A7164] truncate">
                      {microLabel}
                    </span>
                  </div>
                </div>

                {/* Main Row: Bespoke Couture Emblem + Editorial Typography */}
                <div className="flex items-start gap-4">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center border border-[#DCCEB5] bg-[#FAF6EE] text-[#74590E] transition-all duration-300 group-hover:border-[#C9A84C] group-hover:bg-[#141414] group-hover:text-[#E8D08B]">
                    {/* Inner architectural frame hairline */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-[3px] border border-[#E6DAC4]/80 group-hover:border-[#C9A84C]/30 transition-colors duration-300"
                    />
                    <CoutureFeatureIcon
                      icon={item.icon}
                      title={item.title}
                      index={idx}
                      className="h-[22px] w-[22px] relative z-10"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3
                      className="text-[19px] sm:text-[20px] font-medium leading-[1.2] tracking-[0.01em] text-[#141414] transition-colors duration-200 group-hover:text-[#74590E]"
                      style={{ fontFamily: 'var(--font-cormorant)' }}
                    >
                      {item.title}
                    </h3>
                    {description && (
                      <p className="mt-1.5 text-[12.5px] leading-[1.55] text-[#5B554D]">
                        {description}
                      </p>
                    )}
                    {href && (
                      <span className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#74590E] opacity-80 transition-all duration-200 group-hover:opacity-100 group-hover:gap-1.5">
                        <span>Explore</span>
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
