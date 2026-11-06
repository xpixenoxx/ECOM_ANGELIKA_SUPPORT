'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type { PrivacyPolicyPageContent, PrivacyPolicySectionItem } from '@/lib/actions/site-content-types';

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

export function PrivacyPolicyPageEditor({
  onCancel,
  onSaved,
}: {
  onCancel?: () => void;
  onSaved?: () => void;
}) {
  const [formData, setFormData] = useState<PrivacyPolicyPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'clauses' | 'header' | 'seo' | 'preview'>('clauses');
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
          if (json.content && json.content['privacy-policy-page']) {
            setFormData(json.content['privacy-policy-page']);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load privacy-policy-page content:', err);
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
          sectionId: 'privacy-policy-page',
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
      console.error('Error saving privacy-policy-page:', err);
      alert('Error saving content. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateClause = (index: number, field: keyof PrivacyPolicySectionItem, value: string) => {
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

  const handleAddClause = () => {
    if (!formData) return;
    const nextNum = (formData.sections?.length || 0) + 1;
    const newClause: PrivacyPolicySectionItem = {
      id: `sec-${Date.now().toString().slice(-4)}`,
      title: `${nextNum}. New Policy Clause`,
      content: 'Enter the details of this policy clause here...',
    };

    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: [...prev.sections, newClause],
      };
    });
    setExpandedIndex(formData.sections.length);
  };

  const handleDeleteClause = (index: number) => {
    if (!formData) return;
    const clause = formData.sections[index];
    const confirmDelete = window.confirm(
      `Are you sure you want to remove clause #${index + 1} ("${clause?.title || 'Untitled'}")?`
    );
    if (!confirmDelete) return;

    setFormData((prev) => {
      if (!prev) return prev;
      const updated = prev.sections.filter((_, i) => i !== index);
      return { ...prev, sections: updated };
    });
  };

  const handleDuplicateClause = (index: number) => {
    if (!formData) return;
    const original = formData.sections[index];
    if (!original) return;
    const duplicate: PrivacyPolicySectionItem = {
      ...original,
      id: `sec-${Date.now().toString().slice(-4)}`,
      title: `${original.title} (Copy)`,
    };

    setFormData((prev) => {
      if (!prev) return prev;
      const updated = [...prev.sections];
      updated.splice(index + 1, 0, duplicate);
      return { ...prev, sections: updated };
    });
    setExpandedIndex(index + 1);
  };

  const handleMoveClause = (index: number, direction: 'up' | 'down') => {
    if (!formData) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formData.sections.length) return;

    setFormData((prev) => {
      if (!prev) return prev;
      const updated = [...prev.sections];
      const current = updated[index];
      const target = updated[targetIndex];
      if (!current || !target) return prev;
      updated[index] = target;
      updated[targetIndex] = current;
      return { ...prev, sections: updated };
    });
    setExpandedIndex(targetIndex);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-[var(--color-slate)]">
        <div className="w-5 h-5 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin mr-3" />
        Loading Privacy Policy Content...
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="p-8 text-center text-sm text-[var(--color-error)]">
        Failed to load content for Privacy Policy. Please refresh or check server logs.
      </div>
    );
  }

  const sectionsList = formData.sections || [];
  const filteredClauses = sectionsList
    .map((clause, originalIndex) => ({ clause, originalIndex }))
    .filter(({ clause }) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        clause.title?.toLowerCase().includes(q) ||
        clause.content?.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-[var(--color-whisper)] bg-gradient-to-r from-[var(--color-white)] to-[var(--color-snow)] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)] uppercase tracking-wider">
              Legal & Policy
            </span>
            <span className="text-xs text-[var(--color-slate)]">/privacy</span>
          </div>
          <h2 className="text-xl font-bold text-[var(--color-ink)]">
            Privacy Policy Page Editor
          </h2>
          <p className="text-xs text-[var(--color-slate)] mt-0.5">
            Manage your legal clauses, customer data collection terms, payment security disclosures, and contact details.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/privacy"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] hover:border-[var(--color-gold)] transition-colors shadow-2xs"
          >
            <span>Preview Live</span>
            <svg className="w-3.5 h-3.5 text-[var(--color-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
          <Button
            variant="gold"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="shadow-sm font-semibold"
          >
            {saving ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Save All Changes'
            )}
          </Button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-[var(--color-whisper)] bg-[var(--color-white)] rounded-t-xl px-2 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('clauses')}
          className={cn(
            'px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2',
            activeTab === 'clauses'
              ? 'border-[var(--color-gold)] text-[var(--color-gold)] font-bold'
              : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)]'
          )}
        >
          <span>Policy Clauses</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-[var(--color-gold-light)] text-[var(--color-gold)] font-bold">
            {sectionsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('header')}
          className={cn(
            'px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2',
            activeTab === 'header'
              ? 'border-[var(--color-gold)] text-[var(--color-gold)] font-bold'
              : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)]'
          )}
        >
          <span>Header & Contact</span>
        </button>

        <button
          onClick={() => setActiveTab('seo')}
          className={cn(
            'px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2',
            activeTab === 'seo'
              ? 'border-[var(--color-gold)] text-[var(--color-gold)] font-bold'
              : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)]'
          )}
        >
          <span>SEO & Metadata</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={cn(
            'px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2',
            activeTab === 'preview'
              ? 'border-[var(--color-gold)] text-[var(--color-gold)] font-bold'
              : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)]'
          )}
        >
          <span>Live Document Preview</span>
        </button>
      </div>

      {/* TAB 1: POLICY CLAUSES */}
      {activeTab === 'clauses' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)]">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search policy clauses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-8 pr-3 text-xs rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
              />
              <svg className="w-4 h-4 text-[var(--color-slate)] absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleAddClause}
              className="text-xs font-semibold border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold-light)]/20 whitespace-nowrap"
            >
              + Add Policy Clause
            </Button>
          </div>

          {/* Clauses List */}
          <div className="space-y-3">
            {filteredClauses.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[var(--color-whisper)] rounded-xl bg-[var(--color-snow)]/50">
                <p className="text-sm text-[var(--color-slate)]">No policy clauses match your search.</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs text-[var(--color-gold)]"
                >
                  Clear search
                </Button>
              </div>
            ) : (
              filteredClauses.map(({ clause, originalIndex }) => {
                const isExpanded = expandedIndex === originalIndex;

                return (
                  <div
                    key={clause.id || originalIndex}
                    className={cn(
                      'rounded-xl border transition-all duration-200 overflow-hidden bg-[var(--color-white)]',
                      isExpanded
                        ? 'border-[var(--color-gold)] shadow-md ring-1 ring-[var(--color-gold)]/20'
                        : 'border-[var(--color-whisper)] hover:border-[var(--color-gold)]/50 shadow-2xs'
                    )}
                  >
                    {/* Collapsed Bar / Card Header */}
                    <div
                      onClick={() => setExpandedIndex(isExpanded ? null : originalIndex)}
                      className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none bg-[var(--color-white)] hover:bg-[var(--color-snow)]/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-[var(--color-snow)] border border-[var(--color-whisper)] text-[11px] font-bold text-[var(--color-slate)] flex items-center justify-center flex-shrink-0">
                          {originalIndex + 1}
                        </span>

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[var(--color-ink)] truncate">
                            {clause.title || 'Untitled Clause'}
                          </h4>
                          <p className="text-[11px] text-[var(--color-slate)] truncate max-w-xl mt-0.5">
                            {clause.content || 'No content provided'}
                          </p>
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          disabled={originalIndex === 0}
                          onClick={() => handleMoveClause(originalIndex, 'up')}
                          className="p-1 rounded hover:bg-[var(--color-snow)] text-[var(--color-slate)] disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move up"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          disabled={originalIndex === sectionsList.length - 1}
                          onClick={() => handleMoveClause(originalIndex, 'down')}
                          className="p-1 rounded hover:bg-[var(--color-snow)] text-[var(--color-slate)] disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move down"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateClause(originalIndex)}
                          className="p-1 rounded hover:bg-[var(--color-snow)] text-[var(--color-slate)]"
                          title="Duplicate clause"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClause(originalIndex)}
                          className="p-1 rounded hover:bg-red-50 text-red-500"
                          title="Delete clause"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedIndex(isExpanded ? null : originalIndex)}
                          className="p-1 rounded hover:bg-[var(--color-snow)] text-[var(--color-slate)] ml-1"
                        >
                          <svg
                            className={cn('w-4 h-4 transition-transform duration-200', isExpanded && 'rotate-180')}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Expanded Edit Form */}
                    {isExpanded && (
                      <div className="p-5 border-t border-[var(--color-whisper)] bg-[var(--color-snow)]/20 space-y-4">
                        <AdminFormField
                          label="Clause Title / Heading"
                          value={clause.title}
                          onChange={(val) => handleUpdateClause(originalIndex, 'title', val)}
                          placeholder="e.g. 1. Information We Collect"
                        />

                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-[var(--color-ink)]">
                            Clause Legal Content
                          </label>
                          <textarea
                            rows={4}
                            value={clause.content}
                            onChange={(e) => handleUpdateClause(originalIndex, 'content', e.target.value)}
                            className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] leading-relaxed"
                            placeholder="Enter the full policy terms for this clause..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: HEADER & CONTACT */}
      {activeTab === 'header' && (
        <div className="p-6 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-white)] space-y-5">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Page Header & Last Updated</h3>
            <p className="text-xs text-[var(--color-slate)]">
              Manage the top title, overline category tag, and last revision date shown to visitors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminFormField
              label="Overline Tag"
              value={formData.badge}
              onChange={(val) => setFormData((prev) => prev && { ...prev, badge: val })}
              placeholder="e.g. Legal & Policy"
            />
            <AdminFormField
              label="Document Title"
              value={formData.title}
              onChange={(val) => setFormData((prev) => prev && { ...prev, title: val })}
              placeholder="e.g. Privacy Policy"
            />
          </div>

          <AdminFormField
            label="Last Revision Date Notice"
            value={formData.lastUpdated}
            onChange={(val) => setFormData((prev) => prev && { ...prev, lastUpdated: val })}
            placeholder="e.g. Last updated: January 2026"
            helperText="Appears directly under the page headline"
          />

          <div className="border-t border-[var(--color-whisper)] pt-4">
            <h4 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider mb-3">
              Support & Contact Links
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminFormField
                label="Support Contact Email"
                value={formData.contactEmail}
                onChange={(val) => setFormData((prev) => prev && { ...prev, contactEmail: val })}
                placeholder="support@angelikafashions.com"
              />
              <AdminFormField
                label="Contact Page Route"
                value={formData.contactLink}
                onChange={(val) => setFormData((prev) => prev && { ...prev, contactLink: val })}
                placeholder="/contact"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SEO & METADATA */}
      {activeTab === 'seo' && (
        <div className="p-6 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-white)] space-y-5">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Search Engine Optimization (SEO)</h3>
            <p className="text-xs text-[var(--color-slate)]">
              Manage the meta title and description for search engines like Google.
            </p>
          </div>

          <div className="space-y-4">
            <AdminFormField
              label="Meta Title Tag"
              value={formData.seo?.metaTitle}
              onChange={(val) =>
                setFormData((prev) => prev && { ...prev, seo: { ...prev.seo, metaTitle: val } })
              }
              placeholder="Privacy Policy | Angelika Fashions"
              helperText={`${formData.seo?.metaTitle?.length || 0}/60 characters recommended`}
            />

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--color-ink)]">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={formData.seo?.metaDescription}
                onChange={(e) =>
                  setFormData((prev) => prev && { ...prev, seo: { ...prev.seo, metaDescription: e.target.value } })
                }
                className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                placeholder="Learn how Angelika Fashions protects your privacy..."
              />
              <p className="text-[10px] text-[var(--color-slate)]">
                {formData.seo?.metaDescription?.length || 0}/160 characters recommended
              </p>
            </div>

            {/* Google SERP Preview Card */}
            <div className="mt-4 p-4 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)]/30 space-y-1">
              <span className="text-[10px] font-bold text-[var(--color-slate)] uppercase tracking-wider block mb-2">
                Google Search Result Preview
              </span>
              <div className="text-[11px] text-emerald-800">https://angelika.in/privacy</div>
              <div className="text-base text-blue-700 font-medium hover:underline cursor-pointer">
                {formData.seo?.metaTitle || 'Privacy Policy | Angelika Fashions'}
              </div>
              <p className="text-xs text-[var(--color-slate)] line-clamp-2">
                {formData.seo?.metaDescription || 'Learn how Angelika Fashions protects your privacy and personal information.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE DOCUMENT PREVIEW */}
      {activeTab === 'preview' && (
        <div className="p-8 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-white)] space-y-8 max-w-3xl mx-auto shadow-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-gold)]">
              {formData.badge || 'Legal & Policy'}
            </span>
            <h1 className="font-display text-3xl font-bold text-[var(--color-ink)] mt-1">
              {formData.title || 'Privacy Policy'}
            </h1>
            <p className="text-sm text-[var(--color-slate)] mt-2">
              {formData.lastUpdated || 'Last updated: January 2026'}
            </p>
          </div>

          <div className="space-y-6 text-[var(--color-slate)] leading-relaxed text-sm">
            {sectionsList.map((sec, idx) => (
              <section key={sec.id || idx} className="space-y-2">
                <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">
                  {sec.title}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--color-slate)] whitespace-pre-line">
                  {sec.content}
                </p>
              </section>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Bottom Actions Bar */}
      <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 p-4 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-white)]/95 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fadeIn">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Privacy Policy updated successfully!
            </span>
          )}
          {!saveSuccess && (
            <span className="text-xs text-[var(--color-slate)]">
              {sectionsList.length} clauses • Live on /privacy
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="text-xs font-semibold"
            >
              Close Editor
            </Button>
          )}
          <Button
            variant="gold"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="shadow-sm font-semibold"
          >
            {saving ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Saving Changes...
              </span>
            ) : (
              'Save All Changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

