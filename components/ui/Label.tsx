'use client';

import { forwardRef, LabelHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'text-xs mb-1',
  md: 'text-sm mb-1.5',
  lg: 'text-base mb-2',
};

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, required = false, size = 'md', className = '', htmlFor, ...props }, ref) => {
    return (
      <label
        ref={ref}
        htmlFor={htmlFor}
        className={cn(
          'block font-medium text-[var(--color-ink)]',
          'transition-colors duration-150 ease-[var(--ease-standard)]',
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="text-[var(--color-error)] ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = 'Label';