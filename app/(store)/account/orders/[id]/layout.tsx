import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Order ${id}`,
    description: `View details for order ${id} - tracking, items, shipping, and payment information.`,
  };
}

export default function OrderDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}