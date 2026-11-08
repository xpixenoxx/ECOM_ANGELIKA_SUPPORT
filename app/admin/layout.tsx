'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard,
  FileText,
  Palette,
  Package,
  ShoppingBag,
  Tag,
  Ticket,
  Package2,
  Truck,
  RotateCcw,
  Users,
  UserCog,
  Sparkles,
  MessageSquare,
  Send,
  GitBranch,
  BarChart2,
  Filter,
  Users2,
  Award,
  CreditCard,
  Truck as TruckIcon,
  Percent,
  Mail,
  Zap,
  Bell,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Search,
  Plus,
  MoreVertical,
  Home,
  ArrowRight,
  Star,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTheme } from '@/lib/hooks/useTheme';

const navigation = [
  {
    group: 'Dashboard',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    ],
  },
  {
    group: 'Content',
    items: [
      { href: '/admin/content', label: 'Pages', icon: FileText, badge: null },
      { href: '/admin/content/blocks', label: 'Blocks', icon: FileText, badge: null },
      { href: '/admin/content/tokens', label: 'Design Tokens', icon: Palette, badge: null },
    ],
  },
  {
    group: 'Commerce',
    items: [
      { href: '/admin/products', label: 'Products', icon: Package, badge: null },
      { href: '/admin/products/reviews', label: 'Reviews', icon: Star, badge: null },
      { href: '/admin/products/categories', label: 'Categories', icon: Tag, badge: null },
      { href: '/admin/products/coupons', label: 'Coupons', icon: Ticket, badge: null },
      { href: '/admin/products/inventory', label: 'Inventory', icon: Package2, badge: null },
    ],
  },
  {
    group: 'Orders',
    items: [
      { href: '/admin/orders', label: 'All Orders', icon: ShoppingBag, badge: null },
      { href: '/admin/orders/returns', label: 'Returns', icon: RotateCcw, badge: null },
      { href: '/admin/orders/shipments', label: 'Shipments', icon: Truck, badge: null },
    ],
  },
  {
    group: 'Customers',
    items: [
      { href: '/admin/customers', label: 'All Customers', icon: Users, badge: null },
      { href: '/admin/customers/circle', label: 'Angelika Circle', icon: Sparkles, badge: null },
      { href: '/admin/customers/segments', label: 'Segments', icon: UserCog, badge: null },
    ],
  },
  {
    group: 'WhatsApp',
    items: [
      { href: '/admin/whatsapp', label: 'Conversations', icon: MessageSquare, badge: '12' },
      { href: '/admin/whatsapp/templates', label: 'Templates', icon: Send, badge: null },
      { href: '/admin/whatsapp/flows', label: 'Flows', icon: GitBranch, badge: null },
    ],
  },
  {
    group: 'Analytics',
    items: [
      { href: '/admin/analytics', label: 'Overview', icon: BarChart2, badge: null },
      { href: '/admin/analytics/funnel', label: 'Funnel', icon: Filter, badge: null },
      { href: '/admin/analytics/cohorts', label: 'Cohorts', icon: Users2, badge: null },
      { href: '/admin/analytics/products', label: 'Products', icon: Award, badge: null },
    ],
  },
  {
    group: 'Settings',
    items: [
      { href: '/admin/settings/payments', label: 'Payments', icon: CreditCard, badge: null },
      { href: '/admin/settings/shipping', label: 'Shipping', icon: TruckIcon, badge: null },
      { href: '/admin/settings/taxes', label: 'Taxes', icon: Percent, badge: null },
      { href: '/admin/settings/emails', label: 'Emails', icon: Mail, badge: null },
      { href: '/admin/settings/webhooks', label: 'Webhooks', icon: Zap, badge: null },
      { href: '/admin/settings/notifications', label: 'Notifications', icon: Bell, badge: null },
    ],
  },
];

