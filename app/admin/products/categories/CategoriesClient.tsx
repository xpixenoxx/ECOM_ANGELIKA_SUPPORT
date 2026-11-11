'use client';

import React, { useState, useRef, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Check,
  X,
  Package,
  Layers,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import {
  createCategory,
  updateCategory,
  toggleCategoryActive,
  deleteCategory,
} from '@/lib/actions/admin-products';
import type { AdminCategory } from '@/lib/actions/admin-products';

interface Props {
  initialCategories: AdminCategory[];
}

const EMPTY_CATEGORY = {
  name: '',
  slug: '',
  description: '',
  image_url: '/images/collection-kurtis.jpg',
  is_active: true,
};

export default function CategoriesClient({ initialCategories }: Props) {
  const [, startTransition] = useTransition();
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [form, setForm] = useState({ ...EMPTY_CATEGORY });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  async function uploadSelectedFile(file: File) {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target', 'category');

      const res = await fetch('/api/admin/content/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }

      if (data.url) {
        setForm((f) => ({ ...f, image_url: data.url }));
      }
    } catch (err: any) {
      console.error('Category image upload failed:', err);
      // Fallback to local Data URL so the user is never blocked
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setForm((f) => ({ ...f, image_url: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
      setUploadError(err.message ? `Note: ${err.message}` : null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      uploadSelectedFile(file);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadSelectedFile(file);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            uploadSelectedFile(file);
            return;
          }
        }
      }
    }
    const text = e.clipboardData?.getData('text');
    if (text && (text.startsWith('http') || text.startsWith('/') || text.startsWith('data:image'))) {
      setForm((f) => ({ ...f, image_url: text.trim() }));
    }
  }

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditingCategory(null);
    setForm({ ...EMPTY_CATEGORY });
    setUploadError(null);
    setIsUploading(false);
    setShowModal(true);
  }

  function openEdit(c: AdminCategory) {
    setEditingCategory(c);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      image_url: c.image_url || '/images/collection-kurtis.jpg',
      is_active: c.is_active,
    });
    setUploadError(null);
    setIsUploading(false);
    setShowModal(true);
  }

  function handleNameChange(name: string) {
    setForm((f) => ({
      ...f,
      name,
      // Auto-generate slug if creating new
      slug: !editingCategory
        ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : f.slug,
    }));
  }

  function handleSave() {
    if (!form.name.trim() || !form.slug.trim()) return;
    setSaving(true);

    startTransition(async () => {
      if (editingCategory) {
        const res = await updateCategory(editingCategory.id, {
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim(),
          image_url: form.image_url.trim(),
          is_active: form.is_active,
        });
        if (res.success) {
          setCategories((prev) =>
            prev.map((c) =>
              c.id === editingCategory.id
                ? {
                    ...c,
                    name: form.name.trim(),
                    slug: form.slug.trim(),
                    description: form.description.trim(),
                    image_url: form.image_url.trim(),
                    is_active: form.is_active,
                  }
                : c
            )
          );
        }
      } else {
        const res = await createCategory({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim(),
          image_url: form.image_url.trim(),
          is_active: form.is_active,
        });
        if (res.success && res.data) {
          setCategories((prev) => [...prev, { ...res.data, product_count: 0 }]);
        }
      }
      setSaving(false);
      setShowModal(false);
    });
  }

  function handleToggle(id: string, current: boolean) {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: !current } : c))
    );
    startTransition(async () => {
      await toggleCategoryActive(id, !current);
    });
  }

  function handleDelete(c: AdminCategory) {
    if (c.product_count && c.product_count > 0) {
      alert(`Cannot delete category "${c.name}" because it contains ${c.product_count} active products. Please reassign those products first.`);
      return;
    }
    if (!confirm(`Delete category "${c.name}"? This action cannot be undone.`)) return;

    setDeletingId(c.id);
    startTransition(async () => {
      const res = await deleteCategory(c.id);
      if (res.error) {
        alert(`Error deleting category: ${res.error}`);
      } else {
        setCategories((prev) => prev.filter((cat) => cat.id !== c.id));
      }
      setDeletingId(null);
    });
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium text-[var(--color-ink,#111111)]" style={{ fontFamily: 'var(--font-display)' }}>
              Product Categories
            </h1>
            <AdminSectionInfo
              title="Categories Architecture"
              purpose="Manage primary ethnic wear categories (Kurtis, Salwars, Lehengas, Sarees, Dupattas). Controls catalog taxonomy, sorting order, and active storefront visibility."
              storefrontImpact="Categories power the Storefront Mega-Menus, the Category Grid on the Homepage, the Shop filter pills, and dynamic collection pages like /shop/[category]."
              targets={[
                { name: 'Shop All Catalog', path: '/shop', description: 'Filter pills and breadcrumbs' },
                { name: 'Kurtis Collection', path: '/shop/kurtis', description: 'Specific category catalog page' },
                { name: 'Homepage Collections Grid', path: '/', description: 'Visual category card showcases' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            {categories.length} total categories registered in Supabase
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[var(--color-gold,#C9A84C)] text-white rounded-xl px-5 py-2.5 font-medium text-sm hover:opacity-90 shadow-sm transition-opacity self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-slate,#666666)] uppercase tracking-wider">Total Categories</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--color-ink,#111111)] mt-2">{categories.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-slate,#666666)] uppercase tracking-wider">Active on Store</span>
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {categories.filter((c) => c.is_active).length}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-slate,#666666)] uppercase tracking-wider">Total Assigned Items</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--color-ink,#111111)] mt-2">
            {categories.reduce((acc, c) => acc + (c.product_count || 0), 0)}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-mist,#999999)]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name, slug or description..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-[var(--color-whisper,#E5E5E5)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence>
          {filtered.map((cat) => (
            <motion.div
              key={cat.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* Image Banner */}
                <div className="relative h-40 bg-[var(--color-snow,#F9F9F9)] overflow-hidden">
                  {cat.image_url ? (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-mist,#999999)]">
                      <Tag className="w-10 h-10 opacity-30" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        cat.is_active
                          ? 'bg-green-600 text-white shadow-sm'
                          : 'bg-gray-800/80 text-white'
                      }`}
                    >
                      {cat.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
                    <Package className="w-3.5 h-3.5 text-[var(--color-gold,#C9A84C)]" />
                    <span>{cat.product_count || 0} products</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-medium text-[var(--color-ink,#111111)]" style={{ fontFamily: 'var(--font-display)' }}>
                        {cat.name}
                      </h3>
                      <p className="text-xs font-mono text-[var(--color-slate,#666666)] mt-0.5">
                        /shop/{cat.slug}
                      </p>
                    </div>
                    <a
                      href={`/shop/${cat.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-[var(--color-mist,#999999)] hover:text-[var(--color-gold,#C9A84C)] hover:bg-[var(--color-snow,#F9F9F9)] transition-colors"
                      title="Preview category on storefront"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <p className="text-xs text-[var(--color-slate,#666666)] mt-2 line-clamp-2 leading-relaxed">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-[var(--color-whisper,#E5E5E5)] bg-[var(--color-snow,#F9F9F9)]/50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggle(cat.id, cat.is_active)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    cat.is_active
                      ? 'text-gray-700 hover:bg-gray-200'
                      : 'text-green-700 bg-green-50 hover:bg-green-100'
                  }`}
                >
                  {cat.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{cat.is_active ? 'Hide from Store' : 'Publish to Store'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(cat)}
                    className="p-2 rounded-lg text-[var(--color-slate,#666666)] hover:text-[var(--color-gold,#C9A84C)] hover:bg-white transition-colors"
                    title="Edit category details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat)}
                    disabled={deletingId === cat.id}
                    className="p-2 rounded-lg text-[var(--color-slate,#666666)] hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center text-[var(--color-mist,#999999)] bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)]">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium text-[var(--color-ink,#111111)]">No categories found</p>
          <p className="text-xs text-[var(--color-slate,#666666)] mt-1">Try adjusting your search query or add a new category.</p>
          <button
            onClick={openCreate}
            className="mt-4 text-xs font-medium text-[var(--color-gold,#C9A84C)] hover:underline"
          >
            + Add New Category
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden pointer-events-auto border border-[var(--color-whisper,#E5E5E5)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b border-[var(--color-whisper,#E5E5E5)]">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--color-ink,#111111)]">
                      {editingCategory ? `Edit Category: ${editingCategory.name}` : 'New Product Category'}
                    </h2>
                    <p className="text-xs text-[var(--color-slate,#666666)] mt-0.5">
                      Updates propagate immediately to live navigation and product filters.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 rounded-lg text-[var(--color-slate,#666666)] hover:bg-[var(--color-snow,#F9F9F9)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Kurtis, Lehengas, Salwars"
                      className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
                      URL Slug * (auto-generated)
                    </label>
                    <div className="flex items-center rounded-xl border border-[var(--color-whisper,#E5E5E5)] bg-[var(--color-snow,#F9F9F9)] overflow-hidden">
                      <span className="px-3 text-xs text-[var(--color-mist,#999999)] select-none">/shop/</span>
                      <input
                        type="text"
                        value={form.slug}
                        onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                        placeholder="kurtis"
                        className="w-full bg-transparent py-2 pr-3 text-sm font-mono focus:outline-none text-[var(--color-ink,#111111)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Brief luxury description for SEO and category landing page header..."
                      className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[var(--color-slate,#666666)]">
                        Category Card Image
                      </label>
                      <span className="text-[10px] text-[var(--color-slate,#666666)]">
                        Upload from device or enter URL
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {/* Upload Box + Live Thumbnail */}
                      <div className="flex gap-3 items-stretch">
                        {/* Live Thumbnail Preview */}
                        <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-[var(--color-snow,#F9F9F9)] border border-[var(--color-whisper,#E5E5E5)] shrink-0 flex items-center justify-center group">
                          {form.image_url ? (
                            <img
                              src={form.image_url}
                              alt="Category preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/collection-kurtis.jpg';
                              }}
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-300" />
                          )}
                          {form.image_url && (
                            <button
                              type="button"
                              onClick={() => setForm((f) => ({ ...f, image_url: '' }))}
                              className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-medium"
                              title="Clear image"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        {/* Local File Upload Dropzone */}
                        <div className="flex-1">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/svg+xml,image/avif,image/gif"
                            onChange={handleFileInputChange}
                            className="hidden"
                          />
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onPaste={handlePaste}
                            tabIndex={0}
                            className={cn(
                              "h-20 border-2 border-dashed rounded-xl px-3 py-2 bg-white cursor-pointer transition-all flex items-center justify-between gap-3 text-left focus:outline-none focus:border-[var(--color-gold,#C9A84C)]",
                              isDragging
                                ? "border-[var(--color-gold,#C9A84C)] bg-[var(--color-gold,#C9A84C)]/10"
                                : "border-[var(--color-whisper,#E5E5E5)] hover:border-[var(--color-gold,#C9A84C)] hover:bg-[var(--color-snow,#F9F9F9)]"
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-[var(--color-gold,#C9A84C)]/10 text-[var(--color-gold,#C9A84C)] flex items-center justify-center shrink-0">
                                <Upload className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-[var(--color-ink,#111111)] truncate">
                                  {isUploading ? 'Uploading image...' : 'Choose from Local Device'}
                                </p>
                                <p className="text-[10px] text-[var(--color-slate,#666666)] truncate">
                                  Drag & drop, browse, or Ctrl+V paste
                                </p>
                              </div>
                            </div>
                            {isUploading ? (
                              <Loader2 className="w-4 h-4 text-[var(--color-gold,#C9A84C)] animate-spin shrink-0" />
                            ) : (
                              <span className="text-[11px] font-medium text-[var(--color-gold,#C9A84C)] bg-[var(--color-gold,#C9A84C)]/10 px-2 py-1 rounded-lg shrink-0">
                                Browse
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Direct URL Input */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-medium text-[var(--color-slate,#666666)]">
                            Or paste / edit Image URL:
                          </span>
                          {form.image_url && (
                            <button
                              type="button"
                              onClick={() => setForm((f) => ({ ...f, image_url: '' }))}
                              className="text-[10px] text-red-500 hover:underline"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={form.image_url}
                          onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                          placeholder="/images/collection-kurtis.jpg or https://..."
                          className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
                        />
                      </div>

                      {/* Quick Presets */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[var(--color-slate,#666666)] font-semibold mb-1">
                          Suggested Presets:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { label: 'Kurtis', url: '/images/collection-kurtis.jpg' },
                            { label: 'Salwars', url: '/images/collection-salwars.jpg' },
                            { label: 'Lehengas', url: '/images/collection-lehengas.jpg' },
                            { label: 'Sarees', url: '/images/collection-sarees.jpg' },
                            { label: 'Dupattas', url: '/images/collection-dupattas.jpg' },
                            { label: 'Couture', url: '/images/hero-new-couture.jpg' },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setForm((f) => ({ ...f, image_url: preset.url }))}
                              className={cn(
                                "px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors",
                                form.image_url === preset.url
                                  ? "bg-[var(--color-gold,#C9A84C)] text-white border-[var(--color-gold,#C9A84C)]"
                                  : "bg-white text-[var(--color-slate,#666666)] border-[var(--color-whisper,#E5E5E5)] hover:border-[var(--color-gold,#C9A84C)]"
                              )}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {uploadError && (
                        <p className="text-[11px] text-amber-600">{uploadError}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-ink,#111111)]">Live on Storefront</p>
                      <p className="text-xs text-[var(--color-slate,#666666)]">Show in navbar, mega-menu, and filter pills</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        form.is_active ? 'bg-[var(--color-gold,#C9A84C)]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          form.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-5 border-t border-[var(--color-whisper,#E5E5E5)] bg-[var(--color-snow,#F9F9F9)]">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-[var(--color-slate,#666666)] hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.name.trim() || !form.slug.trim()}
                    className="flex items-center gap-2 bg-[var(--color-gold,#C9A84C)] text-white px-5 py-2 text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
                  >
                    {saving ? 'Saving to Database...' : editingCategory ? 'Save Changes' : 'Create Category'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
