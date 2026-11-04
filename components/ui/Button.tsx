'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode, useRef, useCallback } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Slot } from '@radix-ui/react-slot';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'whatsapp' | 'outline' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  disableMagnetic?: boolean;
  disableRipple?: boolean;
  disableScale?: boolean;
  asChild?: boolean;
}

const variantStyles = {
  primary: 'bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-hover)] text-[var(--color-ink)] shadow-[var(--shadow-gold)] hover:from-[var(--color-gold-hover)] hover:to-[var(--color-gold)] hover:shadow-[var(--shadow-lg)]',
  secondary: 'bg-transparent border-2 border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold-light)]',
  ghost: 'bg-transparent text-[var(--color-gold)] hover:bg-[var(--color-gold-light)]',
  whatsapp: 'bg-[#25D366] text-white hover:bg-[#128C7E] shadow-[0_8px_24px_rgba(37,211,102,0.3)]',
  gold: 'bg-[var(--color-ink)] text-[var(--color-gold)] hover:bg-[var(--color-charcoal)] border border-[var(--color-gold)]',
  outline: 'border-2 border-[var(--color-whisper)] text-[var(--color-ink)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]',
  danger: 'bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/90 shadow-[0_8px_24px_rgba(192,43,43,0.3)]',
};

const sizeStyles = {
  sm: 'px-4 py-2 text-xs gap-1.5',
  md: 'px-6 py-3 text-sm gap-2',
  lg: 'px-8 py-4 text-base gap-2.5',
  xl: 'px-10 py-5 text-lg gap-3',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      disabled = false,
      loading = false,
      iconLeft,
      iconRight,
      disableMagnetic = false,
      disableRipple = false,
      disableScale = false,
      asChild = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLButtonElement>(null);
    // Merge forwarded ref + internal ref
    const setRef = useCallback((node: HTMLButtonElement | null) => {
      (internalRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    }, [ref]);
    const prefersReduced = false;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;
      if (!disableRipple && !prefersReduced) {
        const btn = internalRef.current;
        if (btn) {
          const ripple = document.createElement('span');
          ripple.className = 'absolute inset-0 bg-white/30 rounded-[var(--radius-md)] pointer-events-none animate-ripple';
          const rect = btn.getBoundingClientRect();
          ripple.style.left = `${e.clientX - rect.left}px`;
          ripple.style.top = `${e.clientY - rect.top}px`;
          btn.appendChild(ripple);
          setTimeout(() => ripple.remove(), 600);
        }
      }
      onClick?.(e);
    };

    const handleMouseDown = () => {
      if (!prefersReduced && !disabled && !loading && !disableMagnetic && !disableScale) {
        internalRef.current?.animate({ transform: 'scale(0.96)' }, { duration: 100, fill: 'forwards' });
      }
    };

    const handleMouseUp = () => {
      if (!prefersReduced && !disabled && !loading && !disableMagnetic && !disableScale) {
        internalRef.current?.animate(
          { transform: 'scale(1)' },
          { duration: 150, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', fill: 'forwards' }
        );
      }
    };

    const baseClasses = cn(
      'relative inline-flex items-center justify-center font-medium tracking-wider uppercase',
      'transition-colors duration-150 ease-[var(--ease-standard)]',
      'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-gold)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-white)]',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'overflow-hidden',
      variantStyles[variant],
      sizeStyles[size],
      fullWidth && 'w-full',
      className
    );

    // Extract motion-specific props to avoid conflicts with Framer Motion
    const { onAnimationStart, onAnimationComplete, whileHover: _whileHover, whileTap: _whileTap, ...restProps } = props as Record<string, unknown>;

    const motionProps = {
      onClick: handleClick,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      disabled: disabled || loading,
      className: baseClasses,
      whileHover: !prefersReduced && !disabled && !loading && !disableScale ? {
        scale: variant === 'primary' || variant === 'whatsapp' ? 1.02 : 1,
        boxShadow: variant === 'primary' || variant === 'whatsapp' ? 'var(--shadow-lg)' : 'var(--shadow-md)',
        transition: { duration: 0.2, ease: 'easeOut' }
      } : undefined,
      whileTap: !prefersReduced && !disabled && !loading && !disableScale ? { scale: 0.98 } : undefined,
      ...restProps,
    };

    const content = (
      <>
        {loading && (
          <motion.span
            className="flex items-center gap-1.5"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Processing...</span>
          </motion.span>
        )}
        {!loading && (
          <>
            {iconLeft && <span className="shrink-0" aria-hidden="true">{iconLeft}</span>}
            <span>{children}</span>
            {iconRight && <span className="shrink-0" aria-hidden="true">{iconRight}</span>}
          </>
        )}
        <span className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true" />
      </>
    );

    // When asChild is true, we use Slot to merge button styles and props onto the child element (e.g. Link)
    if (asChild) {
      return (
        <Slot
          ref={ref as any}
          className={baseClasses}
          onClick={handleClick as any}
          aria-disabled={disabled || loading}
          {...(restProps as any)}
        >
          {children}
        </Slot>
      );
    }

    return (
      <motion.button
        ref={setRef}
        {...motionProps}
      >
        {content}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;