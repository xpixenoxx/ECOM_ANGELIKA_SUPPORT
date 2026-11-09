'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { cn } from '@/lib/utils/cn';
import type { SizeFinderPageContent, SizeFinderSilhouette } from '@/lib/actions/site-content-types';

/* =========================================================================
   SILHOUETTES & ATELIER PROPORTIONS DATA
   ========================================================================= */

type UnitType = 'inches' | 'cm';
type FinderMode = 'smart' | 'tape';

const DEFAULT_SILHOUETTES: SizeFinderSilhouette[] = [
  {
    id: 'kurtis',
    name: 'Kurtis & Tunics',
    tagline: 'Straight cuts, A-line & kalidar everyday luxury',
    image: '/images/cat-kurtis.jpg',
    defaultLengthInches: 43,
    sizes: [
      { size: 'XS', bust: 32, waist: 26, hips: 36, length: 42, shoulder: 14.0, label: 'XS (Size 32)' },
      { size: 'S', bust: 34, waist: 28, hips: 38, length: 42, shoulder: 14.5, label: 'S (Size 34)' },
      { size: 'M', bust: 36, waist: 30, hips: 40, length: 43, shoulder: 15.0, label: 'M (Size 36)' },
      { size: 'L', bust: 38, waist: 32, hips: 42, length: 43, shoulder: 15.5, label: 'L (Size 38)' },
      { size: 'XL', bust: 40, waist: 34, hips: 44, length: 44, shoulder: 16.0, label: 'XL (Size 40)' },
      { size: 'XXL', bust: 42, waist: 36, hips: 46, length: 44, shoulder: 16.5, label: 'XXL (Size 42)' },
      { size: '3XL', bust: 44, waist: 38, hips: 48, length: 45, shoulder: 17.0, label: '3XL (Size 44)' },
    ],
  },
  {
    id: 'salwars',
    name: 'Salwar & Palazzo Suits',
    tagline: 'Three-piece sets with relaxed palazzo or churidar',
    image: '/images/cat-salwars.jpg',
    defaultLengthInches: 43,
    sizes: [
      { size: 'XS', bust: 34, waist: 28, hips: 38, length: 42, shoulder: 14.0, label: 'XS (Size 34)' },
      { size: 'S', bust: 36, waist: 30, hips: 40, length: 42, shoulder: 14.5, label: 'S (Size 36)' },
      { size: 'M', bust: 38, waist: 32, hips: 42, length: 43, shoulder: 15.0, label: 'M (Size 38)' },
      { size: 'L', bust: 40, waist: 34, hips: 44, length: 43, shoulder: 15.5, label: 'L (Size 40)' },
      { size: 'XL', bust: 42, waist: 36, hips: 46, length: 44, shoulder: 16.0, label: 'XL (Size 42)' },
      { size: 'XXL', bust: 44, waist: 38, hips: 48, length: 44, shoulder: 16.5, label: 'XXL (Size 44)' },
    ],
  },
  {
    id: 'lehengas',
    name: 'Bridal & Festive Lehengas',
    tagline: 'High-waisted flared skirt with tailored padded choli',
    image: '/images/cat-lehengas.jpg',
    defaultLengthInches: 43,
    sizes: [
      { size: 'XS', bust: 32, waist: 26, hips: 36, length: 42, shoulder: 13.5, label: 'XS (Waist 26")' },
      { size: 'S', bust: 34, waist: 28, hips: 38, length: 42, shoulder: 14.0, label: 'S (Waist 28")' },
      { size: 'M', bust: 36, waist: 30, hips: 40, length: 43, shoulder: 14.5, label: 'M (Waist 30")' },
      { size: 'L', bust: 38, waist: 32, hips: 42, length: 43, shoulder: 15.0, label: 'L (Waist 32")' },
      { size: 'XL', bust: 40, waist: 34, hips: 44, length: 44, shoulder: 15.5, label: 'XL (Waist 34")' },
      { size: 'XXL', bust: 42, waist: 36, hips: 46, length: 44, shoulder: 16.0, label: 'XXL (Waist 36")' },
    ],
  },
  {
    id: 'sarees',
    name: 'Sarees & Blouse Styling',
    tagline: '5.5m unstitched drape with customized silk choli',
    image: '/images/cat-sarees.jpg',
    defaultLengthInches: 216,
    isFreeSize: true,
    freeSizeNote: 'Sarees are standard 5.5m Free Size drape. Sizing applies to your tailored blouse stitching.',
    sizes: [
      { size: 'XS', bust: 32, waist: 26, hips: 36, length: 14, shoulder: 13.5, label: 'Blouse XS (32")' },
      { size: 'S', bust: 34, waist: 28, hips: 38, length: 14.5, shoulder: 14.0, label: 'Blouse S (34")' },
      { size: 'M', bust: 36, waist: 30, hips: 40, length: 15, shoulder: 14.5, label: 'Blouse M (36")' },
      { size: 'L', bust: 38, waist: 32, hips: 42, length: 15.5, shoulder: 15.0, label: 'Blouse L (38")' },
      { size: 'XL', bust: 40, waist: 34, hips: 44, length: 16, shoulder: 15.5, label: 'Blouse XL (40")' },
      { size: 'XXL', bust: 42, waist: 36, hips: 46, length: 16.5, shoulder: 16.0, label: 'Blouse XXL (42")' },
    ],
  },
  {
    id: 'dupattas',
    name: 'Artisanal Dupattas',
    tagline: 'Handwoven 2.5m pure silk & chanderi stoles',
    image: '/images/cat-dupattas.jpg',
    defaultLengthInches: 98,
    isFreeSize: true,
    freeSizeNote: 'Dupattas are universal Free Size (2.5 Meters x 1 Meter). No sizing required.',
    sizes: [
      { size: 'Free Size', bust: 0, waist: 0, hips: 0, length: 98, shoulder: 0, label: 'Universal 2.5m Drape' },
    ],
  },
];

