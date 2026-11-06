'use client';

import { forwardRef, InputHTMLAttributes, ReactNode, useId, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'min' | 'max' | 'step' | 'value' | 'onChange' | 'aria-describedby'> {
  label?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  value: number | number[];
  onChange: (value: number | number[]) => void;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  marks?: Array<{ value: number; label: string }>;
  range?: boolean;
  ariaDescribedBy?: string;
}

const sizeStyles = {
  track: 'h-1.5',
  thumb: 'w-5 h-5',
  thumbHover: 'w-6 h-6',
};

export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      label,
      error,
      hint,
      disabled = false,
      min = 0,
      max = 100,
      step = 1,
      value,
      onChange,
      showValue = false,
      valueFormatter = (v) => v.toString(),
      marks,
      range = false,
      className = '',
      id: providedId,
      ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const trackId = `${id}-track`;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const describedBy = [error && errorId, hint && hintId, ariaDescribedBy].filter(Boolean).join(' ') || undefined;

    const values = Array.isArray(value) ? value : [value];
    const [activeThumb, setActiveThumb] = useState<number | null>(null);
    const [localValues, setLocalValues] = useState(values);
    const thumbsRef = useRef<(HTMLButtonElement | null)[]>([]);
    const trackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setLocalValues(values);
    }, [values]);

    const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;
    const getValueFromPercentage = (percentage: number) => {
      const rawValue = min + (percentage / 100) * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      return Math.max(min, Math.min(max, steppedValue));
    };

    const handleMouseDown = (index: number) => (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      setActiveThumb(index);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleTouchStart = (index: number) => (e: React.TouchEvent) => {
      if (disabled) return;
      setActiveThumb(index);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (activeThumb === null || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const newValue = getValueFromPercentage(percentage);
      const newValues = [...localValues];
      newValues[activeThumb] = newValue;
      if (range && activeThumb === 1 && newValues[1]! < newValues[0]!) {
        newValues[1] = newValues[0]!;
      }
      if (range && activeThumb === 0 && newValues[0]! > newValues[1]!) {
        newValues[0] = newValues[1]!;
      }
      setLocalValues(newValues);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (activeThumb === null || !trackRef.current || e.touches.length === 0) return;
      const rect = trackRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      if (!touch) return;
      const percentage = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
      const newValue = getValueFromPercentage(percentage);
      const newValues = [...localValues];
      newValues[activeThumb] = newValue;
      if (range && activeThumb === 1 && newValues[1]! < newValues[0]!) {
        newValues[1] = newValues[0]!;
      }
      if (range && activeThumb === 0 && newValues[0]! > newValues[1]!) {
        newValues[0] = newValues[1]!;
      }
      setLocalValues(newValues);
    };

    const handleMouseUp = () => {
      if (activeThumb !== null) {
        onChange(range ? localValues : localValues[0]!);
      }
      setActiveThumb(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleTouchEnd = () => {
      if (activeThumb !== null) {
        onChange(range ? localValues : localValues[0]!);
      }
      setActiveThumb(null);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    const handleKeyDown = (index: number) => (e: React.KeyboardEvent) => {
      const newValues = [...localValues];
      let newValue: number = newValues[index]!;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault();
          newValue = Math.min(max, newValue + step);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault();
          newValue = Math.max(min, newValue - step);
          break;
        case 'Home':
          e.preventDefault();
          newValue = min;
          break;
        case 'End':
          e.preventDefault();
          newValue = max;
          break;
        default:
          return;
      }

      newValues[index] = newValue;
      if (range && index === 1 && newValues[1]! < newValues[0]!) {
        newValues[1] = newValues[0]!;
      }
      if (range && index === 0 && newValues[0]! > newValues[1]!) {
        newValues[0] = newValues[1]!;
      }
      setLocalValues(newValues);
      onChange(range ? newValues : newValues[0]!);
    };

    return (
      <div className={cn('w-full', className)} ref={ref}>
        {label && (
          <label
            htmlFor={trackId}
            className="block text-sm font-medium text-[var(--color-ink)] mb-2"
          >
            {label}
            {showValue && (
              <span className="ml-2 text-sm font-semibold text-[var(--color-gold)]">
                {range
                  ? `${valueFormatter(localValues[0]!)} - ${valueFormatter(localValues[1]!)}`
                  : valueFormatter(localValues[0]!)}
              </span>
            )}
          </label>
        )}

        <div
          className="relative"
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={localValues[0]!}
          aria-orientation="horizontal"
          aria-disabled={disabled}
          aria-describedby={describedBy}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown(0)}
        >
          <div
            ref={trackRef}
            id={trackId}
            className={cn(
              'relative',
              sizeStyles.track,
              'rounded-full bg-[var(--color-whisper)]',
              disabled && 'opacity-50'
            )}
            onMouseDown={(e) => {
              if (disabled) return;
              const rect = trackRef.current!.getBoundingClientRect();
              const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
              const newValue = getValueFromPercentage(percentage);
              const closestIndex = localValues.reduce((prev, curr, i) =>
                Math.abs(curr - newValue) < Math.abs(localValues[prev]! - newValue) ? i : prev, 0
              );
              const newValues = [...localValues];
              newValues[closestIndex] = newValue;
              setLocalValues(newValues);
              onChange(range ? newValues : newValues[0]!);
            }}
          >
            {range && localValues.length >= 2 && (
              <motion.div
                className="absolute h-full rounded-full bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-hover)]"
                style={{
                  left: `${getPercentage(localValues[0]!)}%`,
                  right: `${100 - getPercentage(localValues[1]!)}%`,
                }}
                animate={{
                  left: `${getPercentage(localValues[0]!)}%`,
                  right: `${100 - getPercentage(localValues[1]!)}%`,
                }}
                transition={{ duration: 0.15 }}
              />
            )}

            {marks && marks.map((mark) => (
              <div
                key={mark.value}
                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-0.5 rounded-full bg-[var(--color-mist)]"
                style={{ left: `${getPercentage(mark.value)}%` }}
              />
            ))}

            {localValues.map((val, index) => (
              <motion.button
                key={index}
                ref={(el) => { thumbsRef.current[index] = el; }}
                type="button"
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
                  'rounded-full bg-[var(--color-white)] border-2 border-[var(--color-gold)]',
                  'shadow-[var(--shadow-md)] transition-all duration-150 ease-[var(--ease-standard)]',
                  'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-gold)]/40 focus-visible:ring-offset-2',
                  sizeStyles.thumb,
                  activeThumb === index && sizeStyles.thumbHover,
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
                style={{ left: `${getPercentage(val)}%` }}
                onMouseDown={handleMouseDown(index)}
                onTouchStart={handleTouchStart(index)}
                onKeyDown={handleKeyDown(index)}
                aria-label={range ? (index === 0 ? 'Minimum value' : 'Maximum value') : 'Value'}
                aria-valuenow={val}
                aria-valuemin={min}
                aria-valuemax={max}
                disabled={disabled}
                whileHover={{ scale: 1.2, boxShadow: 'var(--shadow-lg)' }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="absolute inset-0 bg-[var(--color-gold)]/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </div>

          {marks && (
            <div className="flex justify-between mt-3 text-xs text-[var(--color-mist)]">
              {marks.map((mark) => (
                <span key={mark.value} style={{ left: `${getPercentage(mark.value)}%` }}>
                  {mark.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {error && (
          <motion.p
            id={errorId}
            role="alert"
            className="mt-2 text-sm text-[var(--color-error)] font-medium flex items-center gap-1.5"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[var(--color-error,#DC2626)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </motion.p>
        )}
        {hint && !error && (
          <motion.p
            id={hintId}
            className="mt-2 text-sm text-[var(--color-mist)]"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {hint}
          </motion.p>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export interface RangeSliderProps extends Omit<SliderProps, 'range' | 'value' | 'onChange'> {
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export function RangeSlider(props: RangeSliderProps) {
  return <Slider {...props} range={true} onChange={(v) => props.onChange(v as [number, number])} />;
}