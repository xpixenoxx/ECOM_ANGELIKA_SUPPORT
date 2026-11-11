'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  CustomerOrder,
  CustomerOrderItem,
  CustomerOrderItemReview,
  CustomerOrderItemReturn,
  submitCustomerOrderReview,
  submitCustomerReturnRequest,
  cancelCustomerOrder,
} from '@/lib/actions/customer-orders';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';
import { Star, CheckCircle, X, Sparkles, Edit3, RotateCcw, ArrowLeftRight, Truck, ShieldCheck, MapPin, AlertCircle, Package, Clock, CheckCircle2, XCircle } from 'lucide-react';
import DeliveryVanTracker from '@/components/orders/DeliveryVanTracker';

interface OrderDetailClientProps {
  order: CustomerOrder;
}

interface StatusConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
  pulse: boolean;
}

const statusConfigMap: Record<string, StatusConfig> = {
  confirmed: {
    label: 'Confirmed',
    badgeClass: 'bg-[#FAF5EC] text-[#8F6A1E] border-[#E8D7B8] shadow-2xs',
    dotClass: 'bg-[#C9A84C]',
    pulse: true,
  },
  processing: {
    label: 'Processing',
    badgeClass: 'bg-[#FFFBEB] text-[#9A5B0B] border-[#FDE68A] shadow-2xs',
    dotClass: 'bg-[#D97706]',
    pulse: true,
  },
  shipped: {
    label: 'Shipped',
    badgeClass: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0] shadow-2xs',
    dotClass: 'bg-[#16A34A]',
    pulse: true,
  },
  delivered: {
    label: 'Delivered',
    badgeClass: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0] shadow-2xs',
    dotClass: 'bg-[#059669]',
    pulse: false,
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]',
    dotClass: 'bg-[#E11D48]',
    pulse: false,
  },
  returned: {
    label: 'Returned',
    badgeClass: 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]',
    dotClass: 'bg-[#64748B]',
    pulse: false,
  },
};

function formatPrice(amount: number): string {
  if (!amount || amount <= 0) return '0';
  return Math.round(amount).toLocaleString('en-IN');
}

