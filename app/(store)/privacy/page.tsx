import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Angelika Fashions',
  description: 'Learn how Angelika Fashions protects your privacy and personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-white)] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-gold)]">
            Legal & Policy
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-ink)] mt-1">
            Privacy Policy
          </h1>
          <p className="text-sm text-[var(--color-slate)] mt-2">
            Last updated: January 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-[var(--color-slate)] space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
              1. Information We Collect
            </h2>
            <p>
              At Angelika Fashions, we collect personal information necessary to deliver exceptional craftsmanship and service. This includes your name, shipping address, billing address, phone number, email address, and order history.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
              2. How We Use Your Information
            </h2>
            <p>
              We use your data solely to fulfill orders, process payments securely, provide order tracking updates via SMS or WhatsApp, and improve your shopping experience. We never sell or rent your personal information to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
              3. Payment Security
            </h2>
            <p>
              All payment transactions are encrypted using 256-bit SSL encryption and processed through trusted PCI-DSS certified payment gateways (Razorpay, Stripe). We do not store complete credit card or debit card numbers on our servers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
              4. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy or your personal information, please contact us at{' '}
              <Link href="/contact" className="text-[var(--color-gold)] underline font-medium">
                support@angelikafashions.com
              </Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
