'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { cn } from '@/lib/utils/cn';
import { createProduct, updateProduct, deleteProduct, duplicateProduct, bulkUpdateProducts, bulkDeleteProducts } from '@/lib/actions/admin-products';
import type { AdminProduct, ProductFilters } from '@/lib/actions/admin-products';

const categories = ['All', 'Sarees', 'Lehengas', 'Kurtis', 'Salwars', 'Dupattas', 'Gowns', 'Co-ords'];
const statuses = ['All', 'Active', 'Draft', 'Low Stock', 'Out of Stock'];

interface AdminProductsClientProps {
  initialProducts: AdminProduct[];
  initialTotalCount: number;
  initialTotalPages: number;
  initialPage: number;
  initialFilters: ProductFilters;
}

export default function AdminProductsClient({
  initialProducts,
  initialTotalCount,
  initialTotalPages,
  initialPage,
  initialFilters,
}: AdminProductsClientProps) {
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [page, setPage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || '');
  const [activeCategory, setActiveCategory] = useState(initialFilters.category || 'All');
  const [activeStatus, setActiveStatus] = useState(initialFilters.status || 'All');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'price-low' | 'price-high' | 'stock' | 'oldest'>(initialFilters.sortBy || 'newest');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = initialFilters.pageSize || 10;

  const fetchProducts = useCallback(async (newFilters?: Partial<ProductFilters>, newPage?: number) => {
    setIsLoading(true);
    try {
      // In a real app, this would call an API route or server action
      // For now, we'll simulate by calling the server action pattern
      // This would need an API route to work properly with client-side filtering
      console.log('Fetching products with filters:', { ...initialFilters, ...newFilters, page: newPage || page });
    } finally {
      setIsLoading(false);
    }
  }, [initialFilters, page]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setActiveCategory(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setActiveStatus(value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as 'newest' | 'name' | 'price-low' | 'price-high' | 'stock' | 'oldest');
    setPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (id: string, checked: boolean) => {
    setSelectedProducts(prev => checked ? [...prev, id] : prev.filter(p => p !== id));
  };

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (selectedProducts.length === 0) return;

    try {
      if (action === 'delete') {
        const result = await bulkDeleteProducts(selectedProducts);
        if (result.success) {
          setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
          setSelectedProducts([]);
          setTotalCount(prev => prev - selectedProducts.length);
        } else {
          alert(result.error || 'Failed to delete products');
        }
      } else {
        const status = action === 'publish' ? 'active' : 'draft';
        const result = await bulkUpdateProducts(selectedProducts, { status: status as 'active' | 'draft' });
        if (result.success) {
          setProducts(prev => prev.map(p =>
            selectedProducts.includes(p.id) ? { ...p, status } : p
          ));
        } else {
          alert(result.error || 'Failed to update products');
        }
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      alert('An error occurred');
    }
  };

  const handleDuplicate = async (productId: string) => {
    const result = await duplicateProduct(productId);
    if (result.success) {
      // Refresh would be needed here
      console.log('Product duplicated:', result.productId);
    } else {
      alert(result.error || 'Failed to duplicate product');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const result = await deleteProduct(productId);
    if (result.success) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      setTotalCount(prev => prev - 1);
    } else {
      alert(result.error || 'Failed to delete product');
    }
  };

  const statusBadges: Record<string, string> = {
    active: 'success',
    draft: 'outline',
    low_stock: 'warning',
    out_of_stock: 'error',
  };

  const statusDisplay: Record<string, string> = {
    active: 'Active',
    draft: 'Draft',
    low_stock: 'Low Stock',
    out_of_stock: 'Out of Stock',
  };

  const filteredProducts = products; // In real app, this would be handled server-side

  const paginatedProducts = filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)]">Products</h1>
          <p className="text-[var(--color-slate)] mt-1">Manage your product catalog</p>
        </div>
        <Button variant="primary" asChild>
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </motion.div>

      {/* Filters & Search */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-mist)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-12"
            aria-label="Search products"
            disabled={isLoading}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={activeCategory} onValueChange={handleCategoryChange} className="w-[160px]" disabled={isLoading}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={activeStatus} onValueChange={handleStatusChange} className="w-[160px]" disabled={isLoading}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={handleSortChange} className="w-[160px]" disabled={isLoading}>
            <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="price-low">Price Low-High</SelectItem>
              <SelectItem value="price-high">Price High-Low</SelectItem>
              <SelectItem value="stock">Stock Low-High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <motion.div
          className="p-4 bg-[var(--color-gold-light)] border border-[var(--color-gold)]/30 rounded-[var(--radius-xl)] flex items-center justify-between gap-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="font-medium text-[var(--color-ink)]">{selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('publish')}>Publish</Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('unpublish')}>Unpublish</Button>
            <Button variant="outline" size="sm" className="text-[var(--color-error)] hover:text-[var(--color-error)]" onClick={() => handleBulkAction('delete')}>Delete</Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedProducts([])}>Clear</Button>
          </div>
        </motion.div>
      )}

      {/* Products Table */}
      <motion.div
        className="overflow-hidden border border-[var(--color-whisper)] rounded-[var(--radius-xl)] bg-[var(--color-white)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  aria-label="Select all products"
                  className="w-4 h-4 rounded-[var(--radius-sm)] border-[var(--color-whisper)] text-[var(--color-gold)]"
                  disabled={isLoading}
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-center">Stock</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.map((product, index) => (
              <TableRow
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <TableCell className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                    aria-label={`Select ${product.name}`}
                    className="w-4 h-4 rounded-[var(--radius-sm)] border-[var(--color-whisper)] text-[var(--color-gold)]"
                    disabled={isLoading}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-whisper)] flex-shrink-0">
                      {product.image ? (
                        <Image src={product.image} alt={product.name} fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--color-mist)]">📦</div>
                      )}
                    </div>
                    <div>
                      <Link href={`/admin/products/${product.id}/edit`} className="font-medium text-[var(--color-ink)] hover:underline block truncate max-w-xs">
                        {product.name}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-[var(--color-slate)]">
                        {product.featured && <Badge variant="gold" className="text-[10px]">Featured</Badge>}
                        <span className="font-mono">{product.sku}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell><span className="font-mono text-sm text-[var(--color-slate)]">{product.sku}</span></TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{product.category}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="text-right">
                    <span className="font-medium text-[var(--color-ink)]">₹{product.price.toLocaleString()}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="block text-xs text-[var(--color-mist)] line-through">₹{product.originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className={cn('font-mono font-medium', product.stock === 0 ? 'text-[var(--color-error)]' : product.stock < 10 ? 'text-[var(--color-warning)]' : 'text-[var(--color-success)]')}>
                    {product.stock}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={statusBadges[product.status] as any} className="text-xs">
                    {statusDisplay[product.status]}
                  </Badge>
                </TableCell>
                <TableCell className="w-32">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="sm" className="p-1.5" asChild aria-label={`Edit ${product.name}`}>
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="p-1.5" onClick={() => handleDuplicate(product.id)} aria-label={`Duplicate ${product.name}`} disabled={isLoading}>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </Button>
                    <Button variant="ghost" size="sm" className="p-1.5 text-[var(--color-error)] hover:text-[var(--color-error)]" onClick={() => handleDelete(product.id)} aria-label={`Delete ${product.name}`} disabled={isLoading}>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {paginatedProducts.length === 0 && (
          <div className="p-12 text-center">
            <svg className="h-12 w-12 mx-auto text-[var(--color-mist)] mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-[var(--font-display)] text-lg text-[var(--color-ink)] mb-1">No products found</h3>
            <p className="text-[var(--color-slate)] mb-4">Try adjusting your filters or add a new product.</p>
            <Button variant="primary" asChild><Link href="/admin/products/new">Add Product</Link></Button>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.nav
          className="flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          aria-label="Pagination"
        >
          <p className="text-sm text-[var(--color-slate)]">
            Showing <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">{Math.min(page * itemsPerPage, totalCount)}</span> of{' '}
            <span className="font-medium">{totalCount}</span> products
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isLoading} aria-label="Previous page">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (page <= 3) pageNum = i + 1;
              else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = page - 2 + i;
              return (
                <Button key={pageNum} variant={page === pageNum ? 'primary' : 'ghost'} size="sm" className="w-10 h-10" onClick={() => setPage(pageNum)} aria-label={`Page ${pageNum}`} aria-current={page === pageNum ? 'page' : undefined} disabled={isLoading}>
                  {pageNum}
                </Button>
              );
            })}
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || isLoading} aria-label="Next page">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
            </Button>
          </div>
        </motion.nav>
      )}
    </div>
  );
}