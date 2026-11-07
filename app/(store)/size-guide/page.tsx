import type { Metadata } from 'next';
import { getSiteContent, DEFAULT_SITE_CONTENT } from '@/lib/actions/site-content';
import { SizeGuideClient } from './SizeGuideClient';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const sizeGuideContent =
    siteContent?.['size-guide-page'] || DEFAULT_SITE_CONTENT['size-guide-page']!;

  return {
    title:
      sizeGuideContent?.seo?.metaTitle ||
      'Garment Size Guide & Measurement Charts | Angelika Fashions',
    description:
      sizeGuideContent?.seo?.metaDescription ||
      'Explore tailored fit & measurement charts for Angelika kurtis, festive lehengas, and bespoke cholis crafted with 2-inch side seams for easy alterations.',
  };
}

export default async function SizeGuidePage() {
  const siteContent = await getSiteContent();
  const sizeGuideContent =
    siteContent?.['size-guide-page'] || DEFAULT_SITE_CONTENT['size-guide-page']!;

  return <SizeGuideClient content={sizeGuideContent} />;
}
