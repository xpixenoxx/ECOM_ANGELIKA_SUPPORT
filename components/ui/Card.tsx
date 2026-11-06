'use client';

import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'interactive' | 'product' | 'editorial';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  children: ReactNode;
  as?: 'div' | 'article' | 'section';
}

const variantStyles = {
  default: 'bg-[var(--color-white)] border border-[var(--color-whisper)] shadow-[var(--shadow-sm)]',
  elevated: 'bg-[var(--color-white)] shadow-[var(--shadow-lg)] border-none',
  outlined: 'bg-transparent border-2 border-[var(--color-whisper)]',
  interactive: 'bg-[var(--color-white)] border border-[var(--color-whisper)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] hover:border-[var(--color-gold)]/30',
  product: 'bg-[var(--color-white)] border border-[var(--color-whisper)] shadow-[var(--shadow-card)] overflow-hidden',
  editorial: 'bg-[var(--color-snow)] border-none shadow-none',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className = '',
      variant = 'default',
      padding = 'md',
      hoverable = false,
      as: Component = 'div',
      ...props
    },
    ref
  ) => {
    const isInteractive = variant === 'interactive' || variant === 'product' || hoverable;

    const motionProps = {
      className: cn(
        'rounded-[var(--radius-lg)] transition-all duration-300 ease-[var(--ease-standard)]',
        variantStyles[variant],
        paddingStyles[padding],
        isInteractive && 'cursor-pointer',
        className
      ),
      whileHover: isInteractive && !['default', 'outlined', 'editorial'].includes(variant) ? {
        y: -4,
        boxShadow: 'var(--shadow-elevated)',
        borderColor: 'var(--color-gold)',
        transition: { duration: 0.3, ease: 'easeOut' }
      } : undefined,
      whileTap: isInteractive ? { scale: 0.98 } : undefined,
    };

    const motionComponentMap = {
      div: motion.div,
      article: motion.article,
      section: motion.section,
    };
    const MotionComponent = motionComponentMap[Component] || motion.div;

    return (
      // @ts-expect-error - Framer Motion v11 type mismatch with event handlers on polymorphic components
      <MotionComponent
        ref={ref}
        {...props}
        className={motionProps.className}
        whileHover={motionProps.whileHover}
        whileTap={motionProps.whileTap}
      >
        {children}
      </MotionComponent>
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = '', children, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}
export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className = '', children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-[var(--font-display)] text-2xl font-medium text-[var(--color-ink)] tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}
export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className = '', children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('mt-1 text-[var(--color-slate)] text-base leading-relaxed', className)}
      {...props}
    >
      {children}
    </p>
  )
);
CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}
export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', children, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = 'CardContent';

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-4 pt-4 border-t border-[var(--color-whisper)] flex items-center gap-3', className)}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';

export interface ProductCardProps {
  image: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  colors?: string[];
  sizes?: string[];
  isNew?: boolean;
  isSale?: boolean;
  isVidhyasPick?: boolean;
  rating?: number;
  reviewCount?: number;
  onQuickView?: () => void;
  onAddToBag?: () => void;
  onAddToWishlist?: () => void;
  href?: string;
  badge?: 'new' | 'sale' | 'limited' | 'exclusive';
  discount?: number;
  isWishlisted?: boolean;
}

