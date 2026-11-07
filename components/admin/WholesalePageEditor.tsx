'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type {
  WholesalePageContent,
  WholesaleBenefitItem,
  WholesaleTierOption,
} from '@/lib/actions/site-content-types';

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
      <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
        {label}
      </label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-xs font-medium text-[var(--color-slate)] select-none pointer-events-none">
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
            'w-full h-10 text-xs px-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors',
            prefix && 'pl-7',
            disabled && 'opacity-60 cursor-not-allowed bg-[var(--color-snow)]'
          )}
        />
      </div>
      {helperText && (
        <p className="text-[10px] text-[var(--color-slate)] leading-tight">{helperText}</p>
      )}
    </div>
  );
}

const BENEFIT_ICON_PRESETS = ['⚜', '✈', '✂', '📦', '💎', '🧵', '🏢', '🏷️', '🤝', '🌍'];

const DEFAULT_WHOLESALE_DATA: WholesalePageContent = {
  header: {
    eyebrow: 'GLOBAL BOUTIQUE & RETAIL PARTNERSHIPS',
    title: 'Wholesale & B2B Inquiries',
    description:
      'Partner with Angelika Fashions to curate handcrafted Indian haute couture, pure silk handloom sarees, and bridal lehengas for your luxury boutique, overseas salon, or festive corporate curation.',
  },
  benefits: [
    {
      icon: '⚜',
      title: 'Artisan Direct Pricing',
      description: 'Wholesale tiers with direct weaving loom margins, eliminating intermediaries.',
    },
    {
      icon: '✈',
      title: 'Worldwide Doorstep Delivery',
      description:
        'Express air cargo with full customs clearance and insured tracking across US, UK, UAE & Australia.',
    },
    {
      icon: '✂',
      title: 'Custom Label & Sizing',
      description:
        'Bespoke color palettes, customized blouse patterns, and private label tags for retail partners.',
    },
  ],
  form: {
    title: 'Wholesale Partner Registration',
    moqNote: 'MOQ starts from 15 pieces per order across assorted styles.',
    submitButtonText: 'Submit Wholesale Request',
    tiers: [
      { value: '15 – 30 pieces', label: '15 – 30 pieces (Starter Boutique Tier)' },
      { value: '30 – 75 pieces', label: '30 – 75 pieces (Seasonal Collection Tier)' },
      { value: '75+ pieces', label: '75+ pieces (Full Retail & Salon Tier)' },
    ],
    successTitle: 'Thank You for Your Wholesale Inquiry',
    successDescription:
      "Our wholesale director and designer Vidhya's team will review your boutique requirements and reach out with our seasonal lookbook and B2B line sheets within 24 hours.",
    whatsappDeskButtonText: 'Expedite Inquiry via WhatsApp B2B Desk →',
    whatsappDeskLink: 'https://wa.me/919876543210',
  },
  footerSupport: {
    prefixText: 'Prefer direct communication?',
    linkText: 'Connect directly with our B2B Director on WhatsApp →',
    whatsappLink:
      'https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20would%20like%20to%20discuss%20a%20wholesale%20partnership.',
  },
  seo: {
    metaTitle: 'Wholesale & B2B Inquiries | Boutique Partnerships | Angelika Fashions',
    metaDescription:
      'Partner with Angelika Fashions for wholesale handcrafted Indian couture, silk sarees, and bridal lehengas with direct loom pricing and worldwide delivery.',
  },
};

type TabKey = 'benefits' | 'header' | 'form' | 'footer' | 'seo';

