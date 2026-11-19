import type { Metadata } from 'next';
import { getSiteContent } from '@/lib/actions/site-content';
import { DEFAULT_SITE_CONTENT } from '@/lib/services/content/defaults';
import { VidhyasPicksClient } from './VidhyasPicksClient';

// ISR: rebuilds at most every 600s. For immediate updates, POST /api/revalidate
export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const pageContent =
    siteContent?.['vidhyas-picks-page'] || DEFAULT_SITE_CONTENT['vidhyas-picks-page']!;

  return {
    title:
      pageContent?.seo?.metaTitle ||
      "Vidhya's Picks | Founder's Curated Handloom Ethnic Wear | Angelika",
    description:
      pageContent?.seo?.metaDescription ||
      "Explore Vidhya's personal curation of handwoven sarees, artisanal kurtis, festive lehengas, and elegant salwars direct from master looms.",
  };
}

export default async function VidhyasPicksPage() {
  const siteContent = await getSiteContent();
  const pageContent =
    siteContent?.['vidhyas-picks-page'] || DEFAULT_SITE_CONTENT['vidhyas-picks-page']!;

  return <VidhyasPicksClient initialContent={pageContent} />;
}
