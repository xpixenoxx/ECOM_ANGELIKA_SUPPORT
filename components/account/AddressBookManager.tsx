'use client';

import { useState, useEffect, useId } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { saveCustomerAddressesAction, type SavedAddress } from '@/lib/actions/customer-account';
import { normalizeAddress } from '@/lib/utils/address';
import {
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Check,
  Home,
  Briefcase,
  Sparkles,
  Loader2,
  AlertCircle,
  ArrowRight,
  Import,
} from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Chandigarh',
];

const LOCAL_STORAGE_KEY = 'angelika_saved_addresses';

interface AddressFormValues {
  label: string;
  fullName: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

const EMPTY_FORM: AddressFormValues = {
  label: 'Home',
  fullName: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  state: 'Telangana',
  postalCode: '',
  isDefault: false,
};

function sanitizePhoneDigits(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length > 10 && digits.startsWith('91')) return digits.slice(-10);
  if (digits.length > 10 && digits.startsWith('0')) return digits.slice(-10);
  return digits.slice(-10);
}

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstName: parts[0] || '', lastName: '' };
  }
  return { firstName: parts[0]!, lastName: parts.slice(1).join(' ') };
}

export interface AddressBookManagerProps {
  initialAddresses: SavedAddress[];
  defaultName?: string | null;
  defaultPhone?: string | null;
  recentOrderAddress?: {
    orderNumber: string;
    address: SavedAddress;
  } | null;
  embedded?: boolean;
}

