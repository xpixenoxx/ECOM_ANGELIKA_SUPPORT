'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Accordion } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { FAQPageContent } from '@/lib/actions/site-content-types';

interface FaqClientProps {
  content: FAQPageContent;
}

export function FaqClient({ content }: FaqClientProps) {
  const {
    header = {
      badge: 'HELP CENTER',
      title: 'Frequently Asked Questions',
      description:
        "Quick answers to common questions. Can't find what you need? Chat with Vidhya or Meera on WhatsApp - they respond within hours.",
    },
    searchPlaceholder = 'Search questions...',
    categories = [],
    stillNeedHelp = {
      title: 'Still Need Help?',
      description:
        "Couldn't find your answer? Our team is here for you. No bots, no tickets - just real people who care.",
      whatsappButtonText: 'WhatsApp Us',
      whatsappLink: 'https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20have%20a%20question',
      emailButtonText: 'Email Us',
      emailLink: 'mailto:hello@angelikafashions.com',
      contactButtonText: 'Contact Form',
      contactLink: '/contact',
    },
  } = content || {};

  const initialCatId = categories[0]?.id || 'orders';
  const [activeCategory, setActiveCategory] = useState<string>(initialCatId);
  const [searchQuery, setSearchQuery] = useState('');

  const currentCategory =
    categories.find((c) => c.id === activeCategory) || categories[0];
  const currentItems = currentCategory?.items || [];

  const query = searchQuery.trim().toLowerCase();
  const filteredFAQs = currentItems.filter(
    (faq) =>
      faq.q.toLowerCase().includes(query) || faq.a.toLowerCase().includes(query)
  );

  return (
    <div className="min-h-screen bg-[var(--color-white)]">
      {/* Hero */}
      <section className="bg-[var(--color-snow)] border-b border-[var(--color-whisper)] py-16">
        <div className="container-custom px-6">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {header.badge && (
              <span className="inline-block px-4 py-1 bg-[var(--color-gold-light)] text-[var(--color-gold)] text-sm font-semibold rounded-[var(--radius-full)] mb-4">
                {header.badge}
              </span>
            )}
            <h1 className="text-[var(--font-display)] text-4xl md:text-5xl font-medium text-[var(--color-ink)] leading-tight mb-4">
              {header.title}
            </h1>
            {header.description && (
              <p className="text-[var(--color-slate)] text-lg leading-relaxed">
                {header.description}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Search & Categories */}
      <section className="py-8 bg-[var(--color-white)] border-b border-[var(--color-whisper)] sticky top-[72px] z-10 shadow-xs">
        <div className="container-custom px-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-mist)] pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <Input
                type="search"
                placeholder={searchPlaceholder || 'Search questions...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12"
                aria-label="Search FAQs"
              />
            </div>
            <div
              className="flex flex-wrap gap-2 justify-center"
              role="tablist"
              aria-label="FAQ Categories"
            >
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSearchQuery('');
                  }}
                  role="tab"
                  aria-selected={activeCategory === cat.id}
                  className="gap-2 rounded-[var(--radius-full)] whitespace-nowrap cursor-pointer"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-12">
        <div className="container-custom px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="h-16 w-16 mx-auto text-[var(--color-mist)] mb-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-[var(--font-display)] text-xl text-[var(--color-ink)] mb-2">
                    No Results Found
                  </h3>
                  <p className="text-[var(--color-slate)] mb-4">
                    Try a different search term or browse all categories.
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                </div>
              ) : (
                <Accordion
                  items={filteredFAQs.map((faq, index) => ({
                    id: `${activeCategory}-${faq.id || index}`,
                    title: faq.q,
                    content: (
                      <p className="text-[var(--color-slate)] leading-relaxed">{faq.a}</p>
                    ),
                  }))}
                  allowMultiple
                  variant="bordered"
                  className="space-y-3"
                />
              )}
            </motion.div>

            {/* Still need help */}
            {stillNeedHelp && (
              <motion.div
                className="mt-12 p-8 bg-[var(--color-ink)] rounded-[var(--radius-2xl)] text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="text-[var(--font-display)] text-2xl font-medium text-[var(--color-white)] mb-3">
                  {stillNeedHelp.title}
                </h3>
                {stillNeedHelp.description && (
                  <p className="text-[var(--color-white)]/70 mb-6 max-w-md mx-auto">
                    {stillNeedHelp.description}
                  </p>
                )}
                <div className="flex flex-wrap justify-center gap-4">
                  {stillNeedHelp.whatsappLink && (
                    <Button variant="primary" size="lg" asChild>
                      <a
                        href={stillNeedHelp.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.48-1.653-1.653-.173-.173-.447-.298-.644-.075-.198.199-.867.868-.967 1.164-.199.297-.247.496-.15.67.098.272.816.99 1.065 1.28.148.198.298.347.496.471.198.198.471.297.67.149l.767-.693c.272-.248.495-.373.57-.373.148 0 .297.149.372.373.149.423.448 1.272.94 1.988.463.68 1.255 1.165 1.475 1.288.198.124.272.223.397.198.149-.025.422-.248.57-.471.148-.223.172-.57.074-.766-.124-.198-.522-.692-1.018-1.307-.448-.57-1.14-1.294-1.717-1.815-.547-.5-.838-.766-.966-.866-.128-.099-.273-.099-.423 0-.15.074-.322.223-.495.372-.173.149-.347.198-.52.198-.174 0-.347-.099-.52-.247-.173-.148-.322-.247-.495-.247-.199 0-.372.098-.52.247l-.645.618c-.15.148-.173.297-.024.471.1.1.247.223.372.322.15.1.323.149.496.149.199 0 .397-.05.546-.149.148-.099.247-.248.296-.423.048-.173 0-.397-.024-.57-.024-.173-.024-.347-.074-.52-.149zM20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        {stillNeedHelp.whatsappButtonText || 'WhatsApp Us'}
                      </a>
                    </Button>
                  )}
                  {stillNeedHelp.emailLink && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-ink)]"
                      asChild
                    >
                      <a href={stillNeedHelp.emailLink}>
                        {stillNeedHelp.emailButtonText || 'Email Us'}
                      </a>
                    </Button>
                  )}
                  {stillNeedHelp.contactLink && (
                    <Button variant="outline" size="lg" asChild>
                      <a href={stillNeedHelp.contactLink}>
                        {stillNeedHelp.contactButtonText || 'Contact Form'}
                      </a>
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

