'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import { AdminImageInputWithUpload } from '@/components/admin/AdminImageUploadControl';
import type {
  VidhyasPicksPageContent,
  VidhyasPicksPageProduct,
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

function AdminTextArea({
  label,
  value,
  onChange,
  placeholder = '',
  rows = 3,
  helperText,
  disabled = false,
  className = '',
}: {
  label: string;
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1', className)}>
      <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
        {label}
      </label>
      <textarea
        rows={rows}
        disabled={disabled}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors resize-y',
          disabled && 'opacity-60 cursor-not-allowed bg-[var(--color-snow)]'
        )}
      />
      {helperText && (
        <p className="text-[10px] text-[var(--color-slate)] leading-tight">{helperText}</p>
      )}
    </div>
  );
}

const DEFAULT_PAGE_DATA: VidhyasPicksPageContent = {
  header: {
    eyebrowBadge: "FOUNDER'S CURATION",
    badgeSubtitle: 'Handpicked Atelier Edit',
    title: "Vidhya's Personal Picks",
    titleHighlight: 'Personal',
    description:
      'Hand-selected directly from master looms across Varanasi, Kutch, and Jaipur — chosen for effortless drape, pure natural fiber, and timeless elegance.',
    founder: {
      name: 'Vidhya Sharma',
      role: 'Founder & Creative Director',
      experience: 'Curating pure handloom weaves since 2018',
      avatar: '/images/about/vidhya-profile.jpg',
      storyLinkText: 'Meet Vidhya →',
      storyLinkHref: '/about/vidhya',
    },
  },
  concierge: {
    badge: 'ATELIER CONCIERGE',
    title: 'Need Draping, Blouse Cut, or Sizing Advice?',
    description:
      'Connect directly with Vidhya’s styling desk for drape guidance, custom blouse tailoring, and fabric matching for your upcoming occasion.',
    whatsappNumber: '+91 72072 56690',
    whatsappUrl:
      "https://wa.me/917207256690?text=Hi%20Vidhya,%20I%20need%20styling%20advice%20on%20Vidhya's%20Picks.",
    sizeGuideText: 'Open Size Finder',
    sizeGuideHref: '/size-finder',
  },
  monthlyEdits: [],
  additionalPicks: [
    {
      id: 'vp-jan-1',
      slug: 'mulberry-silk-saree',
      name: 'Mulberry Silk Saree',
      price: 7999,
      originalPrice: 9999,
      image: '/images/vp-jan-1.jpg',
      color: 'Ivory & Antique Gold',
      colorFamily: 'white',
      category: 'Sarees',
      fabric: 'Pure Mulberry Silk',
      origin: 'Varanasi Master Weavers',
      discount: 20,
      vidhyaNote:
        'The saree I wore to my own housewarming. Drapes like an absolute dream and catches subtle morning light.',
      tags: ['saree', 'sarees', 'silk', 'ivory', 'white', 'gold', 'varanasi'],
    },
  ],
  seo: {
    metaTitle: "Vidhya's Picks | Founder's Curated Handloom Ethnic Wear | Angelika",
    metaDescription:
      "Explore Vidhya's personal curation of handwoven sarees, artisanal kurtis, festive lehengas, and elegant salwars direct from master looms.",
  },
};

function mergeUnifiedProducts(raw: Partial<VidhyasPicksPageContent>): VidhyasPicksPageProduct[] {
  const seen = new Set<string>();
  const merged: VidhyasPicksPageProduct[] = [];
  const pushUnique = (item: VidhyasPicksPageProduct) => {
    const key = (item.id || item.slug || item.name || '').trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    merged.push(item);
  };

  if (Array.isArray(raw.monthlyEdits)) {
    for (const edit of raw.monthlyEdits) {
      if (Array.isArray(edit?.products)) {
        for (const prod of edit.products) {
          pushUnique(prod);
        }
      }
    }
  }
  if (Array.isArray(raw.additionalPicks)) {
    for (const prod of raw.additionalPicks) {
      pushUnique(prod);
    }
  }
  return merged;
}

type TabKey = 'header' | 'catalog' | 'concierge' | 'seo';
const CATEGORY_FILTER_OPTIONS = ['All', 'Sarees', 'Kurtis', 'Salwars', 'Lehengas', 'Dupattas'] as const;

