'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

interface AtelierCurtainProps {
  logoUrl?: string;
  brandName?: string;
  brandTagline?: string;
}

type CurtainPhase = 'holding' | 'closing' | 'opening' | 'idle';

interface SilkPalette {
  id: 'obsidian-silk' | 'champagne-tissue' | 'mulberry-velvet' | 'sandstone-kanjivaram';
  isDark: boolean;
  /** 5 tonal stops sculpting 9 asymmetric 3D vertical silk drapery pleats */
  deepValley: string;
  shadowSlope: string;
  satinBody: string;
  ridgeHighlight: string;
  specularCrest: string;
  /** Translucent trailing Chanderi organza veil colors */
  organzaTop: string;
  organzaMid: string;
  organzaEdge: string;
  /** Curled silk fold rim-highlight & underside depth right along the leading hem */
  foldRimLight: string;
  foldCreaseShadow: string;
  /** Woven antique-gold Zari selvedge border colors */
  zariPrimary: string;
  zariSecondary: string;
  zariGlow: string;
  /** Soft shadow cast by the silk drape onto the storefront beneath */
  castShadow: string;
  /** Subtle ambient salon glow behind centered crest */
  spotlightColor: string;
  wordmarkColor: string;
  taglineColor: string;
  whisperColor: string;
  weaveTint: string;
  swayRibbonLight: string;
}

/**
 * 4 curated haute-couture silk drapery palettes sculpted with 3D vertical pleats,
 * feathered curved satin highlights, sheer Chanderi organza under-veil, and antique-gold Zari borders.
 */
