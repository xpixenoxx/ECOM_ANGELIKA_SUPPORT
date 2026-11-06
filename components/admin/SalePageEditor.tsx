'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type { SalePageContent, SaleProductItemPage, SaleEventItem, SalePolicyItem } from '@/lib/actions/site-content-types';

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
      formData.append('category', 'sale');

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
              placeholder="/images/sale-1.jpg or https://..."
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

export function SalePageEditor({
  onCancel,
  onSaved,
}: {
  onCancel?: () => void;
  onSaved?: () => void;
}) {
  const [formData, setFormData] = useState<SalePageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'header' | 'events' | 'policies' | 'seo'>('products');
  const [expandedProductIndex, setExpandedProductIndex] = useState<number | null>(0);
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [discountFilter, setDiscountFilter] = useState('All');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const json = await res.json();
          if (json.content && json.content['sale-page']) {
            setFormData(json.content['sale-page']);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load sale-page content:', err);
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
          sectionId: 'sale-page',
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
      console.error('Error saving sale-page:', err);
      alert('Error saving content. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProduct = (index: number, field: keyof SaleProductItemPage, value: any) => {
    if (!formData) return;
    setFormData((prev) => {
      if (!prev) return prev;
      const updated = [...prev.products];
      const target = { ...updated[index], [field]: value } as SaleProductItemPage;

      if (field === 'price' || field === 'originalPrice') {
        const price = Number(field === 'price' ? value : target.price);
        const orig = Number(field === 'originalPrice' ? value : target.originalPrice);
        if (orig > price && price > 0) {
          target.discount = Math.round(((orig - price) / orig) * 100);
          if (target.discount >= 50) {
            target.isFinalSale = true;
          }
        }
      }

      if (field === 'discount') {
        const disc = Number(value);
        if (disc >= 50) {
          target.isFinalSale = true;
        }
      }

      updated[index] = target;
      return { ...prev, products: updated };
    });
  };

  const handleAddProduct = () => {
    if (!formData) return;
    const newId = `sale-${Date.now().toString().slice(-4)}`;
    const newProduct: SaleProductItemPage = {
      id: newId,
      slug: 'sale-handcrafted-piece',
      name: 'New Handcrafted Sale Piece',
      price: 3499,
      originalPrice: 6999,
      image: '/images/sale-1.jpg',
      color: 'Crimson',
      colorHex: '#DC143C',
      category: 'Sarees',
      discount: 50,
      isFinalSale: true,
      inStock: true,
      lowStock: false,
    };

    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        products: [newProduct, ...prev.products],
      };
    });
    setExpandedProductIndex(0);
  };

  const handleDeleteProduct = (index: number) => {
    if (!formData) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to remove "${formData.products[index]?.name || 'this product'}" from the Sale page?`
    );
    if (!confirmDelete) return;

    setFormData((prev) => {
      if (!prev) return prev;
      const updated = prev.products.filter((_, i) => i !== index);
      return { ...prev, products: updated };
    });
  };

  const handleDuplicateProduct = (index: number) => {
    if (!formData) return;
    const original = formData.products[index];
    if (!original) return;
    const duplicate: SaleProductItemPage = {
      ...original,
      id: `sale-${Date.now().toString().slice(-4)}`,
      name: `${original.name} (Copy)`,
      slug: `${original.slug || 'sale-product'}-copy`,
    };

    setFormData((prev) => {
      if (!prev) return prev;
      const updated = [...prev.products];
      updated.splice(index + 1, 0, duplicate);
      return { ...prev, products: updated };
    });
    setExpandedProductIndex(index + 1);
  };

  const handleMoveProduct = (index: number, direction: 'up' | 'down') => {
    if (!formData) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formData.products.length) return;

    setFormData((prev) => {
      if (!prev) return prev;
      const updated = [...prev.products];
      const current = updated[index];
      const target = updated[targetIndex];
      if (!current || !target) return prev;
      updated[index] = target;
      updated[targetIndex] = current;
      return { ...prev, products: updated };
    });
    setExpandedProductIndex(targetIndex);
  };

  // Events management
  const handleUpdateEvent = (index: number, field: keyof SaleEventItem, value: any) => {
    if (!formData) return;
    setFormData((prev) => {
      if (!prev) return prev;
      const updatedEvents = [...prev.events];
      const current = updatedEvents[index];
      if (!current) return prev;
      updatedEvents[index] = { ...current, [field]: value } as SaleEventItem;
      return { ...prev, events: updatedEvents };
    });
  };

  // Policies management
  const handleUpdatePolicy = (index: number, field: keyof SalePolicyItem, value: any) => {
    if (!formData) return;
    setFormData((prev) => {
      if (!prev) return prev;
      const updatedPolicies = [...(prev.policies || [])];
      const current = updatedPolicies[index];
      if (!current) return prev;
      updatedPolicies[index] = { ...current, [field]: value } as SalePolicyItem;
      return { ...prev, policies: updatedPolicies };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-[var(--color-slate)]">
        <div className="w-5 h-5 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin mr-3" />
        Loading Sale Page Content...
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="p-8 text-center text-sm text-[var(--color-error)]">
        Failed to load content for the Sale page. Please refresh or check server logs.
      </div>
    );
  }

  const productsList = formData.products || [];
  const totalSavings = productsList.reduce((sum, p) => sum + (Math.max(0, p.originalPrice - p.price)), 0);
  const finalSaleCount = productsList.filter(p => p.isFinalSale).length;
  const inStockCount = productsList.filter(p => p.inStock).length;

  const filteredProducts = productsList.map((product, originalIndex) => ({ product, originalIndex })).filter(({ product }) => {
    if (categoryFilter !== 'All' && product.category !== categoryFilter) return false;
    if (discountFilter === 'Up to 30% Off' && product.discount > 30) return false;
    if (discountFilter === '30-50% Off' && (product.discount <= 30 || product.discount >= 50)) return false;
    if (discountFilter === '50%+ Off' && product.discount < 50) return false;
    if (discountFilter === 'Final Sale' && !product.isFinalSale) return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      const matchName = product.name?.toLowerCase().includes(q);
      const matchCat = product.category?.toLowerCase().includes(q);
      const matchColor = product.color?.toLowerCase().includes(q);
      const matchSlug = product.slug?.toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchColor && !matchSlug) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-[var(--color-whisper)] bg-gradient-to-r from-[var(--color-white)] to-[var(--color-snow)] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[var(--color-error)] text-white uppercase tracking-wider">
              Sale Storefront
            </span>
            <span className="text-xs text-[var(--color-slate)]">/sale</span>
          </div>
          <h2 className="text-xl font-bold text-[var(--color-ink)]">
            Sale Page Manager
          </h2>
          <p className="text-xs text-[var(--color-slate)] mt-0.5">
            Manage seasonal markdowns, promotional event cards, discount tiers, and real-time product inventory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sale"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] hover:border-[var(--color-gold)] transition-colors shadow-2xs"
          >
            <span>Preview Live</span>
            <svg className="w-3.5 h-3.5 text-[var(--color-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
          <Button
            variant="gold"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="shadow-sm font-semibold"
          >
            {saving ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Save All Changes'
            )}
          </Button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-[var(--color-whisper)] bg-[var(--color-white)] rounded-t-xl px-2 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('products')}
          className={cn(
            'px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2',
            activeTab === 'products'
              ? 'border-[var(--color-gold)] text-[var(--color-gold)] font-bold'
              : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)]'
          )}
        >
          <span>Sale Catalog</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-[var(--color-gold-light)] text-[var(--color-gold)] font-bold">
            {productsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('header')}
          className={cn(
            'px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2',
            activeTab === 'header'
              ? 'border-[var(--color-gold)] text-[var(--color-gold)] font-bold'
              : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)]'
          )}
        >
          <span>Hero Banner</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={cn(
            'px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2',
            activeTab === 'events'
              ? 'border-[var(--color-gold)] text-[var(--color-gold)] font-bold'
              : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)]'
          )}
        >
          <span>Promo Event Cards</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-[var(--color-whisper)] text-[var(--color-slate)]">
            {formData.events?.length || 3}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('policies')}
          className={cn(
            'px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2',
            activeTab === 'policies'
              ? 'border-[var(--color-gold)] text-[var(--color-gold)] font-bold'
              : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)]'
          )}
        >
          <span>Policies & Tiers</span>
        </button>

        <button
          onClick={() => setActiveTab('seo')}
          className={cn(
            'px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2',
            activeTab === 'seo'
              ? 'border-[var(--color-gold)] text-[var(--color-gold)] font-bold'
              : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)]'
          )}
        >
          <span>SEO & Metadata</span>
        </button>
      </div>

      {/* TAB 1: PRODUCTS CATALOG */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Metrics summary ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)]">
              <span className="block text-[11px] font-medium text-[var(--color-slate)]">Total Products</span>
              <span className="text-lg font-bold text-[var(--color-ink)]">{productsList.length}</span>
            </div>
            <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50">
              <span className="block text-[11px] font-medium text-emerald-800">Total Customer Savings</span>
              <span className="text-lg font-bold text-emerald-700">₹{totalSavings.toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)]">
              <span className="block text-[11px] font-medium text-[var(--color-slate)]">In Stock</span>
              <span className="text-lg font-bold text-[var(--color-ink)]">{inStockCount}</span>
            </div>
            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50">
              <span className="block text-[11px] font-medium text-amber-800">Final Sale Items</span>
              <span className="text-lg font-bold text-amber-700">{finalSaleCount}</span>
            </div>
          </div>

          {/* Catalog Controls Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)]">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  placeholder="Search sale products by title, color, category..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full h-9 pl-8 pr-3 text-xs rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                />
                <svg className="w-4 h-4 text-[var(--color-slate)] absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 text-xs px-2.5 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>

              <select
                value={discountFilter}
                onChange={(e) => setDiscountFilter(e.target.value)}
                className="h-9 text-xs px-2.5 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
              >
                <option value="All">All Discounts</option>
                <option value="Up to 30% Off">Up to 30% Off</option>
                <option value="30-50% Off">30–50% Off</option>
                <option value="50%+ Off">50%+ Off</option>
                <option value="Final Sale">Final Sale Only</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleAddProduct}
              className="text-xs font-semibold border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold-light)]/20 whitespace-nowrap"
            >
              + Add Sale Product
            </Button>
          </div>

          {/* Product Cards List */}
          <div className="space-y-3">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[var(--color-whisper)] rounded-xl bg-[var(--color-snow)]/50">
                <p className="text-sm text-[var(--color-slate)]">No sale products match your filter.</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setProductSearch(''); setCategoryFilter('All'); setDiscountFilter('All'); }}
                  className="mt-2 text-xs text-[var(--color-gold)]"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              filteredProducts.map(({ product, originalIndex }) => {
                const isExpanded = expandedProductIndex === originalIndex;
                const savings = Math.max(0, (product.originalPrice || 0) - (product.price || 0));

                return (
                  <div
                    key={product.id || originalIndex}
                    className={cn(
                      'rounded-xl border transition-all duration-200 overflow-hidden bg-[var(--color-white)]',
                      isExpanded
                        ? 'border-[var(--color-gold)] shadow-md ring-1 ring-[var(--color-gold)]/20'
                        : 'border-[var(--color-whisper)] hover:border-[var(--color-gold)]/50 shadow-2xs'
                    )}
                  >
                    {/* Collapsed Bar / Card Header */}
                    <div
                      onClick={() => setExpandedProductIndex(isExpanded ? null : originalIndex)}
                      className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none bg-[var(--color-white)] hover:bg-[var(--color-snow)]/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Index Number Badge */}
                        <span className="w-6 h-6 rounded-full bg-[var(--color-snow)] border border-[var(--color-whisper)] text-[11px] font-bold text-[var(--color-slate)] flex items-center justify-center flex-shrink-0">
                          {originalIndex + 1}
                        </span>

                        {/* Image Thumbnail */}
                        <div className="w-10 h-13 rounded-md overflow-hidden bg-[var(--color-snow)] border border-[var(--color-whisper)] flex-shrink-0 relative">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-[var(--color-mist)]">
                              None
                            </div>
                          )}
                        </div>

                        {/* Title and details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold text-[var(--color-ink)] truncate max-w-[200px] sm:max-w-xs">
                              {product.name || 'Untitled Product'}
                            </h4>
                            <span className="text-[10px] font-semibold text-[var(--color-gold)] bg-[var(--color-gold-light)]/40 px-1.5 py-0.5 rounded uppercase tracking-wider">
                              {product.category}
                            </span>
                            {product.discount > 0 && (
                              <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                -{product.discount}%
                              </span>
                            )}
                            {product.isFinalSale && (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                                FINAL SALE
                              </span>
                            )}
                            {product.lowStock && (
                              <span className="text-[10px] font-semibold border border-amber-400 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                ONLY 2 LEFT
                              </span>
                            )}
                            {!product.inStock && (
                              <span className="text-[10px] font-semibold bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
                                Out of Stock
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--color-slate)]">
                            <span className="flex items-center gap-1 font-medium">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                                style={{ backgroundColor: product.colorHex || '#ccc' }}
                              />
                              {product.color}
                            </span>
                            <span>•</span>
                            <span className="font-bold text-[var(--color-ink)]">
                              ₹{(product.price || 0).toLocaleString()}
                            </span>
                            {product.originalPrice > product.price && (
                              <span className="line-through text-[var(--color-mist)]">
                                ₹{product.originalPrice.toLocaleString()}
                              </span>
                            )}
                            {savings > 0 && (
                              <span className="text-emerald-700 font-semibold text-[10px]">
                                Save ₹{savings.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          disabled={originalIndex === 0}
                          onClick={() => handleMoveProduct(originalIndex, 'up')}
                          className="p-1 rounded hover:bg-[var(--color-snow)] text-[var(--color-slate)] disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move up"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          disabled={originalIndex === productsList.length - 1}
                          onClick={() => handleMoveProduct(originalIndex, 'down')}
                          className="p-1 rounded hover:bg-[var(--color-snow)] text-[var(--color-slate)] disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move down"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateProduct(originalIndex)}
                          className="p-1 rounded hover:bg-[var(--color-snow)] text-[var(--color-slate)]"
                          title="Duplicate item"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(originalIndex)}
                          className="p-1 rounded hover:bg-red-50 text-red-500"
                          title="Delete item"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => setExpandedProductIndex(isExpanded ? null : originalIndex)}
                          className="p-1 rounded hover:bg-[var(--color-snow)] text-[var(--color-slate)] ml-1"
                        >
                          <svg
                            className={cn('w-4 h-4 transition-transform duration-200', isExpanded && 'rotate-180')}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Expanded Edit Form */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 border-t border-[var(--color-whisper)] bg-[var(--color-snow)]/20">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                          {/* Photo Uploader */}
                          <div className="lg:col-span-4">
                            <ProductImageUploader
                              image={product.image}
                              title={product.name}
                              onChange={(url) => handleUpdateProduct(originalIndex, 'image', url)}
                            />
                          </div>

                          {/* Fields */}
                          <div className="lg:col-span-8 space-y-4">
                            {/* Row 1: Title & Slug */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <AdminFormField
                                label="Product Title"
                                value={product.name}
                                onChange={(val) => handleUpdateProduct(originalIndex, 'name', val)}
                                placeholder="e.g. Lehengas Chanderi Lehenga Set"
                              />
                              <AdminFormField
                                label="URL Slug"
                                value={product.slug}
                                onChange={(val) => handleUpdateProduct(originalIndex, 'slug', val)}
                                placeholder="e.g. banarasi-tissue-saree"
                                helperText="Links to /product/[slug]"
                              />
                            </div>

                            {/* Row 2: Category, Color Name, Color Hex */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                                  Category
                                </label>
                                <select
                                  value={product.category}
                                  onChange={(e) => handleUpdateProduct(originalIndex, 'category', e.target.value)}
                                  className="w-full h-10 text-xs px-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                                >
                                  {CATEGORY_OPTIONS.filter((c) => c !== 'All').map((cat) => (
                                    <option key={cat} value={cat}>
                                      {cat}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <AdminFormField
                                label="Color Name"
                                value={product.color}
                                onChange={(val) => handleUpdateProduct(originalIndex, 'color', val)}
                                placeholder="e.g. Rose, Charcoal, Ivory"
                              />

                              <div className="space-y-1">
                                <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                                  Color Swatch (Hex)
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={product.colorHex || '#DC143C'}
                                    onChange={(e) => handleUpdateProduct(originalIndex, 'colorHex', e.target.value)}
                                    className="w-10 h-10 p-0.5 rounded-lg border border-[var(--color-whisper)] cursor-pointer bg-white"
                                  />
                                  <input
                                    type="text"
                                    value={product.colorHex}
                                    onChange={(e) => handleUpdateProduct(originalIndex, 'colorHex', e.target.value)}
                                    placeholder="#DC143C"
                                    className="flex-1 h-10 text-xs px-2 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] uppercase font-mono"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Quick color preset chips */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] text-[var(--color-slate)] mr-1">Presets:</span>
                              {PRESET_COLORS.map((c) => (
                                <button
                                  key={c.name}
                                  type="button"
                                  onClick={() => {
                                    handleUpdateProduct(originalIndex, 'color', c.name);
                                    handleUpdateProduct(originalIndex, 'colorHex', c.hex);
                                  }}
                                  className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-[var(--color-whisper)] hover:border-[var(--color-gold)] bg-white transition-colors"
                                >
                                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: c.hex }} />
                                  <span>{c.name}</span>
                                </button>
                              ))}
                            </div>

                            {/* Row 3: Prices, Discount & Savings */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)]">
                              <AdminFormField
                                label="Sale Price (₹)"
                                type="number"
                                prefix="₹"
                                value={product.price}
                                onChange={(val) => handleUpdateProduct(originalIndex, 'price', Number(val))}
                              />
                              <AdminFormField
                                label="Original Price (₹)"
                                type="number"
                                prefix="₹"
                                value={product.originalPrice}
                                onChange={(val) => handleUpdateProduct(originalIndex, 'originalPrice', Number(val))}
                              />
                              <AdminFormField
                                label="Discount (%)"
                                type="number"
                                prefix="%"
                                value={product.discount}
                                onChange={(val) => handleUpdateProduct(originalIndex, 'discount', Number(val))}
                              />
                              <div className="space-y-1">
                                <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                                  Customer Savings
                                </label>
                                <div className="h-10 flex items-center px-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                                  Save ₹{savings.toLocaleString()}
                                </div>
                              </div>
                            </div>

                            {/* Row 4: Merchandising & Inventory Toggles */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)]">
                              <label className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={product.inStock}
                                  onChange={(e) => handleUpdateProduct(originalIndex, 'inStock', e.target.checked)}
                                  className="w-4 h-4 rounded text-[var(--color-gold)] border-[var(--color-whisper)] focus:ring-[var(--color-gold)]"
                                />
                                <div>
                                  <span className="block text-xs font-semibold text-[var(--color-ink)]">In Stock</span>
                                  <span className="block text-[10px] text-[var(--color-slate)]">Available for purchase</span>
                                </div>
                              </label>

                              <label className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={product.isFinalSale}
                                  onChange={(e) => handleUpdateProduct(originalIndex, 'isFinalSale', e.target.checked)}
                                  className="w-4 h-4 rounded text-amber-600 border-[var(--color-whisper)] focus:ring-amber-500"
                                />
                                <div>
                                  <span className="block text-xs font-semibold text-[var(--color-ink)]">Final Sale</span>
                                  <span className="block text-[10px] text-[var(--color-slate)]">Non-returnable (50%+ off)</span>
                                </div>
                              </label>

                              <label className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={product.lowStock}
                                  onChange={(e) => handleUpdateProduct(originalIndex, 'lowStock', e.target.checked)}
                                  className="w-4 h-4 rounded text-red-600 border-[var(--color-whisper)] focus:ring-red-500"
                                />
                                <div>
                                  <span className="block text-xs font-semibold text-[var(--color-ink)]">Low Stock</span>
                                  <span className="block text-[10px] text-[var(--color-slate)]">Displays "Only 2 Left" tag</span>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: HERO BANNER */}
      {activeTab === 'header' && (
        <div className="p-6 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-white)] space-y-5">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Hero Banner Content</h3>
            <p className="text-xs text-[var(--color-slate)]">
              Configure the top headline, promotional subtext, and shipping threshold badges.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminFormField
              label="Hero Pill Badge"
              value={formData.header.badge}
              onChange={(val) =>
                setFormData((prev) => prev && { ...prev, header: { ...prev.header, badge: val } })
              }
              placeholder="e.g. SALE ON NOW"
            />
            <AdminFormField
              label="Highlight Word"
              value={formData.header.titleHighlight}
              onChange={(val) =>
                setFormData((prev) => prev && { ...prev, header: { ...prev.header, titleHighlight: val } })
              }
              placeholder="e.g. Sale (styled in luxury gold font)"
            />
          </div>

          <AdminFormField
            label="Main Title"
            value={formData.header.title}
            onChange={(val) =>
              setFormData((prev) => prev && { ...prev, header: { ...prev.header, title: val } })
            }
            placeholder="e.g. Seasonal Sale"
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[var(--color-ink)]">
              Hero Description Subtext
            </label>
            <textarea
              rows={3}
              value={formData.header.description}
              onChange={(e) =>
                setFormData((prev) => prev && { ...prev, header: { ...prev.header, description: e.target.value } })
              }
              className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
              placeholder="Up to 65% off on handcrafted ethnic wear..."
            />
          </div>

          <AdminFormField
            label="Free Shipping Threshold Text"
            value={formData.header.freeShippingThresholdText}
            onChange={(val) =>
              setFormData((prev) =>
                prev && { ...prev, header: { ...prev.header, freeShippingThresholdText: val } }
              )
            }
            placeholder="e.g. Free shipping on orders ₹2,999+"
          />
        </div>
      )}

      {/* TAB 3: PROMO EVENT CARDS */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-white)]">
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Promotional Event Boxes</h3>
            <p className="text-xs text-[var(--color-slate)] mt-0.5">
              These 3 cards appear on the right side of the hero section on desktop with countdown timers and event links.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(formData.events || []).map((event, index) => (
              <div
                key={index}
                className="p-5 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-white)] shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[var(--color-whisper)] pb-2.5">
                  <span className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-wider">
                    Event Box #{index + 1}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--color-snow)] text-[var(--color-slate)]">
                    {event.badge || 'PROMO'}
                  </span>
                </div>

                <AdminFormField
                  label="Badge Tag"
                  value={event.badge}
                  onChange={(val) => handleUpdateEvent(index, 'badge', val)}
                  placeholder="e.g. ENDS SOON, FINAL DAYS, ARCHIVE"
                />

                <AdminFormField
                  label="Event Title"
                  value={event.title}
                  onChange={(val) => handleUpdateEvent(index, 'title', val)}
                  placeholder="e.g. End of Season Sale"
                />

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--color-ink)]">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={event.description}
                    onChange={(e) => handleUpdateEvent(index, 'description', e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                    placeholder="Up to 60% off selected styles..."
                  />
                </div>

                <AdminFormField
                  label="End Date / Countdown (YYYY-MM-DD)"
                  value={event.endDate}
                  onChange={(val) => handleUpdateEvent(index, 'endDate', val)}
                  placeholder="2026-02-15"
                  helperText="Drives the live countdown timer on the storefront"
                />

                <AdminFormField
                  label="Target Link"
                  value={event.link}
                  onChange={(val) => handleUpdateEvent(index, 'link', val)}
                  placeholder="/sale?event=end-of-season-sale"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: POLICIES & DISCOUNT TIERS */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          {/* Discount Categories */}
          <div className="p-5 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-white)] space-y-3">
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Discount Filter Tiers</h3>
            <p className="text-xs text-[var(--color-slate)]">
              These pills appear above the product catalog allowing shoppers to filter by discount depth.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {(formData.categories || []).map((cat, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--color-gold-light)]/40 text-[var(--color-gold)] border border-[var(--color-gold)]/20"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Storefront Policies */}
          <div className="p-5 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-white)] space-y-4">
            <div className="border-b border-[var(--color-whisper)] pb-3">
              <h3 className="text-sm font-bold text-[var(--color-ink)]">Bottom Storefront Policy Highlights</h3>
              <p className="text-xs text-[var(--color-slate)]">
                The 3 reassurance boxes shown at the bottom of the Sale page.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(formData.policies || []).map((policy, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-snow)]/30 space-y-3">
                  <AdminFormField
                    label={`Policy #${idx + 1} Title`}
                    value={policy.title}
                    onChange={(val) => handleUpdatePolicy(idx, 'title', val)}
                    placeholder="e.g. Final Sale Policy"
                  />
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--color-ink)]">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={policy.description}
                      onChange={(e) => handleUpdatePolicy(idx, 'description', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SEO & METADATA */}
      {activeTab === 'seo' && (
        <div className="p-6 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-white)] space-y-5">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Search Engine Optimization (SEO)</h3>
            <p className="text-xs text-[var(--color-slate)]">
              Manage title tags, meta descriptions, and search snippet previews for Google.
            </p>
          </div>

          <div className="space-y-4">
            <AdminFormField
              label="Meta Title Tag"
              value={formData.seo?.metaTitle}
              onChange={(val) =>
                setFormData((prev) => prev && { ...prev, seo: { ...prev.seo, metaTitle: val } })
              }
              placeholder="Seasonal Sale - Up to 65% Off Handcrafted Ethnic Wear | Angelika"
              helperText={`${formData.seo?.metaTitle?.length || 0}/60 characters recommended`}
            />

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--color-ink)]">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={formData.seo?.metaDescription}
                onChange={(e) =>
                  setFormData((prev) => prev && { ...prev, seo: { ...prev.seo, metaDescription: e.target.value } })
                }
                className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                placeholder="Shop luxury handcrafted ethnic wear at seasonal markdowns..."
              />
              <p className="text-[10px] text-[var(--color-slate)]">
                {formData.seo?.metaDescription?.length || 0}/160 characters recommended
              </p>
            </div>

            {/* Google SERP Preview Card */}
            <div className="mt-4 p-4 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)]/30 space-y-1">
              <span className="text-[10px] font-bold text-[var(--color-slate)] uppercase tracking-wider block mb-2">
                Google Search Result Preview
              </span>
              <div className="text-[11px] text-emerald-800">https://angelika.in/sale</div>
              <div className="text-base text-blue-700 font-medium hover:underline cursor-pointer">
                {formData.seo?.metaTitle || 'Seasonal Sale | Angelika'}
              </div>
              <p className="text-xs text-[var(--color-slate)] line-clamp-2">
                {formData.seo?.metaDescription || 'Discover handcrafted luxury ethnic wear at seasonal markdowns.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Actions Bar */}
      <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 p-4 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-white)]/95 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fadeIn">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Sale Page updated successfully!
            </span>
          )}
          {!saveSuccess && (
            <span className="text-xs text-[var(--color-slate)]">
              {productsList.length} products on sale • Total savings: ₹{totalSavings.toLocaleString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="text-xs font-semibold"
            >
              Close Editor
            </Button>
          )}
          <Button
            variant="gold"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="shadow-sm font-semibold"
          >
            {saving ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Saving Changes...
              </span>
            ) : (
              'Save All Changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

