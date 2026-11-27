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
  const [showLabel, setShowLabel] = useState(false);
  const emphasized = Boolean(isActive || isHighlighted);
  const displayNumber = typeof index === 'number' ? String(index + 1).padStart(2, '0') : null;

  return (
    <motion.button
      type="button"
      className="hotspot-trigger absolute z-20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C56B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#161310] rounded-full"
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
        if (!isActive) setShowLabel(true);
        onHover?.(true);
      }}
      onMouseLeave={() => {
        setShowLabel(false);
        onHover?.(false);
      }}
      aria-label={label ? `Shop ${label}` : 'View piece'}
      aria-pressed={Boolean(isActive)}
      whileTap={{ scale: 0.92 }}
    >
      <div className="relative flex items-center justify-center">
        {/* Soft champagne couture pulse ring */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0.7 }}
          animate={{ scale: emphasized ? [1, 1.85, 1] : [1, 1.65, 1], opacity: [0.65, 0, 0.65] }}
          transition={{ duration: 2.3, repeat: Infinity, ease: 'easeOut' }}
          className={`absolute -inset-2 rounded-full border-2 pointer-events-none ${
            emphasized ? 'border-[#E5C56B]' : 'border-[#FAF6F0]/75'
          }`}
        />

        {/* Numbered Atelier Pin Medallion */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: emphasized ? 1.15 : 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          className={`h-8 w-8 rounded-full border-2 shadow-[0_8px_22px_rgba(0,0,0,0.45)] flex items-center justify-center transition-all duration-200 ${
            emphasized
              ? 'bg-[#D8B454] border-[#FAF6F0] text-[#14110E] ring-4 ring-[#D8B454]/35'
              : 'bg-[#161310]/90 border-[#E5C56B] text-[#FAF6F0] hover:bg-[#D8B454] hover:text-[#14110E] hover:border-[#FAF6F0]'
          }`}
        >
          {displayNumber ? (
            <span className="text-[11px] font-bold tracking-tight tabular-nums leading-none">
              {displayNumber}
            </span>
          ) : (
            <span className="h-2.5 w-2.5 rounded-full bg-current" />
          )}
        </motion.div>

        {/* Crisp Editorial Hover Tooltip */}
        <AnimatePresence>
          {!isActive && (showLabel || isHighlighted) && label && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              transition={{ duration: 0.16 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 px-3 py-1.5 rounded-lg bg-[#161310]/95 border border-[#D8B454]/60 text-[#FAF6F0] whitespace-nowrap shadow-[0_12px_28px_rgba(0,0,0,0.45)] pointer-events-none"
            >
              <span className="block text-[11px] font-semibold tracking-wide leading-tight">
                {label}
              </span>
              {typeof price === 'number' && price > 0 && (
                <span className="block text-[10px] font-bold text-[#E5C56B] mt-0.5 tabular-nums">
                  ₹{price.toLocaleString('en-IN')}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}
