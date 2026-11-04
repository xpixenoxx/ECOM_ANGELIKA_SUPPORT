'use client';

import { ReactNode, useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  variant?: 'default' | 'circular' | 'steps' | 'buffer';
  size?: 'sm' | 'md' | 'lg';
  color?: 'gold' | 'success' | 'error' | 'warning' | 'info';
  striped?: boolean;
  animated?: boolean;
  className?: string;
  ariaLabel?: string;
}

const sizeStyles = {
  default: {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  },
  circular: {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  },
  steps: {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  },
};

const colorStyles = {
  gold: 'bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-hover)]',
  success: 'bg-[var(--color-success)]',
  error: 'bg-[var(--color-error)]',
  warning: 'bg-[var(--color-warning)]',
  info: 'bg-[var(--color-info)]',
};

const trackStyles = {
  default: 'bg-[var(--color-whisper)]',
  circular: 'text-[var(--color-whisper)]',
  steps: 'bg-[var(--color-whisper)]',
};

export function Progress({
  value,
  max = 100,
  label,
  showValue = false,
  variant = 'default',
  size = 'md',
  color = 'gold',
  striped = false,
  animated = false,
  className = '',
  ariaLabel,
}: ProgressProps) {
  const progressId = useId();
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  if (variant === 'circular') {
    const radius = size === 'sm' ? 48 : size === 'md' ? 64 : 96;
    const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 5 : 6;
    const circumference = 2 * Math.PI * (radius - strokeWidth);
    const strokeDashoffset = circumference * (1 - percentage / 100);

    return (
      <div
        className={cn('relative inline-flex flex-col items-center', className)}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel || label}
      >
        <svg className={cn(sizeStyles.circular[size])} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
          <circle
            className={cn(trackStyles.circular)}
            cx={radius}
            cy={radius}
            r={radius - strokeWidth}
            fill="none"
            strokeWidth={strokeWidth}
            stroke="currentColor"
          />
          <motion.circle
            className={cn(colorStyles[color], 'transition-all duration-500 ease-[var(--ease-slow)]')}
            cx={radius}
            cy={radius}
            r={radius - strokeWidth}
            fill="none"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset }}
            initial={{ strokeDashoffset: circumference }}
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
          />
        </svg>
        {(label || showValue) && (
          <div className="mt-3 text-center">
            {label && <p className="text-sm font-medium text-[var(--color-ink)]">{label}</p>}
            {showValue && <p className="text-2xl font-bold text-[var(--color-ink)]">{Math.round(percentage)}%</p>}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'steps') {
    const steps = max;
    const completedSteps = Math.floor((value / max) * steps);

    return (
      <div
        className={cn('w-full', className)}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel || label}
      >
        {label && <p className="text-sm font-medium text-[var(--color-ink)] mb-2">{label}</p>}
        <div className="flex gap-1" role="group" aria-label={`${label || 'Progress'} - ${percentage}% complete`}>
          {Array.from({ length: steps }).map((_, index) => (
            <motion.div
              key={index}
              className={cn(
                'flex-1 rounded-[var(--radius-sm)] transition-all duration-300',
                sizeStyles.steps[size],
                index < completedSteps
                  ? colorStyles[color]
                  : trackStyles.steps
              )}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: index < completedSteps ? 1 : 0 }}
              transition={{ delay: index * 0.1, type: 'spring', damping: 15, stiffness: 100 }}
            />
          ))}
        </div>
        {showValue && <p className="mt-1 text-sm text-[var(--color-slate)] text-right">{Math.round(percentage)}%</p>}
      </div>
    );
  }

  return (
    <div
      className={cn('w-full', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel || label}
    >
      {label && (
        <div className="flex justify-between mb-1.5">
          <p className="text-sm font-medium text-[var(--color-ink)]">{label}</p>
          {showValue && <p className="text-sm font-mono text-[var(--color-gold)]">{Math.round(percentage)}%</p>}
        </div>
      )}
      <div className={cn(
        'relative overflow-hidden rounded-full',
        trackStyles.default,
        sizeStyles.default[size],
      )}>
        <motion.div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-[var(--ease-slow)]',
            colorStyles[color],
            striped && 'relative overflow-hidden',
            animated && 'animate-pulse'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
        >
          {striped && (
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[size:1rem_1rem] animate-[stripe_1s_linear_infinite]" />
          )}
        </motion.div>
      </div>
      {!label && showValue && (
        <p className="mt-1 text-sm text-[var(--color-slate)] text-right">{Math.round(percentage)}%</p>
      )}
    </div>
  );
}

export interface StepProgressProps {
  steps: Array<{ label: string; description?: string; completed?: boolean; current?: boolean; error?: boolean }>;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function StepProgress({
  steps,
  orientation = 'horizontal',
  className = '',
}: StepProgressProps) {
  return (
    <div className={cn('relative', className)} role="list" aria-label="Step progress">
      {orientation === 'horizontal' ? (
        <div className="flex items-start">
          {steps.map((step, index) => (
            <motion.div
              key={step.label}
              className="relative flex flex-col items-center flex-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="relative z-10 flex items-center justify-center">
                {index < steps.length - 1 && (
                  <div className="absolute top-3 left-1/2 w-full h-1.5 -translate-y-1/2 bg-[var(--color-whisper)] z-0" />
                )}
                <div className={cn(
                  'relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                  step.completed
                    ? 'bg-[var(--color-gold)] border-[var(--color-gold)] text-[var(--color-ink)]'
                    : step.current
                    ? 'border-[var(--color-gold)] bg-[var(--color-white)] text-[var(--color-gold)] shadow-[var(--shadow-gold)]'
                    : step.error
                    ? 'border-[var(--color-error)] bg-[var(--color-white)] text-[var(--color-error)]'
                    : 'border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-mist)]'
                )}>
                  {step.completed ? (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : step.error ? (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
              </div>
              <div className="mt-3 text-center w-full px-2">
                <p className={cn(
                  'text-sm font-medium',
                  step.completed || step.current ? 'text-[var(--color-ink)]' : 'text-[var(--color-slate)]'
                )}>
                  {step.label}
                </p>
                {step.description && (
                  <p className={cn(
                    'mt-0.5 text-xs',
                    step.completed || step.current ? 'text-[var(--color-slate)]' : 'text-[var(--color-mist)]'
                  )}>
                    {step.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.label}
              className="flex gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="relative flex-shrink-0">
                <div className="absolute top-6 bottom-0 left-3 w-0.5 bg-[var(--color-whisper)]" />
                <div className={cn(
                  'relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                  step.completed
                    ? 'bg-[var(--color-gold)] border-[var(--color-gold)] text-[var(--color-ink)]'
                    : step.current
                    ? 'border-[var(--color-gold)] bg-[var(--color-white)] text-[var(--color-gold)] shadow-[var(--shadow-gold)]'
                    : step.error
                    ? 'border-[var(--color-error)] bg-[var(--color-white)] text-[var(--color-error)]'
                    : 'border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-mist)]'
                )}>
                  {step.completed ? (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : step.error ? (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
              </div>
              <div className="flex-1 pt-1">
                <p className={cn(
                  'text-sm font-medium',
                  step.completed || step.current ? 'text-[var(--color-ink)]' : 'text-[var(--color-slate)]'
                )}>
                  {step.label}
                </p>
                {step.description && (
                  <p className={cn(
                    'mt-0.5 text-xs',
                    step.completed || step.current ? 'text-[var(--color-slate)]' : 'text-[var(--color-mist)]'
                  )}>
                    {step.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}