import { getInventoryAlerts } from '@/lib/actions/admin-products';
import InventoryClient from './InventoryClient';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const { variants } = await getInventoryAlerts();
  return <InventoryClient initialVariants={variants} />;
}
