'use client';

import React, { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Package,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Star,
  Eye,
  Heart,
  RefreshCw,
  Sliders,
  Upload,
  Link as LinkIcon,
  Copy,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import { createProduct, updateProduct, deleteProduct } from '@/lib/actions/admin-products';
import type { AdminCategory } from '@/lib/actions/admin-products';
import { SHOP_COLORS } from '@/lib/actions/shop-types';

interface Props {
  initialProduct?: any;
  categories: AdminCategory[];
  isNew?: boolean;
}

export interface SizeVariantFormItem {
  id?: string;
  size: string;
  price: string;
  compareAtPrice: string;
  inventory: string;
  isActive?: boolean;
}

const COMMON_SIZES = ['Free Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

const PHOTO_PRESETS = [
  { label: 'Lucknowi Kurti', url: '/images/products/kurti-lucknowi-1.jpg' },
  { label: 'Modal Silk Kurti', url: '/images/products/kurti-modal-silk-1.jpg' },
  { label: 'Block Print Kurti', url: '/images/products/kurti-block-print-1.jpg' },
  { label: 'Velvet Kurti', url: '/images/products/kurti-velvet-1.jpg' },
  { label: 'Banarasi Saree', url: '/images/products/saree-banarasi-1.jpg' },
  { label: 'Kanjivaram Saree', url: '/images/products/saree-kanjivaram-1.jpg' },
  { label: 'Chanderi Saree', url: '/images/products/saree-chanderi-1.jpg' },
  { label: 'Organza Saree', url: '/images/products/saree-organza-1.jpg' },
  { label: 'Bridal Lehenga', url: '/images/products/lehenga-bridal-1.jpg' },
  { label: 'Velvet Lehenga', url: '/images/products/lehenga-velvet-1.jpg' },
  { label: 'Raw Silk Salwar', url: '/images/products/salwar-rawsilk-1.jpg' },
  { label: 'Angrakha Salwar', url: '/images/products/salwar-angrakha-1.jpg' },
  { label: 'Banarasi Dupatta', url: '/images/products/dupatta-banarasi-1.jpg' },
  { label: 'Phulkari Dupatta', url: '/images/products/dupatta-phulkari-1.jpg' },
];

const CANONICAL_FABRICS = [
  'Silk',
  'Cotton',
  'Georgette',
  'Organza',
  'Chiffon',
  'Velvet',
  'Chanderi',
  'Linen',
];

function extractInitialFabric(p: any): string {
  if (!p?.fabric) {
    if (Array.isArray(p?.tags)) {
      const match = CANONICAL_FABRICS.find((f) =>
        p.tags.some((t: string) => typeof t === 'string' && t.toLowerCase() === f.toLowerCase())
      );
      if (match) return match;
    }
    return '';
  }
  if (typeof p.fabric === 'string') return p.fabric;
  if (typeof p.fabric === 'object' && p.fabric !== null) {
    return p.fabric.name || p.fabric.fabric || p.fabric.material || '';
  }
  return '';
}

function extractInitialColors(p: any): string[] {
  if (!p) return [];
  const found = new Set<string>();

  const tags: string[] = p.tags || [];
  for (const t of tags) {
    if (typeof t !== 'string') continue;
    const lower = t.toLowerCase().trim();
    if (lower.startsWith('color:')) {
      const col = lower.replace('color:', '').trim();
      if (SHOP_COLORS.some((c) => c.value === col)) {
        found.add(col);
      }
    } else if (SHOP_COLORS.some((c) => c.value === lower)) {
      found.add(lower);
    }
  }

  if (p.fabric && typeof p.fabric === 'object' && Array.isArray((p.fabric as any).colors)) {
    (p.fabric as any).colors.forEach((c: string) => {
      const lower = String(c).toLowerCase().trim();
      if (SHOP_COLORS.some((sc) => sc.value === lower)) {
        found.add(lower);
      }
    });
  }

  if (Array.isArray(p.product_variants)) {
    p.product_variants.forEach((v: any) => {
      if (v.color) {
        const lower = String(v.color).toLowerCase().trim();
        if (SHOP_COLORS.some((sc) => sc.value === lower)) {
          found.add(lower);
        }
      }
    });
  }

  return Array.from(found);
}

export default function ProductFormClient({ initialProduct, categories, isNew = false }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [name, setName] = useState(initialProduct?.name || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [categoryId, setCategoryId] = useState(
    initialProduct?.category_id || categories[0]?.id || ''
  );
  const [fabric, setFabric] = useState<string>(() => extractInitialFabric(initialProduct));
  const [selectedColors, setSelectedColors] = useState<string[]>(() => extractInitialColors(initialProduct));
  const [description, setDescription] = useState(initialProduct?.description || '');

  // Calculate pricing & inventory from primary variant or product
  const initialPrice = initialProduct?.product_variants?.[0]?.price
    ? String(initialProduct.product_variants[0].price)
    : initialProduct?.price
      ? String(initialProduct.price)
      : '3999';

  const initialComparePrice = initialProduct?.product_variants?.[0]?.compare_at_price
    ? String(initialProduct.product_variants[0].compare_at_price)
    : initialProduct?.compare_at_price
      ? String(initialProduct.compare_at_price)
      : '4999';

  const totalVariantStock = initialProduct?.product_variants?.reduce(
    (sum: number, v: any) => sum + Number(v.inventory_quantity || 0),
    0
  );
  const initialInventory = totalVariantStock !== undefined && totalVariantStock > 0
    ? String(totalVariantStock)
    : initialProduct?.total_inventory !== undefined
      ? String(initialProduct.total_inventory)
      : '25';

  const [price, setPrice] = useState(initialPrice);
  const [compareAtPrice, setCompareAtPrice] = useState(initialComparePrice);
  const [inventory, setInventory] = useState(initialInventory);

  // Size variants with customized pricing per size
  const [sizeVariants, setSizeVariants] = useState<SizeVariantFormItem[]>(() => {
    if (initialProduct?.product_variants && initialProduct.product_variants.length > 0) {
      return initialProduct.product_variants.map((v: any) => ({
        id: v.id,
        size: v.size || 'Free Size',
        price: v.price !== null && v.price !== undefined ? String(v.price) : initialPrice,
        compareAtPrice: v.compare_at_price !== null && v.compare_at_price !== undefined ? String(v.compare_at_price) : (initialComparePrice || ''),
        inventory: v.inventory_quantity !== null && v.inventory_quantity !== undefined ? String(v.inventory_quantity) : '10',
        isActive: v.is_active ?? true,
      }));
    }
    // Default initial variants for new products (including Free Size + standard boutique sizes)
    return [
      { size: 'Free Size', price: initialPrice || '3999', compareAtPrice: initialComparePrice || '4999', inventory: '20' },
      { size: 'S', price: initialPrice || '3999', compareAtPrice: initialComparePrice || '4999', inventory: '15' },
      { size: 'M', price: initialPrice || '3999', compareAtPrice: initialComparePrice || '4999', inventory: '20' },
      { size: 'L', price: initialPrice || '3999', compareAtPrice: initialComparePrice || '4999', inventory: '15' },
      { size: 'XL', price: initialPrice || '4299', compareAtPrice: initialComparePrice || '5499', inventory: '10' },
    ];
  });

  const [customSizeInput, setCustomSizeInput] = useState('');
  const [defaultUnits, setDefaultUnits] = useState('15');

  const [isActive, setIsActive] = useState(initialProduct?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(initialProduct?.is_featured ?? false);
  const [isVidhyasPick, setIsVidhyasPick] = useState(initialProduct?.is_vidyas_pick ?? false);

  const initialImages: string[] =
    initialProduct?.product_images
      ?.sort((a: any, b: any) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.sort_order - b.sort_order)
      ?.map((img: any) => img.url) ||
    initialProduct?.images || [
      '/images/products/kurti-lucknowi-1.jpg',
    ];
  const [images, setImages] = useState<string[]>(initialImages);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const cleanInitialTags = (initialProduct?.tags || [])
    .filter((t: string) => typeof t === 'string' && !t.startsWith('return-days:'))
    .join(', ');

  const [tags, setTags] = useState(
    cleanInitialTags || (initialProduct ? '' : 'festive, handcrafted, luxury')
  );

  const [returnDays, setReturnDays] = useState<number>(() => {
    if (initialProduct?.return_window_days !== undefined) {
      return Number(initialProduct.return_window_days);
    }
    const returnTag = (initialProduct?.tags || []).find((t: string) => typeof t === 'string' && t.startsWith('return-days:'));
    if (returnTag) {
      const parsed = parseInt(returnTag.replace('return-days:', ''), 10);
      if (!isNaN(parsed)) return parsed;
    }
    return 7;
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleNameChange(val: string) {
    setName(val);
    if (isNew) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
      if (!sku) {
        const prefix = val
          .split(' ')
          .slice(0, 2)
          .map((w: string) => w.substring(0, 2).toUpperCase())
          .join('')
          .replace(/[^A-Z]/g, '') || 'GAR';
        setSku(`AF-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`);
      }
    }
  }

  function handleAutoSKU() {
    const prefix = name
      .split(' ')
      .slice(0, 2)
      .map((w: string) => w.substring(0, 2).toUpperCase())
      .join('')
      .replace(/[^A-Z]/g, '') || 'GAR';
    setSku(`AF-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`);
  }

  function toggleSize(sz: string) {
    const existingIndex = sizeVariants.findIndex(
      (v) => v.size.toLowerCase().trim() === sz.toLowerCase().trim()
    );
    if (existingIndex >= 0) {
      if (sizeVariants.length <= 1) {
        setErrorMessage('A product must have at least one size variant configured.');
        setTimeout(() => setErrorMessage(null), 3000);
        return;
      }
      setSizeVariants((prev) => prev.filter((_, i) => i !== existingIndex));
    } else {
      setSizeVariants((prev) => [
        ...prev,
        {
          size: sz,
          price: price || '3999',
          compareAtPrice: compareAtPrice || '',
          inventory: defaultUnits || '15',
          isActive: true,
        },
      ]);
    }
  }

  function addCustomSize() {
    const trimmed = customSizeInput.trim();
    if (!trimmed) return;
    const exists = sizeVariants.some(
      (v) => v.size.toLowerCase().trim() === trimmed.toLowerCase()
    );
    if (exists) {
      setErrorMessage(`Size "${trimmed}" is already added.`);
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    setSizeVariants((prev) => [
      ...prev,
      {
        size: trimmed,
        price: price || '3999',
        compareAtPrice: compareAtPrice || '',
        inventory: defaultUnits || '15',
        isActive: true,
      },
    ]);
    setCustomSizeInput('');
  }

  function stepVariantInventory(index: number, delta: number) {
    setSizeVariants((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        const current = parseInt(updated[index]!.inventory, 10) || 0;
        const next = Math.max(0, current + delta);
        updated[index] = { ...updated[index]!, inventory: String(next) };
      }
      return updated;
    });
  }

  function applyDefaultUnitsToAll() {
    if (!defaultUnits && defaultUnits !== '0') return;
    setSizeVariants((prev) =>
      prev.map((v) => ({
        ...v,
        inventory: defaultUnits,
      }))
    );
  }

  function removeVariant(index: number) {
    if (sizeVariants.length <= 1) {
      setErrorMessage('A product must have at least one size variant.');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    setSizeVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function handleVariantFieldChange(
    index: number,
    field: 'price' | 'compareAtPrice' | 'inventory',
    value: string
  ) {
    setSizeVariants((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index]!, [field]: value };
      }
      return updated;
    });
  }

  function applyBasePriceToAll() {
    if (!price) return;
    setSizeVariants((prev) =>
      prev.map((v) => ({
        ...v,
        price: price,
        compareAtPrice: compareAtPrice || v.compareAtPrice,
      }))
    );
  }

  const totalInventoryCalc = sizeVariants.reduce(
    (sum, v) => sum + (Number(v.inventory) || 0),
    0
  );
  const minPriceCalc = sizeVariants.length > 0
    ? Math.min(...sizeVariants.map((v) => Number(v.price) || 0))
    : Number(price) || 0;
  const maxPriceCalc = sizeVariants.length > 0
    ? Math.max(...sizeVariants.map((v) => Number(v.price) || 0))
    : Number(price) || 0;

  function addImage(urlToAdd?: string) {
    const targetUrl = urlToAdd || newImageUrl;
    if (!targetUrl.trim()) return;
    if (!images.includes(targetUrl.trim())) {
      setImages([...images, targetUrl.trim()]);
    }
    if (!urlToAdd) setNewImageUrl('');
  }

  function removeImage(index: number) {
    setImages(images.filter((_, i) => i !== index));
  }

  function setAsPrimary(index: number) {
    if (index === 0 || !images[index]) return;
    const target = images[index]!;
    const rest = images.filter((_, i) => i !== index);
    setImages([target, ...rest]);
  }

  function updateImagePath(index: number, newPath: string) {
    const updated = [...images];
    updated[index] = newPath;
    setImages(updated);
  }

  function moveImage(index: number, direction: 'left' | 'right') {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(index, 1);
    if (moved) {
      updated.splice(targetIndex, 0, moved);
      setImages(updated);
    }
  }

  function copyImagePath(path: string, index: number) {
    if (typeof window !== 'undefined' && navigator?.clipboard) {
      navigator.clipboard.writeText(path);
      setCopiedIdx(index);
      setTimeout(() => setCopiedIdx(null), 2000);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMessage(null);

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/products/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }

        if (data.url && !images.includes(data.url) && !newUrls.includes(data.url)) {
          newUrls.push(data.url);
        }
      }

      if (newUrls.length > 0) {
        setImages((prev) => [...prev, ...newUrls]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  function handleDeleteProduct() {
    if (!confirm('Are you sure you want to permanently delete this garment? This action cannot be undone.')) {
      return;
    }
    setDeleting(true);
    startTransition(async () => {
      const res = await deleteProduct(initialProduct.id);
      if (res?.error) {
        setErrorMessage(res.error || 'Failed to delete product');
        setDeleting(false);
      } else {
        router.push('/admin/products');
      }
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setErrorMessage('Product name and URL slug are required.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const tagList = tags
      .split(',')
      .map((t: string) => t.trim())
      .filter(Boolean);

    const formattedVariants = sizeVariants.map((v) => ({
      id: v.id,
      size: v.size.trim(),
      price: Number(v.price) || 0,
      compare_at_price: v.compareAtPrice ? Number(v.compareAtPrice) : null,
      inventory_quantity: Number(v.inventory) || 0,
      is_active: v.isActive ?? true,
    }));

    const minPrice = formattedVariants.length > 0
      ? Math.min(...formattedVariants.map((v) => v.price))
      : Number(price) || 0;

    const totalStock = formattedVariants.reduce(
      (sum, v) => sum + (v.inventory_quantity || 0),
      0
    );

    startTransition(async () => {
      try {
        if (isNew) {
          const res = await createProduct({
            name: name.trim(),
            slug: slug.trim(),
            sku: sku.trim() || undefined,
            category_id: categoryId,
            description: description.trim(),
            fabric: fabric.trim() || undefined,
            colors: selectedColors,
            price: minPrice,
            compare_at_price: compareAtPrice ? Number(compareAtPrice) : undefined,
            inventory_quantity: totalStock,
            is_active: isActive,
            is_featured: isFeatured,
            is_vidyas_pick: isVidhyasPick,
            images,
            tags: tagList,
            return_window_days: returnDays,
            sizes: formattedVariants.map((v) => v.size),
            variants: formattedVariants,
          });

          if (!res.success) {
            setErrorMessage(res.error || 'Failed to create product');
            setSaving(false);
            return;
          }

          setSavedSuccess(true);
          setTimeout(() => {
            router.push('/admin/products');
          }, 1000);
        } else {
          const res = await updateProduct(initialProduct.id, {
            name: name.trim(),
            slug: slug.trim(),
            sku: sku.trim() || undefined,
            category_id: categoryId,
            description: description.trim(),
            fabric: fabric.trim() || undefined,
            colors: selectedColors,
            price: minPrice,
            compare_at_price: compareAtPrice ? Number(compareAtPrice) : undefined,
            inventory_quantity: totalStock,
            is_active: isActive,
            is_featured: isFeatured,
            is_vidyas_pick: isVidhyasPick,
            images,
            tags: tagList,
            return_window_days: returnDays,
            sizes: formattedVariants.map((v) => v.size),
            variants: formattedVariants,
          });

          if (!res.success) {
            setErrorMessage(res.error || 'Failed to update product');
            setSaving(false);
            return;
          }

          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 3000);
          setSaving(false);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'An unexpected error occurred');
        setSaving(false);
      }
    });
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl border border-[var(--color-whisper,#E5E5E5)] hover:bg-[var(--color-snow,#F9F9F9)] text-[var(--color-slate,#666666)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-medium text-[var(--color-ink,#111111)]" style={{ fontFamily: 'var(--font-display)' }}>
                {isNew ? 'Create New Product' : `Edit: ${name || 'Product'}`}
              </h1>
              <AdminSectionInfo
                title="Product Catalog Editor"
                purpose="Manage luxury handcrafted garments, inventory variants, pricing tiers, and promotional badges. Writes directly to products, product_variants, and product_images tables in Supabase."
                storefrontImpact="Changes propagate live to the /shop catalog, specific category page, search autocomplete, product detail page (/product/[slug]), and checkout cart drawer."
                targets={[
                  { name: 'Shop Catalog', path: '/shop', description: 'Product grid card & filters' },
                  { name: "Vidhya's Picks", path: '/vidhyas-picks', description: 'Curated designer collection' },
                  ...(!isNew && slug ? [{ name: 'Live Product Page', path: `/product/${slug}`, description: 'Storefront PDP' }] : []),
                ]}
              />
            </div>
            <p className="text-xs text-[var(--color-slate,#666666)] mt-0.5">
              {isNew ? 'Define pricing, sizing, imagery, and category assignments' : `ID: ${initialProduct?.id}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {!isNew && slug && (
            <a
              href={`/product/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-whisper,#E5E5E5)] text-xs font-medium text-[var(--color-slate,#666666)] hover:text-[var(--color-gold,#C9A84C)] hover:bg-white transition-colors"
            >
              <span>View Live PDP</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {!isNew && (
            <button
              type="button"
              onClick={handleDeleteProduct}
              disabled={deleting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition-colors"
              title="Delete product"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleting ? 'Deleting...' : 'Delete'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 bg-[var(--color-gold,#C9A84C)] text-white rounded-xl px-5 py-2.5 font-medium text-sm hover:opacity-90 shadow-sm transition-opacity disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center gap-1.5">
                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                Saving to Database...
              </span>
            ) : savedSuccess ? (
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                Saved Successfully!
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Save className="w-4 h-4" />
                {isNew ? 'Publish Garment' : 'Save Changes'}
              </span>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-[var(--color-ink,#111111)] flex items-center gap-2">
              <Package className="w-4 h-4 text-[var(--color-gold,#C9A84C)]" />
              General Information
            </h2>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
                Product Title *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Royal Indigo Pure Raw Silk Straight Suit"
                required
                className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
                  URL Slug *
                </label>
                <div className="flex items-center rounded-xl border border-[var(--color-whisper,#E5E5E5)] bg-[var(--color-snow,#F9F9F9)] overflow-hidden">
                  <span className="px-3 text-xs text-[var(--color-mist,#999999)] select-none">/product/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="royal-indigo-straight-suit"
                    required
                    className="w-full bg-transparent py-2.5 pr-3 text-xs font-mono focus:outline-none text-[var(--color-ink,#111111)]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[var(--color-slate,#666666)]">
                    SKU Code *
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoSKU}
                    className="text-[11px] text-[var(--color-gold,#C9A84C)] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Auto
                  </button>
                </div>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="AF-RAW-2041"
                  required
                  className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
                Description &amp; Craftsmanship Details
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe fabric weaving, zari work, embroidery, fit, and styling recommendations..."
                className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
              />
            </div>
          </div>

          {/* Sizes & Customized Pricing Matrix */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--color-whisper,#E5E5E5)] pb-4">
              <div>
                <h2 className="text-base font-semibold text-[var(--color-ink,#111111)] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--color-gold,#C9A84C)]" />
                  Sizes &amp; Customized Pricing Matrix
                </h2>
                <p className="text-xs text-[var(--color-slate,#666666)] mt-0.5">
                  Configure available sizes (including Free Size) and assign customized selling prices, MRP, and stock inventory for each.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-gold,#C9A84C)]/10 text-[var(--color-gold,#C9A84C)] border border-[var(--color-gold,#C9A84C)]/25">
                  <Package className="w-3.5 h-3.5" />
                  {sizeVariants.length} {sizeVariants.length === 1 ? 'Size Variant' : 'Sizes Configured'}
                </span>
                <span className="text-xs text-[var(--color-slate,#666666)] font-mono">
                  Total Stock: <strong className="text-[var(--color-ink,#111111)]">{totalInventoryCalc}</strong> units
                </span>
              </div>
            </div>

            {/* Quick Size Selector Chips */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[var(--color-slate,#666666)]">
                  Available Sizes (Click to toggle in/out of matrix)
                </label>
                <span className="text-[11px] text-[var(--color-mist,#999999)] font-normal">
                  Standard garments or luxury Free Size
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {COMMON_SIZES.map((sz) => {
                  const matchedVariant = sizeVariants.find(
                    (v) => v.size.toLowerCase().trim() === sz.toLowerCase().trim()
                  );
                  const isSelected = Boolean(matchedVariant);
                  const isFreeSize = sz.toLowerCase() === 'free size';
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSize(sz)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${isSelected
                          ? isFreeSize
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                            : 'bg-[var(--color-gold,#C9A84C)] text-white border-[var(--color-gold,#C9A84C)] shadow-sm'
                          : 'bg-[var(--color-snow,#F9F9F9)] text-[var(--color-slate,#666666)] border-[var(--color-whisper,#E5E5E5)] hover:border-[var(--color-gold,#C9A84C)]/50'
                        }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{sz}</span>
                      {isSelected && (
                        <span className="text-[10px] bg-black/20 text-white font-mono px-1.5 py-0.5 rounded-md ml-0.5 font-bold">
                          {matchedVariant?.inventory || '0'} units
                        </span>
                      )}
                      {isFreeSize && !isSelected && (
                        <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          Boutique
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Size Addition */}
            <div className="p-3 bg-[var(--color-snow,#F9F9F9)] rounded-xl border border-[var(--color-whisper,#E5E5E5)] flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="flex-1">
                <input
                  type="text"
                  value={customSizeInput}
                  onChange={(e) => setCustomSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomSize();
                    }
                  }}
                  placeholder="Add custom size (e.g. Semi-Stitched, 4XL, Custom Fit, Petit)..."
                  className="w-full bg-white border border-[var(--color-whisper,#E5E5E5)] rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
                />
              </div>
              <button
                type="button"
                onClick={addCustomSize}
                disabled={!customSizeInput.trim()}
                className="px-4 py-2 rounded-lg bg-[var(--color-ink,#111111)] text-white text-xs font-semibold hover:bg-[var(--color-gold,#C9A84C)] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Size</span>
              </button>
            </div>

            {/* Dedicated Units for Each Selected Size - Quick Interactive Grid */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink,#111111)]">
                    Units in Stock for Each Selected Size *
                  </label>
                  <p className="text-[11px] text-[var(--color-slate,#666666)]">
                    Specify the exact number of units available for each selected size. Out of stock sizes (0 units) are automatically disabled on the storefront.
                  </p>
                </div>
                <span className="text-xs font-mono text-[var(--color-slate,#666666)] bg-[var(--color-snow,#F9F9F9)] px-2.5 py-1 rounded-lg border border-[var(--color-whisper,#E5E5E5)] shadow-xs self-start sm:self-auto">
                  Total: <strong className="text-[var(--color-ink,#111111)]">{totalInventoryCalc}</strong> units across {sizeVariants.length} sizes
                </span>
              </div>

              {sizeVariants.length === 0 ? (
                <div className="p-6 text-center rounded-xl border border-dashed border-amber-300 bg-amber-50/50">
                  <Package className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-70" />
                  <p className="text-xs font-medium text-amber-900">No sizes currently selected.</p>
                  <p className="text-[11px] text-amber-700/80 mt-0.5">
                    Click any size chip above (e.g. Free Size, S, M, L) to add it and configure its inventory units.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sizeVariants.map((variant, index) => {
                    const unitsNum = parseInt(variant.inventory, 10) || 0;
                    const isOutOfStock = unitsNum <= 0;
                    const isCritical = unitsNum > 0 && unitsNum <= 3;
                    const isLow = unitsNum > 3 && unitsNum <= 10;
                    const isFree = variant.size.toLowerCase().trim() === 'free size';

                    return (
                      <div
                        key={variant.size + '-' + index}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isOutOfStock
                            ? 'bg-rose-50/40 border-rose-200'
                            : isCritical
                            ? 'bg-orange-50/40 border-orange-200'
                            : 'bg-white border-[var(--color-whisper,#E5E5E5)] hover:border-[var(--color-gold,#C9A84C)] shadow-xs'
                        }`}
                      >
                        {/* Size Header & Status Pill */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                                isFree
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-[var(--color-ink,#111111)] text-white'
                              }`}
                            >
                              {variant.size}
                            </span>
                            {isOutOfStock ? (
                              <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                                Out of Stock
                              </span>
                            ) : isCritical ? (
                              <span className="text-[10px] font-semibold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded">
                                Critical (≤3)
                              </span>
                            ) : isLow ? (
                              <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                Low Stock
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                In Stock
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            disabled={sizeVariants.length <= 1}
                            title={sizeVariants.length <= 1 ? 'Minimum 1 size required' : `Remove size ${variant.size}`}
                            className="p-1 text-[var(--color-mist,#999999)] hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Units Stepper & Input Field */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-medium text-[var(--color-slate,#666666)]">
                            Available Units / Stock *
                          </label>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => stepVariantInventory(index, -1)}
                              disabled={unitsNum <= 0}
                              className="w-7 h-7 rounded-lg border border-[var(--color-whisper,#E5E5E5)] bg-[var(--color-snow,#F9F9F9)] hover:bg-gray-100 flex items-center justify-center text-[var(--color-ink,#111111)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-bold text-xs"
                              title="Decrease units by 1"
                            >
                              -
                            </button>
                            <div className="relative flex-1">
                              <input
                                type="number"
                                min={0}
                                required
                                value={variant.inventory}
                                onChange={(e) => handleVariantFieldChange(index, 'inventory', e.target.value)}
                                placeholder="0"
                                className="w-full text-center font-mono font-bold text-xs py-1.5 px-2 rounded-lg border border-[var(--color-whisper,#E5E5E5)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => stepVariantInventory(index, 1)}
                              className="w-7 h-7 rounded-lg border border-[var(--color-whisper,#E5E5E5)] bg-[var(--color-snow,#F9F9F9)] hover:bg-gray-100 flex items-center justify-center text-[var(--color-ink,#111111)] transition-colors font-bold text-xs"
                              title="Increase units by 1"
                            >
                              +
                            </button>
                            <span className="text-[11px] font-medium text-[var(--color-slate,#666666)] select-none">
                              units
                            </span>
                          </div>
                        </div>

                        {/* Selling Price for this size */}
                        <div className="mt-2.5 pt-2 border-t border-[var(--color-whisper,#E5E5E5)] flex items-center justify-between text-xs">
                          <span className="text-[11px] text-[var(--color-slate,#666666)]">Price:</span>
                          <div className="relative max-w-[110px]">
                            <span className="absolute left-2 top-1 text-[10px] text-[var(--color-mist,#999999)]">₹</span>
                            <input
                              type="number"
                              min={0}
                              value={variant.price}
                              onChange={(e) => handleVariantFieldChange(index, 'price', e.target.value)}
                              placeholder="3999"
                              className="w-full text-right font-mono text-xs pl-5 pr-2 py-0.5 rounded border border-[var(--color-whisper,#E5E5E5)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold,#C9A84C)]"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Base Price & Stock Sync Template Bar */}
            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold text-amber-950 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-700" />
                    Base Price &amp; Stock Sync Template
                  </h3>
                  <p className="text-[11px] text-amber-800/80">
                    Use these values as default template, or batch-update all selected sizes in one click.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={applyBasePriceToAll}
                    className="px-3 py-1.5 bg-amber-700 text-white rounded-lg text-xs font-medium hover:bg-amber-800 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Apply Price to All</span>
                  </button>
                  <button
                    type="button"
                    onClick={applyDefaultUnitsToAll}
                    className="px-3 py-1.5 bg-[var(--color-ink,#111111)] text-white rounded-lg text-xs font-medium hover:bg-[var(--color-gold,#C9A84C)] transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Apply Units to All Sizes</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-amber-950 mb-1">
                    Base Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="3999"
                    min={0}
                    className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-950 mb-1">
                    Base MRP / Compare at (₹)
                  </label>
                  <input
                    type="number"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    placeholder="4999"
                    min={0}
                    className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-950 mb-1">
                    Default Units per Size
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={defaultUnits}
                      onChange={(e) => setDefaultUnits(e.target.value)}
                      placeholder="15"
                      min={0}
                      className="w-full bg-white border border-amber-200 rounded-lg pl-3 pr-12 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    />
                    <span className="absolute right-3 top-2 text-[11px] text-amber-900/60 font-mono">
                      units
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customized Pricing Table */}
            <div className="overflow-x-auto border border-[var(--color-whisper,#E5E5E5)] rounded-xl">
              <table className="w-full text-left border-collapse min-w-[620px]">
                <thead>
                  <tr className="bg-[var(--color-snow,#F9F9F9)] border-b border-[var(--color-whisper,#E5E5E5)] text-[11px] font-semibold text-[var(--color-slate,#666666)] uppercase tracking-wider">
                    <th className="py-3 px-4">Size Variant</th>
                    <th className="py-3 px-4">Selling Price (₹) *</th>
                    <th className="py-3 px-4">MRP / Compare at (₹)</th>
                    <th className="py-3 px-4 text-center">Discount</th>
                    <th className="py-3 px-4">Stock (Units) *</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-whisper,#E5E5E5)] text-xs">
                  {sizeVariants.map((variant, index) => {
                    const vPrice = Number(variant.price) || 0;
                    const vCompare = Number(variant.compareAtPrice) || 0;
                    const discountPercent =
                      vCompare > vPrice && vCompare > 0
                        ? Math.round(((vCompare - vPrice) / vCompare) * 100)
                        : 0;
                    const isFree = variant.size.toLowerCase().trim() === 'free size';

                    return (
                      <tr key={variant.size + '-' + index} className="hover:bg-amber-50/20 transition-colors">
                        {/* Size Badge */}
                        <td className="py-3 px-4 font-semibold text-[var(--color-ink,#111111)]">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${isFree
                                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                                  : 'bg-[var(--color-snow,#F9F9F9)] text-[var(--color-ink,#111111)] border-[var(--color-whisper,#E5E5E5)]'
                                }`}
                            >
                              {variant.size}
                            </span>
                            {isFree && (
                              <span className="text-[10px] text-amber-700 font-medium hidden sm:inline">
                                (One size fits all)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Customized Price Input */}
                        <td className="py-3 px-4">
                          <div className="relative max-w-[140px]">
                            <span className="absolute left-2.5 top-2 text-[var(--color-mist,#999999)] text-xs">₹</span>
                            <input
                              type="number"
                              value={variant.price}
                              onChange={(e) => handleVariantFieldChange(index, 'price', e.target.value)}
                              placeholder="3999"
                              min={0}
                              required
                              className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-lg pl-6 pr-2 py-1.5 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
                            />
                          </div>
                        </td>

                        {/* Customized MRP Input */}
                        <td className="py-3 px-4">
                          <div className="relative max-w-[140px]">
                            <span className="absolute left-2.5 top-2 text-[var(--color-mist,#999999)] text-xs">₹</span>
                            <input
                              type="number"
                              value={variant.compareAtPrice}
                              onChange={(e) => handleVariantFieldChange(index, 'compareAtPrice', e.target.value)}
                              placeholder="4999"
                              min={0}
                              className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-lg pl-6 pr-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
                            />
                          </div>
                        </td>

                        {/* Discount Pill */}
                        <td className="py-3 px-4 text-center">
                          {discountPercent > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {discountPercent}% OFF
                            </span>
                          ) : (
                            <span className="text-[11px] text-[var(--color-mist,#999999)] font-mono">—</span>
                          )}
                        </td>

                        {/* Stock Input */}
                        <td className="py-3 px-4">
                          <div className="max-w-[100px]">
                            <input
                              type="number"
                              value={variant.inventory}
                              onChange={(e) => handleVariantFieldChange(index, 'inventory', e.target.value)}
                              placeholder="10"
                              min={0}
                              required
                              className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
                            />
                          </div>
                        </td>

                        {/* Delete Action */}
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            disabled={sizeVariants.length <= 1}
                            title={sizeVariants.length <= 1 ? 'Minimum 1 size required' : 'Remove size'}
                            className="p-1.5 text-[var(--color-slate,#666666)] hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Matrix Summary Stats */}
            <div className="p-3.5 bg-[var(--color-snow,#F9F9F9)] rounded-xl border border-[var(--color-whisper,#E5E5E5)] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[var(--color-slate,#666666)]">Storefront Price Display: </span>
                  <strong className="text-[var(--color-ink,#111111)] font-mono">
                    {minPriceCalc === maxPriceCalc
                      ? `₹${minPriceCalc.toLocaleString()}`
                      : `₹${minPriceCalc.toLocaleString()} – ₹${maxPriceCalc.toLocaleString()}`}
                  </strong>
                </div>
                <div className="hidden sm:block text-[var(--color-whisper,#E5E5E5)]">|</div>
                <div>
                  <span className="text-[var(--color-slate,#666666)]">Total Units Available: </span>
                  <strong className="text-[var(--color-ink,#111111)] font-mono">{totalInventoryCalc}</strong>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>Sizes &amp; customized prices update in real-time</span>
              </div>
            </div>
          </div>

          {/* Media & Photography */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-[var(--color-ink,#111111)] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[var(--color-gold,#C9A84C)]" />
                  Product Photography ({images.length} {images.length === 1 ? 'image' : 'images'})
                </h2>
                <p className="text-xs text-[var(--color-slate,#666666)] mt-0.5">
                  First image is the primary cover photo. View/edit file paths below, or add via link and device upload.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPresets(!showPresets)}
                className="text-xs text-[var(--color-gold,#C9A84C)] font-medium hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <Sliders className="w-3.5 h-3.5" />
                {showPresets ? 'Hide Curated Library' : 'Pick from Curated Library'}
              </button>
            </div>

            {/* Presets Grid */}
            {showPresets && (
              <div className="p-3 bg-[var(--color-snow,#F9F9F9)] rounded-xl border border-[var(--color-whisper,#E5E5E5)] space-y-2">
                <p className="text-xs text-[var(--color-slate,#666666)] font-medium">Click to append image to product gallery:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PHOTO_PRESETS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => addImage(preset.url)}
                      className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-[var(--color-whisper,#E5E5E5)] hover:border-[var(--color-gold,#C9A84C)] text-left group"
                    >
                      <img src={preset.url} alt={preset.label} className="w-7 h-7 rounded object-cover" />
                      <span className="text-[11px] text-[var(--color-ink,#111111)] font-medium truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Images Gallery with Visible Paths */}
            {images.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-[var(--color-whisper,#E5E5E5)] rounded-2xl text-center space-y-2">
                <ImageIcon className="w-8 h-8 text-[var(--color-slate,#666666)]/40 mx-auto" />
                <p className="text-sm font-medium text-[var(--color-ink,#111111)]">No product images attached</p>
                <p className="text-xs text-[var(--color-slate,#666666)]">Add images via local device upload or paste a link/path below.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[var(--color-slate,#666666)] uppercase tracking-wider">
                    Existing Image Paths & Positions
                  </label>
                  <span className="text-[11px] text-[var(--color-slate,#666666)]">
                    Editable direct paths (relative or HTTPS)
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {images.map((url, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border transition-all ${idx === 0
                          ? 'bg-amber-50/50 border-[var(--color-gold,#C9A84C)] shadow-xs'
                          : 'bg-[var(--color-snow,#F9F9F9)] border-[var(--color-whisper,#E5E5E5)] hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Thumbnail */}
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--color-whisper,#E5E5E5)] bg-white flex-shrink-0 group">
                          <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-[var(--color-gold,#C9A84C)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                              Cover
                            </span>
                          )}
                        </div>

                        {/* Path & Controls */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-semibold text-[var(--color-ink,#111111)]">
                              {idx === 0 ? 'Primary Cover Photo' : `Gallery Shot #${idx + 1}`}
                            </span>
                            <div className="flex items-center gap-1">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(idx, 'left')}
                                  title="Move earlier"
                                  className="p-1 rounded text-gray-500 hover:text-black hover:bg-white"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {idx < images.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(idx, 'right')}
                                  title="Move later"
                                  className="p-1 rounded text-gray-500 hover:text-black hover:bg-white"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                title="Remove image"
                                className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Editable Path Input + Copy */}
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={url}
                              onChange={(e) => updateImagePath(idx, e.target.value)}
                              title="Direct image path or URL"
                              className="w-full bg-white border border-[var(--color-whisper,#E5E5E5)] rounded-lg px-2.5 py-1 text-xs font-mono text-[var(--color-ink,#111111)] focus:outline-none focus:border-[var(--color-gold,#C9A84C)] truncate"
                            />
                            <button
                              type="button"
                              onClick={() => copyImagePath(url, idx)}
                              className="p-1.5 rounded-lg border border-[var(--color-whisper,#E5E5E5)] bg-white text-gray-600 hover:text-black text-xs flex-shrink-0"
                              title="Copy image path to clipboard"
                            >
                              {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => setAsPrimary(idx)}
                              className="text-[11px] font-medium text-[var(--color-gold,#C9A84C)] hover:underline inline-flex items-center gap-1"
                            >
                              ★ Set as Primary Cover
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dual Add Methods: Link & Local Upload */}
            <div className="pt-3 border-t border-[var(--color-whisper,#E5E5E5)] space-y-3">
              <label className="text-xs font-semibold text-[var(--color-slate,#666666)] uppercase tracking-wider block">
                Add New Photography (via Link or Upload from Local Device)
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Method 1: Upload from Local Device */}
                <div className="p-4 rounded-xl border-2 border-dashed border-[var(--color-whisper,#E5E5E5)] hover:border-[var(--color-gold,#C9A84C)] bg-[var(--color-snow,#F9F9F9)]/70 transition-all flex flex-col items-center justify-center text-center group cursor-pointer relative min-h-[100px]">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/avif,image/svg+xml,image/gif"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <Loader2 className="w-6 h-6 text-[var(--color-gold,#C9A84C)] animate-spin" />
                      <span className="text-xs font-medium text-[var(--color-ink,#111111)]">Uploading image from device...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 py-1">
                      <div className="w-9 h-9 rounded-full bg-[var(--color-gold,#C9A84C)]/10 text-[var(--color-gold,#C9A84C)] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[var(--color-ink,#111111)] group-hover:text-[var(--color-gold,#C9A84C)]">
                          Upload from Local Device
                        </span>
                        <p className="text-[11px] text-[var(--color-slate,#666666)] mt-0.5">
                          Click or drag & drop (JPG, PNG, WebP)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Method 2: Add via Link / Path */}
                <div className="p-4 rounded-xl border border-[var(--color-whisper,#E5E5E5)] bg-white flex flex-col justify-between gap-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-ink,#111111)]">
                    <LinkIcon className="w-3.5 h-3.5 text-[var(--color-gold,#C9A84C)]" />
                    <span>Add via Image Link / URL</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addImage();
                        }
                      }}
                      placeholder="/images/products/saree-banarasi-1.jpg or https://..."
                      className="flex-1 border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => addImage()}
                      className="px-3.5 py-2 bg-[var(--color-gold,#C9A84C)] hover:bg-[var(--color-gold,#C9A84C)]/90 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1 flex-shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Link
                    </button>
                  </div>
                  <span className="text-[10px] text-[var(--color-slate,#666666)]">
                    Supports relative paths (e.g. <code>/images/products/...</code>) and full HTTPS web links.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col) - Organization & Badges */}
        <div className="space-y-6">
          {/* Organization */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-[var(--color-ink,#111111)]">Organization</h2>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
                Ethnic Wear Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)] bg-white text-[var(--color-ink,#111111)]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Fabric / Material Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[var(--color-slate,#666666)]">
                  Fabric / Material
                </label>
                {fabric && (
                  <button
                    type="button"
                    onClick={() => setFabric('')}
                    className="text-[11px] text-[var(--color-slate,#666666)] hover:text-red-500 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <input
                type="text"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                placeholder="e.g. Silk, Pure Chanderi, Georgette"
                className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
              />
              {/* Quick Select Fabric Pills */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {CANONICAL_FABRICS.map((f) => {
                  const isSelected = fabric.trim().toLowerCase() === f.toLowerCase();
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFabric(isSelected ? '' : f)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        isSelected
                          ? 'bg-[var(--color-gold,#C9A84C)] text-white border-[var(--color-gold,#C9A84C)] font-medium shadow-sm'
                          : 'bg-[var(--color-snow,#F9F9F9)] text-[var(--color-ink,#111111)] border-[var(--color-whisper,#E5E5E5)] hover:border-[var(--color-gold,#C9A84C)]'
                      }`}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-[var(--color-slate,#666666)] mt-1.5">
                Syncs directly with storefront fabric filters (/shop) and product care info.
              </p>
            </div>

            {/* Color Palette Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[var(--color-slate,#666666)]">
                  Color Palette {selectedColors.length > 0 && <span className="text-[var(--color-gold,#C9A84C)] font-normal">({selectedColors.length} selected)</span>}
                </label>
                {selectedColors.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedColors([])}
                    className="text-[11px] text-[var(--color-slate,#666666)] hover:text-red-500 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 p-2.5 rounded-xl border border-[var(--color-whisper,#E5E5E5)] bg-[var(--color-snow,#F9F9F9)]">
                {SHOP_COLORS.map((col) => {
                  const isSelected = selectedColors.includes(col.value);
                  return (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => {
                        setSelectedColors((prev) =>
                          isSelected ? prev.filter((c) => c !== col.value) : [...prev, col.value]
                        );
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs transition-all ${
                        isSelected
                          ? 'bg-white border-[var(--color-gold,#C9A84C)] shadow-sm font-medium text-[var(--color-ink,#111111)] ring-1 ring-[var(--color-gold,#C9A84C)]/30'
                          : 'bg-white/80 border-[var(--color-whisper,#E5E5E5)] text-[var(--color-slate,#666666)] hover:border-gray-300'
                      }`}
                      title={col.label}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                        style={
                          col.color.includes('gradient')
                            ? { background: col.color }
                            : { backgroundColor: col.color }
                        }
                      />
                      <span>{col.label}</span>
                      {isSelected && <span className="text-[10px] text-[var(--color-gold,#C9A84C)] font-bold">✓</span>}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-[var(--color-slate,#666666)] mt-1.5">
                Select one or more colors. Powers storefront color filter swatches and search.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="festive, silk, banarasi, embroidered"
                className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
              />
            </div>
          </div>

          {/* Visibility & Badges */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-[var(--color-ink,#111111)]">Badges &amp; Status</h2>

            {/* Active Toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-[var(--color-ink,#111111)] flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-green-600" /> Published
                </p>
                <p className="text-xs text-[var(--color-slate,#666666)]">Visible on live storefront</p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-[var(--color-gold,#C9A84C)]' : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center justify-between py-1 border-t border-[var(--color-whisper,#E5E5E5)] pt-3">
              <div>
                <p className="text-sm font-medium text-[var(--color-ink,#111111)] flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500" /> Featured
                </p>
                <p className="text-xs text-[var(--color-slate,#666666)]">Featured product (appears first in its category)</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isFeatured ? 'bg-[var(--color-gold,#C9A84C)]' : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isFeatured ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>

            {/* Vidhya's Pick */}
            <div className="flex items-center justify-between py-1 border-t border-[var(--color-whisper,#E5E5E5)] pt-3">
              <div>
                <p className="text-sm font-medium text-[var(--color-ink,#111111)] flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-red-500" /> Vidhya&apos;s Pick
                </p>
                <p className="text-xs text-[var(--color-slate,#666666)]">Curated designer collection</p>
              </div>
              <button
                type="button"
                onClick={() => setIsVidhyasPick(!isVidhyasPick)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isVidhyasPick ? 'bg-[var(--color-gold,#C9A84C)]' : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isVidhyasPick ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          </div>

          {/* Return Window & Policy Card */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-semibold text-[var(--color-ink,#111111)] flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[var(--color-gold,#C9A84C)]" />
                Return Window &amp; Policy
              </h2>
              <p className="text-xs text-[var(--color-slate,#666666)] mt-0.5">
                Number of days customers can return or exchange this product after delivery
              </p>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-2">
                Return Period Presets
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { days: 0, label: 'Non-Returnable' },
                  { days: 7, label: '7 Days (Std)' },
                  { days: 10, label: '10 Days' },
                  { days: 14, label: '14 Days' },
                  { days: 15, label: '15 Days' },
                  { days: 30, label: '30 Days' },
                ].map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => setReturnDays(preset.days)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                      returnDays === preset.days
                        ? 'border-[var(--color-gold,#C9A84C)] bg-amber-50 text-amber-950 font-bold ring-1 ring-[var(--color-gold,#C9A84C)]'
                        : 'border-[var(--color-whisper,#E5E5E5)] text-[var(--color-ink,#111111)] hover:bg-slate-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
                Custom Return Period (Days)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={returnDays}
                  onChange={(e) => setReturnDays(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="7"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-whisper,#E5E5E5)] text-sm text-[var(--color-ink,#111111)] focus:outline-none focus:border-[var(--color-gold,#C9A84C)] focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/20"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--color-slate,#666666)] pointer-events-none">
                  days after delivery
                </span>
              </div>
            </div>

            {/* Policy Explanatory Note */}
            <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
              returnDays === 0
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              {returnDays === 0 ? (
                <>
                  <p className="font-bold mb-0.5">⚠️ Final Sale (Non-Returnable)</p>
                  <p className="text-[11px] opacity-90">
                    Customers will see &quot;Non-Returnable&quot; on the product page. The return button will be completely hidden from their order details after purchase.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold mb-0.5">✓ Returnable within {returnDays} days</p>
                  <p className="text-[11px] opacity-90">
                    Customers can request a doorstep return or size exchange for up to {returnDays} days following order delivery. Once {returnDays} days pass, the return button automatically disappears from their order.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