export function AddressBookManager({
  initialAddresses,
  defaultName,
  defaultPhone,
  recentOrderAddress,
  embedded = false,
}: AddressBookManagerProps) {
  const { refreshProfile } = useAuth();
  const formIdPrefix = useId();
  const [addresses, setAddresses] = useState<SavedAddress[]>(initialAddresses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<AddressFormValues>(EMPTY_FORM);

  // Sync SSR addresses to localStorage so checkout can also pick them up immediately
  useEffect(() => {
    try {
      if (addresses.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(addresses));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch {
      // Ignore storage quota errors
    }
  }, [addresses]);

  const persistAddresses = async (nextList: SavedAddress[], successMessage: string) => {
    setIsSaving(true);
    setFormError(null);
    try {
      const res = await saveCustomerAddressesAction(nextList);
      if (!res.success || !res.addresses) {
        setFormError(res.error || 'Could not save address changes.');
        toast.error(res.error || 'Could not save address changes.');
        return false;
      }
      setAddresses(res.addresses);
      toast.success(successMessage);
      refreshProfile().catch(() => {});
      return true;
    } catch {
      setFormError('Network error while saving address. Please try again.');
      toast.error('Network error while saving address.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormError(null);
    setForm({
      ...EMPTY_FORM,
      fullName: defaultName?.trim() || '',
      phone: defaultPhone ? sanitizePhoneDigits(defaultPhone) : '',
      isDefault: addresses.length === 0,
    });
    setIsFormOpen(true);
  };

  const openEditForm = (addr: SavedAddress) => {
    setEditingId(addr.id || null);
    setFormError(null);
    setForm({
      label: addr.label || addr.type || 'Home',
      fullName: [addr.firstName, addr.lastName].filter(Boolean).join(' ').trim(),
      phone: addr.phone || '',
      address1: addr.address1 || '',
      address2: addr.address2 || '',
      city: addr.city || '',
      state: addr.state || 'Telangana',
      postalCode: addr.postalCode || '',
      isDefault: Boolean(addr.isDefault),
    });
    setIsFormOpen(true);
  };

  const handleImportRecentOrderAddress = async () => {
    if (!recentOrderAddress?.address) return;
    const normalized = normalizeAddress({
      ...recentOrderAddress.address,
      id: `addr_${Date.now()}`,
      type: recentOrderAddress.address.label || recentOrderAddress.address.type || 'Home',
      isDefault: true,
    });
    const imported: SavedAddress = {
      ...normalized,
      label: recentOrderAddress.address.label || normalized.type || 'Home',
    };
    await persistAddresses([imported], `Imported delivery address from ${recentOrderAddress.orderNumber}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanFullName = form.fullName.trim();
    const cleanPhone = sanitizePhoneDigits(form.phone);
    const cleanPostal = form.postalCode.replace(/\D/g, '');

    if (cleanFullName.length < 2) {
      setFormError('Please enter the recipient full name.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setFormError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (form.address1.trim().length < 5) {
      setFormError('Please enter your full house/flat number and street address.');
      return;
    }
    if (form.city.trim().length < 2) {
      setFormError('Please enter your city.');
      return;
    }
    if (!/^[1-9]\d{5}$/.test(cleanPostal)) {
      setFormError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    const { firstName, lastName } = splitFullName(cleanFullName);
    const normalizedRecord = normalizeAddress({
      id: editingId || `addr_${Date.now()}`,
      type: form.label || 'Home',
      firstName,
      lastName,
      phone: cleanPhone,
      address1: form.address1.trim(),
      address2: form.address2.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: cleanPostal,
      country: 'India',
      isDefault: form.isDefault || addresses.length === 0,
    });
    const record: SavedAddress = {
      ...normalizedRecord,
      label: form.label || normalizedRecord.type || 'Home',
    };

    let updated: SavedAddress[];
    if (editingId) {
      updated = addresses.map((a) => (a.id === editingId ? record : a));
    } else {
      updated = [...addresses, record];
    }

    if (record.isDefault) {
      updated = updated.map((a) => ({ ...a, isDefault: a.id === record.id }));
    }

    const ok = await persistAddresses(
      updated,
      editingId ? 'Delivery address updated.' : 'New delivery address saved.'
    );
    if (ok) {
      setIsFormOpen(false);
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const remaining = addresses.filter((a) => a.id !== id);
    if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
      remaining[0] = { ...remaining[0]!, isDefault: true };
    }
    const ok = await persistAddresses(remaining, 'Delivery address removed.');
    if (ok) setConfirmDeleteId(null);
  };

  const handleSetDefault = async (id: string) => {
    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    await persistAddresses(updated, 'Default delivery address updated.');
  };

  const renderLabelIcon = (label?: string) => {
    const normalized = (label || '').toLowerCase();
    if (normalized === 'work' || normalized === 'office') {
      return <Briefcase className="w-3.5 h-3.5 text-[#74590E]" />;
    }
    if (normalized === 'home') {
      return <Home className="w-3.5 h-3.5 text-[#74590E]" />;
    }
    return <Sparkles className="w-3.5 h-3.5 text-[#74590E]" />;
  };

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={embedded ? 'text-2xl font-display font-semibold text-[#1A1A1A]' : 'text-3xl sm:text-4xl font-display font-medium text-[#1A1A1A] tracking-tight'}>
            Saved Addresses
          </h2>
          <p className="text-sm text-[#5A544B] mt-1">
            Manage delivery destinations for express one-tap checkout across India.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {embedded && (
            <Link
              href="/account/addresses"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.12em] text-[#5A544B] bg-[#FAF8F4] border border-[#DFD5C8] hover:border-[#C9A84C] hover:text-[#1A1A1A] transition-colors"
            >
              Full Page <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
          <button
            type="button"
            onClick={openAddForm}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.14em] bg-[#161310] text-[#FAF6F0] hover:bg-[#2A2520] transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Plus className="w-4 h-4 text-[#C9A84C]" />
            Add New Address
          </button>
        </div>
      </div>

      {/* Add / Edit Form Drawer Card */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="rounded-2xl bg-[#FFFFFF] border-2 border-[#C9A84C]/55 shadow-[0_14px_40px_rgba(22,19,16,0.08)] overflow-hidden"
          >
            <div className="px-6 py-4 bg-[#FAF8F4] border-b border-[#EAE2D6] flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-semibold text-[#1A1A1A]">
                  {editingId ? 'Edit Delivery Address' : 'Add Delivery Address'}
                </h3>
                <p className="text-xs text-[#6B6258] mt-0.5">
                  Browser autofill supported — mobile numbers with +91 are normalized automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingId(null);
                  setFormError(null);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#5A544B] hover:text-[#1A1A1A] hover:bg-[#EFEAE2] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>
              {formError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#991B1B]"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Address Label Selector */}
              <fieldset>
                <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5A544B] mb-2">
                  Address Type
                </legend>
                <div className="flex flex-wrap gap-2">
                  {['Home', 'Work', 'Atelier / Boutique', 'Other'].map((lbl) => {
                    const active = form.label === lbl;
                    return (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, label: lbl }))}
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                          active
                            ? 'bg-[#161310] text-[#FAF6F0] border-[#161310]'
                            : 'bg-[#FAF8F4] text-[#5A544B] border-[#DFD5C8] hover:border-[#C9A84C]'
                        }`}
                      >
                        {lbl}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor={`${formIdPrefix}-fullname`}
                    className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#3F3A34] mb-1.5"
                  >
                    Recipient Full Name <span className="text-[#B42318]">*</span>
                  </label>
                  <input
                    id={`${formIdPrefix}-fullname`}
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                    placeholder="e.g., Priya Sharma"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#D8CEC0] text-sm text-[#1A1A1A] placeholder:text-[#8E8477] focus:outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/25"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`${formIdPrefix}-phone`}
                    className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#3F3A34] mb-1.5"
                  >
                    Mobile Number (India) <span className="text-[#B42318]">*</span>
                  </label>
                  <input
                    id={`${formIdPrefix}-phone`}
                    name="tel"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="10-digit mobile (e.g., 9876543210)"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#D8CEC0] text-sm text-[#1A1A1A] placeholder:text-[#8E8477] focus:outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/25"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`${formIdPrefix}-address1`}
                  className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#3F3A34] mb-1.5"
                >
                  Flat / House No., Building & Street <span className="text-[#B42318]">*</span>
                </label>
                <input
                  id={`${formIdPrefix}-address1`}
                  name="address-line1"
                  type="text"
                  autoComplete="address-line1"
                  required
                  value={form.address1}
                  onChange={(e) => setForm((p) => ({ ...p, address1: e.target.value }))}
                  placeholder="House No. 42, Jubilee Hills Road No. 36"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#D8CEC0] text-sm text-[#1A1A1A] placeholder:text-[#8E8477] focus:outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/25"
                />
              </div>

              <div>
                <label
                  htmlFor={`${formIdPrefix}-address2`}
                  className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#3F3A34] mb-1.5"
                >
                  Landmark / Area <span className="text-[#7A7065] font-normal">(Optional)</span>
                </label>
                <input
                  id={`${formIdPrefix}-address2`}
                  name="address-line2"
                  type="text"
                  autoComplete="address-line2"
                  value={form.address2}
                  onChange={(e) => setForm((p) => ({ ...p, address2: e.target.value }))}
                  placeholder="Near Peddamma Temple, Phase 2"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#D8CEC0] text-sm text-[#1A1A1A] placeholder:text-[#8E8477] focus:outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/25"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor={`${formIdPrefix}-city`}
                    className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#3F3A34] mb-1.5"
                  >
                    City <span className="text-[#B42318]">*</span>
                  </label>
                  <input
                    id={`${formIdPrefix}-city`}
                    name="city"
                    type="text"
                    autoComplete="address-level2"
                    required
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    placeholder="Hyderabad"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#D8CEC0] text-sm text-[#1A1A1A] placeholder:text-[#8E8477] focus:outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/25"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`${formIdPrefix}-state`}
                    className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#3F3A34] mb-1.5"
                  >
                    State <span className="text-[#B42318]">*</span>
                  </label>
                  <select
                    id={`${formIdPrefix}-state`}
                    name="state"
                    autoComplete="address-level1"
                    required
                    value={form.state}
                    onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#D8CEC0] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/25"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor={`${formIdPrefix}-postal`}
                    className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#3F3A34] mb-1.5"
                  >
                    PIN Code <span className="text-[#B42318]">*</span>
                  </label>
                  <input
                    id={`${formIdPrefix}-postal`}
                    name="postal-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    required
                    value={form.postalCode}
                    onChange={(e) => setForm((p) => ({ ...p, postalCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    placeholder="500033"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#D8CEC0] text-sm text-[#1A1A1A] placeholder:text-[#8E8477] focus:outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/25"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))}
                  className="h-4 w-4 rounded border-[#C8BEB0] accent-[#161310]"
                />
                <span className="text-sm text-[#3F3A34]">
                  Set as my default delivery address for express checkout
                </span>
              </label>

              <div className="pt-4 border-t border-[#EAE2D6] flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.12em] text-[#5A544B] hover:bg-[#EFEAE2] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.14em] bg-[#161310] text-[#FAF6F0] hover:bg-[#2A2520] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9A84C]" />}
                  {editingId ? 'Update Delivery Address' : 'Save Delivery Address'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* One-click import banner if user has 0 saved addresses but has placed an order */}
      {addresses.length === 0 && recentOrderAddress && !isFormOpen && (
        <div className="rounded-2xl bg-[#FAF8F4] border border-[#C9A84C]/45 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F6EDD9] border border-[#C9A84C]/40 flex items-center justify-center shrink-0">
              <Import className="w-5 h-5 text-[#74590E]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A]">
                Import address from your order {recentOrderAddress.orderNumber}
              </p>
              <p className="text-xs text-[#5A544B] mt-0.5">
                {[recentOrderAddress.address.firstName, recentOrderAddress.address.lastName].filter(Boolean).join(' ')} — {recentOrderAddress.address.address1}, {recentOrderAddress.address.city}, {recentOrderAddress.address.state} {recentOrderAddress.address.postalCode}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleImportRecentOrderAddress}
            disabled={isSaving}
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.12em] bg-[#161310] text-[#FAF6F0] hover:bg-[#2A2520] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 text-[#C9A84C]" />}
            Import Address
          </button>
        </div>
      )}

      {/* Address Cards Grid */}
      {addresses.length === 0 && !isFormOpen ? (
        <div className="rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] p-10 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF4E8] border border-[#E6D5B0] flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-6 h-6 text-[#947218]" />
          </div>
          <h3 className="font-display text-2xl font-medium text-[#1A1A1A]">No Saved Addresses Yet</h3>
          <p className="text-sm text-[#5A544B] max-w-md mx-auto mt-2">
            Add your home or office delivery destination now so checkout takes less than 15 seconds on your next order.
          </p>
          <button
            type="button"
            onClick={openAddForm}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-[0.14em] bg-[#161310] text-[#FAF6F0] hover:bg-[#2A2520] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C9A84C]" />
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => {
            const addrId = addr.id || `${addr.postalCode}-${addr.address1}`;
            const isDeletingThis = confirmDeleteId === addrId;
            return (
              <div
                key={addrId}
                className={`rounded-2xl bg-[#FFFFFF] p-5 flex flex-col justify-between transition-all ${
                  addr.isDefault
                    ? 'border-2 border-[#C9A84C] shadow-[0_10px_30px_rgba(201,168,76,0.12)]'
                    : 'border border-[#E5DDD2] hover:border-[#C9A84C]/60 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#F1EAE0]">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FAF8F4] text-[#3F3A34] border border-[#E5DDD2]">
                      {renderLabelIcon(addr.label)}
                      {addr.label || 'Home'}
                    </span>
                    {addr.isDefault ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.12em] bg-[#161310] text-[#E6C77A]">
                        <Check className="w-3 h-3" /> Default
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addr.id && handleSetDefault(addr.id)}
                        disabled={isSaving}
                        className="text-[11px] font-semibold text-[#74590E] hover:text-[#1A1A1A] underline underline-offset-4 cursor-pointer disabled:opacity-50"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>

                  <div className="mt-4 space-y-1 text-sm">
                    <p className="font-semibold text-[#1A1A1A]">
                      {[addr.firstName, addr.lastName].filter(Boolean).join(' ') || 'Recipient'}
                    </p>
                    <p className="text-[#4E4840] leading-relaxed">{addr.address1}</p>
                    {addr.address2 && <p className="text-[#5A544B]">{addr.address2}</p>}
                    <p className="text-[#4E4840]">
                      {addr.city}, {addr.state} — <span className="font-medium text-[#1A1A1A]">{addr.postalCode}</span>
                    </p>
                    {addr.phone && (
                      <p className="text-xs text-[#6B6258] pt-1.5">
                        Mobile: <span className="font-medium text-[#1A1A1A]">+91 {sanitizePhoneDigits(addr.phone)}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="mt-5 pt-3.5 border-t border-[#F1EAE0] flex items-center justify-between gap-2">
                  {isDeletingThis ? (
                    <div className="w-full flex items-center justify-between gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-xl px-3 py-2">
                      <span className="text-xs font-medium text-[#991B1B]">Remove this address?</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#3F3A34] bg-[#FFFFFF] border border-[#E5DDD2] hover:bg-[#FAF8F4] cursor-pointer"
                        >
                          Keep
                        </button>
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => addr.id && handleDelete(addr.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#FFFFFF] bg-[#B42318] hover:bg-[#991B1B] cursor-pointer disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditForm(addr)}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1A1A1A] bg-[#FAF8F4] border border-[#E5DDD2] hover:border-[#C9A84C] transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#74590E]" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(addrId)}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#B42318] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
