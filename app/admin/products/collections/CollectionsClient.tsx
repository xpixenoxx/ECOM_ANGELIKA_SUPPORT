'use client';

import React, { useState, useTransition, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  Upload,
  X,
  Save,
  Check,
  AlertTriangle,
  Sliders,
} from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import {
  AdminImageInputWithUpload,
  uploadAdminImageWithFallback,
} from '@/components/admin/AdminImageUploadControl';
import {
  toggleCollectionActive,
  deleteCollection,
  updateCollectionDetails,
} from '@/lib/actions/admin-products';
import type { AdminCollection } from '@/lib/actions/admin-products';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Props {
  initialCollections: AdminCollection[];
}

export default function CollectionsClient({ initialCollections }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [collections, setCollections] = useState(initialCollections);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingCardId, setUploadingCardId] = useState<string | null>(null);
  const quickFileInputRef = useRef<HTMLInputElement | null>(null);
  const quickUploadTargetIdRef = useRef<string | null>(null);

  // Quick Edit Modal State
  const [editingLook, setEditingLook] = useState<AdminCollection | null>(null);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editAlt, setEditAlt] = useState('');
  const [editOrder, setEditOrder] = useState<number>(0);
  const [editActive, setEditActive] = useState<boolean>(true);
  const [savingEdit, setSavingEdit] = useState(false);

  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function showToast(text: string, type: 'success' | 'error' = 'success') {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  }

  useEffect(() => {
    setCollections(initialCollections);
  }, [initialCollections]);

  const filtered = collections.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleToggle(id: string, current: boolean) {
    setCollections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: !current } : c))
    );
    startTransition(async () => {
      const res = await toggleCollectionActive(id, !current);
      if (res?.error) {
        setCollections((prev) =>
          prev.map((c) => (c.id === id ? { ...c, is_active: current } : c))
        );
        showToast(`Failed to update visibility: ${res.error}`, 'error');
      } else {
        showToast(!current ? 'Look published to Homepage' : 'Look moved to Draft');
        router.refresh();
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete collection "${name}"? This removes the look and its hotspots.`)) return;

    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteCollection(id);
      if (res.error) {
        showToast(`Error deleting collection: ${res.error}`, 'error');
      } else {
        setCollections((prev) => prev.filter((c) => c.id !== id));
        showToast(`Deleted "${name}"`);
        router.refresh();
      }
      setDeletingId(null);
    });
  }

  function openQuickEdit(look: AdminCollection) {
    setEditingLook(look);
    setEditName(look.name || '');
    setEditImage(look.lifestyle_image_url || '');
    setEditAlt(look.lifestyle_image_alt || '');
    setEditOrder(Number(look.display_order) || 0);
    setEditActive(look.is_active);
  }

  async function handleSaveQuickEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingLook || !editName.trim() || !editImage.trim()) {
      showToast('Look name and image are required', 'error');
      return;
    }

    setSavingEdit(true);
    try {
      const res = await updateCollectionDetails(editingLook.id, {
        name: editName.trim(),
        lifestyle_image_url: editImage.trim(),
        lifestyle_image_alt: editAlt.trim() || null,
        display_order: Number(editOrder) || 0,
        is_active: editActive,
      });

      if (!res.success || !res.data) {
        showToast(res.error || 'Failed to update look', 'error');
        return;
      }

      setCollections((prev) =>
        prev.map((c) => (c.id === editingLook.id ? res.data! : c))
      );
      setEditingLook(null);
      showToast('Collection look updated on storefront!');
      router.refresh();
    } catch (err: any) {
      showToast(err?.message || 'Error updating collection', 'error');
    } finally {
      setSavingEdit(false);
    }
  }

  function triggerCardPhotoUpload(lookId: string) {
    quickUploadTargetIdRef.current = lookId;
    quickFileInputRef.current?.click();
  }

  async function handleCardFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const targetId = quickUploadTargetIdRef.current;
    if (e.target) e.target.value = '';
    if (!file || !targetId) return;

    setUploadingCardId(targetId);
    try {
      const uploaded = await uploadAdminImageWithFallback(file, `look-${targetId}`);
      if (!uploaded.success || !uploaded.url) {
        showToast(uploaded.error || 'Failed to upload image', 'error');
        return;
      }

      const saved = await updateCollectionDetails(targetId, {
        lifestyle_image_url: uploaded.url,
      });
      if (!saved.success || !saved.data) {
        showToast(saved.error || 'Failed to save uploaded photo', 'error');
        return;
      }

      setCollections((prev) =>
        prev.map((c) => (c.id === targetId ? saved.data! : c))
      );
      showToast('Photo uploaded from device and updated!');
      router.refresh();
    } catch (err: any) {
      showToast(err?.message || 'Upload error', 'error');
    } finally {
      setUploadingCardId(null);
      quickUploadTargetIdRef.current = null;
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <input
        ref={quickFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCardFileSelected}
      />

      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 ${
              toastMsg.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-green-50 border-green-200 text-green-800'
            }`}
          >
            {toastMsg.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            ) : (
              <Check className="w-4 h-4 text-green-600" />
            )}
            <span>{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium text-[var(--color-ink,#111111)]" style={{ fontFamily: 'var(--font-display)' }}>
              Collections &amp; Looks
            </h1>
            <AdminSectionInfo
              title="Shop The Look Collections"
              purpose="Curate high-fashion styled ensembles that showcase multiple matching ethnic pieces (Kurtis, dupattas, jewelry) together in a single lifestyle shoot."
              storefrontImpact="Powers the interactive 'Shop The Look' hotspot widget on the Homepage, where customers click interactive tags on models to add entire matching sets to cart."
              targets={[
                { name: 'Homepage Lookbook', path: '/', description: 'Interactive Shop-The-Look widget with tagged product hotspots' },
                { name: 'Shop Catalog', path: '/shop', description: 'Curated seasonal collection filters' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            {collections.length} editorial looks registered in Supabase
          </p>
        </div>

        <Link
          href="/admin/looks/new"
          className="flex items-center gap-2 bg-[var(--color-gold,#C9A84C)] text-white rounded-xl px-5 py-2.5 font-medium text-sm hover:opacity-90 shadow-sm transition-opacity self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> New Look / Collection
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-mist,#999999)]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search collections..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-[var(--color-whisper,#E5E5E5)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filtered.map((look) => (
            <motion.div
              key={look.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="relative h-56 bg-[var(--color-snow,#F9F9F9)] overflow-hidden">
                  {look.lifestyle_image_url ? (
                    <img
                      src={look.lifestyle_image_url}
                      alt={look.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-mist,#999999)]">
                      <ShoppingBag className="w-12 h-12 opacity-30" />
                    </div>
                  )}

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        look.is_active
                          ? 'bg-green-600 text-white shadow-sm'
                          : 'bg-gray-800/80 text-white'
                      }`}
                    >
                      {look.is_active ? 'Live on Home' : 'Draft'}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[var(--color-gold,#C9A84C)]" />
                    <span>{look.hotspots_count || 0} product hotspots</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-medium text-[var(--color-ink,#111111)]" style={{ fontFamily: 'var(--font-display)' }}>
                    {look.name}
                  </h3>
                  <p className="text-xs text-[var(--color-slate,#666666)] mt-1">
                    Display Order #{look.display_order} · Added {new Date(look.created_at || '').toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-[var(--color-whisper,#E5E5E5)] bg-[var(--color-snow,#F9F9F9)]/50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggle(look.id, look.is_active)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    look.is_active
                      ? 'text-gray-700 hover:bg-gray-200'
                      : 'text-green-700 bg-green-50 hover:bg-green-100'
                  }`}
                >
                  {look.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{look.is_active ? 'Unpublish' : 'Publish'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => triggerCardPhotoUpload(look.id)}
                    disabled={uploadingCardId === look.id}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink,#111111)] bg-white border border-[var(--color-whisper,#E5E5E5)] hover:border-[var(--color-gold,#C9A84C)] transition-colors disabled:opacity-50"
                    title="Upload photo from local device"
                  >
                    <Upload className="w-3.5 h-3.5 text-[var(--color-gold,#C9A84C)]" />
                    <span>{uploadingCardId === look.id ? 'Uploading...' : 'Photo'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openQuickEdit(look)}
                    className="p-2 rounded-lg text-[var(--color-slate,#666666)] hover:text-[var(--color-gold,#C9A84C)] hover:bg-white transition-colors"
                    title="Quick edit look details & photo"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <Link
                    href={`/admin/looks/${look.id}/edit`}
                    className="p-2 rounded-lg text-[var(--color-slate,#666666)] hover:text-[var(--color-gold,#C9A84C)] hover:bg-white transition-colors"
                    title="Configure interactive hotspots"
                  >
                    <Sliders className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(look.id, look.name)}
                    disabled={deletingId === look.id}
                    className="p-2 rounded-lg text-[var(--color-slate,#666666)] hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Delete look"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center text-[var(--color-mist,#999999)] bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)]">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium text-[var(--color-ink,#111111)]">No collections found</p>
          <Link
            href="/admin/looks/new"
            className="inline-block mt-4 text-xs font-medium text-[var(--color-gold,#C9A84C)] hover:underline"
          >
            + Create New Collection Look
          </Link>
        </div>
      )}

      {/* Quick Edit & Local Upload Modal */}
      <AnimatePresence>
        {editingLook && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-[var(--color-ink,#111111)]" style={{ fontFamily: 'var(--font-display)' }}>
                  Edit Collection &amp; Look
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingLook(null)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveQuickEdit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Look Name *</label>
                  <input
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g., Festive Elegance"
                    className="w-full mt-1 px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
                  />
                </div>

                <div>
                  <AdminImageInputWithUpload
                    label="Look / Collection Photo *"
                    value={editImage}
                    onChange={setEditImage}
                    placeholder="/images/uploads/... or https://..."
                    target={`look-${editingLook.id}`}
                    helperText="Upload directly from your local device or paste an image URL"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Alt Text</label>
                    <input
                      value={editAlt}
                      onChange={(e) => setEditAlt(e.target.value)}
                      placeholder="Image alt description"
                      className="w-full mt-1 px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Display Order</label>
                    <input
                      type="number"
                      min={0}
                      value={editOrder}
                      onChange={(e) => setEditOrder(Number(e.target.value) || 0)}
                      className="w-full mt-1 px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                    className="rounded text-[var(--color-gold,#C9A84C)]"
                  />
                  <span className="text-sm text-gray-700">Live on Storefront Homepage</span>
                </label>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--color-whisper,#E5E5E5)]">
                  <Link
                    href={`/admin/looks/${editingLook.id}/edit`}
                    className="text-xs font-medium text-[var(--color-gold,#C9A84C)] hover:underline"
                  >
                    Open Hotspot Pin Editor →
                  </Link>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingLook(null)}
                      className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingEdit}
                      className="flex items-center gap-2 px-5 py-2 bg-[var(--color-gold,#C9A84C)] text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {savingEdit ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
