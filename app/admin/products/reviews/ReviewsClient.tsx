'use client';

import { useState, Fragment } from 'react';
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

  // Modal & inline states
  const [editingReview, setEditingReview] = useState<AdminProductReview | null>(null);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [targetProductForAdd, setTargetProductForAdd] = useState<ProductWithReviewStats | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state for Edit
  const [editForm, setEditForm] = useState({
    reviewer_name: '',
    rating: 5,
    title: '',
    body: '',
    quality_rating: 5,
    fit_rating: 5,
    is_verified_purchase: true,
    is_published: true,
  });

  // Form state for Add
  const initialAddForm = {
    reviewer_name: '',
    rating: 5,
    title: '',
    body: '',
    quality_rating: 5,
    fit_rating: 5,
    is_verified_purchase: true,
    is_published: true,
  };
  const [addForm, setAddForm] = useState(initialAddForm);

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

  // Open Edit (Inline rectangular box below review)
  const openEditModal = (review: AdminProductReview) => {
    if (editingReview?.id === review.id) {
      setEditingReview(null);
      return;
    }
    setAddingProductId(null); // close any active add box
    setEditingReview(review);
    setEditForm({
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

  // Open Inline Add Box (inside product card or top-level)
  const openInlineAdd = (product?: ProductWithReviewStats | 'top') => {
    const targetKey = typeof product === 'object' ? product.id : (product || 'top');
    if (addingProductId === targetKey) {
      setAddingProductId(null);
      return;
    }
    setEditingReview(null); // close any active edit box
    if (typeof product === 'object') {
      setTargetProductForAdd(product);
    } else if (!targetProductForAdd && products.length > 0) {
      setTargetProductForAdd(products[0] || null);
    }
    setAddForm(initialAddForm);
    setAddingProductId(targetKey);
  };

  // Inline rectangular box renderer for Editing a review
  const renderInlineEditBox = (review: AdminProductReview, layout: 'card' | 'table' = 'table') => {
    const isCard = layout === 'card';

    return (
      <div className={`bg-[#FCFBF8] rounded-xl border-2 border-[var(--color-gold)]/40 shadow-sm text-sm ${isCard ? 'p-4 my-2' : 'p-5 my-1'}`}>
        {/* Top Header of the rectangular box */}
        <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-[var(--color-whisper)]">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="inline-flex items-center gap-1.5 font-semibold text-xs text-[var(--color-gold)] bg-[var(--color-gold-light)] px-2.5 py-1 rounded-md flex-shrink-0">
              <Edit2 className="w-3.5 h-3.5" />
              Edit Review
            </span>
            <span className="text-xs text-[var(--color-slate)]">for</span>
            <span className="font-semibold text-xs text-[var(--color-ink)] truncate max-w-[220px]" title={review.product?.name}>
              {review.product?.name || 'Product'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setEditingReview(null)}
            disabled={isSaving}
            className="p-1.5 rounded-lg text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)] transition-colors cursor-pointer flex-shrink-0"
            title="Cancel & close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form fields */}
        <div className="space-y-3.5">
          {/* Row 1: Reviewer Name & Star Rating */}
          <div className={isCard ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                Reviewer Display Name *
              </label>
              <input
                type="text"
                value={editForm.reviewer_name}
                onChange={e => setEditForm(f => ({ ...f, reviewer_name: e.target.value }))}
                placeholder="e.g. Priya Sharma"
                className="w-full bg-white border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-xs text-[var(--color-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)] transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                Star Rating ({editForm.rating} out of 5 stars)
              </label>
              <div className="flex items-center gap-1.5 pt-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditForm(f => ({ ...f, rating: star }))}
                    className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                    title={`${star} Star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= editForm.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-200 hover:text-amber-200'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-[var(--color-ink)]">{editForm.rating}★</span>
              </div>
            </div>
          </div>

          {/* Row 2: Headline / Title & Scores */}
          <div className={isCard ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-3 gap-4'}>
            <div className={isCard ? '' : 'md:col-span-2'}>
              <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                Review Headline / Title
              </label>
              <input
                type="text"
                value={editForm.title}
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Stunning craftsmanship and drape"
                className="w-full bg-white border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-xs text-[var(--color-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)] transition-all shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-slate)] mb-1">
                  Quality (1-5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={editForm.quality_rating}
                  onChange={e => setEditForm(f => ({ ...f, quality_rating: Number(e.target.value) }))}
                  className="w-full bg-white border border-[var(--color-whisper)] rounded-lg px-2.5 py-2 text-xs text-[var(--color-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)] transition-all shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-slate)] mb-1">
                  Fit (1-5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={editForm.fit_rating}
                  onChange={e => setEditForm(f => ({ ...f, fit_rating: Number(e.target.value) }))}
                  className="w-full bg-white border border-[var(--color-whisper)] rounded-lg px-2.5 py-2 text-xs text-[var(--color-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)] transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Review Text Content */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
              Review Content / Feedback *
            </label>
            <textarea
              value={editForm.body}
              onChange={e => setEditForm(f => ({ ...f, body: e.target.value }))}
              rows={3}
              placeholder="Enter customer review text..."
              className="w-full bg-white border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-xs text-[var(--color-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)] resize-none transition-all leading-relaxed shadow-2xs"
            />
          </div>

          {/* Row 4: Toggles */}
          <div className="flex flex-wrap items-center gap-4 pt-2.5 pb-1 border-t border-[var(--color-whisper)]">
            <div
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => setEditForm(f => ({ ...f, is_published: !f.is_published }))}
            >
              <button
                type="button"
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                  editForm.is_published ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                    editForm.is_published ? 'translate-x-4.5' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-xs font-medium text-[var(--color-ink)]">
                {editForm.is_published ? 'Published (Live)' : 'Hidden (Draft)'}
              </span>
            </div>

            <div
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => setEditForm(f => ({ ...f, is_verified_purchase: !f.is_verified_purchase }))}
            >
              <button
                type="button"
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                  editForm.is_verified_purchase ? 'bg-[var(--color-gold)]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                    editForm.is_verified_purchase ? 'translate-x-4.5' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-xs font-medium text-[var(--color-ink)] flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                Verified Buyer
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions of rectangular box */}
        <div className="flex items-center justify-between pt-3.5 mt-3 border-t border-[var(--color-whisper)]">
          {review.product?.slug ? (
            <a
              href={`/product/${review.product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[var(--color-gold)] hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>View on Site</span>
            </a>
          ) : <div />}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setEditingReview(null)}
              disabled={isSaving}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[var(--color-slate)] hover:bg-[var(--color-whisper)] transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="flex items-center gap-1.5 bg-[var(--color-gold)] text-white rounded-lg px-4 py-1.5 font-semibold text-xs hover:opacity-90 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Inline rectangular box renderer for Adding a new review
  const renderInlineAddBox = (product?: ProductWithReviewStats, layout: 'card' | 'wide' = 'card') => {
    const currentProduct = product || targetProductForAdd;
    const isCard = layout === 'card';

    return (
      <div className={`bg-[#FCFBF8] rounded-xl border-2 border-[var(--color-gold)]/40 shadow-sm text-sm ${isCard ? 'p-4 my-2' : 'p-5 my-3'}`}>
        {/* Top Header of rectangular add box */}
        <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-[var(--color-whisper)]">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="inline-flex items-center gap-1.5 font-semibold text-xs text-[var(--color-gold)] bg-[var(--color-gold-light)] px-2.5 py-1 rounded-md flex-shrink-0">
              <Plus className="w-3.5 h-3.5" />
              Add Review
            </span>
            {currentProduct && (
              <>
                <span className="text-xs text-[var(--color-slate)]">for</span>
                <span className="font-semibold text-xs text-[var(--color-ink)] truncate max-w-[220px]" title={currentProduct.name}>
                  {currentProduct.name}
                </span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setAddingProductId(null)}
            disabled={isSaving}
            className="p-1.5 rounded-lg text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)] transition-colors cursor-pointer flex-shrink-0"
            title="Cancel & close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-3.5">
          {/* Product selector if wide / top-level without explicit product */}
          {!product && (
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
                className="w-full bg-white border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-xs text-[var(--color-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)] transition-all shadow-2xs"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category_name || 'Product'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Row 1: Reviewer Name & Star Rating */}
          <div className={isCard ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                Reviewer Display Name *
              </label>
              <input
                type="text"
                value={addForm.reviewer_name}
                onChange={e => setAddForm(f => ({ ...f, reviewer_name: e.target.value }))}
                placeholder="e.g. Priya Sharma, Ananya V."
                className="w-full bg-white border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-xs text-[var(--color-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)] transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                Star Rating ({addForm.rating} out of 5 stars)
              </label>
              <div className="flex items-center gap-1.5 pt-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setAddForm(f => ({ ...f, rating: star }))}
                    className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                    title={`${star} Star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= addForm.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-200 hover:text-amber-200'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-[var(--color-ink)]">{addForm.rating}★</span>
              </div>
            </div>
          </div>

          {/* Row 2: Headline / Title & Scores */}
          <div className={isCard ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-3 gap-4'}>
            <div className={isCard ? '' : 'md:col-span-2'}>
              <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                Review Headline / Title
              </label>
              <input
                type="text"
                value={addForm.title}
                onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Stunning craftsmanship and drape"
                className="w-full bg-white border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-xs text-[var(--color-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)] transition-all shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-slate)] mb-1">
                  Quality (1-5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={addForm.quality_rating}
                  onChange={e => setAddForm(f => ({ ...f, quality_rating: Number(e.target.value) }))}
                  className="w-full bg-white border border-[var(--color-whisper)] rounded-lg px-2.5 py-2 text-xs text-[var(--color-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)] transition-all shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-slate)] mb-1">
                  Fit (1-5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={addForm.fit_rating}
                  onChange={e => setAddForm(f => ({ ...f, fit_rating: Number(e.target.value) }))}
                  className="w-full bg-white border border-[var(--color-whisper)] rounded-lg px-2.5 py-2 text-xs text-[var(--color-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)] transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Content / Feedback */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
              Review Content / Feedback *
            </label>
            <textarea
              value={addForm.body}
              onChange={e => setAddForm(f => ({ ...f, body: e.target.value }))}
              rows={3}
              placeholder="Enter customer review text..."
              className="w-full bg-white border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-xs text-[var(--color-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)] resize-none transition-all leading-relaxed shadow-2xs"
            />
          </div>

          {/* Row 4: Toggles */}
          <div className="flex flex-wrap items-center gap-4 pt-2.5 pb-1 border-t border-[var(--color-whisper)]">
            <div
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => setAddForm(f => ({ ...f, is_published: !f.is_published }))}
            >
              <button
                type="button"
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                  addForm.is_published ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                    addForm.is_published ? 'translate-x-4.5' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-xs font-medium text-[var(--color-ink)]">
                {addForm.is_published ? 'Published (Live)' : 'Hidden (Draft)'}
              </span>
            </div>

            <div
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => setAddForm(f => ({ ...f, is_verified_purchase: !f.is_verified_purchase }))}
            >
              <button
                type="button"
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                  addForm.is_verified_purchase ? 'bg-[var(--color-gold)]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                    addForm.is_verified_purchase ? 'translate-x-4.5' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-xs font-medium text-[var(--color-ink)] flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                Verified Buyer
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3.5 mt-3 border-t border-[var(--color-whisper)]">
          <button
            type="button"
            onClick={() => setAddingProductId(null)}
            disabled={isSaving}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[var(--color-slate)] hover:bg-[var(--color-whisper)] transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleCreateReview(product)}
            disabled={isSaving}
            className="flex items-center gap-1.5 bg-[var(--color-gold)] text-white rounded-lg px-4 py-1.5 font-semibold text-xs hover:opacity-90 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
          >
            {isSaving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving…</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Save Review</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  // Handle Save Review (Edit) - Auto closes on success
  const handleSaveEdit = async () => {
    if (!editingReview) return;
    if (!editForm.body.trim()) {
      toast.error('Review text content is required');
      return;
    }

    setIsSaving(true);
    const productSlug = editingReview.product?.slug;

    try {
      const res = await updateAdminReview(editingReview.id, {
        reviewer_name: editForm.reviewer_name,
        rating: editForm.rating,
        title: editForm.title,
        body: editForm.body,
        quality_rating: editForm.quality_rating,
        fit_rating: editForm.fit_rating,
        is_verified_purchase: editForm.is_verified_purchase,
        is_published: editForm.is_published,
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
      setEditingReview(null); // Auto-close rectangular box
    } catch (err: any) {
      toast.error(err?.message || 'Error updating review');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Create Review - Auto closes on success
  const handleCreateReview = async (specificProduct?: ProductWithReviewStats) => {
    const target = specificProduct || targetProductForAdd;
    if (!target) {
      toast.error('Please select a product');
      return;
    }
    if (!addForm.body.trim()) {
      toast.error('Review text content is required');
      return;
    }

    setIsSaving(true);
    try {
      const res = await createAdminReview(target.id, {
        reviewer_name: addForm.reviewer_name || 'Verified Customer',
        rating: addForm.rating,
        title: addForm.title,
        body: addForm.body,
        quality_rating: addForm.quality_rating,
        fit_rating: addForm.fit_rating,
        is_verified_purchase: addForm.is_verified_purchase,
        is_published: addForm.is_published,
        product_slug: target.slug,
      });

      if (!res.success || !res.data) {
        toast.error(res.error || 'Failed to create review');
        return;
      }

      const created: AdminProductReview = {
        ...res.data,
        product: {
          id: target.id,
          name: target.name,
          slug: target.slug,
          sku: target.sku,
          image_url: target.image_url,
        },
      };

      setReviews(prev => [created, ...prev]);

      // Update product stats
      setProducts(prev => prev.map(p => {
        if (p.id === target.id) {
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

      toast.success(`Review created for "${target.name}"!`);
      setAddingProductId(null); // Auto-close rectangular box
      setAddForm(initialAddForm);
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
          onClick={() => openInlineAdd('top')}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 font-medium text-sm transition-all shadow-sm self-start sm:self-auto cursor-pointer ${
            addingProductId === 'top'
              ? 'bg-[var(--color-ink)] text-white'
              : 'bg-[var(--color-gold)] text-white hover:opacity-90'
          }`}
        >
          {addingProductId === 'top' ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{addingProductId === 'top' ? 'Close Review Form' : 'Write Customer Review'}</span>
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

      {/* Top Inline Add Box (if opened from top button) */}
      <AnimatePresence>
        {addingProductId === 'top' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderInlineAddBox(undefined, 'wide')}
          </motion.div>
        )}
      </AnimatePresence>

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
                            <div key={r.id} className="space-y-2">
                              <div
                                className={`p-3 rounded-xl border text-xs space-y-1 transition-colors ${
                                  editingReview?.id === r.id
                                    ? 'bg-[var(--color-gold)]/5 border-[var(--color-gold)]/50'
                                    : 'bg-[var(--color-snow)] border-[var(--color-whisper)] hover:border-[var(--color-gold)]/40'
                                }`}
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
                                      className={`p-1 rounded transition-colors ml-1 cursor-pointer ${
                                        editingReview?.id === r.id
                                          ? 'bg-[var(--color-gold-light)] text-[var(--color-gold)]'
                                          : 'text-[var(--color-slate)] hover:text-[var(--color-gold)]'
                                      }`}
                                      title={editingReview?.id === r.id ? 'Close inline editor' : 'Edit this review'}
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                {r.title && <p className="font-medium text-[var(--color-ink)] truncate">{r.title}</p>}
                                <p className="text-[var(--color-slate)] line-clamp-2 leading-relaxed">{r.body}</p>
                              </div>

                              {editingReview?.id === r.id && (
                                <motion.div
                                  initial={{ opacity: 0, y: -6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -6 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {renderInlineEditBox(r, 'card')}
                                </motion.div>
                              )}
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

                      {/* Inline Add Box inside Product Card */}
                      {addingProductId === product.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.2 }}
                        >
                          {renderInlineAddBox(product, 'card')}
                        </motion.div>
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
                        onClick={() => openInlineAdd(product)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                          addingProductId === product.id
                            ? 'bg-[var(--color-gold)] text-white'
                            : 'bg-white border border-[var(--color-whisper)] text-[var(--color-gold)] hover:border-[var(--color-gold)]'
                        }`}
                      >
                        {addingProductId === product.id ? '✕ Close' : '+ Add Review'}
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
                          onClick={() => openInlineAdd('top')}
                          className="mt-3 text-xs text-[var(--color-gold)] hover:underline font-semibold cursor-pointer"
                        >
                          + Write a review for any product
                        </button>
                      </td>
                    </tr>
                  )}
                  {filteredReviews.map((review, i) => (
                    <Fragment key={review.id}>
                      <tr
                        className={`transition-colors ${
                          editingReview?.id === review.id
                            ? 'bg-[var(--color-gold)]/5 border-l-4 border-l-[var(--color-gold)]'
                            : 'hover:bg-[var(--color-snow)]/60'
                        }`}
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
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                editingReview?.id === review.id
                                  ? 'bg-[var(--color-gold-light)] text-[var(--color-gold)]'
                                  : 'hover:bg-[var(--color-whisper)] text-[var(--color-slate)] hover:text-[var(--color-gold)]'
                              }`}
                              title={editingReview?.id === review.id ? 'Close inline editor' : 'Edit this review'}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(review)}
                              disabled={deletingId === review.id}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--color-slate)] hover:text-red-500 transition-colors disabled:opacity-50 cursor-pointer"
                              title="Delete this review"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Rectangular box just below the review */}
                      {editingReview?.id === review.id && (
                        <tr key={`inline-edit-${review.id}`} className="bg-[var(--color-snow)]/40 border-b border-[var(--color-whisper)]">
                          <td colSpan={6} className="px-6 py-3">
                            <motion.div
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.2 }}
                            >
                              {renderInlineEditBox(review, 'table')}
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

