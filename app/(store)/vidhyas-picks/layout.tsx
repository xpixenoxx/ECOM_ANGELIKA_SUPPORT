import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: "Vidhya's Picks | Designer Curated Ethnic Wear",
  description:
    "Discover designer Vidhya's handpicked monthly edits — exclusive pure silks, Banarasi weaves, handcrafted kurtis, and wedding guest couture from Angelika Fashions.",
  openGraph: {
    title: "Vidhya's Picks | Curated by Designer Vidhya",
    description:
      'Explore handpicked luxury ethnic wear with personal styling notes by designer Vidhya.',
    images: [
      {
        url: '/images/vp-jan-1.jpg',
        width: 1200,
        height: 630,
        alt: "Vidhya's Curated Luxury Ethnic Wear",
      },
    ],
  },
};

export default function VidhyasPicksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
