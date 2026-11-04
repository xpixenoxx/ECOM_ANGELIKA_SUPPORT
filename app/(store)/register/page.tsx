'use client';

import { Suspense } from 'react';
import { LoginPageClient } from '@/app/(store)/login/LoginPageClient';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-white)] flex items-center justify-center" />}>
      <LoginPageClient initialMode="signup" />
    </Suspense>
  );
}
