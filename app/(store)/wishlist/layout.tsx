import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Wishlist',
  description: 'Your saved items from Angelika Fashions - ethnic wear, sarees, lehengas, kurtis and more.',
};

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}