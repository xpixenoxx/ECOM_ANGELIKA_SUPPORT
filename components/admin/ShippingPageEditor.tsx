'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type {
  ShippingPageContent,
  ShippingHighlightCard,
  ShippingTierBox,
  ShippingPolicySection,
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

const DEFAULT_SHIPPING_DATA: ShippingPageContent = {
  header: {
    eyebrow: 'COMPLIMENTARY & EXPRESS COURIER',
    title: 'Shipping & Delivery Policy',
    description:
      'Every Angelika creation is handcrafted with reverence by master weavers and individually inspected before dispatch. Here is how we ensure seamless, insured delivery to your doorstep.',
  },
  highlights: [
    {
      label: 'PAN-INDIA SHIPPING',
      value: 'Free on ₹999+',
      subtext: 'Standard ₹99 under ₹999',
    },
    {
      label: 'DISPATCH TIME',
      value: '24 – 48 Hours',
      subtext: 'Ready-to-wear collections',
    },
    {
      label: 'GLOBAL COURIER',
      value: 'Worldwide Delivery',
      subtext: 'Express via DHL / FedEx',
    },
  ],
  sections: [
    {
      id: 'domestic-timelines',
      title: '1. Domestic Shipping Timelines (India)',
      content:
        "We partner with India's premier air express carriers (Bluedart, Delhivery, and DTDC) to deliver your heirlooms securely:",
      tierBoxes: [
        {
          title: 'METRO CITIES (TIER 1)',
          description: 'Mumbai, Delhi NCR, Bengaluru, Chennai, Hyderabad, Kolkata: 2 to 4 business days.',
        },
        {
          title: 'NON-METRO & REGIONAL TOWNS',
          description: 'Tier 2 & Tier 3 locations across India: 4 to 7 business days.',
        },
      ],
    },
    {
      id: 'made-to-order',
      title: '2. Made-to-Order & Bridal Trousseau Orders',
      content:
        "Custom-tailored ensembles, custom blouses, and bridal lehengas require bespoke hand-embroidery and zari finishing. These pieces have an atelier creation window of 10 to 14 business days before dispatch. You will receive progress photographs and status updates via WhatsApp from designer Vidhya's concierge team.",
    },
    {
      id: 'cod-guidelines',
      title: '3. Cash on Delivery (COD) Guidelines',
      content:
        'Cash on Delivery is available across 19,000+ Indian pin codes for orders up to ₹10,000. For security and authentic verification, our automated concierge will send an OTP confirmation via SMS/WhatsApp prior to warehouse dispatch.',
    },
    {
      id: 'international-shipping',
      title: '4. International Worldwide Shipping',
      content:
        'We ship to over 50 countries including the United States, United Kingdom, Canada, UAE, Singapore, and Australia. International orders are dispatched via DHL Express or FedEx International Priority (typically 5 to 8 business days). Customs duties or local import taxes, if applicable in your jurisdiction, are determined by destination customs authorities.',
    },
    {
      id: 'packaging-insurance',
      title: '5. Tamper-Proof Luxury Packaging & Insurance',
      content:
        'Every garment is packed in breathable cotton muslin dust bags, encased in rigid magnetic keepsake boxes with branded tamper-evident security tape. All parcels are 100% insured until signed by you upon delivery.',
    },
  ],
  concierge: {
    eyebrow: 'NEED URGENT EVENT DELIVERY?',
    title: "Speak with Vidhya's Concierge for Same-Day / Express Priority",
    description:
      'If you need your ensemble delivered urgently for a wedding, pooja, or festive gathering, reach out directly and we will coordinate priority flight dispatch.',
    whatsappText: 'WhatsApp Priority Dispatch Desk',
    whatsappLink:
      'https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20have%20an%20urgent%20event%20shipping%20query.',
    trackOrderText: 'Track Your Live Order',
    trackOrderLink: '/track-order',
  },
  seo: {
    metaTitle: 'Shipping & Delivery Policy | Angelika Fashions',
    metaDescription:
      'Learn about our domestic and international shipping policies, dispatch timelines, and complimentary delivery for handcrafted luxury ethnic wear.',
  },
};