export function VidhyasPicksPageEditor({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState<VidhyasPicksPageContent>(DEFAULT_PAGE_DATA);
  const [activeTab, setActiveTab] = useState<TabKey>('header');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const json = await res.json();
          if (json.content && json.content['vidhyas-picks-page'] && isMounted) {
            const raw = json.content['vidhyas-picks-page'] as Partial<VidhyasPicksPageContent>;
            const unified = mergeUnifiedProducts(raw);
            const resolvedPicks = unified.length > 0 ? unified : DEFAULT_PAGE_DATA.additionalPicks;

            const rawConcierge = raw.concierge || DEFAULT_PAGE_DATA.concierge;
            const normalizedNumber =
              rawConcierge.whatsappNumber && !rawConcierge.whatsappNumber.includes('98765 43210')
                ? rawConcierge.whatsappNumber
                : DEFAULT_PAGE_DATA.concierge.whatsappNumber;
            const normalizedUrl =
              rawConcierge.whatsappUrl && !rawConcierge.whatsappUrl.includes('919876543210')
                ? rawConcierge.whatsappUrl
                : DEFAULT_PAGE_DATA.concierge.whatsappUrl;

            setFormData({
              header: {
                ...DEFAULT_PAGE_DATA.header,
                ...(raw.header || {}),
                founder: {
                  ...DEFAULT_PAGE_DATA.header.founder,
                  ...(raw.header?.founder || {}),
                },
              },
              concierge: {
                ...DEFAULT_PAGE_DATA.concierge,
                ...rawConcierge,
                whatsappNumber: normalizedNumber,
                whatsappUrl: normalizedUrl,
              },
              monthlyEdits: [],
              additionalPicks: resolvedPicks,
              seo: {
                ...DEFAULT_PAGE_DATA.seo,
                ...(raw.seo || {}),
              },
            });
            setSelectedProductId(resolvedPicks[0]?.id || '');
          }
        }
      } catch (err) {
        console.error('Failed to load vidhyas-picks-page content:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    if (categoryFilter === 'All') return formData.additionalPicks;
    return formData.additionalPicks.filter((p) => p.category === categoryFilter);
  }, [formData.additionalPicks, categoryFilter]);

  const currentProductIndex = useMemo(() => {
    const idx = formData.additionalPicks.findIndex((p) => p.id === selectedProductId);
    if (idx !== -1) return idx;
    const firstVisible = visibleProducts[0];
    if (firstVisible) {
      const vIdx = formData.additionalPicks.findIndex((p) => p.id === firstVisible.id);
      if (vIdx !== -1) return vIdx;
    }
    return 0;
  }, [formData.additionalPicks, selectedProductId, visibleProducts]);

  const currentProduct = formData.additionalPicks[currentProductIndex];

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const payload: VidhyasPicksPageContent = {
        header: formData.header,
        concierge: formData.concierge,
        monthlyEdits: [],
        additionalPicks: formData.additionalPicks,
        seo: formData.seo,
      };

      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: 'vidhyas-picks-page',
          data: payload,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: "Vidhya's Picks page saved! Changes are live on /vidhyas-picks.",
        });
        onSaved();
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || "Failed to save Vidhya's Picks content.",
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'An unexpected network error occurred while saving.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Reset Vidhya's Picks header, concierge, and SEO to defaults? Your curated pieces list will be preserved unless replaced.")) {
      setFormData((prev) => ({
        ...prev,
        header: DEFAULT_PAGE_DATA.header,
        concierge: DEFAULT_PAGE_DATA.concierge,
        seo: DEFAULT_PAGE_DATA.seo,
      }));
      setStatusMessage({
        type: 'success',
        text: 'Header, concierge, and SEO restored to defaults. Click "Save Changes" to publish.',
      });
    }
  };

  const updateProduct = (
    prodIdx: number,
    updater: (prod: VidhyasPicksPageProduct) => VidhyasPicksPageProduct
  ) => {
    setFormData((prev) => {
      const next = [...prev.additionalPicks];
      const target = next[prodIdx];
      if (target) {
        next[prodIdx] = updater(target);
      }
      return { ...prev, additionalPicks: next };
    });
  };

  const handleAddProduct = () => {
    const newId = `vp-${Date.now()}`;
    const nextCat =
      categoryFilter !== 'All'
        ? (categoryFilter as VidhyasPicksPageProduct['category'])
        : 'Sarees';
    const newProduct: VidhyasPicksPageProduct = {
      id: newId,
      slug: `curated-piece-${Date.now().toString(36)}`,
      name: 'New Handloom Curation Piece',
      price: 4999,
      originalPrice: 5999,
      discount: 17,
      image: '/images/vp-jan-1.jpg',
      color: 'Ivory & Gold',
      colorFamily: 'white',
      category: nextCat,
      fabric: 'Pure Mulberry Silk',
      origin: 'Varanasi Master Weavers',
      vidhyaNote: 'Personally selected for effortless drape and natural handloom texture.',
      tags: [nextCat.toLowerCase(), 'silk', 'handloom', 'curated'],
    };
    setFormData((prev) => ({
      ...prev,
      additionalPicks: [newProduct, ...prev.additionalPicks],
    }));
    setSelectedProductId(newId);
  };

  const handleDeleteProduct = (prodIdx: number) => {
    if (formData.additionalPicks.length <= 1) return;
    const prod = formData.additionalPicks[prodIdx];
    if (!confirm(`Remove "${prod?.name || 'this piece'}" from Vidhya's Picks?`)) return;
    setFormData((prev) => {
      const next = prev.additionalPicks.filter((_, i) => i !== prodIdx);
      setSelectedProductId(next[Math.max(0, prodIdx - 1)]?.id || next[0]?.id || '');
      return { ...prev, additionalPicks: next };
    });
  };

  const handleMoveProduct = (prodIdx: number, direction: -1 | 1) => {
    const targetIdx = prodIdx + direction;
    if (targetIdx < 0 || targetIdx >= formData.additionalPicks.length) return;
    setFormData((prev) => {
      const next = [...prev.additionalPicks];
      const [moved] = next.splice(prodIdx, 1);
      if (moved) next.splice(targetIdx, 0, moved);
      return { ...prev, additionalPicks: next };
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-[var(--color-slate)]">
        <div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading Vidhya&apos;s Picks Editor...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--color-whisper)]">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="gold" size="sm">
              EDITORIAL PAGE
            </Badge>
            <span className="text-[10px] text-[var(--color-slate)] font-mono">/vidhyas-picks</span>
          </div>
          <h2 className="text-lg font-serif font-bold text-[var(--color-ink)] mt-1">
            Vidhya&apos;s Picks Page Editor
          </h2>
          <p className="text-xs text-[var(--color-slate)]">
            Manage the editorial masthead, unified curated picks catalog, styling concierge, and SEO metadata.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/vidhyas-picks"
            target="_blank"
            className="text-xs text-[var(--color-gold)] hover:underline font-medium px-3 py-1.5 border border-[var(--color-gold)]/30 rounded-lg bg-[var(--color-gold-light)]/20 transition-colors inline-flex items-center gap-1"
          >
            <span>View Live Page</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
          <Button type="button" variant="outline" size="sm" onClick={onCancel} className="text-xs">
            Close
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetDefaults}
            className="text-xs text-[var(--color-slate)] hover:text-[var(--color-ink)]"
          >
            Reset Copy
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isSaving}
            onClick={handleSave}
            className="text-xs bg-[var(--color-gold)] hover:bg-[#967637] text-white font-medium px-4 shadow-sm"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={cn(
            'p-3 rounded-lg text-xs font-medium flex items-center justify-between border',
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          )}
        >
          <span>{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Streamlined 4-Tab Navigation (1-to-1 with live storefront sections) */}
      <div className="flex border-b border-[var(--color-whisper)] overflow-x-auto gap-1 pb-1">
        {[
          { key: 'header', label: '1. Header & Founder' },
          { key: 'catalog', label: `2. Curated Picks (${formData.additionalPicks.length})` },
          { key: 'concierge', label: '3. Styling Concierge' },
          { key: 'seo', label: '4. SEO & Metadata' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as TabKey)}
            className={cn(
              'px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap cursor-pointer',
              activeTab === tab.key
                ? 'bg-[var(--color-gold-light)]/40 text-[var(--color-ink)] border-b-2 border-[var(--color-gold)] font-semibold'
                : 'text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-snow)]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: HEADER & FOUNDER */}
      {activeTab === 'header' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
              Editorial Masthead Copy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminFormField
                label="Eyebrow Badge"
                value={formData.header.eyebrowBadge}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: { ...prev.header, eyebrowBadge: val },
                  }))
                }
                placeholder="FOUNDER'S CURATION"
              />
              <AdminFormField
                label="Subtitle Label"
                value={formData.header.badgeSubtitle}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: { ...prev.header, badgeSubtitle: val },
                  }))
                }
                placeholder="Handpicked Atelier Edit"
              />
              <AdminFormField
                label="Main Title"
                value={formData.header.title}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: { ...prev.header, title: val },
                  }))
                }
                placeholder="Vidhya's Personal Picks"
              />
              <AdminFormField
                label="Highlighted Word in Title"
                value={formData.header.titleHighlight}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: { ...prev.header, titleHighlight: val },
                  }))
                }
                placeholder="Personal"
                helperText="Renders in italic gold serif typeface"
              />
            </div>

            <AdminTextArea
              label="Editorial Intro Note"
              rows={3}
              value={formData.header.description}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  header: { ...prev.header, description: val },
                }))
              }
              placeholder="Hand-selected directly from master looms across Varanasi, Kutch, and Jaipur..."
            />
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
              Founder Attribution Card
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminFormField
                label="Founder Name"
                value={formData.header.founder.name}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: {
                      ...prev.header,
                      founder: { ...prev.header.founder, name: val },
                    },
                  }))
                }
                placeholder="Vidhya Sharma"
              />
              <AdminFormField
                label="Role"
                value={formData.header.founder.role}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: {
                      ...prev.header,
                      founder: { ...prev.header.founder, role: val },
                    },
                  }))
                }
                placeholder="Founder & Creative Director"
              />
              <AdminImageInputWithUpload
                label="Founder Avatar (Upload or Path)"
                value={formData.header.founder.avatar}
                previewShape="circle"
                target="vidhyas-picks-avatar"
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: {
                      ...prev.header,
                      founder: { ...prev.header.founder, avatar: val },
                    },
                  }))
                }
                placeholder="/images/about/vidhya-profile.jpg"
              />
              <AdminFormField
                label="Story Link Text"
                value={formData.header.founder.storyLinkText}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: {
                      ...prev.header,
                      founder: { ...prev.header.founder, storyLinkText: val },
                    },
                  }))
                }
                placeholder="Meet Vidhya →"
              />
              <AdminFormField
                label="Story Link URL"
                value={formData.header.founder.storyLinkHref}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    header: {
                      ...prev.header,
                      founder: { ...prev.header.founder, storyLinkHref: val },
                    },
                  }))
                }
                placeholder="/about/vidhya"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UNIFIED CURATED PICKS CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
                  All Curated Pieces ({formData.additionalPicks.length})
                </h3>
                <p className="text-[11px] text-[var(--color-slate)]">
                  Every piece listed here displays directly on /vidhyas-picks with mobile 2-column lookbook cards and filters.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddProduct}
                className="text-xs text-[var(--color-gold)] border-[var(--color-gold)] hover:bg-[var(--color-gold-light)]/20"
              >
                + Add Curated Piece
              </Button>
            </div>

            {/* Category filter bar inside Admin */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {CATEGORY_FILTER_OPTIONS.map((cat) => {
                const count =
                  cat === 'All'
                    ? formData.additionalPicks.length
                    : formData.additionalPicks.filter((p) => p.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      'px-2.5 py-1 text-[11px] rounded-full font-medium whitespace-nowrap border transition-colors cursor-pointer',
                      categoryFilter === cat
                        ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]'
                        : 'bg-white text-[var(--color-slate)] border-[var(--color-whisper)] hover:text-[var(--color-ink)]'
                    )}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Product selector chips */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {visibleProducts.map((prod, idx) => (
                <button
                  key={prod.id || idx}
                  type="button"
                  onClick={() => setSelectedProductId(prod.id)}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 border cursor-pointer',
                    currentProduct?.id === prod.id
                      ? 'bg-[var(--color-gold)] text-white border-[var(--color-gold)] shadow-xs'
                      : 'bg-white text-[var(--color-ink)] border-[var(--color-whisper)] hover:bg-[var(--color-snow)]'
                  )}
                >
                  <span className="font-semibold">{idx + 1}.</span>
                  <span className="max-w-[150px] truncate">{prod.name}</span>
                  <span className="text-[10px] opacity-80">({prod.category})</span>
                </button>
              ))}
            </div>

            {/* Selected Product Editor */}
            {currentProduct && (
              <div className="p-4 bg-white rounded-lg border border-[var(--color-whisper)] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[var(--color-whisper)]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--color-ink)]">
                      Editing: {currentProduct.name}
                    </span>
                    <Badge variant="outline" size="sm">
                      #{currentProductIndex + 1} of {formData.additionalPicks.length}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentProductIndex === 0}
                      onClick={() => handleMoveProduct(currentProductIndex, -1)}
                      className="px-2 py-1 text-[11px] rounded border border-[var(--color-whisper)] hover:border-[var(--color-gold)] disabled:opacity-40 cursor-pointer"
                      title="Move earlier in grid"
                    >
                      ← Move Up
                    </button>
                    <button
                      type="button"
                      disabled={currentProductIndex >= formData.additionalPicks.length - 1}
                      onClick={() => handleMoveProduct(currentProductIndex, 1)}
                      className="px-2 py-1 text-[11px] rounded border border-[var(--color-whisper)] hover:border-[var(--color-gold)] disabled:opacity-40 cursor-pointer"
                      title="Move later in grid"
                    >
                      Move Down →
                    </button>
                    {formData.additionalPicks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(currentProductIndex)}
                        className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                      >
                        Delete Piece
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <AdminFormField
                    label="Product Name"
                    value={currentProduct.name}
                    onChange={(val) => updateProduct(currentProductIndex, (p) => ({ ...p, name: val }))}
                    placeholder="Mulberry Silk Saree"
                  />
                  <AdminFormField
                    label="Product URL Slug"
                    value={currentProduct.slug}
                    onChange={(val) => updateProduct(currentProductIndex, (p) => ({ ...p, slug: val }))}
                    placeholder="mulberry-silk-saree"
                  />
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--color-ink)]">
                      Category
                    </label>
                    <select
                      value={currentProduct.category}
                      onChange={(e) =>
                        updateProduct(currentProductIndex, (p) => ({
                          ...p,
                          category: e.target.value as VidhyasPicksPageProduct['category'],
                        }))
                      }
                      className="w-full h-10 text-xs px-3 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                    >
                      <option value="Sarees">Sarees</option>
                      <option value="Kurtis">Kurtis</option>
                      <option value="Salwars">Salwars</option>
                      <option value="Lehengas">Lehengas</option>
                      <option value="Dupattas">Dupattas</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <AdminFormField
                    label="Selling Price (₹)"
                    type="number"
                    value={currentProduct.price}
                    onChange={(val) =>
                      updateProduct(currentProductIndex, (p) => ({ ...p, price: Number(val) || 0 }))
                    }
                    placeholder="7999"
                  />
                  <AdminFormField
                    label="Original Price (₹)"
                    type="number"
                    value={currentProduct.originalPrice}
                    onChange={(val) =>
                      updateProduct(currentProductIndex, (p) => ({ ...p, originalPrice: Number(val) || 0 }))
                    }
                    placeholder="9999"
                  />
                  <AdminFormField
                    label="Discount (%)"
                    type="number"
                    value={currentProduct.discount}
                    onChange={(val) =>
                      updateProduct(currentProductIndex, (p) => ({ ...p, discount: Number(val) || 0 }))
                    }
                    placeholder="20"
                  />
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--color-ink)]">
                      Color Family
                    </label>
                    <select
                      value={currentProduct.colorFamily || 'white'}
                      onChange={(e) =>
                        updateProduct(currentProductIndex, (p) => ({
                          ...p,
                          colorFamily: e.target.value as VidhyasPicksPageProduct['colorFamily'],
                        }))
                      }
                      className="w-full h-10 text-xs px-3 rounded-lg border border-[var(--color-whisper)] bg-white text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                    >
                      <option value="white">White &amp; Ivory</option>
                      <option value="red">Red &amp; Crimson</option>
                      <option value="green">Green &amp; Emerald</option>
                      <option value="blue">Blue &amp; Navy</option>
                      <option value="gold">Gold &amp; Yellow</option>
                      <option value="pink">Pink &amp; Rose</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <AdminFormField
                    label="Color Display Name"
                    value={currentProduct.color}
                    onChange={(val) => updateProduct(currentProductIndex, (p) => ({ ...p, color: val }))}
                    placeholder="Ivory & Antique Gold"
                  />
                  <AdminFormField
                    label="Fabric"
                    value={currentProduct.fabric}
                    onChange={(val) => updateProduct(currentProductIndex, (p) => ({ ...p, fabric: val }))}
                    placeholder="Pure Mulberry Silk"
                  />
                  <AdminFormField
                    label="Artisan Origin"
                    value={currentProduct.origin}
                    onChange={(val) => updateProduct(currentProductIndex, (p) => ({ ...p, origin: val }))}
                    placeholder="Varanasi Master Weavers"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AdminImageInputWithUpload
                    label="Product Image (Upload or Path)"
                    value={currentProduct.image}
                    target="vidhyas-picks-product"
                    onChange={(val) => updateProduct(currentProductIndex, (p) => ({ ...p, image: val }))}
                    placeholder="/images/vp-jan-1.jpg"
                  />
                  <AdminFormField
                    label="Search Tags (comma separated)"
                    value={Array.isArray(currentProduct.tags) ? currentProduct.tags.join(', ') : ''}
                    onChange={(val) => {
                      const tags = val
                        .split(',')
                        .map((t) => t.trim().toLowerCase())
                        .filter(Boolean);
                      updateProduct(currentProductIndex, (p) => ({ ...p, tags }));
                    }}
                    placeholder="saree, silk, ivory, gold, varanasi"
                  />
                </div>

                <AdminTextArea
                  label="Vidhya's Personal Note"
                  rows={2}
                  value={currentProduct.vidhyaNote}
                  onChange={(val) => updateProduct(currentProductIndex, (p) => ({ ...p, vidhyaNote: val }))}
                  placeholder="Drapes effortlessly and catches warm evening light..."
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: STYLING CONCIERGE */}
      {activeTab === 'concierge' && (
        <div className="p-4 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
            Atelier Styling Concierge Strip
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Eyebrow Badge"
              value={formData.concierge.badge}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  concierge: { ...prev.concierge, badge: val },
                }))
              }
              placeholder="ATELIER CONCIERGE"
            />
            <AdminFormField
              label="Headline"
              value={formData.concierge.title}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  concierge: { ...prev.concierge, title: val },
                }))
              }
              placeholder="Need Draping, Blouse Cut, or Sizing Advice?"
            />
            <AdminFormField
              label="WhatsApp Number"
              value={formData.concierge.whatsappNumber}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  concierge: { ...prev.concierge, whatsappNumber: val },
                }))
              }
              placeholder="+91 72072 56690"
            />
            <AdminFormField
              label="WhatsApp Direct Chat URL"
              value={formData.concierge.whatsappUrl}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  concierge: { ...prev.concierge, whatsappUrl: val },
                }))
              }
              placeholder="https://wa.me/917207256690?text=..."
            />
            <AdminFormField
              label="Secondary CTA Label"
              value={formData.concierge.sizeGuideText}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  concierge: { ...prev.concierge, sizeGuideText: val },
                }))
              }
              placeholder="Open Size Finder"
            />
            <AdminFormField
              label="Secondary CTA Link"
              value={formData.concierge.sizeGuideHref}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  concierge: { ...prev.concierge, sizeGuideHref: val },
                }))
              }
              placeholder="/size-finder"
            />
          </div>

          <AdminTextArea
            label="Description"
            rows={3}
            value={formData.concierge.description}
            onChange={(val) =>
              setFormData((prev) => ({
                ...prev,
                concierge: { ...prev.concierge, description: val },
              }))
            }
            placeholder="Connect directly with Vidhya’s styling desk for drape guidance..."
          />
        </div>
      )}

      {/* TAB 4: SEO */}
      {activeTab === 'seo' && (
        <div className="p-4 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
            SEO &amp; Social Sharing Metadata
          </h3>
          <AdminFormField
            label="Meta Title"
            value={formData.seo.metaTitle}
            onChange={(val) =>
              setFormData((prev) => ({
                ...prev,
                seo: { ...prev.seo, metaTitle: val },
              }))
            }
            placeholder="Vidhya's Picks | Founder's Curated Handloom Ethnic Wear | Angelika"
            helperText={`${(formData.seo.metaTitle || '').length} characters (ideal: 50–65)`}
          />
          <AdminTextArea
            label="Meta Description"
            rows={3}
            value={formData.seo.metaDescription}
            onChange={(val) =>
              setFormData((prev) => ({
                ...prev,
                seo: { ...prev.seo, metaDescription: val },
              }))
            }
            placeholder="Explore Vidhya's personal curation of handwoven sarees..."
            helperText={`${(formData.seo.metaDescription || '').length} characters (ideal: 140–160)`}
          />
        </div>
      )}

      {/* Bottom Save Bar */}
      <div className="pt-4 border-t border-[var(--color-whisper)] flex items-center justify-between">
        <p className="text-xs text-[var(--color-slate)]">
          Updates sync live with <span className="font-mono text-[var(--color-ink)]">/vidhyas-picks</span>.
        </p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel} className="text-xs">
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isSaving}
            onClick={handleSave}
            className="text-xs bg-[var(--color-gold)] hover:bg-[#967637] text-white font-medium px-5 shadow-sm"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
