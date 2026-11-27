'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { useCart } from '@/lib/hooks/useCart';
import type { ProductCardData } from '@/lib/actions/recommendations';
import {
  Heart,
  ShoppingBag,
  Trash2,
  Share2,
  ArrowLeft,
  ArrowUpRight,
  Sparkles,
  Loader2,
  Check,
  SlidersHorizontal,
} from 'lucide-react';

type SortMode = 'recent' | 'price-asc' | 'price-desc';

export function WishlistClient({ recommendations }: { recommendations: ProductCardData[] }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { items, isLoading: wishlistLoading, removeItem, clearWishlist, toggleItem, isInWishlist } =
    useWishlist();
  const { addItem: addToBag } = useCart();

  const [sortBy, setSortBy] = useState<SortMode>('recent');
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [sharedCopied, setSharedCopied] = useState(false);

  const showSkeleton = wishlistLoading || (authLoading && items.length === 0);

  const sortedItems = useMemo(() => {
    const copy = [...items];
    if (sortBy === 'price-asc') {
      copy.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-desc') {
      copy.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      copy.sort(
        (a, b) =>
          new Date(b.addedAt || b.created_at || 0).getTime() -
          new Date(a.addedAt || a.created_at || 0).getTime()
      );
    }
    return copy;
  }, [items, sortBy]);

  const handleMoveToBag = async (item: (typeof items)[number]) => {
    if (!item.inStock) {
      toast.error('This piece is currently out of stock.');
      return;
    }
    setBusyItemId(item.id);
    try {
      const added = await addToBag(
        {
          productId: item.product_id || item.productId || item.id,
          variantId: item.variant_id || item.product_id || item.id,
          product_name: item.name,
          price: item.price,
          image: item.image,
          size: item.size || 'M',
          color: item.color || 'Default',
          color_hex: item.colorHex || '#C9A84C',
          quantity: 1,
        },
        1
      );
      if (added) {
        await removeItem(item.product_id || item.id, item.variant_id || undefined);
        toast.success(`Moved ${item.name} to your shopping bag.`);
      } else {
        toast.error('Could not add item to bag. Kept safely in your wishlist.');
      }
    } finally {
      setBusyItemId(null);
    }
  };

  const handleConfirmClearAll = async () => {
    setClearingAll(true);
    try {
      await clearWishlist();
      setConfirmClear(false);
    } finally {
      setClearingAll(false);
    }
  };

  const handleShareWishlist = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : 'https://angelikafashions.com/wishlist';
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'My Angelika Fashions Wishlist',
          text: 'Curated luxury ethnic ensembles from Angelika Fashions',
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setSharedCopied(true);
      toast.success('Wishlist link copied to clipboard.');
      setTimeout(() => setSharedCopied(false), 2500);
    } catch {
      // User dismissed native share sheet
    }
  };

  const filteredRecommendations = useMemo(() => {
    const savedIds = new Set(items.map((i) => i.product_id || i.id));
    return recommendations.filter((rec) => !savedIds.has(rec.id)).slice(0, 4);
  }, [recommendations, items]);

  return (
    <div className="min-h-screen bg-[#EFEAE2] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={isAuthenticated ? '/account' : '/shop'}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5A544B] hover:text-[#1A1A1A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#A4832E]" />
            {isAuthenticated ? 'Back to Account Overview' : 'Continue Shopping'}
          </Link>
          <span className="text-[11px] uppercase tracking-[0.18em] text-[#7A7065] font-semibold">
            Curated Selections
          </span>
        </div>

        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-6 border-b border-[#DED5C8]">
          <div>
            <h1 className="font-display text-3xl sm:text-5xl font-medium text-[#1A1A1A] tracking-tight">
              My Wishlist
            </h1>
            <p className="text-sm text-[#5A544B] mt-2">
              {showSkeleton
                ? 'Loading your curated pieces...'
                : items.length === 0
                  ? 'Save handcrafted silhouettes you love and revisit them anytime.'
                  : `${items.length} curated ${items.length === 1 ? 'piece' : 'pieces'} saved to your personal wardrobe.`}
            </p>
          </div>

          {!showSkeleton && items.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#E5DDD2]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#74590E]" />
                <label htmlFor="wishlist-sort" className="sr-only">
                  Sort wishlist
                </label>
                <select
                  id="wishlist-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortMode)}
                  className="bg-transparent text-xs font-semibold text-[#1A1A1A] focus:outline-none cursor-pointer"
                >
                  <option value="recent">Recently Added</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleShareWishlist}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#FFFFFF] text-[#1A1A1A] border border-[#E5DDD2] hover:border-[#C9A84C] transition-colors cursor-pointer"
              >
                {sharedCopied ? (
                  <Check className="w-3.5 h-3.5 text-[#067647]" />
                ) : (
                  <Share2 className="w-3.5 h-3.5 text-[#74590E]" />
                )}
                {sharedCopied ? 'Link Copied' : 'Share'}
              </button>

              {!confirmClear ? (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#FFFFFF] text-[#B42318] border border-[#E5DDD2] hover:bg-[#FEF2F2] hover:border-[#FECACA] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
                  <span className="text-xs font-semibold text-[#991B1B]">Clear all {items.length}?</span>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FFFFFF] text-[#1A1A1A] border border-[#E5DDD2] cursor-pointer"
                  >
                    Keep
                  </button>
                  <button
                    type="button"
                    disabled={clearingAll}
                    onClick={handleConfirmClearAll}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#B42318] text-[#FFFFFF] hover:bg-[#991B1B] cursor-pointer disabled:opacity-50"
                  >
                    {clearingAll ? 'Clearing...' : 'Confirm'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {showSkeleton ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] overflow-hidden">
                <div className="aspect-[3/4] bg-[#E8E0D5]" />
                <div className="p-4 space-y-2.5">
                  <div className="h-4 w-3/4 rounded bg-[#E8E0D5]" />
                  <div className="h-5 w-1/3 rounded bg-[#E8E0D5]" />
                  <div className="h-10 w-full rounded-xl bg-[#EFEAE2]" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="rounded-3xl bg-[#FFFFFF] border border-[#E5DDD2] p-12 sm:p-16 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF4E8] border border-[#E6D5B0] flex items-center justify-center mx-auto mb-5">
              <Heart className="w-7 h-7 text-[#947218]" />
            </div>
            <h2 className="font-display text-3xl font-medium text-[#1A1A1A]">
              Your Wishlist Awaits
            </h2>
            <p className="text-sm text-[#5A544B] max-w-md mx-auto mt-2 leading-relaxed">
              Curate your favorite silk kurtis, bridal lehengas, and heirloom sarees here. Everything stays synced across devices once signed in.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-xs font-semibold uppercase tracking-[0.16em] bg-[#161310] text-[#FAF6F0] hover:bg-[#2A2520] transition-colors"
              >
                <Sparkles className="w-4 h-4 text-[#E6C77A]" />
                Explore Collections
              </Link>
              {!isAuthenticated && (
                <Link
                  href="/login?redirect=/wishlist"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-[0.14em] bg-[#FAF8F4] text-[#1A1A1A] border border-[#DFD5C8] hover:border-[#C9A84C] transition-colors"
                >
                  Sign In to Sync Wishlist
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {sortedItems.map((item) => {
                const productHref = `/product/${item.slug || item.product_id}`;
                const isMoving = busyItemId === item.id;
                return (
                  <motion.article
                    layout
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] overflow-hidden flex flex-col justify-between shadow-xs hover:border-[#C9A84C] hover:shadow-[0_14px_34px_rgba(22,19,16,0.08)] transition-all group"
                  >
                    <div className="relative aspect-[3/4] bg-[#F5EFE6] overflow-hidden">
                      <Link href={productHref} className="block w-full h-full">
                        <img
                          src={item.image || '/images/collection-kurtis.jpg'}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>

                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {item.discount > 0 && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#161310] text-[#E6C77A]">
                            {item.discount}% Off
                          </span>
                        )}
                        {!item.inStock && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.product_id || item.id, item.variant_id || undefined)}
                        aria-label={`Remove ${item.name} from wishlist`}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#FFFFFF]/95 text-[#B42318] border border-[#E5DDD2] hover:bg-[#FEF2F2] flex items-center justify-center shadow-sm transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4 flex flex-col justify-between flex-1 space-y-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#74590E]">
                          {item.category || 'Angelika Atelier'}
                        </p>
                        <Link
                          href={productHref}
                          className="font-display text-lg font-semibold text-[#1A1A1A] hover:text-[#74590E] line-clamp-2 mt-0.5 leading-snug"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-base font-bold text-[#1A1A1A]">
                            ₹{Number(item.price || 0).toLocaleString('en-IN')}
                          </span>
                          {item.originalPrice > item.price && (
                            <span className="text-xs text-[#8E8477] line-through">
                              ₹{Number(item.originalPrice).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        {(item.size || item.color) && (
                          <p className="text-[11px] text-[#6B6258] mt-1">
                            {item.size ? `Size: ${item.size}` : ''}
                            {item.size && item.color && item.color !== 'Default' ? ' · ' : ''}
                            {item.color && item.color !== 'Default' ? item.color : ''}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-[#F1EAE0]">
                        <button
                          type="button"
                          disabled={isMoving || !item.inStock}
                          onClick={() => handleMoveToBag(item)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold uppercase tracking-[0.12em] bg-[#161310] text-[#FAF6F0] hover:bg-[#2A2520] transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isMoving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9A84C]" />
                          ) : (
                            <ShoppingBag className="w-3.5 h-3.5 text-[#E6C77A]" />
                          )}
                          {item.inStock ? 'Move to Bag' : 'Sold Out'}
                        </button>
                        <Link
                          href={productHref}
                          aria-label={`View ${item.name} details`}
                          className="p-2.5 rounded-xl bg-[#FAF8F4] border border-[#DFD5C8] text-[#1A1A1A] hover:border-[#C9A84C] transition-colors"
                        >
                          <ArrowUpRight className="w-4 h-4 text-[#74590E]" />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Live Database Recommendations */}
        {filteredRecommendations.length > 0 && (
          <section className="pt-8 border-t border-[#DED5C8] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#74590E] font-semibold">
                  Atelier Curations
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#1A1A1A] mt-0.5">
                  Pieces You Might Love
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[#74590E] hover:text-[#1A1A1A]"
              >
                View Entire Boutique →
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredRecommendations.map((rec) => {
                const img =
                  rec.images?.find((im) => im.is_primary)?.url ||
                  rec.images?.[0]?.url ||
                  '/images/collection-kurtis.jpg';
                const saved = isInWishlist(rec.id);
                return (
                  <div
                    key={rec.id}
                    className="rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] overflow-hidden shadow-xs hover:border-[#C9A84C] transition-all group"
                  >
                    <div className="relative aspect-[3/4] bg-[#F5EFE6] overflow-hidden">
                      <Link href={`/product/${rec.slug}`} className="block w-full h-full">
                        <img
                          src={img}
                          alt={rec.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          toggleItem({
                            id: rec.id,
                            product_id: rec.id,
                            slug: rec.slug,
                            name: rec.name,
                            price: rec.price,
                            originalPrice: rec.compare_at_price || rec.price,
                            discount: rec.discount || 0,
                            image: img,
                            category: rec.category?.name || 'Atelier',
                            inStock: true,
                          })
                        }
                        aria-label={saved ? `Remove ${rec.name} from wishlist` : `Save ${rec.name} to wishlist`}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#FFFFFF]/95 border border-[#E5DDD2] flex items-center justify-center shadow-sm hover:border-[#C9A84C] cursor-pointer"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            saved ? 'fill-[#B42318] text-[#B42318]' : 'text-[#5A544B]'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="p-4">
                      <Link
                        href={`/product/${rec.slug}`}
                        className="font-display text-base font-semibold text-[#1A1A1A] hover:text-[#74590E] line-clamp-1"
                      >
                        {rec.name}
                      </Link>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-bold text-[#1A1A1A]">
                          ₹{Number(rec.price || 0).toLocaleString('en-IN')}
                        </span>
                        {rec.compare_at_price && rec.compare_at_price > rec.price && (
                          <span className="text-xs text-[#8E8477] line-through">
                            ₹{Number(rec.compare_at_price).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
