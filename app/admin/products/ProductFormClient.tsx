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
} from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import { createProduct, updateProduct } from '@/lib/actions/admin-products';
import type { AdminCategory } from '@/lib/actions/admin-products';

interface Props {
  initialProduct?: any;
  categories: AdminCategory[];
  isNew?: boolean;
}

export default function ProductFormClient({ initialProduct, categories, isNew = false }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [name, setName] = useState(initialProduct?.name || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [categoryId, setCategoryId] = useState(
    initialProduct?.category_id || categories[0]?.id || ''
  );
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [price, setPrice] = useState(
    initialProduct?.product_variants?.[0]?.price
      ? String(initialProduct.product_variants[0].price)
      : initialProduct?.price
      ? String(initialProduct.price)
      : '3999'
  );
  const [compareAtPrice, setCompareAtPrice] = useState(
    initialProduct?.product_variants?.[0]?.compare_at_price
      ? String(initialProduct.product_variants[0].compare_at_price)
      : initialProduct?.compare_at_price
      ? String(initialProduct.compare_at_price)
      : '4999'
  );
  const [inventory, setInventory] = useState(
    initialProduct?.product_variants?.[0]?.inventory_quantity !== undefined
      ? String(initialProduct.product_variants[0].inventory_quantity)
      : '25'
  );

  const [isActive, setIsActive] = useState(initialProduct?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(initialProduct?.is_featured ?? false);
  const [isVidhyasPick, setIsVidhyasPick] = useState(initialProduct?.is_vidyas_pick ?? false);

  const initialImages: string[] =
    initialProduct?.product_images?.map((img: any) => img.url) ||
    initialProduct?.images || [
      '/images/products/kurti-lucknowi-1.jpg',
    ];
  const [images, setImages] = useState<string[]>(initialImages);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [tags, setTags] = useState(
    initialProduct?.tags?.join(', ') || 'festive, handcrafted, pure cotton'
  );

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleNameChange(val: string) {
    setName(val);
    if (isNew) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  }

  function addImage() {
    if (!newImageUrl.trim()) return;
    setImages([...images, newImageUrl.trim()]);
    setNewImageUrl('');
  }

  function removeImage(index: number) {
    setImages(images.filter((_, i) => i !== index));
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
      .map((t) => t.trim())
      .filter(Boolean);

    startTransition(async () => {
      try {
        if (isNew) {
          const res = await createProduct({
            name: name.trim(),
            slug: slug.trim(),
            category_id: categoryId,
            description: description.trim(),
            price: Number(price) || 0,
            compare_at_price: compareAtPrice ? Number(compareAtPrice) : undefined,
            inventory_quantity: Number(inventory) || 0,
            is_active: isActive,
            is_featured: isFeatured,
            is_vidyas_pick: isVidhyasPick,
            images,
            tags: tagList,
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
            category_id: categoryId,
            description: description.trim(),
            price: Number(price) || 0,
            compare_at_price: compareAtPrice ? Number(compareAtPrice) : undefined,
            is_active: isActive,
            is_featured: isFeatured,
            is_vidyas_pick: isVidhyasPick,
            images,
            tags: tagList,
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
                  { name: 'Vidhya\'s Picks', path: '/vidhyas-picks', description: 'Curated designer collection' },
                  ...(!isNew && slug ? [{ name: 'Live Product Page', path: `/product/${slug}`, description: 'Storefront PDP' }] : []),
                ]}
              />
            </div>
            <p className="text-xs text-[var(--color-slate,#666666)] mt-0.5">
              {isNew ? 'Define pricing, imagery, and category assignments' : `ID: ${initialProduct?.id}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
                {isNew ? 'Publish Product' : 'Save Changes'}
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

            <div>
              <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
                URL Slug * (auto-generated)
              </label>
              <div className="flex items-center rounded-xl border border-[var(--color-whisper,#E5E5E5)] bg-[var(--color-snow,#F9F9F9)] overflow-hidden">
                <span className="px-3.5 text-xs text-[var(--color-mist,#999999)] select-none">/product/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="royal-indigo-pure-raw-silk-straight-suit"
                  required
                  className="w-full bg-transparent py-2.5 pr-3 text-sm font-mono focus:outline-none text-[var(--color-ink,#111111)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
                Description &amp; Craftsmanship
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe fabric weaving, zari work, embroidery, and fit details..."
                className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
              />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-[var(--color-ink,#111111)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--color-gold,#C9A84C)]" />
              Pricing &amp; Stock
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="3999"
                  required
                  min={0}
                  className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
                  Compare at Price / MRP (₹)
                </label>
                <input
                  type="number"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  placeholder="4999"
                  min={0}
                  className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
                  Available Stock (Units)
                </label>
                <input
                  type="number"
                  value={inventory}
                  onChange={(e) => setInventory(e.target.value)}
                  placeholder="25"
                  min={0}
                  className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
                />
              </div>
            </div>
          </div>

          {/* Media & Images */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-[var(--color-ink,#111111)] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[var(--color-gold,#C9A84C)]" />
              Product Photography ({images.length} images)
            </h2>

            {/* Thumbnail Previews */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((url, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-[var(--color-whisper,#E5E5E5)] bg-[var(--color-snow,#F9F9F9)] aspect-square">
                  <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-[var(--color-gold,#C9A84C)] text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Image input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Paste image path or URL (e.g. /images/products/kurti-1.jpg)"
                className="flex-1 border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-2 bg-[var(--color-snow,#F9F9F9)] border border-[var(--color-whisper,#E5E5E5)] hover:border-[var(--color-gold,#C9A84C)] rounded-xl text-xs font-medium text-[var(--color-ink,#111111)] transition-colors"
              >
                + Add Image
              </button>
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
                className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)] bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
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
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isActive ? 'bg-[var(--color-gold,#C9A84C)]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    isActive ? 'translate-x-6' : 'translate-x-1'
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
                <p className="text-xs text-[var(--color-slate,#666666)]">Spotlight on Homepage</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isFeatured ? 'bg-[var(--color-gold,#C9A84C)]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    isFeatured ? 'translate-x-6' : 'translate-x-1'
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
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isVidhyasPick ? 'bg-[var(--color-gold,#C9A84C)]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    isVidhyasPick ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
