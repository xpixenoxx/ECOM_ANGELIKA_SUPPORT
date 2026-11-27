'use client';

import React, { useState, useEffect, useRef } from 'react';
import type {
  FooterContent,
  FooterColumnItem,
  FooterLinkItem,
  FooterPaymentOptions,
  FooterSocialItem,
} from '@/lib/actions/site-content-types';
import {
  Footer,
  BOUTIQUE_DEFAULT_ABOUT_TEXT,
  BOUTIQUE_DEFAULT_BOTTOM_LINKS,
  BOUTIQUE_DEFAULT_COLUMNS,
  BOUTIQUE_DEFAULT_REGIONS,
} from '@/components/composite/Footer';
import { PAYMENT_BADGE_ORDER, PaymentCardBadge } from '@/components/composite/FooterPaymentBadges';
import { SocialIcon } from '@/components/ui/SocialIcon';
import {
  Upload,
  Check,
  RotateCcw,
  Eye,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  Layers,
  CreditCard,
  Globe,
  FileText,
  Sparkles,
  Share2,
  ArrowLeft,
  ArrowRight,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface FooterEditorProps {
  initialContent?: FooterContent;
  onSaved?: (savedData: FooterContent) => void;
  onCancel?: () => void;
}

const AVAILABLE_SOCIAL_ICONS: { value: string; label: string }[] = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'threads', label: 'Threads' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'globe', label: 'Website' },
  { value: 'email', label: 'Email' },
];

const DEFAULT_FOOTER_V2: FooterContent = {
  layoutVersion: 2,
  brandName: 'Angelika',
  brandTagline: 'Fashions',
  logoUrl: '/images/logo.png',
  useLogoImage: false,
  showWatermark: true,
  watermarkText: 'ANGELIKA',
  watermarkSubtitle: 'HANDCRAFTED INDIAN COUTURE',
  backgroundPattern: 'champagne-grid',
  tagline: 'Modern Indian luxury — rooted in craft, elevated for today.',
  aboutText: BOUTIQUE_DEFAULT_ABOUT_TEXT,
  readMoreLabel: 'Read More',
  readMoreHref: '/about',
  showRegionSelector: true,
  regionLabel: 'India (INR ₹)',
  regionOptions: [...BOUTIQUE_DEFAULT_REGIONS],
  showAtelierDesk: false,
  atelierBadge: "VIDHYA'S STYLING ATELIER",
  atelierStatusText: 'Concierge Active',
  atelierTitle: 'Personal Styling & Drape Consultation',
  atelierDescription:
    'Complimentary bespoke drape guidance, custom blouse measurements & festive trousseau curation directly with designer Vidhya.',
  atelierWhatsappCta: 'Connect with Vidhya on WhatsApp',
  atelierWhatsappNumber: '+91 72072 56690',
  atelierWhatsappMessage:
    'Hi Vidhya, I would love personal styling guidance and drape consultation for my order.',
  atelierPhone: '+91 72072 56690',
  atelierEmail: 'hello@angelikafashions.com',
  atelierSchedule: 'Mon – Sat · 10:00 AM – 7:00 PM IST',
  socialTitle: 'Connect With Us',
  socialLinks: [
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
  ],
  columns: JSON.parse(JSON.stringify(BOUTIQUE_DEFAULT_COLUMNS)),
  paymentLabel: 'Payment Options:',
  paymentOptions: {
    amex: true,
    gpay: true,
    upi: true,
    mastercard: true,
    rupay: true,
    visa: true,
    razorpay: true,
    netbanking: true,
    cod: true,
  },
  trustBadges: [],
  copyright: '© 2026 Angelika Fashions.',
  showScrollTop: false,
  scrollTopText: 'Top',
  bottomLinks: JSON.parse(JSON.stringify(BOUTIQUE_DEFAULT_BOTTOM_LINKS)),
};

function isLegacyV1Footer(raw?: Partial<FooterContent>): boolean {
  if (!raw) return false;
  if (raw.layoutVersion === 1) return true;
  if (raw.layoutVersion && raw.layoutVersion >= 2) return false;
  if (raw.aboutText && raw.aboutText.trim().length > 0) return false;
  const colIds = (raw.columns || []).map((c) => c.id);
  return (
    colIds.length === 4 &&
    colIds.includes('col-shop') &&
    colIds.includes('col-concierge') &&
    colIds.includes('col-story') &&
    colIds.includes('col-trust')
  );
}

