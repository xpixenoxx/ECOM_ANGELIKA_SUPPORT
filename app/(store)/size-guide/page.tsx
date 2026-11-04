'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface SizeRow {
  size: string;
  bust: string;
  waist: string;
  hip: string;
  shoulder: string;
  kurtiLength: string;
}

const kurtiSizesInches: SizeRow[] = [
  { size: 'XS (34)', bust: '34"', waist: '28"', hip: '38"', shoulder: '14.0"', kurtiLength: '44"' },
  { size: 'S (36)', bust: '36"', waist: '30"', hip: '40"', shoulder: '14.5"', kurtiLength: '45"' },
  { size: 'M (38)', bust: '38"', waist: '32"', hip: '42"', shoulder: '15.0"', kurtiLength: '45"' },
  { size: 'L (40)', bust: '40"', waist: '34"', hip: '44"', shoulder: '15.5"', kurtiLength: '46"' },
  { size: 'XL (42)', bust: '42"', waist: '36"', hip: '46"', shoulder: '16.0"', kurtiLength: '46"' },
  { size: 'XXL (44)', bust: '44"', waist: '38"', hip: '48"', shoulder: '16.5"', kurtiLength: '47"' },
  { size: '3XL (46)', bust: '46"', waist: '40"', hip: '50"', shoulder: '17.0"', kurtiLength: '47"' },
];

const lehengaSizesInches = [
  { size: 'XS (26)', waist: '26"', hip: '36"', skirtLength: '42"', flare: '4.5 Meters' },
  { size: 'S (28)', waist: '28"', hip: '38"', skirtLength: '42"', flare: '4.5 Meters' },
  { size: 'M (30)', waist: '30"', hip: '40"', skirtLength: '43"', flare: '5.0 Meters' },
  { size: 'L (32)', waist: '32"', hip: '42"', skirtLength: '43"', flare: '5.0 Meters' },
  { size: 'XL (34)', waist: '34"', hip: '44"', skirtLength: '44"', flare: '5.5 Meters' },
  { size: 'XXL (36)', waist: '36"', hip: '46"', skirtLength: '44"', flare: '5.5 Meters' },
];

