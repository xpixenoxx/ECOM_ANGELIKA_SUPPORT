'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { cn } from '@/lib/utils/cn';
import {
  Palette,
  Sun,
  Moon,
  RefreshCw,
  Save,
  Eye,
  Copy,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Code,
  FileText,
  Download,
  Upload,
} from 'lucide-react';

interface ColorToken {
  name: string;
  value: string;
  darkValue: string;
  description: string;
}

interface SimpleToken {
  name: string;
  value: string;
  description: string;
}

type Token = ColorToken | SimpleToken;

type SubCategoryTokens = Token[];

interface CategoryTokens {
  [subCategory: string]: SubCategoryTokens;
}

interface MockTokens {
  colors: CategoryTokens;
  typography: CategoryTokens;
  spacing: CategoryTokens;
  radius: CategoryTokens;
  shadows: CategoryTokens;
  animations: CategoryTokens;
  breakpoints: CategoryTokens;
  misc: CategoryTokens;
}

const tokenCategories = [
  { id: 'colors', label: 'Colors', icon: Palette, count: 44 },
  { id: 'typography', label: 'Typography', icon: FileText, count: 6 },
  { id: 'spacing', label: 'Spacing', icon: Code, count: 14 },
  { id: 'radius', label: 'Border Radius', icon: Code, count: 9 },
  { id: 'shadows', label: 'Shadows', icon: Code, count: 10 },
  { id: 'animations', label: 'Animations', icon: Code, count: 19 },
  { id: 'breakpoints', label: 'Breakpoints', icon: Code, count: 7 },
  { id: 'misc', label: 'Other', icon: Code, count: 4 },
];