function hydrateFooterForEditor(raw?: Partial<FooterContent>): { data: FooterContent; upgradedFromLegacy: boolean } {
  if (!raw) {
    return { data: JSON.parse(JSON.stringify(DEFAULT_FOOTER_V2)), upgradedFromLegacy: false };
  }

  const legacy = isLegacyV1Footer(raw);

  const sanitizedSocials: FooterSocialItem[] =
    Array.isArray(raw.socialLinks) && raw.socialLinks.length > 0
      ? raw.socialLinks.map((s, idx) => ({
          ...s,
          id: s.id || `social-${idx}-${s.platform}`,
          icon: s.icon || s.platform,
          href: s.href?.includes('919876543210') ? 'https://wa.me/917207256690' : s.href,
        }))
      : DEFAULT_FOOTER_V2.socialLinks;

  const merged: FooterContent = {
    ...DEFAULT_FOOTER_V2,
    ...raw,
    layoutVersion: 2,
    aboutText: raw.aboutText?.trim() || DEFAULT_FOOTER_V2.aboutText,
    readMoreLabel: raw.readMoreLabel?.trim() || DEFAULT_FOOTER_V2.readMoreLabel,
    readMoreHref: raw.readMoreHref?.trim() || DEFAULT_FOOTER_V2.readMoreHref,
    useLogoImage: Boolean(raw.useLogoImage),
    showWatermark: raw.showWatermark !== false,
    watermarkText: raw.watermarkText?.trim() || DEFAULT_FOOTER_V2.watermarkText,
    watermarkSubtitle: raw.watermarkSubtitle?.trim() || DEFAULT_FOOTER_V2.watermarkSubtitle,
    backgroundPattern:
      raw.backgroundPattern === 'champagne-grid' ||
      raw.backgroundPattern === 'blush-brocade' ||
      raw.backgroundPattern === 'ivory-loom' ||
      raw.backgroundPattern === 'obsidian-grid'
        ? raw.backgroundPattern
        : 'champagne-grid',
    showRegionSelector: raw.showRegionSelector !== false,
    regionLabel: raw.regionLabel?.trim() || DEFAULT_FOOTER_V2.regionLabel,
    regionOptions:
      Array.isArray(raw.regionOptions) && raw.regionOptions.length > 0
        ? raw.regionOptions
        : [...DEFAULT_FOOTER_V2.regionOptions!],
    columns:
      !legacy && Array.isArray(raw.columns) && raw.columns.length > 0
        ? raw.columns
        : JSON.parse(JSON.stringify(DEFAULT_FOOTER_V2.columns)),
    socialLinks: sanitizedSocials,
    paymentOptions: {
      ...DEFAULT_FOOTER_V2.paymentOptions,
      ...(raw.paymentOptions || {}),
    },
    copyright:
      !legacy && raw.copyright?.trim()
        ? raw.copyright.trim()
        : DEFAULT_FOOTER_V2.copyright,
    bottomLinks:
      !legacy && Array.isArray(raw.bottomLinks) && raw.bottomLinks.length > 0
        ? raw.bottomLinks
        : JSON.parse(JSON.stringify(DEFAULT_FOOTER_V2.bottomLinks)),
    showScrollTop: raw.layoutVersion && raw.layoutVersion >= 2 ? Boolean(raw.showScrollTop) : false,
  };

  return { data: merged, upgradedFromLegacy: legacy };
}

