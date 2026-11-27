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

type ResolvedFooterTheme = 'champagne-grid' | 'blush-brocade' | 'ivory-loom' | 'obsidian-grid';

function resolveFooterPattern(raw?: FooterContent['backgroundPattern']): ResolvedFooterTheme {
  if (raw === 'blush-brocade' || raw === 'ivory-loom' || raw === 'obsidian-grid' || raw === 'champagne-grid') {
    return raw;
  }
  return 'champagne-grid';
}

const FOOTER_PATTERN_CLASSES: Record<ResolvedFooterTheme, string> = {
  'champagne-grid': 'couture-footer-champagne-grid',
  'blush-brocade': 'couture-footer-blush-brocade',
  'ivory-loom': 'couture-footer-ivory-loom',
  'obsidian-grid': 'couture-footer-obsidian-grid',
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
  const patternKey = resolveFooterPattern(content?.backgroundPattern);
  const patternClass = FOOTER_PATTERN_CLASSES[patternKey];
  const isDark = patternKey === 'obsidian-grid';

  const aboutText =
    content?.aboutText?.trim() ||
    (!isLegacy && content?.tagline?.trim() && content.tagline.trim().length > 75
      ? content.tagline.trim()
      : BOUTIQUE_DEFAULT_ABOUT_TEXT);

  const readMoreLabel = content?.readMoreLabel?.trim() || 'Read More';
  const readMoreHref = content?.readMoreHref?.trim() || '/about';

  const columns: FooterColumnItem[] =
    !isLegacy && Array.isArray(content?.columns) && content.columns.length > 0
      ? content.columns
      : BOUTIQUE_DEFAULT_COLUMNS;

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
        'relative overflow-hidden border-t-[1.5px]',
        isDark
          ? 'text-[#FAF6F0] border-[#C9A84C]/35'
          : 'text-[#1A1512] border-[#C4AC82]',
        patternClass,
        className
      )}
    >
      {/* Top Champagne-Gold Couture Hairline Accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none h-[2px] w-full bg-gradient-to-r from-transparent via-[#B8922E] to-transparent opacity-80"
      />

      {/* Flowing Saree Pallu Silk Contour Ribbons (Graceful Women's Couture Depth) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-[340px] w-full',
          isDark ? 'opacity-35' : 'opacity-65'
        )}
      >
        <defs>
          <linearGradient id="angelika-footer-silk-thread" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B8922E" stopOpacity="0" />
            <stop offset="28%" stopColor="#A67C28" stopOpacity="0.34" />
            <stop offset="64%" stopColor="#C48F78" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#B8922E" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M-60 210 C 260 60, 560 280, 920 130 C 1140 40, 1300 185, 1500 95"
          fill="none"
          stroke="url(#angelika-footer-silk-thread)"
          strokeWidth="1.4"
        />
        <path
          d="M-60 236 C 280 92, 580 302, 940 156 C 1160 70, 1315 208, 1500 124"
          fill="none"
          stroke="url(#angelika-footer-silk-thread)"
          strokeWidth="1.05"
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
                <h2
                  className={cn(
                    'text-[11.5px] font-bold uppercase tracking-[0.24em] mb-5 pb-2.5 border-b',
                    isDark
                      ? 'text-[#E6C770] border-[#C9A84C]/25'
                      : 'text-[#6B4D09] border-[#C5AE84]'
                  )}
                >
                  {column.title}
                </h2>
                <ul className="space-y-3.5">
                  {column.links.map((link, idx) => {
                    const isExternal =
                      link.external ||
                      /^https?:\/\//i.test(link.href || '');

                    const linkClasses = cn(
                      'inline-flex items-center gap-2 text-[14px] font-medium hover:translate-x-0.5 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9E7820]',
                      isDark
                        ? 'text-[#E4DCD0] hover:text-[#FAF6F0]'
                        : 'text-[#231D17] hover:text-[#6B4D09]'
                    );

                    const badgeClasses = cn(
                      'text-[9px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 border rounded-xs',
                      isDark
                        ? 'border-[#D8B454]/45 text-[#E6C770]'
                        : 'border-[#B8922E]/60 text-[#6B4D09] bg-[#FFFDF9]/70'
                    );

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
                            {link.badge && <span className={badgeClasses}>{link.badge}</span>}
                          </a>
                        ) : (
                          <Link href={link.href || '/'} className={linkClasses}>
                            <span>{link.label}</span>
                            {link.badge && <span className={badgeClasses}>{link.badge}</span>}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Right: Editorial Atelier Bio & Sculpted Social Medallions (Small wordmark removed in favor of monumental watermark below) */}
          <div
            className={cn(
              'lg:col-span-5 flex flex-col items-start lg:pl-8 lg:border-l',
              isDark ? 'lg:border-[#C9A84C]/22' : 'lg:border-[#C5AE84]'
            )}
          >
            <div className="inline-flex items-center gap-2.5 mb-3.5">
              <span className="h-[1.5px] w-6 bg-[#9E7820]" aria-hidden="true" />
              <span
                className={cn(
                  'text-[11px] font-bold uppercase tracking-[0.24em]',
                  isDark ? 'text-[#E6C770]' : 'text-[#6B4D09]'
                )}
              >
                The House of {rawBrandName}
              </span>
            </div>

            <p
              className={cn(
                'text-[14.5px] leading-[1.8] font-normal max-w-[480px]',
                isDark ? 'text-[#EAE3D8]' : 'text-[#2B241C]'
              )}
            >
              {aboutText}
              {readMoreLabel && readMoreHref && (
                <>
                  {' '}
                  <Link
                    href={readMoreHref}
                    aria-label={`${readMoreLabel} about ${rawBrandName}`}
                    className={cn(
                      'font-bold underline underline-offset-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9E7820]',
                      isDark
                        ? 'text-[#E6C770] decoration-[#D8B454]/70 hover:text-[#FAF6F0]'
                        : 'text-[#6B4D09] decoration-[#9E7820]/70 hover:text-[#14110E]'
                    )}
                  >
                    {readMoreLabel}
                  </Link>
                </>
              )}
            </p>

            {/* Clean Sculpted Social Medallions */}
            {activeSocials.length > 0 && (
              <div className="mt-6 flex items-center gap-3 flex-wrap">
                {activeSocials.map((social, idx) => (
                  <a
                    key={social.id || `${social.platform}-${idx}`}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label || social.platform}
                    className={cn(
                      'inline-flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9E7820]',
                      isDark
                        ? 'border-[#C9A84C]/35 bg-[#1D1814]/80 text-[#FAF6F0] hover:border-[#E5C56B] hover:bg-[#D8B454] hover:text-[#14110E]'
                        : 'border-[#BDA478] bg-[#FFFDF9] text-[#231D17] shadow-2xs hover:border-[#171310] hover:bg-[#171310] hover:text-[#F2D991]'
                    )}
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

        {/* UTILITY ROW: Region Selector & Copyright (Left) + Payment Cards & Policy Links (Right) */}
        <div
          className={cn(
            'mt-12 sm:mt-14 pt-8 border-t flex flex-col lg:flex-row lg:items-end justify-between gap-8',
            isDark ? 'border-[#C9A84C]/22' : 'border-[#C5AE84]'
          )}
        >
          {/* Bottom-Left: Crisp Tailored Region Selector + Copyright */}
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
                  className={cn(
                    'boutique-region-select',
                    !isDark && '!border-[#BDA478] !bg-[#FFFDF9] !text-[#1A1512] shadow-2xs'
                  )}
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

            <p
              className={cn(
                'text-[12px] font-semibold tracking-[0.02em]',
                isDark ? 'text-[#C5BAAB]' : 'text-[#473D32]'
              )}
            >
              {copyrightText}
            </p>
          </div>

          {/* Bottom-Right: Payment Card Badges + Policy Links */}
          <div className="flex flex-col items-start lg:items-end gap-4">
            {activePaymentBadges.length > 0 && (
              <ul
                aria-label="Accepted payment methods"
                className="flex flex-wrap items-center gap-1.5 lg:justify-end"
              >
                {activePaymentBadges.map((badge) => (
                  <li key={badge.key} className={!isDark ? 'shadow-2xs rounded-[3px] overflow-hidden' : undefined}>
                    <PaymentCardBadge type={badge.key} />
                  </li>
                ))}
              </ul>
            )}

            <div
              className={cn(
                'flex flex-wrap items-center gap-x-5 gap-y-2 lg:justify-end text-[12px] font-semibold',
                isDark ? 'text-[#C5BAAB]' : 'text-[#473D32]'
              )}
            >
              {bottomLinks.map((link, idx) => (
                <Link
                  key={`${link.href}-${link.label}-${idx}`}
                  href={link.href || '/'}
                  className={cn(
                    'transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9E7820]',
                    isDark ? 'hover:text-[#FAF6F0]' : 'hover:text-[#14110E]'
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {content?.showScrollTop === true && (
                <button
                  type="button"
                  onClick={scrollToTop}
                  className={cn(
                    'inline-flex items-center gap-1 font-bold transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9E7820]',
                    isDark ? 'text-[#E6C770] hover:text-[#FAF6F0]' : 'text-[#6B4D09] hover:text-[#14110E]'
                  )}
                  aria-label="Scroll back to top"
                >
                  <span>{content.scrollTopText || 'Top'}</span>
                  <span aria-hidden="true">↑</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* MONUMENTAL BLIND-EMBOSSED COUTURE WATERMARK TITLE (Replaces standard wordmark) */}
        {showWatermark && (
          <div
            aria-hidden="true"
            className={cn(
              'mt-10 sm:mt-12 pt-8 sm:pt-10 border-t select-none pointer-events-none',
              isDark ? 'border-[#C9A84C]/22' : 'border-[#C5AE84]/80'
            )}
          >
            {watermarkSubtitle && (
              <div className="flex items-center justify-center gap-3 mb-2 sm:mb-3">
                <span
                  className={cn(
                    'h-px w-8 sm:w-16 bg-gradient-to-r from-transparent',
                    isDark ? 'to-[#D8B454]/55' : 'to-[#9E7820]/65'
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.38em] text-center',
                    isDark ? 'text-[#D8B454]/80' : 'text-[#7A580D]'
                  )}
                >
                  ◆ {watermarkSubtitle} ◆
                </span>
                <span
                  className={cn(
                    'h-px w-8 sm:w-16 bg-gradient-to-l from-transparent',
                    isDark ? 'to-[#D8B454]/55' : 'to-[#9E7820]/65'
                  )}
                />
              </div>
            )}

            <p
              className={cn(
                'text-center font-bold uppercase leading-[0.88] tracking-[0.2em] text-[clamp(3.15rem,13.6vw,12rem)] w-full overflow-hidden',
                isDark ? 'angelika-footer-watermark-dark' : 'angelika-footer-watermark'
              )}
            >
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
    <footer className={cn('couture-footer-champagne-grid text-[#473D32] border-t border-[#C4AC82] py-6', className)}>
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] font-medium">
        <p>© 2026 Angelika Fashions.</p>
        <div className="flex items-center gap-5">
          <Link href="/terms" className="hover:text-[#14110E] transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-[#14110E] transition-colors">
            Privacy Policy
          </Link>
          <Link href="/contact" className="hover:text-[#14110E] transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
