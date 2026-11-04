export async function generateMetadata() {
  return {
    title: 'My Account',
    description: 'Manage your Angelika Fashions account - orders, wishlist, addresses, and loyalty rewards.',
  };
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}