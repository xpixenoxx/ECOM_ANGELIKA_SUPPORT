'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type { KurtisPageContent, KurtisProductItem } from '@/lib/actions/site-content';

interface KurtisPageEditorProps {
  onCancel?: () => void;
  onSaved?: (data: KurtisPageContent) => void;
}

const DEFAULT_KURTIS_CONTENT: KurtisPageContent = {
  badge: 'HANDCRAFTED LUXURY EDIT',
  title: 'Kurtis',
  description: 'Discover our complete range of handcrafted Indian ethnic kurtis, tunics, and anarkalis, thoughtfully made with artisanal perfection and breathable natural textiles.',
  heroImage: '/images/hero-new-couture.jpg',
  cardImage: '/images/collection-kurtis.jpg',
  cardBadge: 'CURATED BY VIDHYA',
  cardSubtitle: '48 Handcrafted Pieces',
  showPromoBanner: true,
  promoBadge: 'FESTIVE OFFER',
  promoText: 'Enjoy 15% off on all handcrafted Chanderi and Silk Kurtis. Use code: KURTI15',
  promoCtaText: 'SHOP KURTIS',
  promoCtaLink: '/shop/kurtis',
  showCategoryStrip: true,
  showSidebar: true,
  productsMode: 'custom',
  products: [
    {
      id: 'kp-1',
      name: 'Kutch Ajrakh Modal Silk Kurti',
      category: 'KURTIS',
      price: 4999,
      originalPrice: 5999,
      discount: 17,
      image: '/images/collection-kurtis.jpg',
      href: '/product/kutch-ajrakh-modal-silk-kurti',
      isNew: true,
      isVidhyasPick: true,
      fabric: 'Silk',
      rating: 4.8,
      reviewCount: 12,
      inStock: true,
    },
    {
      id: 'kp-2',
      name: 'Pristine White Shadow Work Lucknowi Kurti',
      category: 'KURTIS',
      price: 3999,
      originalPrice: 4799,
      discount: 17,
      image: '/images/collection-lehengas.jpg',
      href: '/product/pristine-white-shadow-work-lucknowi-kurti',
      isNew: true,
      isVidhyasPick: false,
      fabric: 'Cotton',
      rating: 4.8,
      reviewCount: 12,
      inStock: true,
    },
    {
      id: 'kp-3',
      name: 'Hand Block Printed Kurti',
      category: 'KURTIS',
      price: 2499,
      originalPrice: 3299,
      discount: 24,
      image: '/images/collection-kurtis.jpg',
      href: '/product/hand-block-printed-kurti',
      isNew: true,
      isVidhyasPick: false,
      fabric: 'Cotton',
      rating: 4.8,
      reviewCount: 12,
      inStock: true,
    },
    {
      id: 'kp-4',
      name: 'Velvet Kurti Set',
      category: 'KURTIS',
      price: 6999,
      originalPrice: 8499,
      discount: 18,
      image: '/images/cat-sarees.jpg',
      href: '/product/velvet-kurti-set',
      isNew: true,
      isVidhyasPick: true,
      fabric: 'Velvet',
      rating: 4.8,
      reviewCount: 12,
      inStock: true,
    },
    {
      id: 'kp-5',
      name: 'Chanderi Cotton Kurti',
      category: 'KURTIS',
      price: 3199,
      originalPrice: 3999,
      discount: 20,
      image: '/images/cat-kurtis.jpg',
      href: '/product/chanderi-cotton-kurti',
      isNew: true,
      isVidhyasPick: false,
      fabric: 'Chanderi',
      rating: 4.8,
      reviewCount: 12,
      inStock: true,
    },
    {
      id: 'kp-6',
      name: 'Gota Patti Kurta',
      category: 'KURTIS',
      price: 4299,
      originalPrice: 5299,
      discount: 19,
      image: '/images/cat-lehengas.jpg',
      href: '/product/gota-patti-kurta',
      isNew: true,
      isVidhyasPick: false,
      fabric: 'Cotton',
      rating: 4.8,
      reviewCount: 12,
      inStock: true,
    },
  ],
  showStylingGuide: true,
  stylingBadge: 'ATELIER NOTES & STYLING',
  stylingTitle: "Vidhya's Styling Guide for Kurtis",
  stylingNote: 'Our kurtis are cut from pure breathable Chanderi, Mulmul and Tussar silk. For a contemporary festive look, pair straight-cut kurtis with cigarette pants, or flared anarkalis with statement jhumkas.',
  stylingImage: '/images/vidhya-story.jpg',
  highlights: [
    {
      title: 'Handloom Textiles',
      description: 'Woven on authentic wooden looms using pure Chanderi silk and combed mulmul cotton.',
    },
    {
      title: 'Artisanal Block Prints',
      description: 'Hand-block printed by master artisans using organic azo-free earthen dyes.',
    },
    {
      title: 'Tailored Silhouettes',
      description: 'Comfortable relaxed drapes with thoughtful internal seam allowances for a bespoke fit.',
    },
  ],
  metaTitle: 'Designer Kurtis and Tunics Online | Angelika Fashions',
  metaDescription: 'Shop handcrafted Indian ethnic kurtis, anarkalis and tunics by Vidhya at Angelika Fashions. Pure Chanderi silk and mulmul cotton with express delivery.',
};

const PRESET_HERO_IMAGES = [
  { label: 'Hero Couture Drape', url: '/images/hero-new-couture.jpg' },
  { label: 'Kurtis Collection', url: '/images/collection-kurtis.jpg' },
  { label: 'Atelier Workshop', url: '/images/artisan-workshop.jpg' },
  { label: 'Cat Kurtis Portrait', url: '/images/cat-kurtis.jpg' },
  { label: 'Cat Lehengas', url: '/images/cat-lehengas.jpg' },
  { label: 'Vidhya Atelier', url: '/images/vidhya-story.jpg' },
];

