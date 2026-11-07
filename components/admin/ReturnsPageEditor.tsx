'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type {
  ReturnsPageContent,
  ReturnsExchangeStep,
  ReturnsPolicySection,
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

const DEFAULT_RETURNS_DATA: ReturnsPageContent = {
  header: {
    eyebrow: '7-DAY COMPLIMENTARY ASSURANCE',
    title: 'Returns & Size Exchanges',
    description:
      "We want you to feel extraordinary in every Angelika ensemble. If the fit isn't immaculate, our atelier provides seamless doorstep size exchanges and easy returns.",
  },
  process: {
    title: 'How Our 3-Step Size Exchange Works',
    steps: [
      {
        stepNumber: 1,
        title: 'Initiate in 30 Seconds',
        description:
          "Connect with Vidhya's WhatsApp Concierge or visit your Account orders page within 7 days of delivery.",
      },
      {
        stepNumber: 2,
        title: 'Complimentary Pickup',
        description:
          'Our courier will collect the unworn garment from your doorstep with original tags and dust bag intact.',
      },
      {
        stepNumber: 3,
        title: 'Fresh Size Dispatched',
        description:
          'Your replacement size or custom tailored fit is dispatched via express courier with zero additional shipping charges.',
      },
    ],
  },
  sections: [
    {
      id: 'exchange-window',
      title: '1. 7-Day Exchange Window',
      content:
        'You may initiate a size exchange or return within 7 calendar days from the date of confirmed delivery. To be eligible, the piece must be in its original pristine condition, unworn, unwashed, unaltered, and accompanied by the original Silk Mark / brand tags and cotton dust bag.',
    },
    {
      id: 'custom-stitching',
      title: '2. Custom Stitching & Blouse Alterations',
      content:
        'If you ordered custom-stitched blouses or bespoke waist adjustments and require fine-tuning, our master tailors provide one round of complimentary alterations. Simply share your updated measurements or photographs with Vidhya on WhatsApp.',
    },
    {
      id: 'refund-options',
      title: '3. Refund Options',
      content: 'If you prefer a return rather than a size exchange:',
      bulletPoints: [
        'Atelier Store Credit (Recommended): Receive 100% of your order value as lifelong store credit plus a bonus 10% styling credit for your next order.',
        'Original Payment Source: Refunds to original debit/credit cards or net banking are processed within 3 to 5 business days following quality verification at our atelier.',
      ],
    },
    {
      id: 'non-returnable',
      title: '4. Non-Returnable Items',
      content:
        'Due to hygiene considerations and authentic artisan uniqueness, customized bridal couture made strictly to custom body measurements and final archive sale items marked as "Final Sale" cannot be refunded, though size adjustments can still be arranged.',
    },
  ],
  concierge: {
    eyebrow: 'READY TO EXCHANGE A SIZE?',
    title: 'Our Concierge Team Handles the Whole Process For You',
    description:
      "You don't need to fill out complex forms. Just drop a message with your Order ID and preferred size.",
    whatsappText: 'Start Size Exchange on WhatsApp',
    whatsappLink:
      'https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20would%20like%20to%20request%20a%20size%20exchange%20for%20my%20order.',
    secondaryCtaText: 'Use Interactive Size Finder',
    secondaryCtaLink: '/size-finder',
  },
  seo: {
    metaTitle: 'Returns & Size Exchanges | Angelika Fashions',
    metaDescription:
      'Our 7-day complimentary size exchange and return policy for handcrafted Indian luxury ethnic wear.',
  },
};

type TabKey = 'header' | 'process' | 'sections' | 'concierge' | 'seo';

