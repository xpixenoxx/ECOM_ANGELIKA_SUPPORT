'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

interface AtelierCurtainProps {
  logoUrl?: string;
  brandName?: string;
  brandTagline?: string;
}

type CurtainPhase = 'holding' | 'closing' | 'opening' | 'idle';

interface CoutureDrapeTheme {
  id: 'champagne-mulberry' | 'heirloom-mulberry';
  isDark: boolean;
  textureSrc: string;
  logoSrc: string;
  fallbackBg: string;
  /** Shader uniforms (normalized RGB 0..1) */
  zariColor: [number, number, number];
  organzaColor: [number, number, number];
  shadowColor: [number, number, number];
  specularTint: [number, number, number];
  specularStrength: number;
  shadowStrength: number;
  organzaAlpha: number;
  rimHighlightStrength: number;
  whisperColor: string;
  ruleGradient: string;
  logoShadow: string;
  centerBackdropGlow: string;
}

/**
 * 2 studio-photographed couture silk draperies alternating luminous Champagne Mulberry Silk
 * (initial entrance) with deep Heirloom Mulberry-Burgundy Velvet Silk across navigations.
 */
const COUTURE_THEMES: CoutureDrapeTheme[] = [
  {
    id: 'champagne-mulberry',
    isDark: false,
    textureSrc: '/images/curtain-champagne-silk.webp',
    logoSrc: '/images/curtain-logo-light.webp',
    fallbackBg: '#EFE5D6',
    zariColor: [0.76, 0.59, 0.21],
    organzaColor: [0.95, 0.90, 0.80],
    shadowColor: [0.16, 0.11, 0.07],
    specularTint: [1.0, 0.98, 0.93],
    specularStrength: 0.16,
    shadowStrength: 0.26,
    organzaAlpha: 0.56,
    rimHighlightStrength: 0.26,
    whisperColor: '#564538',
    ruleGradient: 'linear-gradient(90deg, transparent, rgba(164, 122, 42, 0.85), transparent)',
    logoShadow: 'drop-shadow(0 8px 22px rgba(74, 46, 28, 0.14))',
    centerBackdropGlow:
      'radial-gradient(ellipse 46% 38% at 50% 48%, rgba(255, 251, 244, 0.56) 0%, rgba(255, 251, 244, 0.18) 55%, transparent 100%)',
  },
  {
    id: 'heirloom-mulberry',
    isDark: true,
    textureSrc: '/images/curtain-mulberry-silk.webp',
    logoSrc: '/images/curtain-logo-dark.webp',
    fallbackBg: '#1E0C14',
    zariColor: [0.91, 0.78, 0.44],
    organzaColor: [0.42, 0.20, 0.27],
    shadowColor: [0.05, 0.02, 0.03],
    specularTint: [1.0, 0.91, 0.76],
    specularStrength: 0.24,
    shadowStrength: 0.48,
    organzaAlpha: 0.54,
    rimHighlightStrength: 0.30,
    whisperColor: '#E4D4C6',
    ruleGradient: 'linear-gradient(90deg, transparent, rgba(230, 197, 107, 0.85), transparent)',
    logoShadow: 'drop-shadow(0 10px 28px rgba(0, 0, 0, 0.48))',
    centerBackdropGlow:
      'radial-gradient(ellipse 46% 38% at 50% 48%, rgba(16, 5, 10, 0.42) 0%, rgba(16, 5, 10, 0.14) 55%, transparent 100%)',
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

const VERTEX_SHADER_SRC = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

/**
 * Real-time 2D/3D cloth-physics fragment shader:
 * - Aspect-correct cover mapping of photorealistic studio silk drapery textures
 * - Coupled harmonic UV fabric ripple + gravity cloth flow (real silk folds bend & sway)
 * - Analytical surface-normal specular sheen + fold trough darkening (living studio light)
 * - Top-to-bottom organic catenary hem + trailing sheer Chanderi organza veil
 * - Curled 3D silk lip highlight, soft cast shadow onto page below, & woven antique-gold Zari selvedge
 */
const FRAGMENT_SHADER_SRC = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vUv;

uniform sampler2D uTex;
uniform float uHasTex;
uniform float uTime;
uniform float uProgress;      // 0..1 primary silk sweep
uniform float uOrganzaProg;   // 0..1 trailing organza veil sweep
uniform float uMode;          // 0 = holding, 1 = closing (top->bottom), 2 = opening (top->bottom)
uniform float uViewportAspect;
uniform float uTexAspect;
uniform vec3 uFallbackBg;
uniform vec3 uZariColor;
uniform vec3 uOrganzaColor;
uniform vec3 uShadowColor;
uniform vec3 uSpecularTint;
uniform float uSpecularStrength;
uniform float uShadowStrength;
uniform float uOrganzaAlpha;
uniform float uRimStrength;

float clamp01(float v) {
  return clamp(v, 0.0, 1.0);
}

float sq(float v) {
  return v * v;
}

float waveEnvelope(float p) {
  float s = sin(clamp01(p) * 3.14159265);
  return s <= 0.0001 ? 0.0 : pow(s, 0.76);
}

// Smooth organic silk hem profile across x in [0, 1]
float computeHemY(float x, float baseY, float env, float timeSec, float dirSign, float ampScale, float phaseOff) {
  float catenary = sin(x * 3.14159265) * 0.078 * env * ampScale * dirSign;
  float palluBias = sin(x * 4.24 - 0.35) * 0.032 * env * ampScale;
  float ripple1 = sin(x * 9.8 - timeSec * 5.2 + phaseOff) * 0.022 * env * ampScale;
  float ripple2 = sin(x * 21.5 + timeSec * 8.4 + phaseOff * 1.6) * 0.0085 * env * ampScale;
  return baseY + catenary + palluBias + ripple1 + ripple2;
}

// Continuous 2D cloth wave heightfield for UV fold displacement & normal-mapped specular lighting
float clothHeight(vec2 uv, float env, float t) {
  float amp = 0.22 + env * 0.78;
  float w1 = sin(uv.x * 5.2 + uv.y * 2.1 - t * 3.6) * 0.55;
  float w2 = sin(uv.x * 11.4 - uv.y * 3.8 + t * 5.1) * 0.28;
  float w3 = sin(uv.x * 22.0 + uv.y * 5.2 - t * 6.8) * 0.11;
  return (w1 + w2 + w3) * amp;
}

vec2 toCoverUv(vec2 uv) {
  vec2 res = uv;
  if (uViewportAspect > uTexAspect) {
    float scale = uTexAspect / uViewportAspect;
    res.y = (uv.y - 0.5) * scale + 0.5;
  } else {
    float scale = uViewportAspect / uTexAspect;
    res.x = (uv.x - 0.5) * scale + 0.5;
  }
  return res;
}

void main() {
  vec2 uv = vUv; // y = 0 at TOP, y = 1 at BOTTOM
  float p = clamp01(uProgress);
  float po = clamp01(uOrganzaProg);
  float env = (uMode < 0.5) ? 0.08 : waveEnvelope(p);
  float oEnv = (uMode < 0.5) ? 0.0 : waveEnvelope(po);

  // Subtle top-to-bottom fabric flow + horizontal cloth billow displacement
  float flowY = 0.0;
  if (uMode > 0.5 && uMode < 1.5) {
    // Closing: fabric cascades downwards with gravity
    flowY = -(1.0 - p) * 0.14;
  } else if (uMode >= 1.5) {
    // Opening: fabric continues descending gently top -> bottom
    flowY = -p * 0.16;
  }

  // Analytical heightfield gradient for real 3D optical silk sheen & fold displacement
  float eps = 0.004;
  float hC = clothHeight(uv, env, uTime);
  float hX = clothHeight(uv + vec2(eps, 0.0), env, uTime);
  float hY = clothHeight(uv + vec2(0.0, eps), env, uTime);
  vec2 grad = vec2(hX - hC, hY - hC) / eps;

  // Displace texture UV so the photographed silk folds physically billow & sway!
  vec2 displacedUv = uv + vec2(grad.x * 0.0024 * (0.25 + env), flowY + grad.y * 0.0018 * (0.25 + env));
  vec2 texUv = clamp(toCoverUv(displacedUv), 0.002, 0.998);

  vec3 silkRgb = uFallbackBg;
  if (uHasTex > 0.5) {
    silkRgb = texture2D(uTex, texUv).rgb;
  }

  // Studio upper-left directional light interacting with dynamic cloth surface normals
  vec3 normal = normalize(vec3(-grad.x * 0.085, -grad.y * 0.065, 1.0));
  vec3 lightDir = normalize(vec3(-0.38, -0.45, 0.81));
  vec3 halfVec = normalize(lightDir + vec3(0.0, 0.0, 1.0));

  float diff = dot(normal, lightDir);
  float spec = pow(max(dot(normal, halfVec), 0.0001), 14.0);

  // Modulate photographed silk luminance naturally as waves roll across the pleats
  float motionLight = (diff - 0.80) * (0.35 + env * 1.15);
  silkRgb += uSpecularTint * (spec * uSpecularStrength * (0.28 + env * 0.95));
  silkRgb *= (1.0 + motionLight * 0.18);

  // Mode 0: Resting full silk drape with subtle living candlelight breath
  if (uMode < 0.5) {
    gl_FragColor = vec4(clamp(silkRgb, 0.0, 1.0), 1.0);
    return;
  }

  bool isClosing = uMode < 1.5;
  float dirSign = isClosing ? 1.0 : -1.0;

  // Primary silk hem & trailing sheer Chanderi organza hem
  float primaryBaseY = isClosing ? (-0.14 + p * 1.30) : (-0.08 + p * 1.24);
  float organzaBaseY = isClosing
    ? (primaryBaseY + 0.055 * env)
    : (-0.09 + po * 1.26);

  float hemY = computeHemY(uv.x, primaryBaseY, env, uTime, dirSign, 1.0, isClosing ? 0.4 : 0.0);
  float organzaHemY = computeHemY(uv.x, organzaBaseY, isClosing ? env * 1.15 : oEnv, uTime, dirSign, 1.24, 1.35);

  // Signed distance into primary silk (> 0 inside silk, < 0 outside on revealed page)
  float signedInside = isClosing ? (hemY - uv.y) : (uv.y - hemY);
  float signedOrganza = isClosing ? (organzaHemY - uv.y) : (uv.y - organzaHemY);

  // Crisp anti-aliased edge masks
  float aa = 0.0022;
  float silkMask = smoothstep(-aa, aa, signedInside);
  float organzaMask = smoothstep(-aa * 2.0, aa * 2.0, signedOrganza);

  // 1) Soft realistic cast shadow floating on the storefront page just outside the moving silk hem
  float outDist = max(0.0, -signedInside);
  float castShadowAlpha = (1.0 - silkMask) * exp(-outDist * 34.0) * uShadowStrength * (0.32 + env * 0.68);
  vec4 outCol = vec4(uShadowColor, castShadowAlpha);

  // 2) Sheer Chanderi Organza trailing under-veil (visible outside primary silk)
  float orgBand = organzaMask * (1.0 - silkMask);
  if (orgBand > 0.001) {
    float edgeFade = smoothstep(0.0, 0.09, max(0.0, signedOrganza));
    float orgAlpha = orgBand * uOrganzaAlpha * (0.45 + 0.55 * (1.0 - edgeFade));
    // Subtle shimmering gold edge along the organza veil
    float orgEdgeGlint = smoothstep(0.012, 0.0, abs(signedOrganza)) * 0.45;
    vec3 orgRgb = mix(uOrganzaColor, uZariColor, orgEdgeGlint) + uSpecularTint * (spec * 0.14);
    // Composite organza over cast shadow
    float finalA = orgAlpha + outCol.a * (1.0 - orgAlpha);
    vec3 finalRgb = (orgRgb * orgAlpha + outCol.rgb * outCol.a * (1.0 - orgAlpha)) / max(finalA, 0.0001);
    outCol = vec4(finalRgb, finalA);
  }

  // 3) Heavy Primary Silk + 3D Curled Fold Rim + Woven Antique-Gold Zari Selvedge Border
  if (silkMask > 0.001) {
    float inDist = max(0.0, signedInside);

    // 3D curled silk fold rim-highlight right inside the hem + soft fold crease right behind it
    float rimGlow = exp(-sq((inDist - 0.007) / 0.0075)) * uRimStrength * (0.45 + env * 0.55);
    float creaseDark = exp(-sq((inDist - 0.024) / 0.014)) * 0.22 * (0.45 + env * 0.55);
    vec3 shadedSilk = silkRgb * (1.0 - creaseDark) + uSpecularTint * rimGlow;

    // Woven Antique-Gold Zari double selvedge border hugging the curved edge
    float weaveGlint = 0.82 + 0.18 * sin(uv.x * 460.0 + uTime * 2.0);
    float zariMain = exp(-sq((inDist - 0.0028) / 0.0022)) * 0.92 * weaveGlint;
    float zariInner = exp(-sq((inDist - 0.0105) / 0.0013)) * 0.58 * (0.55 + 0.45 * sin(uv.x * 260.0));
    float zariMix = clamp01(zariMain + zariInner) * (0.45 + env * 0.55);

    vec3 zariLit = uZariColor * (0.95 + spec * 0.55);
    shadedSilk = mix(shadedSilk, zariLit, zariMix);

    float finalA = silkMask + outCol.a * (1.0 - silkMask);
    vec3 finalRgb = (shadedSilk * silkMask + outCol.rgb * outCol.a * (1.0 - silkMask)) / max(finalA, 0.0001);
    outCol = vec4(finalRgb, finalA);
  }

  gl_FragColor = vec4(clamp(outCol.rgb, 0.0, 1.0), clamp01(outCol.a));
}
`;

function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function easeSilkRelease(t: number): number {
  const c = clamp01(t);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

function easeSilkDrop(t: number): number {
  const c = clamp01(t);
  return 1 - Math.pow(1 - c, 3.2);
}

interface WebGLContextState {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  buffer: WebGLBuffer;
  textures: Map<string, { tex: WebGLTexture; aspect: number; ready: boolean }>;
  uniforms: {
    uTex: WebGLUniformLocation | null;
    uHasTex: WebGLUniformLocation | null;
    uTime: WebGLUniformLocation | null;
    uProgress: WebGLUniformLocation | null;
    uOrganzaProg: WebGLUniformLocation | null;
    uMode: WebGLUniformLocation | null;
    uViewportAspect: WebGLUniformLocation | null;
    uTexAspect: WebGLUniformLocation | null;
    uFallbackBg: WebGLUniformLocation | null;
    uZariColor: WebGLUniformLocation | null;
    uOrganzaColor: WebGLUniformLocation | null;
    uShadowColor: WebGLUniformLocation | null;
    uSpecularTint: WebGLUniformLocation | null;
    uSpecularStrength: WebGLUniformLocation | null;
    uShadowStrength: WebGLUniformLocation | null;
    uOrganzaAlpha: WebGLUniformLocation | null;
    uRimStrength: WebGLUniformLocation | null;
  };
}

function hexToRgb01(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return [0.94, 0.9, 0.84];
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function initWebGL(canvas: HTMLCanvasElement): WebGLContextState | null {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: true,
    premultipliedAlpha: false,
    powerPreference: 'high-performance',
  });
  if (!gl) return null;

  const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  const buffer = gl.createBuffer();
  if (!buffer) return null;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );

  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  gl.useProgram(program);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  return {
    gl,
    program,
    buffer,
    textures: new Map(),
    uniforms: {
      uTex: gl.getUniformLocation(program, 'uTex'),
      uHasTex: gl.getUniformLocation(program, 'uHasTex'),
      uTime: gl.getUniformLocation(program, 'uTime'),
      uProgress: gl.getUniformLocation(program, 'uProgress'),
      uOrganzaProg: gl.getUniformLocation(program, 'uOrganzaProg'),
      uMode: gl.getUniformLocation(program, 'uMode'),
      uViewportAspect: gl.getUniformLocation(program, 'uViewportAspect'),
      uTexAspect: gl.getUniformLocation(program, 'uTexAspect'),
      uFallbackBg: gl.getUniformLocation(program, 'uFallbackBg'),
      uZariColor: gl.getUniformLocation(program, 'uZariColor'),
      uOrganzaColor: gl.getUniformLocation(program, 'uOrganzaColor'),
      uShadowColor: gl.getUniformLocation(program, 'uShadowColor'),
      uSpecularTint: gl.getUniformLocation(program, 'uSpecularTint'),
      uSpecularStrength: gl.getUniformLocation(program, 'uSpecularStrength'),
      uShadowStrength: gl.getUniformLocation(program, 'uShadowStrength'),
      uOrganzaAlpha: gl.getUniformLocation(program, 'uOrganzaAlpha'),
      uRimStrength: gl.getUniformLocation(program, 'uRimStrength'),
    },
  };
}

// Persistent browser-session image cache so textures & logos load once and stay instant
const loadedImageCache = new Map<string, HTMLImageElement>();

function preloadImage(src: string): Promise<HTMLImageElement | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  const cached = loadedImageCache.get(src);
  if (cached && cached.complete && cached.naturalWidth > 0) {
    return Promise.resolve(cached);
  }
  return new Promise((resolve) => {
    const img = new window.Image();
    img.decoding = 'async';
    img.onload = () => {
      loadedImageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function AtelierCurtain({
  logoUrl = '/images/logo.png',
  brandName = 'Angelika',
}: AtelierCurtainProps) {
  const pathname = usePathname() || '/';

  const [phase, setPhase] = useState<CurtainPhase>('holding');
  const [themeIndex, setThemeIndex] = useState(0);
  const [whisperIndex, setWhisperIndex] = useState(0);
  const [isRapidNav, setIsRapidNav] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webglReady, setWebglReady] = useState(false);

  const prevPathnameRef = useRef<string>(pathname);
  const phaseRef = useRef<CurtainPhase>('holding');
  const lastNavTimeRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const pendingOpenRef = useRef<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glStateRef = useRef<WebGLContextState | null>(null);
  const crestRef = useRef<HTMLDivElement | null>(null);
  const centerGlowRef = useRef<HTMLDivElement | null>(null);
  const fallbackBackdropRef = useRef<HTMLDivElement | null>(null);
  const ssrImgRef = useRef<HTMLImageElement | null>(null);

  phaseRef.current = phase;

  const theme = COUTURE_THEMES[themeIndex] ?? COUTURE_THEMES[0]!;
  const whisper = ATELIER_WHISPERS[whisperIndex] ?? ATELIER_WHISPERS[0]!;

  // Use studio-isolated transparent logo variants for default Angelika logo; honor custom admin uploads cleanly
  const isDefaultBrandLogo =
    !logoUrl ||
    logoUrl.endsWith('/images/logo.png') ||
    logoUrl.endsWith('/images/logo.jpg') ||
    logoUrl === '/images/logo.png';
  const activeLogoSrc = isDefaultBrandLogo ? theme.logoSrc : logoUrl;

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

  // Preload both silk textures & isolated logos into memory once so navigations are instantaneous
  useEffect(() => {
    COUTURE_THEMES.forEach((t) => {
      preloadImage(t.textureSrc);
      preloadImage(t.logoSrc);
    });
  }, []);

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
    const holdDuration = mqReduce ? 100 : 280;

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

  // Intercept internal storefront <a> clicks to drop the photorealistic silk veil top-to-bottom
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

      // Alternate luminous Champagne Silk <-> Heirloom Mulberry Velvet & rotate whisper
      setThemeIndex((prev) => (prev + 1) % COUTURE_THEMES.length);
      setWhisperIndex((prev) => (prev + 1) % ATELIER_WHISPERS.length);

      pendingOpenRef.current = false;
      clearAllTimers();
      setPhase('closing');

      // Fail-safe valve: never trap the shopper if navigation stalls or aborts
      scheduleTimer(() => {
        if (phaseRef.current === 'closing' || phaseRef.current === 'holding') {
          setPhase('opening');
        }
      }, 1500);
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
      setThemeIndex((prev) => (prev + 1) % COUTURE_THEMES.length);
      setWhisperIndex((prev) => (prev + 1) % ATELIER_WHISPERS.length);
      setPhase('holding');
    }

    const holdMs = reducedMotion ? 60 : isRapidNav ? 75 : 125;
    scheduleTimer(() => {
      setPhase('opening');
    }, holdMs);

    return () => clearAllTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ── Real-Time WebGL Photorealistic Cloth-Physics Render Loop ──
  useEffect(() => {
    stopRaf();
    if (phase === 'idle') {
      // Clean up GPU context when unmounted
      if (glStateRef.current) {
        const { gl, program, buffer, textures } = glStateRef.current;
        textures.forEach((entry) => gl.deleteTexture(entry.tex));
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        glStateRef.current = null;
      }
      setWebglReady(false);
      return;
    }

    // Reduced motion: calm opacity fade over static photorealistic silk still
    if (reducedMotion) {
      if (phase === 'opening') {
        scheduleTimer(() => setPhase('idle'), 200);
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

    const canvas = canvasRef.current;
    let glState = glStateRef.current;
    if (canvas && !glState) {
      glState = initWebGL(canvas);
      glStateRef.current = glState;
    }

    const activeTheme = COUTURE_THEMES[themeIndex] ?? COUTURE_THEMES[0]!;
    const fallbackRgb = hexToRgb01(activeTheme.fallbackBg);

    // Upload or reuse photorealistic silk texture in WebGL
    const ensureTexture = (state: WebGLContextState, src: string) => {
      const existing = state.textures.get(src);
      if (existing) return existing;

      const { gl } = state;
      const tex = gl.createTexture();
      if (!tex) return null;

      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      const domImg =
        ssrImgRef.current &&
        ssrImgRef.current.getAttribute('src') === src &&
        ssrImgRef.current.complete &&
        ssrImgRef.current.naturalWidth > 0
          ? ssrImgRef.current
          : null;
      const cachedImg = domImg || loadedImageCache.get(src) || null;
      const hasCachedImg = Boolean(cachedImg && cachedImg.complete && cachedImg.naturalWidth > 0);
      const entry = {
        tex,
        aspect: hasCachedImg
          ? cachedImg!.naturalWidth / Math.max(1, cachedImg!.naturalHeight)
          : 1376 / 768,
        ready: hasCachedImg,
      };

      if (hasCachedImg && cachedImg) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cachedImg);
      } else {
        // 1x1 fallback pixel until image decodes
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          1,
          1,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          new Uint8Array([
            Math.round(fallbackRgb[0] * 255),
            Math.round(fallbackRgb[1] * 255),
            Math.round(fallbackRgb[2] * 255),
            255,
          ])
        );

        preloadImage(src).then((img) => {
          if (!img || glStateRef.current !== state) return;
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          entry.aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
          entry.ready = true;
        });
      }

      state.textures.set(src, entry);
      return entry;
    };

    const texEntry = glState ? ensureTexture(glState, activeTheme.textureSrc) : null;

    const resizeCanvas = () => {
      if (!canvas || !glState) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const w = Math.max(1, Math.round(window.innerWidth * dpr));
      const h = Math.max(1, Math.round(window.innerHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      glState.gl.viewport(0, 0, w, h);
    };

    const drawFrame = (mode: number, progress: number, organzaProg: number, timeSec: number) => {
      if (!glState || !canvas) return;
      resizeCanvas();

      const { gl, uniforms } = glState;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      if (texEntry) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texEntry.tex);
        gl.uniform1i(uniforms.uTex, 0);
        gl.uniform1f(uniforms.uHasTex, texEntry.ready ? 1.0 : 0.0);
        gl.uniform1f(uniforms.uTexAspect, texEntry.aspect);
      } else {
        gl.uniform1f(uniforms.uHasTex, 0.0);
        gl.uniform1f(uniforms.uTexAspect, 16 / 9);
      }

      gl.uniform1f(uniforms.uTime, timeSec);
      gl.uniform1f(uniforms.uProgress, clamp01(progress));
      gl.uniform1f(uniforms.uOrganzaProg, clamp01(organzaProg));
      gl.uniform1f(uniforms.uMode, mode);
      gl.uniform1f(uniforms.uViewportAspect, canvas.width / Math.max(1, canvas.height));
      gl.uniform3fv(uniforms.uFallbackBg, fallbackRgb);
      gl.uniform3fv(uniforms.uZariColor, activeTheme.zariColor);
      gl.uniform3fv(uniforms.uOrganzaColor, activeTheme.organzaColor);
      gl.uniform3fv(uniforms.uShadowColor, activeTheme.shadowColor);
      gl.uniform3fv(uniforms.uSpecularTint, activeTheme.specularTint);
      gl.uniform1f(uniforms.uSpecularStrength, activeTheme.specularStrength);
      gl.uniform1f(uniforms.uShadowStrength, activeTheme.shadowStrength);
      gl.uniform1f(uniforms.uOrganzaAlpha, activeTheme.organzaAlpha);
      gl.uniform1f(uniforms.uRimStrength, activeTheme.rimHighlightStrength);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Hide SSR fallback once real texture is painted into WebGL cleanly
      if (texEntry?.ready && fallbackBackdropRef.current) {
        fallbackBackdropRef.current.style.opacity = '0';
      }
    };

    if (glState) {
      setWebglReady(true);
    }

    // Fallback CSS transform animation ONLY if WebGL is unavailable on device
    const applyCssFallback = (mode: 'holding' | 'closing' | 'opening', p: number) => {
      if (!fallbackBackdropRef.current) return;
      fallbackBackdropRef.current.style.opacity = '1';
      if (mode === 'holding') {
        fallbackBackdropRef.current.style.transform = 'translate3d(0, 0, 0)';
      } else if (mode === 'closing') {
        const y = -100 + p * 100;
        fallbackBackdropRef.current.style.transform = `translate3d(0, ${y.toFixed(2)}%, 0)`;
      } else {
        const y = p * 105;
        fallbackBackdropRef.current.style.transform = `translate3d(0, ${y.toFixed(2)}%, 0)`;
      }
    };

    // ── Phase: HOLDING (living subtle candlelight cloth breath) ──
    if (phase === 'holding') {
      let startTime: number | null = null;
      const tickHold = (now: number) => {
        if (startTime === null) startTime = now;
        const elapsedSec = Math.max(0, (now - startTime) / 1000);
        if (glState) {
          drawFrame(0, 0, 0, elapsedSec);
        } else {
          applyCssFallback('holding', 0);
        }
        if (crestRef.current) {
          crestRef.current.style.opacity = '1';
          crestRef.current.style.transform = 'translate3d(0, 0, 0) scale(1)';
        }
        if (centerGlowRef.current) {
          centerGlowRef.current.style.opacity = '1';
        }
        rafRef.current = window.requestAnimationFrame(tickHold);
      };
      rafRef.current = window.requestAnimationFrame(tickHold);
      return () => stopRaf();
    }

    // ── Phase: CLOSING (top -> bottom weighted silk cascade) ──
    if (phase === 'closing') {
      const durationMs = isRapidNav ? 290 : 390;
      let startTime: number | null = null;

      const tickClose = (now: number) => {
        if (startTime === null) startTime = now;
        const elapsedMs = Math.max(0, now - startTime);
        const rawT = clamp01(elapsedMs / durationMs);
        const eased = easeSilkDrop(rawT);
        const elapsedSec = elapsedMs / 1000;

        if (glState) {
          drawFrame(1, eased, eased, elapsedSec);
        } else {
          applyCssFallback('closing', eased);
        }

        // Bloom uncropped Angelika logo cleanly once falling silk crosses center (~36%..86%)
        const crestProgress = clamp01((rawT - 0.36) / 0.50);
        const crestEased = easeSilkDrop(crestProgress);
        if (centerGlowRef.current) {
          centerGlowRef.current.style.opacity = crestEased.toFixed(3);
        }
        if (crestRef.current) {
          const offsetY = (1 - crestEased) * -14;
          const scale = 0.96 + crestEased * 0.04;
          crestRef.current.style.opacity = crestEased.toFixed(3);
          crestRef.current.style.transform = `translate3d(0, ${offsetY.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        }

        if (rawT < 1) {
          rafRef.current = window.requestAnimationFrame(tickClose);
        } else {
          if (pendingOpenRef.current) {
            pendingOpenRef.current = false;
            scheduleTimer(() => setPhase('opening'), isRapidNav ? 45 : 90);
          } else {
            setPhase('holding');
          }
        }
      };

      rafRef.current = window.requestAnimationFrame(tickClose);
      return () => stopRaf();
    }

    // ── Phase: OPENING (top -> bottom living pleated silk & organza unveil) ──
    if (phase === 'opening') {
      const primaryDurationMs = isRapidNav ? 540 : 780;
      const organzaLagMs = isRapidNav ? 95 : 140;
      const totalDurationMs = primaryDurationMs + organzaLagMs;
      let startTime: number | null = null;

      const tickOpen = (now: number) => {
        if (startTime === null) startTime = now;
        const elapsedMs = Math.max(0, now - startTime);
        const elapsedSec = elapsedMs / 1000;

        const rawPrimary = clamp01(elapsedMs / primaryDurationMs);
        const easedPrimary = easeSilkRelease(rawPrimary);

        const rawOrganza = clamp01(
          (elapsedMs - organzaLagMs * 0.55) / (primaryDurationMs + organzaLagMs * 0.45)
        );
        const easedOrganza = easeSilkRelease(rawOrganza);

        if (glState) {
          drawFrame(2, easedPrimary, easedOrganza, elapsedSec);
        } else {
          applyCssFallback('opening', easedPrimary);
        }

        // Lift & feather out centered logo gracefully ahead of the descending silk wave
        const exitT = clamp01(rawPrimary / 0.36);
        const exitOpacity = Math.max(0, 1 - easeSilkRelease(exitT));
        if (centerGlowRef.current) {
          centerGlowRef.current.style.opacity = exitOpacity.toFixed(3);
        }
        if (crestRef.current) {
          const liftY = -18 * easeSilkRelease(exitT);
          const scale = 1 - 0.035 * easeSilkRelease(exitT);
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
  }, [phase, themeIndex, isRapidNav, reducedMotion]);

  if (phase === 'idle') return null;

  const isOpening = phase === 'opening';
  const isClosing = phase === 'closing';
  const pointerClass = isOpening ? 'pointer-events-none' : 'pointer-events-auto';

  return (
    <div
      aria-hidden="true"
      data-curtain-phase={phase}
      data-curtain-theme={theme.id}
      data-curtain-webgl={webglReady ? 'active' : 'fallback'}
      className={`atelier-curtain-root fixed inset-0 z-[9999] overflow-hidden select-none ${pointerClass}`}
      style={
        reducedMotion
          ? {
              opacity: isOpening ? 0 : 1,
              transition: 'opacity 190ms ease-out',
            }
          : undefined
      }
    >
      {/* Instant SSR / Non-WebGL Photorealistic Silk Drapery Fallback (Zero Flash on Frame 0) */}
      <div
        ref={fallbackBackdropRef}
        className="absolute inset-0 will-change-transform"
        style={{
          backgroundColor: theme.fallbackBg,
          opacity: isClosing && webglReady ? 0 : 1,
          transform: isClosing && !webglReady ? 'translate3d(0, -100%, 0)' : 'translate3d(0, 0, 0)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={ssrImgRef}
          src={theme.textureSrc}
          alt=""
          decoding="sync"
          fetchPriority="high"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Real-Time GPU WebGL Cloth-Physics & Specular-Light Silk Drapery Canvas */}
      {!reducedMotion && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block h-full w-full"
          aria-hidden="true"
        />
      )}

      {/* Subtle Soft Center Luminance Cushion so Logo Reads With Museum-Grade Clarity */}
      <div
        ref={centerGlowRef}
        className="pointer-events-none absolute inset-0"
        style={{
          background: theme.centerBackdropGlow,
          opacity: isClosing ? 0 : 1,
        }}
      />

      {/* Razor-Sharp, Uncropped Angelika Couture Ribbon Logo & Poetic Atelier Whisper */}
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
                  ? 'translate3d(0, -14px, 0) scale(0.96)'
                  : 'translate3d(0, 0, 0) scale(1)',
                transition: 'none',
              }
        }
      >
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeLogoSrc}
            alt={brandName}
            width={340}
            height={264}
            decoding="sync"
            fetchPriority="high"
            className="h-auto w-[235px] sm:w-[295px] md:w-[335px] max-w-[78vw] object-contain"
            style={{ filter: theme.logoShadow }}
          />

          {/* Fine Antique-Gold Zari Hairline Divider */}
          <div
            className="mt-4 h-[1px] w-24 sm:w-28"
            style={{ background: theme.ruleGradient }}
          />

          {/* Subtle Atelier Whisper (No Duplicate Wordmark!) */}
          <p
            className="mt-3 text-[10.5px] sm:text-[11px] font-medium uppercase tracking-[0.28em]"
            style={{ color: theme.whisperColor }}
          >
            {whisper}
          </p>
        </div>
      </div>
    </div>
  );
}
