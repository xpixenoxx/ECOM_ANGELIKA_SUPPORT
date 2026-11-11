'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { SocialIcon } from '@/components/ui/SocialIcon';
import type { FooterContent } from '@/lib/actions/site-content';

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
  badge?: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  id?: string;
  platform: 'instagram' | 'facebook' | 'pinterest' | 'youtube' | 'whatsapp' | 'twitter' | 'threads' | 'telegram' | 'tiktok' | 'linkedin' | 'snapchat' | 'spotify' | 'globe' | 'website' | 'email' | 'sms' | string;
  icon?: string;
  href: string;
  label: string;
  handle?: string;
  enabled?: boolean;
}

export interface FooterProps {
  content?: FooterContent;
  logo?: React.ReactNode;
  logoUrl?: string;
  tagline?: string;
  columns?: FooterColumn[];
  socialLinks?: SocialLink[];
  paymentMethods?: Array<{ name: string; icon: React.ReactNode }>;
  copyright?: string;
  className?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  siteName?: string;
  socialInstagram?: string;
  socialFacebook?: string;
  socialWhatsapp?: string;
  socialYoutube?: string;
}

/* =========================================================================
   CUSTOM ATELIER DIRECTORY COLUMNS
   Every single link resolves to an active, rich, bespoke route
   ========================================================================= */

const defaultColumns: FooterColumn[] = [
  {
    title: 'Shop Collections',
    links: [
      { label: 'Handcrafted Kurtis', href: '/shop/kurtis' },
      { label: 'Salwars & Palazzo Sets', href: '/shop/salwars' },
      { label: 'Bridal & Festive Lehengas', href: '/shop/lehengas' },
      { label: 'Pure Silk & Chanderi Sarees', href: '/shop/sarees' },
      { label: 'Artisanal Dupattas', href: '/shop/dupattas' },
      { label: 'New Arrivals', href: '/new-arrivals', badge: 'New' },
      { label: "Vidhya's Curated Picks", href: '/vidhyas-picks', badge: 'Curated' },
      { label: 'Festive Archive Sale', href: '/sale', badge: 'Sale' },
    ],
  },
  {
    title: 'Client Concierge',
    links: [
      { label: 'Track Your Order', href: '/track-order' },
      { label: 'Shipping & Delivery Policy', href: '/shipping' },
      { label: 'Returns & Size Exchanges', href: '/returns' },
      { label: 'Interactive Size Finder', href: '/size-finder' },
      { label: 'Garment Size Guide', href: '/size-guide' },
      { label: 'Frequently Asked Questions', href: '/faq' },
      { label: 'Contact Our Concierge', href: '/contact' },
      { label: 'Wholesale & B2B Inquiries', href: '/wholesale' },
    ],
  },
  {
    title: 'The Atelier Story',
    links: [
      { label: 'Our Heritage & Philosophy', href: '/about' },
      { label: 'Meet Designer Vidhya', href: '/about/vidhya' },
      { label: 'Master Weaving Traditions', href: '/about#craft' },
      { label: 'Ethical & Sustainable Craft', href: '/about#sustainability' },
      { label: 'Editorial Style Journal', href: '/new-arrivals' },
      { label: 'Press & Celebrity Spotlights', href: '/about#press' },
      { label: 'Careers at Angelika', href: '/contact?subject=careers' },
    ],
  },
  {
    title: 'Policies & Trust',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Accessibility Commitment', href: '/accessibility' },
      { label: 'Client Account & Profile', href: '/account' },
      { label: 'My Saved Wishlist', href: '/wishlist' },
      { label: '100% Silk Mark Authenticity', href: '/about#authenticity' },
    ],
  },
];

/* =========================================================================
   AUTHENTIC LUXURY PAYMENT EMBLEMS (Crisp, High-End Tailored Vectors)
   ========================================================================= */

