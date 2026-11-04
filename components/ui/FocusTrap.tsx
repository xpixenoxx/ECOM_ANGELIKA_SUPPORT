'use client';

import { ForwardedRef, ReactNode, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface FocusTrapProps {
  children: ReactNode;
  onEscape?: () => void;
  focusRef?: ForwardedRef<HTMLDivElement>;
  disabled?: boolean;
}

export function FocusTrap({ children, onEscape, focusRef, disabled = false }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (disabled) return;

    previousActiveElement.current = document.activeElement as HTMLElement;
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (firstElement) {
      firstElement.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }

      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousActiveElement.current?.focus();
    };
  }, [onEscape, disabled]);

  const handleRef = (el: HTMLDivElement | null) => {
    // @ts-expect-error - RefObject.current is readonly in TypeScript but mutable at runtime
    containerRef.current = el;
    if (typeof focusRef === 'function') {
      focusRef(el);
    } else if (focusRef && 'current' in focusRef) {
      (focusRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    }
  };

  return (
    <div ref={handleRef} className={cn('focus-visible:outline-none')}>
      {children}
    </div>
  );
}