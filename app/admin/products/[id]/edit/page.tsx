import { getProductById, getCategories } from '@/lib/actions/admin-products';
import ProductFormClient from '../../ProductFormClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [{ product, error }, categories] = await Promise.all([
    getProductById(params.id),
    getCategories(),
  ]);

  if (!product || error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-[var(--color-slate,#666666)] text-lg">Product not found.</p>
          <Link href="/admin/products" className="text-[var(--color-gold,#C9A84C)] hover:underline mt-2 inline-block">
            &larr; Back to Products Catalog
          </Link>
        </div>
      </div>
    );
  }

  return <ProductFormClient initialProduct={product} categories={categories} isNew={false} />;
}
