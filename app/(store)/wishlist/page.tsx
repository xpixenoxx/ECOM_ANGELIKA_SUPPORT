import { getWishlistRecommendationsAction } from '@/lib/actions/customer-account';
import { WishlistClient } from './WishlistClient';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Wishlist | Angelika Fashions',
  description: 'Review your saved handcrafted pieces and move them directly into your Angelika Fashions shopping bag.',
};

export default async function WishlistPage() {
  const recommendations = await getWishlistRecommendationsAction();
  return <WishlistClient recommendations={recommendations} />;
}
