'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { cn } from '@/lib/utils/cn';
import type { BrandStoryContent } from '@/lib/actions/site-content';

interface BrandStoryEditorProps {
  onCancel?: () => void;
  onSaved?: (data: BrandStoryContent) => void;
}

const DEFAULT_BRAND_STORY: BrandStoryContent = {
  badge: 'Our Story',
  title: 'Crafted with Love, Worn with Pride',
  headingPrefix: 'Crafted with',
  headingHighlight: 'Love',
  headingSuffix: ', Worn with Pride',
  image: '/images/vidhya-story.jpg',
  imageAlt: 'Vidhya in her atelier',
  storyParagraphs: [
    "Angelika Fashions was born from Vidhya's passion for preserving Indian textile heritage while creating contemporary silhouettes for the modern woman.",
    "Every piece in our collection is thoughtfully designed, from selecting the finest fabrics to collaborating with skilled artisans who bring generations of expertise to each stitch.",
    "When you wear Angelika, you're not just wearing clothes — you're wearing a piece of tradition reimagined for today, made with integrity and worn with confidence.",
  ],
  story: "Angelika Fashions was born from Vidhya's passion for preserving Indian textile heritage while creating contemporary silhouettes for the modern woman.\n\nEvery piece in our collection is thoughtfully designed, from selecting the finest fabrics to collaborating with skilled artisans who bring generations of expertise to each stitch.\n\nWhen you wear Angelika, you're not just wearing clothes — you're wearing a piece of tradition reimagined for today, made with integrity and worn with confidence.",
  quote: '"Fashion that honors where you come from while embracing where you are going."',
  primaryCtaText: 'Read Our Story',
  primaryCtaLink: '/about',
  whatsappCtaText: 'Chat with Vidhya',
  whatsappLink: "https://wa.me/91XXXXXXXXXX?text=Hi%20Vidhya,%20I'd%20like%20to%20know%20more%20about%20your%20journey",
};

const PRESET_STORY_IMAGES = [
  { label: 'Vidhya in Atelier (Default)', url: '/images/vidhya-story.jpg' },
  { label: 'Vidhya Founder Portrait', url: '/images/vidhya-founder.jpg' },
  { label: 'Artisan Workshop', url: '/images/artisan-workshop.jpg' },
  { label: 'About Page Hero', url: '/images/about-hero.jpg' },
  { label: 'Vidhya Avatar', url: '/images/avatar-vidhya.jpg' },
  { label: 'Hero Couture Drape', url: '/images/hero-new-couture.jpg' },
];

