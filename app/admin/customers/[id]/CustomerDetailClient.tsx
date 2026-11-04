'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Star, ShoppingBag, Crown, Edit2, Check, X } from 'lucide-react';
import { updateCustomerRole, updateLoyaltyPoints, updateCustomerTier } from '@/lib/actions/admin-customers';
import type { CustomerProfile } from '@/lib/actions/admin-customers';

const ROLES = ['customer', 'manager', 'designer', 'admin'];
const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum'];

const TIER_COLORS: Record<string, string> = {
  Bronze: 'bg-amber-100 text-amber-700',
  Silver: 'bg-slate-100 text-slate-700',
  Gold: 'bg-yellow-100 text-yellow-700',
  Platinum: 'bg-indigo-100 text-indigo-700',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

function getInitials(name: string | null, email: string) {
  if (name) return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
}

interface Props {
  customer: CustomerProfile;
  orders: Order[];
}

export default function CustomerDetailClient({ customer, orders }: Props) {
  const [, startTransition] = useTransition();
  const [role, setRole] = useState(customer.role);
  const [tier, setTier] = useState(customer.loyalty_tier ?? 'Bronze');
  const [points, setPoints] = useState(String(customer.loyalty_points ?? 0));
  const [editingPoints, setEditingPoints] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  function flash(key: string) {
    setSaved(key);
    setTimeout(() => setSaved(null), 2500);
  }

  function handleRoleChange(newRole: string) {
    setRole(newRole);
    setSaving('role');
    startTransition(async () => {
      await updateCustomerRole(customer.id, newRole);
      setSaving(null);
      flash('role');
    });
  }

  function handleTierChange(newTier: string) {
    setTier(newTier);
    setSaving('tier');
    startTransition(async () => {
      await updateCustomerTier(customer.id, newTier);
      setSaving(null);
      flash('tier');
    });
  }

  function handleSavePoints() {
    setSaving('points');
    startTransition(async () => {
      await updateLoyaltyPoints(customer.id, Number(points));
      setSaving(null);
      flash('points');
      setEditingPoints(false);
    });
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/customers" className="p-2 rounded-xl hover:bg-[var(--color-whisper)] text-[var(--color-slate)] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center">
            <span className="text-[var(--color-gold)] font-bold text-xl">
              {getInitials(customer.full_name, customer.email)}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-medium" style={{ fontFamily: 'var(--font-display)' }}>
              {customer.full_name || 'Anonymous'}
            </h1>
            <p className="text-sm text-[var(--color-slate)]">Customer since {new Date(customer.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile & Controls */}
        <div className="space-y-6">
          {/* Contact */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm p-6">
            <h2 className="font-semibold text-[var(--color-ink)] mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[var(--color-gold)]" /> Contact
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-[var(--color-slate)]">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2 text-[var(--color-slate)]">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{customer.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Role */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm p-6">
            <h2 className="font-semibold text-[var(--color-ink)] mb-4 flex items-center gap-2">
              <Crown className="w-4 h-4 text-[var(--color-gold)]" /> Role
              {saving === 'role' && <span className="text-xs text-[var(--color-mist)] ml-auto animate-pulse">Saving…</span>}
              {saved === 'role' && <span className="text-xs text-green-600 ml-auto flex items-center gap-1"><Check className="w-3 h-3" /> Saved</span>}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(r => (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition-colors ${
                    role === r
                      ? 'bg-[var(--color-gold)] text-white'
                      : 'bg-[var(--color-snow)] text-[var(--color-slate)] hover:bg-[var(--color-whisper)]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Loyalty */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm p-6">
            <h2 className="font-semibold text-[var(--color-ink)] mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-[var(--color-gold)]" /> Loyalty
            </h2>

            {/* Tier */}
            <p className="text-xs text-[var(--color-slate)] mb-2 font-medium uppercase tracking-wide">Tier</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {TIERS.map(t => (
                <button
                  key={t}
                  onClick={() => handleTierChange(t)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    tier === t
                      ? 'bg-[var(--color-gold)] text-white'
                      : `${TIER_COLORS[t]} opacity-80 hover:opacity-100`
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {saved === 'tier' && <p className="text-xs text-green-600 mb-3 flex items-center gap-1"><Check className="w-3 h-3" /> Tier saved</p>}

            {/* Points */}
            <p className="text-xs text-[var(--color-slate)] mb-2 font-medium uppercase tracking-wide">Points</p>
            {editingPoints ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  value={points}
                  onChange={e => setPoints(e.target.value)}
                  min={0}
                  className="flex-1 border border-[var(--color-whisper)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                />
                <button onClick={handleSavePoints} disabled={saving === 'points'} className="p-2 bg-[var(--color-gold)] text-white rounded-lg hover:opacity-90">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => { setEditingPoints(false); setPoints(String(customer.loyalty_points ?? 0)); }} className="p-2 bg-[var(--color-snow)] text-[var(--color-slate)] rounded-lg hover:bg-[var(--color-whisper)]">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-[var(--color-ink)]">{Number(points).toLocaleString('en-IN')}</span>
                <button onClick={() => setEditingPoints(true)} className="p-2 hover:bg-[var(--color-whisper)] rounded-lg text-[var(--color-slate)] transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
            {saved === 'points' && <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><Check className="w-3 h-3" /> Points updated</p>}
          </div>
        </div>

        {/* Right: Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm p-6">
            <h2 className="font-semibold text-[var(--color-ink)] mb-4 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[var(--color-gold)]" />
              Recent Orders ({orders.length})
            </h2>

            {orders.length === 0 ? (
              <div className="py-12 text-center text-[var(--color-mist)]">
                <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-whisper)] hover:border-[var(--color-gold)]/40 hover:bg-[var(--color-snow)] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[var(--color-snow)] flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4 text-[var(--color-mist)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--color-ink)] group-hover:text-[var(--color-gold)] transition-colors">
                          #{order.order_number}
                        </p>
                        <p className="text-xs text-[var(--color-slate)]">
                          {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                      <span className="font-semibold text-[var(--color-ink)]">
                        ₹{Number(order.total_amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
