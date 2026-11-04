import { Suspense } from 'react';
import { ResetPasswordPageClient } from './ResetPasswordPageClient';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-white)] flex items-center justify-center" />}>
      <ResetPasswordPageClient />
    </Suspense>
  );
}