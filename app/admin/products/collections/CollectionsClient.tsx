'use client';

import React, { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Sparkles,
  Layers,
  MapPin,
} from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import {
  getAdminCollections,
  toggleCollectionActive,
  deleteCollection,
} from '@/lib/actions/admin-products';
import type { AdminCollection } from '@/lib/actions/admin-products';
import Link from 'next/link';

interface Props {
  initialCollections: AdminCollection[];
}

export default function CollectionsClient({ initialCollections }: Props) {
  const [, startTransition] = useTransition();
  const [collections, setCollections] = useState(initialCollections);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = collections.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleToggle(id: string, current: boolean) {
    setCollections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: !current } : c))
    );
    startTransition(async () => {
      await toggleCollectionActive(id, !current);
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete collection "${name}"? This removes the look and its hotspots.`)) return;

    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteCollection(id);
      if (res.error) {
        alert(`Error deleting collection: ${res.error}`);
      } else {
        setCollections((prev) => prev.filter((c) => c.id !== id));
      }
      setDeletingId(null);
    });
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
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
                  <Link
                    href={`/admin/looks/${look.id}/edit`}
                    className="p-2 rounded-lg text-[var(--color-slate,#666666)] hover:text-[var(--color-gold,#C9A84C)] hover:bg-white transition-colors"
                    title="Edit look and configure hotspots"
                  >
                    <Edit2 className="w-4 h-4" />
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
    </motion.div>
  );
}
