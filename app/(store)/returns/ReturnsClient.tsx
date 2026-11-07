'use client';

import React from 'react';
import Link from 'next/link';
import type { ReturnsPageContent } from '@/lib/actions/site-content-types';

export function ReturnsClient({ content }: { content: ReturnsPageContent }) {
  const { header, process, sections, concierge } = content;

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
            <span className="text-[var(--color-ink)] font-medium">Returns & Exchanges</span>
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

        {/* 3 Step Exchange Process Card */}
        {process && process.steps && process.steps.length > 0 && (
          <div className="mb-10 rounded-2xl bg-[#FCFAF7] border border-[#E5DECF] p-6 sm:p-8 shadow-[0_4px_20px_rgba(201,168,76,0.06)]">
            {process.title && (
              <h3 className="font-serif text-lg text-[var(--color-ink)] font-normal mb-6 text-center">
                {process.title}
              </h3>
            )}
            <div
              className={`grid grid-cols-1 ${
                process.steps.length === 2
                  ? 'sm:grid-cols-2'
                  : process.steps.length >= 3
                  ? 'sm:grid-cols-3'
                  : ''
              } gap-6 text-center`}
            >
              {process.steps.map((step, idx) => {
                const isMiddle = idx === 1 && process.steps.length === 3;
                return (
                  <div
                    key={idx}
                    className={`space-y-2 ${
                      isMiddle ? 'sm:border-x sm:border-[#EAE4D9] sm:px-4' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--color-gold-light)] text-[var(--color-gold)] font-serif font-bold text-base flex items-center justify-center mx-auto border border-[var(--color-gold)]/30">
                      {step.stepNumber || idx + 1}
                    </div>
                    <h4 className="font-semibold text-xs text-[var(--color-ink)] uppercase tracking-wider">
                      {step.title}
                    </h4>
                    <p className="text-xs text-[var(--color-slate)] leading-relaxed whitespace-pre-line">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Policy Sections */}
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
                  {section.bulletPoints && section.bulletPoints.length > 0 && (
                    <ul className="text-sm text-[var(--color-slate)] list-disc pl-5 space-y-1.5 mt-2">
                      {section.bulletPoints.map((point, pIdx) => (
                        <li key={pIdx} className="leading-relaxed">
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Quick Concierge CTA */}
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
              {concierge.secondaryCtaLink && concierge.secondaryCtaText && (
                <Link
                  href={concierge.secondaryCtaLink}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-[#E5DFD5] text-xs font-medium text-[var(--color-ink)] hover:border-[var(--color-gold)] transition-colors"
                >
                  {concierge.secondaryCtaText}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

