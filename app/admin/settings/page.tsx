import { getStoreSettings, getNavbarItems } from '@/lib/actions/store-settings';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const [settings, navbarItems] = await Promise.all([
    getStoreSettings(),
    getNavbarItems(),
  ]);

  return <SettingsClient initialSettings={settings} initialNavbarItems={navbarItems} />;
}
