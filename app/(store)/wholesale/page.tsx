import type { Metadata } from 'next';
import { getSiteContent } from '@/lib/actions/site-content';
import { DEFAULT_SITE_CONTENT } from '@/lib/services/content/defaults';
import { getStoreSettings } from '@/lib/actions/store-settings';
import { getHomepageHeroData } from '@/lib/actions/homepage-hero';
import { WholesaleClient } from './WholesaleClient';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

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
  const [siteContent, settings, heroData] = await Promise.all([
    getSiteContent(),
    getStoreSettings(),
    getHomepageHeroData(),
  ]);
  const wholesaleContent =
    siteContent?.['wholesale-page'] || DEFAULT_SITE_CONTENT['wholesale-page']!;
  const configuredWhatsapp =
    heroData?.conciergeWhatsApp || settings?.contact_whatsapp || '';

  return <WholesaleClient content={wholesaleContent} configuredWhatsapp={configuredWhatsapp} />;
}
