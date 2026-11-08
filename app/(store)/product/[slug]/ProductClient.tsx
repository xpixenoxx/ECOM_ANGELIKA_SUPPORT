'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/hooks/useCart';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { useAuth } from '@/lib/hooks/useAuth';
import { AuthModal } from '@/components/ui/AuthModal';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Card, ProductCard } from '@/components/ui/Card';
import { SizeSelector } from '@/components/composite/SizeSelector';
import { ImageGallery } from '@/components/composite/ImageGallery';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Accordion } from '@/components/ui/Accordion';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { WriteReviewForm } from '@/components/composite/Reviews/WriteReviewForm';
import { cn } from '@/lib/utils/cn';
import { MagneticButton, MagneticCard, MagneticIcon } from '@/components/animations/MagneticButton';
import { StaggerContainer, StaggerItem } from '@/components/animations/Stagger';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { LikeButton, Counter, ProgressRing } from '@/components/animations/MicroInteractions';

import type { ClientProductData } from '@/lib/actions/products';
import type { ProductCardData } from '@/lib/actions/products';
import type { Review, ReviewSummary } from '@/lib/actions/reviews';

interface ProductClientProps {
  product: ClientProductData;
  relatedProducts: ProductCardData[];
  reviews?: Review[];
  reviewSummary?: ReviewSummary;
}

