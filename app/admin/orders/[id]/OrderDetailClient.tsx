'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { updateOrderStatus, updatePaymentStatus, updateVidyasNote } from '@/lib/actions/admin-orders';
import type { AdminOrder, OrderItem } from '@/lib/actions/admin-orders';
import {
  ArrowLeft, Package, MapPin, User, Truck, ClipboardList, Save, CheckCircle, AlertCircle, Copy, Check, CreditCard, Gift
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border border-amber-300',
  confirmed: 'bg-blue-100 text-blue-800 border border-blue-300',
  shipped: 'bg-purple-100 text-purple-800 border border-purple-300',
  delivered: 'bg-green-100 text-green-800 border border-green-300',
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
        state === 'saving' ? 'text-[var(--color-mist)]' :
        state === 'saved' ? 'text-green-600' : 'text-red-500'
      }`}
    >
      {state === 'saving' && <span className="animate-pulse">Saving…</span>}
      {state === 'saved' && <><CheckCircle className="w-3.5 h-3.5" /> Saved</>}
      {state === 'error' && <><AlertCircle className="w-3.5 h-3.5" /> Error saving</>}
    </motion.span>
  );
}

interface Props {
  order: AdminOrder;
  items: OrderItem[];
}

export default function OrderDetailClient({ order, items }: Props) {
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status);
  const [tracking, setTracking] = useState(order.tracking_number ?? '');
  const [courier, setCourier] = useState(order.courier_partner ?? '');
  const [note, setNote] = useState(order.vidyas_note ?? '');
  const [statusSave, setStatusSave] = useState<SaveState>('idle');
  const [paymentSave, setPaymentSave] = useState<SaveState>('idle');
  const [noteSave, setNoteSave] = useState<SaveState>('idle');
  const [copiedNum, setCopiedNum] = useState(false);

  const addr: any = order.shipping_address || {};
  const fullName = [addr.firstName, addr.lastName].filter(Boolean).join(' ') || addr.full_name || order.customer_name || 'Customer';
  const street1 = addr.address1 || addr.line1 || '';
  const street2 = addr.address2 || addr.line2 || '';
  const pin = addr.postalCode || addr.pincode || addr.zip || '';
  const cityState = [addr.city, addr.state, pin].filter(Boolean).join(', ');
  const country = addr.country || 'India';
  const phone = addr.phone || order.phone || '';

  async function handleSaveStatus() {
    setStatusSave('saving');
    try {
      const res = await updateOrderStatus(order.id, status, tracking, courier);
      if (res.success) {
        setStatusSave('saved');
        toast.success(`Fulfillment updated to ${status}`);
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

  const subtotal = items.reduce((s, i) => s + Number(i.total_price), 0) || order.subtotal;
  const meta: any = order.metadata || {};
  const codFee = meta.cod_fee ? Number(meta.cod_fee) : 0;
  const couponCode = meta.coupon_code;

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
              <h1 className="text-2xl font-medium text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
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
              Placed on {new Date(order.created_at).toLocaleString('en-IN', {
                dateStyle: 'long', timeStyle: 'short'
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700'}`}>
            {status}
          </span>
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize ${
            paymentStatus === 'paid' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
          }`}>
            Payment: {paymentStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (Items, Totals, Fulfillment, Notes) */}
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
                        <img
                          src={img}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-[var(--color-mist)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[var(--color-ink)]">{item.product_name}</p>
                      {item.variant_details && (
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
                        </div>
                      )}
                      <p className="text-xs text-[var(--color-slate)] mt-1.5">
                        Quantity: <span className="font-bold text-[var(--color-ink)]">{item.quantity}</span> × ₹{Number(item.unit_price).toLocaleString('en-IN')}
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
                <span>Express Shipping</span>
                <span>{order.shipping_cost > 0 ? `₹${Number(order.shipping_cost).toLocaleString('en-IN')}` : 'FREE'}</span>
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

          {/* Fulfillment & Tracking */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm p-6">
            <h2 className="flex items-center gap-2 font-semibold text-[var(--color-ink)] mb-4">
              <Truck className="w-4 h-4 text-[var(--color-gold)]" />
              Fulfillment & Dispatch
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">Order Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)] bg-white capitalize"
                >
                  {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
                    <option key={s} value={s} className="capitalize">
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">Courier Partner</label>
                <input
                  type="text"
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  placeholder="e.g. Blue Dart, Delhivery, DTDC"
                  className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">AWB Tracking Number</label>
                <input
                  type="text"
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)] font-mono"
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

          {/* Vidhya's Note */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm p-6">
            <h2 className="flex items-center gap-2 font-semibold text-[var(--color-ink)] mb-4">
              <ClipboardList className="w-4 h-4 text-[var(--color-gold)]" />
              Internal Tailoring & Order Notes
            </h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="Internal staff note regarding alterations, packaging, or special dispatch requests..."
              className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)] resize-none"
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

        {/* Right column (Customer, Payment, Address, Extras) */}
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
                <p className="font-medium text-[var(--color-ink)]">{order.email}</p>
              </div>
              {phone && (
                <div>
                  <p className="text-xs text-[var(--color-slate)]">Phone</p>
                  <p className="font-medium text-[var(--color-ink)]">{phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details & Update */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm p-6">
            <h2 className="flex items-center gap-2 font-semibold text-[var(--color-ink)] mb-4">
              <CreditCard className="w-4 h-4 text-[var(--color-gold)]" />
              Payment Management
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-[var(--color-slate)]">Payment Method</p>
                <p className="font-semibold text-[var(--color-ink)] capitalize">
                  {order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : (order.payment_method || 'Online Payment')}
                </p>
              </div>
              {order.payment_id && (
                <div>
                  <p className="text-xs text-[var(--color-slate)]">Gateway Transaction ID</p>
                  <p className="font-mono text-xs text-[var(--color-ink)] break-all">{order.payment_id}</p>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">Update Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)] bg-white capitalize"
                >
                  {['pending', 'paid', 'refunded', 'failed'].map(p => (
                    <option key={p} value={p} className="capitalize">
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-1 flex items-center gap-3">
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
                  <p className="text-xs text-amber-800 italic mt-0.5">"{order.gift_message}"</p>
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
