import Link from 'next/link';
import type { Metadata } from 'next';
import { getSiteContent } from '@/lib/actions/site-content';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const content = siteContent['accessibility-page'] || null;

  return {
    title: content?.seo?.metaTitle || 'Accessibility Statement | Angelika Fashions',
    description:
      content?.seo?.metaDescription ||
      'Angelika Fashions is committed to digital accessibility and inclusivity for all clients.',
  };
}

function renderContent(content: string) {
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

  return (
    <p className="whitespace-pre-line text-sm sm:text-base leading-relaxed">
      {content}
    </p>
  );
}

export default async function AccessibilityPage() {
  const siteContent = await getSiteContent();
  const pageContent = siteContent['accessibility-page'] || null;

  const badge = pageContent?.badge || 'Inclusivity & Standards';
  const title = pageContent?.title || 'Accessibility Statement';
  const lastUpdated = pageContent?.lastUpdated || 'Last updated: January 2026';

  const sections =
    pageContent?.sections && pageContent.sections.length > 0
      ? pageContent.sections
      : [
          {
            id: 'sec-1',
            title: 'Our Dedication to Inclusivity',
            content:
              'At Angelika Fashions, we believe true luxury is welcoming and universally accessible. We are passionately committed to ensuring our digital atelier conforms to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA benchmarks, delivering a seamless experience for visitors of all abilities.',
          },
          {
            id: 'sec-2',
            title: 'Key Accessibility Initiatives',
            content:
              '• Clear Contrast & Typography: Carefully chosen color contrast ratios and legible type scales to ease readability across all devices.\n• Full Keyboard Navigation: All interactive elements, navigation dropdowns, modals, and checkout steps are fully operable via keyboard.\n• Assistive Technology Support: Comprehensive ARIA labels, semantic landmark regions, and descriptive alt attributes for screen readers.\n• Reduced Motion Accommodations: Respect for user system preferences regarding reduced animations and motion effects.',
          },
          {
            id: 'sec-3',
            title: 'Assisted Shopping Concierge',
            content:
              'If you experience any challenge navigating our site or require assistance completing an order, designer Vidhya and our concierge team are available to guide you personally via WhatsApp, phone, or email:',
          },
        ];

  const conciergeDesk = pageContent?.conciergeDesk || {
    showCard: true,
    title: 'Vidhya’s Direct Concierge Desk',
    email: 'concierge@angelikafashions.com',
    phone: '+91 98765 43210',
    phoneRaw: '919876543210',
    hours: 'Mon – Sat, 10:00 AM – 7:30 PM IST',
  };

  const rawPhone = conciergeDesk.phoneRaw || conciergeDesk.phone.replace(/[^0-9]/g, '');

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
          {sections.map((section, idx) => {
            const isLast = idx === sections.length - 1;

            return (
              <section key={section.id || idx} className="space-y-3">
                <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
                  {section.title}
                </h2>
                {renderContent(section.content)}

                {/* Show Concierge Desk Card on last section if enabled */}
                {isLast && (conciergeDesk.showCard ?? true) && (
                  <div className="p-4 rounded-lg bg-[var(--color-snow)] border border-[var(--color-whisper)] flex flex-col gap-2 not-prose mt-4">
                    <p className="font-semibold text-[var(--color-ink)]">
                      {conciergeDesk.title}
                    </p>
                    <p className="text-sm">
                      Email:{' '}
                      <a
                        href={`mailto:${conciergeDesk.email}`}
                        className="text-[var(--color-gold)] font-medium underline"
                      >
                        {conciergeDesk.email}
                      </a>
                    </p>
                    <p className="text-sm">
                      WhatsApp & Phone:{' '}
                      <a
                        href={`https://wa.me/${rawPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-gold)] font-medium underline"
                      >
                        {conciergeDesk.phone}
                      </a>
                    </p>
                    <p className="text-xs text-[var(--color-mist)]">
                      {conciergeDesk.hours}
                    </p>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
