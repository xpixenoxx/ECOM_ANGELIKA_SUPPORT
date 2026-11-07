'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { SizeGuidePageContent } from '@/lib/actions/site-content-types';

interface SizeGuideClientProps {
  content: SizeGuidePageContent;
}

export function SizeGuideClient({ content }: SizeGuideClientProps) {
  const [activeCategory, setActiveCategory] = useState<'kurtis' | 'lehengas' | 'blouses'>('kurtis');

  const {
    header = {
      eyebrow: 'TAILORED FIT & MEASUREMENT CHARTS',
      title: 'Garment Size Guide',
      description:
        'Every body is unique. Angelika silhouettes are designed with generous 2-inch side seams for easy custom alterations, ensuring a bespoke drape that flatters your form.',
    },
    promoBanner = {
      eyebrow: 'AI SILHOUETTE ASSISTANT',
      title: 'Want instant recommendations based on your height and fit preference?',
      description: 'Answer 3 simple questions to calculate your exact Angelika sizing.',
      buttonText: 'Launch Interactive Size Finder →',
      buttonLink: '/size-finder',
    },
    kurtis = {
      title: 'Standard Ready-to-Wear Kurti Measurements (Inches)',
      subtitle: 'Measurements are garment dimensions',
      rows: [],
    },
    lehengas = {
      title: 'Bridal & Festive Lehenga Skirt Measurements (Inches)',
      subtitle: 'With drawstring waist + zipper closure',
      rows: [],
    },
    blouses = {
      title: 'Bespoke Blouse Stitching & Measurements',
      description:
        'All sarees and lehengas include unstitched pure silk blouse fabrics with zari borders. If you select our custom stitching service, our master drapers will tailor your choli according to your exact bust, underbust, armhole, and front/back neckline depth.',
      paddingNote:
        'Non-padded, soft contour padded, or double padded with concealed side/back hook placket.',
      seamNote:
        '2.5 inches of extra fabric margin included inside every blouse for future alterations.',
    },
    howToMeasure = {
      title: 'How to Take Accurate Body Measurements',
      steps: [],
    },
    stylingDesk = {
      eyebrow: 'BETWEEN SIZES OR NEED CUSTOM DRAPE GUIDANCE?',
      title: "Designer Vidhya's Personal Styling Desk",
      description:
        'Share your measurements with Vidhya on WhatsApp for custom tailored fit guidance before your order is cut.',
      buttonText: 'Consult Vidhya on WhatsApp →',
      whatsappLink:
        'https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20would%20like%20sizing%20guidance%20for%20my%20order.',
    },
  } = content || {};

  const kurtiRows = kurtis?.rows || [];
  const lehengaRows = lehengas?.rows || [];
  const measureSteps = howToMeasure?.steps || [];

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
            <span className="text-[var(--color-ink)] font-medium">Garment Size Guide</span>
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

        {/* Interactive Size Finder Promotion Banner */}
        {promoBanner && (
          <div className="mb-8 rounded-xl bg-[#FCFAF7] border border-[#E5DECF] p-5 shadow-[0_4px_20px_rgba(201,168,76,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              {promoBanner.eyebrow && (
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[var(--color-gold)]">
                  {promoBanner.eyebrow}
                </span>
              )}
              {promoBanner.title && (
                <h3 className="font-serif text-base text-[var(--color-ink)] font-medium">
                  {promoBanner.title}
                </h3>
              )}
              {promoBanner.description && (
                <p className="text-xs text-[var(--color-slate)]">{promoBanner.description}</p>
              )}
            </div>
            {promoBanner.buttonText && (
              <Link
                href={promoBanner.buttonLink || '/size-finder'}
                className="px-5 py-2.5 rounded-lg bg-[var(--color-ink)] text-white text-xs font-medium tracking-wide hover:bg-[#25221E] transition-colors flex-shrink-0"
              >
                {promoBanner.buttonText}
              </Link>
            )}
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex border-b border-[#EAE4D9] mb-6 gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory('kurtis')}
            className={`pb-3 px-4 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer border-b-2 ${
              activeCategory === 'kurtis'
                ? 'border-[var(--color-gold)] text-[var(--color-gold-hover)]'
                : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)]'
            }`}
          >
            Kurtis & Palazzo Sets
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('lehengas')}
            className={`pb-3 px-4 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer border-b-2 ${
              activeCategory === 'lehengas'
                ? 'border-[var(--color-gold)] text-[var(--color-gold-hover)]'
                : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)]'
            }`}
          >
            Festive Lehengas & Skirts
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('blouses')}
            className={`pb-3 px-4 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer border-b-2 ${
              activeCategory === 'blouses'
                ? 'border-[var(--color-gold)] text-[var(--color-gold-hover)]'
                : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)]'
            }`}
          >
            Cholis & Blouse Stitching
          </button>
        </div>

        {/* Measurement Table */}
        <div className="bg-white border border-[#EAE4D9] rounded-2xl p-6 sm:p-8 shadow-xs overflow-x-auto">
          {activeCategory === 'kurtis' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-4">
                <h3 className="font-serif text-lg text-[var(--color-ink)] font-normal">
                  {kurtis.title || 'Standard Ready-to-Wear Kurti Measurements (Inches)'}
                </h3>
                {kurtis.subtitle && (
                  <span className="text-xs text-[var(--color-mist)]">{kurtis.subtitle}</span>
                )}
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#EAE4D9] text-[var(--color-gold)] uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 font-semibold">Size</th>
                    <th className="py-3 px-4 font-semibold">Bust</th>
                    <th className="py-3 px-4 font-semibold">Waist</th>
                    <th className="py-3 px-4 font-semibold">Hip</th>
                    <th className="py-3 px-4 font-semibold">Shoulder</th>
                    <th className="py-3 px-4 font-semibold">Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE4D9]">
                  {kurtiRows.map((row, idx) => (
                    <tr key={`${row.size}-${idx}`} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="py-3 px-4 font-medium text-[var(--color-ink)]">{row.size}</td>
                      <td className="py-3 px-4 text-[var(--color-slate)]">{row.bust}</td>
                      <td className="py-3 px-4 text-[var(--color-slate)]">{row.waist}</td>
                      <td className="py-3 px-4 text-[var(--color-slate)]">{row.hip}</td>
                      <td className="py-3 px-4 text-[var(--color-slate)]">{row.shoulder}</td>
                      <td className="py-3 px-4 text-[var(--color-slate)]">{row.kurtiLength}</td>
                    </tr>
                  ))}
                  {kurtiRows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-xs text-[var(--color-slate)]">
                        No measurement rows defined.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeCategory === 'lehengas' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-4">
                <h3 className="font-serif text-lg text-[var(--color-ink)] font-normal">
                  {lehengas.title || 'Bridal & Festive Lehenga Skirt Measurements (Inches)'}
                </h3>
                {lehengas.subtitle && (
                  <span className="text-xs text-[var(--color-mist)]">{lehengas.subtitle}</span>
                )}
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#EAE4D9] text-[var(--color-gold)] uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 font-semibold">Size</th>
                    <th className="py-3 px-4 font-semibold">Waist (Inches)</th>
                    <th className="py-3 px-4 font-semibold">Hip (Inches)</th>
                    <th className="py-3 px-4 font-semibold">Skirt Length</th>
                    <th className="py-3 px-4 font-semibold">Ghera / Flare</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE4D9]">
                  {lehengaRows.map((row, idx) => (
                    <tr key={`${row.size}-${idx}`} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="py-3 px-4 font-medium text-[var(--color-ink)]">{row.size}</td>
                      <td className="py-3 px-4 text-[var(--color-slate)]">{row.waist}</td>
                      <td className="py-3 px-4 text-[var(--color-slate)]">{row.hip}</td>
                      <td className="py-3 px-4 text-[var(--color-slate)]">{row.skirtLength}</td>
                      <td className="py-3 px-4 text-[var(--color-slate)]">{row.flare}</td>
                    </tr>
                  ))}
                  {lehengaRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-xs text-[var(--color-slate)]">
                        No measurement rows defined.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeCategory === 'blouses' && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg text-[var(--color-ink)] font-normal">
                {blouses.title || 'Bespoke Blouse Stitching & Measurements'}
              </h3>
              {blouses.description && (
                <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                  {blouses.description}
                </p>
              )}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE4D9] text-xs text-[var(--color-slate)] space-y-1">
                {blouses.paddingNote && (
                  <p>
                    <strong className="text-[var(--color-ink)]">Padding Options:</strong>{' '}
                    {blouses.paddingNote}
                  </p>
                )}
                {blouses.seamNote && (
                  <p>
                    <strong className="text-[var(--color-ink)]">Seam Margins:</strong>{' '}
                    {blouses.seamNote}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* How to Measure Section */}
        {howToMeasure && (
          <div className="mt-8 bg-white border border-[#EAE4D9] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="font-serif text-xl text-[var(--color-ink)] font-normal">
              {howToMeasure.title || 'How to Take Accurate Body Measurements'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              {measureSteps.map((step, idx) => (
                <div key={idx} className="space-y-1.5">
                  <h4 className="font-semibold text-xs text-[var(--color-ink)] uppercase tracking-wider">
                    {step.title}
                  </h4>
                  <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vidhya Assistance Footer */}
        {stylingDesk && (
          <div className="mt-10 rounded-xl bg-[#FAF8F5] border border-[#E5DECF] p-6 text-center space-y-3">
            {stylingDesk.eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
                {stylingDesk.eyebrow}
              </p>
            )}
            <h3 className="font-serif text-xl text-[var(--color-ink)]">
              {stylingDesk.title}
            </h3>
            {stylingDesk.description && (
              <p className="text-xs text-[var(--color-slate)] max-w-lg mx-auto">
                {stylingDesk.description}
              </p>
            )}
            {stylingDesk.whatsappLink && (
              <div className="pt-2 flex justify-center">
                <a
                  href={stylingDesk.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--color-ink)] text-white text-xs font-medium tracking-wide hover:bg-[#25221E] transition-colors"
                >
                  {stylingDesk.buttonText || 'Consult Vidhya on WhatsApp →'}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