type TabKey = 'header' | 'highlights' | 'sections' | 'concierge' | 'seo';

export function ShippingPageEditor({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState<ShippingPageContent>(DEFAULT_SHIPPING_DATA);
  const [activeTab, setActiveTab] = useState<TabKey>('header');
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
          if (json.content && json.content['shipping-page'] && isMounted) {
            const raw = json.content['shipping-page'];
            setFormData({
              header: {
                ...DEFAULT_SHIPPING_DATA.header,
                ...(raw.header || {}),
              },
              highlights: Array.isArray(raw.highlights) && raw.highlights.length > 0
                ? raw.highlights
                : DEFAULT_SHIPPING_DATA.highlights,
              sections: Array.isArray(raw.sections) && raw.sections.length > 0
                ? raw.sections
                : DEFAULT_SHIPPING_DATA.sections,
              concierge: {
                ...DEFAULT_SHIPPING_DATA.concierge,
                ...(raw.concierge || {}),
              },
              seo: {
                ...DEFAULT_SHIPPING_DATA.seo,
                ...(raw.seo || {}),
              },
            });
          }
        }
      } catch (err) {
        console.error('Failed to load shipping-page content:', err);
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
          sectionId: 'shipping-page',
          data: formData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: '✓ Shipping & Delivery Policy saved successfully! Changes are live on /shipping.',
        });
        onSaved();
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to save changes. Please try again.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Network error saving changes.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Highlights handlers
  const handleUpdateHighlight = (index: number, field: keyof ShippingHighlightCard, val: string) => {
    setFormData((prev) => {
      const highlights = [...prev.highlights];
      const target = highlights[index];
      if (!target) return prev;
      highlights[index] = { ...target, [field]: val };
      return { ...prev, highlights };
    });
  };

  const handleAddHighlight = () => {
    setFormData((prev) => ({
      ...prev,
      highlights: [
        ...prev.highlights,
        {
          label: 'NEW HIGHLIGHT',
          value: 'Highlight Value',
          subtext: 'Supporting details or policy note',
        },
      ],
    }));
  };

  const handleRemoveHighlight = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  };

  // Policy Sections handlers
  const handleUpdateSection = (index: number, field: keyof ShippingPolicySection, val: any) => {
    setFormData((prev) => {
      const sections = [...prev.sections];
      const target = sections[index];
      if (!target) return prev;
      sections[index] = { ...target, [field]: val };
      return { ...prev, sections };
    });
  };

  const handleAddSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: `policy-${Date.now()}`,
          title: `${prev.sections.length + 1}. New Policy Section`,
          content: 'Add policy details, disclaimers, or carrier instructions here.',
        },
      ],
    }));
  };

  const handleRemoveSection = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= formData.sections.length) return;
    setFormData((prev) => {
      const copy = [...prev.sections];
      const item = copy[index];
      const targetItem = copy[targetIdx];
      if (!item || !targetItem) return prev;
      copy[index] = targetItem;
      copy[targetIdx] = item;
      return { ...prev, sections: copy };
    });
  };

  // Tier Box handlers for sections that have them
  const handleAddTierBox = (sectionIndex: number) => {
    setFormData((prev) => {
      const sections = [...prev.sections];
      const target = sections[sectionIndex];
      if (!target) return prev;
      const currentTierBoxes = target.tierBoxes || [];
      sections[sectionIndex] = {
        ...target,
        tierBoxes: [
          ...currentTierBoxes,
          {
            title: 'NEW REGION / TIER',
            description: 'Delivery timeframe or courier details for this region.',
          },
        ],
      };
      return { ...prev, sections };
    });
  };

  const handleUpdateTierBox = (
    sectionIndex: number,
    tierIndex: number,
    field: keyof ShippingTierBox,
    val: string
  ) => {
    setFormData((prev) => {
      const sections = [...prev.sections];
      const target = sections[sectionIndex];
      if (!target || !target.tierBoxes) return prev;
      const tierBoxes = [...target.tierBoxes];
      const tier = tierBoxes[tierIndex];
      if (!tier) return prev;
      tierBoxes[tierIndex] = { ...tier, [field]: val };
      sections[sectionIndex] = { ...target, tierBoxes };
      return { ...prev, sections };
    });
  };

  const handleRemoveTierBox = (sectionIndex: number, tierIndex: number) => {
    setFormData((prev) => {
      const sections = [...prev.sections];
      const target = sections[sectionIndex];
      if (!target || !target.tierBoxes) return prev;
      const tierBoxes = target.tierBoxes.filter((_, i) => i !== tierIndex);
      sections[sectionIndex] = { ...target, tierBoxes };
      return { ...prev, sections };
    });
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-[var(--color-slate)] animate-pulse">
        Loading Shipping & Delivery Policy configuration...
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: string; count?: number }[] = [
    { key: 'header', label: 'Header & Title', icon: '✦' },
    { key: 'highlights', label: 'Summary Cards', icon: '⚡', count: formData.highlights.length },
    { key: 'sections', label: 'Policy Sections', icon: '📜', count: formData.sections.length },
    { key: 'concierge', label: 'Urgent Concierge', icon: '💬' },
    { key: 'seo', label: 'SEO & Metadata', icon: '🔍' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E1B18] via-[#2A241E] to-[#1E1B18] p-6 text-white shadow-lg border border-[var(--color-gold)]/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-widest text-[var(--color-gold)] font-bold">
                Pages / Shipping & Delivery Policy
              </span>
              <Badge variant="outline" className="text-[10px] text-[var(--color-gold)] border-[var(--color-gold)]/40">
                Live Storefront Page
              </Badge>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#F5EFEB]">
              Shipping & Delivery Policy Editor
            </h2>
            <p className="text-xs text-[#D8CEBC] max-w-2xl mt-1 leading-relaxed">
              Manage delivery timelines, express courier highlights, COD rules, worldwide shipping, and urgent concierge assistance for /shipping.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/shipping"
              target="_blank"
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-[#FAF7F2] border border-white/20 transition-colors flex items-center gap-1.5"
            >
              <span>View /shipping</span>
              <span className="text-[10px]">↗</span>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="text-xs border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="text-xs bg-[var(--color-gold)] hover:bg-[#B38E3F] text-[var(--color-ink)] font-bold px-5"
            >
              {isSaving ? 'Saving Changes...' : 'Save All Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Status Notification */}
      {statusMessage && (
        <div
          className={cn(
            'p-4 rounded-xl text-xs font-medium flex items-center justify-between gap-3 shadow-xs border',
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          )}
        >
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-[11px] opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[var(--color-whisper)] overflow-x-auto gap-2 pb-px scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-xs font-semibold tracking-wide border-b-2 transition-all whitespace-nowrap',
                isActive
                  ? 'border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/5 rounded-t-lg'
                  : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:border-[var(--color-whisper)]'
              )}
            >
              <span className="text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full font-mono',
                    isActive
                      ? 'bg-[var(--color-gold)] text-[var(--color-ink)]'
                      : 'bg-[var(--color-whisper)] text-[var(--color-slate)]'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Header & Title */}
      {activeTab === 'header' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-[var(--color-whisper)] shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider mb-1">
              Page Header & Breadcrumb
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Configure the top breadcrumb title, gold eyebrow badge, and introductory statement for the policy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Eyebrow Badge"
              value={formData.header.eyebrow}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  header: { ...prev.header, eyebrow: val },
                }))
              }
              placeholder="e.g. COMPLIMENTARY & EXPRESS COURIER"
              helperText="Gold uppercase subtitle displayed right above the main title"
            />
            <AdminFormField
              label="Page Main Heading"
              value={formData.header.title}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  header: { ...prev.header, title: val },
                }))
              }
              placeholder="Shipping & Delivery Policy"
              helperText="Large serif h1 title of the page"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
              Introduction Description
            </label>
            <textarea
              rows={3}
              value={formData.header.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  header: { ...prev.header, description: e.target.value },
                }))
              }
              placeholder="Brief introductory paragraph about master weavers, inspection, and insured delivery..."
              className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors leading-relaxed"
            />
            <p className="text-[10px] text-[var(--color-slate)]">
              Displayed immediately underneath the page heading.
            </p>
          </div>

          {/* Live Preview Box */}
          <div className="mt-4 p-5 rounded-xl bg-[#FAF8F5] border border-[#EAE4D9]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-slate)] block mb-3">
              Storefront Header Preview
            </span>
            <div className="space-y-1.5">
              <nav className="text-xs text-[var(--color-slate)] flex items-center gap-2">
                <span>Home</span>
                <span>/</span>
                <span className="text-[var(--color-ink)] font-medium">Shipping Policy</span>
              </nav>
              <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[var(--color-gold)] block">
                {formData.header.eyebrow || 'COMPLIMENTARY & EXPRESS COURIER'}
              </span>
              <h2 className="font-serif text-2xl text-[var(--color-ink)]">
                {formData.header.title || 'Shipping & Delivery Policy'}
              </h2>
              <p className="text-xs text-[var(--color-slate)] max-w-xl leading-relaxed">
                {formData.header.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Summary Cards */}
      {activeTab === 'highlights' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-[var(--color-whisper)] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider mb-1">
                Top Highlight Summary Cards ({formData.highlights.length})
              </h3>
              <p className="text-xs text-[var(--color-slate)]">
                Key shipping takeaways displayed in 3 columns at the top of the policy page.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddHighlight}
              className="text-xs border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10"
            >
              + Add Summary Card
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formData.highlights.map((card, idx) => (
              <div
                key={idx}
                className="relative rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)]/40 p-4 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[var(--color-whisper)] pb-2">
                  <span className="text-xs font-semibold text-[var(--color-gold)] uppercase tracking-wider">
                    Card #{idx + 1}
                  </span>
                  {formData.highlights.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(idx)}
                      className="text-rose-600 hover:text-rose-700 text-xs px-2 py-0.5 rounded-sm hover:bg-rose-50 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <AdminFormField
                  label="Card Label (Eyebrow)"
                  value={card.label}
                  onChange={(val) => handleUpdateHighlight(idx, 'label', val)}
                  placeholder="e.g. PAN-INDIA SHIPPING"
                />

                <AdminFormField
                  label="Highlight Value (Title)"
                  value={card.value}
                  onChange={(val) => handleUpdateHighlight(idx, 'value', val)}
                  placeholder="e.g. Free on ₹999+"
                />

                <AdminFormField
                  label="Subtext"
                  value={card.subtext}
                  onChange={(val) => handleUpdateHighlight(idx, 'subtext', val)}
                  placeholder="e.g. Standard ₹99 under ₹999"
                />

                {/* Card mini preview */}
                <div className="p-3 rounded-lg bg-white border border-[#E5DECF] text-center space-y-1">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-gold)] block">
                    {card.label}
                  </span>
                  <p className="text-sm font-serif font-medium text-[var(--color-ink)]">
                    {card.value}
                  </p>
                  <p className="text-[10px] text-[var(--color-slate)]">{card.subtext}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Policy Sections */}
      {activeTab === 'sections' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-[var(--color-whisper)] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider mb-1">
                Detailed Policy Sections ({formData.sections.length})
              </h3>
              <p className="text-xs text-[var(--color-slate)]">
                Manage domestic timelines, tier 1/non-metro regional breakdowns, made-to-order bridal policies, COD rules, and luxury packaging.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddSection}
              className="text-xs border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10"
            >
              + Add Policy Section
            </Button>
          </div>

          <div className="space-y-6">
            {formData.sections.map((section, idx) => (
              <div
                key={section.id || idx}
                className="rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)]/20 p-5 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-whisper)] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-gold)]/15 text-[var(--color-gold)] font-bold text-xs">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-[var(--color-ink)] truncate max-w-sm">
                      {section.title || `Section ${idx + 1}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveSection(idx, 'up')}
                      className="px-2 py-1 text-xs rounded border border-[var(--color-whisper)] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={idx === formData.sections.length - 1}
                      onClick={() => handleMoveSection(idx, 'down')}
                      className="px-2 py-1 text-xs rounded border border-[var(--color-whisper)] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(idx)}
                      className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded border border-rose-200"
                    >
                      Remove Section
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AdminFormField
                    label="Section Title"
                    value={section.title}
                    onChange={(val) => handleUpdateSection(idx, 'title', val)}
                    placeholder="e.g. 1. Domestic Shipping Timelines (India)"
                  />
                  <AdminFormField
                    label="Anchor ID"
                    value={section.id}
                    onChange={(val) => handleUpdateSection(idx, 'id', val)}
                    placeholder="e.g. domestic-timelines"
                    helperText="Unique identifier for URL anchor linking"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                    Section Body Content
                  </label>
                  <textarea
                    rows={4}
                    value={section.content}
                    onChange={(e) => handleUpdateSection(idx, 'content', e.target.value)}
                    placeholder="Provide full policy terms, guidelines, carrier partners, or conditions..."
                    className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors leading-relaxed"
                  />
                </div>

                {/* Optional Tier Boxes (e.g. for Domestic Shipping Timelines) */}
                <div className="mt-4 pt-4 border-t border-[var(--color-whisper)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wide">
                        Regional Tier Delivery Boxes ({section.tierBoxes?.length || 0})
                      </h4>
                      <p className="text-[11px] text-[var(--color-slate)]">
                        Optional sub-cards (e.g. Metro Cities vs Non-Metro Regional Towns).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddTierBox(idx)}
                      className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-[var(--color-snow)] hover:bg-[var(--color-whisper)] text-[var(--color-ink)] border border-[var(--color-whisper)] transition-colors"
                    >
                      + Add Tier Box
                    </button>
                  </div>

                  {section.tierBoxes && section.tierBoxes.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      {section.tierBoxes.map((tier, tIdx) => (
                        <div
                          key={tIdx}
                          className="p-3 rounded-lg bg-white border border-[#EAE4D9] space-y-2 relative"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
                              Tier Box #{tIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTierBox(idx, tIdx)}
                              className="text-[10px] text-rose-600 hover:underline"
                            >
                              Delete Box
                            </button>
                          </div>
                          <input
                            type="text"
                            value={tier.title}
                            onChange={(e) =>
                              handleUpdateTierBox(idx, tIdx, 'title', e.target.value)
                            }
                            placeholder="e.g. METRO CITIES (TIER 1)"
                            className="w-full text-xs font-semibold px-2 py-1.5 rounded border border-[var(--color-whisper)]"
                          />
                          <textarea
                            rows={2}
                            value={tier.description}
                            onChange={(e) =>
                              handleUpdateTierBox(idx, tIdx, 'description', e.target.value)
                            }
                            placeholder="e.g. Mumbai, Delhi NCR...: 2 to 4 business days."
                            className="w-full text-xs p-2 rounded border border-[var(--color-whisper)] leading-relaxed"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Urgent Concierge Assistance */}
      {activeTab === 'concierge' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-[var(--color-whisper)] shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider mb-1">
              Urgent Event Delivery Concierge Card
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Bottom priority dispatch CTA for clients needing rush or event styling delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Eyebrow Subtitle"
              value={formData.concierge.eyebrow}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  concierge: { ...prev.concierge, eyebrow: val },
                }))
              }
              placeholder="NEED URGENT EVENT DELIVERY?"
            />
            <AdminFormField
              label="Card Title"
              value={formData.concierge.title}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  concierge: { ...prev.concierge, title: val },
                }))
              }
              placeholder="Speak with Vidhya's Concierge for Same-Day / Express Priority"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
              Description Paragraph
            </label>
            <textarea
              rows={3}
              value={formData.concierge.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  concierge: { ...prev.concierge, description: e.target.value },
                }))
              }
              placeholder="If you need your ensemble delivered urgently for a wedding, pooja, or festive gathering..."
              className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)]/40 space-y-3">
              <span className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-wide block">
                Primary Action (WhatsApp Desk)
              </span>
              <AdminFormField
                label="Button Label"
                value={formData.concierge.whatsappText}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    concierge: { ...prev.concierge, whatsappText: val },
                  }))
                }
                placeholder="WhatsApp Priority Dispatch Desk"
              />
              <AdminFormField
                label="WhatsApp Direct Link"
                value={formData.concierge.whatsappLink}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    concierge: { ...prev.concierge, whatsappLink: val },
                  }))
                }
                placeholder="https://wa.me/919876543210?text=..."
              />
            </div>

            <div className="p-4 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)]/40 space-y-3">
              <span className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-wide block">
                Secondary Action (Order Tracking)
              </span>
              <AdminFormField
                label="Button Label"
                value={formData.concierge.trackOrderText}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    concierge: { ...prev.concierge, trackOrderText: val },
                  }))
                }
                placeholder="Track Your Live Order"
              />
              <AdminFormField
                label="Destination Link"
                value={formData.concierge.trackOrderLink}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    concierge: { ...prev.concierge, trackOrderLink: val },
                  }))
                }
                placeholder="/track-order"
              />
            </div>
          </div>

          {/* Live Preview of Concierge Card */}
          <div className="mt-4 rounded-xl bg-[#FAF8F5] border border-[#E5DECF] p-6 text-center space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
              {formData.concierge.eyebrow}
            </p>
            <h3 className="font-serif text-xl text-[var(--color-ink)]">
              {formData.concierge.title}
            </h3>
            <p className="text-xs text-[var(--color-slate)] max-w-lg mx-auto">
              {formData.concierge.description}
            </p>
            <div className="pt-2 flex justify-center gap-4">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-ink)] text-white text-xs font-medium tracking-wide">
                {formData.concierge.whatsappText}
              </span>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-[#E5DFD5] text-xs font-medium text-[var(--color-ink)]">
                {formData.concierge.trackOrderText}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SEO & Metadata */}
      {activeTab === 'seo' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-[var(--color-whisper)] shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider mb-1">
              Search Engine Optimization (SEO)
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Control how the Shipping Policy page appears on Google search results and browser tabs.
            </p>
          </div>

          <div className="space-y-4 max-w-2xl">
            <AdminFormField
              label="Meta Title Tag"
              value={formData.seo?.metaTitle}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  seo: { ...prev.seo, metaTitle: val },
                }))
              }
              placeholder="Shipping & Delivery Policy | Angelika Fashions"
              helperText={`${formData.seo?.metaTitle?.length || 0}/60 characters (Recommended: 50-60)`}
            />

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={formData.seo?.metaDescription}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, metaDescription: e.target.value },
                  }))
                }
                placeholder="Learn about our domestic and international shipping policies, dispatch timelines..."
                className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors leading-relaxed"
              />
              <p className="text-[10px] text-[var(--color-slate)]">
                {formData.seo?.metaDescription?.length || 0}/160 characters (Recommended: 150-160)
              </p>
            </div>
          </div>

          {/* Google Search Result Preview */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 max-w-2xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
              Google Search Result Snippet Preview
            </span>
            <p className="text-xs text-emerald-800 font-mono">
              https://angelikafashions.com/shipping
            </p>
            <h4 className="text-base text-blue-700 hover:underline font-medium cursor-pointer">
              {formData.seo?.metaTitle || 'Shipping & Delivery Policy | Angelika Fashions'}
            </h4>
            <p className="text-xs text-gray-600 line-clamp-2">
              {formData.seo?.metaDescription ||
                'Learn about our domestic and international shipping policies, dispatch timelines, and complimentary delivery for handcrafted luxury ethnic wear.'}
            </p>
          </div>
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-[var(--color-whisper)] shadow-lg">
        <div className="text-xs text-[var(--color-slate)]">
          Editing <span className="font-semibold text-[var(--color-ink)]">Shipping & Delivery Policy</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} className="text-xs">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="text-xs bg-[var(--color-gold)] hover:bg-[#B38E3F] text-[var(--color-ink)] font-bold px-5"
          >
            {isSaving ? 'Saving Changes...' : 'Save All Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
