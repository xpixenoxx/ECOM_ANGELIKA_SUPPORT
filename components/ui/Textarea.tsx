'use client';

import { forwardRef, TextareaHTMLAttributes, ReactNode, useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  ariaDescribedBy?: string;
}

const sizeStyles = {
  sm: 'px-3 py-2 text-sm min-h-[80px]',
  md: 'px-4 py-3 text-base min-h-[100px]',
  lg: 'px-5 py-4 text-lg min-h-[120px]',
};

const labelSizeStyles = {
  sm: 'text-xs mb-1',
  md: 'text-sm mb-1.5',
  lg: 'text-base mb-2',
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      disabled = false,
      size = 'md',
      fullWidth = false,
      className = '',
      id: providedId,
      ariaDescribedBy,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const describedBy = [error && errorId, hint && hintId, ariaDescribedBy].filter(Boolean).join(' ') || undefined;

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'block font-medium text-[var(--color-ink)]',
              'transition-colors duration-150 ease-[var(--ease-standard)]',
              labelSizeStyles[size],
              disabled && 'opacity-50'
            )}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          className={cn(
            'w-full bg-[var(--color-white)] border rounded-[var(--radius-md)]',
            'font-sans font-normal resize-y',
            'text-[var(--color-ink)] placeholder:text-[var(--color-mist)]',
            'transition-all duration-150 ease-[var(--ease-standard)]',
            'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-gold)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-white)]',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--color-whisper)]',
            'hover:not(:disabled):border-[var(--color-gold)]/50',
            error && 'border-[var(--color-error)] focus-visible:ring-[var(--color-error)]/40',
            sizeStyles[size],
            className
          )}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-focus)';
            onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = '';
            onBlur?.(e);
          }}
          {...props}
        />
        {error && (
          <motion.p
            id={errorId}
            role="alert"
            className="mt-1.5 text-xs text-[var(--color-error,#DC2626)] font-normal flex items-start gap-1.5 leading-tight"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[var(--color-error,#DC2626)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </motion.p>
        )}
        {hint && !error && (
          <motion.p
            id={hintId}
            className="mt-1.5 text-xs text-[var(--color-mist)] flex items-center gap-1.5 leading-tight"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {hint}
          </motion.p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export type TextareaSize = keyof typeof sizeStyles;