'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type { CategoriesContent, CategoryCollectionItem } from '@/lib/actions/site-content-types';

interface CategoryShowcaseEditorProps {
  onCancel?: () => void;
  onSaved?: (data: CategoriesContent) => void;
}

export const DEFAULT_CATEGORIES: CategoriesContent = {
  badge: 'Curated Collections',
  title: 'Shop by Category',
  subtitle: 'Discover our complete range of premium ethnic wear, each category handcrafted with timeless artisanal detail.',
  items: [
    {
      id: 'party-wear-dresses',
      title: 'Party Wear Dresses',
      image: '/images/category-showcase/showcase-party-wear-dresses.jpg',
      href: '/shop?occasion=party',
      row: 1,
    },
    {
      id: 'office-wear-3piece',
      title: 'Office Wear 3-Piece',
      image: '/images/category-showcase/showcase-office-wear-3piece.jpg',
      href: '/shop/salwars?occasion=office',
      row: 1,
    },
    {
      id: 'coord-sets',
      title: 'Co-ord Sets',
      image: '/images/category-showcase/showcase-coord-sets.jpg',
      href: '/shop/kurtis?type=coord-sets',
      row: 1,
    },
    {
      id: 'lehengas',
      title: 'Lehengas',
      image: '/images/category-showcase/showcase-lehengas.jpg',
      href: '/shop/lehengas',
      row: 2,
    },
    {
      id: 'daily-wear-sarees',
      title: 'Daily Wear Sarees',
      image: '/images/category-showcase/showcase-daily-wear-sarees.jpg',
      href: '/shop/sarees?occasion=casual',
      row: 3,
    },
    {
      id: 'office-wear-sarees',
      title: 'Office Wear Sarees',
      image: '/images/category-showcase/showcase-office-wear-sarees.jpg',
      href: '/shop/sarees?occasion=office',
      row: 3,
    },
    {
      id: 'party-wear-sarees',
      title: 'Party Wear Sarees',
      image: '/images/category-showcase/showcase-party-wear-sarees.jpg',
      href: '/shop/sarees?occasion=party',
      row: 4,
    },
    {
      id: 'womens-frocks',
      title: "Women's Frocks",
      image: '/images/category-showcase/showcase-womens-frocks.jpg',
      href: '/shop/salwars?type=anarkali',
      row: 5,
    },
  ],
};

const ROWS_CONFIG = [
  {
    row: 1,
    title: 'Row 1 — 3 Column Grid',
    indices: [0, 1, 2],
    aspect: 'aspect-[507/658]',
  },
  {
    row: 2,
    title: 'Row 2 — Full-Width Banner',
    indices: [3],
    aspect: 'aspect-[1521/658]',
  },
  {
    row: 3,
    title: 'Row 3 — 2 Column Grid',
    indices: [4, 5],
    aspect: 'aspect-[760/658]',
  },
  {
    row: 4,
    title: 'Row 4 — Full-Width Banner',
    indices: [6],
    aspect: 'aspect-[1521/658]',
  },
  {
    row: 5,
    title: 'Row 5 — Full-Width Banner',
    indices: [7],
    aspect: 'aspect-[1521/658]',
  },
];

