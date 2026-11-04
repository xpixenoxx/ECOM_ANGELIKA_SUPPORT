'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: { width: '36px', height: '20px', thumb: '16px', translate: '16px' },
  md: { width: '44px', height: '24px', thumb: '20px', translate: '20px' },
  lg: { width: '52px', height: '28px', thumb: '24px', translate: '24px' },
};

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className = '', size = 'md', disabled = false, ...props }, ref) => {
    const styles = sizeStyles[size];

    return (
      <label
        className={cn(
          'inline-flex items-center cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <div
          className={cn(
            'relative flex-shrink-0 rounded-full border-2 transition-all duration-200 ease-[var(--ease-spring)]',
            'bg-[var(--color-whisper)] border-[var(--color-whisper)]',
            'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-gold)]/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--color-white)]',
            'peer-checked:bg-[var(--color-gold)] peer-checked:border-[var(--color-gold)]',
            'peer-disabled:opacity-50',
            `w-[${styles.width}] h-[${styles.height}]`
          )}
          aria-hidden="true"
        >
          <span
            className={cn(
              'absolute top-1/2 left-1 bg-white rounded-full shadow-[var(--shadow-sm)] transition-transform duration-200 ease-[var(--ease-spring)]',
              'peer-checked:translate-x-[var(--translate-x, 20px)]',
              'peer-checked:translate-x-[20px]',
              `w-[${styles.thumb}] h-[${styles.thumb}]`,
              size === 'sm' && 'peer-checked:translate-x-[16px]',
              size === 'md' && 'peer-checked:translate-x-[20px]',
              size === 'lg' && 'peer-checked:translate-x-[24px]'
            )}
            style={{
              transform: `translateY(-50%) ${props.checked ? `translateX(${styles.translate})` : 'translateX(0)'}`,
            }}
          />
        </div>
      </label>
    );
  }
);

Switch.displayName = 'Switch';