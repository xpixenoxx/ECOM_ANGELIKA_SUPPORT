import type { Metadata } from 'next';
import { getSiteContent, DEFAULT_SITE_CONTENT } from '@/lib/actions/site-content';
import { SizeFinderClient } from './SizeFinderClient';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const sizeFinderContent =
    siteContent?.['size-finder-page'] || DEFAULT_SITE_CONTENT['size-finder-page']!;

  return {
    title: sizeFinderContent?.seo?.metaTitle || 'Size Finder & Couture Fit Studio | Angelika Fashions',
    description:
      sizeFinderContent?.seo?.metaDescription ||
      'Find your perfect size for handcrafted Indian luxury ethnic wear - sarees, lehengas, kurtis, salwars, and dupattas with personalized fit recommendations.',
  };
}

export default async function SizeFinderPage() {
  const siteContent = await getSiteContent();
  const sizeFinderContent =
    siteContent?.['size-finder-page'] || DEFAULT_SITE_CONTENT['size-finder-page']!;

  return <SizeFinderClient content={sizeFinderContent} />;
}