export function ProductClient({ product, relatedProducts, reviews = [], reviewSummary }: ProductClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { toggleItem: toggleWishlistItem, isInWishlist } = useWishlist();
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(product.sizes?.[0] || 'Free Size');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [addedToBag, setAddedToBag] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const currentColor = product.colors[selectedColor] ?? product.colors[0] ?? { name: '', value: '', hex: '#CCCCCC', images: [] };
  const activeVariant = product.variants?.find((v) => v.size.toLowerCase() === selectedSize?.toLowerCase()) || product.variants?.[0];
  const currentPrice = activeVariant?.price ?? product.price;
  const currentOriginalPrice = activeVariant?.compare_at_price ?? product.originalPrice;
  const discount = currentOriginalPrice ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100) : 0;

  // Convert string arrays to proper types
  const galleryImages = ((currentColor.images?.length ?? 0) > 0 ? currentColor.images : product.images).map((src): { src: string; alt: string } => ({
    src,
    alt: product.name,
  }));

  const sizeOptions = product.sizes.map((size) => {
    const chart = product.sizeChart[size];
    return {
      value: size,
      label: size,
      inStock: true,
      measurements: chart ? {
        bust: chart.bust,
        waist: chart.waist,
        hips: chart.hips,
        length: chart.length,
      } : undefined,
    };
  });

  const handleAddToBag = async () => {
    const sizeToUse = selectedSize || product.sizes?.[0] || 'Free Size';
    setIsSubmitting(true);
    try {
      await addItem(product.id, quantity, sizeToUse, {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        image: product.images?.[0] || '/images/collection-kurtis.jpg',
        size: sizeToUse,
        is_vidyas_pick: product.isVidhyasPick,
      });
      setAddedToBag(true);
      setTimeout(() => setAddedToBag(false), 3000);
    } catch (err) {
      console.error('Failed to add to bag:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuyNow = async () => {
    const sizeToUse = selectedSize || product.sizes?.[0] || 'Free Size';
    setIsSubmitting(true);
    try {
      await addItem(product.id, quantity, sizeToUse, {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        image: product.images?.[0] || '/images/collection-kurtis.jpg',
        size: sizeToUse,
        is_vidyas_pick: product.isVidhyasPick,
      });
      if (!user) {
        setShowAuthModal(true);
        toast('Please sign in to proceed to checkout', { icon: '🛍️' });
      } else {
        router.push('/checkout');
      }
    } catch (err) {
      console.error('Failed to process buy now:', err);
      router.push('/checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const shareOnWhatsApp = () => {
    const url = `https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(
      `Hi Vidhya, I'm interested in "${product.name}" (${selectedSize ? `Size: ${selectedSize}, ` : ''}₹${currentPrice.toLocaleString()}). Product ID: ${product.sku}`
    )}`;
    window.open(url, '_blank');
  };

  const handleAddRelatedToBag = async (related: ProductCardData) => {
    try {
      const rel = related as any;
      await addItem(related.id, 1, 'Free Size', {
        product_id: related.id,
        product_name: related.name,
        price: related.price,
        image: rel.image || rel.images?.[0]?.url || rel.images?.[0] || '/images/collection-kurtis.jpg',
        is_vidyas_pick: Boolean(rel.isVidhyasPick || rel.is_vidyas_pick),
      });
      toast.success(`Added "${related.name}" to your bag!`);
    } catch (err) {
      toast.error('Could not add to bag. Please try again.');
    }
  };

  const isWishlisted = isInWishlist(product.id) || (product.slug ? isInWishlist(product.slug) : false);

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
        price: product.price,
        originalPrice: product.originalPrice,
        discount: discount,
        image: galleryImages[0]?.src || product.images[0] || '/images/placeholder.jpg',
        category: product.category,
        color: currentColor.name || product.colors[0]?.name || 'Default',
        colorHex: currentColor.hex || product.colors[0]?.hex || '#CCCCCC',
        size: selectedSize || product.sizes[0] || 'Free Size',
        inStock: product.inStock,
      });
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
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

  return (
    <div className="min-h-screen bg-[var(--color-white)]">
      {/* Breadcrumb */}
      <nav className="bg-[var(--color-snow)] border-b border-[var(--color-whisper)] py-4" aria-label="Breadcrumb">
        <div className="container-custom px-6">
          <ol className="flex items-center gap-2 text-sm text-[var(--color-mist)]">
            <li><Link href="/" className="hover:text-[var(--color-gold)] transition-colors">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/shop" className="hover:text-[var(--color-gold)] transition-colors">Shop</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href={`/shop/${product.category.toLowerCase()}`} className="hover:text-[var(--color-gold)] transition-colors capitalize">{product.category}</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-[var(--color-ink)] font-medium truncate max-w-[200px]">{product.name}</li>
          </ol>
        </div>
      </nav>

      {/* Product Main */}
      <section className="py-10">
        <div className="container-custom px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Image Gallery */}
            <div className="sticky top-24 lg:top-[100px]">
              <ImageGallery
                images={galleryImages}
                className="rounded-[var(--radius-xl)] overflow-hidden"
              />

              {/* Color Swatches */}
              <div className="mt-6">
                <p className="text-sm font-medium text-[var(--color-ink)] mb-3">Select Color</p>
                <StaggerContainer variant="default" className="flex flex-wrap gap-2">
                  {product.colors.map((color, index) => (
                    <StaggerItem key={color.value} delay={index * 0.03} variant="scale">
                      <MagneticIcon
                        onClick={() => setSelectedColor(index)}
                        className={cn(
                          'relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-3 transition-all duration-200 flex-shrink-0',
                          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-gold)]/40 focus-visible:ring-offset-2',
                          `bg-[${color.hex}]`,
                          selectedColor === index
                            ? 'border-[var(--color-gold)] shadow-[var(--shadow-md)]'
                            : 'border-[var(--color-whisper)] hover:border-[var(--color-gold)]'
                        )}
                        strength={0.4}
                        maxDistance={50}
                      >
                        {selectedColor === index && (
                          <svg className="absolute inset-0 m-auto h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </MagneticIcon>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
                <motion.p
                  className="mt-2 text-sm text-[var(--color-slate)]"
                  key={currentColor.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentColor.name}
                </motion.p>
              </div>

              {/* Share Actions */}
              <div className="mt-6 flex items-center gap-3">
                <span className="text-sm text-[var(--color-slate)]">Share:</span>
                <MagneticButton variant="ghost" size="sm" onClick={shareOnWhatsApp} className="gap-1" strength={0.3}>
                  <SocialIcon platform="whatsapp" size="sm" />
                  WhatsApp
                </MagneticButton>
                <MagneticButton variant="ghost" size="sm" className="gap-1" strength={0.3}>
                  <SocialIcon platform="facebook" size="sm" />
                  Facebook
                </MagneticButton>
                <MagneticButton variant="ghost" size="sm" className="gap-1" strength={0.3}>
                  <SocialIcon platform="instagram" size="sm" />
                  Instagram
                </MagneticButton>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category & Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <Link href={`/shop/${product.category.toLowerCase()}`} className="text-sm font-medium uppercase tracking-wider text-[var(--color-gold)] hover:underline">
                  {product.category}
                </Link>
                {product.isNew && (
                  <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-[var(--color-gold)] text-[var(--color-ink)] rounded-[var(--radius-sm)]">
                    New
                  </span>
                )}
                {product.isVidhyasPick && (
                  <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-[var(--color-ink)] text-[var(--color-gold)] rounded-[var(--radius-sm)]">
                    Vidhya's Pick
                  </span>
                )}
                {discount > 0 && (
                  <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-[var(--color-error)] text-white rounded-[var(--radius-sm)]">
                    {discount}% Off
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-[var(--font-display)] text-3xl md:text-4xl font-medium text-[var(--color-ink)] leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <svg className="h-5 w-5 text-[var(--color-gold)] fill-current" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-lg font-bold text-[var(--color-ink)]">{product.rating}</span>
                </div>
                <span className="text-sm text-[var(--color-slate)]">({product.reviewCount} reviews)</span>
                <Link href="#reviews" className="text-sm text-[var(--color-gold)] hover:underline font-medium">Write a review</Link>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl md:text-4xl font-bold text-[var(--color-ink)] tabular-nums">₹{currentPrice.toLocaleString()}</span>
                {currentOriginalPrice && (
                  <span className="text-xl text-[var(--color-mist)] line-through tabular-nums">₹{currentOriginalPrice.toLocaleString()}</span>
                )}
                {discount > 0 && (
                  <span className="px-3 py-1 text-sm font-semibold bg-[var(--color-error)] text-white rounded-[var(--radius-md)]">
                    Save {discount}%
                  </span>
                )}
              </div>

              {/* Short Description */}
              <p className="text-[var(--color-slate)] text-base leading-relaxed border-t border-[var(--color-whisper)] pt-6">
                {product.shortDescription}
              </p>

              {/* Size Selector */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-3">Select Size</label>
                <SizeSelector
                  sizes={sizeOptions}
                  selectedSize={selectedSize ?? undefined}
                  onSizeChange={setSelectedSize}
                />
                {selectedSize && (
                  <motion.p
                    className="mt-2 text-sm text-[var(--color-success)] flex items-center gap-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Size {selectedSize} selected
                  </motion.p>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="border-t border-[var(--color-whisper)] pt-6">
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-3">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-[var(--color-whisper)] rounded-[var(--radius-md)] overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-snow)] transition-colors"
                      aria-label="Decrease quantity"
                      disabled={quantity <= 1}
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M5 12h14" />
                      </svg>
                    </button>
                    <span className="px-6 text-center font-mono tabular-nums text-[var(--color-ink)] min-w-[3rem]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      className="p-3 text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-snow)] transition-colors"
                      aria-label="Increase quantity"
                      disabled={quantity >= 10}
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </div>
                  <span className="text-sm text-[var(--color-mist)]">Max 10 per order</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 border-t border-[var(--color-whisper)] pt-6">
                <MagneticButton
                  size="xl"
                  variant="gold"
                  className="flex-1"
                  onClick={handleAddToBag}
                  disabled={!selectedSize || !product.inStock}
                  strength={0.3}
                >
                  {addedToBag ? (
                    <>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Added to Bag
                    </>
                  ) : (
                    'Add to Bag'
                  )}
                </MagneticButton>
                <MagneticButton
                  size="xl"
                  variant="outline"
                  className="flex-1"
                  onClick={handleBuyNow}
                  disabled={!selectedSize || !product.inStock}
                  strength={0.3}
                >
                  Buy Now
                </MagneticButton>
              </div>

              {/* Wishlist & Compare */}
              <div className="flex items-center gap-3 border-t border-[var(--color-whisper)] pt-6">
                <div className="flex items-center gap-1.5">
                  <LikeButton
                    liked={isWishlisted}
                    onChange={handleToggleWishlist}
                    size="md"
                    className="cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={handleToggleWishlist}
                    className="text-xs uppercase tracking-wider font-semibold text-[var(--color-slate)] hover:text-[var(--color-ink)] transition-colors cursor-pointer select-none"
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                  </button>
                </div>
                <MagneticButton variant="ghost" size="sm" className="gap-2" strength={0.3}>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Compare
                </MagneticButton>
                <span className="text-sm text-[var(--color-slate)] ml-auto">
                  SKU: <span className="text-[var(--color-ink)] font-mono">{product.sku}</span>
                </span>
              </div>

              {/* Delivery & Returns Info */}
              <ScrollReveal variant="fadeUp" delay={0.2} className="grid grid-cols-2 gap-4 border-t border-[var(--color-whisper)] pt-6">
                <MagneticCard className="flex items-start gap-3 p-4 bg-[var(--color-snow)] rounded-[var(--radius-lg)]" strength={0.1}>
                  <div className="w-10 h-10 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center text-[var(--color-gold)] flex-shrink-0">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M21 15V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10" />
                      <path d="M17 21h-2m2 0h-2m2 0h-2" />
                      <path d="M3 21h18" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">Free Shipping</p>
                    <p className="text-sm text-[var(--color-slate)]">On orders above ₹2,999</p>
                  </div>
                </MagneticCard>
                <MagneticCard className="flex items-start gap-3 p-4 bg-[var(--color-snow)] rounded-[var(--radius-lg)]" strength={0.1}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    product.returnWindowDays === 0
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-[var(--color-gold-light)] text-[var(--color-gold)]'
                  }`}>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">
                      {product.returnWindowDays === 0 ? 'Final Sale' : 'Easy Returns'}
                    </p>
                    <p className="text-sm text-[var(--color-slate)]">
                      {product.returnWindowDays === 0
                        ? 'Non-returnable item'
                        : `${product.returnWindowDays !== undefined ? product.returnWindowDays : 7}-day doorstep returns`}
                    </p>
                  </div>
                </MagneticCard>
              </ScrollReveal>
            </div>
          </div>

          {/* Product Details Tabs */}
          <ScrollReveal variant="fadeUp" delay={0.3} className="mt-16">
            <Tabs defaultValue="description" onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-center lg:justify-start">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="details">Details & Care</TabsTrigger>
                <TabsTrigger value="size-guide">Size Guide</TabsTrigger>
                <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-8">
                <StaggerContainer variant="default">
                  <StaggerItem variant="slide">
                    <div className="prose prose-invert max-w-none">
                      <p className="text-[var(--color-slate)] leading-relaxed">{product.description}</p>
                    </div>
                  </StaggerItem>
                  <StaggerItem variant="slide">
                    <h3 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)] mt-8 mb-4">Key Features</h3>
                    <ul className="space-y-2 list-disc list-inside text-[var(--color-slate)]">
                      {product.details.map((detail, i) => (
                        <li key={i} className="relative pl-4">{detail}</li>
                      ))}
                    </ul>
                  </StaggerItem>
                </StaggerContainer>
              </TabsContent>

              <TabsContent value="details" className="mt-8">
                <StaggerContainer variant="default" className="grid md:grid-cols-2 gap-8">
                  <StaggerItem variant="slide">
                    <h3 className="text-[var(--font-display)] text-lg font-medium text-[var(--color-ink)] mb-4">Fabric & Care</h3>
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm text-[var(--color-slate)]">Fabric</dt>
                        <dd className="text-[var(--color-ink)] font-medium">{product.fabric}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-[var(--color-slate)]">Care Instructions</dt>
                        <dd className="mt-2 space-y-1">
                          {product.care.map((instruction, i) => (
                            <div key={i} className="flex items-start gap-2 text-[var(--color-slate)]">
                              <svg className="h-4 w-4 flex-shrink-0 mt-0.5 text-[var(--color-gold)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {instruction}
                            </div>
                          ))}
                        </dd>
                      </div>
                    </dl>
                  </StaggerItem>
                  <StaggerItem variant="slide">
                    <h3 className="text-[var(--font-display)] text-lg font-medium text-[var(--color-ink)] mb-4">Product Details</h3>
                    <dl className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Category', value: product.category },
                          { label: 'Fit', value: 'Regular' },
                          { label: 'Sleeve', value: 'Three-quarter' },
                          { label: 'Neckline', value: 'Round' },
                          { label: 'Pattern', value: 'Hand Block Print' },
                          { label: 'Occasion', value: 'Festive, Casual' },
                          { label: 'Origin', value: 'Made in India' },
                          { label: 'SKU', value: product.sku },
                        ].map((item, i) => (
                          <div key={i}>
                            <dt className="text-sm text-[var(--color-slate)]">{item.label}</dt>
                            <dd className="text-[var(--color-ink)] font-medium">{item.value}</dd>
                          </div>
                        ))}
                      </div>
                    </dl>
                  </StaggerItem>
                </StaggerContainer>
              </TabsContent>

              <TabsContent value="size-guide" className="mt-8">
                <StaggerContainer variant="default">
                  <StaggerItem variant="slide">
                    <div className="overflow-x-auto">
                      <table className="w-full table">
                        <thead>
                          <tr>
                            <th>Size</th>
                            <th>Bust</th>
                            <th>Waist</th>
                            <th>Hips</th>
                            <th>Length</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(product.sizeChart).map(([size, measurements]) => (
                            <tr key={size}>
                              <td className="font-medium">{size}</td>
                              <td>{measurements.bust}</td>
                              <td>{measurements.waist}</td>
                              <td>{measurements.hips}</td>
                              <td>{measurements.length}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </StaggerItem>
                  <StaggerItem variant="slide">
                    <div className="mt-6 p-4 bg-[var(--color-snow)] rounded-[var(--radius-lg)]">
                      <p className="text-sm text-[var(--color-slate)]">
                        <strong className="text-[var(--color-ink)]">How to measure:</strong> Use a flexible measuring tape. Keep the tape parallel to the floor. For best results, measure over undergarments.
                      </p>
                    </div>
                  </StaggerItem>
                </StaggerContainer>
              </TabsContent>

              <TabsContent value="shipping" className="mt-8">
                <StaggerContainer variant="default" className="space-y-6">
                  <StaggerItem variant="slide">
                    <Accordion
                      items={[
                        {
                          id: 'shipping',
                          title: 'Shipping Information',
                          content: (
                            <div className="space-y-3 text-[var(--color-slate)]">
                              <p><strong className="text-[var(--color-ink)]">Free Shipping:</strong> On all orders above ₹2,999</p>
                              <p><strong className="text-[var(--color-ink)]">Standard Delivery:</strong> 3-5 business days (₹99 for orders below ₹2,999)</p>
                              <p><strong className="text-[var(--color-ink)]">Express Delivery:</strong> 1-2 business days (₹299)</p>
                              <p><strong className="text-[var(--color-ink)]">International Shipping:</strong> Available to select countries. Duties and taxes may apply.</p>
                            </div>
                          ),
                        },
                        {
                          id: 'returns',
                          title: 'Returns & Exchanges',
                          content: (
                            <div className="space-y-3 text-[var(--color-slate)]">
                              {product.returnWindowDays === 0 ? (
                                <p className="text-rose-700 font-medium">
                                  <strong className="text-rose-900">Final Sale (Non-Returnable):</strong> This handcrafted garment is not eligible for returns or exchanges once delivered.
                                </p>
                              ) : (
                                <p>
                                  <strong className="text-[var(--color-ink)]">{product.returnWindowDays !== undefined ? product.returnWindowDays : 7}-Day Doorstep Returns:</strong> Items can be returned or exchanged within {product.returnWindowDays !== undefined ? product.returnWindowDays : 7} days of doorstep delivery.
                                </p>
                              )}
                              <p><strong className="text-[var(--color-ink)]">Condition:</strong> Items must be unworn, unwashed, with original security tags and designer packaging intact</p>
                              <p><strong className="text-[var(--color-ink)]">Refunds:</strong> Processed within 5-7 business days after reverse inspection at our atelier</p>
                              <p><strong className="text-[var(--color-ink)]">Size Exchanges:</strong> Doorstep size swap arranged with no additional pickup charges</p>
                            </div>
                          ),
                        },
                        {
                          id: 'cod',
                          title: 'Cash on Delivery (COD)',
                          content: (
                            <div className="space-y-3 text-[var(--color-slate)]">
                              <p>COD is available for orders up to ₹10,000 in most pincodes.</p>
                              <p>A COD handling fee of ₹49 applies.</p>
                              <p>Please have exact change ready for delivery.</p>
                            </div>
                          ),
                        },
                      ]}
                      allowMultiple
                      variant="bordered"
                      className="w-full"
                    />
                  </StaggerItem>
                </StaggerContainer>
              </TabsContent>

              <TabsContent value="reviews" className="mt-8">
                <StaggerContainer variant="default" className="space-y-6">
                  <StaggerItem variant="scale">
                    {/* Review Summary */}
                    <MagneticCard className="flex flex-col md:flex-row gap-8 p-6 bg-[var(--color-snow)] rounded-[var(--radius-xl)]" strength={0.08}>
                      <div className="text-center md:text-left md:min-w-[200px]">
                        <Counter value={Math.round((reviewSummary?.averageRating || product.rating) * 10)} className="text-5xl font-bold text-[var(--color-ink)]" decimals={1} suffix="" duration={1.5} />
                        <div className="flex items-center justify-center md:justify-start gap-1 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className="h-5 w-5 text-[var(--color-gold)] fill-current" viewBox="0 0 20 20" aria-hidden="true">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-sm text-[var(--color-slate)] mt-2">Based on {reviewSummary?.totalReviews || product.reviewCount} reviews</p>
                        {reviewSummary?.verifiedPurchaseCount && (
                          <p className="text-xs text-[var(--color-success)] mt-1">{reviewSummary.verifiedPurchaseCount} verified purchases</p>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = reviewSummary?.ratingDistribution?.[star] || 0;
                          const total = reviewSummary?.totalReviews || 1;
                          const percentage = (count / total) * 100;
                          return (
                            <div key={star} className="flex items-center gap-3">
                              <span className="text-sm text-[var(--color-slate)] w-8">{star}★</span>
                              <div className="flex-1 h-2 bg-[var(--color-whisper)] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[var(--color-gold)] transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-[var(--color-mist)] w-10 text-right">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </MagneticCard>
                  </StaggerItem>

                  <StaggerItem variant="slide">
                    {/* Reviews List */}
                    <div className="space-y-6">
                      {reviews && reviews.length > 0 ? (
                        reviews.map((review, index) => (
                          <StaggerItem key={review.id} delay={index * 0.05} variant="slide">
                            <MagneticCard className="p-6" strength={0.05}>
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center flex-shrink-0">
                                  {review.user?.avatar_url ? (
                                    <Image src={review.user.avatar_url} alt={review.user.full_name || 'User'} fill className="rounded-full object-cover" sizes="48px" />
                                  ) : (
                                    <span className="text-[var(--color-gold)] font-medium text-xl">
                                      {(review.user?.full_name || (review as any).user_measurements?.reviewer_name || 'V').charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between gap-4 mb-2">
                                    <div>
                                      <p className="font-medium text-[var(--color-ink)]">
                                        {review.user?.full_name || (review as any).user_measurements?.reviewer_name || 'Verified Customer'}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                          <svg
                                            key={i}
                                            className={`h-4 w-4 ${i < (review.rating || 0) ? 'text-[var(--color-gold)] fill-current' : 'text-[var(--color-whisper)]'}`}
                                            viewBox="0 0 20 20"
                                            aria-hidden="true"
                                          >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                          </svg>
                                        ))}
                                        {review.is_verified_purchase && (
                                          <span className="px-2 py-0.5 text-xs font-medium bg-[var(--color-success-bg)] text-[var(--color-success)] rounded-[var(--radius-sm)]">Verified Purchase</span>
                                        )}
                                      </div>
                                    </div>
                                    <time className="text-sm text-[var(--color-mist)]" dateTime={review.created_at}>
                                      {new Date(review.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </time>
                                  </div>
                                  {review.title && (
                                    <h4 className="font-medium text-[var(--color-ink)] mb-1">{review.title}</h4>
                                  )}
                                  {review.body && (
                                    <p className="text-[var(--color-slate)] leading-relaxed">{review.body}</p>
                                  )}
                                  {(review.quality_rating || review.fit_rating) && (
                                    <div className="mt-3 flex gap-4 text-xs text-[var(--color-slate)]">
                                      {review.quality_rating && (
                                        <span className="flex items-center gap-1">
                                          <svg className="h-3 w-3 text-[var(--color-gold)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                          Quality: {review.quality_rating}/5
                                        </span>
                                      )}
                                      {review.fit_rating && (
                                        <span className="flex items-center gap-1">
                                          <svg className="h-3 w-3 text-[var(--color-gold)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                          Fit: {review.fit_rating}/5
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {review.photos && review.photos.length > 0 && (
                                    <div className="mt-3 flex gap-2 overflow-x-auto">
                                      {review.photos.map((photo, i) => (
                                        <Image key={i} src={photo} alt={`Review photo ${i + 1}`} width={80} height={80} className="rounded-[var(--radius-md)] object-cover" />
                                      ))}
                                    </div>
                                  )}
                                  {review.vendor_response && (
                                    <div className="mt-4 p-4 bg-[var(--color-snow)] rounded-[var(--radius-lg)] border border-[var(--color-whisper)]">
                                      <div className="flex items-center gap-2 text-xs text-[var(--color-gold)] mb-1">
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                        <span className="font-medium">Angelika Fashions</span>
                                      </div>
                                      <p className="text-[var(--color-slate)] text-sm">{review.vendor_response}</p>
                                      <p className="text-xs text-[var(--color-mist)] mt-1">Response from our team</p>
                                    </div>
                                  )}
                                  <div className="mt-3 flex items-center gap-4">
                                    <Button variant="ghost" size="sm" className="gap-1">
                                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                      </svg>
                                      <span>{review.helpful_count || 0}</span>
                                    </Button>
                                    <Button variant="ghost" size="sm" className="gap-1 text-[var(--color-slate)] hover:text-[var(--color-gold)]">
                                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                        <polyline points="16 6 12 2 8 6" />
                                      </svg>
                                      <span>Reply</span>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </MagneticCard>
                          </StaggerItem>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <svg className="h-12 w-12 mx-auto text-[var(--color-mist)] mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22 6 12 13 2 6" />
                          </svg>
                          <p className="text-[var(--color-slate)] text-lg">No reviews yet</p>
                          <p className="text-[var(--color-mist)] mt-1">Be the first to share your experience!</p>
                        </div>
                      )}
                    </div>
                  </StaggerItem>

                  <StaggerItem variant="scale">
                    {/* Write Review */}
                    <WriteReviewForm productId={product.id} />
                  </StaggerItem>
                </StaggerContainer>
              </TabsContent>
            </Tabs>
          </ScrollReveal>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-20 pt-12 border-t border-[var(--color-whisper)]">
              <ScrollReveal variant="fadeUp" className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-gold)] mb-1 block">
                    Curated Pairings &amp; Similar Silhouettes
                  </span>
                  <h2 className="text-[var(--font-display)] text-3xl md:text-4xl font-medium text-[var(--color-ink)]">
                    You May Also Like
                  </h2>
                </div>
                <MagneticButton variant="outline" asChild strength={0.3}>
                  <Link href={product.categorySlug ? `/shop/${product.categorySlug}` : `/shop`}>
                    View All {product.category} <span aria-hidden="true">→</span>
                  </Link>
                </MagneticButton>
              </ScrollReveal>
              <StaggerContainer variant="default" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
                {relatedProducts.map((related, index) => (
                  <StaggerItem key={related.id} delay={index * 0.08} variant="scale">
                    <ProductCard
                      {...related}
                      image={related.images[0]?.url || '/images/collection-kurtis.jpg'}
                      name={related.name}
                      price={related.price}
                      originalPrice={related.compare_at_price ?? undefined}
                      category={related.category?.name || product.category}
                      discount={related.discount}
                      isVidhyasPick={related.is_vidyas_pick}
                      isWishlisted={isInWishlist(related.id) || (related.slug ? isInWishlist(related.slug) : false)}
                      rating={related.rating || 4.8}
                      reviewCount={related.review_count || 12}
                      href={`/product/${related.slug}`}
                      onAddToBag={() => handleAddRelatedToBag(related)}
                      onAddToWishlist={() => handleToggleRelatedWishlist(related)}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </section>
          )}
        </div>
      </section>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}