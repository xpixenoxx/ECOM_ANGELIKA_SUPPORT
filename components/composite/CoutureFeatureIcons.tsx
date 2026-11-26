'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

export type CoutureFeatureIconKey =
  | 'shipping'
  | 'returns'
  | 'styling'
  | 'gift'
  | 'handloom'
  | 'drape'
  | 'atelier'
  | 'authenticity';

export interface CoutureFeatureIconOption {
  key: CoutureFeatureIconKey;
  label: string;
  hint: string;
}

export const COUTURE_FEATURE_ICON_OPTIONS: CoutureFeatureIconOption[] = [
  { key: 'shipping', label: 'Silk Dispatch Parcel', hint: 'Shipping & Pan-India courier' },
  { key: 'returns', label: 'Tailored Exchange Loop', hint: 'Returns & size exchanges' },
  { key: 'styling', label: 'Couture Dress Form', hint: 'Personal styling & bespoke fit' },
  { key: 'gift', label: 'Trousseau Ribbon Box', hint: 'Complimentary gift wrapping' },
  { key: 'drape', label: 'Saree Pallu Wave', hint: 'Flowing silk drape & craftsmanship' },
  { key: 'handloom', label: 'Heritage Loom Weave', hint: 'Artisanal handwoven textiles' },
  { key: 'atelier', label: 'Atelier Shears & Stitch', hint: 'Custom tailoring & alterations' },
  { key: 'authenticity', label: 'Silk Mark Crest', hint: 'Certified authenticity & quality' },
];

const VALID_KEYS = new Set<string>(COUTURE_FEATURE_ICON_OPTIONS.map((o) => o.key));

const LEGACY_EMOJI_MAP: Record<string, CoutureFeatureIconKey> = {
  '🚚': 'shipping',
  '📦': 'shipping',
  '✈️': 'shipping',
  '🔄': 'returns',
  '↩️': 'returns',
  '🔁': 'returns',
  '💬': 'styling',
  '👗': 'styling',
  '👘': 'styling',
  '🥻': 'drape',
  '🎁': 'gift',
  '🎀': 'gift',
  '✨': 'atelier',
  '🧵': 'handloom',
  '🪡': 'atelier',
  '🛡️': 'authenticity',
  '💎': 'authenticity',
  '👑': 'authenticity',
};

const ORDER_FALLBACKS: CoutureFeatureIconKey[] = ['shipping', 'returns', 'styling', 'gift'];

export function isCustomUploadedIconUrl(rawIcon?: string): boolean {
  if (!rawIcon || typeof rawIcon !== 'string') return false;
  const trimmed = rawIcon.trim();
  if (!trimmed) return false;
  // Ignore legacy dev emoji screenshot uploads so bespoke couture SVGs render instead
  if (/icon-Screenshot_2026-11-04/i.test(trimmed)) return false;
  return (
    trimmed.startsWith('/images/') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('data:image/')
  );
}

export function resolveCoutureFeatureIconKey(
  rawIcon?: string,
  title?: string,
  index = 0
): CoutureFeatureIconKey {
  const cleaned = (rawIcon || '').trim();
  if (cleaned) {
    const lower = cleaned.toLowerCase();
    if (VALID_KEYS.has(lower)) {
      return lower as CoutureFeatureIconKey;
    }
    const mappedEmoji = LEGACY_EMOJI_MAP[cleaned];
    if (mappedEmoji) {
      return mappedEmoji;
    }
  }

  const lowerTitle = (title || '').toLowerCase();
  if (/ship|deliver|dispatch|courier|express/.test(lowerTitle)) return 'shipping';
  if (/return|exchange|refund|alter/.test(lowerTitle)) return 'returns';
  if (/styl|vidhya|concierge|consult|bespoke|fit/.test(lowerTitle)) return 'styling';
  if (/gift|wrap|trousseau|box|pack/.test(lowerTitle)) return 'gift';
  if (/loom|hand|weave|artisan|craft/.test(lowerTitle)) return 'handloom';
  if (/drape|saree|silk|pallu/.test(lowerTitle)) return 'drape';
  if (/tailor|stitch|atelier|custom/.test(lowerTitle)) return 'atelier';
  if (/auth|cert|secure|payment|quality|pure/.test(lowerTitle)) return 'authenticity';

  return ORDER_FALLBACKS[index % ORDER_FALLBACKS.length] ?? 'drape';
}

interface CoutureFeatureIconProps {
  icon?: string;
  title?: string;
  index?: number;
  className?: string;
}

