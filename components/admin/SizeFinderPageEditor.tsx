'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type {
  SizeFinderPageContent,
  SizeFinderSilhouette,
  SizeFinderGuidePrinciple,
} from '@/lib/actions/site-content-types';

function AdminFormField({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  prefix,
  helperText,
  disabled = false,
  className = '',
}: {
  label: string;
  value?: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  prefix?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1', className)}>
      <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
        {label}
      </label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-xs font-medium text-[var(--color-slate)] select-none pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type={type}
          disabled={disabled}
          value={value ?? ''}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full h-10 text-xs px-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors',
            prefix && 'pl-7',
            disabled && 'opacity-60 cursor-not-allowed bg-[var(--color-snow)]'
          )}
        />
      </div>
      {helperText && (
        <p className="text-[10px] text-[var(--color-slate)] leading-tight">{helperText}</p>
      )}
    </div>
  );
}

const DEFAULT_SIZE_FINDER_DATA: SizeFinderPageContent = {
  header: {
    badge: '',
    title: 'Discover Your Signature Drape',
    description:
      'Handcrafted luxury ethnic wear should never feel constrained. Our interactive studio calculates your tailored proportion based on your posture, height, and preferred ease.',
  },
  studio: {
    step1Title: 'Which Ensemble Are You Styling?',
    step1Subtitle: 'Select a category to calibrate drape measurements',
    step2Title: 'Calibrate Your Fit Method',
  },
  silhouettes: [
    {
      id: 'kurtis',
      name: 'Kurtis & Tunics',
      tagline: 'Straight cuts, A-line & kalidar everyday luxury',
      image: '/images/cat-kurtis.jpg',
      defaultLengthInches: 43,
      sizes: [
        { size: 'XS', bust: 32, waist: 26, hips: 36, length: 42, shoulder: 14.0, label: 'XS (Size 32)' },
        { size: 'S', bust: 34, waist: 28, hips: 38, length: 42, shoulder: 14.5, label: 'S (Size 34)' },
        { size: 'M', bust: 36, waist: 30, hips: 40, length: 43, shoulder: 15.0, label: 'M (Size 36)' },
        { size: 'L', bust: 38, waist: 32, hips: 42, length: 43, shoulder: 15.5, label: 'L (Size 38)' },
        { size: 'XL', bust: 40, waist: 34, hips: 44, length: 44, shoulder: 16.0, label: 'XL (Size 40)' },
        { size: 'XXL', bust: 42, waist: 36, hips: 46, length: 44, shoulder: 16.5, label: 'XXL (Size 42)' },
        { size: '3XL', bust: 44, waist: 38, hips: 48, length: 45, shoulder: 17.0, label: '3XL (Size 44)' },
      ],
    },
    {
      id: 'salwars',
      name: 'Salwar & Palazzo Suits',
      tagline: 'Three-piece sets with relaxed palazzo or churidar',
      image: '/images/cat-salwars.jpg',
      defaultLengthInches: 43,
      sizes: [
        { size: 'XS', bust: 34, waist: 28, hips: 38, length: 42, shoulder: 14.0, label: 'XS (Size 34)' },
        { size: 'S', bust: 36, waist: 30, hips: 40, length: 42, shoulder: 14.5, label: 'S (Size 36)' },
        { size: 'M', bust: 38, waist: 32, hips: 42, length: 43, shoulder: 15.0, label: 'M (Size 38)' },
        { size: 'L', bust: 40, waist: 34, hips: 44, length: 43, shoulder: 15.5, label: 'L (Size 40)' },
        { size: 'XL', bust: 42, waist: 36, hips: 46, length: 44, shoulder: 16.0, label: 'XL (Size 42)' },
        { size: 'XXL', bust: 44, waist: 38, hips: 48, length: 44, shoulder: 16.5, label: 'XXL (Size 44)' },
      ],
    },
    {
      id: 'lehengas',
      name: 'Bridal & Festive Lehengas',
      tagline: 'High-waisted flared skirt with tailored padded choli',
      image: '/images/cat-lehengas.jpg',
      defaultLengthInches: 43,
      sizes: [
        { size: 'XS', bust: 32, waist: 26, hips: 36, length: 42, shoulder: 13.5, label: 'XS (Waist 26")' },
        { size: 'S', bust: 34, waist: 28, hips: 38, length: 42, shoulder: 14.0, label: 'S (Waist 28")' },
        { size: 'M', bust: 36, waist: 30, hips: 40, length: 43, shoulder: 14.5, label: 'M (Waist 30")' },
        { size: 'L', bust: 38, waist: 32, hips: 42, length: 43, shoulder: 15.0, label: 'L (Waist 32")' },
        { size: 'XL', bust: 40, waist: 34, hips: 44, length: 44, shoulder: 15.5, label: 'XL (Waist 34")' },
        { size: 'XXL', bust: 42, waist: 36, hips: 46, length: 44, shoulder: 16.0, label: 'XXL (Waist 36")' },
      ],
    },
    {
      id: 'sarees',
      name: 'Sarees & Blouse Styling',
      tagline: '5.5m unstitched drape with customized silk choli',
      image: '/images/cat-sarees.jpg',
      defaultLengthInches: 216,
      isFreeSize: true,
      freeSizeNote: 'Sarees are standard 5.5m Free Size drape. Sizing applies to your tailored blouse stitching.',
      sizes: [
        { size: 'XS', bust: 32, waist: 26, hips: 36, length: 14, shoulder: 13.5, label: 'Blouse XS (32")' },
        { size: 'S', bust: 34, waist: 28, hips: 38, length: 14.5, shoulder: 14.0, label: 'Blouse S (34")' },
        { size: 'M', bust: 36, waist: 30, hips: 40, length: 15, shoulder: 14.5, label: 'Blouse M (36")' },
        { size: 'L', bust: 38, waist: 32, hips: 42, length: 15.5, shoulder: 15.0, label: 'Blouse L (38")' },
        { size: 'XL', bust: 40, waist: 34, hips: 44, length: 16, shoulder: 15.5, label: 'Blouse XL (40")' },
        { size: 'XXL', bust: 42, waist: 36, hips: 46, length: 16.5, shoulder: 16.0, label: 'Blouse XXL (42")' },
      ],
    },
    {
      id: 'dupattas',
      name: 'Artisanal Dupattas',
      tagline: 'Handwoven 2.5m pure silk & chanderi stoles',
      image: '/images/cat-dupattas.jpg',
      defaultLengthInches: 98,
      isFreeSize: true,
      freeSizeNote: 'Dupattas are universal Free Size (2.5 Meters x 1 Meter). No sizing required.',
      sizes: [
        { size: 'Free Size', bust: 0, waist: 0, hips: 0, length: 98, shoulder: 0, label: 'Universal 2.5m Drape' },
      ],
    },
  ],
  virtualCall: {
    badge: 'Complimentary Virtual Drape Call',
    description:
      'Bridal or festive celebration coming up? Connect directly over a WhatsApp video call to see real drape movement and live fabric falls before confirming.',
    ctaText: 'Book 1-on-1 Consultation Call',
    whatsappLink:
      'https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20would%20love%20to%20book%20a%20virtual%20drape%20consultation.',
  },
  guide: {
    title: "Designer Vidhya's Guide to Taking Flawless Body Measurements",
    principles: [
      {
        step: '01',
        title: 'Flexible Vinyl Tape',
        description: 'Avoid metal tapes. Use a soft tailor tape that hugs natural body contours without stretching.',
      },
      {
        step: '02',
        title: 'Proper Undergarments',
        description: 'Measure over the exact style of innerwear you plan to wear with your ethnic ensemble.',
      },
      {
        step: '03',
        title: 'One-Finger Slack',
        description: 'Keep one finger between the tape and body so the fabric drapes without uncomfortable pinching.',
      },
      {
        step: '04',
        title: 'Natural Posture',
        description: 'Stand naturally with arms relaxed at sides. Do not pull your belly in or hold breath.',
      },
    ],
    whatsappTitle: 'Want Our Master Drapers to Review Your Fit?',
    whatsappDescription:
      'Send your measurements or a photo over WhatsApp. Designer Vidhya and our master tailors will confirm your exact size within 15 minutes.',
    whatsappButtonText: 'Verify Sizing on WhatsApp With Vidhya',
    whatsappLink:
      'https://wa.me/919876543210?text=Hi%20Vidhya,%20can%20you%20review%20my%20measurements%20for%20an%20Angelika%20order?',
  },
  seo: {
    metaTitle: 'Size Finder & Couture Fit Studio | Angelika Fashions',
    metaDescription:
      'Find your perfect size for handcrafted Indian luxury ethnic wear - sarees, lehengas, kurtis, salwars, and dupattas with personalized fit recommendations.',
  },
};

