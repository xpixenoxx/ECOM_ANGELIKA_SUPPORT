import { Metadata } from 'next';

const mockProduct = {
  id: 'prod-1',
  name: 'Cotton Anarkali Set with Hand Block Print',
  price: 3499,
  originalPrice: 4299,
  category: 'Kurtis',
  description: 'Elevate your ethnic wardrobe with this exquisite cotton Anarkali set, featuring traditional hand block printing by skilled artisans from Rajasthan. The flowing silhouette flatters all body types, while the breathable cotton fabric ensures all-day comfort. Perfect for festive occasions, family gatherings, or everyday elegance.',
  shortDescription: 'Hand-block printed cotton Anarkali set with flowing silhouette and artisan detailing.',
  images: [
    '/images/product-1.jpg',
  ],
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  // In production, fetch from database using params.slug
  const product = mockProduct;
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images[0] ? [{ url: product.images[0], width: 1200, height: 1500 }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.shortDescription,
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}