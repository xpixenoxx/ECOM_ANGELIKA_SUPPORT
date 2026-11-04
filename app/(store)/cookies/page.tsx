import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | Angelika Fashions',
  description: 'Understand how Angelika Fashions utilizes cookies to provide an elevated browsing and bespoke shopping experience.',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-white)] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-gold)]">
            Legal & Policy
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-ink)] mt-1">
            Cookie Policy
          </h1>
          <p className="text-sm text-[var(--color-slate)] mt-2">
            Last updated: January 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-[var(--color-slate)] space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
              1. What Are Cookies?
            </h2>
            <p>
              Cookies are small encrypted text files stored on your browser or device when you explore the Angelika Fashions digital atelier. They allow our website to recognize your preferences, remember your bag and wishlist selections, and deliver a tailored luxury shopping experience.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
              2. Categories of Cookies We Employ
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-[var(--color-ink)]">Essential Atelier Cookies:</strong> Vital for core functions such as shopping bag persistence, secure user authentication, and checkout flow.
              </li>
              <li>
                <strong className="text-[var(--color-ink)]">Preference & Craft Cookies:</strong> Remember your selected size recommendations, currency settings, and recently viewed heirloom designs.
              </li>
              <li>
                <strong className="text-[var(--color-ink)]">Analytical Performance Cookies:</strong> Help us anonymously evaluate how clients interact with collections and discover ways to optimize navigation speed.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
              3. Managing Your Cookie Preferences
            </h2>
            <p>
              You have complete autonomy over your cookie preferences. You can adjust your browser settings to decline or clear cookies at any time. Please note that disabling essential cookies may impact certain concierge and checkout features on our atelier platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
              4. Concierge Enquiries
            </h2>
            <p>
              For further questions regarding our cookie protocols or data protection practices, please connect with our concierge team at{' '}
              <Link href="/contact" className="text-[var(--color-gold)] underline font-medium">
                concierge@angelikafashions.com
              </Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
