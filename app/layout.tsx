import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const cormorant = {
  className: 'font-cormorant',
  variable: '--font-cormorant',
};

const dmSans = {
  className: 'font-dm-sans',
  variable: '--font-dm-sans',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://angelikafashions.com'),
  title: {
    default: 'Angelika Fashions | Handcrafted Luxury Ethnic Wear · Curated by Vidhya',
    template: '%s | Angelika Fashions',
  },
  description: 'Grace in Every Drape. Explore handcrafted luxury ethnic wear — artisanal kurtis, Banarasi sarees, bridal lehengas, and palazzo sets, curated with love by designer Vidhya. Free shipping Pan-India.',
  keywords: [
    'Angelika Fashions',
    'Vidhya ethnic wear',
    'luxury ethnic wear India',
    'handcrafted kurtis',
    'pure silk sarees',
    'Banarasi sarees',
    'Kanjivaram sarees',
    'designer lehengas',
    'bridal lehenga choli',
    'palazzo salwar sets',
    'Chanderi cotton kurti',
    'hand block print',
    'Indian haute couture',
    'sustainable ethnic fashion',
  ],
  authors: [{ name: 'Vidhya', url: 'https://angelikafashions.com/about' }],
  creator: 'Vidhya - Angelika Fashions',
  publisher: 'Angelika Fashions',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://angelikafashions.com',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://angelikafashions.com',
    siteName: 'Angelika Fashions',
    title: 'Angelika Fashions | Handcrafted Luxury Ethnic Wear · Curated by Vidhya',
    description: 'Grace in Every Drape. Handcrafted kurtis, salwars, bridal lehengas, sarees & dupattas. Rooted in heritage, curated by designer Vidhya.',
    images: [
      {
        url: '/images/hero-banner-luxury.jpg',
        width: 1920,
        height: 1080,
        alt: 'Angelika Fashions - Grace in Every Drape Luxury Ethnic Wear',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Angelika Fashions | Luxury Indian Ethnic Wear by Vidhya',
    description: 'Grace in Every Drape. Timeless handcrafted kurtis, sarees, lehengas & salwars curated by Vidhya.',
    images: ['/images/hero-banner-luxury.jpg'],
  },
  other: {
    'geo.region': 'IN',
    'geo.placename': 'India',
    'category': 'Luxury Fashion & Apparel',
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAFA' },
    { media: '(prefers-color-scheme: dark)', color: '#0D0D0D' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.className} ${dmSans.className}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}