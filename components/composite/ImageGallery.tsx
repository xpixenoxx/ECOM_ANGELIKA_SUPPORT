'use client';

import React, { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { SkeletonImage } from '@/components/ui/Skeleton';

export interface GalleryImage {
  src: string;
  alt: string;
  thumbnail?: string;
  video?: string;
  poster?: string;
}

export interface ImageGalleryProps {
  images: GalleryImage[];
  selectedIndex?: number;
  onChange?: (index: number) => void;
  aspectRatio?: string;
  showThumbnails?: boolean;
  thumbnailPosition?: 'bottom' | 'right';
  enableZoom?: boolean;
  enableFullscreen?: boolean;
  enableVideo?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

export function ImageGallery({
  images,
  selectedIndex: controlledIndex = 0,
  onChange,
  aspectRatio = '4/5',
  showThumbnails = true,
  thumbnailPosition = 'bottom',
  enableZoom = true,
  enableFullscreen = true,
  enableVideo = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  className = '',
}: ImageGalleryProps) {
  const [internalIndex, setInternalIndex] = useState(controlledIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mainImageRef = useRef<HTMLDivElement>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  const index = controlledIndex !== undefined ? controlledIndex : internalIndex;

  const handleIndexChange = useCallback((newIndex: number) => {
    const clampedIndex = Math.max(0, Math.min(images.length - 1, newIndex));
    if (controlledIndex === undefined) {
      setInternalIndex(clampedIndex);
    }
    onChange?.(clampedIndex);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [controlledIndex, images.length, onChange]);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;
    const interval = setInterval(() => {
      handleIndexChange((index + 1) % images.length);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, images.length, handleIndexChange, index]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!enableZoom) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prev => Math.max(1, Math.min(5, prev + delta)));
  }, [enableZoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    e.preventDefault();
  }, [zoomLevel, panOffset]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (zoomLevel <= 1) return;
    const touch = e.touches[0];
    if (!touch) return;
    setIsDragging(true);
    setDragStart({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y });
  }, [zoomLevel, panOffset]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;
    setPanOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        handleIndexChange(index - 1);
        break;
      case 'ArrowRight':
        handleIndexChange(index + 1);
        break;
      case 'Escape':
        if (isFullscreen) setIsFullscreen(false);
        break;
      case 'f':
      case 'F':
        if (enableFullscreen) setIsFullscreen(true);
        break;
    }
  }, [index, handleIndexChange, isFullscreen, enableFullscreen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const currentImage = images[index];
  const isVideo = enableVideo && currentImage?.video;

  // Guard against undefined currentImage
  if (!currentImage) {
    return (
      <div className={cn('relative bg-[var(--color-whisper)] rounded-[var(--radius-lg)]', className)} style={{ aspectRatio }}>
        <div className="w-full h-full flex items-center justify-center">
          <SkeletonImage className="w-full h-full" />
        </div>
      </div>
    );
  }

  const renderMainImage = () => (
    <div
      ref={mainImageRef}
      className={cn(
        'relative overflow-hidden bg-[var(--color-whisper)]',
        'rounded-[var(--radius-lg)]',
        'cursor-zoom-in',
        'touch-pan-x touch-pan-y'
      )}
      style={{ aspectRatio }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="img"
      aria-label={currentImage.alt}
    >
      {isVideo ? (
        <video
          src={currentImage.video}
          poster={currentImage.poster || currentImage.src}
          className="w-full h-full object-contain"
          autoPlay
          muted
          loop
          playsInline
          onClick={() => handleIndexChange((index + 1) % images.length)}
        />
      ) : (
        <motion.img
          src={currentImage.src}
          alt={currentImage.alt}
          className="w-full h-full object-contain transition-transform duration-100"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
          }}
          onLoad={() => {
            // Image loaded
          }}
        />
      )}
      {zoomLevel > 1 && (
        <div className="absolute bottom-2 right-2 text-xs text-white/80 bg-black/50 px-2 py-1 rounded">
          {Math.round(zoomLevel * 100)}%
        </div>
      )}
    </div>
  );

  const renderThumbnails = () => {
    if (!showThumbnails || images.length <= 1) return null;

    const isVertical = thumbnailPosition === 'right';

    return (
      <motion.div
        ref={thumbnailContainerRef}
        className={cn(
          'flex gap-2 overflow-auto scrollbar-hide p-2',
          isVertical ? 'flex-col h-full' : 'flex-row'
        )}
        role="tablist"
        aria-label="Image thumbnails"
        initial={{ opacity: 0, y: isVertical ? 0 : 20, x: isVertical ? 20 : 0 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {images.map((image, i) => (
          <motion.button
            key={image.src}
            role="tab"
            aria-selected={i === index}
            aria-label={`View image ${i + 1}`}
            onClick={() => handleIndexChange(i)}
            className={cn(
              'relative flex-shrink-0 rounded-[var(--radius-md)] overflow-hidden border-2 transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-gold)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-white)]',
              i === index
                ? 'border-[var(--color-gold)] shadow-[var(--shadow-gold)]'
                : 'border-transparent hover:border-[var(--color-gold)]/50'
            )}
            style={{
              width: isVertical ? '60px' : '80px',
              height: isVertical ? '60px' : '80px',
              aspectRatio: '1',
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <img
              src={image.thumbnail || image.src}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              aria-hidden="true"
            />
            {image.video && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}
          </motion.button>
        ))}
      </motion.div>
    );
  };

  const galleryContent = (
    <div className={cn('relative', className)}>
      <div className={cn(
        thumbnailPosition === 'right' ? 'flex' : 'flex-col',
        'gap-4'
      )}>
        {thumbnailPosition === 'right' ? (
          <>
            <div className="flex-1 min-w-0">{renderMainImage()}</div>
            <div className="w-20">{renderThumbnails()}</div>
          </>
        ) : (
          <>
            <div>{renderMainImage()}</div>
            <div>{renderThumbnails()}</div>
          </>
        )}
      </div>

      {images.length > 1 && !showThumbnails && (
        <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="Image indicators">
          {images.map((_, i) => (
            <motion.button
              key={i}
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to image ${i + 1}`}
              onClick={() => handleIndexChange(i)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                i === index
                  ? 'bg-[var(--color-gold)] w-6'
                  : 'bg-[var(--color-mist)] hover:bg-[var(--color-slate)]'
              )}
              whileTap={{ scale: 1.2 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
            />
          ))}
        </div>
      )}

      {enableFullscreen && images.length > 1 && (
        <motion.button
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm text-[var(--color-ink)] hover:bg-white hover:shadow-[var(--shadow-md)] transition-all duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsFullscreen(true)}
          aria-label="Open fullscreen"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
        </motion.button>
      )}

      {enableZoom && zoomLevel > 1 && (
        <motion.button
          className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm text-[var(--color-ink)] hover:bg-white hover:shadow-[var(--shadow-md)] transition-all duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }}
          aria-label="Reset zoom"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v8M8 12h8" />
          </svg>
        </motion.button>
      )}
    </div>
  );

  if (isFullscreen) {
    // Guard against undefined currentImage in fullscreen mode
    if (!currentImage) {
      setIsFullscreen(false);
      return null;
    }

    const fullscreenContent = (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-[var(--z-modal)] bg-black flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsFullscreen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen image viewer"
        >
          <motion.button
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
            aria-label="Close fullscreen"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </motion.button>

          <motion.button
            className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors hidden md:block"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); handleIndexChange(index - 1); }}
            aria-label="Previous image"
            disabled={index === 0}
          >
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </motion.button>

          <motion.button
            className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors hidden md:block"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); handleIndexChange(index + 1); }}
            aria-label="Next image"
            disabled={index === images.length - 1}
          >
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </motion.button>

          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {isVideo ? (
              <video
                src={currentImage.video!}
                poster={currentImage.poster || currentImage.src}
                className="max-w-[90vw] max-h-[90vh] object-contain"
                autoPlay
                muted
                loop
                playsInline
                controls
              />
            ) : (
              <motion.img
                src={currentImage.src}
                alt={currentImage.alt}
                className="max-w-[90vw] max-h-[90vh] object-contain"
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
            )}
          </div>

          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {images.map((image, i) => (
              <motion.button
                key={image.src}
                role="tab"
                aria-selected={i === index}
                aria-label={`View image ${i + 1}`}
                onClick={(e) => { e.stopPropagation(); handleIndexChange(i); }}
                className={cn(
                  'w-16 h-16 rounded-[var(--radius-md)] overflow-hidden border-2 transition-all',
                  i === index
                    ? 'border-[var(--color-gold)] shadow-[var(--shadow-gold)]'
                    : 'border-white/30 hover:border-white/50'
                )}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={image.thumbnail || image.src}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );

    return createPortal(fullscreenContent, document.body);
  }

  return galleryContent;
}

export interface ProductImageGalleryProps extends ImageGalleryProps {
  productName: string;
  onAddToBag?: () => void;
  onAddToWishlist?: () => void;
  isVidhyasPick?: boolean;
  badge?: 'new' | 'sale' | 'limited' | 'exclusive';
}

export function ProductImageGallery({
  productName,
  onAddToBag,
  onAddToWishlist,
  isVidhyasPick,
  badge,
  images,
  className = '',
  ...props
}: ProductImageGalleryProps) {
  return (
    <div className={cn('relative group', className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-whisper)]">
        <ImageGallery
          images={images}
          aspectRatio="4/5"
          showThumbnails={true}
          thumbnailPosition="bottom"
          enableZoom={true}
          enableFullscreen={true}
          className="absolute inset-0"
          {...props}
        />

        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {(isVidhyasPick || badge) && (
            <div className="flex flex-col gap-1.5">
              {isVidhyasPick && (
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-[var(--color-ink)] text-[var(--color-gold)] rounded-[var(--radius-sm)]">
                  Vidhya's Pick
                </span>
              )}
              {badge === 'new' && (
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-[var(--color-gold)] text-[var(--color-ink)] rounded-[var(--radius-sm)]">
                  New
                </span>
              )}
              {badge === 'sale' && (
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-[var(--color-error)] text-white rounded-[var(--radius-sm)]">
                  Sale
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
            className="p-2 rounded-full bg-white/90 backdrop-blur-sm text-[var(--color-ink)] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:shadow-[var(--shadow-md)]"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onAddToWishlist}
            aria-label="Add to wishlist"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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
            onClick={onAddToBag}
          >
            Add to Bag
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}