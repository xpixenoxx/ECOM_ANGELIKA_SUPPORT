'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  createCoupon, updateCoupon, deleteCoupon, toggleCouponActive
} from '@/lib/actions/admin-dashboard';
import type { Coupon } from '@/lib/actions/admin-dashboard';
import { Search, Plus, Edit2, Trash2, Copy, Check, ToggleLeft, ToggleRight, X, Tag } from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';

const EMPTY_FORM = {
  code: '',
  name: '',
  type: 'percentage' as 'percentage' | 'fixed',
  value: 0,
  min_order_amount: '',
  max_discount_amount: '',
  usage_limit: '',
  user_limit: '',
  valid_from: '',
  valid_until: '',
  first_order_only: false,
  is_active: true,
};

interface Props {
  initialCoupons: Coupon[];
}

export default function CouponsClient({ initialCoupons }: Props) {
  const [, startTransition] = useTransition();
  const [coupons, setCoupons] = useState(initialCoupons);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = coupons.filter(c =>
    !search ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditingCoupon(null);
    setForm({ ...EMPTY_FORM });
    setShowModal(true);
  }

  function openEdit(c: Coupon) {
    setEditingCoupon(c);
    setForm({
      code: c.code,
      name: c.name,
      type: c.type,
      value: c.value,
      min_order_amount: c.min_order_amount ? String(c.min_order_amount) : '',
      max_discount_amount: c.max_discount_amount ? String(c.max_discount_amount) : '',
      usage_limit: c.usage_limit ? String(c.usage_limit) : '',
      user_limit: c.user_limit ? String(c.user_limit) : '',
      valid_from: c.valid_from ? c.valid_from.slice(0, 10) : '',
      valid_until: c.valid_until ? c.valid_until.slice(0, 10) : '',
      first_order_only: c.first_order_only,
      is_active: c.is_active,
    });
    setShowModal(true);
  }

  function handleSave() {
    setSaving(true);
    const payload: Omit<Coupon, 'id' | 'usage_count' | 'created_at'> = {
      code: form.code.toUpperCase().trim(),
      name: form.name,
      type: form.type,
      value: Number(form.value),
      min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : null,
      max_discount_amount: form.max_discount_amount ? Number(form.max_discount_amount) : null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      user_limit: form.user_limit ? Number(form.user_limit) : null,
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
      first_order_only: form.first_order_only,
      is_active: form.is_active,
    };

    startTransition(async () => {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, payload);
        setCoupons(prev => prev.map(c => c.id === editingCoupon.id ? { ...c, ...payload } : c));
      } else {
        const res = await createCoupon(payload);
        if (res.success && res.data) {
          setCoupons(prev => [res.data!, ...prev]);
        }
      }
      setSaving(false);
      setShowModal(false);
    });
  }

  function handleToggle(id: string, active: boolean) {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: active } : c));
    startTransition(async () => {
      await toggleCouponActive(id, active);
    });
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this coupon? This cannot be undone.')) return;
    setDeleting(id);
    startTransition(async () => {
      await deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
      setDeleting(null);
    });
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium" style={{ fontFamily: 'var(--font-display)' }}>Promotional Coupons</h1>
            <AdminSectionInfo
              title="Coupons & Discount Architecture"
              purpose="Create promotional discount vouchers (percentage off or fixed rupee reduction), set minimum order amounts, configure usage limits, and toggle seasonal codes."
              storefrontImpact="Directly validated and applied in the cart drawer promo field and checkout coupon box (/checkout)."
              targets={[
                { name: 'Storefront Checkout', path: '/checkout', description: 'Coupon redemption field' },
                { name: 'Sale & Festive Page', path: '/sale', description: 'Seasonal promotional deals' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate)] mt-0.5">{coupons.length} promotional coupons in database</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[var(--color-gold)] text-white rounded-xl px-5 py-2.5 font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> New Coupon
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-mist)]" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by code or name..."
            className="w-full pl-10 pr-4 py-2 border border-[var(--color-whisper)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-whisper)] bg-[var(--color-snow)]">
                {['Code', 'Discount', 'Min Order', 'Usage', 'Valid Until', 'Status', ''].map(h => (
                  <th key={h} className="text-left py-3 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-whisper)]">
              <AnimatePresence>
                {filtered.map(c => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-[var(--color-snow)] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[var(--color-ink)] bg-[var(--color-snow)] px-2 py-1 rounded text-xs border border-[var(--color-whisper)]">
                          {c.code}
                        </span>
                        <button
                          onClick={() => copyCode(c.code)}
                          className="text-[var(--color-mist)] hover:text-[var(--color-gold)] transition-colors"
                          title="Copy code"
                        >
                          {copied === c.code ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <p className="text-xs text-[var(--color-slate)] mt-1">{c.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[var(--color-ink)]">
                        {c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}
                      </span>
                      {c.max_discount_amount && (
                        <p className="text-xs text-[var(--color-mist)]">Max ₹{c.max_discount_amount}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[var(--color-slate)]">
                      {c.min_order_amount ? `₹${c.min_order_amount}` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[var(--color-ink)] font-medium">{c.usage_count}</span>
                      <span className="text-[var(--color-mist)]">/{c.usage_limit ?? '∞'}</span>
                    </td>
                    <td className="py-3 px-4 text-[var(--color-slate)] text-xs">
                      {c.valid_until
                        ? new Date(c.valid_until).toLocaleDateString('en-IN', { dateStyle: 'medium' })
                        : 'No expiry'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggle(c.id, !c.is_active)}
                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${c.is_active ? 'text-green-600' : 'text-[var(--color-mist)]'}`}
                      >
                        {c.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        {c.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded-lg hover:bg-[var(--color-whisper)] text-[var(--color-slate)] hover:text-[var(--color-gold)] transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deleting === c.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--color-slate)] hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-[var(--color-mist)]">
              <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No coupons found</p>
              <button onClick={openCreate} className="mt-3 text-sm text-[var(--color-gold)] hover:underline">
                Create your first coupon
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b border-[var(--color-whisper)]">
                  <h2 className="text-lg font-semibold text-[var(--color-ink)]">
                    {editingCoupon ? 'Edit Coupon' : 'New Coupon'}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-[var(--color-whisper)] text-[var(--color-slate)]">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">Coupon Code *</label>
                      <input
                        type="text"
                        value={form.code}
                        onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                        placeholder="SAVE20"
                        className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">Name *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Summer Sale"
                        className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">Discount Type</label>
                      <select
                        value={form.type}
                        onChange={e => setForm(f => ({ ...f, type: e.target.value as 'percentage' | 'fixed' }))}
                        className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">
                        Value {form.type === 'percentage' ? '(%)' : '(₹)'}
                      </label>
                      <input
                        type="number"
                        value={form.value}
                        onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))}
                        min={0}
                        className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">Min Order Amount (₹)</label>
                      <input
                        type="number"
                        value={form.min_order_amount}
                        onChange={e => setForm(f => ({ ...f, min_order_amount: e.target.value }))}
                        placeholder="None"
                        min={0}
                        className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                      />
                    </div>
                    {form.type === 'percentage' && (
                      <div>
                        <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">Max Discount (₹)</label>
                        <input
                          type="number"
                          value={form.max_discount_amount}
                          onChange={e => setForm(f => ({ ...f, max_discount_amount: e.target.value }))}
                          placeholder="No cap"
                          min={0}
                          className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">Usage Limit</label>
                      <input
                        type="number"
                        value={form.usage_limit}
                        onChange={e => setForm(f => ({ ...f, usage_limit: e.target.value }))}
                        placeholder="Unlimited"
                        min={0}
                        className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">Valid From</label>
                      <input
                        type="date"
                        value={form.valid_from}
                        onChange={e => setForm(f => ({ ...f, valid_from: e.target.value }))}
                        className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">Valid Until</label>
                      <input
                        type="date"
                        value={form.valid_until}
                        onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))}
                        className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                      />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3">
                    {[
                      { key: 'is_active' as const, label: 'Active' },
                      { key: 'first_order_only' as const, label: 'First Order Only' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between py-1">
                        <span className="text-sm font-medium text-[var(--color-ink)]">{label}</span>
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(form[key] as boolean) ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-whisper)]'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${(form[key] as boolean) ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--color-whisper)]">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--color-slate)] hover:bg-[var(--color-whisper)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.code || !form.name}
                    className="flex items-center gap-2 bg-[var(--color-gold)] text-white rounded-lg px-5 py-2.5 font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {saving
                      ? <span className="animate-pulse">Saving…</span>
                      : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
