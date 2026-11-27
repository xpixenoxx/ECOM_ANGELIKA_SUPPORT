'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CustomerOrder,
  CustomerOrderItem,
  CustomerOrderItemReview,
  CustomerOrderItemReturn,
  submitCustomerOrderReview,
  submitCustomerReturnRequest,
  cancelCustomerOrder,
} from '@/lib/actions/customer-orders';
import { canCustomerCancelOrder } from '@/lib/orders/state-machine';
import { useCart } from '@/lib/hooks/useCart';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';
import {
  Star,
  CheckCircle,
  X,
  Sparkles,
  Edit3,
  RotateCcw,
  ArrowLeftRight,
  Truck,
  ShieldCheck,
  MapPin,
  AlertCircle,
  Package,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  XCircle,
} from 'lucide-react';

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
  const searchParams = useSearchParams();
  const { addItem: addToBag } = useCart();
  const [currentStatus, setCurrentStatus] = useState((order.status || 'confirmed').toLowerCase());
  const statusKey = currentStatus;
  const statusBadgeClass = statusStyles[statusKey] || 'bg-slate-100 text-slate-700';
  const [showCancelModal, setShowCancelModal] = useState(false);
  const cancelDialogRef = useRef<HTMLDialogElement>(null);
  const cancelDialogPressedOutsideRef = useRef(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [copiedAwb, setCopiedAwb] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  // Sync native <dialog> top-layer modal open/close for Cancel Order confirmation
  useEffect(() => {
    const dialog = cancelDialogRef.current;
    if (!dialog) return;
    if (showCancelModal) {
      if (!dialog.open) {
        try {
          dialog.showModal();
        } catch {
          // Ignore if already open
        }
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [showCancelModal]);

  // Auto-open browser print dialog cleanly when opened via Invoice shortcut (?print=1)
  useEffect(() => {
    if (searchParams.get('print') === '1' && typeof window !== 'undefined') {
      const timer = window.setTimeout(() => {
        window.print();
      }, 350);
      return () => window.clearTimeout(timer);
    }
  }, [searchParams]);

  const handleReorderAll = async () => {
    if (!order.items || order.items.length === 0) return;
    setIsReordering(true);
    try {
      let added = 0;
      for (const item of order.items) {
        const ok = await addToBag(
          {
            productId: item.product_id || item.id,
            variantId: item.variant_id || item.product_id || item.id,
            product_name: item.product_name,
            price: Number(item.unit_price || 0),
            image: item.variant_details?.image || item.variant_details?.image_url || '/images/collection-kurtis.jpg',
            size: item.variant_details?.size || 'M',
            color: item.variant_details?.color || 'Default',
            color_hex: item.variant_details?.color_hex || '#C9A84C',
            quantity: Math.max(1, item.quantity || 1),
          },
          Math.max(1, item.quantity || 1)
        );
        if (ok) added += 1;
      }
      if (added > 0) {
        toast.success(`Added ${added} ${added === 1 ? 'piece' : 'pieces'} to your bag.`);
      } else {
        toast.error('Items from this order are currently unavailable.');
      }
    } finally {
      setIsReordering(false);
    }
  };

  const handleCopyAwb = async () => {
    if (!order.tracking_number) return;
    try {
      await navigator.clipboard.writeText(order.tracking_number);
      setCopiedAwb(true);
      toast.success(`Copied AWB ${order.tracking_number}`);
      setTimeout(() => setCopiedAwb(false), 2000);
    } catch {
      toast.error('Could not copy AWB.');
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

  // Build timeline from real timestamps (handling cancelled orders accurately)
  const timelineSteps =
    statusKey === 'cancelled'
      ? [
          {
            status: 'Order Placed',
            date: order.created_at,
            completed: true,
            cancelled: false,
            description: 'Your bespoke order was received and logged into our atelier.',
          },
          {
            status: 'Order Cancelled',
            date: order.cancelled_at || order.updated_at || order.created_at,
            completed: true,
            cancelled: true,
            description:
              order.cancel_reason
                ? `Reason: ${order.cancel_reason}`
                : 'This order was cancelled. Any online payment is refunded automatically to your original payment method.',
          },
        ]
      : [
          {
            status: 'Order Placed',
            date: order.created_at,
            completed: true,
            cancelled: false,
            description: 'Your bespoke order was received and logged into our atelier.',
          },
          {
            status: 'Confirmed',
            date: order.created_at,
            completed: true,
            cancelled: false,
            description: 'Order details verified & scheduled for master artisan preparation.',
          },
          {
            status: 'Processing & Quality Check',
            date: ['processing', 'shipped', 'delivered'].includes(statusKey) ? order.created_at : null,
            completed: ['processing', 'shipped', 'delivered'].includes(statusKey),
            cancelled: false,
            description: 'Garments undergo 3-tier fabric inspection & luxury gift packaging.',
          },
          {
            status: 'Dispatched & In Transit',
            date: order.shipped_at || (['shipped', 'delivered'].includes(statusKey) ? order.created_at : null),
            completed: ['shipped', 'delivered'].includes(statusKey),
            cancelled: false,
            description: order.courier_partner
              ? `Handed over to ${order.courier_partner}${order.tracking_number ? ` (AWB: ${order.tracking_number})` : ''}.`
              : 'Dispatched via premium express courier partner.',
          },
          {
            status: 'Delivered',
            date: order.delivered_at,
            completed: statusKey === 'delivered',
            cancelled: false,
            description: 'Handcrafted couture safely delivered to your doorstep.',
          },
        ];

  const liveTrackerHref = order.tracking_token
    ? `/track-order?order=${encodeURIComponent(order.order_number)}&token=${encodeURIComponent(order.tracking_token)}`
    : `/track-order`;

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
    <div className="min-h-screen bg-[#EFEAE2] print:bg-[#FFFFFF]">
      {/* Print-Only Luxury GST Tax Invoice Masthead */}
      <div className="hidden print:block px-8 pt-6 pb-4 border-b-2 border-[#161310]">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-2xl font-bold tracking-wide text-[#161310]">
              ANGELIKA FASHIONS
            </p>
            <p className="text-xs text-[#5A544B] mt-0.5">
              Handcrafted Luxury Ethnic Wear · Hyderabad Atelier · angelikafashions.com
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#161310]">
              Tax Invoice / Order Receipt
            </p>
            <p className="font-mono text-sm font-bold text-[#161310] mt-1">{order.order_number}</p>
            <p className="text-xs text-[#5A544B]">
              Issued: {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <section className="bg-[#FAF8F4] border-b border-[#E5DDD2] py-7 print:hidden">
        <div className="container-custom px-6 max-w-5xl mx-auto">
          <motion.div
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <Link
                href="/account/orders"
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5A544B] hover:text-[#1A1A1A] mb-2 inline-flex items-center gap-1.5 transition-colors"
              >
                <svg className="h-4 w-4 text-[#A4832E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Back to My Orders</span>
              </Link>
              <h1 className="font-display text-2xl sm:text-4xl font-medium text-[#1A1A1A]">
                Order <span className="font-mono text-xl sm:text-3xl">{order.order_number}</span>
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={cn('px-3.5 py-1.5 text-xs font-semibold rounded-full uppercase tracking-wider border', statusBadgeClass)}>
                {currentStatus.replace(/_/g, ' ')}
              </span>
              <button
                type="button"
                disabled={isReordering}
                onClick={handleReorderAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FFFFFF] text-[#1A1A1A] border border-[#DFD5C8] hover:border-[#C9A84C] transition-colors cursor-pointer disabled:opacity-50"
              >
                {isReordering ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#A4832E]" /> : <RotateCcw className="w-3.5 h-3.5 text-[#74590E]" />}
                <span>Buy Again</span>
              </button>
              {canCustomerCancelOrder(statusKey) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCancelModal(true)}
                  className="cursor-pointer border-rose-200 bg-rose-50/70 text-rose-800 hover:bg-rose-100"
                >
                  Cancel Order
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
                className="cursor-pointer bg-[#161310] text-[#FAF6F0] border-[#161310] hover:bg-[#2A2520] hover:text-[#FAF6F0]"
              >
                Print Invoice
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 sm:py-10 print:py-4">
        <div className="container-custom px-6 max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column: Items & Timeline */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cancelled Banner */}
              {statusKey === 'cancelled' && (
                <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-2xl flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-[#B42318] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#991B1B]">This Order Was Cancelled</h4>
                    <p className="text-xs text-[#991B1B]/90 mt-0.5 leading-relaxed">
                      {order.cancel_reason ? `Reason: ${order.cancel_reason}. ` : ''}
                      If you paid online, your refund is automatically initiated back to your original payment source within 5–7 business days.
                    </p>
                  </div>
                </div>
              )}

              {/* Delivered Feedback Prompt Banner */}
              {statusKey === 'delivered' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4 shadow-xs print:hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-[#FFFFFF] flex items-center justify-center flex-shrink-0 font-bold shadow-xs">
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
              <Card variant="elevated" padding="none" className="!bg-[#FFFFFF] border border-[#E5DDD2] rounded-2xl overflow-hidden shadow-xs">
                <CardHeader className="p-5 sm:p-6 bg-[#FAF8F4] border-b border-[#EAE2D6]">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className="font-display text-lg text-[#1A1A1A]">Purchased Ensembles</CardTitle>
                    <span className="text-xs sm:text-sm text-[#5A544B]">
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
                  <div className="divide-y divide-[#F1EAE0]">
                    {order.items.map((item, index) => {
                      const itemImg = item.variant_details?.image || item.variant_details?.image_url || '/images/collection-kurtis.jpg';
                      const existingRev = itemReviews[item.id] || item.existing_review;
                      const existingRet = itemReturns[item.id] || item.existing_return;
                      const productHref = item.product_slug ? `/product/${item.product_slug}` : null;
                      return (
                        <motion.div
                          key={item.id}
                          className="p-5"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="flex gap-4 items-center">
                            {productHref ? (
                              <Link
                                href={productHref}
                                className="relative w-20 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-[#F5EFE6] border border-[#E5DDD2] block group"
                              >
                                <img
                                  src={itemImg}
                                  alt={item.product_name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </Link>
                            ) : (
                              <div className="relative w-20 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-[#F5EFE6] border border-[#E5DDD2]">
                                <img
                                  src={itemImg}
                                  alt={item.product_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              {productHref ? (
                                <Link
                                  href={productHref}
                                  className="text-base font-semibold text-[#1A1A1A] hover:text-[#74590E] transition-colors line-clamp-2 mb-1 block"
                                >
                                  {item.product_name}
                                </Link>
                              ) : (
                                <h3 className="text-base font-semibold text-[#1A1A1A] line-clamp-2 mb-1">
                                  {item.product_name}
                                </h3>
                              )}
                              <div className="flex flex-wrap items-center gap-2 text-xs text-[#5A544B] mb-1.5">
                                {item.variant_details?.size && (
                                  <span className="bg-[#FAF8F4] px-2.5 py-0.5 rounded-md border border-[#E5DDD2] font-medium text-[#1A1A1A]">
                                    Size: {item.variant_details.size}
                                  </span>
                                )}
                                {item.variant_details?.color && item.variant_details.color !== 'Default' && (
                                  <span className="bg-[#FAF8F4] px-2.5 py-0.5 rounded-md border border-[#E5DDD2]">
                                    Color: {item.variant_details.color}
                                  </span>
                                )}
                                <span>Quantity: <strong className="text-[#1A1A1A]">{item.quantity}</strong></span>
                              </div>
                              <div className="text-sm font-bold text-[#1A1A1A]">
                                ₹{formatPrice(item.total_price || item.unit_price * item.quantity)}
                                {item.quantity > 1 && (
                                  <span className="text-xs text-[#6B6258] font-normal ml-2">
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
              <Card variant="elevated" padding="lg" className="!bg-[#FFFFFF] border border-[#E5DDD2] rounded-2xl shadow-xs">
                <CardTitle className="font-display text-lg text-[#1A1A1A] mb-6">Fulfillment Timeline</CardTitle>
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5DDD2]">
                  {timelineSteps.map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-4">
                      <div
                        className={cn(
                          'absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-[#FFFFFF]',
                          step.cancelled
                            ? 'bg-[#DC2626] shadow-xs'
                            : step.completed
                              ? 'bg-[#C9A84C] shadow-xs'
                              : 'bg-[#DFD6C9]'
                        )}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4
                            className={cn(
                              'text-sm font-semibold',
                              step.cancelled
                                ? 'text-[#991B1B]'
                                : step.completed
                                  ? 'text-[#1A1A1A]'
                                  : 'text-[#8E8477]'
                            )}
                          >
                            {step.status}
                          </h4>
                          {step.date && (
                            <span className="text-xs text-[#6B6258]">
                              {new Date(step.date).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#5A544B] mt-0.5">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Live Courier & Shipment Tracking */}
              {statusKey !== 'cancelled' && (
                <Card variant="elevated" padding="lg" className="!bg-[#FFFFFF] border border-[#E5DDD2] rounded-2xl shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-xl bg-[#FAF4E8] border border-[#E6D5B0] flex items-center justify-center">
                        <Truck className="w-4 h-4 text-[#947218]" />
                      </span>
                      <div>
                        <CardTitle className="font-display text-base text-[#1A1A1A]">
                          Live Dispatch &amp; Tracking
                        </CardTitle>
                        <p className="text-xs text-[#6B6258]">
                          {order.shipment_status
                            ? `Courier Status: ${order.shipment_status.replace(/_/g, ' ')}`
                            : 'Real-time Shiprocket logistics telemetry'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 print:hidden">
                      {order.tracking_url && (
                        <a
                          href={order.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#161310] text-[#FAF6F0] hover:bg-[#2A2520] transition-colors"
                        >
                          <span>Courier Live Map</span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#E6C77A]" />
                        </a>
                      )}
                      <Link
                        href={liveTrackerHref}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FAF4E8] text-[#74590E] border border-[#E6D5B0] hover:border-[#C9A84C] transition-colors"
                      >
                        <span>Open Live Tracker →</span>
                      </Link>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 text-sm pt-2 border-t border-[#F1EAE0]">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-[#7A7065] block">Carrier Partner</span>
                      <strong className="text-[#1A1A1A]">{order.courier_partner || 'Assigning Express Courier'}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-[#7A7065] block">Tracking AWB</span>
                      {order.tracking_number ? (
                        <div className="inline-flex items-center gap-1.5">
                          <strong className="font-mono text-[#1A1A1A]">{order.tracking_number}</strong>
                          <button
                            type="button"
                            onClick={handleCopyAwb}
                            aria-label="Copy AWB number"
                            className="p-1 rounded hover:bg-[#FAF8F4] text-[#74590E] cursor-pointer print:hidden"
                          >
                            {copiedAwb ? <Check className="w-3.5 h-3.5 text-[#067647]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-[#6B6258]">Generated on dispatch</span>
                      )}
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-[#7A7065] block">Est. Delivery</span>
                      <strong className="text-[#067647]">
                        {order.etd
                          ? new Date(order.etd).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : statusKey === 'delivered'
                            ? 'Delivered'
                            : '5–7 business days'}
                      </strong>
                    </div>
                  </div>

                  {/* Live Shiprocket Scan Checkpoints */}
                  {Array.isArray(order.scans) && order.scans.length > 0 && (
                    <div className="pt-3 border-t border-[#F1EAE0] space-y-2.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#74590E]">
                        Latest Courier Scans
                      </p>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {order.scans.slice(0, 6).map((scan, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-start justify-between gap-3 text-xs bg-[#FAF8F4] rounded-xl px-3.5 py-2.5 border border-[#EAE2D6]"
                          >
                            <div>
                              <p className="font-semibold text-[#1A1A1A]">{scan.activity || scan.status || 'Transit update'}</p>
                              {scan.location && <p className="text-[#6B6258] mt-0.5">{scan.location}</p>}
                            </div>
                            {scan.date && (
                              <span className="text-[11px] text-[#7A7065] whitespace-nowrap shrink-0">
                                {scan.date}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </div>

            {/* Right Column: Order Summary, Shipping Address, Payment */}
            <div className="space-y-6">
              {/* Pricing Breakdown */}
              <Card variant="elevated" padding="lg" className="!bg-[#FFFFFF] border border-[#E5DDD2] rounded-2xl shadow-xs">
                <CardTitle className="font-display text-base text-[#1A1A1A] mb-4">Financial Summary</CardTitle>
                <dl className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[#5A544B]">Subtotal ({order.items_count} items)</dt>
                    <dd className="font-medium text-[#1A1A1A]">₹{formatPrice(order.subtotal || order.total_amount)}</dd>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-[#067647]">
                      <dt>Privilege Voucher Discount</dt>
                      <dd className="font-medium">-₹{formatPrice(order.discount_amount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-[#5A544B]">Express Delivery</dt>
                    <dd className="font-medium text-[#1A1A1A]">
                      {order.shipping_cost === 0 ? <span className="text-[#067647] font-semibold">FREE</span> : `₹${formatPrice(order.shipping_cost)}`}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#5A544B]">GST &amp; Taxes</dt>
                    <dd className="text-xs text-[#6B6258]">Included</dd>
                  </div>
                  <div className="border-t border-[#EAE2D6] pt-3 flex justify-between text-base font-bold text-[#1A1A1A]">
                    <dt>Total Amount</dt>
                    <dd className="text-lg text-[#74590E]">₹{formatPrice(order.total_amount)}</dd>
                  </div>
                </dl>
              </Card>

              {/* Shipping Address */}
              <Card variant="elevated" padding="lg" className="!bg-[#FFFFFF] border border-[#E5DDD2] rounded-2xl shadow-xs">
                <CardTitle className="font-display text-base text-[#1A1A1A] mb-3">Delivery Destination</CardTitle>
                <address className="text-sm text-[#5A544B] not-italic space-y-1">
                  <p className="font-semibold text-[#1A1A1A]">{recipientName}</p>
                  {addressLine1 && <p>{addressLine1}</p>}
                  {addressLine2 && <p>{addressLine2}</p>}
                  {cityStateZip && <p>{cityStateZip}</p>}
                  <div className="pt-2 border-t border-[#EAE2D6] mt-2 text-xs space-y-0.5">
                    <p>Contact Phone: <strong className="text-[#1A1A1A]">{phone}</strong></p>
                    <p>Notification Email: <strong className="text-[#1A1A1A]">{email}</strong></p>
                  </div>
                </address>
              </Card>

              {/* Payment Details */}
              <Card variant="elevated" padding="lg" className="!bg-[#FFFFFF] border border-[#E5DDD2] rounded-2xl shadow-xs">
                <CardTitle className="font-display text-base text-[#1A1A1A] mb-3">Payment Info</CardTitle>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[#5A544B]">Method</dt>
                    <dd className="font-semibold text-[#1A1A1A] capitalize">
                      {order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 'Prepaid Online (Razorpay)'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#5A544B]">Status</dt>
                    <dd className={cn('font-semibold text-xs uppercase px-2 py-0.5 rounded', order.payment_status === 'paid' ? 'bg-[#ECFDF3] text-[#067647]' : 'bg-[#FFFBEB] text-[#92400E]')}>
                      {order.payment_status}
                    </dd>
                  </div>
                </dl>
              </Card>

              {/* Concierge Assistance */}
              <Card variant="elevated" padding="lg" className="!bg-[#FAF8F4] border border-[#E5DDD2] rounded-2xl shadow-xs print:hidden">
                <CardTitle className="font-display text-base text-[#1A1A1A] mb-2">Need Concierge Support?</CardTitle>
                <p className="text-xs text-[#5A544B] mb-4 leading-relaxed">
                  Have questions about delivery time, custom stitching, or styling suggestions for this order?
                </p>
                <Link
                  href={`/contact?order=${encodeURIComponent(order.order_number)}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#161310] hover:bg-[#2A2520] text-[#FAF6F0] font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Contact Client Concierge</span>
                </Link>
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
              className="relative w-full max-w-lg bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E5DDD2] max-h-[90vh] overflow-y-auto z-10"
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
              className="relative w-full max-w-xl bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E5DDD2] max-h-[90vh] overflow-y-auto z-10"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-[#EAE2D6]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#74590E]">
                      Hassle-Free Returns &amp; Exchanges
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                      {activeReturnItem.return_window_days || 7}-Day Window
                      {typeof activeReturnItem.days_left === 'number' && activeReturnItem.days_left > 0
                        ? ` · ${activeReturnItem.days_left}d left`
                        : ' Active'}
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
      </AnimatePresence>

      {/* Order Cancellation Confirmation — Native Top-Layer Modal <dialog> */}
      <dialog
        ref={cancelDialogRef}
        aria-labelledby="cancel-order-dialog-title"
        onCancel={(e) => {
          if (isCancelling) {
            e.preventDefault();
            return;
          }
          setShowCancelModal(false);
        }}
        onClose={() => {
          if (cancelDialogRef.current) cancelDialogRef.current.returnValue = '';
          setShowCancelModal(false);
        }}
        onPointerDown={(e) => {
          const dialog = cancelDialogRef.current;
          if (!dialog) return;
          const rect = dialog.getBoundingClientRect();
          cancelDialogPressedOutsideRef.current =
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom;
        }}
        onPointerUp={(e) => {
          if (isCancelling || !cancelDialogPressedOutsideRef.current) return;
          cancelDialogPressedOutsideRef.current = false;
          const dialog = cancelDialogRef.current;
          if (!dialog) return;
          const rect = dialog.getBoundingClientRect();
          const outside =
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom;
          if (outside) setShowCancelModal(false);
        }}
        className="m-auto max-w-md w-[calc(100%-2rem)] rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] p-0 shadow-2xl overscroll-contain backdrop:bg-black/60 backdrop:backdrop-blur-xs backdrop:overflow-hidden backdrop:overscroll-contain"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 id="cancel-order-dialog-title" className="font-display text-2xl font-medium text-[#1A1A1A]">
                Cancel Order {order.order_number}?
              </h1>
              <p className="text-xs text-[#5A544B] mt-1 leading-relaxed">
                This will immediately release reserved inventory. Any captured online payment will be marked for refund reversal.
              </p>
            </div>
            <button
              type="button"
              onClick={() => !isCancelling && setShowCancelModal(false)}
              className="p-1.5 rounded-lg text-[#7A7065] hover:text-[#1A1A1A] hover:bg-[#FAF8F4] cursor-pointer"
              aria-label="Close cancellation dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div>
            <label htmlFor="cancelReason" className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
              Reason for Cancellation (Optional)
            </label>
            <textarea
              id="cancelReason"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Ordered incorrect size, delivery date change..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#D8CEC0] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              autoFocus
              disabled={isCancelling}
              onClick={() => setShowCancelModal(false)}
              className="cursor-pointer"
            >
              Keep Order
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isCancelling}
              className="bg-[#B42318] hover:bg-[#991B1B] text-[#FFFFFF] cursor-pointer"
              onClick={async () => {
                setIsCancelling(true);
                try {
                  const res = await cancelCustomerOrder(order.id, cancelReason.trim() || undefined);
                  if (res.success) {
                    setCurrentStatus('cancelled');
                    setShowCancelModal(false);
                    toast.success('Order cancelled and inventory released.');
                  } else {
                    toast.error(res.error || 'Could not cancel order.');
                  }
                } catch (err: any) {
                  toast.error(err?.message || 'Error cancelling order.');
                } finally {
                  setIsCancelling(false);
                }
              }}
            >
              {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
