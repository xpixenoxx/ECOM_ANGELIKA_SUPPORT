import Link from 'next/link';
import type { Metadata } from 'next';
import { getSiteContent } from '@/lib/actions/site-content';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const termsContent = siteContent['terms-page'] || null;

  return {
    title: termsContent?.seo?.metaTitle || 'Terms of Service | Angelika Fashions',
    description:
      termsContent?.seo?.metaDescription ||
      'Terms of service and conditions of use for Angelika Fashions.',
  };
}

function renderContentWithLinks(content: string, contactLink: string, faqLink: string) {
  if (!content.includes('Contact Page') && !content.includes('Customer Support FAQ')) {
    return content;
  }
  const parts = content.split(/(Contact Page|Customer Support FAQ)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part === 'Contact Page') {
          return (
            <Link key={i} href={contactLink} className="text-[var(--color-gold)] underline font-medium">
              Contact Page
            </Link>
          );
        }
        if (part === 'Customer Support FAQ') {
          return (
            <Link key={i} href={faqLink} className="text-[var(--color-gold)] underline font-medium">
              Customer Support FAQ
            </Link>
          );
        }
        return part;
      })}
    </>
  );
}

export default async function TermsOfServicePage() {
  const siteContent = await getSiteContent();
  const termsContent = siteContent['terms-page'] || null;

  const badge = termsContent?.badge || 'Legal & Policy';
  const title = termsContent?.title || 'Terms of Service';
  const lastUpdated = termsContent?.lastUpdated || 'Last updated: January 2026';
  const contactLink = termsContent?.contactLink || '/contact';
  const faqLink = termsContent?.faqLink || '/faq';

  const sections = termsContent?.sections && termsContent.sections.length > 0
    ? termsContent.sections
    : [
        {
          id: 'sec-1',
          title: '1. General Overview',
          content: 'Welcome to Angelika Fashions. By visiting our site and/or purchasing handcrafted garments from us, you engage in our service and agree to be bound by the following terms and conditions.',
        },
        {
          id: 'sec-2',
          title: '2. Products and Handcrafted Variations',
          content: 'Our collections are handcrafted by skilled artisans. As each piece involves hand-block printing, hand-embroidery, and traditional weaving techniques, subtle variations in color, texture, and motif placement are intrinsic to authentic artisan craftsmanship and are not considered defects.',
        },
        {
          id: 'sec-3',
          title: '3. Pricing and Orders',
          content: 'All prices are listed in Indian Rupees (₹) inclusive of applicable taxes unless stated otherwise. We reserve the right to modify prices or discontinue items without prior notice.',
        },
        {
          id: 'sec-4',
          title: '4. Support & Questions',
          content: 'For any questions regarding these terms, please visit our Contact Page or reach out to us at Customer Support FAQ.',
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
                {renderContentWithLinks(section.content, contactLink, faqLink)}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
