'use client';

import { forwardRef, ImgHTMLAttributes, ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src?: string;
  alt?: string;
  fallback?: ReactNode;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square' | 'rounded';
  status?: 'online' | 'offline' | 'busy' | 'away';
  statusPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  border?: boolean;
  ring?: boolean;
  className?: string;
}

const sizeStyles = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-2xl',
};

const shapeStyles = {
  circle: 'rounded-full',
  square: 'rounded-none',
  rounded: 'rounded-[var(--radius-md)]',
};

const statusSizeStyles = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-3.5 h-3.5',
  '2xl': 'w-4 h-4',
};

const statusColors = {
  online: 'bg-[var(--color-success)]',
  offline: 'bg-[var(--color-mist)]',
  busy: 'bg-[var(--color-error)]',
  away: 'bg-[var(--color-warning)]',
};

const statusPositionStyles = {
  'bottom-right': 'bottom-0 right-0',
  'bottom-left': 'bottom-0 left-0',
  'top-right': 'top-0 right-0',
  'top-left': 'top-0 left-0',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() || '?';
  const first = parts[0];
  const last = parts[parts.length - 1];
  return (first?.[0] || '') + (last?.[0] || '');
}

function getColorFromName(name: string): string {
  const colors: string[] = [
    'bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-hover)]',
    'bg-gradient-to-br from-[var(--color-kurti)] to-[var(--color-gold-hover)]',
    'bg-gradient-to-br from-[var(--color-salwar)] to-[var(--color-gold-hover)]',
    'bg-gradient-to-br from-[var(--color-lehenga)] to-[var(--color-gold-hover)]',
    'bg-gradient-to-br from-[var(--color-saree)] to-[var(--color-gold-hover)]',
    'bg-gradient-to-br from-[var(--color-dupatta)] to-[var(--color-gold-hover)]',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length]!;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = '',
      fallback,
      name,
      size = 'md',
      shape = 'circle',
      status,
      statusPosition = 'bottom-right',
      border = false,
      ring = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(!!src);

    const showFallback = !src || imageError;
    const initials = name ? getInitials(name) : (alt ? getInitials(alt) : '?');
    const bgColor = name ? getColorFromName(name) : (alt ? getColorFromName(alt) : 'bg-[var(--color-whisper)] text-[var(--color-mist)]');

    return (
      // @ts-expect-error - Framer Motion v11 type mismatch with whileHover/onAnimationStart
      <motion.div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center overflow-hidden flex-shrink-0',
          'transition-all duration-200',
          sizeStyles[size],
          shapeStyles[shape],
          border && 'border-2 border-[var(--color-whisper)]',
          ring && 'ring-2 ring-[var(--color-gold)] ring-offset-2 ring-offset-[var(--color-white)]',
          className
        )}
        whileHover={{ scale: 1.05 }}
        {...props}
      >
        {isLoading && !imageError && !showFallback && (
          <div className="absolute inset-0 bg-[var(--color-whisper)] animate-pulse" />
        )}

        {!showFallback ? (
          <img
            src={src!}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover transition-opacity duration-300"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setImageError(true);
              setIsLoading(false);
            }}
            style={{ opacity: isLoading ? 0 : 1 }}
          />
        ) : fallback ? (
          <div className="w-full h-full flex items-center justify-center">{fallback}</div>
        ) : (
          <div
            className={cn(
              'w-full h-full flex items-center justify-center font-bold select-none',
              'transition-colors duration-200',
              bgColor
            )}
          >
            {initials}
          </div>
        )}

        {status && (
          <motion.span
            className={cn(
              'absolute rounded-full border-2 border-[var(--color-white)]',
              statusSizeStyles[size],
              statusColors[status],
              statusPositionStyles[statusPosition]
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            aria-label={`Status: ${status}`}
          />
        )}

        {ring && (
          <motion.div
            className="absolute inset-0 border-2 border-[var(--color-gold)] rounded-full"
            animate={{ opacity: [1, 0], scale: [1, 1.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </motion.div>
    );
  }
);

Avatar.displayName = 'Avatar';

export interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    alt?: string;
    name?: string;
    fallback?: ReactNode;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    href?: string;
  }>;
  max?: number;
  overlap?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export function AvatarGroup({
  avatars,
  max = 5,
  overlap = -8,
  size = 'md',
  className = '',
}: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={cn('flex items-center', className)} role="group" aria-label={`${avatars.length} people`}>
      {visibleAvatars.map((avatar, index) => (
        <motion.div
          key={avatar.src || avatar.name || index}
          className="relative z-10"
          style={{ zIndex: max - index }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          {avatar.href ? (
            <a href={avatar.href} className="block" aria-label={avatar.name || avatar.alt || 'View profile'}>
              <Avatar
                src={avatar.src}
                alt={avatar.alt}
                name={avatar.name}
                fallback={avatar.fallback}
                size={size}
                className={cn(
                  'transition-shadow duration-200',
                  index === 0 ? '' : 'shadow-[var(--shadow-md)]'
                )}
              />
            </a>
          ) : (
            <Avatar
              src={avatar.src}
              alt={avatar.alt}
              name={avatar.name}
              fallback={avatar.fallback}
              size={size}
              className={cn(
                'transition-shadow duration-200',
                index === 0 ? '' : 'shadow-[var(--shadow-md)]'
              )}
            />
          )}
        </motion.div>
      ))}
      {remainingCount > 0 && (
        <motion.div
          className={cn(
            'relative flex items-center justify-center font-medium text-[var(--color-ink)]',
            'border-2 border-[var(--color-white)]',
            'bg-[var(--color-whisper)]',
            shapeStyles.circle,
            sizeStyles[size],
          )}
          style={{ marginLeft: `${overlap}px` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: max * 0.05 }}
          role="img"
          aria-label={`${remainingCount} more people`}
        >
          +{remainingCount}
        </motion.div>
      )}
    </div>
  );
}

export interface UserAvatarProps extends Omit<AvatarProps, 'name'> {
  user: {
    name: string;
    email?: string;
    avatarUrl?: string;
    initials?: string;
  };
}

export function UserAvatar({ user, ...props }: UserAvatarProps) {
  return (
    <Avatar
      name={user.name}
      src={user.avatarUrl}
      alt={user.name}
      fallback={user.initials ? <span>{user.initials}</span> : undefined}
      {...props}
    />
  );
}

export type AvatarSize = keyof typeof sizeStyles;
export type AvatarShape = keyof typeof shapeStyles;