const ADMIN_NAV_WIDTH = 260;
const ADMIN_NAV_WIDTH_COLLAPSED = 72;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Authentication removed per user request for direct admin access

  const getActiveItem = () => {
    for (const section of navigation) {
      for (const item of section.items) {
        if (pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'))) {
          return item;
        }
      }
    }
    return null;
  };

  const activeItem = getActiveItem();

  return (
    <div className="min-h-screen bg-[var(--color-snow)]">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[var(--color-ink)]/50 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        <motion.aside
          key={isSidebarCollapsed ? 'collapsed' : 'expanded'}
          initial={{ width: isSidebarCollapsed ? ADMIN_NAV_WIDTH_COLLAPSED : ADMIN_NAV_WIDTH }}
          animate={{ width: isSidebarCollapsed ? ADMIN_NAV_WIDTH_COLLAPSED : ADMIN_NAV_WIDTH }}
          exit={{ width: 0 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className={cn(
            'fixed left-0 top-0 z-50 h-full bg-[var(--color-white)] border-r border-[var(--color-whisper)]',
            'flex flex-col overflow-y-auto',
            isSidebarCollapsed ? 'w-[72px]' : 'w-[260px]',
            'hidden lg:flex'
          )}
          style={{ transform: isMobileSidebarOpen ? 'translateX(0)' : undefined }}
        >
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--color-whisper)]">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-hover)] flex items-center justify-center">
                <span className="text-[var(--font-display)] text-[var(--color-ink)] font-bold text-lg">A</span>
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)]">
                  Angelika
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-whisper)] transition-colors text-[var(--color-slate)]"
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!isSidebarCollapsed}
            >
              {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-6 overflow-y-auto" role="navigation" aria-label="Admin navigation">
            {navigation.map((section) => (
              <div key={section.group} className="space-y-1">
                {!isSidebarCollapsed && (
                  <h3 className="px-3 text-xs font-semibold text-[var(--color-mist)] uppercase tracking-wider mb-2">
                    {section.group}
                  </h3>
                )}
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-lg)] transition-all duration-150',
                        'relative overflow-hidden',
                        isActive
                          ? 'bg-[var(--color-gold-light)] text-[var(--color-gold)]'
                          : 'text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)]',
                        isSidebarCollapsed ? 'justify-center' : ''
                      )}
                      aria-current={isActive ? 'page' : undefined}
                      title={isSidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                      {!isSidebarCollapsed && (
                        <>
                          <span className="flex-1 truncate font-medium">{item.label}</span>
                          {item.badge && (
                            <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--color-gold-light)] text-[var(--color-gold)]">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--color-whisper)]">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-lg)] transition-all duration-150',
                'text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)]',
                isSidebarCollapsed ? 'justify-center' : ''
              )}
              title={isSidebarCollapsed ? 'View Store' : undefined}
            >
              <Home className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              {!isSidebarCollapsed && <span className="font-medium">View Store</span>}
            </Link>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Main Content */}
      <div
        className={cn(
          'min-h-screen transition-all duration-250 ease-[var(--ease-standard)]',
          isSidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'
        )}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[var(--color-white)] border-b border-[var(--color-whisper)]">
          <div className="flex items-center justify-between h-16 px-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-whisper)] transition-colors text-[var(--color-slate)]"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Page Title */}
            <div className="flex-1 lg:pl-8">
              <h1 className={cn(
                'text-[var(--font-display)] font-medium truncate',
                isSidebarCollapsed ? 'text-2xl' : 'text-xl'
              )}>
                {activeItem?.label || 'Dashboard'}
              </h1>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-mist)]" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search admin..."
                  className="w-64 pl-10 pr-4 py-2 bg-[var(--color-snow)] border border-[var(--color-whisper)] rounded-[var(--radius-md)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20 transition-all"
                  aria-label="Search admin panel"
                />
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-whisper)] transition-colors text-[var(--color-slate)]"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-whisper)] transition-colors"
                  aria-label="User menu"
                  aria-expanded="false"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center">
                    <span className="text-[var(--font-display)] text-[var(--color-gold)] font-bold text-sm">
                      {user?.email?.charAt(0).toUpperCase() || 'V'}
                    </span>
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="text-sm font-medium text-[var(--color-ink)] hidden md:block">
                      {user?.email || 'Admin'}
                    </span>
                  )}
                  {!isSidebarCollapsed && <ChevronRight className="h-4 w-4 text-[var(--color-mist)]" />}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}