import type { Metadata } from 'next';
import { getSiteContent } from '@/lib/actions/site-content';
import SaleClient from './SaleClient';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const saleContent = siteContent['sale-page'] || null;

  return {
    title: saleContent?.seo?.metaTitle || 'Seasonal Sale - Up to 65% Off | Angelika',
    description:
      saleContent?.seo?.metaDescription ||
      'Shop luxury handcrafted ethnic wear at seasonal markdowns. Sarees, Lehengas, Salwars & Dupattas up to 65% off.',
  };
}

export default async function SalePage() {
  const siteContent = await getSiteContent();
  const saleContent = siteContent['sale-page'] || null;

  return <SaleClient initialContent={saleContent} />;
}
