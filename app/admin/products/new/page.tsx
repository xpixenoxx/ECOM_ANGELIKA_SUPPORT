import { getCategories } from '@/lib/actions/admin-products';
import ProductFormClient from '../ProductFormClient';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const categories = await getCategories();
  return <ProductFormClient categories={categories} isNew={true} />;
}
