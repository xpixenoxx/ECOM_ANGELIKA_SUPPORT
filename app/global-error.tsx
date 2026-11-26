'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Global Error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 text-[#1A1A1A] font-sans">
        <div className="max-w-md w-full bg-white border border-[#E5E5E5] rounded-xl p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-sm text-[#666] mb-6">
            {error?.message || 'An unexpected error occurred while loading this page.'}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2.5 bg-[#C5A880] text-white font-medium text-sm rounded-lg hover:brightness-105 transition-all"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
