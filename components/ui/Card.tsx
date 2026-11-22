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

function getColorHex(colorName?: string): string {
  if (!colorName) return '#C5A059';
  const c = colorName.toLowerCase();
  if (c.includes('red') || c.includes('crimson') || c.includes('ruby') || c.includes('maroon')) return '#8B1E28';
  if (c.includes('green') || c.includes('emerald') || c.includes('olive') || c.includes('sage')) return '#2E4A3E';
  if (c.includes('blue') || c.includes('navy') || c.includes('indigo') || c.includes('teal')) return '#1E3A5F';
  if (c.includes('purple') || c.includes('plum') || c.includes('violet') || c.includes('mauve')) return '#5C2D50';
  if (c.includes('pink') || c.includes('rose') || c.includes('blush') || c.includes('peach')) return '#D98282';
  if (c.includes('yellow') || c.includes('mustard') || c.includes('haldi')) return '#D4A017';
  if (c.includes('gold') || c.includes('zari') || c.includes('champagne')) return '#C5A059';
  if (c.includes('white') || c.includes('ivory') || c.includes('cream')) return '#F4F0EA';
  if (c.includes('black') || c.includes('noir') || c.includes('charcoal')) return '#1A1A1A';
  return '#B8977E';
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
    ? badge
    : isNew || isVidhyasPick
      ? 'New'
      : isSale && calculatedDiscount
        ? `Sale ${calculatedDiscount}%`
        : 'New';

  // Derive 3 circular swatches matching the exact inspect-element specs
  const rawColors = Array.isArray(colors) && colors.length > 0 ? colors : (rest['color'] ? [rest['color']] : []);
  const baseColorHex = getColorHex(rawColors[0] || rest['color'] || name);
  const displaySwatches = [
    baseColorHex,
    baseColorHex === '#F4F0EA' ? '#2E4A3E' : '#F4F0EA',
    baseColorHex === '#1A1A1A' ? '#C5A059' : '#1A1A1A',
  ];
  const extraColorsCount = 2;

  const cardContent = (
    <div
      className={cn(
        "group relative flex flex-col w-full bg-white content-visibility-auto text-left",
        className
      )}
      style={{ boxSizing: 'border-box' }}
    >
      {/* ── 1. Image Viewport (Exact Target Size: 374px × 468.03px -> aspect-[374/468.03]) ── */}
      <div className="relative w-full aspect-[374/468.03] overflow-hidden bg-[#F7F5F0]">
        {isValidHref ? (
          <Link href={finalHref} className="block w-full h-full cursor-pointer" aria-label={`View ${name}`}>
            <img
              src={image}
              alt={name}
              width={374}
              height={468}
              loading="lazy"
              decoding="async"
              className="ProductItem__Image w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
            />
          </Link>
        ) : (
          <img
            src={image}
            alt={name}
            width={374}
            height={468}
            loading="lazy"
            decoding="async"
            className="ProductItem__Image w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
          />
        )}

        {/* ── Badge (span.ProductItem__Label: 40.14 x 20.5, font: 10px, bg: #FFFFFFCC, color: #282B30, padding: 2px 9px) ── */}
        <span className="ProductItem__Label Heading Text--subdued absolute top-2 left-2 z-10 inline-flex items-center justify-center bg-[#FFFFFFCC] backdrop-blur-xs text-[#282B30] text-[10px] font-normal leading-tight px-[9px] py-[2px] shadow-2xs">
          {badgeText}
        </span>

        {/* Minimal Outline Heart Wishlist button */}
        {(onAddToWishlist || isWishlisted) && (
          <button
            type="button"
            onClick={handleWishlist}
            className="absolute top-2 right-2 p-1.5 z-10 cursor-pointer text-[#1A1A1A] hover:scale-110 transition-transform"
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
      </div>

      {/* ── Quick Add to Cart Bar (Reference: ADD TO CART +) ── */}
      <button
        type="button"
        onClick={handleAddToBag}
        disabled={isAdding}
        className="w-full py-2 bg-[#FAF7F2] hover:bg-[#1C1B1B] text-[#1C1B1B] hover:text-white transition-colors text-[11px] font-medium uppercase tracking-[0.16em] flex items-center justify-center gap-1.5 cursor-pointer border-t border-b border-[#EFECE6] active:scale-[0.99]"
        aria-label={`Add ${name} to cart`}
      >
        <span>{isAdded ? "Added to Cart ✓" : isAdding ? "Adding..." : "ADD TO CART +"}</span>
      </button>

      {/* ── 2. Title & Price Wrapper (div.title-price-wrapper: 276.71 x 37.95, font: 13px) ── */}
      <div className="title-price-wrapper w-full pt-[10px] px-0 pb-0">
        <div className="flex items-start justify-between gap-2 w-full">
          <div className="flex-1 min-w-0">
            {/* Product Title (a.product-title-text.product-href: 235.2 x 19.8, font: 12px, color: #1C1B1B) */}
            {isValidHref ? (
              <Link href={finalHref} className="product-title-text product-href block text-[12px] font-normal text-[#1C1B1B] leading-[1.3] truncate hover:underline" title={name}>
                {name}
              </Link>
            ) : (
              <span className="product-title-text product-href block text-[12px] font-normal text-[#1C1B1B] leading-[1.3] truncate" title={name}>
                {name}
              </span>
            )}

            {/* Product Price (span.money: 47.13 x 14.4, font: 11px, color: #2D333D, text: ₹ 17,000) */}
            <div className="flex items-baseline gap-2 mt-[2px]">
              <span className="money text-[11px] font-normal text-[#2D333D] tabular-nums">
                ₹ {price.toLocaleString('en-IN')}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-[10px] text-[#8C877F] line-through tabular-nums">
                  ₹ {originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          {/* Minimal Shopping Bag Icon / Quick Add on right side */}
          <div className="shrink-0 flex items-center gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={handleAddToBag}
              disabled={isAdding}
              className="p-1 text-[#1C1B1B] hover:opacity-70 transition-opacity cursor-pointer shrink-0"
              aria-label={`Add ${name} to bag`}
              title={isAdded ? "Added to bag" : "Add to bag"}
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── 3. Color Swatch List (div.ProductItem__ColorSwatchList: 368.95 x 19.8, margin: 5px 0px 0px) ── */}
        <div className="ProductItem__ColorSwatchList mt-[5px] flex items-center gap-[6px]">
          {displaySwatches.map((colorVal, idx) => (
            <span
              key={idx}
              className="ColorSwatch ColorSwatch--small w-[14px] h-[14px] rounded-full border border-black/15 shadow-2xs inline-block transition-transform hover:scale-110 cursor-pointer"
              style={{ backgroundColor: colorVal }}
              title={`Color tone ${idx + 1}`}
            />
          ))}
          {extraColorsCount > 0 && (
            <span className="text-[11px] text-[#666] leading-none ml-0.5">
              +{extraColorsCount} more
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