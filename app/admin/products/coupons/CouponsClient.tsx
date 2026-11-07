'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  createCoupon, updateCoupon, deleteCoupon, toggleCouponActive
} from '@/lib/actions/admin-dashboard';
import type { Coupon } from '@/lib/actions/admin-dashboard';
import { Search, Plus, Edit2, Trash2, Copy, Check, ToggleLeft, ToggleRight, X, Tag, AlertCircle } from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  code: '',
  name: '',
  type: 'percentage' as 'percentage' | 'fixed',
  value: '' as string | number,
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
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = coupons.filter(c =>
    !search ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditingCoupon(null);
    setForm({ ...EMPTY_FORM });
    setFormError(null);
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
    setFormError(null);
    setShowModal(true);
  }

  async function handleSave() {
    setFormError(null);

    const cleanCode = form.code.trim().toUpperCase();
    if (!cleanCode) {
      setFormError('Coupon code is required.');
      toast.error('Coupon code is required');
      return;
    }
    if (cleanCode.length < 3) {
      setFormError('Coupon code must be at least 3 characters.');
      toast.error('Coupon code must be at least 3 characters');
      return;
    }
    if (!/^[A-Z0-9_-]+$/.test(cleanCode)) {
      setFormError('Coupon code can only contain letters, numbers, hyphens, and underscores.');
      toast.error('Invalid coupon code format');
      return;
    }

    const cleanName = form.name.trim();
    if (!cleanName) {
      setFormError('Coupon name is required.');
      toast.error('Coupon name is required');
      return;
    }

    const val = Number(form.value);
    if (isNaN(val) || val <= 0) {
      setFormError('Discount value must be greater than 0.');
      toast.error('Discount value must be greater than 0');
      return;
    }
    if (form.type === 'percentage' && val > 100) {
      setFormError('Percentage discount cannot exceed 100%.');
      toast.error('Percentage discount cannot exceed 100%');
      return;
    }

    const minOrder = form.min_order_amount ? Number(form.min_order_amount) : null;
    if (minOrder !== null && (isNaN(minOrder) || minOrder < 0)) {
      setFormError('Minimum order amount must be a positive number.');
      toast.error('Invalid minimum order amount');
      return;
    }

    const maxDiscount = form.max_discount_amount ? Number(form.max_discount_amount) : null;
    if (maxDiscount !== null && (isNaN(maxDiscount) || maxDiscount <= 0)) {
      setFormError('Maximum discount cap must be greater than 0.');
      toast.error('Invalid maximum discount cap');
      return;
    }

    const usageLimit = form.usage_limit ? Number(form.usage_limit) : null;
    if (usageLimit !== null && (isNaN(usageLimit) || usageLimit < 1)) {
      setFormError('Total usage limit must be at least 1.');
      toast.error('Invalid total usage limit');
      return;
    }

    const userLimit = form.user_limit ? Number(form.user_limit) : null;
    if (userLimit !== null && (isNaN(userLimit) || userLimit < 1)) {
      setFormError('Per-user limit must be at least 1.');
      toast.error('Invalid per-user limit');
      return;
    }

    if (form.valid_from && form.valid_until) {
      if (new Date(form.valid_until) < new Date(form.valid_from)) {
        setFormError('Valid until date must be on or after valid from date.');
        toast.error('Valid until date cannot be earlier than valid from date');
        return;
      }
    }

    setSaving(true);
    const payload: Omit<Coupon, 'id' | 'usage_count' | 'created_at'> = {
      code: cleanCode,
      name: cleanName,
      type: form.type,
      value: val,
      min_order_amount: minOrder,
      max_discount_amount: maxDiscount,
      usage_limit: usageLimit,
      user_limit: userLimit,
      valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : null,
      valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
      first_order_only: Boolean(form.first_order_only),
      is_active: Boolean(form.is_active),
    };

    try {
      if (editingCoupon) {
        const res = await updateCoupon(editingCoupon.id, payload);
        if (!res.success) {
          setFormError(res.error || 'Failed to update coupon');
          toast.error(res.error || 'Failed to update coupon');
          setSaving(false);
          return;
        }
        const updatedCoupon = res.data || { ...editingCoupon, ...payload };
        setCoupons(prev => prev.map(c => c.id === editingCoupon.id ? updatedCoupon : c));
        toast.success(`Coupon "${payload.code}" updated successfully!`);
      } else {
        const res = await createCoupon(payload);
        if (!res.success || !res.data) {
          setFormError(res.error || 'Failed to create coupon');
          toast.error(res.error || 'Failed to create coupon');
          setSaving(false);
          return;
        }
        setCoupons(prev => [res.data!, ...prev]);
        toast.success(`Coupon "${payload.code}" created successfully!`);
      }
      setShowModal(false);
    } catch (err: any) {
      setFormError(err?.message || 'An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id: string, active: boolean) {
    const prevStatus = !active;
    setTogglingId(id);
    // Optimistic UI update
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: active } : c));
    try {
      const res = await toggleCouponActive(id, active);
      if (!res.success) {
        // Revert on failure
        setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: prevStatus } : c));
        toast.error(res.error || 'Failed to change coupon status');
      } else {
        toast.success(active ? 'Coupon activated' : 'Coupon deactivated');
      }
    } catch {
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: prevStatus } : c));
      toast.error('Failed to change coupon status');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string, code: string) {
    if (!confirm(`Are you sure you want to delete coupon "${code}"? This action cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await deleteCoupon(id);
      if (!res.success) {
        toast.error(res.error || 'Failed to delete coupon');
      } else {
        setCoupons(prev => prev.filter(c => c.id !== id));
        toast.success(`Coupon "${code}" deleted successfully`);
      }
    } catch {
      toast.error('Failed to delete coupon');
    } finally {
      setDeleting(null);
    }
  }

  function copyCode(code: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(code);
      toast.success(`Coupon "${code}" copied to clipboard!`);
      setTimeout(() => setCopied(null), 2000);
    }
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
          className="flex items-center gap-2 bg-[var(--color-gold)] text-white rounded-xl px-5 py-2.5 font-medium text-sm hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Coupon
        </button>
      </div>

      {/* Search Bar */}
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
                {['Code', 'Discount', 'Min Order', 'Usage', 'Valid Until', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-whisper)]">
              <AnimatePresence>
                {filtered.map(c => {
                  const isExpired = c.valid_until && new Date(c.valid_until) < new Date();
                  return (
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
                            type="button"
                            onClick={() => copyCode(c.code)}
                            className="text-[var(--color-mist)] hover:text-[var(--color-gold)] transition-colors"
                            title="Copy code to clipboard"
                          >
                            {copied === c.code ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          {c.first_order_only && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-medium">
                              1st Order
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--color-slate)] mt-1 font-medium">{c.name}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[var(--color-ink)]">
                          {c.type === 'percentage' ? `${c.value}%` : `₹${Number(c.value).toLocaleString('en-IN')}`}
                        </span>
                        {c.max_discount_amount && (
                          <p className="text-xs text-[var(--color-mist)]">Max ₹{Number(c.max_discount_amount).toLocaleString('en-IN')}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[var(--color-slate)]">
                        {c.min_order_amount ? `₹${Number(c.min_order_amount).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <span className="text-[var(--color-ink)] font-medium">{c.usage_count}</span>
                          <span className="text-[var(--color-mist)]">/{c.usage_limit ?? '∞'}</span>
                        </div>
                        {c.user_limit && (
                          <p className="text-[10px] text-[var(--color-mist)]">Max {c.user_limit}/cust</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {c.valid_until ? (
                          <span className={isExpired ? 'text-red-500 font-medium' : 'text-[var(--color-slate)]'}>
                            {new Date(c.valid_until).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                            {isExpired && ' (Expired)'}
                          </span>
                        ) : (
                          <span className="text-[var(--color-mist)]">No expiry</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggle(c.id, !c.is_active)}
                          disabled={togglingId === c.id}
                          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${c.is_active ? 'text-green-600 hover:text-green-700' : 'text-[var(--color-mist)] hover:text-[var(--color-slate)]'} disabled:opacity-50`}
                          title={c.is_active ? 'Click to deactivate' : 'Click to activate'}
                        >
                          {c.is_active ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                          <span>{c.is_active ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(c)}
                            className="p-1.5 rounded-lg hover:bg-[var(--color-whisper)] text-[var(--color-slate)] hover:text-[var(--color-gold)] transition-colors"
                            title="Edit coupon"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id, c.code)}
                            disabled={deleting === c.id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--color-slate)] hover:text-red-500 transition-colors disabled:opacity-50"
                            title="Delete coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-[var(--color-mist)]">
              <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No coupons found</p>
              <button
                type="button"
                onClick={openCreate}
                className="mt-3 text-sm text-[var(--color-gold)] hover:underline font-medium"
              >
                Create a new coupon
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
              onClick={() => !saving && setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b border-[var(--color-whisper)]">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--color-ink)]">
                      {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Coupon'}
                    </h2>
                    <p className="text-xs text-[var(--color-slate)] mt-0.5">
                      Configure discount value, limits, and customer eligibility
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => !saving && setShowModal(false)}
                    className="p-2 rounded-lg hover:bg-[var(--color-whisper)] text-[var(--color-slate)] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">Coupon Code *</label>
                      <input
                        type="text"
                        value={form.code}
                        onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase().replace(/\s+/g, '') }))}
                        placeholder="e.g. DIWALI25"
                        className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)] uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">Coupon Name *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Festive Diwali Privilege"
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
                        className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)] bg-white"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">
                        Discount Value * {form.type === 'percentage' ? '(%)' : '(₹)'}
                      </label>
                      <input
                        type="number"
                        value={form.value}
                        onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                        min={1}
                        max={form.type === 'percentage' ? 100 : undefined}
                        placeholder={form.type === 'percentage' ? '15' : '500'}
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
                        placeholder="e.g. 1999 (0 for no minimum)"
                        min={0}
                        className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                      />
                    </div>
                    {form.type === 'percentage' ? (
                      <div>
                        <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">Max Discount Cap (₹)</label>
                        <input
                          type="number"
                          value={form.max_discount_amount}
                          onChange={e => setForm(f => ({ ...f, max_discount_amount: e.target.value }))}
                          placeholder="e.g. 2000 (No cap if empty)"
                          min={1}
                          className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">Per-Customer Limit</label>
                        <input
                          type="number"
                          value={form.user_limit}
                          onChange={e => setForm(f => ({ ...f, user_limit: e.target.value }))}
                          placeholder="e.g. 1 (per customer)"
                          min={1}
                          className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">Total Usage Limit</label>
                      <input
                        type="number"
                        value={form.usage_limit}
                        onChange={e => setForm(f => ({ ...f, usage_limit: e.target.value }))}
                        placeholder="Unlimited (across all users)"
                        min={1}
                        className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                      />
                    </div>
                    {form.type === 'percentage' && (
                      <div>
                        <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">Per-Customer Limit</label>
                        <input
                          type="number"
                          value={form.user_limit}
                          onChange={e => setForm(f => ({ ...f, user_limit: e.target.value }))}
                          placeholder="e.g. 1 (per customer)"
                          min={1}
                          className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                      <label className="block text-xs font-medium text-[var(--color-slate)] mb-1">Valid Until (Expiry)</label>
                      <input
                        type="date"
                        value={form.valid_until}
                        onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))}
                        className="w-full border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                      />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="pt-2 border-t border-[var(--color-whisper)] space-y-3">
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <span className="text-sm font-medium text-[var(--color-ink)]">Active Status</span>
                        <p className="text-xs text-[var(--color-slate)]">When enabled, customers can apply this coupon at checkout</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-[var(--color-gold)]' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <div>
                        <span className="text-sm font-medium text-[var(--color-ink)]">First Order Only</span>
                        <p className="text-xs text-[var(--color-slate)]">Restrict redemption exclusively to first-time shoppers</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, first_order_only: !f.first_order_only }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.first_order_only ? 'bg-[var(--color-gold)]' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.first_order_only ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--color-whisper)] bg-[var(--color-snow)] rounded-b-2xl">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={saving}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--color-slate)] hover:bg-[var(--color-whisper)] transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-[var(--color-gold)] text-white rounded-lg px-5 py-2.5 font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
                  >
                    {saving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving…</span>
                      </>
                    ) : (
                      editingCoupon ? 'Update Coupon' : 'Create Coupon'
                    )}
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
