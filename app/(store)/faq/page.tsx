import type { Metadata } from 'next';
import { getSiteContent, DEFAULT_SITE_CONTENT } from '@/lib/actions/site-content';
import { FaqClient } from './FaqClient';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const faqContent = siteContent?.['faq-page'] || DEFAULT_SITE_CONTENT['faq-page']!;

  return {
    title: faqContent?.seo?.metaTitle || 'FAQ & Help Center | Angelika Fashions',
    description:
      faqContent?.seo?.metaDescription ||
      'Find answers to common questions about orders, payments, shipping, returns, custom sizing, artisan fabrics, and bulk orders at Angelika Fashions.',
  };
}

export default async function FAQPage() {
  const siteContent = await getSiteContent();
  const faqContent = siteContent?.['faq-page'] || DEFAULT_SITE_CONTENT['faq-page']!;

  return <FaqClient content={faqContent} />;
}
