import { getAdminProducts, getCategories } from '@/lib/actions/admin-products';
import AdminProductsClientNew from './AdminProductsClientNew';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const [{ products }, categories] = await Promise.all([
    getAdminProducts(),
    getCategories(),
  ]);
  return <AdminProductsClientNew initialProducts={products} categories={categories} />;
}
