'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { updateVariantInventory } from '@/lib/actions/admin-products';
import { Package, AlertTriangle, Check, Edit2, X } from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';

interface Variant {
  id: string;
  sku: string | null;
  inventory_quantity: number;
  size: string | null;
  color: string | null;
  products: { id: string; name: string; images: string[] | null } | null;
}

interface Props {
  initialVariants: Variant[];
}

const STOCK_COLOR = (qty: number) => {
  if (qty === 0) return 'text-red-600 bg-red-50';
  if (qty <= 3) return 'text-red-500 bg-red-50';
  if (qty <= 7) return 'text-amber-600 bg-amber-50';
  return 'text-green-600 bg-green-50';
};

export default function InventoryClient({ initialVariants }: Props) {
  const [, startTransition] = useTransition();
  const [variants, setVariants] = useState(initialVariants);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  function startEdit(v: Variant) {
    setEditingId(v.id);
    setEditValue(String(v.inventory_quantity));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue('');
  }

  function handleSave(id: string) {
    const qty = Number(editValue);
    setSavingId(id);
    setVariants(prev => prev.map(v => v.id === id ? { ...v, inventory_quantity: qty } : v));
    startTransition(async () => {
      await updateVariantInventory(id, qty);
      setSavingId(null);
      setSavedId(id);
      setEditingId(null);
      setTimeout(() => setSavedId(null), 2000);
    });
  }

  const outOfStock = variants.filter(v => v.inventory_quantity === 0).length;
  const critical = variants.filter(v => v.inventory_quantity > 0 && v.inventory_quantity <= 3).length;
  const low = variants.filter(v => v.inventory_quantity > 3 && v.inventory_quantity <= 10).length;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
              Inventory &amp; Low Stock Alerts
            </h1>
            <AdminSectionInfo
              title="Inventory Replenishment Alerts"
              purpose="Monitor real-time physical warehouse stock across all garment sizes. Inline-edit stock quantities to immediately unblock or restrict customer purchases."
              storefrontImpact="Prevents out-of-stock orders by disabling size buttons on Product Detail Pages and showing 'Only X Left' urgency counters."
              targets={[
                { name: 'Shop All Catalog', path: '/shop', description: 'Real-time in-stock filtering' },
                { name: 'Product Detail Page', path: '/shop', description: 'Size selection stock availability' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate)] mt-0.5">Variants with 10 or fewer units in Supabase</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Out of Stock', value: outOfStock, color: 'red' },
          { label: 'Critical (≤3)', value: critical, color: 'amber' },
          { label: 'Low (4–10)', value: low, color: 'yellow' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-${color}-50 rounded-2xl border border-${color}-200 p-5`}>
            <p className={`text-sm text-${color}-700`}>{label}</p>
            <p className={`text-3xl font-bold text-${color}-800 mt-1`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-whisper)] bg-[var(--color-snow)]">
                {['Product', 'SKU', 'Variant', 'Stock', 'Action'].map(h => (
                  <th key={h} className="text-left py-3 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-whisper)]">
              {variants.map(v => (
                <tr key={v.id} className="hover:bg-[var(--color-snow)] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {v.products?.images?.[0] ? (
                        <img src={v.products.images[0]} alt={v.products.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[var(--color-snow)] flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-[var(--color-mist)]" />
                        </div>
                      )}
                      <span className="font-medium text-[var(--color-ink)] truncate max-w-[160px]">
                        {v.products?.name ?? 'Unknown Product'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs text-[var(--color-slate)] bg-[var(--color-snow)] px-2 py-1 rounded border border-[var(--color-whisper)]">
                      {v.sku ?? '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[var(--color-slate)] text-xs">
                    {[v.size, v.color].filter(Boolean).join(' · ') || '—'}
                  </td>
                  <td className="py-3 px-4">
                    {editingId === v.id ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        min={0}
                        className="w-20 border border-[var(--color-gold)] rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30"
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') handleSave(v.id); if (e.key === 'Escape') cancelEdit(); }}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`font-bold px-2.5 py-1 rounded-full text-xs ${STOCK_COLOR(v.inventory_quantity)}`}>
                          {v.inventory_quantity === 0 ? 'OUT' : v.inventory_quantity}
                        </span>
                        {savedId === v.id && <Check className="w-3.5 h-3.5 text-green-500" />}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingId === v.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSave(v.id)}
                          disabled={savingId === v.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-gold)] text-white rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50"
                        >
                          <Check className="w-3 h-3" /> Save
                        </button>
                        <button onClick={cancelEdit} className="p-1.5 rounded-lg hover:bg-[var(--color-whisper)] text-[var(--color-slate)]">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--color-slate)] hover:text-[var(--color-gold)] hover:bg-[var(--color-snow)] rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3 h-3" /> Update
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {variants.length === 0 && (
            <div className="py-16 text-center text-[var(--color-mist)]">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>All products have healthy stock levels 🎉</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
