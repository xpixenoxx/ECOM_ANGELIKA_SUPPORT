'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type {
  SizeGuidePageContent,
  SizeGuideKurtiRow,
  SizeGuideLehengaRow,
  SizeGuideMeasurementStep,
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

const DEFAULT_SIZE_GUIDE_DATA: SizeGuidePageContent = {
  header: {
    eyebrow: 'TAILORED FIT & MEASUREMENT CHARTS',
    title: 'Garment Size Guide',
    description:
      'Every body is unique. Angelika silhouettes are designed with generous 2-inch side seams for easy custom alterations, ensuring a bespoke drape that flatters your form.',
  },
  promoBanner: {
    eyebrow: 'AI SILHOUETTE ASSISTANT',
    title: 'Want instant recommendations based on your height and fit preference?',
    description: 'Answer 3 simple questions to calculate your exact Angelika sizing.',
    buttonText: 'Launch Interactive Size Finder →',
    buttonLink: '/size-finder',
  },
  kurtis: {
    title: 'Standard Ready-to-Wear Kurti Measurements (Inches)',
    subtitle: 'Measurements are garment dimensions',
    rows: [
      { size: 'XS (34)', bust: '34"', waist: '28"', hip: '38"', shoulder: '14.0"', kurtiLength: '44"' },
      { size: 'S (36)', bust: '36"', waist: '30"', hip: '40"', shoulder: '14.5"', kurtiLength: '45"' },
      { size: 'M (38)', bust: '38"', waist: '32"', hip: '42"', shoulder: '15.0"', kurtiLength: '45"' },
      { size: 'L (40)', bust: '40"', waist: '34"', hip: '44"', shoulder: '15.5"', kurtiLength: '46"' },
      { size: 'XL (42)', bust: '42"', waist: '36"', hip: '46"', shoulder: '16.0"', kurtiLength: '46"' },
      { size: 'XXL (44)', bust: '44"', waist: '38"', hip: '48"', shoulder: '16.5"', kurtiLength: '47"' },
      { size: '3XL (46)', bust: '46"', waist: '40"', hip: '50"', shoulder: '17.0"', kurtiLength: '47"' },
    ],
  },
  lehengas: {
    title: 'Bridal & Festive Lehenga Skirt Measurements (Inches)',
    subtitle: 'With drawstring waist + zipper closure',
    rows: [
      { size: 'XS (26)', waist: '26"', hip: '36"', skirtLength: '42"', flare: '4.5 Meters' },
      { size: 'S (28)', waist: '28"', hip: '38"', skirtLength: '42"', flare: '4.5 Meters' },
      { size: 'M (30)', waist: '30"', hip: '40"', skirtLength: '43"', flare: '5.0 Meters' },
      { size: 'L (32)', waist: '32"', hip: '42"', skirtLength: '43"', flare: '5.0 Meters' },
      { size: 'XL (34)', waist: '34"', hip: '44"', skirtLength: '44"', flare: '5.5 Meters' },
      { size: 'XXL (36)', waist: '36"', hip: '46"', skirtLength: '44"', flare: '5.5 Meters' },
    ],
  },
  blouses: {
    title: 'Bespoke Blouse Stitching & Measurements',
    description:
      'All sarees and lehengas include unstitched pure silk blouse fabrics with zari borders. If you select our custom stitching service, our master drapers will tailor your choli according to your exact bust, underbust, armhole, and front/back neckline depth.',
    paddingNote:
      'Non-padded, soft contour padded, or double padded with concealed side/back hook placket.',
    seamNote:
      '2.5 inches of extra fabric margin included inside every blouse for future alterations.',
  },
  howToMeasure: {
    title: 'How to Take Accurate Body Measurements',
    steps: [
      {
        title: '1. Bust / Chest',
        description:
          'Measure around the fullest part of your bust, keeping the measuring tape parallel to the floor without pulling tight.',
      },
      {
        title: '2. Natural Waist',
        description:
          'Measure around the narrowest part of your waistline, roughly 1 to 2 inches above your navel.',
      },
      {
        title: '3. Hip Circumference',
        description:
          'Stand with feet together and measure around the fullest curve of your hips and buttocks.',
      },
    ],
  },
  stylingDesk: {
    eyebrow: 'BETWEEN SIZES OR NEED CUSTOM DRAPE GUIDANCE?',
    title: "Designer Vidhya's Personal Styling Desk",
    description:
      'Share your measurements with Vidhya on WhatsApp for custom tailored fit guidance before your order is cut.',
    buttonText: 'Consult Vidhya on WhatsApp →',
    whatsappLink:
      'https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20would%20like%20sizing%20guidance%20for%20my%20order.',
  },
  seo: {
    metaTitle: 'Garment Size Guide & Measurement Charts | Angelika Fashions',
    metaDescription:
      'Complete sizing guide, bust, waist, and hip measurements for luxury handcrafted kurtis, lehengas, and custom blouses.',
  },
};

