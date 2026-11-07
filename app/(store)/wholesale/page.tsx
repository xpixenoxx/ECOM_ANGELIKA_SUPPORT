import type { Metadata } from 'next';
import { getSiteContent, DEFAULT_SITE_CONTENT } from '@/lib/actions/site-content';
import { WholesaleClient } from './WholesaleClient';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const wholesaleContent =
    siteContent?.['wholesale-page'] || DEFAULT_SITE_CONTENT['wholesale-page']!;

  return {
    title:
      wholesaleContent?.seo?.metaTitle ||
      'Wholesale & B2B Inquiries | Boutique Partnerships | Angelika Fashions',
    description:
      wholesaleContent?.seo?.metaDescription ||
      'Partner with Angelika Fashions for wholesale handcrafted Indian couture, silk sarees, and bridal lehengas with direct loom pricing and worldwide delivery.',
  };
}

export default async function WholesalePage() {
  const siteContent = await getSiteContent();
  const wholesaleContent =
    siteContent?.['wholesale-page'] || DEFAULT_SITE_CONTENT['wholesale-page']!;

  return <WholesaleClient content={wholesaleContent} />;
}
