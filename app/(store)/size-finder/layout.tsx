import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Size Finder',
  description: 'Find your perfect size for ethnic wear - sarees, lehengas, kurtis, salwars, gowns, and dupattas. Personalized recommendations based on your measurements.',
};

export default function SizeFinderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}