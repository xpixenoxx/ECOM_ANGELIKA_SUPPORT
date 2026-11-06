'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type { SalwarsPageContent, SalwarProductItem, SalwarsCollectionNavItem } from '@/lib/actions/site-content-types';

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
function SalwarProductImageUploader({
  imageUrl,
  onChange,
  aspectRatio = 'aspect-[3/4]',
  title = 'Salwar Image',
}: {
  imageUrl: string;
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
      fd.append('target', 'salwars');

      let res: Response | null = null;
      try {
        res = await fetch('/api/admin/content/upload', {
          method: 'POST',
          body: fd,
        });
      } catch {
        // try fallback
      }

      if (!res || !res.ok) {
        try {
          const fallbackRes = await fetch('/api/admin/content/upload-icon', {
            method: 'POST',
            body: fd,
          });
          if (fallbackRes.ok) res = fallbackRes;
        } catch {
          // ignore
        }
      }

      if (res && res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.url) {
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

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            uploadFile(file);
            return;
          }
        }
      }
    }
    const textVal = e.clipboardData?.getData('text');
    if (textVal && (textVal.startsWith('http') || textVal.startsWith('/') || textVal.startsWith('data:image'))) {
      onChange(textVal.trim());
      setPasteSuccess(true);
      setTimeout(() => setPasteSuccess(false), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Portrait Image Preview Container */}
      <div
        tabIndex={0}
        onPaste={handlePaste}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file && file.type.startsWith('image/')) uploadFile(file);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative w-full rounded-xl overflow-hidden border-2 border-dashed border-[var(--color-whisper)] hover:border-[var(--color-gold)] bg-[var(--color-snow)] transition-all cursor-pointer group flex flex-col items-center justify-center shadow-2xs focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]',
          aspectRatio
        )}
      >
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-3 text-white backdrop-blur-[2px]">
              <span className="text-xl">📸</span>
              <span className="text-xs font-semibold">Change Photo</span>
              <span className="text-[10px] text-white/80">Click or Paste Image</span>
            </div>
          </>
        ) : (
          <div className="p-4 text-center space-y-1.5 text-[var(--color-slate)]">
            <span className="text-2xl block mb-1">👗</span>
            <p className="text-xs font-semibold text-[var(--color-ink)]">Add Salwar Photo</p>
            <p className="text-[10px]">Click or drag & drop</p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-medium backdrop-blur-xs">
            <span className="animate-pulse">Uploading...</span>
          </div>
        )}
      </div>

      {/* Action buttons & helper */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 h-8 px-2.5 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] hover:bg-[var(--color-snow)] text-[var(--color-ink)] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>📁</span>
            <span>Upload Image</span>
          </button>
          {pasteSuccess && (
            <span className="text-xs text-emerald-600 font-semibold px-2">✓ Updated!</span>
          )}
        </div>

        {uploadError && <p className="text-xs text-rose-500 font-medium">{uploadError}</p>}

        {/* Direct Image URL input */}
        <div className="relative">
          <input
            type="text"
            value={imageUrl || ''}
            placeholder="/images/cat-salwars.jpg or URL"
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-8 text-[11px] px-2.5 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] font-mono"
          />
        </div>
        <p className="text-[10px] text-[var(--color-slate)]">
          Tip: You can press <kbd className="px-1 py-0.5 rounded bg-[var(--color-whisper)] text-[9px] font-mono font-semibold">Ctrl+V</kbd> anywhere to paste screenshot.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

interface SalwarsPageEditorProps {
  onCancel: () => void;
  onSaved: () => void;
}

