'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type { CookiePolicyPageContent, CookiePolicySectionItem } from '@/lib/actions/site-content-types';

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

export function CookiesPageEditor({
  onCancel,
  onSaved,
}: {
  onCancel?: () => void;
  onSaved?: () => void;
}) {
  const [formData, setFormData] = useState<CookiePolicyPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'sections' | 'header' | 'seo' | 'preview'>('sections');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const json = await res.json();
          if (json.content && json.content['cookies-page']) {
            setFormData(json.content['cookies-page']);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load cookies-page content:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async () => {
    if (!formData) return;
    try {
      setSaving(true);
      setSaveSuccess(false);
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: 'cookies-page',
          data: formData,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        if (onSaved) onSaved();
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert('Failed to save changes. Please try again.');
      }
    } catch (err) {
      console.error('Error saving cookies-page:', err);
      alert('Error saving content. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSection = (index: number, field: keyof CookiePolicySectionItem, value: string) => {
    if (!formData) return;
    setFormData((prev) => {
      if (!prev) return prev;
      const updated = [...prev.sections];
      const current = updated[index];
      if (!current) return prev;
      updated[index] = { ...current, [field]: value };
      return { ...prev, sections: updated };
    });
  };

  const handleAddSection = () => {
    if (!formData) return;
    const newIdx = formData.sections.length + 1;
    const newItem: CookiePolicySectionItem = {
      id: `sec-${Date.now()}`,
      title: `${newIdx}. New Section Title`,
      content: 'Enter section description or details here. Use bullet points (• Item: Description) for lists.',
    };
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: [...prev.sections, newItem],
      };
    });
    setExpandedIndex(formData.sections.length);
  };

  const handleDeleteSection = (index: number) => {
    if (!formData) return;
    if (formData.sections.length <= 1) {
      alert('You must have at least one section in the policy.');
      return;
    }
    if (confirm('Are you sure you want to delete this section?')) {
      setFormData((prev) => {
        if (!prev) return prev;
        const updated = prev.sections.filter((_, idx) => idx !== index);
        return { ...prev, sections: updated };
      });
      setExpandedIndex(null);
    }
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (!formData) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formData.sections.length) return;

    setFormData((prev) => {
      if (!prev) return prev;
      const updated = [...prev.sections];
      const itemA = updated[index];
      const itemB = updated[targetIndex];
      if (!itemA || !itemB) return prev;
      updated[index] = itemB;
      updated[targetIndex] = itemA;
      return { ...prev, sections: updated };
    });
    setExpandedIndex(targetIndex);
  };

  const handleDuplicateSection = (index: number) => {
    if (!formData) return;
    const original = formData.sections[index];
    if (!original) return;
    const duplicated: CookiePolicySectionItem = {
      ...original,
      id: `sec-${Date.now()}`,
      title: `${original.title} (Copy)`,
    };
    setFormData((prev) => {
      if (!prev) return prev;
      const updated = [...prev.sections];
      updated.splice(index + 1, 0, duplicated);
      return { ...prev, sections: updated };
    });
    setExpandedIndex(index + 1);
  };

  const handleInsertBulletExample = (index: number) => {
    if (!formData) return;
    const current = formData.sections[index];
    if (!current) return;
    const bulletTemplate = '\n• New Cookie Category: Describe the cookie purpose, persistence, and functionality.';
    handleUpdateSection(index, 'content', current.content + bulletTemplate);
  };

  if (loading || !formData) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[var(--color-slate)]">Loading Cookie Policy editor content...</p>
      </div>
    );
  }

  const filteredSections = formData.sections
    .map((sec, idx) => ({ ...sec, originalIndex: idx }))
    .filter((sec) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return sec.title.toLowerCase().includes(q) || sec.content.toLowerCase().includes(q);
    });

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[var(--color-ink)] via-[var(--color-charcoal)] to-[var(--color-ink)] text-[var(--color-white)] p-6 rounded-2xl shadow-xl border border-[var(--color-gold)]/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-[var(--color-gold)]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[var(--color-gold)] border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-[10px]">
                Pages Management
              </Badge>
              <Badge variant="outline" className="text-white/60 border-white/20 text-[10px]">
                Storefront Route: /cookies
              </Badge>
            </div>
            <h2 className="text-2xl font-serif font-bold tracking-tight text-[var(--color-cream)]">
              Cookie Policy Editor
            </h2>
            <p className="text-xs text-white/70 max-w-xl">
              Manage cookie disclosures, categories (Essential, Preference, Analytical), concierge enquiries, and privacy compliance across the digital atelier.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/cookies"
              target="_blank"
              className="text-xs px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center gap-1.5"
            >
              <span>View Live Storefront</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[var(--color-whisper)] gap-1">
        {[
          { key: 'sections', label: `Sections & Cookies (${formData.sections.length})`, icon: '📋' },
          { key: 'header', label: 'Header & Concierge Links', icon: '⚙️' },
          { key: 'seo', label: 'SEO & Metadata', icon: '🔍' },
          { key: 'preview', label: 'Storefront Preview', icon: '👁️' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={cn(
              'px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2',
              activeTab === tab.key
                ? 'border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/5'
                : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:border-[var(--color-whisper)]'
            )}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: Sections & Cookie Categories */}
      {activeTab === 'sections' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[var(--color-cream)]/30 p-3 rounded-xl border border-[var(--color-whisper)]">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search policy sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-8 pr-3 text-xs rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)]"
              />
              <svg className="w-3.5 h-3.5 absolute left-2.5 top-3 text-[var(--color-slate)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setExpandedIndex(expandedIndex === null ? 0 : null)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-slate)] hover:text-[var(--color-ink)]"
              >
                {expandedIndex === null ? 'Expand Current' : 'Collapse All'}
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddSection}
                className="text-xs border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10"
              >
                + Add Section
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredSections.map((sec) => {
              const originalIndex = sec.originalIndex;
              const isExpanded = expandedIndex === originalIndex;

              return (
                <div
                  key={sec.id || originalIndex}
                  className={cn(
                    'border rounded-xl transition-all overflow-hidden bg-[var(--color-white)]',
                    isExpanded
                      ? 'border-[var(--color-gold)]/50 shadow-sm ring-1 ring-[var(--color-gold)]/20'
                      : 'border-[var(--color-whisper)] hover:border-[var(--color-gold)]/30'
                  )}
                >
                  {/* Card Header Bar */}
                  <div
                    onClick={() => setExpandedIndex(isExpanded ? null : originalIndex)}
                    className="p-3.5 bg-gradient-to-r from-transparent via-[var(--color-cream)]/10 to-transparent flex items-center justify-between cursor-pointer select-none gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-[var(--color-gold)]/15 text-[var(--color-gold)] text-[11px] font-bold flex items-center justify-center shrink-0">
                        {originalIndex + 1}
                      </span>
                      <h3 className="font-semibold text-xs text-[var(--color-ink)] truncate">
                        {sec.title}
                      </h3>
                      {sec.content.includes('•') && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-gold)]/10 text-[var(--color-gold)] font-medium shrink-0">
                          Bullet List
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        title="Move Up"
                        disabled={originalIndex === 0}
                        onClick={() => handleMoveSection(originalIndex, 'up')}
                        className="w-7 h-7 flex items-center justify-center text-[var(--color-slate)] hover:text-[var(--color-ink)] disabled:opacity-25 hover:bg-[var(--color-cream)] rounded transition-colors text-xs"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        title="Move Down"
                        disabled={originalIndex === formData.sections.length - 1}
                        onClick={() => handleMoveSection(originalIndex, 'down')}
                        className="w-7 h-7 flex items-center justify-center text-[var(--color-slate)] hover:text-[var(--color-ink)] disabled:opacity-25 hover:bg-[var(--color-cream)] rounded transition-colors text-xs"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        title="Duplicate Section"
                        onClick={() => handleDuplicateSection(originalIndex)}
                        className="w-7 h-7 flex items-center justify-center text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-cream)] rounded transition-colors text-xs"
                      >
                        📋
                      </button>
                      <button
                        type="button"
                        title="Delete Section"
                        onClick={() => handleDeleteSection(originalIndex)}
                        className="w-7 h-7 flex items-center justify-center text-red-500 hover:bg-red-50 rounded transition-colors text-xs"
                      >
                        🗑️
                      </button>
                      <div className="w-[1px] h-4 bg-[var(--color-whisper)] mx-1" />
                      <span className="text-xs text-[var(--color-slate)]">
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {/* Card Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 border-t border-[var(--color-whisper)] space-y-4 bg-[var(--color-snow)]/40">
                      <AdminFormField
                        label="Section Title & Numbering"
                        value={sec.title}
                        onChange={(val) => handleUpdateSection(originalIndex, 'title', val)}
                        placeholder="e.g. 2. Categories of Cookies We Employ"
                        helperText="Displayed as the section heading on the storefront."
                      />

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold text-[var(--color-ink)]">
                            Section Body Content
                          </label>
                          <button
                            type="button"
                            onClick={() => handleInsertBulletExample(originalIndex)}
                            className="text-[11px] text-[var(--color-gold)] hover:underline font-medium flex items-center gap-1"
                          >
                            <span>+ Insert Cookie Bullet</span>
                          </button>
                        </div>
                        <textarea
                          rows={6}
                          value={sec.content}
                          onChange={(e) => handleUpdateSection(originalIndex, 'content', e.target.value)}
                          placeholder="Type section description here..."
                          className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] font-mono leading-relaxed"
                        />
                        <p className="text-[10px] text-[var(--color-slate)] flex items-center justify-between">
                          <span>
                            Tip: Lines starting with <code className="bg-black/5 px-1 py-0.5 rounded text-[var(--color-ink)]">•</code> or <code className="bg-black/5 px-1 py-0.5 rounded text-[var(--color-ink)]">-</code> will render as formatted bullet lists with bold category titles before colons.
                          </span>
                          <span>{sec.content.length} characters</span>
                        </p>
                      </div>

                      {/* Content Preview Box */}
                      <div className="p-3 bg-[var(--color-white)] rounded-lg border border-[var(--color-whisper)] text-xs text-[var(--color-slate)] space-y-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-gold)] block">
                          Preview Snippet
                        </span>
                        <h4 className="font-semibold text-xs text-[var(--color-ink)]">{sec.title}</h4>
                        {sec.content.split('\n').filter(Boolean).map((line, lIdx) => {
                          if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                            const clean = line.replace(/^[•\-]\s*/, '');
                            const colIdx = clean.indexOf(':');
                            return (
                              <div key={lIdx} className="flex items-start gap-2 pl-2">
                                <span className="text-[var(--color-gold)]">•</span>
                                <div>
                                  {colIdx !== -1 ? (
                                    <>
                                      <strong className="text-[var(--color-ink)]">{clean.substring(0, colIdx + 1)}</strong>
                                      <span>{clean.substring(colIdx + 1)}</span>
                                    </>
                                  ) : (
                                    <span>{clean}</span>
                                  )}
                                </div>
                              </div>
                            );
                          }
                          return (
                            <p key={lIdx} className="leading-relaxed">
                              {line}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-center">
            <Button
              variant="outline"
              onClick={handleAddSection}
              className="text-xs border-dashed border-2 border-[var(--color-gold)]/40 hover:border-[var(--color-gold)] text-[var(--color-ink)] w-full py-4 flex items-center justify-center gap-2"
            >
              <span>+ Add Another Policy Section</span>
            </Button>
          </div>
        </div>
      )}

      {/* TAB 2: Header & Concierge Links */}
      {activeTab === 'header' && (
        <div className="space-y-5 bg-[var(--color-white)] p-6 rounded-xl border border-[var(--color-whisper)] shadow-sm">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="font-serif font-bold text-sm text-[var(--color-ink)]">
              Storefront Header & Support Settings
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Configure the top branding overline, title heading, revision notice, and concierge contact destinations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField
              label="Overline Badge"
              value={formData.badge}
              onChange={(val) => setFormData((prev) => prev ? { ...prev, badge: val } : prev)}
              placeholder="e.g. Legal & Policy"
              helperText="Small uppercase gold badge above the main title."
            />

            <AdminFormField
              label="Page Main Headline"
              value={formData.title}
              onChange={(val) => setFormData((prev) => prev ? { ...prev, title: val } : prev)}
              placeholder="e.g. Cookie Policy"
              helperText="H1 header displayed prominently at the top of /cookies."
            />

            <AdminFormField
              label="Last Updated Notice"
              value={formData.lastUpdated}
              onChange={(val) => setFormData((prev) => prev ? { ...prev, lastUpdated: val } : prev)}
              placeholder="e.g. Last updated: January 2026"
              helperText="Timestamp notice shown beneath the title."
            />

            <AdminFormField
              label="Concierge Support Email"
              value={formData.conciergeEmail || ''}
              onChange={(val) => setFormData((prev) => prev ? { ...prev, conciergeEmail: val } : prev)}
              placeholder="concierge@angelikafashions.com"
              helperText="Any mention of this email in policy text will be automatically linked."
            />

            <AdminFormField
              label="Concierge / Contact Target Link"
              value={formData.contactLink || ''}
              onChange={(val) => setFormData((prev) => prev ? { ...prev, contactLink: val } : prev)}
              placeholder="/contact or mailto:concierge@angelikafashions.com"
              helperText="Internal route or mailto link when customer clicks the concierge contact address."
            />
          </div>
        </div>
      )}

      {/* TAB 3: SEO Settings */}
      {activeTab === 'seo' && (
        <div className="space-y-5 bg-[var(--color-white)] p-6 rounded-xl border border-[var(--color-whisper)] shadow-sm">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="font-serif font-bold text-sm text-[var(--color-ink)]">
              Search Engine Optimization (SEO)
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Control how the Cookie Policy appears in Google search results and browser tabs.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-[var(--color-ink)]">
                  Meta Title
                </label>
                <span className={cn(
                  'text-[10px]',
                  (formData.seo?.metaTitle?.length || 0) > 60 ? 'text-amber-600' : 'text-[var(--color-slate)]'
                )}>
                  {formData.seo?.metaTitle?.length || 0}/60 characters
                </span>
              </div>
              <input
                type="text"
                value={formData.seo?.metaTitle || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => prev ? { ...prev, seo: { ...prev.seo, metaTitle: val } } : prev);
                }}
                placeholder="Cookie Policy | Angelika Fashions"
                className="w-full h-10 text-xs px-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-[var(--color-ink)]">
                  Meta Description
                </label>
                <span className={cn(
                  'text-[10px]',
                  (formData.seo?.metaDescription?.length || 0) > 160 ? 'text-amber-600' : 'text-[var(--color-slate)]'
                )}>
                  {formData.seo?.metaDescription?.length || 0}/160 characters
                </span>
              </div>
              <textarea
                rows={3}
                value={formData.seo?.metaDescription || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => prev ? { ...prev, seo: { ...prev.seo, metaDescription: val } } : prev);
                }}
                placeholder="Understand how Angelika Fashions utilizes cookies..."
                className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] font-sans"
              />
            </div>

            {/* Google SERP Snippet Preview */}
            <div className="p-4 rounded-xl bg-[var(--color-cream)]/20 border border-[var(--color-whisper)] space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-slate)] block">
                Google Search Snippet Preview
              </span>
              <div className="text-xs text-blue-800 font-medium truncate hover:underline cursor-pointer">
                {formData.seo?.metaTitle || 'Cookie Policy | Angelika Fashions'}
              </div>
              <div className="text-[11px] text-emerald-800 truncate">
                https://angelikafashions.com/cookies
              </div>
              <div className="text-xs text-slate-600 line-clamp-2">
                {formData.seo?.metaDescription || 'Understand how Angelika Fashions utilizes cookies to provide an elevated browsing and bespoke shopping experience.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Live Document Preview */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[var(--color-slate)] px-1">
            <span>Storefront preview representing <code className="bg-black/5 px-1 rounded">/cookies</code>:</span>
            <span className="text-[var(--color-gold)] font-medium">● Real-time synced</span>
          </div>

          <div className="rounded-2xl border border-black/80 bg-[#0d0d0d] text-[#e5e5e5] p-8 sm:p-12 shadow-2xl space-y-8 font-sans">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-gold)]">
                {formData.badge || 'Legal & Policy'}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">
                {formData.title || 'Cookie Policy'}
              </h1>
              <p className="text-sm text-neutral-400 mt-2">
                {formData.lastUpdated || 'Last updated: January 2026'}
              </p>
            </div>

            <div className="space-y-6 text-neutral-300 text-sm leading-relaxed max-w-2xl">
              {formData.sections.map((section, idx) => {
                const lines = section.content.split('\n').filter(Boolean);
                const isBulletList = lines.every((line) => line.trim().startsWith('•') || line.trim().startsWith('-'));
                const hasConciergeEmail = formData.conciergeEmail && section.content.includes(formData.conciergeEmail);

                return (
                  <section key={section.id || idx} className="space-y-3">
                    <h2 className="font-serif text-xl font-semibold text-white">
                      {section.title}
                    </h2>

                    {isBulletList ? (
                      <ul className="list-disc pl-5 space-y-2">
                        {lines.map((line, lIdx) => {
                          const clean = line.replace(/^[•\-]\s*/, '').trim();
                          const colIdx = clean.indexOf(':');
                          return (
                            <li key={lIdx} className="text-neutral-300">
                              {colIdx !== -1 ? (
                                <>
                                  <strong className="text-white font-medium">{clean.substring(0, colIdx + 1)}</strong>
                                  <span>{clean.substring(colIdx + 1)}</span>
                                </>
                              ) : (
                                <span>{clean}</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : hasConciergeEmail ? (
                      <p className="whitespace-pre-line text-neutral-300">
                        {section.content.split(formData.conciergeEmail!).map((part, pIdx, arr) => (
                          <span key={pIdx}>
                            {part}
                            {pIdx < arr.length - 1 && (
                              <span className="text-[var(--color-gold)] underline font-medium cursor-pointer">
                                {formData.conciergeEmail}
                              </span>
                            )}
                          </span>
                        ))}
                      </p>
                    ) : (
                      <p className="whitespace-pre-line text-neutral-300">
                        {section.content}
                      </p>
                    )}
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-white)]/95 backdrop-blur-md border-t border-[var(--color-whisper)] p-4 shadow-lg flex items-center justify-between gap-4 max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Cookie Policy saved successfully!</span>
            </div>
          )}
          <span className="text-xs text-[var(--color-slate)] hidden sm:inline">
            {formData.sections.length} policy sections configured
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={saving}
              className="text-xs"
            >
              Cancel
            </Button>
          )}

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="text-xs bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/90 text-white min-w-[120px] font-semibold"
          >
            {saving ? (
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              'Save Policy'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

