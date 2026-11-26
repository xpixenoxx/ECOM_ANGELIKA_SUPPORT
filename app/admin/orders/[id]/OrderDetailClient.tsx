'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  autoDispatchShipmentAwb,
  cancelOrderShipment,
  generateOrderManifest,
  generateOrderShippingLabel,
  getOrderById,
  scheduleOrderPickup,
  syncOrderShipmentTracking,
  updateOrderStatus,
  updatePaymentStatus,
  updateVidyasNote,
  type AdminOrder,
  type OrderItem,
  type OrderRefundRow,
  type OrderShipmentRow,
} from '@/lib/actions/admin-orders';
import { processRefund, reconcileRazorpayOrder } from '@/lib/actions/payments';
import { evaluateShipmentEligibility } from '@/lib/orders/state-machine';
import {
  ArrowLeft,
  Package,
  MapPin,
  User,
  Truck,
  ClipboardList,
  Save,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  CreditCard,
  Gift,
  RefreshCw,
  ExternalLink,
  FileText,
  Calendar,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border border-amber-300',
  confirmed: 'bg-blue-100 text-blue-800 border border-blue-300',
  processing: 'bg-indigo-100 text-indigo-800 border border-indigo-300',
  shipped: 'bg-purple-100 text-purple-800 border border-purple-300',
  out_for_delivery: 'bg-cyan-100 text-cyan-800 border border-cyan-300',
  delivered: 'bg-green-100 text-green-800 border border-green-300',
  delivery_failed: 'bg-orange-100 text-orange-800 border border-orange-300',
  rto: 'bg-rose-100 text-rose-800 border border-rose-300',
  returned: 'bg-gray-100 text-gray-800 border border-gray-300',
  cancelled: 'bg-red-100 text-red-800 border border-red-300',
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function SaveStatus({ state }: { state: SaveState }) {
  if (state === 'idle') return null;
  return (
    <motion.span
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-1 text-xs font-medium ${
        state === 'saving'
          ? 'text-[var(--color-mist)]'
          : state === 'saved'
            ? 'text-green-600'
            : 'text-red-500'
      }`}
    >
      {state === 'saving' && <span className="animate-pulse">Saving…</span>}
      {state === 'saved' && (
        <>
          <CheckCircle className="w-3.5 h-3.5" /> Saved
        </>
      )}
      {state === 'error' && (
        <>
          <AlertCircle className="w-3.5 h-3.5" /> Error saving
        </>
      )}
    </motion.span>
  );
}

interface Props {
  order: AdminOrder;
  items: OrderItem[];
  initialShipments: OrderShipmentRow[];
  initialRefunds: OrderRefundRow[];
}

export default function OrderDetailClient({
  order: initialOrder,
  items,
  initialShipments,
  initialRefunds,
}: Props) {
  const [order, setOrder] = useState<AdminOrder>(initialOrder);
  const [shipments, setShipments] = useState<OrderShipmentRow[]>(initialShipments);
  const [refunds, setRefunds] = useState<OrderRefundRow[]>(initialRefunds);

  const [status, setStatus] = useState(initialOrder.status);
  const [paymentStatus, setPaymentStatus] = useState(initialOrder.payment_status);
  const [tracking, setTracking] = useState(initialOrder.tracking_number ?? '');
  const [courier, setCourier] = useState(initialOrder.courier_partner ?? '');
  const [note, setNote] = useState(initialOrder.vidyas_note ?? '');

  const [statusSave, setStatusSave] = useState<SaveState>('idle');
  const [paymentSave, setPaymentSave] = useState<SaveState>('idle');
  const [noteSave, setNoteSave] = useState<SaveState>('idle');
  const [copiedNum, setCopiedNum] = useState(false);

  // Razorpay refund & reconciliation states
  const [reconcilingPay, setReconcilingPay] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [restoreInventoryOnRefund, setRestoreInventoryOnRefund] = useState(false);
  const [refunding, setRefunding] = useState(false);

  // Shiprocket action loading states
  const [srBusy, setSrBusy] = useState<string | null>(null);

  async function refreshOrderState() {
    const fresh = await getOrderById(order.id);
    if (fresh.order) {
      setOrder(fresh.order);
      setStatus(fresh.order.status);
      setPaymentStatus(fresh.order.payment_status);
      setTracking(fresh.order.tracking_number ?? '');
      setCourier(fresh.order.courier_partner ?? '');
      setShipments(fresh.shipments || []);
      setRefunds(fresh.refunds || []);
    }
  }

  const addr: any = order.shipping_address || {};
  const fullName =
    [addr.firstName, addr.lastName].filter(Boolean).join(' ') ||
    addr.full_name ||
    order.customer_name ||
    'Customer';
  const street1 = addr.address1 || addr.line1 || '';
  const street2 = addr.address2 || addr.line2 || '';
  const pin = addr.postalCode || addr.pincode || addr.zip || '';
  const cityState = [addr.city, addr.state, pin].filter(Boolean).join(', ');
  const country = addr.country || 'India';
  const phone = addr.phone || order.phone || '';

  const subtotal = items.reduce((s, i) => s + Number(i.total_price), 0) || order.subtotal;
  const meta: any = order.metadata || {};
  const codFee = meta.cod_fee ? Number(meta.cod_fee) : 0;
  const couponCode = meta.coupon_code;
  const razorpayPaymentId = meta.razorpay_payment_id as string | undefined;
  const razorpayMode = meta.razorpay_mode as string | undefined;
  const duplicatePayments = Array.isArray(meta.duplicate_payment_ids)
    ? (meta.duplicate_payment_ids as string[])
    : [];

  const activeShipment = shipments.find((s) => s.shipment_status !== 'cancelled') || null;
  const shipmentEligibility = evaluateShipmentEligibility({
    status,
    payment_method: order.payment_method,
    payment_status: paymentStatus,
  });

  const totalRefundedInr = Math.max(
    Number(meta.refund_amount || 0),
    refunds
      .filter((r) => r.status === 'processed' || r.status === 'processing' || r.status === 'initiated')
      .reduce((sum, r) => sum + Number(r.amount || 0), 0)
  );
  const remainingRefundableInr = Math.max(0, Number(order.total_amount || 0) - totalRefundedInr);

  async function handleSaveStatus() {
    setStatusSave('saving');
    try {
      const res = await updateOrderStatus(order.id, status, tracking, courier);
      if (res.success) {
        setStatusSave('saved');
        toast.success(`Fulfillment updated to ${status}`);
        await refreshOrderState();
      } else {
        setStatusSave('error');
        toast.error(res.error || 'Failed to update order status');
      }
    } catch {
      setStatusSave('error');
      toast.error('Failed to update order status');
    } finally {
      setTimeout(() => setStatusSave('idle'), 3000);
    }
  }

  async function handleSavePayment() {
    setPaymentSave('saving');
    try {
      const res = await updatePaymentStatus(order.id, paymentStatus);
      if (res.success) {
        setPaymentSave('saved');
        toast.success(`Payment status marked as ${paymentStatus}`);
        await refreshOrderState();
      } else {
        setPaymentSave('error');
        toast.error(res.error || 'Failed to update payment status');
      }
    } catch {
      setPaymentSave('error');
      toast.error('Failed to update payment status');
    } finally {
      setTimeout(() => setPaymentSave('idle'), 3000);
    }
  }

  async function handleReconcileRazorpay() {
    setReconcilingPay(true);
    try {
      const res = await reconcileRazorpayOrder(order.id);
      if (res.success) {
        toast.success(res.message || 'Razorpay status synced.');
        await refreshOrderState();
      } else {
        toast.error(res.error || 'Could not reconcile with Razorpay.');
      }
    } finally {
      setReconcilingPay(false);
    }
  }

  async function handleInitiateRefund(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmt = refundAmount.trim() ? Number(refundAmount) : undefined;
    if (parsedAmt !== undefined && (!Number.isFinite(parsedAmt) || parsedAmt <= 0)) {
      toast.error('Enter a valid positive refund amount in INR.');
      return;
    }
    setRefunding(true);
    try {
      const res = await processRefund(order.id, parsedAmt, refundReason.trim() || 'Admin initiated refund', {
        restoreInventory: restoreInventoryOnRefund,
      });
      if (res.success) {
        toast.success(`Razorpay refund initiated (Ref: ${res.refundId || 'pending'})`);
        setRefundAmount('');
        setRefundReason('');
        setRestoreInventoryOnRefund(false);
        await refreshOrderState();
      } else {
        toast.error(res.error || 'Refund initiation failed.');
      }
    } finally {
      setRefunding(false);
    }
  }

  async function runShiprocketAction(actionKey: string, fn: () => Promise<{ success: boolean; error?: string; [k: string]: any }>, successMsg: (r: any) => string) {
    setSrBusy(actionKey);
    try {
      const res = await fn();
      if (res.success) {
        toast.success(successMsg(res));
        await refreshOrderState();
      } else {
        toast.error(res.error || 'Shiprocket operation failed.');
        await refreshOrderState();
      }
    } finally {
      setSrBusy(null);
    }
  }

  async function handleSaveNote() {
    setNoteSave('saving');
    try {
      const res = await updateVidyasNote(order.id, note);
      if (res.success) {
        setNoteSave('saved');
        toast.success('Internal note saved successfully');
      } else {
        setNoteSave('error');
        toast.error(res.error || 'Failed to save note');
      }
    } catch {
      setNoteSave('error');
      toast.error('Failed to save note');
    } finally {
      setTimeout(() => setNoteSave('idle'), 3000);
    }
  }

  function copyOrderNumber() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(order.order_number);
      setCopiedNum(true);
      toast.success('Order number copied to clipboard');
      setTimeout(() => setCopiedNum(false), 2000);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl bg-white border border-[var(--color-whisper)] hover:border-[var(--color-gold)] text-[var(--color-slate)] hover:text-[var(--color-gold)] transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1
                className="text-2xl font-medium text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Order #{order.order_number}
              </h1>
              <button
                type="button"
                onClick={copyOrderNumber}
                className="p-1 text-[var(--color-mist)] hover:text-[var(--color-gold)] transition-colors"
                title="Copy order number"
              >
                {copiedNum ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-sm text-[var(--color-slate)] mt-0.5">
              Placed on{' '}
              {new Date(order.created_at).toLocaleString('en-IN', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
              STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700'
            }`}
          >
            Order: {status.replace(/_/g, ' ')}
          </span>
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
              paymentStatus === 'paid'
                ? 'bg-green-100 text-green-800 border border-green-300'
                : paymentStatus === 'refunded' || paymentStatus === 'partially_refunded'
                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            Payment: {paymentStatus.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {duplicatePayments.length > 0 && (
        <div role="alert" className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
          <strong>Duplicate Captured Payment Alert:</strong> Multiple Razorpay payments were captured for this order ({duplicatePayments.join(', ')}). Review and refund the duplicate capture in Razorpay Dashboard.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm p-6">
            <h2 className="flex items-center gap-2 font-semibold text-[var(--color-ink)] mb-4">
              <Package className="w-4 h-4 text-[var(--color-gold)]" />
              Order Items ({items.length})
            </h2>
            <div className="divide-y divide-[var(--color-whisper)]">
              {items.map((item) => {
                const vd: any = item.variant_details || {};
                const img = vd.image;
                return (
                  <div key={item.id} className="py-4 flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                      {img ? (
                        <img src={img} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-[var(--color-mist)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[var(--color-ink)]">{item.product_name}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-[var(--color-slate)] mt-1">
                        {vd.size && (
                          <span className="px-2 py-0.5 rounded bg-[var(--color-snow)] border border-[var(--color-whisper)] font-medium">
                            Size: {vd.size}
                          </span>
                        )}
                        {vd.color && vd.color !== 'Default' && (
                          <span className="px-2 py-0.5 rounded bg-[var(--color-snow)] border border-[var(--color-whisper)] font-medium">
                            Color: {vd.color}
                          </span>
                        )}
                        {vd.sku && (
                          <span className="px-2 py-0.5 rounded bg-[var(--color-snow)] border border-[var(--color-whisper)] font-mono text-[11px]">
                            SKU: {vd.sku}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--color-slate)] mt-1.5">
                        Quantity: <span className="font-bold text-[var(--color-ink)]">{item.quantity}</span> × ₹
                        {Number(item.unit_price).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm text-[var(--color-ink)]">
                        ₹{Number(item.total_price).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Breakdown */}
            <div className="mt-4 pt-4 border-t border-[var(--color-whisper)] space-y-2">
              <div className="flex justify-between text-sm text-[var(--color-slate)]">
                <span>Subtotal</span>
                <span>₹{Number(subtotal).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm text-[var(--color-slate)]">
                <span>Shipping</span>
                <span>
                  {order.shipping_cost > 0
                    ? `₹${Number(order.shipping_cost).toLocaleString('en-IN')}`
                    : 'FREE'}
                </span>
              </div>
              {codFee > 0 && (
                <div className="flex justify-between text-sm text-[var(--color-slate)]">
                  <span>COD Handling Fee</span>
                  <span>₹{codFee.toLocaleString('en-IN')}</span>
                </div>
              )}
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-700 font-medium">
                  <span>Discount {couponCode ? `(${couponCode})` : ''}</span>
                  <span>-₹{Number(order.discount_amount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-[var(--color-ink)] text-base pt-3 border-t border-[var(--color-whisper)]">
                <span>Total Payable</span>
                <span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Shiprocket Logistics & Fulfillment Control Panel */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-semibold text-[var(--color-ink)]">
                <Truck className="w-4 h-4 text-[var(--color-gold)]" />
                Shiprocket Logistics &amp; Dispatch
              </h2>
              {activeShipment && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 capitalize">
                  Shipment: {activeShipment.shipment_status.replace(/_/g, ' ')}
                </span>
              )}
            </div>

            {!shipmentEligibility.eligible && !activeShipment && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <strong>Dispatch Blocked:</strong> {shipmentEligibility.reason}
              </div>
            )}

            {activeShipment ? (
              <div className="p-4 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <p className="text-[var(--color-slate)]">Shiprocket Order / Shipment ID</p>
                    <p className="font-mono font-semibold text-[var(--color-ink)]">
                      {activeShipment.shiprocket_order_id || '—'} / {activeShipment.shiprocket_shipment_id || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--color-slate)]">Assigned Courier Partner</p>
                    <p className="font-semibold text-[var(--color-ink)]">
                      {activeShipment.courier_name || order.courier_partner || 'Pending'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--color-slate)]">AWB Number</p>
                    <p className="font-mono font-semibold text-[var(--color-ink)]">
                      {activeShipment.awb_code || 'Unassigned'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--color-slate)]">Pickup Status</p>
                    <p className="font-semibold capitalize text-[var(--color-ink)]">
                      {activeShipment.pickup_status}
                      {activeShipment.pickup_scheduled_date
                        ? ` (${activeShipment.pickup_scheduled_date})`
                        : ''}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--color-whisper)]">
                  {activeShipment.pickup_status === 'unscheduled' && activeShipment.awb_code && (
                    <button
                      type="button"
                      disabled={srBusy !== null}
                      onClick={() =>
                        runShiprocketAction(
                          'pickup',
                          () => scheduleOrderPickup(order.id),
                          (r) =>
                            `Pickup scheduled${r.pickupScheduledDate ? ` for ${r.pickupScheduledDate}` : ''}`
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-gold)] text-white font-medium hover:opacity-90 disabled:opacity-50"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      {srBusy === 'pickup' ? 'Scheduling...' : 'Schedule Pickup'}
                    </button>
                  )}

                  {activeShipment.awb_code && (
                    <button
                      type="button"
                      disabled={srBusy !== null}
                      onClick={() =>
                        runShiprocketAction(
                          'label',
                          () => generateOrderShippingLabel(order.id),
                          () => 'Shipping label generated'
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] font-medium hover:border-[var(--color-gold)] disabled:opacity-50"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {srBusy === 'label' ? 'Generating...' : 'Generate Label'}
                    </button>
                  )}

                  {activeShipment.awb_code && (
                    <button
                      type="button"
                      disabled={srBusy !== null}
                      onClick={() =>
                        runShiprocketAction(
                          'manifest',
                          () => generateOrderManifest(order.id),
                          () => 'Manifest generated'
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] font-medium hover:border-[var(--color-gold)] disabled:opacity-50"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {srBusy === 'manifest' ? 'Generating...' : 'Generate Manifest'}
                    </button>
                  )}

                  {activeShipment.awb_code && (
                    <button
                      type="button"
                      disabled={srBusy !== null}
                      onClick={() =>
                        runShiprocketAction(
                          'track',
                          () => syncOrderShipmentTracking(order.id),
                          (r) => `Tracking synced (${r.shipmentStatus || 'updated'})`
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] font-medium hover:border-[var(--color-gold)] disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${srBusy === 'track' ? 'animate-spin' : ''}`} />
                      Sync Tracking
                    </button>
                  )}

                  {['created', 'awb_assigned', 'pickup_scheduled'].includes(activeShipment.shipment_status) && (
                    <button
                      type="button"
                      disabled={srBusy !== null}
                      onClick={() =>
                        runShiprocketAction(
                          'cancel',
                          () => cancelOrderShipment(order.id),
                          () => 'Shiprocket shipment cancelled'
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 font-medium hover:bg-rose-100 disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {srBusy === 'cancel' ? 'Cancelling...' : 'Cancel Shipment'}
                    </button>
                  )}
                </div>

                {/* Downloadable document & tracking links */}
                <div className="flex flex-wrap gap-3 pt-1">
                  {activeShipment.tracking_url && (
                    <a
                      href={activeShipment.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[var(--color-gold-hover)] font-semibold hover:underline"
                    >
                      Track Live <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {activeShipment.label_url && (
                    <a
                      href={activeShipment.label_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-700 font-semibold hover:underline"
                    >
                      Download Label PDF <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {activeShipment.manifest_url && (
                    <a
                      href={activeShipment.manifest_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-700 font-semibold hover:underline"
                    >
                      Download Manifest PDF <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  disabled={!shipmentEligibility.eligible || srBusy !== null}
                  onClick={() =>
                    runShiprocketAction(
                      'create',
                      () => autoDispatchShipmentAwb(order.id),
                      (r) => `Shiprocket shipment created · AWB ${r.awbNumber} (${r.courierPartner})`
                    )
                  }
                  className="inline-flex items-center gap-2 bg-[var(--color-ink)] text-white rounded-xl px-4 py-2.5 text-xs font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                  <Truck className="w-4 h-4 text-[var(--color-gold)]" />
                  {srBusy === 'create'
                    ? 'Creating Shiprocket Shipment & AWB...'
                    : 'Create Shiprocket Shipment & Assign AWB'}
                </button>
              </div>
            )}

            {/* Manual Fulfillment Status & Override */}
            <div className="pt-4 border-t border-[var(--color-whisper)]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-slate)] mb-3">
                Manual Fulfillment Override
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">
                    Order Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 bg-white capitalize"
                  >
                    {[
                      'pending',
                      'confirmed',
                      'processing',
                      'shipped',
                      'out_for_delivery',
                      'delivered',
                      'delivery_failed',
                      'rto',
                      'returned',
                      'cancelled',
                    ].map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">
                    Courier Partner
                  </label>
                  <input
                    type="text"
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    placeholder="e.g. Delhivery, Blue Dart, DTDC"
                    className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">
                    AWB Tracking Number
                  </label>
                  <input
                    type="text"
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                    placeholder="Enter tracking number"
                    className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 font-mono"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveStatus}
                  disabled={statusSave === 'saving'}
                  className="flex items-center gap-2 bg-[var(--color-gold)] text-white rounded-lg px-5 py-2.5 font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  Update Fulfillment
                </button>
                <SaveStatus state={statusSave} />
              </div>
            </div>
          </div>

          {/* Internal Note */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm p-6">
            <h2 className="flex items-center gap-2 font-semibold text-[var(--color-ink)] mb-4">
              <ClipboardList className="w-4 h-4 text-[var(--color-gold)]" />
              Internal Tailoring &amp; Order Notes
            </h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Internal staff note regarding alterations, packaging, or dispatch..."
              className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 resize-none"
            />
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveNote}
                disabled={noteSave === 'saving'}
                className="flex items-center gap-2 bg-[var(--color-gold)] text-white rounded-lg px-5 py-2.5 font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
              >
                <Save className="w-4 h-4" />
                Save Note
              </button>
              <SaveStatus state={noteSave} />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm p-6">
            <h2 className="flex items-center gap-2 font-semibold text-[var(--color-ink)] mb-4">
              <User className="w-4 h-4 text-[var(--color-gold)]" />
              Customer Information
            </h2>
            <div className="space-y-2.5 text-sm">
              <div>
                <p className="text-xs text-[var(--color-slate)]">Name</p>
                <p className="font-semibold text-[var(--color-ink)]">{fullName}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-slate)]">Email</p>
                <p className="font-medium text-[var(--color-ink)] break-all">{order.email}</p>
              </div>
              {phone && (
                <div>
                  <p className="text-xs text-[var(--color-slate)]">Phone</p>
                  <p className="font-medium text-[var(--color-ink)]">{phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Razorpay Payment & Refund Management */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm p-6 space-y-4">
            <h2 className="flex items-center gap-2 font-semibold text-[var(--color-ink)]">
              <CreditCard className="w-4 h-4 text-[var(--color-gold)]" />
              Payment &amp; Refunds
            </h2>
            <div className="space-y-2.5 text-xs">
              <div>
                <p className="text-[var(--color-slate)]">Payment Method</p>
                <p className="font-semibold text-sm text-[var(--color-ink)] capitalize">
                  {order.payment_method === 'cod'
                    ? 'Cash on Delivery (COD)'
                    : order.payment_method === 'razorpay'
                      ? `Razorpay${razorpayMode ? ` (${razorpayMode.toUpperCase()})` : ''}`
                      : order.payment_method || 'Online Payment'}
                </p>
              </div>
              {order.payment_id && (
                <div>
                  <p className="text-[var(--color-slate)]">Gateway Order ID</p>
                  <p className="font-mono text-[var(--color-ink)] break-all">{order.payment_id}</p>
                </div>
              )}
              {razorpayPaymentId && (
                <div>
                  <p className="text-[var(--color-slate)]">Razorpay Payment ID</p>
                  <p className="font-mono text-[var(--color-ink)] break-all">{razorpayPaymentId}</p>
                </div>
              )}
              {totalRefundedInr > 0 && (
                <div>
                  <p className="text-[var(--color-slate)]">Total Refunded / Pending</p>
                  <p className="font-semibold text-purple-700">
                    ₹{totalRefundedInr.toLocaleString('en-IN')} / ₹{Number(order.total_amount).toLocaleString('en-IN')}
                  </p>
                </div>
              )}
            </div>

            {order.payment_method === 'razorpay' && order.payment_id && (
              <button
                type="button"
                onClick={handleReconcileRazorpay}
                disabled={reconcilingPay}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-snow)] hover:border-[var(--color-gold)] text-xs font-semibold text-[var(--color-ink)] disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${reconcilingPay ? 'animate-spin' : ''}`} />
                {reconcilingPay ? 'Reconciling with Razorpay...' : 'Reconcile with Razorpay'}
              </button>
            )}

            {/* Razorpay Refund Initiation Form */}
            {order.payment_method === 'razorpay' &&
              (paymentStatus === 'paid' || paymentStatus === 'partially_refunded') &&
              remainingRefundableInr > 0 && (
                <form
                  onSubmit={handleInitiateRefund}
                  className="pt-3 border-t border-[var(--color-whisper)] space-y-2.5"
                >
                  <p className="text-xs font-semibold text-[var(--color-ink)] flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                    Initiate Razorpay Refund (Max ₹{remainingRefundableInr.toLocaleString('en-IN')})
                  </p>
                  <input
                    type="number"
                    min="1"
                    max={remainingRefundableInr}
                    step="0.01"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder={`Leave blank for full ₹${remainingRefundableInr}`}
                    className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-1.5 text-xs"
                  />
                  <input
                    type="text"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Reason (e.g. Return approved, cancellation)"
                    className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-1.5 text-xs"
                  />
                  <label className="flex items-center gap-2 text-xs text-[var(--color-slate)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restoreInventoryOnRefund}
                      onChange={(e) => setRestoreInventoryOnRefund(e.target.checked)}
                      className="accent-[var(--color-gold)]"
                    />
                    Also restore order inventory (check only if items returned/unshipped)
                  </label>
                  <button
                    type="submit"
                    disabled={refunding}
                    className="w-full py-2 px-3 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-50"
                  >
                    {refunding ? 'Submitting Refund to Razorpay...' : 'Process Razorpay Refund'}
                  </button>
                </form>
              )}

            {refunds.length > 0 && (
              <div className="pt-3 border-t border-[var(--color-whisper)] space-y-2">
                <p className="text-xs font-semibold text-[var(--color-slate)]">Refund Ledger</p>
                {refunds.map((rf) => (
                  <div
                    key={rf.id}
                    className="p-2.5 rounded-lg bg-[var(--color-snow)] border border-[var(--color-whisper)] text-[11px] space-y-0.5"
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span>₹{Number(rf.amount).toLocaleString('en-IN')}</span>
                      <span className="capitalize text-purple-700">{rf.status}</span>
                    </div>
                    {rf.gateway_refund_id && (
                      <p className="font-mono text-[10px] text-[var(--color-slate)] break-all">
                        {rf.gateway_refund_id}
                      </p>
                    )}
                    {rf.reason && <p className="text-[var(--color-slate)]">{rf.reason}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Manual Payment Status Override */}
            <div className="pt-3 border-t border-[var(--color-whisper)] space-y-2">
              <label className="block text-xs font-medium text-[var(--color-slate)]">
                Manual Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-xs bg-white capitalize"
              >
                {[
                  'pending',
                  'authorized',
                  'paid',
                  'failed',
                  'refund_pending',
                  'partially_refunded',
                  'refunded',
                ].map((p) => (
                  <option key={p} value={p}>
                    {p.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSavePayment}
                  disabled={paymentSave === 'saving'}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-medium transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Payment Status
                </button>
                <SaveStatus state={paymentSave} />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm p-6">
            <h2 className="flex items-center gap-2 font-semibold text-[var(--color-ink)] mb-4">
              <MapPin className="w-4 h-4 text-[var(--color-gold)]" />
              Delivery Destination
            </h2>
            <div className="text-sm text-[var(--color-slate)] space-y-1">
              <p className="font-semibold text-[var(--color-ink)]">{fullName}</p>
              {street1 && <p>{street1}</p>}
              {street2 && <p>{street2}</p>}
              {cityState && <p className="font-medium text-[var(--color-ink)]">{cityState}</p>}
              {country && <p>{country}</p>}
              {phone && <p className="text-xs text-[var(--color-mist)] mt-2">Mobile: {phone}</p>}
            </div>
          </div>

          {/* Gift Wrap or Special Notes */}
          {(order.gift_wrap || order.notes) && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 space-y-3">
              {order.gift_wrap && (
                <div className="flex items-center gap-2 text-sm font-semibold text-pink-700">
                  <Gift className="w-4 h-4 text-pink-600" />
                  <span>Complimentary Gift Packaging Requested</span>
                </div>
              )}
              {order.gift_message && (
                <div>
                  <p className="text-xs font-medium text-amber-900">Gift Card Message:</p>
                  <p className="text-xs text-amber-800 italic mt-0.5">&ldquo;{order.gift_message}&rdquo;</p>
                </div>
              )}
              {order.notes && (
                <div>
                  <p className="text-xs font-medium text-amber-900">Customer Instructions:</p>
                  <p className="text-xs text-amber-800 mt-0.5">{order.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
