#!/usr/bin/env node
/**
 * Design Tokens Sync Script
 * Fetches active design tokens from Supabase and generates CSS variables
 * Run with: npx tsx scripts/sync-design-tokens.ts
 * Or add to package.json: "tokens:sync": "tsx scripts/sync-design-tokens.ts"
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: resolve(__dirname, '../.env.local') });
dotenv.config({ path: resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_SERVICE_ROLE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface DesignTokenRow {
  id: string;
  version: string;
  tokens: Record<string, any>;
  changelog: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

interface ColorToken {
  light: string;
  dark: string;
}

interface TypographyToken {
  light: string;
  dark: string;
}

interface AnimationToken {
  light: string;
  dark: string;
}

interface ShadowToken {
  light: string;
  dark: string;
}

interface Colors {
  ink: ColorToken;
  charcoal: ColorToken;
  slate: ColorToken;
  mist: ColorToken;
  whisper: ColorToken;
  snow: ColorToken;
  white: ColorToken;
  gold: ColorToken;
  'gold-hover': ColorToken;
  'gold-light': ColorToken;
  'gold-muted': ColorToken;
  success: ColorToken;
  'success-bg': ColorToken;
  warning: ColorToken;
  'warning-bg': ColorToken;
  error: ColorToken;
  'error-bg': ColorToken;
  info: ColorToken;
  'info-bg': ColorToken;
  kurti: ColorToken;
  salwar: ColorToken;
  lehenga: ColorToken;
  saree: ColorToken;
  dupatta: ColorToken;
  [key: string]: ColorToken;
}

interface Typography {
  cormorant: TypographyToken;
  'dm-sans': TypographyToken;
  'dm-sans-mono': TypographyToken;
  [key: string]: TypographyToken;
}

interface Spacing {
  [key: string]: string;
}

interface Shadows {
  xs: ShadowToken;
  sm: ShadowToken;
  md: ShadowToken;
  lg: ShadowToken;
  xl: ShadowToken;
  '2xl': ShadowToken;
  gold: ShadowToken;
  focus: ShadowToken;
  card: ShadowToken;
  elevated: ShadowToken;
  [key: string]: ShadowToken;
}

interface Radius {
  [key: string]: string;
}

interface Animations {
  'ease-standard': AnimationToken;
  'ease-expressive': AnimationToken;
  'ease-spring': AnimationToken;
  'ease-decelerate': AnimationToken;
  'ease-accelerate': AnimationToken;
  'ease-magnetic': AnimationToken;
  'duration-instant': AnimationToken;
  'duration-fast': AnimationToken;
  'duration-base': AnimationToken;
  'duration-slow': AnimationToken;
  'duration-slower': AnimationToken;
  'duration-slowest': AnimationToken;
  [key: string]: AnimationToken;
}

interface Breakpoints {
  [key: string]: string;
}

interface ZIndex {
  [key: string]: string;
}

interface Container {
  max: string;
  padding: string;
  [key: string]: string;
}

interface Header {
  height: string;
  'height-mobile': string;
  [key: string]: string;
}

interface Magnetic {
  strength: string;
  radius: string;
  damping: string;
  stiffness: string;
  [key: string]: string;
}

interface TokenGroups {
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  shadows: Shadows;
  radius: Radius;
  animations: Animations;
  breakpoints: Breakpoints;
  zIndex: ZIndex;
  container: Container;
  header: Header;
  magnetic: Magnetic;
  version: string;
}

/**
 * Default design tokens (fallback if Supabase is unavailable)
 */
