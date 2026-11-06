'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type { NewArrivalsContent, NewArrivalProductItem } from '@/lib/actions/site-content-types';

interface NewArrivalsEditorProps {
  onCancel?: () => void;
  onSaved?: (data: NewArrivalsContent) => void;
}

const DEFAULT_NEW_ARRIVALS: NewArrivalsContent = {
  badge: 'New Arrivals',
  heading: 'Fresh from',
  headingHighlight: 'the Atelier',
  ctaText: 'View All New',
  ctaLink: '/new-arrivals',
  mode: 'custom',
  limit: 8,
  items: [
    {
      id: 'na-1',
      name: 'Royal Crimson Zari Bridal Lehenga Set',
      category: 'Salwars',
      price: 28999,
      originalPrice: 34999,
      image: '/images/collection-lehengas.jpg',
      href: '/shop/salwars',
      isVidhyasPick: true,
      discount: 17,
    },
    {
      id: 'na-2',
      name: 'Handcrafted Velvet Zardosi Couture Ensemble',
      category: 'Kurtis',
      price: 11999,
      originalPrice: 14999,
      image: '/images/cat-lehengas.jpg',
      href: '/shop/kurtis',
      isVidhyasPick: false,
      discount: 20,
    },
    {
      id: 'na-3',
      name: 'Banarasi Silk Brocade Palazzo & Churidar Set',
      category: 'Salwars',
      price: 14499,
      originalPrice: 17999,
      image: '/images/collection-salwars.jpg',
      href: '/shop/salwars',
      isVidhyasPick: false,
      discount: 19,
    },
    {
      id: 'na-4',
      name: 'Hand-Block Printed Chanderi Cotton Kurti',
      category: 'Kurtis',
      price: 6499,
      originalPrice: 7999,
      image: '/images/collection-kurtis.jpg',
      href: '/shop/kurtis',
      isVidhyasPick: true,
      discount: 19,
    },
    {
      id: 'na-5',
      name: 'Handwoven Gold Zari Chanderi Saree',
      category: 'Sarees',
      price: 12999,
      originalPrice: 15499,
      image: '/images/artisan-workshop.jpg',
      href: '/product/handwoven-gold-zari-chanderi-saree',
      isVidhyasPick: false,
      discount: 16,
    },
    {
      id: 'na-6',
      name: 'Heritage Temple Kanjivaram Silk Saree',
      category: 'Sarees',
      price: 22499,
      originalPrice: 26999,
      image: '/images/collection-sarees.jpg',
      href: '/product/heritage-temple-kanjivaram-silk-saree',
      isVidhyasPick: true,
      discount: 17,
    },
    {
      id: 'na-7',
      name: 'Lucknowi Mukaish Chikankari Georgette Saree',
      category: 'Sarees',
      price: 15499,
      originalPrice: 18999,
      image: '/images/cat-sarees.jpg',
      href: '/product/lucknowi-mukaish-chikankari-georgette-saree',
      isVidhyasPick: true,
      discount: 18,
    },
    {
      id: 'na-8',
      name: 'Amritsari Hand-Embroidered Phulkari Dupatta',
      category: 'Dupattas',
      price: 3299,
      originalPrice: 3999,
      image: '/images/collection-dupattas.jpg',
      href: '/product/amritsari-hand-embroidered-phulkari-dupatta',
      isVidhyasPick: false,
      discount: 18,
    },
  ],
};

const PRESET_PRODUCT_IMAGES = [
  { label: 'Sarees Luxury', url: '/images/cat-sarees.jpg' },
  { label: 'Collection Sarees', url: '/images/collection-sarees.jpg' },
  { label: 'Collection Kurtis', url: '/images/collection-kurtis.jpg' },
  { label: 'Collection Salwars', url: '/images/collection-salwars.jpg' },
  { label: 'Collection Lehengas', url: '/images/collection-lehengas.jpg' },
  { label: 'Collection Dupattas', url: '/images/collection-dupattas.jpg' },
  { label: 'Vidhya Story', url: '/images/vidhya-story.jpg' },
  { label: 'Artisan Workshop', url: '/images/artisan-workshop.jpg' },
];

