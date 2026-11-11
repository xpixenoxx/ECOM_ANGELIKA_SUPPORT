'use client';

import { useState, forwardRef, HTMLAttributes, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { useCart } from '@/lib/hooks/useCart';

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
        'rounded-[var(--radius-lg)]',
        variantStyles[variant],
        paddingStyles[padding],
        isInteractive && 'cursor-pointer',
        className
      ),
      whileHover: undefined,
      whileTap: undefined,
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

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> { }
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = '', children, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> { }
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

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> { }
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

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> { }
export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', children, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = 'CardContent';

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> { }
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
  id?: string;
  image: string;
  name: string;
  price: number;
  originalPrice?: number;
  category?: string;
  colors?: string[];
  sizes?: string[];
  isNew?: boolean;
  isSale?: boolean;
  isVidhyasPick?: boolean;
  isFeatured?: boolean;
  is_featured?: boolean;
  rating?: number;
  reviewCount?: number;
  onQuickView?: () => void;
  onAddToBag?: () => void | boolean | Promise<void | boolean>;
  onAddToWishlist?: () => void;
  href?: string;
  badge?: 'new' | 'sale' | 'limited' | 'exclusive';
  discount?: number;
  isWishlisted?: boolean;
  inStock?: boolean;
  inventory_quantity?: number;
  stock?: number;
  className?: string;
  [key: string]: any;
}

