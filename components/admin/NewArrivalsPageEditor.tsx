'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type { NewArrivalsPageContent, NewArrivalProductItemPage } from '@/lib/actions/site-content-types';

const CATEGORY_OPTIONS = [
  'All',
  'Sarees',
  'Lehengas',
  'Kurtis',
  'Salwars',
  'Dupattas',
  'Gowns',
  'Co-ords',
  'Accessories',
];

const PRESET_COLORS = [
  { name: 'Crimson', hex: '#DC143C' },
  { name: 'Emerald', hex: '#1B7A3D' },
  { name: 'Navy', hex: '#1E3A8A' },
  { name: 'Gold', hex: '#C9A84C' },
  { name: 'Ivory', hex: '#FFFFF0' },
  { name: 'Sage', hex: '#8A9A5B' },
  { name: 'Lavender', hex: '#967BB6' },
  { name: 'Coral', hex: '#FF6F61' },
  { name: 'Charcoal', hex: '#36454F' },
  { name: 'Rose', hex: '#FF66CC' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Amber', hex: '#FFBF00' },
];

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

function ProductImageUploader({
  image,
  title,
  onChange,
}: {
  image: string;
  title: string;
  onChange: (url: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'new-arrivals');

      let res = await fetch('/api/admin/content/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const fallbackRes = await fetch('/api/admin/content/upload-icon', {
          method: 'POST',
          body: formData,
        });
        if (fallbackRes.ok) {
          res = fallbackRes;
        }
      }

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          onChange(data.url);
        }
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item && item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          handleUploadFile(file);
          break;
        }
      }
    }
  };

  return (
    <div className="space-y-2" onPaste={handlePaste}>
      <label className="block text-xs font-semibold text-[var(--color-ink)]">
        Product Photo
      </label>
      <div className="flex gap-3 items-start">
        <div className="relative w-24 h-32 aspect-[3/4] rounded-lg overflow-hidden border border-[var(--color-whisper)] bg-[var(--color-snow)] flex-shrink-0 group shadow-sm">
          {image ? (
            <img
              src={image}
              alt={title || 'Product'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-slate)] p-2 text-center text-[10px]">
              <span>No image</span>
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-semibold">
              Uploading...
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleUploadFile(file);
            }}
            className={cn(
              'border border-dashed rounded-lg p-3 text-center transition-all cursor-pointer',
              dragOver
                ? 'border-[var(--color-gold)] bg-[var(--color-gold-light)]/20'
                : 'border-[var(--color-whisper)] hover:border-[var(--color-gold)] bg-[var(--color-snow)]/50'
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadFile(file);
              }}
            />
            <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-ink)]">
              <span>📁</span>
              <span className="font-semibold text-[var(--color-gold)]">Click to browse</span>
              <span className="text-[var(--color-slate)]">or drag & drop</span>
            </div>
            <p className="text-[10px] text-[var(--color-slate)] mt-0.5">
              Paste directly with <kbd className="px-1 py-0.5 rounded bg-[var(--color-white)] border text-[9px]">Ctrl+V</kbd>
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={image}
              placeholder="/images/new-1.jpg or https://..."
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 h-8 text-[11px] px-2 rounded border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
            />
            {image && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="h-8 px-2 text-[11px] text-[var(--color-slate)] hover:text-red-500 rounded border border-[var(--color-whisper)] hover:border-red-200 transition-colors"
                title="Clear photo"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NewArrivalsPageEditor({
  onCancel,
  onSaved,
}: {
  onCancel?: () => void;
  onSaved?: () => void;
}) {
  const [formData, setFormData] = useState<NewArrivalsPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'header' | 'categories' | 'seo'>('products');
  const [expandedProductIndex, setExpandedProductIndex] = useState<number | null>(0);
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const json = await res.json();
          if (json.content && json.content['new-arrivals-page']) {
            setFormData(json.content['new-arrivals-page']);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load new-arrivals-page content:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async () => {
    if (!formData) return;
    try {
      setSaving(true);
      setSaveSuccess(false);
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: 'new-arrivals-page',
          data: formData,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        if (onSaved) onSaved();
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert('Failed to save changes. Please try again.');
      }
    } catch (err) {
      console.error('Error saving new-arrivals-page:', err);
      alert('Error saving content. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProduct = (index: number, field: keyof NewArrivalProductItemPage, value: any) => {
    if (!formData) return;
    setFormData((prev) => {
      if (!prev) return prev;
      const updated = [...prev.products];
      const target = { ...updated[index], [field]: value } as NewArrivalProductItemPage;

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
    if (!formData) return;
    const newId = `new-${Date.now()}`;
    const newProduct: NewArrivalProductItemPage = {
      id: newId,
      name: 'New Designer Ethnic Drop',
      slug: 'new-designer-ethnic-drop',
      category: 'Sarees',
      price: 2999,
      originalPrice: 3499,
      discount: 14,
      image: '/images/new-1.jpg',
      color: 'Crimson',
      colorHex: '#DC143C',
      isNew: true,
      isTrending: false,
      inStock: true,
      tags: ['Handwoven', 'Natural Dyes'],
    };
    setFormData((prev) => prev ? ({ ...prev, products: [newProduct, ...prev.products] }) : null);
    setExpandedProductIndex(0);
  };

  const handleRemoveProduct = (index: number) => {
    if (!formData) return;
    const target = formData.products[index];
    if (confirm(`Delete "${target?.name || 'this item'}" from New Arrivals?`)) {
      setFormData((prev) => prev ? ({
        ...prev,
        products: prev.products.filter((_, i) => i !== index),
      }) : null);
    }
  };

  const handleDuplicateProduct = (index: number) => {
    if (!formData) return;
    const target = formData.products[index];
    if (!target) return;
    const duplicated: NewArrivalProductItemPage = {
      ...target,
      id: `new-${Date.now()}`,
      name: `${target.name} (Copy)`,
      slug: `${target.slug || 'item'}-copy-${Math.floor(Math.random() * 1000)}`,
    };
    setFormData((prev) => {
      if (!prev) return prev;
      const updated = [...prev.products];
      updated.splice(index + 1, 0, duplicated);
      return { ...prev, products: updated };
    });
    setExpandedProductIndex(index + 1);
  };

  const handleMoveProduct = (index: number, direction: 'up' | 'down') => {
    if (!formData) return;
    setFormData((prev) => {
      if (!prev) return prev;
      const updated = [...prev.products];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      const item = updated[index];
      if (!item) return prev;
      updated.splice(index, 1);
      updated.splice(targetIndex, 0, item);
      return { ...prev, products: updated };
    });
    setExpandedProductIndex(direction === 'up' ? index - 1 : index + 1);
  };

  if (loading || !formData) {
    return (
      <div className="py-16 text-center text-xs text-[var(--color-slate)] space-y-2">
        <div className="animate-spin text-xl inline-block">⏳</div>
        <p>Loading New Arrivals Page content...</p>
      </div>
    );
  }

  const filteredProducts = formData.products.filter((p) => {
    if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.color.toLowerCase().includes(q) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--color-whisper)] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-widest text-[var(--color-gold)] font-semibold">
              Storefront Page Editor
            </span>
            <Badge variant="outline" className="text-[10px] bg-[var(--color-gold-light)]/20 text-[var(--color-gold)] border-[var(--color-gold)]/40">
              Live: /new-arrivals
            </Badge>
          </div>
          <h2 className="text-xl font-medium text-[var(--color-ink)]">New Arrivals Page</h2>
          <p className="text-xs text-[var(--color-slate)]">
            Manage the hero headline, category filter strip, and all {formData.products.length} products displayed on the New Arrivals storefront.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/new-arrivals" target="_blank" className="flex items-center gap-1.5 text-xs">
              <span>View Storefront</span>
              <span>↗</span>
            </Link>
          </Button>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs">
              Close
            </Button>
          )}
          <Button
            variant="gold"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="text-xs min-w-[110px]"
          >
            {saving ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center justify-between">
          <span className="font-medium">
            ✓ "New Arrivals Page" updated successfully! Changes are live on /new-arrivals.
          </span>
          <Link href="/new-arrivals" target="_blank" className="font-semibold underline ml-3">
            Open Storefront ↗
          </Link>
        </div>
      )}

      {/* Clean Navigation Tabs */}
      <div className="flex border-b border-[var(--color-whisper)] gap-1 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={cn(
            'px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5',
            activeTab === 'products'
              ? 'border-[var(--color-gold)] text-[var(--color-ink)] bg-[var(--color-gold-light)]/10'
              : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)]'
          )}
        >
          <span>✨ Products Catalog</span>
          <Badge variant="outline" className="text-[10px] py-0 px-1.5">
            {formData.products.length}
          </Badge>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('header')}
          className={cn(
            'px-4 py-2 text-xs font-semibold border-b-2 transition-colors',
            activeTab === 'header'
              ? 'border-[var(--color-gold)] text-[var(--color-ink)] bg-[var(--color-gold-light)]/10'
              : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)]'
          )}
        >
          <span>🏷️ Header & Hero</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={cn(
            'px-4 py-2 text-xs font-semibold border-b-2 transition-colors',
            activeTab === 'categories'
              ? 'border-[var(--color-gold)] text-[var(--color-ink)] bg-[var(--color-gold-light)]/10'
              : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)]'
          )}
        >
          <span>📂 Categories Filter Strip</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={cn(
            'px-4 py-2 text-xs font-semibold border-b-2 transition-colors',
            activeTab === 'seo'
              ? 'border-[var(--color-gold)] text-[var(--color-ink)] bg-[var(--color-gold-light)]/10'
              : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)]'
          )}
        >
          <span>🔍 SEO & Metadata</span>
        </button>
      </div>

      {/* TAB 1: PRODUCTS CATALOG */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--color-snow)]/60 p-3 rounded-lg border border-[var(--color-whisper)]">
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                placeholder="Search products by title, category, color..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full sm:max-w-xs h-9 text-xs px-3 rounded-md border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 text-xs px-2.5 rounded-md border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="gold"
              size="sm"
              onClick={handleAddProduct}
              className="text-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <span>+</span>
              <span>Add New Arrival</span>
            </Button>
          </div>

          <div className="space-y-3">
            {filteredProducts.map((product, pIdx) => {
              const actualIndex = formData.products.findIndex((p) => p.id === product.id);
              const isExpanded = expandedProductIndex === actualIndex;

              return (
                <div
                  key={product.id || pIdx}
                  className={cn(
                    'rounded-xl border transition-all duration-200 bg-[var(--color-white)] shadow-xs',
                    isExpanded
                      ? 'border-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/20'
                      : 'border-[var(--color-whisper)] hover:border-[var(--color-gold)]/60'
                  )}
                >
                  {/* Card Header Accordion Bar */}
                  <div
                    onClick={() => setExpandedProductIndex(isExpanded ? null : actualIndex)}
                    className="flex items-center justify-between p-3.5 cursor-pointer select-none gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-[var(--color-snow)] text-[11px] font-bold text-[var(--color-slate)] flex items-center justify-center flex-shrink-0 border border-[var(--color-whisper)]">
                        {actualIndex + 1}
                      </span>

                      <div className="w-10 h-12 rounded-md overflow-hidden bg-[var(--color-snow)] flex-shrink-0 border border-[var(--color-whisper)] relative">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[8px] text-[var(--color-slate)] flex items-center justify-center h-full">
                            No img
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-[var(--color-ink)] truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                            {product.name || 'Untitled Product'}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-gold-light)]/30 text-[var(--color-gold)] font-semibold uppercase tracking-wider">
                            {product.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[var(--color-slate)] mt-0.5">
                          <span className="font-semibold text-[var(--color-ink)]">
                            ₹{Number(product.price).toLocaleString('en-IN')}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="line-through text-[10px] text-[var(--color-mist)]">
                              ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                            </span>
                          )}
                          {product.discount > 0 && (
                            <span className="text-[10px] font-bold text-emerald-600">
                              -{product.discount}%
                            </span>
                          )}
                          <span className="inline-block w-1 h-1 rounded-full bg-[var(--color-whisper)]" />
                          <span className="flex items-center gap-1 text-[10px]">
                            <span
                              className="w-2 h-2 rounded-full inline-block border border-black/10"
                              style={{ backgroundColor: product.colorHex || '#ccc' }}
                            />
                            <span>{product.color}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {product.isNew && (
                        <Badge variant="gold" className="text-[9px] py-0 px-1 hidden sm:inline-flex">
                          NEW
                        </Badge>
                      )}
                      {product.isTrending && (
                        <Badge variant="outline" className="text-[9px] py-0 px-1 bg-amber-50 text-amber-700 border-amber-300 hidden sm:inline-flex">
                          TRENDING
                        </Badge>
                      )}
                      {!product.inStock && (
                        <Badge variant="outline" className="text-[9px] py-0 px-1 bg-red-50 text-red-600 border-red-200 hidden sm:inline-flex">
                          OUT OF STOCK
                        </Badge>
                      )}

                      <div className="h-4 w-[1px] bg-[var(--color-whisper)] mx-1" />

                      <button
                        type="button"
                        onClick={() => handleMoveProduct(actualIndex, 'up')}
                        disabled={actualIndex === 0}
                        className="w-7 h-7 rounded text-[11px] text-[var(--color-slate)] hover:bg-[var(--color-snow)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveProduct(actualIndex, 'down')}
                        disabled={actualIndex === formData.products.length - 1}
                        className="w-7 h-7 rounded text-[11px] text-[var(--color-slate)] hover:bg-[var(--color-snow)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                        title="Move Down"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateProduct(actualIndex)}
                        className="w-7 h-7 rounded text-[11px] text-[var(--color-slate)] hover:bg-[var(--color-snow)] flex items-center justify-center"
                        title="Duplicate"
                      >
                        📋
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(actualIndex)}
                        className="w-7 h-7 rounded text-[11px] text-red-500 hover:bg-red-50 flex items-center justify-center"
                        title="Delete"
                      >
                        🗑️
                      </button>
                      <span className="text-xs text-[var(--color-slate)] ml-1">
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {/* Collapsible Card Details */}
                  {isExpanded && (
                    <div className="p-4 pt-2 border-t border-[var(--color-whisper)] space-y-4 bg-[var(--color-snow)]/20">
                      {/* Row 1: Image + Core Info */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-4">
                          <ProductImageUploader
                            image={product.image}
                            title={product.name}
                            onChange={(url) => handleUpdateProduct(actualIndex, 'image', url)}
                          />
                        </div>

                        <div className="lg:col-span-8 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <AdminFormField
                              label="Product Title"
                              value={product.name}
                              onChange={(v) => handleUpdateProduct(actualIndex, 'name', v)}
                              placeholder="e.g. Sarees Cotton Lehenga Set"
                            />
                            <AdminFormField
                              label="URL Slug"
                              value={product.slug || ''}
                              onChange={(v) => handleUpdateProduct(actualIndex, 'slug', v)}
                              placeholder="e.g. sarees-cotton-lehenga-set"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1 tracking-wide">
                                Category
                              </label>
                              <select
                                value={product.category}
                                onChange={(e) => handleUpdateProduct(actualIndex, 'category', e.target.value)}
                                className="w-full h-10 text-xs px-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                              >
                                {CATEGORY_OPTIONS.filter((c) => c !== 'All').map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <AdminFormField
                              label="Sale Price (₹)"
                              type="number"
                              prefix="₹"
                              value={product.price}
                              onChange={(v) => handleUpdateProduct(actualIndex, 'price', Number(v) || 0)}
                            />

                            <AdminFormField
                              label="Original Price (₹)"
                              type="number"
                              prefix="₹"
                              value={product.originalPrice || ''}
                              onChange={(v) => handleUpdateProduct(actualIndex, 'originalPrice', Number(v) || 0)}
                              helperText={product.discount > 0 ? `Auto-calculated discount: ${product.discount}%` : 'Leave empty if no discount'}
                            />
                          </div>

                          {/* Row 2: Color and Tags */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                            <div>
                              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1 tracking-wide">
                                Primary Color Name
                              </label>
                              <input
                                type="text"
                                value={product.color}
                                onChange={(e) => {
                                  const cName = e.target.value;
                                  const found = PRESET_COLORS.find(
                                    (p) => p.name.toLowerCase() === cName.toLowerCase()
                                  );
                                  handleUpdateProduct(actualIndex, 'color', cName);
                                  if (found) {
                                    handleUpdateProduct(actualIndex, 'colorHex', found.hex);
                                  }
                                }}
                                placeholder="e.g. Crimson, Emerald, Navy"
                                className="w-full h-10 text-xs px-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1 tracking-wide">
                                Color Hex Swatch
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={product.colorHex || '#C9A84C'}
                                  onChange={(e) => handleUpdateProduct(actualIndex, 'colorHex', e.target.value)}
                                  className="w-10 h-10 p-0.5 rounded border border-[var(--color-whisper)] cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={product.colorHex || ''}
                                  onChange={(e) => handleUpdateProduct(actualIndex, 'colorHex', e.target.value)}
                                  placeholder="#DC143C"
                                  className="flex-1 h-10 text-xs px-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1 tracking-wide">
                                Tags (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={(product.tags || []).join(', ')}
                                onChange={(e) =>
                                  handleUpdateProduct(
                                    actualIndex,
                                    'tags',
                                    e.target.value
                                      .split(',')
                                      .map((t) => t.trim())
                                      .filter(Boolean)
                                  )
                                }
                                placeholder="Handwoven, Natural Dyes, Artisan Made"
                                className="w-full h-10 text-xs px-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                              />
                            </div>
                          </div>

                          {/* Row 3: Merchandising Toggles */}
                          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-[var(--color-whisper)]/60">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[var(--color-ink)]">
                              <input
                                type="checkbox"
                                checked={product.inStock}
                                onChange={(e) => handleUpdateProduct(actualIndex, 'inStock', e.target.checked)}
                                className="w-4 h-4 rounded text-[var(--color-gold)] focus:ring-[var(--color-gold)]"
                              />
                              <span>In Stock (Available for Purchase)</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[var(--color-ink)]">
                              <input
                                type="checkbox"
                                checked={product.isNew}
                                onChange={(e) => handleUpdateProduct(actualIndex, 'isNew', e.target.checked)}
                                className="w-4 h-4 rounded text-[var(--color-gold)] focus:ring-[var(--color-gold)]"
                              />
                              <span>Mark as "NEW" badge</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[var(--color-ink)]">
                              <input
                                type="checkbox"
                                checked={product.isTrending}
                                onChange={(e) => handleUpdateProduct(actualIndex, 'isTrending', e.target.checked)}
                                className="w-4 h-4 rounded text-[var(--color-gold)] focus:ring-[var(--color-gold)]"
                              />
                              <span>Mark as "TRENDING" badge</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddProduct}
              className="text-xs flex items-center gap-1.5"
            >
              <span>+</span>
              <span>Add Another Product</span>
            </Button>
          </div>
        </div>
      )}

      {/* TAB 2: HEADER & HERO */}
      {activeTab === 'header' && (
        <div className="bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">Page Header Headline</h3>
            <p className="text-xs text-[var(--color-slate)]">
              Edit the title, top badge, and subtitle shown at the top of the /new-arrivals page.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminFormField
              label="Top Pill Badge"
              value={formData.header?.badge || 'JUST LANDED'}
              onChange={(v) =>
                setFormData((prev) =>
                  prev ? { ...prev, header: { ...prev.header, badge: v } } : null
                )
              }
              placeholder="JUST LANDED"
            />

            <AdminFormField
              label="Main Page Title"
              value={formData.header?.title || 'New Arrivals'}
              onChange={(v) =>
                setFormData((prev) =>
                  prev ? { ...prev, header: { ...prev.header, title: v } } : null
                )
              }
              placeholder="New Arrivals"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
              Subtitle Description
            </label>
            <textarea
              rows={3}
              value={formData.header?.description || ''}
              onChange={(e) =>
                setFormData((prev) =>
                  prev ? { ...prev, header: { ...prev.header, description: e.target.value } } : null
                )
              }
              className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
              placeholder="Fresh drops every week. Handcrafted pieces from our artisan partners across India."
            />
          </div>

          {/* Live Preview of Header */}
          <div className="mt-4 p-5 rounded-lg bg-[var(--color-snow)] border border-[var(--color-whisper)]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-slate)] block mb-2">
              Storefront Preview
            </span>
            <div className="space-y-1.5">
              <span className="inline-block px-3 py-1 bg-[var(--color-gold-light)] text-[var(--color-gold)] text-xs font-semibold rounded-full">
                {formData.header?.badge || 'JUST LANDED'}
              </span>
              <h1 className="text-3xl font-serif text-[var(--color-ink)]">
                {formData.header?.title || 'New Arrivals'}
              </h1>
              <p className="text-xs text-[var(--color-slate)] max-w-xl">
                {formData.header?.description || 'Fresh drops every week.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES FILTER STRIP */}
      {activeTab === 'categories' && (
        <div className="bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">Category Quick Filters</h3>
            <p className="text-xs text-[var(--color-slate)]">
              Categories shown in the quick filter strip across the top of the products grid.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(formData.categories || CATEGORY_OPTIONS).map((cat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-whisper)] bg-[var(--color-snow)] text-xs font-medium text-[var(--color-ink)] shadow-xs"
              >
                <span>{cat}</span>
                {cat !== 'All' && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              categories: prev.categories.filter((_, i) => i !== idx),
                            }
                          : null
                      );
                    }}
                    className="text-[var(--color-slate)] hover:text-red-500 font-bold text-xs"
                    title="Remove category"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 max-w-sm pt-2">
            <input
              type="text"
              id="new-cat-input"
              placeholder="Add new category (e.g. Kaftans)"
              className="flex-1 h-9 text-xs px-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val && !formData.categories.includes(val)) {
                    setFormData((prev) =>
                      prev ? { ...prev, categories: [...prev.categories, val] } : null
                    );
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const el = document.getElementById('new-cat-input') as HTMLInputElement;
                if (el && el.value.trim() && !formData.categories.includes(el.value.trim())) {
                  setFormData((prev) =>
                    prev ? { ...prev, categories: [...prev.categories, el.value.trim()] } : null
                  );
                  el.value = '';
                }
              }}
              className="text-xs"
            >
              Add
            </Button>
          </div>
        </div>
      )}

      {/* TAB 4: SEO & METADATA */}
      {activeTab === 'seo' && (
        <div className="bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">Search Engine Optimization</h3>
            <p className="text-xs text-[var(--color-slate)]">
              Configure search engine title, meta description, and social sharing metadata for /new-arrivals.
            </p>
          </div>

          <AdminFormField
            label="Meta Title"
            value={formData.seo?.metaTitle || ''}
            onChange={(v) =>
              setFormData((prev) =>
                prev ? { ...prev, seo: { ...prev.seo, metaTitle: v } } : null
              )
            }
            placeholder="New Arrivals | Fresh Indian Ethnic Wear | Angelika Fashions"
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
              Meta Description
            </label>
            <textarea
              rows={3}
              value={formData.seo?.metaDescription || ''}
              onChange={(e) =>
                setFormData((prev) =>
                  prev ? { ...prev, seo: { ...prev.seo, metaDescription: e.target.value } } : null
                )
              }
              className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
              placeholder="Discover the latest handcrafted ethnic wear arrivals at Angelika Fashions..."
            />
          </div>
        </div>
      )}

      {/* Bottom Sticky Action Footer */}
      <div className="sticky bottom-0 bg-[var(--color-white)]/95 backdrop-blur-sm border-t border-[var(--color-whisper)] p-3 rounded-b-xl flex items-center justify-between shadow-md">
        <div className="text-xs text-[var(--color-slate)]">
          Total Products: <span className="font-semibold text-[var(--color-ink)]">{formData.products.length}</span>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs">
              Cancel
            </Button>
          )}
          <Button
            variant="gold"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="text-xs min-w-[120px]"
          >
            {saving ? 'Saving Changes...' : saveSuccess ? '✓ Saved!' : 'Save All Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