function CategoryImagePicker({
  imageUrl,
  onChange,
  aspectRatio = 'aspect-[4/3]',
  cardTitle,
  index,
}: {
  imageUrl: string;
  onChange: (url: string) => void;
  aspectRatio?: string;
  cardTitle: string;
  index: number;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMsg('Uploading...');

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('target', `showcase-${index + 1}-${cardTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`);

      const res = await fetch('/api/admin/content/upload', {
        method: 'POST',
        body: fd,
      });

      const json = await res.json();
      if (json.success && json.url) {
        onChange(json.url);
        setMsg('✓ Image uploaded');
        setTimeout(() => setMsg(null), 3000);
      } else {
        // Fallback to data URL
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            onChange(reader.result);
            setMsg('✓ Image loaded');
            setTimeout(() => setMsg(null), 3000);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
          setMsg('✓ Image loaded');
          setTimeout(() => setMsg(null), 3000);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-[var(--color-ink)] block">
        Category Image
      </label>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Image Preview Thumbnail */}
        <div className={cn('relative w-32 shrink-0 rounded-lg overflow-hidden border border-[var(--color-whisper)] bg-black/10', aspectRatio)}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={cardTitle || 'Category'}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--color-slate)]">
              No Image
            </div>
          )}
        </div>

        {/* Upload Action & URL Input */}
        <div className="flex-1 w-full space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-ink)] hover:bg-[var(--color-gold)] text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : '📁 Upload New Image'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
            {msg && <span className="text-xs text-emerald-600 font-medium">{msg}</span>}
          </div>

          <Input
            value={imageUrl}
            placeholder="Image URL or uploaded path (/images/...)"
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export function CategoryShowcaseEditor({ onCancel, onSaved }: CategoryShowcaseEditorProps) {
  const [data, setData] = useState<CategoriesContent>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
            const items = Array.from({ length: 8 }, (_, idx) => {
              const defaultItem = DEFAULT_CATEGORIES.items[idx]!;
              const existingItem = Array.isArray(raw.items) && raw.items[idx] ? raw.items[idx] : null;
              const isOldLegacy = idx === 0 && existingItem?.title === 'Kurtis';
              if (isOldLegacy || !existingItem) {
                return defaultItem;
              }
              return {
                ...defaultItem,
                ...existingItem,
              };
            });

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

  const handleCardFieldChange = (index: number, key: keyof CategoryCollectionItem, value: any) => {
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
          message: 'Categories saved successfully! Your changes are live on the homepage.',
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
        <p className="text-xs text-[var(--color-slate)] font-medium">Loading Categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header bar with Save Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[var(--color-whisper)]">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">
            Category Showcase (8 Categories)
          </h2>
          <p className="text-xs text-[var(--color-slate)]">
            Edit the Category Name and Image for each banner. Changes appear immediately on the storefront.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Save Status Notification */}
      <AnimatePresence>
        {saveStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'p-3.5 rounded-xl text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border shadow-xs',
              saveStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            )}
          >
            <div className="flex items-center gap-2">
              <span>{saveStatus.type === 'success' ? '✓' : '⚠️'}</span>
              <span className="font-medium">{saveStatus.message}</span>
            </div>
            {saveStatus.type === 'success' && (
              <Link
                href="/"
                target="_blank"
                className="font-semibold text-emerald-800 underline hover:text-emerald-950 inline-flex items-center gap-1 shrink-0"
              >
                <span>View Storefront ↗</span>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5 Rows of Categories */}
      <div className="space-y-6">
        {ROWS_CONFIG.map((rowCfg) => (
          <div
            key={rowCfg.row}
            className="p-4 sm:p-5 rounded-2xl border border-[var(--color-whisper)] bg-[var(--color-snow)]/40 space-y-4"
          >
            {/* Row Title */}
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-whisper)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
                {rowCfg.title}
              </span>
              <span className="text-[11px] text-[var(--color-slate)] font-mono">
                {rowCfg.indices.length} {rowCfg.indices.length === 1 ? 'Banner' : 'Cards'}
              </span>
            </div>

            {/* Cards in this Row */}
            <div
              className={cn(
                'grid gap-4',
                rowCfg.indices.length === 3
                  ? 'grid-cols-1 md:grid-cols-3'
                  : rowCfg.indices.length === 2
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1'
              )}
            >
              {rowCfg.indices.map((idx) => {
                const item = data.items[idx] || DEFAULT_CATEGORIES.items[idx]!;
                return (
                  <div
                    key={idx}
                    className="p-4 bg-white rounded-xl border border-[var(--color-whisper)] shadow-2xs space-y-3.5"
                  >
                    <div className="flex items-center justify-between border-b border-[var(--color-whisper)]/60 pb-2">
                      <span className="text-xs font-semibold text-[var(--color-ink)]">
                        #{idx + 1}. {item.title || 'Category'}
                      </span>
                      <span className="text-[10px] text-[var(--color-slate)] font-mono">
                        {item.href}
                      </span>
                    </div>

                    {/* LABEL 1: Category Name */}
                    <div>
                      <label className="text-xs font-semibold text-[var(--color-ink)] block mb-1">
                        Category Name
                      </label>
                      <Input
                        value={item.title || ''}
                        placeholder="e.g. Party Wear Dresses"
                        onChange={(e) => handleCardFieldChange(idx, 'title', e.target.value)}
                      />
                    </div>

                    {/* LABEL 2: Category Image */}
                    <CategoryImagePicker
                      imageUrl={item.image || ''}
                      onChange={(url) => handleCardFieldChange(idx, 'image', url)}
                      cardTitle={item.title}
                      index={idx}
                      aspectRatio={rowCfg.aspect}
                    />

                    {/* Link / URL (Compact) */}
                    <div>
                      <label className="text-xs font-medium text-[var(--color-slate)] block mb-1">
                        Link URL (Page path)
                      </label>
                      <Input
                        value={item.href || ''}
                        placeholder="/shop/salwars"
                        onChange={(e) => handleCardFieldChange(idx, 'href', e.target.value)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Save Button */}
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
            className="text-xs text-[var(--color-slate)] hover:text-[var(--color-ink)] underline"
          >
            View Live Storefront ↗
          </Link>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className="min-w-[130px]"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
