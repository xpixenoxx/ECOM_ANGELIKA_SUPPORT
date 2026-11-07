'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type { ShopPageContent, SalwarProductItem, SalwarsCollectionNavItem } from '@/lib/actions/site-content-types';

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'Custom'];

// Reusable clean input component with consistent sizing and theme support
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

// Clean, spacious image uploader without horizontal squishing
function ShopProductImageUploader({
  imageUrl,
  onChange,
  aspectRatio = 'aspect-[3/4]',
  title = 'Product Image',
}: {
  imageUrl?: string;
  onChange: (url: string) => void;
  aspectRatio?: string;
  title?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pasteSuccess, setPasteSuccess] = useState(false);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    const useLocalDataUrl = () => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 3000);
        }
      };
      reader.onerror = () => setUploadError('Failed to read image');
      reader.readAsDataURL(file);
    };

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', 'shop');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: fd,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          onChange(data.url);
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 3000);
          return;
        }
      }
      useLocalDataUrl();
    } catch {
      useLocalDataUrl();
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Only image files are allowed');
        return;
      }
      uploadFile(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[var(--color-ink)]">
          {title}
        </label>
        {pasteSuccess && (
          <span className="text-[10px] text-emerald-600 font-medium">✓ Image loaded!</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
        {/* Preview Frame */}
        <div className="sm:col-span-4 lg:col-span-3">
          <div className={cn(
            'relative w-full rounded-xl overflow-hidden border border-[var(--color-whisper)] bg-[var(--color-snow)] shadow-inner group',
            aspectRatio
          )}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Product preview"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-[var(--color-slate)]">
                <span className="text-xl mb-1">🖼️</span>
                <span className="text-[10px]">No image selected</span>
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-medium">
                Uploading...
              </div>
            )}
          </div>
        </div>

        {/* Upload Controls & URL input */}
        <div className="sm:col-span-8 lg:col-span-9 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3.5 py-2 text-xs font-medium rounded-lg bg-[var(--color-ink)] text-white hover:bg-[var(--color-ink)]/90 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <span>📁</span>
              <span>Upload New File</span>
            </button>

            <span className="text-[11px] text-[var(--color-slate)]">
              Supports JPG, PNG, WebP up to 10MB
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-[var(--color-slate)] tracking-wider">
              Or Paste Direct Image URL
            </label>
            <input
              type="text"
              value={imageUrl || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://... or /images/..."
              className="w-full h-9 text-xs px-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] font-mono placeholder:font-sans placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors"
            />
          </div>

          {uploadError && (
            <p className="text-[11px] text-rose-600 font-medium">{uploadError}</p>
          )}
        </div>
      </div>
    </div>
  );
}

const DEFAULT_SHOP_PAGE_DATA: ShopPageContent = {
  hero: {
    badge: 'HANDCRAFTED LUXURY EDIT',
    title: 'All Collections',
    titleHighlight: 'Collections',
    description: 'Explore our complete collection of handcrafted kurtis, sarees, salwars, lehengas, and dupattas.',
    backgroundImage: '/images/hero-bg.jpg',
    showFeaturedCard: true,
    featuredCardImage: '/images/collection-kurtis.jpg',
    featuredCardTag: 'CURATED BY VIDHYA',
    featuredCardText: '27 Pieces • Pure Handloom',
  },
  announcement: {
    enabled: true,
    badge: 'SPECIAL OFFER',
    headline: 'Complimentary Bespoke Consultation on orders above ₹15,000 | Use Code: ATELIER',
    code: 'ATELIER',
    link: '/shop',
    linkText: 'Explore Atelier →',
  },
  navigation: {
    enabled: true,
    label: 'COLLECTIONS:',
    items: [
      { slug: '', name: 'All Collections', image: '/images/hero-new-couture.jpg', href: '/shop' },
      { slug: 'kurtis', name: 'Kurtis', image: '/images/collection-kurtis.jpg', href: '/shop/kurtis' },
      { slug: 'salwars', name: 'Salwars', image: '/images/collection-salwars.jpg', href: '/shop/salwars' },
      { slug: 'lehengas', name: 'Lehengas', image: '/images/collection-lehengas.jpg', href: '/shop/lehengas' },
      { slug: 'sarees', name: 'Sarees', image: '/images/collection-sarees.jpg', href: '/shop/sarees' },
      { slug: 'dupattas', name: 'Dupattas', image: '/images/collection-dupattas.jpg', href: '/shop/dupattas' },
    ],
  },
  sidebar: {
    title: 'FILTER COLLECTION',
    categoryTitle: 'CATEGORY',
    activeTag: 'ACTIVE FILTERS',
    viewAllText: 'Clear All Filters',
    viewAllHref: '/shop',
    inStockLabel: 'In Stock Only',
    vidhyasPicksLabel: "Vidhya's Picks Only",
  },
  concierge: {
    enabled: true,
    title: 'Need Bespoke Sizing or Styling?',
    subtitle: 'Connect with Vidhya on WhatsApp for custom measurements, fabric swatches, and heirloom bridal consultations.',
    link: 'https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20need%20styling%20advice%20for%20the%20All%20Collections%20catalogue.',
  },
  seo: {
    metaTitle: 'Shop All Collections | Handcrafted Ethnic Luxury | Angelika Fashions',
    metaDescription: 'Explore the complete Angelika collection of handcrafted luxury ethnic wear, kurtis, sarees, lehengas, and dupattas.',
  },
  productsMode: 'database',
  products: [],
};

