import { notFound, redirect } from 'next/navigation';
import { getProductWithReviews, getRelatedProducts } from '@/lib/actions/products';
import { ProductClient } from './ProductClient';

export async function generateStaticParams() {
  // This is optional - for static generation of popular products
  return [];
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