const HIGH_STREET_SIZES = [
  { id: 'XS', label: 'XS', sublabel: 'UK 6 / US 2 / 32' },
  { id: 'S', label: 'S', sublabel: 'UK 8 / US 4 / 34' },
  { id: 'M', label: 'M', sublabel: 'UK 10 / US 6 / 36' },
  { id: 'L', label: 'L', sublabel: 'UK 12 / US 8 / 38' },
  { id: 'XL', label: 'XL', sublabel: 'UK 14 / US 10 / 40' },
  { id: 'XXL', label: 'XXL', sublabel: 'UK 16 / US 12 / 42' },
  { id: '3XL', label: '3XL', sublabel: 'UK 18 / US 14 / 44' },
];

const HEIGHT_CATEGORIES = [
  { id: 'petite', label: 'Petite', range: "Below 5'3\" (Under 160 cm)", hemlineNote: 'Hem adjusted 2" shorter to prevent tripping' },
  { id: 'regular', label: 'Classic', range: "5'3\" – 5'6\" (160 – 168 cm)", hemlineNote: 'Standard bespoke floor & ankle drop' },
  { id: 'tall', label: 'Statuesque', range: "5'7\" & Above (170+ cm)", hemlineNote: 'Extra 2.5" length margin provided in hem' },
];

const SILHOUETTE_PROFILES = [
  { id: 'hourglass', label: 'Hourglass', desc: 'Bust & hips proportional with defined waist' },
  { id: 'pear', label: 'Pear / Curvy Hip', desc: 'Hips wider than bust; extra hip ease added' },
  { id: 'apple', label: 'Apple / Fuller Bust', desc: 'Fuller bust/midriff; generous chest ease' },
  { id: 'straight', label: 'Straight / Athletic', desc: 'Balanced shoulder, waist, and hip contour' },
];

const DRAPE_STYLES = [
  { id: 'contoured', label: 'Contoured Drape', desc: 'Skims the torso cleanly with minimal ease' },
  { id: 'classic', label: 'Classic Atelier Ease', desc: 'Comfortable movement with 2.5" seam safety (Recommended)' },
  { id: 'flowing', label: 'Royal Flowing', desc: 'Generous, breezy volume for majestic movement' },
];

/* =========================================================================
   MAIN BESPOKE FIT STUDIO CLIENT
   ========================================================================= */

