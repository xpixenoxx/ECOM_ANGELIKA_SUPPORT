import Link from 'next/link';
import type { Metadata } from 'next';
import { getSiteContent } from '@/lib/actions/site-content';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const cookiesContent = siteContent['cookies-page'] || null;

  return {
    title: cookiesContent?.seo?.metaTitle || 'Cookie Policy | Angelika Fashions',
    description:
      cookiesContent?.seo?.metaDescription ||
      'Understand how Angelika Fashions utilizes cookies to provide an elevated browsing and bespoke shopping experience.',
  };
}

function renderContent(content: string, conciergeEmail: string, contactLink: string) {
  const lines = content.split('\n').filter(Boolean);
  const isBulletList = lines.every((line) => line.trim().startsWith('•') || line.trim().startsWith('-'));

  if (isBulletList) {
    return (
      <ul className="list-disc pl-5 space-y-2">
        {lines.map((line, idx) => {
          const cleanLine = line.replace(/^[•\-]\s*/, '').trim();
          const colonIdx = cleanLine.indexOf(':');
          if (colonIdx !== -1) {
            const title = cleanLine.substring(0, colonIdx + 1);
            const desc = cleanLine.substring(colonIdx + 1);
            return (
              <li key={idx}>
                <strong className="text-[var(--color-ink)]">{title}</strong>
                {desc}
              </li>
            );
          }
          return <li key={idx}>{cleanLine}</li>;
        })}
      </ul>
    );
  }

  if (conciergeEmail && content.includes(conciergeEmail)) {
    const parts = content.split(conciergeEmail);
    const targetHref =
      contactLink.startsWith('http') || contactLink.startsWith('/')
        ? contactLink
        : `mailto:${conciergeEmail}`;

    return (
      <p className="whitespace-pre-line text-sm sm:text-base leading-relaxed">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <Link
                href={targetHref}
                className="text-[var(--color-gold)] underline font-medium hover:opacity-85 transition-opacity"
              >
                {conciergeEmail}
              </Link>
            )}
          </span>
        ))}
      </p>
    );
  }

  return (
    <p className="whitespace-pre-line text-sm sm:text-base leading-relaxed">
      {content}
    </p>
  );
}

export default async function CookiePolicyPage() {
  const siteContent = await getSiteContent();
  const cookiesContent = siteContent['cookies-page'] || null;

  const badge = cookiesContent?.badge || 'Legal & Policy';
  const title = cookiesContent?.title || 'Cookie Policy';
  const lastUpdated = cookiesContent?.lastUpdated || 'Last updated: January 2026';
  const conciergeEmail = cookiesContent?.conciergeEmail || 'concierge@angelikafashions.com';
  const contactLink = cookiesContent?.contactLink || '/contact';

  const sections =
    cookiesContent?.sections && cookiesContent.sections.length > 0
      ? cookiesContent.sections
      : [
          {
            id: 'sec-1',
            title: '1. What Are Cookies?',
            content:
              'Cookies are small encrypted text files stored on your browser or device when you explore the Angelika Fashions digital atelier. They allow our website to recognize your preferences, remember your bag and wishlist selections, and deliver a tailored luxury shopping experience.',
          },
          {
            id: 'sec-2',
            title: '2. Categories of Cookies We Employ',
            content:
              '• Essential Atelier Cookies: Vital for core functions such as shopping bag persistence, secure user authentication, and checkout flow.\n• Preference & Craft Cookies: Remember your selected size recommendations, currency settings, and recently viewed heirloom designs.\n• Analytical Performance Cookies: Help us anonymously evaluate how clients interact with collections and discover ways to optimize navigation speed.',
          },
          {
            id: 'sec-3',
            title: '3. Managing Your Cookie Preferences',
            content:
              'You have complete autonomy over your cookie preferences. You can adjust your browser settings to decline or clear cookies at any time. Please note that disabling essential cookies may impact certain concierge and checkout features on our atelier platform.',
          },
          {
            id: 'sec-4',
            title: '4. Concierge Enquiries',
            content:
              'For further questions regarding our cookie protocols or data protection practices, please connect with our concierge team at concierge@angelikafashions.com.',
          },
        ];

  return (
    <div className="min-h-screen bg-[var(--color-white)] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          {badge && (
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-gold)]">
              {badge}
            </span>
          )}
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
              {renderContent(section.content, conciergeEmail, contactLink)}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
