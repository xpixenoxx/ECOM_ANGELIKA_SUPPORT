'use client';

import { ReactNode } from 'react';
import { CartProvider } from '@/lib/hooks/useCart';
import { AuthProvider } from '@/lib/hooks/useAuth';
import { WishlistProvider } from '@/lib/hooks/useWishlist';
import { SizeFinderProvider } from '@/lib/hooks/useSizeFinder';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeProvider } from '@/lib/hooks/useTheme';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="angelika-theme">
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <SizeFinderProvider>
              <ToastProvider>
                {children}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 3500,
                    style: {
                      background: '#1A1A1A',
                      color: '#FFFFFF',
                      border: '1px solid #C9A84C',
                      padding: '12px 18px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                      zIndex: 99999,
                    },
                    success: {
                      iconTheme: {
                        primary: '#C9A84C',
                        secondary: '#1A1A1A',
                      },
                    },
                  }}
                />
              </ToastProvider>
            </SizeFinderProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}