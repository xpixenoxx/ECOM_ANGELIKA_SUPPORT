'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { cn } from '@/lib/utils/cn';

/* =========================================================================
   SILHOUETTES & ATELIER PROPORTIONS DATA
   ========================================================================= */

type UnitType = 'inches' | 'cm';
type FinderMode = 'smart' | 'tape';

interface SilhouetteCategory {
  id: string;
  name: string;
  tagline: string;
  image: string;
  isFreeSize?: boolean;
  freeSizeNote?: string;
  defaultLengthInches: number;
  sizes: Array<{
    size: string;
    bust: number;
    waist: number;
    hips: number;
    length: number;
    shoulder: number;
    label: string;
  }>;
}

const SILHOUETTES: SilhouetteCategory[] = [
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
   MAIN BESPOKE FIT STUDIO
   ========================================================================= */

export default function SizeFinderPage() {
  const [activeTab, setActiveTab] = useState<'finder' | 'directory' | 'guide'>('finder');
  const [finderMode, setFinderMode] = useState<FinderMode>('smart');
  const [unit, setUnit] = useState<UnitType>('inches');

  // Selected Silhouette
  const [selectedSilhouette, setSelectedSilhouette] = useState<string>('kurtis');

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
    const silhouette = SILHOUETTES.find((s) => s.id === selectedSilhouette) || SILHOUETTES[0];

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
        // Step up if curvy hip
        const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
        const idx = order.indexOf(standardBrandSize);
        if (drapeStyle === 'contoured') {
          calculatedSize = standardBrandSize;
          matchScore = 94;
        } else if (idx < order.length - 1) {
          calculatedSize = order[idx + 1];
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

      let closest = silhouette.sizes[0];
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

    const matchedSizeRow = silhouette.sizes.find((s) => s.size === calculatedSize) || silhouette.sizes[2];
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
  }, [selectedSilhouette, finderMode, standardBrandSize, heightCategory, bodySilhouette, drapeStyle, bustVal, waistVal, hipsVal, unit]);

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

  const currentSilhouette = SILHOUETTES.find((s) => s.id === selectedSilhouette) || SILHOUETTES[0];

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
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5DECF] shadow-2xs mb-3">
            <span className="text-[var(--color-gold)] text-xs">⚜</span>
            <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[var(--color-gold)]">
              Vidhya's Bespoke Drape & Silhouette Studio
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[var(--color-ink)] font-normal tracking-tight leading-tight">
            Discover Your Signature Drape
          </h1>

          <p className="mt-3 text-sm text-[var(--color-slate)] font-light leading-relaxed max-w-2xl mx-auto">
            Handcrafted luxury ethnic wear should never feel constrained. Our interactive studio calculates your tailored proportion based on your posture, height, and preferred ease.
          </p>

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
                    Which Ensemble Are You Styling?
                  </h2>
                </div>
                <span className="text-xs text-[var(--color-slate)] hidden sm:inline">
                  Select a category to calibrate drape measurements
                </span>
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
                      Calibrate Your Fit Method
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
                              'p-3.5 rounded-xl border text-left transition-all cursor-pointer',
                              heightCategory === h.id
                                ? 'border-[var(--color-gold)] bg-[#FCFAF7] shadow-xs ring-1 ring-[var(--color-gold)]/20'
                                : 'border-[#EAE4D9] bg-white hover:border-[#D5CEBF]'
                            )}
                          >
                            <p className="font-serif text-sm font-semibold text-[var(--color-ink)]">{h.label}</p>
                            <p className="text-xs text-[var(--color-gold)] font-medium mt-0.5">{h.range}</p>
                            <p className="text-[10px] text-[var(--color-slate)] mt-1">{h.hemlineNote}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Body Silhouette Selector */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-2">
                        Which silhouette best mirrors your posture?
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {SILHOUETTE_PROFILES.map((bp) => (
                          <button
                            key={bp.id}
                            type="button"
                            onClick={() => setBodySilhouette(bp.id)}
                            className={cn(
                              'p-3 rounded-xl border text-left transition-all cursor-pointer',
                              bodySilhouette === bp.id
                                ? 'border-[var(--color-gold)] bg-[#FCFAF7] shadow-xs ring-1 ring-[var(--color-gold)]/20'
                                : 'border-[#EAE4D9] bg-white hover:border-[#D5CEBF]'
                            )}
                          >
                            <p className="font-serif text-xs font-semibold text-[var(--color-ink)]">{bp.label}</p>
                            <p className="text-[10px] text-[var(--color-slate)] mt-1 leading-snug">{bp.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Desired Drape Ease */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-2">
                        Desired Drape & Wearing Ease
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {DRAPE_STYLES.map((ds) => (
                          <button
                            key={ds.id}
                            type="button"
                            onClick={() => setDrapeStyle(ds.id)}
                            className={cn(
                              'p-3 rounded-xl border text-left transition-all cursor-pointer',
                              drapeStyle === ds.id
                                ? 'border-[var(--color-gold)] bg-[#FCFAF7] shadow-xs'
                                : 'border-[#EAE4D9] bg-white hover:border-[#D5CEBF]'
                            )}
                          >
                            <p className="font-serif text-xs font-semibold text-[var(--color-ink)]">{ds.label}</p>
                            <p className="text-[10px] text-[var(--color-slate)] mt-0.5">{ds.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* MODE B: TAPE MEASUREMENT SLIDERS */
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--color-slate)]">
                        Adjust sliders or enter values in <strong className="text-[var(--color-ink)]">{unit.toUpperCase()}</strong>
                      </span>
                      <div className="inline-flex p-0.5 rounded-md bg-white border border-[#E5DFD5]">
                        <button
                          type="button"
                          onClick={() => setUnit('inches')}
                          className={cn('px-2.5 py-1 text-[11px] rounded', unit === 'inches' ? 'bg-[var(--color-gold)] font-bold text-[var(--color-ink)]' : 'text-[var(--color-slate)]')}
                        >
                          Inches
                        </button>
                        <button
                          type="button"
                          onClick={() => setUnit('cm')}
                          className={cn('px-2.5 py-1 text-[11px] rounded', unit === 'cm' ? 'bg-[var(--color-gold)] font-bold text-[var(--color-ink)]' : 'text-[var(--color-slate)]')}
                        >
                          CM
                        </button>
                      </div>
                    </div>

                    {/* Bust Slider */}
                    <div className="p-4 rounded-xl bg-[#FCFAF7] border border-[#EAE4D9] space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <label htmlFor="bustRange" className="font-semibold text-[var(--color-ink)] uppercase tracking-wider">
                          Bust Circumference
                        </label>
                        <span className="font-serif font-bold text-base text-[var(--color-gold)]">
                          {bustVal} {unit}
                        </span>
                      </div>
                      <input
                        id="bustRange"
                        type="range"
                        min={unit === 'inches' ? 30 : 76}
                        max={unit === 'inches' ? 48 : 122}
                        step="0.5"
                        value={bustVal}
                        onChange={(e) => setBustVal(parseFloat(e.target.value))}
                        className="w-full accent-[var(--color-gold)] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-[var(--color-mist)]">
                        <span>{unit === 'inches' ? '30"' : '76cm'}</span>
                        <span>Fullest part across shoulder blades</span>
                        <span>{unit === 'inches' ? '48"' : '122cm'}</span>
                      </div>
                    </div>

                    {/* Waist Slider */}
                    <div className="p-4 rounded-xl bg-[#FCFAF7] border border-[#EAE4D9] space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <label htmlFor="waistRange" className="font-semibold text-[var(--color-ink)] uppercase tracking-wider">
                          Natural Waistline
                        </label>
                        <span className="font-serif font-bold text-base text-[var(--color-gold)]">
                          {waistVal} {unit}
                        </span>
                      </div>
                      <input
                        id="waistRange"
                        type="range"
                        min={unit === 'inches' ? 24 : 60}
                        max={unit === 'inches' ? 44 : 112}
                        step="0.5"
                        value={waistVal}
                        onChange={(e) => setWaistVal(parseFloat(e.target.value))}
                        className="w-full accent-[var(--color-gold)] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-[var(--color-mist)]">
                        <span>{unit === 'inches' ? '24"' : '60cm'}</span>
                        <span>Narrowest point, 1" above navel</span>
                        <span>{unit === 'inches' ? '44"' : '112cm'}</span>
                      </div>
                    </div>

                    {/* Hips Slider */}
                    <div className="p-4 rounded-xl bg-[#FCFAF7] border border-[#EAE4D9] space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <label htmlFor="hipsRange" className="font-semibold text-[var(--color-ink)] uppercase tracking-wider">
                          Hips Circumference
                        </label>
                        <span className="font-serif font-bold text-base text-[var(--color-gold)]">
                          {hipsVal} {unit}
                        </span>
                      </div>
                      <input
                        id="hipsRange"
                        type="range"
                        min={unit === 'inches' ? 32 : 81}
                        max={unit === 'inches' ? 52 : 132}
                        step="0.5"
                        value={hipsVal}
                        onChange={(e) => setHipsVal(parseFloat(e.target.value))}
                        className="w-full accent-[var(--color-gold)] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-[var(--color-mist)]">
                        <span>{unit === 'inches' ? '32"' : '81cm'}</span>
                        <span>Fullest projection of hips & buttocks</span>
                        <span>{unit === 'inches' ? '52"' : '132cm'}</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column: Live Haute Couture Fit Diagnosis (Spans 5) */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                
                {/* Atelier Certificate Card */}
                <div className="rounded-2xl bg-white border border-[#E5DECF] p-6 sm:p-7 shadow-[0_6px_30px_rgba(201,168,76,0.08)] relative overflow-hidden space-y-6">
                  {/* Gold foil top edge */}
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />

                  {/* Diagnosis Header */}
                  <div className="text-center pb-4 border-b border-[#EAE4D9] space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold tracking-[0.24em] uppercase text-[var(--color-gold)]">
                      <span>⚜</span>
                      <span>Atelier Fit Certificate</span>
                      <span>⚜</span>
                    </div>
                    <p className="text-xs text-[var(--color-slate)]">
                      Recommended for {currentSilhouette.name}
                    </p>
                    
                    {/* Size Pill */}
                    <div className="pt-3">
                      <span className="inline-block px-8 py-3 rounded-2xl bg-[var(--color-ink)] text-white border-2 border-[var(--color-gold)] font-serif text-4xl font-normal tracking-wide shadow-md">
                        Size {fitResult.recommendedSize}
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
                <div className="p-5 rounded-2xl bg-[#FCFAF7] border border-[#E5DECF] space-y-2.5 text-xs text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-[var(--color-gold)] font-semibold text-[11px] uppercase tracking-wider">
                    <span>🎥</span>
                    <span>Complimentary Virtual Drape Call</span>
                  </div>
                  <p className="text-[var(--color-slate)] leading-relaxed">
                    Bridal or festive celebration coming up? Connect directly over a WhatsApp video call to see real drape movement and live fabric falls before confirming.
                  </p>
                  <a
                    href="https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20would%20love%20to%20book%20a%20virtual%20drape%20consultation."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-[var(--color-gold-hover)] hover:underline"
                  >
                    <span>Book 1-on-1 Consultation Call</span>
                    <span>→</span>
                  </a>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* =============================================================
            TAB 2: ARTISAN SIZE DIRECTORY
            ============================================================= */}
        {activeTab === 'directory' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Category Filter Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {SILHOUETTES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSilhouette(s.id)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer',
                      selectedSilhouette === s.id
                        ? 'bg-[var(--color-ink)] text-white shadow-xs'
                        : 'bg-white border border-[#E5DFD5] text-[var(--color-slate)] hover:border-[var(--color-gold)] hover:text-[var(--color-ink)]'
                    )}
                  >
                    {s.name}
                  </button>
                ))}
              </div>

              {/* Unit Toggle */}
              <div className="inline-flex p-1 rounded-lg bg-white border border-[#E5DFD5]">
                <button
                  type="button"
                  onClick={() => setUnit('inches')}
                  className={cn('px-3 py-1 rounded text-xs font-semibold', unit === 'inches' ? 'bg-[var(--color-gold)] text-[var(--color-ink)]' : 'text-[var(--color-slate)]')}
                >
                  Inches
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('cm')}
                  className={cn('px-3 py-1 rounded text-xs font-semibold', unit === 'cm' ? 'bg-[var(--color-gold)] text-[var(--color-ink)]' : 'text-[var(--color-slate)]')}
                >
                  CM
                </button>
              </div>
            </div>

            {/* Active Matrix Table Card */}
            <div className="bg-white border border-[#EAE4D9] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE4D9] pb-4">
                <div>
                  <h3 className="font-serif text-xl text-[var(--color-ink)] font-normal">
                    {currentSilhouette.name} Measurement Matrix
                  </h3>
                  <p className="text-xs text-[var(--color-slate)] mt-0.5">
                    Garment dimensions calibrated in <strong className="text-[var(--color-ink)]">{unit.toUpperCase()}</strong>. Includes standard artisanal wearing ease.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('finder')}
                  className="px-4 py-2 rounded-lg bg-[#FAF8F5] border border-[#E5DFD5] text-xs font-medium text-[var(--color-ink)] hover:border-[var(--color-gold)] transition-colors cursor-pointer self-start sm:self-auto"
                >
                  Calibrate My Sizing →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#EAE4D9] text-[var(--color-gold)] uppercase tracking-wider text-[10px] bg-[#FAF8F5]">
                      <th className="py-3 px-4 font-semibold">Size Emblem</th>
                      <th className="py-3 px-4 font-semibold">Bust ({unit})</th>
                      <th className="py-3 px-4 font-semibold">Waist ({unit})</th>
                      <th className="py-3 px-4 font-semibold">Hips ({unit})</th>
                      <th className="py-3 px-4 font-semibold">Shoulder</th>
                      <th className="py-3 px-4 font-semibold">Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE4D9]">
                    {currentSilhouette.sizes.map((row) => (
                      <tr key={row.size} className="hover:bg-[#FCFAF7] transition-colors">
                        <td className="py-3 px-4 font-serif font-bold text-sm text-[var(--color-ink)]">
                          {row.label}
                        </td>
                        <td className="py-3 px-4 text-[var(--color-slate)]">
                          {row.bust ? (unit === 'cm' ? Math.round(row.bust * 2.54) : row.bust) : 'Free Size'}
                        </td>
                        <td className="py-3 px-4 text-[var(--color-slate)]">
                          {row.waist ? (unit === 'cm' ? Math.round(row.waist * 2.54) : row.waist) : 'Free Size'}
                        </td>
                        <td className="py-3 px-4 text-[var(--color-slate)]">
                          {row.hips ? (unit === 'cm' ? Math.round(row.hips * 2.54) : row.hips) : 'Free Size'}
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
                Designer Vidhya's Guide to Taking Flawless Body Measurements
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-white border border-[#EAE4D9] space-y-1">
                  <span className="font-serif font-bold text-base text-[var(--color-gold)]">01</span>
                  <h5 className="font-semibold text-[var(--color-ink)]">Flexible Vinyl Tape</h5>
                  <p className="text-[var(--color-slate)] leading-relaxed">Avoid metal tapes. Use a soft tailor tape that hugs natural body contours without stretching.</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#EAE4D9] space-y-1">
                  <span className="font-serif font-bold text-base text-[var(--color-gold)]">02</span>
                  <h5 className="font-semibold text-[var(--color-ink)]">Proper Undergarments</h5>
                  <p className="text-[var(--color-slate)] leading-relaxed">Measure over the exact style of innerwear you plan to wear with your ethnic ensemble.</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#EAE4D9] space-y-1">
                  <span className="font-serif font-bold text-base text-[var(--color-gold)]">03</span>
                  <h5 className="font-semibold text-[var(--color-ink)]">One-Finger Slack</h5>
                  <p className="text-[var(--color-slate)] leading-relaxed">Keep one finger between the tape and body so the fabric drapes without uncomfortable pinching.</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#EAE4D9] space-y-1">
                  <span className="font-serif font-bold text-base text-[var(--color-gold)]">04</span>
                  <h5 className="font-semibold text-[var(--color-ink)]">Natural Posture</h5>
                  <p className="text-[var(--color-slate)] leading-relaxed">Stand naturally with arms relaxed at sides. Do not pull your belly in or hold breath.</p>
                </div>
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
                  {/* Container with relative for Next.js Image fill */}
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
                Want Our Master Drapers to Review Your Fit?
              </h3>
              <p className="text-sm text-[var(--color-whisper)] max-w-xl mx-auto font-light leading-relaxed">
                Send your measurements or a photo over WhatsApp. Designer Vidhya and our master tailors will confirm your exact size within 15 minutes.
              </p>
              <div className="pt-2 flex justify-center">
                <a
                  href="https://wa.me/919876543210?text=Hi%20Vidhya,%20can%20you%20review%20my%20measurements%20for%20an%20Angelika%20order?"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-7 py-3 rounded-xl bg-[var(--color-gold)] hover:bg-[var(--color-gold-hover)] text-[var(--color-ink)] text-xs font-semibold tracking-wide transition-colors shadow-md"
                >
                  <SocialIcon platform="whatsapp" size="sm" />
                  <span>Verify Sizing on WhatsApp With Vidhya</span>
                </a>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
