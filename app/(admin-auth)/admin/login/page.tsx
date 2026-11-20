import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AdminLoginClient } from './AdminLoginClient';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Portal Sign In | Angelika Fashions',
  description: 'Authorized staff sign-in for the Angelika Fashions Atelier Administration Console.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-[#C9A84C] border-t-transparent animate-spin" />
        </div>
      }
    >
      <AdminLoginClient />
    </Suspense>
  );
}
