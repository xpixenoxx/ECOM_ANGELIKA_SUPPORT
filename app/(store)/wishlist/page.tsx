'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SizeSelector } from '@/components/composite/SizeSelector';
import { cn } from '@/lib/utils/cn';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { StaggerContainer, StaggerItem, StaggerGrid } from '@/components/animations/Stagger';
import { MagneticButton } from '@/components/animations/MagneticButton';
import { useCart } from '@/lib/hooks/useCart';

const mockWishlistItems = [
  {
    id: 'wish-1',
    productId: 'royal-crimson-bridal-zardozi-lehenga',
    name: 'Royal Crimson Bridal Zardozi Lehenga',
    price: 18499,
    originalPrice: 24999,
    image: '/images/products/lehenga-bridal-1.jpg',
    color: 'Crimson Red',
    colorHex: '#8B0000',
    size: 'M',
    inStock: true,
    discount: 26,
    category: 'Lehengas',
    addedAt: '2026-01-10',
  },
  {
    id: 'wish-2',
    productId: 'royal-indigo-pure-raw-silk-straight-suit',
    name: 'Royal Indigo Pure Raw Silk Straight Suit',
    price: 7499,
    originalPrice: 9999,
    image: '/images/products/salwar-rawsilk-1.jpg',
    color: 'Royal Indigo',
    colorHex: '#1E3A8A',
    size: 'Free Size',
    inStock: true,
    discount: 25,
    category: 'Salwars',
    addedAt: '2026-01-08',
  },
  {
    id: 'wish-3',
    productId: 'heritage-temple-kanjivaram-silk-saree',
    name: 'Heritage Temple Kanjivaram Silk Saree',
    price: 22499,
    originalPrice: 27999,
    image: '/images/products/saree-kanjivaram-1.jpg',
    color: 'Crimson & Gold',
    colorHex: '#C9A84C',
    size: 'Free Size',
    inStock: true,
    discount: 20,
    category: 'Sarees',
    addedAt: '2026-01-05',
  },
  {
    id: 'wish-4',
    productId: 'royal-gold-banarasi-katan-silk-dupatta',
    name: 'Royal Gold Banarasi Katan Silk Dupatta',
    price: 4499,
    originalPrice: 5999,
    image: '/images/products/dupatta-banarasi-1.jpg',
    color: 'Gold',
    colorHex: '#D4AF37',
    size: 'Free Size',
    inStock: true,
    discount: 25,
    category: 'Dupattas',
    addedAt: '2026-01-03',
  },
  {
    id: 'wish-5',
    productId: 'kutch-ajrakh-modal-silk-kurti',
    name: 'Kutch Ajrakh Modal Silk Kurti',
    price: 4999,
    originalPrice: 6499,
    image: '/images/products/kurti-ajrakh-1.jpg',
    color: 'Indigo & Madder',
    colorHex: '#312E81',
    size: 'M',
    inStock: true,
    discount: 23,
    category: 'Kurtis',
    addedAt: '2025-12-28',
  },
  {
    id: 'wish-6',
    productId: 'ivory-gold-chanderi-angrakha-suit',
    name: 'Ivory & Gold Chanderi Angrakha Suit',
    price: 6899,
    originalPrice: 8999,
    image: '/images/products/salwar-angrakha-1.jpg',
    color: 'Ivory Gold',
    colorHex: '#FFFDD0',
    size: 'L',
    inStock: true,
    discount: 23,
    category: 'Salwars',
    addedAt: '2025-12-20',
  },
];

