import type { Metadata } from 'next';
import { getSiteContent, DEFAULT_SITE_CONTENT } from '@/lib/actions/site-content';
import { ReturnsClient } from './ReturnsClient';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const returnsContent = siteContent?.['returns-page'] || DEFAULT_SITE_CONTENT['returns-page']!;

  return {
    title: returnsContent?.seo?.metaTitle || 'Returns & Size Exchanges | Angelika Fashions',
    description:
      returnsContent?.seo?.metaDescription ||
      'Our 7-day complimentary size exchange and return policy for handcrafted Indian luxury ethnic wear.',
  };
}

export default async function ReturnsPolicyPage() {
  const siteContent = await getSiteContent();
  const returnsContent = siteContent?.['returns-page'] || DEFAULT_SITE_CONTENT['returns-page']!;

  return <ReturnsClient content={returnsContent} />;
}
