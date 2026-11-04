import { Metadata } from 'next';

const categoryLabels: Record<string, string> = {
  kurtis: 'Kurtis',
  salwars: 'Salwars',
  lehengas: 'Lehengas',
  sarees: 'Sarees',
  dupattas: 'Dupattas',
};

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const category = (await params).category;
  const label = categoryLabels[category] || category;

  return {
    title: `${label} | Premium Ethnic Wear`,
    description: `Shop premium ${label.toLowerCase()} online at Angelika Fashions. Handcrafted designs by Vidhya. Free shipping on orders above ₹2999.`,
  };
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}