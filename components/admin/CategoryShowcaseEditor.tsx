'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type { CategoriesContent, CategoryCollectionItem } from '@/lib/actions/site-content';

interface CategoryShowcaseEditorProps {
  onCancel?: () => void;
  onSaved?: (data: CategoriesContent) => void;
}

const DEFAULT_CATEGORIES: CategoriesContent = {
  badge: 'Curated Collections',
  title: 'Shop by Category',
  subtitle: 'Discover our complete range of premium ethnic wear, each category handcrafted with timeless artisanal detail.',
  items: [
    {
      title: 'Kurtis',
      subtitle: 'Hand-block printed cotton',
      image: '/images/collection-kurtis.jpg',
      href: '/shop/kurtis',
      cta: 'Shop Kurtis',
      color: 'from-[var(--color-kurti)] to-[var(--color-gold-hover)]',
    },
    {
      title: 'Salwars',
      subtitle: 'Elegant palazzo & churidar sets',
      image: '/images/collection-salwars.jpg',
      href: '/shop/salwars',
      cta: 'Shop Salwars',
      color: 'from-[var(--color-salwar)] to-[var(--color-gold-hover)]',
    },
    {
      title: 'Lehengas',
      subtitle: 'Bridal & festive wear',
      image: '/images/collection-lehengas.jpg',
      href: '/shop/lehengas',
      cta: 'Shop Lehengas',
      color: 'from-[var(--color-lehenga)] to-[var(--color-gold-hover)]',
    },
    {
      title: 'Sarees',
      subtitle: 'Silk, cotton & chiffon drapes',
      image: '/images/collection-sarees.jpg',
      href: '/shop/sarees',
      cta: 'Shop Sarees',
      color: 'from-[var(--color-saree)] to-[var(--color-gold-hover)]',
    },
    {
      title: 'Dupattas',
      subtitle: 'Embroidered & printed accents',
      image: '/images/collection-dupattas.jpg',
      href: '/shop/dupattas',
      cta: 'Shop Dupattas',
      color: 'from-[var(--color-dupatta)] to-[var(--color-gold-hover)]',
    },
  ],
};

