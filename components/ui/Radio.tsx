'use client';

import { forwardRef, InputHTMLAttributes, ReactNode, useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  icon?: ReactNode;
  image?: string;
  price?: number;
  originalPrice?: number;
}

export interface RadioGroupProps {
  name: string;
  label?: string;
  error?: string;
  hint?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  orientation?: 'vertical' | 'horizontal';
  disabled?: boolean;
  className?: string;
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'> {
  label: string;
  description?: string;
  disabled?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      description,
      disabled = false,
      icon,
      className = '',
      id: providedId,
      children,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const descriptionId = `${id}-description`;

    return (
      <motion.label
        htmlFor={id}
        className={cn(
          'relative flex items-start gap-3 cursor-pointer',
          'transition-colors duration-150',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        whileHover={{ x: disabled ? 0 : 4 }}
      >
        <div className="relative flex-shrink-0">
          {/* children is explicitly excluded from ...props so it never reaches this void element */}
          <input
            ref={ref}
            type="radio"
            id={id}
            disabled={disabled}
            aria-describedby={description ? descriptionId : undefined}
            className="sr-only"
            {...props}
          />
          <motion.div
            className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center',
              'transition-all duration-200 ease-[var(--ease-standard)]',
              'bg-[var(--color-white)]',
              props.checked
                ? 'border-[var(--color-gold)]'
                : 'border-[var(--color-whisper)] hover:border-[var(--color-gold)]/50',
              disabled && 'opacity-50'
            )}
            animate={{
              scale: props.checked ? [1, 1.15, 1] : 1,
            }}
          >
            <motion.div
              className="w-2.5 h-2.5 rounded-full bg-[var(--color-gold)]"
              initial={false}
              animate={{ scale: props.checked ? 1 : 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            />
          </motion.div>
        </div>
        <div className="flex-1 min-w-0">
          <span className={cn('block font-medium text-[var(--color-ink)]', disabled && 'opacity-50')}>
            {label}
            {icon && <span className="ml-2" aria-hidden="true">{icon}</span>}
          </span>
          {description && (
            <p id={descriptionId} className="mt-0.5 text-sm text-[var(--color-slate)]">
              {description}
            </p>
          )}
        </div>
        {/* Extra slot: allows callers to embed badges/icons inside the label wrapper */}
        {children}
      </motion.label>
    );
  }
);

Radio.displayName = 'Radio';

export function RadioGroup({
  name,
  label,
  error,
  hint,
  options,
  value,
  onChange,
  orientation = 'vertical',
  disabled = false,
  className = '',
}: RadioGroupProps) {
  const groupId = useId();
  const errorId = `${groupId}-error`;
  const hintId = `${groupId}-hint`;
  const ariaLabelledBy = label ? undefined : groupId;
  const ariaDescribedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined;

  return (
    <fieldset className={cn(className)} disabled={disabled}>
      {label && (
        <legend className="text-sm font-medium text-[var(--color-ink)] mb-3">
          {label}
        </legend>
      )}
      <div
        className={cn(
          'space-y-3',
          orientation === 'horizontal' && 'flex flex-wrap gap-4 items-start'
        )}
        role="radiogroup"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            id={`${groupId}-${option.value}`}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled || option.disabled}
            label={option.label}
            description={option.description}
            icon={option.icon}
            className={orientation === 'horizontal' ? 'flex-shrink-0' : ''}
          />
        ))}
      </div>
      {error && (
        <motion.p
          id={errorId}
          role="alert"
          className="mt-2 text-sm text-[var(--color-error)] font-medium flex items-center gap-1.5"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <svg className="shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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
    </fieldset>
  );
}

export interface RadioCardOption extends RadioOption {
  image?: string;
  price?: number;
  originalPrice?: number;
}

export function RadioCardGroup({
  name,
  label,
  error,
  options,
  value,
  onChange,
  disabled = false,
  className = '',
}: RadioGroupProps & { options: RadioCardOption[] }) {
  return (
    <fieldset className={cn(className)} disabled={disabled}>
      {label && (
        <legend className="text-sm font-medium text-[var(--color-ink)] mb-3">
          {label}
        </legend>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" role="radiogroup">
        {options.map((option) => (
          <motion.label
            key={option.value}
            className={cn(
              'relative group cursor-pointer rounded-[var(--radius-lg)] border-2 transition-all duration-200',
              'overflow-hidden',
              value === option.value
                ? 'border-[var(--color-gold)] bg-[var(--color-gold-light)] shadow-[var(--shadow-gold)]'
                : 'border-[var(--color-whisper)] hover:border-[var(--color-gold)]/50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            whileTap={{ scale: 0.98 }}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={disabled || option.disabled}
              className="absolute inset-0 opacity-0 pointer-events-none"
            />
            {option.image && (
              <div className="aspect-square relative overflow-hidden bg-[var(--color-whisper)]">
                <img
                  src={option.image}
                  alt={option.label}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {value === option.value && (
                  <div className="absolute inset-0 bg-[var(--color-gold)]/10" />
                )}
              </div>
            )}
            <div className="p-3">
              <span className="font-medium text-[var(--color-ink)] block truncate">
                {option.label}
              </span>
              {option.description && (
                <p className="mt-0.5 text-xs text-[var(--color-slate)] line-clamp-1">
                  {option.description}
                </p>
              )}
              {option.price !== undefined && (
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-bold text-[var(--color-ink)]">₹{option.price.toLocaleString()}</span>
                  {option.originalPrice && (
                    <span className="text-sm text-[var(--color-mist)] line-through">
                      ₹{option.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              )}
            </div>
            <motion.div
              className={cn(
                'absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center',
                value === option.value
                  ? 'border-[var(--color-gold)] bg-[var(--color-gold)]'
                  : 'border-[var(--color-whisper)] bg-[var(--color-white)]'
              )}
              animate={{ scale: value === option.value ? [1, 1.2, 1] : 1 }}
            >
              {value === option.value && (
                <svg className="h-3.5 w-3.5 text-[var(--color-ink)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </motion.div>
          </motion.label>
        ))}
      </div>
      {error && (
        <motion.p
          role="alert"
          className="mt-2 text-sm text-[var(--color-error)] font-medium flex items-center gap-1.5"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <svg className="shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </motion.p>
      )}
    </fieldset>
  );
}