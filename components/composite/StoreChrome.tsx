'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { AtelierCurtain } from '@/components/composite/AtelierCurtain';

interface StoreChromeProps {
  header: ReactNode;
  footer: ReactNode;
  whatsapp?: ReactNode;
  logoUrl?: string;
  brandName?: string;
  brandTagline?: string;
  children: ReactNode;
}

/**
 * Hides the global storefront navbar, announcement bar, logo, and footer on `/checkout`,
 * `/login`, and `/register` so auth and checkout render as distraction-free luxury flows,
 * and mounts the signature centered-logo Atelier Curtain across every storefront load & navigation.
 */
export function StoreChrome({
  header,
  footer,
  whatsapp,
  logoUrl,
  brandName,
  brandTagline,
  children,
}: StoreChromeProps) {
  const pathname = usePathname() || '';
  const isDistractionFreeRoute =
    pathname === '/checkout' ||
    pathname.startsWith('/checkout/') ||
    pathname === '/login' ||
    pathname.startsWith('/login/') ||
    pathname === '/register' ||
    pathname.startsWith('/register/');

  return (
    <div className="flex min-h-screen min-h-dvh flex-col">
      <AtelierCurtain
        logoUrl={logoUrl}
        brandName={brandName}
        brandTagline={brandTagline}
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[120] focus:px-4 focus:py-2.5 focus:rounded-md focus:bg-[var(--color-ink)] focus:text-[var(--color-white)] focus:font-semibold focus:text-sm focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
      >
        Skip to main content
      </a>
      {!isDistractionFreeRoute && (
        <div className="sticky top-0 z-50 w-full print:hidden">{header}</div>
      )}
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      {!isDistractionFreeRoute && <div className="print:hidden">{footer}</div>}
      {!isDistractionFreeRoute && <div className="print:hidden">{whatsapp}</div>}
    </div>
  );
}