export function SizeFinderClient({ content }: { content: SizeFinderPageContent }) {
  const { header, studio, silhouettes: rawSilhouettes, virtualCall, guide } = content;
  const SILHOUETTES: SizeFinderSilhouette[] = (rawSilhouettes && rawSilhouettes.length > 0)
    ? rawSilhouettes
    : DEFAULT_SILHOUETTES;

  const [activeTab, setActiveTab] = useState<'finder' | 'directory' | 'guide'>('finder');
  const [finderMode, setFinderMode] = useState<FinderMode>('smart');
  const [unit, setUnit] = useState<UnitType>('inches');

  // Selected Silhouette
  const [selectedSilhouette, setSelectedSilhouette] = useState<string>(
    SILHOUETTES[0]?.id || 'kurtis'
  );

  // Mode A: Smart Brand Match
  const [standardBrandSize, setStandardBrandSize] = useState<string>('M');
  const [heightCategory, setHeightCategory] = useState<string>('regular');
  const [bodySilhouette, setBodySilhouette] = useState<string>('hourglass');
  const [drapeStyle, setDrapeStyle] = useState<string>('classic');

  // Mode B: Exact Tape Measurements
  const [bustVal, setBustVal] = useState<number>(36);
  const [waistVal, setWaistVal] = useState<number>(30);
  const [hipsVal, setHipsVal] = useState<number>(40);

  // Computed Fit Diagnosis
  const [fitResult, setFitResult] = useState<{
    recommendedSize: string;
    sizeLabel: string;
    fitScore: number;
    bustRange: string;
    waistRange: string;
    hipsRange: string;
    tailoringTip: string;
    hemlineAdvice: string;
  }>({
    recommendedSize: 'M',
    sizeLabel: 'Size M (36")',
    fitScore: 98,
    bustRange: '36" – 38"',
    waistRange: '30" – 32"',
    hipsRange: '40" – 42"',
    tailoringTip: 'Includes 2.5" side seam margin for custom adjustments.',
    hemlineAdvice: 'Calibrated for standard graceful drape.',
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Recalculate Recommendation Whenever Inputs Change
  useEffect(() => {
    const silhouette = SILHOUETTES.find((s) => s.id === selectedSilhouette) || SILHOUETTES[0] || DEFAULT_SILHOUETTES[0]!;

    if (silhouette.isFreeSize && selectedSilhouette === 'dupattas') {
      setFitResult({
        recommendedSize: 'Free Size',
        sizeLabel: 'Universal Drape (2.5 Meters)',
        fitScore: 100,
        bustRange: 'N/A',
        waistRange: 'N/A',
        hipsRange: 'N/A',
        tailoringTip: 'Dupattas require zero tailoring. Handwoven to 2.5m luxury length.',
        hemlineAdvice: 'Universal styling for all heights.',
      });
      return;
    }

    let calculatedSize = 'M';
    let matchScore = 96;

    if (finderMode === 'smart') {
      calculatedSize = standardBrandSize;

      // Adjust for body silhouette
      if (bodySilhouette === 'pear' && ['XS', 'S', 'M', 'L'].includes(standardBrandSize) && selectedSilhouette !== 'sarees') {
        const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
        const idx = order.indexOf(standardBrandSize);
        if (drapeStyle === 'contoured') {
          calculatedSize = standardBrandSize;
          matchScore = 94;
        } else if (idx < order.length - 1) {
          calculatedSize = order[idx + 1]!;
          matchScore = 97;
        }
      }

      if (drapeStyle === 'flowing') {
        matchScore = 99;
      }
    } else {
      // Tape Mode: match against bust (or waist for lehengas)
      const targetBust = unit === 'cm' ? bustVal / 2.54 : bustVal;
      const targetWaist = unit === 'cm' ? waistVal / 2.54 : waistVal;

      let closest = silhouette.sizes[0] || { size: 'M', bust: 36, waist: 30, hips: 40, length: 43, shoulder: 15, label: 'M' };
      let minDiff = Infinity;

      silhouette.sizes.forEach((s) => {
        const diff = selectedSilhouette === 'lehengas'
          ? Math.abs(targetWaist - s.waist)
          : Math.abs(targetBust - s.bust);
        if (diff < minDiff) {
          minDiff = diff;
          closest = s;
        }
      });

      calculatedSize = closest.size;
      matchScore = Math.max(88, Math.min(99, Math.round(100 - minDiff * 2)));
    }

    const matchedSizeRow = silhouette.sizes.find((s) => s.size === calculatedSize) || silhouette.sizes[2] || silhouette.sizes[0] || { label: 'Size M', bust: 36, waist: 30, hips: 40 };
    const heightProfile = HEIGHT_CATEGORIES.find((h) => h.id === heightCategory);

    setFitResult({
      recommendedSize: calculatedSize,
      sizeLabel: matchedSizeRow.label,
      fitScore: matchScore,
      bustRange: `${matchedSizeRow.bust}" – ${matchedSizeRow.bust + 2}"`,
      waistRange: `${matchedSizeRow.waist}" – ${matchedSizeRow.waist + 2}"`,
      hipsRange: `${matchedSizeRow.hips}" – ${matchedSizeRow.hips + 2}"`,
      tailoringTip: `Crafted with 2.5" internal handloom margin. ${silhouette.tagline}.`,
      hemlineAdvice: heightProfile?.hemlineNote || 'Standard bespoke floor & ankle drop.',
    });
  }, [selectedSilhouette, finderMode, standardBrandSize, heightCategory, bodySilhouette, drapeStyle, bustVal, waistVal, hipsVal, unit, SILHOUETTES]);

  // Toast Timer
  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  const handleSaveProfile = () => {
    try {
      localStorage.setItem(
        'angelika_fit_profile',
        JSON.stringify({
          silhouette: selectedSilhouette,
          recommendedSize: fitResult.recommendedSize,
          height: heightCategory,
          bodySilhouette,
          savedAt: new Date().toISOString(),
        })
      );
      setToastMsg('Your Bespoke Fit Profile has been saved to this device.');
    } catch {
      setToastMsg('Saved to current session.');
    }
  };

  const currentSilhouette = SILHOUETTES.find((s) => s.id === selectedSilhouette) || SILHOUETTES[0] || DEFAULT_SILHOUETTES[0]!;

  const whatsappMessage = encodeURIComponent(
    `Hi Vidhya, I used the Angelika Couture Fit Studio:\n` +
      `Silhouette: ${currentSilhouette.name}\n` +
      `Recommended Size: Size ${fitResult.recommendedSize}\n` +
      `Height: ${heightCategory}\n` +
      `Body Type: ${bodySilhouette}\n` +
      `Can you advise if this ensemble will drape immaculately on me?`
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[var(--color-ink)] py-12 md:py-20">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 px-5 py-3 rounded-xl bg-[var(--color-ink)] text-white text-xs border border-[var(--color-gold)] shadow-xl flex items-center gap-2"
          >
            <span className="text-[var(--color-gold)] font-bold">✓</span>
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* =============================================================
            ATELIER EDITORIAL HEADER
            ============================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <nav className="text-xs text-[var(--color-slate)] mb-3 flex items-center justify-center gap-2" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[var(--color-gold)] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[var(--color-ink)] font-medium">Couture Fit Studio</span>
          </nav>
          
          {header.badge && header.badge.trim() !== '' && header.badge !== "Vidhya's Bespoke Drape & Silhouette Studio" && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5DECF] shadow-2xs mb-3">
              <span className="text-[var(--color-gold)] text-xs">⚜</span>
              <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[var(--color-gold)]">
                {header.badge}
              </span>
            </div>
          )}

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[var(--color-ink)] font-normal tracking-tight leading-tight">
            {header.title}
          </h1>

          {header.description && (
            <p className="mt-3 text-sm text-[var(--color-slate)] font-light leading-relaxed max-w-2xl mx-auto">
              {header.description}
            </p>
          )}

          {/* Primary Top Tab Selector */}
          <div className="mt-8 inline-flex p-1 rounded-xl bg-white border border-[#E5DFD5] shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('finder')}
              className={cn(
                'px-5 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer',
                activeTab === 'finder'
                  ? 'bg-[var(--color-ink)] text-white shadow-xs'
                  : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
              )}
            >
              Interactive Fit Studio
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className={cn(
                'px-5 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer',
                activeTab === 'directory'
                  ? 'bg-[var(--color-ink)] text-white shadow-xs'
                  : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
              )}
            >
              Artisan Size Directory
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={cn(
                'px-5 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer',
                activeTab === 'guide'
                  ? 'bg-[var(--color-ink)] text-white shadow-xs'
                  : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
              )}
            >
              Illustrated Measuring Guide
            </button>
          </div>
        </div>

        {/* =============================================================
            TAB 1: INTERACTIVE COUTURE FIT STUDIO
            ============================================================= */}
        {activeTab === 'finder' && (
          <div className="space-y-10 animate-fadeIn">
            
            {/* STEP 1: SILHOUETTE SELECTOR (Visual Cards) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--color-gold)]">
                    Step 1
                  </span>
                  <h2 className="font-serif text-xl text-[var(--color-ink)]">
                    {studio.step1Title}
                  </h2>
                </div>
                {studio.step1Subtitle && (
                  <span className="text-xs text-[var(--color-slate)] hidden sm:inline">
                    {studio.step1Subtitle}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {SILHOUETTES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSilhouette(s.id)}
                    className={cn(
                      'group relative rounded-xl overflow-hidden border p-3 text-left transition-all duration-300 cursor-pointer flex flex-col justify-between h-44',
                      selectedSilhouette === s.id
                        ? 'border-[var(--color-gold)] ring-2 ring-[var(--color-gold)]/30 bg-white shadow-md'
                        : 'border-[#EAE4D9] bg-white hover:border-[#D5CEBF] hover:shadow-sm'
                    )}
                  >
                    <div className="relative w-full h-24 rounded-lg overflow-hidden bg-[#FAF8F5]">
                      <Image
                        src={s.image}
                        alt={s.name}
                        fill
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 20vw"
                      />
                      {selectedSilhouette === s.id && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[var(--color-gold)] text-[var(--color-ink)] flex items-center justify-center font-bold text-xs shadow-xs">
                          ✓
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <p className="font-serif text-sm font-medium text-[var(--color-ink)] leading-tight">
                        {s.name}
                      </p>
                      <p className="text-[10px] text-[var(--color-slate)] truncate mt-0.5">
                        {s.isFreeSize ? 'Universal Free Size' : 'XS to 3XL'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 2 & 3: INTERACTIVE STUDIO MAIN STAGE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Interactive Fit Calibrator (Spans 7) */}
              <div className="lg:col-span-7 bg-white border border-[#EAE4D9] rounded-2xl p-6 sm:p-8 shadow-xs space-y-7">
                
                {/* Method Switcher Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAE4D9]">
                  <div>
                    <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--color-gold)]">
                      Step 2
                    </span>
                    <h3 className="font-serif text-lg text-[var(--color-ink)]">
                      {studio.step2Title}
                    </h3>
                  </div>

                  <div className="inline-flex p-0.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD5]">
                    <button
                      type="button"
                      onClick={() => setFinderMode('smart')}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-xs font-semibold tracking-wider transition-all cursor-pointer',
                        finderMode === 'smart'
                          ? 'bg-[var(--color-gold)] text-[var(--color-ink)] shadow-2xs'
                          : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
                      )}
                    >
                      Smart Brand Match
                    </button>
                    <button
                      type="button"
                      onClick={() => setFinderMode('tape')}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-xs font-semibold tracking-wider transition-all cursor-pointer',
                        finderMode === 'tape'
                          ? 'bg-[var(--color-gold)] text-[var(--color-ink)] shadow-2xs'
                          : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
                      )}
                    >
                      Tape Measurements
                    </button>
                  </div>
                </div>

                {/* Saree Specific Notice */}
                {currentSilhouette.isFreeSize && (
                  <div className="p-4 rounded-xl bg-[#FCFAF7] border border-[#E5DECF] space-y-1">
                    <p className="text-xs font-semibold text-[var(--color-gold)] uppercase tracking-wider">
                      ⚜ {currentSilhouette.name} Drape Insight
                    </p>
                    <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                      {currentSilhouette.freeSizeNote}
                    </p>
                  </div>
                )}

                {/* MODE A: SMART BRAND SIZING */}
                {finderMode === 'smart' ? (
                  <div className="space-y-6">
                    {/* Usual Brand Size Pills */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                          What size do you normally wear in ethnic/high-street brands?
                        </label>
                        <span className="text-[11px] text-[var(--color-slate)]">Fabindia, Biba, Zara</span>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                        {HIGH_STREET_SIZES.map((sz) => (
                          <button
                            key={sz.id}
                            type="button"
                            onClick={() => setStandardBrandSize(sz.id)}
                            className={cn(
                              'py-3 px-2 rounded-xl border text-center transition-all cursor-pointer',
                              standardBrandSize === sz.id
                                ? 'border-[var(--color-gold)] bg-[var(--color-ink)] text-white shadow-sm'
                                : 'border-[#EAE4D9] bg-white hover:border-[#D5CEBF] text-[var(--color-slate)]'
                            )}
                          >
                            <p className="font-serif text-base font-semibold">{sz.label}</p>
                            <p className="text-[9px] opacity-75 truncate">{sz.id === 'M' ? 'UK 10' : sz.id}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Height Profile Cards */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-2">
                        What is your height range?
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {HEIGHT_CATEGORIES.map((h) => (
                          <button
                            key={h.id}
                            type="button"
                            onClick={() => setHeightCategory(h.id)}
                            className={cn(
                              'p-3.5 rounded-xl border text-left transition-all cursor-pointer space-y-1',
                              heightCategory === h.id
                                ? 'border-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/40 bg-[#FCFAF7]'
                                : 'border-[#EAE4D9] bg-white hover:border-[#D5CEBF]'
                            )}
                          >
                            <p className="font-serif text-sm font-semibold text-[var(--color-ink)]">{h.label}</p>
                            <p className="text-[11px] text-[var(--color-slate)]">{h.range}</p>
                            <p className="text-[10px] text-[var(--color-gold-hover)] pt-1 border-t border-[#EAE4D9]/60">{h.hemlineNote}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Body Silhouette Options */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-2">
                        Which silhouette best mirrors your posture?
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {SILHOUETTE_PROFILES.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setBodySilhouette(p.id)}
                            className={cn(
                              'p-3 rounded-xl border text-left transition-all cursor-pointer',
                              bodySilhouette === p.id
                                ? 'border-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/40 bg-[#FCFAF7]'
                                : 'border-[#EAE4D9] bg-white hover:border-[#D5CEBF]'
                            )}
                          >
                            <p className="font-serif text-xs font-semibold text-[var(--color-ink)]">{p.label}</p>
                            <p className="text-[10px] text-[var(--color-slate)] mt-0.5 leading-tight">{p.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Desired Ease */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-2">
                        Desired Drape & Wearing Ease
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {DRAPE_STYLES.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setDrapeStyle(d.id)}
                            className={cn(
                              'p-3 rounded-xl border text-left transition-all cursor-pointer',
                              drapeStyle === d.id
                                ? 'border-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/40 bg-[#FCFAF7]'
                                : 'border-[#EAE4D9] bg-white hover:border-[#D5CEBF]'
                            )}
                          >
                            <p className="font-serif text-xs font-semibold text-[var(--color-ink)]">{d.label}</p>
                            <p className="text-[10px] text-[var(--color-slate)] mt-0.5 leading-tight">{d.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                ) : (
                  /* MODE B: TAPE MEASUREMENT SLIDERS */
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-2 border-b border-[#EAE4D9]">
                      <span className="text-xs text-[var(--color-slate)]">Calibrate exact vinyl tape numbers</span>
                      <div className="inline-flex p-0.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD5]">
                        <button
                          type="button"
                          onClick={() => setUnit('inches')}
                          className={cn(
                            'px-2.5 py-1 rounded text-xs font-semibold cursor-pointer',
                            unit === 'inches' ? 'bg-[var(--color-ink)] text-white' : 'text-[var(--color-slate)]'
                          )}
                        >
                          Inches
                        </button>
                        <button
                          type="button"
                          onClick={() => setUnit('cm')}
                          className={cn(
                            'px-2.5 py-1 rounded text-xs font-semibold cursor-pointer',
                            unit === 'cm' ? 'bg-[var(--color-ink)] text-white' : 'text-[var(--color-slate)]'
                          )}
                        >
                          CM
                        </button>
                      </div>
                    </div>

                    {/* Bust Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                          Bust / Chest Circumference
                        </span>
                        <span className="font-serif font-bold text-base text-[var(--color-gold)]">
                          {unit === 'cm' ? `${Math.round(bustVal * 2.54)} cm` : `${bustVal}"`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={30}
                        max={50}
                        step={0.5}
                        value={bustVal}
                        onChange={(e) => setBustVal(parseFloat(e.target.value))}
                        className="w-full accent-[var(--color-gold)] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-[var(--color-slate)]">
                        <span>30" (76 cm)</span>
                        <span>40" (101 cm)</span>
                        <span>50" (127 cm)</span>
                      </div>
                    </div>

                    {/* Waist Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                          Natural Waist Circumference
                        </span>
                        <span className="font-serif font-bold text-base text-[var(--color-gold)]">
                          {unit === 'cm' ? `${Math.round(waistVal * 2.54)} cm` : `${waistVal}"`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={24}
                        max={46}
                        step={0.5}
                        value={waistVal}
                        onChange={(e) => setWaistVal(parseFloat(e.target.value))}
                        className="w-full accent-[var(--color-gold)] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-[var(--color-slate)]">
                        <span>24" (61 cm)</span>
                        <span>34" (86 cm)</span>
                        <span>46" (117 cm)</span>
                      </div>
                    </div>

                    {/* Hips Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                          Hip Circumference
                        </span>
                        <span className="font-serif font-bold text-base text-[var(--color-gold)]">
                          {unit === 'cm' ? `${Math.round(hipsVal * 2.54)} cm` : `${hipsVal}"`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={32}
                        max={54}
                        step={0.5}
                        value={hipsVal}
                        onChange={(e) => setHipsVal(parseFloat(e.target.value))}
                        className="w-full accent-[var(--color-gold)] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-[var(--color-slate)]">
                        <span>32" (81 cm)</span>
                        <span>42" (107 cm)</span>
                        <span>54" (137 cm)</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column: Tailored Recommendation Certificate (Spans 5) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Result Card */}
                <div className="bg-white border-2 border-[#E5DECF] rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden space-y-6">
                  
                  {/* Subtle Top Gold Banner */}
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[var(--color-gold)]">
                      ✦ Atelier Fit Certificate ✦
                    </span>
                    <h3 className="font-serif text-base text-[var(--color-ink)]">
                      Recommended for {currentSilhouette.name}
                    </h3>
                  </div>

                  {/* Highlight Size Badge */}
                  <div className="text-center py-4 bg-[#FCFAF7] border border-[#EAE4D9] rounded-xl space-y-2">
                    <span className="text-[10px] font-semibold tracking-wider text-[var(--color-slate)] uppercase">
                      Recommended Size
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <span className="px-5 py-2 rounded-xl bg-[var(--color-ink)] text-white font-serif text-2xl font-bold tracking-tight">
                        {fitResult.recommendedSize.startsWith('Size') ? fitResult.recommendedSize : `Size ${fitResult.recommendedSize}`}
                      </span>
                    </div>

                    <div className="pt-2 flex items-center justify-center gap-2 text-xs text-[var(--color-slate)]">
                      <span className="inline-flex items-center gap-1 text-[#16A34A] font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                        {fitResult.fitScore}% Silhouette Accuracy
                      </span>
                      <span>·</span>
                      <span className="capitalize">{fitResult.sizeLabel}</span>
                    </div>
                  </div>

                  {/* Dimension Tolerance Breakdown */}
                  <div className="space-y-2 text-xs">
                    <p className="font-semibold text-[var(--color-ink)] uppercase tracking-wider text-[11px]">
                      Garment Specifications (With Ease)
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE4D9]">
                        <span className="text-[10px] text-[var(--color-slate)] block">Bust Ease</span>
                        <span className="font-serif font-bold text-[var(--color-ink)]">{fitResult.bustRange}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE4D9]">
                        <span className="text-[10px] text-[var(--color-slate)] block">Waist Fit</span>
                        <span className="font-serif font-bold text-[var(--color-ink)]">{fitResult.waistRange}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE4D9]">
                        <span className="text-[10px] text-[var(--color-slate)] block">Hips Ease</span>
                        <span className="font-serif font-bold text-[var(--color-ink)]">{fitResult.hipsRange}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tailoring & Hemline Insights */}
                  <div className="p-4 rounded-xl bg-[#FCFAF7] border border-[#E5DECF] space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[var(--color-gold)] font-semibold text-[11px] uppercase tracking-wider">
                      <span>✓</span>
                      <span>Bespoke Drape Notes</span>
                    </div>
                    <p className="text-[var(--color-slate)] leading-relaxed">
                      {fitResult.tailoringTip}
                    </p>
                    <p className="text-[var(--color-slate)] leading-relaxed pt-1 border-t border-[#EAE4D9]/60">
                      <strong>Hemline Alignment:</strong> {fitResult.hemlineAdvice}
                    </p>
                  </div>

                  {/* CTAs */}
                  <div className="space-y-2.5 pt-1">
                    <Link
                      href={`/shop/${currentSilhouette.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--color-ink)] hover:bg-[#25221E] text-white text-xs font-semibold tracking-wide border border-[var(--color-gold)]/40 hover:border-[var(--color-gold)] transition-all shadow-sm group"
                    >
                      <span>Shop {currentSilhouette.name} in Size {fitResult.recommendedSize}</span>
                      <span className="text-[var(--color-gold)] group-hover:translate-x-1 transition-transform">→</span>
                    </Link>

                    <a
                      href={`https://wa.me/919876543210?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FCFAF7] hover:bg-white text-[var(--color-ink)] border border-[#E5DFD5] hover:border-[var(--color-gold)] text-xs font-medium transition-colors"
                    >
                      <span className="text-[#25D366]">
                        <SocialIcon platform="whatsapp" size="sm" />
                      </span>
                      <span>Confirm Fit with Vidhya on WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="w-full text-center text-xs text-[var(--color-slate)] hover:text-[var(--color-gold)] transition-colors py-1 cursor-pointer"
                    >
                      Save this fit profile to browser →
                    </button>
                  </div>

                </div>

                {/* VIP Drape Video Call Offer */}
                {virtualCall && (
                  <div className="p-5 rounded-2xl bg-[#FCFAF7] border border-[#E5DECF] space-y-2.5 text-xs text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-[var(--color-gold)] font-semibold text-[11px] uppercase tracking-wider">
                      <span>🎥</span>
                      <span>{virtualCall.badge}</span>
                    </div>
                    <p className="text-[var(--color-slate)] leading-relaxed">
                      {virtualCall.description}
                    </p>
                    {virtualCall.whatsappLink && (
                      <a
                        href={virtualCall.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-[var(--color-gold-hover)] hover:underline"
                      >
                        <span>{virtualCall.ctaText}</span>
                        <span>→</span>
                      </a>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

        {/* =============================================================
            TAB 2: ARTISAN SIZE DIRECTORY (Full Sizing Grid)
            ============================================================= */}
        {activeTab === 'directory' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#EAE4D9]">
              <div>
                <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--color-gold)]">
                  Artisan Size Reference
                </span>
                <h3 className="font-serif text-xl text-[var(--color-ink)]">
                  {currentSilhouette.name} Size Chart
                </h3>
              </div>

              {/* Silhouette Switcher for Table */}
              <div className="flex flex-wrap gap-2">
                {SILHOUETTES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSilhouette(s.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all cursor-pointer',
                      selectedSilhouette === s.id
                        ? 'bg-[var(--color-ink)] text-white'
                        : 'bg-[#FAF8F5] text-[var(--color-slate)] hover:text-[var(--color-ink)] border border-[#E5DFD5]'
                    )}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-[#EAE4D9] rounded-2xl p-6 shadow-xs overflow-hidden space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF8F5] border-b border-[#EAE4D9] text-[var(--color-slate)] uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Size Label</th>
                      <th className="py-3 px-4">Standard Size</th>
                      <th className="py-3 px-4">Bust / Chest ({unit})</th>
                      <th className="py-3 px-4">Waist ({unit})</th>
                      <th className="py-3 px-4">Hips ({unit})</th>
                      <th className="py-3 px-4">Shoulder ({unit})</th>
                      <th className="py-3 px-4">Garment Length ({unit})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE4D9]/60 font-mono text-[11px]">
                    {currentSilhouette.sizes.map((row) => (
                      <tr key={row.size} className="hover:bg-[#FCFAF7] transition-colors">
                        <td className="py-3 px-4 font-sans font-semibold text-[var(--color-ink)]">
                          {row.label}
                        </td>
                        <td className="py-3 px-4 font-bold text-[var(--color-gold)]">
                          {row.size}
                        </td>
                        <td className="py-3 px-4 text-[var(--color-ink)] font-semibold">
                          {row.bust ? (unit === 'cm' ? Math.round(row.bust * 2.54) : row.bust) : 'Free'}
                        </td>
                        <td className="py-3 px-4 text-[var(--color-slate)]">
                          {row.waist ? (unit === 'cm' ? Math.round(row.waist * 2.54) : row.waist) : 'Free'}
                        </td>
                        <td className="py-3 px-4 text-[var(--color-slate)]">
                          {row.hips ? (unit === 'cm' ? Math.round(row.hips * 2.54) : row.hips) : 'Free'}
                        </td>
                        <td className="py-3 px-4 text-[var(--color-slate)]">
                          {row.shoulder ? (unit === 'cm' ? Math.round(row.shoulder * 2.54) : row.shoulder) : 'Standard'}
                        </td>
                        <td className="py-3 px-4 text-[var(--color-slate)]">
                          {row.length ? (unit === 'cm' ? Math.round(row.length * 2.54) : row.length) : 'Universal'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-3 border-t border-[#EAE4D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[var(--color-slate)]">
                <p>{currentSilhouette.tagline}</p>
                <span className="text-[var(--color-gold-hover)] font-medium">
                  2.5-inch internal seam margin provided
                </span>
              </div>
            </div>

          </div>
        )}

        {/* =============================================================
            TAB 3: ILLUSTRATED MEASURING GUIDE
            ============================================================= */}
        {activeTab === 'guide' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Masterclass Intro */}
            <div className="rounded-2xl bg-[#FCFAF7] border border-[#E5DECF] p-6 sm:p-8 shadow-xs">
              <h3 className="font-serif text-xl text-[var(--color-ink)] mb-4">
                {guide.title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                {guide.principles.map((pr) => (
                  <div key={pr.step} className="p-4 rounded-xl bg-white border border-[#EAE4D9] space-y-1">
                    <span className="font-serif font-bold text-base text-[var(--color-gold)]">{pr.step}</span>
                    <h5 className="font-semibold text-[var(--color-ink)]">{pr.title}</h5>
                    <p className="text-[var(--color-slate)] leading-relaxed">{pr.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Illustrated Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Bust / Chest',
                  desc: 'Wrap the tape around the fullest part of your bust, passing horizontally under the arms and across the shoulder blades.',
                  img: '/images/measure-bust.jpg',
                },
                {
                  title: 'Natural Waist',
                  desc: 'Measure around the narrowest part of your waistline, roughly 1 to 2 inches above the navel. Keep tape relaxed.',
                  img: '/images/measure-waist.jpg',
                },
                {
                  title: 'Hips Circumference',
                  desc: 'Stand with feet together and measure around the fullest projection of your hips and buttocks, roughly 7-9 inches below the waist.',
                  img: '/images/measure-hips.jpg',
                },
                {
                  title: 'Shoulder Width',
                  desc: 'Measure across the back from the outer bone of one shoulder tip to the other across the base of the neck.',
                  img: '/images/measure-shoulder.jpg',
                },
                {
                  title: 'Sleeve Length',
                  desc: 'With elbow gently bent, measure from the shoulder seam down to your desired sleeve length (elbow, 3/4th, or wrist).',
                  img: '/images/measure-sleeve.jpg',
                },
                {
                  title: 'Garment Length',
                  desc: 'Measure from high shoulder point straight down to your desired hemline (knee, calf, or ankle with shoes).',
                  img: '/images/measure-length.jpg',
                },
              ].map((step, idx) => (
                <div
                  key={step.title}
                  className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-white border border-[#EAE4D9] rounded-2xl shadow-xs"
                >
                  <div className="relative w-36 h-36 flex-shrink-0 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#E5DFD5]">
                    <Image
                      src={step.img}
                      alt={`How to measure ${step.title}`}
                      fill
                      className="object-cover"
                      sizes="144px"
                    />
                  </div>

                  <div className="flex-1 space-y-1.5 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[var(--color-gold-light)] text-[var(--color-gold)] font-serif font-bold text-xs flex items-center justify-center border border-[var(--color-gold)]/30">
                        {idx + 1}
                      </span>
                      <h4 className="font-serif text-base text-[var(--color-ink)] font-medium">
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Live WhatsApp Styling Support */}
            <div className="rounded-2xl bg-[var(--color-ink)] text-white p-8 sm:p-10 text-center space-y-4">
              <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[var(--color-gold)]">
                Direct Atelier Verification
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-normal">
                {guide.whatsappTitle}
              </h3>
              <p className="text-sm text-[var(--color-whisper)] max-w-xl mx-auto font-light leading-relaxed">
                {guide.whatsappDescription}
              </p>
              <div className="pt-2 flex justify-center">
                <a
                  href={guide.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-7 py-3 rounded-xl bg-[var(--color-gold)] hover:bg-[var(--color-gold-hover)] text-[var(--color-ink)] text-xs font-semibold tracking-wide transition-colors shadow-md"
                >
                  <SocialIcon platform="whatsapp" size="sm" />
                  <span>{guide.whatsappButtonText}</span>
                </a>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