export function FooterEditor({ initialContent, onSaved, onCancel }: FooterEditorProps) {
  const [content, setContent] = useState<FooterContent>(() => hydrateFooterForEditor(initialContent).data);
  const [upgradedNotice, setUpgradedNotice] = useState(false);
  const [activeTab, setActiveTab] = useState<'story' | 'columns' | 'social' | 'payments' | 'legal' | 'preview'>('story');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialContent);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newRegionText, setNewRegionText] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialContent) {
      const hydrated = hydrateFooterForEditor(initialContent);
      setContent(hydrated.data);
      setUpgradedNotice(hydrated.upgradedFromLegacy);
      setIsLoading(false);
      return;
    }

    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const data = await res.json();
          if (mounted && data?.success && data.content?.footer) {
            const hydrated = hydrateFooterForEditor(data.content.footer);
            setContent(hydrated.data);
            setUpgradedNotice(hydrated.upgradedFromLegacy);
          }
        }
      } catch (err) {
        console.error('Failed to load footer config:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [initialContent]);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const payload: FooterContent = {
        ...content,
        layoutVersion: 2,
      };
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: 'footer',
          data: payload,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const saved = hydrateFooterForEditor(data.content?.footer || payload).data;
        setContent(saved);
        setUpgradedNotice(false);
        setStatusMessage({
          type: 'success',
          text: 'Jet-Black Boutique Footer saved and synced live across the storefront.',
        });
        onSaved?.(saved);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to save footer.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error while saving footer.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all footer settings to the Jet-Black Boutique defaults?')) {
      setContent(JSON.parse(JSON.stringify(DEFAULT_FOOTER_V2)));
      setStatusMessage({ type: 'success', text: 'Boutique defaults restored. Click "Save & Publish" to apply live.' });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('target', 'logo');
      const res = await fetch('/api/admin/content/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setContent((prev) => ({ ...prev, logoUrl: data.url, useLogoImage: true }));
        setStatusMessage({ type: 'success', text: `Uploaded logo "${file.name}".` });
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Logo upload failed.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error uploading logo.' });
    } finally {
      setIsUploadingLogo(false);
      e.target.value = '';
    }
  };

  // Column handlers
  const handleAddColumn = () => {
    if (content.columns.length >= 4) return;
    setContent((prev) => ({
      ...prev,
      columns: [
        ...prev.columns,
        {
          id: `col-${Date.now()}`,
          title: 'Collections',
          links: [{ label: 'Shop All', href: '/shop' }],
        },
      ],
    }));
  };

  const handleRemoveColumn = (colIdx: number) => {
    if (content.columns.length <= 1) return;
    setContent((prev) => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== colIdx),
    }));
  };

  const handleMoveColumn = (colIdx: number, dir: 'left' | 'right') => {
    const target = dir === 'left' ? colIdx - 1 : colIdx + 1;
    if (target < 0 || target >= content.columns.length) return;
    setContent((prev) => {
      const next = [...prev.columns];
      const a = next[colIdx];
      const b = next[target];
      if (!a || !b) return prev;
      next[colIdx] = b;
      next[target] = a;
      return { ...prev, columns: next };
    });
  };

  const handleUpdateColumnTitle = (colIdx: number, title: string) => {
    setContent((prev) => {
      const next = [...prev.columns];
      const col = next[colIdx];
      if (!col) return prev;
      next[colIdx] = { ...col, title };
      return { ...prev, columns: next };
    });
  };

  const handleAddLink = (colIdx: number) => {
    setContent((prev) => {
      const next = [...prev.columns];
      const col = next[colIdx];
      if (!col) return prev;
      next[colIdx] = { ...col, links: [...col.links, { label: 'New Link', href: '/shop' }] };
      return { ...prev, columns: next };
    });
  };

  const handleUpdateLink = (colIdx: number, linkIdx: number, patch: Partial<FooterLinkItem>) => {
    setContent((prev) => {
      const next = [...prev.columns];
      const col = next[colIdx];
      if (!col) return prev;
      const links = [...col.links];
      const current = links[linkIdx];
      if (!current) return prev;
      links[linkIdx] = { ...current, ...patch };
      next[colIdx] = { ...col, links };
      return { ...prev, columns: next };
    });
  };

  const handleDeleteLink = (colIdx: number, linkIdx: number) => {
    setContent((prev) => {
      const next = [...prev.columns];
      const col = next[colIdx];
      if (!col) return prev;
      next[colIdx] = { ...col, links: col.links.filter((_, i) => i !== linkIdx) };
      return { ...prev, columns: next };
    });
  };

  // Social handlers
  const handleAddSocial = () => {
    setContent((prev) => ({
      ...prev,
      socialLinks: [
        ...prev.socialLinks,
        {
          id: `social-${Date.now()}`,
          platform: 'instagram',
          icon: 'instagram',
          href: 'https://instagram.com/angelikafashions',
          label: 'Instagram',
          handle: '@angelikafashions',
          enabled: true,
        },
      ],
    }));
  };

  const handleUpdateSocial = (idx: number, patch: Partial<FooterSocialItem>) => {
    setContent((prev) => {
      const next = [...prev.socialLinks];
      const cur = next[idx];
      if (!cur) return prev;
      next[idx] = { ...cur, ...patch };
      return { ...prev, socialLinks: next };
    });
  };

  const handleDeleteSocial = (idx: number) => {
    setContent((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== idx),
    }));
  };

  // Region options handlers
  const handleAddRegion = () => {
    const clean = newRegionText.trim();
    if (!clean) return;
    const current = content.regionOptions || [];
    if (current.includes(clean)) {
      setNewRegionText('');
      return;
    }
    setContent((prev) => ({
      ...prev,
      regionOptions: [...(prev.regionOptions || []), clean],
    }));
    setNewRegionText('');
  };

  const handleRemoveRegion = (region: string) => {
    const remaining = (content.regionOptions || []).filter((r) => r !== region);
    if (remaining.length === 0) return;
    setContent((prev) => ({
      ...prev,
      regionOptions: remaining,
      regionLabel: prev.regionLabel === region ? remaining[0] : prev.regionLabel,
    }));
  };

  // Bottom legal links handlers
  const handleAddBottomLink = () => {
    setContent((prev) => ({
      ...prev,
      bottomLinks: [...prev.bottomLinks, { label: 'New Policy', href: '/privacy' }],
    }));
  };

  const handleUpdateBottomLink = (idx: number, patch: Partial<FooterLinkItem>) => {
    setContent((prev) => {
      const next = [...prev.bottomLinks];
      const cur = next[idx];
      if (!cur) return prev;
      next[idx] = { ...cur, ...patch };
      return { ...prev, bottomLinks: next };
    });
  };

  const handleDeleteBottomLink = (idx: number) => {
    setContent((prev) => ({
      ...prev,
      bottomLinks: prev.bottomLinks.filter((_, i) => i !== idx),
    }));
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-[var(--color-gold)] border-t-transparent" />
        <p className="text-xs text-[var(--color-slate)]">Loading Jet-Black Boutique Footer settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <input
        ref={logoInputRef}
        type="file"
        accept="image/png,image/svg+xml,image/webp,image/jpeg"
        className="hidden"
        onChange={handleLogoUpload}
      />

      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-whisper)] pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-gold-text)] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-gold)]" />
            <span>Woven Couture Grid &amp; Watermark Edition</span>
          </span>
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">
            Global Storefront Footer
          </h2>
          <p className="text-xs text-[var(--color-slate)] mt-0.5">
            Manage navigation columns, editorial brand bio, monumental ANGELIKA watermark, couture grid texture, social icons, region selector, payment cards, and policy links.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-medium text-[var(--color-slate)] hover:text-[var(--color-ink)] border border-[var(--color-whisper)] rounded-lg bg-white cursor-pointer"
            >
              Close
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--color-slate)] hover:text-[var(--color-ink)] border border-[var(--color-whisper)] rounded-lg bg-white cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-black hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save & Publish Footer'}</span>
          </button>
        </div>
      </div>

      {/* Legacy Migration Info Banner */}
      {upgradedNotice && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p>
            Your storefront has automatically upgraded to the new <strong>Jet-Black Boutique Footer</strong>. Review your columns, brand story, and payment cards below, then click <strong>Save &amp; Publish Footer</strong> to persist the new structure in Supabase.
          </p>
        </div>
      )}

      {/* Status Notice */}
      {statusMessage && (
        <div
          className={cn(
            'p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3',
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          )}
        >
          <span className="flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 shrink-0" />
            <span>{statusMessage.text}</span>
          </span>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold underline shrink-0"
          >
            <span>View Live</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-[var(--color-whisper)] pb-3">
        {[
          { id: 'story', label: 'Brand Story & Watermark', icon: Sparkles },
          { id: 'columns', label: `Columns (${content.columns.length})`, icon: Layers },
          { id: 'social', label: `Social (${content.socialLinks.filter((s) => s.enabled !== false).length})`, icon: Share2 },
          { id: 'payments', label: 'Payments & Region', icon: CreditCard },
          { id: 'legal', label: 'Legal & Copyright', icon: FileText },
          { id: 'preview', label: 'Live Couture Preview', icon: Eye },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
                active
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-[#F5F2EC] text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[#EAE4D9]'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BRAND STORY & WORDMARK */}
      {activeTab === 'story' && (
        <div className="space-y-5">
          <div className="bg-[#FAF8F5] border border-[#EAE4D9] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">
              Right Column Editorial Narrative
            </h3>
            <div>
              <label htmlFor="footer-about-text" className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                Boutique Brand Story Paragraph
              </label>
              <textarea
                id="footer-about-text"
                rows={4}
                value={content.aboutText || ''}
                onChange={(e) => setContent({ ...content, aboutText: e.target.value })}
                placeholder="Angelika Fashions is an independent Indian luxury couture house..."
                className="w-full px-3 py-2 text-xs leading-relaxed border border-[var(--color-whisper)] rounded-lg bg-white focus:outline-none focus:border-[var(--color-gold)]"
              />
              <p className="text-[11px] text-[var(--color-slate)] mt-1">
                Displayed in crisp white on the right column directly above the brand wordmark.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="footer-readmore-label" className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                  Inline Link Text
                </label>
                <input
                  id="footer-readmore-label"
                  type="text"
                  value={content.readMoreLabel || ''}
                  onChange={(e) => setContent({ ...content, readMoreLabel: e.target.value })}
                  placeholder="Read More"
                  className="w-full px-3 py-2 text-xs border border-[var(--color-whisper)] rounded-lg bg-white focus:outline-none focus:border-[var(--color-gold)]"
                />
              </div>
              <div>
                <label htmlFor="footer-readmore-href" className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                  Inline Link Destination
                </label>
                <input
                  id="footer-readmore-href"
                  type="text"
                  value={content.readMoreHref || ''}
                  onChange={(e) => setContent({ ...content, readMoreHref: e.target.value })}
                  placeholder="/about"
                  className="w-full px-3 py-2 text-xs font-mono border border-[var(--color-whisper)] rounded-lg bg-white focus:outline-none focus:border-[var(--color-gold)]"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#FAF8F5] border border-[#EAE4D9] rounded-xl p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                  Monumental Brand Watermark &amp; Woven Couture Background
                </h3>
                <p className="text-xs text-[var(--color-slate)] mt-0.5">
                  Replaces the small side wordmark with a full-width embossed couture watermark over a tailored women&apos;s fashion woven grid canvas.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-ink)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={content.showWatermark !== false}
                  onChange={(e) => setContent({ ...content, showWatermark: e.target.checked })}
                  className="w-4 h-4 accent-[#161310]"
                />
                <span>Show Watermark</span>
              </label>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="footer-brand-name" className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                  House Name (Bio Heading)
                </label>
                <input
                  id="footer-brand-name"
                  type="text"
                  value={content.brandName}
                  onChange={(e) => setContent({ ...content, brandName: e.target.value })}
                  placeholder="Angelika"
                  className="w-full px-3 py-2 text-xs font-semibold border border-[var(--color-whisper)] rounded-lg bg-white focus:outline-none focus:border-[var(--color-gold)]"
                />
              </div>

              <div>
                <label htmlFor="footer-watermark-text" className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                  Premium Watermark Title
                </label>
                <input
                  id="footer-watermark-text"
                  type="text"
                  value={content.watermarkText ?? 'ANGELIKA'}
                  onChange={(e) => setContent({ ...content, watermarkText: e.target.value })}
                  placeholder="ANGELIKA"
                  className="w-full px-3 py-2 text-xs font-semibold uppercase tracking-widest border border-[var(--color-whisper)] rounded-lg bg-white focus:outline-none focus:border-[var(--color-gold)]"
                />
              </div>

              <div>
                <label htmlFor="footer-watermark-subtitle" className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                  Watermark Micro-Signature
                </label>
                <input
                  id="footer-watermark-subtitle"
                  type="text"
                  value={content.watermarkSubtitle ?? 'HANDCRAFTED INDIAN COUTURE'}
                  onChange={(e) => setContent({ ...content, watermarkSubtitle: e.target.value })}
                  placeholder="HANDCRAFTED INDIAN COUTURE"
                  className="w-full px-3 py-2 text-xs uppercase tracking-wider border border-[var(--color-whisper)] rounded-lg bg-white focus:outline-none focus:border-[var(--color-gold)]"
                />
              </div>
            </div>

            {/* Woven Couture Background Pattern Selector */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-[var(--color-ink)]">
                Footer Woven Background Texture
              </span>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    id: 'champagne-grid' as const,
                    label: 'Champagne Silk Grid',
                    desc: 'Warm sunlit silk + zari diamond lattice (Recommended)',
                    swatchClass: 'couture-footer-champagne-grid',
                  },
                  {
                    id: 'blush-brocade' as const,
                    label: 'Blush Rose Brocade',
                    desc: 'Soft blush-ivory + rose-gold atelier grid',
                    swatchClass: 'couture-footer-blush-brocade',
                  },
                  {
                    id: 'ivory-loom' as const,
                    label: 'Porcelain Ivory Loom',
                    desc: 'Airy architectural drafting grid on warm ivory',
                    swatchClass: 'couture-footer-ivory-loom',
                  },
                  {
                    id: 'obsidian-grid' as const,
                    label: 'Obsidian Brocade (Dark)',
                    desc: 'Deep espresso-black + antique gold lattice',
                    swatchClass: 'couture-footer-obsidian-grid',
                  },
                ].map((opt) => {
                  const active = (content.backgroundPattern || 'champagne-grid') === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setContent({ ...content, backgroundPattern: opt.id })}
                      className={cn(
                        'p-3 rounded-xl border text-left transition-all cursor-pointer',
                        active
                          ? 'border-[#8C6A16] bg-white ring-2 ring-[#C9A84C]/35 shadow-xs'
                          : 'border-[#E5DFD5] bg-white/80 hover:border-[#C9A84C]'
                      )}
                    >
                      <div className={cn('h-12 w-full rounded-lg border border-[#C5AE84] mb-2.5', opt.swatchClass)} />
                      <span className="block text-xs font-bold text-[#11100E]">{opt.label}</span>
                      <span className="block text-[11px] text-[#5B554D] mt-0.5 leading-snug">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Embossed Watermark Preview Strip */}
            <div
              className={cn(
                'p-6 rounded-xl border border-[#C5AE84] text-center overflow-hidden',
                content.backgroundPattern === 'blush-brocade'
                  ? 'couture-footer-blush-brocade'
                  : content.backgroundPattern === 'ivory-loom'
                  ? 'couture-footer-ivory-loom'
                  : content.backgroundPattern === 'obsidian-grid'
                  ? 'couture-footer-obsidian-grid'
                  : 'couture-footer-champagne-grid'
              )}
            >
              <span
                className={cn(
                  'text-[10px] font-bold uppercase tracking-[0.34em] block mb-2',
                  content.backgroundPattern === 'obsidian-grid' ? 'text-[#D8B454]/80' : 'text-[#7A580D]'
                )}
              >
                ◆ {content.watermarkSubtitle || 'HANDCRAFTED INDIAN COUTURE'} ◆
              </span>
              <span
                className={cn(
                  'block text-5xl sm:text-6xl font-bold uppercase tracking-[0.2em] leading-none',
                  content.backgroundPattern === 'obsidian-grid'
                    ? 'angelika-footer-watermark-dark'
                    : 'angelika-footer-watermark'
                )}
              >
                {(content.watermarkText || content.brandName || 'ANGELIKA').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NAVIGATION COLUMNS */}
      {activeTab === 'columns' && (
        <div className="space-y-5">
          <div className="bg-[#FAF8F5] border border-[#EAE4D9] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                Editorial Footer Columns ({content.columns.length}/4)
              </h3>
              <p className="text-xs text-[var(--color-slate)]">
                2 crisp columns (e.g. Customer Care &amp; About Angelika) match the reference boutique aesthetic best; up to 4 columns are supported.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddColumn}
              disabled={content.columns.length >= 4}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-black hover:bg-neutral-800 rounded-lg disabled:opacity-40 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Column</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {content.columns.map((column: FooterColumnItem, colIndex: number) => (
              <div
                key={column.id || colIndex}
                className="bg-white border border-[#E5DFD5] rounded-xl p-4 shadow-2xs space-y-4"
              >
                <div className="flex items-end justify-between gap-2 pb-3 border-b border-[#EAE4D9]">
                  <div className="flex-1">
                    <label
                      htmlFor={`col-title-${colIndex}`}
                      className="block text-[10px] font-bold text-[var(--color-slate)] uppercase tracking-wider mb-1"
                    >
                      Column {colIndex + 1} Heading
                    </label>
                    <input
                      id={`col-title-${colIndex}`}
                      type="text"
                      value={column.title}
                      onChange={(e) => handleUpdateColumnTitle(colIndex, e.target.value)}
                      placeholder="Customer Care"
                      className="w-full px-2.5 py-1.5 text-xs font-semibold text-[var(--color-ink)] border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)]"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveColumn(colIndex, 'left')}
                      disabled={colIndex === 0}
                      className="p-1.5 rounded hover:bg-stone-100 text-[var(--color-slate)] disabled:opacity-30 cursor-pointer"
                      aria-label={`Move column ${colIndex + 1} left`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveColumn(colIndex, 'right')}
                      disabled={colIndex === content.columns.length - 1}
                      className="p-1.5 rounded hover:bg-stone-100 text-[var(--color-slate)] disabled:opacity-30 cursor-pointer"
                      aria-label={`Move column ${colIndex + 1} right`}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveColumn(colIndex)}
                      disabled={content.columns.length <= 1}
                      className="p-1.5 rounded hover:bg-rose-50 text-rose-500 disabled:opacity-30 cursor-pointer"
                      aria-label={`Delete column ${colIndex + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                  {column.links.map((link, linkIndex) => (
                    <div
                      key={linkIndex}
                      className="p-2.5 bg-[#FAF8F5] border border-[#EAE4D9] rounded-lg space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => handleUpdateLink(colIndex, linkIndex, { label: e.target.value })}
                          placeholder="Link label"
                          className="flex-1 px-2.5 py-1 text-xs border border-[var(--color-whisper)] rounded bg-white font-medium focus:outline-none focus:border-[var(--color-gold)]"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteLink(colIndex, linkIndex)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                          aria-label={`Delete link ${link.label}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-8">
                          <input
                            type="text"
                            value={link.href}
                            onChange={(e) => handleUpdateLink(colIndex, linkIndex, { href: e.target.value })}
                            placeholder="/shipping or https://..."
                            className="w-full px-2.5 py-1 text-[11px] font-mono border border-[var(--color-whisper)] rounded bg-white focus:outline-none focus:border-[var(--color-gold)]"
                          />
                        </div>
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={link.badge || ''}
                            onChange={(e) => handleUpdateLink(colIndex, linkIndex, { badge: e.target.value })}
                            placeholder="Badge (opt.)"
                            className="w-full px-2 py-1 text-[11px] border border-[var(--color-whisper)] rounded bg-white focus:outline-none focus:border-[var(--color-gold)]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleAddLink(colIndex)}
                  className="w-full py-1.5 text-xs font-medium text-[var(--color-gold-text)] bg-[#FAF6EE] hover:bg-[#F3EBD8] border border-[#E2D6C1] rounded-lg inline-flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Link to {column.title || 'Column'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SOCIAL CHANNELS */}
      {activeTab === 'social' && (
        <div className="bg-[#FAF8F5] border border-[#EAE4D9] rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE4D9]">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                Monochrome White Social Icons (Below Wordmark)
              </h3>
              <p className="text-xs text-[var(--color-slate)]">
                Displayed directly beneath the bold ANGELIKA wordmark on the black footer canvas.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddSocial}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-black hover:bg-neutral-800 rounded-lg cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Channel</span>
            </button>
          </div>

          <div className="space-y-3">
            {content.socialLinks.map((social, idx) => (
              <div
                key={social.id || `${social.platform}-${idx}`}
                className="p-3.5 bg-white border border-[#E5DFD5] rounded-xl flex flex-col lg:flex-row lg:items-center gap-3"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={social.enabled !== false}
                    onChange={(e) => handleUpdateSocial(idx, { enabled: e.target.checked })}
                    aria-label={`Enable ${social.label || social.platform}`}
                    className="w-4 h-4 accent-black cursor-pointer"
                  />
                  <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                    <SocialIcon platform={(social.icon || social.platform) as any} size="sm" />
                  </div>
                </div>

                <div className="flex-1 grid sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    value={social.label || ''}
                    onChange={(e) => handleUpdateSocial(idx, { label: e.target.value })}
                    placeholder="Instagram"
                    className="px-2.5 py-1.5 text-xs font-medium border border-[var(--color-whisper)] rounded-lg bg-white"
                  />
                  <select
                    value={(social.icon || social.platform || 'instagram').toLowerCase()}
                    onChange={(e) => handleUpdateSocial(idx, { icon: e.target.value, platform: e.target.value })}
                    className="px-2.5 py-1.5 text-xs border border-[var(--color-whisper)] rounded-lg bg-white"
                  >
                    {AVAILABLE_SOCIAL_ICONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={social.href}
                    onChange={(e) => handleUpdateSocial(idx, { href: e.target.value })}
                    placeholder="https://..."
                    className="px-2.5 py-1.5 text-xs font-mono border border-[var(--color-whisper)] rounded-lg bg-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteSocial(idx)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer self-end lg:self-auto"
                  aria-label={`Delete ${social.label || social.platform}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENT CARDS & REGION SELECTOR */}
      {activeTab === 'payments' && (
        <div className="space-y-5">
          {/* Payment Badges */}
          <div className="bg-[#FAF8F5] border border-[#EAE4D9] rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-ink)] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[var(--color-gold-text)]" />
                <span>Payment Method Card Badges (Bottom-Right Strip)</span>
              </h3>
              <p className="text-xs text-[var(--color-slate)] mt-0.5">
                Choose which full-color payment card emblems appear in the jet-black footer bar.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PAYMENT_BADGE_ORDER.map((badge) => {
                const isChecked = content.paymentOptions?.[badge.key] !== false;
                return (
                  <label
                    key={badge.key}
                    className={cn(
                      'p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all',
                      isChecked
                        ? 'bg-white border-black shadow-2xs'
                        : 'bg-[#F3EFE8] border-[#E5DFD5] opacity-65'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          paymentOptions: {
                            ...content.paymentOptions,
                            [badge.key]: e.target.checked,
                          } as FooterPaymentOptions,
                        })
                      }
                      className="w-4 h-4 accent-black"
                    />
                    <span className="p-1.5 rounded bg-black flex items-center justify-center shrink-0">
                      <PaymentCardBadge type={badge.key} />
                    </span>
                    <span className="text-xs font-medium text-[var(--color-ink)] truncate">
                      {badge.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Region / Currency Selector */}
          <div className="bg-[#FAF8F5] border border-[#EAE4D9] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-ink)] flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[var(--color-gold-text)]" />
                  <span>Country / Currency Selector (Bottom-Left White Pill)</span>
                </h3>
                <p className="text-xs text-[var(--color-slate)] mt-0.5">
                  Crisp white rectangular selector box matching the luxury boutique reference.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={content.showRegionSelector !== false}
                  onChange={(e) => setContent({ ...content, showRegionSelector: e.target.checked })}
                  className="w-4 h-4 accent-black"
                />
                <span>Visible</span>
              </label>
            </div>

            {content.showRegionSelector !== false && (
              <div className="space-y-4 pt-2 border-t border-[#EAE4D9]">
                <div>
                  <label htmlFor="footer-default-region" className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                    Default Selected Region
                  </label>
                  <select
                    id="footer-default-region"
                    value={content.regionLabel || (content.regionOptions?.[0] ?? 'India (INR ₹)')}
                    onChange={(e) => setContent({ ...content, regionLabel: e.target.value })}
                    className="w-full sm:w-80 px-3 py-2 text-xs border border-[var(--color-whisper)] rounded-lg bg-white"
                  >
                    {(content.regionOptions || BOUTIQUE_DEFAULT_REGIONS).map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-[var(--color-ink)]">
                    Dropdown Options
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(content.regionOptions || BOUTIQUE_DEFAULT_REGIONS).map((region) => (
                      <span
                        key={region}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#E5DFD5] text-xs font-medium text-[var(--color-ink)]"
                      >
                        <span>{region}</span>
                        {(content.regionOptions || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRegion(region)}
                            className="text-rose-500 hover:text-rose-700 cursor-pointer"
                            aria-label={`Remove ${region}`}
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 max-w-md pt-1">
                    <input
                      type="text"
                      value={newRegionText}
                      onChange={(e) => setNewRegionText(e.target.value)}
                      placeholder="e.g. Singapore (SGD S$)"
                      className="flex-1 px-3 py-1.5 text-xs border border-[var(--color-whisper)] rounded-lg bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddRegion}
                      className="px-3 py-1.5 text-xs font-medium bg-black text-white rounded-lg cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: LEGAL & COPYRIGHT */}
      {activeTab === 'legal' && (
        <div className="bg-[#FAF8F5] border border-[#EAE4D9] rounded-xl p-5 space-y-5">
          <div>
            <label htmlFor="footer-copyright" className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
              Copyright Line (Bottom-Left)
            </label>
            <input
              id="footer-copyright"
              type="text"
              value={content.copyright}
              onChange={(e) => setContent({ ...content, copyright: e.target.value })}
              placeholder="© 2026 Angelika Fashions."
              className="w-full px-3 py-2 text-xs border border-[var(--color-whisper)] rounded-lg bg-white focus:outline-none focus:border-[var(--color-gold)]"
            />
          </div>

          <div className="pt-3 border-t border-[#EAE4D9] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                Bottom-Right Policy Links
              </h4>
              <button
                type="button"
                onClick={handleAddBottomLink}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-black text-white rounded-lg cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Policy Link</span>
              </button>
            </div>

            <div className="space-y-2">
              {content.bottomLinks.map((link, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 bg-white border border-[#E5DFD5] rounded-lg"
                >
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => handleUpdateBottomLink(idx, { label: e.target.value })}
                    placeholder="Terms of Service"
                    className="w-44 px-2.5 py-1 text-xs font-medium border border-[var(--color-whisper)] rounded"
                  />
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => handleUpdateBottomLink(idx, { href: e.target.value })}
                    placeholder="/terms"
                    className="flex-1 px-2.5 py-1 text-xs font-mono border border-[var(--color-whisper)] rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteBottomLink(idx)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                    aria-label={`Delete ${link.label}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#EAE4D9] flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={content.showScrollTop === true}
                onChange={(e) => setContent({ ...content, showScrollTop: e.target.checked })}
                className="w-4 h-4 accent-black"
              />
              <span className="text-xs font-medium text-[var(--color-ink)]">
                Show subtle &quot;Top ↑&quot; button in legal row
              </span>
            </label>
          </div>
        </div>
      )}

      {/* TAB 6: LIVE STOREFRONT PREVIEW */}
      {activeTab === 'preview' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-neutral-950 text-neutral-200 rounded-xl text-xs border border-neutral-800">
            <span className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Exact Live Storefront Footer Preview (Jet-Black Boutique Edition)</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#C9A84C]">
              angelikafashions.com
            </span>
          </div>

          <div className="rounded-2xl overflow-hidden border border-neutral-800 shadow-xl bg-black">
            <div className="bg-neutral-900 px-4 py-2 border-b border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 inline-block" />
              </div>
              <span className="font-mono">https://angelikafashions.com</span>
              <span className="text-[10px] text-neutral-500">Live Component</span>
            </div>

            <Footer content={content} />
          </div>
        </div>
      )}
    </div>
  );
}
