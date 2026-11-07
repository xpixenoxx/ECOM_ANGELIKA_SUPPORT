import type { Metadata } from 'next';
import { getSiteContent, DEFAULT_SITE_CONTENT } from '@/lib/actions/site-content';
import { DesignerVidhyaClient } from './DesignerVidhyaClient';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const vidhyaContent =
    siteContent?.['designer-vidhya-page'] || DEFAULT_SITE_CONTENT['designer-vidhya-page']!;

  return {
    title:
      vidhyaContent?.seo?.metaTitle ||
      'Meet Designer Vidhya | Angelika Fashions Atelier',
    description:
      vidhyaContent?.seo?.metaDescription ||
      'Discover the artisanal journey, design philosophy, and master craft heritage of Designer Vidhya at Angelika Fashions.',
  };
}

export default async function DesignerVidhyaPage() {
  const siteContent = await getSiteContent();
  const vidhyaContent =
    siteContent?.['designer-vidhya-page'] || DEFAULT_SITE_CONTENT['designer-vidhya-page']!;

  return <DesignerVidhyaClient initialContent={vidhyaContent} />;
}
