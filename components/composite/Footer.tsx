'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { PAYMENT_BADGE_ORDER, PaymentCardBadge } from '@/components/composite/FooterPaymentBadges';
import type {
  FooterContent,
  FooterColumnItem,
  FooterLinkItem,
  FooterPaymentOptions,
  FooterSocialItem,
} from '@/lib/actions/site-content-types';

export interface FooterProps {
  className?: string;
  content?: FooterContent;
  contactEmail?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  siteName?: string;
  tagline?: string;
  socialInstagram?: string;
  socialFacebook?: string;
  socialWhatsapp?: string;
  socialYoutube?: string;
}

export const BOUTIQUE_DEFAULT_COLUMNS: FooterColumnItem[] = [
  {
    id: 'col-care',
    title: 'Customer Care',
    links: [
      { label: 'Delivery', href: '/shipping' },
      { label: 'Returns & Exchanges', href: '/returns' },
      { label: 'Track Your Order', href: '/track-order' },
      { label: 'Size Finder', href: '/size-finder' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  {
    id: 'col-about',
    title: 'About Angelika',
    links: [
      { label: 'Our Story', href: '/about' },
      { label: 'Meet Designer Vidhya', href: '/about/vidhya' },
      { label: 'Angelika on Instagram', href: 'https://instagram.com/angelikafashions', external: true },
      { label: 'The Edit', href: '/vidhyas-picks' },
      { label: 'New Arrivals', href: '/new-arrivals' },
    ],
  },
];

export const BOUTIQUE_DEFAULT_ABOUT_TEXT =
  'Angelika Fashions is an independent Indian luxury couture house, proudly celebrating heritage handlooms and contemporary silhouettes. Founded by designer Vidhya, every drape is crafted with timeless artistry for the modern woman.';

export const BOUTIQUE_DEFAULT_BOTTOM_LINKS: FooterLinkItem[] = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Shipping Policy', href: '/shipping' },
  { label: 'Refund Policy', href: '/returns' },
  { label: 'Cookies', href: '/cookies' },
  { label: 'Accessibility', href: '/accessibility' },
];

export const BOUTIQUE_DEFAULT_REGIONS: string[] = [
  'India (INR ₹)',
  'United Arab Emirates (AED د.إ)',
  'United Kingdom (GBP £)',
  'United States (USD $)',
];

const DEFAULT_SOCIAL_LINKS: FooterSocialItem[] = [
  {
    id: 'social-fb',
    platform: 'facebook',
    icon: 'facebook',
    href: 'https://facebook.com/angelikafashions',
    label: 'Facebook',
    handle: 'Angelika Fashions',
    enabled: true,
  },
  {
    id: 'social-ig',
    platform: 'instagram',
    icon: 'instagram',
    href: 'https://instagram.com/angelikafashions',
    label: 'Instagram',
    handle: '@angelikafashions',
    enabled: true,
  },
  {
    id: 'social-wa',
    platform: 'whatsapp',
    icon: 'whatsapp',
    href: 'https://wa.me/917207256690',
    label: 'WhatsApp Concierge',
    handle: 'Chat with Vidhya',
    enabled: true,
  },
  {
    id: 'social-yt',
    platform: 'youtube',
    icon: 'youtube',
    href: 'https://youtube.com/angelikafashions',
    label: 'YouTube',
    handle: 'Angelika Atelier',
    enabled: true,
  },
];

const DEFAULT_PAYMENT_OPTIONS: FooterPaymentOptions = {
  amex: true,
  gpay: true,
  upi: true,
  mastercard: true,
  rupay: true,
  visa: true,
  razorpay: true,
  netbanking: true,
  cod: true,
};

function isLegacyUnmigratedFooter(content?: FooterContent): boolean {
  if (!content) return false;
  if (content.layoutVersion && content.layoutVersion >= 2) return false;
  if (content.aboutText && content.aboutText.trim().length > 0) return false;
  const colIds = (content.columns || []).map((c) => c.id);
  return (
    colIds.length === 4 &&
    colIds.includes('col-shop') &&
    colIds.includes('col-concierge') &&
    colIds.includes('col-story') &&
    colIds.includes('col-trust')
  );
}

const FOOTER_PATTERN_CLASSES: Record<'brocade-grid' | 'silk-loom' | 'velvet', string> = {
  'brocade-grid': 'couture-footer-brocade-grid',
  'silk-loom': 'couture-footer-silk-loom',
  velvet: 'couture-footer-velvet',
};

export function Footer({
  className,
  content,
  contactWhatsapp,
  siteName,
  socialInstagram,
  socialFacebook,
  socialWhatsapp,
  socialYoutube,
}: FooterProps) {
  const regionSelectId = useId();
  const isLegacy = isLegacyUnmigratedFooter(content);

  const rawBrandName = content?.brandName?.trim() || siteName?.trim() || 'Angelika';
  const watermarkText = (content?.watermarkText?.trim() || rawBrandName || 'ANGELIKA').toUpperCase();
  const watermarkSubtitle =
    content?.watermarkSubtitle?.trim() || 'HANDCRAFTED INDIAN COUTURE';
  const showWatermark = content?.showWatermark !== false;
  const patternKey = content?.backgroundPattern || 'brocade-grid';
  const patternClass = FOOTER_PATTERN_CLASSES[patternKey] || 'couture-footer-brocade-grid';

  const aboutText =
    content?.aboutText?.trim() ||
    (!isLegacy && content?.tagline?.trim() && content.tagline.trim().length > 75
      ? content.tagline.trim()
      : BOUTIQUE_DEFAULT_ABOUT_TEXT);

  const readMoreLabel = content?.readMoreLabel?.trim() || 'Read More';
  const readMoreHref = content?.readMoreHref?.trim() || '/about';

  // Use clean 2-column boutique defaults if DB row is legacy v1 boilerplate; otherwise honor Admin columns
  const columns: FooterColumnItem[] =
    !isLegacy && Array.isArray(content?.columns) && content.columns.length > 0
      ? content.columns
      : BOUTIQUE_DEFAULT_COLUMNS;

  // Normalize social channels & replace placeholder 919876543210 if live store WhatsApp is set
  const cleanLiveWa = (socialWhatsapp || contactWhatsapp || '').replace(/[^0-9]/g, '');
  const fallbackWaHref =
    cleanLiveWa && cleanLiveWa !== '919876543210'
      ? `https://wa.me/${cleanLiveWa}`
      : 'https://wa.me/917207256690';

  const socialOverrideByPlatform: Record<string, string | undefined> = {
    instagram: socialInstagram,
    facebook: socialFacebook,
    whatsapp: socialWhatsapp || (cleanLiveWa ? fallbackWaHref : undefined),
    youtube: socialYoutube,
  };

  const rawSocials: FooterSocialItem[] =
    Array.isArray(content?.socialLinks) && content.socialLinks.length > 0
      ? content.socialLinks
      : DEFAULT_SOCIAL_LINKS;

  const activeSocials = rawSocials
    .filter((s) => s.enabled !== false)
    .map((s) => {
      const key = (s.icon || s.platform || '').toLowerCase();
      let href = s.href?.trim() || '';
      if (href.includes('919876543210')) {
        href = fallbackWaHref;
      }
      if (!href && socialOverrideByPlatform[key]) {
        href = socialOverrideByPlatform[key]!;
      }
      return { ...s, href };
    })
    .filter((s) => Boolean(s.href));

  const regionOptions =
    Array.isArray(content?.regionOptions) && content.regionOptions.length > 0
      ? content.regionOptions
      : BOUTIQUE_DEFAULT_REGIONS;

  const initialRegion = content?.regionLabel?.trim() || regionOptions[0] || 'India (INR ₹)';
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);

  // Sync if Admin preview edits regionLabel live
  const activeRegionValue = regionOptions.includes(selectedRegion)
    ? selectedRegion
    : initialRegion;

  const resolvedPaymentOptions: FooterPaymentOptions = {
    ...DEFAULT_PAYMENT_OPTIONS,
    ...(content?.paymentOptions || {}),
  };

  const activePaymentBadges = PAYMENT_BADGE_ORDER.filter(
    (badge) => resolvedPaymentOptions[badge.key] !== false
  );

  const bottomLinks: FooterLinkItem[] =
    !isLegacy && Array.isArray(content?.bottomLinks) && content.bottomLinks.length > 0
      ? content.bottomLinks
      : BOUTIQUE_DEFAULT_BOTTOM_LINKS;

  const copyrightText =
    isLegacy || !content?.copyright?.trim()
      ? '© 2026 Angelika Fashions.'
      : content.copyright.trim();

  const showRegionSelector = content?.showRegionSelector !== false;

  const columnsGridClass =
    columns.length === 1
      ? 'grid-cols-1'
      : columns.length === 2
      ? 'grid-cols-2 gap-x-10 sm:gap-x-16 gap-y-10'
      : columns.length === 3
      ? 'grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-10'
      : 'grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-10';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className={cn(
        'relative overflow-hidden text-[#FAF6F0] border-t border-[#C9A84C]/35',
        patternClass,
        className
      )}
    >
      {/* Top Champagne-Gold Couture Hairline Accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none h-[2px] w-full bg-gradient-to-r from-transparent via-[#D8B454] to-transparent opacity-80"
      />

      {/* Delicate Saree Pallu Silk Contour Accent (Subtle Women's Couture Depth) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 top-0 h-[320px] w-full opacity-35"
      >
        <defs>
          <linearGradient id="angelika-footer-silk-thread" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D8B454" stopOpacity="0" />
            <stop offset="30%" stopColor="#D8B454" stopOpacity="0.4" />
            <stop offset="65%" stopColor="#E6B89C" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#D8B454" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M-60 210 C 260 60, 560 280, 920 130 C 1140 40, 1300 185, 1500 95"
          fill="none"
          stroke="url(#angelika-footer-silk-thread)"
          strokeWidth="1.2"
        />
        <path
          d="M-60 236 C 280 92, 580 302, 940 156 C 1160 70, 1315 208, 1500 124"
          fill="none"
          stroke="url(#angelika-footer-silk-thread)"
          strokeWidth="0.9"
          strokeDasharray="4 7"
        />
      </svg>

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pt-14 sm:pt-16 pb-8 sm:pb-10">
        {/* TOP ROW: Asymmetric Editorial Columns + Atelier Bio & Socials */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-x-12 items-start">
          {/* Left & Middle: Open Editorial Link Columns */}
          <nav
            aria-label="Footer"
            className={cn('lg:col-span-7 grid', columnsGridClass)}
          >
            {columns.map((column) => (
              <div key={column.id || column.title}>
                <h2 className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#E6C770] mb-5 pb-2.5 border-b border-[#C9A84C]/25">
                  {column.title}
                </h2>
                <ul className="space-y-3.5">
                  {column.links.map((link, idx) => {
                    const isExternal =
                      link.external ||
                      /^https?:\/\//i.test(link.href || '');

                    const linkClasses =
                      'inline-flex items-center gap-2 text-[14px] font-medium text-[#E4DCD0] hover:text-[#FAF6F0] hover:translate-x-0.5 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E5C56B]';

                    return (
                      <li key={`${link.href}-${link.label}-${idx}`}>
                        {isExternal ? (
                          <a
                            href={link.href || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={linkClasses}
                          >
                            <span>{link.label}</span>
                            {link.badge && (
                              <span className="text-[9px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 border border-[#D8B454]/45 text-[#E6C770] rounded-xs">
                                {link.badge}
                              </span>
                            )}
                          </a>
                        ) : (
                          <Link
                            href={link.href || '/'}
                            className={linkClasses}
                          >
                            <span>{link.label}</span>
                            {link.badge && (
                              <span className="text-[9px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 border border-[#D8B454]/45 text-[#E6C770] rounded-xs">
                                {link.badge}
                              </span>
                            )}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Right: Editorial Atelier Bio & Framed Social Channels (Normal wordmark moved to monumental watermark below) */}
          <div className="lg:col-span-5 flex flex-col items-start lg:pl-6 lg:border-l lg:border-[#C9A84C]/20">
            <div className="inline-flex items-center gap-2.5 mb-3.5">
              <span className="h-[1.5px] w-6 bg-[#D8B454]" aria-hidden="true" />
              <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#E6C770]">
                The House of {rawBrandName}
              </span>
            </div>

            <p className="text-[14.5px] leading-[1.78] font-normal text-[#EAE3D8] max-w-[480px]">
              {aboutText}
              {readMoreLabel && readMoreHref && (
                <>
                  {' '}
                  <Link
                    href={readMoreHref}
                    aria-label={`${readMoreLabel} about ${rawBrandName}`}
                    className="text-[#E6C770] font-semibold underline underline-offset-4 decoration-[#D8B454]/70 hover:text-[#FAF6F0] hover:decoration-[#FAF6F0] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E5C56B]"
                  >
                    {readMoreLabel}
                  </Link>
                </>
              )}
            </p>

            {/* Clean Sculptural Framed Social Icons */}
            {activeSocials.length > 0 && (
              <div className="mt-6 flex items-center gap-3 flex-wrap">
                {activeSocials.map((social, idx) => (
                  <a
                    key={social.id || `${social.platform}-${idx}`}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label || social.platform}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#C9A84C]/35 bg-[#1D1814]/80 text-[#FAF6F0] hover:border-[#E5C56B] hover:bg-[#D8B454] hover:text-[#14110E] transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5C56B]"
                  >
                    <SocialIcon
                      platform={(social.icon || social.platform) as any}
                      size="md"
                      className="h-[17px] w-[17px]"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* UTILITY ROW: Region Selector & Copyright (Left) + Payment Cards & Legal Links (Right) */}
        <div className="mt-12 sm:mt-14 pt-8 border-t border-[#C9A84C]/22 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          {/* Bottom-Left: Crisp Region Selector + Minimal Copyright */}
          <div className="flex flex-col items-start gap-4">
            {showRegionSelector && (
              <div className="relative inline-flex items-center">
                <label htmlFor={regionSelectId} className="sr-only">
                  Country and currency
                </label>
                <select
                  id={regionSelectId}
                  name="boutique-region"
                  value={activeRegionValue}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="boutique-region-select"
                >
                  {regionOptions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="pointer-events-none absolute right-3.5 h-3.5 w-3.5 text-[#222222]"
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </div>
            )}

            <p className="text-[12px] font-medium text-[#C5BAAB] tracking-[0.02em]">
              {copyrightText}
            </p>
          </div>

          {/* Bottom-Right: Sleek Payment Card Badges + Policy Links */}
          <div className="flex flex-col items-start lg:items-end gap-4">
            {activePaymentBadges.length > 0 && (
              <ul
                aria-label="Accepted payment methods"
                className="flex flex-wrap items-center gap-1.5 lg:justify-end"
              >
                {activePaymentBadges.map((badge) => (
                  <li key={badge.key}>
                    <PaymentCardBadge type={badge.key} />
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:justify-end text-[12px] font-medium text-[#C5BAAB]">
              {bottomLinks.map((link, idx) => (
                <Link
                  key={`${link.href}-${link.label}-${idx}`}
                  href={link.href || '/'}
                  className="hover:text-[#FAF6F0] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5C56B]"
                >
                  {link.label}
                </Link>
              ))}

              {content?.showScrollTop === true && (
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="inline-flex items-center gap-1 text-[#E6C770] hover:text-[#FAF6F0] font-semibold transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5C56B]"
                  aria-label="Scroll back to top"
                >
                  <span>{content.scrollTopText || 'Top'}</span>
                  <span aria-hidden="true">↑</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* MONUMENTAL PREMIUM COUTURE WATERMARK TITLE (Replaces standard small wordmark) */}
        {showWatermark && (
          <div
            aria-hidden="true"
            className="mt-10 sm:mt-12 pt-8 sm:pt-10 border-t border-[#C9A84C]/20 select-none pointer-events-none"
          >
            {watermarkSubtitle && (
              <div className="flex items-center justify-center gap-3 mb-2 sm:mb-3">
                <span className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent to-[#D8B454]/50" />
                <span className="text-[9.5px] sm:text-[11px] font-bold uppercase tracking-[0.38em] text-[#D8B454]/75 text-center">
                  {watermarkSubtitle}
                </span>
                <span className="h-px w-8 sm:w-16 bg-gradient-to-l from-transparent to-[#D8B454]/50" />
              </div>
            )}

            <p className="angelika-footer-watermark text-center font-bold uppercase leading-[0.88] tracking-[0.2em] text-[clamp(3.1rem,13.5vw,11.5rem)] w-full overflow-hidden">
              {watermarkText}
            </p>
          </div>
        )}
      </div>
    </footer>
  );
}

export interface SimpleFooterProps {
  className?: string;
}

export function SimpleFooter({ className }: SimpleFooterProps) {
  return (
    <footer className={cn('couture-footer-brocade-grid text-[#C5BAAB] border-t border-[#C9A84C]/30 py-6', className)}>
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px]">
        <p>© 2026 Angelika Fashions.</p>
        <div className="flex items-center gap-5">
          <Link href="/terms" className="hover:text-[#FAF6F0] transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-[#FAF6F0] transition-colors">
            Privacy Policy
          </Link>
          <Link href="/contact" className="hover:text-[#FAF6F0] transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