const DEFAULT_TOKENS: TokenGroups = {
  colors: {
    'ink': { light: '#0D0D0D', dark: '#FAFAFA' },
    'charcoal': { light: '#1A1A1A', dark: '#F5F5F5' },
    'slate': { light: '#4A4A4A', dark: '#D4D4D4' },
    'mist': { light: '#737373', dark: '#A3A3A3' },
    'whisper': { light: '#E5E5E5', dark: '#2A2A2A' },
    'snow': { light: '#FAFAFA', dark: '#1A1A1A' },
    'white': { light: '#FFFFFF', dark: '#0D0D0D' },
    'gold': { light: '#C9A84C', dark: '#D4B85C' },
    'gold-hover': { light: '#B8963D', dark: '#E0C870' },
    'gold-light': { light: '#F5EBCC', dark: '#3D351A' },
    'gold-muted': { light: '#E8D8A8', dark: '#4A3E1A' },
    'success': { light: '#1B7A3D', dark: '#4ADE80' },
    'success-bg': { light: '#E8F5EB', dark: '#0F2A18' },
    'warning': { light: '#B8741A', dark: '#FBBF24' },
    'warning-bg': { light: '#FFF8E1', dark: '#3D2E0A' },
    'error': { light: '#C02B2B', dark: '#F87171' },
    'error-bg': { light: '#FDEDEC', dark: '#3D0F0F' },
    'info': { light: '#1A73E8', dark: '#60A5FA' },
    'info-bg': { light: '#E8F0FE', dark: '#0F1E3A' },
    'kurti': { light: '#C9A84C', dark: '#D4B85C' },
    'salwar': { light: '#D4A574', dark: '#DEB88C' },
    'lehenga': { light: '#C46E6E', dark: '#D48E8E' },
    'saree': { light: '#7A9E9E', dark: '#98B8B8' },
    'dupatta': { light: '#A890C8', dark: '#B8A0D8' },
  },
  typography: {
    'cormorant': { light: "'Cormorant Garamond', Georgia, serif", dark: "'Cormorant Garamond', Georgia, serif" },
    'dm-sans': { light: "'DM Sans', system-ui, sans-serif", dark: "'DM Sans', system-ui, sans-serif" },
    'dm-sans-mono': { light: "'DM Sans', monospace", dark: "'DM Sans', monospace" },
  },
  spacing: {
    '1': '4px',
    '2': '8px',
    '3': '12px',
    '4': '16px',
    '5': '20px',
    '6': '24px',
    '8': '32px',
    '10': '40px',
    '12': '48px',
    '16': '64px',
    '20': '80px',
    '24': '96px',
    '32': '128px',
  },
  shadows: {
    'xs': { light: '0 1px 2px rgba(13, 13, 13, 0.04)', dark: '0 1px 2px rgba(255, 255, 255, 0.04)' },
    'sm': { light: '0 2px 8px rgba(13, 13, 13, 0.06)', dark: '0 2px 8px rgba(255, 255, 255, 0.06)' },
    'md': { light: '0 4px 16px rgba(13, 13, 13, 0.08)', dark: '0 4px 16px rgba(255, 255, 255, 0.08)' },
    'lg': { light: '0 8px 32px rgba(13, 13, 13, 0.1)', dark: '0 8px 32px rgba(255, 255, 255, 0.1)' },
    'xl': { light: '0 16px 48px rgba(13, 13, 13, 0.12)', dark: '0 16px 48px rgba(255, 255, 255, 0.12)' },
    '2xl': { light: '0 24px 64px rgba(13, 13, 13, 0.15)', dark: '0 24px 64px rgba(255, 255, 255, 0.15)' },
    'gold': { light: '0 8px 24px rgba(201, 168, 76, 0.25)', dark: '0 8px 24px rgba(212, 184, 92, 0.25)' },
    'focus': { light: '0 0 0 3px rgba(201, 168, 76, 0.4)', dark: '0 0 0 3px rgba(212, 184, 92, 0.4)' },
    'card': { light: '0 2px 12px rgba(13, 13, 13, 0.05)', dark: '0 2px 12px rgba(255, 255, 255, 0.05)' },
    'elevated': { light: '0 12px 40px rgba(13, 13, 13, 0.1)', dark: '0 12px 40px rgba(255, 255, 255, 0.1)' },
  },
  radius: {
    'xs': '4px',
    'sm': '8px',
    'md': '12px',
    'lg': '16px',
    'xl': '20px',
    '2xl': '28px',
    'full': '9999px',
  },
  animations: {
    'ease-standard': { light: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', dark: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
    'ease-expressive': { light: 'cubic-bezier(0.34, 1.56, 0.64, 1)', dark: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
    'ease-spring': { light: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', dark: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' },
    'ease-decelerate': { light: 'cubic-bezier(0, 0, 0.2, 1)', dark: 'cubic-bezier(0, 0, 0.2, 1)' },
    'ease-accelerate': { light: 'cubic-bezier(0.4, 0, 1, 1)', dark: 'cubic-bezier(0.4, 0, 1, 1)' },
    'ease-magnetic': { light: 'cubic-bezier(0.23, 1, 0.32, 1)', dark: 'cubic-bezier(0.23, 1, 0.32, 1)' },
    'duration-instant': { light: '75ms', dark: '75ms' },
    'duration-fast': { light: '150ms', dark: '150ms' },
    'duration-base': { light: '250ms', dark: '250ms' },
    'duration-slow': { light: '400ms', dark: '400ms' },
    'duration-slower': { light: '600ms', dark: '600ms' },
    'duration-slowest': { light: '800ms', dark: '800ms' },
  },
  breakpoints: {
    'xs': '320px',
    'sm': '640px',
    'md': '768px',
    'lg': '1024px',
    'xl': '1280px',
    '2xl': '1536px',
  },
  zIndex: {
    'dropdown': '100',
    'sticky': '200',
    'fixed': '300',
    'modal-backdrop': '400',
    'modal': '500',
    'popover': '600',
    'tooltip': '700',
    'toast': '800',
  },
  container: {
    'max': '1440px',
    'padding': '24px',
  },
  header: {
    'height': '72px',
    'height-mobile': '64px',
  },
  magnetic: {
    'strength': '0.3',
    'radius': '60px',
    'damping': '0.8',
    'stiffness': '300',
  },
  version: '1.0.0-default',
};

/**
 * Generate CSS variables for design tokens (light mode)
 */
function generateRootCSSVariables(tokens: TokenGroups): string {
  const lines: string[] = [];

  lines.push('  /* ============================================');
  lines.push('     DESIGN TOKENS - Auto-generated from Supabase');
  lines.push(`     Version: ${tokens.version || 'unknown'}`);
  lines.push(`     Generated: ${new Date().toISOString()}`);
  lines.push('     DO NOT EDIT DIRECTLY - Use Admin Panel → Design Tokens');
  lines.push('     ============================================ */');
  lines.push('');

  // Colors: Core Neutrals
  lines.push('  /* --- Colors: Core Neutrals --- */');
  lines.push(`  --color-ink: ${tokens.colors.ink.light};`);
  lines.push(`  --color-charcoal: ${tokens.colors.charcoal.light};`);
  lines.push(`  --color-slate: ${tokens.colors.slate.light};`);
  lines.push(`  --color-mist: ${tokens.colors.mist.light};`);
  lines.push(`  --color-whisper: ${tokens.colors.whisper.light};`);
  lines.push(`  --color-snow: ${tokens.colors.snow.light};`);
  lines.push(`  --color-white: ${tokens.colors.white.light};`);
  lines.push('');

  // Colors: Brand Gold
  lines.push('  /* --- Colors: Brand Gold --- */');
  lines.push(`  --color-gold: ${tokens.colors['gold'].light};`);
  lines.push(`  --color-gold-hover: ${tokens.colors['gold-hover'].light};`);
  lines.push(`  --color-gold-light: ${tokens.colors['gold-light'].light};`);
  lines.push(`  --color-gold-muted: ${tokens.colors['gold-muted'].light};`);
  lines.push('');

  // Colors: Semantic
  lines.push('  /* --- Colors: Semantic --- */');
  lines.push(`  --color-success: ${tokens.colors.success.light};`);
  lines.push(`  --color-success-bg: ${tokens.colors['success-bg'].light};`);
  lines.push(`  --color-warning: ${tokens.colors.warning.light};`);
  lines.push(`  --color-warning-bg: ${tokens.colors['warning-bg'].light};`);
  lines.push(`  --color-error: ${tokens.colors.error.light};`);
  lines.push(`  --color-error-bg: ${tokens.colors['error-bg'].light};`);
  lines.push(`  --color-info: ${tokens.colors.info.light};`);
  lines.push(`  --color-info-bg: ${tokens.colors['info-bg'].light};`);
  lines.push('');

  // Colors: Category Accents
  lines.push('  /* --- Colors: Category Accents --- */');
  lines.push(`  --color-kurti: ${tokens.colors.kurti.light};`);
  lines.push(`  --color-salwar: ${tokens.colors.salwar.light};`);
  lines.push(`  --color-lehenga: ${tokens.colors.lehenga.light};`);
  lines.push(`  --color-saree: ${tokens.colors.saree.light};`);
  lines.push(`  --color-dupatta: ${tokens.colors.dupatta.light};`);
  lines.push('');

  // Typography: Font Families
  lines.push('  /* --- Typography: Font Families --- */');
  lines.push(`  --font-cormorant: ${tokens.typography.cormorant.light};`);
  lines.push(`  --font-dm-sans: ${tokens.typography['dm-sans'].light};`);
  lines.push(`  --font-dm-sans-mono: ${tokens.typography['dm-sans-mono'].light};`);
  lines.push('');

  // Spacing Scale
  lines.push('  /* --- Spacing Scale --- */');
  for (const [key, value] of Object.entries(tokens.spacing)) {
    lines.push(`  --space-${key}: ${value};`);
  }
  lines.push('');

  // Border Radius
  lines.push('  /* --- Border Radius --- */');
  for (const [key, value] of Object.entries(tokens.radius)) {
    lines.push(`  --radius-${key}: ${value};`);
  }
  lines.push('');

  // Shadows
  lines.push('  /* --- Shadows --- */');
  lines.push(`  --shadow-xs: ${tokens.shadows.xs.light};`);
  lines.push(`  --shadow-sm: ${tokens.shadows.sm.light};`);
  lines.push(`  --shadow-md: ${tokens.shadows.md.light};`);
  lines.push(`  --shadow-lg: ${tokens.shadows.lg.light};`);
  lines.push(`  --shadow-xl: ${tokens.shadows.xl.light};`);
  lines.push(`  --shadow-2xl: ${tokens.shadows['2xl'].light};`);
  lines.push(`  --shadow-gold: ${tokens.shadows.gold.light};`);
  lines.push(`  --shadow-focus: ${tokens.shadows.focus.light};`);
  lines.push(`  --shadow-card: ${tokens.shadows.card.light};`);
  lines.push(`  --shadow-elevated: ${tokens.shadows.elevated.light};`);
  lines.push('');

  // Animation Tokens
  lines.push('  /* --- Animation Tokens --- */');
  lines.push(`  --ease-standard: ${tokens.animations['ease-standard'].light};`);
  lines.push(`  --ease-expressive: ${tokens.animations['ease-expressive'].light};`);
  lines.push(`  --ease-spring: ${tokens.animations['ease-spring'].light};`);
  lines.push(`  --ease-decelerate: ${tokens.animations['ease-decelerate'].light};`);
  lines.push(`  --ease-accelerate: ${tokens.animations['ease-accelerate'].light};`);
  lines.push(`  --ease-magnetic: ${tokens.animations['ease-magnetic'].light};`);
  lines.push('');
  lines.push(`  --duration-instant: ${tokens.animations['duration-instant'].light};`);
  lines.push(`  --duration-fast: ${tokens.animations['duration-fast'].light};`);
  lines.push(`  --duration-base: ${tokens.animations['duration-base'].light};`);
  lines.push(`  --duration-slow: ${tokens.animations['duration-slow'].light};`);
  lines.push(`  --duration-slower: ${tokens.animations['duration-slower'].light};`);
  lines.push(`  --duration-slowest: ${tokens.animations['duration-slowest'].light};`);
  lines.push('');

  // Magnetic Button Config
  lines.push('  /* --- Magnetic Button Config --- */');
  lines.push(`  --magnetic-strength: ${tokens.magnetic.strength};`);
  lines.push(`  --magnetic-radius: ${tokens.magnetic.radius};`);
  lines.push(`  --magnetic-damping: ${tokens.magnetic.damping};`);
  lines.push(`  --magnetic-stiffness: ${tokens.magnetic.stiffness};`);
  lines.push('');

  // Breakpoints
  lines.push('  /* --- Breakpoints --- */');
  for (const [key, value] of Object.entries(tokens.breakpoints)) {
    lines.push(`  --bp-${key}: ${value};`);
  }
  lines.push('');

  // Container
  lines.push('  /* --- Container --- */');
  lines.push(`  --container-max: ${tokens.container.max};`);
  lines.push(`  --container-padding: ${tokens.container.padding};`);
  lines.push('');

  // Header Height
  lines.push('  /* --- Header Height --- */');
  lines.push(`  --header-height: ${tokens.header.height};`);
  lines.push(`  --header-height-mobile: ${tokens.header['height-mobile']};`);

  return lines.join('\n');
}

/**
 * Generate CSS variables for .dark block (dark mode overrides)
 */
function generateDarkCSSVariables(tokens: TokenGroups): string {
  const lines: string[] = [];

  lines.push('    --color-ink: ' + tokens.colors.ink.dark + ';');
  lines.push('    --color-charcoal: ' + tokens.colors.charcoal.dark + ';');
  lines.push('    --color-slate: ' + tokens.colors.slate.dark + ';');
  lines.push('    --color-mist: ' + tokens.colors.mist.dark + ';');
  lines.push('    --color-whisper: ' + tokens.colors.whisper.dark + ';');
  lines.push('    --color-snow: ' + tokens.colors.snow.dark + ';');
  lines.push('    --color-white: ' + tokens.colors.white.dark + ';');
  lines.push('    --color-gold: ' + tokens.colors['gold'].dark + ';');
  lines.push('    --color-gold-hover: ' + tokens.colors['gold-hover'].dark + ';');
  lines.push('    --color-gold-light: ' + tokens.colors['gold-light'].dark + ';');
  lines.push('    --color-gold-muted: ' + tokens.colors['gold-muted'].dark + ';');
  lines.push('    --color-success: ' + tokens.colors.success.dark + ';');
  lines.push('    --color-success-bg: ' + tokens.colors['success-bg'].dark + ';');
  lines.push('    --color-warning: ' + tokens.colors.warning.dark + ';');
  lines.push('    --color-warning-bg: ' + tokens.colors['warning-bg'].dark + ';');
  lines.push('    --color-error: ' + tokens.colors.error.dark + ';');
  lines.push('    --color-error-bg: ' + tokens.colors['error-bg'].dark + ';');
  lines.push('    --color-info: ' + tokens.colors.info.dark + ';');
  lines.push('    --color-info-bg: ' + tokens.colors['info-bg'].dark + ';');

  return lines.join('\n');
}

/**
 * Parse tokens from Supabase JSON structure
 */
function parseTokensFromSupabase(data: Record<string, any>): TokenGroups {
  // If the data already has the expected structure, use it
  if (data['colors'] || data['typography'] || data['spacing']) {
    return {
      colors: data['colors'] || DEFAULT_TOKENS.colors,
      typography: data['typography'] || DEFAULT_TOKENS.typography,
      spacing: data['spacing'] || DEFAULT_TOKENS.spacing,
      shadows: data['shadows'] || DEFAULT_TOKENS.shadows,
      radius: data['radius'] || DEFAULT_TOKENS.radius,
      animations: data['animations'] || DEFAULT_TOKENS.animations,
      breakpoints: data['breakpoints'] || DEFAULT_TOKENS.breakpoints,
      zIndex: data['zIndex'] || DEFAULT_TOKENS.zIndex,
      container: data['container'] || DEFAULT_TOKENS.container,
      header: data['header'] || DEFAULT_TOKENS.header,
      magnetic: data['magnetic'] || DEFAULT_TOKENS.magnetic,
      version: data['version'] || '1.0.0',
    };
  }

  // Otherwise, try to parse from flat structure
  // Initialize with DEFAULT_TOKENS to satisfy required properties
  const parsed: TokenGroups = {
    colors: { ...DEFAULT_TOKENS.colors },
    typography: { ...DEFAULT_TOKENS.typography },
    spacing: { ...DEFAULT_TOKENS.spacing },
    shadows: { ...DEFAULT_TOKENS.shadows },
    radius: { ...DEFAULT_TOKENS.radius },
    animations: { ...DEFAULT_TOKENS.animations },
    breakpoints: { ...DEFAULT_TOKENS.breakpoints },
    zIndex: { ...DEFAULT_TOKENS.zIndex },
    container: { ...DEFAULT_TOKENS.container },
    header: { ...DEFAULT_TOKENS.header },
    magnetic: { ...DEFAULT_TOKENS.magnetic },
    version: data['version'] || '1.0.0',
  };

  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('color-')) {
      const name = key.replace('color-', '');
      const darkKey = `${key}-dark`;
      if (darkKey in data) {
        parsed.colors[name] = { light: String(value), dark: String(data[darkKey]) };
      } else {
        parsed.colors[name] = { light: String(value), dark: String(value) };
      }
    } else if (key.startsWith('font-') || key.startsWith('typography-')) {
      const name = key.replace('font-', '').replace('typography-', '');
      parsed.typography[name] = { light: String(value), dark: String(value) };
    } else if (key.startsWith('space-') || key.startsWith('spacing-')) {
      const name = key.replace('space-', '').replace('spacing-', '');
      parsed.spacing[name] = String(value);
    } else if (key.startsWith('shadow-')) {
      const name = key.replace('shadow-', '');
      const darkKey = `${key}-dark`;
      if (darkKey in data) {
        parsed.shadows[name] = { light: String(value), dark: String(data[darkKey]) };
      } else {
        parsed.shadows[name] = { light: String(value), dark: String(value) };
      }
    } else if (key.startsWith('radius-')) {
      const name = key.replace('radius-', '');
      parsed.radius[name] = String(value);
    } else if (key.startsWith('ease-') || key.startsWith('duration-') || key.startsWith('animation-')) {
      const name = key.replace('ease-', '').replace('duration-', '').replace('animation-', '');
      parsed.animations[name] = { light: String(value), dark: String(value) };
    } else if (key.startsWith('bp-') || key.startsWith('breakpoint-')) {
      const name = key.replace('bp-', '').replace('breakpoint-', '');
      parsed.breakpoints[name] = String(value);
    } else if (key.startsWith('z-') || key.startsWith('zIndex-')) {
      const name = key.replace('z-', '').replace('zIndex-', '');
      parsed.zIndex[name] = String(value);
    } else if (key.startsWith('container-')) {
      const name = key.replace('container-', '');
      parsed.container[name] = String(value);
    } else if (key.startsWith('header-')) {
      const name = key.replace('header-', '');
      parsed.header[name] = String(value);
    } else if (key.startsWith('magnetic-')) {
      const name = key.replace('magnetic-', '');
      parsed.magnetic[name] = String(value);
    }
  }

  return parsed;
}