function UpiEmblem() {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F3EEE8] border border-[#E5DFD5] hover:border-[var(--color-gold)] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <svg className="w-3.5 h-3.5 text-[#0F753A]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2L2 19.5h20L12 2zm0 4.2l6.5 11.3H5.5L12 6.2z" />
      </svg>
      <span className="text-[11px] font-bold tracking-wider text-[#1A1A1A]">UPI</span>
    </div>
  );
}

function VisaEmblem() {
  return (
    <div className="inline-flex items-center px-2.5 py-1 rounded bg-[#F3EEE8] border border-[#E5DFD5] hover:border-[var(--color-gold)] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <span className="text-xs font-serif font-black italic tracking-wide text-[#1A3F8B]">VISA</span>
    </div>
  );
}

function MastercardEmblem() {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F3EEE8] border border-[#E5DFD5] hover:border-[var(--color-gold)] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <span className="flex -space-x-1 items-center" aria-hidden="true">
        <span className="w-2.5 h-2.5 rounded-full bg-[#EB001B] inline-block" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#F79E1B] inline-block" />
      </span>
      <span className="text-[11px] font-semibold tracking-tight text-[#1A1A1A]">Mastercard</span>
    </div>
  );
}

function RuPayEmblem() {
  return (
    <div className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded bg-[#F3EEE8] border border-[#E5DFD5] hover:border-[var(--color-gold)] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <span className="text-xs font-bold text-[#097938]">Ru</span>
      <span className="text-xs font-bold text-[#F37021]">Pay</span>
    </div>
  );
}

function NetBankingEmblem() {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F3EEE8] border border-[#E5DFD5] hover:border-[var(--color-gold)] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <svg className="w-3.5 h-3.5 text-[var(--color-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 2L2 7h20L12 2z" />
      </svg>
      <span className="text-[11px] font-medium text-[var(--color-slate)]">Net Banking</span>
    </div>
  );
}

function CodEmblem() {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F3EEE8] border border-[#E5DFD5] hover:border-[var(--color-gold)] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <svg className="w-3.5 h-3.5 text-[var(--color-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M6 12h.01M18 12h.01" />
      </svg>
      <span className="text-[11px] font-medium text-[var(--color-slate)]">Cash on Delivery</span>
    </div>
  );
}

