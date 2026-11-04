'use client';

import { ReactNode, forwardRef, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'gold' | 'success' | 'error' | 'warning' | 'info' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  pulse?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  icon?: ReactNode;
}

const variantStyles = {
  default: 'bg-[var(--color-gold)] text-[var(--color-ink)]',
  gold: 'bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-hover)] text-[var(--color-ink)] shadow-[var(--shadow-gold)]',
  success: 'bg-[var(--color-success)] text-white',
  error: 'bg-[var(--color-error)] text-white',
  warning: 'bg-[var(--color-warning)] text-[var(--color-ink)]',
  info: 'bg-[var(--color-info)] text-white',
  outline: 'border-2 border-[var(--color-gold)] text-[var(--color-gold)] bg-transparent',
  ghost: 'bg-[var(--color-gold-light)] text-[var(--color-gold)]',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-sm gap-1.5',
  lg: 'px-3 py-1.5 text-base gap-2',
};

const dotStyles = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      className = '',
      variant = 'default',
      size = 'md',
      dot = false,
      pulse = false,
      removable = false,
      onRemove,
      icon,
      ...props
    },
    ref
  ) => {
    return (
      // @ts-expect-error - Framer Motion v11 type conflict with whileTap/whileHover
      <motion.span
        ref={ref}
        className={cn(
          'inline-flex items-center font-semibold uppercase tracking-wider rounded-full',
          'transition-all duration-200',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        whileHover={removable ? { scale: 1.05 } : undefined}
        whileTap={{ scale: 0.95 }}
        {...props}
      >
        {dot && (
          <motion.span
            className={cn(
              'rounded-full',
              dotStyles[size],
              variant === 'outline' || variant === 'ghost'
                ? 'bg-current'
                : 'bg-current/70'
            )}
            animate={pulse ? { opacity: [1, 0.4, 1] } : undefined}
            transition={pulse ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : undefined}
            aria-hidden="true"
          />
        )}
        {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
        <span>{children}</span>
        {removable && (
          <motion.button
            className={cn(
              'ml-1 p-0.5 rounded-full hover:bg-black/10 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current'
            )}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
            aria-label="Remove"
          >
            <svg className={cn('w-3 h-3', sizeStyles[size])} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </motion.button>
        )}
      </motion.span>
    );
  }
);

Badge.displayName = 'Badge';

export interface StatusBadgeProps {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'refunded';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig = {
  pending: { label: 'Pending', variant: 'warning' as const, icon: '⏳' },
  processing: { label: 'Processing', variant: 'info' as const, icon: '⚙️' },
  shipped: { label: 'Shipped', variant: 'gold' as const, icon: '📦' },
  delivered: { label: 'Delivered', variant: 'success' as const, icon: '✅' },
  cancelled: { label: 'Cancelled', variant: 'error' as const, icon: '❌' },
  returned: { label: 'Returned', variant: 'outline' as const, icon: '🔄' },
  refunded: { label: 'Refunded', variant: 'ghost' as const, icon: '💰' },
};

export function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} size={size} className={className} dot={status === 'processing'} pulse={status === 'processing'}>
      {config.label}
    </Badge>
  );
}

export interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const categoryColors: Record<string, string> = {
  kurti: 'gold',
  salwar: 'success',
  lehenga: 'error',
  saree: 'info',
  dupatta: 'warning',
  new: 'gold',
  sale: 'error',
  'vidhya\'s pick': 'gold',
};

export function CategoryBadge({ category, size = 'md', className = '' }: CategoryBadgeProps) {
  const variant = categoryColors[category.toLowerCase()] || 'default';
  return (
    <Badge variant={variant as any} size={size} className={className}>
      {category}
    </Badge>
  );
}

export interface PriceBadgeProps {
  price: number;
  originalPrice?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceBadge({ price, originalPrice, size = 'md', className = '' }: PriceBadgeProps) {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className={cn('flex items-baseline gap-1.5', className)}>
      <Badge variant="gold" size={size} className="font-bold">
        ₹{price.toLocaleString()}
      </Badge>
      {originalPrice && (
        <>
          <span className="text-[var(--color-mist)] line-through text-sm">₹{originalPrice.toLocaleString()}</span>
          {discount > 0 && (
            <Badge variant="error" size="sm" className="font-bold">
              -{discount}%
            </Badge>
          )}
        </>
      )}
    </div>
  );
}