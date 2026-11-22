'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Heart,
  Plus,
  Minus,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Ruler,
  ZoomIn,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/lib/hooks/useCart';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { useAuth } from '@/lib/hooks/useAuth';
import { AuthModal } from '@/components/ui/AuthModal';
import { ProductCard } from '@/components/ui/Card';
import { ProductCompareModal } from '@/components/composite/ProductCompareModal';
import { cn } from '@/lib/utils/cn';
import type { ClientProductData, ProductCardData } from '@/lib/actions/products';
import type { Review, ReviewSummary } from '@/lib/actions/reviews';

interface ProductClientProps {
  product: ClientProductData;
  relatedProducts: ProductCardData[];
  reviews?: Review[];
  reviewSummary?: ReviewSummary;
}

/**
 * Safari fallback for native `<dialog closedby="any">` light-dismiss:
 * requires both pointerdown and pointerup outside the dialog bounding rect.
 */
function attachDialogLightDismiss(dialog: HTMLDialogElement | null) {
  if (!dialog) return () => {};
  if ('closedBy' in HTMLDialogElement.prototype) return () => {};

  const isOutside = (e: PointerEvent) => {
    const r = dialog.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };

  let pressedOutside = false;
  const onDown = (e: PointerEvent) => {
    pressedOutside = isOutside(e);
  };
  const onUp = (e: PointerEvent) => {
    if (pressedOutside && isOutside(e)) {
      dialog.close();
    }
    pressedOutside = false;
  };

  dialog.addEventListener('pointerdown', onDown);
  dialog.addEventListener('pointerup', onUp);
  return () => {
    dialog.removeEventListener('pointerdown', onDown);
    dialog.removeEventListener('pointerup', onUp);
  };
}

