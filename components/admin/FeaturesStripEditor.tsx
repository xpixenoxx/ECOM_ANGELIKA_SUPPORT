'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Save,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Upload,
  Check,
  Grid3X3,
  Waves,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import type { FeatureItem, FeaturesContent } from '@/lib/actions/site-content-types';
import {
  COUTURE_FEATURE_ICON_OPTIONS,
  CoutureFeatureIcon,
  isCustomUploadedIconUrl,
  resolveCoutureFeatureIconKey,
} from '@/components/composite/CoutureFeatureIcons';
import { CoutureAssurancesStrip } from '@/components/composite/CoutureAssurancesStrip';
import { cn } from '@/lib/utils/cn';

interface FeaturesStripEditorProps {
  onSaved?: (savedData: FeaturesContent) => void;
  onCancel?: () => void;
}

const DEFAULT_FEATURES_CONTENT: FeaturesContent = {
  eyebrow: 'THE ANGELIKA ATELIER PROMISE',
  showGrid: true,
  showWaves: true,
  items: [
    {
      icon: 'shipping',
      eyebrow: 'Complimentary Dispatch',
      title: 'Complimentary Shipping',
      desc: 'Insured pan-India express delivery on orders ₹2,999+',
      description: 'Insured pan-India express delivery on orders ₹2,999+',
      href: '/shipping',
    },
    {
      icon: 'returns',
      eyebrow: 'Effortless Care',
      title: '15-Day Exchanges',
      desc: 'Seamless size exchanges & atelier-assisted returns',
      description: 'Seamless size exchanges & atelier-assisted returns',
      href: '/returns',
    },
    {
      icon: 'styling',
      eyebrow: 'Vidhya Atelier',
      title: 'Personal Styling',
      desc: 'Private drape & trousseau guidance with Vidhya',
      description: 'Private drape & trousseau guidance with Vidhya',
      href: '/contact',
    },
    {
      icon: 'gift',
      eyebrow: 'Signature Packaging',
      title: 'Couture Gift Wrapping',
      desc: 'Hand-tied heirloom boxes complimentary on every order',
      description: 'Hand-tied heirloom boxes complimentary on every order',
      href: '/about',
    },
  ],
};

function sanitizeLoadedFeatures(raw?: Partial<FeaturesContent>): FeaturesContent {
  const rawItems = Array.isArray(raw?.items) && raw.items.length > 0 ? raw.items : DEFAULT_FEATURES_CONTENT.items;
  return {
    eyebrow: raw?.eyebrow ?? DEFAULT_FEATURES_CONTENT.eyebrow,
    showGrid: raw?.showGrid !== false,
    showWaves: raw?.showWaves !== false,
    items: rawItems.map((item, idx) => {
      const resolvedIcon = isCustomUploadedIconUrl(item.icon)
        ? item.icon
        : resolveCoutureFeatureIconKey(item.icon, item.title, idx);
      const text = item.desc || item.description || '';
      return {
        icon: resolvedIcon,
        eyebrow: item.eyebrow || DEFAULT_FEATURES_CONTENT.items[idx % DEFAULT_FEATURES_CONTENT.items.length]?.eyebrow || 'Atelier Service',
        title: item.title || '',
        desc: text,
        description: text,
        href: item.href || '',
      };
    }),
  };
}

