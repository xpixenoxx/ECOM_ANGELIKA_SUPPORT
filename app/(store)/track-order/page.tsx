import type { Metadata } from 'next';
import { getStoreSettings } from '@/lib/actions/store-settings';
import { getHomepageHeroData } from '@/lib/actions/homepage-hero';
import { TrackOrderClient } from './TrackOrderClient';

export const metadata: Metadata = {
  title: 'Track Your Order | Angelika Fashions',
  description:
    'Enter your Order Number and registered email or phone number to check live preparation and courier dispatch status.',
};

export default async function TrackOrderPage() {
  const [settings, heroData] = await Promise.all([
    getStoreSettings(),
    getHomepageHeroData(),
  ]);

  const whatsappNumber =
    heroData?.conciergeWhatsApp || settings?.contact_whatsapp || '';

  return <TrackOrderClient whatsappNumber={whatsappNumber} />;
}
