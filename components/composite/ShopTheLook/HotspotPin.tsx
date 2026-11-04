'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HotspotPinProps {
  xPercent: number;
  yPercent: number;
  onClick: () => void;
  isActive?: boolean;
  label?: string;
}

export function HotspotPin({ xPercent, yPercent, onClick, isActive, label }: HotspotPinProps) {
  const [showLabel, setShowLabel] = useState(false);

  return (
    <motion.button
      type="button"
      className="hotspot-trigger absolute z-20 cursor-pointer focus:outline-none"
      style={{
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        transform: 'translate(-50%, -50%)',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => !isActive && setShowLabel(true)}
      onMouseLeave={() => setShowLabel(false)}
      aria-label={label || 'View product'}
      whileTap={{ scale: 0.92 }}
    >
      <div className="relative flex items-center justify-center">
        {/* Pulse ring */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0.7 }}
          animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
          className={`absolute -inset-2 rounded-full border-2 pointer-events-none ${
            isActive ? 'border-[var(--color-gold)]/70' : 'border-white/70'
          }`}
        />

        {/* Pin dot */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: isActive ? 1.15 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`w-6 h-6 rounded-full border-2 border-white shadow-xl flex items-center justify-center transition-all duration-200 ${
            isActive
              ? 'bg-[var(--color-gold)] ring-4 ring-[var(--color-gold)]/40 scale-110'
              : 'bg-black/75 hover:bg-[var(--color-gold)] backdrop-blur-xs hover:scale-110'
          }`}
        >
          {isActive ? (
            <svg className="w-3 h-3 text-[var(--color-ink)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <div className="w-2 h-2 rounded-full bg-white shadow-xs" />
          )}
        </motion.div>

        {/* Hover label tooltip (only when not active) */}
        <AnimatePresence>
          {!isActive && showLabel && label && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 text-[11px] font-semibold text-white bg-black/85 backdrop-blur-md rounded-full whitespace-nowrap shadow-xl border border-white/20 pointer-events-none"
            >
              {label}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}