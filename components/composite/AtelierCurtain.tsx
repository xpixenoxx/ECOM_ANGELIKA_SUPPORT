'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

interface AtelierCurtainProps {
  logoUrl?: string;
  brandName?: string;
  brandTagline?: string;
}

type CurtainPhase = 'holding' | 'closing' | 'opening' | 'idle';

interface CurtainTheme {
  id: 'velvet-split' | 'ivory-lift' | 'mulberry-part' | 'champagne-sweep';
  layout: 'split-x' | 'lift-up' | 'split-y';
  surfaceBg: string;
  surfaceGradient: string;
  isDark: boolean;
  staggerMs: number;
}

/**
 * 4 curated couture parting choreographies alternating dark obsidian/mulberry velvet
 * with sunlit silk-ivory/champagne drapes, paired with 6 poetic whispers (12 unique pairings)
 * so every load & page redirection feels unmistakably Angelika without psychological monotony.
 */
const CURTAIN_THEMES: CurtainTheme[] = [
  {
    id: 'velvet-split',
    layout: 'split-x',
    surfaceBg: '#151210',
    surfaceGradient: 'linear-gradient(160deg, #1D1814 0%, #120F0D 55%, #1A1511 100%)',
    isDark: true,
    staggerMs: 0,
  },
  {
    id: 'ivory-lift',
    layout: 'lift-up',
    surfaceBg: '#F2ECE2',
    surfaceGradient: 'linear-gradient(180deg, #F7F2EA 0%, #EFE8DC 60%, #E7DDD0 100%)',
    isDark: false,
    staggerMs: 0,
  },
  {
    id: 'mulberry-part',
    layout: 'split-y',
    surfaceBg: '#221018',
    surfaceGradient: 'linear-gradient(155deg, #2D1420 0%, #1C0D14 55%, #26111A 100%)',
    isDark: true,
    staggerMs: 25,
  },
  {
    id: 'champagne-sweep',
    layout: 'split-x',
    surfaceBg: '#EAE1D3',
    surfaceGradient: 'linear-gradient(145deg, #F3ECE1 0%, #E7DCCB 55%, #DFD2BE 100%)',
    isDark: false,
    staggerMs: 45,
  },
];

const ATELIER_WHISPERS = [
  'Grace in Every Drape',
  'Pure Handloom Heritage',
  'Curated by Vidhya',
  'Artisanal Indian Couture',
  'Woven With Devotion',
  'Timeless Festive Silks',
];

const SILK_EASE = 'cubic-bezier(0.76, 0, 0.24, 1)';
const CLOSE_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';

