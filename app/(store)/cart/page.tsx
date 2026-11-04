'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { Card, CardContent, CardHeader, CardTitle, ProductCard } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { StaggerContainer, StaggerItem } from '@/components/animations/Stagger';
import { MagneticLinkButton } from '@/components/animations/MagneticLinkButton';
import { useCart } from '@/lib/hooks/useCart';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { getCartRecommendations, type ProductCardData } from '@/lib/actions/recommendations';
import toast from 'react-hot-toast';

const formatPrice = (val: number): string => {
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
};

const formatPricePlain = (val: number): string => {
  return Math.round(val).toLocaleString('en-IN');
};

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    shippingCost,
    taxAmount,
    discountAmount,
    total,
    itemCount,
    appliedCoupon,
    isLoading,
    error,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const { toggleItem: toggleWishlistItem, isInWishlist } = useWishlist();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [recommendations, setRecommendations] = useState<ProductCardData[]>([]);

  useEffect(() => {
    const itemIds = items.map((i) => i.product_id || i.id);
    getCartRecommendations(itemIds, 4)
      .then((data) => setRecommendations(data))
      .catch((err) => console.error('Failed to load cart recommendations:', err));
  }, [items]);

  const handleAddRecommendedToBag = async (rec: ProductCardData) => {
    try {
      await addItem(rec.id, 1, 'Free Size');
      toast.success(`Added "${rec.name}" to your bag!`);
    } catch (err) {
      toast.error('Could not add to bag. Please try again.');
    }
  };

  const handleToggleRecommendedWishlist = async (rec: ProductCardData) => {
    try {
      await toggleWishlistItem(rec.id);
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    }
  };

  const freeShippingThreshold = 2999;
  const freeShippingProgress = subtotal >= freeShippingThreshold ? 100 : Math.round((subtotal / freeShippingThreshold) * 100);
  const amountForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyCoupon = async () => {
    setCouponError('');
    const result = await applyCoupon(couponCode.toUpperCase().trim());
    if (!result.valid) {
      setCouponError(result.error || 'Invalid coupon code');
    } else {
      setCouponCode('');
    }
  };

  const handleRemoveCoupon = async () => {
    await removeCoupon();
  };

  const proceedToCheckout = () => {
    if (items.length === 0) return;
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[var(--color-white)]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--color-slate)]">Loading your bag...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[var(--color-white)]">
        <ScrollReveal variant="fadeUp" className="text-center max-w-md px-6">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--color-error-bg)] flex items-center justify-center">
            <svg className="h-12 w-12 text-[var(--color-error)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <h1 className="text-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)] mb-3">
            Unable to Load Cart
          </h1>
          <p className="text-[var(--color-slate)] mb-6">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </ScrollReveal>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-white)]">
        <section className="py-16">
          <div className="container-custom px-6">
            <ScrollReveal variant="fadeUp" className="text-center max-w-md mx-auto mb-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center">
                <svg className="h-12 w-12 text-[var(--color-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1 0 8" />
                </svg>
              </div>
              <h1 className="text-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)] mb-3">
                Your Bag is Empty
              </h1>
              <p className="text-[var(--color-slate)] mb-8">
                Looks like you haven't added anything to your bag yet. Start exploring our handcrafted collection!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <MagneticLinkButton size="lg" variant="primary" href="/shop">Continue Shopping</MagneticLinkButton>
                <MagneticLinkButton size="lg" variant="outline" href="/vidhyas-picks">View Vidhya's Picks</MagneticLinkButton>
              </div>
            </ScrollReveal>

            {/* Recommendations for empty cart */}
            {recommendations.length > 0 && (
              <div className="mt-16 pt-12 border-t border-[var(--color-whisper)]">
                <ScrollReveal variant="fadeUp" className="flex items-center justify-between mb-8">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-gold)] mb-1 block">
                      Curated Masterpieces
                    </span>
                    <h2 className="text-[var(--font-display)] text-2xl md:text-3xl font-medium text-[var(--color-ink)]">
                      You May Also Like
                    </h2>
                  </div>
                  <MagneticLinkButton variant="outline" href="/shop" strength={0.3}>
                    Explore Collection <span aria-hidden="true">→</span>
                  </MagneticLinkButton>
                </ScrollReveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendations.map((rec) => (
                    <ProductCard
                      key={rec.id}
                      image={rec.images[0]?.url || '/images/collection-kurtis.jpg'}
                      name={rec.name}
                      price={rec.price}
                      originalPrice={rec.compare_at_price ?? undefined}
                      category={rec.category?.name || 'Ethnic Wear'}
                      discount={rec.discount}
                      isVidhyasPick={rec.is_vidyas_pick}
                      isWishlisted={isInWishlist(rec.id)}
                      rating={rec.rating || 4.8}
                      reviewCount={rec.review_count || 12}
                      href={`/product/${rec.slug}`}
                      onAddToBag={() => handleAddRecommendedToBag(rec)}
                      onAddToWishlist={() => handleToggleRecommendedWishlist(rec)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  const hasOutOfStockItems = items.some(item => item.inventory_quantity === 0);

  return (
    <div className="min-h-screen bg-[var(--color-white)]">
      {/* Page Header */}
      <section className="bg-[var(--color-snow)] border-b border-[var(--color-whisper)] py-8">
        <div className="container-custom px-6">
          <ScrollReveal variant="fadeUp">
            <h1 className="text-[var(--font-display)] text-3xl md:text-4xl font-medium text-[var(--color-ink)]">
              Shopping Bag
            </h1>
            <p className="text-[var(--color-slate)] mt-1">
              {itemCount} item{itemCount !== 1 ? 's' : ''} in your bag
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-10">
        <div className="container-custom px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <ScrollReveal variant="fadeUp" className="lg:col-span-2 space-y-4">
              <StaggerContainer variant="default">
                {items.map((item, index) => (
                  <StaggerItem key={item.id} variant="slide" style={{ transitionDelay: `${index * 0.08}s` }}>
                    <div className="flex gap-4 p-4 bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-md)] transition-shadow duration-300">
                      <div className="relative w-24 h-32 sm:w-28 sm:h-36 flex-shrink-0 rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-whisper)]">
                        <Image
                          src={item.image}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                          sizes="112px"
                        />
                        {item.inventory_quantity === 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-sm font-semibold text-white bg-[var(--color-error)] px-3 py-1 rounded-[var(--radius-sm)]">Out of Stock</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <Link href={`/product/${item.product_id}`} className="hover:underline">
                              <h3 className="text-[var(--font-display)] text-lg font-medium text-[var(--color-ink)] line-clamp-2 mb-1">
                                {item.product_name}
                              </h3>
                            </Link>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-slate)]">
                              <span className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color_hex }} aria-hidden="true" />
                                {item.color}
                              </span>
                              <span>Size: {item.size}</span>
                            </div>
                            {item.inventory_quantity === 0 && (
                              <p className="text-sm text-[var(--color-error)] mt-1 flex items-center gap-1">
                                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-7a1 1 0 10-2 0v4a1 1 0 102 0V11zm0-2a1 1 0 10-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
                                </svg>
                                This item is currently out of stock
                              </p>
                            )}
                            {item.inventory_quantity > 0 && item.inventory_quantity < 5 && item.inventory_quantity < item.quantity && (
                              <p className="text-sm text-[var(--color-warning)] mt-1 flex items-center gap-1">
                                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Only {item.inventory_quantity} left in stock
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-[var(--color-mist)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-bg)] rounded-[var(--radius-md)] transition-colors flex-shrink-0"
                            aria-label={`Remove ${item.product_name} from bag`}
                          >
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>

                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm text-[var(--color-slate)]">
                              Qty:
                              <select
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                disabled={item.inventory_quantity === 0}
                                className="input py-1.5 px-3 text-sm w-auto"
                                aria-label={`Quantity for ${item.product_name}`}
                              >
                                {Array.from({ length: item.max_quantity }, (_, i) => i + 1).map(q => (
                                  <option key={q} value={q}>{q}</option>
                                ))}
                              </select>
                            </label>
                          </div>

                          <div className="flex items-baseline gap-3">
                            <span className="text-xl font-bold text-[var(--color-ink)] tabular-nums">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </ScrollReveal>

            {/* Coupon Section */}
            <StaggerItem variant="default" className="p-6 bg-[var(--color-snow)] border border-[var(--color-whisper)] rounded-[var(--radius-xl)]">
              <h3 className="text-[var(--font-display)] text-lg font-medium text-[var(--color-ink)] mb-4">Coupon Code</h3>
              {appliedCoupon ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3 p-4 bg-white border border-[var(--color-whisper)] rounded-[var(--radius-lg)]">
                    <svg className="h-6 w-6 text-[var(--color-success)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-[var(--color-ink)]">{appliedCoupon.code} applied</p>
                      <p className="text-sm text-[var(--color-success)]">
                        {appliedCoupon.type === 'percentage'
                          ? `${appliedCoupon.value}% off`
                          : appliedCoupon.type === 'free_shipping'
                          ? 'Free Shipping'
                          : `₹${formatPricePlain(appliedCoupon.discountAmount)} off`}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleRemoveCoupon}>
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                    className="flex-1"
                    aria-label="Coupon code"
                  />
                  <Button variant="primary" onClick={handleApplyCoupon} disabled={!couponCode.trim()}>
                    Apply
                  </Button>
                  {couponError && (
                    <p className="text-sm text-[var(--color-error)] mt-1 sm:mt-0 sm:ml-auto">{couponError}</p>
                  )}
                </div>
              )}
            </StaggerItem>

            {/* Continue Shopping */}
            <StaggerItem variant="slide" className="flex items-center justify-between p-6 bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-xl)]">
              <div>
                <p className="font-medium text-[var(--color-ink)]">Continue Shopping</p>
                <p className="text-sm text-[var(--color-slate)]">Add more items to qualify for free shipping</p>
              </div>
              <MagneticLinkButton variant="outline" href="/shop">Browse Collection</MagneticLinkButton>
            </StaggerItem>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <ScrollReveal variant="fadeUp" delay={0.2} className="sticky top-24 space-y-6">
                <Card variant="elevated" padding="lg">
                  <CardHeader>
                    <CardTitle className="text-[var(--font-display)] text-xl">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--color-slate)]">Subtotal ({itemCount} items)</span>
                        <span className="font-medium text-[var(--color-ink)]">{formatPrice(subtotal)}</span>
                      </div>
                      {discountAmount > 0 && appliedCoupon && (
                        <div className="flex justify-between text-sm text-[var(--color-success)]">
                          <span>Coupon ({appliedCoupon.code})</span>
                          <span className="font-medium">- {formatPrice(discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--color-slate)]">Shipping</span>
                        <span className="font-medium">
                          {shippingCost === 0 ? (
                            <span className="text-[var(--color-success)]">Free</span>
                          ) : (
                            formatPrice(shippingCost)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-[var(--color-slate)]">
                        <span>Estimated Tax (GST)</span>
                        <span className="font-medium">{taxAmount === 0 ? '₹0 (Included)' : formatPrice(taxAmount)}</span>
                      </div>
                      {shippingCost > 0 && (
                        <div className="relative">
                          <div className="h-2 bg-[var(--color-whisper)] rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-[var(--color-gold)] rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${freeShippingProgress}%` }}
                              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                            />
                          </div>
                          <p className="text-xs text-[var(--color-gold)] mt-1 text-center">
                            Add {formatPrice(amountForFreeShipping)} more for free shipping!
                          </p>
                        </div>
                      )}
                      <div className="border-t border-[var(--color-whisper)] pt-3">
                        <div className="flex justify-between text-lg font-bold">
                          <span className="text-[var(--color-ink)]">Total</span>
                          <span className="text-[var(--color-ink)]">{formatPrice(total)}</span>
                        </div>
                        <p className="text-xs text-[var(--color-mist)] mt-1">Inclusive of all taxes</p>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      className="w-full py-4 text-lg"
                      onClick={proceedToCheckout}
                      disabled={hasOutOfStockItems}
                    >
                      {hasOutOfStockItems ? 'Resolve Out of Stock Items' : 'Proceed to Checkout'}
                    </Button>

                    <LinkButton variant="outline" href="/shop" className="w-full">Continue Shopping</LinkButton>

                    <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-mist)]">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <span>Secure Checkout</span>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <rect x="2" y="4" width="20" height="14" rx="2" />
                        <path d="M16 10h-2a2 2 0 0 1 0-4h2" />
                      </svg>
                      <span>SSL Encrypted</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: '🚚', text: 'Free Shipping\n₹2999+' },
                    { icon: '🔒', text: 'Secure\nPayment' },
                    { icon: '↩️', text: '15-Day\nReturns' },
                    { icon: '💬', text: 'Chat with\nVidhya' },
                  ].map((badge, i) => (
                    <motion.div
                      key={i}
                      className="p-4 text-center bg-[var(--color-snow)] rounded-[var(--radius-lg)] border border-[var(--color-whisper)]"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                    >
                      <div className="text-2xl mb-2">{badge.icon}</div>
                      <p className="text-sm text-[var(--color-slate)] whitespace-pre-line">{badge.text}</p>
                    </motion.div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Cross-Sell Recommendations */}
          {recommendations.length > 0 && (
            <div className="mt-16 pt-12 border-t border-[var(--color-whisper)]">
              <ScrollReveal variant="fadeUp" className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-gold)] mb-1 block">
                    Complete Your Ensemble
                  </span>
                  <h2 className="text-[var(--font-display)] text-2xl md:text-3xl font-medium text-[var(--color-ink)]">
                    You May Also Like
                  </h2>
                </div>
                <MagneticLinkButton variant="outline" href="/shop" strength={0.3}>
                  Explore All <span aria-hidden="true">→</span>
                </MagneticLinkButton>
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendations.map((rec) => (
                  <ProductCard
                    key={rec.id}
                    image={rec.images[0]?.url || '/images/collection-kurtis.jpg'}
                    name={rec.name}
                    price={rec.price}
                    originalPrice={rec.compare_at_price ?? undefined}
                    category={rec.category?.name || 'Ethnic Wear'}
                    discount={rec.discount}
                    isVidhyasPick={rec.is_vidyas_pick}
                    isWishlisted={isInWishlist(rec.id)}
                    rating={rec.rating || 4.8}
                    reviewCount={rec.review_count || 12}
                    href={`/product/${rec.slug}`}
                    onAddToBag={() => handleAddRecommendedToBag(rec)}
                    onAddToWishlist={() => handleToggleRecommendedWishlist(rec)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}