type TabKey = 'header' | 'kurtis' | 'lehengas' | 'blouses' | 'measurements' | 'stylingDesk' | 'seo';

export function SizeGuidePageEditor({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState<SizeGuidePageContent>(DEFAULT_SIZE_GUIDE_DATA);
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
          if (json.content && json.content['size-guide-page'] && isMounted) {
            const raw = json.content['size-guide-page'];
            setFormData({
              header: {
                ...DEFAULT_SIZE_GUIDE_DATA.header,
                ...(raw.header || {}),
              },
              promoBanner: {
                ...DEFAULT_SIZE_GUIDE_DATA.promoBanner,
                ...(raw.promoBanner || {}),
              },
              kurtis: {
                ...DEFAULT_SIZE_GUIDE_DATA.kurtis,
                ...(raw.kurtis || {}),
                rows: Array.isArray(raw.kurtis?.rows) && raw.kurtis.rows.length > 0
                  ? raw.kurtis.rows
                  : DEFAULT_SIZE_GUIDE_DATA.kurtis.rows,
              },
              lehengas: {
                ...DEFAULT_SIZE_GUIDE_DATA.lehengas,
                ...(raw.lehengas || {}),
                rows: Array.isArray(raw.lehengas?.rows) && raw.lehengas.rows.length > 0
                  ? raw.lehengas.rows
                  : DEFAULT_SIZE_GUIDE_DATA.lehengas.rows,
              },
              blouses: {
                ...DEFAULT_SIZE_GUIDE_DATA.blouses,
                ...(raw.blouses || {}),
              },
              howToMeasure: {
                ...DEFAULT_SIZE_GUIDE_DATA.howToMeasure,
                ...(raw.howToMeasure || {}),
                steps: Array.isArray(raw.howToMeasure?.steps) && raw.howToMeasure.steps.length > 0
                  ? raw.howToMeasure.steps
                  : DEFAULT_SIZE_GUIDE_DATA.howToMeasure.steps,
              },
              stylingDesk: {
                ...DEFAULT_SIZE_GUIDE_DATA.stylingDesk,
                ...(raw.stylingDesk || {}),
              },
              seo: {
                ...DEFAULT_SIZE_GUIDE_DATA.seo,
                ...(raw.seo || {}),
              },
            });
          }
        }
      } catch (err) {
        console.error('Failed to load size-guide-page content:', err);
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
          sectionId: 'size-guide-page',
          data: formData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: '✓ Garment Size Guide saved successfully! Changes are live on /size-guide.',
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

  // Kurti row helpers
  const handleUpdateKurtiRow = (index: number, field: keyof SizeGuideKurtiRow, val: string) => {
    setFormData((prev) => {
      const rows = [...prev.kurtis.rows];
      const target = rows[index];
      if (!target) return prev;
      rows[index] = { ...target, [field]: val };
      return { ...prev, kurtis: { ...prev.kurtis, rows } };
    });
  };

  const handleAddKurtiRow = () => {
    setFormData((prev) => ({
      ...prev,
      kurtis: {
        ...prev.kurtis,
        rows: [
          ...prev.kurtis.rows,
          { size: 'Custom', bust: '0"', waist: '0"', hip: '0"', shoulder: '0"', kurtiLength: '0"' },
        ],
      },
    }));
  };

  const handleRemoveKurtiRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      kurtis: {
        ...prev.kurtis,
        rows: prev.kurtis.rows.filter((_, i) => i !== index),
      },
    }));
  };

  // Lehenga row helpers
  const handleUpdateLehengaRow = (index: number, field: keyof SizeGuideLehengaRow, val: string) => {
    setFormData((prev) => {
      const rows = [...prev.lehengas.rows];
      const target = rows[index];
      if (!target) return prev;
      rows[index] = { ...target, [field]: val };
      return { ...prev, lehengas: { ...prev.lehengas, rows } };
    });
  };

  const handleAddLehengaRow = () => {
    setFormData((prev) => ({
      ...prev,
      lehengas: {
        ...prev.lehengas,
        rows: [
          ...prev.lehengas.rows,
          { size: 'Custom', waist: '0"', hip: '0"', skirtLength: '0"', flare: '4.5 Meters' },
        ],
      },
    }));
  };

  const handleRemoveLehengaRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      lehengas: {
        ...prev.lehengas,
        rows: prev.lehengas.rows.filter((_, i) => i !== index),
      },
    }));
  };

  // How to measure step helpers
  const handleUpdateMeasureStep = (
    index: number,
    field: keyof SizeGuideMeasurementStep,
    val: string
  ) => {
    setFormData((prev) => {
      const steps = [...prev.howToMeasure.steps];
      const target = steps[index];
      if (!target) return prev;
      steps[index] = { ...target, [field]: val };
      return { ...prev, howToMeasure: { ...prev.howToMeasure, steps } };
    });
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-[var(--color-slate)] animate-pulse">
        Loading Garment Size Guide configuration...
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: string; count?: number }[] = [
    { key: 'header', label: 'Header & AI Banner', icon: '✦' },
    { key: 'kurtis', label: 'Kurtis & Palazzo', icon: '👗', count: formData.kurtis.rows.length },
    { key: 'lehengas', label: 'Festive Lehengas', icon: '✨', count: formData.lehengas.rows.length },
    { key: 'blouses', label: 'Cholis & Blouse Stitching', icon: '🧵' },
    { key: 'measurements', label: 'How to Measure', icon: '📏', count: formData.howToMeasure.steps.length },
    { key: 'stylingDesk', label: 'Styling Desk CTA', icon: '💬' },
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
                Pages / Garment Size Guide
              </span>
              <Badge variant="outline" className="text-[10px] text-[var(--color-gold)] border-[var(--color-gold)]/40">
                Fit Guide Page
              </Badge>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#F5EFEB]">
              Garment Size Guide Editor
            </h2>
            <p className="text-xs text-[#D8CEBC] max-w-2xl mt-1 leading-relaxed">
              Manage header, interactive AI assistant promo banner, Kurti measurement chart, Lehenga skirt sizing, bespoke blouse stitching notes, measurement steps, styling desk WhatsApp CTA, and SEO for /size-guide.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/size-guide"
              target="_blank"
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-[#FAF7F2] border border-white/20 transition-colors flex items-center gap-1.5"
            >
              <span>View /size-guide</span>
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

      {/* Subtabs Bar */}
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

      {/* TAB 1: Header & AI Promo Banner */}
      {activeTab === 'header' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-[var(--color-whisper)] shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider mb-1">
              Page Header & Breadcrumb
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Configure top eyebrow title, main heading, and introduction paragraph for the size guide.
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
              placeholder="TAILORED FIT & MEASUREMENT CHARTS"
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
              placeholder="Garment Size Guide"
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
              placeholder="Every body is unique. Angelika silhouettes are designed with generous 2-inch side seams..."
              className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] leading-relaxed"
            />
          </div>

          {/* AI Promo Banner Config */}
          <div className="pt-6 border-t border-[var(--color-whisper)] space-y-4">
            <div>
              <h4 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider">
                AI Silhouette Assistant Promotion Card
              </h4>
              <p className="text-[11px] text-[var(--color-slate)]">
                Banner linking clients to the interactive size finder studio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminFormField
                label="Promo Eyebrow"
                value={formData.promoBanner.eyebrow}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    promoBanner: { ...prev.promoBanner, eyebrow: val },
                  }))
                }
                placeholder="AI SILHOUETTE ASSISTANT"
              />
              <AdminFormField
                label="Promo Heading"
                value={formData.promoBanner.title}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    promoBanner: { ...prev.promoBanner, title: val },
                  }))
                }
                placeholder="Want instant recommendations based on your height and fit preference?"
              />
            </div>

            <AdminFormField
              label="Promo Description"
              value={formData.promoBanner.description}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  promoBanner: { ...prev.promoBanner, description: val },
                }))
              }
              placeholder="Answer 3 simple questions to calculate your exact Angelika sizing."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminFormField
                label="CTA Button Label"
                value={formData.promoBanner.buttonText}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    promoBanner: { ...prev.promoBanner, buttonText: val },
                  }))
                }
                placeholder="Launch Interactive Size Finder →"
              />
              <AdminFormField
                label="CTA Destination Link"
                value={formData.promoBanner.buttonLink}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    promoBanner: { ...prev.promoBanner, buttonLink: val },
                  }))
                }
                placeholder="/size-finder"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Kurtis & Palazzo Measurements */}
      {activeTab === 'kurtis' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-[var(--color-whisper)] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider mb-1">
                Kurtis & Palazzo Measurements Table ({formData.kurtis.rows.length} rows)
              </h3>
              <p className="text-xs text-[var(--color-slate)]">
                Manage size labels, bust, waist, hip, shoulder, and kurti length values.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddKurtiRow}
              className="text-xs border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10"
            >
              + Add Size Row
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Table Title"
              value={formData.kurtis.title}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  kurtis: { ...prev.kurtis, title: val },
                }))
              }
              placeholder="Standard Ready-to-Wear Kurti Measurements (Inches)"
            />
            <AdminFormField
              label="Table Subtitle Note"
              value={formData.kurtis.subtitle}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  kurtis: { ...prev.kurtis, subtitle: val },
                }))
              }
              placeholder="Measurements are garment dimensions"
            />
          </div>

          <div className="overflow-x-auto rounded-lg border border-[var(--color-whisper)]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[var(--color-snow)] border-b border-[var(--color-whisper)] text-[var(--color-gold)] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Size Label</th>
                  <th className="py-2.5 px-3 font-semibold">Bust</th>
                  <th className="py-2.5 px-3 font-semibold">Waist</th>
                  <th className="py-2.5 px-3 font-semibold">Hip</th>
                  <th className="py-2.5 px-3 font-semibold">Shoulder</th>
                  <th className="py-2.5 px-3 font-semibold">Length</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-whisper)] bg-white text-xs">
                {formData.kurtis.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[var(--color-snow)]/50">
                    <td className="p-2">
                      <input
                        type="text"
                        value={row.size}
                        onChange={(e) => handleUpdateKurtiRow(idx, 'size', e.target.value)}
                        className="w-24 px-2 py-1 border rounded text-xs font-semibold"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={row.bust}
                        onChange={(e) => handleUpdateKurtiRow(idx, 'bust', e.target.value)}
                        className="w-16 px-2 py-1 border rounded text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={row.waist}
                        onChange={(e) => handleUpdateKurtiRow(idx, 'waist', e.target.value)}
                        className="w-16 px-2 py-1 border rounded text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={row.hip}
                        onChange={(e) => handleUpdateKurtiRow(idx, 'hip', e.target.value)}
                        className="w-16 px-2 py-1 border rounded text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={row.shoulder}
                        onChange={(e) => handleUpdateKurtiRow(idx, 'shoulder', e.target.value)}
                        className="w-20 px-2 py-1 border rounded text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={row.kurtiLength}
                        onChange={(e) => handleUpdateKurtiRow(idx, 'kurtiLength', e.target.value)}
                        className="w-16 px-2 py-1 border rounded text-xs"
                      />
                    </td>
                    <td className="p-2 text-right">
                      {formData.kurtis.rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveKurtiRow(idx)}
                          className="text-xs text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Festive Lehengas & Skirts */}
      {activeTab === 'lehengas' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-[var(--color-whisper)] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider mb-1">
                Festive Lehengas & Skirts Table ({formData.lehengas.rows.length} rows)
              </h3>
              <p className="text-xs text-[var(--color-slate)]">
                Manage waist, hip, skirt length, and ghera/flare values.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddLehengaRow}
              className="text-xs border-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10"
            >
              + Add Size Row
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Table Title"
              value={formData.lehengas.title}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  lehengas: { ...prev.lehengas, title: val },
                }))
              }
              placeholder="Bridal & Festive Lehenga Skirt Measurements (Inches)"
            />
            <AdminFormField
              label="Table Subtitle Note"
              value={formData.lehengas.subtitle}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  lehengas: { ...prev.lehengas, subtitle: val },
                }))
              }
              placeholder="With drawstring waist + zipper closure"
            />
          </div>

          <div className="overflow-x-auto rounded-lg border border-[var(--color-whisper)]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[var(--color-snow)] border-b border-[var(--color-whisper)] text-[var(--color-gold)] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Size Label</th>
                  <th className="py-2.5 px-3 font-semibold">Waist (Inches)</th>
                  <th className="py-2.5 px-3 font-semibold">Hip (Inches)</th>
                  <th className="py-2.5 px-3 font-semibold">Skirt Length</th>
                  <th className="py-2.5 px-3 font-semibold">Ghera / Flare</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-whisper)] bg-white text-xs">
                {formData.lehengas.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[var(--color-snow)]/50">
                    <td className="p-2">
                      <input
                        type="text"
                        value={row.size}
                        onChange={(e) => handleUpdateLehengaRow(idx, 'size', e.target.value)}
                        className="w-24 px-2 py-1 border rounded text-xs font-semibold"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={row.waist}
                        onChange={(e) => handleUpdateLehengaRow(idx, 'waist', e.target.value)}
                        className="w-20 px-2 py-1 border rounded text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={row.hip}
                        onChange={(e) => handleUpdateLehengaRow(idx, 'hip', e.target.value)}
                        className="w-20 px-2 py-1 border rounded text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={row.skirtLength}
                        onChange={(e) => handleUpdateLehengaRow(idx, 'skirtLength', e.target.value)}
                        className="w-24 px-2 py-1 border rounded text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={row.flare}
                        onChange={(e) => handleUpdateLehengaRow(idx, 'flare', e.target.value)}
                        className="w-28 px-2 py-1 border rounded text-xs"
                      />
                    </td>
                    <td className="p-2 text-right">
                      {formData.lehengas.rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLehengaRow(idx)}
                          className="text-xs text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Cholis & Blouse Stitching */}
      {activeTab === 'blouses' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-[var(--color-whisper)] shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider mb-1">
              Bespoke Blouse Stitching Notes
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Information displayed when clients select the "Cholis & Blouse Stitching" tab.
            </p>
          </div>

          <AdminFormField
            label="Section Title"
            value={formData.blouses.title}
            onChange={(val) =>
              setFormData((prev) => ({
                ...prev,
                blouses: { ...prev.blouses, title: val },
              }))
            }
            placeholder="Bespoke Blouse Stitching & Measurements"
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
              Blouse Craft Description
            </label>
            <textarea
              rows={3}
              value={formData.blouses.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  blouses: { ...prev.blouses, description: e.target.value },
                }))
              }
              className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                Padding Options Note
              </label>
              <textarea
                rows={2}
                value={formData.blouses.paddingNote}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    blouses: { ...prev.blouses, paddingNote: e.target.value },
                  }))
                }
                className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] leading-relaxed"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
                Seam Margins Note
              </label>
              <textarea
                rows={2}
                value={formData.blouses.seamNote}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    blouses: { ...prev.blouses, seamNote: e.target.value },
                  }))
                }
                className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: How to Measure Section */}
      {activeTab === 'measurements' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-[var(--color-whisper)] shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider mb-1">
              Body Measurement Steps ({formData.howToMeasure.steps.length})
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Guide clients on how to accurately measure bust, waist, and hips.
            </p>
          </div>

          <AdminFormField
            label="Section Title"
            value={formData.howToMeasure.title}
            onChange={(val) =>
              setFormData((prev) => ({
                ...prev,
                howToMeasure: { ...prev.howToMeasure, title: val },
              }))
            }
            placeholder="How to Take Accurate Body Measurements"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formData.howToMeasure.steps.map((st, sIdx) => (
              <div
                key={sIdx}
                className="p-4 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)]/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-wider">
                    Step #{sIdx + 1}
                  </span>
                </div>
                <input
                  type="text"
                  value={st.title}
                  onChange={(e) => handleUpdateMeasureStep(sIdx, 'title', e.target.value)}
                  placeholder="e.g. 1. Bust / Chest"
                  className="w-full text-xs font-semibold p-2 border rounded"
                />
                <textarea
                  rows={3}
                  value={st.description}
                  onChange={(e) => handleUpdateMeasureStep(sIdx, 'description', e.target.value)}
                  placeholder="Instructions for measuring..."
                  className="w-full text-xs p-2 border rounded leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: Styling Desk CTA */}
      {activeTab === 'stylingDesk' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-[var(--color-whisper)] shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider mb-1">
              Personal Styling Desk Assistance
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Bottom card offering direct WhatsApp consultations for clients between sizes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Eyebrow Subtitle"
              value={formData.stylingDesk.eyebrow}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  stylingDesk: { ...prev.stylingDesk, eyebrow: val },
                }))
              }
              placeholder="BETWEEN SIZES OR NEED CUSTOM DRAPE GUIDANCE?"
            />
            <AdminFormField
              label="Card Title"
              value={formData.stylingDesk.title}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  stylingDesk: { ...prev.stylingDesk, title: val },
                }))
              }
              placeholder="Designer Vidhya's Personal Styling Desk"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.stylingDesk.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  stylingDesk: { ...prev.stylingDesk, description: e.target.value },
                }))
              }
              placeholder="Share your measurements with Vidhya on WhatsApp..."
              className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Button Text"
              value={formData.stylingDesk.buttonText}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  stylingDesk: { ...prev.stylingDesk, buttonText: val },
                }))
              }
              placeholder="Consult Vidhya on WhatsApp →"
            />
            <AdminFormField
              label="WhatsApp Direct Link"
              value={formData.stylingDesk.whatsappLink}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  stylingDesk: { ...prev.stylingDesk, whatsappLink: val },
                }))
              }
              placeholder="https://wa.me/919876543210?text=..."
            />
          </div>
        </div>
      )}

      {/* TAB 7: SEO & Metadata */}
      {activeTab === 'seo' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-[var(--color-whisper)] shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider mb-1">
              Search Engine Optimization (SEO)
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Control how the Garment Size Guide appears on search engines and social shares.
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
              placeholder="Garment Size Guide & Measurement Charts | Angelika Fashions"
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
                placeholder="Complete sizing guide, bust, waist, and hip measurements..."
                className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] leading-relaxed"
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
              https://angelikafashions.com/size-guide
            </p>
            <h4 className="text-base text-blue-700 hover:underline font-medium cursor-pointer">
              {formData.seo?.metaTitle || 'Garment Size Guide & Measurement Charts | Angelika Fashions'}
            </h4>
            <p className="text-xs text-gray-600 line-clamp-2">
              {formData.seo?.metaDescription ||
                'Complete sizing guide, bust, waist, and hip measurements for luxury handcrafted kurtis, lehengas, and custom blouses.'}
            </p>
          </div>
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-[var(--color-whisper)] shadow-lg">
        <div className="text-xs text-[var(--color-slate)]">
          Editing <span className="font-semibold text-[var(--color-ink)]">Garment Size Guide</span>
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

