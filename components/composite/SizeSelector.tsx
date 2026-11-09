'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Radio } from '@/components/ui/Radio';
import { Slider } from '@/components/ui/Slider';

export interface SizeOption {
  value: string;
  label: string;
  inStock: boolean;
  count?: number;
  measurements?: {
    chest?: string;
    waist?: string;
    hips?: string;
    length?: string;
    shoulder?: string;
    sleeve?: string;
  };
}

export interface SizeGuideData {
  category: string;
  measurements: Array<{
    size: string;
    chest: string;
    waist: string;
    hips: string;
    length: string;
    shoulder?: string;
    sleeve?: string;
  }>;
  howToMeasure: Array<{
    label: string;
    description: string;
    illustration?: string;
  }>;
  fitGuide: {
    type: 'regular' | 'slim' | 'relaxed' | 'oversized';
    description: string;
  };
}

export interface SizeSelectorProps {
  sizes: SizeOption[];
  selectedSize?: string;
  onSizeChange: (size: string) => void;
  onSizeGuideClick?: () => void;
  sizeGuideData?: SizeGuideData;
  variant?: 'pills' | 'buttons' | 'dropdown';
  showAvailability?: boolean;
  className?: string;
}

export function SizeSelector({
  sizes,
  selectedSize,
  onSizeChange,
  onSizeGuideClick,
  sizeGuideData,
  variant = 'pills',
  showAvailability = true,
  className = '',
}: SizeSelectorProps) {
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [notifyMeSize, setNotifyMeSize] = useState<string | null>(null);

  const inStockSizes = sizes.filter(s => s.inStock);
  const outOfStockSizes = sizes.filter(s => !s.inStock);

  const handleSizeClick = (size: SizeOption) => {
    if (!size.inStock) {
      setNotifyMeSize(size.value);
      return;
    }
    onSizeChange(size.value);
  };

  if (variant === 'dropdown') {
    return (
      <div className={cn('space-y-2', className)}>
        <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">
          Size
          {onSizeGuideClick && (
            <button
              type="button"
              onClick={onSizeGuideClick}
              className="ml-2 text-xs font-normal text-[var(--color-gold)] hover:underline"
            >
              Size Guide
            </button>
          )}
        </label>
        <select
          value={selectedSize || ''}
          onChange={(e) => {
            const size = sizes.find(s => s.value === e.target.value);
            if (size?.inStock) onSizeChange(e.target.value);
          }}
          className="w-full h-12 px-4 py-2 text-base bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-md)] focus:border-[var(--color-gold)] focus:outline-none focus:ring-3 focus:ring-[var(--color-gold)]/20 transition-all duration-200 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23737373%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_12px_center]"
        >
          <option value="">Select Size</option>
          {inStockSizes.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label} {showAvailability && size.count !== undefined && `(${size.count} left)`}
            </option>
          ))}
          {outOfStockSizes.map((size) => (
            <option key={size.value} value={size.value} disabled>
              {size.label} — Out of Stock
            </option>
          ))}
        </select>
        {notifyMeSize && (
          <NotifyMeToast
            size={notifyMeSize}
            onClose={() => setNotifyMeSize(null)}
            onNotify={() => {
              // Handle notify me
              setNotifyMeSize(null);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[var(--color-ink)]">
          Size
        </label>
        {onSizeGuideClick && (
          <motion.button
            type="button"
            onClick={onSizeGuideClick}
            className="text-xs font-medium uppercase tracking-wider text-[var(--color-gold)] hover:text-[var(--color-gold-hover)] flex items-center gap-1 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Size Guide
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </motion.button>
        )}
      </div>

      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size options">
        {sizes.map((size) => (
          <button
            type="button"
            key={size.value}
            role="radio"
            aria-checked={selectedSize === size.value}
            aria-disabled={!size.inStock}
            aria-label={`${size.label}${!size.inStock ? ', out of stock' : ''}${showAvailability && size.count !== undefined ? `, ${size.count} left` : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleSizeClick(size);
            }}
            disabled={!size.inStock}
            className={cn(
              'relative px-4 py-2.5 text-sm font-semibold uppercase tracking-wider rounded-[var(--radius-md)] transition-all duration-150 select-none cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-gold)]/40 focus-visible:ring-offset-2 hover:scale-[1.03] active:scale-[0.97]',
              size.inStock
                ? selectedSize === size.value
                  ? 'bg-[var(--color-gold)] text-[var(--color-ink)] shadow-[var(--shadow-gold)] font-bold'
                  : 'bg-[var(--color-white)] border-2 border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold-light)]'
                : 'bg-[var(--color-whisper)] border-2 border-[var(--color-whisper)] text-[var(--color-mist)] line-through cursor-not-allowed'
            )}
          >
            {size.label}
            {!size.inStock && (
              <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-[var(--color-error)] text-white px-1.5 py-0.5 rounded-full">
                OUT
              </span>
            )}
            {showAvailability && size.inStock && size.count !== undefined && size.count <= 5 && (
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium bg-[var(--color-warning)] text-[var(--color-ink)] px-1.5 py-0.5 rounded-[var(--radius-sm)] whitespace-nowrap">
                Only {size.count} left
              </span>
            )}
          </button>
        ))}
      </div>

      {selectedSize && (
        <motion.p
          key={selectedSize}
          className="text-sm text-[var(--color-success)] flex items-center gap-1.5 mt-2 font-medium"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Size {selectedSize} selected
        </motion.p>
      )}

      <AnimatePresence>
        {notifyMeSize && (
          <NotifyMeToast
            key={notifyMeSize}
            size={notifyMeSize}
            onClose={() => setNotifyMeSize(null)}
            onNotify={() => {
              setNotifyMeSize(null);
            }}
          />
        )}
      </AnimatePresence>

      {sizeGuideData && (
        <SizeGuideModal
          isOpen={showSizeGuide}
          onClose={() => setShowSizeGuide(false)}
          data={sizeGuideData}
        />
      )}
    </div>
  );
}

interface NotifyMeToastProps {
  size: string;
  onClose: () => void;
  onNotify: () => void;
}

function NotifyMeToast({ size, onClose, onNotify }: NotifyMeToastProps) {
  return (
    <motion.div
      className="flex items-center gap-3 p-3 bg-[var(--color-info-bg)] border border-[var(--color-info)] rounded-[var(--radius-md)]"
      initial={{ opacity: 0, y: -10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      transition={{ duration: 0.3 }}
      role="alert"
    >
      <svg className="h-5 w-5 text-[var(--color-info)] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
      <div className="flex-1">
        <p className="text-sm font-medium text-[var(--color-ink)]">Size {size} is out of stock</p>
        <p className="text-xs text-[var(--color-slate)]">Enter your email to get notified when it&apos;s back</p>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Dismiss
        </Button>
        <Button variant="primary" size="sm" onClick={onNotify}>
          Notify Me
        </Button>
      </div>
    </motion.div>
  );
}

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SizeGuideData;
}

function SizeGuideModal({ isOpen, onClose, data }: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'chart' | 'how-to' | 'fit'>('chart');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Size Guide"
      description={`Find your perfect fit for ${data.category}`}
      size="lg"
      closeOnOverlayClick={true}
      closeOnEscape={true}
    >
      <div className="space-y-6">
        <div className="flex gap-2 border-b border-[var(--color-whisper)]" role="tablist">
          {[
            { id: 'chart', label: 'Size Chart' },
            { id: 'how-to', label: 'How to Measure' },
            { id: 'fit', label: 'Fit Guide' },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
              id={`${tab.id}-tab`}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'px-4 py-3 text-sm font-medium uppercase tracking-wider border-b-2 transition-all duration-200',
                activeTab === tab.id
                  ? 'border-[var(--color-gold)] text-[var(--color-gold)]'
                  : 'border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)]'
              )}
              whileTap={{ scale: 0.98 }}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'chart' && (
            <motion.div
              key="chart"
              role="tabpanel"
              aria-labelledby="chart-tab"
              id="chart-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-x-auto"
            >
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="bg-[var(--color-whisper)]">
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-ink)]">Size</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-ink)]">Chest</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-ink)]">Waist</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-ink)]">Hips</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-ink)]">Length</th>
                    {data.measurements[0]?.shoulder && (
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-ink)]">Shoulder</th>
                    )}
                    {data.measurements[0]?.sleeve && (
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-ink)]">Sleeve</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.measurements.map((row, i) => (
                    <tr key={row.size} className={cn('border-t border-[var(--color-whisper)]', i % 2 === 1 && 'bg-[var(--color-snow)]')}>
                      <td className="px-4 py-3 font-semibold text-[var(--color-ink)]">{row.size}</td>
                      <td className="px-4 py-3 text-[var(--color-slate)]">{row.chest}</td>
                      <td className="px-4 py-3 text-[var(--color-slate)]">{row.waist}</td>
                      <td className="px-4 py-3 text-[var(--color-slate)]">{row.hips}</td>
                      <td className="px-4 py-3 text-[var(--color-slate)]">{row.length}</td>
                      {row.shoulder && <td className="px-4 py-3 text-[var(--color-slate)]">{row.shoulder}</td>}
                      {row.sleeve && <td className="px-4 py-3 text-[var(--color-slate)]">{row.sleeve}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-xs text-[var(--color-mist)]">
                All measurements are in centimeters. Measure over undergarments for best accuracy.
              </p>
            </motion.div>
          )}
          {activeTab === 'how-to' && (
            <motion.div
              key="how-to"
              role="tabpanel"
              aria-labelledby="how-to-tab"
              id="how-to-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {data.howToMeasure.map((item, i) => (
                <motion.div
                  key={item.label}
                  className="flex gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="w-12 h-12 flex-shrink-0 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center text-[var(--color-gold)] font-bold text-lg">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--color-ink)]">{item.label}</h4>
                    <p className="text-sm text-[var(--color-slate)] mt-1">{item.description}</p>
                    {item.illustration && (
                      <img src={item.illustration} alt={item.label} className="mt-2 rounded-[var(--radius-md)] max-w-xs" loading="lazy" />
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
          {activeTab === 'fit' && (
            <motion.div
              key="fit"
              role="tabpanel"
              aria-labelledby="fit-tab"
              id="fit-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="p-4 bg-[var(--color-gold-light)] rounded-[var(--radius-lg)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-gold)] flex items-center justify-center text-[var(--color-ink)] font-bold">
                    {data.fitGuide.type === 'regular' ? 'R' : data.fitGuide.type === 'slim' ? 'S' : data.fitGuide.type === 'relaxed' ? 'RL' : 'O'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--color-ink)] capitalize">{data.fitGuide.type} Fit</h4>
                    <p className="text-sm text-[var(--color-slate)]">{data.fitGuide.description}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'True to Size', description: 'Order your usual size' },
                  { label: 'Model Wears', description: 'Size S/M (refer to product page)' },
                  { label: 'Fabric Stretch', description: 'Minimal / Moderate / High' },
                  { label: 'Recommended For', description: 'Daily wear / Occasions / Layering' },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    className="p-4 bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-lg)]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <p className="font-medium text-[var(--color-ink)]">{item.label}</p>
                    <p className="text-sm text-[var(--color-slate)] mt-1">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}

export interface SizeFinderProps {
  onSizeFound: (size: string, confidence: number) => void;
  category: string;
  sizeGuideData: SizeGuideData;
  className?: string;
}

export function SizeFinder({
  onSizeFound,
  category,
  sizeGuideData,
  className = '',
}: SizeFinderProps) {
  const [step, setStep] = useState(0);
  const [measurements, setMeasurements] = useState<Record<string, number>>({});
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);

  const steps = [
    { key: 'bust', label: 'Bust', unit: 'cm', placeholder: 'e.g., 88' },
    { key: 'waist', label: 'Waist', unit: 'cm', placeholder: 'e.g., 72' },
    { key: 'hips', label: 'Hips', unit: 'cm', placeholder: 'e.g., 96' },
    { key: 'height', label: 'Height', unit: 'cm', placeholder: 'e.g., 165' },
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  const handleNext = () => {
    if (!currentStep) return;
    if (measurements[currentStep.key]) {
      if (isLastStep) {
        calculateSize();
      } else {
        setStep(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(0, prev - 1));
  };

  const calculateSize = () => {
    const bust = measurements['bust'];
    const waist = measurements['waist'];
    const hips = measurements['hips'];
    if (bust === undefined || waist === undefined || hips === undefined) return;
    if (sizeGuideData.measurements.length === 0) return;
    const firstMeasurement = sizeGuideData.measurements[0];
    if (!firstMeasurement) return;
    let bestSize = firstMeasurement.size;
    let bestDiff = Infinity;

    for (const sizeRow of sizeGuideData.measurements) {
      const sizeBust = parseInt(sizeRow.chest.replace(' cm', ''));
      const sizeWaist = parseInt(sizeRow.waist.replace(' cm', ''));
      const sizeHips = parseInt(sizeRow.hips.replace(' cm', ''));

      const diff = Math.abs(bust - sizeBust) + Math.abs(waist - sizeWaist) + Math.abs(hips - sizeHips);

      if (diff < bestDiff) {
        bestDiff = diff;
        bestSize = sizeRow.size;
      }
    }

    const conf = Math.max(0, 100 - bestDiff * 2);
    setRecommendedSize(bestSize);
    setConfidence(conf);
  };

  if (recommendedSize) {
    return (
      <motion.div
        className={cn('space-y-6 text-center', className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className="w-24 h-24 mx-auto rounded-full bg-[var(--color-success)] flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 100 }}
        >
          <svg className="h-12 w-12 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </motion.div>

        <div>
          <h3 className="text-[var(--font-display)] text-2xl font-medium text-[var(--color-ink)]">
            Your Recommended Size
          </h3>
          <motion.div
            className="mt-2 text-4xl font-bold text-[var(--color-gold)]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
          >
            {recommendedSize}
          </motion.div>
        </div>

        <div className="p-4 bg-[var(--color-gold-light)] rounded-[var(--radius-lg)]">
          <p className="text-sm text-[var(--color-ink)]">
            Confidence: <span className="font-bold">{confidence}%</span>
          </p>
          <p className="text-xs text-[var(--color-slate)] mt-1">
            Based on your measurements. Fit may vary by style.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="primary" onClick={() => onSizeFound(recommendedSize, confidence)}>
            Select This Size
          </Button>
          <Button variant="secondary" onClick={() => { setRecommendedSize(null); setStep(0); }}>
            Re-measure
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center gap-2" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={steps.length}>
        {steps.map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              'flex-1 h-1.5 rounded-full transition-all duration-300',
              i < step ? 'bg-[var(--color-gold)]' : i === step ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-whisper)]'
            )}
            animate={{ scaleX: i <= step ? 1 : 0 }}
            initial={{ scaleX: 0 }}
          />
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-[var(--color-slate)] mb-1">Step {step + 1} of {steps.length}</p>
        {currentStep && (
          <h3 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)]">
            What&apos;s your {currentStep.label.toLowerCase()}?
          </h3>
        )}
      </div>

      {currentStep && (
        <div className="max-w-xs mx-auto">
          <Input
            type="number"
            placeholder={currentStep.placeholder}
            value={measurements[currentStep.key] || ''}
            onChange={(e) => setMeasurements(prev => ({ ...prev, [currentStep.key]: parseInt(e.target.value) || 0 }))}
            inputMode="numeric"
            min={30}
            max={200}
            className="text-center text-2xl font-bold py-4"
            aria-label={`${currentStep.label} in centimeters`}
          />
          <p className="text-xs text-[var(--color-mist)] mt-2">Measure over undergarments for accuracy</p>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={handleBack} disabled={step === 0}>
          Back
        </Button>
        <Button variant="primary" onClick={handleNext} disabled={!currentStep || !measurements[currentStep.key]}>
          {isLastStep ? 'Find My Size' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

export interface QuickSizeSelectorProps {
  sizes: string[];
  selectedSize?: string;
  onSizeChange: (size: string) => void;
  className?: string;
}

export function QuickSizeSelector({
  sizes,
  selectedSize,
  onSizeChange,
  className = '',
}: QuickSizeSelectorProps) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)} role="radiogroup" aria-label="Quick size selection">
      {sizes.map((size) => (
        <motion.button
          key={size}
          role="radio"
          aria-checked={selectedSize === size}
          onClick={() => onSizeChange(size)}
          className={cn(
            'w-10 h-10 rounded-[var(--radius-md)] font-semibold text-sm transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-gold)]/40 focus-visible:ring-offset-2',
            selectedSize === size
              ? 'bg-[var(--color-gold)] text-[var(--color-ink)] shadow-[var(--shadow-gold)]'
              : 'bg-[var(--color-white)] border-2 border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold-light)]'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {size}
        </motion.button>
      ))}
    </div>
  );
}