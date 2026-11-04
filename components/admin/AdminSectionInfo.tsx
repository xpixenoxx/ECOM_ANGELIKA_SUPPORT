'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

export interface StorefrontTarget {
  name: string;
  path: string;
  description: string;
}

export interface AdminSectionInfoProps {
  title: string;
  purpose: string;
  storefrontImpact: string;
  targets?: StorefrontTarget[];
  className?: string;
}

export function AdminSectionInfo({
  title,
  purpose,
  storefrontImpact,
  targets = [],
  className = '',
}: AdminSectionInfoProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`About ${title}`}
        className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-gold-light,#FDF8ED)] text-[var(--color-gold,#C9A84C)] border border-[var(--color-gold,#C9A84C)]/30 hover:bg-[var(--color-gold,#C9A84C)] hover:text-white transition-all duration-200 shadow-sm"
        title="Explain where changes reflect on the website"
      >
        <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[var(--color-gold,#C9A84C)]/20 group-hover:bg-white/20 text-[10px] font-bold">
          i
        </span>
        <span className="hidden sm:inline">Storefront Guide</span>
      </button>

      {/* Popover Card */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:absolute sm:top-full sm:left-0 sm:translate-x-0 sm:translate-y-2 w-[92vw] sm:w-[440px] max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-[var(--color-whisper,#E5E5E5)] p-5 text-left text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-[var(--color-whisper,#E5E5E5)]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[var(--color-gold-light,#FDF8ED)] text-[var(--color-gold,#C9A84C)] flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-[var(--color-ink,#111111)]">
                      {title}
                    </h3>
                    <p className="text-xs text-[var(--color-slate,#666666)]">Live Website Integration Guide</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-[var(--color-mist,#999999)] hover:text-[var(--color-ink,#111111)] hover:bg-[var(--color-snow,#F9F9F9)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Purpose / Why this exists */}
              <div className="mt-4 space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-[var(--color-slate,#666666)] uppercase tracking-wider mb-1">
                    Why this section exists
                  </h4>
                  <p className="text-xs text-[var(--color-ink,#111111)] leading-relaxed">
                    {purpose}
                  </p>
                </div>

                {/* Where changes reflect */}
                <div>
                  <h4 className="text-xs font-semibold text-[var(--color-slate,#666666)] uppercase tracking-wider mb-1">
                    Where changes reflect on live store
                  </h4>
                  <p className="text-xs text-[var(--color-slate,#666666)] leading-relaxed">
                    {storefrontImpact}
                  </p>
                </div>

                {/* Target Storefront Pages */}
                {targets.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-xs font-semibold text-[var(--color-slate,#666666)] uppercase tracking-wider mb-2">
                      Connected Storefront Pages
                    </h4>
                    <div className="space-y-2">
                      {targets.map((t) => (
                        <div
                          key={t.path}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--color-snow,#F9F9F9)] border border-[var(--color-whisper,#E5E5E5)] hover:border-[var(--color-gold,#C9A84C)]/40 transition-colors"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-medium text-[var(--color-ink,#111111)] flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                              <span className="truncate">{t.name}</span>
                            </p>
                            <p className="text-[11px] text-[var(--color-slate,#666666)] truncate">
                              {t.description}
                            </p>
                          </div>
                          <a
                            href={t.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-medium text-[var(--color-gold,#C9A84C)] hover:underline whitespace-nowrap flex-shrink-0"
                          >
                            <span>View</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Tip */}
              <div className="mt-4 pt-3 border-t border-[var(--color-whisper,#E5E5E5)] text-[11px] text-[var(--color-mist,#999999)] flex items-center justify-between">
                <span>Updates save instantly to Supabase</span>
                <span className="text-[var(--color-gold,#C9A84C)] font-medium">Angelika Fashions</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
