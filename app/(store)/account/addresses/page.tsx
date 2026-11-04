'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils/cn';

export interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  type: 'Home' | 'Work' | 'Other';
  is_default: boolean;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh'
];

export default function AddressesPage() {
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: 'Karnataka',
    pincode: '',
    type: 'Home' as 'Home' | 'Work' | 'Other',
    is_default: false,
  });

  // Load addresses from profile preferences or localStorage
  useEffect(() => {
    let loaded: SavedAddress[] = [];

    if (profile?.preferences && typeof profile.preferences === 'object') {
      const prefs = profile.preferences as Record<string, any>;
      const rawAddrs = prefs['addresses'];
      if (Array.isArray(rawAddrs) && rawAddrs.length > 0) {
        loaded = rawAddrs;
      }
    }

    if (loaded.length === 0 && typeof window !== 'undefined') {
      const stored = localStorage.getItem('angelika_saved_addresses');
      if (stored) {
        try {
          loaded = JSON.parse(stored);
        } catch {
          loaded = [];
        }
      }
    }

    setAddresses(loaded);
  }, [profile]);

  // Persist addresses
  const persistAddresses = async (newAddresses: SavedAddress[]) => {
    setAddresses(newAddresses);
    if (typeof window !== 'undefined') {
      localStorage.setItem('angelika_saved_addresses', JSON.stringify(newAddresses));
    }

    if (user && profile) {
      try {
        const existingPrefs = (profile.preferences && typeof profile.preferences === 'object')
          ? (profile.preferences as Record<string, any>)
          : {};

        await updateProfile({
          preferences: {
            ...existingPrefs,
            addresses: newAddresses as any,
          } as any,
        });
      } catch (err) {
        console.warn('Profile sync note:', err);
      }
    }
  };

  const handleOpenAddForm = () => {
    setEditingId(null);
    setFormData({
      name: profile?.full_name || (user?.user_metadata as any)?.full_name || '',
      phone: profile?.phone || '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: 'Karnataka',
      pincode: '',
      type: 'Home',
      is_default: addresses.length === 0,
    });
    setIsFormOpen(true);
  };

  const handleEdit = (addr: SavedAddress) => {
    setEditingId(addr.id);
    setFormData({
      name: addr.name,
      phone: addr.phone,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      type: addr.type,
      is_default: addr.is_default,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    // If deleted was default, make the first one default
    if (updated.length > 0 && !updated.some((a) => a.is_default)) {
      if (updated[0]) updated[0].is_default = true;
    }
    await persistAddresses(updated);
    toast.success('Address removed successfully');
  };

  const handleSetDefault = async (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      is_default: a.id === id,
    }));
    await persistAddresses(updated);
    toast.success('Default address updated');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address_line1.trim() || !formData.city.trim() || !formData.pincode.trim()) {
      toast.error('Please fill in all mandatory address fields');
      return;
    }

    if (formData.phone.trim().replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    if (formData.pincode.trim().length !== 6) {
      toast.error('Please enter a valid 6-digit PIN code');
      return;
    }

    setIsSubmitting(true);

    try {
      let updated: SavedAddress[];

      if (editingId) {
        updated = addresses.map((a) => {
          if (a.id === editingId) {
            return {
              ...a,
              ...formData,
            };
          }
          // If edited address is default, reset others
          return formData.is_default ? { ...a, is_default: false } : a;
        });
      } else {
        const newAddress: SavedAddress = {
          id: `addr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          ...formData,
        };

        if (formData.is_default || addresses.length === 0) {
          updated = addresses.map((a) => ({ ...a, is_default: false }));
          updated.push({ ...newAddress, is_default: true });
        } else {
          updated = [...addresses, newAddress];
        }
      }

      await persistAddresses(updated);
      toast.success(editingId ? 'Address updated successfully' : 'Address added successfully');
      setIsFormOpen(false);
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-snow)]/60 py-10 md:py-14">
      <div className="container-custom max-w-5xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb & Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-slate)] hover:text-[var(--color-gold)] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back to Account Overview</span>
          </Link>
          <span className="text-xs uppercase tracking-wider text-[var(--color-slate)] font-semibold">
            Delivery Address Book
          </span>
        </div>

        {/* Header with CTA */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[var(--font-display)] text-3xl sm:text-4xl font-normal text-[var(--color-ink)]">
              Saved Addresses
            </h1>
            <p className="mt-2 text-sm text-[var(--color-slate)]">
              Manage your delivery addresses for seamless, 1-click checkout.
            </p>
          </div>
          {!isFormOpen && (
            <button
              onClick={handleOpenAddForm}
              className="px-5 py-2.5 rounded-full bg-[var(--color-gold)] text-[var(--color-ink)] text-xs sm:text-sm font-semibold hover:bg-[var(--color-gold-hover)] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add New Address</span>
            </button>
          )}
        </div>

        {/* Collapsible Address Form */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <Card variant="elevated" padding="lg" className="border border-[var(--color-whisper)] rounded-3xl bg-white shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-[var(--color-whisper)]">
                  <h3 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)]">
                    {editingId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                  </h3>
                  <button
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingId(null);
                    }}
                    className="text-xs text-[var(--color-slate)] hover:text-[var(--color-ink)] font-medium p-1"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-slate)] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Priya Sharma"
                        className="w-full px-3.5 py-2.5 text-sm bg-[var(--color-snow)]/60 border border-[var(--color-whisper)] rounded-xl focus:border-[var(--color-gold)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-slate)] mb-1">
                        10-Digit Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. 9876543210"
                        className="w-full px-3.5 py-2.5 text-sm bg-[var(--color-snow)]/60 border border-[var(--color-whisper)] rounded-xl focus:border-[var(--color-gold)] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-slate)] mb-1">
                      Flat, House no., Building, Apartment *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address_line1}
                      onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                      placeholder="e.g. Flat 402, Royal Palms Residency"
                      className="w-full px-3.5 py-2.5 text-sm bg-[var(--color-snow)]/60 border border-[var(--color-whisper)] rounded-xl focus:border-[var(--color-gold)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-slate)] mb-1">
                      Area, Colony, Street, Sector (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.address_line2}
                      onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                      placeholder="e.g. 12th Main, Indiranagar"
                      className="w-full px-3.5 py-2.5 text-sm bg-[var(--color-snow)]/60 border border-[var(--color-whisper)] rounded-xl focus:border-[var(--color-gold)] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-slate)] mb-1">
                        City / District *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Bangalore"
                        className="w-full px-3.5 py-2.5 text-sm bg-[var(--color-snow)]/60 border border-[var(--color-whisper)] rounded-xl focus:border-[var(--color-gold)] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-slate)] mb-1">
                        State *
                      </label>
                      <select
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-[var(--color-snow)]/60 border border-[var(--color-whisper)] rounded-xl focus:border-[var(--color-gold)] focus:outline-none"
                      >
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-slate)] mb-1">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        placeholder="e.g. 560038"
                        className="w-full px-3.5 py-2.5 text-sm bg-[var(--color-snow)]/60 border border-[var(--color-whisper)] rounded-xl focus:border-[var(--color-gold)] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Address Type & Default */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-slate)]">Type:</span>
                      {(['Home', 'Work', 'Other'] as const).map((t) => (
                        <label key={t} className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                          <input
                            type="radio"
                            name="address_type"
                            checked={formData.type === t}
                            onChange={() => setFormData({ ...formData, type: t })}
                            className="text-[var(--color-gold)] focus:ring-[var(--color-gold)]"
                          />
                          <span>{t}</span>
                        </label>
                      ))}
                    </div>

                    <label className="inline-flex items-center gap-2 text-xs font-medium text-[var(--color-charcoal)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_default}
                        onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                        className="rounded border-[var(--color-whisper)] text-[var(--color-gold)] focus:ring-[var(--color-gold)]"
                      />
                      <span>Set as default delivery address</span>
                    </label>
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-whisper)]">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFormOpen(false);
                        setEditingId(null);
                      }}
                      className="px-5 py-2 rounded-full border border-[var(--color-whisper)] text-xs font-medium hover:bg-[var(--color-whisper)] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-full bg-[var(--color-gold)] text-[var(--color-ink)] text-xs sm:text-sm font-semibold hover:bg-[var(--color-gold-hover)] transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
                    </button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Address Cards Grid */}
        {addresses.length === 0 && !isFormOpen ? (
          <div className="bg-white rounded-3xl border border-[var(--color-whisper)] p-12 text-center shadow-xs">
            <div className="w-20 h-20 mx-auto rounded-full bg-[var(--color-gold-light)]/50 border border-[var(--color-gold)]/20 flex items-center justify-center mb-5 text-[var(--color-gold)]">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h3 className="text-[var(--font-display)] text-2xl font-medium text-[var(--color-ink)] mb-2">
              No Addresses Saved Yet
            </h3>
            <p className="text-sm text-[var(--color-slate)] max-w-md mx-auto mb-6 leading-relaxed">
              Add your delivery addresses to enjoy seamless, expedited checkout and real-time shipping calculation on your favorite ethnic wear.
            </p>
            <button
              onClick={handleOpenAddForm}
              className="px-6 py-3 rounded-full bg-[var(--color-gold)] text-[var(--color-ink)] font-semibold text-sm hover:bg-[var(--color-gold-hover)] transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <span>+ Add Your First Address</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <Card
                key={address.id}
                variant="elevated"
                padding="lg"
                className={cn(
                  'border rounded-2xl bg-white shadow-xs relative transition-all duration-150',
                  address.is_default
                    ? 'border-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/30'
                    : 'border-[var(--color-whisper)] hover:border-[var(--color-gold)]/40'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base text-[var(--color-ink)]">{address.name}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[var(--color-snow)] text-[var(--color-slate)] border border-[var(--color-whisper)]">
                      {address.type}
                    </span>
                  </div>
                  {address.is_default && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--color-gold-light)] text-[var(--color-gold-dark,var(--color-ink))] border border-[var(--color-gold)]/30">
                      Default
                    </span>
                  )}
                </div>

                <div className="text-xs sm:text-sm text-[var(--color-slate)] space-y-1 mb-5">
                  <p className="text-[var(--color-ink)]">{address.address_line1}</p>
                  {address.address_line2 && <p>{address.address_line2}</p>}
                  <p>
                    {address.city}, {address.state} — <strong className="text-[var(--color-ink)]">{address.pincode}</strong>
                  </p>
                  <p className="pt-1 text-[var(--color-charcoal)]">
                    <span className="text-[var(--color-slate)]">Contact:</span> +91 {address.phone}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--color-whisper)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(address)}
                      className="text-xs font-semibold text-[var(--color-gold)] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                    <span className="text-[var(--color-whisper)]">&bull;</span>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="text-xs font-semibold text-[var(--color-error)] hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>

                  {!address.is_default && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-xs font-medium text-[var(--color-slate)] hover:text-[var(--color-ink)] cursor-pointer"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
