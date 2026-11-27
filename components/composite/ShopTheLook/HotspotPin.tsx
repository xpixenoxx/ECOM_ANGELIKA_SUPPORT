'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HotspotPinProps {
  xPercent: number;
  yPercent: number;
  onClick: () => void;
  isActive?: boolean;
  isHighlighted?: boolean;
  index?: number;
  label?: string;
  price?: number;
  onHover?: (hovering: boolean) => void;
}

export function HotspotPin({
  xPercent,
  yPercent,
  onClick,
  isActive,
  isHighlighted,
  index,
  label,
  price,
  onHover,
}: HotspotPinProps) {
  const [hovered, setHovered] = useState(false);
  const emphasized = Boolean(isActive || isHighlighted || hovered);
  const displayNumber = typeof index === 'number' ? String(index + 1).padStart(2, '0') : null;
  const openLeft = xPercent > 56;
  const openAbove = yPercent > 72;

  return (
    <motion.button
      type="button"
      className="hotspot-trigger absolute z-20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8922E] focus-visible:ring-offset-2 rounded-full"
      style={{
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        transform: 'translate(-50%, -50%)',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => {
        setHovered(true);
        onHover?.(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
        onHover?.(false);
      }}
      aria-label={label ? `Shop ${label}` : 'View piece'}
      aria-pressed={Boolean(isActive)}
      whileTap={{ scale: 0.92 }}
    >
      <div className="relative flex items-center justify-center">
        {/* Breathing pearl-gold couture pulse */}
        <motion.span
          aria-hidden="true"
          initial={{ scale: 0.9, opacity: 0.7 }}
          animate={{ scale: emphasized ? [1, 2.05, 1] : [1, 1.75, 1], opacity: [0.65, 0, 0.65] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
          className={`absolute -inset-2 rounded-full border-2 pointer-events-none ${
            emphasized ? 'border-[#D8B454]' : 'border-[#FFFDF9]/90'
          }`}
        />

        {/* Sculpted Pearl-Ivory & Spun-Gold Atelier Bead */}
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: emphasized ? 1.18 : 1 }}
          transition={{ type: 'spring', stiffness: 340, damping: 22 }}
          className={`h-8 w-8 rounded-full border-2 shadow-[0_6px_18px_rgba(18,14,10,0.45)] flex items-center justify-center transition-colors duration-200 ${
            emphasized
              ? 'bg-[#171310] border-[#E6C770] text-[#F2D991] ring-4 ring-[#D8B454]/30'
              : 'bg-[#FFFDF9]/95 border-[#8C6A16] text-[#171310] hover:bg-[#171310] hover:text-[#F2D991] hover:border-[#E6C770]'
          }`}
        >
          {displayNumber ? (
            <span className="text-[11px] font-bold tracking-tight tabular-nums leading-none">
              {displayNumber}
            </span>
          ) : (
            <span className="h-2 w-2 rounded-full bg-current" />
          )}
        </motion.span>

        {/* Precision Glass-Ivory Couture Garment Callout Tag (flips cleanly away from edges) */}
        <AnimatePresence>
          {emphasized && label && (
            <motion.div
              initial={{ opacity: 0, x: openLeft ? 6 : -6, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: openLeft ? 6 : -6, scale: 0.95 }}
              transition={{ duration: 0.16 }}
              className={`pointer-events-none absolute z-30 flex items-center ${
                openAbove ? 'bottom-full mb-2.5 left-1/2 -translate-x-1/2' : openLeft ? 'right-full mr-2.5 top-1/2 -translate-y-1/2 flex-row-reverse' : 'left-full ml-2.5 top-1/2 -translate-y-1/2'
              }`}
            >
              {!openAbove && (
                <span
                  aria-hidden="true"
                  className="h-[1.5px] w-4 bg-[#D8B454] shrink-0 shadow-xs"
                />
              )}
              <div className="rounded-lg bg-[#FFFDF9]/95 backdrop-blur-md border border-[#BDA478] px-3 py-1.5 text-left shadow-[0_12px_28px_rgba(18,14,10,0.28)] whitespace-nowrap">
                <span className="block text-[11px] font-bold text-[#14110E] leading-tight">
                  {label}
                </span>
                {typeof price === 'number' && price > 0 && (
                  <span className="block text-[10.5px] font-bold text-[#7A580D] mt-0.5 tabular-nums">
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}