const mockTokens: MockTokens = {
  colors: {
    core: [
      { name: '--color-ink', value: '#0D0D0D', darkValue: '#FAFAFA', description: 'Primary text color' },
      { name: '--color-charcoal', value: '#1A1A1A', darkValue: '#F5F5F5', description: 'Secondary text color' },
      { name: '--color-slate', value: '#4A4A4A', darkValue: '#D4D4D4', description: 'Muted text color' },
      { name: '--color-mist', value: '#737373', darkValue: '#A3A3A3', description: 'Placeholder/disabled text' },
      { name: '--color-whisper', value: '#E5E5E5', darkValue: '#2A2A2A', description: 'Borders, dividers' },
      { name: '--color-snow', value: '#FAFAFA', darkValue: '#1A1A1A', description: 'Subtle backgrounds' },
      { name: '--color-white', value: '#F3EEE8', darkValue: '#0D0D0D', description: 'Pure white backgrounds' },
    ],
    brand: [
      { name: '--color-gold', value: '#C9A84C', darkValue: '#D4B85C', description: 'Primary brand color' },
      { name: '--color-gold-hover', value: '#B8963D', darkValue: '#E0C870', description: 'Hover state for gold' },
      { name: '--color-gold-light', value: '#F5EBCC', darkValue: '#3D351A', description: 'Light gold backgrounds' },
      { name: '--color-gold-muted', value: '#E8D8A8', darkValue: '#4A3E1A', description: 'Muted gold accents' },
    ],
    semantic: [
      { name: '--color-success', value: '#1B7A3D', darkValue: '#4ADE80', description: 'Success states' },
      { name: '--color-success-bg', value: '#E8F5EB', darkValue: '#0F2A18', description: 'Success backgrounds' },
      { name: '--color-warning', value: '#B8741A', darkValue: '#FBBF24', description: 'Warning states' },
      { name: '--color-warning-bg', value: '#FFF8E1', darkValue: '#3D2E0A', description: 'Warning backgrounds' },
      { name: '--color-error', value: '#C02B2B', darkValue: '#F87171', description: 'Error states' },
      { name: '--color-error-bg', value: '#FDEDEC', darkValue: '#3D0F0F', description: 'Error backgrounds' },
      { name: '--color-info', value: '#1A73E8', darkValue: '#60A5FA', description: 'Info states' },
      { name: '--color-info-bg', value: '#E8F0FE', darkValue: '#0F1E3A', description: 'Info backgrounds' },
    ],
    category: [
      { name: '--color-kurti', value: '#C9A84C', darkValue: '#C9A84C', description: 'Kurti category accent' },
      { name: '--color-salwar', value: '#D4A574', darkValue: '#D4A574', description: 'Salwar category accent' },
      { name: '--color-lehenga', value: '#C46E6E', darkValue: '#C46E6E', description: 'Lehenga category accent' },
      { name: '--color-saree', value: '#7A9E9E', darkValue: '#7A9E9E', description: 'Saree category accent' },
      { name: '--color-dupatta', value: '#A890C8', darkValue: '#A890C8', description: 'Dupatta category accent' },
    ],
  },
  typography: {
    fonts: [
      { name: '--font-cormorant', value: "'Cormorant Garamond', Georgia, serif", description: 'Display/heading font' },
      { name: '--font-dm-sans', value: "'DM Sans', system-ui, sans-serif", description: 'Body/UI font' },
      { name: '--font-dm-sans-mono', value: "'DM Sans', monospace", description: 'Monospace font' },
    ],
  },
  spacing: {
    scale: [
      { name: '--space-1', value: '4px', description: 'Base unit (4px)' },
      { name: '--space-2', value: '8px', description: '2x base' },
      { name: '--space-3', value: '12px', description: '3x base' },
      { name: '--space-4', value: '16px', description: '4x base' },
      { name: '--space-5', value: '20px', description: '5x base' },
      { name: '--space-6', value: '24px', description: '6x base' },
      { name: '--space-8', value: '32px', description: '8x base' },
      { name: '--space-10', value: '40px', description: '10x base' },
      { name: '--space-12', value: '48px', description: '12x base' },
      { name: '--space-16', value: '64px', description: '16x base' },
      { name: '--space-20', value: '80px', description: '20x base' },
      { name: '--space-24', value: '96px', description: '24x base' },
      { name: '--space-32', value: '128px', description: '32x base' },
    ],
  },
  radius: {
    scale: [
      { name: '--radius-xs', value: '4px', description: 'Extra small' },
      { name: '--radius-sm', value: '8px', description: 'Small' },
      { name: '--radius-md', value: '12px', description: 'Medium (default)' },
      { name: '--radius-lg', value: '16px', description: 'Large' },
      { name: '--radius-xl', value: '20px', description: 'Extra large' },
      { name: '--radius-2xl', value: '28px', description: '2x large' },
      { name: '--radius-full', value: '9999px', description: 'Fully rounded' },
    ],
  },
  shadows: {
    elevation: [
      { name: '--shadow-xs', value: '0 1px 2px rgba(13, 13, 13, 0.04)', description: 'Subtle elevation' },
      { name: '--shadow-sm', value: '0 2px 8px rgba(13, 13, 13, 0.06)', description: 'Small elevation' },
      { name: '--shadow-md', value: '0 4px 16px rgba(13, 13, 13, 0.08)', description: 'Medium elevation' },
      { name: '--shadow-lg', value: '0 8px 32px rgba(13, 13, 13, 0.1)', description: 'Large elevation' },
      { name: '--shadow-xl', value: '0 16px 48px rgba(13, 13, 13, 0.12)', description: 'Extra large elevation' },
      { name: '--shadow-2xl', value: '0 24px 64px rgba(13, 13, 13, 0.15)', description: 'Maximum elevation' },
    ],
    special: [
      { name: '--shadow-gold', value: '0 8px 24px rgba(201, 168, 76, 0.25)', description: 'Gold accent shadow' },
      { name: '--shadow-focus', value: '0 0 0 3px rgba(201, 168, 76, 0.4)', description: 'Focus ring' },
      { name: '--shadow-card', value: '0 2px 12px rgba(13, 13, 13, 0.05)', description: 'Card shadow' },
      { name: '--shadow-elevated', value: '0 12px 40px rgba(13, 13, 13, 0.1)', description: 'Elevated card shadow' },
    ],
  },
  animations: {
    easing: [
      { name: '--ease-standard', value: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', description: 'Standard easing' },
      { name: '--ease-expressive', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', description: 'Expressive/spring' },
      { name: '--ease-spring', value: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', description: 'Spring physics' },
      { name: '--ease-decelerate', value: 'cubic-bezier(0, 0, 0.2, 1)', description: 'Decelerate' },
      { name: '--ease-accelerate', value: 'cubic-bezier(0.4, 0, 1, 1)', description: 'Accelerate' },
      { name: '--ease-magnetic', value: 'cubic-bezier(0.23, 1, 0.32, 1)', description: 'Magnetic attraction' },
    ],
    duration: [
      { name: '--duration-instant', value: '75ms', description: 'Instant feedback' },
      { name: '--duration-fast', value: '150ms', description: 'Fast transitions' },
      { name: '--duration-base', value: '250ms', description: 'Base duration' },
      { name: '--duration-slow', value: '400ms', description: 'Slow transitions' },
      { name: '--duration-slower', value: '600ms', description: 'Slower transitions' },
      { name: '--duration-slowest', value: '800ms', description: 'Slowest transitions' },
    ],
    magnetic: [
      { name: '--magnetic-strength', value: '0.3', description: 'Magnetic pull strength' },
      { name: '--magnetic-radius', value: '60px', description: 'Magnetic activation radius' },
      { name: '--magnetic-damping', value: '0.8', description: 'Magnetic damping' },
      { name: '--magnetic-stiffness', value: '300', description: 'Magnetic stiffness' },
    ],
  },
  breakpoints: {
    scale: [
      { name: '--bp-xs', value: '320px', description: 'Extra small phones' },
      { name: '--bp-sm', value: '640px', description: 'Small phones' },
      { name: '--bp-md', value: '768px', description: 'Tablets' },
      { name: '--bp-lg', value: '1024px', description: 'Small laptops' },
      { name: '--bp-xl', value: '1280px', description: 'Large laptops' },
      { name: '--bp-2xl', value: '1536px', description: 'Desktop' },
    ],
  },
  misc: {
    container: [
      { name: '--container-max', value: '1440px', description: 'Max container width' },
      { name: '--container-padding', value: '24px', description: 'Container horizontal padding' },
    ],
    header: [
      { name: '--header-height', value: '72px', description: 'Desktop header height' },
      { name: '--header-height-mobile', value: '64px', description: 'Mobile header height' },
    ],
  },
};

export default function AdminDesignTokensPage() {
  const [activeCategory, setActiveCategory] = useState<string>('colors');
  const [activeSubCategory, setActiveSubCategory] = useState<string>('core');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [editingToken, setEditingToken] = useState<Token | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editDarkValue, setEditDarkValue] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const currentCategory = tokenCategories.find(c => c.id === activeCategory);
  const subCategories = Object.keys(mockTokens[activeCategory as keyof MockTokens]);
  const tokens = mockTokens[activeCategory as keyof MockTokens]?.[activeSubCategory] || [];

  const handleSyncTokens = async () => {
    setIsSyncing(true);
    // In real app: call API to sync from Supabase
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastSynced(new Date());
    setIsSyncing(false);
  };

  const handleSaveTokens = async () => {
    // In real app: save to Supabase and trigger sync
    alert('Tokens saved! Changes will be live after sync.');
  };

  const handleEditToken = (token: Token) => {
    setEditingToken(token);
    setEditValue(token.value);
    setEditDarkValue('darkValue' in token ? token.darkValue || '' : '');
  };

  const handleSaveEdit = () => {
    if (editingToken) {
      // In real app: update token in database
      console.log('Save token:', editingToken.name, editValue, editDarkValue);
    }
    setEditingToken(null);
  };

  const generateCSS = () => {
    let css = ':root {\n';
    (Object.entries(mockTokens) as [keyof MockTokens, CategoryTokens][]).forEach(([category, subcats]) => {
      css += `  /* ${category.toUpperCase()} */\n`;
      (Object.entries(subcats) as [string, SubCategoryTokens][]).forEach(([subcat, tokens]) => {
        tokens.forEach((token: Token) => {
          css += `  ${token.name}: ${token.value};\n`;
        });
      });
      css += '\n';
    });
    css += '}\n\n.dark {\n';
    (Object.entries(mockTokens) as [keyof MockTokens, CategoryTokens][]).forEach(([category, subcats]) => {
      (Object.entries(subcats) as [string, SubCategoryTokens][]).forEach(([subcat, tokens]) => {
        tokens.forEach((token: Token) => {
          if ('darkValue' in token && token.darkValue) {
            css += `  ${token.name}: ${token.darkValue};\n`;
          }
        });
      });
    });
    css += '}';
    return css;
  };

  const copyCSS = () => {
    navigator.clipboard.writeText(generateCSS());
    alert('CSS copied to clipboard!');
  };

  const downloadCSS = () => {
    const blob = new Blob([generateCSS()], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design-tokens.css';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)]">Design Tokens</h1>
          <p className="text-[var(--color-slate)] mt-1">Manage design system tokens - colors, typography, spacing, shadows, animations</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={copyCSS} disabled={isSyncing}>
            <Copy className="h-4 w-4 mr-2" /> Copy CSS
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCSS} disabled={isSyncing}>
            <Download className="h-4 w-4 mr-2" /> Download CSS
          </Button>
          <Button variant="secondary" size="sm" onClick={handleSyncTokens} disabled={isSyncing}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isSyncing && 'animate-spin')} />
            {isSyncing ? 'Syncing...' : 'Sync from Supabase'}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSaveTokens}>
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </div>
      </motion.div>

      {/* Theme Toggle & Last Sync */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-xl)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--color-slate)]">Preview Mode:</span>
          <div className="flex bg-[var(--color-whisper)] rounded-[var(--radius-lg)] p-1">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all',
                theme === 'light'
                  ? 'bg-[var(--color-white)] text-[var(--color-ink)] shadow-[var(--shadow-sm)]'
                  : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
              )}
              aria-pressed={theme === 'light'}
            >
              <Sun className="h-4 w-4 mr-1 inline" /> Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all',
                theme === 'dark'
                  ? 'bg-[var(--color-white)] text-[var(--color-ink)] shadow-[var(--shadow-sm)]'
                  : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
              )}
              aria-pressed={theme === 'dark'}
            >
              <Moon className="h-4 w-4 mr-1 inline" /> Dark
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-[var(--color-slate)]">
          {lastSynced && (
            <span>Last synced: {lastSynced.toLocaleTimeString()}</span>
          )}
          <Badge variant="outline">v1.0.0</Badge>
        </div>
      </motion.div>

      {/* Category Navigation & Token Editor */}
      <motion.div
        className="grid lg:grid-cols-[280px_1fr] gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Category Sidebar */}
        <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] overflow-y-auto">
          <Card variant="elevated" padding="none">
            <CardHeader className="p-4 border-b border-[var(--color-whisper)]">
              <CardTitle className="text-[var(--font-display)] text-base">Token Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1 p-2" aria-label="Token categories">
                {tokenCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id);
                      setActiveSubCategory(Object.keys(mockTokens[category.id as keyof typeof mockTokens])[0] || '');
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-lg)] transition-all duration-150 text-left',
                      activeCategory === category.id
                        ? 'bg-[var(--color-gold-light)] text-[var(--color-gold)]'
                        : 'text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)]'
                    )}
                    aria-current={activeCategory === category.id ? 'page' : undefined}
                  >
                    <category.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    <span className="flex-1 truncate font-medium">{category.label}</span>
                    <Badge variant="outline" className="text-[10px]">{category.count}</Badge>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Sub-category tabs */}
          {subCategories.length > 1 && (
            <Card variant="elevated" padding="none" className="mt-4">
              <CardContent className="p-2">
                <div className="flex flex-wrap gap-1" role="tablist">
                  {subCategories.map((subcat) => (
                    <button
                      key={subcat}
                      onClick={() => setActiveSubCategory(subcat)}
                      className={cn(
                        'px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium transition-all',
                        activeSubCategory === subcat
                          ? 'bg-[var(--color-gold-light)] text-[var(--color-gold)]'
                          : 'text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)]'
                      )}
                      role="tab"
                      aria-selected={activeSubCategory === subcat}
                    >
                      {subcat.charAt(0).toUpperCase() + subcat.slice(1)}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card variant="outlined" padding="lg" className="mt-4">
            <h3 className="text-[var(--font-display)] text-sm font-medium text-[var(--color-ink)] mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={copyCSS}>
                <Code className="h-4 w-4" /> Copy All CSS Variables
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={downloadCSS}>
                <Download className="h-4 w-4" /> Download tokens.css
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={handleSyncTokens} disabled={isSyncing}>
                <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-spin')} /> Sync from Supabase
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Upload className="h-4 w-4" /> Import from JSON
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" /> Add Custom Token
              </Button>
            </div>
          </Card>
        </div>

        {/* Token Editor Panel */}
        <div>
          <Card variant="elevated" padding="lg">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--color-whisper)] pb-4 mb-6">
              <div>
                <Badge variant="outline" className="text-xs mb-2">{activeSubCategory}</Badge>
                <CardTitle className="text-[var(--font-display)] text-lg">
                  {currentCategory?.label} / {activeSubCategory.charAt(0).toUpperCase() + activeSubCategory.slice(1)}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--color-slate)]">{tokens.length} tokens</span>
                <Button variant="outline" size="sm" onClick={() => setEditingToken({ name: '', value: '', darkValue: '', description: '' })}>
                  <Plus className="h-4 w-4 mr-1" /> Add Token
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {/* Tokens Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">Token Name</TableHead>
                      <TableHead className="w-40">Light Value</TableHead>
                      <TableHead className="w-40">Dark Value</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokens.map((token: Token, index: number) => (
                      <TableRow
                        key={token.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className={editingToken?.name === token.name ? 'bg-[var(--color-gold-light)]/20' : ''}
                      >
                        <TableCell className="w-48 font-mono text-sm text-[var(--color-ink)]">{token.name}</TableCell>
                        <TableCell className="w-40">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-[var(--radius-md)] border border-[var(--color-whisper)] flex-shrink-0"
                              style={{ backgroundColor: token.value }}
                              title={token.value}
                            />
                            <span className="font-mono text-sm text-[var(--color-slate)]">{token.value}</span>
                          </div>
                        </TableCell>
                        <TableCell className="w-40">
                          <div className="flex items-center gap-2">
                            {(() => {
                              const darkValue = 'darkValue' in token ? token.darkValue : token.value;
                              return (
                                <>
                                  <div
                                    className="w-8 h-8 rounded-[var(--radius-md)] border border-[var(--color-whisper)] flex-shrink-0"
                                    style={{ backgroundColor: darkValue }}
                                    title={darkValue}
                                  />
                                  <span className="font-mono text-sm text-[var(--color-slate)]">{'darkValue' in token ? token.darkValue || 'inherit' : 'inherit'}</span>
                                </>
                              );
                            })()}
                          </div>
                        </TableCell>
                        <TableCell className="text-[var(--color-slate)] text-sm max-w-xs truncate">{token.description}</TableCell>
                        <TableCell className="w-32">
                          <div className="flex items-center justify-center gap-1">
                            {editingToken?.name === token.name ? (
                              <>
                                <Button variant="primary" size="sm" className="p-1.5 h-8" onClick={handleSaveEdit} aria-label="Save">
                                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                                </Button>
                                <Button variant="ghost" size="sm" className="p-1.5 h-8" onClick={() => setEditingToken(null)} aria-label="Cancel">
                                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button variant="ghost" size="sm" className="p-1.5" onClick={() => handleEditToken(token)} aria-label={`Edit ${token.name}`}>
                                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                </Button>
                                <Button variant="ghost" size="sm" className="p-1.5" onClick={() => { navigator.clipboard.writeText(token.name); }} aria-label={`Copy ${token.name}`}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Edit Modal */}
              {editingToken && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-ink)]/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setEditingToken(null)}
                >
                  <motion.div
                    className="bg-[var(--color-white)] rounded-[var(--radius-xl)] p-6 w-full max-w-md"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[var(--font-display)] text-lg font-medium">
                        {editingToken.name ? `Edit ${editingToken.name}` : 'Add New Token'}
                      </h3>
                      <button onClick={() => setEditingToken(null)} className="p-1 text-[var(--color-slate)] hover:text-[var(--color-ink)]" aria-label="Close">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </div>
                    <div className="space-y-4">
                      {editingToken.name && (
                        <div>
                          <label className="input-label">Token Name</label>
                          <Input value={editingToken.name} disabled className="bg-[var(--color-snow)]" />
                        </div>
                      )}
                      {!editingToken.name && (
                        <div>
                          <label className="input-label">Token Name *</label>
                          <Input
                            value={editingToken.name}
                            onChange={e => setEditingToken({ ...editingToken!, name: e.target.value })}
                            placeholder="--color-custom"
                          />
                        </div>
                      )}
                      <div>
                        <label className="input-label">Light Mode Value *</label>
                        <Input
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          placeholder="#C9A84C or 16px or cubic-bezier(...)"
                        />
                      </div>
                      <div>
                        <label className="input-label">Dark Mode Value (optional)</label>
                        <Input
                          value={editDarkValue}
                          onChange={e => setEditDarkValue(e.target.value)}
                          placeholder="#D4B85C (leave empty to inherit light value)"
                        />
                      </div>
                      <div>
                        <label className="input-label">Description</label>
                        <Input placeholder="Brief description of this token" />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <Button variant="outline" className="flex-1" onClick={() => setEditingToken(null)}>Cancel</Button>
                      <Button variant="primary" className="flex-1" onClick={handleSaveEdit}>
                        {editingToken.name ? 'Save Changes' : 'Add Token'}
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* CSS Preview */}
              <div className="mt-8 border-t border-[var(--color-whisper)] pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[var(--font-display)] text-base font-medium">Generated CSS</h3>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={copyCSS}>
                      <Copy className="h-4 w-4 mr-1" /> Copy
                    </Button>
                    <Button variant="ghost" size="sm" onClick={downloadCSS}>
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <pre className="bg-[var(--color-charcoal)] text-[var(--color-snow)] p-4 rounded-[var(--radius-lg)] overflow-x-auto max-h-96 font-mono text-sm line-height-loose">
                    {generateCSS()}
                  </pre>
                  <div className="absolute bottom-2 right-2 text-xs text-[var(--color-mist)]">
                    {theme === 'light' ? ':root' : '.dark'} mode
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}