export function NewArrivalsEditor({ onCancel, onSaved }: NewArrivalsEditorProps) {
  const [data, setData] = useState<NewArrivalsContent>(DEFAULT_NEW_ARRIVALS);
  const [activeTab, setActiveTab] = useState<'header' | 'preview' | number>('header');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadMessage, setUploadMessage] = useState<{ index: number; text: string; error?: boolean } | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // Load existing content on mount
  useEffect(() => {
    let isMounted = true;
    async function loadContent() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.content?.['new-arrivals']) {
            const raw = json.content['new-arrivals'];
            const items = Array.isArray(raw.items) && raw.items.length >= 8
              ? raw.items
              : DEFAULT_NEW_ARRIVALS.items.map((defItem, idx) => ({
                  ...defItem,
                  ...(raw.items?.[idx] || {}),
                }));

            if (isMounted) {
              setData({
                badge: raw.badge || DEFAULT_NEW_ARRIVALS.badge,
                heading: raw.heading || DEFAULT_NEW_ARRIVALS.heading,
                headingHighlight: raw.headingHighlight || DEFAULT_NEW_ARRIVALS.headingHighlight,
                ctaText: raw.ctaText || DEFAULT_NEW_ARRIVALS.ctaText,
                ctaLink: raw.ctaLink || DEFAULT_NEW_ARRIVALS.ctaLink,
                mode: raw.mode || DEFAULT_NEW_ARRIVALS.mode,
                limit: raw.limit || DEFAULT_NEW_ARRIVALS.limit,
                items,
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to load new-arrivals content:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadContent();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleHeaderChange = (key: keyof Omit<NewArrivalsContent, 'items'>, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleItemChange = (index: number, key: keyof NewArrivalProductItem, value: any) => {
    setData((prev) => {
      const items = [...prev.items];
      const current = items[index] ?? DEFAULT_NEW_ARRIVALS.items[0]!;
      const updated = { ...current, [key]: value };

      // Auto update discount if price or originalPrice changes
      if (key === 'price' || key === 'originalPrice') {
        const p = key === 'price' ? Number(value) : updated.price;
        const op = key === 'originalPrice' ? Number(value) : updated.originalPrice;
        if (op && op > p) {
          updated.discount = Math.round(((op - p) / op) * 100);
        } else {
          updated.discount = 0;
        }
      }

      items[index] = updated;
      return { ...prev, items };
    });
  };

  const handleAddItem = () => {
    const newItem: NewArrivalProductItem = {
      id: `na-${Date.now()}`,
      name: 'New Couture Ensemble',
      category: 'Sarees',
      price: 14999,
      originalPrice: 17999,
      image: '/images/collection-sarees.jpg',
      href: '/shop',
      isVidhyasPick: false,
      discount: 17,
    };
    setData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
    setActiveTab(data.items.length);
  };

  const handleRemoveItem = (index: number) => {
    if (data.items.length <= 1) return;
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
    setActiveTab('header');
  };

  // Local device file upload
  const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);
    setUploadMessage({ index, text: 'Uploading from local device...' });

    try {
      const body = new FormData();
      body.append('file', file);
      body.append('target', `arrival-${index}`);

      const res = await fetch('/api/admin/content/upload', {
        method: 'POST',
        body,
      });

      const resJson = await res.json();
      if (resJson.success && resJson.url) {
        handleItemChange(index, 'image', resJson.url);
        setUploadMessage({ index, text: '✓ Image uploaded successfully!' });
        setTimeout(() => setUploadMessage(null), 3500);
      } else {
        // Fallback: FileReader data URL
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            handleItemChange(index, 'image', reader.result);
            setUploadMessage({ index, text: '✓ Image loaded from device!' });
            setTimeout(() => setUploadMessage(null), 3500);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleItemChange(index, 'image', reader.result);
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

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: 'new-arrivals',
          data,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setSaveStatus({
          type: 'success',
          message: '"Fresh from the Atelier" section saved successfully! Your changes are now live on the storefront.',
        });
        if (onSaved) onSaved(data);
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
        <p className="text-xs text-[var(--color-slate)] font-medium">Loading New Arrivals editor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Save Notification */}
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
          <span>Section Header & Mode</span>
        </button>

        {data.items.map((item, index) => {
          const isSelected = activeTab === index;
          return (
            <button
              key={index}
              type="button"
              onClick={() => setActiveTab(index)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border',
                isSelected
                  ? 'bg-[var(--color-gold)] text-white border-[var(--color-gold)] shadow-xs font-semibold'
                  : 'bg-[var(--color-white)] text-[var(--color-slate)] border-[var(--color-whisper)] hover:border-[var(--color-gold)] hover:text-[var(--color-ink)]'
              )}
            >
              <span>{index + 1}.</span>
              <span className="max-w-[120px] truncate">{item.name || `Card ${index + 1}`}</span>
              {item.isVidhyasPick && (
                <span className="text-[9px] bg-black/30 px-1 rounded">⭐</span>
              )}
            </button>
          );
        })}

        <button
          type="button"
          onClick={handleAddItem}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-dashed border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold-light)]/30 transition-all flex items-center gap-1"
          title="Add another product card"
        >
          <span>+ Add Card</span>
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
          <span>Storefront Grid Preview</span>
        </button>
      </div>

      {/* TAB 1: SECTION HEADER & DISPLAY MODE */}
      {activeTab === 'header' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 bg-[var(--color-snow)]/50 p-5 rounded-2xl border border-[var(--color-whisper)]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-whisper)]">
            <div>
              <h3 className="font-display text-base font-semibold text-[var(--color-ink)]">
                Section Title, Heading & Header CTA
              </h3>
              <p className="text-xs text-[var(--color-slate)] mt-0.5">
                Controls the top heading and &quot;View All New&quot; button displayed above the product grid
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-whisper)] text-[var(--color-slate)] font-mono self-start sm:self-auto">
              Header Settings
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[var(--color-ink)] block mb-1.5">
                Eyebrow Badge Text
              </label>
              <Input
                value={data.badge}
                placeholder="New Arrivals"
                onChange={(e) => handleHeaderChange('badge', e.target.value)}
              />
              <p className="text-[11px] text-[var(--color-slate)] mt-1">
                Gold pill badge above the heading (e.g. New Arrivals)
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--color-ink)] block mb-1.5">
                CTA Button Text
              </label>
              <Input
                value={data.ctaText}
                placeholder="View All New"
                onChange={(e) => handleHeaderChange('ctaText', e.target.value)}
              />
              <p className="text-[11px] text-[var(--color-slate)] mt-1">
                Button on the top right (e.g. View All New)
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[var(--color-ink)] block mb-1.5">
                Heading Prefix
              </label>
              <Input
                value={data.heading}
                placeholder="Fresh from"
                onChange={(e) => handleHeaderChange('heading', e.target.value)}
              />
              <p className="text-[11px] text-[var(--color-slate)] mt-1">
                First part of title in standard ink (e.g. Fresh from)
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--color-ink)] block mb-1.5">
                Heading Gold Highlight
              </label>
              <Input
                value={data.headingHighlight}
                placeholder="the Atelier"
                onChange={(e) => handleHeaderChange('headingHighlight', e.target.value)}
              />
              <p className="text-[11px] text-[var(--color-slate)] mt-1">
                Second part styled with luxury gold gradient (e.g. the Atelier)
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--color-ink)] block mb-1.5">
              CTA Button Link
            </label>
            <Input
              value={data.ctaLink}
              placeholder="/new-arrivals"
              onChange={(e) => handleHeaderChange('ctaLink', e.target.value)}
            />
            <div className="flex gap-2 mt-2">
              {['/new-arrivals', '/shop', '/shop/sarees', '/shop/lehengas'].map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => handleHeaderChange('ctaLink', link)}
                  className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-whisper)] text-[var(--color-slate)] hover:text-[var(--color-ink)] font-mono"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="p-4 bg-white rounded-xl border border-[var(--color-whisper)] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--color-ink)] block">
                  Product Display Source
                </span>
                <span className="text-[11px] text-[var(--color-slate)]">
                  Choose how products are populated in this section
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-gold-light)] text-[var(--color-gold)] font-semibold uppercase">
                {data.mode === 'custom' ? 'Curated Mode' : 'Catalog Dynamic'}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleHeaderChange('mode', 'custom')}
                className={cn(
                  'p-3.5 rounded-xl border text-left transition-all',
                  data.mode === 'custom'
                    ? 'border-[var(--color-gold)] bg-[var(--color-gold-light)]/20 shadow-xs ring-1 ring-[var(--color-gold)]'
                    : 'border-[var(--color-whisper)] hover:border-[var(--color-gold)]/40 bg-white'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">🎨</span>
                  <span className="text-xs font-bold text-[var(--color-ink)]">
                    Curated Cards (Recommended)
                  </span>
                </div>
                <p className="text-[11px] text-[var(--color-slate)] leading-snug">
                  Edit each card individually with custom titles, images from your device, prices, and Vidhya&apos;s Pick tags.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleHeaderChange('mode', 'auto')}
                className={cn(
                  'p-3.5 rounded-xl border text-left transition-all',
                  data.mode === 'auto'
                    ? 'border-[var(--color-gold)] bg-[var(--color-gold-light)]/20 shadow-xs ring-1 ring-[var(--color-gold)]'
                    : 'border-[var(--color-whisper)] hover:border-[var(--color-gold)]/40 bg-white'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">⚡</span>
                  <span className="text-xs font-bold text-[var(--color-ink)]">
                    Auto Catalog Latest
                  </span>
                </div>
                <p className="text-[11px] text-[var(--color-slate)] leading-snug">
                  Automatically pulls the newest active products from your Supabase store database table.
                </p>
              </button>
            </div>
          </div>

          {/* Mini Header Live Preview */}
          <div className="p-6 bg-white rounded-xl border border-[var(--color-whisper)] flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 shadow-2xs">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[var(--color-gold-light)] text-[var(--color-gold)] text-xs font-semibold uppercase tracking-wider mb-2">
                {data.badge || 'New Arrivals'}
              </span>
              <h2 className="font-display text-3xl font-medium text-[var(--color-ink)]">
                {data.heading || 'Fresh from'}{' '}
                <span className="text-gradient-gold">
                  {data.headingHighlight || 'the Atelier'}
                </span>
              </h2>
            </div>
            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--color-whisper)] text-xs font-semibold text-[var(--color-ink)] bg-white">
              <span>{data.ctaText || 'View All New'}</span>
              <span>→</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: INDIVIDUAL PRODUCT CARD EDITOR */}
      {typeof activeTab === 'number' && (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {(() => {
            const index = activeTab;
            const item = data.items[index] ?? DEFAULT_NEW_ARRIVALS.items[0]!;

            return (
              <div className="grid lg:grid-cols-12 gap-6 items-start">
                {/* Left Side: Card Fields (7 Cols) */}
                <div className="lg:col-span-7 space-y-5 bg-[var(--color-snow)]/50 p-5 rounded-2xl border border-[var(--color-whisper)]">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--color-whisper)]">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--color-gold-light)] text-[var(--color-gold)] border border-[var(--color-gold)]/40">
                        Card {index + 1} of {data.items.length} · {index < 4 ? 'Row 1 (Top Row)' : 'Row 2 (Bottom Row)'}
                      </span>
                      {item.isVidhyasPick && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[var(--color-ink)] text-[var(--color-gold)]">
                          ⭐ Vidhya&apos;s Pick
                        </span>
                      )}
                    </div>
                    {data.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-xs text-rose-500 hover:text-rose-700 underline"
                      >
                        Remove Card
                      </button>
                    )}
                  </div>

                  {/* Name & Category */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[var(--color-ink)] block mb-1.5">
                        Product Name
                      </label>
                      <Input
                        value={item.name}
                        placeholder="Heritage Temple Kanjivaram Silk Saree"
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[var(--color-ink)] block mb-1.5">
                        Category Tag
                      </label>
                      <Input
                        value={item.category}
                        placeholder="Sarees"
                        onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {['Kurtis', 'Salwars', 'Lehengas', 'Sarees', 'Dupattas'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleItemChange(index, 'category', cat)}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-whisper)] text-[var(--color-slate)] hover:text-[var(--color-ink)]"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Price & Original Price */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[var(--color-ink)] block mb-1.5">
                        Selling Price (₹)
                      </label>
                      <Input
                        type="number"
                        value={item.price}
                        placeholder="12999"
                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[var(--color-ink)] block mb-1.5">
                        Original Price / MRP (₹) (Optional)
                      </label>
                      <Input
                        type="number"
                        value={item.originalPrice || ''}
                        placeholder="15499"
                        onChange={(e) => handleItemChange(index, 'originalPrice', e.target.value ? Number(e.target.value) : undefined)}
                      />
                      {item.discount ? (
                        <p className="text-[10px] text-emerald-600 font-medium mt-1">
                          Discount: {item.discount}% OFF calculated automatically
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Vidhya's Pick Toggle & Product Link */}
                  <div className="grid sm:grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="text-xs font-semibold text-[var(--color-ink)] block mb-1.5">
                        Product Link / Slug
                      </label>
                      <Input
                        value={item.href}
                        placeholder="/product/heritage-temple-kanjivaram-silk-saree"
                        onChange={(e) => handleItemChange(index, 'href', e.target.value)}
                      />
                    </div>

                    <div className="pt-2 sm:pt-4">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!!item.isVidhyasPick}
                          onChange={(e) => handleItemChange(index, 'isVidhyasPick', e.target.checked)}
                          className="w-4 h-4 rounded border-[var(--color-whisper)] text-[var(--color-gold)] focus:ring-[var(--color-gold)]"
                        />
                        <div>
                          <span className="text-xs font-semibold text-[var(--color-ink)] block">
                            Badge: Vidhya&apos;s Pick
                          </span>
                          <span className="text-[10px] text-[var(--color-slate)]">
                            Shows gold on black badge on top of image
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Image & Device Upload */}
                  <div className="pt-3 border-t border-[var(--color-whisper)] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[var(--color-ink)] block">
                        Product Photo Image
                      </label>
                      <span className="text-[11px] text-[var(--color-slate)]">
                        Aspect 3:4 portrait
                      </span>
                    </div>

                    <Input
                      value={item.image}
                      placeholder="/images/collection-sarees.jpg or full https://..."
                      onChange={(e) => handleItemChange(index, 'image', e.target.value)}
                    />

                    {/* Local Device Upload Button */}
                    <div className="p-4 bg-white rounded-xl border-2 border-dashed border-[var(--color-whisper)] hover:border-[var(--color-gold)] transition-colors flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--color-snow)] flex items-center justify-center text-xl shrink-0">
                          📸
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-[var(--color-ink)]">
                            Upload product photo from local device
                          </div>
                          <div className="text-[11px] text-[var(--color-slate)]">
                            Choose JPG, PNG, WebP or AVIF image from your machine
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

                    {/* Quick Presets */}
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-slate)] block mb-1.5">
                        Or select from presets:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_PRODUCT_IMAGES.map((preset) => (
                          <button
                            key={preset.url}
                            type="button"
                            onClick={() => handleItemChange(index, 'image', preset.url)}
                            className={cn(
                              'text-[10px] px-2 py-1 rounded-md border transition-colors',
                              item.image === preset.url
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

                {/* Right Side: Exact Live Storefront Card Preview (5 Cols) */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--color-ink)]">
                      Storefront Product Card Preview
                    </span>
                    <span className="text-[11px] text-[var(--color-slate)] font-mono">
                      Card {index + 1}
                    </span>
                  </div>

                  <div className="bg-[var(--color-snow)] p-4 rounded-2xl border border-[var(--color-whisper)] shadow-xs flex justify-center">
                    <div className="w-full max-w-[280px] bg-white rounded-2xl overflow-hidden border border-[var(--color-whisper)] shadow-md flex flex-col">
                      {/* Image Container */}
                      <div className="relative aspect-[3/4] w-full bg-[var(--color-whisper)] overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-[var(--color-slate)]">
                            No Photo
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start z-10">
                          {item.isVidhyasPick && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[var(--color-ink)] text-[var(--color-gold)] rounded-sm shadow-xs">
                              Vidhya&apos;s Pick
                            </span>
                          )}
                          <span className="ml-auto w-7 h-7 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-xs shadow-xs">
                            🤍
                          </span>
                        </div>

                        {/* Quick View Bar */}
                        <div className="absolute inset-x-2 bottom-2 py-2 bg-[var(--color-gold)] text-[var(--color-ink)] text-[11px] font-bold uppercase tracking-wider text-center rounded-lg shadow-sm">
                          Quick View
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold)] block mb-1">
                            {item.category || 'CATEGORY'}
                          </span>
                          <h4 className="font-display text-sm font-medium text-[var(--color-ink)] line-clamp-2 leading-snug">
                            {item.name || 'Product Title'}
                          </h4>
                        </div>

                        <div>
                          <div className="flex items-baseline gap-2 mb-2.5">
                            <span className="font-semibold text-sm text-[var(--color-ink)]">
                              ₹{Number(item.price || 0).toLocaleString('en-IN')}
                            </span>
                            {item.originalPrice ? (
                              <span className="text-xs text-[var(--color-slate)] line-through">
                                ₹{Number(item.originalPrice).toLocaleString('en-IN')}
                              </span>
                            ) : null}
                          </div>

                          <div className="w-full py-2 bg-[var(--color-ink)] text-white text-[11px] font-semibold uppercase tracking-wider text-center rounded-xl">
                            Add to Bag
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Navigation */}
                  <div className="flex items-center justify-between pt-1">
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
                      disabled={index === data.items.length - 1}
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

      {/* TAB 3: FULL GRID PREVIEW */}
      {activeTab === 'preview' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 bg-[var(--color-snow)] p-6 rounded-2xl border border-[var(--color-whisper)]"
        >
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[var(--color-gold-light)] text-[var(--color-gold)] text-xs font-semibold uppercase tracking-wider mb-2">
                {data.badge || 'New Arrivals'}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-medium text-[var(--color-ink)]">
                {data.heading || 'Fresh from'}{' '}
                <span className="text-gradient-gold">
                  {data.headingHighlight || 'the Atelier'}
                </span>
              </h2>
            </div>
            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--color-whisper)] text-xs font-semibold text-[var(--color-ink)] bg-white self-start sm:self-auto shadow-2xs">
              <span>{data.ctaText || 'View All New'}</span>
              <span>→</span>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.items.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setActiveTab(idx)}
                className="bg-white rounded-2xl overflow-hidden border border-[var(--color-whisper)] shadow-sm hover:ring-2 hover:ring-[var(--color-gold)] transition-all cursor-pointer flex flex-col group"
                title={`Click to edit Card ${idx + 1}: ${item.name}`}
              >
                {/* Image */}
                <div className="relative aspect-[3/4] w-full bg-[var(--color-whisper)] overflow-hidden">
                  <Image
                    src={item.image || '/images/collection-sarees.jpg'}
                    alt={item.name}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {item.isVidhyasPick && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-[var(--color-ink)] text-[var(--color-gold)] rounded-sm z-10 shadow-xs">
                      Vidhya&apos;s Pick
                    </span>
                  )}
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] bg-black/60 text-white font-mono z-10">
                    #{idx + 1} ({idx < 4 ? 'Row 1' : 'Row 2'})
                  </span>
                  <div className="absolute inset-x-2 bottom-2 py-1.5 bg-[var(--color-gold)] text-[var(--color-ink)] text-[10px] font-bold uppercase tracking-wider text-center rounded-lg shadow-sm">
                    Quick View
                  </div>
                </div>

                {/* Details */}
                <div className="p-3 flex flex-col flex-1 justify-between gap-2.5">
                  <div>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--color-gold)] block">
                      {item.category}
                    </span>
                    <h4 className="font-display text-xs font-medium text-[var(--color-ink)] line-clamp-2 mt-0.5">
                      {item.name}
                    </h4>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="font-semibold text-xs text-[var(--color-ink)]">
                        ₹{Number(item.price || 0).toLocaleString('en-IN')}
                      </span>
                      {item.originalPrice ? (
                        <span className="text-[10px] text-[var(--color-slate)] line-through">
                          ₹{Number(item.originalPrice).toLocaleString('en-IN')}
                        </span>
                      ) : null}
                    </div>
                    <div className="w-full py-1.5 bg-[var(--color-ink)] text-white text-[10px] font-semibold uppercase text-center rounded-lg">
                      Add to Bag
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-[var(--color-slate)] italic pt-2">
            Tip: Click any card in this layout preview to jump straight to its editor
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