export function ProductCard({
  id,
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
  isFeatured,
  is_featured,
  rating = 5.0,
  reviewCount,
  onQuickView,
  onAddToBag,
  onAddToWishlist,
  href,
  badge,
  discount,
  isWishlisted,
  inStock,
  inventory_quantity,
  stock,
  className = '',
  ...rest
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const cart = useCart();

  const isOutOfStock =
    inStock === false ||
    inventory_quantity === 0 ||
    stock === 0 ||
    rest['inStock'] === false ||
    rest['inventory_quantity'] === 0 ||
    rest['stock'] === 0;

  const calculatedDiscount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : discount;
  const isValidHref = Boolean(href && !href.includes('/undefined') && href !== '#');

  const handleAddToBag = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdding || isOutOfStock) return;
    setIsAdding(true);
    try {
      let added = false;
      if (onAddToBag) {
        const res = await onAddToBag();
        if (res !== false) {
          added = true;
        }
      }
      if (!added) {
        const cleanPrice = typeof price === 'number' && !isNaN(price) && price > 0
          ? price
          : Number(String(price || '').replace(/[^0-9.]/g, '')) || 2999;
        const targetId = id || (rest['slug'] as string) || (rest['defaultVariantId'] as string) || (rest['variant_id'] as string) || name || 'prod-1';
        const stockVal = typeof inventory_quantity === 'number'
          ? inventory_quantity
          : (typeof stock === 'number' ? stock : (typeof rest['inventory_quantity'] === 'number' ? rest['inventory_quantity'] : undefined));
        const res = await cart.addItem(targetId, 1, 'Free Size', {
          product_id: targetId,
          product_name: name,
          price: cleanPrice,
          image: image || '/images/collection-kurtis.jpg',
          is_vidyas_pick: Boolean(isVidhyasPick),
          inventory_quantity: stockVal,
          max_quantity: stockVal,
        });
        if (res !== false) {
          added = true;
        }
      }
      if (added) {
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
      }
    } catch (err) {
      console.error('Failed to add to bag:', err);
    } finally {
      setIsAdding(false);
    }
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

  const isProductFeatured = Boolean(isFeatured || is_featured);

  const badgeText = badge
    ? badge.toUpperCase()
    : isProductFeatured
      ? 'FEATURED'
      : isNew || isVidhyasPick
        ? 'NEW ARRIVAL'
        : isSale && calculatedDiscount
          ? `SALE ${calculatedDiscount}%`
          : 'NEW ARRIVAL';

  const cardContent = (
    <div className={cn("group relative flex flex-col w-[320px] max-w-full mx-auto bg-white", className)}>
      {/* ── 1. Image Viewport with Inset Badges (Explicit 320x400, No Zoom on Hover) ── */}
      <div
        style={{ width: '320px', height: '400px' }}
        className="relative w-[320px] h-[400px] max-w-full overflow-hidden bg-[#F7F5F0] mx-auto shrink-0"
      >
        {isValidHref && href ? (
          <Link href={href} className="block w-full h-full cursor-pointer" aria-label={`View ${name}`}>
            <img
              src={image}
              alt={name}
              width={320}
              height={400}
              className="w-[320px] h-[400px] max-w-full object-cover object-top"
              sizes="320px"
              style={{ width: '320px', height: '400px', contentVisibility: 'auto' }}
            />
          </Link>
        ) : (
          <img
            src={image}
            alt={name}
            width={320}
            height={400}
            className="w-[320px] h-[400px] max-w-full object-cover object-top"
            sizes="320px"
            style={{ width: '320px', height: '400px', contentVisibility: 'auto' }}
          />
        )}

        {/* Floating Wishlist Button */}
        {(onAddToWishlist || isWishlisted) && (
          <button
            type="button"
            onClick={handleWishlist}
            className={cn(
              "absolute top-2.5 right-2.5 p-2 rounded-full shadow-sm z-10 cursor-pointer transition-all duration-200",
              isWishlisted
                ? "bg-white text-[#A84557] hover:scale-110"
                : "bg-white/90 text-[#6B5E55] hover:text-[#A84557] hover:bg-white hover:scale-110"
            )}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg
              className={cn("h-4 w-4 transition-transform active:scale-125", isWishlisted && "fill-current text-[#A84557]")}
              viewBox="0 0 24 24"
              fill={isWishlisted ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={isWishlisted ? "1.8" : "2"}
              aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}

        {/* Bottom-Left Badge: FEATURED (Gold #B38E36) / NEW ARRIVAL (Wine-Red #A84557) */}
        <div className={cn(
          "absolute bottom-0 left-0 text-white px-2.5 py-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider z-10 pointer-events-none",
          isProductFeatured && !badge ? "bg-[#B38E36]" : "bg-[#A84557]"
        )}>
          {badgeText}
        </div>
      </div>

      {/* ── 2. Attached Action Bar: ADD TO CART + (320px × 33.8px, padding: 10px 0px, font: 13px) ── */}
      <button
        type="button"
        onClick={handleAddToBag}
        disabled={isAdding || isOutOfStock}
        style={{
          width: '320px',
          height: '33.8px',
          padding: '10px 0px',
          fontSize: '13px',
          lineHeight: '13.8px',
          boxSizing: 'border-box',
        }}
        className={cn(
          "btn-add-to-cart group/btn relative w-[320px] max-w-full h-[33.8px] py-[10px] px-0 text-[13px] font-bold uppercase tracking-[0.18em] flex items-center justify-center gap-1.5 focus:outline-hidden shrink-0 mx-auto leading-[13.8px] overflow-hidden transition-colors duration-200",
          isOutOfStock
            ? "bg-[#EAE5DE] text-[#8C827A] cursor-not-allowed pointer-events-none"
            : isAdded
              ? "bg-emerald-700 text-white cursor-pointer"
              : isAdding
                ? "bg-[#111111] text-[#FBF4EC] opacity-85 cursor-pointer"
                : "bg-[#FBF4EC] text-[#111111] cursor-pointer"
        )}
      >
        {isOutOfStock ? (
          <span className="relative z-10 leading-none text-[12px] font-semibold text-[#8C827A]">
            OUT OF STOCK
          </span>
        ) : isAdded ? (
          <span className="relative z-10 leading-none text-[12px] flex items-center gap-1 text-white">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            ADDED TO BAG
          </span>
        ) : isAdding ? (
          <span className="relative z-10 leading-none text-[12px] flex items-center gap-1.5 text-[var(--color-gold)]">
            <span className="w-3 h-3 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
            ADDING...
          </span>
        ) : (
          <>
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-white transform translate-y-full group-hover/btn:translate-y-0 transition-transform duration-350 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none z-[1]"
            />
            <span className="relative z-10 leading-none text-[13px]">ADD TO CART</span>
            <span className="relative z-10 leading-none text-[13px] font-normal">+</span>
          </>
        )}
      </button>

      {/* ── 3. Centered Title & Price Section ────────────────────────────── */}
      <div className="pt-2.5 pb-2 px-1 text-center flex flex-col items-center">
        {isValidHref && href ? (
          <Link href={href} className="block hover:underline" aria-label={`View ${name}`}>
            <h3 className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.08em] text-[#111111] line-clamp-1">
              {name}
            </h3>
          </Link>
        ) : (
          <h3 className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.08em] text-[#111111] line-clamp-1">
            {name}
          </h3>
        )}
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-[11px] sm:text-[12px] font-bold text-[#111111] tabular-nums">
            ₹ {price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-[10px] sm:text-[11px] text-[#888888] line-through tabular-nums">
              ₹ {originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return cardContent;
}

export type CardVariant = keyof typeof variantStyles;
export type CardPadding = keyof typeof paddingStyles;