export function SalwarsPageEditor({ onCancel, onSaved }: SalwarsPageEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'hero' | 'announcement' | 'navigation' | 'sidebar' | 'seo'>('products');
  const [productSearch, setProductSearch] = useState('');
  const [expandedProductIndex, setExpandedProductIndex] = useState<number | null>(0);

  // Default state matching DEFAULT_SITE_CONTENT['salwars-page']
  const [formData, setFormData] = useState<SalwarsPageContent>({
    hero: {
      badge: 'HANDCRAFTED LUXURY EDIT',
      title: 'Salwars',
      titleHighlight: 'Bridal',
      description: 'Bridal & festive salwars handcrafted with royal zari, zardozi embroidery, and flowing kalidar silhouettes.',
      backgroundImage: '/images/cat-salwars.jpg',
      showFeaturedCard: true,
      featuredCardImage: '/images/cat-salwars.jpg',
      featuredCardTag: 'CURATED BY VIDHYA',
      featuredCardText: '5 Pieces',
    },
    announcement: {
      enabled: true,
      badge: 'BRIDAL OFFER',
      headline: 'Bridal Special: Complimentary matching cancan skirt & bespoke blouse tailoring with every Salwar ensemble.',
      code: 'BRIDAL20',
      link: '/shop/salwars',
      linkText: 'Shop Salwars →',
    },
    navigation: {
      enabled: true,
      label: 'COLLECTIONS:',
      items: [
        { slug: '', name: 'All Collections', image: '/images/hero-new-couture.jpg', href: '/shop' },
        { slug: 'kurtis', name: 'Kurtis', image: '/images/collection-kurtis.jpg', href: '/shop/kurtis' },
        { slug: 'salwars', name: 'Salwars', image: '/images/collection-salwars.jpg', href: '/shop/salwars' },
        { slug: 'salwars', name: 'Salwars', image: '/images/collection-salwars.jpg', href: '/shop/salwars' },
        { slug: 'sarees', name: 'Sarees', image: '/images/collection-sarees.jpg', href: '/shop/sarees' },
        { slug: 'dupattas', name: 'Dupattas', image: '/images/collection-dupattas.jpg', href: '/shop/dupattas' },
      ],
    },
    sidebar: {
      title: 'FILTER COLLECTION',
      categoryTitle: 'CATEGORY',
      activeTag: 'ACTIVE COLLECTION',
      viewAllText: 'View All Collections',
      viewAllHref: '/shop',
      inStockLabel: 'In Stock Only',
      vidhyasPicksLabel: "Vidhya's Picks Only",
    },
    concierge: {
      enabled: true,
      title: "VIDHYA'S CONCIERGE",
      subtitle: 'Bespoke Styling Chat',
      link: 'https://wa.me/919999999999?text=Hi%20Vidhya%2C%20I%20am%20exploring%20Salwars%20at%20Angelika',
    },
    seo: {
      metaTitle: 'Designer Bridal & Festive Salwars | Handcrafted Couture - Angelika Fashions',
      metaDescription: 'Explore luxury bridal salwars, reception ensembles, and sangeet outfits handcrafted with zardozi and gota patti embroidery by designer Vidhya.',
    },
    products: [],
  });

  // Fetch current salwars-page data from API
  useEffect(() => {
    let isMounted = true;
    const fetchContent = async () => {
      try {
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.content?.['salwars-page'] && isMounted) {
            setFormData(json.content['salwars-page']);
          }
        }
      } catch (err) {
        console.error('Failed to load salwars-page content:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchContent();
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
          sectionId: 'salwars-page',
          data: formData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: '✓ All Salwars Page updates saved live! Refresh /shop/salwars to see changes.',
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
    const newId = `salwar-${Date.now()}`;
    const newProduct: SalwarProductItem = {
      id: newId,
      name: 'New Bridal Salwar',
      category: 'Salwars',
      slug: `new-bridal-salwar-${formData.products.length + 1}`,
      price: 19999,
      originalPrice: 24999,
      discount: 20,
      image: '/images/cat-salwars.jpg',
      style: 'Bridal Salwar Set',
      fabric: 'Raw Silk',
      color: 'Crimson Red',
      sizes: ['S', 'M', 'L', 'XL'],
      badge: 'NEW',
      inStock: true,
      isVidhyasPick: false,
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
    if (confirm(`Are you sure you want to delete "${item?.name || 'this salwar'}" from the catalog?`)) {
      setFormData((prev) => ({
        ...prev,
        products: prev.products.filter((_, i) => i !== index),
      }));
    }
  };

  const handleDuplicateProduct = (index: number) => {
    const target = formData.products[index];
    if (!target) return;
    const duplicated: SalwarProductItem = {
      ...target,
      id: `salwar-${Date.now()}`,
      name: `${target.name} (Copy)`,
      slug: `${target.slug}-copy-${Math.floor(Math.random() * 1000)}`,
    };
    setFormData((prev) => {
      const updated = [...prev.products];
      updated.splice(index + 1, 0, duplicated);
      return { ...prev, products: updated };
    });
    setExpandedProductIndex(index + 1);
  };

  const handleMoveProduct = (index: number, direction: 'up' | 'down') => {
    setFormData((prev) => {
      const updated = [...prev.products];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      const itemToMove = updated[index];
      if (!itemToMove) return prev;
      updated.splice(index, 1);
      updated.splice(targetIndex, 0, itemToMove);
      return { ...prev, products: updated };
    });
    setExpandedProductIndex(direction === 'up' ? index - 1 : index + 1);
  };

  const filteredProducts = formData.products.filter((p) => {
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.fabric || '').toLowerCase().includes(q) ||
      (p.style || '').toLowerCase().includes(q) ||
      (p.color || '').toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-8 h-8 mx-auto border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[var(--color-slate)]">Loading Salwars Page settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Sticky Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-whisper)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-semibold text-[var(--color-ink)] font-display">
              Salwars Page
            </h2>
            <Badge variant="outline" className="text-[11px] uppercase bg-[var(--color-gold-light)] text-[var(--color-gold)] border-[var(--color-gold)]/40 font-mono">
              /shop/salwars
            </Badge>
          </div>
          <p className="text-xs text-[var(--color-slate)]">
            Manage the hero banner, bridal offer strip, sidebar filters, concierge, and all {(formData.products || []).length} salwars.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Link
            href="/shop/salwars"
            target="_blank"
            className="text-xs font-medium text-[var(--color-slate)] hover:text-[var(--color-ink)] px-3 py-2 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] hover:bg-[var(--color-snow)] transition-colors inline-flex items-center gap-1.5 shadow-2xs"
          >
            <span>Live Page</span>
            <span>↗</span>
          </Link>
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving} className="shadow-xs font-semibold">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Status Notification */}
      {statusMessage && (
        <div
          className={cn(
            'p-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-between gap-2 border shadow-2xs',
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          )}
        >
          <div className="flex items-center gap-2">
            <span>{statusMessage.type === 'success' ? '✓' : '⚠️'}</span>
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs font-semibold hover:underline"
          >
            ✕
          </button>
        </div>
      )}

      {/* Editor Sub-Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-whisper)] pb-3">
        {[
          { id: 'products', label: `Products Catalog (${(formData.products || []).length})`, icon: '👗' },
          { id: 'hero', label: 'Hero Banner & Card', icon: '✨' },
          { id: 'announcement', label: 'Announcement Bar', icon: '📢' },
          { id: 'navigation', label: 'Collections Strip', icon: '🧭' },
          { id: 'sidebar', label: 'Sidebar & Filters', icon: '🏷️' },
          { id: 'seo', label: 'Concierge & SEO', icon: '🔍' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
              activeTab === tab.id
                ? 'bg-[var(--color-ink)] text-white font-semibold shadow-xs'
                : 'bg-[var(--color-snow)] text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)]'
            )}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PRODUCTS CATALOG                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Catalog Subheader & Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-[var(--color-snow)] rounded-xl border border-[var(--color-whisper)]">
            <div>
              <h3 className="font-semibold text-sm text-[var(--color-ink)] flex items-center gap-2">
                <span>Salwar Pieces</span>
                <span className="text-xs font-mono font-normal text-[var(--color-slate)]">
                  ({formData.products.length} active in storefront)
                </span>
              </h3>
              <p className="text-xs text-[var(--color-slate)]">
                Click any product to expand details, update photo, pricing, or reorder.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search by name, fabric..."
                className="text-xs px-3 h-9 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] w-full sm:w-56 focus:outline-none focus:border-[var(--color-gold)]"
              />
              <Button variant="primary" size="sm" onClick={handleAddProduct} className="shrink-0 h-9 font-semibold">
                + Add Salwar
              </Button>
            </div>
          </div>

          {filteredProducts.length === 0 && (
            <div className="p-8 text-center text-xs text-[var(--color-slate)] bg-[var(--color-snow)] rounded-xl border border-dashed border-[var(--color-whisper)]">
              No salwars found matching &ldquo;{productSearch}&rdquo;.
            </div>
          )}

          {/* Product Cards List */}
          <div className="space-y-4">
            {filteredProducts.map((product) => {
              const originalIndex = formData.products.findIndex((p) => p.id === product.id);
              const i = originalIndex !== -1 ? originalIndex : 0;
              const isExpanded = expandedProductIndex === i;

              return (
                <div
                  key={product.id || i}
                  className={cn(
                    'rounded-xl border transition-all overflow-hidden bg-[var(--color-white)]',
                    isExpanded
                      ? 'border-[var(--color-gold)] shadow-sm'
                      : 'border-[var(--color-whisper)] hover:border-[var(--color-gold)]/40 shadow-2xs'
                  )}
                >
                  {/* Card Header (Clickable Accordion) */}
                  <div
                    onClick={() => setExpandedProductIndex(isExpanded ? null : i)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer hover:bg-[var(--color-snow)]/60 transition-colors select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Item Number */}
                      <span className="w-7 h-7 rounded-full bg-[var(--color-ink)] text-white text-xs font-mono font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>

                      {/* Small Thumbnail */}
                      <div className="w-10 h-12 rounded-lg overflow-hidden bg-[var(--color-whisper)] shrink-0 border border-[var(--color-whisper)]">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-[var(--color-mist)]">👗</div>
                        )}
                      </div>

                      {/* Product Name & Metadata */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-sm text-[var(--color-ink)] truncate">
                            {product.name || 'Untitled Salwar'}
                          </h4>
                          {product.badge && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--color-gold-light)] text-[var(--color-gold)]">
                              {product.badge}
                            </span>
                          )}
                          {product.isVidhyasPick && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                              ★ Vidhya&apos;s Pick
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--color-slate)] mt-0.5">
                          <span className="font-semibold text-[var(--color-ink)]">₹{Number(product.price).toLocaleString()}</span>
                          {product.originalPrice && (
                            <span className="ml-1.5 line-through text-[var(--color-mist)] text-[11px]">
                              ₹{Number(product.originalPrice).toLocaleString()}
                            </span>
                          )}
                          {product.discount ? (
                            <span className="ml-1.5 text-rose-600 font-semibold text-[11px]">
                              (-{product.discount}%)
                            </span>
                          ) : null}
                          <span className="mx-2 text-[var(--color-mist)]">·</span>
                          <span>{product.fabric || 'Silk'}</span>
                          <span className="mx-2 text-[var(--color-mist)]">·</span>
                          <span>{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Actions & Chevron */}
                    <div
                      className="flex items-center gap-1.5 self-end sm:self-auto shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        disabled={i === 0}
                        onClick={() => handleMoveProduct(i, 'up')}
                        title="Move Up"
                        className="w-7 h-7 rounded border border-[var(--color-whisper)] bg-[var(--color-white)] hover:bg-[var(--color-snow)] text-[var(--color-ink)] disabled:opacity-30 text-xs flex items-center justify-center"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={i === formData.products.length - 1}
                        onClick={() => handleMoveProduct(i, 'down')}
                        title="Move Down"
                        className="w-7 h-7 rounded border border-[var(--color-whisper)] bg-[var(--color-white)] hover:bg-[var(--color-snow)] text-[var(--color-ink)] disabled:opacity-30 text-xs flex items-center justify-center"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateProduct(i)}
                        title="Duplicate"
                        className="px-2.5 h-7 rounded border border-[var(--color-whisper)] bg-[var(--color-white)] hover:bg-[var(--color-snow)] text-[var(--color-ink)] text-xs font-medium"
                      >
                        Duplicate
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(i)}
                        title="Delete"
                        className="px-2.5 h-7 rounded border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium"
                      >
                        Delete
                      </button>
                      <span className="text-xs text-[var(--color-slate)] ml-1 font-mono">
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Card Body */}
                  {isExpanded && (
                    <div className="p-5 border-t border-[var(--color-whisper)] bg-[var(--color-snow)]/40 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        {/* Column 1: Salwar Photo Uploader */}
                        <div className="md:col-span-4 xl:col-span-3 space-y-1">
                          <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                            Salwar Photo
                          </label>
                          <SalwarProductImageUploader
                            imageUrl={product.image || ''}
                            onChange={(url) => handleUpdateProduct(i, 'image', url)}
                            aspectRatio="aspect-[3/4]"
                            title={product.name}
                          />
                        </div>

                        {/* Column 2: All Product Details & Merchandising */}
                        <div className="md:col-span-8 xl:col-span-9 space-y-4">
                          {/* 1. Identity */}
                          <div className="p-4 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-white)] space-y-3">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)] pb-1 border-b border-[var(--color-whisper)]">
                              1. Title & URL Slug
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <AdminFormField
                                label="Salwar Title"
                                value={product.name}
                                onChange={(val) => handleUpdateProduct(i, 'name', val)}
                                placeholder="Royal Crimson Bridal Zardozi Salwar"
                              />
                              <AdminFormField
                                label="URL Slug"
                                value={product.slug}
                                onChange={(val) => handleUpdateProduct(i, 'slug', val)}
                                placeholder="royal-crimson-bridal-zardozi-salwar"
                              />
                            </div>
                          </div>

                          {/* 2. Pricing & Top Badge */}
                          <div className="p-4 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-white)] space-y-3">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)] pb-1 border-b border-[var(--color-whisper)]">
                              2. Pricing & Merchandising Badge
                            </h5>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <AdminFormField
                                label="Sale Price (₹)"
                                type="number"
                                prefix="₹"
                                value={product.price}
                                onChange={(val) => handleUpdateProduct(i, 'price', Number(val))}
                              />
                              <AdminFormField
                                label="Original Price (₹)"
                                type="number"
                                prefix="₹"
                                value={product.originalPrice || ''}
                                onChange={(val) => handleUpdateProduct(i, 'originalPrice', Number(val))}
                              />
                              <AdminFormField
                                label="Discount (%)"
                                type="number"
                                value={product.discount ?? ''}
                                onChange={(val) => handleUpdateProduct(i, 'discount', Number(val))}
                                helperText="Auto-computed from prices"
                              />
                              <AdminFormField
                                label="Top Badge"
                                value={product.badge || ''}
                                onChange={(val) => handleUpdateProduct(i, 'badge', val)}
                                placeholder="NEW, BESTSELLER"
                              />
                            </div>
                          </div>

                          {/* 3. Style, Fabric & Color */}
                          <div className="p-4 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-white)] space-y-3">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)] pb-1 border-b border-[var(--color-whisper)]">
                              3. Artisanal Details & Attributes
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <AdminFormField
                                label="Style / Silhouette"
                                value={product.style || ''}
                                onChange={(val) => handleUpdateProduct(i, 'style', val)}
                                placeholder="Bridal Salwar Set"
                              />
                              <AdminFormField
                                label="Fabric"
                                value={product.fabric || ''}
                                onChange={(val) => handleUpdateProduct(i, 'fabric', val)}
                                placeholder="Raw Silk & Velvet"
                              />
                              <AdminFormField
                                label="Primary Color"
                                value={product.color || ''}
                                onChange={(val) => handleUpdateProduct(i, 'color', val)}
                                placeholder="Crimson Red"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1">
                              <AdminFormField
                                label="Rating ★ (1.0 - 5.0)"
                                type="number"
                                value={product.rating ?? 4.8}
                                onChange={(val) => handleUpdateProduct(i, 'rating', Number(val))}
                              />
                              <AdminFormField
                                label="Review Count"
                                type="number"
                                value={product.reviewCount ?? 12}
                                onChange={(val) => handleUpdateProduct(i, 'reviewCount', Number(val))}
                              />
                            </div>
                          </div>

                          {/* 4. Sizes & Visibility */}
                          <div className="p-4 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-white)] space-y-3">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)] pb-1 border-b border-[var(--color-whisper)]">
                              4. Available Sizes & Storefront Toggles
                            </h5>

                            {/* Sizes */}
                            <div>
                              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-2">
                                Available Sizes (Click to toggle)
                              </label>
                              <div className="flex flex-wrap items-center gap-2">
                                {ALL_SIZES.map((sz) => {
                                  const isSelected = (product.sizes || []).includes(sz);
                                  return (
                                    <button
                                      key={sz}
                                      type="button"
                                      onClick={() => {
                                        const cur = product.sizes || [];
                                        const updated = isSelected ? cur.filter((s) => s !== sz) : [...cur, sz];
                                        handleUpdateProduct(i, 'sizes', updated);
                                      }}
                                      className={cn(
                                        'px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all border',
                                        isSelected
                                          ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)] shadow-2xs font-bold'
                                          : 'bg-[var(--color-white)] text-[var(--color-slate)] border-[var(--color-whisper)] hover:border-[var(--color-gold)]'
                                      )}
                                    >
                                      {isSelected ? `✓ ${sz}` : sz}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Toggles */}
                            <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-[var(--color-whisper)]">
                              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--color-ink)] select-none">
                                <input
                                  type="checkbox"
                                  checked={product.inStock ?? true}
                                  onChange={(e) => handleUpdateProduct(i, 'inStock', e.target.checked)}
                                  className="rounded border-[var(--color-whisper)] text-[var(--color-gold)] focus:ring-[var(--color-gold)] w-4 h-4 cursor-pointer"
                                />
                                <span>In Stock (Available for Purchase)</span>
                              </label>

                              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--color-ink)] select-none">
                                <input
                                  type="checkbox"
                                  checked={product.isVidhyasPick ?? false}
                                  onChange={(e) => handleUpdateProduct(i, 'isVidhyasPick', e.target.checked)}
                                  className="rounded border-[var(--color-whisper)] text-[var(--color-gold)] focus:ring-[var(--color-gold)] w-4 h-4 cursor-pointer"
                                />
                                <span>⭐ Mark as Vidhya&apos;s Pick</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HERO BANNER & CURATED CARD                                         */}
      {/* ========================================================================= */}
      {activeTab === 'hero' && (
        <div className="space-y-5">
          <div className="p-5 border border-[var(--color-whisper)] rounded-2xl bg-[var(--color-white)] space-y-4">
            <h3 className="font-semibold text-sm text-[var(--color-ink)] pb-2 border-b border-[var(--color-whisper)]">
              Hero Header & Ambient Background
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminFormField
                label="Eyebrow Badge"
                value={formData.hero.badge}
                placeholder="HANDCRAFTED LUXURY EDIT"
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, hero: { ...prev.hero, badge: val } }))
                }
              />
              <AdminFormField
                label="Gold Highlight Word"
                value={formData.hero.titleHighlight || ''}
                placeholder="Bridal"
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, hero: { ...prev.hero, titleHighlight: val } }))
                }
              />
            </div>

            <AdminFormField
              label="Page Headline"
              value={formData.hero.title}
              placeholder="Salwars"
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, hero: { ...prev.hero, title: val } }))
              }
            />

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                Hero Subtitle / Description
              </label>
              <textarea
                rows={3}
                value={formData.hero.description}
                placeholder="Bridal & festive salwars handcrafted with royal zari..."
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, hero: { ...prev.hero, description: e.target.value } }))
                }
                className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]"
              />
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                Ambient Background Image
              </label>
              <SalwarProductImageUploader
                imageUrl={formData.hero.backgroundImage}
                onChange={(url) =>
                  setFormData((prev) => ({ ...prev, hero: { ...prev.hero, backgroundImage: url } }))
                }
                aspectRatio="aspect-[16/9]"
                title="Hero Background"
              />
            </div>
          </div>

          {/* Curated by Vidhya Floating Card */}
          <div className="p-5 border border-[var(--color-whisper)] rounded-2xl bg-[var(--color-white)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-whisper)]">
              <div>
                <h3 className="font-semibold text-sm text-[var(--color-ink)]">
                  &ldquo;Curated by Vidhya&rdquo; Floating Showcase Card
                </h3>
                <p className="text-xs text-[var(--color-slate)]">
                  The elegant luxury highlight card positioned on the right side of the hero header.
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--color-ink)]">
                <input
                  type="checkbox"
                  checked={formData.hero.showFeaturedCard ?? true}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, showFeaturedCard: e.target.checked },
                    }))
                  }
                  className="rounded border-[var(--color-whisper)] text-[var(--color-gold)] w-4 h-4 cursor-pointer"
                />
                <span>Show Floating Card</span>
              </label>
            </div>

            {(formData.hero.showFeaturedCard ?? true) && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminFormField
                    label="Card Tag"
                    value={formData.hero.featuredCardTag}
                    placeholder="CURATED BY VIDHYA"
                    onChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, featuredCardTag: val },
                      }))
                    }
                  />
                  <AdminFormField
                    label="Piece Count / Subtitle"
                    value={formData.hero.featuredCardText}
                    placeholder="5 Pieces"
                    onChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, featuredCardText: val },
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                    Featured Card Image
                  </label>
                  <SalwarProductImageUploader
                    imageUrl={formData.hero.featuredCardImage}
                    onChange={(url) =>
                      setFormData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, featuredCardImage: url },
                      }))
                    }
                    aspectRatio="aspect-[4/3]"
                    title="Featured Card Photo"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ANNOUNCEMENT BAR                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'announcement' && (
        <div className="p-5 border border-[var(--color-whisper)] rounded-2xl bg-[var(--color-white)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-whisper)]">
            <div>
              <h3 className="font-semibold text-sm text-[var(--color-ink)]">
                Promotional Announcement Bar
              </h3>
              <p className="text-xs text-[var(--color-slate)]">
                A gold banner strip displayed directly below the hero header on /shop/salwars.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--color-ink)]">
              <input
                type="checkbox"
                checked={formData.announcement.enabled}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    announcement: { ...prev.announcement, enabled: e.target.checked },
                  }))
                }
                className="rounded border-[var(--color-whisper)] text-[var(--color-gold)] w-4 h-4 cursor-pointer"
              />
              <span>Enable Strip</span>
            </label>
          </div>

          {formData.announcement.enabled && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminFormField
                  label="Offer Badge"
                  value={formData.announcement.badge}
                  placeholder="BRIDAL OFFER"
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      announcement: { ...prev.announcement, badge: val },
                    }))
                  }
                />
                <AdminFormField
                  label="Discount Coupon Code"
                  value={formData.announcement.code || ''}
                  placeholder="BRIDAL20"
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      announcement: { ...prev.announcement, code: val },
                    }))
                  }
                />
              </div>

              <AdminFormField
                label="Headline Announcement"
                value={formData.announcement.headline}
                placeholder="Bridal Special: Complimentary matching cancan skirt & bespoke tailoring..."
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    announcement: { ...prev.announcement, headline: val },
                  }))
                }
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminFormField
                  label="Button Destination Link"
                  value={formData.announcement.link || ''}
                  placeholder="/shop/salwars"
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      announcement: { ...prev.announcement, link: val },
                    }))
                  }
                />
                <AdminFormField
                  label="Button Text"
                  value={formData.announcement.linkText || ''}
                  placeholder="Shop Salwars →"
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      announcement: { ...prev.announcement, linkText: val },
                    }))
                  }
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: QUICK NAVIGATION STRIP                                             */}
      {/* ========================================================================= */}
      {activeTab === 'navigation' && (
        <div className="p-5 border border-[var(--color-whisper)] rounded-2xl bg-[var(--color-white)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-whisper)]">
            <div>
              <h3 className="font-semibold text-sm text-[var(--color-ink)]">
                Collections Quick-Browse Strip
              </h3>
              <p className="text-xs text-[var(--color-slate)]">
                Pill navigation bar letting customers quickly switch between ethnic wear collections.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--color-ink)]">
              <input
                type="checkbox"
                checked={formData.navigation.enabled ?? true}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    navigation: { ...prev.navigation, enabled: e.target.checked },
                  }))
                }
                className="rounded border-[var(--color-whisper)] text-[var(--color-gold)] w-4 h-4 cursor-pointer"
              />
              <span>Enable Strip</span>
            </label>
          </div>

          <AdminFormField
            label="Section Label"
            value={formData.navigation.label || 'COLLECTIONS:'}
            placeholder="COLLECTIONS:"
            onChange={(val) =>
              setFormData((prev) => ({
                ...prev,
                navigation: { ...prev.navigation, label: val },
              }))
            }
          />

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
              Navigation Items
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(formData.navigation.items || []).map((item, idx) => (
                <div
                  key={item.name || idx}
                  className="p-3 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)]/60 flex items-center gap-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover border border-[var(--color-gold)]/40 shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const updated = [...(formData.navigation.items || [])];
                        updated[idx] = { ...item, name: e.target.value };
                        setFormData((prev) => ({
                          ...prev,
                          navigation: { ...prev.navigation, items: updated },
                        }));
                      }}
                      className="w-full text-xs font-semibold px-2 py-1 rounded border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)]"
                    />
                    <input
                      type="text"
                      value={item.href}
                      onChange={(e) => {
                        const updated = [...(formData.navigation.items || [])];
                        updated[idx] = { ...item, href: e.target.value };
                        setFormData((prev) => ({
                          ...prev,
                          navigation: { ...prev.navigation, items: updated },
                        }));
                      }}
                      className="w-full text-[11px] px-2 py-0.5 rounded border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-slate)] font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SIDEBAR & FILTERS                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'sidebar' && (
        <div className="p-5 border border-[var(--color-whisper)] rounded-2xl bg-[var(--color-white)] space-y-4">
          <div className="pb-3 border-b border-[var(--color-whisper)]">
            <h3 className="font-semibold text-sm text-[var(--color-ink)]">
              Sidebar Filter Headings & Labels
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Customize the titles and labels on the left filter sidebar of /shop/salwars.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminFormField
              label="Sidebar Title"
              value={formData.sidebar.title}
              placeholder="FILTER COLLECTION"
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  sidebar: { ...prev.sidebar, title: val },
                }))
              }
            />
            <AdminFormField
              label="Category Section Heading"
              value={formData.sidebar.categoryTitle}
              placeholder="CATEGORY"
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  sidebar: { ...prev.sidebar, categoryTitle: val },
                }))
              }
            />
            <AdminFormField
              label="Active Collection Badge"
              value={formData.sidebar.activeTag}
              placeholder="ACTIVE COLLECTION"
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  sidebar: { ...prev.sidebar, activeTag: val },
                }))
              }
            />
            <AdminFormField
              label="Back Link Text"
              value={formData.sidebar.viewAllText}
              placeholder="← View All Collections"
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  sidebar: { ...prev.sidebar, viewAllText: val },
                }))
              }
            />
            <AdminFormField
              label="In Stock Filter Label"
              value={formData.sidebar.inStockLabel}
              placeholder="In Stock Only"
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  sidebar: { ...prev.sidebar, inStockLabel: val },
                }))
              }
            />
            <AdminFormField
              label="Vidhya's Picks Filter Label"
              value={formData.sidebar.vidhyasPicksLabel}
              placeholder="Vidhya's Picks Only"
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  sidebar: { ...prev.sidebar, vidhyasPicksLabel: val },
                }))
              }
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: CONCIERGE & SEO                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'seo' && (
        <div className="space-y-5">
          {/* Concierge Widget */}
          <div className="p-5 border border-[var(--color-whisper)] rounded-2xl bg-[var(--color-white)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-whisper)]">
              <div>
                <h3 className="font-semibold text-sm text-[var(--color-ink)]">
                  Vidhya&apos;s Concierge Floating Chat
                </h3>
                <p className="text-xs text-[var(--color-slate)]">
                  The bespoke styling chat button fixed to the bottom right of the storefront.
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--color-ink)]">
                <input
                  type="checkbox"
                  checked={formData.concierge.enabled}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      concierge: { ...prev.concierge, enabled: e.target.checked },
                    }))
                  }
                  className="rounded border-[var(--color-whisper)] text-[var(--color-gold)] w-4 h-4 cursor-pointer"
                />
                <span>Enable Chat Button</span>
              </label>
            </div>

            {formData.concierge.enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminFormField
                  label="Widget Title"
                  value={formData.concierge.title}
                  placeholder="VIDHYA'S CONCIERGE"
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      concierge: { ...prev.concierge, title: val },
                    }))
                  }
                />
                <AdminFormField
                  label="Widget Subtitle"
                  value={formData.concierge.subtitle}
                  placeholder="Bespoke Styling Chat"
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      concierge: { ...prev.concierge, subtitle: val },
                    }))
                  }
                />
                <div className="sm:col-span-2">
                  <AdminFormField
                    label="WhatsApp Chat Destination Link"
                    value={formData.concierge.link}
                    placeholder="https://wa.me/919999999999?text=..."
                    onChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        concierge: { ...prev.concierge, link: val },
                      }))
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* SEO Metadata */}
          <div className="p-5 border border-[var(--color-whisper)] rounded-2xl bg-[var(--color-white)] space-y-4">
            <div className="pb-3 border-b border-[var(--color-whisper)]">
              <h3 className="font-semibold text-sm text-[var(--color-ink)]">
                SEO Search Engine Optimization
              </h3>
              <p className="text-xs text-[var(--color-slate)]">
                Meta title and meta description tag shown on Google searches and browser tabs for /shop/salwars.
              </p>
            </div>

            <AdminFormField
              label="Meta Browser Title"
              value={formData.seo.metaTitle}
              placeholder="Designer Bridal & Festive Salwars | Handcrafted Couture - Angelika Fashions"
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  seo: { metaTitle: val, metaDescription: prev.seo?.metaDescription || "" },
                }))
              }
            />

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={formData.seo.metaDescription}
                placeholder="Explore luxury bridal salwars, reception ensembles..."
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    seo: { metaTitle: prev.seo?.metaTitle || "", metaDescription: e.target.value },
                  }))
                }
                className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-whisper)]">
        <p className="text-xs text-[var(--color-slate)]">
          {(formData.products || []).length} total salwar ensembles configured
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving} className="font-semibold">
            {isSaving ? 'Saving Changes...' : 'Save All Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
