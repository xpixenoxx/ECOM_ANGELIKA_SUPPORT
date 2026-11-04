import { getCategories } from '@/lib/actions/admin-products';
import CategoriesClient from './CategoriesClient';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await getCategories();
  return <CategoriesClient initialCategories={categories} />;
}
