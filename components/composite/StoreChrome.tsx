'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface StoreChromeProps {
  header: ReactNode;
  footer: ReactNode;
  whatsapp?: ReactNode;
  children: ReactNode;
}

/**
 * Hides the global storefront navbar, announcement bar, logo, and footer on `/checkout`
 * so checkout renders as a distraction-free, high-conversion luxury experience.
 */
export function StoreChrome({ header, footer, whatsapp, children }: StoreChromeProps) {
  const pathname = usePathname() || '';
  const isDistractionFreeCheckout = pathname === '/checkout' || pathname.startsWith('/checkout/');

  return (
    <div className="flex min-h-screen min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[120] focus:px-4 focus:py-2.5 focus:rounded-md focus:bg-[var(--color-ink)] focus:text-[var(--color-white)] focus:font-semibold focus:text-sm focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
      >
        Skip to main content
      </a>
      {!isDistractionFreeCheckout && (
        <div className="sticky top-0 z-50 w-full">{header}</div>
      )}
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      {!isDistractionFreeCheckout && footer}
      {!isDistractionFreeCheckout && whatsapp}
    </div>
  );
}