export default function SizeGuidePage() {
  const [activeCategory, setActiveCategory] = useState<'kurtis' | 'lehengas' | 'blouses'>('kurtis');

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumb & Title */}
        <div className="mb-10 text-center sm:text-left">
          <nav className="text-xs text-[var(--color-slate)] mb-3 flex items-center justify-center sm:justify-start gap-2" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[var(--color-gold)] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[var(--color-ink)] font-medium">Garment Size Guide</span>
          </nav>
          <span className="text-[11px] font-semibold tracking-[0.24em] uppercase text-[var(--color-gold)] block mb-1">
            Tailored Fit & Measurement Charts
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--color-ink)] font-normal tracking-tight">
            Garment Size Guide
          </h1>
          <p className="mt-2 text-sm text-[var(--color-slate)] max-w-2xl font-light leading-relaxed">
            Every body is unique. Angelika silhouettes are designed with generous 2-inch side seams for easy custom alterations, ensuring a bespoke drape that flatters your form.
          </p>
        </div>

        {/* Interactive Size Finder Promotion Banner */}
        <div className="mb-8 rounded-xl bg-[#FCFAF7] border border-[#E5DECF] p-5 shadow-[0_4px_20px_rgba(201,168,76,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-[var(--color-gold)]">
              AI Silhouette Assistant
            </span>
            <h3 className="font-serif text-base text-[var(--color-ink)] font-medium">
              Want instant recommendations based on your height and fit preference?
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Answer 3 simple questions to calculate your exact Angelika sizing.
            </p>
          </div>
          <Link
            href="/size-finder"
            className="px-5 py-2.5 rounded-lg bg-[var(--color-ink)] text-white text-xs font-medium tracking-wide hover:bg-[#25221E] transition-colors flex-shrink-0"
          >
            Launch Interactive Size Finder →
          </Link>
        </div>

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
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg text-[var(--color-ink)] font-normal">
                  Standard Ready-to-Wear Kurti Measurements (Inches)
                </h3>
                <span className="text-xs text-[var(--color-mist)]">Measurements are garment dimensions</span>
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
                  {kurtiSizesInches.map((row) => (
                    <tr key={row.size} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="py-3 px-4 font-medium text-[var(--color-ink)]">{row.size}</td>
                      <td className="py-3 px-4 text-[var(--color-slate)]">{row.bust}</td>
                      <td className="py-3 px-4 text-[var(--color-slate)]">{row.waist}</td>
                      <td className="py-3 px-4 text-[var(--color-slate)]">{row.hip}</td>
                      <td className="py-3 px-4 text-[var(--color-slate)]">{row.shoulder}</td>
                      <td className="py-3 px-4 text-[var(--color-slate)]">{row.kurtiLength}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeCategory === 'lehengas' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg text-[var(--color-ink)] font-normal">
                  Bridal & Festive Lehenga Skirt Measurements (Inches)
                </h3>
                <span className="text-xs text-[var(--color-mist)]">With drawstring waist + zipper closure</span>
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
                  {lehengaSizesInches.map((row) => (
                    <tr key={row.size} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="py-3 px-4 font-medium text-[var(--color-ink)]">{row.size}</td>
                      <td className="py-3 px-4 text-[var(--color-slate)]">{row.waist}</td>
                      <td className="py-3 px-4 text-[var(--color-slate)]">{row.hip}</td>
                      <td className="py-3 px-4 text-[var(--color-slate)]">{row.skirtLength}</td>
                      <td className="py-3 px-4 text-[var(--color-slate)]">{row.flare}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeCategory === 'blouses' && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg text-[var(--color-ink)] font-normal">
                Bespoke Blouse Stitching & Measurements
              </h3>
              <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                All sarees and lehengas include unstitched pure silk blouse fabrics with zari borders. If you select our custom stitching service, our master drapers will tailor your choli according to your exact bust, underbust, armhole, and front/back neckline depth.
              </p>
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE4D9] text-xs text-[var(--color-slate)] space-y-1">
                <p><strong className="text-[var(--color-ink)]">Padding Options:</strong> Non-padded, soft contour padded, or double padded with concealed side/back hook placket.</p>
                <p><strong className="text-[var(--color-ink)]">Seam Margins:</strong> 2.5 inches of extra fabric margin included inside every blouse for future alterations.</p>
              </div>
            </div>
          )}
        </div>

        {/* How to Measure Section */}
        <div className="mt-8 bg-white border border-[#EAE4D9] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="font-serif text-xl text-[var(--color-ink)] font-normal">
            How to Take Accurate Body Measurements
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="space-y-1.5">
              <h4 className="font-semibold text-xs text-[var(--color-ink)] uppercase tracking-wider">
                1. Bust / Chest
              </h4>
              <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                Measure around the fullest part of your bust, keeping the measuring tape parallel to the floor without pulling tight.
              </p>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-semibold text-xs text-[var(--color-ink)] uppercase tracking-wider">
                2. Natural Waist
              </h4>
              <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                Measure around the narrowest part of your waistline, roughly 1 to 2 inches above your navel.
              </p>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-semibold text-xs text-[var(--color-ink)] uppercase tracking-wider">
                3. Hip Circumference
              </h4>
              <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                Stand with feet together and measure around the fullest curve of your hips and buttocks.
              </p>
            </div>
          </div>
        </div>

        {/* Vidhya Assistance Footer */}
        <div className="mt-10 rounded-xl bg-[#FAF8F5] border border-[#E5DECF] p-6 text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
            Between sizes or need custom drape guidance?
          </p>
          <h3 className="font-serif text-xl text-[var(--color-ink)]">
            Designer Vidhya's Personal Styling Desk
          </h3>
          <p className="text-xs text-[var(--color-slate)] max-w-lg mx-auto">
            Share your measurements with Vidhya on WhatsApp for custom tailored fit guidance before your order is cut.
          </p>
          <div className="pt-2 flex justify-center">
            <a
              href="https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20would%20like%20sizing%20guidance%20for%20my%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--color-ink)] text-white text-xs font-medium tracking-wide hover:bg-[#25221E] transition-colors"
            >
              Consult Vidhya on WhatsApp →
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
