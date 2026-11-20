export const runtime = 'edge';

import { Metadata } from 'next';
import { getProductBySlug } from '@/lib/actions/products';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (!slug || slug === 'undefined' || slug === 'null') {
    return { title: 'Product | Angelika Fashions' };
  }

  try {
    const product = await getProductBySlug(slug);
    if (!product) {
      return { title: 'Product Not Found | Angelika Fashions' };
    }

    const description =
      product.short_description ||
      product.description?.slice(0, 160) ||
      'Handcrafted luxury Indian ethnic wear curated by Vidhya at Angelika Fashions.';
    const primaryImage =
      product.images?.find((img: any) => img.is_primary)?.url ||
      product.images?.[0]?.url;

    return {
      title: product.name,
      description,
      openGraph: {
        title: product.name,
        description,
        images: primaryImage ? [{ url: primaryImage, width: 1200, height: 1500 }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description,
        images: primaryImage ? [primaryImage] : [],
      },
    };
  } catch {
    return { title: 'Angelika Fashions' };
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
