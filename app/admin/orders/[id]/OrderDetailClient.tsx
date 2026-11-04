'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { updateOrderStatus, updateVidyasNote } from '@/lib/actions/admin-orders';
import type { AdminOrder, OrderItem } from '@/lib/actions/admin-orders';
import {
  ArrowLeft, Package, MapPin, User, Truck, ClipboardList, Save, CheckCircle, AlertCircle
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
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
      {state === 'saved' && <><CheckCircle className="w-3 h-3" /> Saved</>}
      {state === 'error' && <><AlertCircle className="w-3 h-3" /> Error</>}
    </motion.span>
  );
}

interface Props {
  order: AdminOrder;
  items: OrderItem[];
}

export default function OrderDetailClient({ order, items }: Props) {
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState(order.status);
  const [tracking, setTracking] = useState(order.tracking_number ?? '');
  const [courier, setCourier] = useState(order.courier_partner ?? '');
  const [note, setNote] = useState(order.vidyas_note ?? '');
  const [statusSave, setStatusSave] = useState<SaveState>('idle');
  const [noteSave, setNoteSave] = useState<SaveState>('idle');

  const addr = order.shipping_address as any;

  function handleSaveStatus() {
    setStatusSave('saving');
    startTransition(async () => {
      const res = await updateOrderStatus(order.id, status, tracking, courier);
      setStatusSave(res.success ? 'saved' : 'error');
      setTimeout(() => setStatusSave('idle'), 3000);
    });
  }

  function handleSaveNote() {
    setNoteSave('saving');
    startTransition(async () => {
      const res = await updateVidyasNote(order.id, note);
      setNoteSave(res.success ? 'saved' : 'error');
      setTimeout(() => setNoteSave('idle'), 3000);
    });
  }

  const subtotal = items.reduce((s, i) => s + Number(i.total_price), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl hover:bg-[var(--color-whisper)] text-[var(--color-slate)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-medium" style={{ fontFamily: 'var(--font-display)' }}>
              Order #{order.order_number}
            </h1>
            <p className="text-sm text-[var(--color-slate)] mt-0.5">
              {new Date(order.created_at).toLocaleString('en-IN', {
                dateStyle: 'long', timeStyle: 'short'
              })}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
          {order.status}
        </span>
      </div>

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
              {items.map((item) => (
                <div key={item.id} className="py-4 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[var(--color-snow)] flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-[var(--color-mist)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--color-ink)] truncate">{item.product_name}</p>
                    {item.variant_details && (
                      <p className="text-xs text-[var(--color-slate)] mt-0.5">
                        {Object.entries(item.variant_details)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' · ')}
                      </p>
                    )}
                    <p className="text-sm text-[var(--color-slate)] mt-1">
                      Qty: {item.quantity} × ₹{Number(item.unit_price).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <p className="font-semibold text-[var(--color-ink)] text-right flex-shrink-0">
                    ₹{Number(item.total_price).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-[var(--color-whisper)] space-y-2">
              {[
                { label: 'Subtotal', val: subtotal },
                { label: 'Shipping', val: order.shipping_cost },
                { label: 'Tax', val: order.tax_amount },
                { label: 'Discount', val: -order.discount_amount },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between text-sm text-[var(--color-slate)]">
                  <span>{label}</span>
                  <span className={val < 0 ? 'text-green-600' : ''}>
                    {val < 0 ? '-' : ''}₹{Math.abs(val).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-[var(--color-ink)] text-base pt-2 border-t border-[var(--color-whisper)]">
                <span>Total</span>
                <span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Fulfillment */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm p-6">
            <h2 className="flex items-center gap-2 font-semibold text-[var(--color-ink)] mb-4">
              <Truck className="w-4 h-4 text-[var(--color-gold)]" />
              Fulfillment
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">Order Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                >
                  {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
                    <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">Courier Partner</label>
                <input
                  type="text"
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  placeholder="e.g. Delhivery, DTDC…"
                  className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleSaveStatus}
                disabled={statusSave === 'saving'}
                className="flex items-center gap-2 bg-[var(--color-gold)] text-white rounded-lg px-5 py-2.5 font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
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
              Vidhya's Note
            </h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="Internal note about this order..."
              className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)] resize-none"
            />
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={handleSaveNote}
                disabled={noteSave === 'saving'}
                className="flex items-center gap-2 bg-[var(--color-gold)] text-white rounded-lg px-5 py-2.5 font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
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
              Customer
            </h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-[var(--color-ink)]">{order.email}</p>
              {order.phone && (
                <p className="text-[var(--color-slate)]">{order.phone}</p>
              )}
              <p className="text-xs text-[var(--color-mist)]">
                Payment: <span className="capitalize font-medium text-[var(--color-ink)]">{order.payment_status}</span>
              </p>
              <p className="text-xs text-[var(--color-mist)]">
                Method: <span className="capitalize font-medium text-[var(--color-ink)]">{order.payment_method ?? 'N/A'}</span>
              </p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm p-6">
            <h2 className="flex items-center gap-2 font-semibold text-[var(--color-ink)] mb-4">
              <MapPin className="w-4 h-4 text-[var(--color-gold)]" />
              Shipping Address
            </h2>
            {addr ? (
              <div className="text-sm text-[var(--color-slate)] space-y-1">
                {addr.full_name && <p className="font-medium text-[var(--color-ink)]">{addr.full_name}</p>}
                {addr.line1 && <p>{addr.line1}</p>}
                {addr.line2 && <p>{addr.line2}</p>}
                {(addr.city || addr.state) && (
                  <p>{[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}</p>
                )}
                {addr.country && <p>{addr.country}</p>}
                {addr.phone && <p className="text-[var(--color-mist)]">{addr.phone}</p>}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-mist)]">No address on file</p>
            )}
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
              <h2 className="font-semibold text-amber-800 mb-2 text-sm">Customer Note</h2>
              <p className="text-sm text-amber-700">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