export function ReturnsPageEditor({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState<ReturnsPageContent>(DEFAULT_RETURNS_DATA);
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
          if (json.content && json.content['returns-page'] && isMounted) {
            const raw = json.content['returns-page'];
            setFormData({
              header: {
                ...DEFAULT_RETURNS_DATA.header,
                ...(raw.header || {}),
              },
              process: {
                ...DEFAULT_RETURNS_DATA.process,
                ...(raw.process || {}),
                steps: Array.isArray(raw.process?.steps) && raw.process.steps.length > 0
                  ? raw.process.steps
                  : DEFAULT_RETURNS_DATA.process.steps,
              },
              sections: Array.isArray(raw.sections) && raw.sections.length > 0
                ? raw.sections
                : DEFAULT_RETURNS_DATA.sections,
              concierge: {
                ...DEFAULT_RETURNS_DATA.concierge,
                ...(raw.concierge || {}),
              },
              seo: {
                ...DEFAULT_RETURNS_DATA.seo,
                ...(raw.seo || {}),
              },
            });
          }
        }
      } catch (err) {
        console.error('Failed to load returns-page content:', err);
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
          sectionId: 'returns-page',
          data: formData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: '✓ Returns & Size Exchanges saved successfully! Changes are live on /returns.',
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

  // Process Steps helpers
  const handleUpdateStep = (index: number, field: keyof ReturnsExchangeStep, val: any) => {
    setFormData((prev) => {
      const steps = [...prev.process.steps];
      const target = steps[index];
      if (!target) return prev;
      steps[index] = { ...target, [field]: val };
      return {
        ...prev,
        process: { ...prev.process, steps },
      };
    });
  };

  const handleAddStep = () => {
    setFormData((prev) => ({
      ...prev,
      process: {
        ...prev.process,
        steps: [
          ...prev.process.steps,
          {
            stepNumber: prev.process.steps.length + 1,
            title: 'NEW STEP',
            description: 'Step instruction or courier action details.',
          },
        ],
      },
    }));
  };

  const handleRemoveStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      process: {
        ...prev.process,
        steps: prev.process.steps
          .filter((_, i) => i !== index)
          .map((step, idx) => ({ ...step, stepNumber: idx + 1 })),
      },
    }));
  };

  // Policy Sections helpers
  const handleUpdateSection = (index: number, field: keyof ReturnsPolicySection, val: any) => {
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
          title: `${prev.sections.length + 1}. New Policy Rule`,
          content: 'Add details, guidelines, or conditions here.',
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

  // Bullet point helpers for policy sections
  const handleAddBulletPoint = (sectionIndex: number) => {
    setFormData((prev) => {
      const sections = [...prev.sections];
      const target = sections[sectionIndex];
      if (!target) return prev;
      const currentPoints = target.bulletPoints || [];
      sections[sectionIndex] = {
        ...target,
        bulletPoints: [...currentPoints, 'New policy specification or condition.'],
      };
      return { ...prev, sections };
    });
  };

  const handleUpdateBulletPoint = (
    sectionIndex: number,
    pointIndex: number,
    value: string
  ) => {
    setFormData((prev) => {
      const sections = [...prev.sections];
      const target = sections[sectionIndex];
      if (!target || !target.bulletPoints) return prev;
      const bulletPoints = [...target.bulletPoints];
      bulletPoints[pointIndex] = value;
      sections[sectionIndex] = { ...target, bulletPoints };
      return { ...prev, sections };
    });
  };

  const handleRemoveBulletPoint = (sectionIndex: number, pointIndex: number) => {
    setFormData((prev) => {
      const sections = [...prev.sections];
      const target = sections[sectionIndex];
      if (!target || !target.bulletPoints) return prev;
      const bulletPoints = target.bulletPoints.filter((_, i) => i !== pointIndex);
      sections[sectionIndex] = { ...target, bulletPoints };
      return { ...prev, sections };
    });
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-[var(--color-slate)] animate-pulse">
        Loading Returns & Size Exchanges configuration...
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: string; count?: number }[] = [
    { key: 'header', label: 'Header & Title', icon: '✦' },
    { key: 'process', label: '3-Step Process', icon: '🔄', count: formData.process.steps.length },
    { key: 'sections', label: 'Policy Sections', icon: '📜', count: formData.sections.length },
    { key: 'concierge', label: 'Concierge CTA', icon: '💬' },
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
                Pages / Returns & Size Exchanges
              </span>
              <Badge variant="outline" className="text-[10px] text-[var(--color-gold)] border-[var(--color-gold)]/40">
                Live Storefront Page
              </Badge>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#F5EFEB]">
              Returns & Size Exchanges Editor
            </h2>
            <p className="text-xs text-[#D8CEBC] max-w-2xl mt-1 leading-relaxed">
              Manage 7-day complimentary exchange window, 3-step exchange guide, alterations, refund options, non-returnable items, and WhatsApp concierge for /returns.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/returns"
              target="_blank"
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-[#FAF7F2] border border-white/20 transition-colors flex items-center gap-1.5"
            >
              <span>View /returns</span>
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

      {/* TAB 1: Header & Eyebrow */}
      {activeTab === 'header' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-[var(--color-whisper)] shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider mb-1">
              Page Header & Breadcrumb
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Configure the top breadcrumb title, gold eyebrow badge, and introductory statement for returns & exchanges.
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
              placeholder="e.g. 7-DAY COMPLIMENTARY ASSURANCE"
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
              placeholder="Returns & Size Exchanges"
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
              placeholder="We want you to feel extraordinary in every Angelika ensemble..."
              className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors leading-relaxed"
            />
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
                <span className="text-[var(--color-ink)] font-medium">Returns & Exchanges</span>
              </nav>
              <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[var(--color-gold)] block">
                {formData.header.eyebrow || '7-DAY COMPLIMENTARY ASSURANCE'}
              </span>
              <h2 className="font-serif text-2xl text-[var(--color-ink)]">
                {formData.header.title || 'Returns & Size Exchanges'}
              </h2>
              <p className="text-xs text-[var(--color-slate)] max-w-xl leading-relaxed">
                {formData.header.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 3-Step Size Exchange Guide */}
      {activeTab === 'process' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-[var(--color-whisper)] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider mb-1">
                Step-by-Step Size Exchange Guide
              </h3>
              <p className="text-xs text-[var(--color-slate)]">
                Featured 3-step banner explaining the hassle-free doorstep size swap flow.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddStep}
              className="text-xs border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10"
            >
              + Add Process Step
            </Button>
          </div>

          <AdminFormField
            label="Section Title"
            value={formData.process.title}
            onChange={(val) =>
              setFormData((prev) => ({
                ...prev,
                process: { ...prev.process, title: val },
              }))
            }
            placeholder="How Our 3-Step Size Exchange Works"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formData.process.steps.map((step, idx) => (
              <div
                key={idx}
                className="relative rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)]/40 p-4 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[var(--color-whisper)] pb-2">
                  <span className="text-xs font-semibold text-[var(--color-gold)] uppercase tracking-wider">
                    Step {step.stepNumber}
                  </span>
                  {formData.process.steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="text-rose-600 hover:text-rose-700 text-xs px-2 py-0.5 rounded-sm hover:bg-rose-50 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <AdminFormField
                  label="Step Title (Eyebrow)"
                  value={step.title}
                  onChange={(val) => handleUpdateStep(idx, 'title', val)}
                  placeholder="e.g. INITIATE IN 30 SECONDS"
                />

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                    Step Description
                  </label>
                  <textarea
                    rows={3}
                    value={step.description}
                    onChange={(e) => handleUpdateStep(idx, 'description', e.target.value)}
                    placeholder="Describe how the step works..."
                    className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] leading-relaxed"
                  />
                </div>

                {/* Step mini preview */}
                <div className="p-3 rounded-lg bg-white border border-[#E5DECF] text-center space-y-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-gold-light)] text-[var(--color-gold)] font-serif font-bold text-sm flex items-center justify-center mx-auto border border-[var(--color-gold)]/30">
                    {step.stepNumber}
                  </div>
                  <h5 className="font-semibold text-[11px] text-[var(--color-ink)] uppercase tracking-wider">
                    {step.title}
                  </h5>
                  <p className="text-[10px] text-[var(--color-slate)] leading-relaxed">
                    {step.description}
                  </p>
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
                Detailed Policy Rules ({formData.sections.length})
              </h3>
              <p className="text-xs text-[var(--color-slate)]">
                Manage 7-day exchange window, custom stitching alterations, refund options (store credit / bank refund), and non-returnable items.
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
                    placeholder="e.g. 1. 7-Day Exchange Window"
                  />
                  <AdminFormField
                    label="Anchor ID"
                    value={section.id}
                    onChange={(val) => handleUpdateSection(idx, 'id', val)}
                    placeholder="e.g. exchange-window"
                    helperText="Unique identifier for URL anchor linking"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                    Section Body Content
                  </label>
                  <textarea
                    rows={3}
                    value={section.content}
                    onChange={(e) => handleUpdateSection(idx, 'content', e.target.value)}
                    placeholder="Provide full policy guidelines or instructions..."
                    className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors leading-relaxed"
                  />
                </div>

                {/* Optional Bullet Points (e.g. for Refund Options) */}
                <div className="mt-4 pt-4 border-t border-[var(--color-whisper)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wide">
                        Bullet Points ({section.bulletPoints?.length || 0})
                      </h4>
                      <p className="text-[11px] text-[var(--color-slate)]">
                        Optional itemized rules (e.g. Atelier Store Credit, Original Payment Source).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddBulletPoint(idx)}
                      className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-[var(--color-snow)] hover:bg-[var(--color-whisper)] text-[var(--color-ink)] border border-[var(--color-whisper)] transition-colors"
                    >
                      + Add Bullet Point
                    </button>
                  </div>

                  {section.bulletPoints && section.bulletPoints.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {section.bulletPoints.map((point, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2">
                          <span className="text-xs text-[var(--color-gold)] font-bold mt-2">•</span>
                          <textarea
                            rows={2}
                            value={point}
                            onChange={(e) =>
                              handleUpdateBulletPoint(idx, pIdx, e.target.value)
                            }
                            placeholder="Atelier Store Credit: Receive 100% of your order value..."
                            className="w-full text-xs p-2 rounded border border-[var(--color-whisper)] leading-relaxed"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveBulletPoint(idx, pIdx)}
                            className="text-xs text-rose-600 hover:text-rose-700 p-1.5 rounded hover:bg-rose-50"
                          >
                            ✕
                          </button>
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

      {/* TAB 4: Concierge CTA Card */}
      {activeTab === 'concierge' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-[var(--color-whisper)] shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider mb-1">
              Concierge Size Exchange Card
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Bottom card offering direct WhatsApp size exchange coordination and interactive size finder assistance.
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
              placeholder="READY TO EXCHANGE A SIZE?"
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
              placeholder="Our Concierge Team Handles the Whole Process For You"
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
              placeholder="You don't need to fill out complex forms. Just drop a message with your Order ID..."
              className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)]/40 space-y-3">
              <span className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-wide block">
                Primary Action (WhatsApp Exchange)
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
                placeholder="Start Size Exchange on WhatsApp"
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
                Secondary Action (Size Finder)
              </span>
              <AdminFormField
                label="Button Label"
                value={formData.concierge.secondaryCtaText}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    concierge: { ...prev.concierge, secondaryCtaText: val },
                  }))
                }
                placeholder="Use Interactive Size Finder"
              />
              <AdminFormField
                label="Destination Link"
                value={formData.concierge.secondaryCtaLink}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    concierge: { ...prev.concierge, secondaryCtaLink: val },
                  }))
                }
                placeholder="/size-finder"
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
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-ink)] text-white text-xs font-medium tracking-wide">
                {formData.concierge.whatsappText}
              </span>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-[#E5DFD5] text-xs font-medium text-[var(--color-ink)]">
                {formData.concierge.secondaryCtaText}
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
              Control how the Returns & Exchanges page appears on Google search results and browser tabs.
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
              placeholder="Returns & Size Exchanges | Angelika Fashions"
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
                placeholder="Our 7-day complimentary size exchange and return policy..."
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
              https://angelikafashions.com/returns
            </p>
            <h4 className="text-base text-blue-700 hover:underline font-medium cursor-pointer">
              {formData.seo?.metaTitle || 'Returns & Size Exchanges | Angelika Fashions'}
            </h4>
            <p className="text-xs text-gray-600 line-clamp-2">
              {formData.seo?.metaDescription ||
                'Our 7-day complimentary size exchange and return policy for handcrafted Indian luxury ethnic wear.'}
            </p>
          </div>
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-[var(--color-whisper)] shadow-lg">
        <div className="text-xs text-[var(--color-slate)]">
          Editing <span className="font-semibold text-[var(--color-ink)]">Returns & Size Exchanges</span>
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

