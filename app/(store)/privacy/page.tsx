import Link from 'next/link';
import type { Metadata } from 'next';
import { getSiteContent } from '@/lib/actions/site-content';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const privacyContent = siteContent['privacy-policy-page'] || null;

  return {
    title: privacyContent?.seo?.metaTitle || 'Privacy Policy | Angelika Fashions',
    description:
      privacyContent?.seo?.metaDescription ||
      'Learn how Angelika Fashions protects your privacy and personal information.',
  };
}

export default async function PrivacyPolicyPage() {
  const siteContent = await getSiteContent();
  const privacyContent = siteContent['privacy-policy-page'] || null;

  const badge = privacyContent?.badge || 'Legal & Policy';
  const title = privacyContent?.title || 'Privacy Policy';
  const lastUpdated = privacyContent?.lastUpdated || 'Last updated: January 2026';
  const contactEmail = privacyContent?.contactEmail || 'support@angelikafashions.com';
  const contactLink = privacyContent?.contactLink || '/contact';

  const sections = privacyContent?.sections && privacyContent.sections.length > 0
    ? privacyContent.sections
    : [
        {
          id: 'sec-1',
          title: '1. Information We Collect',
          content: 'At Angelika Fashions, we collect personal information necessary to deliver exceptional craftsmanship and service. This includes your name, shipping address, billing address, phone number, email address, and order history.',
        },
        {
          id: 'sec-2',
          title: '2. How We Use Your Information',
          content: 'We use your data solely to fulfill orders, process payments securely, provide order tracking updates via SMS or WhatsApp, and improve your shopping experience. We never sell or rent your personal information to third parties.',
        },
        {
          id: 'sec-3',
          title: '3. Payment Security',
          content: 'All payment transactions are encrypted using 256-bit SSL encryption and processed through trusted PCI-DSS certified payment gateways (Razorpay, Stripe). We do not store complete credit card or debit card numbers on our servers.',
        },
        {
          id: 'sec-4',
          title: '4. Contact Us',
          content: 'If you have any questions about this Privacy Policy or your personal information, please contact us at support@angelikafashions.com.',
        },
      ];

  return (
    <div className="min-h-screen bg-[var(--color-white)] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-gold)]">
            {badge}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-ink)] mt-1">
            {title}
          </h1>
          <p className="text-sm text-[var(--color-slate)] mt-2">
            {lastUpdated}
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-[var(--color-slate)] space-y-6 leading-relaxed">
          {sections.map((section, idx) => (
            <section key={section.id || idx} className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
                {section.title}
              </h2>
              <p className="whitespace-pre-line text-sm sm:text-base leading-relaxed">
                {section.content.includes(contactEmail) ? (
                  <>
                    {section.content.split(contactEmail)[0]}
                    <Link href={contactLink} className="text-[var(--color-gold)] underline font-medium">
                      {contactEmail}
                    </Link>
                    {section.content.split(contactEmail)[1]}
                  </>
                ) : (
                  section.content
                )}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
