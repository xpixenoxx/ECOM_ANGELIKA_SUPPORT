import { getProductById, getCategories } from '@/lib/actions/admin-products';
import ProductFormClient from '../../ProductFormClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;

  const [{ product, error }, categories] = await Promise.all([
    getProductById(id),
    getCategories(),
  ]);

  if (!product || error) {
    console.error(`EditProductPage: product not found for ID "${id}":`, error);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <p className="text-[var(--color-ink,#111111)] text-lg font-medium">Product not found.</p>
          {error && <p className="text-xs text-red-600 font-mono max-w-md mx-auto">{error}</p>}
          <Link href="/admin/products" className="text-[var(--color-gold,#C9A84C)] hover:underline text-sm inline-block">
            &larr; Back to Products Catalog
          </Link>
        </div>
      </div>
    );
  }

  return <ProductFormClient initialProduct={product} categories={categories} isNew={false} />;
}