const SILK_PALETTES: SilkPalette[] = [
  {
    id: 'obsidian-silk',
    isDark: true,
    deepValley: '#0B0807',
    shadowSlope: '#15100D',
    satinBody: '#241B15',
    ridgeHighlight: '#3B2C21',
    specularCrest: '#4E3B2B',
    organzaTop: 'rgba(30, 21, 15, 0.54)',
    organzaMid: 'rgba(186, 148, 74, 0.25)',
    organzaEdge: 'rgba(236, 204, 122, 0.48)',
    foldRimLight: 'rgba(252, 232, 178, 0.34)',
    foldCreaseShadow: 'rgba(5, 3, 2, 0.56)',
    zariPrimary: '#E6C56B',
    zariSecondary: 'rgba(198, 154, 58, 0.74)',
    zariGlow: 'rgba(248, 226, 158, 0.46)',
    castShadow: 'rgba(8, 5, 4, 0.46)',
    spotlightColor: 'rgba(229, 196, 106, 0.14)',
    wordmarkColor: '#FAF6F0',
    taglineColor: '#E5C56B',
    whisperColor: '#D5CBBF',
    weaveTint: 'rgba(229, 196, 106, 0.14)',
    swayRibbonLight: 'rgba(246, 222, 162, 0.09)',
  },
  {
    id: 'champagne-tissue',
    isDark: false,
    deepValley: '#CCBDA8',
    shadowSlope: '#DDD0BC',
    satinBody: '#EFE5D6',
    ridgeHighlight: '#FAF5EC',
    specularCrest: '#FFFDF8',
    organzaTop: 'rgba(244, 235, 222, 0.62)',
    organzaMid: 'rgba(214, 182, 122, 0.28)',
    organzaEdge: 'rgba(184, 144, 56, 0.46)',
    foldRimLight: 'rgba(255, 253, 248, 0.85)',
    foldCreaseShadow: 'rgba(116, 92, 62, 0.28)',
    zariPrimary: '#B88F30',
    zariSecondary: 'rgba(154, 114, 34, 0.68)',
    zariGlow: 'rgba(255, 250, 236, 0.78)',
    castShadow: 'rgba(38, 28, 18, 0.24)',
    spotlightColor: 'rgba(255, 252, 245, 0.62)',
    wordmarkColor: '#1B1511',
    taglineColor: '#8B6A1D',
    whisperColor: '#665A4E',
    weaveTint: 'rgba(148, 112, 42, 0.12)',
    swayRibbonLight: 'rgba(255, 253, 248, 0.24)',
  },
  {
    id: 'mulberry-velvet',
    isDark: true,
    deepValley: '#14060D',
    shadowSlope: '#220B16',
    satinBody: '#341322',
    ridgeHighlight: '#4E1F34',
    specularCrest: '#652A44',
    organzaTop: 'rgba(46, 16, 30, 0.54)',
    organzaMid: 'rgba(218, 168, 148, 0.24)',
    organzaEdge: 'rgba(238, 202, 124, 0.46)',
    foldRimLight: 'rgba(252, 222, 188, 0.30)',
    foldCreaseShadow: 'rgba(10, 2, 6, 0.56)',
    zariPrimary: '#E8C872',
    zariSecondary: 'rgba(196, 148, 72, 0.72)',
    zariGlow: 'rgba(248, 224, 162, 0.44)',
    castShadow: 'rgba(16, 4, 10, 0.46)',
    spotlightColor: 'rgba(232, 194, 132, 0.14)',
    wordmarkColor: '#FDF8F4',
    taglineColor: '#ECCB79',
    whisperColor: '#DEC9CE',
    weaveTint: 'rgba(232, 200, 114, 0.13)',
    swayRibbonLight: 'rgba(246, 206, 186, 0.09)',
  },
  {
    id: 'sandstone-kanjivaram',
    isDark: false,
    deepValley: '#C6B09D',
    shadowSlope: '#D8C4B2',
    satinBody: '#E9DCD0',
    ridgeHighlight: '#F6EEE6',
    specularCrest: '#FDF8F3',
    organzaTop: 'rgba(238, 226, 214, 0.60)',
    organzaMid: 'rgba(204, 158, 128, 0.26)',
    organzaEdge: 'rgba(176, 134, 56, 0.44)',
    foldRimLight: 'rgba(255, 250, 244, 0.80)',
    foldCreaseShadow: 'rgba(112, 82, 60, 0.26)',
    zariPrimary: '#AE832B',
    zariSecondary: 'rgba(156, 114, 46, 0.66)',
    zariGlow: 'rgba(255, 248, 238, 0.74)',
    castShadow: 'rgba(42, 28, 20, 0.24)',
    spotlightColor: 'rgba(255, 250, 244, 0.58)',
    wordmarkColor: '#1E1612',
    taglineColor: '#88651E',
    whisperColor: '#69594E',
    weaveTint: 'rgba(154, 114, 54, 0.12)',
    swayRibbonLight: 'rgba(255, 250, 244, 0.22)',
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

/**
 * Asymmetric 9-fold vertical silk drapery map (0%..100%).
 * Real hand-draped couture silk gathers tighter near the outer edges and falls into fuller
 * sculptural pleats through the center, catching warm specular crests & deep shadow valleys.
 */
function buildPleatStops(p: SilkPalette): Array<{ offset: string; color: string }> {
  return [
    { offset: '0%', color: p.deepValley },
    { offset: '3.2%', color: p.satinBody },
    { offset: '5.8%', color: p.ridgeHighlight },
    { offset: '9.4%', color: p.shadowSlope },
    { offset: '12.2%', color: p.deepValley },
    { offset: '16.5%', color: p.satinBody },
    { offset: '20.2%', color: p.specularCrest },
    { offset: '24.6%', color: p.satinBody },
    { offset: '27.8%', color: p.deepValley },
    { offset: '32.8%', color: p.shadowSlope },
    { offset: '37.4%', color: p.ridgeHighlight },
    { offset: '41.8%', color: p.satinBody },
    { offset: '45.2%', color: p.deepValley },
    { offset: '50.2%', color: p.specularCrest },
    { offset: '55.6%', color: p.satinBody },
    { offset: '59.0%', color: p.deepValley },
    { offset: '63.6%', color: p.shadowSlope },
    { offset: '68.2%', color: p.ridgeHighlight },
    { offset: '72.4%', color: p.satinBody },
    { offset: '75.8%', color: p.deepValley },
    { offset: '80.5%', color: p.satinBody },
    { offset: '84.4%', color: p.specularCrest },
    { offset: '88.6%', color: p.shadowSlope },
    { offset: '91.8%', color: p.deepValley },
    { offset: '95.6%', color: p.ridgeHighlight },
    { offset: '100%', color: p.deepValley },
  ];
}

interface Point2D {
  x: number;
  y: number;
}

const VIEW_W = 1000;
const WAVE_SEGMENTS = 10;

function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function safeWaveEnvelope(t: number, power: number): number {
  const s = Math.sin(clamp01(t) * Math.PI);
  return s <= 0 ? 0 : Math.pow(s, power);
}

/** Heavy mulberry silk release curve: fluid natural glide with velvet deceleration */
function easeSilkRelease(t: number): number {
  const c = clamp01(t);
  return c < 0.5
    ? 4 * c * c * c
    : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

/** Weighted silk gravity drop curve: crisp top release with cushioned hem settle */
function easeSilkDrop(t: number): number {
  const c = clamp01(t);
  return 1 - Math.pow(1 - c, 3.2);
}

/**
 * Computes 11 organic wave points across x ∈ [0, 1000] simulating a living silk veil edge:
 * combines catenary gravity belly, asymmetric couture drape bias, and two traveling cloth harmonics.
 */
function computeSilkEdgePoints(
  baseY: number,
  envelope: number,
  timeSec: number,
  direction: 'opening' | 'closing',
  amplitudeScale = 1,
  phaseOffset = 0
): Point2D[] {
  const pts: Point2D[] = [];
  const sign = direction === 'closing' ? 1 : -1;
  const safeEnv = Number.isFinite(envelope) ? Math.max(0, envelope) : 0;
  const safeTime = Number.isFinite(timeSec) ? Math.max(0, timeSec) : 0;

  for (let i = 0; i <= WAVE_SEGMENTS; i++) {
    const u = i / WAVE_SEGMENTS;
    const x = u * VIEW_W;

    // 1. Natural catenary arch (center hangs/flows organically ahead of selvedges)
    const catenary =
      Math.sin(u * Math.PI) * 76 * safeEnv * amplitudeScale * sign;

    // 2. Subtle diagonal couture pallu drape bias across the width
    const drapeBias =
      Math.sin(u * Math.PI * 1.35 - 0.35) * 34 * safeEnv * amplitudeScale;

    // 3. Broad traveling silk billow wave
    const primaryRipple =
      Math.sin(u * Math.PI * 3.1 - safeTime * 5.4 + phaseOffset) *
      25 *
      safeEnv *
      amplitudeScale;

    // 4. Delicate fine hem flutter along individual pleats
    const fineFlutter =
      Math.sin(u * Math.PI * 7.2 + safeTime * 8.6 + phaseOffset * 1.7) *
      10 *
      safeEnv *
      amplitudeScale;

    const y = baseY + catenary + drapeBias + primaryRipple + fineFlutter;
    pts.push({ x, y });
  }

  return pts;
}

/** C1-continuous Catmull-Rom cubic Bezier SVG path builder */
function pointsToSmoothCurve(pts: Point2D[], startCmd = true): string {
  if (pts.length < 2) return '';
  const first = pts[0]!;
  let d = startCmd ? `M ${first.x.toFixed(1)} ${first.y.toFixed(1)}` : '';

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[Math.min(pts.length - 1, i + 2)]!;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}

function offsetPointsY(pts: Point2D[], dy: number): Point2D[] {
  return pts.map((pt) => ({ x: pt.x, y: pt.y + dy }));
}

function buildClosedVeilPath(pts: Point2D[], fillTo: 'top' | 'bottom'): string {
  const curve = pointsToSmoothCurve(pts, true);
  if (fillTo === 'top') {
    return `${curve} L ${VIEW_W} -80 L 0 -80 Z`;
  }
  return `${curve} L ${VIEW_W} 1120 L 0 1120 Z`;
}

const FULL_COVER_PATH = 'M 0 -40 L 1000 -40 L 1000 1080 L 0 1080 Z';
const EMPTY_PATH = 'M 0 -200 L 1000 -200 L 1000 -200 L 0 -200 Z';

export function AtelierCurtain({
  logoUrl = '/images/logo.png',
  brandName = 'Angelika',
  brandTagline = 'Fashions',
}: AtelierCurtainProps) {
  const pathname = usePathname() || '/';
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');

  const [phase, setPhase] = useState<CurtainPhase>('holding');
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [whisperIndex, setWhisperIndex] = useState(0);
  const [isRapidNav, setIsRapidNav] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const prevPathnameRef = useRef<string>(pathname);
  const phaseRef = useRef<CurtainPhase>('holding');
  const lastNavTimeRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const pendingOpenRef = useRef<boolean>(false);

  // Direct DOM refs for 60/120fps zero-react-rerender cloth physics
  const shadowContourRef = useRef<SVGPathElement | null>(null);
  const organzaPathRef = useRef<SVGPathElement | null>(null);
  const silkClipPathRef = useRef<SVGPathElement | null>(null);
  const primarySilkPathRef = useRef<SVGPathElement | null>(null);
  const foldRimStrokeRef = useRef<SVGPathElement | null>(null);
  const foldCreaseStrokeRef = useRef<SVGPathElement | null>(null);
  const zariPrimaryPathRef = useRef<SVGPathElement | null>(null);
  const zariSecondaryPathRef = useRef<SVGPathElement | null>(null);
  const zariGlowPathRef = useRef<SVGPathElement | null>(null);
  const pleatGradRef = useRef<SVGLinearGradientElement | null>(null);
  const sheenGradRef = useRef<SVGLinearGradientElement | null>(null);
  const swayGroupRef = useRef<SVGGElement | null>(null);
  const spotlightRectRef = useRef<SVGRectElement | null>(null);
  const crestRef = useRef<HTMLDivElement | null>(null);

  phaseRef.current = phase;

  const clearAllTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const stopRaf = () => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const scheduleTimer = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  };

  const applyFullDrapeState = (shimmerOffset = 0, swayX = 0) => {
    shadowContourRef.current?.setAttribute('d', '');
    organzaPathRef.current?.setAttribute('d', EMPTY_PATH);
    silkClipPathRef.current?.setAttribute('d', FULL_COVER_PATH);
    primarySilkPathRef.current?.setAttribute('d', FULL_COVER_PATH);
    foldRimStrokeRef.current?.setAttribute('d', '');
    foldCreaseStrokeRef.current?.setAttribute('d', '');
    zariPrimaryPathRef.current?.setAttribute('d', '');
    zariSecondaryPathRef.current?.setAttribute('d', '');
    zariGlowPathRef.current?.setAttribute('d', '');
    pleatGradRef.current?.setAttribute('gradientTransform', `translate(${shimmerOffset.toFixed(4)} 0)`);
    swayGroupRef.current?.setAttribute('transform', `translate(${swayX.toFixed(2)} 0)`);
    if (spotlightRectRef.current) spotlightRectRef.current.style.opacity = '1';
    if (crestRef.current) {
      crestRef.current.style.opacity = '1';
      crestRef.current.style.transform = 'translate3d(0, 0, 0) scale(1)';
    }
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

  // Initial page load grand top-to-bottom silk reveal
  useEffect(() => {
    clearAllTimers();
    const mqReduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const holdDuration = mqReduce ? 90 : 240;

    scheduleTimer(() => {
      setPhase('opening');
    }, holdDuration);

    return () => {
      clearAllTimers();
      stopRaf();
    };
    // Run once on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Intercept internal storefront <a> clicks to drop the pleated silk veil top-to-bottom immediately
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

      // Advance silk palette & whisper independently for 12 distinct couture pairings
      setPaletteIndex((prev) => (prev + 1) % SILK_PALETTES.length);
      setWhisperIndex((prev) => (prev + 1) % ATELIER_WHISPERS.length);

      pendingOpenRef.current = false;
      clearAllTimers();
      setPhase('closing');

      // Fail-safe valve: never trap the shopper if navigation stalls or aborts
      scheduleTimer(() => {
        if (phaseRef.current === 'closing' || phaseRef.current === 'holding') {
          setPhase('opening');
        }
      }, 1450);
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => document.removeEventListener('click', handleDocumentClick, true);
  }, []);

  // Trigger smooth top-to-bottom silk unveil whenever Next.js pathname changes
  useEffect(() => {
    if (prevPathnameRef.current === pathname) return;
    prevPathnameRef.current = pathname;

    clearAllTimers();

    const now = Date.now();
    const currentPhase = phaseRef.current;

    if (currentPhase === 'closing') {
      pendingOpenRef.current = true;
      return;
    }

    if (currentPhase === 'idle' || currentPhase === 'opening') {
      const rapid = now - lastNavTimeRef.current < 2600;
      lastNavTimeRef.current = now;
      setIsRapidNav(rapid);
      setPaletteIndex((prev) => (prev + 1) % SILK_PALETTES.length);
      setWhisperIndex((prev) => (prev + 1) % ATELIER_WHISPERS.length);
      setPhase('holding');
    }

    const holdMs = reducedMotion ? 60 : isRapidNav ? 70 : 115;
    scheduleTimer(() => {
      setPhase('opening');
    }, holdMs);

    return () => clearAllTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ── 60/120fps Real-Time Organic Top-to-Bottom Silk Drapery Physics Loop ──
  useEffect(() => {
    stopRaf();
    if (phase === 'idle') return;

    // Under prefers-reduced-motion: no spatial wave animation; gentle opacity cross-fade only
    if (reducedMotion) {
      applyFullDrapeState(0, 0);
      if (phase === 'opening') {
        scheduleTimer(() => setPhase('idle'), 190);
      } else if (phase === 'closing') {
        scheduleTimer(() => {
          if (pendingOpenRef.current) {
            pendingOpenRef.current = false;
            setPhase('opening');
          } else {
            setPhase('holding');
          }
        }, 120);
      }
      return;
    }

    // Gentle living candlelight satin drift while resting in 'holding'
    if (phase === 'holding') {
      let startTime: number | null = null;
      const tickHold = (now: number) => {
        if (startTime === null) startTime = now;
        const elapsedSec = Math.max(0, (now - startTime) / 1000);
        const drift = Math.sin(elapsedSec * 1.8) * 0.012;
        const swayX = Math.sin(elapsedSec * 1.4) * 6;
        applyFullDrapeState(drift, swayX);
        rafRef.current = window.requestAnimationFrame(tickHold);
      };
      rafRef.current = window.requestAnimationFrame(tickHold);
      return () => stopRaf();
    }

    // Closing: Heavy pleated silk cascades naturally from TOP -> BOTTOM
    if (phase === 'closing') {
      const durationMs = isRapidNav ? 280 : 380;
      let startTime: number | null = null;

      const tickClose = (now: number) => {
        if (startTime === null) startTime = now;
        const elapsedMs = Math.max(0, now - startTime);
        const rawT = clamp01(elapsedMs / durationMs);
        const eased = easeSilkDrop(rawT);
        const elapsedSec = elapsedMs / 1000;

        // Sweeps from y = -120 above top edge down past y = 1080
        const baseY = -120 + eased * 1200;
        const env = safeWaveEnvelope(rawT, 0.78);

        const primaryPts = computeSilkEdgePoints(baseY, env, elapsedSec, 'closing', 0.94, 0.4);
        const silkPath = buildClosedVeilPath(primaryPts, 'top');

        // Evenly contoured soft cast shadow floating just below the descending zari hem
        const shadowCurve = pointsToSmoothCurve(offsetPointsY(primaryPts, 18), true);

        // Evenly contoured 3D curled silk rim highlight + fold crease hugging just above the hem
        const foldRimCurve = pointsToSmoothCurve(offsetPointsY(primaryPts, -6), true);
        const foldCreaseCurve = pointsToSmoothCurve(offsetPointsY(primaryPts, -20), true);

        // Leading sheer organza tip billowing gracefully ahead of the heavy silk
        const organzaPts = computeSilkEdgePoints(
          baseY + 58 * env,
          env * 1.15,
          elapsedSec,
          'closing',
          1.14,
          1.1
        );
        const organzaPath = buildClosedVeilPath(organzaPts, 'top');

        // Double antique-gold Zari selvedge border tracing the exact curved hem
        const zariMain = pointsToSmoothCurve(primaryPts, true);
        const zariInner = pointsToSmoothCurve(offsetPointsY(primaryPts, -11), true);
        const zariGlow = pointsToSmoothCurve(offsetPointsY(primaryPts, -4), true);

        shadowContourRef.current?.setAttribute('d', shadowCurve);
        organzaPathRef.current?.setAttribute('d', organzaPath);
        silkClipPathRef.current?.setAttribute('d', silkPath);
        primarySilkPathRef.current?.setAttribute('d', silkPath);
        foldRimStrokeRef.current?.setAttribute('d', foldRimCurve);
        foldCreaseStrokeRef.current?.setAttribute('d', foldCreaseCurve);
        zariPrimaryPathRef.current?.setAttribute('d', zariMain);
        zariSecondaryPathRef.current?.setAttribute('d', zariInner);
        zariGlowPathRef.current?.setAttribute('d', zariGlow);

        // Specular light & continuous fold sway that returns smoothly to 0 at rawT = 1 (zero snap)
        const pleatShift = Math.sin(rawT * Math.PI) * 0.02;
        const swayX = Math.sin(rawT * Math.PI) * 14 * env;
        pleatGradRef.current?.setAttribute('gradientTransform', `translate(${pleatShift.toFixed(4)} 0)`);
        sheenGradRef.current?.setAttribute(
          'gradientTransform',
          `translate(0 ${((eased - 0.5) * 0.3).toFixed(4)})`
        );
        swayGroupRef.current?.setAttribute('transform', `translate(${swayX.toFixed(2)} 0)`);

        // Bloom centered crest smoothly ONLY after falling silk crosses center (~38%..86%)
        const crestProgress = clamp01((rawT - 0.38) / 0.48);
        const crestEased = easeSilkDrop(crestProgress);
        if (spotlightRectRef.current) {
          spotlightRectRef.current.style.opacity = crestEased.toFixed(3);
        }
        if (crestRef.current) {
          const offsetY = (1 - crestEased) * -14;
          const scale = 0.955 + crestEased * 0.045;
          crestRef.current.style.opacity = crestEased.toFixed(3);
          crestRef.current.style.transform = `translate3d(0, ${offsetY.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        }

        if (rawT < 1) {
          rafRef.current = window.requestAnimationFrame(tickClose);
        } else {
          applyFullDrapeState(0, 0);
          if (pendingOpenRef.current) {
            pendingOpenRef.current = false;
            scheduleTimer(() => setPhase('opening'), isRapidNav ? 45 : 85);
          } else {
            setPhase('holding');
          }
        }
      };

      rafRef.current = window.requestAnimationFrame(tickClose);
      return () => stopRaf();
    }

    // Opening: Living Top -> Bottom Silk Cascade Unveiling the Page (Header -> Hero -> Full View)
    if (phase === 'opening') {
      const primaryDurationMs = isRapidNav ? 520 : 740;
      const organzaLagMs = isRapidNav ? 90 : 130;
      const totalDurationMs = primaryDurationMs + organzaLagMs;
      let startTime: number | null = null;

      const tickOpen = (now: number) => {
        if (startTime === null) startTime = now;
        const elapsedMs = Math.max(0, now - startTime);
        const elapsedSec = elapsedMs / 1000;

        const rawPrimary = clamp01(elapsedMs / primaryDurationMs);
        const easedPrimary = easeSilkRelease(rawPrimary);

        // Primary heavy silk releases from top (-40) and cascades smoothly past bottom (1140)
        const primaryBaseY = -40 + easedPrimary * 1180;
        const primaryEnv = safeWaveEnvelope(rawPrimary, 0.72);

        const primaryPts = computeSilkEdgePoints(
          primaryBaseY,
          primaryEnv,
          elapsedSec,
          'opening',
          1.06,
          0.0
        );
        const primarySilkPath =
          rawPrimary >= 1 ? EMPTY_PATH : buildClosedVeilPath(primaryPts, 'bottom');

        // Trailing gossamer Chanderi organza veil lags gracefully behind the heavy silk
        const rawOrganza = clamp01(
          (elapsedMs - organzaLagMs * 0.55) / (primaryDurationMs + organzaLagMs * 0.45)
        );
        const easedOrganza = easeSilkRelease(rawOrganza);
        const organzaBaseY = -55 + easedOrganza * 1210;
        const organzaEnv = safeWaveEnvelope(rawOrganza, 0.72);

        const organzaPts = computeSilkEdgePoints(
          organzaBaseY,
          organzaEnv,
          elapsedSec,
          'opening',
          1.28,
          1.35
        );
        const organzaPath =
          rawOrganza >= 1 ? EMPTY_PATH : buildClosedVeilPath(organzaPts, 'bottom');

        // Evenly contoured soft cast shadow riding just above the curling top fold
        const shadowCurve =
          rawPrimary >= 1 ? '' : pointsToSmoothCurve(offsetPointsY(primaryPts, -18), true);

        // Evenly contoured 3D curled silk fold rim highlight + underside crease hugging the top hem
        const foldRimCurve =
          rawPrimary >= 1 ? '' : pointsToSmoothCurve(offsetPointsY(primaryPts, 6), true);
        const foldCreaseCurve =
          rawPrimary >= 1 ? '' : pointsToSmoothCurve(offsetPointsY(primaryPts, 20), true);

        // Double antique-gold Zari selvedge border tracing the exact live undulating crest
        const zariMain = rawPrimary >= 1 ? '' : pointsToSmoothCurve(primaryPts, true);
        const zariInner =
          rawPrimary >= 1 ? '' : pointsToSmoothCurve(offsetPointsY(primaryPts, 11), true);
        const zariGlow =
          rawPrimary >= 1 ? '' : pointsToSmoothCurve(offsetPointsY(primaryPts, 4), true);

        shadowContourRef.current?.setAttribute('d', shadowCurve);
        organzaPathRef.current?.setAttribute('d', organzaPath);
        silkClipPathRef.current?.setAttribute('d', primarySilkPath);
        primarySilkPathRef.current?.setAttribute('d', primarySilkPath);
        foldRimStrokeRef.current?.setAttribute('d', foldRimCurve);
        foldCreaseStrokeRef.current?.setAttribute('d', foldCreaseCurve);
        zariPrimaryPathRef.current?.setAttribute('d', zariMain);
        zariSecondaryPathRef.current?.setAttribute('d', zariInner);
        zariGlowPathRef.current?.setAttribute('d', zariGlow);

        // Specular satin highlight & curved fold sway glide naturally as silk descends
        const pleatShift = Math.sin(rawPrimary * Math.PI * 1.5) * 0.024;
        const swayX = Math.sin(rawPrimary * Math.PI) * 18 * primaryEnv;
        pleatGradRef.current?.setAttribute('gradientTransform', `translate(${pleatShift.toFixed(4)} 0)`);
        sheenGradRef.current?.setAttribute(
          'gradientTransform',
          `translate(0 ${(easedPrimary * 0.36).toFixed(4)})`
        );
        swayGroupRef.current?.setAttribute('transform', `translate(${swayX.toFixed(2)} 0)`);

        // Lift & feather out centered crest cleanly just ahead of the descending silk edge
        const exitT = clamp01(rawPrimary / 0.38);
        const exitOpacity = Math.max(0, 1 - easeSilkRelease(exitT));
        if (spotlightRectRef.current) {
          spotlightRectRef.current.style.opacity = exitOpacity.toFixed(3);
        }
        if (crestRef.current) {
          const liftY = -18 * easeSilkRelease(exitT);
          const scale = 1 - 0.045 * easeSilkRelease(exitT);
          crestRef.current.style.opacity = exitOpacity.toFixed(3);
          crestRef.current.style.transform = `translate3d(0, ${liftY.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        }

        if (elapsedMs < totalDurationMs) {
          rafRef.current = window.requestAnimationFrame(tickOpen);
        } else {
          setPhase('idle');
        }
      };

      rafRef.current = window.requestAnimationFrame(tickOpen);
      return () => stopRaf();
    }
  }, [phase, isRapidNav, reducedMotion]);

  if (phase === 'idle') return null;

  const palette = SILK_PALETTES[paletteIndex] ?? SILK_PALETTES[0]!;
  const whisper = ATELIER_WHISPERS[whisperIndex] ?? ATELIER_WHISPERS[0]!;
  const pleatStops = buildPleatStops(palette);

  const isOpening = phase === 'opening';
  const isClosing = phase === 'closing';
  const initialSilkPath = isClosing ? EMPTY_PATH : FULL_COVER_PATH;

  // Immediate click-through the moment unveiling starts so shoppers never feel blocked
  const pointerClass = isOpening ? 'pointer-events-none' : 'pointer-events-auto';

  const pleatGradId = `atelier-pleats-${uid}`;
  const sheenGradId = `atelier-sheen-${uid}`;
  const organzaGradId = `atelier-organza-${uid}`;
  const weavePatternId = `atelier-weave-${uid}`;
  const spotlightGradId = `atelier-spot-${uid}`;
  const silkClipId = `atelier-clip-${uid}`;
  const ribbonBlurId = `atelier-ribbon-blur-${uid}`;
  const shadowBlurId = `atelier-shadow-blur-${uid}`;
  const foldBlurId = `atelier-fold-blur-${uid}`;

  return (
    <div
      aria-hidden="true"
      data-curtain-phase={phase}
      data-curtain-theme={palette.id}
      className={`atelier-curtain-root fixed inset-0 z-[9999] overflow-hidden select-none ${pointerClass}`}
      style={
        reducedMotion
          ? {
              opacity: isOpening ? 0 : 1,
              transition: 'opacity 180ms ease-out',
            }
          : undefined
      }
    >
      {/* ── Real-Time Sculpted 3D Pleated Silk & Sheer Organza Drapery Stage ── */}
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        className="absolute inset-0 block h-full w-full"
        aria-hidden="true"
      >
        <defs>
          {/* Dynamic Clip Path Matching Live Curved Silk Contour */}
          <clipPath id={silkClipId}>
            <path ref={silkClipPathRef} d={initialSilkPath} />
          </clipPath>

          {/* Soft Feathered Filters for Natural Satin Sheen, Cast Shadow & Curled Silk Rim */}
          <filter id={ribbonBlurId} x="-15%" y="-10%" width="130%" height="120%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <filter id={shadowBlurId} x="-10%" y="-25%" width="120%" height="150%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <filter id={foldBlurId} x="-10%" y="-25%" width="120%" height="150%">
            <feGaussianBlur stdDeviation="7" />
          </filter>

          {/* 9-Fold Asymmetric 3D Volumetric Silk Pleats (reflect prevents edge clamping during sheen shift) */}
          <linearGradient
            ref={pleatGradRef}
            id={pleatGradId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
            spreadMethod="reflect"
          >
            {pleatStops.map((stop, idx) => (
              <stop key={`${stop.offset}-${idx}`} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>

          {/* Traveling Diagonal Satin Specular Light & Depth Shading */}
          <linearGradient
            ref={sheenGradRef}
            id={sheenGradId}
            x1="12%"
            y1="0%"
            x2="88%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor={palette.isDark ? '#FFF4D4' : '#FFFFFF'}
              stopOpacity={palette.isDark ? '0.10' : '0.32'}
            />
            <stop
              offset="34%"
              stopColor={palette.isDark ? '#E6C26D' : '#F4E4C8'}
              stopOpacity={palette.isDark ? '0.045' : '0.08'}
            />
            <stop
              offset="66%"
              stopColor={palette.isDark ? '#000000' : '#8A6B48'}
              stopOpacity={palette.isDark ? '0.16' : '0.10'}
            />
            <stop
              offset="100%"
              stopColor={palette.isDark ? '#000000' : '#6B4F34'}
              stopOpacity={palette.isDark ? '0.32' : '0.16'}
            />
          </linearGradient>

          {/* Soft Warm Salon Spotlight Behind Crest */}
          <radialGradient id={spotlightGradId} cx="50%" cy="48%" r="48%">
            <stop offset="0%" stopColor={palette.spotlightColor} stopOpacity="1" />
            <stop offset="100%" stopColor={palette.spotlightColor} stopOpacity="0" />
          </radialGradient>

          {/* Trailing Sheer Chanderi Organza Under-Veil Gradient (oriented toward active hem) */}
          <linearGradient
            id={organzaGradId}
            x1="0%"
            y1={isClosing ? '100%' : '0%'}
            x2="0%"
            y2={isClosing ? '0%' : '100%'}
          >
            <stop offset="0%" stopColor={palette.organzaEdge} />
            <stop offset="28%" stopColor={palette.organzaMid} />
            <stop offset="100%" stopColor={palette.organzaTop} />
          </linearGradient>

          {/* Fine Handwoven Mulberry Silk Cross-Slub Micro-Weave Pattern */}
          <pattern
            id={weavePatternId}
            width="18"
            height="18"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 0 6 H 18 M 0 14 H 18"
              stroke={palette.weaveTint}
              strokeWidth="0.65"
              opacity="0.46"
            />
            <path
              d="M 9 0 V 18"
              stroke={palette.weaveTint}
              strokeWidth="0.45"
              opacity="0.32"
            />
          </pattern>
        </defs>

        {/* Layer 1: Uniform Contour-Hugging Soft Cast Shadow Floating Ahead of Fold Crest */}
        <path
          ref={shadowContourRef}
          d=""
          fill="none"
          stroke={palette.castShadow}
          strokeWidth="44"
          strokeLinecap="round"
          filter={`url(#${shadowBlurId})`}
        />

        {/* Layer 2: Trailing Translucent Chanderi Silk Organza Under-Veil */}
        <path ref={organzaPathRef} d={EMPTY_PATH} fill={`url(#${organzaGradId})`} />

        {/* Layer 3: Primary 3D Sculpted Pleated Mulberry Silk Drape */}
        <path ref={primarySilkPathRef} d={initialSilkPath} fill={`url(#${pleatGradId})`} />

        {/* Layer 4: Feathered Swaying Satin Folds, Micro-Weave, Sheen & 3D Curled Hem Shading */}
        <g clipPath={`url(#${silkClipId})`}>
          {/* Softly feathered S-fold satin specular highlights that sway gently as cloth billows */}
          <g ref={swayGroupRef} filter={`url(#${ribbonBlurId})`}>
            <path
              d="M 182 -60 C 162 240, 224 620, 190 1080 L 242 1080 C 272 620, 210 240, 228 -60 Z"
              fill={palette.swayRibbonLight}
            />
            <path
              d="M 472 -60 C 512 280, 448 650, 492 1080 L 552 1080 C 506 650, 568 280, 528 -60 Z"
              fill={palette.swayRibbonLight}
            />
            <path
              d="M 788 -60 C 758 260, 826 660, 782 1080 L 836 1080 C 878 660, 808 260, 838 -60 Z"
              fill={palette.swayRibbonLight}
            />
          </g>

          {/* Handwoven Raw Silk Cross-Slub Micro-Weave */}
          <rect x="0" y="0" width="1000" height="1000" fill={`url(#${weavePatternId})`} />

          {/* Traveling Diagonal Satin Specular Light */}
          <rect x="0" y="0" width="1000" height="1000" fill={`url(#${sheenGradId})`} />

          {/* Soft Warm Salon Spotlight Behind Centered Crest */}
          <rect
            ref={spotlightRectRef}
            x="0"
            y="0"
            width="1000"
            height="1000"
            fill={`url(#${spotlightGradId})`}
            style={{ opacity: isClosing ? 0 : 1 }}
          />

          {/* Uniform 3D Curled Silk Rim Highlight + Soft Underside Crease Along Moving Hem */}
          <path
            ref={foldCreaseStrokeRef}
            d=""
            fill="none"
            stroke={palette.foldCreaseShadow}
            strokeWidth="22"
            strokeLinecap="round"
            filter={`url(#${foldBlurId})`}
          />
          <path
            ref={foldRimStrokeRef}
            d=""
            fill="none"
            stroke={palette.foldRimLight}
            strokeWidth="12"
            strokeLinecap="round"
            filter={`url(#${foldBlurId})`}
          />
        </g>

        {/* Layer 5: Non-Scaling Crisp Woven Antique-Gold Zari Selvedge Border Tracing the Live Curved Hem */}
        <path
          ref={zariGlowPathRef}
          d=""
          fill="none"
          stroke={palette.zariGlow}
          strokeWidth="6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity="0.56"
        />
        <path
          ref={zariPrimaryPathRef}
          d=""
          fill="none"
          stroke={palette.zariPrimary}
          strokeWidth="2.2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          ref={zariSecondaryPathRef}
          d=""
          fill="none"
          stroke={palette.zariSecondary}
          strokeWidth="1.15"
          strokeDasharray="6 4"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* ── Centered Angelika Couture Medallion & Whisper ─────────────── */}
      <div
        ref={crestRef}
        className={`atelier-curtain-crest absolute inset-0 flex flex-col items-center justify-center px-6 will-change-transform ${
          isOpening ? 'is-exiting' : ''
        }`}
        style={
          reducedMotion
            ? undefined
            : {
                opacity: isClosing ? 0 : 1,
                transform: isClosing
                  ? 'translate3d(0, -14px, 0) scale(0.955)'
                  : 'translate3d(0, 0, 0) scale(1)',
                transition: 'none',
              }
        }
      >
        {/* Outer Antique-Gold Filigree Halo + Circular Silk Crest */}
        <div className="relative flex items-center justify-center">
          <div
            className="atelier-crest-halo absolute -inset-3 rounded-full border"
            style={{
              borderColor: palette.isDark
                ? 'rgba(229, 197, 107, 0.36)'
                : 'rgba(168, 131, 38, 0.34)',
            }}
          />
          <div
            className="absolute -inset-1.5 rounded-full border border-dashed"
            style={{
              borderColor: palette.isDark
                ? 'rgba(229, 197, 107, 0.22)'
                : 'rgba(168, 131, 38, 0.22)',
            }}
          />
          <div
            className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden bg-[#F2EBE1] p-1.5"
            style={{
              boxShadow: palette.isDark
                ? '0 18px 48px rgba(0,0,0,0.52), 0 0 0 1px rgba(229,197,107,0.72)'
                : '0 16px 38px rgba(34,16,24,0.14), 0 0 0 1px rgba(178,139,45,0.62)',
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

        {/* Crisp Editorial Wordmark */}
        <div className="mt-5 flex flex-col items-center text-center">
          <span
            className="font-display text-2xl sm:text-[26px] font-semibold uppercase tracking-[0.28em] leading-none"
            style={{ color: palette.wordmarkColor }}
          >
            {brandName}
          </span>
          <span
            className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.36em]"
            style={{ color: palette.taglineColor }}
          >
            {brandTagline}
          </span>

          {/* Illuminated Zari Hairline Rule */}
          <div
            className="mt-3.5 h-[1px] w-20"
            style={{
              background: palette.isDark
                ? 'linear-gradient(90deg, transparent, #E5C56B, transparent)'
                : 'linear-gradient(90deg, transparent, #B68E2E, transparent)',
            }}
          />

          {/* Poetic Atelier Whisper */}
          <p
            className="mt-3 text-[11px] font-medium uppercase tracking-[0.22em]"
            style={{ color: palette.whisperColor }}
          >
            {whisper}
          </p>
        </div>
      </div>
    </div>
  );
}
