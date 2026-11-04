import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - Help Center',
  description: 'Find answers to common questions about orders, shipping, returns, sizing, products, and more at Angelika Fashions.',
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}