'use client';

import { ReactNode, useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';

export interface Step {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
  optional?: boolean;
}

export interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: string, index: number) => void;
  onNext?: () => void;
  onBack?: () => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'compact' | 'cards';
  className?: string;
}

const stepVariants = {
  default: {
    container: 'relative',
    line: 'absolute left-1/2 top-0 bottom-0 w-0.5 bg-[var(--color-whisper)]',
    step: 'relative flex flex-col items-center',
    iconWrapper: 'relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300',
    label: 'mt-3 text-center',
  },
  compact: {
    container: 'relative flex items-center',
    line: 'flex-1 h-0.5 bg-[var(--color-whisper)] mx-2',
    step: 'relative flex items-center gap-2',
    iconWrapper: 'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0',
    label: 'flex-1 text-left',
  },
  cards: {
    container: '',
    line: 'hidden',
    step: 'relative flex items-start gap-4 p-4 bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-lg)] transition-all duration-300',
    iconWrapper: 'w-10 h-10 rounded-[var(--radius-md)] border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0',
    label: 'flex-1',
  },
};

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  onNext,
  onBack,
  orientation = 'horizontal',
  variant = 'default',
  className = '',
}: StepperProps) {
  const stepperId = useId();
  const styles = stepVariants[variant];

  if (orientation === 'vertical' && variant !== 'cards') {
    return (
      <div className={cn('space-y-6', className)} role="navigation" aria-label="Stepper" aria-orientation="vertical">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            className={cn(
              styles.step,
              'flex-row items-start gap-4',
              onStepClick && !step.disabled && 'cursor-pointer'
            )}
            onClick={() => !step.disabled && onStepClick?.(step.id, index)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div
              className={cn(
                styles.iconWrapper,
                'flex-shrink-0',
                index < currentStep
                  ? 'bg-[var(--color-gold)] border-[var(--color-gold)] text-[var(--color-ink)]'
                  : index === currentStep
                  ? 'border-[var(--color-gold)] bg-[var(--color-gold-light)] text-[var(--color-gold)] shadow-[var(--shadow-gold)]'
                  : step.disabled
                  ? 'border-[var(--color-whisper)] text-[var(--color-mist)] bg-[var(--color-whisper)]'
                  : 'border-[var(--color-whisper)] text-[var(--color-mist)] hover:border-[var(--color-gold)]/50'
              )}
              onClick={() => !step.disabled && onStepClick?.(step.id, index)}
            >
              {index < currentStep ? (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : step.icon ? (
                <span aria-hidden="true">{step.icon}</span>
              ) : (
                <span className="font-bold text-lg" aria-hidden="true">{index + 1}</span>
              )}
            </div>
            <div className={cn(styles.label, 'flex-1')}>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'font-medium text-[var(--color-ink)]',
                  index > currentStep && 'text-[var(--color-mist)]'
                )}>
                  {step.label}
                </span>
                {step.optional && (
                  <span className="text-xs text-[var(--color-mist)] bg-[var(--color-whisper)] px-2 py-0.5 rounded-[var(--radius-sm)]">
                    Optional
                  </span>
                )}
              </div>
              {step.description && (
                <p className={cn(
                  'mt-1 text-sm',
                  index > currentStep ? 'text-[var(--color-mist)]' : 'text-[var(--color-slate)]'
                )}>
                  {step.description}
                </p>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-[var(--color-whisper)]" />
            )}
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)} role="navigation" aria-label="Stepper" aria-orientation={orientation}>
      {variant === 'cards' ? (
        <div className="space-y-4" role="list">
          {steps.map((step, index) => (
            <motion.article
              key={step.id}
              className={cn(
                styles.step,
                index < currentStep
                  ? 'border-[var(--color-gold)] bg-[var(--color-gold-light)]'
                  : index === currentStep
                  ? 'border-[var(--color-gold)] shadow-[var(--shadow-gold)]'
                  : 'hover:border-[var(--color-gold)]/50',
                step.disabled && 'opacity-50'
              )}
              role="listitem"
              aria-current={index === currentStep ? 'step' : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={cn(
                  styles.iconWrapper,
                  index < currentStep
                    ? 'bg-[var(--color-gold)] border-[var(--color-gold)] text-[var(--color-ink)]'
                    : index === currentStep
                    ? 'border-[var(--color-gold)] bg-[var(--color-gold-light)] text-[var(--color-gold)]'
                    : step.disabled
                    ? 'border-[var(--color-whisper)] text-[var(--color-mist)] bg-[var(--color-whisper)]'
                    : 'border-[var(--color-whisper)] text-[var(--color-mist)]'
                )}
                onClick={() => !step.disabled && onStepClick?.(step.id, index)}
              >
                {index < currentStep ? (
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : step.icon ? (
                  <span aria-hidden="true">{step.icon}</span>
                ) : (
                  <span className="font-bold text-lg" aria-hidden="true">{index + 1}</span>
                )}
              </div>
              <div className={cn(styles.label, 'min-w-0')}>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'font-medium text-[var(--color-ink)]',
                    index > currentStep && 'text-[var(--color-mist)]'
                  )}>
                    {step.label}
                  </span>
                  {step.optional && (
                    <span className="text-xs text-[var(--color-mist)] bg-[var(--color-whisper)] px-2 py-0.5 rounded-[var(--radius-sm)]">
                      Optional
                    </span>
                  )}
                </div>
                {step.description && (
                  <p className={cn(
                    'mt-1 text-sm',
                    index > currentStep ? 'text-[var(--color-mist)]' : 'text-[var(--color-slate)]'
                  )}>
                    {step.description}
                  </p>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      ) : (
        <div
          className={cn(
            'flex items-center',
            orientation === 'vertical' && 'flex-col',
            styles.container
          )}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className={cn(
                styles.step,
                'flex-1',
                onStepClick && !step.disabled && 'cursor-pointer select-none'
              )}
              onClick={() => !step.disabled && onStepClick?.(step.id, index)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {index < steps.length - 1 && (
                <div className={cn(styles.line)} />
              )}
              <div
                className={cn(
                  styles.iconWrapper,
                  index < currentStep
                    ? 'bg-[var(--color-gold)] border-[var(--color-gold)] text-[var(--color-ink)]'
                    : index === currentStep
                    ? 'border-[var(--color-gold)] bg-[var(--color-gold-light)] text-[var(--color-gold)] shadow-[var(--shadow-gold)]'
                    : step.disabled
                    ? 'border-[var(--color-whisper)] text-[var(--color-mist)] bg-[var(--color-whisper)]'
                    : 'border-[var(--color-whisper)] text-[var(--color-mist)] hover:border-[var(--color-gold)]/50'
                )}
                onClick={() => !step.disabled && onStepClick?.(step.id, index)}
              >
                {index < currentStep ? (
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : step.icon ? (
                  <span aria-hidden="true">{step.icon}</span>
                ) : (
                  <span className="font-bold text-lg" aria-hidden="true">{index + 1}</span>
                )}
              </div>
              <div className={cn(styles.label, 'min-w-0')}>
                <span className={cn(
                  'font-medium text-sm',
                  variant === 'compact' && 'truncate',
                  index > currentStep && 'text-[var(--color-mist)]'
                )}>
                  {step.label}
                </span>
                {step.description && variant !== 'compact' && (
                  <p className={cn(
                    'mt-1 text-xs',
                    index > currentStep ? 'text-[var(--color-mist)]' : 'text-[var(--color-slate)]'
                  )}>
                    {step.description}
                  </p>
                )}
                {step.optional && (
                  <span className="text-xs text-[var(--color-mist)]">(Optional)</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {(onNext || onBack) && (
        <motion.div
          className="mt-6 flex justify-between pt-4 border-t border-[var(--color-whisper)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={currentStep === 0}
            iconLeft={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>}
          >
            Back
          </Button>
          <Button
            variant="primary"
            onClick={onNext}
            disabled={currentStep === steps.length - 1}
            iconRight={currentStep === steps.length - 1 ? null : <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </motion.div>
      )}
    </div>
  );
}

export interface StepContentProps {
  step: number;
  children: ReactNode;
  className?: string;
}

export function StepContent({ step, children, className = '' }: StepContentProps) {
  return (
    <motion.div
      className={cn('w-full', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }}
      role="tabpanel"
      aria-labelledby={`step-${step}-label`}
    >
      {children}
    </motion.div>
  );
}