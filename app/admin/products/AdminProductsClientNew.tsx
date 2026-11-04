'use client';

import React, { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  toggleProductActive,
  toggleProductFeatured,
  toggleProductVidyasPick,
  deleteProduct,
} from '@/lib/actions/admin-products';
import type { AdminProduct, AdminCategory } from '@/lib/actions/admin-products';
import {
  Search,
  Package,
  Star,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  Filter,
  Plus,
  AlertTriangle,
  ExternalLink,
  Heart,
} from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
  { key: 'featured', label: 'Featured' },
  { key: 'vidyas_pick', label: "Vidhya's Picks" },
  { key: 'low_stock', label: 'Low Stock' },
];

interface Props {
  initialProducts: AdminProduct[];
  categories: AdminCategory[];
}

export default function AdminProductsClientNew({ initialProducts, categories }: Props) {
  const [, startTransition] = useTransition();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    if (statusFilter === 'active' && !p.is_active) return false;
    if (statusFilter === 'inactive' && p.is_active) return false;
    if (statusFilter === 'featured' && !p.is_featured) return false;
    if (statusFilter === 'vidyas_pick' && !p.is_vidyas_pick) return false;
    if (statusFilter === 'low_stock' && p.total_inventory > 5) return false;
    if (categoryFilter !== 'all' && p.category_id !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !p.name.toLowerCase().includes(q) &&
        !p.slug.toLowerCase().includes(q) &&
        !(p.sku || '').toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  function handleToggleActive(id: string, current: boolean) {
    setTogglingId(id);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: !current } : p))
    );
    startTransition(async () => {
      await toggleProductActive(id, !current);
      setTogglingId(null);
    });
  }

  function handleToggleFeatured(id: string, current: boolean) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_featured: !current } : p))
    );
    startTransition(async () => {
      await toggleProductFeatured(id, !current);
    });
  }

  function handleToggleVidyasPick(id: string, current: boolean) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_vidyas_pick: !current } : p))
    );
    startTransition(async () => {
      await toggleProductVidyasPick(id, !current);
    });
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this product and its variants? This cannot be undone.')) return;
    setDeletingId(id);
    startTransition(async () => {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeletingId(null);
    });
  }

  const stats = {
    total: products.length,
    active: products.filter((p) => p.is_active).length,
    featured: products.filter((p) => p.is_featured).length,
    vidyasPicks: products.filter((p) => p.is_vidyas_pick).length,
    lowStock: products.filter((p) => p.total_inventory <= 5).length,
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium text-[var(--color-ink,#111111)]" style={{ fontFamily: 'var(--font-display)' }}>
              Products Catalog
            </h1>
            <AdminSectionInfo
              title="Products Management"
              purpose="Manage all luxury ethnic garments. Controls product descriptions, pricing, sizes, active inventory, and promotional badges across the entire e-commerce store."
              storefrontImpact="Changes update the /shop catalog instantly, along with specific category pages, product detail pages (/product/[slug]), homepage featured carousels, and search."
              targets={[
                { name: 'Shop All Catalog', path: '/shop', description: 'Product grid cards with price & badges' },
                { name: 'New Arrivals', path: '/new-arrivals', description: 'Latest published garments' },
                { name: "Vidhya's Picks", path: '/vidhyas-picks', description: 'Curated designer collection' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            {products.length} garments in Supabase database
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-[var(--color-gold,#C9A84C)] text-white rounded-xl px-5 py-2.5 font-medium text-sm hover:opacity-90 shadow-sm transition-opacity self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Total Products', value: stats.total, icon: Package, color: 'blue' },
          { label: 'Active on Store', value: stats.active, icon: Eye, color: 'green' },
          { label: 'Featured on Home', value: stats.featured, icon: Star, color: 'yellow' },
          { label: "Vidhya's Picks", value: stats.vidyasPicks, icon: Heart, color: 'red' },
          { label: 'Low Stock Alerts', value: stats.lowStock, icon: AlertTriangle, color: 'amber' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-[var(--color-slate,#666666)]">{label}</p>
              <div className={`w-7 h-7 rounded-lg bg-${color}-100 flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 text-${color}-600`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--color-ink,#111111)]">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] shadow-sm p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-mist,#999999)]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, slug, or SKU..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-[var(--color-whisper,#E5E5E5)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)] bg-white text-[var(--color-ink,#111111)]"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.product_count || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Status Pills */}
        <div className="flex gap-2 flex-wrap pt-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === f.key
                  ? 'bg-[var(--color-gold,#C9A84C)] text-white shadow-sm'
                  : 'bg-[var(--color-snow,#F9F9F9)] text-[var(--color-slate,#666666)] hover:bg-[var(--color-whisper,#E5E5E5)]'
              }`}
            >
              {f.label}
              {f.key === 'low_stock' && stats.lowStock > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.2">
                  {stats.lowStock}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {filtered.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow"
            >
              <div>
                {/* Product Image */}
                <div className="relative h-48 bg-[var(--color-snow,#F9F9F9)] overflow-hidden">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-[var(--color-mist,#999999)]" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {!product.is_active && (
                      <span className="bg-gray-900/80 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                        Hidden
                      </span>
                    )}
                    {product.is_featured && (
                      <span className="bg-[var(--color-gold,#C9A84C)] text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm">
                        Featured
                      </span>
                    )}
                    {product.is_vidyas_pick && (
                      <span className="bg-red-600 text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm">
                        Vidhya&apos;s Pick
                      </span>
                    )}
                    {product.total_inventory <= 5 && (
                      <span className="bg-amber-600 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                        Low Stock ({product.total_inventory})
                      </span>
                    )}
                  </div>

                  {/* Live link shortcut */}
                  <a
                    href={`/product/${product.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-[var(--color-gold,#C9A84C)] transition-colors opacity-0 group-hover:opacity-100"
                    title="View live product page"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Details */}
                <div className="p-4">
                  <p className="font-medium text-sm text-[var(--color-ink,#111111)] line-clamp-1" title={product.name}>
                    {product.name}
                  </p>
                  <p className="text-xs text-[var(--color-slate,#666666)] mt-0.5 font-medium">
                    {product.category_name}
                  </p>

                  <div className="flex items-baseline justify-between mt-2.5">
                    <div>
                      <span className="font-bold text-sm text-[var(--color-ink,#111111)]">
                        ₹{Number(product.price).toLocaleString('en-IN')}
                      </span>
                      {product.compare_at_price && (
                        <span className="text-xs text-[var(--color-mist,#999999)] line-through ml-2">
                          ₹{Number(product.compare_at_price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--color-slate,#666666)] bg-[var(--color-snow,#F9F9F9)] px-2 py-0.5 rounded-md border border-[var(--color-whisper,#E5E5E5)]">
                      {product.total_inventory} in stock
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 border-t border-[var(--color-whisper,#E5E5E5)] bg-[var(--color-snow,#F9F9F9)]/50 flex items-center gap-1.5">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-[var(--color-ink,#111111)] hover:text-[var(--color-gold,#C9A84C)] hover:bg-white rounded-lg transition-colors border border-[var(--color-whisper,#E5E5E5)]"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </Link>

                <button
                  type="button"
                  onClick={() => handleToggleActive(product.id, product.is_active)}
                  disabled={togglingId === product.id}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    product.is_active
                      ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                      : 'border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={product.is_active ? 'Published (click to unpublish)' : 'Hidden (click to publish)'}
                >
                  {product.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleFeatured(product.id, product.is_featured)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    product.is_featured
                      ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                      : 'border-[var(--color-whisper,#E5E5E5)] text-[var(--color-mist,#999999)] hover:text-yellow-600'
                  }`}
                  title={product.is_featured ? 'Featured on Homepage' : 'Mark as Featured'}
                >
                  <Star className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleVidyasPick(product.id, product.is_vidyas_pick)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    product.is_vidyas_pick
                      ? 'border-red-200 bg-red-50 text-red-600'
                      : 'border-[var(--color-whisper,#E5E5E5)] text-[var(--color-mist,#999999)] hover:text-red-600'
                  }`}
                  title={product.is_vidyas_pick ? "In Vidhya's Picks" : "Add to Vidhya's Picks"}
                >
                  <Heart className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(product.id)}
                  disabled={deletingId === product.id}
                  className="p-1.5 rounded-lg border border-[var(--color-whisper,#E5E5E5)] text-[var(--color-mist,#999999)] hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete product"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center text-[var(--color-mist,#999999)] bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)]">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium text-[var(--color-ink,#111111)]">No products found</p>
          <p className="text-xs text-[var(--color-slate,#666666)] mt-1">Try adjusting your filters or search keywords.</p>
        </div>
      )}
    </motion.div>
  );
}
