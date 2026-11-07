import type { Metadata } from 'next';
import { getSiteContent, DEFAULT_SITE_CONTENT } from '@/lib/actions/site-content';
import { ShippingClient } from './ShippingClient';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const shippingContent = siteContent?.['shipping-page'] || DEFAULT_SITE_CONTENT['shipping-page']!;

  return {
    title: shippingContent?.seo?.metaTitle || 'Shipping & Delivery Policy | Angelika Fashions',
    description:
      shippingContent?.seo?.metaDescription ||
      'Learn about our domestic and international shipping policies, dispatch timelines, and complimentary delivery for handcrafted luxury ethnic wear.',
  };
}

export default async function ShippingPolicyPage() {
  const siteContent = await getSiteContent();
  const shippingContent = siteContent?.['shipping-page'] || DEFAULT_SITE_CONTENT['shipping-page']!;

  return <ShippingClient content={shippingContent} />;
}