export function FeaturesStripEditor({ onSaved, onCancel }: FeaturesStripEditorProps) {
  const [content, setContent] = useState<FeaturesContent>(DEFAULT_FEATURES_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingUploadIndexRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const data = await res.json();
          if (mounted && data?.success && data.content?.features) {
            setContent(sanitizeLoadedFeatures(data.content.features));
          }
        }
      } catch (err) {
        console.error('Failed to load features strip content:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const updateItem = (idx: number, patch: Partial<FeatureItem>) => {
    setContent((prev) => {
      const next = [...prev.items];
      const current = next[idx];
      if (!current) return prev;
      const merged: FeatureItem = { ...current, ...patch };
      if (patch.desc !== undefined) merged.description = patch.desc;
      if (patch.description !== undefined && patch.desc === undefined) merged.desc = patch.description;
      next[idx] = merged;
      return { ...prev, items: next };
    });
  };

  const addItem = () => {
    setContent((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          icon: 'handloom',
          eyebrow: 'Artisanal Heritage',
          title: 'Certified Handloom',
          desc: 'Crafted directly with master Indian weavers',
          description: 'Crafted directly with master Indian weavers',
          href: '/about',
        },
      ],
    }));
  };

  const removeItem = (idx: number) => {
    if (content.items.length <= 1) return;
    setContent((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const moveItem = (idx: number, dir: 'up' | 'down') => {
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= content.items.length) return;
    setContent((prev) => {
      const next = [...prev.items];
      const a = next[idx];
      const b = next[targetIdx];
      if (!a || !b) return prev;
      next[idx] = b;
      next[targetIdx] = a;
      return { ...prev, items: next };
    });
  };

  const handleUploadIcon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = pendingUploadIndexRef.current;
    const file = e.target.files?.[0];
    if (idx === null || !file) return;

    setUploadingIdx(idx);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('target', 'content');
      const res = await fetch('/api/admin/content/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        updateItem(idx, { icon: data.url });
        setStatusMessage({ type: 'success', text: `Uploaded custom emblem "${file.name}". Save to publish.` });
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Icon upload failed.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error uploading icon.' });
    } finally {
      setUploadingIdx(null);
      pendingUploadIndexRef.current = null;
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: 'features',
          data: content,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const saved = sanitizeLoadedFeatures(data.content?.features || content);
        setContent(saved);
        setStatusMessage({
          type: 'success',
          text: 'Couture Assurances strip updated and synced live to the storefront.',
        });
        onSaved?.(saved);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to save changes.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error while saving.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all assurance pillars to Angelika couture defaults (zero emojis)?')) {
      setContent(DEFAULT_FEATURES_CONTENT);
      setStatusMessage({ type: 'success', text: 'Defaults restored. Click "Save & Publish" to apply live.' });
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-[var(--color-gold)] border-t-transparent" />
        <p className="text-xs text-[var(--color-slate)]">Loading Couture Assurances Strip...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hidden custom icon upload input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/svg+xml,image/webp,image/jpeg"
        className="hidden"
        onChange={handleUploadIcon}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-whisper)] pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-gold-text)] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-gold)]" />
            <span>Woven Silk Grid &amp; Drape Wave Strip</span>
          </span>
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">
            Couture Service Assurances (Below Hero)
          </h2>
          <p className="text-xs text-[var(--color-slate)] mt-0.5">
            Architectural hairline pillars with bespoke couture SVG emblems, silk loom grid, and flowing drape waves (no emojis).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-medium text-[var(--color-slate)] hover:text-[var(--color-ink)] border border-[var(--color-whisper)] rounded-lg bg-white cursor-pointer"
            >
              Close
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--color-slate)] hover:text-[var(--color-ink)] border border-[var(--color-whisper)] rounded-lg bg-white cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Couture Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[var(--color-ink)] hover:bg-[#2A2621] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div
          className={cn(
            'p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3',
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          )}
        >
          <span className="flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 shrink-0" />
            <span>{statusMessage.text}</span>
          </span>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold underline shrink-0"
          >
            <span>View Live</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* LIVE STOREFRONT PREVIEW */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-slate)]">
            Live Storefront Preview
          </span>
          <span className="text-[11px] text-[var(--color-gold-text)]">
            Exact component rendered below the hero
          </span>
        </div>
        <div className="rounded-xl overflow-hidden border border-[#E2D6C1] shadow-xs">
          <CoutureAssurancesStrip
            items={content.items}
            eyebrow={content.eyebrow}
            showGrid={content.showGrid}
            showWaves={content.showWaves}
            compactPreview
          />
        </div>
      </div>

      {/* Strip Background & Motif Controls */}
      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE4D9] space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
          Editorial Canvas &amp; Motifs
        </h3>
        <div className="grid sm:grid-cols-3 gap-4 items-end">
          <div className="sm:col-span-1">
            <label
              htmlFor="features-strip-eyebrow"
              className="block text-xs font-semibold text-[var(--color-ink)] mb-1"
            >
              Top Atelier Eyebrow
            </label>
            <input
              id="features-strip-eyebrow"
              type="text"
              value={content.eyebrow || ''}
              onChange={(e) => setContent({ ...content, eyebrow: e.target.value })}
              placeholder="THE ANGELIKA ATELIER PROMISE"
              className="w-full px-3 py-2 text-xs border border-[var(--color-whisper)] rounded-lg bg-white focus:outline-none focus:border-[var(--color-gold)] uppercase tracking-wider"
            />
          </div>

          <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[#E5DFD5] bg-white cursor-pointer">
            <input
              type="checkbox"
              checked={content.showGrid !== false}
              onChange={(e) => setContent({ ...content, showGrid: e.target.checked })}
              className="w-4 h-4 accent-[var(--color-gold)]"
            />
            <Grid3X3 className="w-4 h-4 text-[var(--color-gold-text)] shrink-0" />
            <span className="text-xs font-medium text-[var(--color-ink)]">Woven Silk Background Grid</span>
          </label>

          <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[#E5DFD5] bg-white cursor-pointer">
            <input
              type="checkbox"
              checked={content.showWaves !== false}
              onChange={(e) => setContent({ ...content, showWaves: e.target.checked })}
              className="w-4 h-4 accent-[var(--color-gold)]"
            />
            <Waves className="w-4 h-4 text-[var(--color-gold-text)] shrink-0" />
            <span className="text-xs font-medium text-[var(--color-ink)]">Flowing Saree Drape Waves</span>
          </label>
        </div>
      </div>

      {/* Assurance Pillars List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">
              Assurance Pillars ({content.items.length})
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Recommended: 4 pillars for a balanced full-width couture grid.
            </p>
          </div>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--color-gold)]/15 text-[var(--color-gold-text)] hover:bg-[var(--color-gold)]/25 border border-[var(--color-gold)]/40 rounded-lg cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Pillar</span>
          </button>
        </div>

        <div className="space-y-4">
          {content.items.map((item, idx) => {
            const activeKey = isCustomUploadedIconUrl(item.icon)
              ? null
              : resolveCoutureFeatureIconKey(item.icon, item.title, idx);

            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-2xs space-y-4"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-[#EFEAE1] pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 flex items-center justify-center border border-[#DCCEB5] bg-[#FAF6EE] text-[#74590E]">
                      <CoutureFeatureIcon icon={item.icon} title={item.title} index={idx} className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                      Pillar {String(idx + 1).padStart(2, '0')} — {item.title || 'Untitled'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveItem(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded hover:bg-stone-100 text-[var(--color-slate)] disabled:opacity-30 cursor-pointer"
                      aria-label={`Move pillar ${idx + 1} up`}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(idx, 'down')}
                      disabled={idx === content.items.length - 1}
                      className="p-1.5 rounded hover:bg-stone-100 text-[var(--color-slate)] disabled:opacity-30 cursor-pointer"
                      aria-label={`Move pillar ${idx + 1} down`}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      disabled={content.items.length <= 1}
                      className="p-1.5 rounded hover:bg-rose-50 text-rose-500 disabled:opacity-30 cursor-pointer"
                      aria-label={`Delete pillar ${idx + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Couture SVG Emblem Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-slate)]">
                      Couture Emblem (Bespoke SVG — No Emojis)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        pendingUploadIndexRef.current = idx;
                        fileInputRef.current?.click();
                      }}
                      disabled={uploadingIdx === idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium border border-[#DCCEB5] rounded-md bg-[#FAF8F5] hover:border-[var(--color-gold)] text-[var(--color-ink)] cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{uploadingIdx === idx ? 'Uploading...' : 'Upload Custom SVG/PNG'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {COUTURE_FEATURE_ICON_OPTIONS.map((opt) => {
                      const selected = activeKey === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => updateItem(idx, { icon: opt.key })}
                          className={cn(
                            'flex items-center gap-2 p-2 rounded-lg border text-left transition-all cursor-pointer',
                            selected
                              ? 'border-[var(--color-gold)] bg-[#FAF6EE] text-[#141414] ring-1 ring-[var(--color-gold)]/40'
                              : 'border-[#EAE4D9] bg-white text-[var(--color-slate)] hover:border-[#C9A84C]/60'
                          )}
                        >
                          <span
                            className={cn(
                              'w-7 h-7 flex items-center justify-center shrink-0 border',
                              selected
                                ? 'border-[#C9A84C] bg-[#141414] text-[#E8D08B]'
                                : 'border-[#E6DAC4] bg-[#FAF6EE] text-[#74590E]'
                            )}
                          >
                            <CoutureFeatureIcon icon={opt.key} className="w-4 h-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[11px] font-semibold truncate">{opt.label}</span>
                            <span className="block text-[9.5px] text-[var(--color-slate)] truncate">{opt.hint}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Text Fields */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor={`feat-eyebrow-${idx}`}
                      className="block text-[11px] font-semibold text-[var(--color-ink)] mb-1"
                    >
                      Micro Eyebrow
                    </label>
                    <input
                      id={`feat-eyebrow-${idx}`}
                      type="text"
                      value={item.eyebrow || ''}
                      onChange={(e) => updateItem(idx, { eyebrow: e.target.value })}
                      placeholder="Complimentary Dispatch"
                      className="w-full px-3 py-1.5 text-xs border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`feat-title-${idx}`}
                      className="block text-[11px] font-semibold text-[var(--color-ink)] mb-1"
                    >
                      Heading
                    </label>
                    <input
                      id={`feat-title-${idx}`}
                      type="text"
                      value={item.title}
                      onChange={(e) => updateItem(idx, { title: e.target.value })}
                      placeholder="Complimentary Shipping"
                      className="w-full px-3 py-1.5 text-xs font-medium border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`feat-desc-${idx}`}
                      className="block text-[11px] font-semibold text-[var(--color-ink)] mb-1"
                    >
                      Subtitle / Detail
                    </label>
                    <input
                      id={`feat-desc-${idx}`}
                      type="text"
                      value={item.desc || item.description || ''}
                      onChange={(e) => updateItem(idx, { desc: e.target.value, description: e.target.value })}
                      placeholder="Insured pan-India express delivery on orders ₹2,999+"
                      className="w-full px-3 py-1.5 text-xs border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`feat-href-${idx}`}
                      className="block text-[11px] font-semibold text-[var(--color-ink)] mb-1"
                    >
                      Destination Link (Optional)
                    </label>
                    <input
                      id={`feat-href-${idx}`}
                      type="text"
                      value={item.href || ''}
                      onChange={(e) => updateItem(idx, { href: e.target.value })}
                      placeholder="/shipping (leave empty for non-clickable)"
                      className="w-full px-3 py-1.5 text-xs font-mono border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)]"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
