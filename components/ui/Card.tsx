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
  rating?: number;
  reviewCount?: number;
  onQuickView?: () => void;
  onAddToBag?: () => void | boolean | Promise<void | boolean>;
  onAddToWishlist?: () => void;
  href?: string;
  badge?: 'new' | 'sale' | 'limited' | 'exclusive';
  discount?: number;
  isWishlisted?: boolean;
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
  rating = 5.0,
  reviewCount,
  onQuickView,
  onAddToBag,
  onAddToWishlist,
  href,
  badge,
  discount,
  isWishlisted,
  className = '',
  ...rest
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const cart = useCart();

  const calculatedDiscount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : discount;

  // Resolve product URL cleanly so clicking ANY product card redirects directly to that product's PDP
  const slugFromProp = (rest['slug'] as string) || (href && href.startsWith('/product/') ? href.replace('/product/', '').split('?')[0] : undefined);
  const slugFromName = name ? name.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-') : undefined;
  const targetProductSlug = slugFromProp || slugFromName;

  const finalHref = (href && href.startsWith('/product/'))
    ? href
    : targetProductSlug
      ? `/product/${targetProductSlug}`
      : (href && !href.startsWith('/shop') && !href.startsWith('/vidhyas-picks') ? href : (targetProductSlug ? `/product/${targetProductSlug}` : '#'));
  const isValidHref = Boolean(finalHref && !finalHref.includes('/undefined') && finalHref !== '#');

  const handleAddToBag = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdding) return;
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
        const res = await cart.addItem(targetId, 1, 'Free Size', {
          product_id: targetId,
          product_name: name,
          price: cleanPrice,
          image: image || '/images/collection-kurtis.jpg',
          is_vidyas_pick: Boolean(isVidhyasPick),
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

  const badgeText = badge
    ? badge.toUpperCase()
    : isNew || isVidhyasPick
      ? 'NEW ARRIVAL'
      : isSale && calculatedDiscount
        ? `SALE ${calculatedDiscount}%`
        : 'NEW ARRIVAL';

  const cardContent = (
    <div
      className={cn(
        "group relative flex flex-col w-full bg-white content-visibility-auto text-left",
        className
      )}
      style={{ boxSizing: 'border-box' }}
    >
      {/* ── 1. Image Viewport (Aspect Ratio: 377.2 / 554.7 ≈ 1 : 1.4705) ── */}
      <div className="relative w-full aspect-[377.2/554.7] overflow-hidden bg-[#F7F5F0]">
        {isValidHref ? (
          <Link href={finalHref} className="block w-full h-full cursor-pointer" aria-label={`View ${name}`}>
            <img
              src={image}
              alt={name}
              width={378}
              height={555}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
            />
          </Link>
        ) : (
          <img
            src={image}
            alt={name}
            width={378}
            height={555}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
          />
        )}

        {/* Minimal Outline Heart (20x20 matching svg.icon-wishlist-add-dims) */}
        {(onAddToWishlist || isWishlisted) && (
          <button
            type="button"
            onClick={handleWishlist}
            className="absolute top-3 right-3 p-1 z-10 cursor-pointer text-[#1A1A1A] hover:scale-110 transition-transform"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg
              className={cn("w-5 h-5 icon-wishlist-add-dims transition-colors", isWishlisted ? "fill-[#1A1A1A] text-[#1A1A1A]" : "stroke-[1.3] text-[#1A1A1A]/80 hover:text-[#1A1A1A]")}
              viewBox="0 0 24 24"
              fill={isWishlisted ? "currentColor" : "none"}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}

        {/* Minimal Slide / Active Indicator Line below image */}
        <div className="absolute bottom-0 inset-x-0 h-[2px] bg-[#EAE5DF]">
          <div className="h-full w-10 bg-[#424242]" />
        </div>
      </div>

      {/* ── 2. Text Container (div.SearchHitsItem__search-hit__text-container) ── */}
      <div className="SearchHitsItem__search-hit__text-container flex flex-col w-full text-left">
        {/* Product Name (div.ProductHitName__product-hit__name, padding: 16px 12px 0px) */}
        <div className="ProductHitName__product-hit__name pt-[16px] px-[12px] pb-0">
          {isValidHref ? (
            <Link href={finalHref} className="block group/title hover:no-underline" aria-label={`View ${name}`}>
              <span className="ProductHitName__product-hit__name-text block text-[14px] font-semibold text-[#424242] leading-[1.3] line-clamp-2 hover:underline">
                {name}
              </span>
            </Link>
          ) : (
            <span className="ProductHitName__product-hit__name-text block text-[14px] font-semibold text-[#424242] leading-[1.3] line-clamp-2">
              {name}
            </span>
          )}
        </div>

        {/* Product Price (div.ProductPrice__product-price, padding: 8px 12px 0px, font: 12px) */}
        <div className="ProductPrice__product-price pt-[8px] px-[12px] pb-0 flex items-baseline gap-2">
          {isValidHref ? (
            <Link href={finalHref} className="inline-flex items-baseline gap-2 hover:no-underline" aria-label={`Price for ${name}`}>
              <span className="text-[12px] font-normal text-[#424242] tabular-nums tracking-normal">
                ₹ {price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-[11px] text-[#8C877F] line-through tabular-nums">
                  ₹ {originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </Link>
          ) : (
            <>
              <span className="text-[12px] font-normal text-[#424242] tabular-nums tracking-normal">
                ₹ {price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-[11px] text-[#8C877F] line-through tabular-nums">
                  ₹ {originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </>
          )}
        </div>

        {/* Available Colors / Bottom Space (div.ProductHitAvailableColors, margin: 8px 0 0, padding: 0 12px 16px) */}
        <div className="ProductHitAvailableColors__product-hit__available-colors mt-[8px] px-[12px] pb-[16px] text-[11px] text-[#7A756E] min-h-[24px] flex items-center justify-between">
          <span>{category || 'Atelier Collection'}</span>

          {/* Discreet Quick Add Pill on hover for luxury convenience */}
          <button
            type="button"
            onClick={handleAddToBag}
            disabled={isAdding}
            className={cn(
              "text-[10px] uppercase tracking-[0.14em] font-medium transition-all opacity-0 group-hover:opacity-100 hover:text-[#1A1A1A] cursor-pointer",
              isAdded ? "text-emerald-700 opacity-100 font-semibold" : "text-[#5C5852]"
            )}
            aria-label={`Add ${name} to bag`}
          >
            {isAdded ? "Added ✓" : isAdding ? "Adding..." : "+ Add to Bag"}
          </button>
        </div>
      </div>
    </div>
  );

  return cardContent;
}

export type CardVariant = keyof typeof variantStyles;
export type CardPadding = keyof typeof paddingStyles;