export function BrandStoryEditor({ onCancel, onSaved }: BrandStoryEditorProps) {
  const [data, setData] = useState<BrandStoryContent>(DEFAULT_BRAND_STORY);
  const [activeTab, setActiveTab] = useState<'content' | 'image' | 'ctas' | 'preview'>('content');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load existing content on mount
  useEffect(() => {
    let isMounted = true;
    async function loadContent() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.content?.['brand-story']) {
            const raw = json.content['brand-story'];
            let paragraphs = DEFAULT_BRAND_STORY.storyParagraphs;

            if (Array.isArray(raw.storyParagraphs) && raw.storyParagraphs.length > 0) {
              paragraphs = raw.storyParagraphs;
            } else if (raw.story && typeof raw.story === 'string') {
              const split = raw.story.split('\n\n').filter((s: string) => s.trim().length > 0);
              if (split.length > 0) paragraphs = split;
            }

            if (isMounted) {
              setData({
                badge: raw.badge || DEFAULT_BRAND_STORY.badge,
                title: raw.title || DEFAULT_BRAND_STORY.title,
                headingPrefix: raw.headingPrefix ?? DEFAULT_BRAND_STORY.headingPrefix,
                headingHighlight: raw.headingHighlight ?? DEFAULT_BRAND_STORY.headingHighlight,
                headingSuffix: raw.headingSuffix ?? DEFAULT_BRAND_STORY.headingSuffix,
                image: raw.image || DEFAULT_BRAND_STORY.image,
                imageAlt: raw.imageAlt || DEFAULT_BRAND_STORY.imageAlt,
                storyParagraphs: paragraphs,
                story: raw.story || paragraphs.join('\n\n'),
                quote: raw.quote || DEFAULT_BRAND_STORY.quote,
                primaryCtaText: raw.primaryCtaText || DEFAULT_BRAND_STORY.primaryCtaText,
                primaryCtaLink: raw.primaryCtaLink || DEFAULT_BRAND_STORY.primaryCtaLink,
                whatsappCtaText: raw.whatsappCtaText || DEFAULT_BRAND_STORY.whatsappCtaText,
                whatsappLink: raw.whatsappLink || DEFAULT_BRAND_STORY.whatsappLink,
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to load brand-story data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadContent();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (key: keyof BrandStoryContent, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleParagraphChange = (index: number, text: string) => {
    setData((prev) => {
      const storyParagraphs = [...prev.storyParagraphs];
      storyParagraphs[index] = text;
      return {
        ...prev,
        storyParagraphs,
        story: storyParagraphs.join('\n\n'),
      };
    });
  };

  const handleAddParagraph = () => {
    setData((prev) => {
      const storyParagraphs = [...prev.storyParagraphs, 'New paragraph about Vidhya and Angelika atelier...'];
      return {
        ...prev,
        storyParagraphs,
        story: storyParagraphs.join('\n\n'),
      };
    });
  };

  const handleRemoveParagraph = (index: number) => {
    if (data.storyParagraphs.length <= 1) return;
    setData((prev) => {
      const storyParagraphs = prev.storyParagraphs.filter((_, i) => i !== index);
      return {
        ...prev,
        storyParagraphs,
        story: storyParagraphs.join('\n\n'),
      };
    });
  };

  // Upload local device image
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMessage({ text: 'Uploading from local device...' });

    try {
      const body = new FormData();
      body.append('file', file);
      body.append('target', 'brand-story');

      const res = await fetch('/api/admin/content/upload', {
        method: 'POST',
        body,
      });

      const resJson = await res.json();
      if (resJson.success && resJson.url) {
        handleChange('image', resJson.url);
        setUploadMessage({ text: '✓ Story photo uploaded successfully!' });
        setTimeout(() => setUploadMessage(null), 3500);
      } else {
        // Fallback: FileReader
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            handleChange('image', reader.result);
            setUploadMessage({ text: '✓ Photo loaded from device!' });
            setTimeout(() => setUploadMessage(null), 3500);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleChange('image', reader.result);
          setUploadMessage({ text: '✓ Photo loaded from device!' });
          setTimeout(() => setUploadMessage(null), 3500);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      // Synchronize full title from prefix, highlight, and suffix if applicable
      const fullTitle = `${data.headingPrefix || ''} ${data.headingHighlight || ''}${data.headingSuffix || ''}`.trim() || data.title;
      const payload: BrandStoryContent = {
        ...data,
        title: fullTitle,
        story: data.storyParagraphs.join('\n\n'),
      };

      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: 'brand-story',
          data: payload,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setSaveStatus({
          type: 'success',
          message: '"Brand Story (Our Story)" section updated successfully! Changes are live on your storefront.',
        });
        if (onSaved) onSaved(payload);
      } else {
        setSaveStatus({
          type: 'error',
          message: result.error || 'Failed to save changes.',
        });
      }
    } catch (err: any) {
      setSaveStatus({
        type: 'error',
        message: err.message || 'Network error while saving.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-gold)] border-t-transparent animate-spin" />
        <p className="text-xs text-[var(--color-slate)] font-medium">Loading Brand Story editor...</p>
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
              'p-4 rounded-xl text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border shadow-xs',
              saveStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            )}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg leading-none">{saveStatus.type === 'success' ? '✓' : '⚠️'}</span>
              <span className="font-medium">{saveStatus.message}</span>
            </div>
            {saveStatus.type === 'success' && (
              <Link
                href="/"
                target="_blank"
                className="font-semibold text-emerald-800 underline hover:text-emerald-950 inline-flex items-center gap-1.5 shrink-0 px-3 py-1 bg-white/70 rounded-md border border-emerald-300"
              >
                <span>View Storefront</span>
                <span>↗</span>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Sub-Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-whisper)] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
            activeTab === 'content'
              ? 'bg-[var(--color-ink)] text-white shadow-xs'
              : 'bg-[var(--color-snow)] text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)]'
          )}
        >
          <span>✍️</span>
          <span>Story & Headings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('image')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
            activeTab === 'image'
              ? 'bg-[var(--color-ink)] text-white shadow-xs'
              : 'bg-[var(--color-snow)] text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)]'
          )}
        >
          <span>📸</span>
          <span>Atelier Photo & Upload</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ctas')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
            activeTab === 'ctas'
              ? 'bg-[var(--color-ink)] text-white shadow-xs'
              : 'bg-[var(--color-snow)] text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)]'
          )}
        >
          <span>🔗</span>
          <span>Action Buttons & WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ml-auto border',
            activeTab === 'preview'
              ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)] shadow-xs'
              : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
          )}
        >
          <span>👁️</span>
          <span>Live Storefront Preview</span>
        </button>
      </div>

      {/* TAB 1: STORY HEADINGS & PARAGRAPHS */}
      {activeTab === 'content' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 bg-[var(--color-snow)]/50 p-5 rounded-2xl border border-[var(--color-whisper)]"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-whisper)]">
            <div>
              <h3 className="font-display text-base font-semibold text-[var(--color-ink)]">
                Badge, Headline & Story Paragraphs
              </h3>
              <p className="text-xs text-[var(--color-slate)] mt-0.5">
                Configure the typography, gold gradient highlight, and storytelling narrative shown beside Vidhya&apos;s photo
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-whisper)] text-[var(--color-slate)] font-mono">
              Editorial Copy
            </span>
          </div>

          {/* Badge */}
          <div className="max-w-md">
            <label className="text-xs font-semibold text-[var(--color-ink)] block mb-1.5">
              Eyebrow Badge Text
            </label>
            <Input
              value={data.badge}
              placeholder="Our Story"
              onChange={(e) => handleChange('badge', e.target.value)}
            />
            <p className="text-[11px] text-[var(--color-slate)] mt-1">
              Small gold pill badge above the headline (e.g. OUR STORY)
            </p>
          </div>

          {/* 3-Part Headline */}
          <div className="space-y-3 p-4 bg-white rounded-xl border border-[var(--color-whisper)]">
            <span className="text-xs font-bold text-[var(--color-ink)] block">
              Editorial Headline with Gold Accent
            </span>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[var(--color-slate)] block mb-1">
                  Prefix (Dark Ink)
                </label>
                <Input
                  value={data.headingPrefix ?? 'Crafted with'}
                  placeholder="Crafted with"
                  onChange={(e) => handleChange('headingPrefix', e.target.value)}
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[var(--color-gold)] block mb-1">
                  Highlight (Gold Gradient)
                </label>
                <Input
                  value={data.headingHighlight ?? 'Love'}
                  placeholder="Love"
                  onChange={(e) => handleChange('headingHighlight', e.target.value)}
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[var(--color-slate)] block mb-1">
                  Suffix (Dark Ink)
                </label>
                <Input
                  value={data.headingSuffix ?? ', Worn with Pride'}
                  placeholder=", Worn with Pride"
                  onChange={(e) => handleChange('headingSuffix', e.target.value)}
                />
              </div>
            </div>

            {/* Headline Preview */}
            <div className="pt-2 text-center sm:text-left border-t border-[var(--color-whisper)]/60">
              <span className="text-[11px] text-[var(--color-slate)] block mb-1">Headline Preview:</span>
              <h3 className="font-display text-2xl font-medium text-[var(--color-ink)]">
                {data.headingPrefix}{' '}
                <span className="text-gradient-gold">{data.headingHighlight}</span>
                {data.headingSuffix}
              </h3>
            </div>
          </div>

          {/* Story Paragraphs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-[var(--color-ink)] block">
                  Story Paragraphs ({data.storyParagraphs.length})
                </label>
                <span className="text-[11px] text-[var(--color-slate)]">
                  Each paragraph appears formatted on the right side of the section
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddParagraph}
                className="text-xs font-medium text-[var(--color-gold)] hover:underline flex items-center gap-1"
              >
                + Add Paragraph
              </button>
            </div>

            {data.storyParagraphs.map((para, idx) => (
              <div key={idx} className="p-4 bg-white rounded-xl border border-[var(--color-whisper)] space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
                    Paragraph {idx + 1}
                  </span>
                  {data.storyParagraphs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveParagraph(idx)}
                      className="text-[11px] text-rose-500 hover:text-rose-700 underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <Textarea
                  rows={3}
                  value={para}
                  placeholder={`Paragraph ${idx + 1} text...`}
                  onChange={(e) => handleParagraphChange(idx, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="p-4 bg-white rounded-xl border border-[var(--color-whisper)]">
            <label className="text-xs font-semibold text-[var(--color-ink)] block mb-1.5">
              Brand / Founder Quote (Optional)
            </label>
            <Input
              value={data.quote || ''}
              placeholder='"Fashion that honors where you come from while embracing where you are going."'
              onChange={(e) => handleChange('quote', e.target.value)}
            />
          </div>
        </motion.div>
      )}

      {/* TAB 2: ATELIER PHOTO & LOCAL DEVICE UPLOAD */}
      {activeTab === 'image' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 bg-[var(--color-snow)]/50 p-5 rounded-2xl border border-[var(--color-whisper)]"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-whisper)]">
            <div>
              <h3 className="font-display text-base font-semibold text-[var(--color-ink)]">
                Atelier Photo & Image Upload
              </h3>
              <p className="text-xs text-[var(--color-slate)] mt-0.5">
                The portrait of Vidhya in her workshop shown on the left side of the Our Story section
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-whisper)] text-[var(--color-slate)] font-mono">
              Aspect 4:5
            </span>
          </div>

          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* Form & Upload (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--color-ink)] block mb-1.5">
                  Image URL / File Path
                </label>
                <Input
                  value={data.image}
                  placeholder="/images/vidhya-story.jpg or https://..."
                  onChange={(e) => handleChange('image', e.target.value)}
                />
                <p className="text-[11px] text-[var(--color-slate)] mt-1">
                  Enter local path (/images/...) or full image URL
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--color-ink)] block mb-1.5">
                  Image Alt Text (Accessibility & SEO)
                </label>
                <Input
                  value={data.imageAlt || ''}
                  placeholder="Vidhya in her atelier"
                  onChange={(e) => handleChange('imageAlt', e.target.value)}
                />
              </div>

              {/* Local Device Upload Button */}
              <div className="p-4 bg-white rounded-xl border-2 border-dashed border-[var(--color-whisper)] hover:border-[var(--color-gold)] transition-colors flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-snow)] flex items-center justify-center text-xl shrink-0">
                    📸
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--color-ink)]">
                      Upload photo from your device
                    </div>
                    <div className="text-[11px] text-[var(--color-slate)]">
                      Select JPG, PNG, WebP or AVIF photo from your machine
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isUploading ? (
                    <span className="text-xs font-medium text-[var(--color-gold)] animate-pulse">
                      Uploading...
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-ink)] hover:bg-[var(--color-gold)] text-white transition-colors cursor-pointer shadow-2xs"
                    >
                      Browse from Device
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {uploadMessage && (
                <p className={cn('text-xs font-medium', uploadMessage.error ? 'text-rose-500' : 'text-emerald-600')}>
                  {uploadMessage.text}
                </p>
              )}

              {/* Presets */}
              <div className="p-4 bg-white rounded-xl border border-[var(--color-whisper)]">
                <span className="text-xs font-semibold text-[var(--color-ink)] block mb-2">
                  Or select from brand presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_STORY_IMAGES.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => handleChange('image', preset.url)}
                      className={cn(
                        'text-xs px-2.5 py-1 rounded-md border transition-colors',
                        data.image === preset.url
                          ? 'bg-[var(--color-gold)] text-white border-[var(--color-gold)] font-medium'
                          : 'bg-[var(--color-snow)] text-[var(--color-slate)] border-[var(--color-whisper)] hover:border-[var(--color-gold)]'
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual Image Preview (5 Cols) */}
            <div className="lg:col-span-5 space-y-2">
              <span className="text-xs font-semibold text-[var(--color-ink)] block">
                Photo Preview with Atelier Scrim
              </span>
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[var(--color-whisper)] shadow-md">
                {data.image ? (
                  <Image
                    src={data.image}
                    alt={data.imageAlt || 'Vidhya in atelier'}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[var(--color-slate)]">
                    No photo selected
                  </div>
                )}
                {/* Glow ambient circles matching storefront */}
                <div className="absolute -bottom-6 -right-6 w-36 h-36 rounded-full bg-[var(--color-gold)]/20 blur-2xl pointer-events-none" />
                <div className="absolute -top-6 -left-6 w-36 h-36 rounded-full bg-[var(--color-gold)]/20 blur-2xl pointer-events-none" />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3: ACTION BUTTONS & WHATSAPP */}
      {activeTab === 'ctas' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 bg-[var(--color-snow)]/50 p-5 rounded-2xl border border-[var(--color-whisper)]"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-whisper)]">
            <div>
              <h3 className="font-display text-base font-semibold text-[var(--color-ink)]">
                Story Action Buttons
              </h3>
              <p className="text-xs text-[var(--color-slate)] mt-0.5">
                Customize the &quot;Read Our Story&quot; button and the instant WhatsApp concierge chat button
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-whisper)] text-[var(--color-slate)] font-mono">
              2 Buttons
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Primary Button */}
            <div className="p-4 bg-white rounded-xl border border-[var(--color-whisper)] space-y-3">
              <span className="text-xs font-bold text-[var(--color-ink)] block">
                Primary Button (Gold Atelier Button)
              </span>

              <div>
                <label className="text-[11px] font-semibold text-[var(--color-slate)] block mb-1">
                  Button Text
                </label>
                <Input
                  value={data.primaryCtaText}
                  placeholder="Read Our Story"
                  onChange={(e) => handleChange('primaryCtaText', e.target.value)}
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[var(--color-slate)] block mb-1">
                  Destination Link
                </label>
                <Input
                  value={data.primaryCtaLink}
                  placeholder="/about"
                  onChange={(e) => handleChange('primaryCtaLink', e.target.value)}
                />
                <div className="flex gap-2 mt-2">
                  {['/about', '/shop', '/vidhyas-picks'].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => handleChange('primaryCtaLink', l)}
                      className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-whisper)] text-[var(--color-slate)] font-mono"
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* WhatsApp Button */}
            <div className="p-4 bg-white rounded-xl border border-[var(--color-whisper)] space-y-3">
              <div className="flex items-center gap-1.5">
                <span className="text-base">💬</span>
                <span className="text-xs font-bold text-[var(--color-ink)]">
                  WhatsApp Concierge Button (Green)
                </span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[var(--color-slate)] block mb-1">
                  Button Text
                </label>
                <Input
                  value={data.whatsappCtaText}
                  placeholder="Chat with Vidhya"
                  onChange={(e) => handleChange('whatsappCtaText', e.target.value)}
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[var(--color-slate)] block mb-1">
                  WhatsApp Link / Phone URL
                </label>
                <Input
                  value={data.whatsappLink || ''}
                  placeholder="https://wa.me/91XXXXXXXXXX?text=..."
                  onChange={(e) => handleChange('whatsappLink', e.target.value)}
                />
                <p className="text-[10px] text-[var(--color-slate)] mt-1">
                  Format: https://wa.me/&lt;number&gt;?text=&lt;encoded_message&gt;
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 4: LIVE STOREFRONT PREVIEW */}
      {activeTab === 'preview' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-[var(--color-whisper)] shadow-xs"
        >
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Left Photo */}
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg bg-[var(--color-whisper)]">
              {data.image ? (
                <Image
                  src={data.image}
                  alt={data.imageAlt || 'Vidhya in atelier'}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : null}
              <div className="absolute -bottom-6 -right-6 w-40 h-40 rounded-full bg-[var(--color-gold)]/15 blur-2xl pointer-events-none" />
              <div className="absolute -top-6 -left-6 w-40 h-40 rounded-full bg-[var(--color-gold)]/15 blur-2xl pointer-events-none" />
            </div>

            {/* Right Editorial Copy */}
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-[var(--color-gold-light)] text-[var(--color-gold)] text-xs font-semibold uppercase tracking-wider">
                {data.badge || 'OUR STORY'}
              </span>

              <h2 className="font-display text-3xl sm:text-4xl font-medium text-[var(--color-ink)] leading-tight">
                {data.headingPrefix}{' '}
                <span className="text-gradient-gold">{data.headingHighlight}</span>
                {data.headingSuffix}
              </h2>

              <div className="space-y-3 text-[var(--color-slate)] text-sm sm:text-base leading-relaxed">
                {data.storyParagraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-3">
                <div className="px-6 py-2.5 bg-[var(--color-gold)] hover:bg-[var(--color-gold-hover)] text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm">
                  {data.primaryCtaText || 'Read Our Story'}
                </div>

                <div className="px-5 py-2.5 bg-[#25D366] text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm inline-flex items-center gap-2">
                  <SocialIcon platform="whatsapp" size="sm" />
                  <span>{data.whatsappCtaText || 'Chat with Vidhya'}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Footer: Cancel & Save Changes */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-whisper)]">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="text-xs text-[var(--color-slate)] hover:text-[var(--color-ink)] underline hidden sm:inline"
          >
            Preview Live Homepage ↗
          </Link>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className="min-w-[140px]"
          >
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