const CARD_METADATA = [
  {
    index: 0,
    slot: 'Left Column · Top Card',
    defaultTitle: 'Kurtis',
    defaultTag: 'Hand-block printed cotton',
    recommendedRatio: 'Aspect 4:3 (Landscape / Square-ish)',
    colorCode: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  {
    index: 1,
    slot: 'Left Column · Bottom Card',
    defaultTitle: 'Salwars',
    defaultTag: 'Elegant palazzo & churidar sets',
    recommendedRatio: 'Aspect 4:3 (Landscape / Square-ish)',
    colorCode: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
  {
    index: 2,
    slot: 'Centerpiece Hero · Full Height Center Card',
    defaultTitle: 'Lehengas',
    defaultTag: 'Bridal & festive wear',
    recommendedRatio: 'Aspect 3:4 / Tall Portrait (Editorial centerpiece)',
    colorCode: 'text-rose-700 bg-rose-50 border-rose-200',
    isHero: true,
  },
  {
    index: 3,
    slot: 'Right Column · Top Card',
    defaultTitle: 'Sarees',
    defaultTag: 'Silk, cotton & chiffon drapes',
    recommendedRatio: 'Aspect 4:3 (Landscape / Square-ish)',
    colorCode: 'text-purple-700 bg-purple-50 border-purple-200',
  },
  {
    index: 4,
    slot: 'Right Column · Bottom Card',
    defaultTitle: 'Dupattas',
    defaultTag: 'Embroidered & printed accents',
    recommendedRatio: 'Aspect 4:3 (Landscape / Square-ish)',
    colorCode: 'text-teal-700 bg-teal-50 border-teal-200',
  },
];

const PRESET_COLLECTION_IMAGES = [
  { label: 'Default Kurtis', url: '/images/collection-kurtis.jpg' },
  { label: 'Default Salwars', url: '/images/collection-salwars.jpg' },
  { label: 'Default Lehengas', url: '/images/collection-lehengas.jpg' },
  { label: 'Default Sarees', url: '/images/collection-sarees.jpg' },
  { label: 'Default Dupattas', url: '/images/collection-dupattas.jpg' },
  { label: 'Luxury Banner', url: '/images/hero-banner-luxury.jpg' },
  { label: 'Artisanal Drape', url: '/images/hero-bg.jpg' },
  { label: 'Regal Sarees', url: '/images/cat-sarees.jpg' },
  { label: 'Bridal Lehengas', url: '/images/cat-lehengas.jpg' },
];

export function CategoryShowcaseEditor({ onCancel, onSaved }: CategoryShowcaseEditorProps) {
  const [data, setData] = useState<CategoriesContent>(DEFAULT_CATEGORIES);
  const [activeTab, setActiveTab] = useState<'header' | 'preview' | number>('header');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadMessage, setUploadMessage] = useState<{ index: number; text: string; error?: boolean } | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // Fetch current saved content on mount
  useEffect(() => {
    let isMounted = true;
    async function loadContent() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.content?.categories) {
            const raw = json.content.categories;
            const items = Array.isArray(raw.items) && raw.items.length >= 5
              ? raw.items
              : DEFAULT_CATEGORIES.items.map((item, idx) => ({
                  ...item,
                  ...(raw.items?.[idx] || {}),
                }));

            if (isMounted) {
              setData({
                badge: raw.badge || DEFAULT_CATEGORIES.badge,
                title: raw.title || DEFAULT_CATEGORIES.title,
                subtitle: raw.subtitle || DEFAULT_CATEGORIES.subtitle,
                items,
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to load category showcase data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadContent();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleHeaderChange = (key: 'badge' | 'title' | 'subtitle', value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCardChange = (index: number, key: keyof CategoryCollectionItem, value: string) => {
    setData((prev) => {
      const current = prev.items[index] ?? DEFAULT_CATEGORIES.items[index] ?? DEFAULT_CATEGORIES.items[0]!;
      const updatedItem: CategoryCollectionItem = {
        ...current,
        [key]: value,
      };
      const items = [...prev.items];
      items[index] = updatedItem;
      return { ...prev, items };
    });
  };

  // Upload local device image
  const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);
    setUploadMessage({ index, text: 'Uploading from local device...' });

    try {
      const body = new FormData();
      body.append('file', file);
      body.append('target', `cat-${index}-${data.items[index]?.title?.toLowerCase() || 'card'}`);

      const res = await fetch('/api/admin/content/upload', {
        method: 'POST',
        body,
      });

      const resJson = await res.json();
      if (resJson.success && resJson.url) {
        handleCardChange(index, 'image', resJson.url);
        setUploadMessage({ index, text: '✓ Image uploaded successfully!' });
        setTimeout(() => setUploadMessage(null), 3500);
      } else {
        // Fallback: FileReader data URL
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            handleCardChange(index, 'image', reader.result);
            setUploadMessage({ index, text: '✓ Image loaded from device!' });
            setTimeout(() => setUploadMessage(null), 3500);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      // Fallback: read directly as data URL
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleCardChange(index, 'image', reader.result);
          setUploadMessage({ index, text: '✓ Image loaded from device!' });
          setTimeout(() => setUploadMessage(null), 3500);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingIndex(null);
      e.target.value = '';
    }
  };

  // Save changes to API & site-content.json
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: 'categories',
          data,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setSaveStatus({
          type: 'success',
          message: 'Category Showcase saved successfully! All 5 collections and texts are live on the homepage.',
        });
        if (onSaved) onSaved(data);
      } else {
        setSaveStatus({
          type: 'error',
          message: result.error || 'Failed to save changes. Please try again.',
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
        <p className="text-xs text-[var(--color-slate)] font-medium">Loading Category Showcase editor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Save / Feedback Status Message */}
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
          onClick={() => setActiveTab('header')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
            activeTab === 'header'
              ? 'bg-[var(--color-ink)] text-white shadow-xs'
              : 'bg-[var(--color-snow)] text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)]'
          )}
        >
          <span>🏷️</span>
          <span>Section Header</span>
        </button>

        {CARD_METADATA.map((meta) => {
          const item = data.items[meta.index] || DEFAULT_CATEGORIES.items[meta.index];
          const isSelected = activeTab === meta.index;
          return (
            <button
              key={meta.index}
              type="button"
              onClick={() => setActiveTab(meta.index)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border',
                isSelected
                  ? 'bg-[var(--color-gold)] text-white border-[var(--color-gold)] shadow-xs font-semibold'
                  : 'bg-[var(--color-white)] text-[var(--color-slate)] border-[var(--color-whisper)] hover:border-[var(--color-gold)] hover:text-[var(--color-ink)]'
              )}
            >
              <span>{meta.isHero ? '⭐' : `${meta.index + 1}.`}</span>
              <span>{item?.title || meta.defaultTitle}</span>
              {meta.isHero && (
                <span className="text-[9px] uppercase px-1 py-0.2 bg-white/25 rounded tracking-wider">Hero</span>
              )}
            </button>
          );
        })}

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
          <span>Storefront Grid Preview</span>
        </button>
      </div>

      {/* TAB 1: SECTION HEADER */}
      {activeTab === 'header' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5 bg-[var(--color-snow)]/50 p-5 rounded-2xl border border-[var(--color-whisper)]"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-whisper)]">
            <div>
              <h3 className="font-display text-base font-semibold text-[var(--color-ink)]">Section Title & Heading</h3>
              <p className="text-xs text-[var(--color-slate)] mt-0.5">
                The top headline that introduces the Curated Collections section on the homepage
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-whisper)] text-[var(--color-slate)] font-mono">
              3 Fields
            </span>
          </div>

          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="text-xs font-semibold text-[var(--color-ink)] block mb-1.5">
                Eyebrow / Badge Text
              </label>
              <Input
                value={data.badge}
                placeholder="Curated Collections"
                onChange={(e) => handleHeaderChange('badge', e.target.value)}
              />
              <p className="text-[11px] text-[var(--color-slate)] mt-1">
                Small gold uppercase label above the title (e.g. CURATED COLLECTIONS)
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--color-ink)] block mb-1.5">
                Main Section Title
              </label>
              <Input
                value={data.title}
                placeholder="Shop by Category"
                onChange={(e) => handleHeaderChange('title', e.target.value)}
              />
              <p className="text-[11px] text-[var(--color-slate)] mt-1">
                Primary serif heading (e.g. Shop by Category)
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--color-ink)] block mb-1.5">
                Subtitle / Description
              </label>
              <Textarea
                rows={3}
                value={data.subtitle}
                placeholder="Discover our complete range of premium ethnic wear, each category handcrafted with timeless artisanal detail."
                onChange={(e) => handleHeaderChange('subtitle', e.target.value)}
              />
              <p className="text-[11px] text-[var(--color-slate)] mt-1">
                Descriptive tagline displayed right beneath the heading
              </p>
            </div>
          </div>

          {/* Mini Live Preview of Header */}
          <div className="p-6 bg-white rounded-xl border border-[var(--color-whisper)] text-center max-w-xl mx-auto shadow-2xs mt-4">
            <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-gold)] mb-1">
              {data.badge || 'CURATED COLLECTIONS'}
            </span>
            <h2 className="font-display text-2xl font-medium text-[var(--color-ink)] mb-1.5">
              {data.title || 'Shop by Category'}
            </h2>
            <p className="text-xs text-[var(--color-slate)] leading-relaxed">
              {data.subtitle || 'Discover our complete range of premium ethnic wear...'}
            </p>
          </div>
        </motion.div>
      )}

      {/* TAB 2: INDIVIDUAL CARD EDITORS (0, 1, 2, 3, 4) */}
      {typeof activeTab === 'number' && (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {(() => {
            const index = activeTab;
            const meta = CARD_METADATA[index] ?? CARD_METADATA[0]!;
            const card = data.items[index] ?? DEFAULT_CATEGORIES.items[index] ?? DEFAULT_CATEGORIES.items[0]!;
            if (!meta || !card) return null;

            return (
              <div className="grid lg:grid-cols-12 gap-6 items-start">
                {/* Left Side: Card Form Fields (8 Cols) */}
                <div className="lg:col-span-7 space-y-5 bg-[var(--color-snow)]/50 p-5 rounded-2xl border border-[var(--color-whisper)]">
                  {/* Card Slot Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--color-whisper)]">
                    <div className="flex items-center gap-2">
                      <span className={cn('px-2.5 py-1 rounded-md text-xs font-medium border', meta.colorCode)}>
                        {meta.slot}
                      </span>
                      {meta.isHero && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[var(--color-gold)] text-white">
                          Centerpiece Hero
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[var(--color-slate)] font-mono">
                      Card {index + 1} of 5
                    </span>
                  </div>

                  {/* Card Title & Subtitle */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[var(--color-ink)] block mb-1.5">
                        Collection / Category Title
                      </label>
                      <Input
                        value={card.title}
                        placeholder={meta.defaultTitle}
                        onChange={(e) => handleCardChange(index, 'title', e.target.value)}
                      />
                      <p className="text-[10px] text-[var(--color-slate)] mt-1">
                        Display name (e.g. Kurtis, Lehengas, Sarees)
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[var(--color-ink)] block mb-1.5">
                        Subtitle / Tagline Tag
                      </label>
                      <Input
                        value={card.subtitle}
                        placeholder={meta.defaultTag}
                        onChange={(e) => handleCardChange(index, 'subtitle', e.target.value)}
                      />
                      <p className="text-[10px] text-[var(--color-slate)] mt-1">
                        Gold label over the image (e.g. HAND-BLOCK PRINTED COTTON)
                      </p>
                    </div>
                  </div>

                  {/* CTA Text & Redirect URL */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[var(--color-ink)] block mb-1.5">
                        Button / CTA Text
                      </label>
                      <Input
                        value={card.cta}
                        placeholder={`Shop ${card.title || 'Now'}`}
                        onChange={(e) => handleCardChange(index, 'cta', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[var(--color-ink)] block mb-1.5">
                        Redirect URL / Shop Link
                      </label>
                      <Input
                        value={card.href}
                        placeholder={`/shop/${card.title.toLowerCase()}`}
                        onChange={(e) => handleCardChange(index, 'href', e.target.value)}
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {['/shop/kurtis', '/shop/salwars', '/shop/lehengas', '/shop/sarees', '/shop/dupattas'].map((url) => (
                          <button
                            key={url}
                            type="button"
                            onClick={() => handleCardChange(index, 'href', url)}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-whisper)] text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-snow)] transition-colors font-mono"
                          >
                            {url}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Image Configuration & Device Upload */}
                  <div className="pt-3 border-t border-[var(--color-whisper)] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[var(--color-ink)] block">
                        Card Background Image
                      </label>
                      <span className="text-[11px] text-[var(--color-slate)]">
                        {meta.recommendedRatio}
                      </span>
                    </div>

                    {/* Image URL text input */}
                    <Input
                      value={card.image}
                      placeholder="/images/collection-kurtis.jpg or full https://..."
                      onChange={(e) => handleCardChange(index, 'image', e.target.value)}
                    />

                    {/* Local Device Upload Button */}
                    <div className="p-4 bg-white rounded-xl border-2 border-dashed border-[var(--color-whisper)] hover:border-[var(--color-gold)] transition-colors flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--color-snow)] flex items-center justify-center text-xl shrink-0">
                          📷
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-[var(--color-ink)]">
                            Upload image from local device
                          </div>
                          <div className="text-[11px] text-[var(--color-slate)]">
                            Select JPG, PNG, WebP or AVIF photo from your machine
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {uploadingIndex === index ? (
                          <span className="text-xs font-medium text-[var(--color-gold)] animate-pulse">
                            Uploading...
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRefs.current[index]?.click()}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-ink)] hover:bg-[var(--color-gold)] text-white transition-colors cursor-pointer shadow-2xs"
                          >
                            Browse from Device
                          </button>
                        )}
                      </div>

                      <input
                        ref={(el) => {
                          fileInputRefs.current[index] = el;
                        }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(index, e)}
                      />
                    </div>

                    {uploadMessage?.index === index && (
                      <p className={cn('text-xs font-medium', uploadMessage.error ? 'text-rose-500' : 'text-emerald-600')}>
                        {uploadMessage.text}
                      </p>
                    )}

                    {/* Quick Image Presets */}
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-slate)] block mb-1.5">
                        Or select from presets:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_COLLECTION_IMAGES.map((preset) => (
                          <button
                            key={preset.url}
                            type="button"
                            onClick={() => handleCardChange(index, 'image', preset.url)}
                            className={cn(
                              'text-[10px] px-2 py-1 rounded-md border transition-colors',
                              card.image === preset.url
                                ? 'bg-[var(--color-gold)] text-white border-[var(--color-gold)] font-medium'
                                : 'bg-white text-[var(--color-slate)] border-[var(--color-whisper)] hover:border-[var(--color-gold)]'
                            )}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Live Visual Card Mockup (5 Cols) */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--color-ink)]">
                      Live Card Preview
                    </span>
                    <span className="text-[11px] text-[var(--color-slate)] font-mono">
                      {card.href}
                    </span>
                  </div>

                  <div className="bg-[var(--color-snow)] p-3 rounded-2xl border border-[var(--color-whisper)] shadow-xs">
                    <div
                      className={cn(
                        'relative w-full rounded-2xl overflow-hidden shadow-md bg-black/40',
                        meta.isHero ? 'aspect-[3/4] min-h-[360px]' : 'aspect-[4/3]'
                      )}
                    >
                      {/* Image */}
                      {card.image ? (
                        <Image
                          src={card.image}
                          alt={card.title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[var(--color-whisper)] text-[var(--color-slate)] text-xs">
                          No Image Selected
                        </div>
                      )}

                      {/* Dark Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                      {/* Content Overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col justify-end z-10">
                        {meta.isHero ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em] bg-[var(--color-gold)]/20 text-[var(--color-gold)] border border-[var(--color-gold)]/40 mb-2 w-fit backdrop-blur-xs">
                            <span>✦</span>
                            <span>{card.subtitle || meta.defaultTag}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold)] mb-1 block drop-shadow-sm">
                            {card.subtitle || meta.defaultTag}
                          </span>
                        )}

                        <h3 className="font-display text-2xl font-medium text-white mb-2 drop-shadow-md">
                          {card.title || meta.defaultTitle}
                        </h3>

                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white">
                          <span>{card.cta || 'Explore'}</span>
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Card Navigator */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => setActiveTab(index - 1)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--color-whisper)] disabled:opacity-40 hover:bg-[var(--color-snow)] transition-colors"
                    >
                      ← Previous Card
                    </button>
                    <button
                      type="button"
                      disabled={index === 4}
                      onClick={() => setActiveTab(index + 1)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--color-whisper)] disabled:opacity-40 hover:bg-[var(--color-snow)] transition-colors"
                    >
                      Next Card →
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}

      {/* TAB 3: FULL STOREFRONT GRID PREVIEW */}
      {activeTab === 'preview' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 bg-[var(--color-snow)] p-6 rounded-2xl border border-[var(--color-whisper)]"
        >
          {/* Header Preview */}
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="inline-block text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-gold)] mb-1.5">
              {data.badge || 'Curated Collections'}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-medium text-[var(--color-ink)] mb-2">
              {data.title || 'Shop by Category'}
            </h2>
            <p className="text-[var(--color-slate)] text-xs sm:text-sm leading-relaxed">
              {data.subtitle}
            </p>
          </div>

          {/* 3-Column Grid Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* Left Column: 2 Cards */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              {[0, 1].map((idx) => {
                const item = data.items[idx];
                if (!item) return null;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className="group relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-sm bg-[var(--color-whisper)] cursor-pointer hover:ring-2 hover:ring-[var(--color-gold)] transition-all"
                    title={`Click to edit Card ${idx + 1}: ${item.title}`}
                  >
                    <Image
                      src={item.image || '/images/collection-kurtis.jpg'}
                      alt={item.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3.5 flex flex-col justify-end z-10">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold)] mb-1 block drop-shadow-sm">
                        {item.subtitle}
                      </span>
                      <h3 className="font-display text-lg font-medium text-white mb-1.5">
                        {item.title}
                      </h3>
                      <div className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-white/90">
                        <span>{item.cta}</span>
                        <span>→</span>
                      </div>
                    </div>
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] bg-black/60 text-white font-mono z-20">
                      Card {idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Center Column: Hero Centerpiece */}
            <div className="w-full h-full">
              {(() => {
                const item = data.items[2];
                if (!item) return null;
                return (
                  <div
                    onClick={() => setActiveTab(2)}
                    className="group relative w-full aspect-[4/3] md:aspect-auto md:h-full min-h-[300px] md:min-h-0 rounded-2xl overflow-hidden shadow-sm bg-[var(--color-whisper)] cursor-pointer hover:ring-2 hover:ring-[var(--color-gold)] transition-all"
                    title="Click to edit Centerpiece Hero: Lehengas"
                  >
                    <Image
                      src={item.image || '/images/collection-lehengas.jpg'}
                      alt={item.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end z-10">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em] bg-[var(--color-gold)]/20 text-[var(--color-gold)] border border-[var(--color-gold)]/40 mb-2 w-fit backdrop-blur-xs">
                        <span>✦</span>
                        <span>{item.subtitle}</span>
                      </span>
                      <h3 className="font-display text-2xl font-medium text-white mb-2">
                        {item.title}
                      </h3>
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white">
                        <span>{item.cta}</span>
                        <span>→</span>
                      </div>
                    </div>
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] bg-[var(--color-gold)] text-white font-semibold uppercase tracking-wider z-20">
                      Centerpiece (Card 3)
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Right Column: 2 Cards */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              {[3, 4].map((idx) => {
                const item = data.items[idx];
                if (!item) return null;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className="group relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-sm bg-[var(--color-whisper)] cursor-pointer hover:ring-2 hover:ring-[var(--color-gold)] transition-all"
                    title={`Click to edit Card ${idx + 1}: ${item.title}`}
                  >
                    <Image
                      src={item.image || '/images/collection-sarees.jpg'}
                      alt={item.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3.5 flex flex-col justify-end z-10">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold)] mb-1 block drop-shadow-sm">
                        {item.subtitle}
                      </span>
                      <h3 className="font-display text-lg font-medium text-white mb-1.5">
                        {item.title}
                      </h3>
                      <div className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-white/90">
                        <span>{item.cta}</span>
                        <span>→</span>
                      </div>
                    </div>
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] bg-black/60 text-white font-mono z-20">
                      Card {idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-center text-xs text-[var(--color-slate)] italic">
            Tip: Click any card in this layout preview to immediately jump to its editor
          </p>
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
