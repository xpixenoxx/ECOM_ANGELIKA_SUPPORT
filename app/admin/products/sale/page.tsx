import { getAdminProducts } from '@/lib/actions/admin-products';
import { getSiteContent } from '@/lib/actions/site-content';
import { SalePageEditor } from '@/components/admin/SalePageEditor';

export const dynamic = 'force-dynamic';

export default async function AdminSalePage() {
  const [productsRes, siteContent] = await Promise.all([
    getAdminProducts(),
    getSiteContent(),
  ]);

  const catalogProducts = productsRes.products || [];
  const initialSaleContent = siteContent['sale-page'] || null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <SalePageEditor
        initialCatalogProducts={catalogProducts}
        initialSaleData={initialSaleContent}
      />
    </div>
  );
}

