'use client';

import { forwardRef, InputHTMLAttributes, ReactNode, useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children' | 'onChange'> {
  label: ReactNode;
  description?: string;
  disabled?: boolean;
  indeterminate?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      disabled = false,
      indeterminate = false,
      icon,
      className = '',
      id: providedId,
      children,
      onChange,
      onCheckedChange,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const descriptionId = `${id}-description`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <motion.label
        htmlFor={id}
        className={cn(
          'relative flex items-start gap-3 cursor-pointer select-none',
          'transition-colors duration-150',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        whileHover={{ x: disabled ? 0 : 4 }}
      >
        <div className="relative flex-shrink-0">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            disabled={disabled}
            aria-describedby={description ? descriptionId : undefined}
            aria-checked={indeterminate ? 'mixed' : props.checked}
            className="sr-only"
            onChange={handleChange}
            {...props}
          />
          <motion.div
            className={cn(
              'w-5 h-5 rounded-[var(--radius-sm)] border-2 flex items-center justify-center',
              'transition-all duration-200 ease-[var(--ease-standard)]',
              'bg-[var(--color-white)]',
              indeterminate
                ? 'border-[var(--color-gold)] bg-[var(--color-gold)]'
                : props.checked
                ? 'border-[var(--color-gold)] bg-[var(--color-gold)]'
                : 'border-[var(--color-whisper)] hover:border-[var(--color-gold)]/50',
              disabled && 'opacity-50'
            )}
            animate={{
              scale: (props.checked || indeterminate) ? [1, 1.15, 1] : 1,
              rotate: indeterminate ? 0 : props.checked ? [0, -5, 5, 0] : 0,
            }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          >
            {indeterminate ? (
              <motion.div
                className="w-3 h-0.5 rounded bg-[var(--color-ink)]"
                initial={false}
                animate={{ scaleX: [0, 1] }}
                transition={{ delay: 0.1, type: 'spring', damping: 15, stiffness: 200 }}
              />
            ) : (
              <motion.svg
                className="w-3.5 h-3.5 text-[var(--color-ink)]"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                initial={false}
                animate={{
                  pathLength: props.checked ? 1 : 0,
                  opacity: props.checked ? 1 : 0,
                }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </motion.svg>
            )}
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
      </motion.label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export interface CheckboxGroupProps {
  name: string;
  label?: string;
  error?: string;
  hint?: string;
  options: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  value?: string[];
  onChange?: (values: string[]) => void;
  orientation?: 'vertical' | 'horizontal';
  disabled?: boolean;
  className?: string;
}

export function CheckboxGroup({
  name,
  label,
  error,
  hint,
  options,
  value = [],
  onChange,
  orientation = 'vertical',
  disabled = false,
  className = '',
}: CheckboxGroupProps) {
  const groupId = useId();
  const errorId = `${groupId}-error`;
  const hintId = `${groupId}-hint`;

  const handleChange = (optionValue: string, checked: boolean) => {
    const newValues = checked
      ? [...value, optionValue]
      : value.filter((v) => v !== optionValue);
    onChange?.(newValues);
  };

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
        role="group"
        aria-describedby={ariaDescribedBy}
      >
        {options.map((option) => (
          <Checkbox
            key={option.value}
            id={`${groupId}-${option.value}`}
            name={name}
            value={option.value}
            checked={value.includes(option.value)}
            onChange={(e) => handleChange(option.value, e.target.checked)}
            disabled={disabled || option.disabled}
            label={option.label}
            description={option.description}
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

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onText?: string;
  offText?: string;
}

const sizeStyles = {
  sm: 'w-8 h-5',
  md: 'w-11 h-6',
  lg: 'w-14 h-7',
};

const thumbSizeStyles = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      label,
      description,
      disabled = false,
      size = 'md',
      onText = 'On',
      offText = 'Off',
      className = '',
      id: providedId,
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
          'flex items-center gap-3 cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <div className="relative flex-shrink-0">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            disabled={disabled}
            aria-describedby={description ? descriptionId : undefined}
            role="switch"
            aria-checked={props.checked}
            className="sr-only"
            {...props}
          />
          <motion.div
            className={cn(
              'rounded-full border-2 transition-all duration-200 ease-[var(--ease-standard)]',
              'relative flex items-center',
              sizeStyles[size],
              props.checked
                ? 'bg-[var(--color-gold)] border-[var(--color-gold)]'
                : 'bg-[var(--color-whisper)] border-[var(--color-whisper)] hover:border-[var(--color-gold)]/50',
              disabled && 'opacity-50'
            )}
            animate={{
              backgroundColor: props.checked ? 'var(--color-gold)' : 'var(--color-whisper)',
            }}
          >
            <motion.div
              className={cn(
                'rounded-full bg-white shadow-[var(--shadow-md)] transition-transform duration-200 ease-[var(--ease-spring)]',
                'flex items-center justify-center',
                thumbSizeStyles[size],
                props.checked ? 'translate-x-full' : 'translate-x-0'
              )}
              animate={{
                x: props.checked ? '100%' : 0,
              }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            >
              <span className="text-xs font-semibold text-[var(--color-ink)] opacity-0 peer-checked:opacity-100 transition-opacity">
                {onText}
              </span>
              <span className="text-xs font-semibold text-[var(--color-ink)] opacity-100 peer-checked:opacity-0 transition-opacity absolute">
                {offText}
              </span>
            </motion.div>
          </motion.div>
        </div>
        {(label || description) && (
          <div className="flex-1 min-w-0">
            {label && (
              <span className={cn('block font-medium text-[var(--color-ink)]', disabled && 'opacity-50')}>
                {label}
              </span>
            )}
            {description && (
              <p id={descriptionId} className="mt-0.5 text-sm text-[var(--color-slate)]">
                {description}
              </p>
            )}
          </div>
        )}
      </motion.label>
    );
  }
);

Toggle.displayName = 'Toggle';