/**
 * Update globals.css with new design tokens
 */
function updateGlobalsCSS(rootCSS: string, darkCSS: string): void {
  const globalsPath = resolve(__dirname, '../app/globals.css');

  if (!existsSync(globalsPath)) {
    console.error(`❌ globals.css not found at ${globalsPath}`);
    process.exit(1);
  }

  const content = readFileSync(globalsPath, 'utf-8');

  // Find the DESIGN TOKENS comment block
  const tokensStartMarker = '/* ============================================';
  const tokensStartIdx = content.indexOf(tokensStartMarker);
  if (tokensStartIdx === -1) {
    console.error('❌ Could not find DESIGN TOKENS comment block in globals.css');
    process.exit(1);
  }

  // Find the DARK MODE OVERRIDES comment (marks end of design tokens section)
  const darkModeMarker = '/* ============================================';
  // Find the second occurrence (DARK MODE OVERRIDES)
  const darkModeIdx = content.indexOf('DARK MODE OVERRIDES', tokensStartIdx);
  if (darkModeIdx === -1) {
    console.error('❌ Could not find DARK MODE OVERRIDES section in globals.css');
    process.exit(1);
  }

  // Find the .dark { block (it's right after DARK MODE OVERRIDES comment)
  const darkBlockStartIdx = content.indexOf('.dark {', darkModeIdx);
  if (darkBlockStartIdx === -1) {
    console.error('❌ Could not find .dark { block in globals.css');
    process.exit(1);
  }

  // Find the end of .dark block
  const darkBlockEndIdx = content.indexOf('  }', darkBlockStartIdx);
  if (darkBlockEndIdx === -1) {
    console.error('❌ Could not find end of .dark block in globals.css');
    process.exit(1);
  }

  // Find the BASE STYLES comment block (full comment including opening marker)
  // It comes AFTER the .dark block, so search forward from darkBlockEndIdx
  const baseStylesCommentStart = content.indexOf('/* ============================================', darkBlockEndIdx);
  if (baseStylesCommentStart === -1) {
    console.error('❌ Could not find BASE STYLES comment block start in globals.css');
    process.exit(1);
  }
  // Verify it's the BASE STYLES block by checking for "BASE STYLES" text
  const baseStylesTextIdx = content.indexOf('BASE STYLES', baseStylesCommentStart);
  if (baseStylesTextIdx === -1 || baseStylesTextIdx > baseStylesCommentStart + 100) {
    console.error('❌ Could not verify BASE STYLES section in globals.css');
    process.exit(1);
  }
  const baseStylesIdx = baseStylesCommentStart;

  // Build new content
  let newContent = content.substring(0, tokensStartIdx);

  // Add the new design tokens section
  newContent += rootCSS + '\n\n';

  // Add the DARK MODE OVERRIDES section with new .dark block
  newContent += '  /* ============================================\n';
  newContent += '     DARK MODE OVERRIDES\n';
  newContent += '     ============================================ */\n\n';
  newContent += '  .dark {\n';
  newContent += darkCSS + '\n';
  newContent += '  }\n\n';

  // Add the rest from BASE STYLES onwards
  newContent += content.substring(baseStylesIdx);

  writeFileSync(globalsPath, newContent);
  console.log('✅ Updated app/globals.css with new design tokens');
}

