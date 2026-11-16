import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-[var(--color-snow)] flex items-center justify-center px-6 py-20"
    >
      <div className="max-w-lg w-full bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-2xl p-8 md:p-12 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-gold)] mb-3">
          Atelier Error 404
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-medium text-[var(--color-ink)] mb-4">
          This Drape Could Not Be Found
        </h1>
        <p className="text-sm text-[var(--color-slate)] leading-relaxed mb-8">
          The page or curated piece you are looking for may have been retired or moved. Let us guide you back to our collections.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[var(--color-gold)] text-[var(--color-ink)] font-semibold text-sm hover:bg-[var(--color-gold-hover)] transition-colors"
          >
            Explore Collections
          </Link>
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