type TabKey = 'header' | 'silhouettes' | 'studio' | 'consultation' | 'guide' | 'seo';

export function SizeFinderPageEditor({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState<SizeFinderPageContent>(DEFAULT_SIZE_FINDER_DATA);
  const [activeTab, setActiveTab] = useState<TabKey>('header');
  const [activeSilhouetteIdx, setActiveSilhouetteIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Load persisted data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const json = await res.json();
          if (json.content && json.content['size-finder-page'] && isMounted) {
            const raw = json.content['size-finder-page'];
            setFormData({
              header: {
                ...DEFAULT_SIZE_FINDER_DATA.header,
                ...(raw.header || {}),
              },
              studio: {
                ...DEFAULT_SIZE_FINDER_DATA.studio,
                ...(raw.studio || {}),
              },
              silhouettes: Array.isArray(raw.silhouettes) && raw.silhouettes.length > 0
                ? raw.silhouettes
                : DEFAULT_SIZE_FINDER_DATA.silhouettes,
              virtualCall: {
                ...DEFAULT_SIZE_FINDER_DATA.virtualCall,
                ...(raw.virtualCall || {}),
              },
              guide: {
                ...DEFAULT_SIZE_FINDER_DATA.guide,
                ...(raw.guide || {}),
                principles: Array.isArray(raw.guide?.principles) && raw.guide.principles.length > 0
                  ? raw.guide.principles
                  : DEFAULT_SIZE_FINDER_DATA.guide.principles,
              },
              seo: {
                ...DEFAULT_SIZE_FINDER_DATA.seo,
                ...(raw.seo || {}),
              },
            });
          }
        }
      } catch (err) {
        console.error('Failed to load size-finder-page content:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: 'size-finder-page',
          data: formData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: '✓ Couture Fit Studio (Size Finder) saved successfully! Changes are live on /size-finder.',
        });
        onSaved();
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to save changes. Please try again.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Network error saving changes.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Silhouette helpers
  const handleUpdateSilhouette = (index: number, field: keyof SizeFinderSilhouette, val: any) => {
    setFormData((prev) => {
      const silhouettes = [...prev.silhouettes];
      const target = silhouettes[index];
      if (!target) return prev;
      silhouettes[index] = { ...target, [field]: val };
      return { ...prev, silhouettes };
    });
  };

  // Measurement Guide Principle helpers
  const handleUpdatePrinciple = (
    index: number,
    field: keyof SizeFinderGuidePrinciple,
    val: string
  ) => {
    setFormData((prev) => {
      const principles = [...prev.guide.principles];
      const target = principles[index];
      if (!target) return prev;
      principles[index] = { ...target, [field]: val };
      return {
        ...prev,
        guide: { ...prev.guide, principles },
      };
    });
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-[var(--color-slate)] animate-pulse">
        Loading Couture Fit Studio configuration...
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: string; count?: number }[] = [
    { key: 'header', label: 'Header & Intro', icon: '✦' },
    { key: 'silhouettes', label: 'Ensembles & Sizing', icon: '👗', count: formData.silhouettes.length },
    { key: 'studio', label: 'Studio Steps', icon: '🎛' },
    { key: 'consultation', label: 'Virtual Consultation', icon: '🎥' },
    { key: 'guide', label: 'Measuring Guide', icon: '📏', count: formData.guide.principles.length },
    { key: 'seo', label: 'SEO & Metadata', icon: '🔍' },
  ];

  const currentSil = formData.silhouettes[activeSilhouetteIdx] || formData.silhouettes[0];

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E1B18] via-[#2A241E] to-[#1E1B18] p-6 text-white shadow-lg border border-[var(--color-gold)]/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-widest text-[var(--color-gold)] font-bold">
                Pages / Couture Fit Studio
              </span>
              <Badge variant="outline" className="text-[10px] text-[var(--color-gold)] border-[var(--color-gold)]/40">
                Interactive Storefront Studio
              </Badge>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#F5EFEB]">
              Couture Fit Studio (Size Finder) Editor
            </h2>
            <p className="text-xs text-[#D8CEBC] max-w-2xl mt-1 leading-relaxed">
              Manage header hero, ensemble categories & sizing charts, measurement guide, virtual drape consultation card, and SEO for /size-finder.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/size-finder"
              target="_blank"
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-[#FAF7F2] border border-white/20 transition-colors flex items-center gap-1.5"
            >
              <span>View /size-finder</span>
              <span className="text-[10px]">↗</span>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="text-xs border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="text-xs bg-[var(--color-gold)] hover:bg-[#B38E3F] text-[var(--color-ink)] font-bold px-5"
            >
              {isSaving ? 'Saving Changes...' : 'Save All Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Status Notification */}
      {statusMessage && (
        <div
          className={cn(
            'p-4 rounded-xl text-xs font-medium flex items-center justify-between gap-3 shadow-xs border',
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          )}
        >
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-[11px] opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Subtabs Bar */}
      <div className="flex border-b border-[var(--color-whisper)] overflow-x-auto gap-2 pb-px scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-xs font-semibold tracking-wide border-b-2 transition-all whitespace-nowrap',
                isActive
                  ? 'border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/5 rounded-t-lg'
                  : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:border-[var(--color-whisper)]'
              )}
            >
              <span className="text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full font-mono',
                    isActive
                      ? 'bg-[var(--color-gold)] text-[var(--color-ink)]'
                      : 'bg-[var(--color-whisper)] text-[var(--color-slate)]'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Header & Intro */}
      {activeTab === 'header' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-[var(--color-whisper)] shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider mb-1">
              Editorial Studio Header
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Hero title, gold badge, and introduction welcoming clients to the interactive drape calibrator.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Eyebrow Badge"
              value={formData.header.badge}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  header: { ...prev.header, badge: val },
                }))
              }
              placeholder="e.g. Couture Fit Studio"
            />
            <AdminFormField
              label="Page Main Heading"
              value={formData.header.title}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  header: { ...prev.header, title: val },
                }))
              }
              placeholder="Discover Your Signature Drape"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
              Studio Introduction Description
            </label>
            <textarea
              rows={3}
              value={formData.header.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  header: { ...prev.header, description: e.target.value },
                }))
              }
              placeholder="Handcrafted luxury ethnic wear should never feel constrained..."
              className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors leading-relaxed"
            />
          </div>

          {/* Live Preview Box */}
          <div className="mt-4 p-6 rounded-xl bg-[#FAF8F5] border border-[#EAE4D9] text-center space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-slate)] block mb-1">
              Storefront Header Preview
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5DECF] shadow-2xs">
              <span className="text-[var(--color-gold)] text-xs">⚜</span>
              <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[var(--color-gold)]">
                {formData.header.badge}
              </span>
            </div>
            <h2 className="font-serif text-3xl text-[var(--color-ink)]">
              {formData.header.title}
            </h2>
            <p className="text-xs text-[var(--color-slate)] max-w-xl mx-auto leading-relaxed">
              {formData.header.description}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: Ensembles & Sizing Charts */}
      {activeTab === 'silhouettes' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-[var(--color-whisper)] shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider mb-1">
              Ensemble Silhouettes ({formData.silhouettes.length})
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Configure names, taglines, imagery, and sizing specifications for each ethnic wear silhouette.
            </p>
          </div>

          {/* Silhouette Selector Pills */}
          <div className="flex gap-2 border-b border-[var(--color-whisper)] pb-3 overflow-x-auto scrollbar-none">
            {formData.silhouettes.map((sil, idx) => (
              <button
                key={sil.id}
                type="button"
                onClick={() => setActiveSilhouetteIdx(idx)}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all whitespace-nowrap border',
                  activeSilhouetteIdx === idx
                    ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)] shadow-2xs'
                    : 'bg-[var(--color-snow)] text-[var(--color-slate)] border-[var(--color-whisper)] hover:border-[var(--color-gold)]'
                )}
              >
                <span>{sil.name}</span>
                <span className="text-[10px] ml-1.5 opacity-70">
                  ({sil.isFreeSize ? 'Free Size' : `${sil.sizes.length} sizes`})
                </span>
              </button>
            ))}
          </div>

          {/* Active Silhouette Edit Panel */}
          {currentSil && (
            <div className="space-y-4 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)]/20 p-5">
              <div className="flex items-center justify-between border-b border-[var(--color-whisper)] pb-3">
                <div>
                  <h4 className="text-sm font-bold text-[var(--color-ink)]">
                    {currentSil.name} ({currentSil.id})
                  </h4>
                  <p className="text-[11px] text-[var(--color-slate)]">{currentSil.tagline}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {currentSil.isFreeSize ? 'Universal Free Size' : 'Graduated Sizing'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AdminFormField
                  label="Ensemble Name"
                  value={currentSil.name}
                  onChange={(val) =>
                    handleUpdateSilhouette(activeSilhouetteIdx, 'name', val)
                  }
                  placeholder="Kurtis & Tunics"
                />
                <AdminFormField
                  label="Image Asset Path"
                  value={currentSil.image}
                  onChange={(val) =>
                    handleUpdateSilhouette(activeSilhouetteIdx, 'image', val)
                  }
                  placeholder="/images/cat-kurtis.jpg"
                />
              </div>

              <AdminFormField
                label="Craft Tagline / Silhouette Fit Note"
                value={currentSil.tagline}
                onChange={(val) =>
                  handleUpdateSilhouette(activeSilhouetteIdx, 'tagline', val)
                }
                placeholder="Straight cuts, A-line & kalidar everyday luxury"
              />

              {currentSil.isFreeSize && (
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                    Free Size Drape Notice
                  </label>
                  <textarea
                    rows={2}
                    value={currentSil.freeSizeNote || ''}
                    onChange={(e) =>
                      handleUpdateSilhouette(
                        activeSilhouetteIdx,
                        'freeSizeNote',
                        e.target.value
                      )
                    }
                    placeholder="Sarees are standard 5.5m Free Size drape. Sizing applies to your tailored blouse stitching."
                    className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-whisper)] bg-white"
                  />
                </div>
              )}

              {/* Sizing Specifications Table */}
              <div className="pt-2">
                <span className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider block mb-2">
                  Size Chart Specifications ({currentSil.sizes.length} entries)
                </span>
                <div className="overflow-x-auto rounded-lg border border-[var(--color-whisper)]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[var(--color-snow)] border-b border-[var(--color-whisper)] text-[var(--color-slate)] uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-2 px-3">Size</th>
                        <th className="py-2 px-3">Label</th>
                        <th className="py-2 px-3">Bust (")</th>
                        <th className="py-2 px-3">Waist (")</th>
                        <th className="py-2 px-3">Hips (")</th>
                        <th className="py-2 px-3">Shoulder (")</th>
                        <th className="py-2 px-3">Length (")</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-whisper)] bg-white font-mono text-[11px]">
                      {currentSil.sizes.map((sz, sIdx) => (
                        <tr key={sIdx} className="hover:bg-[var(--color-snow)]/50">
                          <td className="py-2 px-3 font-bold text-[var(--color-ink)]">
                            {sz.size}
                          </td>
                          <td className="py-2 px-3 font-sans text-xs">
                            <input
                              type="text"
                              value={sz.label}
                              onChange={(e) => {
                                const sizes = [...currentSil.sizes];
                                const targetSz = sizes[sIdx];
                                if (!targetSz) return;
                                sizes[sIdx] = { ...targetSz, label: e.target.value };
                                handleUpdateSilhouette(activeSilhouetteIdx, 'sizes', sizes);
                              }}
                              className="w-32 px-2 py-1 text-xs border rounded"
                            />
                          </td>
                          <td className="py-2 px-3">{sz.bust || '-'}</td>
                          <td className="py-2 px-3">{sz.waist || '-'}</td>
                          <td className="py-2 px-3">{sz.hips || '-'}</td>
                          <td className="py-2 px-3">{sz.shoulder || '-'}</td>
                          <td className="py-2 px-3">{sz.length || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Studio Steps */}
      {activeTab === 'studio' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-[var(--color-whisper)] shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider mb-1">
              Studio Steps & Section Titles
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Customize the step labels and subtitles displayed above the interactive calibrator widgets.
            </p>
          </div>

          <div className="space-y-4 max-w-2xl">
            <AdminFormField
              label="Step 1 Main Title"
              value={formData.studio.step1Title}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  studio: { ...prev.studio, step1Title: val },
                }))
              }
              placeholder="Which Ensemble Are You Styling?"
            />
            <AdminFormField
              label="Step 1 Helper Subtitle"
              value={formData.studio.step1Subtitle}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  studio: { ...prev.studio, step1Subtitle: val },
                }))
              }
              placeholder="Select a category to calibrate drape measurements"
            />
            <AdminFormField
              label="Step 2 Main Title"
              value={formData.studio.step2Title}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  studio: { ...prev.studio, step2Title: val },
                }))
              }
              placeholder="Calibrate Your Fit Method"
            />
          </div>
        </div>
      )}

      {/* TAB 4: Virtual Consultation Call */}
      {activeTab === 'consultation' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-[var(--color-whisper)] shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider mb-1">
              Virtual Drape Consultation Card
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Banner inviting bridal & festive shoppers to book a 1-on-1 WhatsApp video call.
            </p>
          </div>

          <div className="space-y-4 max-w-2xl">
            <AdminFormField
              label="Card Eyebrow Badge"
              value={formData.virtualCall.badge}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  virtualCall: { ...prev.virtualCall, badge: val },
                }))
              }
              placeholder="Complimentary Virtual Drape Call"
            />

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                Description Paragraph
              </label>
              <textarea
                rows={3}
                value={formData.virtualCall.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    virtualCall: { ...prev.virtualCall, description: e.target.value },
                  }))
                }
                placeholder="Bridal or festive celebration coming up? Connect directly over a WhatsApp video call..."
                className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] leading-relaxed"
              />
            </div>

            <AdminFormField
              label="CTA Button Text"
              value={formData.virtualCall.ctaText}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  virtualCall: { ...prev.virtualCall, ctaText: val },
                }))
              }
              placeholder="Book 1-on-1 Consultation Call"
            />

            <AdminFormField
              label="WhatsApp Direct Booking Link"
              value={formData.virtualCall.whatsappLink}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  virtualCall: { ...prev.virtualCall, whatsappLink: val },
                }))
              }
              placeholder="https://wa.me/919876543210?text=..."
            />
          </div>

          {/* Live Preview */}
          <div className="p-5 rounded-2xl bg-[#FCFAF7] border border-[#E5DECF] space-y-2 text-xs max-w-2xl">
            <div className="flex items-center gap-2 text-[var(--color-gold)] font-semibold text-[11px] uppercase tracking-wider">
              <span>🎥</span>
              <span>{formData.virtualCall.badge}</span>
            </div>
            <p className="text-[var(--color-slate)] leading-relaxed">
              {formData.virtualCall.description}
            </p>
            <span className="inline-flex items-center gap-1.5 font-medium text-[var(--color-gold-hover)]">
              <span>{formData.virtualCall.ctaText}</span>
              <span>→</span>
            </span>
          </div>
        </div>
      )}

      {/* TAB 5: Measuring Guide */}
      {activeTab === 'guide' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-[var(--color-whisper)] shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider mb-1">
              Illustrated Measuring Guide & Masterclass
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Guide title, the 4 measurement principles, and WhatsApp master draper review card.
            </p>
          </div>

          <AdminFormField
            label="Guide Section Title"
            value={formData.guide.title}
            onChange={(val) =>
              setFormData((prev) => ({
                ...prev,
                guide: { ...prev.guide, title: val },
              }))
            }
            placeholder="Designer Vidhya's Guide to Taking Flawless Body Measurements"
          />

          <div className="space-y-3">
            <span className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider block">
              The 4 Golden Measurement Principles
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formData.guide.principles.map((pr, pIdx) => (
                <div
                  key={pIdx}
                  className="p-3.5 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)]/30 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-[var(--color-gold)]">
                      {pr.step}
                    </span>
                    <input
                      type="text"
                      value={pr.title}
                      onChange={(e) =>
                        handleUpdatePrinciple(pIdx, 'title', e.target.value)
                      }
                      className="text-xs font-semibold px-2 py-1 border rounded w-full"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={pr.description}
                    onChange={(e) =>
                      handleUpdatePrinciple(pIdx, 'description', e.target.value)
                    }
                    className="w-full text-xs p-2 border rounded leading-relaxed"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--color-whisper)] space-y-4">
            <span className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider block">
              Master Draper Review Banner (Bottom WhatsApp CTA)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminFormField
                label="Banner Title"
                value={formData.guide.whatsappTitle}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    guide: { ...prev.guide, whatsappTitle: val },
                  }))
                }
                placeholder="Want Our Master Drapers to Review Your Fit?"
              />
              <AdminFormField
                label="Button Label"
                value={formData.guide.whatsappButtonText}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    guide: { ...prev.guide, whatsappButtonText: val },
                  }))
                }
                placeholder="Verify Sizing on WhatsApp With Vidhya"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                Banner Description
              </label>
              <textarea
                rows={2}
                value={formData.guide.whatsappDescription}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    guide: { ...prev.guide, whatsappDescription: e.target.value },
                  }))
                }
                className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-whisper)] bg-white leading-relaxed"
              />
            </div>
            <AdminFormField
              label="WhatsApp Review Link"
              value={formData.guide.whatsappLink}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  guide: { ...prev.guide, whatsappLink: val },
                }))
              }
              placeholder="https://wa.me/919876543210?text=..."
            />
          </div>
        </div>
      )}

      {/* TAB 6: SEO & Metadata */}
      {activeTab === 'seo' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-[var(--color-whisper)] shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider mb-1">
              Search Engine Optimization (SEO)
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Control how the Size Finder & Couture Fit Studio appears on search engines and social shares.
            </p>
          </div>

          <div className="space-y-4 max-w-2xl">
            <AdminFormField
              label="Meta Title Tag"
              value={formData.seo?.metaTitle}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  seo: { ...prev.seo, metaTitle: val },
                }))
              }
              placeholder="Size Finder & Couture Fit Studio | Angelika Fashions"
              helperText={`${formData.seo?.metaTitle?.length || 0}/60 characters (Recommended: 50-60)`}
            />

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={formData.seo?.metaDescription}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, metaDescription: e.target.value },
                  }))
                }
                placeholder="Find your perfect size for handcrafted Indian luxury ethnic wear..."
                className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors leading-relaxed"
              />
              <p className="text-[10px] text-[var(--color-slate)]">
                {formData.seo?.metaDescription?.length || 0}/160 characters (Recommended: 150-160)
              </p>
            </div>
          </div>

          {/* Google Search Result Preview */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 max-w-2xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
              Google Search Result Snippet Preview
            </span>
            <p className="text-xs text-emerald-800 font-mono">
              https://angelikafashions.com/size-finder
            </p>
            <h4 className="text-base text-blue-700 hover:underline font-medium cursor-pointer">
              {formData.seo?.metaTitle || 'Size Finder & Couture Fit Studio | Angelika Fashions'}
            </h4>
            <p className="text-xs text-gray-600 line-clamp-2">
              {formData.seo?.metaDescription ||
                'Find your perfect size for handcrafted Indian luxury ethnic wear - sarees, lehengas, kurtis, salwars, and dupattas.'}
            </p>
          </div>
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-[var(--color-whisper)] shadow-lg">
        <div className="text-xs text-[var(--color-slate)]">
          Editing <span className="font-semibold text-[var(--color-ink)]">Couture Fit Studio (Size Finder)</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} className="text-xs">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="text-xs bg-[var(--color-gold)] hover:bg-[#B38E3F] text-[var(--color-ink)] font-bold px-5"
          >
            {isSaving ? 'Saving Changes...' : 'Save All Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