const PRESET_CARD_IMAGES = [
  { label: 'Kurtis Featured Card', url: '/images/collection-kurtis.jpg' },
  { label: 'Cat Kurtis Atelier', url: '/images/cat-kurtis.jpg' },
  { label: 'Hero Couture Drape', url: '/images/hero-new-couture.jpg' },
  { label: 'Salwars Ensemble', url: '/images/collection-salwars.jpg' },
  { label: 'Artisan Workshop', url: '/images/artisan-workshop.jpg' },
];

export function KurtisPageEditor({ onCancel, onSaved }: KurtisPageEditorProps) {
  const [data, setData] = useState<KurtisPageContent>(DEFAULT_KURTIS_CONTENT);
  const [activeTab, setActiveTab] = useState<'hero' | 'promo' | 'products' | 'styling' | 'nav' | 'preview'>('hero');
  const [selectedProductIndex, setSelectedProductIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const heroInputRef = useRef<HTMLInputElement | null>(null);
  const cardInputRef = useRef<HTMLInputElement | null>(null);
  const stylingInputRef = useRef<HTMLInputElement | null>(null);
  const productInputRef = useRef<HTMLInputElement | null>(null);

  // Load existing content on mount
  useEffect(() => {
    let isMounted = true;
    async function loadContent() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.content?.['kurtis-page']) {
            const raw = json.content['kurtis-page'];
            if (isMounted) {
              setData({
                badge: raw.badge || DEFAULT_KURTIS_CONTENT.badge,
                title: raw.title || DEFAULT_KURTIS_CONTENT.title,
                description: raw.description || DEFAULT_KURTIS_CONTENT.description,
                heroImage: raw.heroImage || DEFAULT_KURTIS_CONTENT.heroImage,
                cardImage: raw.cardImage || DEFAULT_KURTIS_CONTENT.cardImage,
                cardBadge: raw.cardBadge || DEFAULT_KURTIS_CONTENT.cardBadge,
                cardSubtitle: raw.cardSubtitle || DEFAULT_KURTIS_CONTENT.cardSubtitle,
                showPromoBanner: raw.showPromoBanner !== undefined ? Boolean(raw.showPromoBanner) : true,
                promoBadge: raw.promoBadge || DEFAULT_KURTIS_CONTENT.promoBadge,
                promoText: raw.promoText || DEFAULT_KURTIS_CONTENT.promoText,
                promoCtaText: raw.promoCtaText || DEFAULT_KURTIS_CONTENT.promoCtaText,
                promoCtaLink: raw.promoCtaLink || DEFAULT_KURTIS_CONTENT.promoCtaLink,
                showCategoryStrip: raw.showCategoryStrip !== undefined ? Boolean(raw.showCategoryStrip) : true,
                showSidebar: raw.showSidebar !== undefined ? Boolean(raw.showSidebar) : true,
                productsMode: raw.productsMode || 'custom',
                products: Array.isArray(raw.products) && raw.products.length > 0
                  ? raw.products
                  : DEFAULT_KURTIS_CONTENT.products,
                showStylingGuide: raw.showStylingGuide !== undefined ? Boolean(raw.showStylingGuide) : true,
                stylingBadge: raw.stylingBadge || DEFAULT_KURTIS_CONTENT.stylingBadge,
                stylingTitle: raw.stylingTitle || DEFAULT_KURTIS_CONTENT.stylingTitle,
                stylingNote: raw.stylingNote || DEFAULT_KURTIS_CONTENT.stylingNote,
                stylingImage: raw.stylingImage || DEFAULT_KURTIS_CONTENT.stylingImage,
                highlights: Array.isArray(raw.highlights) && raw.highlights.length > 0
                  ? raw.highlights
                  : DEFAULT_KURTIS_CONTENT.highlights,
                metaTitle: raw.metaTitle || DEFAULT_KURTIS_CONTENT.metaTitle,
                metaDescription: raw.metaDescription || DEFAULT_KURTIS_CONTENT.metaDescription,
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to load kurtis-page data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadContent();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (key: keyof KurtisPageContent, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleProductChange = (index: number, field: keyof KurtisProductItem, value: any) => {
    setData((prev) => {
      const updated = [...prev.products];
      const cur = updated[index] || {
        id: `kp-${Date.now()}`,
        name: 'New Kurti',
        category: 'KURTIS',
        price: 3999,
        image: '/images/collection-kurtis.jpg',
      };

      let finalDiscount = cur.discount;
      if (field === 'price' || field === 'originalPrice') {
        const p = field === 'price' ? Number(value) : cur.price;
        const op = field === 'originalPrice' ? Number(value) : cur.originalPrice;
        if (op && op > p) {
          finalDiscount = Math.round(((op - p) / op) * 100);
        } else {
          finalDiscount = 0;
        }
      }

      updated[index] = {
        ...cur,
        [field]: value,
        discount: finalDiscount,
      };
      return { ...prev, products: updated };
    });
  };

  const handleAddProduct = () => {
    const newId = `kp-${Date.now()}`;
    const newProd: KurtisProductItem = {
      id: newId,
      name: 'New Handcrafted Kurti',
      category: 'KURTIS',
      price: 3499,
      originalPrice: 4299,
      discount: 19,
      image: '/images/collection-kurtis.jpg',
      href: `/product/${newId}`,
      isNew: true,
      isVidhyasPick: false,
      fabric: 'Cotton',
      rating: 4.8,
      reviewCount: 10,
      inStock: true,
    };
    setData((prev) => ({
      ...prev,
      products: [...prev.products, newProd],
    }));
    setSelectedProductIndex(data.products.length);
  };

  const handleRemoveProduct = (index: number) => {
    if (data.products.length <= 1) return;
    setData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
    if (selectedProductIndex >= index && selectedProductIndex > 0) {
      setSelectedProductIndex((prev) => prev - 1);
    }
  };

  const handleHighlightChange = (index: number, field: 'title' | 'description', text: string) => {
    setData((prev) => {
      const updated = [...prev.highlights];
      const current = updated[index] || { title: '', description: '' };
      updated[index] = { ...current, [field]: text };
      return { ...prev, highlights: updated };
    });
  };

  // Upload local device image
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: 'heroImage' | 'cardImage' | 'stylingImage' | 'productImage',
    targetName: string,
    prodIndex?: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTarget(fieldKey);
    setUploadMessage({ text: 'Uploading from local device...' });

    try {
      const body = new FormData();
      body.append('file', file);
      body.append('target', targetName);

      const res = await fetch('/api/admin/content/upload', {
        method: 'POST',
        body,
      });

      const resJson = await res.json();
      if (resJson.success && resJson.url) {
        if (fieldKey === 'productImage' && typeof prodIndex === 'number') {
          handleProductChange(prodIndex, 'image', resJson.url);
        } else if (fieldKey !== 'productImage') {
          handleChange(fieldKey, resJson.url);
        }
        setUploadMessage({ text: '✓ Photo uploaded and applied successfully!' });
        setTimeout(() => setUploadMessage(null), 3500);
      } else {
        // Fallback: FileReader
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            if (fieldKey === 'productImage' && typeof prodIndex === 'number') {
              handleProductChange(prodIndex, 'image', reader.result);
            } else if (fieldKey !== 'productImage') {
              handleChange(fieldKey, reader.result);
            }
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
          if (fieldKey === 'productImage' && typeof prodIndex === 'number') {
            handleProductChange(prodIndex, 'image', reader.result);
          } else if (fieldKey !== 'productImage') {
            handleChange(fieldKey, reader.result);
          }
          setUploadMessage({ text: '✓ Photo loaded from device!' });
          setTimeout(() => setUploadMessage(null), 3500);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingTarget(null);
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
          sectionId: 'kurtis-page',
          content: data,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaveStatus({ type: 'success', message: 'Kurtis page content and products saved and live on storefront!' });
        if (onSaved) onSaved(data);
        setTimeout(() => setSaveStatus(null), 4000);
      } else {
        setSaveStatus({ type: 'error', message: json.error || 'Failed to save changes.' });
      }
    } catch (err: any) {
      setSaveStatus({ type: 'error', message: err.message || 'Error communicating with server.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-[var(--color-slate)] space-y-3">
        <div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Loading Kurtis page content...</p>
      </div>
    );
  }

  const selectedProduct = data.products[selectedProductIndex] || data.products[0];

  return (
    <div className="space-y-6">
      {/* Top Header & Save Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-whisper)]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[var(--font-display)] text-lg font-medium text-[var(--color-ink)]">
              Kurtis Page Editor
            </h3>
            <Badge variant="outline" className="text-xs text-[var(--color-gold)] border-[var(--color-gold)]/40">
              /shop/kurtis
            </Badge>
            <Badge variant="outline" className="text-xs text-emerald-700 bg-emerald-50 border-emerald-200">
              {data.products.length} Products
            </Badge>
          </div>
          <p className="text-xs text-[var(--color-slate)] mt-0.5">
            Full control: Edit hero header, promo bar, all 6 product cards, filters, and Vidhya&apos;s styling guide
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/shop/kurtis"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--color-slate)] hover:text-[var(--color-ink)] border border-[var(--color-whisper)] rounded-lg hover:bg-[var(--color-snow)] transition-colors"
          >
            <span>View Live Page</span>
            <span>↗</span>
          </Link>
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="min-w-[130px] bg-[var(--color-gold)] hover:bg-[var(--color-gold-hover)] text-white font-medium"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {saveStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'p-3.5 rounded-xl text-xs font-medium flex items-center justify-between',
              saveStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            )}
          >
            <div className="flex items-center gap-2">
              <span>{saveStatus.type === 'success' ? '✓' : '⚠️'}</span>
              <span>{saveStatus.message}</span>
            </div>
            <button
              onClick={() => setSaveStatus(null)}
              className="text-xs opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </motion.div>
        )}

        {uploadMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>{uploadMessage.text}</span>
            </div>
            <button
              onClick={() => setUploadMessage(null)}
              className="text-xs opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--color-whisper)] pb-3">
        {[
          { id: 'hero', label: '1. Hero & Header', icon: '✨' },
          { id: 'promo', label: '2. Promo Banner', icon: '🏷️' },
          { id: 'products', label: `3. Kurtis Products (${data.products.length})`, icon: '👗' },
          { id: 'styling', label: '4. Atelier Notes & Styling', icon: '🧵' },
          { id: 'nav', label: '5. Nav & Sidebar', icon: '🧭' },
          { id: 'preview', label: '6. Live Storefront Preview', icon: '👁️' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
              activeTab === tab.id
                ? 'bg-[var(--color-ink)] text-white shadow-sm'
                : 'bg-[var(--color-snow)] text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)]'
            )}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: Hero & Header */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <div className="bg-[var(--color-snow)]/60 p-4 rounded-xl border border-[var(--color-whisper)] space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[var(--color-gold)] rounded-full" />
              Headings & Category Description
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                  Eyebrow Badge
                </label>
                <Input
                  value={data.badge}
                  onChange={(e) => handleChange('badge', e.target.value)}
                  placeholder="e.g. HANDCRAFTED LUXURY EDIT"
                  className="bg-white font-mono uppercase text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                  Page Title
                </label>
                <Input
                  value={data.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g. Kurtis"
                  className="bg-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                Category Description / Subtitle
              </label>
              <Textarea
                rows={3}
                value={data.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Write a descriptive introduction to the Kurtis collection..."
                className="bg-white text-sm"
              />
            </div>
          </div>

          {/* Hero Ambient Background Image */}
          <div className="bg-[var(--color-snow)]/60 p-4 rounded-xl border border-[var(--color-whisper)] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[var(--color-gold)] rounded-full" />
                Hero Ambient Background Image
              </h4>
              <Badge variant="outline" className="text-[10px]">
                Soft overlay behind hero banner
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-1">
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-[var(--color-whisper)] shadow-sm bg-black">
                  <Image
                    src={data.heroImage || '/images/hero-new-couture.jpg'}
                    alt="Hero background"
                    fill
                    unoptimized
                    className="object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                    <span className="text-[11px] text-white/90 font-medium">Hero Background</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                    Upload from Local Device
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => heroInputRef.current?.click()}
                      disabled={uploadingTarget === 'heroImage'}
                      className="border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10"
                    >
                      {uploadingTarget === 'heroImage' ? 'Uploading...' : '📁 Choose Local File...'}
                    </Button>
                    <input
                      ref={heroInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'heroImage', 'kurtis-hero')}
                    />
                    <span className="text-xs text-[var(--color-slate)]">JPG, PNG, WebP</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                    Or Enter Image URL / Path
                  </label>
                  <Input
                    value={data.heroImage}
                    onChange={(e) => handleChange('heroImage', e.target.value)}
                    placeholder="/images/hero-new-couture.jpg"
                    className="bg-white text-xs"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-[var(--color-slate)] block mb-1.5 font-medium">
                    Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_HERO_IMAGES.map((p) => (
                      <button
                        key={p.url}
                        type="button"
                        onClick={() => handleChange('heroImage', p.url)}
                        className={cn(
                          'px-2.5 py-1 text-[11px] rounded-md border transition-all',
                          data.heroImage === p.url
                            ? 'bg-[var(--color-gold)] text-white border-[var(--color-gold)] font-medium shadow-sm'
                            : 'bg-white text-[var(--color-slate)] border-[var(--color-whisper)] hover:border-[var(--color-gold)]'
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Category Card (Right side of banner) */}
          <div className="bg-[var(--color-snow)]/60 p-4 rounded-xl border border-[var(--color-whisper)] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[var(--color-gold)] rounded-full" />
                Featured Category Card (Header Right)
              </h4>
              <Badge variant="outline" className="text-[10px]">
                Editorial Showcase Card
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-1">
                <div className="relative rounded-xl overflow-hidden border border-[var(--color-gold)]/50 shadow-xl bg-black/60">
                  <div className="aspect-[4/3] relative">
                    <Image
                      src={data.cardImage || '/images/collection-kurtis.jpg'}
                      alt="Category Card"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="p-2.5 bg-black/85 backdrop-blur-sm flex items-center justify-between text-xs">
                    <span className="text-[var(--color-gold)] font-medium text-[11px] uppercase tracking-wider">
                      {data.cardBadge || 'CURATED BY VIDHYA'}
                    </span>
                    <span className="text-white/80 text-[11px]">
                      {data.cardSubtitle || '48 Handcrafted Pieces'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                      Card Badge
                    </label>
                    <Input
                      value={data.cardBadge}
                      onChange={(e) => handleChange('cardBadge', e.target.value)}
                      placeholder="e.g. CURATED BY VIDHYA"
                      className="bg-white text-xs font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                      Card Subtitle / Piece Label
                    </label>
                    <Input
                      value={data.cardSubtitle}
                      onChange={(e) => handleChange('cardSubtitle', e.target.value)}
                      placeholder="e.g. 48 Handcrafted Pieces"
                      className="bg-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                    Upload Card Photo from Local Device
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => cardInputRef.current?.click()}
                      disabled={uploadingTarget === 'cardImage'}
                      className="border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10"
                    >
                      {uploadingTarget === 'cardImage' ? 'Uploading...' : '📁 Choose Local File...'}
                    </Button>
                    <input
                      ref={cardInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'cardImage', 'kurtis-card')}
                    />
                    <span className="text-xs text-[var(--color-slate)]">Aspect: 4:3</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                    Card Image URL
                  </label>
                  <Input
                    value={data.cardImage}
                    onChange={(e) => handleChange('cardImage', e.target.value)}
                    placeholder="/images/collection-kurtis.jpg"
                    className="bg-white text-xs"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-[var(--color-slate)] block mb-1.5 font-medium">
                    Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_CARD_IMAGES.map((p) => (
                      <button
                        key={p.url}
                        type="button"
                        onClick={() => handleChange('cardImage', p.url)}
                        className={cn(
                          'px-2.5 py-1 text-[11px] rounded-md border transition-all',
                          data.cardImage === p.url
                            ? 'bg-[var(--color-gold)] text-white border-[var(--color-gold)] font-medium shadow-sm'
                            : 'bg-white text-[var(--color-slate)] border-[var(--color-whisper)] hover:border-[var(--color-gold)]'
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Promotional Banner */}
      {activeTab === 'promo' && (
        <div className="space-y-6">
          <div className="bg-[var(--color-snow)]/60 p-4 rounded-xl border border-[var(--color-whisper)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-[var(--color-gold)] rounded-full" />
                  Promotional Announcement Banner
                </h4>
                <p className="text-xs text-[var(--color-slate)] mt-0.5">
                  Display an announcement bar directly between hero header and products
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.showPromoBanner}
                  onChange={(e) => handleChange('showPromoBanner', e.target.checked)}
                  className="w-4 h-4 text-[var(--color-gold)] rounded focus:ring-[var(--color-gold)] border-[var(--color-whisper)]"
                />
                <span className="text-xs font-semibold text-[var(--color-ink)]">
                  {data.showPromoBanner ? 'Banner Active' : 'Banner Disabled'}
                </span>
              </label>
            </div>

            {data.showPromoBanner && (
              <div className="space-y-4 pt-3 border-t border-[var(--color-whisper)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                      Promo Badge Text
                    </label>
                    <Input
                      value={data.promoBadge}
                      onChange={(e) => handleChange('promoBadge', e.target.value)}
                      placeholder="e.g. FESTIVE OFFER"
                      className="bg-white font-mono uppercase text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                      CTA Button Text
                    </label>
                    <Input
                      value={data.promoCtaText}
                      onChange={(e) => handleChange('promoCtaText', e.target.value)}
                      placeholder="e.g. SHOP KURTIS"
                      className="bg-white font-mono uppercase text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                    Announcement Message
                  </label>
                  <Textarea
                    rows={2}
                    value={data.promoText}
                    onChange={(e) => handleChange('promoText', e.target.value)}
                    placeholder="e.g. Enjoy 15% off on all handcrafted Chanderi and Silk Kurtis. Use code: KURTI15"
                    className="bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                    CTA Button Link
                  </label>
                  <Input
                    value={data.promoCtaLink}
                    onChange={(e) => handleChange('promoCtaLink', e.target.value)}
                    placeholder="/shop/kurtis"
                    className="bg-white text-xs"
                  />
                </div>

                {/* Banner Preview */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-[var(--color-slate)] block mb-1.5 uppercase tracking-wider">
                    Banner Preview:
                  </span>
                  <div className="bg-gradient-to-r from-[var(--color-ink)] via-[#2b241c] to-[var(--color-ink)] text-white p-3.5 rounded-xl border border-[var(--color-gold)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-gold)] text-[var(--color-ink)] text-[10px] font-bold uppercase tracking-wider">
                        {data.promoBadge || 'OFFER'}
                      </span>
                      <p className="text-xs text-white/95 font-medium">
                        {data.promoText || 'Promotional message preview...'}
                      </p>
                    </div>
                    {data.promoCtaText && (
                      <span className="inline-flex items-center text-xs font-semibold text-[var(--color-gold)] hover:text-white uppercase tracking-wider transition-colors shrink-0">
                        {data.promoCtaText} →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Kurtis Products Management (6 Cards) */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="bg-[var(--color-snow)]/60 p-4 rounded-xl border border-[var(--color-whisper)] flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[var(--color-gold)] rounded-full" />
                Kurtis Product Catalog ({data.products.length} Cards)
              </h4>
              <p className="text-xs text-[var(--color-slate)] mt-0.5">
                Customize titles, prices, images, badges (New / Vidhya&apos;s Pick), and fabric for all items on `/shop/kurtis`
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddProduct}
              className="border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10 text-xs font-medium"
            >
              + Add Product Card
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Products Selector Sidebar */}
            <div className="lg:col-span-5 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-slate)] block mb-1">
                Select Product to Edit:
              </span>
              <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                {data.products.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    onClick={() => setSelectedProductIndex(idx)}
                    className={cn(
                      'p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3',
                      selectedProductIndex === idx
                        ? 'bg-[var(--color-gold)]/10 border-[var(--color-gold)] shadow-sm'
                        : 'bg-white border-[var(--color-whisper)] hover:border-[var(--color-gold)]/50'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-14 rounded-lg overflow-hidden relative shrink-0 border border-[var(--color-whisper)] bg-black/10">
                        <Image
                          src={p.image || '/images/collection-kurtis.jpg'}
                          alt={p.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-bold text-[var(--color-gold)]">#{idx + 1}</span>
                          {p.isVidhyasPick && (
                            <span className="text-[9px] px-1 rounded bg-[var(--color-ink)] text-[var(--color-gold)] font-bold">
                              PICK
                            </span>
                          )}
                          {p.isNew && (
                            <span className="text-[9px] px-1 rounded bg-amber-100 text-amber-800 font-bold">
                              NEW
                            </span>
                          )}
                        </div>
                        <h5 className="text-xs font-medium text-[var(--color-ink)] truncate max-w-[180px]">
                          {p.name}
                        </h5>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-semibold text-[var(--color-ink)]">
                            ₹{p.price.toLocaleString()}
                          </span>
                          {p.originalPrice && (
                            <span className="text-[10px] text-[var(--color-slate)] line-through">
                              ₹{p.originalPrice.toLocaleString()}
                            </span>
                          )}
                          {p.discount ? (
                            <span className="text-[10px] font-bold text-rose-600">
                              -{p.discount}%
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {data.products.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveProduct(idx);
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors text-xs"
                        title="Delete product card"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Product Form */}
            {selectedProduct && (
              <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-[var(--color-whisper)] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--color-whisper)]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
                      Editing Card #{selectedProductIndex + 1}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {selectedProduct.category || 'KURTIS'}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-[var(--color-slate)]">
                    Card ID: <code className="bg-slate-100 px-1 py-0.5 rounded">{selectedProduct.id}</code>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                    Product Title / Name
                  </label>
                  <Input
                    value={selectedProduct.name}
                    onChange={(e) => handleProductChange(selectedProductIndex, 'name', e.target.value)}
                    placeholder="e.g. Kutch Ajrakh Modal Silk Kurti"
                    className="font-medium text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                      Selling Price (₹)
                    </label>
                    <Input
                      type="number"
                      value={selectedProduct.price}
                      onChange={(e) => handleProductChange(selectedProductIndex, 'price', Number(e.target.value) || 0)}
                      placeholder="4999"
                      className="text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                      Original Price (₹)
                    </label>
                    <Input
                      type="number"
                      value={selectedProduct.originalPrice || ''}
                      onChange={(e) => handleProductChange(selectedProductIndex, 'originalPrice', Number(e.target.value) || 0)}
                      placeholder="5999"
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                      Discount % (auto)
                    </label>
                    <Input
                      type="number"
                      disabled
                      value={selectedProduct.discount || 0}
                      className="text-xs bg-slate-50 font-bold text-rose-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                      Fabric
                    </label>
                    <Input
                      value={selectedProduct.fabric || 'Cotton'}
                      onChange={(e) => handleProductChange(selectedProductIndex, 'fabric', e.target.value)}
                      placeholder="Silk, Cotton, Chanderi, Velvet..."
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                      Category Tag
                    </label>
                    <Input
                      value={selectedProduct.category || 'KURTIS'}
                      onChange={(e) => handleProductChange(selectedProductIndex, 'category', e.target.value)}
                      placeholder="KURTIS"
                      className="text-xs font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Product Image Upload */}
                <div className="pt-2 border-t border-[var(--color-whisper)] space-y-2">
                  <label className="block text-xs font-semibold text-[var(--color-slate)]">
                    Product Image
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-20 rounded-lg overflow-hidden relative shrink-0 border border-[var(--color-gold)] shadow-sm bg-black/10">
                      <Image
                        src={selectedProduct.image || '/images/collection-kurtis.jpg'}
                        alt={selectedProduct.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => productInputRef.current?.click()}
                          disabled={uploadingTarget === 'productImage'}
                          className="border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10 text-xs"
                        >
                          {uploadingTarget === 'productImage' ? 'Uploading...' : '📁 Upload Local Photo...'}
                        </Button>
                        <input
                          ref={productInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'productImage', `kurtis-prod-${selectedProduct.id}`, selectedProductIndex)}
                        />
                      </div>
                      <Input
                        value={selectedProduct.image}
                        onChange={(e) => handleProductChange(selectedProductIndex, 'image', e.target.value)}
                        placeholder="/images/collection-kurtis.jpg"
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Badges & Flags */}
                <div className="pt-2 border-t border-[var(--color-whisper)] grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border border-[var(--color-whisper)] hover:bg-[var(--color-snow)]">
                    <input
                      type="checkbox"
                      checked={Boolean(selectedProduct.isNew)}
                      onChange={(e) => handleProductChange(selectedProductIndex, 'isNew', e.target.checked)}
                      className="w-4 h-4 text-[var(--color-gold)] rounded focus:ring-[var(--color-gold)]"
                    />
                    <span className="text-xs font-semibold text-[var(--color-ink)]">
                      &quot;NEW&quot; Badge
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border border-[var(--color-whisper)] hover:bg-[var(--color-snow)]">
                    <input
                      type="checkbox"
                      checked={Boolean(selectedProduct.isVidhyasPick)}
                      onChange={(e) => handleProductChange(selectedProductIndex, 'isVidhyasPick', e.target.checked)}
                      className="w-4 h-4 text-[var(--color-gold)] rounded focus:ring-[var(--color-gold)]"
                    />
                    <span className="text-xs font-semibold text-[var(--color-ink)]">
                      Vidhya&apos;s Pick
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border border-[var(--color-whisper)] hover:bg-[var(--color-snow)]">
                    <input
                      type="checkbox"
                      checked={selectedProduct.inStock !== false}
                      onChange={(e) => handleProductChange(selectedProductIndex, 'inStock', e.target.checked)}
                      className="w-4 h-4 text-[var(--color-gold)] rounded focus:ring-[var(--color-gold)]"
                    />
                    <span className="text-xs font-semibold text-[var(--color-ink)]">
                      In Stock
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Atelier Notes & Styling */}
      {activeTab === 'styling' && (
        <div className="space-y-6">
          <div className="bg-[var(--color-snow)]/60 p-4 rounded-xl border border-[var(--color-whisper)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-[var(--color-gold)] rounded-full" />
                  Vidhya&apos;s Styling Guide & Story (Editorial Section)
                </h4>
                <p className="text-xs text-[var(--color-slate)] mt-0.5">
                  Editorial styling advice, atelier portrait, and 3 craftsmanship highlights
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.showStylingGuide}
                  onChange={(e) => handleChange('showStylingGuide', e.target.checked)}
                  className="w-4 h-4 text-[var(--color-gold)] rounded focus:ring-[var(--color-gold)] border-[var(--color-whisper)]"
                />
                <span className="text-xs font-semibold text-[var(--color-ink)]">
                  {data.showStylingGuide ? 'Section Active' : 'Section Disabled'}
                </span>
              </label>
            </div>

            {data.showStylingGuide && (
              <div className="space-y-5 pt-3 border-t border-[var(--color-whisper)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                      Eyebrow Badge
                    </label>
                    <Input
                      value={data.stylingBadge}
                      onChange={(e) => handleChange('stylingBadge', e.target.value)}
                      placeholder="e.g. ATELIER NOTES & STYLING"
                      className="bg-white font-mono uppercase text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                      Styling Guide Title
                    </label>
                    <Input
                      value={data.stylingTitle}
                      onChange={(e) => handleChange('stylingTitle', e.target.value)}
                      placeholder="e.g. Vidhya's Styling Guide for Kurtis"
                      className="bg-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                    Editorial Note / Styling Advice
                  </label>
                  <Textarea
                    rows={3}
                    value={data.stylingNote}
                    onChange={(e) => handleChange('stylingNote', e.target.value)}
                    placeholder="Personal notes from Vidhya on fabrics, styling tips, occasions..."
                    className="bg-white text-sm"
                  />
                </div>

                {/* Atelier Photo Upload */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pt-2">
                  <div className="md:col-span-1">
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[var(--color-whisper)] shadow-sm bg-black/10">
                      <Image
                        src={data.stylingImage || '/images/vidhya-story.jpg'}
                        alt="Styling guide portrait"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="block text-xs font-semibold text-[var(--color-slate)]">
                      Atelier / Founder Photo
                    </label>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => stylingInputRef.current?.click()}
                        disabled={uploadingTarget === 'stylingImage'}
                        className="border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10 text-xs"
                      >
                        {uploadingTarget === 'stylingImage' ? 'Uploading...' : '📁 Upload Photo from Device...'}
                      </Button>
                      <input
                        ref={stylingInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'stylingImage', 'kurtis-styling')}
                      />
                    </div>
                    <Input
                      value={data.stylingImage}
                      onChange={(e) => handleChange('stylingImage', e.target.value)}
                      placeholder="/images/vidhya-story.jpg"
                      className="bg-white text-xs"
                    />
                  </div>
                </div>

                {/* 3 Craftsmanship Highlight Cards */}
                <div className="pt-3 border-t border-[var(--color-whisper)]">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] mb-3">
                    Craftsmanship Highlights (3 Pillars)
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.highlights.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3.5 rounded-xl border border-[var(--color-whisper)] space-y-2.5 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[var(--color-gold)]">
                            Pillar #{idx + 1}
                          </span>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-[var(--color-slate)] uppercase tracking-wider mb-1">
                            Title
                          </label>
                          <Input
                            value={item.title}
                            onChange={(e) => handleHighlightChange(idx, 'title', e.target.value)}
                            placeholder="e.g. Handloom Textiles"
                            className="text-xs h-8"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-[var(--color-slate)] uppercase tracking-wider mb-1">
                            Description
                          </label>
                          <Textarea
                            rows={3}
                            value={item.description}
                            onChange={(e) => handleHighlightChange(idx, 'description', e.target.value)}
                            placeholder="Description of the craft or technique..."
                            className="text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: Navigation & Sidebar */}
      {activeTab === 'nav' && (
        <div className="space-y-6">
          <div className="bg-[var(--color-snow)]/60 p-4 rounded-xl border border-[var(--color-whisper)] space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[var(--color-gold)] rounded-full" />
              Category Navigation & Filter Sidebar
            </h4>

            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[var(--color-whisper)]">
              <div>
                <p className="text-sm font-medium text-[var(--color-ink)]">
                  Show Collections Quick-Browse Strip
                </p>
                <p className="text-xs text-[var(--color-slate)]">
                  Horizontal scrollable buttons with collection thumbnails (Kurtis, Salwars, Lehengas, Sarees, Dupattas)
                </p>
              </div>
              <input
                type="checkbox"
                checked={data.showCategoryStrip}
                onChange={(e) => handleChange('showCategoryStrip', e.target.checked)}
                className="w-4 h-4 text-[var(--color-gold)] rounded focus:ring-[var(--color-gold)] border-[var(--color-whisper)]"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[var(--color-whisper)]">
              <div>
                <p className="text-sm font-medium text-[var(--color-ink)]">
                  Show Filter Sidebar
                </p>
                <p className="text-xs text-[var(--color-slate)]">
                  Desktop left filter sidebar and mobile filter drawer (Category, Fabric, Color, Size, Price Range)
                </p>
              </div>
              <input
                type="checkbox"
                checked={data.showSidebar}
                onChange={(e) => handleChange('showSidebar', e.target.checked)}
                className="w-4 h-4 text-[var(--color-gold)] rounded focus:ring-[var(--color-gold)] border-[var(--color-whisper)]"
              />
            </div>
          </div>

          <div className="bg-[var(--color-snow)]/60 p-4 rounded-xl border border-[var(--color-whisper)] space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[var(--color-gold)] rounded-full" />
              SEO & Search Meta Tags
            </h4>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                Meta Title
              </label>
              <Input
                value={data.metaTitle}
                onChange={(e) => handleChange('metaTitle', e.target.value)}
                placeholder="Designer Kurtis and Tunics Online | Angelika Fashions"
                className="bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                Meta Description
              </label>
              <Textarea
                rows={3}
                value={data.metaDescription}
                onChange={(e) => handleChange('metaDescription', e.target.value)}
                placeholder="Shop handcrafted Indian ethnic kurtis, anarkalis and tunics by Vidhya at Angelika Fashions..."
                className="bg-white text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Live Storefront Preview */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-whisper)]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                Live Storefront Mockup · /shop/kurtis ({data.products.length} Products)
              </h4>
            </div>
            <Link
              href="/shop/kurtis"
              target="_blank"
              className="text-xs font-medium text-[var(--color-gold)] hover:underline flex items-center gap-1"
            >
              Open live page in new tab ↗
            </Link>
          </div>

          {/* Browser Container Window */}
          <div className="rounded-2xl border border-[var(--color-whisper)] shadow-xl overflow-hidden bg-white">
            {/* Fake Browser Toolbar */}
            <div className="bg-[#1e1e1e] text-white/70 px-4 py-2.5 flex items-center gap-3 border-b border-black/40 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <div className="flex-1 max-w-sm mx-auto bg-black/40 px-3 py-1 rounded-md text-[11px] text-white/90 font-mono text-center truncate border border-white/10">
                http://localhost:3000/shop/kurtis
              </div>
            </div>

            {/* Preview Storefront Header */}
            <div className="relative bg-gradient-to-r from-[#171412] via-[#2A231C] to-[#171412] text-white py-10 px-6 sm:px-10 overflow-hidden">
              <div className="absolute inset-0 opacity-20 mix-blend-overlay">
                <img
                  src={data.heroImage || '/images/hero-new-couture.jpg'}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-5xl mx-auto">
                <div className="max-w-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/60">
                    <span>HOME</span>
                    <span>/</span>
                    <span>SHOP</span>
                    <span>/</span>
                    <span className="text-[var(--color-gold)] font-medium">Kurtis</span>
                  </div>

                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--color-gold)]/20 border border-[var(--color-gold)]/40 text-[var(--color-gold)] text-[10px] uppercase tracking-widest font-semibold">
                    {data.badge || 'HANDCRAFTED LUXURY EDIT'}
                  </div>

                  <h1 className="text-[var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-medium text-white capitalize">
                    {data.title || 'Kurtis'}
                  </h1>

                  <p className="text-white/80 text-sm font-light leading-relaxed">
                    {data.description || 'Discover our curated collection of handcrafted Indian ethnic couture.'}
                  </p>
                </div>

                {/* Featured Category Card Preview */}
                <div className="w-64 shrink-0 rounded-xl overflow-hidden border border-[var(--color-gold)]/40 shadow-2xl bg-black/40 backdrop-blur-sm">
                  <div className="aspect-[4/3] relative">
                    <img
                      src={data.cardImage || '/images/collection-kurtis.jpg'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 bg-black/80 backdrop-blur-md flex items-center justify-between text-xs">
                    <span className="text-[11px] uppercase tracking-wider text-[var(--color-gold)] font-medium">
                      {data.cardBadge || 'CURATED BY VIDHYA'}
                    </span>
                    <span className="text-[11px] text-white/70">
                      {data.cardSubtitle || '48 Handcrafted Pieces'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Promo Banner Preview */}
            {data.showPromoBanner && (
              <div className="bg-gradient-to-r from-[var(--color-ink)] via-[#2b241c] to-[var(--color-ink)] text-white p-3 px-6 sm:px-10 border-b border-[var(--color-gold)]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-gold)] text-[var(--color-ink)] text-[10px] font-bold uppercase tracking-wider">
                    {data.promoBadge || 'FESTIVE OFFER'}
                  </span>
                  <span className="text-white/95 font-medium">
                    {data.promoText}
                  </span>
                </div>
                {data.promoCtaText && (
                  <span className="text-[var(--color-gold)] hover:underline font-semibold text-xs uppercase tracking-wider">
                    {data.promoCtaText} →
                  </span>
                )}
              </div>
            )}

            {/* Quick Strip Preview */}
            {data.showCategoryStrip && (
              <div className="bg-[var(--color-snow)] border-b border-[var(--color-whisper)] py-3 px-6 sm:px-10 flex items-center gap-2 overflow-x-auto text-xs">
                <span className="text-[var(--color-slate)] uppercase tracking-wider font-semibold text-[11px] mr-2">
                  COLLECTIONS:
                </span>
                <span className="px-3 py-1 rounded-full bg-white text-[var(--color-slate)] border border-[var(--color-whisper)] text-[11px] uppercase">
                  All Collections
                </span>
                <span className="px-3 py-1 rounded-full bg-[var(--color-ink)] text-white border border-[var(--color-gold)] font-medium text-[11px] uppercase shadow-sm">
                  Kurtis
                </span>
                <span className="px-3 py-1 rounded-full bg-white text-[var(--color-slate)] border border-[var(--color-whisper)] text-[11px] uppercase">
                  Salwars
                </span>
                <span className="px-3 py-1 rounded-full bg-white text-[var(--color-slate)] border border-[var(--color-whisper)] text-[11px] uppercase">
                  Lehengas
                </span>
                <span className="px-3 py-1 rounded-full bg-white text-[var(--color-slate)] border border-[var(--color-whisper)] text-[11px] uppercase">
                  Sarees
                </span>
                <span className="px-3 py-1 rounded-full bg-white text-[var(--color-slate)] border border-[var(--color-whisper)] text-[11px] uppercase">
                  Dupattas
                </span>
              </div>
            )}

            {/* Product Cards Grid Preview */}
            <div className="p-6 sm:p-10 bg-[var(--color-white)]">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-[var(--color-whisper)]">
                <span className="text-xs font-semibold text-[var(--color-ink)]">
                  Showing {data.products.length} of {data.products.length} products
                </span>
                <span className="text-xs text-[var(--color-slate)]">
                  Sort: newest
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data.products.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="group rounded-2xl border border-[var(--color-whisper)] overflow-hidden bg-white shadow-sm flex flex-col"
                  >
                    <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                      <Image
                        src={p.image || '/images/collection-kurtis.jpg'}
                        alt={p.name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        {p.isNew && (
                          <span className="px-2 py-0.5 rounded bg-[var(--color-gold)] text-[var(--color-ink)] text-[10px] font-bold uppercase">
                            NEW
                          </span>
                        )}
                        {p.discount ? (
                          <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold">
                            -{p.discount}%
                          </span>
                        ) : null}
                        {p.isVidhyasPick && (
                          <span className="px-2 py-0.5 rounded bg-[var(--color-ink)] text-[var(--color-gold)] text-[9px] font-bold uppercase tracking-wider">
                            VIDHYA&apos;S PICK
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-2 inset-x-2">
                        <div className="w-full py-1.5 bg-[var(--color-gold)] text-white text-[11px] font-semibold uppercase tracking-wider text-center rounded-lg shadow">
                          QUICK VIEW
                        </div>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-[var(--color-gold)] uppercase font-semibold tracking-wider">
                            {p.category || 'KURTIS'}
                          </span>
                          <span className="text-[var(--color-slate)]">
                            ★ {p.rating || 4.8} ({p.reviewCount || 12})
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-[var(--color-ink)] line-clamp-2 mb-2">
                          {p.name}
                        </h4>
                      </div>

                      <div className="mt-2 pt-2 border-t border-[var(--color-whisper)]">
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-sm font-bold text-[var(--color-ink)]">
                            ₹{p.price.toLocaleString()}
                          </span>
                          {p.originalPrice && (
                            <span className="text-xs text-[var(--color-slate)] line-through">
                              ₹{p.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="w-full py-2 bg-[var(--color-ink)] text-white text-xs font-bold text-center rounded-xl uppercase tracking-wider">
                          ADD TO BAG
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Styling Guide Preview */}
            {data.showStylingGuide && (
              <div className="p-6 sm:p-10 bg-[var(--color-snow)]/80 border-t border-[var(--color-whisper)]">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--color-whisper)] shadow-md">
                    <Image
                      src={data.stylingImage || '/images/vidhya-story.jpg'}
                      alt="Styling Portrait"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)] bg-[var(--color-gold)]/10 px-2.5 py-0.5 rounded-full inline-block">
                      {data.stylingBadge || 'ATELIER NOTES & STYLING'}
                    </span>
                    <h3 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)]">
                      {data.stylingTitle || "Vidhya's Styling Guide for Kurtis"}
                    </h3>
                    <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                      {data.stylingNote}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                      {data.highlights.map((h, i) => (
                        <div key={i} className="p-3 bg-white rounded-xl border border-[var(--color-whisper)] shadow-sm">
                          <h6 className="text-[11px] font-bold text-[var(--color-ink)]">{h.title}</h6>
                          <p className="text-[10px] text-[var(--color-slate)] mt-0.5 leading-tight">{h.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
