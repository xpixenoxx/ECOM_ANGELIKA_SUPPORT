'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Star,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Package,
  MessageSquare,
  AlertCircle,
  X,
  Sparkles,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import type { AdminProductReview, ProductWithReviewStats } from '@/lib/actions/admin-reviews';
import {
  updateAdminReview,
  createAdminReview,
  toggleReviewPublished,
  deleteAdminReview
} from '@/lib/actions/admin-reviews';
import toast from 'react-hot-toast';

interface Props {
  initialProducts: ProductWithReviewStats[];
  initialAllReviews: AdminProductReview[];
  initialStats: {
    totalProducts: number;
    totalReviews: number;
    publishedReviews: number;
    averageRating: number;
  };
}

export default function ReviewsClient({ initialProducts, initialAllReviews, initialStats }: Props) {
  const [products, setProducts] = useState<ProductWithReviewStats[]>(initialProducts);
  const [reviews, setReviews] = useState<AdminProductReview[]>(initialAllReviews);
  const [viewMode, setViewMode] = useState<'by-product' | 'all-reviews'>('by-product');
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Modal states
  const [editingReview, setEditingReview] = useState<AdminProductReview | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetProductForAdd, setTargetProductForAdd] = useState<ProductWithReviewStats | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states for Edit / Create
  const [form, setForm] = useState({
    reviewer_name: '',
    rating: 5,
    title: '',
    body: '',
    quality_rating: 5,
    fit_rating: 5,
    is_verified_purchase: true,
    is_published: true,
  });

  // Calculate live stats
  const totalReviewsCount = reviews.length;
  const publishedReviewsCount = reviews.filter(r => r.is_published).length;
  const overallAvgRating = publishedReviewsCount > 0
    ? Math.round((reviews.filter(r => r.is_published).reduce((sum, r) => sum + r.rating, 0) / publishedReviewsCount) * 10) / 10
    : initialStats.averageRating;

  // Filtered reviews
  const filteredReviews = reviews.filter(r => {
    const matchProduct = selectedProductId === 'all' || r.product_id === selectedProductId;
    const matchRating = ratingFilter === 'all' || r.rating === Number(ratingFilter);
    const matchStatus = statusFilter === 'all'
      || (statusFilter === 'published' && r.is_published)
      || (statusFilter === 'unpublished' && !r.is_published);

    const s = search.toLowerCase().trim();
    if (!s) return matchProduct && matchRating && matchStatus;

    const matchText = (r.title || '').toLowerCase().includes(s)
      || (r.body || '').toLowerCase().includes(s)
      || (r.reviewer_name || '').toLowerCase().includes(s)
      || (r.product?.name || '').toLowerCase().includes(s);

    return matchProduct && matchRating && matchStatus && matchText;
  });

  // Filtered products for By-Product view
  const filteredProducts = products.filter(p => {
    const s = search.toLowerCase().trim();
    if (!s) return true;
    return p.name.toLowerCase().includes(s)
      || p.slug.toLowerCase().includes(s)
      || (p.sku || '').toLowerCase().includes(s)
      || p.reviews.some(r =>
        (r.reviewer_name || '').toLowerCase().includes(s) ||
        (r.title || '').toLowerCase().includes(s) ||
        (r.body || '').toLowerCase().includes(s)
      );
  });

  // Open Edit Modal
  const openEditModal = (review: AdminProductReview) => {
    setEditingReview(review);
    setForm({
      reviewer_name: review.reviewer_name || 'Verified Customer',
      rating: review.rating || 5,
      title: review.title || '',
      body: review.body || '',
      quality_rating: review.quality_rating || 5,
      fit_rating: review.fit_rating || 5,
      is_verified_purchase: review.is_verified_purchase,
      is_published: review.is_published,
    });
  };

  // Open Add Modal
  const openAddModal = (product?: ProductWithReviewStats) => {
    const prod = product || products[0] || null;
    setTargetProductForAdd(prod);
    setForm({
      reviewer_name: '',
      rating: 5,
      title: '',
      body: '',
      quality_rating: 5,
      fit_rating: 5,
      is_verified_purchase: true,
      is_published: true,
    });
    setIsAddModalOpen(true);
  };

  // Handle Save Review (Edit)
  const handleSaveEdit = async () => {
    if (!editingReview) return;
    if (!form.body.trim()) {
      toast.error('Review text content is required');
      return;
    }

    setIsSaving(true);
    const productSlug = editingReview.product?.slug;

    try {
      const res = await updateAdminReview(editingReview.id, {
        reviewer_name: form.reviewer_name,
        rating: form.rating,
        title: form.title,
        body: form.body,
        quality_rating: form.quality_rating,
        fit_rating: form.fit_rating,
        is_verified_purchase: form.is_verified_purchase,
        is_published: form.is_published,
        product_slug: productSlug,
      });

      if (!res.success || !res.data) {
        toast.error(res.error || 'Failed to update review');
        return;
      }

      const updated = {
        ...res.data,
        product: editingReview.product,
      };

      // Update reviews state
      setReviews(prev => prev.map(r => r.id === editingReview.id ? updated : r));

      // Update product stats
      setProducts(prev => prev.map(p => {
        if (p.id === updated.product_id) {
          const pRevs = p.reviews.map(r => r.id === updated.id ? updated : r);
          const published = pRevs.filter(r => r.is_published);
          const avg = published.length > 0
            ? Math.round((published.reduce((s, r) => s + r.rating, 0) / published.length) * 10) / 10
            : 0;
          return {
            ...p,
            reviews: pRevs,
            published_count: published.length,
            average_rating: avg,
          };
        }
        return p;
      }));

      toast.success('Review updated & reflected on product page!');
      setEditingReview(null);
    } catch (err: any) {
      toast.error(err?.message || 'Error updating review');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Create Review
  const handleCreateReview = async () => {
    if (!targetProductForAdd) {
      toast.error('Please select a product');
      return;
    }
    if (!form.body.trim()) {
      toast.error('Review text content is required');
      return;
    }

    setIsSaving(true);
    try {
      const res = await createAdminReview(targetProductForAdd.id, {
        reviewer_name: form.reviewer_name,
        rating: form.rating,
        title: form.title,
        body: form.body,
        quality_rating: form.quality_rating,
        fit_rating: form.fit_rating,
        is_verified_purchase: form.is_verified_purchase,
        is_published: form.is_published,
        product_slug: targetProductForAdd.slug,
      });

      if (!res.success || !res.data) {
        toast.error(res.error || 'Failed to create review');
        return;
      }

      const created: AdminProductReview = {
        ...res.data,
        product: {
          id: targetProductForAdd.id,
          name: targetProductForAdd.name,
          slug: targetProductForAdd.slug,
          sku: targetProductForAdd.sku,
          image_url: targetProductForAdd.image_url,
        },
      };

      setReviews(prev => [created, ...prev]);

      // Update product stats
      setProducts(prev => prev.map(p => {
        if (p.id === targetProductForAdd.id) {
          const pRevs = [created, ...p.reviews];
          const published = pRevs.filter(r => r.is_published);
          const avg = published.length > 0
            ? Math.round((published.reduce((s, r) => s + r.rating, 0) / published.length) * 10) / 10
            : 0;
          return {
            ...p,
            reviews_count: pRevs.length,
            published_count: published.length,
            average_rating: avg,
            reviews: pRevs,
          };
        }
        return p;
      }));

      toast.success(`Review created for "${targetProductForAdd.name}"!`);
      setIsAddModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Error creating review');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Published
  const handleTogglePublished = async (review: AdminProductReview) => {
    const newStatus = !review.is_published;
    setTogglingId(review.id);

    // Optimistic update
    setReviews(prev => prev.map(r => r.id === review.id ? { ...r, is_published: newStatus } : r));

    try {
      const res = await toggleReviewPublished(review.id, newStatus, review.product?.slug);
      if (!res.success) {
        // Revert
        setReviews(prev => prev.map(r => r.id === review.id ? { ...r, is_published: review.is_published } : r));
        toast.error('Failed to update published status');
      } else {
        // Update product average rating
        setProducts(prev => prev.map(p => {
          if (p.id === review.product_id) {
            const pRevs = p.reviews.map(r => r.id === review.id ? { ...r, is_published: newStatus } : r);
            const published = pRevs.filter(r => r.is_published);
            const avg = published.length > 0
              ? Math.round((published.reduce((s, r) => s + r.rating, 0) / published.length) * 10) / 10
              : 0;
            return {
              ...p,
              reviews: pRevs,
              published_count: published.length,
              average_rating: avg,
            };
          }
          return p;
        }));
        toast.success(newStatus ? 'Review published to product page' : 'Review hidden from product page');
      }
    } catch {
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, is_published: review.is_published } : r));
      toast.error('Failed to update review status');
    } finally {
      setTogglingId(null);
    }
  };

  // Delete Review
  const handleDeleteReview = async (review: AdminProductReview) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;
    setDeletingId(review.id);

    try {
      const res = await deleteAdminReview(review.id, review.product?.slug);
      if (!res.success) {
        toast.error('Failed to delete review');
      } else {
        setReviews(prev => prev.filter(r => r.id !== review.id));
        setProducts(prev => prev.map(p => {
          if (p.id === review.product_id) {
            const pRevs = p.reviews.filter(r => r.id !== review.id);
            const published = pRevs.filter(r => r.is_published);
            const avg = published.length > 0
              ? Math.round((published.reduce((s, r) => s + r.rating, 0) / published.length) * 10) / 10
              : 0;
            return {
              ...p,
              reviews_count: pRevs.length,
              published_count: published.length,
              average_rating: avg,
              reviews: pRevs,
            };
          }
          return p;
        }));
        toast.success('Review deleted successfully');
      }
    } catch {
      toast.error('Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
              Product Reviews & Ratings
            </h1>
            <AdminSectionInfo
              title="Customer Feedback & Storefront Reviews"
              purpose="Manage, edit, moderate, and publish customer reviews for all 27 products across the entire website. Any edits are immediately reflected live on the storefront product page."
              storefrontImpact="Updates review counts, 5-star rating averages, star distributions, verified purchase badges, and testimonial comments on /product/[slug]."
              targets={[
                { name: 'Product Details Page', path: '/product/heritage-temple-kanjivaram-silk-saree', description: 'Live customer reviews & ratings tab' },
                { name: 'Storefront Catalogue', path: '/shop', description: 'Product star badges & review counts' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate)] mt-0.5">
            Total {products.length} products across website · {totalReviewsCount} customer reviews ({publishedReviewsCount} published)
          </p>
        </div>

        <button
          type="button"
          onClick={() => openAddModal()}
          className="flex items-center gap-2 bg-[var(--color-gold)] text-white rounded-xl px-5 py-2.5 font-medium text-sm hover:opacity-90 transition-opacity shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Write Customer Review</span>
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[var(--color-whisper)] shadow-sm">
          <p className="text-xs text-[var(--color-slate)] font-medium uppercase tracking-wider">Total Products</p>
          <p className="text-2xl font-bold text-[var(--color-ink)] mt-1">{products.length}</p>
          <p className="text-[11px] text-[var(--color-mist)] mt-0.5">Active catalogue</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[var(--color-whisper)] shadow-sm">
          <p className="text-xs text-[var(--color-slate)] font-medium uppercase tracking-wider">Total Reviews</p>
          <p className="text-2xl font-bold text-[var(--color-ink)] mt-1">{totalReviewsCount}</p>
          <p className="text-[11px] text-green-600 mt-0.5">{publishedReviewsCount} live on store</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[var(--color-whisper)] shadow-sm">
          <p className="text-xs text-[var(--color-slate)] font-medium uppercase tracking-wider">Average Rating</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-2xl font-bold text-[var(--color-ink)]">{overallAvgRating || 5.0}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <p className="text-[11px] text-[var(--color-mist)] mt-0.5">Across all published feedback</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[var(--color-whisper)] shadow-sm">
          <p className="text-xs text-[var(--color-slate)] font-medium uppercase tracking-wider">Verified Purchases</p>
          <p className="text-2xl font-bold text-green-700 mt-1">
            {reviews.filter(r => r.is_verified_purchase).length}
          </p>
          <p className="text-[11px] text-[var(--color-mist)] mt-0.5">Authentic buyers</p>
        </div>
      </div>

      {/* Navigation Pills: View By Product vs All Reviews */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[var(--color-whisper)] shadow-sm">
        <div className="flex items-center gap-2 bg-[var(--color-snow)] p-1 rounded-xl border border-[var(--color-whisper)]">
          <button
            type="button"
            onClick={() => setViewMode('by-product')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'by-product'
                ? 'bg-white text-[var(--color-gold)] shadow-sm border border-[var(--color-whisper)]'
                : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Browse Products ({products.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('all-reviews')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'all-reviews'
                ? 'bg-white text-[var(--color-gold)] shadow-sm border border-[var(--color-whisper)]'
                : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>All Reviews ({reviews.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-mist)]" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search product, customer, or review text…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20 shadow-sm bg-white"
          />
        </div>
      </div>

      {/* VIEW MODE 1: BY PRODUCT (All 27 products from the website with their user reviews) */}
      {viewMode === 'by-product' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[var(--color-slate)] px-1">
            <span>Showing all {filteredProducts.length} products across the website</span>
            <span>Click any product to view, edit, or add user reviews</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => {
              const hasReviews = product.reviews.length > 0;
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm hover:border-[var(--color-gold)]/50 transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-5">
                    {/* Product Header */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-16 h-16 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-[var(--color-mist)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-gold)]">
                          {product.category_name}
                        </span>
                        <h3 className="font-semibold text-sm text-[var(--color-ink)] truncate" title={product.name}>
                          {product.name}
                        </h3>
                        <p className="text-xs text-[var(--color-mist)] font-mono">{product.sku || product.slug}</p>

                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-bold text-amber-800">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{product.average_rating > 0 ? product.average_rating : 'New'}</span>
                          </div>
                          <span className="text-xs text-[var(--color-slate)]">
                            {product.reviews.length} {product.reviews.length === 1 ? 'review' : 'reviews'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reviews List for this Product */}
                    <div className="mt-4 pt-4 border-t border-[var(--color-whisper)] space-y-3">
                      {hasReviews ? (
                        <div className="space-y-2.5">
                          {product.reviews.slice(0, 2).map(r => (
                            <div
                              key={r.id}
                              className="p-3 bg-[var(--color-snow)] rounded-xl border border-[var(--color-whisper)] text-xs space-y-1 hover:border-[var(--color-gold)]/40 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-[var(--color-ink)] truncate">
                                  {r.reviewer_name}
                                </span>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <div className="flex text-amber-500">
                                    {[...Array(5)].map((_, idx) => (
                                      <Star
                                        key={idx}
                                        className={`w-3 h-3 ${idx < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                      />
                                    ))}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(r)}
                                    className="p-1 text-[var(--color-slate)] hover:text-[var(--color-gold)] ml-1"
                                    title="Edit this review"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              {r.title && <p className="font-medium text-[var(--color-ink)] truncate">{r.title}</p>}
                              <p className="text-[var(--color-slate)] line-clamp-2 leading-relaxed">{r.body}</p>
                            </div>
                          ))}
                          {product.reviews.length > 2 && (
                            <p className="text-center text-[11px] text-[var(--color-mist)]">
                              +{product.reviews.length - 2} more reviews
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="py-4 text-center text-xs text-[var(--color-mist)] bg-gray-50/70 rounded-xl border border-dashed border-gray-200">
                          <p>No user reviews yet for this product</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="px-5 py-3 bg-[var(--color-snow)] border-t border-[var(--color-whisper)] flex items-center justify-between text-xs">
                    <a
                      href={`/product/${product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[var(--color-slate)] hover:text-[var(--color-gold)] transition-colors"
                      title="Open storefront product page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live Product Page</span>
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openAddModal(product)}
                        className="px-2.5 py-1 bg-white border border-[var(--color-whisper)] rounded-lg text-xs font-semibold text-[var(--color-gold)] hover:border-[var(--color-gold)] transition-all shadow-xs"
                      >
                        + Add Review
                      </button>
                      {hasReviews && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProductId(product.id);
                            setViewMode('all-reviews');
                          }}
                          className="px-2.5 py-1 bg-[var(--color-gold)] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
                        >
                          Manage ({product.reviews.length})
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: ALL REVIEWS TABLE (Full CRUD & Instant Editing) */}
      {viewMode === 'all-reviews' && (
        <div className="space-y-4">
          {/* Sub Filters for All Reviews */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[var(--color-whisper)] shadow-sm">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="font-semibold text-[var(--color-slate)]">Filter By:</span>

              {/* Product selector */}
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="px-3 py-1.5 border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] bg-white text-xs font-medium"
              >
                <option value="all">All Products ({products.length})</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.reviews.length})
                  </option>
                ))}
              </select>

              {/* Rating selector */}
              <select
                value={ratingFilter}
                onChange={e => setRatingFilter(e.target.value)}
                className="px-3 py-1.5 border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] bg-white text-xs font-medium"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars ★★★★★</option>
                <option value="4">4 Stars ★★★★☆</option>
                <option value="3">3 Stars ★★★☆☆</option>
                <option value="2">2 Stars ★★☆☆☆</option>
                <option value="1">1 Star ★☆☆☆☆</option>
              </select>

              {/* Status selector */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] bg-white text-xs font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published (Live on Website)</option>
                <option value="unpublished">Unpublished (Hidden)</option>
              </select>
            </div>

            {selectedProductId !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedProductId('all')}
                className="text-xs text-[var(--color-gold)] hover:underline font-medium"
              >
                Clear product filter
              </button>
            )}
          </div>

          {/* Reviews Table */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[var(--color-snow)] border-b border-[var(--color-whisper)]">
                    {['Product', 'Reviewer', 'Rating', 'Review Details', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-[var(--color-slate)] uppercase tracking-wider first:pl-6 last:pr-6">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-whisper)]">
                  {filteredReviews.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-sm text-[var(--color-slate)]">
                        <MessageSquare className="w-8 h-8 mx-auto text-[var(--color-mist)] mb-2 opacity-50" />
                        <p className="font-medium text-[var(--color-ink)]">No reviews found matching your criteria</p>
                        <button
                          type="button"
                          onClick={() => openAddModal()}
                          className="mt-3 text-xs text-[var(--color-gold)] hover:underline font-semibold"
                        >
                          + Write a review for any product
                        </button>
                      </td>
                    </tr>
                  )}
                  {filteredReviews.map((review, i) => (
                    <motion.tr
                      key={review.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-[var(--color-snow)]/60 transition-colors"
                    >
                      {/* Product */}
                      <td className="px-6 py-3.5 max-w-[200px]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-lg bg-[var(--color-snow)] border border-[var(--color-whisper)] overflow-hidden flex-shrink-0">
                            {review.product?.image_url ? (
                              <img
                                src={review.product.image_url}
                                alt={review.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4 m-auto text-[var(--color-mist)]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-[var(--color-ink)] truncate" title={review.product?.name}>
                              {review.product?.name || 'Product'}
                            </p>
                            {review.product?.slug && (
                              <a
                                href={`/product/${review.product.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-[var(--color-gold)] hover:underline flex items-center gap-0.5 mt-0.5"
                              >
                                <span>View on site</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Reviewer */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-xs text-[var(--color-ink)]">{review.reviewer_name}</p>
                        {review.is_verified_purchase && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.2 rounded-full font-medium mt-1">
                            <CheckCircle className="w-2.5 h-2.5" /> Verified Buyer
                          </span>
                        )}
                        <p className="text-[10px] text-[var(--color-mist)] mt-1">
                          {new Date(review.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </p>
                      </td>

                      {/* Rating */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <div className="flex text-amber-500">
                            {[...Array(5)].map((_, idx) => (
                              <Star
                                key={idx}
                                className={`w-3.5 h-3.5 ${idx < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-[var(--color-ink)] ml-1">{review.rating}★</span>
                        </div>
                        {(review.quality_rating || review.fit_rating) && (
                          <p className="text-[10px] text-[var(--color-mist)] mt-1">
                            Q: {review.quality_rating || 5}/5 · Fit: {review.fit_rating || 5}/5
                          </p>
                        )}
                      </td>

                      {/* Review Content */}
                      <td className="px-4 py-3.5 max-w-[340px]">
                        {review.title && (
                          <p className="font-semibold text-xs text-[var(--color-ink)] mb-0.5">{review.title}</p>
                        )}
                        <p className="text-xs text-[var(--color-slate)] line-clamp-2 leading-relaxed">
                          {review.body}
                        </p>
                      </td>

                      {/* Status Toggle */}
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleTogglePublished(review)}
                          disabled={togglingId === review.id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                            review.is_published
                              ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                          } disabled:opacity-50`}
                          title={review.is_published ? 'Click to hide from store' : 'Click to publish on store'}
                        >
                          {review.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{review.is_published ? 'Published' : 'Hidden'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(review)}
                            className="p-1.5 rounded-lg hover:bg-[var(--color-whisper)] text-[var(--color-slate)] hover:text-[var(--color-gold)] transition-colors"
                            title="Edit this review"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(review)}
                            disabled={deletingId === review.id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--color-slate)] hover:text-red-500 transition-colors disabled:opacity-50"
                            title="Delete this review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EDIT REVIEW MODAL */}
      <AnimatePresence>
        {editingReview && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => !isSaving && setEditingReview(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto"
                onClick={e => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--color-whisper)]">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
                      Edit User Review
                    </h2>
                    <p className="text-xs text-[var(--color-slate)] mt-0.5">
                      Editing review for <span className="font-semibold text-[var(--color-ink)]">{editingReview.product?.name}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => !isSaving && setEditingReview(null)}
                    className="p-2 rounded-lg hover:bg-[var(--color-whisper)] text-[var(--color-slate)] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Form */}
                <div className="p-6 space-y-4">
                  {/* Reviewer Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                      Reviewer Display Name *
                    </label>
                    <input
                      type="text"
                      value={form.reviewer_name}
                      onChange={e => setForm(f => ({ ...f, reviewer_name: e.target.value }))}
                      placeholder="e.g. Priya Sharma, Ananya R."
                      className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                    />
                  </div>

                  {/* Rating Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1.5">
                      Star Rating * ({form.rating} out of 5 stars)
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, rating: star }))}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= form.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-200 hover:text-amber-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Title */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                      Review Title / Headline
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Stunning craftsmanship and drape"
                      className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                    />
                  </div>

                  {/* Review Body */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                      Review Content / Feedback *
                    </label>
                    <textarea
                      value={form.body}
                      onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                      rows={4}
                      placeholder="Enter customer review text..."
                      className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)] resize-none"
                    />
                  </div>

                  {/* Quality & Fit Ratings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                        Quality Score (1-5)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={form.quality_rating}
                        onChange={e => setForm(f => ({ ...f, quality_rating: Number(e.target.value) }))}
                        className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                        Fit Score (1-5)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={form.fit_rating}
                        onChange={e => setForm(f => ({ ...f, fit_rating: Number(e.target.value) }))}
                        className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                      />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="pt-2 border-t border-[var(--color-whisper)] space-y-3">
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <span className="text-sm font-medium text-[var(--color-ink)]">Publish on Storefront</span>
                        <p className="text-xs text-[var(--color-slate)]">When enabled, this review is live on the product page</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_published ? 'bg-[var(--color-gold)]' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_published ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <div>
                        <span className="text-sm font-medium text-[var(--color-ink)]">Verified Purchase Badge</span>
                        <p className="text-xs text-[var(--color-slate)]">Displays green "Verified Buyer" badge beside reviewer name</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, is_verified_purchase: !f.is_verified_purchase }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_verified_purchase ? 'bg-[var(--color-gold)]' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_verified_purchase ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between p-6 border-t border-[var(--color-whisper)] bg-[var(--color-snow)] rounded-b-2xl">
                  {editingReview.product?.slug && (
                    <a
                      href={`/product/${editingReview.product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[var(--color-gold)] hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Preview Product Page</span>
                    </a>
                  )}

                  <div className="flex items-center gap-3 ml-auto">
                    <button
                      type="button"
                      onClick={() => setEditingReview(null)}
                      disabled={isSaving}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-slate)] hover:bg-[var(--color-whisper)] transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="flex items-center gap-2 bg-[var(--color-gold)] text-white rounded-lg px-5 py-2 font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
                    >
                      {isSaving ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving…</span>
                        </>
                      ) : (
                        'Save & Publish Changes'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CREATE REVIEW MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => !isSaving && setIsAddModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto"
                onClick={e => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--color-whisper)]">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
                      Add Customer Review
                    </h2>
                    <p className="text-xs text-[var(--color-slate)] mt-0.5">
                      Create customer review that reflects on the storefront product page
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => !isSaving && setIsAddModalOpen(false)}
                    className="p-2 rounded-lg hover:bg-[var(--color-whisper)] text-[var(--color-slate)] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Form */}
                <div className="p-6 space-y-4">
                  {/* Product Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                      Target Product *
                    </label>
                    <select
                      value={targetProductForAdd?.id || ''}
                      onChange={e => {
                        const found = products.find(p => p.id === e.target.value);
                        setTargetProductForAdd(found || null);
                      }}
                      className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)] bg-white"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.category_name})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Reviewer Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      value={form.reviewer_name}
                      onChange={e => setForm(f => ({ ...f, reviewer_name: e.target.value }))}
                      placeholder="e.g. Ananya Iyer, Pooja V."
                      className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                    />
                  </div>

                  {/* Rating Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1.5">
                      Star Rating * ({form.rating} out of 5 stars)
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, rating: star }))}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= form.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-200 hover:text-amber-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Title */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                      Review Title / Headline
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Unbelievable craftsmanship and drape"
                      className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                    />
                  </div>

                  {/* Review Body */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                      Review Details *
                    </label>
                    <textarea
                      value={form.body}
                      onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                      rows={4}
                      placeholder="Write customer feedback here..."
                      className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)] resize-none"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="pt-2 border-t border-[var(--color-whisper)] space-y-3">
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <span className="text-sm font-medium text-[var(--color-ink)]">Publish Immediately</span>
                        <p className="text-xs text-[var(--color-slate)]">Make this review visible on the product page right away</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_published ? 'bg-[var(--color-gold)]' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_published ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <div>
                        <span className="text-sm font-medium text-[var(--color-ink)]">Verified Purchase Badge</span>
                        <p className="text-xs text-[var(--color-slate)]">Tag as verified buyer</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, is_verified_purchase: !f.is_verified_purchase }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_verified_purchase ? 'bg-[var(--color-gold)]' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_verified_purchase ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--color-whisper)] bg-[var(--color-snow)] rounded-b-2xl">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-slate)] hover:bg-[var(--color-whisper)] transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateReview}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-[var(--color-gold)] text-white rounded-lg px-5 py-2 font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
                  >
                    {isSaving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Publishing…</span>
                      </>
                    ) : (
                      'Publish Review'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

