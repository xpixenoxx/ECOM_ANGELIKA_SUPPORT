'use client';

import React, { useState, useEffect, useRef } from 'react';
import type {
  FooterContent,
  FooterColumnItem,
  FooterLinkItem,
  FooterSocialItem,
  FooterTrustBadgeItem,
} from '@/lib/actions/site-content';
import { SocialIcon } from '@/components/ui/SocialIcon';
import {
  Upload,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Eye,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  Sparkles,
  Shield,
  Truck,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  HelpCircle,
  ChevronRight,
  Layers,
  ArrowUp,
  CreditCard,
  Building,
  HeartHandshake,
} from 'lucide-react';

interface FooterEditorProps {
  initialContent?: FooterContent;
  onSaved?: (savedData: FooterContent) => void;
  onCancel?: () => void;
}

const DEFAULT_FOOTER_CONTENT: FooterContent = {
  brandName: 'Angelika',
  brandTagline: 'Fashions',
  logoUrl: '/images/logo.png',
  tagline: 'Modern Indian luxury — rooted in craft, elevated for today.',
  showAtelierDesk: true,
  atelierBadge: "VIDHYA'S STYLING ATELIER",
  atelierStatusText: 'Concierge Active',
  atelierTitle: 'Personal Styling & Drape Consultation',
  atelierDescription: 'Complimentary bespoke drape guidance, custom blouse measurements & festive trousseau curation directly with designer Vidhya.',
  atelierWhatsappCta: 'Connect with Vidhya on WhatsApp',
  atelierWhatsappNumber: '+91 98765 43210',
  atelierWhatsappMessage: 'Hi Vidhya, I would love personal styling guidance and drape consultation for my order.',
  atelierPhone: '+91 98765 43210',
  atelierEmail: 'hallo@angelikafashions.com',
  atelierSchedule: 'Mon – Sat · 10:00 AM – 7:00 PM IST · Direct atelier response',
  socialTitle: 'Connect With Us',
  socialLinks: [
    { platform: 'instagram', href: 'https://instagram.com/angelikafashions', label: 'Instagram', handle: '@angelikafashions', enabled: true },
    { platform: 'whatsapp', href: 'https://wa.me/919876543210', label: 'WhatsApp Concierge', handle: 'Chat with Vidhya', enabled: true },
    { platform: 'facebook', href: 'https://facebook.com/angelikafashions', label: 'Facebook', handle: 'Angelika Fashions', enabled: true },
    { platform: 'pinterest', href: 'https://pinterest.com/angelikafashions', label: 'Pinterest', handle: 'Angelika Haute Couture', enabled: true },
    { platform: 'youtube', href: 'https://youtube.com/angelikafashions', label: 'YouTube', handle: 'Angelika Atelier', enabled: true },
  ],
  columns: [
    {
      id: 'col-shop',
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
      id: 'col-concierge',
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
      id: 'col-story',
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
      id: 'col-trust',
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
  ],
  paymentLabel: 'Payment Options:',
  paymentOptions: {
    upi: true,
    visa: true,
    mastercard: true,
    rupay: true,
    netbanking: true,
    cod: true,
    amex: true,
  },
  trustBadges: [
    { id: 'tb-ssl', text: '256-Bit SSL Encrypted Checkout', icon: 'ssl', enabled: true },
    { id: 'tb-handloom', text: '100% Certified Authentic Handloom', icon: 'handloom', enabled: true },
    { id: 'tb-shipping', text: 'Pan-India Express & Global Shipping', icon: 'shipping', enabled: true },
    { id: 'tb-exchange', text: '7-Day Complimentary Size Exchange', icon: 'exchange', enabled: true },
  ],
  copyright: '© 2026 Angelika. All rights reserved. Handcrafted with reverence for Indian heritage.',
  showScrollTop: true,
  scrollTopText: 'Top',
  bottomLinks: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Cookies', href: '/cookies' },
    { label: 'Accessibility', href: '/accessibility' },
  ],
};

const PRESET_LOGOS = [
  { label: 'Standard Logo (/images/logo.png)', url: '/images/logo.png' },
  { label: 'Hero Atelier Emblem', url: '/images/logo-gold.png' },
];

