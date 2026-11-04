'use client';

import { ReactNode, HTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'product' | 'avatar' | 'button';
  lines?: number;
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const variantStyles = {
  text: 'h-4 rounded-[var(--radius-sm)]',
  circular: 'rounded-full',
  rectangular: 'rounded-[var(--radius-md)]',
  card: 'rounded-[var(--radius-lg)]',
  product: 'aspect-[3/4] rounded-[var(--radius-lg)]',
  avatar: 'rounded-full',
  button: 'h-10 rounded-[var(--radius-md)]',
};

const defaultWidths = {
  text: '100%',
  circular: '1rem',
  rectangular: '100%',
  card: '100%',
  product: '100%',
  avatar: '1rem',
  button: 'auto',
};

const defaultHeights = {
  text: '1rem',
  circular: '1rem',
  rectangular: '1rem',
  card: '12rem',
  product: 'auto',
  avatar: '1rem',
  button: '2.5rem',
};

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className = '',
      variant = 'text',
      lines = 1,
      width,
      height,
      animation = 'wave',
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      'bg-[var(--color-whisper)]',
      variantStyles[variant],
      className
    );

    const skeletonWidth = width ?? defaultWidths[variant];
    const skeletonHeight = height ?? defaultHeights[variant];

    const pulseAnimation = animation === 'pulse' ? 'animate-pulse' : '';
    const waveAnimation = animation === 'wave' ? 'relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full before:animate-[shimmer_2s_infinite]' : '';

    if (lines > 1 && variant === 'text') {
      return (
        <div ref={ref} className={cn('space-y-2', className)} {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <motion.div
              key={index}
              className={cn(
                baseStyles,
                pulseAnimation,
                waveAnimation,
                index === lines - 1 && 'w-3/4'
              )}
              style={{ width: skeletonWidth, height: skeletonHeight }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            />
          ))}
        </div>
      );
    }

    if (variant === 'card') {
      return (
        // @ts-expect-error - Framer Motion v11 type conflict with initial/animate
        <motion.div
          ref={ref}
          className={cn(
            'space-y-4 p-6 bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-lg)]',
            className
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          {...props}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className={cn('w-12 h-12 rounded-full', pulseAnimation, waveAnimation)}
            />
            <div className="space-y-2 flex-1">
              <motion.div className={cn('h-4 w-1/3 rounded', pulseAnimation, waveAnimation)} />
              <motion.div className={cn('h-3 w-1/4 rounded text-[var(--color-mist)]', pulseAnimation, waveAnimation)} />
            </div>
          </div>
          <motion.div className={cn('h-4 w-full rounded', pulseAnimation, waveAnimation)} />
          <motion.div className={cn('h-4 w-3/4 rounded', pulseAnimation, waveAnimation)} />
          <motion.div className={cn('h-4 w-1/2 rounded', pulseAnimation, waveAnimation)} />
          <div className="flex gap-3 pt-2">
            <motion.div className={cn('h-10 flex-1 rounded', pulseAnimation, waveAnimation)} />
            <motion.div className={cn('h-10 w-24 rounded', pulseAnimation, waveAnimation)} />
          </div>
        </motion.div>
      );
    }

    if (variant === 'product') {
      return (
        // @ts-expect-error - Framer Motion v11 type conflict with initial/animate
        <motion.article
          ref={ref}
          className={cn(
            'group bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-lg)] overflow-hidden',
            className
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          {...props}
        >
          <motion.div
            className="aspect-[3/4] bg-[var(--color-whisper)]"
          >
            <div className={cn('w-full h-full', pulseAnimation, waveAnimation)} />
          </motion.div>
          <div className="p-4 space-y-3">
            <motion.div className={cn('h-3 w-1/4 rounded text-[var(--color-gold)]', pulseAnimation, waveAnimation)} />
            <motion.div className={cn('h-5 w-3/4 rounded', pulseAnimation, waveAnimation)} />
            <motion.div className={cn('h-4 w-1/2 rounded', pulseAnimation, waveAnimation)} />
            <div className="flex items-center gap-2">
              <motion.div className={cn('w-5 h-5 rounded-full', pulseAnimation, waveAnimation)} />
              <motion.div className={cn('w-5 h-5 rounded-full', pulseAnimation, waveAnimation)} />
              <motion.div className={cn('w-5 h-5 rounded-full', pulseAnimation, waveAnimation)} />
            </div>
            <motion.div className={cn('h-10 w-full rounded', pulseAnimation, waveAnimation)} />
          </div>
        </motion.article>
      );
    }

    if (variant === 'avatar') {
      return (
        // @ts-expect-error - Framer Motion v11 type conflict with initial/animate
        <motion.div
          ref={ref}
          className={cn(
            'relative flex-shrink-0 overflow-hidden',
            variantStyles[variant],
            pulseAnimation,
            waveAnimation
          )}
          style={{ width: skeletonWidth, height: skeletonHeight }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          {...props}
        />
      );
    }

    return (
      // @ts-expect-error - Framer Motion v11 type conflict with initial/animate
      <motion.div
        ref={ref}
        className={cn(baseStyles, pulseAnimation, waveAnimation)}
        style={{ width: skeletonWidth, height: skeletonHeight }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export interface SkeletonTextProps extends Omit<SkeletonProps, 'variant'> {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className = '', ...props }: SkeletonTextProps) {
  return <Skeleton variant="text" lines={lines} className={className} {...props} />;
}

export interface SkeletonCardProps extends Omit<SkeletonProps, 'variant'> {
  className?: string;
}

export function SkeletonCard({ className = '', ...props }: SkeletonCardProps) {
  return <Skeleton variant="card" className={className} {...props} />;
}

export interface SkeletonProductCardProps extends Omit<SkeletonProps, 'variant'> {
  className?: string;
}

export function SkeletonProductCard({ className = '', ...props }: SkeletonProductCardProps) {
  return <Skeleton variant="product" className={className} {...props} />;
}

export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({ rows = 5, columns = 4, className = '' }: SkeletonTableProps) {
  return (
    <div className={cn('overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-whisper)]', className)}>
      <table className="w-full" role="grid">
        <thead>
          <tr className="bg-[var(--color-whisper)]">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} scope="col" className="px-4 py-3">
                <Skeleton variant="text" width="60%" height="1rem" animation="wave" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-t border-[var(--color-whisper)]">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <Skeleton variant="text" width={colIndex === 0 ? '80%' : '60%'} height="1rem" animation="wave" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface SkeletonFormProps {
  fields: Array<{ label: boolean; type: 'text' | 'select' | 'textarea' | 'checkbox' }>;
  className?: string;
}

export function SkeletonForm({ fields, className = '' }: SkeletonFormProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {fields.map((field, index) => (
        <motion.div
          key={index}
          className="space-y-1.5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          {field.label && (
            <Skeleton variant="text" width="30%" height="0.875rem" animation="wave" />
          )}
          {field.type === 'textarea' ? (
            <Skeleton variant="rectangular" width="100%" height="6rem" animation="wave" />
          ) : field.type === 'select' ? (
            <Skeleton variant="rectangular" width="100%" height="2.5rem" animation="wave" />
          ) : field.type === 'checkbox' ? (
            <Skeleton variant="rectangular" width="2rem" height="2rem" animation="wave" className="rounded-[var(--radius-sm)]" />
          ) : (
            <Skeleton variant="rectangular" width="100%" height="2.5rem" animation="wave" />
          )}
        </motion.div>
      ))}
    </div>
  );
}

export interface SkeletonListProps {
  items?: number;
  variant?: 'simple' | 'avatar' | 'media';
  className?: string;
}

export function SkeletonList({ items = 5, variant = 'simple', className = '' }: SkeletonListProps) {
  return (
    <div className={cn('space-y-4', className)} role="list" aria-label="Skeleton list">
      {Array.from({ length: items }).map((_, index) => (
        <motion.div
          key={index}
          className={cn('flex items-center gap-4', variant === 'avatar' && 'relative')}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          {variant === 'avatar' && <Skeleton variant="avatar" size="md" animation="wave" />}
          {variant === 'media' && <Skeleton variant="rectangular" width="80px" height="80px" animation="wave" className="rounded-[var(--radius-md)]" />}
          <div className="flex-1 space-y-2 min-w-0">
            <Skeleton variant="text" width={variant === 'simple' ? '40%' : '60%'} animation="wave" />
            <Skeleton variant="text" width="80%" animation="wave" />
            {variant !== 'simple' && <Skeleton variant="text" width="40%" animation="wave" />}
          </div>
          {variant === 'simple' && <Skeleton variant="circular" size="md" animation="wave" />}
        </motion.div>
      ))}
    </div>
  );
}

export interface SkeletonImageProps extends Omit<SkeletonProps, 'variant'> {
  className?: string;
  aspectRatio?: string;
}

export function SkeletonImage({ className = '', aspectRatio = '1', ...props }: SkeletonImageProps) {
  return (
    <div className={cn('relative overflow-hidden', className)} style={{ aspectRatio }}>
      <Skeleton variant="product" className="w-full h-full" {...props} />
    </div>
  );
}