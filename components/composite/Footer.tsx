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
  const wordmarkText = rawBrandName.toLowerCase() === 'angelika' ? 'ANGELIKA' : rawBrandName;
  const useLogoImage = Boolean(content?.useLogoImage && content?.logoUrl?.trim());
  const logoUrl = content?.logoUrl?.trim() || '/images/logo.png';

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
        'relative bg-[#000000] text-[#FFFFFF] border-t border-white/10',
        className
      )}
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pt-14 sm:pt-16 pb-10 sm:pb-12">
        {/* TOP ROW: Asymmetric 3-Zone Boutique Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-x-12 items-start">
          {/* Left & Middle: Open Editorial Link Columns */}
          <nav
            aria-label="Footer"
            className={cn('lg:col-span-7 grid', columnsGridClass)}
          >
            {columns.map((column) => (
              <div key={column.id || column.title}>
                <h2 className="text-[15px] font-normal tracking-[0.01em] text-white mb-5">
                  {column.title}
                </h2>
                <ul className="space-y-3.5">
                  {column.links.map((link, idx) => {
                    const isExternal =
                      link.external ||
                      /^https?:\/\//i.test(link.href || '');

                    return (
                      <li key={`${link.href}-${link.label}-${idx}`}>
                        {isExternal ? (
                          <a
                            href={link.href || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[14px] font-light text-[#D4D4D4] hover:text-white transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A84C]"
                          >
                            <span>{link.label}</span>
                            {link.badge && (
                              <span className="text-[9px] uppercase tracking-[0.14em] px-1.5 py-0.5 border border-white/25 text-white/85">
                                {link.badge}
                              </span>
                            )}
                          </a>
                        ) : (
                          <Link
                            href={link.href || '/'}
                            className="inline-flex items-center gap-2 text-[14px] font-light text-[#D4D4D4] hover:text-white transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A84C]"
                          >
                            <span>{link.label}</span>
                            {link.badge && (
                              <span className="text-[9px] uppercase tracking-[0.14em] px-1.5 py-0.5 border border-white/25 text-white/85">
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

          {/* Right: Editorial Brand Bio + Bold Wordmark + Minimal Social Icons */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <p className="text-[14px] leading-[1.72] font-light text-[#E5E5E5] max-w-[460px]">
              {aboutText}
              {readMoreLabel && readMoreHref && (
                <>
                  {' '}
                  <Link
                    href={readMoreHref}
                    aria-label={`${readMoreLabel} about ${rawBrandName}`}
                    className="text-white font-normal underline underline-offset-4 decoration-white/75 hover:decoration-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A84C]"
                  >
                    {readMoreLabel}
                  </Link>
                </>
              )}
            </p>

            {/* Bold Sculptural Brand Wordmark / Optional Uploaded Logo */}
            <div className="mt-8">
              <Link
                href="/"
                aria-label={`${rawBrandName} home`}
                className="inline-block group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A84C]"
              >
                {useLogoImage ? (
                  <img
                    src={logoUrl}
                    alt={rawBrandName}
                    className="h-12 sm:h-14 w-auto object-contain brightness-0 invert"
                  />
                ) : (
                  <span
                    className="block text-[42px] sm:text-[52px] font-bold tracking-[-0.02em] leading-[0.92] text-white transition-opacity duration-200 group-hover:opacity-90"
                    style={{ fontFamily: 'var(--font-cormorant)' }}
                  >
                    {wordmarkText}
                  </span>
                )}
              </Link>
            </div>

            {/* Clean Bare Monochrome White Social Icons */}
            {activeSocials.length > 0 && (
              <div className="mt-5 flex items-center gap-3.5 flex-wrap">
                {activeSocials.map((social, idx) => (
                  <a
                    key={social.id || `${social.platform}-${idx}`}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label || social.platform}
                    className="inline-flex min-w-[28px] min-h-[28px] items-center justify-center text-white/90 hover:text-white transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A84C]"
                  >
                    <SocialIcon
                      platform={(social.icon || social.platform) as any}
                      size="md"
                      className="h-[18px] w-[18px]"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM BAR: Region Selector & Copyright (Left) + Payment Cards & Policies (Right) */}
        <div className="mt-14 sm:mt-16 pt-4 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          {/* Bottom-Left: Crisp White Region Selector + Minimal Copyright */}
          <div className="flex flex-col items-start gap-5">
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

            <p className="text-[11.5px] font-light text-[#9E9E9E] tracking-[0.01em]">
              {copyrightText}
            </p>
          </div>

          {/* Bottom-Right: Sleek Payment Card Badges + Single-Row Legal Links */}
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

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:justify-end text-[11.5px] font-light text-[#9E9E9E]">
              {bottomLinks.map((link, idx) => (
                <Link
                  key={`${link.href}-${link.label}-${idx}`}
                  href={link.href || '/'}
                  className="hover:text-white transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A84C]"
                >
                  {link.label}
                </Link>
              ))}

              {content?.showScrollTop === true && (
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="inline-flex items-center gap-1 text-[#C9A84C] hover:text-white transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A84C]"
                  aria-label="Scroll back to top"
                >
                  <span>{content.scrollTopText || 'Top'}</span>
                  <span aria-hidden="true">↑</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export interface SimpleFooterProps {
  className?: string;
}

export function SimpleFooter({ className }: SimpleFooterProps) {
  return (
    <footer className={cn('bg-[#000000] text-[#9E9E9E] border-t border-white/10 py-6', className)}>
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px]">
        <p>© 2026 Angelika Fashions.</p>
        <div className="flex items-center gap-5">
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/contact" className="hover:text-white transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
