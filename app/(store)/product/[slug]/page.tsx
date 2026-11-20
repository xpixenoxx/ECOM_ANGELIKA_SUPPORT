export const runtime = 'edge';

import { notFound, redirect } from 'next/navigation';
import { getProductWithReviews, getRelatedProducts } from '@/lib/actions/products';
import { ProductClient } from './ProductClient';

// ISR: product pages rebuild every 5 minutes.
// Admin product updates trigger on-demand revalidation via POST /api/revalidate?path=/product/{slug}
export const dynamic = 'force-dynamic';

async function _disabledStaticParams() {
  // Pre-build active products at deploy time for faster edge delivery.
  // Falls back gracefully if DB is unavailable during build.
  try {
    const { createPublicClient } = await import('@/lib/supabase/server');
    const supabase = createPublicClient();
    const { data: products } = await supabase
      .from('products')
      .select('slug')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(100); // Pre-build top 100 products
    
    return (products || [])
      .filter(p => p.slug)
      .map(p => ({ slug: p.slug }));
  } catch {
    // During local dev or when DB unavailable — no static params
    return [];
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!slug || slug === 'undefined' || slug === 'null') {
    redirect('/shop');
  }

  const { product: clientProduct, reviews, reviewSummary } = await getProductWithReviews(slug);

  if (!clientProduct) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(
    clientProduct.id,
    clientProduct.categoryId || null,
    4,
    clientProduct.tags || [],
    clientProduct.rawFabric || null
  );

  return <ProductClient product={clientProduct} relatedProducts={relatedProducts} reviews={reviews} reviewSummary={reviewSummary} />;
}