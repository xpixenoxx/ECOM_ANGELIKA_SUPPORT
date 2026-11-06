'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import {
  HomepageHeroData,
  defaultHeroData,
  NavItemEdit,
} from '@/lib/actions/homepage-hero-types';
import {
  getHomepageHeroData,
  saveHomepageHeroData,
} from '@/lib/actions/homepage-hero';

interface HomepageHeroEditorProps {
  onCancel?: () => void;
  onSaved?: (data: HomepageHeroData) => void;
}

const PRESET_BACKGROUND_IMAGES = [
  { label: 'Royal Throne Saree (Image 1)', url: '/images/hero-new-couture.jpg' },
  { label: 'Luxury Banner', url: '/images/hero-banner-luxury.jpg' },
  { label: 'Artisanal Drape', url: '/images/hero-bg.jpg' },
  { label: 'Regal Sarees', url: '/images/cat-sarees.jpg' },
  { label: 'Bridal Lehengas', url: '/images/cat-lehengas.jpg' },
];

const PRESET_LOGOS = [
  { label: 'Standard Logo (PNG)', url: '/images/logo.png' },
  { label: 'Alternative Logo (JPG)', url: '/images/logo.jpg' },
];

export function HomepageHeroEditor({ onCancel, onSaved }: HomepageHeroEditorProps) {
  const [formData, setFormData] = useState<HomepageHeroData>(defaultHeroData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'navigation' | 'brand' | 'hero' | 'ctas' | 'media' | 'concierge'>('hero');

  // File upload state
  const [uploadingTarget, setUploadingTarget] = useState<'hero' | 'logo' | null>(null);
  const [uploadMessage, setUploadMessage] = useState<{ target: 'hero' | 'logo'; text: string; error?: boolean } | null>(null);

  // Load existing data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getHomepageHeroData();
        if (isMounted) {
          setFormData(data);
        }
      } catch (err) {
        console.error('Failed to load hero data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = <K extends keyof HomepageHeroData>(key: K, value: HomepageHeroData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Local device file upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'hero' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTarget(target);
    setUploadMessage(null);

    try {
      const body = new FormData();
      body.append('file', file);
      body.append('target', target === 'hero' ? 'hero-bg' : 'logo');

      const res = await fetch('/api/admin/content/upload', {
        method: 'POST',
        body,
      });

      const data = await res.json();
      if (data.success && data.url) {
        if (target === 'hero') {
          handleChange('backgroundImage', data.url);
        } else {
          handleChange('logoUrl', data.url);
        }
        setUploadMessage({
          target,
          text: `✓ Uploaded "${file.name}" from your local device!`,
        });
      } else {
        setUploadMessage({
          target,
          text: data.error || 'Upload failed',
          error: true,
        });
      }
    } catch (err: any) {
      setUploadMessage({
        target,
        text: err?.message || 'Error uploading file',
        error: true,
      });
    } finally {
      setUploadingTarget(null);
      e.target.value = '';
    }
  };

  // Navigation handlers
  const handleAddNavItem = () => {
    setFormData((prev) => ({
      ...prev,
      navigation: [
        ...(prev.navigation || []),
        { label: 'NEW ITEM', href: '/shop', is_active: true },
      ],
    }));
  };

  const handleUpdateNavItem = (index: number, field: keyof NavItemEdit, value: any) => {
    setFormData((prev) => {
      const updated = [...(prev.navigation || [])];
      const current = updated[index];
      if (!current) return prev;
      updated[index] = { ...current, [field]: value } as NavItemEdit;
      return { ...prev, navigation: updated };
    });
  };

  const handleDeleteNavItem = (index: number) => {
    setFormData((prev) => {
      const updated = [...(prev.navigation || [])];
      updated.splice(index, 1);
      return { ...prev, navigation: updated };
    });
  };

  const handleMoveNavItem = (index: number, direction: 'up' | 'down') => {
    setFormData((prev) => {
      const updated = [...(prev.navigation || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      const current = updated[index];
      const target = updated[targetIndex];
      if (!current || !target) return prev;
      updated[index] = target;
      updated[targetIndex] = current;
      return { ...prev, navigation: updated };
    });
  };

  const handleResetNavigation = () => {
    if (confirm('Reset navigation items to the standard 7 categories?')) {
      setFormData((prev) => ({
        ...prev,
        navigation: [...defaultHeroData.navigation],
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const res = await saveHomepageHeroData(formData);
      if (res.success && res.data) {
        setSaveStatus({
          type: 'success',
          message: '✓ Changes saved successfully! Storefront has been updated.',
        });
        onSaved?.(res.data);
      } else {
        setSaveStatus({
          type: 'error',
          message: res.error || 'Failed to save changes. Please try again.',
        });
      }
    } catch (err: any) {
      setSaveStatus({
        type: 'error',
        message: err?.message || 'An unexpected error occurred while saving.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-[var(--color-slate)]">Loading Homepage Hero & Header settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Save Status Notification */}
      <AnimatePresence>
        {saveStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'p-4 rounded-lg flex items-center justify-between text-sm shadow-sm border',
              saveStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            )}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {saveStatus.type === 'success' ? 'Success:' : 'Error:'}
              </span>
              <span>{saveStatus.message}</span>
            </div>
            {saveStatus.type === 'success' && (
              <Link
                href="/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-900 underline text-xs ml-4"
              >
                View Live Storefront ↗
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-whisper)] pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('hero')}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors',
            activeSubTab === 'hero'
              ? 'bg-[var(--color-gold)] text-[var(--color-ink)] shadow-xs'
              : 'bg-[var(--color-snow)] text-[var(--color-slate)] hover:text-[var(--color-ink)]'
          )}
        >
          ✨ Hero Headlines & Badges
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('ctas')}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors',
            activeSubTab === 'ctas'
              ? 'bg-[var(--color-gold)] text-[var(--color-ink)] shadow-xs'
              : 'bg-[var(--color-snow)] text-[var(--color-slate)] hover:text-[var(--color-ink)]'
          )}
        >
          🔘 Call-To-Action Buttons
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('media')}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors',
            activeSubTab === 'media'
              ? 'bg-[var(--color-gold)] text-[var(--color-ink)] shadow-xs'
              : 'bg-[var(--color-snow)] text-[var(--color-slate)] hover:text-[var(--color-ink)]'
          )}
        >
          🖼️ Hero Background Image
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('navigation')}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors',
            activeSubTab === 'navigation'
              ? 'bg-[var(--color-gold)] text-[var(--color-ink)] shadow-xs'
              : 'bg-[var(--color-snow)] text-[var(--color-slate)] hover:text-[var(--color-ink)]'
          )}
        >
          🧭 Header Navigation Menu ({formData.navigation?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('brand')}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors',
            activeSubTab === 'brand'
              ? 'bg-[var(--color-gold)] text-[var(--color-ink)] shadow-xs'
              : 'bg-[var(--color-snow)] text-[var(--color-slate)] hover:text-[var(--color-ink)]'
          )}
        >
          👑 Brand Logo & Name
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('concierge')}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors',
            activeSubTab === 'concierge'
              ? 'bg-[var(--color-gold)] text-[var(--color-ink)] shadow-xs'
              : 'bg-[var(--color-snow)] text-[var(--color-slate)] hover:text-[var(--color-ink)]'
          )}
        >
          💬 Styling Concierge Badge
        </button>
      </div>

      {/* Tab 1: Hero Headlines & Badges */}
      {activeSubTab === 'hero' && (
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-[var(--color-snow)] border border-[var(--color-whisper)]">
            <h3 className="text-sm font-semibold text-[var(--color-ink)] mb-1">
              Main Hero Typography & Badge
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Edit the luxury brand signature, headline, italic highlight, and description that appear in Image 1.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Brand Top Badge Text (Header Stamp)"
              value={formData.badgeText}
              onChange={(e) => handleChange('badgeText', e.target.value)}
              placeholder="A N G E L I K A"
              hint="Uppercase letterspaced luxury signature"
            />
            <Input
              label="Top Tagline Subtitle"
              value={formData.badgeTagline}
              onChange={(e) => handleChange('badgeTagline', e.target.value)}
              placeholder="Tradition in Every Thread"
              hint="Gold accented subtitle below brand name"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showBadge"
              checked={formData.showBadge}
              onChange={(e) => handleChange('showBadge', e.target.checked)}
              className="w-4 h-4 rounded text-[var(--color-gold)] border-gray-300 focus:ring-[var(--color-gold)]"
            />
            <label htmlFor="showBadge" className="text-xs font-medium text-[var(--color-ink)] cursor-pointer">
              Show Star Icon & Top Brand Badge (★ {formData.badgeText || 'ANGELIKA'})
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Main Headline (Line 1)"
              value={formData.headline}
              onChange={(e) => handleChange('headline', e.target.value)}
              placeholder="Grace in"
              hint="First part of the headline serif"
            />
            <Input
              label="Highlighted / Italic Headline (Line 2)"
              value={formData.headlineHighlight}
              onChange={(e) => handleChange('headlineHighlight', e.target.value)}
              placeholder="Every Drape"
              hint="Renders in elegant italic serif"
            />
          </div>

          <Textarea
            label="Subheader / Description"
            value={formData.subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            rows={3}
            placeholder="Timeless traditional wear for the modern woman.&#10;Rooted in heritage, designed for your today."
            hint="Supports line breaks. Keep concise (1-2 sentences) for best aesthetic."
          />

          {/* Live Preview Box */}
          <div className="p-6 rounded-xl bg-gradient-to-r from-black via-zinc-900 to-black text-white shadow-lg border border-zinc-800">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-gold)] block mb-3">
              ✦ Live Headline Preview
            </span>
            {formData.showBadge && (
              <div className="flex flex-col items-start gap-0.5 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-gold)] font-medium tracking-[0.3em] uppercase">
                  <span>★</span>
                  <span>{formData.badgeText || 'A N G E L I K A'}</span>
                </div>
                <span className="text-[9px] text-[#C9A84C] tracking-[0.2em] uppercase font-semibold">
                  {formData.badgeTagline || 'Tradition in Every Thread'}
                </span>
              </div>
            )}
            <h2 className="font-serif text-3xl sm:text-4xl leading-tight mb-3">
              {formData.headline || 'Grace in'}{' '}
              <span className="italic font-light text-amber-200">
                {formData.headlineHighlight || 'Every Drape'}
              </span>
            </h2>
            <p className="text-sm text-zinc-300 max-w-lg leading-relaxed whitespace-pre-line">
              {formData.subtitle || 'Timeless traditional wear for the modern woman.'}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Call-To-Action Buttons */}
      {activeSubTab === 'ctas' && (
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-[var(--color-snow)] border border-[var(--color-whisper)]">
            <h3 className="text-sm font-semibold text-[var(--color-ink)] mb-1">
              Hero Call-to-Action (CTA) Buttons
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Configure the primary bordered button and secondary pill button shown over the hero image.
            </p>
          </div>

          <div className="p-4 border border-[var(--color-whisper)] rounded-lg space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="gold">Primary Button</Badge>
              <span className="text-xs text-[var(--color-slate)]">Highlighted white border + arrow</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Primary Button Label"
                value={formData.primaryCtaText}
                onChange={(e) => handleChange('primaryCtaText', e.target.value)}
                placeholder="Explore Collection"
              />
              <Input
                label="Primary Button Redirect URL"
                value={formData.primaryCtaLink}
                onChange={(e) => handleChange('primaryCtaLink', e.target.value)}
                placeholder="/shop"
              />
            </div>
          </div>

          <div className="p-4 border border-[var(--color-whisper)] rounded-lg space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Secondary Button</Badge>
              <span className="text-xs text-[var(--color-slate)]">Subtle frosted backdrop button</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Secondary Button Label"
                value={formData.secondaryCtaText}
                onChange={(e) => handleChange('secondaryCtaText', e.target.value)}
                placeholder="Vidhya's Picks"
              />
              <Input
                label="Secondary Button Redirect URL"
                value={formData.secondaryCtaLink}
                onChange={(e) => handleChange('secondaryCtaLink', e.target.value)}
                placeholder="/vidhyas-picks"
              />
            </div>
          </div>

          {/* Button Visual Preview */}
          <div className="p-6 rounded-xl bg-black/90 flex flex-wrap items-center gap-4">
            <div className="px-6 py-3 border border-white/60 text-white text-xs tracking-[0.2em] uppercase font-medium bg-black/40 flex items-center gap-2">
              <span>{formData.primaryCtaText || 'Explore Collection'}</span>
              <span>→</span>
            </div>
            <div className="px-5 py-3 border border-white/20 text-[#E6DFD5] text-xs tracking-[0.16em] uppercase font-medium bg-black/20">
              {formData.secondaryCtaText || "Vidhya's Picks"}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Hero Background Image */}
      {activeSubTab === 'media' && (
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-[var(--color-snow)] border border-[var(--color-whisper)]">
            <h3 className="text-sm font-semibold text-[var(--color-ink)] mb-1">
              Hero Background Image
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Upload an image directly from your local device/computer, pick a preset, or enter an image URL.
            </p>
          </div>

          {/* Local Device Upload Box */}
          <div className="p-5 border-2 border-dashed border-[var(--color-whisper)] hover:border-[var(--color-gold)] rounded-xl bg-[var(--color-snow)]/60 transition-colors">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-gold-light)] flex items-center justify-center text-xl shadow-xs">
                  📁
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--color-ink)]">
                    Upload from Local Device
                  </h4>
                  <p className="text-xs text-[var(--color-slate)]">
                    Select any JPG, PNG, or WebP photo from your computer
                  </p>
                </div>
              </div>
              <div>
                <input
                  type="file"
                  id="hero-file-upload"
                  accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'hero')}
                />
                <label
                  htmlFor="hero-file-upload"
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-xs',
                    uploadingTarget === 'hero'
                      ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                      : 'bg-[var(--color-gold)] text-[var(--color-ink)] hover:brightness-105 active:scale-95'
                  )}
                >
                  {uploadingTarget === 'hero' ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin" />
                      <span>Uploading Image...</span>
                    </>
                  ) : (
                    <>
                      <span>Choose File from Device</span>
                      <span>↑</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {uploadMessage?.target === 'hero' && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'mt-3 text-xs p-2.5 rounded-md border flex items-center gap-2',
                  uploadMessage.error
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                )}
              >
                <span>{uploadMessage.text}</span>
              </motion.div>
            )}
          </div>

          <Input
            label="Background Image URL"
            value={formData.backgroundImage}
            onChange={(e) => handleChange('backgroundImage', e.target.value)}
            placeholder="/images/hero-new-couture.jpg"
            hint="Supports local device uploads (/images/uploads/...) or full HTTPS image URLs"
          />

          <Input
            label="Background Image Alt Text (SEO & Accessibility)"
            value={formData.backgroundImageAlt}
            onChange={(e) => handleChange('backgroundImageAlt', e.target.value)}
            placeholder="Angelika Fashions - Grace in Every Drape | Luxury Indian Ethnic Wear by Vidhya"
          />

          <div>
            <label className="block text-xs font-medium text-[var(--color-ink)] mb-2">
              Quick Preset Images:
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_BACKGROUND_IMAGES.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => handleChange('backgroundImage', preset.url)}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-md border transition-all',
                    formData.backgroundImage === preset.url
                      ? 'border-[var(--color-gold)] bg-[var(--color-gold-light)] font-semibold text-[var(--color-ink)]'
                      : 'border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-slate)] hover:border-gray-400'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Background Image Preview */}
          <div className="border border-[var(--color-whisper)] rounded-xl overflow-hidden">
            <div className="bg-[var(--color-snow)] p-3 border-b border-[var(--color-whisper)] flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--color-ink)]">Image Preview</span>
              <span className="text-[11px] text-[var(--color-slate)] truncate max-w-xs">{formData.backgroundImage}</span>
            </div>
            <div className="relative h-64 sm:h-80 w-full bg-zinc-900">
              {formData.backgroundImage ? (
                <>
                  <Image
                    src={formData.backgroundImage}
                    alt={formData.backgroundImageAlt || 'Hero background preview'}
                    fill
                    className="object-cover object-center"
                    unoptimized={true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent flex items-center p-8">
                    <div className="text-white max-w-xs">
                      <span className="text-[9px] tracking-[0.25em] text-[var(--color-gold)] uppercase font-semibold block mb-1">
                        Preview Simulation
                      </span>
                      <h4 className="font-serif text-2xl font-normal leading-tight mb-2">
                        {formData.headline} <span className="italic">{formData.headlineHighlight}</span>
                      </h4>
                      <p className="text-xs text-white/80 line-clamp-2">
                        {formData.subtitle}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                  No image URL specified
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Header Navigation Menu */}
      {activeSubTab === 'navigation' && (
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-[var(--color-snow)] border border-[var(--color-whisper)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-ink)] mb-1">
                Header Navigation Links & Redirect URLs
              </h3>
              <p className="text-xs text-[var(--color-slate)]">
                Manage the exact links shown in the top navigation bar (Image 1). Change labels, URLs, order, or visibility.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" variant="outline" onClick={handleResetNavigation}>
                Reset to Standard 7
              </Button>
              <Button type="button" size="sm" variant="primary" onClick={handleAddNavItem}>
                + Add Navigation Link
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {(formData.navigation || []).map((item, index) => (
              <div
                key={index}
                className={cn(
                  'p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row items-stretch sm:items-center gap-3',
                  item.is_active !== false
                    ? 'bg-[var(--color-white)] border-[var(--color-whisper)]'
                    : 'bg-zinc-50 border-dashed border-zinc-300 opacity-60'
                )}
              >
                {/* Reorder Buttons */}
                <div className="flex sm:flex-col items-center justify-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveNavItem(index, 'up')}
                    className="p-1 rounded text-zinc-500 hover:text-black hover:bg-zinc-100 disabled:opacity-20 disabled:hover:bg-transparent"
                    title="Move Up"
                  >
                    ▲
                  </button>
                  <span className="text-[10px] font-bold text-zinc-400">{index + 1}</span>
                  <button
                    type="button"
                    disabled={index === (formData.navigation?.length || 0) - 1}
                    onClick={() => handleMoveNavItem(index, 'down')}
                    className="p-1 rounded text-zinc-500 hover:text-black hover:bg-zinc-100 disabled:opacity-20 disabled:hover:bg-transparent"
                    title="Move Down"
                  >
                    ▼
                  </button>
                </div>

                {/* Link Label Input */}
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-[var(--color-slate)] uppercase tracking-wider mb-1">
                    Navigation Label
                  </label>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleUpdateNavItem(index, 'label', e.target.value)}
                    placeholder="e.g. KURTIS"
                    className="w-full text-xs font-semibold uppercase tracking-wider px-3 py-2 border border-[var(--color-whisper)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]"
                  />
                </div>

                {/* Redirect URL Input */}
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-[var(--color-slate)] uppercase tracking-wider mb-1">
                    Redirect URL
                  </label>
                  <input
                    type="text"
                    value={item.href}
                    onChange={(e) => handleUpdateNavItem(index, 'href', e.target.value)}
                    placeholder="/shop/kurtis"
                    className="w-full text-xs font-mono px-3 py-2 border border-[var(--color-whisper)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]"
                  />
                </div>

                {/* Active Checkbox & Delete */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-4">
                  <label className="flex items-center gap-1.5 text-xs text-[var(--color-slate)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.is_active !== false}
                      onChange={(e) => handleUpdateNavItem(index, 'is_active', e.target.checked)}
                      className="rounded text-[var(--color-gold)] focus:ring-[var(--color-gold)]"
                    />
                    <span>Active</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleDeleteNavItem(index)}
                    className="p-2 rounded text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                    title="Delete link"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Bar Preview */}
          <div className="p-4 rounded-lg bg-[var(--color-white)] border border-[var(--color-whisper)] shadow-xs">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-slate)] block mb-2">
              Header Navigation Preview (Desktop)
            </span>
            <div className="flex flex-wrap items-center gap-4 py-2 border-y border-zinc-100">
              {(formData.navigation || [])
                .filter((item) => item.is_active !== false)
                .map((item, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold tracking-wider uppercase text-[var(--color-ink)] hover:text-[var(--color-gold)] cursor-default transition-colors"
                  >
                    {item.label}
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Brand Logo & Name */}
      {activeSubTab === 'brand' && (
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-[var(--color-snow)] border border-[var(--color-whisper)]">
            <h3 className="text-sm font-semibold text-[var(--color-ink)] mb-1">
              Store Branding & Logo
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Edit the brand logo image, brand title, and tagline displayed in the top-left of the storefront header.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Brand Name (Header Title)"
              value={formData.brandName}
              onChange={(e) => handleChange('brandName', e.target.value)}
              placeholder="Angelika"
              hint="Main brand wordmark in header"
            />
            <Input
              label="Brand Tagline (Header Sub-label)"
              value={formData.brandTagline}
              onChange={(e) => handleChange('brandTagline', e.target.value)}
              placeholder="FASHIONS"
              hint="Gold uppercase subtitle below brand name"
            />
          </div>

          {/* Local Device Upload Box for Logo */}
          <div className="p-5 border-2 border-dashed border-[var(--color-whisper)] hover:border-[var(--color-gold)] rounded-xl bg-[var(--color-snow)]/60 transition-colors">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-gold-light)] flex items-center justify-center text-xl shadow-xs">
                  👑
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--color-ink)]">
                    Upload Logo from Local Device
                  </h4>
                  <p className="text-xs text-[var(--color-slate)]">
                    Select a PNG (with transparent background) or SVG/JPG logo from your computer
                  </p>
                </div>
              </div>
              <div>
                <input
                  type="file"
                  id="logo-file-upload"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,image/avif"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                />
                <label
                  htmlFor="logo-file-upload"
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-xs',
                    uploadingTarget === 'logo'
                      ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                      : 'bg-[var(--color-gold)] text-[var(--color-ink)] hover:brightness-105 active:scale-95'
                  )}
                >
                  {uploadingTarget === 'logo' ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin" />
                      <span>Uploading Logo...</span>
                    </>
                  ) : (
                    <>
                      <span>Choose Logo from Device</span>
                      <span>↑</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {uploadMessage?.target === 'logo' && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'mt-3 text-xs p-2.5 rounded-md border flex items-center gap-2',
                  uploadMessage.error
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                )}
              >
                <span>{uploadMessage.text}</span>
              </motion.div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Logo Image URL"
              value={formData.logoUrl}
              onChange={(e) => handleChange('logoUrl', e.target.value)}
              placeholder="/images/logo.png"
              hint="Path to the emblem / logo image"
            />
            <Input
              label="Logo Redirect URL"
              value={formData.logoHref}
              onChange={(e) => handleChange('logoHref', e.target.value)}
              placeholder="/"
              hint="Destination when logo is clicked (default: /)"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-ink)] mb-2">
              Logo Presets:
            </label>
            <div className="flex gap-2">
              {PRESET_LOGOS.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => handleChange('logoUrl', preset.url)}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-md border transition-all',
                    formData.logoUrl === preset.url
                      ? 'border-[var(--color-gold)] bg-[var(--color-gold-light)] font-semibold text-[var(--color-ink)]'
                      : 'border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-slate)] hover:border-gray-400'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Logo & Brand Preview */}
          <div className="p-6 rounded-lg bg-[var(--color-snow)] border border-[var(--color-whisper)] flex items-center gap-4">
            {formData.logoUrl ? (
              <img
                src={formData.logoUrl}
                alt={formData.brandName}
                className="h-12 w-auto object-contain rounded"
              />
            ) : null}
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-[var(--color-ink)] leading-none">
                {formData.brandName || 'Angelika'}
              </span>
              <span className="text-[10px] tracking-[0.22em] text-[var(--color-gold)] uppercase font-semibold mt-1">
                {formData.brandTagline || 'FASHIONS'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Styling Concierge Badge */}
      {activeSubTab === 'concierge' && (
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-[var(--color-snow)] border border-[var(--color-whisper)]">
            <h3 className="text-sm font-semibold text-[var(--color-ink)] mb-1">
              Bespoke Styling Concierge (Bottom Right Floating Badge)
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Edit the floating concierge badge shown in the bottom right corner of Image 1.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Concierge Title"
              value={formData.conciergeTitle}
              onChange={(e) => handleChange('conciergeTitle', e.target.value)}
              placeholder="Vidhya's Concierge"
            />
            <Input
              label="Concierge Subtitle"
              value={formData.conciergeSubtitle}
              onChange={(e) => handleChange('conciergeSubtitle', e.target.value)}
              placeholder="Bespoke Styling Chat"
            />
          </div>

          <Input
            label="WhatsApp Number (With country code)"
            value={formData.conciergeWhatsApp}
            onChange={(e) => handleChange('conciergeWhatsApp', e.target.value)}
            placeholder="+91 98765 43210"
            hint="Used when clients tap the concierge button for styling advice"
          />

          {/* Concierge Badge Preview */}
          <div className="p-6 rounded-lg bg-zinc-900 flex justify-end">
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-black/80 border border-white/10 shadow-xl">
              <div className="w-8 h-8 rounded-full bg-[var(--color-gold)] text-black flex items-center justify-center font-bold text-xs">
                💬
              </div>
              <div className="flex flex-col items-start pr-2">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-gold)]">
                  {formData.conciergeTitle || "Vidhya's Concierge"}
                </span>
                <span className="text-[11px] text-zinc-300 font-light">
                  {formData.conciergeSubtitle || 'Bespoke Styling Chat'}
                </span>
              </div>
              <span className="text-[var(--color-gold)] text-xs">→</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Footer Buttons */}
      <div className="pt-6 border-t border-[var(--color-whisper)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-[var(--color-slate)] hover:text-[var(--color-gold)] flex items-center gap-1 font-medium order-2 sm:order-1"
        >
          <span>Open Main UI in New Tab (Image 1)</span>
          <span>↗</span>
        </Link>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end order-1 sm:order-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            disabled={isSaving}
            onClick={handleSave}
            className="min-w-[140px]"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
