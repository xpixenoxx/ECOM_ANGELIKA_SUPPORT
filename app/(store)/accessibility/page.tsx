import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility Statement | Angelika Fashions',
  description: 'Angelika Fashions is committed to digital accessibility and inclusivity for all clients.',
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-[var(--color-white)] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-gold)]">
            Inclusivity & Standards
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-ink)] mt-1">
            Accessibility Statement
          </h1>
          <p className="text-sm text-[var(--color-slate)] mt-2">
            Last updated: January 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-[var(--color-slate)] space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
              Our Dedication to Inclusivity
            </h2>
            <p>
              At Angelika Fashions, we believe true luxury is welcoming and universally accessible. We are passionately committed to ensuring our digital atelier conforms to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA benchmarks, delivering a seamless experience for visitors of all abilities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
              Key Accessibility Initiatives
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-[var(--color-ink)]">Clear Contrast & Typography:</strong> Carefully chosen color contrast ratios and legible type scales to ease readability across all devices.
              </li>
              <li>
                <strong className="text-[var(--color-ink)]">Full Keyboard Navigation:</strong> All interactive elements, navigation dropdowns, modals, and checkout steps are fully operable via keyboard.
              </li>
              <li>
                <strong className="text-[var(--color-ink)]">Assistive Technology Support:</strong> Comprehensive ARIA labels, semantic landmark regions, and descriptive alt attributes for screen readers.
              </li>
              <li>
                <strong className="text-[var(--color-ink)]">Reduced Motion Accommodations:</strong> Respect for user system preferences regarding reduced animations and motion effects.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
              Assisted Shopping Concierge
            </h2>
            <p>
              If you experience any challenge navigating our site or require assistance completing an order, designer Vidhya and our concierge team are available to guide you personally via WhatsApp, phone, or email:
            </p>
            <div className="p-4 rounded-lg bg-[var(--color-snow)] border border-[var(--color-whisper)] flex flex-col gap-2">
              <p className="font-semibold text-[var(--color-ink)]">Vidhya’s Direct Concierge Desk</p>
              <p>Email: <a href="mailto:concierge@angelikafashions.com" className="text-[var(--color-gold)] font-medium underline">concierge@angelikafashions.com</a></p>
              <p>WhatsApp & Phone: <a href="https://wa.me/919876543210" className="text-[var(--color-gold)] font-medium underline">+91 98765 43210</a></p>
              <p className="text-xs text-[var(--color-mist)]">Mon – Sat, 10:00 AM – 7:30 PM IST</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