/**
 * Main sync function
 */
async function syncDesignTokens(): Promise<void> {
  console.log('🔄 Syncing design tokens from Supabase...');

  try {
    // Fetch active design tokens
    const { data, error } = await supabase
      .from('design_tokens')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️  No active design tokens found in Supabase, using defaults');
        const tokens = { ...DEFAULT_TOKENS, version: '1.0.0-default' };
        const rootCSS = generateRootCSSVariables(tokens);
        const darkCSS = generateDarkCSSVariables(tokens);
        updateGlobalsCSS(rootCSS, darkCSS);
        return;
      }
      throw error;
    }

    if (!data) {
      console.log('⚠️  No active design tokens found, using defaults');
      const tokens = { ...DEFAULT_TOKENS, version: '1.0.0-default' };
      const rootCSS = generateRootCSSVariables(tokens);
      const darkCSS = generateDarkCSSVariables(tokens);
      updateGlobalsCSS(rootCSS, darkCSS);
      return;
    }

    console.log(`✅ Found active design tokens: v${data.version} (${data.created_at})`);

    // Parse tokens from Supabase
    const tokens = parseTokensFromSupabase(data.tokens as Record<string, any>);
    tokens.version = data.version;

    // Generate CSS variables
    const rootCSS = generateRootCSSVariables(tokens);
    const darkCSS = generateDarkCSSVariables(tokens);

    // Update globals.css
    updateGlobalsCSS(rootCSS, darkCSS);

    console.log('🎉 Design tokens synced successfully!');
    console.log(`   Version: ${data.version}`);
    console.log(`   Updated: ${new Date().toISOString()}`);

  } catch (error) {
    console.error('❌ Failed to sync design tokens:', error);

    // Fallback to defaults
    console.log('🔄 Falling back to default tokens...');
    const tokens = { ...DEFAULT_TOKENS, version: '1.0.0-fallback' };
    const rootCSS = generateRootCSSVariables(tokens);
    const darkCSS = generateDarkCSSVariables(tokens);
    updateGlobalsCSS(rootCSS, darkCSS);

    process.exit(1);
  }
}

// Run if executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('sync-design-tokens.ts');

if (isMainModule) {
  console.log('🚀 Starting design tokens sync...');
  console.log('📁 Working directory:', process.cwd());
  console.log('🔗 Supabase URL:', SUPABASE_URL?.substring(0, 50) + '...');
  console.log('📞 Calling syncDesignTokens...');
  syncDesignTokens().then(() => {
    console.log('✅ Sync completed successfully');
    process.exit(0);
  }).catch((err) => {
    console.error('❌ Sync failed:', err);
    process.exit(1);
  });
  console.log('📞 syncDesignTokens called, waiting for promise...');
}

export { syncDesignTokens, generateRootCSSVariables, generateDarkCSSVariables, parseTokensFromSupabase, DEFAULT_TOKENS };