export function CoutureFeatureIcon({
  icon,
  title,
  index = 0,
  className,
}: CoutureFeatureIconProps) {
  if (isCustomUploadedIconUrl(icon)) {
    return (
      <img
        src={icon!.trim()}
        alt=""
        aria-hidden="true"
        className={cn('h-6 w-6 object-contain', className)}
      />
    );
  }

  const resolvedKey = resolveCoutureFeatureIconKey(icon, title, index);
  const svgClasses = cn('h-6 w-6 block', className);

  switch (resolvedKey) {
    case 'shipping':
      return (
        <svg
          className={svgClasses}
          viewBox="0 0 28 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Couture garment parcel box with silk ribbon & fluid express breeze */}
          <path d="M5.5 10.5L14 6l8.5 4.5v9.2L14 24l-8.5-4.3v-9.2z" />
          <path d="M5.5 10.5L14 15l8.5-4.5" />
          <path d="M14 15v9" />
          <path d="M9.6 8.3l8.6 4.4" strokeDasharray="1.5 2" />
          <path d="M14 6c-1.1-2-3.4-2.1-3.8-.7-.4 1.3 1.4 1.8 3.8.7z" />
          <path d="M14 6c1.1-2 3.4-2.1 3.8-.7.4 1.3-1.4 1.8-3.8.7z" />
        </svg>
      );

    case 'returns':
      return (
        <svg
          className={svgClasses}
          viewBox="0 0 28 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Graceful double-drape circular exchange motif with couture diamond center */}
          <path d="M21.5 11.5A8 8 0 0 0 7.6 8.8L5.5 11" />
          <path d="M5.5 7.2V11h3.8" />
          <path d="M6.5 16.5a8 8 0 0 0 13.9 2.7l2.1-2.2" />
          <path d="M22.5 20.8V17h-3.8" />
          <path d="M14 11.2L16.8 14 14 16.8 11.2 14 14 11.2z" />
        </svg>
      );

    case 'styling':
      return (
        <svg
          className={svgClasses}
          viewBox="0 0 28 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Haute couture ladies dressmaker form / atelier silhouette */}
          <circle cx="14" cy="4.2" r="1.2" />
          <path d="M14 5.4v1.8" />
          <path d="M10.2 8.2c1.2-.8 2.5-1 3.8-1s2.6.2 3.8 1c.7.5.9 1.4.4 2.2l-1.5 2.4c-.3.5-.3 1.1 0 1.6l2.5 4.6c.4.8-.1 1.7-1 1.7H9.8c-.9 0-1.4-.9-1-1.7l2.5-4.6c.3-.5.3-1.1 0-1.6L9.8 10.4c-.5-.8-.3-1.7.4-2.2z" />
          <path d="M11.3 13.6h5.4" />
          <path d="M14 20.7v4.1" />
          <path d="M10.8 24.8h6.4" />
        </svg>
      );

    case 'gift':
      return (
        <svg
          className={svgClasses}
          viewBox="0 0 28 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Bespoke silk trousseau gift box with artisanal double-loop ribbon */}
          <rect x="4.8" y="10.5" width="18.4" height="3.8" rx="0.8" />
          <path d="M6.4 14.3v8.4c0 .7.6 1.3 1.3 1.3h12.6c.7 0 1.3-.6 1.3-1.3v-8.4" />
          <path d="M14 10.5V24" />
          <path d="M14 10.5C11.4 10.5 8.5 9.2 8.5 7.2c0-1.3 1.1-2.2 2.3-2.2 1.8 0 3.2 2.5 3.2 5.5z" />
          <path d="M14 10.5c2.6 0 5.5-1.3 5.5-3.3 0-1.3-1.1-2.2-2.3-2.2-1.8 0-3.2 2.5-3.2 5.5z" />
        </svg>
      );

    case 'drape':
      return (
        <svg
          className={svgClasses}
          viewBox="0 0 28 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Flowing pleated saree pallu wave motif */}
          <path d="M4.5 18.5c3.5-5.5 6.8-6.5 9.5-2.5s6 3 9.5-6.5" />
          <path d="M4.5 13.5c3.5-5.5 6.8-6.5 9.5-2.5s6 3 9.5-6.5" opacity="0.65" />
          <path d="M5.5 22.5c3.2-4.6 6.2-5.4 8.7-2 2.5 3.4 5.5 2.4 8.8-5.5" opacity="0.45" />
        </svg>
      );

    case 'handloom':
      return (
        <svg
          className={svgClasses}
          viewBox="0 0 28 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Architectural handloom warp/weft diamond motif */}
          <path d="M14 4.5L23.5 14 14 23.5 4.5 14 14 4.5z" />
          <path d="M14 9L19 14 14 19 9 14 14 9z" />
          <path d="M4.5 14h4.5M19 14h4.5M14 4.5V9M14 19v4.5" />
        </svg>
      );

    case 'atelier':
      return (
        <svg
          className={svgClasses}
          viewBox="0 0 28 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Atelier needle, silk thread wave, and couture star */}
          <path d="M21.5 6.5L8.5 19.5" />
          <circle cx="20.4" cy="7.6" r="1.1" />
          <path d="M7.5 14.5c1.5-4.8 6.5-5.5 8.5-2.2 2 3.3 5.5 3.5 6.8-.3" />
          <path d="M6.5 21.5l1.8-1.8" />
        </svg>
      );

    case 'authenticity':
    default:
      return (
        <svg
          className={svgClasses}
          viewBox="0 0 28 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Silk Mark couture crest */}
          <path d="M14 4.5l7.5 3.1v6.2c0 4.9-3.2 8.7-7.5 10.2-4.3-1.5-7.5-5.3-7.5-10.2V7.6L14 4.5z" />
          <path d="M10.8 14.2l2.1 2.1 4.4-4.5" />
        </svg>
      );
  }
}
