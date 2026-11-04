'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface SeparatorProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

export const Separator = forwardRef<HTMLHRElement, SeparatorProps>(
  ({ className = '', orientation = 'horizontal', decorative = true, ...props }, ref) => {
    return (
      <hr
        ref={ref}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={decorative ? undefined : orientation}
        className={cn(
          'bg-[var(--color-whisper)] border-0',
          orientation === 'horizontal' ? 'w-full h-px my-6' : 'h-full w-px mx-6',
          className
        )}
        {...props}
      />
    );
  }
);

Separator.displayName = 'Separator';