const PRESET_BACKGROUND_IMAGES = [
  { label: 'Shop Hero Main (Default)', url: '/images/hero-bg.jpg' },
  { label: 'Luxury Couture Drape', url: '/images/hero-new-couture.jpg' },
  { label: 'Heirloom Salwars Drape', url: '/images/collection-salwars.jpg' },
  { label: 'Royal Lehengas Drape', url: '/images/collection-lehengas.jpg' },
  { label: 'Banarasi Sarees Weave', url: '/images/collection-sarees.jpg' },
  { label: 'Artisan Workshop Atelier', url: '/images/artisan-workshop.jpg' },
];

const PRESET_CARD_IMAGES = [
  { label: 'Signature Kurti Ensemble', url: '/images/collection-kurtis.jpg' },
  { label: 'Chanderi Salwar Suit', url: '/images/collection-salwars.jpg' },
  { label: 'Royal Red Bridal Lehenga', url: '/images/collection-lehengas.jpg' },
  { label: 'Banarasi Teal Saree', url: '/images/collection-sarees.jpg' },
  { label: 'Handcrafted Dupatta Rack', url: '/images/collection-dupattas.jpg' },
];

export function ShopPageEditor({
  onCancel,
  onSaved,
}: {
  onCancel?: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState<ShopPageContent>(DEFAULT_SHOP_PAGE_DATA);
  const [activeTab, setActiveTab] = useState<'hero' | 'announcement' | 'navigation' | 'sidebar' | 'products' | 'concierge' | 'seo'>('hero');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expandedProductIndex, setExpandedProductIndex] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.content?.['shop-page']) {
            const raw = json.content['shop-page'];
            if (isMounted) {
              setFormData({
                hero: {
                  ...DEFAULT_SHOP_PAGE_DATA.hero,
                  ...(raw.hero || {}),
                },
                announcement: {
                  ...DEFAULT_SHOP_PAGE_DATA.announcement,
                  ...(raw.announcement || {}),
                },
                navigation: {
                  ...DEFAULT_SHOP_PAGE_DATA.navigation,
                  ...(raw.navigation || {}),
                  items: Array.isArray(raw.navigation?.items) && raw.navigation.items.length > 0
                    ? raw.navigation.items.map((it: any) => ({
                        slug: it.slug ?? '',
                        name: it.name ?? '',
                        image: it.image ?? '',
                        href: it.href ?? '',
                      }))
                    : DEFAULT_SHOP_PAGE_DATA.navigation.items,
                },
                sidebar: {
                  ...DEFAULT_SHOP_PAGE_DATA.sidebar,
                  ...(raw.sidebar || {}),
                },
                concierge: {
                  ...DEFAULT_SHOP_PAGE_DATA.concierge,
                  ...(raw.concierge || {}),
                },
                seo: {
                  ...DEFAULT_SHOP_PAGE_DATA.seo,
                  ...(raw.seo || {}),
                },
                productsMode: raw.productsMode || 'database',
                products: Array.isArray(raw.products) ? raw.products : [],
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to load shop-page content:', err);
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
          sectionId: 'shop-page',
          data: formData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: '✓ Shop Page updates saved live! Refresh /shop to see changes.',
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

  // Product manipulation helpers
  const handleUpdateProduct = (index: number, field: keyof SalwarProductItem, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.products];
      const current = updated[index];
      if (!current) return prev;

      const target: SalwarProductItem = { ...current, [field]: value } as SalwarProductItem;

      // Auto-compute discount if prices change
      if (field === 'price' || field === 'originalPrice') {
        const price = Number(field === 'price' ? value : target.price);
        const orig = Number(field === 'originalPrice' ? value : target.originalPrice);
        if (orig > price && price > 0) {
          target.discount = Math.round(((orig - price) / orig) * 100);
        } else {
          target.discount = 0;
        }
      }

      updated[index] = target;
      return { ...prev, products: updated };
    });
  };

  const handleAddProduct = () => {
    const newId = `shop-item-${Date.now()}`;
    const newProduct: SalwarProductItem = {
      id: newId,
      name: 'Pristine Shadow Work Lucknowi Kurti',
      category: 'Kurtis',
      slug: `pristine-shadow-work-kurti-${formData.products.length + 1}`,
      price: 4999,
      originalPrice: 5999,
      discount: 17,
      image: '/images/collection-kurtis.jpg',
      style: 'Straight Kurti',
      fabric: 'Cotton Georgette',
      color: 'Ivory White',
      sizes: ['S', 'M', 'L', 'XL'],
      badge: 'NEW',
      inStock: true,
      isVidhyasPick: true,
      rating: 4.8,
      reviewCount: 12,
    };
    setFormData((prev) => ({
      ...prev,
      products: [newProduct, ...prev.products],
    }));
    setExpandedProductIndex(0);
  };

  const handleRemoveProduct = (index: number) => {
    const item = formData.products[index];
    if (confirm(`Are you sure you want to delete "${item?.name || 'this item'}" from the catalog?`)) {
      setFormData((prev) => ({
        ...prev,
        products: prev.products.filter((_, i) => i !== index),
      }));
    }
  };

  const handleAddNavigationItem = () => {
    const newItem: SalwarsCollectionNavItem = {
      slug: 'new-collection',
      name: 'New Collection',
      image: '/images/collection-kurtis.jpg',
      href: '/shop',
    };
    setFormData((prev) => ({
      ...prev,
      navigation: {
        ...prev.navigation,
        items: [...prev.navigation.items, newItem],
      },
    }));
  };

  const handleRemoveNavigationItem = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      navigation: {
        ...prev.navigation,
        items: prev.navigation.items.filter((_, i) => i !== idx),
      },
    }));
  };

  const handleUpdateNavigationItem = (idx: number, field: keyof SalwarsCollectionNavItem, val: string) => {
    setFormData((prev) => {
      const items = [...prev.navigation.items];
      const target = items[idx];
      if (!target) return prev;
      items[idx] = { ...target, [field]: val } as SalwarsCollectionNavItem;
      return {
        ...prev,
        navigation: {
          ...prev.navigation,
          items,
        },
      };
    });
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-gold)] border-t-transparent animate-spin" />
        <p className="text-xs font-medium text-[var(--color-slate)]">Loading Shop Page configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[var(--color-ink)] via-[#2B231C] to-[var(--color-ink)] text-white shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-[var(--color-gold)]/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-[var(--color-gold)] text-[var(--color-ink)] text-[10px] font-bold uppercase tracking-wider">
              Main Storefront Catalog
            </span>
            <Badge variant="outline" className="text-white/80 border-white/20 text-[10px]">
              /shop
            </Badge>
          </div>
          <h2 className="text-lg font-serif font-medium tracking-tight text-white flex items-center gap-2">
            <span>Shop All Collections Editor</span>
          </h2>
          <p className="text-xs text-white/70">
            Customize the main shop hero banner, announcements, category strip, and catalog for the storefront.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/shop"
            target="_blank"
            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <span>Live Storefront</span>
            <span className="text-[11px]">↗</span>
          </Link>
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel} className="text-xs text-white border-white/30 hover:bg-white/10">
              Close
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="text-xs bg-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/90 font-semibold"
          >
            {isSaving ? 'Saving Changes...' : 'Save All Changes'}
          </Button>
        </div>
      </div>

      {/* Status notification */}
      {statusMessage && (
        <div
          className={cn(
            'p-3.5 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs',
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          )}
        >
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-[11px] underline opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Editor Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[var(--color-snow)] rounded-xl border border-[var(--color-whisper)] overflow-x-auto no-scrollbar">
        {[
          { id: 'hero', label: 'Hero Banner', icon: '✨' },
          { id: 'announcement', label: 'Announcement Bar', icon: '📢' },
          { id: 'navigation', label: 'Collections Strip', icon: '🗂️' },
          { id: 'sidebar', label: 'Sidebar Filters', icon: '⚙️' },
          { id: 'products', label: `Products Catalog (${formData.productsMode === 'database' ? 'Live DB' : formData.products.length})`, icon: '👗' },
          { id: 'concierge', label: 'Concierge Desk', icon: '💬' },
          { id: 'seo', label: 'SEO Metadata', icon: '🔍' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'px-3.5 py-2 text-xs font-medium rounded-lg transition-all shrink-0 flex items-center gap-1.5',
              activeTab === tab.id
                ? 'bg-white text-[var(--color-ink)] shadow-xs font-semibold border border-[var(--color-whisper)]'
                : 'text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-white/60'
            )}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: HERO BANNER */}
      {activeTab === 'hero' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-6">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">Hero Banner & Featured Card</h3>
            <p className="text-xs text-[var(--color-slate)]">
              Controls the top luxury atmospheric banner and right-side featured card on /shop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Eyebrow Badge"
              value={formData.hero.badge}
              onChange={(val) => setFormData((p) => ({ ...p, hero: { ...p.hero, badge: val } }))}
              placeholder="e.g. HANDCRAFTED LUXURY EDIT"
            />
            <AdminFormField
              label="Highlight Word in Title"
              value={formData.hero.titleHighlight || ''}
              onChange={(val) => setFormData((p) => ({ ...p, hero: { ...p.hero, titleHighlight: val } }))}
              placeholder="e.g. Collections"
            />
          </div>

          <AdminFormField
            label="Hero Main Title"
            value={formData.hero.title}
            onChange={(val) => setFormData((p) => ({ ...p, hero: { ...p.hero, title: val } }))}
            placeholder="e.g. All Collections"
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[var(--color-ink)]">
              Hero Description Subtitle
            </label>
            <textarea
              rows={3}
              value={formData.hero.description}
              onChange={(e) => setFormData((p) => ({ ...p, hero: { ...p.hero, description: e.target.value } }))}
              className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors"
              placeholder="Describe the entire collection..."
            />
          </div>

          {/* Background image uploader */}
          <div className="space-y-3 pt-2">
            <ShopProductImageUploader
              title="Hero Background Ambient Image"
              aspectRatio="aspect-[16/6]"
              imageUrl={formData.hero.backgroundImage}
              onChange={(url) => setFormData((p) => ({ ...p, hero: { ...p.hero, backgroundImage: url } }))}
            />

            {/* Background presets */}
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--color-slate)] tracking-wider block mb-1.5">
                Quick Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_BACKGROUND_IMAGES.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, hero: { ...p.hero, backgroundImage: preset.url } }))}
                    className={cn(
                      'px-2.5 py-1 text-[11px] rounded-md border transition-all',
                      formData.hero.backgroundImage === preset.url
                        ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-ink)] font-semibold'
                        : 'border-[var(--color-whisper)] bg-[var(--color-snow)] text-[var(--color-slate)] hover:bg-white'
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Card */}
          <div className="pt-4 border-t border-[var(--color-whisper)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                  Right-Side Featured Banner Card
                </h4>
                <p className="text-[11px] text-[var(--color-slate)]">
                  Displays the elegant right-hand card with preview image and curator tag
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hero.showFeaturedCard ?? true}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, hero: { ...p.hero, showFeaturedCard: e.target.checked } }))
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-gold)]"></div>
              </label>
            </div>

            {(formData.hero.showFeaturedCard ?? true) && (
              <div className="p-4 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminFormField
                    label="Card Curator Tag"
                    value={formData.hero.featuredCardTag}
                    onChange={(val) => setFormData((p) => ({ ...p, hero: { ...p.hero, featuredCardTag: val } }))}
                    placeholder="e.g. CURATED BY VIDHYA"
                  />
                  <AdminFormField
                    label="Card Subtitle / Pieces Count"
                    value={formData.hero.featuredCardText}
                    onChange={(val) => setFormData((p) => ({ ...p, hero: { ...p.hero, featuredCardText: val } }))}
                    placeholder="e.g. 27 Pieces • Pure Handloom"
                  />
                </div>

                <ShopProductImageUploader
                  title="Featured Card Image"
                  aspectRatio="aspect-[4/3]"
                  imageUrl={formData.hero.featuredCardImage}
                  onChange={(url) => setFormData((p) => ({ ...p, hero: { ...p.hero, featuredCardImage: url } }))}
                />

                <div className="flex flex-wrap gap-2">
                  {PRESET_CARD_IMAGES.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, hero: { ...p.hero, featuredCardImage: preset.url } }))}
                      className={cn(
                        'px-2.5 py-1 text-[11px] rounded-md border transition-all',
                        formData.hero.featuredCardImage === preset.url
                          ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-ink)] font-semibold'
                          : 'border-[var(--color-whisper)] bg-white text-[var(--color-slate)] hover:bg-[var(--color-snow)]'
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ANNOUNCEMENT BAR */}
      {activeTab === 'announcement' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--color-whisper)] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-ink)]">Promotional Announcement Bar</h3>
              <p className="text-xs text-[var(--color-slate)]">
                Banner displayed right below the hero with coupon codes and special offers.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.announcement?.enabled)}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    announcement: {
                      ...DEFAULT_SHOP_PAGE_DATA.announcement,
                      ...(p.announcement || {}),
                      enabled: e.target.checked,
                    },
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-gold)]"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Offer Badge"
              value={formData.announcement?.badge || ''}
              onChange={(val) =>
                setFormData((p) => ({
                  ...p,
                  announcement: {
                    ...DEFAULT_SHOP_PAGE_DATA.announcement,
                    ...(p.announcement || {}),
                    badge: val,
                  },
                }))
              }
              placeholder="e.g. SPECIAL OFFER"
            />
            <AdminFormField
              label="Coupon Code"
              value={formData.announcement?.code || ''}
              onChange={(val) =>
                setFormData((p) => ({
                  ...p,
                  announcement: {
                    ...DEFAULT_SHOP_PAGE_DATA.announcement,
                    ...(p.announcement || {}),
                    code: val,
                  },
                }))
              }
              placeholder="e.g. ATELIER"
            />
          </div>

          <AdminFormField
            label="Offer Headline Text"
            value={formData.announcement?.headline || ''}
            onChange={(val) =>
              setFormData((p) => ({
                ...p,
                announcement: {
                  ...DEFAULT_SHOP_PAGE_DATA.announcement,
                  ...(p.announcement || {}),
                  headline: val,
                },
              }))
            }
            placeholder="e.g. Complimentary Bespoke Consultation on orders above ₹15,000"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Button / Link Text"
              value={formData.announcement?.linkText || ''}
              onChange={(val) =>
                setFormData((p) => ({
                  ...p,
                  announcement: {
                    ...DEFAULT_SHOP_PAGE_DATA.announcement,
                    ...(p.announcement || {}),
                    linkText: val,
                  },
                }))
              }
              placeholder="e.g. Explore Atelier →"
            />
            <AdminFormField
              label="Button / Link Destination URL"
              value={formData.announcement?.link || ''}
              onChange={(val) =>
                setFormData((p) => ({
                  ...p,
                  announcement: {
                    ...DEFAULT_SHOP_PAGE_DATA.announcement,
                    ...(p.announcement || {}),
                    link: val,
                  },
                }))
              }
              placeholder="e.g. /shop"
            />
          </div>
        </div>
      )}

      {/* TAB 3: COLLECTIONS NAVIGATION STRIP */}
      {activeTab === 'navigation' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--color-whisper)] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-ink)]">Category Quick-Browse Strip</h3>
              <p className="text-xs text-[var(--color-slate)]">
                Horizontal pill-navigation strip displayed on the shop page with category thumbnails.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.navigation.enabled}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    navigation: { ...p.navigation, enabled: e.target.checked },
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-gold)]"></div>
            </label>
          </div>

          <AdminFormField
            label="Section Label Prefix"
            value={formData.navigation.label}
            onChange={(val) => setFormData((p) => ({ ...p, navigation: { ...p.navigation, label: val } }))}
            placeholder="e.g. COLLECTIONS:"
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                Collection Pills ({formData.navigation.items.length})
              </span>
              <button
                type="button"
                onClick={handleAddNavigationItem}
                className="text-xs text-[var(--color-gold)] hover:underline font-semibold"
              >
                + Add Collection Item
              </button>
            </div>

            <div className="space-y-3">
              {formData.navigation.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)] flex flex-col sm:flex-row items-center gap-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover border border-[var(--color-gold)]/40 shrink-0"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 w-full">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateNavigationItem(idx, 'name', e.target.value)}
                      placeholder="Name"
                      className="h-8 text-xs px-2.5 rounded border border-[var(--color-whisper)] bg-white"
                    />
                    <input
                      type="text"
                      value={item.href}
                      onChange={(e) => handleUpdateNavigationItem(idx, 'href', e.target.value)}
                      placeholder="URL (/shop/...)"
                      className="h-8 text-xs px-2.5 rounded border border-[var(--color-whisper)] bg-white font-mono"
                    />
                    <input
                      type="text"
                      value={item.image}
                      onChange={(e) => handleUpdateNavigationItem(idx, 'image', e.target.value)}
                      placeholder="Image URL"
                      className="h-8 text-xs px-2.5 rounded border border-[var(--color-whisper)] bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveNavigationItem(idx)}
                    className="text-xs text-rose-500 hover:text-rose-700 underline shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SIDEBAR & FILTERS */}
      {activeTab === 'sidebar' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-6">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">Sidebar Filter Labels</h3>
            <p className="text-xs text-[var(--color-slate)]">
              Customize the titles and badge labels on the left filtering panel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Filter Panel Main Title"
              value={formData.sidebar.title}
              onChange={(val) => setFormData((p) => ({ ...p, sidebar: { ...p.sidebar, title: val } }))}
              placeholder="e.g. FILTER COLLECTION"
            />
            <AdminFormField
              label="Category Header Label"
              value={formData.sidebar.categoryTitle}
              onChange={(val) => setFormData((p) => ({ ...p, sidebar: { ...p.sidebar, categoryTitle: val } }))}
              placeholder="e.g. CATEGORY"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Clear All Text"
              value={formData.sidebar.viewAllText}
              onChange={(val) => setFormData((p) => ({ ...p, sidebar: { ...p.sidebar, viewAllText: val } }))}
              placeholder="e.g. Clear All Filters"
            />
            <AdminFormField
              label="Clear All URL"
              value={formData.sidebar.viewAllHref}
              onChange={(val) => setFormData((p) => ({ ...p, sidebar: { ...p.sidebar, viewAllHref: val } }))}
              placeholder="e.g. /shop"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="In-Stock Filter Label"
              value={formData.sidebar.inStockLabel || ''}
              onChange={(val) => setFormData((p) => ({ ...p, sidebar: { ...p.sidebar, inStockLabel: val } }))}
              placeholder="e.g. In Stock Only"
            />
            <AdminFormField
              label="Vidhya's Picks Filter Label"
              value={formData.sidebar.vidhyasPicksLabel || ''}
              onChange={(val) => setFormData((p) => ({ ...p, sidebar: { ...p.sidebar, vidhyasPicksLabel: val } }))}
              placeholder="e.g. Vidhya's Picks Only"
            />
          </div>
        </div>
      )}

      {/* TAB 5: PRODUCTS CATALOG */}
      {activeTab === 'products' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-6">
          <div className="border-b border-[var(--color-whisper)] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-ink)]">Shop Products Management</h3>
              <p className="text-xs text-[var(--color-slate)]">
                Choose between live store database products or custom curated featured items.
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-[var(--color-snow)] rounded-lg border border-[var(--color-whisper)] shrink-0">
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, productsMode: 'database' }))}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                  formData.productsMode === 'database'
                    ? 'bg-[var(--color-ink)] text-white shadow-xs font-semibold'
                    : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
                )}
              >
                Database Products (Default)
              </button>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, productsMode: 'custom' }))}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                  formData.productsMode === 'custom'
                    ? 'bg-[var(--color-gold)] text-[var(--color-ink)] shadow-xs font-semibold'
                    : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
                )}
              >
                Curated Custom Catalog
              </button>
            </div>
          </div>

          {formData.productsMode === 'database' ? (
            <div className="p-5 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <span>⚡ Database Mode Active</span>
              </div>
              <p>
                The /shop storefront is currently configured to automatically pull all active products from your live database, complete with stock status, dynamic pricing, and server-side filtering.
              </p>
              <p className="text-[11px] text-amber-800">
                Switch to <strong>&quot;Curated Custom Catalog&quot;</strong> above if you would like to hand-pick specific items, override display titles, or showcase customized pricing directly from this admin panel.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                    Curated Products ({formData.products.length})
                  </h4>
                  <p className="text-[11px] text-[var(--color-slate)]">
                    Products managed here will be rendered directly on /shop
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleAddProduct}
                  className="text-xs bg-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/90"
                >
                  + Add New Product
                </Button>
              </div>

              {formData.products.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-[var(--color-whisper)] rounded-xl">
                  <p className="text-xs text-[var(--color-slate)] mb-3">No custom products added yet.</p>
                  <Button size="sm" onClick={handleAddProduct} variant="outline" className="text-xs">
                    Add First Product
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.products.map((product, idx) => {
                    const isExpanded = expandedProductIndex === idx;
                    return (
                      <div
                        key={product.id || idx}
                        className="rounded-xl border border-[var(--color-whisper)] bg-white overflow-hidden shadow-xs transition-all"
                      >
                        {/* Header bar */}
                        <div
                          className="p-3.5 bg-[var(--color-snow)] flex items-center justify-between cursor-pointer hover:bg-[var(--color-whisper)]/40 transition-colors"
                          onClick={() => setExpandedProductIndex(isExpanded ? null : idx)}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image || '/images/collection-kurtis.jpg'}
                              alt={product.name}
                              className="w-10 h-12 rounded object-cover border border-[var(--color-whisper)] bg-white"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-[var(--color-ink)]">
                                  {product.name}
                                </span>
                                {product.badge && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--color-gold)]/20 text-[var(--color-gold)]">
                                    {product.badge}
                                  </span>
                                )}
                                {product.isVidhyasPick && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                                    ★ Pick
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-mono text-[var(--color-slate)]">
                                ₹{product.price.toLocaleString('en-IN')}{' '}
                                {product.originalPrice && (
                                  <span className="line-through text-gray-400">
                                    ₹{product.originalPrice.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[var(--color-slate)]">
                              {isExpanded ? '▲ Less' : '▼ Edit'}
                            </span>
                          </div>
                        </div>

                        {/* Collapsible Content */}
                        {isExpanded && (
                          <div className="p-4 space-y-4 border-t border-[var(--color-whisper)]">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <AdminFormField
                                label="Product Name"
                                value={product.name}
                                onChange={(val) => handleUpdateProduct(idx, 'name', val)}
                              />
                              <AdminFormField
                                label="Product Slug (URL)"
                                value={product.slug}
                                onChange={(val) => handleUpdateProduct(idx, 'slug', val)}
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <AdminFormField
                                label="Price (₹)"
                                type="number"
                                value={product.price}
                                onChange={(val) => handleUpdateProduct(idx, 'price', Number(val))}
                              />
                              <AdminFormField
                                label="Original Price (₹)"
                                type="number"
                                value={product.originalPrice || ''}
                                onChange={(val) => handleUpdateProduct(idx, 'originalPrice', Number(val))}
                                helperText="For strike-through pricing"
                              />
                              <AdminFormField
                                label="Discount %"
                                type="number"
                                value={product.discount || ''}
                                onChange={(val) => handleUpdateProduct(idx, 'discount', Number(val))}
                                helperText="Calculated automatically if left blank"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <AdminFormField
                                label="Category"
                                value={product.category}
                                onChange={(val) => handleUpdateProduct(idx, 'category', val)}
                              />
                              <AdminFormField
                                label="Fabric"
                                value={product.fabric || ''}
                                onChange={(val) => handleUpdateProduct(idx, 'fabric', val)}
                              />
                              <AdminFormField
                                label="Color"
                                value={product.color || ''}
                                onChange={(val) => handleUpdateProduct(idx, 'color', val)}
                              />
                            </div>

                            {/* Product Image */}
                            <ShopProductImageUploader
                              title="Product Image"
                              imageUrl={product.image}
                              onChange={(url) => handleUpdateProduct(idx, 'image', url)}
                            />

                            {/* Available Sizes */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-[var(--color-ink)] block">
                                Available Sizes
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {ALL_SIZES.map((sz) => {
                                  const isSelected = (product.sizes || []).includes(sz);
                                  return (
                                    <button
                                      key={sz}
                                      type="button"
                                      onClick={() => {
                                        const current = product.sizes || [];
                                        const next = isSelected
                                          ? current.filter((s) => s !== sz)
                                          : [...current, sz];
                                        handleUpdateProduct(idx, 'sizes', next);
                                      }}
                                      className={cn(
                                        'px-2.5 py-1 text-xs rounded border transition-colors',
                                        isSelected
                                          ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)] font-semibold'
                                          : 'bg-white text-[var(--color-slate)] border-[var(--color-whisper)] hover:border-gray-400'
                                      )}
                                    >
                                      {sz}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Badges & Stock Toggles */}
                            <div className="flex flex-wrap items-center gap-6 pt-2">
                              <label className="flex items-center gap-2 cursor-pointer text-xs">
                                <input
                                  type="checkbox"
                                  checked={product.inStock !== false}
                                  onChange={(e) => handleUpdateProduct(idx, 'inStock', e.target.checked)}
                                  className="rounded text-[var(--color-gold)]"
                                />
                                <span>In Stock</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer text-xs">
                                <input
                                  type="checkbox"
                                  checked={Boolean(product.isVidhyasPick)}
                                  onChange={(e) => handleUpdateProduct(idx, 'isVidhyasPick', e.target.checked)}
                                  className="rounded text-[var(--color-gold)]"
                                />
                                <span>Vidhya&apos;s Pick Badge</span>
                              </label>
                            </div>

                            <div className="flex justify-end pt-2 border-t border-[var(--color-whisper)]">
                              <button
                                type="button"
                                onClick={() => handleRemoveProduct(idx)}
                                className="text-xs text-rose-600 hover:text-rose-800 underline font-medium"
                              >
                                Delete Product from Catalog
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: CONCIERGE DESK */}
      {activeTab === 'concierge' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--color-whisper)] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-ink)]">Concierge Assistance Desk</h3>
              <p className="text-xs text-[var(--color-slate)]">
                WhatsApp styling guidance card at the bottom of the catalog.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.concierge.enabled}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    concierge: { ...p.concierge, enabled: e.target.checked },
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-gold)]"></div>
            </label>
          </div>

          <AdminFormField
            label="Concierge Card Title"
            value={formData.concierge.title}
            onChange={(val) => setFormData((p) => ({ ...p, concierge: { ...p.concierge, title: val } }))}
            placeholder="e.g. Need Bespoke Sizing or Styling?"
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[var(--color-ink)]">
              Concierge Card Subtitle
            </label>
            <textarea
              rows={2}
              value={formData.concierge.subtitle}
              onChange={(e) => setFormData((p) => ({ ...p, concierge: { ...p.concierge, subtitle: e.target.value } }))}
              className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
            />
          </div>

          <AdminFormField
            label="WhatsApp / Support Link"
            value={formData.concierge.link}
            onChange={(val) => setFormData((p) => ({ ...p, concierge: { ...p.concierge, link: val } }))}
            placeholder="https://wa.me/..."
          />
        </div>
      )}

      {/* TAB 7: SEO METADATA */}
      {activeTab === 'seo' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-6">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">Search Engine Optimization (SEO)</h3>
            <p className="text-xs text-[var(--color-slate)]">
              Configure meta tags and descriptions for Google and social previews on /shop.
            </p>
          </div>

          <div className="space-y-1">
            <AdminFormField
              label="Meta Title"
              value={formData.seo.metaTitle}
              onChange={(val) => setFormData((p) => ({ ...p, seo: { ...p.seo, metaTitle: val } }))}
              placeholder="Shop All Collections | Handcrafted Ethnic Luxury | Angelika Fashions"
              helperText={`${formData.seo.metaTitle.length} / 60 recommended characters`}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[var(--color-ink)]">
              Meta Description
            </label>
            <textarea
              rows={3}
              value={formData.seo.metaDescription}
              onChange={(e) => setFormData((p) => ({ ...p, seo: { ...p.seo, metaDescription: e.target.value } }))}
              placeholder="Write a compelling search snippet..."
              className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
            />
            <p className="text-[10px] text-[var(--color-slate)]">
              {formData.seo.metaDescription.length} / 160 recommended characters
            </p>
          </div>
        </div>
      )}

      {/* Bottom Save Bar */}
      <div className="p-4 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] flex items-center justify-between">
        <span className="text-xs text-[var(--color-slate)]">
          All modifications are saved live into your store content.
        </span>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel} className="text-xs">
              Cancel
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="text-xs bg-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/90 font-semibold"
          >
            {isSaving ? 'Saving Changes...' : 'Save All Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
