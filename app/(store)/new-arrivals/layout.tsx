export async function generateMetadata() {
  return {
    title: 'New Arrivals',
    description: 'Discover the latest ethnic wear arrivals at Angelika Fashions - fresh handcrafted pieces every week.',
  };
}

export default function NewArrivalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}