function AmexEmblem() {
  return (
    <div className="inline-flex items-center px-2.5 py-1 rounded bg-[#F3EEE8] border border-[#E5DFD5] hover:border-[var(--color-gold)] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <span className="text-xs font-black tracking-wider text-[#006FCF]">AMEX</span>
    </div>
  );
}

const defaultPaymentMethods = [
  { name: 'UPI', icon: <UpiEmblem /> },
  { name: 'Visa', icon: <VisaEmblem /> },
  { name: 'Mastercard', icon: <MastercardEmblem /> },
  { name: 'RuPay', icon: <RuPayEmblem /> },
  { name: 'Net Banking', icon: <NetBankingEmblem /> },
  { name: 'Cash on Delivery', icon: <CodEmblem /> },
  { name: 'Amex', icon: <AmexEmblem /> },
];

/* =========================================================================
   AUTHENTIC ARTISANAL TRUST BADGES (Bespoke SVGs, No Hallucinations or Emojis)
   ========================================================================= */

function SilkMarkBadge({ text }: { text?: string } = {}) {
  return (
    <div className="inline-flex items-center gap-2 text-xs text-[var(--color-slate)]">
      <svg className="w-4 h-4 text-[var(--color-gold)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 2C8 6 4 9 4 14a8 8 0 0016 0c0-5-4-8-8-12z" />
        <path d="M12 8c-2 2.5-3 5-3 7a3 3 0 006 0c0-2-1-4.5-3-7z" fill="currentColor" fillOpacity="0.2" />
      </svg>
      <span>{text || "100% Certified Authentic Handloom"}</span>
    </div>
  );
}

function ExpressDispatchBadge({ text }: { text?: string } = {}) {
  return (
    <div className="inline-flex items-center gap-2 text-xs text-[var(--color-slate)]">
      <svg className="w-4 h-4 text-[var(--color-gold)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
      <span>{text || "Pan-India Express & Global Shipping"}</span>
    </div>
  );
}

function SecureCheckoutBadge({ text }: { text?: string } = {}) {
  return (
    <div className="inline-flex items-center gap-2 text-xs text-[var(--color-slate)]">
      <svg className="w-4 h-4 text-[#16A34A] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
      <span>{text || "256-Bit SSL Encrypted Checkout"}</span>
    </div>
  );
}

function ExchangeGuaranteeBadge({ text }: { text?: string } = {}) {
  return (
    <div className="inline-flex items-center gap-2 text-xs text-[var(--color-slate)]">
      <svg className="w-4 h-4 text-[var(--color-gold)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
      </svg>
      <span>{text || "7-Day Complimentary Size Exchange"}</span>
    </div>
  );
}

/* =========================================================================
   MAIN BESPOKE FOOTER COMPONENT
   ========================================================================= */

export function Footer({
  content,
  logo,
  logoUrl,
  tagline = 'Modern Indian luxury — rooted in craft, elevated for today.',
  columns = defaultColumns,
  socialLinks,
  paymentMethods = defaultPaymentMethods,
  copyright,
  className = '',
  contactEmail,
  contactPhone,
  contactWhatsapp,
  siteName = 'Angelika Fashions',
  socialInstagram,
  socialFacebook,
  socialWhatsapp,
  socialYoutube,
}: FooterProps) {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentYear = new Date().getFullYear();
  const displayCopyright =
    copyright ||
    `© ${currentYear} ${siteName}. All rights reserved. Handcrafted with reverence for Indian heritage.`;

  // Resolved dynamic contact details
  const activeEmail = contactEmail || 'care@angelikafashions.com';
  const activePhone = contactPhone || '+91 98765 43210';
  const rawWhatsapp = (contactWhatsapp || activePhone).replace(/[^0-9]/g, '');
  const activeWhatsappLink = `https://wa.me/${rawWhatsapp}?text=${encodeURIComponent(
    'Hi Vidhya, I would love personal styling guidance and drape consultation for my order.'
  )}`;

  // Resolved social links
  const resolvedSocialLinks: SocialLink[] = socialLinks || [
    {
      platform: 'instagram',
      href: socialInstagram || 'https://instagram.com/angelikafashions',
      label: 'Instagram',
      handle: '@angelikafashions',
    },
    {
      platform: 'whatsapp',
      href: socialWhatsapp || activeWhatsappLink,
      label: 'WhatsApp Concierge',
      handle: 'Chat with Vidhya',
    },
    {
      platform: 'facebook',
      href: socialFacebook || 'https://facebook.com/angelikafashions',
      label: 'Facebook',
      handle: 'Angelika Fashions',
    },
    {
      platform: 'pinterest',
      href: 'https://pinterest.com/angelikafashions',
      label: 'Pinterest',
      handle: 'Angelika Haute Couture',
    },
    {
      platform: 'youtube',
      href: socialYoutube || 'https://youtube.com/angelikafashions',
      label: 'YouTube',
      handle: 'Angelika Atelier',
    },
  ];

  const effectiveBrand = content?.brandName || siteName;
  const effectiveBrandSub = content?.brandTagline || 'Fashions';
  const effectiveTagline = content?.tagline || tagline;
  const effectiveLogoUrl = logoUrl || content?.logoUrl || '/images/logo.png';
  const showAtelierCard = content ? content.showAtelierDesk !== false : true;
  const effectiveAtelierBadge = content?.atelierBadge || "Vidhya's Styling Atelier";
  const effectiveAtelierStatus = content?.atelierStatusText || 'Concierge Active';
  const effectiveAtelierTitle = content?.atelierTitle || 'Personal Styling & Drape Consultation';
  const effectiveAtelierDesc = content?.atelierDescription || 'Complimentary bespoke drape guidance, custom blouse measurements & festive trousseau curation directly with designer Vidhya.';
  const effectiveAtelierCta = content?.atelierWhatsappCta || 'Connect with Vidhya on WhatsApp';
  const effectiveAtelierPhone = content?.atelierPhone || activePhone;
  const effectiveAtelierEmail = content?.atelierEmail || activeEmail;
  const effectiveAtelierSchedule = content?.atelierSchedule || 'Mon – Sat · 10:00 AM – 7:00 PM IST · Direct atelier response';
  const effectiveWhatsappUrl = content?.atelierWhatsappNumber
    ? ('https://wa.me/' + content.atelierWhatsappNumber.replace(/[^0-9]/g, '') + '?text=' + encodeURIComponent(content.atelierWhatsappMessage || 'Hi Vidhya, I would love personal styling guidance and drape consultation for my order.'))
    : activeWhatsappLink;
  const effectiveSocialTitle = content?.socialTitle || 'Connect With Us';
  const effectiveSocialLinks = content?.socialLinks && content.socialLinks.length > 0
    ? content.socialLinks.filter((s) => s.enabled !== false)
    : resolvedSocialLinks;
  const effectiveColumns = content?.columns && content.columns.length > 0 ? content.columns : columns;
  const effectivePaymentLabel = content?.paymentLabel || 'Payment Options:';
  const effectiveCopyright = content?.copyright || displayCopyright;
  const effectiveBottomLinks = content?.bottomLinks && content.bottomLinks.length > 0
    ? content.bottomLinks
    : [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
        { label: 'Cookies', href: '/cookies' },
        { label: 'Accessibility', href: '/accessibility' },
      ];
  const effectiveShowTop = content ? content.showScrollTop !== false : true;
  const effectiveTopText = content?.scrollTopText || 'Top';

  return (
    <footer
      className={cn(
        'relative bg-[#FAF8F5] text-[var(--color-ink)] border-t border-[#EAE4D9]',
        className
      )}
      role="contentinfo"
      aria-label="Site Footer"
    >
      {/* Hairline gold accent bar at top border */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[var(--color-gold)]/60 to-transparent" />

      {/* Main Container */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14">

          {/* =============================================================
              COLUMN 1: BRAND IDENTITY & BESPOKE STYLING DESK
              Spans 5 columns on desktop for balanced breathing room
              ============================================================= */}
          <div className="lg:col-span-5 space-y-6">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group focus:outline-none"
              aria-label={`${siteName} - Home`}
            >
              {logo || (
                <div className="flex items-center gap-3">
                  <img
                    src={effectiveLogoUrl || "/images/logo.png"}
                    alt={siteName}
                    className="h-10 w-auto object-contain rounded"
                  />
                  <div className="flex flex-col">
                    <span className="font-display text-2xl font-bold tracking-tight text-[var(--color-ink)] leading-none group-hover:text-[var(--color-gold)] transition-colors">
                      Angelika
                    </span>
                    <span className="text-[10px] tracking-[0.26em] text-[var(--color-gold)] uppercase font-semibold mt-0.5">
                      Fashions
                    </span>
                  </div>
                </div>
              )}
            </Link>

            <p className="text-[var(--color-slate)] text-sm leading-relaxed max-w-md font-light">
              {effectiveTagline}
            </p>

            {/* =========================================================
                BESPOKE ATELIER STYLING DESK (Vidhya's Personal Styling Concierge)
                Elevated luxury consultation module
                ========================================================= */}
            {showAtelierCard && (
            <div className="relative rounded-xl bg-[#FCFAF7] border border-[#E5DECF] p-5 shadow-[0_4px_20px_rgba(201,168,76,0.06)] hover:border-[var(--color-gold)]/50 transition-all duration-300 max-w-md overflow-hidden">
              {/* Gold hairline highlight */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />

              {/* Atelier Header & Status */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#EAE4D9]">
                <div className="flex items-center gap-2">
                  {/* Subtle Lotus / Atelier Seal */}
                  <svg className="w-4 h-4 text-[var(--color-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M12 2c-2 3-4 6-4 9a4 4 0 008 0c0-3-2-6-4-9z" />
                    <path d="M12 11c-3-2-6-3-9-2 2 3 5 5 9 5s7-2 9-5c-3-1-6 0-9 2z" />
                  </svg>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
                    {effectiveAtelierBadge}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--color-slate)] font-medium bg-[#F3EEE8] px-2.5 py-0.5 rounded-full border border-[#EAE4D9]">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                  <span>{effectiveAtelierStatus}</span>
                </span>
              </div>

              {/* Atelier Title & Editorial Microcopy */}
              <div className="mt-3.5 space-y-1.5">
                <h4 className="font-serif text-base text-[var(--color-ink)] font-normal tracking-wide">
                  {effectiveAtelierTitle}
                </h4>
                <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                  {effectiveAtelierDesc}
                </p>
              </div>

              {/* Direct WhatsApp Concierge CTA */}
              <div className="mt-4 pt-1">
                <a
                  href={effectiveWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg bg-[var(--color-ink)] hover:bg-[#25221E] text-white text-xs font-medium tracking-wide border border-[var(--color-gold)]/40 hover:border-[var(--color-gold)] transition-all duration-200 shadow-sm group"
                >
                  <span className="text-[#25D366] group-hover:scale-110 transition-transform">
                    <SocialIcon platform="whatsapp" size="sm" />
                  </span>
                  <span>{effectiveAtelierCta}</span>
                  <svg className="w-3.5 h-3.5 text-[var(--color-gold)] transition-transform group-hover:translate-x-0.5 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              {/* Secondary Atelier Channels (Hotline & Email) */}
              <div className="mt-3.5 pt-3 border-t border-[#EAE4D9]/70 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <a
                  href={`tel:${activePhone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-2 text-[var(--color-slate)] hover:text-[var(--color-gold)] transition-colors py-0.5"
                >
                  <span className="w-5 h-5 rounded-full bg-white border border-[#E5DFD5] text-[var(--color-gold)] flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  <span className="truncate">{effectiveAtelierPhone}</span>
                </a>

                <a
                  href={`mailto:${activeEmail}`}
                  className="inline-flex items-center gap-2 text-[var(--color-slate)] hover:text-[var(--color-gold)] transition-colors py-0.5"
                >
                  <span className="w-5 h-5 rounded-full bg-white border border-[#E5DFD5] text-[var(--color-gold)] flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <span className="truncate">{effectiveAtelierEmail}</span>
                </a>
              </div>

              {/* Atelier Operating Schedule */}
              <div className="mt-2.5 text-[11px] text-[var(--color-mist)] flex items-center gap-1.5 font-light">
                <svg className="w-3 h-3 text-[var(--color-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{effectiveAtelierSchedule}</span>
              </div>
            </div>
            )}

            {/* Social Media Channels */}
            <div className="space-y-2.5 pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)] block">
                {effectiveSocialTitle}
              </span>
              <div className="flex items-center gap-2.5 flex-wrap" role="list" aria-label="Social media channels">
                {effectiveSocialLinks.map((social, sIdx) => (
                  <a
                    key={social.id || `${social.platform}-${sIdx}`}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white border border-[#E5DFD5] text-[var(--color-slate)] hover:bg-[var(--color-gold)] hover:text-white hover:border-[var(--color-gold)] flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-xs"
                    aria-label={social.label || social.platform}
                    title={social.handle || social.label || social.platform}
                  >
                    <SocialIcon platform={(social.icon || social.platform) as any} size="sm" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* =============================================================
              COLUMNS 2-5: NAVIGATION DIRECTORY (Spans 7 columns on desktop)
              Even 4-column sub-grid with airy vertical spacing
              ============================================================= */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 xl:gap-10">
              {effectiveColumns.map((column) => (
                <nav
                  key={column.title}
                  className="space-y-4"
                  aria-label={column.title}
                >
                  <h3 className="font-display text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink)] pb-1.5 border-b border-[#EAE4D9]">
                    {column.title}
                  </h3>
                  <ul className="space-y-2.5" role="list">
                    {column.links.map((link) => (
                      <li key={`${column.title}-${link.label}-${link.href}`}>
                        <Link
                          href={link.href}
                          target={link.external ? '_blank' : undefined}
                          rel={link.external ? 'noopener noreferrer' : undefined}
                          className="group inline-flex items-center gap-1.5 text-xs text-[var(--color-slate)] hover:text-[var(--color-gold)] transition-colors duration-150 leading-relaxed"
                        >
                          <span className="group-hover:translate-x-0.5 transition-transform duration-150">
                            {link.label}
                          </span>
                          {link.badge && (
                            <span
                              className={cn(
                                'text-[9px] font-medium tracking-[0.14em] uppercase px-1.5 py-0.5 rounded-xs border',
                                link.badge === 'New'
                                  ? 'bg-[var(--color-gold-light)]/50 text-[var(--color-gold-hover)] border-[var(--color-gold)]/30'
                                  : link.badge === 'Sale'
                                    ? 'bg-[#FEE2E2]/60 text-[#B91C1C] border-[#FCA5A5]/40'
                                    : 'bg-[#F3F4F6] text-[var(--color-slate)] border-[#E5E7EB]'
                              )}
                            >
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          </div>
        </div>

        {/* =============================================================
            PAYMENT METHODS & ARTISANAL TRUST ASSURANCES ROW
            ============================================================= */}
        <div className="mt-14 pt-8 border-t border-[#EAE4D9] flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-slate)] mr-1">
              Payment Options:
            </span>
            {paymentMethods.map((method) => (
              <div key={method.name} title={method.name}>
                {method.icon}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 xl:gap-7">
            <SecureCheckoutBadge />
            <SilkMarkBadge />
            <ExpressDispatchBadge />
            <ExchangeGuaranteeBadge />
          </div>
        </div>
      </div>

      {/* =============================================================
          SUB-FOOTER: COPYRIGHT & SMOOTH SCROLL TO TOP
          ============================================================= */}
      <div className="border-t border-[#EAE4D9] bg-[#F5F2EC] py-4">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--color-mist)]">
          <p className="text-center sm:text-left text-[var(--color-slate)]">
            {displayCopyright}
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-[var(--color-gold)] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[var(--color-gold)] transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-[var(--color-gold)] transition-colors">
              Cookies
            </Link>
            <Link href="/accessibility" className="hover:text-[var(--color-gold)] transition-colors">
              Accessibility
            </Link>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-[var(--color-gold)] hover:text-[var(--color-gold-hover)] font-medium transition-colors cursor-pointer ml-2"
              aria-label="Scroll back to top"
            >
              <span>Top</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================================
   SIMPLE FOOTER (For minimal checkout/auth flows)
   ========================================================================= */

export interface SimpleFooterProps {
  copyright?: string;
  className?: string;
}

export function SimpleFooter({
  copyright = `© ${new Date().getFullYear()} Angelika Fashions. All rights reserved.`,
  className = '',
}: SimpleFooterProps) {
  return (
    <footer
      className={cn('bg-[#FAF8F5] border-t border-[#EAE4D9] text-[var(--color-ink)]', className)}
      role="contentinfo"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--color-slate)]">
          <p>{copyright}</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[var(--color-gold)] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[var(--color-gold)] transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-[var(--color-gold)] transition-colors">
              Cookie Policy
            </Link>
            <Link href="/contact" className="hover:text-[var(--color-gold)] transition-colors">
              Concierge Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