export function ProductClient({
  product,
  relatedProducts,
}: ProductClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { toggleItem: toggleWishlistItem, isInWishlist } = useWishlist();

  const [selectedColor, setSelectedColor] = useState(0);
  const hasSingleSize = (product.sizes?.length ?? 0) === 1;
  const [selectedSize, setSelectedSize] = useState<string | null>(
    hasSingleSize ? (product.sizes[0] ?? 'Free Size') : null
  );
  const [sizeTrayOpen, setSizeTrayOpen] = useState(false);
  const [sizePromptError, setSizePromptError] = useState(false);
  const [addedToBag, setAddedToBag] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Mobile carousel active index
  const [mobileSlideIndex, setMobileSlideIndex] = useState(0);
  const mobileCarouselRef = useRef<HTMLDivElement | null>(null);

  // Native <dialog> refs for editorial fullscreen lightbox & size guide
  const lightboxRef = useRef<HTMLDialogElement | null>(null);
  const sizeGuideRef = useRef<HTMLDialogElement | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const cleanLightbox = attachDialogLightDismiss(lightboxRef.current);
    const cleanSizeGuide = attachDialogLightDismiss(sizeGuideRef.current);
    return () => {
      cleanLightbox();
      cleanSizeGuide();
    };
  }, []);

  const currentColor = product.colors[selectedColor] ??
    product.colors[0] ?? { name: 'Atelier Edition', value: 'default', hex: '#E8E2D8', images: [] };

  const activeVariant =
    product.variants?.find(
      (v) =>
        selectedSize &&
        v.size.toLowerCase() === selectedSize.toLowerCase() &&
        (!currentColor?.name ||
          currentColor.name === 'Default' ||
          !v.colorName ||
          v.colorName.toLowerCase() === currentColor.name.toLowerCase())
    ) ||
    (selectedSize
      ? product.variants?.find((v) => v.size.toLowerCase() === selectedSize.toLowerCase())
      : undefined) ||
    product.variants?.[0];

  const currentPrice = activeVariant?.price ?? product.price;
  const currentOriginalPrice = activeVariant?.compare_at_price ?? product.originalPrice ?? (product as any).compare_at_price ?? (product as any).compareAtPrice;
  const discount =
    currentOriginalPrice && currentOriginalPrice > currentPrice
      ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
      : 0;

  const rawImages =
    (currentColor.images?.length ?? 0) > 0 ? currentColor.images : product.images;
  const galleryImages = (rawImages.length > 0 ? rawImages : ['/images/placeholder.jpg']).map(
    (src, idx) => ({
      src,
      alt: `${product.name} — View ${idx + 1}`,
    })
  );

  const sizeOptions = (product.sizes?.length ? product.sizes : ['Free Size']).map((size) => {
    const chart = product.sizeChart?.[size];
    const sizeVariants = (product.variants || []).filter(
      (v) => v.size.toLowerCase() === size.toLowerCase()
    );
    const sizeInStock =
      sizeVariants.length === 0
        ? product.inStock
        : sizeVariants.some((v) => (v.inventory_quantity ?? 0) > 0);
    const variantPrice = sizeVariants[0]?.price;
    return {
      value: size,
      label: size,
      inStock: sizeInStock,
      price: variantPrice,
      measurements: chart,
    };
  });

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    const dialog = lightboxRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  const openSizeGuide = useCallback(() => {
    const dialog = sizeGuideRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  const handleMobileScroll = () => {
    const el = mobileCarouselRef.current;
    if (!el || el.clientWidth === 0) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setMobileSlideIndex(Math.max(0, Math.min(galleryImages.length - 1, idx)));
  };

  const scrollToMobileSlide = (index: number) => {
    const el = mobileCarouselRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
    setMobileSlideIndex(index);
  };

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    setSizePromptError(false);
    setSizeTrayOpen(false);
  };

  const handleAddToBag = async () => {
    if (!selectedSize) {
      setSizeTrayOpen(true);
      setSizePromptError(true);
      return;
    }
    const targetVariantId = activeVariant?.id || product.id;
    setIsSubmitting(true);
    try {
      await addItem(targetVariantId, 1, selectedSize, {
        product_id: product.id,
        product_name: product.name,
        price: currentPrice,
        image: galleryImages[0]?.src || product.images?.[0] || '/images/collection-kurtis.jpg',
        size: selectedSize,
        color: currentColor?.name && currentColor.name !== 'Default' ? currentColor.name : undefined,
        is_vidyas_pick: product.isVidhyasPick,
      });
      setAddedToBag(true);
      setTimeout(() => setAddedToBag(false), 3000);
    } catch (err) {
      console.error('Failed to add to bag:', err);
      toast.error('Could not add to bag. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedSize) {
      setSizeTrayOpen(true);
      setSizePromptError(true);
      return;
    }
    const targetVariantId = activeVariant?.id || product.id;
    setIsSubmitting(true);
    try {
      await addItem(targetVariantId, 1, selectedSize, {
        product_id: product.id,
        product_name: product.name,
        price: currentPrice,
        image: galleryImages[0]?.src || product.images?.[0] || '/images/collection-kurtis.jpg',
        size: selectedSize,
        color: currentColor?.name && currentColor.name !== 'Default' ? currentColor.name : undefined,
        is_vidyas_pick: product.isVidhyasPick,
      });
      router.push('/checkout');
    } catch (err) {
      console.error('Failed to process buy now:', err);
      toast.error('Unable to proceed to checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const shareOnWhatsApp = () => {
    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
    const url = `https://wa.me/?text=${encodeURIComponent(
      `Check out "${product.name}" (${selectedSize ? `Size: ${selectedSize}, ` : ''}₹${currentPrice.toLocaleString('en-IN')}) from Angelika Fashions ${pageUrl}`
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const isWishlisted =
    isInWishlist(product.id) || (product.slug ? isInWishlist(product.slug) : false);

  const handleToggleWishlist = async () => {
    if (!user) {
      setShowAuthModal(true);
      toast('Please sign in to save items to your wishlist', { icon: '🤍' });
      return;
    }
    try {
      await toggleWishlistItem(product.id, undefined, {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: currentPrice,
        originalPrice: currentOriginalPrice,
        discount,
        image: galleryImages[0]?.src || product.images[0] || '/images/placeholder.jpg',
        category: product.category,
        color: currentColor.name || product.colors[0]?.name || 'Default',
        colorHex: currentColor.hex || product.colors[0]?.hex || '#E8E2D8',
        size: selectedSize || product.sizes[0] || 'Free Size',
        inStock: product.inStock,
      });
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    }
  };

  const handleAddRelatedToBag = async (related: ProductCardData) => {
    try {
      const rel = related as any;
      await addItem(related.id, 1, 'Free Size', {
        product_id: related.id,
        product_name: related.name,
        price: related.price,
        image:
          rel.image ||
          rel.images?.[0]?.url ||
          rel.images?.[0] ||
          '/images/collection-kurtis.jpg',
        is_vidyas_pick: Boolean(rel.isVidhyasPick || rel.is_vidyas_pick),
      });
      toast.success(`Added "${related.name}" to your bag!`);
    } catch {
      toast.error('Could not add to bag. Please try again.');
    }
  };

  const handleToggleRelatedWishlist = async (related: ProductCardData) => {
    if (!user) {
      setShowAuthModal(true);
      toast('Please sign in to save items to your wishlist', { icon: '🤍' });
      return;
    }
    try {
      await toggleWishlistItem(related.id, undefined, {
        id: related.id,
        slug: related.slug,
        name: related.name,
        price: related.price,
        originalPrice: related.compare_at_price ?? undefined,
        discount: related.discount,
        image: related.images[0]?.url || '/images/collection-kurtis.jpg',
        category: related.category?.name || product.category,
        isVidhyasPick: related.is_vidyas_pick,
      });
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    }
  };

  const colorLabel =
    currentColor?.name && currentColor.name !== 'Default'
      ? currentColor.name
      : product.fabric || 'Atelier Ivory';

  const editorialDescription =
    product.description ||
    product.shortDescription ||
    'Handcrafted with refined artisanal detailing at the Angelika atelier.';

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1A1A1A] pb-24 lg:pb-16">
      {/* ═══════════════════════════════════════════════════════════════════════
          PRIMARY EDITORIAL SPLIT: 2-Column Seamless Lookbook + Sticky Info Rail
          Target Reference: 561.92px × 773.18px image cards + 396.93px content rail
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-[#FFFFFF]">
        <div className="w-full max-w-[1565px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_440.93px] xl:grid-cols-[1123.84px_440.93px] justify-center">
          {/* ── LEFT: EDITORIAL PHOTOGRAPHY GRID (Desktop 2-col / Mobile Swipe) ── */}
          <div className="bg-[#FFFFFF] xl:w-[1123.84px] mx-auto w-full">
            {/* Mobile Horizontal Snap Carousel (< lg) */}
            <div className="lg:hidden relative bg-[#F3EFEA]">
              <div
                ref={mobileCarouselRef}
                onScroll={handleMobileScroll}
                className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                aria-label={`${product.name} gallery`}
              >
                {galleryImages.map((img, idx) => (
                  <button
                    key={`${img.src}-${idx}`}
                    type="button"
                    onClick={() => openLightbox(idx)}
                    className="relative flex-none w-full aspect-[561.92/773.18] snap-center bg-[#F3EFEA] overflow-hidden cursor-zoom-in focus-visible:outline-none"
                    aria-label={`Inspect ${img.alt}`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="100vw"
                      priority={idx === 0}
                      fetchPriority={idx === 0 ? 'high' : 'low'}
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      className="object-cover object-top"
                    />
                  </button>
                ))}
              </div>

              {/* Minimal Slide Indicator Dots & Counter */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-4 inset-x-4 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-1.5 pointer-events-auto bg-white/80 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                    {galleryImages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => scrollToMobileSlide(idx)}
                        aria-label={`View photo ${idx + 1}`}
                        className={cn(
                          'h-1.5 rounded-full transition-all',
                          mobileSlideIndex === idx ? 'w-5 bg-[#1A1A1A]' : 'w-1.5 bg-[#1A1A1A]/30'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium tracking-wider text-[#1A1A1A] bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full tabular-nums">
                    {mobileSlideIndex + 1} / {galleryImages.length}
                  </span>
                </div>
              )}
            </div>

            {/* Desktop 2-Column Editorial Grid (>= lg) */}
            <div
              className={cn(
                'hidden lg:grid bg-[#FFFFFF]',
                galleryImages.length === 1
                  ? 'grid-cols-1'
                  : 'grid-cols-2 xl:grid-cols-[561.92px_561.92px]'
              )}
            >
              {galleryImages.map((img, idx) => (
                <button
                  key={`${img.src}-${idx}`}
                  type="button"
                  onClick={() => openLightbox(idx)}
                  className={cn(
                    'group relative w-full xl:w-[561.92px] xl:h-[773.18px] aspect-[561.92/773.18] bg-[#F3EFEA] overflow-hidden cursor-zoom-in text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1A1A1A]',
                    galleryImages.length === 1 && 'max-w-[561.92px] mx-auto'
                  )}
                  style={{
                    maxWidth: '561.92px',
                    aspectRatio: '561.92 / 773.18',
                  }}
                  aria-label={`Zoom ${img.alt}`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(min-width: 1280px) 561.92px, (min-width: 1024px) 36vw, 100vw"
                    priority={idx < 2}
                    fetchPriority={idx < 2 ? 'high' : undefined}
                    loading={idx < 2 ? 'eager' : 'lazy'}
                    className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                  {/* Subtle dark circular editorial zoom tag icon */}
                  <span
                    className="absolute left-3.5 bottom-3.5 w-6 h-6 rounded-full bg-[#1A1A1A]/85 text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-sm"
                    aria-hidden="true"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── RIGHT: STICKY ULTRA-MINIMAL LUXURY INFO RAIL ── */}
          <aside className="bg-[#FFFFFF] lg:sticky lg:top-[84px] lg:self-start w-full lg:w-[440.93px] lg:min-w-[440.93px] lg:max-w-[440.93px]">
            <div
              className="ProductDetailDescription__product-detail-description ProductDetailDescription__product-detail-description--JpCc1 pt-[40px] pr-[20px] pb-[24px] pl-[24px] w-full"
              style={{
                boxSizing: 'border-box',
                maxWidth: '440.93px',
              }}
            >
              {/* Minimal Breadcrumb Eyebrow */}
              <nav aria-label="Breadcrumb" className="mb-4">
                <ol className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[#8A857D]">
                  <li>
                    <Link href="/shop" className="hover:text-[#1A1A1A] transition-colors">
                      Shop
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link
                      href={`/shop/${(product.categorySlug || product.category).toLowerCase()}`}
                      className="hover:text-[#1A1A1A] transition-colors"
                    >
                      {product.category}
                    </Link>
                  </li>
                </ol>
              </nav>

              {/* Title + Minimal Outline Heart Wishlist Button */}
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-[16px] sm:text-[17px] font-medium tracking-[-0.01em] text-[#1A1A1A] leading-snug">
                  {product.name}
                </h1>
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  aria-pressed={isWishlisted}
                  className="flex-shrink-0 -mr-1.5 -mt-1 p-1.5 rounded-full text-[#1A1A1A] hover:bg-[#F5F3F0] transition-colors cursor-pointer"
                >
                  <Heart
                    className={cn(
                      'w-[18px] h-[18px] transition-colors',
                      isWishlisted ? 'fill-[#1A1A1A] text-[#1A1A1A]' : 'stroke-[1.4] text-[#3A3733]'
                    )}
                    aria-hidden="true"
                  />
                </button>
              </div>

              {/* Price Line */}
              <div className="mt-1.5 flex items-baseline gap-2.5 flex-wrap">
                <span className="text-[13.5px] font-normal text-[#2E2C29] tabular-nums tracking-[0.01em]">
                  ₹{currentPrice.toLocaleString('en-IN')}
                </span>
                {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                  <>
                    <span className="text-[12px] text-[#9A958E] line-through tabular-nums">
                      ₹{currentOriginalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10.5px] uppercase tracking-[0.12em] text-[#74590E] font-medium">
                      {discount}% Off
                    </span>
                  </>
                )}
                <span className="text-[10.5px] text-[#8E8981] ml-auto">VAT inc.</span>
              </div>

              {/* Color / Shade Portrait Swatches (Matching Reference Thumbnail Card) */}
              <div className="mt-6">
                <p className="text-[11.5px] text-[#6E6A63] mb-2.5">
                  Color:{' '}
                  <span className="text-[#1A1A1A] font-medium">{colorLabel}</span>
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {(product.colors.length > 0
                    ? product.colors
                    : [{ name: colorLabel, value: 'default', hex: '#E8E2D8', images: product.images }]
                  ).map((color, idx) => {
                    const thumbSrc = color.images?.[0] || galleryImages[0]?.src;
                    const isActive = selectedColor === idx;
                    return (
                      <button
                        key={`${color.value}-${idx}`}
                        type="button"
                        onClick={() => {
                          setSelectedColor(idx);
                          setMobileSlideIndex(0);
                        }}
                        aria-label={`Select color ${color.name}`}
                        aria-pressed={isActive}
                        title={color.name}
                        className={cn(
                          'relative w-[42px] h-[56px] p-[2px] border transition-colors cursor-pointer bg-[#F3EFEA]',
                          isActive
                            ? 'border-[#1A1A1A]'
                            : 'border-[#E5E1DB] hover:border-[#8C877F]'
                        )}
                      >
                        {thumbSrc ? (
                          <span className="relative block w-full h-full overflow-hidden">
                            <Image
                              src={thumbSrc}
                              alt={color.name}
                              fill
                              sizes="42px"
                              className="object-cover object-top"
                            />
                          </span>
                        ) : (
                          <span
                            className="block w-full h-full"
                            style={{ backgroundColor: color.hex || '#E8E2D8' }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── SIGNATURE DUAL FULL-WIDTH PILL CTAs ── */}
              <div className="mt-7 space-y-2.5">
                {/* Pill 1: SELECT SIZE */}
                <button
                  type="button"
                  onClick={() => {
                    setSizeTrayOpen((prev) => !prev);
                    setSizePromptError(false);
                  }}
                  aria-expanded={sizeTrayOpen}
                  className={cn(
                    'w-full h-[42px] rounded-full border text-[11px] font-medium uppercase tracking-[0.16em] transition-colors flex items-center justify-center gap-2 cursor-pointer',
                    sizePromptError
                      ? 'border-[#B91C1C] bg-[#FEF2F2] text-[#991B1B]'
                      : 'border-[#2B2B2B] bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#F7F6F4]'
                  )}
                >
                  <span>
                    {selectedSize ? `SIZE: ${selectedSize}` : 'SELECT SIZE'}
                  </span>
                </button>

                {/* Inline Minimal Size Tray (Opens cleanly on SELECT SIZE) */}
                {sizeTrayOpen && (
                  <div className="rounded-xl border border-[#E6E2DC] bg-[#FAF9F7] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-[0.14em] text-[#5C5852] font-medium">
                        {sizePromptError ? 'Please choose your size' : 'Available Sizes'}
                      </span>
                      <button
                        type="button"
                        onClick={openSizeGuide}
                        className="inline-flex items-center gap-1 text-[11px] underline underline-offset-2 text-[#1A1A1A] hover:text-[#74590E] cursor-pointer"
                      >
                        <Ruler className="w-3 h-3" aria-hidden="true" />
                        Size Guide
                      </button>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                      {sizeOptions.map((opt) => {
                        const isPicked = selectedSize === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            disabled={!opt.inStock}
                            onClick={() => handleSelectSize(opt.value)}
                            className={cn(
                              'h-9 px-2 rounded-full text-[11px] font-medium tracking-wider transition-all border cursor-pointer disabled:opacity-35 disabled:line-through disabled:cursor-not-allowed',
                              isPicked
                                ? 'bg-[#2B2B2B] text-white border-[#2B2B2B]'
                                : 'bg-white text-[#1A1A1A] border-[#DCD7CF] hover:border-[#1A1A1A]'
                            )}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-[#7A756E]">
                      <span>Unsure of fit?</span>
                      <Link
                        href="/size-finder"
                        className="underline underline-offset-2 text-[#1A1A1A] hover:text-[#74590E]"
                      >
                        Try Couture Fit Finder
                      </Link>
                    </div>
                  </div>
                )}

                {/* Pill 2: ADD TO BAG (Solid Dark Charcoal Pill matching reference) */}
                <button
                  type="button"
                  onClick={handleAddToBag}
                  disabled={isSubmitting || !product.inStock}
                  className="w-full h-[42px] rounded-full bg-[#2B2B2B] hover:bg-[#141414] text-white text-[11px] font-medium uppercase tracking-[0.16em] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                >
                  {!product.inStock ? (
                    'OUT OF STOCK'
                  ) : addedToBag ? (
                    <>
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>ADDED TO BAG</span>
                    </>
                  ) : isSubmitting ? (
                    'ADDING...'
                  ) : (
                    'ADD TO BAG'
                  )}
                </button>

                {/* Quiet Secondary Utility Row (Buy Now + Atelier Styling) */}
                <div className="pt-1.5 flex items-center justify-between text-[11px] text-[#6E6A63]">
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={isSubmitting || !product.inStock}
                    className="underline underline-offset-4 hover:text-[#1A1A1A] transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Express Buy Now
                  </button>
                  <button
                    type="button"
                    onClick={shareOnWhatsApp}
                    className="inline-flex items-center gap-1 hover:text-[#1A1A1A] transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3 h-3" aria-hidden="true" />
                    <span>Ask Stylist</span>
                  </button>
                </div>
              </div>

              {/* ── EDITORIAL DESCRIPTION & PROVENANCE BLOCK ── */}
              <div className="mt-8 space-y-3">
                <p className="text-[12.5px] leading-[1.7] text-[#35322E]">
                  {editorialDescription}
                </p>

                <div className="text-[11.5px] leading-[1.6] text-[#5C5852] space-y-0.5 pt-1">
                  <p>Handcrafted in India</p>
                  {product.sku && (
                    <p className="text-[11px] uppercase tracking-[0.1em] text-[#8E8980]">
                      {product.sku}
                    </p>
                  )}
                </div>
              </div>

              {/* ── HAIRLINE NATIVE <details> ACCORDIONS (Matching Reference + / - Rows) ── */}
              <div
                className="pdp-accordion mt-7 border-t border-[#EAE6E0] divide-y divide-[#EAE6E0]"
                aria-label="Product specifications"
              >
                {/* 1. Size & Fit */}
                <details className="group">
                  <summary className="flex items-center justify-between py-4 text-[12px] font-medium text-[#1A1A1A] select-none">
                  <span>Size &amp; Fit</span>
                  <span className="text-[#5C5852]" aria-hidden="true">
                    <Plus className="w-3.5 h-3.5 group-open:hidden stroke-[1.5]" />
                    <Minus className="w-3.5 h-3.5 hidden group-open:block stroke-[1.5]" />
                  </span>
                </summary>
                <div className="pb-4 text-[12px] leading-[1.65] text-[#5C5852] space-y-2.5">
                  <p>
                    Tailored for an effortless, graceful drape. Available in{' '}
                    <span className="text-[#1A1A1A] font-medium">
                      {sizeOptions.map((s) => s.label).join(', ')}
                    </span>
                    .
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <button
                      type="button"
                      onClick={openSizeGuide}
                      className="text-[11.5px] text-[#1A1A1A] underline underline-offset-4 hover:text-[#74590E] cursor-pointer"
                    >
                      View Measurement Chart
                    </button>
                    <Link
                      href="/size-finder"
                      className="text-[11.5px] text-[#1A1A1A] underline underline-offset-4 hover:text-[#74590E]"
                    >
                      Couture Fit Finder
                    </Link>
                  </div>
                </div>
              </details>

              {/* 2. Composition & Care */}
              <details className="group">
                <summary className="flex items-center justify-between py-4 text-[12px] font-medium text-[#1A1A1A] select-none">
                  <span>Composition &amp; Care</span>
                  <span className="text-[#5C5852]" aria-hidden="true">
                    <Plus className="w-3.5 h-3.5 group-open:hidden stroke-[1.5]" />
                    <Minus className="w-3.5 h-3.5 hidden group-open:block stroke-[1.5]" />
                  </span>
                </summary>
                <div className="pb-4 text-[12px] leading-[1.65] text-[#5C5852] space-y-2.5">
                  {product.fabric && (
                    <p>
                      <span className="text-[#1A1A1A] font-medium">Composition:</span>{' '}
                      {typeof product.fabric === 'string'
                        ? product.fabric
                        : typeof product.fabric === 'object' && product.fabric !== null
                          ? Object.entries(product.fabric as Record<string, string>)
                              .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
                              .join(', ')
                          : String(product.fabric)}
                    </p>
                  )}
                  {product.details && product.details.length > 0 && (
                    <ul className="space-y-1 list-disc list-inside">
                      {product.details.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {product.care && product.care.length > 0 && (
                    <div className="pt-1">
                      <p className="text-[#1A1A1A] font-medium mb-1">Care</p>
                      <ul className="space-y-1">
                        {product.care.map((instruction, idx) => (
                          <li key={idx}>• {instruction}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </details>

              {/* 3. Shipping & Returns */}
              <details className="group">
                <summary className="flex items-center justify-between py-4 text-[12px] font-medium text-[#1A1A1A] select-none">
                  <span>Shipping &amp; Returns</span>
                  <span className="text-[#5C5852]" aria-hidden="true">
                    <Plus className="w-3.5 h-3.5 group-open:hidden stroke-[1.5]" />
                    <Minus className="w-3.5 h-3.5 hidden group-open:block stroke-[1.5]" />
                  </span>
                </summary>
                <div className="pb-4 text-[12px] leading-[1.65] text-[#5C5852] space-y-2">
                  <p>
                    Complimentary insured shipping across India on orders above ₹2,999. Standard
                    delivery within 3–5 business days.
                  </p>
                  <p>
                    {product.returnWindowDays === 0 ? (
                      <span className="text-[#991B1B]">
                        Final Sale: This handcrafted couture piece is non-returnable once
                        delivered.
                      </span>
                    ) : (
                      <>
                        {product.returnWindowDays !== undefined ? product.returnWindowDays : 7}
                        -day doorstep returns &amp; complimentary size exchanges on unworn pieces
                        with original tags intact.
                      </>
                    )}
                  </p>
                </div>
              </details>

              {/* 4. Boutique Care */}
              <details className="group">
                <summary className="flex items-center justify-between py-4 text-[12px] font-medium text-[#1A1A1A] select-none">
                  <span>Boutique Care</span>
                  <span className="text-[#5C5852]" aria-hidden="true">
                    <Plus className="w-3.5 h-3.5 group-open:hidden stroke-[1.5]" />
                    <Minus className="w-3.5 h-3.5 hidden group-open:block stroke-[1.5]" />
                  </span>
                </summary>
                <div className="pb-4 text-[12px] leading-[1.65] text-[#5C5852] space-y-2.5">
                  <p>
                    Need custom sleeve adjustments, drape styling advice, or matching dupatta
                    recommendations from Vidhya&apos;s atelier desk?
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <button
                      type="button"
                      onClick={shareOnWhatsApp}
                      className="text-[11.5px] text-[#1A1A1A] underline underline-offset-4 hover:text-[#74590E] cursor-pointer"
                    >
                      Message Atelier Concierge
                    </button>
                    {relatedProducts.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowCompareModal(true)}
                        className="text-[11.5px] text-[#1A1A1A] underline underline-offset-4 hover:text-[#74590E] cursor-pointer"
                      >
                        Compare Pieces
                      </button>
                    )}
                  </div>
                </div>
              </details>
            </div>
          </div>
        </aside>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          BELOW THE FOLD: YOU MAY ALSO LIKE (Clean 4-Column Editorial Strip)
         ═══════════════════════════════════════════════════════════════════════ */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-[#ECE9E4] bg-[#FFFFFF] px-5 sm:px-8 lg:px-14 py-14 lg:py-20">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex items-end justify-between gap-4 mb-9">
              <div>
                <p className="text-[10.5px] uppercase tracking-[0.2em] text-[#8A857D] mb-1.5">
                  Curated Pairings
                </p>
                <h2 className="font-cormorant text-2xl sm:text-3xl font-normal text-[#1A1A1A]">
                  You May Also Like
                </h2>
              </div>
              <Link
                href={product.categorySlug ? `/shop/${product.categorySlug}` : '/shop'}
                className="text-[11px] uppercase tracking-[0.16em] text-[#1A1A1A] underline underline-offset-4 hover:text-[#74590E] transition-colors"
              >
                View All {product.category}
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-0 w-full">
              {relatedProducts.map((related) => (
                <ProductCard
                  key={related.id}
                  {...related}
                  image={related.images[0]?.url || '/images/collection-kurtis.jpg'}
                  name={related.name}
                  price={related.price}
                  originalPrice={related.compare_at_price ?? undefined}
                  category={related.category?.name || product.category}
                  discount={related.discount}
                  isVidhyasPick={related.is_vidyas_pick}
                  isWishlisted={
                    isInWishlist(related.id) ||
                    (related.slug ? isInWishlist(related.slug) : false)
                  }
                  rating={related.rating ?? 0}
                  reviewCount={related.review_count ?? 0}
                  href={`/product/${related.slug}`}
                  onAddToBag={() => handleAddRelatedToBag(related)}
                  onAddToWishlist={() => handleToggleRelatedWishlist(related)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          NATIVE <dialog> FULLSCREEN EDITORIAL LIGHTBOX
         ═══════════════════════════════════════════════════════════════════════ */}
      <dialog
        ref={lightboxRef}
        aria-label={`${product.name} fullscreen photo viewer`}
        {...({ closedby: 'any' } as any)}
        className="m-auto max-w-[96vw] max-h-[94dvh] w-full h-full bg-[#F6F3EE] p-0 border-0 backdrop:bg-black/80 backdrop:backdrop-blur-xs open:flex open:flex-col"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E0D8] bg-white">
          <span className="text-[11px] uppercase tracking-[0.16em] text-[#5C5852] tabular-nums">
            {product.name} · {lightboxIndex + 1} / {galleryImages.length}
          </span>
          <form method="dialog">
            <button
              type="submit"
              autoFocus
              aria-label="Close image viewer"
              className="p-1.5 rounded-full text-[#1A1A1A] hover:bg-[#F3EFEA] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </form>
        </div>

        <div className="relative flex-1 min-h-0 flex items-center justify-center p-4 sm:p-8 select-none">
          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={() =>
                setLightboxIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
              }
              aria-label="Previous image"
              className="absolute left-3 sm:left-6 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white border border-[#E5E0D8] flex items-center justify-center text-[#1A1A1A] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 stroke-[1.5]" />
            </button>
          )}

          <div className="relative w-full h-full max-w-3xl">
            {(() => {
              const activeLightboxImage = galleryImages[lightboxIndex] ?? galleryImages[0];
              if (!activeLightboxImage) return null;
              return (
                <Image
                  src={activeLightboxImage.src}
                  alt={activeLightboxImage.alt}
                  fill
                  sizes="90vw"
                  className="object-contain"
                />
              );
            })()}
          </div>

          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={() => setLightboxIndex((prev) => (prev + 1) % galleryImages.length)}
              aria-label="Next image"
              className="absolute right-3 sm:right-6 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white border border-[#E5E0D8] flex items-center justify-center text-[#1A1A1A] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 stroke-[1.5]" />
            </button>
          )}
        </div>
      </dialog>

      {/* ═══════════════════════════════════════════════════════════════════════
          NATIVE <dialog> SIZE GUIDE MODAL
         ═══════════════════════════════════════════════════════════════════════ */}
      <dialog
        ref={sizeGuideRef}
        aria-labelledby="pdp-size-guide-title"
        {...({ closedby: 'any' } as any)}
        className="m-auto w-full max-w-xl bg-white p-0 border border-[#E5E0D8] shadow-2xl backdrop:bg-black/55 backdrop:backdrop-blur-xs"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ECE8E2]">
          <h2
            id="pdp-size-guide-title"
            className="text-[13px] font-medium uppercase tracking-[0.16em] text-[#1A1A1A]"
          >
            Size Guide
          </h2>
          <form method="dialog">
            <button
              type="submit"
              autoFocus
              aria-label="Close size guide"
              className="p-1.5 rounded-full text-[#1A1A1A] hover:bg-[#F3EFEA] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[1.5]" />
            </button>
          </form>
        </div>

        <div className="p-6 space-y-5">
          {product.sizeChart && Object.keys(product.sizeChart).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-[#E5E0D8] text-[10.5px] uppercase tracking-[0.14em] text-[#7A756E]">
                    <th className="py-2.5 pr-4 font-medium">Size</th>
                    <th className="py-2.5 px-3 font-medium">Bust</th>
                    <th className="py-2.5 px-3 font-medium">Waist</th>
                    <th className="py-2.5 px-3 font-medium">Hips</th>
                    <th className="py-2.5 pl-3 font-medium">Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0ECE6] text-[#2E2C29] tabular-nums">
                  {Object.entries(product.sizeChart).map(([size, m]) => (
                    <tr key={size}>
                      <td className="py-2.5 pr-4 font-medium text-[#1A1A1A]">{size}</td>
                      <td className="py-2.5 px-3">{m.bust}</td>
                      <td className="py-2.5 px-3">{m.waist}</td>
                      <td className="py-2.5 px-3">{m.hips}</td>
                      <td className="py-2.5 pl-3">{m.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[12.5px] text-[#5C5852]">
              Standard Indian boutique sizing applies. Contact our atelier concierge for custom
              tailoring measurements.
            </p>
          )}

          <div className="bg-[#FAF8F5] border border-[#EFECE7] p-4 text-[12px] text-[#5C5852] leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#C9A84C] flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              <strong className="text-[#1A1A1A] font-medium">How to measure:</strong> Keep a
              flexible tape parallel to the floor across the fullest part of your bust, natural
              waist, and hips.
            </p>
          </div>
        </div>
      </dialog>

      {/* Auth & Compare Modals */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      )}

      <ProductCompareModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        currentProduct={product}
        relatedProducts={relatedProducts}
        onAddToBag={async (item) => {
          try {
            await addItem(item.id, 1, item.size, {
              product_id: item.id,
              product_name: item.name,
              price: item.price,
              image: item.image,
              size: item.size,
            });
            toast.success(`Added "${item.name}" (${item.size}) to your bag!`);
          } catch {
            toast.error('Could not add to bag. Please try again.');
          }
        }}
      />

      {/* ── Sticky Minimal Mobile Buy Bar (< lg) ── */}
      <div className="fixed lg:hidden bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E4DE] px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] text-[#7A756E] truncate">
            {selectedSize ? `Size: ${selectedSize}` : product.name}
          </p>
          <p className="text-[14px] font-medium text-[#1A1A1A] tabular-nums">
            ₹{currentPrice.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSizeTrayOpen(true);
              window.scrollTo({ top: 360, behavior: 'smooth' });
            }}
            className="h-[38px] px-4 rounded-full border border-[#2B2B2B] text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#1A1A1A] cursor-pointer"
          >
            {selectedSize || 'Size'}
          </button>
          <button
            type="button"
            onClick={handleAddToBag}
            disabled={isSubmitting || !product.inStock}
            className="h-[38px] px-5 rounded-full bg-[#2B2B2B] text-white text-[10.5px] font-medium uppercase tracking-[0.14em] disabled:opacity-45 cursor-pointer"
          >
            {addedToBag ? 'Added ✓' : 'Add to Bag'}
          </button>
        </div>
      </div>
    </div>
  );
}
