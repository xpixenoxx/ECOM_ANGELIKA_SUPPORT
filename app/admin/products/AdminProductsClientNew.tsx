'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  toggleProductActive,
  toggleProductFeatured,
  toggleProductVidyasPick,
  deleteProduct,
  bulkDeleteProducts,
  bulkUpdateProducts,
  bulkCreateProducts,
  generateBulkDemoProducts,
  duplicateProduct,
} from '@/lib/actions/admin-products';
import type { AdminProduct, AdminCategory, BulkProductInput } from '@/lib/actions/admin-products';
import { SHOP_COLORS } from '@/lib/actions/shop-types';
import {
  Search,
  Package,
  Star,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  Filter,
  Plus,
  AlertTriangle,
  ExternalLink,
  Heart,
  UploadCloud,
  Download,
  Copy,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  X,
  FileSpreadsheet,
  CheckSquare,
  Square,
} from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
  { key: 'featured', label: 'Featured' },
  { key: 'vidyas_pick', label: "Vidhya's Picks" },
  { key: 'low_stock', label: 'Low Stock' },
];

const PAGE_SIZE_OPTIONS = [12, 24, 48, 96, 500];

interface Props {
  initialProducts: AdminProduct[];
  categories: AdminCategory[];
}

export default function AdminProductsClientNew({ initialProducts, categories }: Props) {
  const [, startTransition] = useTransition();
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [pageSize, setPageSize] = useState(24);
  const [currentPage, setCurrentPage] = useState(1);

  // Quick Action Loading States
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  // Multi-Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Modal State for Bulk Import / Seeding
  const [showImportModal, setShowImportModal] = useState(false);
  const [importTab, setImportTab] = useState<'csv' | 'generator'>('generator');
  const [generatorCount, setGeneratorCount] = useState<number>(50);
  const [generatorCategory, setGeneratorCategory] = useState<string>('all');
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState<string>('');
  const [csvText, setCsvText] = useState('');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function showToast(text: string, type: 'success' | 'error' = 'success') {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  }

  // Filtered Products
  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (statusFilter === 'active' && !p.is_active) return false;
      if (statusFilter === 'inactive' && p.is_active) return false;
      if (statusFilter === 'featured' && !p.is_featured) return false;
      if (statusFilter === 'vidyas_pick' && !p.is_vidyas_pick) return false;
      if (statusFilter === 'low_stock' && p.total_inventory > 5) return false;
      if (categoryFilter !== 'all' && p.category_id !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSlug = p.slug.toLowerCase().includes(q);
        const matchesSku = (p.sku || '').toLowerCase().includes(q);
        const matchesCat = (p.category_name || '').toLowerCase().includes(q);
        const matchesTag = (p.tags || []).some((t) => t.toLowerCase().includes(q));
        const matchesFabric = (p.fabric || '').toLowerCase().includes(q);
        const matchesColor = (p.colors || []).some((c) => c.toLowerCase().includes(q));
        if (!matchesName && !matchesSlug && !matchesSku && !matchesCat && !matchesTag && !matchesFabric && !matchesColor) {
          return false;
        }
      }
      return true;
    });
  }, [products, statusFilter, categoryFilter, search]);

  // Pagination Calculations
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, validCurrentPage, pageSize]);

  // Toggle Publish / Active
  function handleToggleActive(id: string, current: boolean) {
    setTogglingId(id);
    const updated = !current;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: updated } : p))
    );
    startTransition(async () => {
      const res = await toggleProductActive(id, updated);
      setTogglingId(null);
      if (res?.error) {
        // Rollback
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_active: current } : p))
        );
        showToast(`Failed to update status: ${res.error}`, 'error');
      } else {
        showToast(updated ? 'Product published to store' : 'Product hidden from store');
      }
    });
  }

  // Toggle Featured
  function handleToggleFeatured(id: string, current: boolean) {
    const updated = !current;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_featured: updated } : p))
    );
    startTransition(async () => {
      const res = await toggleProductFeatured(id, updated);
      if (res?.error) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_featured: current } : p))
        );
        showToast(`Failed to update: ${res.error}`, 'error');
      } else {
        showToast(updated ? 'Product marked as Featured (appears first in category)' : 'Product removed from Featured');
      }
    });
  }

  // Toggle Vidhya's Pick
  function handleToggleVidyasPick(id: string, current: boolean) {
    const updated = !current;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_vidyas_pick: updated } : p))
    );
    startTransition(async () => {
      const res = await toggleProductVidyasPick(id, updated);
      if (res?.error) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_vidyas_pick: current } : p))
        );
        showToast(`Failed to update: ${res.error}`, 'error');
      } else {
        showToast(updated ? "Added to Vidhya's Picks collection" : "Removed from Vidhya's Picks");
      }
    });
  }

  // Delete Single Product
  function handleDelete(id: string) {
    const prod = products.find((p) => p.id === id);
    if (!confirm(`Delete "${prod?.name || 'this product'}" and its variants? This cannot be undone.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteProduct(id);
      if (res?.error) {
        showToast(`Failed to delete: ${res.error}`, 'error');
        setDeletingId(null);
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        setDeletingId(null);
        showToast('Product deleted successfully');
      }
    });
  }

  // Duplicate Single Product
  function handleDuplicate(id: string) {
    setDuplicatingId(id);
    startTransition(async () => {
      const res = await duplicateProduct(id);
      setDuplicatingId(null);
      if (res?.error || !res?.data) {
        showToast(`Failed to duplicate: ${res?.error || 'Unknown error'}`, 'error');
      } else {
        const p = res.data;
        const newProductItem: AdminProduct = {
          id: p.id,
          sku: p.sku,
          name: p.name,
          slug: p.slug,
          description: p.description,
          fabric: p.fabric || null,
          price: 3999,
          compare_at_price: null,
          category_id: p.category_id,
          category_name: categories.find((c) => c.id === p.category_id)?.name || 'Ethnic Wear',
          category_slug: null,
          is_active: p.is_active,
          is_featured: p.is_featured,
          is_vidyas_pick: p.is_vidyas_pick,
          images: ['/images/placeholder.jpg'],
          tags: p.tags,
          variant_count: 1,
          total_inventory: 20,
          created_at: p.created_at || new Date().toISOString(),
          updated_at: p.updated_at || new Date().toISOString(),
        };
        setProducts((prev) => [newProductItem, ...prev]);
        showToast(`Duplicated: "${newProductItem.name}"`);
      }
    });
  }

  // Multi-Select Handlers
  function toggleSelectProduct(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function handleSelectAllPage() {
    const pageIds = paginatedProducts.map((p) => p.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  }

  function handleSelectAllFiltered() {
    setSelectedIds(filtered.map((p) => p.id));
  }

  function handleDeselectAll() {
    setSelectedIds([]);
  }

  // Bulk Actions
  async function handleBulkPublish(publish: boolean) {
    if (selectedIds.length === 0) return;
    setBulkActionLoading(true);
    const res = await bulkUpdateProducts(selectedIds, { is_active: publish });
    setBulkActionLoading(false);
    if (res.error) {
      showToast(`Bulk update error: ${res.error}`, 'error');
    } else {
      setProducts((prev) =>
        prev.map((p) => (selectedIds.includes(p.id) ? { ...p, is_active: publish } : p))
      );
      showToast(`${selectedIds.length} products ${publish ? 'published' : 'unpublished'}`);
      setSelectedIds([]);
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected garments? This cannot be undone.`)) {
      return;
    }
    setBulkActionLoading(true);
    const res = await bulkDeleteProducts(selectedIds);
    setBulkActionLoading(false);
    if (res.error) {
      showToast(`Bulk delete error: ${res.error}`, 'error');
    } else {
      setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      showToast(`${selectedIds.length} garments deleted successfully`);
      setSelectedIds([]);
    }
  }

  // Export CSV
  function handleExportCSV() {
    const headers = [
      'ID',
      'Name',
      'SKU',
      'Category',
      'Fabric',
      'Price',
      'Compare At Price',
      'Stock',
      'Status',
      'Featured',
      "Vidhya's Pick",
      'URL Slug',
    ];
    const rows = filtered.map((p) => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.sku || ''}"`,
      `"${p.category_name || ''}"`,
      `"${(p.fabric || '').replace(/"/g, '""')}"`,
      p.price,
      p.compare_at_price || '',
      p.total_inventory,
      p.is_active ? 'Active' : 'Inactive',
      p.is_featured ? 'Yes' : 'No',
      p.is_vidyas_pick ? 'Yes' : 'No',
      `"${p.slug}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `angelika_products_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Catalog exported to CSV');
  }

  // Download Sample CSV Template
  function handleDownloadTemplate() {
    const sampleHeaders = 'name,category,price,compare_at_price,inventory,sizes,description,images,tags,is_featured,is_vidyas_pick';
    const sampleRows = [
      '"Royal Indigo Raw Silk Straight Suit","Salwars",8999,10499,35,"S;M;L;XL","Handwoven pure raw silk straight suit with zardozi embroidery.","/images/products/salwar-rawsilk-1.jpg;/images/products/salwar-rawsilk-2.jpg","raw-silk,luxury,festive",true,true',
      '"Crimson Red Banarasi Brocade Saree","Sarees",14999,18999,20,"Standard","Pure silk Banarasi saree adorned with authentic gold zari border.","/images/products/saree-banarasi-1.jpg;/images/products/saree-banarasi-2.jpg","banarasi,bridal,heritage",true,false',
      '"Lucknowi Hand Embroidered Kurti","Kurtis",3999,4799,40,"S;M;L;XL;XXL","Finely detailed shadow-work chikankari modal silk kurti.","/images/products/kurti-lucknowi-1.jpg;/images/products/kurti-lucknowi-2.jpg","chikankari,summer,casual",false,true',
      '"Emerald Green Velvet Bridal Lehenga","Lehengas",34999,42999,15,"M;L","Heavy embroidered velvet lehenga ensemble with sheer dupatta.","/images/products/lehenga-velvet-1.jpg;/images/products/lehenga-velvet-2.jpg","velvet,bridal,couture",true,false',
      '"Handcrafted Banarasi Silk Dupatta","Dupattas",4499,5499,50,"Free Size","Loom-woven silk dupatta featuring regal floral jaal motif.","/images/products/dupatta-banarasi-1.jpg;/images/products/dupatta-banarasi-2.jpg","dupatta,silk,festive",false,false',
    ];
    const content = [sampleHeaders, ...sampleRows].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'angelika_products_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Sample CSV template downloaded');
  }

  // Handle CSV Import
  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text || '');
    };
    reader.readAsText(file);
  }

  async function processCsvImport() {
    if (!csvText.trim()) {
      showToast('Please upload or paste CSV text first', 'error');
      return;
    }
    setImportLoading(true);
    setImportProgress('Parsing CSV rows...');

    try {
      const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        throw new Error('CSV must contain a header and at least 1 product row');
      }

      // Simple CSV parser
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"' && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur.trim());
        return result;
      };

      const headerLine = lines[0] || '';
      const headers = parseCSVLine(headerLine).map((h) => h.toLowerCase());
      const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('title'));
      const catIdx = headers.findIndex((h) => h.includes('cat'));
      const fabIdx = headers.findIndex((h) => h.includes('fab') || h.includes('material'));
      const priceIdx = headers.findIndex((h) => h === 'price' || h.includes('price'));
      const compIdx = headers.findIndex((h) => h.includes('compare') || h.includes('mrp'));
      const invIdx = headers.findIndex((h) => h.includes('stock') || h.includes('inventory') || h.includes('qty'));
      const descIdx = headers.findIndex((h) => h.includes('desc'));
      const imgIdx = headers.findIndex((h) => h.includes('image') || h.includes('photo'));
      const tagIdx = headers.findIndex((h) => h.includes('tag'));
      const sizeIdx = headers.findIndex((h) => h.includes('size'));
      const featIdx = headers.findIndex((h) => h.includes('feat'));
      const vidyaIdx = headers.findIndex((h) => h.includes('vidya'));

      if (nameIdx === -1) {
        throw new Error('Could not find "name" column in CSV header');
      }

      const productsToCreate: BulkProductInput[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        const row = parseCSVLine(line);
        const name = row[nameIdx];
        if (!name) continue;

        const getCol = (idx: number) => (idx !== -1 && idx < row.length ? row[idx] || '' : '');

        const catName = getCol(catIdx) || 'Kurtis';
        const fabVal = getCol(fabIdx);
        const priceStr = getCol(priceIdx);
        const price = priceStr ? Number(priceStr.replace(/[^0-9.]/g, '')) || 2999 : 2999;
        const compStr = getCol(compIdx);
        const compare = compStr ? Number(compStr.replace(/[^0-9.]/g, '')) || undefined : undefined;
        const invStr = getCol(invIdx);
        const inventory = invStr ? Number(invStr.replace(/[^0-9]/g, '')) || 20 : 20;
        const desc = getCol(descIdx);
        const imgStr = getCol(imgIdx);
        const rawImgs = imgStr ? imgStr.split(';').map((s) => s.trim()) : [];
        const tagStr = getCol(tagIdx);
        const rawTags = tagStr ? tagStr.split(',').map((s) => s.trim()) : [];
        const sizeStr = getCol(sizeIdx);
        const rawSizes = sizeStr ? sizeStr.split(';').map((s) => s.trim()) : ['S', 'M', 'L', 'XL'];
        const featStr = getCol(featIdx);
        const isFeatured = featStr ? featStr.toLowerCase() === 'true' || featStr === '1' : false;
        const vidyaStr = getCol(vidyaIdx);
        const isVidya = vidyaStr ? vidyaStr.toLowerCase() === 'true' || vidyaStr === '1' : false;

        productsToCreate.push({
          name,
          category_name: catName,
          fabric: fabVal || undefined,
          price,
          compare_at_price: compare,
          inventory_quantity: inventory,
          description: desc,
          images: rawImgs.length > 0 ? rawImgs : ['/images/placeholder.jpg'],
          tags: rawTags,
          sizes: rawSizes,
          is_featured: isFeatured,
          is_vidyas_pick: isVidya,
        });
      }

      setImportProgress(`Inserting ${productsToCreate.length} products into Supabase...`);
      const res = await bulkCreateProducts(productsToCreate);

      if (!res.success) {
        throw new Error(res.error || 'Failed to import products');
      }

      showToast(`Successfully imported ${res.count} garments!`);
      setShowImportModal(false);
      setCsvText('');
      window.location.reload();
    } catch (err: any) {
      showToast(err.message || 'Error importing CSV', 'error');
    } finally {
      setImportLoading(false);
      setImportProgress('');
    }
  }

  // 1-Click Generator Execution (Add 50, 100, 250, 500+ Garments)
  async function handleRunGenerator() {
    setImportLoading(true);
    setImportProgress(`Generating & batch-inserting ${generatorCount} luxury garments...`);

    try {
      const catParam = generatorCategory === 'all' ? undefined : generatorCategory;
      const res = await generateBulkDemoProducts(generatorCount, catParam);

      if (!res.success) {
        throw new Error(res.error || 'Failed to generate products');
      }

      showToast(`Successfully created ${res.count} luxury garments!`);
      setShowImportModal(false);
      window.location.reload();
    } catch (err: any) {
      showToast(err.message || 'Generation failed', 'error');
    } finally {
      setImportLoading(false);
      setImportProgress('');
    }
  }

  // Statistics
  const stats = useMemo(() => {
    return {
      total: products.length,
      active: products.filter((p) => p.is_active).length,
      featured: products.filter((p) => p.is_featured).length,
      vidyasPicks: products.filter((p) => p.is_vidyas_pick).length,
      lowStock: products.filter((p) => p.total_inventory <= 5).length,
    };
  }, [products]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 backdrop-blur-md ${
              toastMessage.type === 'error'
                ? 'bg-red-50/95 border-red-200 text-red-800'
                : 'bg-green-50/95 border-green-200 text-green-800'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            ) : (
              <Check className="w-4 h-4 text-green-600" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium text-[var(--color-ink,#111111)]" style={{ fontFamily: 'var(--font-display)' }}>
              Products Catalog
            </h1>
            <AdminSectionInfo
              title="Products Management"
              purpose="Manage all luxury ethnic garments. Controls product descriptions, pricing, sizes, active inventory, and promotional badges across the entire e-commerce store."
              storefrontImpact="Changes update the /shop catalog instantly, along with specific category pages, product detail pages (/product/[slug]), homepage featured carousels, and search."
              targets={[
                { name: 'Shop All Catalog', path: '/shop', description: 'Product grid cards with price & badges' },
                { name: 'New Arrivals', path: '/new-arrivals', description: 'Latest published garments' },
                { name: "Vidhya's Picks", path: '/vidhyas-picks', description: 'Curated designer collection' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            {products.length} garments in Supabase database
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[var(--color-whisper,#E5E5E5)] bg-white text-xs font-medium text-[var(--color-ink,#111111)] hover:bg-[var(--color-snow,#F9F9F9)] transition-colors shadow-sm"
            title="Export catalog as CSV"
          >
            <Download className="w-3.5 h-3.5 text-[var(--color-slate,#666666)]" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--color-gold,#C9A84C)]/40 bg-[var(--color-gold,#C9A84C)]/10 text-[var(--color-gold,#C9A84C)] text-xs font-semibold hover:bg-[var(--color-gold,#C9A84C)]/20 transition-colors shadow-sm"
            title="Import CSV or bulk add 500+ products"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bulk Add / 500+ Seeder</span>
          </button>

          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-[var(--color-gold,#C9A84C)] text-white rounded-xl px-5 py-2.5 font-medium text-sm hover:opacity-90 shadow-sm transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Total Products', value: stats.total, icon: Package, color: 'blue' },
          { label: 'Active on Store', value: stats.active, icon: Eye, color: 'green' },
          { label: 'Featured on Home', value: stats.featured, icon: Star, color: 'yellow' },
          { label: "Vidhya's Picks", value: stats.vidyasPicks, icon: Heart, color: 'red' },
          { label: 'Low Stock Alerts', value: stats.lowStock, icon: AlertTriangle, color: 'amber' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-[var(--color-slate,#666666)]">{label}</p>
              <div className={`w-7 h-7 rounded-lg bg-${color}-100 flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 text-${color}-600`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--color-ink,#111111)]">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] shadow-sm p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-mist,#999999)]" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by title, slug, or SKU..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-[var(--color-whisper,#E5E5E5)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)] bg-white text-[var(--color-ink,#111111)]"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.product_count || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Status Pills & Items Per Page */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setStatusFilter(f.key);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === f.key
                    ? 'bg-[var(--color-gold,#C9A84C)] text-white shadow-sm'
                    : 'bg-[var(--color-snow,#F9F9F9)] text-[var(--color-slate,#666666)] hover:bg-[var(--color-whisper,#E5E5E5)]'
                }`}
              >
                {f.label}
                {f.key === 'low_stock' && stats.lowStock > 0 && (
                  <span className="ml-1.5 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.2">
                    {stats.lowStock}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Page size & Multi-select all */}
          <div className="flex items-center gap-3 text-xs text-[var(--color-slate,#666666)]">
            <button
              type="button"
              onClick={handleSelectAllPage}
              className="flex items-center gap-1.5 text-xs text-[var(--color-slate,#666666)] hover:text-[var(--color-ink,#111111)]"
            >
              {paginatedProducts.length > 0 && paginatedProducts.every((p) => selectedIds.includes(p.id)) ? (
                <CheckSquare className="w-4 h-4 text-[var(--color-gold,#C9A84C)]" />
              ) : (
                <Square className="w-4 h-4 text-[var(--color-mist,#999999)]" />
              )}
              <span>Select Page</span>
            </button>

            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="text-[var(--color-gold,#C9A84C)] hover:underline font-medium"
              >
                Select all {filtered.length}
              </button>
            )}

            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-[var(--color-whisper,#E5E5E5)] rounded-lg px-2 py-1 text-xs bg-white text-[var(--color-ink,#111111)]"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size === 500 ? '500 (All)' : size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="sticky bottom-4 z-40 bg-[var(--color-ink,#111111)] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-4 flex-wrap border border-white/10"
          >
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm bg-[var(--color-gold,#C9A84C)] text-white px-2.5 py-0.5 rounded-full text-xs">
                {selectedIds.length}
              </span>
              <span className="text-xs text-gray-300">garments selected</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleBulkPublish(true)}
                disabled={bulkActionLoading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600/30 text-green-300 hover:bg-green-600/40 text-xs font-medium transition-colors border border-green-500/30"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Publish</span>
              </button>

              <button
                type="button"
                onClick={() => handleBulkPublish(false)}
                disabled={bulkActionLoading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 text-xs font-medium transition-colors"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Unpublish</span>
              </button>

              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600/30 text-red-300 hover:bg-red-600/40 text-xs font-medium transition-colors border border-red-500/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <button
                type="button"
                onClick={handleDeselectAll}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white"
                title="Deselect All"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {paginatedProducts.map((product) => {
            const isSelected = selectedIds.includes(product.id);
            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all ${
                  isSelected
                    ? 'border-[var(--color-gold,#C9A84C)] ring-2 ring-[var(--color-gold,#C9A84C)]/20'
                    : 'border-[var(--color-whisper,#E5E5E5)]'
                }`}
              >
                <div>
                  {/* Product Image */}
                  <div className="relative h-48 bg-[var(--color-snow,#F9F9F9)] overflow-hidden">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-[var(--color-mist,#999999)]" />
                      </div>
                    )}

                    {/* Checkbox for Multi-Select */}
                    <button
                      type="button"
                      onClick={() => toggleSelectProduct(product.id)}
                      className={`absolute top-2 left-2 p-1 rounded-lg backdrop-blur-md transition-opacity ${
                        isSelected
                          ? 'bg-[var(--color-gold,#C9A84C)] text-white opacity-100'
                          : 'bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60'
                      }`}
                      title={isSelected ? 'Deselect' : 'Select'}
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>

                    {/* Badges */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                      {!product.is_active && (
                        <span className="bg-gray-900/80 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                          Hidden
                        </span>
                      )}
                      {product.is_featured && (
                        <span className="bg-[var(--color-gold,#C9A84C)] text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm">
                          Featured
                        </span>
                      )}
                      {product.is_vidyas_pick && (
                        <span className="bg-red-600 text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm">
                          Vidhya&apos;s Pick
                        </span>
                      )}
                      {product.total_inventory <= 5 && (
                        <span className="bg-amber-600 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                          Low Stock ({product.total_inventory})
                        </span>
                      )}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm backdrop-blur-sm ${
                        product.return_window_days === 0
                          ? 'bg-rose-600 text-white'
                          : 'bg-white/90 text-amber-900 border border-amber-200'
                      }`}>
                        {product.return_window_days === 0 ? 'No Return' : `${product.return_window_days || 7}d Return`}
                      </span>
                    </div>

                    {/* Live link shortcut */}
                    <a
                      href={`/product/${product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-[var(--color-gold,#C9A84C)] transition-colors opacity-0 group-hover:opacity-100"
                      title="View live product page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <p className="font-medium text-sm text-[var(--color-ink,#111111)] line-clamp-1" title={product.name}>
                      {product.name}
                    </p>
                    <div className="flex items-center justify-between mt-0.5 gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="text-xs text-[var(--color-slate,#666666)] font-medium truncate">
                          {product.category_name}
                        </p>
                        {product.fabric && (
                          <span
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--color-gold-light,#FAF6ED)] text-[var(--color-gold,#C9A84C)] border border-[var(--color-gold,#C9A84C)]/30 truncate"
                            title={`Fabric: ${product.fabric}`}
                          >
                            {product.fabric}
                          </span>
                        )}
                        {product.colors && product.colors.length > 0 && (
                          <div className="flex items-center -space-x-1 shrink-0 ml-0.5" title={`Colors: ${product.colors.join(', ')}`}>
                            {product.colors.slice(0, 4).map((colVal) => {
                              const foundCol = SHOP_COLORS.find((c) => c.value === colVal);
                              const bg = foundCol?.color || '#C9A84C';
                              return (
                                <span
                                  key={colVal}
                                  className="w-2.5 h-2.5 rounded-full border border-white shadow-xs inline-block"
                                  style={bg.includes('gradient') ? { background: bg } : { backgroundColor: bg }}
                                />
                              );
                            })}
                            {product.colors.length > 4 && (
                              <span className="text-[9px] text-[var(--color-slate,#666666)] pl-1">
                                +{product.colors.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {product.sku && (
                        <span className="text-[10px] text-[var(--color-mist,#999999)] font-mono shrink-0">
                          {product.sku}
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between mt-2.5">
                      <div>
                        <span className="font-bold text-sm text-[var(--color-ink,#111111)]">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </span>
                        {product.compare_at_price && (
                          <span className="text-xs text-[var(--color-mist,#999999)] line-through ml-2">
                            ₹{Number(product.compare_at_price).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[var(--color-slate,#666666)] bg-[var(--color-snow,#F9F9F9)] px-2 py-0.5 rounded-md border border-[var(--color-whisper,#E5E5E5)]">
                        {product.total_inventory} in stock
                      </span>
                    </div>

                    {/* Per-size inventory units breakdown */}
                    {product.variants && product.variants.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-[var(--color-whisper,#E5E5E5)]">
                        <div className="flex items-center justify-between text-[10px] text-[var(--color-slate,#666666)] mb-1">
                          <span className="font-semibold uppercase tracking-wider">Units per Size:</span>
                          <span className="font-mono text-[var(--color-ink,#111111)] font-medium">
                            {product.variants.length} {product.variants.length === 1 ? 'size' : 'sizes'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          {product.variants.map((v) => {
                            const isOut = v.inventory_quantity === 0;
                            const isCrit = v.inventory_quantity > 0 && v.inventory_quantity <= 3;
                            return (
                              <span
                                key={v.id || v.size}
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                                  isOut
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : isCrit
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-[var(--color-snow,#F9F9F9)] text-[var(--color-ink,#111111)] border-[var(--color-whisper,#E5E5E5)]'
                                }`}
                                title={`${v.size}: ${v.inventory_quantity} units available`}
                              >
                                <span className="font-bold">{v.size}:</span>
                                <span>{v.inventory_quantity}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons (Matches Image 2 exactly) */}
                <div className="p-3 border-t border-[var(--color-whisper,#E5E5E5)] bg-[var(--color-snow,#F9F9F9)]/50 flex items-center gap-1.5">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-[var(--color-ink,#111111)] hover:text-[var(--color-gold,#C9A84C)] hover:bg-white rounded-lg transition-colors border border-[var(--color-whisper,#E5E5E5)]"
                    title="Edit garment details, price & photos"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </Link>

                  {/* Eye: Toggle Active / Inactive */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(product.id, product.is_active)}
                    disabled={togglingId === product.id}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      product.is_active
                        ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                        : 'border-gray-200 bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    title={product.is_active ? 'Published (click to hide)' : 'Hidden (click to publish)'}
                  >
                    {product.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  {/* Star: Toggle Featured */}
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(product.id, product.is_featured)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      product.is_featured
                        ? 'border-amber-300 bg-amber-50 text-amber-600 shadow-sm'
                        : 'border-[var(--color-whisper,#E5E5E5)] text-[var(--color-mist,#999999)] hover:text-amber-500 hover:border-amber-200'
                    }`}
                    title={product.is_featured ? 'Featured (appears first in category) - Click to unfeature' : 'Feature Product (appear first in category)'}
                  >
                    <Star className={`w-3.5 h-3.5 ${product.is_featured ? 'fill-amber-400 text-amber-500' : ''}`} />
                  </button>

                  {/* Heart: Toggle Vidhya's Pick */}
                  <button
                    type="button"
                    onClick={() => handleToggleVidyasPick(product.id, product.is_vidyas_pick)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      product.is_vidyas_pick
                        ? 'border-red-200 bg-red-50 text-red-600'
                        : 'border-[var(--color-whisper,#E5E5E5)] text-[var(--color-mist,#999999)] hover:text-red-600'
                    }`}
                    title={product.is_vidyas_pick ? "In Vidhya's Picks" : "Add to Vidhya's Picks"}
                  >
                    <Heart className="w-3.5 h-3.5" />
                  </button>

                  {/* Duplicate shortcut */}
                  <button
                    type="button"
                    onClick={() => handleDuplicate(product.id)}
                    disabled={duplicatingId === product.id}
                    className="p-1.5 rounded-lg border border-[var(--color-whisper,#E5E5E5)] text-[var(--color-mist,#999999)] hover:text-[var(--color-gold,#C9A84C)] hover:bg-amber-50 transition-colors"
                    title="Duplicate product"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Trash: Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                    className="p-1.5 rounded-lg border border-[var(--color-whisper,#E5E5E5)] text-[var(--color-mist,#999999)] hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="py-20 text-center text-[var(--color-mist,#999999)] bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)]">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium text-[var(--color-ink,#111111)]">No products found</p>
          <p className="text-xs text-[var(--color-slate,#666666)] mt-1">Try adjusting your filters, search keywords, or add new products.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-slate,#666666)]">
          <div>
            Showing <span className="font-semibold text-[var(--color-ink,#111111)]">{(validCurrentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-[var(--color-ink,#111111)]">
              {Math.min(validCurrentPage * pageSize, totalItems)}
            </span>{' '}
            of <span className="font-semibold text-[var(--color-ink,#111111)]">{totalItems}</span> garments
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validCurrentPage === 1}
              className="p-2 rounded-xl border border-[var(--color-whisper,#E5E5E5)] hover:bg-[var(--color-snow,#F9F9F9)] disabled:opacity-40 transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page number buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && validCurrentPage > 3) {
                  pageNum = validCurrentPage - 2 + i;
                  if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                }
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-medium text-xs transition-colors ${
                      validCurrentPage === pageNum
                        ? 'bg-[var(--color-gold,#C9A84C)] text-white shadow-sm'
                        : 'border border-[var(--color-whisper,#E5E5E5)] hover:bg-[var(--color-snow,#F9F9F9)] text-[var(--color-ink,#111111)]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage === totalPages}
              className="p-2 rounded-xl border border-[var(--color-whisper,#E5E5E5)] hover:bg-[var(--color-snow,#F9F9F9)] disabled:opacity-40 transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bulk Add / 500+ Seeder Modal */}
      <AnimatePresence>
        {showImportModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-[var(--color-whisper,#E5E5E5)] shadow-2xl max-w-2xl w-full p-6 sm:p-7 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-whisper,#E5E5E5)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--color-ink,#111111)]">
                      Bulk Add / 500+ Products
                    </h2>
                    <p className="text-xs text-[var(--color-slate,#666666)]">
                      Import from CSV or 1-click generate up to 500+ handcrafted garments
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  disabled={importLoading}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[var(--color-whisper,#E5E5E5)] gap-4">
                <button
                  type="button"
                  onClick={() => setImportTab('generator')}
                  className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                    importTab === 'generator'
                      ? 'border-[var(--color-gold,#C9A84C)] text-[var(--color-gold,#C9A84C)]'
                      : 'border-transparent text-[var(--color-slate,#666666)] hover:text-[var(--color-ink,#111111)]'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  1-Click Catalog Seeder (50 - 500 Items)
                </button>
                <button
                  type="button"
                  onClick={() => setImportTab('csv')}
                  className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                    importTab === 'csv'
                      ? 'border-[var(--color-gold,#C9A84C)] text-[var(--color-gold,#C9A84C)]'
                      : 'border-transparent text-[var(--color-slate,#666666)] hover:text-[var(--color-ink,#111111)]'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  CSV / File Import
                </button>
              </div>

              {/* Tab 1: 1-Click Generator */}
              {importTab === 'generator' && (
                <div className="space-y-4">
                  <div className="bg-[var(--color-snow,#F9F9F9)] rounded-2xl p-4 border border-[var(--color-whisper,#E5E5E5)] space-y-2">
                    <p className="text-xs font-semibold text-[var(--color-ink,#111111)]">
                      How does the 1-Click Catalog Seeder work?
                    </p>
                    <p className="text-xs text-[var(--color-slate,#666666)] leading-relaxed">
                      Automatically generates and inserts authentic Indian ethnic garments into your Supabase database.
                      Includes genuine Banarasi sarees, Chikankari kurtis, Kanjivaram silks, bridal lehengas, raw silk suits, and zari dupattas complete with SKUs, standard sizing (S, M, L, XL, XXL), realistic INR pricing, inventory quantities, and curated product photography.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-2">
                      Select Quantity to Generate &amp; Add:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[50, 100, 250, 500].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setGeneratorCount(count)}
                          className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                            generatorCount === count
                              ? 'bg-[var(--color-gold,#C9A84C)] text-white border-[var(--color-gold,#C9A84C)] shadow-sm'
                              : 'bg-white border-[var(--color-whisper,#E5E5E5)] text-[var(--color-ink,#111111)] hover:border-[var(--color-gold,#C9A84C)]/50'
                          }`}
                        >
                          +{count} Garments
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
                      Target Category:
                    </label>
                    <select
                      value={generatorCategory}
                      onChange={(e) => setGeneratorCategory(e.target.value)}
                      className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2.5 text-xs bg-white text-[var(--color-ink,#111111)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
                    >
                      <option value="all">Balanced across All Categories (Sarees, Lehengas, Kurtis, Salwars, Dupattas)</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          Only {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {importLoading && (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent" />
                      <span>{importProgress}</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowImportModal(false)}
                      disabled={importLoading}
                      className="px-4 py-2.5 rounded-xl border border-[var(--color-whisper,#E5E5E5)] text-xs font-medium text-[var(--color-slate,#666666)] hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleRunGenerator}
                      disabled={importLoading}
                      className="px-6 py-2.5 bg-[var(--color-gold,#C9A84C)] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Generate &amp; Add {generatorCount} Products</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: CSV Import */}
              {importTab === 'csv' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[var(--color-slate,#666666)]">
                      Upload a CSV file containing your product catalog.
                    </p>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="text-xs font-medium text-[var(--color-gold,#C9A84C)] hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Sample Template
                    </button>
                  </div>

                  {/* Drag & drop file area */}
                  <div className="border-2 border-dashed border-[var(--color-whisper,#E5E5E5)] hover:border-[var(--color-gold,#C9A84C)] rounded-2xl p-6 text-center bg-[var(--color-snow,#F9F9F9)] transition-colors">
                    <UploadCloud className="w-10 h-10 mx-auto text-[var(--color-gold,#C9A84C)] mb-2" />
                    <p className="text-xs font-semibold text-[var(--color-ink,#111111)]">Choose CSV File</p>
                    <p className="text-[11px] text-[var(--color-mist,#999999)] mt-0.5">Supports 500+ rows</p>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleCsvUpload}
                      className="mt-3 block mx-auto text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-[var(--color-gold,#C9A84C)] file:text-white hover:file:opacity-90"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
                      Or Paste Raw CSV Data:
                    </label>
                    <textarea
                      rows={5}
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                      placeholder="name,category,price,compare_at_price,inventory,sizes,description,images&#10;Royal Silk Suit,Salwars,8999,10499,25,S;M;L,Luxurious silk suit,/images/products/salwar-rawsilk-1.jpg"
                      className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
                    />
                  </div>

                  {importLoading && (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent" />
                      <span>{importProgress}</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowImportModal(false)}
                      disabled={importLoading}
                      className="px-4 py-2.5 rounded-xl border border-[var(--color-whisper,#E5E5E5)] text-xs font-medium text-[var(--color-slate,#666666)] hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={processCsvImport}
                      disabled={importLoading || !csvText.trim()}
                      className="px-6 py-2.5 bg-[var(--color-gold,#C9A84C)] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Import Products</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