export function FooterEditor({ initialContent, onSaved, onCancel }: FooterEditorProps) {
  const [activeTab, setActiveTab] = useState<'brand' | 'columns' | 'social' | 'payments' | 'legal' | 'preview'>('brand');
  const [content, setContent] = useState<FooterContent>(() => {
    return initialContent || DEFAULT_FOOTER_CONTENT;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Logo file upload ref
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Fetch site content if initialContent is not fully provided
  useEffect(() => {
    async function loadData() {
      if (!initialContent) {
        setIsLoading(true);
        try {
          const res = await fetch('/api/admin/content');
          const json = await res.json();
          if (json?.content?.footer) {
            setContent(json.content.footer);
          }
        } catch (e) {
          console.error('Failed to load footer content:', e);
        } finally {
          setIsLoading(false);
        }
      }
    }
    loadData();
  }, [initialContent]);

  // Handle local device image upload for logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert('Image must be under 4MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setContent((prev) => ({
            ...prev,
            logoUrl: event.target!.result as string,
          }));
          setStatusMessage({ type: 'success', text: 'Logo uploaded from device!' });
          setTimeout(() => setStatusMessage(null), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save handler
  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId: 'footer', data: content }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: 'Footer updated successfully!' });
        if (onSaved) onSaved(content);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to save footer' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error saving footer' });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    if (confirm('Reset footer to default configuration?')) {
      setContent(DEFAULT_FOOTER_CONTENT);
      setStatusMessage({ type: 'success', text: 'Reset to default footer settings' });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Column helpers
  const handleUpdateColumnTitle = (colIndex: number, title: string) => {
    setContent((prev) => {
      const newCols = prev.columns.map((col, idx) => {
        if (idx === colIndex) {
          return { ...col, title };
        }
        return col;
      });
      return { ...prev, columns: newCols };
    });
  };

  const handleUpdateLink = (colIndex: number, linkIndex: number, field: keyof FooterLinkItem, value: any) => {
    setContent((prev) => {
      const newCols = prev.columns.map((col, cIdx) => {
        if (cIdx !== colIndex) return col;
        const newLinks = col.links.map((link, lIdx) => {
          if (lIdx !== linkIndex) return link;
          return { ...link, [field]: value } as FooterLinkItem;
        });
        return { ...col, links: newLinks };
      });
      return { ...prev, columns: newCols };
    });
  };

  const handleAddLink = (colIndex: number) => {
    setContent((prev) => {
      const newCols = prev.columns.map((col, idx) => {
        if (idx !== colIndex) return col;
        return {
          ...col,
          links: [...col.links, { label: 'New Link', href: '/shop', badge: '' }],
        };
      });
      return { ...prev, columns: newCols };
    });
  };

  const handleDeleteLink = (colIndex: number, linkIndex: number) => {
    setContent((prev) => {
      const newCols = prev.columns.map((col, idx) => {
        if (idx !== colIndex) return col;
        return {
          ...col,
          links: col.links.filter((_, lIdx) => lIdx !== linkIndex),
        };
      });
      return { ...prev, columns: newCols };
    });
  };

  // Social link helpers
  const handleUpdateSocial = (platform: string, field: string, value: any) => {
    setContent((prev) => {
      const updated = prev.socialLinks.map((s) => {
        if (s.platform === platform) {
          return { ...s, [field]: value };
        }
        return s;
      });
      return { ...prev, socialLinks: updated };
    });
  };

  // Trust badge helper
  const handleUpdateTrustBadge = (badgeId: string, field: string, value: any) => {
    setContent((prev) => {
      const updated = prev.trustBadges.map((b) => {
        if (b.id === badgeId) {
          return { ...b, [field]: value };
        }
        return b;
      });
      return { ...prev, trustBadges: updated };
    });
  };

  // Bottom links helpers
  const handleUpdateBottomLink = (index: number, field: keyof FooterLinkItem, value: any) => {
    setContent((prev) => {
      const updated = prev.bottomLinks.map((link, i) => {
        if (i !== index) return link;
        return { ...link, [field]: value } as FooterLinkItem;
      });
      return { ...prev, bottomLinks: updated };
    });
  };

  const handleAddBottomLink = () => {
    setContent((prev) => ({
      ...prev,
      bottomLinks: [...prev.bottomLinks, { label: 'New Policy', href: '/policy' }],
    }));
  };

  const handleDeleteBottomLink = (index: number) => {
    setContent((prev) => ({
      ...prev,
      bottomLinks: prev.bottomLinks.filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-sm text-[var(--color-slate)]">
        Loading footer settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-whisper)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-display font-medium text-[var(--color-ink)]">
              Footer Content Manager
            </h2>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/30">
              Live Storefront
            </span>
          </div>
          <p className="text-xs text-[var(--color-slate)] mt-0.5">
            Modify brand identity, Vidhya&apos;s styling atelier desk, 4 directory columns, payment options, trust assurances, and legal details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 text-xs text-[var(--color-slate)] hover:text-[var(--color-ink)] border border-[var(--color-whisper)] rounded-lg hover:bg-[var(--color-snow)] transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs text-[var(--color-slate)] hover:text-[var(--color-ink)] border border-[var(--color-whisper)] rounded-lg hover:bg-[var(--color-snow)] transition-colors"
            >
              Close
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 text-xs font-medium text-white bg-[var(--color-ink)] hover:bg-[#2A2621] rounded-lg transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <HelpCircle className="w-4 h-4 text-rose-600" />
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-[10px] uppercase font-bold tracking-wider hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-[var(--color-whisper)] gap-1 overflow-x-auto pb-px">
        {[
          { id: 'brand', label: '1. Brand & Atelier Desk', icon: Building },
          { id: 'columns', label: '2. Directory Columns (4)', icon: Layers },
          { id: 'social', label: '3. Social Channels', icon: MessageCircle },
          { id: 'payments', label: '4. Payments & Trust', icon: Shield },
          { id: 'legal', label: '5. Sub-Footer & Legal', icon: HeartHandshake },
          { id: 'preview', label: '6. Live Storefront Preview', icon: Eye },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/5'
                  : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:border-black/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BRAND IDENTITY & ATELIER DESK */}
      {activeTab === 'brand' && (
        <div className="space-y-6">
          <div className="bg-[#FAF8F5] border border-[#EAE4D9] rounded-xl p-5 space-y-5">
            <h3 className="text-sm font-semibold text-[var(--color-ink)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--color-gold)]" />
              <span>Brand Emblem & Headline</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={content.brandName}
                  onChange={(e) => setContent({ ...content, brandName: e.target.value })}
                  placeholder="Angelika"
                  className="w-full px-3 py-2 text-xs border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                  Brand Subtitle / Department
                </label>
                <input
                  type="text"
                  value={content.brandTagline}
                  onChange={(e) => setContent({ ...content, brandTagline: e.target.value })}
                  placeholder="Fashions"
                  className="w-full px-3 py-2 text-xs border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] bg-white"
                />
              </div>
            </div>

            {/* Logo Image with Device Upload */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                Logo Emblem Image
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-white border border-[#E5DFD5] p-1.5 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <img
                    src={content.logoUrl || '/images/logo.png'}
                    alt="Logo preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex-1 w-full space-y-2">
                  <input
                    type="text"
                    value={content.logoUrl}
                    onChange={(e) => setContent({ ...content, logoUrl: e.target.value })}
                    placeholder="/images/logo.png"
                    className="w-full px-3 py-2 text-xs border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] bg-white font-mono"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-2.5 py-1 text-[11px] bg-white hover:bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/40 rounded flex items-center gap-1.5 font-medium transition-colors"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload from this Device</span>
                    </button>
                    {PRESET_LOGOS.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setContent({ ...content, logoUrl: preset.url })}
                        className="px-2 py-1 text-[10px] text-[var(--color-slate)] hover:text-[var(--color-ink)] bg-[#F5F2EC] rounded border border-[#E5DFD5] hover:border-black/20"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tagline Paragraph */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                Tagline / Brand Intro Paragraph
              </label>
              <textarea
                rows={2}
                value={content.tagline}
                onChange={(e) => setContent({ ...content, tagline: e.target.value })}
                placeholder="Modern Indian luxury — rooted in craft, elevated for today."
                className="w-full px-3 py-2 text-xs border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] bg-white leading-relaxed"
              />
            </div>
          </div>

          {/* Vidhya's Styling Atelier Consultation Card */}
          <div className="bg-[#FAF8F5] border border-[#EAE4D9] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE4D9]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
                <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                  Vidhya&apos;s Styling Atelier Concierge Card
                </h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={content.showAtelierDesk !== false}
                  onChange={(e) => setContent({ ...content, showAtelierDesk: e.target.checked })}
                  className="w-4 h-4 rounded text-[var(--color-gold)] accent-[var(--color-gold)]"
                />
                <span className="text-xs font-medium text-[var(--color-slate)]">
                  Display Card on Footer
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                  Card Eyebrow Badge
                </label>
                <input
                  type="text"
                  value={content.atelierBadge}
                  onChange={(e) => setContent({ ...content, atelierBadge: e.target.value })}
                  placeholder="VIDHYA'S STYLING ATELIER"
                  className="w-full px-3 py-2 text-xs border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] bg-white uppercase tracking-wider"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                  Status Indicator Badge
                </label>
                <input
                  type="text"
                  value={content.atelierStatusText}
                  onChange={(e) => setContent({ ...content, atelierStatusText: e.target.value })}
                  placeholder="Concierge Active"
                  className="w-full px-3 py-2 text-xs border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                Consultation Title
              </label>
              <input
                type="text"
                value={content.atelierTitle}
                onChange={(e) => setContent({ ...content, atelierTitle: e.target.value })}
                placeholder="Personal Styling & Drape Consultation"
                className="w-full px-3 py-2 text-xs border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] bg-white font-serif"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                Consultation Description
              </label>
              <textarea
                rows={2}
                value={content.atelierDescription}
                onChange={(e) => setContent({ ...content, atelierDescription: e.target.value })}
                placeholder="Complimentary bespoke drape guidance, custom blouse measurements & festive trousseau curation directly with designer Vidhya."
                className="w-full px-3 py-2 text-xs border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] bg-white leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                  WhatsApp Button Text
                </label>
                <input
                  type="text"
                  value={content.atelierWhatsappCta}
                  onChange={(e) => setContent({ ...content, atelierWhatsappCta: e.target.value })}
                  placeholder="Connect with Vidhya on WhatsApp"
                  className="w-full px-3 py-2 text-xs border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                  WhatsApp Phone Number (with Country Code)
                </label>
                <input
                  type="text"
                  value={content.atelierWhatsappNumber}
                  onChange={(e) => setContent({ ...content, atelierWhatsappNumber: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-xs border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] bg-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                WhatsApp Default Greeting Message
              </label>
              <input
                type="text"
                value={content.atelierWhatsappMessage}
                onChange={(e) => setContent({ ...content, atelierWhatsappMessage: e.target.value })}
                placeholder="Hi Vidhya, I would love personal styling guidance and drape consultation for my order."
                className="w-full px-3 py-2 text-xs border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                  Direct Atelier Phone Hotline
                </label>
                <input
                  type="text"
                  value={content.atelierPhone}
                  onChange={(e) => setContent({ ...content, atelierPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-xs border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                  Atelier Email
                </label>
                <input
                  type="email"
                  value={content.atelierEmail}
                  onChange={(e) => setContent({ ...content, atelierEmail: e.target.value })}
                  placeholder="hallo@angelikafashions.com"
                  className="w-full px-3 py-2 text-xs border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] bg-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                Atelier Schedule & Response Hours
              </label>
              <input
                type="text"
                value={content.atelierSchedule}
                onChange={(e) => setContent({ ...content, atelierSchedule: e.target.value })}
                placeholder="Mon – Sat · 10:00 AM – 7:00 PM IST · Direct atelier response"
                className="w-full px-3 py-2 text-xs border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIRECTORY NAVIGATION COLUMNS (All 4 Columns) */}
      {activeTab === 'columns' && (
        <div className="space-y-6">
          <div className="bg-[#FAF8F5] border border-[#EAE4D9] rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                4 Directory Columns (Shop, Concierge, Atelier Story, Policies)
              </h3>
              <p className="text-xs text-[var(--color-slate)]">
                Edit column titles, add or remove links, update target routes, and assign special luxury badges (e.g. NEW, CURATED, SALE).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.columns.map((column, colIndex) => (
              <div
                key={column.id || colIndex}
                className="bg-white border border-[#E5DFD5] rounded-xl p-4 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE4D9]">
                  <div className="flex-1 mr-3">
                    <label className="block text-[10px] font-bold text-[var(--color-slate)] uppercase tracking-wider mb-1">
                      Column {colIndex + 1} Title
                    </label>
                    <input
                      type="text"
                      value={column.title}
                      onChange={(e) => handleUpdateColumnTitle(colIndex, e.target.value)}
                      placeholder="Column Title"
                      className="w-full px-2.5 py-1.5 text-xs font-bold text-[var(--color-ink)] uppercase tracking-wide border border-[var(--color-whisper)] rounded focus:outline-none focus:border-[var(--color-gold)]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddLink(colIndex)}
                    className="mt-4 px-2 py-1 text-[11px] font-medium bg-[var(--color-gold)]/10 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/20 rounded border border-[var(--color-gold)]/30 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Link</span>
                  </button>
                </div>

                {/* List of Links */}
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {column.links.map((link, linkIndex) => (
                    <div
                      key={linkIndex}
                      className="p-2.5 bg-[#FAF8F5] border border-[#EAE4D9] rounded-lg space-y-2 group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => handleUpdateLink(colIndex, linkIndex, 'label', e.target.value)}
                          placeholder="Link Label"
                          className="flex-1 px-2 py-1 text-xs border border-[var(--color-whisper)] rounded bg-white font-medium focus:outline-none focus:border-[var(--color-gold)]"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteLink(colIndex, linkIndex)}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition-colors"
                          title="Delete link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-8">
                          <input
                            type="text"
                            value={link.href}
                            onChange={(e) => handleUpdateLink(colIndex, linkIndex, 'href', e.target.value)}
                            placeholder="/shop/kurtis"
                            className="w-full px-2 py-1 text-[11px] font-mono border border-[var(--color-whisper)] rounded bg-white focus:outline-none focus:border-[var(--color-gold)]"
                          />
                        </div>
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={link.badge || ''}
                            onChange={(e) => handleUpdateLink(colIndex, linkIndex, 'badge', e.target.value)}
                            placeholder="Badge (e.g. New)"
                            className="w-full px-2 py-1 text-[11px] uppercase tracking-wider border border-[var(--color-whisper)] rounded bg-white focus:outline-none focus:border-[var(--color-gold)]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {column.links.length === 0 && (
                    <div className="p-4 text-center text-xs text-[var(--color-slate)] italic border border-dashed border-[#EAE4D9] rounded-lg">
                      No links in this column. Click &quot;Add Link&quot; above.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SOCIAL MEDIA CHANNELS */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          <div className="bg-[#FAF8F5] border border-[#EAE4D9] rounded-xl p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                Section Heading
              </label>
              <input
                type="text"
                value={content.socialTitle}
                onChange={(e) => setContent({ ...content, socialTitle: e.target.value })}
                placeholder="CONNECT WITH US"
                className="w-full px-3 py-2 text-xs border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] bg-white uppercase tracking-wider"
              />
            </div>

            <div className="space-y-3 pt-2">
              {content.socialLinks.map((social) => (
                <div
                  key={social.platform}
                  className="p-3.5 bg-white border border-[#E5DFD5] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={social.enabled !== false}
                        onChange={(e) => handleUpdateSocial(social.platform, 'enabled', e.target.checked)}
                        className="w-4 h-4 rounded text-[var(--color-gold)] accent-[var(--color-gold)]"
                      />
                    </label>
                    <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E5DFD5] flex items-center justify-center text-[var(--color-slate)]">
                      <SocialIcon platform={social.platform as any} size="sm" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[var(--color-ink)] capitalize">
                        {social.platform}
                      </span>
                      <span className="block text-[10px] text-[var(--color-slate)]">
                        {social.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 sm:max-w-md grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={social.href}
                      onChange={(e) => handleUpdateSocial(social.platform, 'href', e.target.value)}
                      placeholder={`https://${social.platform}.com/...`}
                      className="w-full px-2.5 py-1.5 text-xs border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] font-mono"
                    />
                    <input
                      type="text"
                      value={social.handle || ''}
                      onChange={(e) => handleUpdateSocial(social.platform, 'handle', e.target.value)}
                      placeholder="@angelikafashions"
                      className="w-full px-2.5 py-1.5 text-xs border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENT OPTIONS & ARTISANAL TRUST BADGES */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Payment Options Row */}
          <div className="bg-[#FAF8F5] border border-[#EAE4D9] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[var(--color-ink)] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[var(--color-gold)]" />
              <span>Payment Options Emblems</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                Payment Label
              </label>
              <input
                type="text"
                value={content.paymentLabel}
                onChange={(e) => setContent({ ...content, paymentLabel: e.target.value })}
                placeholder="PAYMENT OPTIONS:"
                className="w-full px-3 py-2 text-xs border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] bg-white uppercase tracking-wider"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                { key: 'upi', label: 'UPI (Google Pay, PhonePe, Paytm)' },
                { key: 'visa', label: 'VISA' },
                { key: 'mastercard', label: 'Mastercard' },
                { key: 'rupay', label: 'RuPay' },
                { key: 'netbanking', label: 'Net Banking' },
                { key: 'cod', label: 'Cash on Delivery (COD)' },
                { key: 'amex', label: 'American Express (AMEX)' },
              ].map((p) => {
                const isChecked = Boolean(content.paymentOptions?.[p.key as keyof typeof content.paymentOptions]);
                return (
                  <label
                    key={p.key}
                    className={`p-3 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-white border-[var(--color-gold)] shadow-xs'
                        : 'bg-[#F5F2EC] border-[#E5DFD5] opacity-60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        setContent({
                          ...content,
                          paymentOptions: {
                            ...content.paymentOptions,
                            [p.key]: e.target.checked,
                          },
                        });
                      }}
                      className="w-4 h-4 rounded text-[var(--color-gold)] accent-[var(--color-gold)]"
                    />
                    <span className="text-xs font-medium text-[var(--color-ink)]">{p.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Artisanal Trust Assurances */}
          <div className="bg-[#FAF8F5] border border-[#EAE4D9] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[var(--color-ink)] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#16A34A]" />
              <span>Artisanal Trust Assurances</span>
            </h3>

            <div className="space-y-3">
              {content.trustBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="p-3.5 bg-white border border-[#E5DFD5] rounded-xl flex items-center gap-4 shadow-xs"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={badge.enabled !== false}
                      onChange={(e) => handleUpdateTrustBadge(badge.id, 'enabled', e.target.checked)}
                      className="w-4 h-4 rounded text-[var(--color-gold)] accent-[var(--color-gold)]"
                    />
                  </label>
                  <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E5DFD5] flex items-center justify-center text-[var(--color-gold)]">
                    {badge.icon === 'ssl' && <Shield className="w-4 h-4 text-[#16A34A]" />}
                    {badge.icon === 'handloom' && <Sparkles className="w-4 h-4" />}
                    {badge.icon === 'shipping' && <Truck className="w-4 h-4" />}
                    {badge.icon === 'exchange' && <RotateCcw className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={badge.text}
                      onChange={(e) => handleUpdateTrustBadge(badge.id, 'text', e.target.value)}
                      placeholder="Trust guarantee text"
                      className="w-full px-3 py-1.5 text-xs font-medium border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SUB-FOOTER, COPYRIGHT & LEGAL LINKS */}
      {activeTab === 'legal' && (
        <div className="space-y-6">
          <div className="bg-[#FAF8F5] border border-[#EAE4D9] rounded-xl p-5 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                Copyright Notice Text
              </label>
              <textarea
                rows={2}
                value={content.copyright}
                onChange={(e) => setContent({ ...content, copyright: e.target.value })}
                placeholder="© 2026 Angelika. All rights reserved. Handcrafted with reverence for Indian heritage."
                className="w-full px-3 py-2 text-xs border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] bg-white leading-relaxed"
              />
            </div>

            <div className="pt-2 border-t border-[#EAE4D9]">
              <div className="flex items-center justify-between pb-3">
                <h4 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider">
                  Bottom Bar Legal & Policy Links
                </h4>
                <button
                  type="button"
                  onClick={handleAddBottomLink}
                  className="px-2.5 py-1 text-[11px] font-medium bg-[var(--color-gold)]/10 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/20 rounded border border-[var(--color-gold)]/30 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Link</span>
                </button>
              </div>

              <div className="space-y-2">
                {content.bottomLinks.map((link, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 bg-white border border-[#E5DFD5] rounded-lg shadow-xs"
                  >
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => handleUpdateBottomLink(idx, 'label', e.target.value)}
                      placeholder="Label"
                      className="w-40 px-2 py-1 text-xs border border-[var(--color-whisper)] rounded font-medium focus:outline-none focus:border-[var(--color-gold)]"
                    />
                    <input
                      type="text"
                      value={link.href}
                      onChange={(e) => handleUpdateBottomLink(idx, 'href', e.target.value)}
                      placeholder="/privacy"
                      className="flex-1 px-2 py-1 text-xs font-mono border border-[var(--color-whisper)] rounded focus:outline-none focus:border-[var(--color-gold)]"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteBottomLink(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition-colors"
                      title="Delete link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#EAE4D9] flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={content.showScrollTop !== false}
                  onChange={(e) => setContent({ ...content, showScrollTop: e.target.checked })}
                  className="w-4 h-4 rounded text-[var(--color-gold)] accent-[var(--color-gold)]"
                />
                <span className="text-xs font-semibold text-[var(--color-ink)]">
                  Display &quot;Back to Top&quot; button
                </span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-slate)]">Button text:</span>
                <input
                  type="text"
                  value={content.scrollTopText || 'Top'}
                  onChange={(e) => setContent({ ...content, scrollTopText: e.target.value })}
                  placeholder="Top"
                  className="w-20 px-2 py-1 text-xs border border-[var(--color-whisper)] rounded bg-white text-center font-medium focus:outline-none focus:border-[var(--color-gold)]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: LIVE STOREFRONT PREVIEW */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
            <span className="font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live interactive preview of your footer as rendered across all storefront pages.
            </span>
          </div>

          {/* Interactive Browser Frame */}
          <div className="border border-[#E5DFD5] rounded-2xl overflow-hidden shadow-lg bg-[#FAF8F5]">
            {/* Browser top chrome */}
            <div className="bg-[#EAE4D9]/60 px-4 py-2 border-b border-[#E5DFD5] flex items-center justify-between text-xs text-[var(--color-slate)]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              </div>
              <span className="font-mono text-[11px] text-[var(--color-slate)] font-medium">
                Storefront Footer Preview · All Pages
              </span>
              <span className="text-[10px] text-[var(--color-gold)] uppercase font-semibold">
                Angelika Fashions
              </span>
            </div>

            {/* Simulated Instagram Strip (as in screenshot) */}
            <div className="border-b border-[#EAE4D9] py-4 bg-white/70 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-whisper)] text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider bg-white shadow-xs">
                <SocialIcon platform="instagram" size="sm" />
                <span>FOLLOW US ON INSTAGRAM</span>
              </div>
            </div>

            {/* Actual Footer Mockup */}
            <footer className="relative bg-[#FAF8F5] text-[var(--color-ink)] pt-12 pb-8 px-6 sm:px-10">
              <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Brand & Atelier Desk */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="flex items-center gap-3">
                    <img
                      src={content.logoUrl || '/images/logo.png'}
                      alt={content.brandName}
                      className="h-10 w-auto object-contain rounded"
                    />
                    <div className="flex flex-col">
                      <span className="font-display text-2xl font-bold tracking-tight text-[var(--color-ink)] leading-none">
                        {content.brandName || 'Angelika'}
                      </span>
                      <span className="text-[10px] tracking-[0.26em] text-[var(--color-gold)] uppercase font-semibold mt-0.5">
                        {content.brandTagline || 'Fashions'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[var(--color-slate)] text-xs leading-relaxed max-w-sm">
                    {content.tagline}
                  </p>

                  {/* Atelier Desk Card */}
                  {content.showAtelierDesk !== false && (
                    <div className="rounded-xl bg-[#FCFAF7] border border-[#E5DECF] p-4 shadow-sm max-w-sm space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#EAE4D9]">
                        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
                          {content.atelierBadge}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-slate)] bg-white px-2 py-0.5 rounded-full border border-[#EAE4D9]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                          <span>{content.atelierStatusText}</span>
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-serif text-sm font-medium text-[var(--color-ink)]">
                          {content.atelierTitle}
                        </h4>
                        <p className="text-[11px] text-[var(--color-slate)] leading-relaxed">
                          {content.atelierDescription}
                        </p>
                      </div>

                      <div className="w-full py-2 px-3 rounded-lg bg-[var(--color-ink)] text-white text-[11px] font-medium flex items-center justify-center gap-2">
                        <SocialIcon platform="whatsapp" size="sm" />
                        <span>{content.atelierWhatsappCta}</span>
                        <span>→</span>
                      </div>

                      <div className="pt-2 border-t border-[#EAE4D9] grid grid-cols-2 gap-2 text-[10px] text-[var(--color-slate)]">
                        <span className="truncate">📞 {content.atelierPhone}</span>
                        <span className="truncate">✉️ {content.atelierEmail}</span>
                      </div>
                      <div className="text-[10px] text-[var(--color-mist)]">
                        🕒 {content.atelierSchedule}
                      </div>
                    </div>
                  )}

                  {/* Connect with us */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)] block">
                      {content.socialTitle}
                    </span>
                    <div className="flex items-center gap-2">
                      {content.socialLinks
                        .filter((s) => s.enabled !== false)
                        .map((social) => (
                          <div
                            key={social.platform}
                            className="w-7 h-7 rounded-full bg-white border border-[#E5DFD5] text-[var(--color-slate)] flex items-center justify-center shadow-xs"
                          >
                            <SocialIcon platform={social.platform as any} size="sm" />
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Directory 4 Columns */}
                <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {content.columns.map((column) => (
                    <div key={column.id || column.title} className="space-y-3">
                      <h3 className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink)] pb-1 border-b border-[#EAE4D9]">
                        {column.title}
                      </h3>
                      <ul className="space-y-2">
                        {column.links.map((link, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-[11px] text-[var(--color-slate)]">
                            <span>{link.label}</span>
                            {link.badge && (
                              <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.2 rounded bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/30">
                                {link.badge}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payments & Trust */}
              <div className="mt-10 pt-6 border-t border-[#EAE4D9] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-slate)]">
                    {content.paymentLabel}
                  </span>
                  {content.paymentOptions?.upi && <span className="px-2 py-0.5 text-[10px] bg-white border border-[#E5DFD5] font-bold rounded">UPI</span>}
                  {content.paymentOptions?.visa && <span className="px-2 py-0.5 text-[10px] bg-white border border-[#E5DFD5] font-bold text-[#1A3F8B] italic rounded">VISA</span>}
                  {content.paymentOptions?.mastercard && <span className="px-2 py-0.5 text-[10px] bg-white border border-[#E5DFD5] font-bold rounded">Mastercard</span>}
                  {content.paymentOptions?.rupay && <span className="px-2 py-0.5 text-[10px] bg-white border border-[#E5DFD5] font-bold text-emerald-700 rounded">RuPay</span>}
                  {content.paymentOptions?.netbanking && <span className="px-2 py-0.5 text-[10px] bg-white border border-[#E5DFD5] rounded text-[var(--color-slate)]">Net Banking</span>}
                  {content.paymentOptions?.cod && <span className="px-2 py-0.5 text-[10px] bg-white border border-[#E5DFD5] rounded text-[var(--color-slate)]">Cash on Delivery</span>}
                  {content.paymentOptions?.amex && <span className="px-2 py-0.5 text-[10px] bg-white border border-[#E5DFD5] font-bold text-[#006FCF] rounded">AMEX</span>}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[10px] text-[var(--color-slate)]">
                  {content.trustBadges
                    .filter((b) => b.enabled !== false)
                    .map((b) => (
                      <span key={b.id} className="flex items-center gap-1 font-medium">
                        {b.icon === 'ssl' ? '🔒 ' : '✨ '}
                        {b.text}
                      </span>
                    ))}
                </div>
              </div>

              {/* Sub-footer bottom bar */}
              <div className="mt-6 pt-4 border-t border-[#EAE4D9] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[var(--color-slate)]">
                <p>{content.copyright}</p>
                <div className="flex items-center gap-4">
                  {content.bottomLinks.map((l, idx) => (
                    <span key={idx}>{l.label}</span>
                  ))}
                  {content.showScrollTop !== false && (
                    <span className="text-[var(--color-gold)] font-bold cursor-pointer">
                      {content.scrollTopText || 'Top'} ↑
                    </span>
                  )}
                </div>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
