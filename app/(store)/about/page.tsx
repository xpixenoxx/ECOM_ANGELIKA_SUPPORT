import type { Metadata } from 'next';
import { getSiteContent } from '@/lib/actions/site-content';
import { DEFAULT_SITE_CONTENT } from '@/lib/services/content/defaults';
import AboutPageClient from './AboutPageClient';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const aboutContent = siteContent?.['about-page'] || DEFAULT_SITE_CONTENT['about-page']!;

  return {
    title: aboutContent?.seo?.metaTitle || 'Our Story | Angelika Fashions',
    description:
      aboutContent?.seo?.metaDescription ||
      'Discover the story behind Angelika Fashions - founded by Vidhya, bringing premium ethnic wear with a personal touch.',
  };
}

export default async function AboutPage() {
  const siteContent = await getSiteContent();
  const aboutContent = siteContent?.['about-page'] || DEFAULT_SITE_CONTENT['about-page']!;

  return <AboutPageClient content={aboutContent} />;
}