export default function OrderDetailClient({ order }: OrderDetailClientProps) {
  const [currentOrder, setCurrentOrder] = useState<CustomerOrder>(order);
  const statusKey = (currentOrder.status || 'confirmed').toLowerCase();
  const statusConfig = statusConfigMap[statusKey] || {
    label: currentOrder.status || 'Confirmed',
    badgeClass: 'bg-[#FAF5EC] text-[#8F6A1E] border-[#E8D7B8] shadow-2xs',
    dotClass: 'bg-[#C9A84C]',
    pulse: true,
  };

  // Cancellation States
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed mind / No longer needed');
  const [cancelReasonDetail, setCancelReasonDetail] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const isCancellable =
    ['pending', 'confirmed', 'processing'].includes(statusKey) &&
    !currentOrder.shipped_at &&
    statusKey !== 'shipped' &&
    statusKey !== 'delivered' &&
    statusKey !== 'cancelled' &&
    statusKey !== 'returned';

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      const fullReason = cancelReasonDetail.trim()
        ? `${cancelReason}: ${cancelReasonDetail.trim()}`
        : cancelReason;

      const res = await cancelCustomerOrder({
        orderId: currentOrder.id,
        reason: fullReason,
      });

      if (res.success) {
        toast.success(`Order ${currentOrder.order_number} has been cancelled successfully.`);
        setCurrentOrder((prev) => ({
          ...prev,
          status: 'cancelled',
          cancelled_at: res.cancelled_at || new Date().toISOString(),
          cancel_reason: fullReason,
        }));
        setShowCancelModal(false);
      } else {
        toast.error(res.error || 'Failed to cancel order.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred while cancelling order.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Map initial reviews by item.id
  const initialMap: Record<string, CustomerOrderItemReview> = {};
  // Map initial returns by item.id
  const initialReturnsMap: Record<string, CustomerOrderItemReturn> = {};
  order.items.forEach((it) => {
    if (it.existing_review) {
      initialMap[it.id] = it.existing_review;
    }
    if (it.existing_return) {
      initialReturnsMap[it.id] = it.existing_return;
    }
  });

  const [itemReviews, setItemReviews] = useState<Record<string, CustomerOrderItemReview>>(initialMap);
  const [itemReturns, setItemReturns] = useState<Record<string, CustomerOrderItemReturn>>(initialReturnsMap);
  const [activeReviewItem, setActiveReviewItem] = useState<CustomerOrderItem | null>(null);
  const [activeReturnItem, setActiveReturnItem] = useState<CustomerOrderItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Return Form States
  const [returnType, setReturnType] = useState<'return' | 'exchange'>('return');
  const [returnReason, setReturnReason] = useState('size');
  const [returnReasonDetail, setReturnReasonDetail] = useState('');
  const [exchangeSize, setExchangeSize] = useState('M');

  // Reverse Pickup Address (pre-filled from order's shipping address)
  const initialAddr: any = order.shipping_address || {};
  const [pickupName, setPickupName] = useState(
    [initialAddr.firstName, initialAddr.lastName].filter(Boolean).join(' ') || initialAddr.full_name || order.customer_name || ''
  );
  const [pickupPhone, setPickupPhone] = useState(initialAddr.phone || order.phone || '');
  const [pickupAddress, setPickupAddress] = useState(initialAddr.address1 || initialAddr.address || initialAddr.street_address || '');
  const [pickupCity, setPickupCity] = useState(initialAddr.city || '');
  const [pickupState, setPickupState] = useState(initialAddr.state || '');
  const [pickupPincode, setPickupPincode] = useState(initialAddr.pincode || initialAddr.postal_code || '');

  const returnReasonOptions = [
    { value: 'size', label: 'Size Issue (Too tight, too loose, or length problem)' },
    { value: 'fit', label: 'Fit & Silhouette (Cut or drape does not sit well)' },
    { value: 'quality', label: 'Fabric & Craftsmanship (Quality not as expected)' },
    { value: 'damaged', label: 'Defective or Damaged Garment received' },
    { value: 'wrong_item', label: 'Wrong Item or Color received' },
    { value: 'changed_mind', label: 'Changed mind / No longer needed' },
    { value: 'other', label: 'Other reason' },
  ];

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

  const handleOpenReturnModal = (item: CustomerOrderItem) => {
    setActiveReturnItem(item);
    setReturnType('return');
    setReturnReason('size');
    setReturnReasonDetail('');
    setExchangeSize(item.variant_details?.size || 'M');

    const addr: any = order.shipping_address || {};
    setPickupName([addr.firstName, addr.lastName].filter(Boolean).join(' ') || addr.full_name || order.customer_name || '');
    setPickupPhone(addr.phone || order.phone || '');
    setPickupAddress(addr.address1 || addr.address || addr.street_address || '');
    setPickupCity(addr.city || '');
    setPickupState(addr.state || '');
    setPickupPincode(addr.pincode || addr.postal_code || '');
  };

  const handleCloseReturnModal = () => {
    if (isSubmittingReturn) return;
    setActiveReturnItem(null);
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReturnItem) return;

    if (!pickupName.trim() || !pickupPhone.trim() || !pickupAddress.trim() || !pickupCity.trim() || !pickupPincode.trim()) {
      toast.error('Please complete all reverse pickup address fields (Name, Phone, Address, City, PIN)');
      return;
    }

    setIsSubmittingReturn(true);
    try {
      const refundAmount = activeReturnItem.total_price || (activeReturnItem.unit_price * activeReturnItem.quantity);
      const res = await submitCustomerReturnRequest({
        orderId: order.id,
        orderItemId: activeReturnItem.id,
        type: returnType,
        reason: returnReason,
        reasonDetail: returnReasonDetail,
        pickupAddress: {
          name: pickupName.trim(),
          phone: pickupPhone.trim(),
          address: pickupAddress.trim(),
          city: pickupCity.trim(),
          state: pickupState.trim(),
          pincode: pickupPincode.trim(),
        },
        exchangeSize: returnType === 'exchange' ? exchangeSize : undefined,
        refundAmount,
      });

      if (res.success && res.returnRecord) {
        toast.success(
          returnType === 'exchange'
            ? 'Exchange request recorded! Our concierge will arrange doorstep pickup.'
            : 'Return request submitted! Doorstep reverse pickup has been initiated.',
          { icon: '📦' }
        );
        setItemReturns((prev) => ({
          ...prev,
          [activeReturnItem.id]: res.returnRecord!,
        }));
        setActiveReturnItem(null);
      } else {
        toast.error(res.error || 'Failed to submit return request');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit return request');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const shiprocketStatus = (currentOrder.metadata?.['shiprocket_status'] as string | undefined) || null;
  const normalizedSrStatus = (shiprocketStatus || '').toUpperCase().replace(/[\s-]+/g, '_');
  const isOutForDelivery = normalizedSrStatus === 'OUT_FOR_DELIVERY' || statusKey === 'out_for_delivery';

  // Build timeline from real timestamps
  const timelineSteps = statusKey === 'cancelled'
    ? [
        {
          status: 'Order Placed',
          date: currentOrder.created_at,
          completed: true,
          description: 'Your bespoke order was received and logged into our atelier.',
        },
        {
          status: 'Order Cancelled',
          date: currentOrder.cancelled_at,
          completed: true,
          description: currentOrder.cancel_reason
            ? `Cancelled prior to shipment: ${currentOrder.cancel_reason}`
            : 'Order cancelled prior to courier shipment.',
        },
      ]
    : [
        {
          status: 'Order Placed',
          date: currentOrder.created_at,
          completed: true,
          description: 'Your bespoke order was received and logged into our atelier.',
        },
        {
          status: 'Confirmed',
          date: currentOrder.created_at,
          completed: true,
          description: 'Order details verified & scheduled for master artisan preparation.',
        },
        {
          status: 'Processing & Quality Check',
          date: ['processing', 'shipped', 'delivered'].includes(statusKey) ? currentOrder.created_at : null,
          completed: ['processing', 'shipped', 'delivered'].includes(statusKey),
          description: 'Garments undergo 3-tier fabric inspection & luxury gift packaging.',
        },
        {
          status: 'Dispatched from Atelier',
          date: currentOrder.shipped_at || (['shipped', 'delivered'].includes(statusKey) ? currentOrder.created_at : null),
          completed: ['shipped', 'delivered'].includes(statusKey),
          description: currentOrder.courier_partner
            ? `Handed over to ${currentOrder.courier_partner}${currentOrder.tracking_number ? ` (AWB: ${currentOrder.tracking_number})` : ''}.`
            : 'Dispatched via premium express courier partner.',
        },
        {
          status: 'In Transit',
          date: currentOrder.shipped_at || null,
          completed: statusKey === 'delivered' || (statusKey === 'shipped' && normalizedSrStatus !== 'PICKED_UP'),
          description: 'En route through express courier network toward your destination hub.',
        },
        {
          status: 'Out for Delivery',
          date: statusKey === 'delivered' ? currentOrder.delivered_at : null,
          completed: statusKey === 'delivered' || isOutForDelivery,
          description: 'Local courier executive is on the way to your doorstep.',
        },
        {
          status: 'Delivered',
          date: currentOrder.delivered_at,
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
              <div
                className={cn(
                  'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase border transition-all duration-200 select-none shadow-2xs',
                  statusConfig.badgeClass
                )}
              >
                <span className="relative flex h-2 w-2">
                  {statusConfig.pulse && (
                    <span
                      className={cn(
                        'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                        statusConfig.dotClass
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      'relative inline-flex rounded-full h-2 w-2',
                      statusConfig.dotClass
                    )}
                  />
                </span>
                <span>{statusConfig.label}</span>
              </div>

              {/* Cancel Order Action - ONLY available until shipped */}
              {isCancellable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCancelModal(true)}
                  className="cursor-pointer border-rose-300 bg-rose-50/80 text-rose-800 hover:bg-rose-100 flex items-center gap-1.5 shadow-2xs"
                  title="Cancel order before courier dispatch"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Cancel Order</span>
                </Button>
              )}

              {statusKey === 'delivered' && order.items.some((i) => (i.is_return_eligible ?? true) && !itemReturns[i.id] && !i.existing_return) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const eligibleItem = order.items.find((i) => (i.is_return_eligible ?? true) && !itemReturns[i.id] && !i.existing_return);
                    if (eligibleItem) handleOpenReturnModal(eligibleItem);
                  }}
                  className="cursor-pointer border-amber-300 bg-amber-50/70 text-amber-900 hover:bg-amber-100 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                  <span>Return / Exchange</span>
                </Button>
              )}
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
              {/* Order Cancelled Alert Banner */}
              {statusKey === 'cancelled' && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 shadow-xs">
                  <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-rose-950">This Order Has Been Cancelled</h4>
                    <p className="text-xs text-rose-800 mt-0.5">
                      {currentOrder.cancelled_at && (
                        <span>Cancelled on {new Date(currentOrder.cancelled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}. </span>
                      )}
                      {currentOrder.cancel_reason ? `Reason: ${currentOrder.cancel_reason}` : 'Cancelled prior to courier dispatch.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Shipped / Dispatch In-Transit Notification - Explicitly states why cancellation is closed */}
              {statusKey === 'shipped' && (
                <div className="p-4 bg-blue-50/90 border border-blue-200 rounded-2xl flex items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold shadow-xs">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-950">Package Handed Over to Courier &bull; In Transit</h4>
                      <p className="text-xs text-blue-800 mt-0.5">
                        This order has been dispatched via <strong>{currentOrder.courier_partner || 'Courier Partner'}</strong> and can no longer be cancelled. You can easily initiate a return or exchange once the package arrives at your doorstep.
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                      const existingRet = itemReturns[item.id] || item.existing_return;
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

                          {/* Existing Return / Exchange Banner if already requested */}
                          {existingRet && (
                            <div className="mt-4 p-3.5 bg-amber-50/70 border border-amber-200/90 rounded-2xl flex items-center justify-between flex-wrap gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                                  {existingRet.type === 'exchange' ? (
                                    <ArrowLeftRight className="w-4 h-4 text-amber-700" />
                                  ) : (
                                    <RotateCcw className="w-4 h-4 text-amber-700" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-amber-950">
                                      {existingRet.type === 'exchange' ? 'Exchange Requested' : 'Return Requested'}
                                    </span>
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300/50">
                                      {existingRet.status}
                                    </span>
                                  </div>
                                  <p className="text-xs text-amber-800 mt-0.5">
                                    {existingRet.type === 'exchange' && existingRet.exchange_size
                                      ? `Replacement Size: ${existingRet.exchange_size} • Reverse pickup scheduled`
                                      : `Expected Refund: ₹${formatPrice(existingRet.refund_amount || (item.total_price || item.unit_price * item.quantity))} • Reverse pickup scheduled`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-amber-900 font-medium bg-white/90 px-3 py-1.5 rounded-xl border border-amber-200/60 shadow-xs">
                                <Truck className="w-3.5 h-3.5 text-amber-700" />
                                <span>Free Doorstep Pickup</span>
                              </div>
                            </div>
                          )}

                          {/* Delivered: Actions Section */}
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

                              <div className="flex items-center gap-2">
                                {!existingRet && (
                                  (item.is_return_eligible ?? true) ? (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenReturnModal(item)}
                                      className="px-4 py-2 text-xs font-semibold rounded-full uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-xs border border-amber-300 bg-amber-50/70 text-amber-900 hover:bg-amber-100"
                                      title={item.days_left !== undefined ? `${item.days_left} days left to return` : undefined}
                                    >
                                      <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                                      <span>Return Item</span>
                                      {item.days_left !== undefined && item.days_left > 0 && (
                                        <span className="text-[10px] font-normal text-amber-700">({item.days_left}d left)</span>
                                      )}
                                    </button>
                                  ) : item.return_window_days === 0 ? (
                                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                                      Final Sale (Non-Returnable)
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/80">
                                      Return window closed ({item.return_window_days || 7}d policy)
                                    </span>
                                  )
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
                                      <span>Rate &amp; Review</span>
                                    </>
                                  )}
                                </button>
                              </div>
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
                <CardTitle className="text-[var(--font-display)] text-lg mb-4">Fulfillment Timeline</CardTitle>

                {/* Animated 3D Angelika Delivery Van Route */}
                <DeliveryVanTracker
                  status={currentOrder.status}
                  shiprocketStatus={shiprocketStatus}
                  courierPartner={currentOrder.courier_partner}
                  trackingNumber={currentOrder.tracking_number}
                  createdAt={currentOrder.created_at}
                  shippedAt={currentOrder.shipped_at}
                  deliveredAt={currentOrder.delivered_at}
                  cancelledAt={currentOrder.cancelled_at}
                  destinationCity={shippingAddr.city || null}
                  className="mb-6"
                />

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

        {/* Customer Return & Exchange Modal */}
        {activeReturnItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseReturnModal}
            />

            <motion.div
              className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--color-whisper)] max-h-[90vh] overflow-y-auto z-10"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-[var(--color-whisper)]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)]">
                      Hassle-Free Returns &amp; Exchanges
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                      7-Day Window Active
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-ink)]">
                    {returnType === 'exchange' ? 'Exchange Garment Size' : 'Return & Refund Request'}
                  </h3>
                  <p className="text-xs text-[var(--color-slate)] mt-0.5">
                    Order #{order.order_number}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseReturnModal}
                  disabled={isSubmittingReturn}
                  className="p-2 rounded-full hover:bg-[var(--color-snow)] text-[var(--color-slate)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Item preview card */}
              <div className="p-3.5 bg-[var(--color-snow)] rounded-2xl border border-[var(--color-whisper)] flex items-center gap-4 mb-6">
                <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-white border border-[var(--color-whisper)] flex-shrink-0">
                  <img
                    src={activeReturnItem.variant_details?.image || activeReturnItem.variant_details?.image_url || '/images/collection-kurtis.jpg'}
                    alt={activeReturnItem.product_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-[var(--color-ink)] line-clamp-1">
                    {activeReturnItem.product_name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-slate)] mt-1">
                    {activeReturnItem.variant_details?.size && (
                      <span className="bg-white px-2 py-0.5 rounded border border-[var(--color-whisper)] font-medium">
                        Current Size: {activeReturnItem.variant_details.size}
                      </span>
                    )}
                    <span>Qty: {activeReturnItem.quantity}</span>
                  </div>
                  <div className="text-sm font-bold text-[var(--color-ink)] mt-1">
                    ₹{formatPrice(activeReturnItem.total_price || activeReturnItem.unit_price * activeReturnItem.quantity)}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitReturn} className="space-y-5">
                {/* Type Selector: Return vs Exchange */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                    Select Resolution Type *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setReturnType('return')}
                      className={cn(
                        'p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1',
                        returnType === 'return'
                          ? 'border-[var(--color-gold)] bg-[var(--color-gold-light)]/20 shadow-xs ring-1 ring-[var(--color-gold)]'
                          : 'border-[var(--color-whisper)] bg-white hover:bg-[var(--color-snow)]'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <RotateCcw className={cn('w-4 h-4', returnType === 'return' ? 'text-[var(--color-gold)]' : 'text-slate-400')} />
                        <span className="text-sm font-bold text-[var(--color-ink)]">Return &amp; Refund</span>
                      </div>
                      <span className="text-xs text-[var(--color-slate)]">
                        Refund ₹{formatPrice(activeReturnItem.total_price || activeReturnItem.unit_price * activeReturnItem.quantity)} to original payment source.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReturnType('exchange')}
                      className={cn(
                        'p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1',
                        returnType === 'exchange'
                          ? 'border-[var(--color-gold)] bg-[var(--color-gold-light)]/20 shadow-xs ring-1 ring-[var(--color-gold)]'
                          : 'border-[var(--color-whisper)] bg-white hover:bg-[var(--color-snow)]'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <ArrowLeftRight className={cn('w-4 h-4', returnType === 'exchange' ? 'text-[var(--color-gold)]' : 'text-slate-400')} />
                        <span className="text-sm font-bold text-[var(--color-ink)]">Size Exchange</span>
                      </div>
                      <span className="text-xs text-[var(--color-slate)]">
                        Swap for another size with doorstep handover. No fee.
                      </span>
                    </button>
                  </div>
                </div>

                {/* Exchange Size Selection (if returnType === 'exchange') */}
                {returnType === 'exchange' && (
                  <div className="p-4 bg-[var(--color-snow)]/60 rounded-2xl border border-[var(--color-whisper)]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] mb-2">
                      Select Replacement Size *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setExchangeSize(sz)}
                          className={cn(
                            'px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer',
                            exchangeSize === sz
                              ? 'border-[var(--color-gold)] bg-[var(--color-gold)] text-[var(--color-ink)] font-bold shadow-xs'
                              : 'border-[var(--color-whisper)] bg-white text-[var(--color-slate)] hover:border-[var(--color-gold)]'
                          )}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-[var(--color-slate)] mt-2">
                      Subject to atelier stock. If preferred size is unavailable, full refund will be processed.
                    </p>
                  </div>
                )}

                {/* Reason for Return / Exchange */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                    Reason for Return / Exchange *
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-whisper)] text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] bg-white"
                  >
                    {returnReasonOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Detailed Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                    Additional Notes or Fit Comments <span className="text-[var(--color-slate)] font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={returnReasonDetail}
                    onChange={(e) => setReturnReasonDetail(e.target.value)}
                    placeholder="Please share any specific details (e.g., tight around chest, hem too long, loose on waist)..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-whisper)] text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] bg-white resize-none"
                  />
                </div>

                {/* Reverse Doorstep Pickup Details */}
                <div className="p-4 bg-[var(--color-snow)]/70 rounded-2xl border border-[var(--color-whisper)] space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-whisper)]">
                    <Truck className="w-4 h-4 text-[var(--color-gold)]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                      Reverse Pickup Address (Doorstep Collection)
                    </h4>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--color-slate)] mb-1">
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        value={pickupName}
                        onChange={(e) => setPickupName(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-[var(--color-whisper)] text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--color-slate)] mb-1">
                        Contact Phone *
                      </label>
                      <input
                        type="text"
                        value={pickupPhone}
                        onChange={(e) => setPickupPhone(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-[var(--color-whisper)] text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-slate)] mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-whisper)] text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--color-slate)] mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={pickupCity}
                        onChange={(e) => setPickupCity(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-[var(--color-whisper)] text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--color-slate)] mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={pickupState}
                        onChange={(e) => setPickupState(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[var(--color-whisper)] text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--color-slate)] mb-1">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        value={pickupPincode}
                        onChange={(e) => setPickupPincode(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-[var(--color-whisper)] text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Assurance Callout */}
                <div className="flex items-start gap-3 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Angelika Couture Assurance:</strong> Reverse pickup agent will collect the ensemble in original packaging with tags intact. Refund or exchange replacement will be processed swiftly upon arrival.
                  </p>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-whisper)]">
                  <button
                    type="button"
                    onClick={handleCloseReturnModal}
                    disabled={isSubmittingReturn}
                    className="px-5 py-2.5 rounded-full text-xs font-semibold text-[var(--color-slate)] hover:bg-[var(--color-snow)] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReturn}
                    className="px-6 py-2.5 rounded-full bg-[var(--color-gold)] hover:bg-[var(--color-gold-hover)] text-[var(--color-ink)] font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingReturn ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-[var(--color-ink)] border-t-transparent rounded-full animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        <span>
                          {returnType === 'exchange' ? 'Confirm Size Exchange' : 'Confirm Return & Refund'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Customer Order Cancellation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => !isCancelling && setShowCancelModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[var(--color-whisper)] p-6 sm:p-8 z-10 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-rose-600 block">
                    Order Cancellation Request
                  </span>
                  <h3 className="text-xl font-serif text-[var(--color-ink)] mt-0.5">
                    Cancel Order #{currentOrder.order_number}?
                  </h3>
                  <p className="text-xs text-[var(--color-slate)] mt-1">
                    Your order is currently being prepared in our atelier and has not yet been handed over to our courier partner. You can cancel it now.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setShowCancelModal(false)}
                  className="p-1.5 rounded-full text-[var(--color-mist)] hover:text-[var(--color-ink)] hover:bg-[var(--color-snow)] transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order Summary Snapshot */}
              <div className="p-3.5 bg-[var(--color-snow)] rounded-2xl border border-[var(--color-whisper)] flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-[var(--color-ink)]">
                    {currentOrder.items?.length ?? 1} item{((currentOrder.items?.length ?? 1) > 1) ? 's' : ''}
                  </p>
                  <p className="text-[11px] text-[var(--color-slate)]">
                    Total Amount: <strong className="text-[var(--color-ink)]">₹{formatPrice(currentOrder.total_amount)}</strong>
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  Ready to Cancel
                </span>
              </div>

              {/* Reason Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-slate)]">
                  Please select a reason for cancellation *
                </label>
                <div className="space-y-2">
                  {[
                    'Changed mind / No longer needed',
                    'Ordered wrong size or color',
                    'Want to change delivery address or phone',
                    'Found another outfit or design',
                    'Delivery date or processing time takes too long',
                    'Other reason',
                  ].map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        cancelReason === r
                          ? 'border-[var(--color-gold)] bg-[var(--color-gold-light)]/40 text-[var(--color-ink)] font-semibold'
                          : 'border-[var(--color-whisper)] hover:bg-[var(--color-snow)] text-[var(--color-slate)]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        checked={cancelReason === r}
                        onChange={() => setCancelReason(r)}
                        className="text-[var(--color-gold)] focus:ring-[var(--color-gold)]"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-slate)] mb-1">
                    Additional notes (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={cancelReasonDetail}
                    onChange={(e) => setCancelReasonDetail(e.target.value)}
                    placeholder="Provide any feedback for Vidhya's atelier..."
                    className="w-full p-3 rounded-xl border border-[var(--color-whisper)] text-xs text-[var(--color-ink)] placeholder-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] bg-[var(--color-snow)]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-whisper)]">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setShowCancelModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-[var(--color-slate)] hover:bg-[var(--color-snow)] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleConfirmCancel}
                  className="px-6 py-2.5 rounded-full text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isCancelling ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Cancelling Order...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Confirm Cancellation</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
