'use client';

import React from 'react';
import Link from 'next/link';
import type { ShippingPageContent } from '@/lib/actions/site-content-types';

export function ShippingClient({ content }: { content: ShippingPageContent }) {
  const { header, highlights, sections, concierge } = content;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="mb-10 text-center sm:text-left">
          <nav
            className="text-xs text-[var(--color-slate)] mb-3 flex items-center justify-center sm:justify-start gap-2"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-[var(--color-gold)] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[var(--color-ink)] font-medium">Shipping Policy</span>
          </nav>
          {header.eyebrow && (
            <span className="text-[11px] font-semibold tracking-[0.24em] uppercase text-[var(--color-gold)] block mb-1">
              {header.eyebrow}
            </span>
          )}
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--color-ink)] font-normal tracking-tight">
            {header.title}
          </h1>
          {header.description && (
            <p className="mt-2 text-sm text-[var(--color-slate)] max-w-2xl font-light leading-relaxed">
              {header.description}
            </p>
          )}
        </div>

        {/* Highlight Banner */}
        {highlights && highlights.length > 0 && (
          <div className="mb-10 rounded-xl bg-[#FCFAF7] border border-[#E5DECF] p-6 shadow-[0_4px_20px_rgba(201,168,76,0.06)] grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {highlights.map((item, index) => {
              const isMiddle = index === 1 && highlights.length === 3;
              return (
                <div
                  key={index}
                  className={`space-y-1 ${
                    isMiddle ? 'sm:border-x sm:border-[#EAE4D9] sm:px-4' : ''
                  }`}
                >
                  <span className="text-xs font-semibold tracking-wider uppercase text-[var(--color-gold)] block">
                    {item.label}
                  </span>
                  <p className="text-lg font-serif font-medium text-[var(--color-ink)]">
                    {item.value}
                  </p>
                  <p className="text-xs text-[var(--color-slate)]">{item.subtext}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Content Sections */}
        {sections && sections.length > 0 && (
          <div className="space-y-8 bg-white border border-[#EAE4D9] rounded-2xl p-6 sm:p-10 shadow-xs">
            {sections.map((section, idx) => (
              <React.Fragment key={section.id || idx}>
                {idx > 0 && <hr className="border-[#EAE4D9]" />}
                <section id={section.id} className="space-y-3">
                  <h2 className="font-serif text-xl text-[var(--color-ink)] font-medium">
                    {section.title}
                  </h2>
                  <p className="text-sm text-[var(--color-slate)] leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                  {section.tierBoxes && section.tierBoxes.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      {section.tierBoxes.map((box, bIdx) => (
                        <div
                          key={bIdx}
                          className="p-4 rounded-lg bg-[#FAF8F5] border border-[#EAE4D9]"
                        >
                          <h4 className="font-semibold text-xs text-[var(--color-ink)] uppercase tracking-wider mb-1">
                            {box.title}
                          </h4>
                          <p className="text-xs text-[var(--color-slate)] leading-relaxed whitespace-pre-line">
                            {box.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Assistance Concierge CTA */}
        {concierge && (
          <div className="mt-10 rounded-xl bg-[#FAF8F5] border border-[#E5DECF] p-6 text-center space-y-3">
            {concierge.eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
                {concierge.eyebrow}
              </p>
            )}
            <h3 className="font-serif text-xl text-[var(--color-ink)]">
              {concierge.title}
            </h3>
            {concierge.description && (
              <p className="text-xs text-[var(--color-slate)] max-w-lg mx-auto">
                {concierge.description}
              </p>
            )}
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              {concierge.whatsappLink && concierge.whatsappText && (
                <a
                  href={concierge.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-ink)] text-white text-xs font-medium tracking-wide hover:bg-[#25221E] transition-colors"
                >
                  {concierge.whatsappText}
                </a>
              )}
              {concierge.trackOrderLink && concierge.trackOrderText && (
                <Link
                  href={concierge.trackOrderLink}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-[#E5DFD5] text-xs font-medium text-[var(--color-ink)] hover:border-[var(--color-gold)] transition-colors"
                >
                  {concierge.trackOrderText}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

