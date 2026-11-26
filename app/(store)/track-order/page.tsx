import type { Metadata } from 'next';
import { getStoreSettings } from '@/lib/actions/store-settings';
import { getHomepageHeroData } from '@/lib/actions/homepage-hero';
import { TrackOrderClient } from './TrackOrderClient';

export const metadata: Metadata = {
  title: 'Track Your Order | Angelika Fashions',
  description:
    'Enter your Order Number and registered email or phone number to check live preparation and courier dispatch status.',
};

interface TrackOrderPageProps {
  searchParams?: {
    order?: string;
    order_number?: string;
    token?: string;
  };
}

export default async function TrackOrderPage({ searchParams }: TrackOrderPageProps) {
  const [settings, heroData] = await Promise.all([
    getStoreSettings(),
    getHomepageHeroData(),
  ]);

  const whatsappNumber =
    heroData?.conciergeWhatsApp || settings?.contact_whatsapp || '';

  const initialOrderNumber = (searchParams?.order || searchParams?.order_number || '').trim();
  const initialToken = (searchParams?.token || '').trim();

  return (
    <TrackOrderClient
      whatsappNumber={whatsappNumber}
      initialOrderNumber={initialOrderNumber}
      initialToken={initialToken}
    />
  );
}
