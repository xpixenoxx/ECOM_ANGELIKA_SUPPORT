'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type { CheckoutAddressPageContent, CheckoutAddressTypeOption } from '@/lib/actions/site-content-types';

function AdminFormField({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  prefix,
  helperText,
  disabled = false,
  className = '',
}: {
  label: string;
  value?: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  prefix?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1', className)}>
      <label className="block text-xs font-semibold text-[var(--color-ink,#111111)] tracking-wide">
        {label}
      </label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-xs font-medium text-[var(--color-slate,#666666)] select-none pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type={type}
          disabled={disabled}
          value={value ?? ''}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full h-10 text-xs px-3 rounded-lg border border-[var(--color-whisper,#E5E5E5)] bg-[var(--color-white,#FFFFFF)] text-[var(--color-ink,#111111)] placeholder:text-[var(--color-mist,#999999)] focus:outline-none focus:border-[var(--color-gold,#C9A84C)] focus:ring-1 focus:ring-[var(--color-gold,#C9A84C)] transition-colors',
            prefix && 'pl-16',
            disabled && 'opacity-60 cursor-not-allowed bg-[var(--color-snow,#F9F9F9)]'
          )}
        />
      </div>
      {helperText && (
        <p className="text-[10px] text-[var(--color-slate,#666666)] leading-tight">{helperText}</p>
      )}
    </div>
  );
}

const DEFAULT_CHECKOUT_DATA: CheckoutAddressPageContent = {
  header: {
    stepperDeliveryLabel: 'Delivery',
    stepperDeliverySubtext: 'Shipping address',
    stepperPaymentLabel: 'Payment',
    stepperPaymentSubtext: 'Choose payment method',
    contactSectionTitle: '1. Contact Details & Dispatch Updates',
  },
  contact: {
    emailLabel: 'Email Address *',
    emailPlaceholder: 'you@example.com',
    phoneLabel: 'Mobile Number *',
    phonePlaceholder: '10-digit number',
    phonePrefix: 'IN +91',
    whatsappUpdatesText: 'Send dispatch updates & live tracking photos via WhatsApp',
    whatsappDefaultChecked: true,
  },
  shipping: {
    sectionHeading: '2. Shipping Destination',
    firstNameLabel: 'First Name *',
    firstNamePlaceholder: 'e.g. Priya',
    lastNameLabel: 'Last Name *',
    lastNamePlaceholder: 'e.g. Sharma',
    address1Label: 'Flat / House No., Apartment & Street Address *',
    address1Placeholder: 'e.g. Flat 402, Lotus Residency, MG Road',
    address2Label: 'Landmark / Floor (Optional)',
    address2Placeholder: 'e.g. Near Indiranagar Metro Station',
    pincodeLabel: 'Pincode *',
    pincodePlaceholder: '6-digit pincode',
    cityLabel: 'City / District *',
    cityPlaceholder: 'City',
    stateLabel: 'State *',
    statePlaceholder: 'Select state',
    addressTypeLabel: 'Address Type',
    addressTypes: [
      { id: 'Home', label: 'Home', icon: '🏠' },
      { id: 'Office', label: 'Office', icon: '🏢' },
      { id: 'Other', label: 'Other', icon: '✨' },
    ],
  },
  deliveryAndGifting: {
    pincodeResolvingText: 'Resolving...',
    deliveringToPrefix: 'Delivering to',
    expectedDeliveryPrefix: '⚡ Expected delivery by',
    giftWrapTitle: 'Complimentary Luxury Gift Packaging',
    giftWrapSubtitle: 'Includes rigid keepsake box, personalized hand-calligraphed note card, and silk ribbon.',
    giftMessageLabel: 'Gift Message on Handcrafted Card',
    giftMessagePlaceholder: 'Wishing you radiant joy on your special day...',
  },
  buttonsAndSecurity: {
    deliverToAddressButtonText: 'Deliver to This Address',
    addNewAddressButtonText: '+ Add New Delivery Address',
    continueToPaymentButtonText: 'Proceed to Payment',
    securityBadgeText: '256-bit Bank Grade Encryption & Protected Checkout',
  },
};

type TabKey = 'contact' | 'shipping' | 'addressTypes' | 'delivery' | 'buttons';

export function CheckoutAddressFormEditor({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState<CheckoutAddressPageContent>(DEFAULT_CHECKOUT_DATA);
  const [activeTab, setActiveTab] = useState<TabKey>('contact');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Fetch initial data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const json = await res.json();
          if (json.content && json.content['checkout-address-page'] && isMounted) {
            const raw = json.content['checkout-address-page'];
            setFormData({
              header: {
                ...DEFAULT_CHECKOUT_DATA.header,
                ...(raw.header || {}),
              },
              contact: {
                ...DEFAULT_CHECKOUT_DATA.contact,
                ...(raw.contact || {}),
              },
              shipping: {
                ...DEFAULT_CHECKOUT_DATA.shipping,
                ...(raw.shipping || {}),
                addressTypes: Array.isArray(raw.shipping?.addressTypes) && raw.shipping.addressTypes.length > 0
                  ? raw.shipping.addressTypes
                  : DEFAULT_CHECKOUT_DATA.shipping.addressTypes,
              },
              deliveryAndGifting: {
                ...DEFAULT_CHECKOUT_DATA.deliveryAndGifting,
                ...(raw.deliveryAndGifting || {}),
              },
              buttonsAndSecurity: {
                ...DEFAULT_CHECKOUT_DATA.buttonsAndSecurity,
                ...(raw.buttonsAndSecurity || {}),
              },
            });
          }
        }
      } catch (err) {
        console.error('Failed to load checkout address page content:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: 'checkout-address-page',
          data: formData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: '✓ Checkout Address Form saved successfully! Changes are live on /checkout.',
        });
        onSaved();
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to save checkout address form.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateContact = (key: keyof CheckoutAddressPageContent['contact'], val: any) => {
    setFormData((prev) => ({
      ...prev,
      contact: { ...prev.contact, [key]: val },
    }));
  };

  const updateShipping = (key: keyof CheckoutAddressPageContent['shipping'], val: any) => {
    setFormData((prev) => ({
      ...prev,
      shipping: { ...prev.shipping, [key]: val },
    }));
  };

  const updateDelivery = (key: keyof CheckoutAddressPageContent['deliveryAndGifting'], val: any) => {
    setFormData((prev) => ({
      ...prev,
      deliveryAndGifting: { ...prev.deliveryAndGifting, [key]: val },
    }));
  };

  const updateButtons = (key: keyof CheckoutAddressPageContent['buttonsAndSecurity'], val: any) => {
    setFormData((prev) => ({
      ...prev,
      buttonsAndSecurity: { ...prev.buttonsAndSecurity, [key]: val },
    }));
  };

  const updateAddressType = (index: number, field: keyof CheckoutAddressTypeOption, val: string) => {
    setFormData((prev) => {
      const updated = [...prev.shipping.addressTypes];
      const current = updated[index];
      if (!current) return prev;
      updated[index] = {
        id: field === 'id' ? val : current.id,
        label: field === 'label' ? val : current.label,
        icon: field === 'icon' ? val : current.icon,
      };
      return {
        ...prev,
        shipping: { ...prev.shipping, addressTypes: updated },
      };
    });
  };

  const addAddressType = () => {
    const id = `type-${Date.now()}`;
    setFormData((prev) => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        addressTypes: [
          ...prev.shipping.addressTypes,
          { id, label: 'Custom', icon: '📍' },
        ],
      },
    }));
  };

  const removeAddressType = (index: number) => {
    if (formData.shipping.addressTypes.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        addressTypes: prev.shipping.addressTypes.filter((_, i) => i !== index),
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-xs text-[var(--color-slate)]">
        Loading Checkout Address Form configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-[#171412] text-white p-6 rounded-2xl relative overflow-hidden shadow-xl border border-[var(--color-whisper,#E5E5E5)]/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono tracking-widest text-[var(--color-gold,#C9A84C)] uppercase">
                PAGES / CHECKOUT ADDRESS FORM
              </span>
              <Badge variant="gold" className="text-[10px] py-0">
                ACTIVE STOREFRONT
              </Badge>
            </div>
            <h1 className="text-xl md:text-2xl font-serif text-[var(--color-gold,#C9A84C)]">
              Checkout Page Address Form Editor
            </h1>
            <p className="text-xs text-[#E5E5E5]/70 max-w-2xl mt-1">
              Customize contact details, WhatsApp dispatch notifications, delivery destination fields, labels, placeholders, address tags, and gift packaging options on <code className="text-white font-mono">/checkout</code>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/checkout"
              target="_blank"
              className="px-3.5 py-2 text-xs font-medium rounded-lg border border-[var(--color-gold,#C9A84C)]/30 text-[var(--color-gold,#C9A84C)] hover:bg-[var(--color-gold,#C9A84C)]/10 transition-colors flex items-center gap-1.5"
            >
              <span>View /checkout</span>
              <span>↗</span>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="border-white/20 text-white hover:bg-white/10"
            >
              CANCEL
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[var(--color-gold,#C9A84C)] text-[#171412] hover:bg-[var(--color-gold,#C9A84C)]/90 font-semibold"
            >
              {isSaving ? 'SAVING...' : 'SAVE ALL CHANGES'}
            </Button>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div
          className={cn(
            'p-4 rounded-xl text-xs font-medium flex items-center justify-between border',
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          )}
        >
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs hover:underline font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--color-whisper,#E5E5E5)] pb-3">
        {[
          { key: 'contact', label: '1. Contact & WhatsApp', icon: '📱' },
          { key: 'shipping', label: '2. Destination Inputs', icon: '📍' },
          { key: 'addressTypes', label: '3. Address Types', icon: '🏷️' },
          { key: 'delivery', label: '4. Delivery & Gifting', icon: '🎁' },
          { key: 'buttons', label: '5. Buttons & Trust', icon: '🔒' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabKey)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2',
              activeTab === tab.key
                ? 'bg-[var(--color-gold,#C9A84C)] text-white shadow-sm'
                : 'bg-white border border-[var(--color-whisper,#E5E5E5)] text-[var(--color-slate,#666666)] hover:border-[var(--color-gold,#C9A84C)]/50'
            )}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Contact Details & WhatsApp */}
      {activeTab === 'contact' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-[var(--color-whisper,#E5E5E5)] space-y-4">
            <h3 className="text-sm font-semibold text-[var(--color-ink,#111111)] border-b pb-2">
              Contact Fields & WhatsApp Opt-In
            </h3>
            <AdminFormField
              label="Email Address Label"
              value={formData.contact.emailLabel}
              onChange={(val) => updateContact('emailLabel', val)}
              placeholder="Email Address *"
            />
            <AdminFormField
              label="Email Input Placeholder"
              value={formData.contact.emailPlaceholder}
              onChange={(val) => updateContact('emailPlaceholder', val)}
              placeholder="you@example.com"
            />
            <AdminFormField
              label="Mobile Number Label"
              value={formData.contact.phoneLabel}
              onChange={(val) => updateContact('phoneLabel', val)}
              placeholder="Mobile Number *"
            />
            <AdminFormField
              label="Mobile Country Dial Prefix"
              value={formData.contact.phonePrefix}
              onChange={(val) => updateContact('phonePrefix', val)}
              placeholder="IN +91"
            />
            <AdminFormField
              label="Mobile Input Placeholder"
              value={formData.contact.phonePlaceholder}
              onChange={(val) => updateContact('phonePlaceholder', val)}
              placeholder="10-digit number"
            />
            <div className="pt-2 border-t border-[var(--color-whisper,#E5E5E5)] space-y-3">
              <AdminFormField
                label="WhatsApp Notification Text"
                value={formData.contact.whatsappUpdatesText}
                onChange={(val) => updateContact('whatsappUpdatesText', val)}
                placeholder="Send dispatch updates & live tracking photos via WhatsApp"
              />
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div>
                  <p className="text-xs font-semibold text-emerald-900">Default WhatsApp Opt-In</p>
                  <p className="text-[10px] text-emerald-700">Pre-check the WhatsApp tracking box for new visitors</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.contact.whatsappDefaultChecked}
                  onChange={(e) => updateContact('whatsappDefaultChecked', e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-[var(--color-snow,#F9F9F9)] p-5 rounded-2xl border border-[var(--color-whisper,#E5E5E5)] space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-slate,#666666)]">
              Storefront Live Preview (Contact Section)
            </h4>
            <div className="bg-white p-4 rounded-xl border border-[var(--color-whisper,#E5E5E5)] space-y-3 shadow-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-slate,#666666)] mb-1">
                    {formData.contact.emailLabel}
                  </label>
                  <input
                    disabled
                    placeholder={formData.contact.emailPlaceholder}
                    className="w-full h-9 text-xs px-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-slate,#666666)] mb-1">
                    {formData.contact.phoneLabel}
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-2 text-[10px] text-gray-500 font-medium select-none">
                      {formData.contact.phonePrefix}
                    </span>
                    <input
                      disabled
                      placeholder={formData.contact.phonePlaceholder}
                      className="w-full h-9 text-xs pl-14 pr-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
              </div>
              <div className="p-2.5 bg-[#25D366]/10 border border-[#25D366]/20 rounded-lg flex items-center gap-2 text-xs">
                <span className="text-[#25D366]">✓</span>
                <span className="text-[11px] font-medium text-gray-800">
                  {formData.contact.whatsappUpdatesText}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Shipping Destination Inputs */}
      {activeTab === 'shipping' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-[var(--color-whisper,#E5E5E5)] space-y-4">
            <h3 className="text-sm font-semibold text-[var(--color-ink,#111111)] border-b pb-2">
              Shipping Destination Labels & Placeholders
            </h3>
            <AdminFormField
              label="Section Heading"
              value={formData.shipping.sectionHeading}
              onChange={(val) => updateShipping('sectionHeading', val)}
              placeholder="2. Shipping Destination"
            />
            <div className="grid grid-cols-2 gap-3">
              <AdminFormField
                label="First Name Label"
                value={formData.shipping.firstNameLabel}
                onChange={(val) => updateShipping('firstNameLabel', val)}
                placeholder="First Name *"
              />
              <AdminFormField
                label="First Name Placeholder"
                value={formData.shipping.firstNamePlaceholder}
                onChange={(val) => updateShipping('firstNamePlaceholder', val)}
                placeholder="e.g. Priya"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <AdminFormField
                label="Last Name Label"
                value={formData.shipping.lastNameLabel}
                onChange={(val) => updateShipping('lastNameLabel', val)}
                placeholder="Last Name *"
              />
              <AdminFormField
                label="Last Name Placeholder"
                value={formData.shipping.lastNamePlaceholder}
                onChange={(val) => updateShipping('lastNamePlaceholder', val)}
                placeholder="e.g. Sharma"
              />
            </div>
            <AdminFormField
              label="Street Address Label"
              value={formData.shipping.address1Label}
              onChange={(val) => updateShipping('address1Label', val)}
              placeholder="Flat / House No., Apartment & Street Address *"
            />
            <AdminFormField
              label="Street Address Placeholder"
              value={formData.shipping.address1Placeholder}
              onChange={(val) => updateShipping('address1Placeholder', val)}
              placeholder="e.g. Flat 402, Lotus Residency, MG Road"
            />
            <AdminFormField
              label="Landmark Label"
              value={formData.shipping.address2Label}
              onChange={(val) => updateShipping('address2Label', val)}
              placeholder="Landmark / Floor (Optional)"
            />
            <AdminFormField
              label="Landmark Placeholder"
              value={formData.shipping.address2Placeholder}
              onChange={(val) => updateShipping('address2Placeholder', val)}
              placeholder="e.g. Near Indiranagar Metro Station"
            />
            <div className="grid grid-cols-3 gap-3">
              <AdminFormField
                label="Pincode Label"
                value={formData.shipping.pincodeLabel}
                onChange={(val) => updateShipping('pincodeLabel', val)}
                placeholder="Pincode *"
              />
              <AdminFormField
                label="City Label"
                value={formData.shipping.cityLabel}
                onChange={(val) => updateShipping('cityLabel', val)}
                placeholder="City / District *"
              />
              <AdminFormField
                label="State Label"
                value={formData.shipping.stateLabel}
                onChange={(val) => updateShipping('stateLabel', val)}
                placeholder="State *"
              />
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-[var(--color-snow,#F9F9F9)] p-5 rounded-2xl border border-[var(--color-whisper,#E5E5E5)] space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-slate,#666666)]">
              Storefront Live Preview (Address Destination)
            </h4>
            <div className="bg-white p-4 rounded-xl border border-[var(--color-whisper,#E5E5E5)] space-y-3 shadow-xs">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold,#C9A84C)]">
                {formData.shipping.sectionHeading}
              </h5>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                    {formData.shipping.firstNameLabel}
                  </label>
                  <input
                    disabled
                    placeholder={formData.shipping.firstNamePlaceholder}
                    className="w-full h-8 text-xs px-2.5 rounded border border-gray-200 bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                    {formData.shipping.lastNameLabel}
                  </label>
                  <input
                    disabled
                    placeholder={formData.shipping.lastNamePlaceholder}
                    className="w-full h-8 text-xs px-2.5 rounded border border-gray-200 bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                  {formData.shipping.address1Label}
                </label>
                <input
                  disabled
                  placeholder={formData.shipping.address1Placeholder}
                  className="w-full h-8 text-xs px-2.5 rounded border border-gray-200 bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                  {formData.shipping.address2Label}
                </label>
                <input
                  disabled
                  placeholder={formData.shipping.address2Placeholder}
                  className="w-full h-8 text-xs px-2.5 rounded border border-gray-200 bg-gray-50 text-gray-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                    {formData.shipping.pincodeLabel}
                  </label>
                  <input
                    disabled
                    placeholder={formData.shipping.pincodePlaceholder}
                    className="w-full h-8 text-xs px-2.5 rounded border border-gray-200 bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                    {formData.shipping.cityLabel}
                  </label>
                  <input
                    disabled
                    placeholder={formData.shipping.cityPlaceholder}
                    className="w-full h-8 text-xs px-2.5 rounded border border-gray-200 bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                    {formData.shipping.stateLabel}
                  </label>
                  <input
                    disabled
                    placeholder={formData.shipping.statePlaceholder}
                    className="w-full h-8 text-xs px-2.5 rounded border border-gray-200 bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Address Types (Home / Office / Other) */}
      {activeTab === 'addressTypes' && (
        <div className="bg-white p-5 rounded-2xl border border-[var(--color-whisper,#E5E5E5)] space-y-5">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-ink,#111111)]">
                Address Type Pills
              </h3>
              <p className="text-xs text-[var(--color-slate,#666666)]">
                Manage options customers can select to categorize their delivery destination.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addAddressType}
              className="text-xs border-[var(--color-gold,#C9A84C)] text-[var(--color-gold,#C9A84C)]"
            >
              + Add Address Type
            </Button>
          </div>

          <AdminFormField
            label="Address Type Section Label"
            value={formData.shipping.addressTypeLabel}
            onChange={(val) => updateShipping('addressTypeLabel', val)}
            placeholder="Address Type"
          />

          <div className="space-y-3">
            {formData.shipping.addressTypes.map((typeOption, idx) => (
              <div
                key={typeOption.id || idx}
                className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-whisper,#E5E5E5)] bg-[var(--color-snow,#F9F9F9)]"
              >
                <div className="w-16">
                  <AdminFormField
                    label="Icon"
                    value={typeOption.icon}
                    onChange={(val) => updateAddressType(idx, 'icon', val)}
                    placeholder="🏠"
                  />
                </div>
                <div className="flex-1">
                  <AdminFormField
                    label="Label"
                    value={typeOption.label}
                    onChange={(val) => updateAddressType(idx, 'label', val)}
                    placeholder="Home"
                  />
                </div>
                <div className="w-32">
                  <AdminFormField
                    label="Identifier"
                    value={typeOption.id}
                    onChange={(val) => updateAddressType(idx, 'id', val)}
                    placeholder="Home"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeAddressType(idx)}
                  disabled={formData.shipping.addressTypes.length <= 1}
                  className="mt-5 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Live Preview */}
          <div className="pt-3 border-t">
            <p className="text-xs font-semibold text-[var(--color-slate,#666666)] mb-2">
              Preview Pills on Checkout:
            </p>
            <div className="flex items-center gap-3">
              {formData.shipping.addressTypes.map((t, idx) => (
                <div
                  key={t.id || idx}
                  className={cn(
                    'px-4 py-2 text-xs font-medium rounded-lg border transition-all',
                    idx === 0
                      ? 'border-[var(--color-gold,#C9A84C)] bg-[var(--color-gold,#C9A84C)]/10 text-[var(--color-gold,#C9A84C)] font-semibold'
                      : 'border-[var(--color-whisper,#E5E5E5)] text-[var(--color-slate,#666666)] bg-white'
                  )}
                >
                  {t.icon} {t.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Delivery & Luxury Gifting */}
      {activeTab === 'delivery' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-[var(--color-whisper,#E5E5E5)] space-y-4">
            <h3 className="text-sm font-semibold text-[var(--color-ink,#111111)] border-b pb-2">
              Delivery Promise & Gift Packaging
            </h3>
            <AdminFormField
              label="Pincode Resolving Text"
              value={formData.deliveryAndGifting.pincodeResolvingText}
              onChange={(val) => updateDelivery('pincodeResolvingText', val)}
              placeholder="Resolving..."
            />
            <AdminFormField
              label="Delivering To Prefix"
              value={formData.deliveryAndGifting.deliveringToPrefix}
              onChange={(val) => updateDelivery('deliveringToPrefix', val)}
              placeholder="Delivering to"
            />
            <AdminFormField
              label="Expected Delivery Prefix"
              value={formData.deliveryAndGifting.expectedDeliveryPrefix}
              onChange={(val) => updateDelivery('expectedDeliveryPrefix', val)}
              placeholder="⚡ Expected delivery by"
            />
            <div className="pt-2 border-t space-y-3">
              <AdminFormField
                label="Gift Packaging Option Title"
                value={formData.deliveryAndGifting.giftWrapTitle}
                onChange={(val) => updateDelivery('giftWrapTitle', val)}
                placeholder="Complimentary Luxury Gift Packaging"
              />
              <AdminFormField
                label="Gift Packaging Description"
                value={formData.deliveryAndGifting.giftWrapSubtitle}
                onChange={(val) => updateDelivery('giftWrapSubtitle', val)}
                placeholder="Includes rigid keepsake box, personalized hand-calligraphed note card, and silk ribbon."
              />
              <AdminFormField
                label="Gift Message Field Label"
                value={formData.deliveryAndGifting.giftMessageLabel}
                onChange={(val) => updateDelivery('giftMessageLabel', val)}
                placeholder="Gift Message on Handcrafted Card"
              />
              <AdminFormField
                label="Gift Message Placeholder"
                value={formData.deliveryAndGifting.giftMessagePlaceholder}
                onChange={(val) => updateDelivery('giftMessagePlaceholder', val)}
                placeholder="Wishing you radiant joy on your special day..."
              />
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-[var(--color-snow,#F9F9F9)] p-5 rounded-2xl border border-[var(--color-whisper,#E5E5E5)] space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-slate,#666666)]">
              Storefront Live Preview (Delivery & Gift Wrap)
            </h4>
            <div className="bg-white p-4 rounded-xl border border-[var(--color-whisper,#E5E5E5)] space-y-3 shadow-xs">
              <div className="p-3 bg-[var(--color-gold,#C9A84C)]/10 border border-[var(--color-gold,#C9A84C)]/25 rounded-lg flex items-center justify-between text-xs">
                <span className="font-medium text-gray-800">
                  {formData.deliveryAndGifting.deliveringToPrefix} Bengaluru, Karnataka
                </span>
                <span className="text-[var(--color-gold,#C9A84C)] font-semibold">
                  {formData.deliveryAndGifting.expectedDeliveryPrefix} 3 business days
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-2.5">
                <span className="text-lg">🎁</span>
                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    {formData.deliveryAndGifting.giftWrapTitle}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    {formData.deliveryAndGifting.giftWrapSubtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Buttons & Security */}
      {activeTab === 'buttons' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-[var(--color-whisper,#E5E5E5)] space-y-4">
            <h3 className="text-sm font-semibold text-[var(--color-ink,#111111)] border-b pb-2">
              Action Buttons & Security Badges
            </h3>
            <AdminFormField
              label="Deliver to Address Button Text"
              value={formData.buttonsAndSecurity.deliverToAddressButtonText}
              onChange={(val) => updateButtons('deliverToAddressButtonText', val)}
              placeholder="Deliver to This Address"
            />
            <AdminFormField
              label="Add New Address Button Text"
              value={formData.buttonsAndSecurity.addNewAddressButtonText}
              onChange={(val) => updateButtons('addNewAddressButtonText', val)}
              placeholder="+ Add New Delivery Address"
            />
            <AdminFormField
              label="Continue to Payment Button Text"
              value={formData.buttonsAndSecurity.continueToPaymentButtonText}
              onChange={(val) => updateButtons('continueToPaymentButtonText', val)}
              placeholder="Proceed to Payment"
            />
            <AdminFormField
              label="Security Encryption Badge Text"
              value={formData.buttonsAndSecurity.securityBadgeText}
              onChange={(val) => updateButtons('securityBadgeText', val)}
              placeholder="256-bit Bank Grade Encryption & Protected Checkout"
            />
          </div>

          {/* Live Preview Card */}
          <div className="bg-[var(--color-snow,#F9F9F9)] p-5 rounded-2xl border border-[var(--color-whisper,#E5E5E5)] space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-slate,#666666)]">
              Storefront Live Preview (Buttons)
            </h4>
            <div className="bg-white p-4 rounded-xl border border-[var(--color-whisper,#E5E5E5)] space-y-3 shadow-xs">
              <button
                disabled
                className="w-full py-2.5 rounded-lg bg-[var(--color-gold,#C9A84C)] text-white text-xs font-semibold shadow-sm"
              >
                {formData.buttonsAndSecurity.deliverToAddressButtonText}
              </button>
              <button
                disabled
                className="w-full py-2.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-medium"
              >
                {formData.buttonsAndSecurity.addNewAddressButtonText}
              </button>
              <div className="text-center pt-2 text-[10px] text-gray-500 flex items-center justify-center gap-1.5">
                <span>🔒</span>
                <span>{formData.buttonsAndSecurity.securityBadgeText}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
