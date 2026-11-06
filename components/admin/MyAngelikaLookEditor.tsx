'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type { MyAngelikaLookContent, MyAngelikaLookPost } from '@/lib/actions/site-content-types';

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

function SquareImageUploader({
  image,
  title,
  onChange,
}: {
  image: string;
  title?: string;
  onChange: (url: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'instagram');

      let res = await fetch('/api/admin/content/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const fallbackRes = await fetch('/api/admin/content/upload-icon', {
          method: 'POST',
          body: formData,
        });
        if (fallbackRes.ok) {
          res = fallbackRes;
        }
      }

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          onChange(data.url);
        }
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item && item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          handleUploadFile(file);
          break;
        }
      }
    }
  };

  return (
    <div className="space-y-2" onPaste={handlePaste}>
      <label className="block text-xs font-semibold text-[var(--color-ink)]">
        Photo (Square 1:1)
      </label>
      <div className="flex gap-3 items-start">
        <div className="relative w-28 h-28 aspect-square rounded-lg overflow-hidden border border-[var(--color-whisper)] bg-[var(--color-snow)] flex-shrink-0 group shadow-xs">
          {image ? (
            <img
              src={image}
              alt={title || 'Community post'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-slate)] p-2 text-center text-[10px]">
              <span>No image</span>
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-semibold">
              Uploading...
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleUploadFile(file);
            }}
            className={cn(
              'border border-dashed rounded-lg p-3 text-center transition-all cursor-pointer',
              dragOver
                ? 'border-[var(--color-gold)] bg-[var(--color-gold-light)]/20'
                : 'border-[var(--color-whisper)] hover:border-[var(--color-gold)] bg-[var(--color-snow)]/50'
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadFile(file);
              }}
            />
            <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-ink)]">
              <span>📷</span>
              <span className="font-semibold text-[var(--color-gold)]">Click to browse</span>
              <span className="text-[var(--color-slate)]">or drag & drop</span>
            </div>
            <p className="text-[10px] text-[var(--color-slate)] mt-0.5">
              Paste directly with <kbd className="px-1 py-0.5 rounded bg-[var(--color-white)] border text-[9px]">Ctrl+V</kbd>
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={image}
              placeholder="/images/insta-1.jpg or https://..."
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 h-8 text-[11px] px-2 rounded border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
            />
            {image && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="h-8 px-2 text-[11px] text-[var(--color-slate)] hover:text-red-500 rounded border border-[var(--color-whisper)] hover:border-red-200 transition-colors"
                title="Clear photo"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MyAngelikaLookEditor({
  onCancel,
  onSaved,
}: {
  onCancel?: () => void;
  onSaved?: () => void;
}) {
  const [formData, setFormData] = useState<MyAngelikaLookContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'header' | 'preview'>('posts');
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
          if (json.content && json.content['my-angelika-look']) {
            setFormData(json.content['my-angelika-look']);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load my-angelika-look content:', err);
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
          sectionId: 'my-angelika-look',
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
      console.error('Error saving my-angelika-look:', err);
      alert('Error saving content. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePost = (index: number, field: keyof MyAngelikaLookPost, value: any) => {
    if (!formData) return;
    setFormData((prev) => {
      if (!prev) return prev;
      const updated = [...prev.posts];
      const current = updated[index];
      if (!current) return prev;
      updated[index] = { ...current, [field]: value } as MyAngelikaLookPost;
      return { ...prev, posts: updated };
    });
  };

  const handleAddPost = () => {
    if (!formData) return;
    const newId = `ig-${Date.now().toString().slice(-4)}`;
    const newPost: MyAngelikaLookPost = {
      id: newId,
      image_url: '/images/insta-1.jpg',
      handle: '@angelikafashions',
      caption: 'Handcrafted luxury draped in timeless elegance.',
      productName: 'Handcrafted Festive Edit',
      productLink: '/shop',
      likes: 1200,
      isFeatured: true,
    };

    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        posts: [newPost, ...prev.posts],
      };
    });
    setExpandedIndex(0);
  };

  const handleDeletePost = (index: number) => {
    if (!formData) return;
    const item = formData.posts[index];
    const confirmDelete = window.confirm(
      `Are you sure you want to delete post #${index + 1} (${item?.handle || 'Untitled'})?`
    );
    if (!confirmDelete) return;

    setFormData((prev) => {
      if (!prev) return prev;
      const updated = prev.posts.filter((_, i) => i !== index);
      return { ...prev, posts: updated };
    });
  };

  const handleDuplicatePost = (index: number) => {
    if (!formData) return;
    const original = formData.posts[index];
    if (!original) return;
    const duplicate: MyAngelikaLookPost = {
      ...original,
      id: `ig-${Date.now().toString().slice(-4)}`,
      caption: original.caption ? `${original.caption} (Copy)` : 'Copy',
    };

    setFormData((prev) => {
      if (!prev) return prev;
      const updated = [...prev.posts];
      updated.splice(index + 1, 0, duplicate);
      return { ...prev, posts: updated };
    });
    setExpandedIndex(index + 1);
  };

  const handleMovePost = (index: number, direction: 'up' | 'down') => {
    if (!formData) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formData.posts.length) return;

    setFormData((prev) => {
      if (!prev) return prev;
      const updated = [...prev.posts];
      const current = updated[index];
      const target = updated[targetIndex];
      if (!current || !target) return prev;
      updated[index] = target;
      updated[targetIndex] = current;
      return { ...prev, posts: updated };
    });
    setExpandedIndex(targetIndex);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-[var(--color-slate)]">
        <div className="w-5 h-5 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin mr-3" />
        Loading #MyAngelikaLook Content...
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="p-8 text-center text-sm text-[var(--color-error)]">
        Failed to load content for #MyAngelikaLook. Please refresh or check server logs.
      </div>
    );
  }

  const postsList = formData.posts || [];
  const filteredPosts = postsList
    .map((post, originalIndex) => ({ post, originalIndex }))
    .filter(({ post }) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        post.handle?.toLowerCase().includes(q) ||
        post.caption?.toLowerCase().includes(q) ||
        post.productName?.toLowerCase().includes(q) ||
        post.productLink?.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-[var(--color-whisper)] bg-gradient-to-r from-[var(--color-white)] to-[var(--color-snow)] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-pink-100 text-pink-700 uppercase tracking-wider">
              Social Community Feed
            </span>
            <span className="text-xs text-[var(--color-slate)]">Homepage Section</span>
          </div>
          <h2 className="text-xl font-bold text-[var(--color-ink)]">
            #MyAngelikaLook Editor
          </h2>
          <p className="text-xs text-[var(--color-slate)] mt-0.5">
            Manage the community showcase on the homepage, featured Instagram photos, creator handles, and "Shop this look" product links.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/#MyAngelikaLook"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] hover:border-[var(--color-gold)] transition-colors shadow-2xs"
          >
            <span>View on Storefront</span>
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

      {/* Tabs Navigation */}
      <div className="flex border-b border-[var(--color-whisper)] bg-[var(--color-white)] rounded-t-xl px-2 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('posts')}
          className={cn(
            'px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2',
            activeTab === 'posts'
              ? 'border-[var(--color-gold)] text-[var(--color-gold)] font-bold'
              : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)]'
          )}
        >
          <span>Community Posts</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-[var(--color-gold-light)] text-[var(--color-gold)] font-bold">
            {postsList.length}
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
          <span>Header & Social CTA</span>
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
          <span>Live 2×4 Grid Preview</span>
        </button>
      </div>

      {/* TAB 1: COMMUNITY POSTS */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)]">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search posts by handle, product, or caption..."
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
              onClick={handleAddPost}
              className="text-xs font-semibold border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold-light)]/20 whitespace-nowrap"
            >
              + Add Community Look
            </Button>
          </div>

          {/* Posts List */}
          <div className="space-y-3">
            {filteredPosts.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[var(--color-whisper)] rounded-xl bg-[var(--color-snow)]/50">
                <p className="text-sm text-[var(--color-slate)]">No community posts found.</p>
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
              filteredPosts.map(({ post, originalIndex }) => {
                const isExpanded = expandedIndex === originalIndex;

                return (
                  <div
                    key={post.id || originalIndex}
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
                        {/* Number */}
                        <span className="w-6 h-6 rounded-full bg-[var(--color-snow)] border border-[var(--color-whisper)] text-[11px] font-bold text-[var(--color-slate)] flex items-center justify-center flex-shrink-0">
                          {originalIndex + 1}
                        </span>

                        {/* Thumbnail */}
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--color-snow)] border border-[var(--color-whisper)] flex-shrink-0 relative aspect-square">
                          {post.image_url ? (
                            <img
                              src={post.image_url}
                              alt={post.caption || 'Look'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-[var(--color-mist)]">
                              None
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-[var(--color-ink)] truncate">
                              {post.handle || '@angelikafashions'}
                            </span>
                            {post.productName && (
                              <span className="text-[10px] font-semibold text-[var(--color-gold)] bg-[var(--color-gold-light)]/40 px-2 py-0.5 rounded">
                                {post.productName}
                              </span>
                            )}
                            {post.isFeatured && (
                              <span className="text-[10px] font-bold bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded">
                                FEATURED
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[var(--color-slate)] truncate max-w-md mt-0.5">
                            {post.caption || 'No caption provided'}
                          </p>
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          disabled={originalIndex === 0}
                          onClick={() => handleMovePost(originalIndex, 'up')}
                          className="p-1 rounded hover:bg-[var(--color-snow)] text-[var(--color-slate)] disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move up"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          disabled={originalIndex === postsList.length - 1}
                          onClick={() => handleMovePost(originalIndex, 'down')}
                          className="p-1 rounded hover:bg-[var(--color-snow)] text-[var(--color-slate)] disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move down"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicatePost(originalIndex)}
                          className="p-1 rounded hover:bg-[var(--color-snow)] text-[var(--color-slate)]"
                          title="Duplicate item"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePost(originalIndex)}
                          className="p-1 rounded hover:bg-red-50 text-red-500"
                          title="Delete item"
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
                      <div className="p-4 sm:p-5 border-t border-[var(--color-whisper)] bg-[var(--color-snow)]/20">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                          {/* Image Uploader */}
                          <div className="lg:col-span-5">
                            <SquareImageUploader
                              image={post.image_url}
                              title={post.caption || post.handle}
                              onChange={(url) => handleUpdatePost(originalIndex, 'image_url', url)}
                            />
                          </div>

                          {/* Fields */}
                          <div className="lg:col-span-7 space-y-4">
                            {/* Row 1: Creator Handle & Product Name */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <AdminFormField
                                label="Instagram Handle / Creator"
                                value={post.handle}
                                onChange={(val) => handleUpdatePost(originalIndex, 'handle', val)}
                                placeholder="e.g. @ananya_couture"
                              />
                              <AdminFormField
                                label="Featured Product Name"
                                value={post.productName}
                                onChange={(val) => handleUpdatePost(originalIndex, 'productName', val)}
                                placeholder="e.g. Hand-Block Printed Kurti"
                              />
                            </div>

                            {/* Row 2: Product Link ("Shop this look") */}
                            <AdminFormField
                              label="Product / Shop Link"
                              value={post.productLink}
                              onChange={(val) => handleUpdatePost(originalIndex, 'productLink', val)}
                              placeholder="e.g. /shop/kurtis or /product/chanderi-anarkali-set"
                              helperText='Shoppers are directed here when clicking "Shop this look"'
                            />

                            {/* Row 3: Caption */}
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-[var(--color-ink)]">
                                Look Caption / Description
                              </label>
                              <textarea
                                rows={2}
                                value={post.caption || ''}
                                onChange={(e) => handleUpdatePost(originalIndex, 'caption', e.target.value)}
                                className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                                placeholder="Describe the look or client testimonial..."
                              />
                            </div>

                            {/* Row 4: Likes & Featured Toggle */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                              <AdminFormField
                                label="Likes / Engagement Count"
                                type="number"
                                value={post.likes}
                                onChange={(val) => handleUpdatePost(originalIndex, 'likes', Number(val))}
                                placeholder="1240"
                              />

                              <label className="flex items-center gap-2.5 cursor-pointer mt-4 sm:mt-0 p-2 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)]">
                                <input
                                  type="checkbox"
                                  checked={Boolean(post.isFeatured)}
                                  onChange={(e) => handleUpdatePost(originalIndex, 'isFeatured', e.target.checked)}
                                  className="w-4 h-4 rounded text-[var(--color-gold)] border-[var(--color-whisper)] focus:ring-[var(--color-gold)]"
                                />
                                <div>
                                  <span className="block text-xs font-semibold text-[var(--color-ink)]">Feature on Feed</span>
                                  <span className="block text-[10px] text-[var(--color-slate)]">Prioritize in social gallery</span>
                                </div>
                              </label>
                            </div>
                          </div>
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

      {/* TAB 2: HEADER & SOCIAL CTA SETTINGS */}
      {activeTab === 'header' && (
        <div className="p-6 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-white)] space-y-5">
          <div className="border-b border-[var(--color-whisper)] pb-3">
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Section Headline & Description</h3>
            <p className="text-xs text-[var(--color-slate)]">
              Configure the hashtag title, subtitle instructions, and Instagram follow button.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminFormField
              label="Hashtag Headline"
              value={formData.tag}
              onChange={(val) => setFormData((prev) => prev && { ...prev, tag: val, title: val })}
              placeholder="#MyAngelikaLook"
            />
            <AdminFormField
              label="Official Instagram Handle"
              value={formData.instagramHandle}
              onChange={(val) => setFormData((prev) => prev && { ...prev, instagramHandle: val })}
              placeholder="@angelikafashions"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[var(--color-ink)]">
              Subtitle Subtext
            </label>
            <textarea
              rows={3}
              value={formData.subtitle}
              onChange={(e) => setFormData((prev) => prev && { ...prev, subtitle: e.target.value })}
              className="w-full text-xs p-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
              placeholder="See how our community styles their Angelika favorites..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <AdminFormField
              label="Instagram Profile URL"
              value={formData.instagramUrl}
              onChange={(val) => setFormData((prev) => prev && { ...prev, instagramUrl: val })}
              placeholder="https://instagram.com/angelikafashions"
            />
            <AdminFormField
              label="Follow Button Text"
              value={formData.buttonText}
              onChange={(val) => setFormData((prev) => prev && { ...prev, buttonText: val })}
              placeholder="Follow us on Instagram"
            />
          </div>
        </div>
      )}

      {/* TAB 3: LIVE 2x4 GRID PREVIEW */}
      {activeTab === 'preview' && (
        <div className="p-6 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-white)] space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-bold text-[var(--color-gold)] uppercase tracking-wider block">
              Live Homepage Preview
            </span>
            <h3 className="text-3xl font-display font-medium text-[var(--color-ink)]">
              {formData.tag || '#MyAngelikaLook'}
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              {formData.subtitle}
            </p>
          </div>

          {/* 2x4 Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
            {postsList.slice(0, 8).map((post, i) => (
              <div
                key={post.id || i}
                className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)] shadow-xs"
              >
                <img
                  src={post.image_url || '/images/placeholder.jpg'}
                  alt={post.caption || 'Look'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex flex-col items-center justify-center p-3 text-center">
                  {post.handle && (
                    <span className="text-white text-xs font-semibold mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {post.handle}
                    </span>
                  )}
                  <span className="px-3 py-1.5 rounded-full bg-white text-[var(--color-ink)] text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md">
                    Shop this look
                  </span>
                  {post.productName && (
                    <span className="text-[10px] text-white/80 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {post.productName}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-whisper)] text-xs font-medium text-[var(--color-ink)] bg-[var(--color-white)]">
              <span>📷 {formData.buttonText || 'Follow us on Instagram'}</span>
            </div>
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
              #MyAngelikaLook updated successfully!
            </span>
          )}
          {!saveSuccess && (
            <span className="text-xs text-[var(--color-slate)]">
              {postsList.length} community posts • Live on homepage
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