export function AtelierCurtain({
  logoUrl = '/images/logo.png',
  brandName = 'Angelika',
  brandTagline = 'Fashions',
}: AtelierCurtainProps) {
  const pathname = usePathname() || '/';

  // Start in 'holding' on initial page load so SSR + first paint show the centered Angelika
  // curtain cleanly without a jarring flash, then part gracefully right after hydration.
  const [phase, setPhase] = useState<CurtainPhase>('holding');
  const [themeIndex, setThemeIndex] = useState(0);
  const [whisperIndex, setWhisperIndex] = useState(0);
  const [isRapidNav, setIsRapidNav] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const prevPathnameRef = useRef<string>(pathname);
  const phaseRef = useRef<CurtainPhase>('holding');
  const lastNavTimeRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);

  phaseRef.current = phase;

  const clearAllTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const scheduleTimer = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  };

  // Detect prefers-reduced-motion live
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  // Initial page load grand reveal (also triggers on full reloads & hard redirects)
  useEffect(() => {
    clearAllTimers();
    const holdDuration = reducedMotion ? 90 : 250;
    const openDuration = reducedMotion ? 160 : 480;

    scheduleTimer(() => {
      setPhase('opening');
      scheduleTimer(() => {
        setPhase('idle');
      }, openDuration);
    }, holdDuration);

    return () => clearAllTimers();
    // Only run once on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Intercept internal storefront <a> clicks to close the silk curtain immediately on navigation
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const rawHref = anchor.getAttribute('href');
      if (
        !rawHref ||
        rawHref.startsWith('#') ||
        rawHref.startsWith('mailto:') ||
        rawHref.startsWith('tel:') ||
        rawHref.startsWith('javascript:')
      ) {
        return;
      }

      let nextUrl: URL;
      try {
        nextUrl = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (nextUrl.origin !== window.location.origin) return;
      if (nextUrl.pathname === window.location.pathname) return;
      if (nextUrl.pathname.startsWith('/admin')) return;

      const now = Date.now();
      const rapid = now - lastNavTimeRef.current < 2600;
      lastNavTimeRef.current = now;
      setIsRapidNav(rapid);

      // Advance choreography & whisper independently (12 distinct combinations)
      setThemeIndex((prev) => (prev + 1) % CURTAIN_THEMES.length);
      setWhisperIndex((prev) => (prev + 1) % ATELIER_WHISPERS.length);

      clearAllTimers();
      setPhase('closing');

      // Fail-safe valve: never trap the user if navigation is aborted or slow
      scheduleTimer(() => {
        if (phaseRef.current === 'closing' || phaseRef.current === 'holding') {
          setPhase('opening');
          scheduleTimer(() => setPhase('idle'), reducedMotion ? 160 : 380);
        }
      }, 1500);
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => document.removeEventListener('click', handleDocumentClick, true);
  }, [reducedMotion]);

  // Trigger parting reveal whenever Next.js pathname changes (Link clicks, router.push, Back/Forward)
  useEffect(() => {
    if (prevPathnameRef.current === pathname) return;
    prevPathnameRef.current = pathname;

    clearAllTimers();

    const now = Date.now();
    const wasAlreadyClosing = phaseRef.current === 'closing' || phaseRef.current === 'holding';

    if (!wasAlreadyClosing) {
      // Programmatic redirect (router.push / Back / Forward): advance choreography & show crisp sweep
      const rapid = now - lastNavTimeRef.current < 2600;
      lastNavTimeRef.current = now;
      setIsRapidNav(rapid);
      setThemeIndex((prev) => (prev + 1) % CURTAIN_THEMES.length);
      setWhisperIndex((prev) => (prev + 1) % ATELIER_WHISPERS.length);
      setPhase('holding');
    }

    const holdMs = reducedMotion ? 60 : isRapidNav ? 65 : 115;
    const openMs = reducedMotion ? 150 : isRapidNav ? 300 : 410;

    scheduleTimer(() => {
      setPhase('opening');
      scheduleTimer(() => {
        setPhase('idle');
      }, openMs);
    }, holdMs);

    return () => clearAllTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (phase === 'idle') return null;

  const theme = CURTAIN_THEMES[themeIndex] ?? CURTAIN_THEMES[0]!;
  const whisper = ATELIER_WHISPERS[whisperIndex] ?? ATELIER_WHISPERS[0]!;
  const isOpening = phase === 'opening';
  const isClosing = phase === 'closing';

  const openMs = reducedMotion ? 150 : isRapidNav ? 290 : 420;
  const closeMs = reducedMotion ? 110 : isRapidNav ? 140 : 185;
  const durationMs = isOpening ? openMs : isClosing ? closeMs : 0;
  const easing = isOpening ? SILK_EASE : CLOSE_EASE;

  // Immediate click-through the moment the curtain starts opening so power shoppers feel zero lag
  const pointerClass = isOpening ? 'pointer-events-none' : 'pointer-events-auto';

  // Panel transforms based on active choreography
  const getPanelTransform = (slot: 'primary' | 'secondary') => {
    if (reducedMotion) return 'translate3d(0, 0, 0)';
    if (!isOpening) return 'translate3d(0, 0, 0)';
    if (theme.layout === 'split-x') {
      return slot === 'primary' ? 'translate3d(-102%, 0, 0)' : 'translate3d(102%, 0, 0)';
    }
    if (theme.layout === 'split-y') {
      return slot === 'primary' ? 'translate3d(0, -102%, 0)' : 'translate3d(0, 102%, 0)';
    }
    return 'translate3d(0, -102%, 0)';
  };

  const panelOpacity = reducedMotion && isOpening ? 0 : 1;

  return (
    <div
      aria-hidden="true"
      data-curtain-phase={phase}
      data-curtain-theme={theme.id}
      className={`atelier-curtain-root fixed inset-0 z-[9999] overflow-hidden select-none ${pointerClass}`}
    >
      {/* ── Silk Drape Panels ─────────────────────────────────────────── */}
      {theme.layout === 'split-x' && (
        <>
          <div
            className="atelier-silk-weave absolute inset-y-0 left-0 w-1/2 will-change-transform"
            style={{
              backgroundColor: theme.surfaceBg,
              backgroundImage: theme.surfaceGradient,
              transform: getPanelTransform('primary'),
              opacity: panelOpacity,
              transitionProperty: 'transform, opacity',
              transitionDuration: `${durationMs}ms`,
              transitionTimingFunction: easing,
              transitionDelay: '0ms',
              borderRight: `1px solid ${theme.isDark ? 'rgba(216,180,84,0.45)' : 'rgba(168,131,38,0.42)'}`,
            }}
          />
          <div
            className="atelier-silk-weave absolute inset-y-0 right-0 w-1/2 will-change-transform"
            style={{
              backgroundColor: theme.surfaceBg,
              backgroundImage: theme.surfaceGradient,
              transform: getPanelTransform('secondary'),
              opacity: panelOpacity,
              transitionProperty: 'transform, opacity',
              transitionDuration: `${durationMs}ms`,
              transitionTimingFunction: easing,
              transitionDelay: isOpening ? `${theme.staggerMs}ms` : '0ms',
              borderLeft: `1px solid ${theme.isDark ? 'rgba(216,180,84,0.45)' : 'rgba(168,131,38,0.42)'}`,
            }}
          />
        </>
      )}

      {theme.layout === 'split-y' && (
        <>
          <div
            className="atelier-silk-weave absolute inset-x-0 top-0 h-1/2 will-change-transform"
            style={{
              backgroundColor: theme.surfaceBg,
              backgroundImage: theme.surfaceGradient,
              transform: getPanelTransform('primary'),
              opacity: panelOpacity,
              transitionProperty: 'transform, opacity',
              transitionDuration: `${durationMs}ms`,
              transitionTimingFunction: easing,
              borderBottom: '1px solid rgba(216,180,84,0.45)',
            }}
          />
          <div
            className="atelier-silk-weave absolute inset-x-0 bottom-0 h-1/2 will-change-transform"
            style={{
              backgroundColor: theme.surfaceBg,
              backgroundImage: theme.surfaceGradient,
              transform: getPanelTransform('secondary'),
              opacity: panelOpacity,
              transitionProperty: 'transform, opacity',
              transitionDuration: `${durationMs}ms`,
              transitionTimingFunction: easing,
              transitionDelay: isOpening ? `${theme.staggerMs}ms` : '0ms',
              borderTop: '1px solid rgba(216,180,84,0.45)',
            }}
          />
        </>
      )}

      {theme.layout === 'lift-up' && (
        <div
          className="atelier-silk-weave absolute inset-0 will-change-transform"
          style={{
            backgroundColor: theme.surfaceBg,
            backgroundImage: theme.surfaceGradient,
            transform: getPanelTransform('primary'),
            opacity: panelOpacity,
            transitionProperty: 'transform, opacity',
            transitionDuration: `${durationMs}ms`,
            transitionTimingFunction: easing,
            borderBottom: '2px solid rgba(201,168,76,0.7)',
            boxShadow: '0 24px 60px rgba(22,19,16,0.18)',
          }}
        />
      )}

      {/* ── Centered Angelika Couture Logo Medallion ──────────────────── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 will-change-transform"
        style={{
          opacity: isOpening ? 0 : 1,
          transform: isOpening
            ? 'translate3d(0, -10px, 0) scale(0.95)'
            : 'translate3d(0, 0, 0) scale(1)',
          transitionProperty: 'opacity, transform',
          transitionDuration: `${isOpening ? Math.round(openMs * 0.55) : Math.round(closeMs * 0.85)}ms`,
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Outer Antique-Gold Filigree Halo + Circular Silk Crest */}
        <div className="relative flex items-center justify-center">
          <div
            className="absolute -inset-2.5 rounded-full border"
            style={{
              borderColor: theme.isDark
                ? 'rgba(229, 197, 107, 0.32)'
                : 'rgba(168, 131, 38, 0.28)',
            }}
          />
          <div
            className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden bg-[#F2EBE1] p-1.5 shadow-[0_14px_38px_rgba(0,0,0,0.22)] ring-1"
            style={{
              boxShadow: theme.isDark
                ? '0 14px 44px rgba(0,0,0,0.45), 0 0 0 1px rgba(229,197,107,0.65)'
                : '0 14px 36px rgba(34,16,24,0.12), 0 0 0 1px rgba(178,139,45,0.55)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt=""
              width={112}
              height={112}
              decoding="sync"
              fetchPriority="high"
              className="h-full w-full rounded-full object-cover object-top scale-[1.08]"
            />
          </div>
        </div>

        {/* Crisp Brand Wordmark */}
        <div className="mt-4 flex flex-col items-center text-center">
          <span
            className="font-display text-xl sm:text-2xl font-semibold uppercase tracking-[0.26em] leading-none"
            style={{ color: theme.isDark ? '#FAF6F0' : '#1A1411' }}
          >
            {brandName}
          </span>
          <span
            className="mt-1 text-[10px] font-semibold uppercase tracking-[0.34em]"
            style={{ color: theme.isDark ? '#E5C56B' : '#8C6D1F' }}
          >
            {brandTagline}
          </span>

          {/* Illuminated Zari Hairline Rule */}
          <div
            className="mt-3 h-[1px] w-16"
            style={{
              background: theme.isDark
                ? 'linear-gradient(90deg, transparent, #E5C56B, transparent)'
                : 'linear-gradient(90deg, transparent, #B68E2E, transparent)',
            }}
          />

          {/* Rotating Micro-Whisper for Subtle Psychological Novelty */}
          <p
            className="mt-2.5 text-[11px] font-medium uppercase tracking-[0.2em]"
            style={{
              color: theme.isDark ? '#CEC5B9' : '#6A5F54',
            }}
          >
            {whisper}
          </p>
        </div>
      </div>
    </div>
  );
}