export default function WishlistPage() {
  const { addItem } = useCart();
  const [items, setItems] = useState(mockWishlistItems);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [moveToCart, setMoveToCart] = useState<string | null>(null);

  const inStockItems = items.filter(item => item.inStock);
  const outOfStockItems = items.filter(item => !item.inStock);

  const addToCart = async (item: typeof mockWishlistItems[0]) => {
    setMoveToCart(item.id);
    try {
      await addItem(item.productId || item.id, 1, item.size);
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearWishlist = () => {
    setItems([]);
  };

  const shareWishlist = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Angelika Fashions Wishlist',
        text: 'Check out my favorite picks from Angelika Fashions!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-white)]">
        <section className="py-16">
          <div className="container-custom px-6">
            <ScrollReveal variant="fadeUp" className="text-center max-w-md mx-auto mb-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center">
                <svg className="h-12 w-12 text-[var(--color-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h1 className="text-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)] mb-3">
                Your Wishlist is Empty
              </h1>
              <p className="text-[var(--color-slate)] mb-8">
                Save items you love for later. They'll be here waiting for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <MagneticButton size="lg" variant="primary" strength={0.3} asChild>
                  <Link href="/shop">Start Shopping</Link>
                </MagneticButton>
                <MagneticButton size="lg" variant="outline" strength={0.3} asChild>
                  <Link href="/vidhyas-picks">View Vidhya's Picks</Link>
                </MagneticButton>
              </div>
            </ScrollReveal>

            {/* Recommendations for empty wishlist */}
            <div className="mt-16 pt-12 border-t border-[var(--color-whisper)]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-gold)] mb-1 block">
                    Curated Masterpieces
                  </span>
                  <h2 className="text-[var(--font-display)] text-2xl md:text-3xl font-medium text-[var(--color-ink)]">
                    You May Also Like
                  </h2>
                </div>
                <MagneticButton variant="outline" asChild strength={0.3}>
                  <Link href="/shop">Explore Collection →</Link>
                </MagneticButton>
              </div>
              <StaggerGrid
                items={[
                  { id: 'rec-1', slug: 'royal-crimson-bridal-zardozi-lehenga', name: 'Royal Crimson Bridal Zardozi Lehenga', price: 18499, originalPrice: 24999, image: '/images/products/lehenga-bridal-1.jpg', discount: 26, category: 'Lehengas' },
                  { id: 'rec-2', slug: 'royal-indigo-pure-raw-silk-straight-suit', name: 'Royal Indigo Pure Raw Silk Straight Suit', price: 7499, originalPrice: 9999, image: '/images/products/salwar-rawsilk-1.jpg', discount: 25, category: 'Salwars' },
                  { id: 'rec-3', slug: 'ivory-gold-chanderi-angrakha-suit', name: 'Ivory & Gold Chanderi Angrakha Suit', price: 6899, originalPrice: 8999, image: '/images/products/salwar-angrakha-1.jpg', discount: 23, category: 'Salwars' },
                  { id: 'rec-4', slug: 'mirror-work-lehenga', name: 'Mirror Work Festive Lehenga', price: 14999, originalPrice: 17999, image: '/images/products/lehenga-mirror-1.jpg', discount: 17, category: 'Lehengas' },
                ]}
                renderItem={(product, index) => (
                  <StaggerItem key={product.id} variant="scale" style={{ transitionDelay: `${index * 0.05}s` }}>
                    <article className="bg-[var(--color-white)] rounded-[var(--radius-xl)] overflow-hidden border border-[var(--color-whisper)] hover:shadow-[var(--shadow-lg)] transition-shadow duration-300 group">
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        {product.discount > 0 && (
                          <span className="absolute top-3 left-3 bg-[var(--color-gold)] text-[var(--color-ink)] text-xs font-bold px-2 py-1 rounded-[var(--radius-sm)]">
                            -{product.discount}%
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-[var(--color-gold)] font-medium mb-1">{product.category}</p>
                        <h3 className="text-[var(--font-display)] text-sm font-medium text-[var(--color-ink)] line-clamp-2 mb-2">{product.name}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-[var(--color-ink)]">₹{product.price.toLocaleString()}</span>
                          <span className="text-sm text-[var(--color-mist)] line-through">₹{product.originalPrice.toLocaleString()}</span>
                        </div>
                        <MagneticButton variant="outline" className="w-full mt-3" asChild strength={0.3}>
                          <Link href={`/product/${product.slug}`}>View Details</Link>
                        </MagneticButton>
                      </div>
                    </article>
                  </StaggerItem>
                )}
                columns={4}
                gap={6}
              />
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-white)]">
      {/* Page Header */}
      <section className="bg-[var(--color-snow)] border-b border-[var(--color-whisper)] py-10">
        <div className="container-custom px-6">
          <ScrollReveal variant="fadeUp" className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-[var(--font-display)] text-3xl md:text-4xl font-medium text-[var(--color-ink)]">
                My Wishlist
              </h1>
              <p className="text-[var(--color-slate)] mt-1">
                {items.length} item{items.length !== 1 ? 's' : ''} saved • {inStockItems.length} in stock
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-lg)] p-1">
                <MagneticButton
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  strength={0.2}
                  className="rounded-[var(--radius-md)]"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </MagneticButton>
                <MagneticButton
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  strength={0.2}
                  className="rounded-[var(--radius-md)]"
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3" y2="18" />
                    <line x1="21" y1="6" x2="21" y2="18" />
                  </svg>
                </MagneticButton>
              </div>
              <MagneticButton variant="outline" size="sm" strength={0.3} onClick={shareWishlist} className="gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="M8.59 13.51a5 5 0 0 1 7.41 0M8.59 6.51a5 5 0 0 1 0 7.07" />
                </svg>
                Share
              </MagneticButton>
              {items.length > 0 && (
                <MagneticButton variant="ghost" size="sm" strength={0.3} onClick={clearWishlist} className="text-[var(--color-error)] hover:text-[var(--color-error)]">
                  Clear All
                </MagneticButton>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Wishlist Content */}
      <section className="py-10">
        <div className="container-custom px-6">
          {/* In Stock Items */}
          {inStockItems.length > 0 && (
            <ScrollReveal variant="fadeUp">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)]">
                  In Stock ({inStockItems.length})
                </h2>
                <MagneticButton variant="primary" size="sm" strength={0.3} onClick={() => inStockItems.forEach(addToCart)} className="gap-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1 0 8" />
                  </svg>
                  Add All to Bag
                </MagneticButton>
              </div>

              {viewMode === 'grid' ? (
                <StaggerGrid
                  items={inStockItems}
                  renderItem={(item, index) => (
                    <StaggerItem key={item.id} variant="scale" style={{ transitionDelay: `${index * 0.05}s` }}>
                      <ProductCardWishlist
                        item={item}
                        onAddToCart={addToCart}
                        onRemove={removeItem}
                        isMovingToCart={moveToCart === item.id}
                      />
                    </StaggerItem>
                  )}
                  columns={4}
                  gap={6}
                />
              ) : (
                <StaggerContainer variant="default" className="space-y-4">
                  {inStockItems.map((item, index) => (
                    <StaggerItem key={item.id} variant="slide" style={{ transitionDelay: `${index * 0.05}s` }}>
                      <ProductCardWishlistList
                        item={item}
                        onAddToCart={addToCart}
                        onRemove={removeItem}
                        isMovingToCart={moveToCart === item.id}
                      />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </ScrollReveal>
          )}

          {/* Out of Stock Items */}
          {outOfStockItems.length > 0 && (
            <ScrollReveal variant="fadeUp" delay={0.2}>
              <h2 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)] mb-6">
                Out of Stock ({outOfStockItems.length})
              </h2>
              {viewMode === 'grid' ? (
                <StaggerGrid
                  items={outOfStockItems}
                  renderItem={(item, index) => (
                    <StaggerItem key={item.id} variant="scale" style={{ transitionDelay: `${index * 0.05}s` }} className="opacity-60">
                      <ProductCardWishlist
                        item={item}
                        onAddToCart={addToCart}
                        onRemove={removeItem}
                        isMovingToCart={moveToCart === item.id}
                      />
                    </StaggerItem>
                  )}
                  columns={4}
                  gap={6}
                />
              ) : (
                <StaggerContainer variant="default" className="space-y-4">
                  {outOfStockItems.map((item, index) => (
                    <StaggerItem key={item.id} variant="slide" style={{ transitionDelay: `${index * 0.05}s` }} className="opacity-60">
                      <ProductCardWishlistList
                        item={item}
                        onAddToCart={addToCart}
                        onRemove={removeItem}
                        isMovingToCart={moveToCart === item.id}
                      />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* Recently Viewed / Recommendations */}
      <section className="py-10 bg-[var(--color-snow)] border-t border-[var(--color-whisper)]">
        <div className="container-custom px-6">
          <ScrollReveal variant="fadeUp">
            <h2 className="text-[var(--font-display)] text-2xl font-medium text-[var(--color-ink)] mb-6">
              You May Also Like
            </h2>
            <StaggerGrid
              items={[
                { id: 'rec-1', slug: 'royal-crimson-bridal-zardozi-lehenga', name: 'Royal Crimson Bridal Zardozi Lehenga', price: 18499, originalPrice: 24999, image: '/images/products/lehenga-bridal-1.jpg', discount: 26, category: 'Lehengas' },
                { id: 'rec-2', slug: 'royal-indigo-pure-raw-silk-straight-suit', name: 'Royal Indigo Pure Raw Silk Straight Suit', price: 7499, originalPrice: 9999, image: '/images/products/salwar-rawsilk-1.jpg', discount: 25, category: 'Salwars' },
                { id: 'rec-3', slug: 'ivory-gold-chanderi-angrakha-suit', name: 'Ivory & Gold Chanderi Angrakha Suit', price: 6899, originalPrice: 8999, image: '/images/products/salwar-angrakha-1.jpg', discount: 23, category: 'Salwars' },
                { id: 'rec-4', slug: 'mirror-work-lehenga', name: 'Mirror Work Festive Lehenga', price: 14999, originalPrice: 17999, image: '/images/products/lehenga-mirror-1.jpg', discount: 17, category: 'Lehengas' },
              ]}
              renderItem={(product, index) => (
                <StaggerItem key={product.id} variant="scale" style={{ transitionDelay: `${index * 0.05}s` }}>
                  <article className="bg-[var(--color-white)] rounded-[var(--radius-xl)] overflow-hidden border border-[var(--color-whisper)] hover:shadow-[var(--shadow-lg)] transition-shadow duration-300 group">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      {product.discount > 0 && (
                        <span className="absolute top-3 left-3 bg-[var(--color-gold)] text-[var(--color-ink)] text-xs font-bold px-2 py-1 rounded-[var(--radius-sm)]">
                          -{product.discount}%
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-[var(--color-gold)] font-medium mb-1">{product.category}</p>
                      <h3 className="text-[var(--font-display)] text-sm font-medium text-[var(--color-ink)] line-clamp-2 mb-2">{product.name}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-[var(--color-ink)]">₹{product.price.toLocaleString()}</span>
                        <span className="text-sm text-[var(--color-mist)] line-through">₹{product.originalPrice.toLocaleString()}</span>
                      </div>
                      <MagneticButton variant="outline" className="w-full mt-3" asChild strength={0.3}>
                        <Link href={`/product/${product.slug}`}>View Details</Link>
                      </MagneticButton>
                    </div>
                  </article>
                </StaggerItem>
              )}
              columns={4}
              gap={6}
            />
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

function ProductCardWishlist({ item, onAddToCart, onRemove, isMovingToCart }: {
  item: typeof mockWishlistItems[0];
  onAddToCart: (item: typeof mockWishlistItems[0]) => void;
  onRemove: (id: string) => void;
  isMovingToCart: boolean;
}) {
  return (
    <AnimatePresence mode="wait">
      {!isMovingToCart && (
        <motion.article
          className="bg-[var(--color-white)] rounded-[var(--radius-xl)] overflow-hidden border border-[var(--color-whisper)] hover:shadow-[var(--shadow-lg)] transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <button
                onClick={() => onRemove(item.id)}
                className="p-2 rounded-full bg-[var(--color-white)]/90 hover:bg-[var(--color-white)] text-[var(--color-mist)] hover:text-[var(--color-error)] shadow-[var(--shadow-sm)] transition-colors"
                aria-label={`Remove ${item.name} from wishlist`}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
              {item.discount > 0 && (
                <span className="bg-[var(--color-gold)] text-[var(--color-ink)] text-xs font-bold px-2 py-1 rounded-[var(--radius-sm)]">
                  -{item.discount}%
                </span>
              )}
            </div>
            {!item.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-sm font-semibold text-white bg-[var(--color-error)] px-3 py-1 rounded-[var(--radius-sm)]">Out of Stock</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <p className="text-xs text-[var(--color-gold)] font-medium mb-1">{item.category}</p>
            <h3 className="text-[var(--font-display)] text-sm font-medium text-[var(--color-ink)] line-clamp-2 mb-2">{item.name}</h3>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex items-center gap-1 text-sm text-[var(--color-slate)]">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.colorHex }} aria-hidden="true" />
                {item.color}
              </span>
              <span className="text-sm text-[var(--color-slate)]">Size: {item.size}</span>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-bold text-[var(--color-ink)]">₹{item.price.toLocaleString()}</span>
              <span className="text-sm text-[var(--color-mist)] line-through">₹{item.originalPrice.toLocaleString()}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={item.inStock ? 'primary' : 'outline'}
                className="flex-1"
                onClick={() => onAddToCart(item)}
                disabled={!item.inStock || isMovingToCart}
              >
                {isMovingToCart ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
                    </svg>
                    Adding...
                  </span>
                ) : item.inStock ? (
                  'Add to Bag'
                ) : (
                  'Notify Me'
                )}
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/product/${item.productId}`} className="w-full justify-center">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </Link>
              </Button>
            </div>
            <p className="text-xs text-[var(--color-mist)] mt-2 text-center">Added {new Date(item.addedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </motion.article>
      )}
    </AnimatePresence>
  );
}

function ProductCardWishlistList({ item, onAddToCart, onRemove, isMovingToCart }: {
  item: typeof mockWishlistItems[0];
  onAddToCart: (item: typeof mockWishlistItems[0]) => void;
  onRemove: (id: string) => void;
  isMovingToCart: boolean;
}) {
  return (
    <AnimatePresence mode="wait">
      {!isMovingToCart && (
        <motion.div
          className="flex gap-4 p-4 bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-xl)] hover:shadow-[var(--shadow-md)] transition-shadow duration-300"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="relative w-24 h-32 flex-shrink-0 rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-whisper)]">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              sizes="96px"
            />
            {!item.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-sm font-semibold text-white bg-[var(--color-error)] px-3 py-1 rounded-[var(--radius-sm)]">Out of Stock</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs text-[var(--color-gold)] font-medium mb-1">{item.category}</p>
                <Link href={`/product/${item.productId}`} className="hover:underline">
                  <h3 className="text-[var(--font-display)] text-base font-medium text-[var(--color-ink)] line-clamp-2 mb-1">
                    {item.name}
                  </h3>
                </Link>
                <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-slate)]">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.colorHex }} aria-hidden="true" />
                    {item.color}
                  </span>
                  <span>Size: {item.size}</span>
                </div>
              </div>
              <button
                onClick={() => onRemove(item.id)}
                className="p-2 text-[var(--color-mist)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-bg)] rounded-[var(--radius-md)] transition-colors flex-shrink-0"
                aria-label={`Remove ${item.name} from wishlist`}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
              <div className="flex items-baseline gap-3">
                <span className="text-lg font-bold text-[var(--color-ink)] tabular-nums">₹{item.price.toLocaleString()}</span>
                <span className="text-sm text-[var(--color-mist)] line-through">₹{item.originalPrice.toLocaleString()}</span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-[var(--color-gold)] text-[var(--color-ink)] rounded-[var(--radius-sm)]">-{item.discount}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={item.inStock ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => onAddToCart(item)}
                  disabled={!item.inStock || isMovingToCart}
                >
                  {isMovingToCart ? 'Adding...' : item.inStock ? 'Add to Bag' : 'Notify Me'}
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/product/${item.productId}`}>View</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}