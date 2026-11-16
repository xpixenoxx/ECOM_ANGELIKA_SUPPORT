'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[App Error Boundary]', error?.digest || error?.message);
  }, [error]);

  return (
    <main
      id="main-content"
      className="min-h-screen bg-[var(--color-snow)] flex items-center justify-center px-6 py-20"
    >
      <div className="max-w-lg w-full bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-2xl p-8 md:p-12 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-gold)] mb-3">
          Temporary Interruption
        </p>
        <h1 className="font-serif text-3xl font-medium text-[var(--color-ink)] mb-4">
          Something Went Wrong
        </h1>
        <p className="text-sm text-[var(--color-slate)] leading-relaxed mb-8">
          We encountered an unexpected issue while preparing this page. Please try again or return to our boutique home.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[var(--color-gold)] text-[var(--color-ink)] font-semibold text-sm hover:bg-[var(--color-gold-hover)] transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-[var(--color-whisper)] text-[var(--color-ink)] font-medium text-sm hover:border-[var(--color-gold)] transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
