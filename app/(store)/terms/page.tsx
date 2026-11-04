import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Angelika Fashions',
  description: 'Terms of service and conditions of use for Angelika Fashions.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[var(--color-white)] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-gold)]">
            Legal & Policy
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-ink)] mt-1">
            Terms of Service
          </h1>
          <p className="text-sm text-[var(--color-slate)] mt-2">
            Last updated: January 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-[var(--color-slate)] space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
              1. General Overview
            </h2>
            <p>
              Welcome to Angelika Fashions. By visiting our site and/or purchasing handcrafted garments from us, you engage in our service and agree to be bound by the following terms and conditions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
              2. Products and Handcrafted Variations
            </h2>
            <p>
              Our collections are handcrafted by skilled artisans. As each piece involves hand-block printing, hand-embroidery, and traditional weaving techniques, subtle variations in color, texture, and motif placement are intrinsic to authentic artisan craftsmanship and are not considered defects.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
              3. Pricing and Orders
            </h2>
            <p>
              All prices are listed in Indian Rupees (₹) inclusive of applicable taxes unless stated otherwise. We reserve the right to modify prices or discontinue items without prior notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
              4. Support & Questions
            </h2>
            <p>
              For any questions regarding these terms, please visit our{' '}
              <Link href="/contact" className="text-[var(--color-gold)] underline font-medium">
                Contact Page
              </Link>{' '}
              or reach out to us at{' '}
              <Link href="/faq" className="text-[var(--color-gold)] underline font-medium">
                Customer Support FAQ
              </Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