export function WholesalePageEditor({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState<WholesalePageContent>(DEFAULT_WHOLESALE_DATA);
  const [activeTab, setActiveTab] = useState<TabKey>('benefits');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Load content
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const json = await res.json();
          if (json.content && json.content['wholesale-page'] && isMounted) {
            const raw = json.content['wholesale-page'];
            setFormData({
              header: {
                ...DEFAULT_WHOLESALE_DATA.header,
                ...(raw.header || {}),
              },
              benefits: Array.isArray(raw.benefits) && raw.benefits.length > 0
                ? raw.benefits
                : DEFAULT_WHOLESALE_DATA.benefits,
              form: {
                ...DEFAULT_WHOLESALE_DATA.form,
                ...(raw.form || {}),
                tiers: Array.isArray(raw.form?.tiers) && raw.form.tiers.length > 0
                  ? raw.form.tiers
                  : DEFAULT_WHOLESALE_DATA.form.tiers,
              },
              footerSupport: {
                ...DEFAULT_WHOLESALE_DATA.footerSupport,
                ...(raw.footerSupport || {}),
              },
              seo: {
                ...DEFAULT_WHOLESALE_DATA.seo,
                ...(raw.seo || {}),
              },
            });
          }
        }
      } catch (err) {
        console.error('Failed to load wholesale-page content:', err);
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
          sectionId: 'wholesale-page',
          data: formData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: 'Wholesale & B2B Inquiries page updated successfully! Your updates are now live on /wholesale.',
        });
        onSaved();
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to save wholesale content.',
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Network error occurred while saving.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all Wholesale page content back to defaults? Any unsaved edits will be lost.')) {
      setFormData(DEFAULT_WHOLESALE_DATA);
      setStatusMessage({
        type: 'success',
        text: 'Reset to default template. Click "Save Changes" to publish.',
      });
    }
  };

  // Benefits helpers
  const handleAddBenefit = () => {
    const newBenefit: WholesaleBenefitItem = {
      icon: '⚜',
      title: 'New Partnership Benefit',
      description: 'Describe the exclusive advantage for boutique owners...',
    };
    setFormData((p) => ({ ...p, benefits: [...p.benefits, newBenefit] }));
  };

  const handleUpdateBenefit = (index: number, patch: Partial<WholesaleBenefitItem>) => {
    const updated = [...formData.benefits];
    const target = updated[index];
    if (target) {
      updated[index] = { ...target, ...patch };
      setFormData((p) => ({ ...p, benefits: updated }));
    }
  };

  const handleDeleteBenefit = (index: number) => {
    if (formData.benefits.length <= 1) {
      alert('You must have at least one partnership benefit card.');
      return;
    }
    const updated = formData.benefits.filter((_, i) => i !== index);
    setFormData((p) => ({ ...p, benefits: updated }));
  };

  // Tiers helpers
  const handleAddTier = () => {
    const newTier: WholesaleTierOption = {
      value: `${Date.now()} pieces`,
      label: 'New Order Tier (e.g. 50 – 100 pieces)',
    };
    setFormData((p) => ({
      ...p,
      form: { ...p.form, tiers: [...p.form.tiers, newTier] },
    }));
  };

  const handleUpdateTier = (index: number, patch: Partial<WholesaleTierOption>) => {
    const updated = [...formData.form.tiers];
    const target = updated[index];
    if (target) {
      updated[index] = { ...target, ...patch };
      setFormData((p) => ({
        ...p,
        form: { ...p.form, tiers: updated },
      }));
    }
  };

  const handleDeleteTier = (index: number) => {
    if (formData.form.tiers.length <= 1) {
      alert('You must have at least one quantity tier option.');
      return;
    }
    const updated = formData.form.tiers.filter((_, i) => i !== index);
    setFormData((p) => ({
      ...p,
      form: { ...p.form, tiers: updated },
    }));
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-[var(--color-slate)]">
        Loading Wholesale Page editor...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-whisper)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-serif text-[var(--color-ink)]">
              Wholesale & B2B Inquiries Page Editor
            </h2>
            <Badge variant="outline" className="text-[10px] text-[var(--color-gold)] border-[var(--color-gold)]">
              {formData.benefits.length} Benefits
            </Badge>
            <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
              Live on /wholesale
            </Badge>
          </div>
          <p className="text-xs text-[var(--color-slate)]">
            Configure boutique partner benefits, registration form fields, MOQ notes, and B2B concierge contact for{' '}
            <Link href="/wholesale" target="_blank" className="text-[var(--color-gold)] hover:underline font-mono">
              /wholesale ↗
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs text-[var(--color-slate)] hover:text-red-600"
          >
            Reset Defaults
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="text-xs bg-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold-hover)] font-semibold"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={cn(
            'p-3.5 rounded-lg text-xs font-medium border flex items-center justify-between',
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          )}
        >
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs font-bold px-2 py-0.5 rounded hover:bg-black/5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Tab Bar */}
      <div className="flex border-b border-[var(--color-whisper)] gap-2 overflow-x-auto pb-px">
        {[
          { key: 'benefits', label: 'Partnership Benefits' },
          { key: 'header', label: 'Header & Eyebrow' },
          { key: 'form', label: 'Registration Form & Tiers' },
          { key: 'footer', label: 'B2B WhatsApp Desk' },
          { key: 'seo', label: 'SEO & Metadata' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as TabKey)}
            className={cn(
              'px-4 py-2.5 text-xs font-semibold tracking-wide border-b-2 transition-colors whitespace-nowrap cursor-pointer',
              activeTab === tab.key
                ? 'border-[var(--color-gold)] text-[var(--color-gold-hover)] bg-[var(--color-snow)]/60 rounded-t-md'
                : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:border-[var(--color-whisper)]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: PARTNERSHIP BENEFITS */}
      {activeTab === 'benefits' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--color-whisper)] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                Boutique Partnership Value Props ({formData.benefits.length})
              </h3>
              <p className="text-xs text-[var(--color-slate)]">
                The feature cards displayed right above the partner registration form.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddBenefit}
              className="text-xs border-[var(--color-gold)] text-[var(--color-gold-hover)] hover:bg-[var(--color-gold)]/10"
            >
              + Add Benefit Card
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {formData.benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs hover:border-[var(--color-gold)]/50 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--color-gold-hover)] uppercase tracking-wider">
                      Benefit #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteBenefit(idx)}
                      className="text-xs text-rose-600 hover:bg-rose-50 px-2 py-0.5 rounded"
                      title="Delete card"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Icon Selector */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                      Icon Symbol
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={benefit.icon}
                        onChange={(e) => handleUpdateBenefit(idx, { icon: e.target.value })}
                        className="w-12 h-9 text-center text-base rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                      />
                      <div className="flex flex-wrap gap-1">
                        {BENEFIT_ICON_PRESETS.map((ic) => (
                          <button
                            key={ic}
                            type="button"
                            onClick={() => handleUpdateBenefit(idx, { icon: ic })}
                            className="w-7 h-7 text-xs rounded hover:bg-[var(--color-snow)] transition-colors border border-transparent hover:border-[var(--color-whisper)]"
                          >
                            {ic}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <AdminFormField
                    label="Benefit Title"
                    value={benefit.title}
                    onChange={(val) => handleUpdateBenefit(idx, { title: val })}
                    placeholder="e.g. Artisan Direct Pricing"
                  />

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={benefit.description}
                      onChange={(e) => handleUpdateBenefit(idx, { description: e.target.value })}
                      placeholder="Explain the benefit for boutique partners..."
                      className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HEADER */}
      {activeTab === 'header' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-5">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">Hero Header & Eyebrow</h3>
            <p className="text-xs text-[var(--color-slate)]">
              Configure the main heading and introductory description at the top of /wholesale.
            </p>
          </div>

          <div className="space-y-4">
            <AdminFormField
              label="Eyebrow Banner"
              value={formData.header.eyebrow}
              onChange={(val) =>
                setFormData((p) => ({ ...p, header: { ...p.header, eyebrow: val } }))
              }
              placeholder="e.g. GLOBAL BOUTIQUE & RETAIL PARTNERSHIPS"
            />

            <AdminFormField
              label="Page Main Title"
              value={formData.header.title}
              onChange={(val) =>
                setFormData((p) => ({ ...p, header: { ...p.header, title: val } }))
              }
              placeholder="e.g. Wholesale & B2B Inquiries"
            />

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                Introductory Description
              </label>
              <textarea
                rows={3}
                value={formData.header.description}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    header: { ...p.header, description: e.target.value },
                  }))
                }
                placeholder="Partner with Angelika Fashions to curate..."
                className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REGISTRATION FORM & TIERS */}
      {activeTab === 'form' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-6">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">
              Partner Registration Form Settings
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Customize the form title, MOQ guidelines, submit button text, and order volume tiers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Form Header Title"
              value={formData.form.title}
              onChange={(val) =>
                setFormData((p) => ({ ...p, form: { ...p.form, title: val } }))
              }
              placeholder="e.g. Wholesale Partner Registration"
            />
            <AdminFormField
              label="MOQ Guarantee Note"
              value={formData.form.moqNote}
              onChange={(val) =>
                setFormData((p) => ({ ...p, form: { ...p.form, moqNote: val } }))
              }
              placeholder="e.g. MOQ starts from 15 pieces per order across assorted styles."
            />
          </div>

          <AdminFormField
            label="Submit Button Label"
            value={formData.form.submitButtonText}
            onChange={(val) =>
              setFormData((p) => ({ ...p, form: { ...p.form, submitButtonText: val } }))
            }
            placeholder="e.g. Submit Wholesale Request"
          />

          {/* Success State Settings */}
          <div className="pt-4 border-t border-[var(--color-whisper)] space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
              Post-Submission Confirmation View
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminFormField
                label="Confirmation Heading"
                value={formData.form.successTitle}
                onChange={(val) =>
                  setFormData((p) => ({ ...p, form: { ...p.form, successTitle: val } }))
                }
                placeholder="e.g. Thank You for Your Wholesale Inquiry"
              />
              <AdminFormField
                label="WhatsApp Expedite Button Text"
                value={formData.form.whatsappDeskButtonText}
                onChange={(val) =>
                  setFormData((p) => ({
                    ...p,
                    form: { ...p.form, whatsappDeskButtonText: val },
                  }))
                }
                placeholder="Expedite Inquiry via WhatsApp B2B Desk →"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                Confirmation Message
              </label>
              <textarea
                rows={2}
                value={formData.form.successDescription}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    form: { ...p.form, successDescription: e.target.value },
                  }))
                }
                placeholder="Our wholesale director and designer Vidhya's team will review..."
                className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
              />
            </div>
          </div>

          {/* Order Volume Tiers */}
          <div className="pt-4 border-t border-[var(--color-whisper)] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                  Initial Order Quantity Tiers ({formData.form.tiers.length})
                </h4>
                <p className="text-[11px] text-[var(--color-slate)]">
                  Options available in the "Initial Order Quantity" dropdown on the form.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddTier}
                className="text-xs border-[var(--color-gold)] text-[var(--color-gold-hover)]"
              >
                + Add Tier
              </Button>
            </div>

            <div className="space-y-2 pt-1">
              {formData.form.tiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-snow)]"
                >
                  <input
                    type="text"
                    value={tier.label}
                    onChange={(e) => handleUpdateTier(idx, { label: e.target.value })}
                    placeholder="Tier Display Label"
                    className="flex-1 h-8 text-xs px-2.5 rounded border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteTier(idx)}
                    className="w-8 h-8 text-xs text-rose-600 hover:bg-rose-50 rounded"
                    title="Delete tier"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: B2B WHATSAPP DESK */}
      {activeTab === 'footer' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-5">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">
              Direct B2B WhatsApp Footer Link
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              The direct communication callout placed at the bottom of the page.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminFormField
                label="Prefix Question Text"
                value={formData.footerSupport.prefixText}
                onChange={(val) =>
                  setFormData((p) => ({
                    ...p,
                    footerSupport: { ...p.footerSupport, prefixText: val },
                  }))
                }
                placeholder="Prefer direct communication?"
              />
              <AdminFormField
                label="WhatsApp Action Link Text"
                value={formData.footerSupport.linkText}
                onChange={(val) =>
                  setFormData((p) => ({
                    ...p,
                    footerSupport: { ...p.footerSupport, linkText: val },
                  }))
                }
                placeholder="Connect directly with our B2B Director on WhatsApp →"
              />
            </div>

            <AdminFormField
              label="WhatsApp URL / Deep Link"
              value={formData.footerSupport.whatsappLink}
              onChange={(val) =>
                setFormData((p) => ({
                  ...p,
                  footerSupport: { ...p.footerSupport, whatsappLink: val },
                }))
              }
              placeholder="https://wa.me/919876543210?text=..."
            />
          </div>
        </div>
      )}

      {/* TAB 5: SEO & METADATA */}
      {activeTab === 'seo' && (
        <div className="p-6 rounded-2xl bg-white border border-[var(--color-whisper)] shadow-xs space-y-6">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">Search Engine Optimization</h3>
            <p className="text-xs text-[var(--color-slate)]">
              Customize how the Wholesale & B2B Partnerships page appears in Google search results.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-[var(--color-ink)]">Meta Title</label>
                <span className="text-[10px] text-[var(--color-slate)]">
                  {formData.seo.metaTitle.length}/60 characters
                </span>
              </div>
              <input
                type="text"
                value={formData.seo.metaTitle}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    seo: { ...p.seo, metaTitle: e.target.value },
                  }))
                }
                className="w-full h-10 text-xs px-3 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-[var(--color-ink)]">
                  Meta Description
                </label>
                <span className="text-[10px] text-[var(--color-slate)]">
                  {formData.seo.metaDescription.length}/160 characters
                </span>
              </div>
              <textarea
                rows={3}
                value={formData.seo.metaDescription}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    seo: { ...p.seo, metaDescription: e.target.value },
                  }))
                }
                className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
              />
            </div>

            {/* Google SERP Preview */}
            <div className="mt-6 p-4 rounded-xl bg-[#F8F9FA] border border-[#DADCE0] space-y-1">
              <div className="text-[11px] text-[#202124] flex items-center gap-1.5 font-sans">
                <span className="w-4 h-4 rounded-full bg-[#E8EAED] flex items-center justify-center text-[9px] font-bold text-[#5F6368]">
                  A
                </span>
                <span className="font-medium">angelikafashions.com</span>
                <span className="text-[#5F6368]">› wholesale</span>
              </div>
              <h4 className="text-base text-[#1A0DAB] hover:underline cursor-pointer font-sans font-medium line-clamp-1">
                {formData.seo.metaTitle || 'Wholesale & B2B Inquiries | Boutique Partnerships | Angelika Fashions'}
              </h4>
              <p className="text-xs text-[#4D5156] font-sans line-clamp-2 leading-relaxed">
                {formData.seo.metaDescription ||
                  'Partner with Angelika Fashions for wholesale handcrafted Indian couture, silk sarees, and bridal lehengas with direct loom pricing and worldwide delivery.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

