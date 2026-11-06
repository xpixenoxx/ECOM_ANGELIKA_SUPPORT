import { getAllProductsWithReviews } from '@/lib/actions/admin-reviews';
import ReviewsClient from './ReviewsClient';

export const dynamic = 'force-dynamic';

export default async function ReviewsPage() {
  const data = await getAllProductsWithReviews();
  return (
    <ReviewsClient
      initialProducts={data.products}
      initialAllReviews={data.allReviews}
      initialStats={data.stats}
    />
  );
}