export function ProductCard({
  image,
  name,
  price,
  originalPrice,
  category,
  colors,
  sizes,
  isNew,
  isSale,
  isVidhyasPick,
  rating,
  reviewCount,
  onQuickView,
  onAddToBag,
  onAddToWishlist,
  href,
  badge,
  discount,
  isWishlisted,
}: ProductCardProps) {
  const calculatedDiscount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : discount;
  const isValidHref = Boolean(href && !href.includes('/undefined') && href !== '#');

  const handleAddToBag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToBag?.();
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView();
    } else if (isValidHref && href) {
      window.location.href = href;
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToWishlist?.();
  };

  const cardContent = (
    <Card variant="product" padding="none" hoverable className="group relative">
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-whisper)]">
        <motion.img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 ease-[var(--ease-slow)] group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ contentVisibility: 'auto' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {(isNew || isSale || isVidhyasPick || badge) && (
            <div className="flex flex-col gap-1.5">
              {isNew && (
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-[var(--color-gold)] text-[var(--color-ink)] rounded-[var(--radius-sm)]">
                  New
                </span>
              )}
              {isSale && calculatedDiscount && (
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-[var(--color-error)] text-white rounded-[var(--radius-sm)]">
                  -{calculatedDiscount}%
                </span>
              )}
              {isVidhyasPick && (
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-[var(--color-ink)] text-[var(--color-gold)] rounded-[var(--radius-sm)]">
                  Vidhya's Pick
                </span>
              )}
              {badge === 'limited' && (
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-[var(--color-warning)] text-white rounded-[var(--radius-sm)]">
                  Limited
                </span>
              )}
              {badge === 'exclusive' && (
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-[var(--color-saree)] text-white rounded-[var(--radius-sm)]">
                  Exclusive
                </span>
              )}
            </div>
          )}
          <motion.button
            className={cn(
              "p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:shadow-[var(--shadow-md)]",
              isWishlisted
                ? "bg-[var(--color-ink)] text-[var(--color-error)] opacity-100"
                : "bg-white/90 text-[var(--color-ink)] hover:bg-white"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWishlist}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg
              className={cn("h-5 w-5", isWishlisted && "fill-current text-[var(--color-error)]")}
              viewBox="0 0 24 24"
              fill={isWishlisted ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </motion.button>
        </div>

        <motion.div
          className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            className="flex-1 px-3 py-2 text-sm font-semibold uppercase tracking-wider bg-[var(--color-gold)] text-[var(--color-ink)] rounded-[var(--radius-md)] hover:bg-[var(--color-gold-hover)] shadow-[var(--shadow-gold)]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleQuickView}
          >
            Quick View
          </motion.button>
        </motion.div>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-gold)]">
            {category}
          </span>
          {rating && (
            <div className="flex items-center gap-1 text-sm text-[var(--color-slate)]">
              <svg className="h-4 w-4 text-[var(--color-gold)] fill-current" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{rating}</span>
              {reviewCount && <span className="text-xs">({reviewCount})</span>}
            </div>
          )}
        </div>

        <h3 className="text-[var(--font-display)] text-lg font-medium text-[var(--color-ink)] line-clamp-2 group-hover:text-[var(--color-gold)] transition-colors duration-200">
          {name}
        </h3>

        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-[var(--color-ink)] tabular-nums">₹{price.toLocaleString()}</span>
          {originalPrice && (
            <span className="text-base text-[var(--color-mist)] line-through tabular-nums">₹{originalPrice.toLocaleString()}</span>
          )}
        </div>

        {(colors && colors.length > 0) && (
          <div className="flex items-center gap-1.5" role="group" aria-label="Available colors">
            {colors.slice(0, 5).map((color, i) => (
              <span
                key={color}
                className="w-5 h-5 rounded-full border border-[var(--color-whisper)] transition-transform duration-200 hover:scale-125"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
            ))}
            {colors.length > 5 && (
              <span className="w-5 h-5 rounded-full border border-[var(--color-whisper)] flex items-center justify-center text-xs text-[var(--color-slate)]">
                +{colors.length - 5}
              </span>
            )}
          </div>
        )}

        <motion.button
          className="w-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wider bg-[var(--color-ink)] text-[var(--color-gold)] rounded-[var(--radius-md)] border border-[var(--color-gold)] hover:bg-[var(--color-charcoal)] transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToBag}
        >
          Add to Bag
        </motion.button>
      </div>
    </Card>
  );

  if (isValidHref && href) {
    return (
      <a href={href} className="block" aria-label={`View ${name}`}>
        {cardContent}
      </a>
    );
  }

  return cardContent;
}

export type CardVariant = keyof typeof variantStyles;
export type CardPadding = keyof typeof paddingStyles;