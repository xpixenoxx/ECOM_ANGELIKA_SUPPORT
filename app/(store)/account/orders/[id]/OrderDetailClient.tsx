'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  CustomerOrder,
  CustomerOrderItem,
  CustomerOrderItemReview,
  submitCustomerOrderReview,
} from '@/lib/actions/customer-orders';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';
import { Star, CheckCircle, X, Sparkles, Edit3 } from 'lucide-react';

interface OrderDetailClientProps {
  order: CustomerOrder;
}

const statusStyles: Record<string, string> = {
  delivered: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  shipped: 'bg-[var(--color-info-bg)] text-[var(--color-info)]',
  processing: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  confirmed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  cancelled: 'bg-[var(--color-error-bg)] text-[var(--color-error)]',
  returned: 'bg-[var(--color-slate)]/10 text-[var(--color-slate)]',
};

function formatPrice(amount: number): string {
  if (!amount || amount <= 0) return '0';
  return Math.round(amount).toLocaleString('en-IN');
}

export default function OrderDetailClient({ order }: OrderDetailClientProps) {
  const statusKey = (order.status || 'confirmed').toLowerCase();
  const statusBadgeClass = statusStyles[statusKey] || 'bg-slate-100 text-slate-700';

  // Map initial reviews by item.id
  const initialMap: Record<string, CustomerOrderItemReview> = {};
  order.items.forEach((it) => {
    if (it.existing_review) {
      initialMap[it.id] = it.existing_review;
    }
  });

  const [itemReviews, setItemReviews] = useState<Record<string, CustomerOrderItemReview>>(initialMap);
  const [activeReviewItem, setActiveReviewItem] = useState<CustomerOrderItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Review form states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [reviewerName, setReviewerName] = useState(order.customer_name || '');
  const [qualityRating, setQualityRating] = useState(5);
  const [fitRating, setFitRating] = useState(5);

  const ratingDescriptions: Record<number, string> = {
    5: 'Exceptional — True Royal Couture & Craftsmanship',
    4: 'Very Good — Luxurious Fabric & Beautiful Fit',
    3: 'Average — Met Standard Expectations',
    2: 'Below Expectation — Fabric or Fit Issues',
    1: 'Poor — Unsatisfactory',
  };

  const handleOpenReviewModal = (item: CustomerOrderItem) => {
    const existing = itemReviews[item.id] || item.existing_review;
    setActiveReviewItem(item);
    if (existing) {
      setRating(existing.rating || 5);
      setTitle(existing.title || '');
      setBody(existing.body || '');
      setReviewerName(existing.reviewer_name || order.customer_name || '');
      setQualityRating(existing.quality_rating || 5);
      setFitRating(existing.fit_rating || 5);
    } else {
      setRating(5);
      setTitle('');
      setBody('');
      setReviewerName(order.customer_name || '');
      setQualityRating(5);
      setFitRating(5);
    }
  };

  const handleCloseReviewModal = () => {
    if (isSubmitting) return;
    setActiveReviewItem(null);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewItem) return;

    if (!title.trim()) {
      toast.error('Please enter a review headline');
      return;
    }
    if (!body.trim()) {
      toast.error('Please describe your experience with this ensemble');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitCustomerOrderReview({
        orderId: order.id,
        orderItemId: activeReviewItem.id,
        productId: activeReviewItem.product_id || activeReviewItem.product_name,
        productName: activeReviewItem.product_name,
        rating,
        title: title.trim(),
        body: body.trim(),
        reviewerName: reviewerName.trim() || order.customer_name || 'Verified Customer',
        qualityRating,
        fitRating,
      });

      if (res.success && res.review) {
        toast.success('Thank you! Your verified review has been published.', { icon: '✨' });
        setItemReviews((prev) => ({
          ...prev,
          [activeReviewItem.id]: res.review!,
        }));
        setActiveReviewItem(null);
      } else {
        toast.error(res.error || 'Failed to submit review');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build timeline from real timestamps
  const timelineSteps = [
    {
      status: 'Order Placed',
      date: order.created_at,
      completed: true,
      description: 'Your bespoke order was received and logged into our atelier.',
    },
    {
      status: 'Confirmed',
      date: order.created_at,
      completed: true,
      description: 'Order details verified & scheduled for master artisan preparation.',
    },
    {
      status: 'Processing & Quality Check',
      date: order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? order.created_at : null,
      completed: ['processing', 'shipped', 'delivered'].includes(statusKey),
      description: 'Garments undergo 3-tier fabric inspection & luxury gift packaging.',
    },
    {
      status: 'Dispatched & In Transit',
      date: order.shipped_at || (['shipped', 'delivered'].includes(statusKey) ? order.created_at : null),
      completed: ['shipped', 'delivered'].includes(statusKey),
      description: order.courier_partner
        ? `Handed over to ${order.courier_partner}${order.tracking_number ? ` (AWB: ${order.tracking_number})` : ''}.`
        : 'Dispatched via premium express courier partner.',
    },
    {
      status: 'Delivered',
      date: order.delivered_at,
      completed: statusKey === 'delivered',
      description: 'Handcrafted couture safely delivered to your doorstep.',
    },
  ];

  const shippingAddr: any = order.shipping_address || {};
  const recipientName =
    [shippingAddr.firstName, shippingAddr.lastName].filter(Boolean).join(' ') ||
    shippingAddr.full_name ||
    order.customer_name ||
    'Customer';

  const addressLine1 = shippingAddr.address1 || shippingAddr.address || shippingAddr.street_address || '';
  const addressLine2 = shippingAddr.address2 || shippingAddr.landmark || '';
  const cityStateZip = [
    shippingAddr.city,
    shippingAddr.state,
    shippingAddr.pincode || shippingAddr.postal_code,
  ].filter(Boolean).join(', ');

  const phone = shippingAddr.phone || order.phone || '—';
  const email = shippingAddr.email || order.email || '—';

  return (
    <div className="min-h-screen bg-[var(--color-white)]">
      {/* Page Header */}
      <section className="bg-[var(--color-snow)] border-b border-[var(--color-whisper)] py-8">
        <div className="container-custom px-6 max-w-5xl mx-auto">
          <motion.div
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <Link
                href="/account/orders"
                className="text-sm text-[var(--color-slate)] hover:text-[var(--color-gold)] mb-2 inline-flex items-center gap-1.5 transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Back to My Orders</span>
              </Link>
              <h1 className="text-[var(--font-display)] text-2xl sm:text-3xl font-medium text-[var(--color-ink)]">
                Order <span className="font-mono">{order.order_number}</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn('px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-full uppercase tracking-wider', statusBadgeClass)}>
                {order.status}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="cursor-pointer"
              >
                Print Invoice
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-custom px-6 max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Items & Timeline */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivered Feedback Prompt Banner */}
              {statusKey === 'delivered' && (
                <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold shadow-xs">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-950">Delivered &amp; Handcrafted With Pride</h4>
                      <p className="text-xs text-emerald-800">Please review your purchased garments below. Your feedback helps fellow patrons and master artisans.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items Card */}
              <Card variant="elevated" padding="none" className="border border-[var(--color-whisper)] rounded-2xl overflow-hidden">
                <CardHeader className="p-6 bg-[var(--color-snow)]/60 border-b border-[var(--color-whisper)]">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[var(--font-display)] text-lg">Purchased Ensembles</CardTitle>
                    <span className="text-xs sm:text-sm text-[var(--color-slate)]">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-[var(--color-whisper)]">
                    {order.items.map((item, index) => {
                      const itemImg = item.variant_details?.image || item.variant_details?.image_url || '/images/collection-kurtis.jpg';
                      const existingRev = itemReviews[item.id] || item.existing_review;
                      return (
                        <motion.div
                          key={item.id}
                          className="p-5"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="flex gap-4 items-center">
                            <div className="relative w-20 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-[var(--color-whisper)] border border-[var(--color-whisper)]">
                              <img
                                src={itemImg}
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-[var(--color-ink)] line-clamp-2 mb-1">
                                {item.product_name}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-slate)] mb-1">
                                {item.variant_details?.size && (
                                  <span className="bg-[var(--color-snow)] px-2 py-0.5 rounded border border-[var(--color-whisper)]">
                                    Size: {item.variant_details.size}
                                  </span>
                                )}
                                {item.variant_details?.color && item.variant_details.color !== 'Default' && (
                                  <span className="bg-[var(--color-snow)] px-2 py-0.5 rounded border border-[var(--color-whisper)]">
                                    Color: {item.variant_details.color}
                                  </span>
                                )}
                                <span>Quantity: <strong>{item.quantity}</strong></span>
                              </div>
                              <div className="text-sm font-semibold text-[var(--color-ink)]">
                                ₹{formatPrice(item.total_price || item.unit_price * item.quantity)}
                                {item.quantity > 1 && (
                                  <span className="text-xs text-[var(--color-slate)] font-normal ml-2">
                                    (₹{formatPrice(item.unit_price)} each)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Delivered: Review Section */}
                          {statusKey === 'delivered' && (
                            <div className="mt-4 pt-3 border-t border-[var(--color-whisper)] flex items-center justify-between flex-wrap gap-2">
                              {existingRev ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <div className="flex items-center text-amber-500">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={cn(
                                          'w-4 h-4',
                                          star <= existingRev.rating ? 'fill-current' : 'text-slate-200'
                                        )}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                                    Reviewed ({existingRev.rating}★)
                                  </span>
                                  {existingRev.title && (
                                    <span className="text-xs text-[var(--color-slate)] italic line-clamp-1">
                                      &ldquo;{existingRev.title}&rdquo;
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-xs text-[var(--color-slate)]">
                                  <Sparkles className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                                  <span>How was the fabric &amp; craftsmanship? Share your review with Vidhya.</span>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenReviewModal(item)}
                                className={cn(
                                  "px-4 py-2 text-xs font-semibold rounded-full uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-xs",
                                  existingRev
                                    ? "bg-white hover:bg-[var(--color-gold-light)] text-[var(--color-ink)] hover:text-[var(--color-gold)] border border-[var(--color-whisper)]"
                                    : "bg-[var(--color-gold)] hover:bg-[var(--color-gold-hover)] text-[var(--color-ink)]"
                                )}
                              >
                                {existingRev ? (
                                  <>
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Edit Review</span>
                                  </>
                                ) : (
                                  <>
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <span>Rate &amp; Review Product</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Order Timeline */}
              <Card variant="elevated" padding="lg" className="border border-[var(--color-whisper)] rounded-2xl">
                <CardTitle className="text-[var(--font-display)] text-lg mb-6">Fulfillment Timeline</CardTitle>
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--color-whisper)]">
                  {timelineSteps.map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-4">
                      <div
                        className={cn(
                          'absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white',
                          step.completed
                            ? 'bg-[var(--color-gold)] shadow-xs'
                            : 'bg-slate-200'
                        )}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={cn('text-sm font-semibold', step.completed ? 'text-[var(--color-ink)]' : 'text-[var(--color-slate)]')}>
                            {step.status}
                          </h4>
                          {step.date && (
                            <span className="text-xs text-[var(--color-slate)]">
                              {new Date(step.date).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--color-slate)] mt-0.5">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Courier & Tracking if available */}
              {order.courier_partner && (
                <Card variant="elevated" padding="lg" className="border border-[var(--color-whisper)] rounded-2xl bg-[var(--color-snow)]/60">
                  <CardTitle className="text-[var(--font-display)] text-base mb-3">Live Dispatch Details</CardTitle>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-[var(--color-slate)] block">Carrier Partner</span>
                      <strong className="text-[var(--color-ink)]">{order.courier_partner}</strong>
                    </div>
                    {order.tracking_number && (
                      <div>
                        <span className="text-xs text-[var(--color-slate)] block">Tracking Airway Bill (AWB)</span>
                        <strong className="font-mono text-[var(--color-ink)]">{order.tracking_number}</strong>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Right Column: Order Summary, Shipping Address, Payment */}
            <div className="space-y-6">
              {/* Pricing Breakdown */}
              <Card variant="elevated" padding="lg" className="border border-[var(--color-whisper)] rounded-2xl">
                <CardTitle className="text-[var(--font-display)] text-base mb-4">Financial Summary</CardTitle>
                <dl className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-slate)]">Subtotal ({order.items_count} items)</dt>
                    <dd className="font-medium text-[var(--color-ink)]">₹{formatPrice(order.subtotal || order.total_amount)}</dd>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <dt>Privilege Voucher Discount</dt>
                      <dd className="font-medium">-₹{formatPrice(order.discount_amount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-slate)]">Express Delivery</dt>
                    <dd className="font-medium text-[var(--color-ink)]">
                      {order.shipping_cost === 0 ? <span className="text-emerald-600 font-semibold">FREE</span> : `₹${formatPrice(order.shipping_cost)}`}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-slate)]">GST & Taxes</dt>
                    <dd className="text-xs text-[var(--color-slate)]">Included</dd>
                  </div>
                  <div className="border-t border-[var(--color-whisper)] pt-3 flex justify-between text-base font-bold text-[var(--color-ink)]">
                    <dt>Total Amount</dt>
                    <dd className="text-lg text-[var(--color-gold)]">₹{formatPrice(order.total_amount)}</dd>
                  </div>
                </dl>
              </Card>

              {/* Shipping Address */}
              <Card variant="elevated" padding="lg" className="border border-[var(--color-whisper)] rounded-2xl">
                <CardTitle className="text-[var(--font-display)] text-base mb-3">Delivery Destination</CardTitle>
                <address className="text-sm text-[var(--color-slate)] not-italic space-y-1">
                  <p className="font-semibold text-[var(--color-ink)]">{recipientName}</p>
                  {addressLine1 && <p>{addressLine1}</p>}
                  {addressLine2 && <p>{addressLine2}</p>}
                  {cityStateZip && <p>{cityStateZip}</p>}
                  <div className="pt-2 border-t border-[var(--color-whisper)] mt-2 text-xs">
                    <p>Contact Phone: <strong className="text-[var(--color-ink)]">{phone}</strong></p>
                    <p>Notification Email: <strong className="text-[var(--color-ink)]">{email}</strong></p>
                  </div>
                </address>
              </Card>

              {/* Payment Details */}
              <Card variant="elevated" padding="lg" className="border border-[var(--color-whisper)] rounded-2xl">
                <CardTitle className="text-[var(--font-display)] text-base mb-3">Payment Info</CardTitle>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-slate)]">Method</dt>
                    <dd className="font-semibold text-[var(--color-ink)] capitalize">
                      {order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 'Prepaid Online (UPI / Card)'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-slate)]">Status</dt>
                    <dd className={cn('font-semibold text-xs uppercase px-2 py-0.5 rounded', order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>
                      {order.payment_status}
                    </dd>
                  </div>
                </dl>
              </Card>

              {/* Concierge Assistance */}
              <Card variant="elevated" padding="lg" className="border border-[var(--color-whisper)] rounded-2xl bg-[var(--color-gold-light)]/20">
                <CardTitle className="text-[var(--font-display)] text-base mb-2">Need Concierge Support?</CardTitle>
                <p className="text-xs text-[var(--color-slate)] mb-4 leading-relaxed">
                  Have questions about delivery time, custom stitching, or styling suggestions for this order?
                </p>
                <a
                  href={`https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(`Hi Vidhya, I have an inquiry regarding my order ${order.order_number}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                  </svg>
                  <span>Chat with Vidhya on WhatsApp</span>
                </a>
              </Card>
            </div>
          </div>
        </div>
      </section>
      {/* Customer Review Modal */}
      <AnimatePresence>
        {activeReviewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseReviewModal}
            />

            <motion.div
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--color-whisper)] max-h-[90vh] overflow-y-auto z-10"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-[var(--color-whisper)]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)] mb-1 block">
                    Verified Customer Feedback
                  </span>
                  <h3 className="text-xl font-bold text-[var(--color-ink)]">
                    {itemReviews[activeReviewItem.id] ? 'Edit Your Review' : 'Rate & Review Ensemble'}
                  </h3>
                  <p className="text-xs text-[var(--color-slate)] mt-0.5 line-clamp-1">
                    {activeReviewItem.product_name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseReviewModal}
                  className="p-2 rounded-full hover:bg-[var(--color-snow)] text-[var(--color-slate)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-5">
                {/* Overall Rating */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                    Overall Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = (hoverRating || rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 transition-transform hover:scale-110 cursor-pointer"
                        >
                          <Star
                            className={cn(
                              'w-8 h-8 transition-colors',
                              isActive
                                ? 'text-[var(--color-gold)] fill-current'
                                : 'text-slate-200'
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-[var(--color-gold)] font-medium mt-1.5 min-h-[1rem]">
                    {ratingDescriptions[hoverRating || rating]}
                  </p>
                </div>

                {/* Reviewer Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                    Your Name (Displayed with review) *
                  </label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    required
                    placeholder="e.g. Sowmya Ramanathan"
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-whisper)] text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] bg-white"
                  />
                </div>

                {/* Review Headline */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                    Review Headline *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Authentic Kanchipuram Weave & Perfect Korvai Border"
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-whisper)] text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] bg-white"
                  />
                </div>

                {/* Detailed Review */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                    Detailed Experience *
                  </label>
                  <textarea
                    rows={4}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                    placeholder="Describe the fabric quality, zari shine, color vibrancy, draping feel, or occasion worn..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-whisper)] text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] bg-white resize-none"
                  />
                </div>

                {/* Quality & Fit Ratings */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-[var(--color-snow)]/60 rounded-2xl border border-[var(--color-whisper)]">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-slate)] mb-1">
                      Fabric &amp; Zari Quality
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setQualityRating(s)}
                          className="cursor-pointer"
                        >
                          <Star
                            className={cn(
                              'w-4 h-4',
                              s <= qualityRating ? 'text-[var(--color-gold)] fill-current' : 'text-slate-200'
                            )}
                          />
                        </button>
                      ))}
                      <span className="text-xs text-[var(--color-slate)] ml-1 font-medium">{qualityRating}/5</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-slate)] mb-1">
                      Silhouette &amp; Fit
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setFitRating(s)}
                          className="cursor-pointer"
                        >
                          <Star
                            className={cn(
                              'w-4 h-4',
                              s <= fitRating ? 'text-[var(--color-gold)] fill-current' : 'text-slate-200'
                            )}
                          />
                        </button>
                      ))}
                      <span className="text-xs text-[var(--color-slate)] ml-1 font-medium">{fitRating}/5</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-whisper)]">
                  <button
                    type="button"
                    onClick={handleCloseReviewModal}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-full text-xs font-semibold text-[var(--color-slate)] hover:bg-[var(--color-snow)] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-full bg-[var(--color-gold)] hover:bg-[var(--color-gold-hover)] text-[var(--color-ink)] font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-[var(--color-ink)] border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Submit Review</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
