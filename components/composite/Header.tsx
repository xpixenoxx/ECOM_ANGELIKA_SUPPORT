'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown, DropdownMenu, DropdownItem } from '@/components/ui/Dropdown';
import { CartDrawer, CartItem } from '@/components/ui/Drawer';
import { SearchDropdown } from '@/components/ui/SearchDropdown';
import { AuthModal } from '@/components/ui/AuthModal';
import { useCart } from '@/lib/hooks/useCart';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { useAuth } from '@/lib/hooks/useAuth';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  megaMenu?: {
    columns: Array<{
      title: string;
      links: Array<{ label: string; href: string }>;
    }>;
    featured?: {
      image: string;
      title: string;
      description: string;
      href: string;
      cta: string;
    };
  };
}

export interface HeaderProps {
  logo?: ReactNode;
  logoHref?: string;
  brandName?: string;
  brandTagline?: string;
  logoUrl?: string;
  navigation?: NavItem[];
  searchPlaceholder?: string;
  showAccount?: boolean;
  showWishlist?: boolean;
  showCart?: boolean;
  cartItems?: CartItem[];
  cartSubtotal?: number;
  cartTotal?: number;
  onCartUpdateQuantity?: (id: string, quantity: number) => void;
  onCartRemoveItem?: (id: string) => void;
  onCartProceedToCheckout?: () => void;
  onSearch?: (query: string) => void;
  onApplyCoupon?: (code: string) => void;
  onRemoveCoupon?: () => void;
  className?: string;
}

const defaultNavigation: NavItem[] = [
  {
    label: 'Kurtis',
    href: '/shop/kurtis',
    children: [
      { label: 'All Kurtis', href: '/shop/kurtis' },
      { label: 'Short Kurtis', href: '/shop/kurtis?length=short' },
      { label: 'Knee Length', href: '/shop/kurtis?length=knee' },
      { label: 'Anarkali Kurtis', href: '/shop/kurtis?type=anarkali' },
      { label: 'Cotton Kurtis', href: '/shop/kurtis?fabric=cotton' },
      { label: 'Festive Kurtis', href: '/shop/kurtis?occasion=festive' },
    ],
    megaMenu: {
      columns: [
        {
          title: 'By Length & Cut',
          links: [
            { label: 'Short (Above Knee)', href: '/shop/kurtis?length=short' },
            { label: 'Knee Length', href: '/shop/kurtis?length=knee' },
            { label: 'Calf & Ankle Length', href: '/shop/kurtis?length=calf' },
            { label: 'Anarkali & Flared', href: '/shop/kurtis?type=anarkali' },
            { label: 'Straight Cut', href: '/shop/kurtis?type=straight' },
          ],
        },
        {
          title: 'By Occasion',
          links: [
            { label: 'Daily & Casual Wear', href: '/shop/kurtis?occasion=daily' },
            { label: 'Work & Office Wear', href: '/shop/kurtis?occasion=office' },
            { label: 'Festive Celebrations', href: '/shop/kurtis?occasion=festive' },
            { label: 'Evening & Parties', href: '/shop/kurtis?occasion=party' },
          ],
        },
        {
          title: 'By Fabric & Craft',
          links: [
            { label: 'Hand-Block Printed Cotton', href: '/shop/kurtis?fabric=cotton' },
            { label: 'Chanderi Silk & Cotton', href: '/shop/kurtis?fabric=chanderi' },
            { label: 'Royal Velvet & Zari', href: '/shop/kurtis?fabric=velvet' },
            { label: 'Jaipur Gota Patti Kurta', href: '/shop/kurtis?type=gota-patti' },
          ],
        },
      ],
      featured: {
        image: '/images/collection-kurtis.jpg',
        title: "Vidhya's Pick: Hand Block Printed Kurti",
        description: 'Authentic Rajasthani hand block printing with natural botanical dyes.',
        href: '/product/hand-block-printed-kurti',
        cta: 'Shop Kurtis',
      },
    },
  },
  {
    label: 'Salwars',
    href: '/shop/salwars',
    children: [
      { label: 'All Salwar Suits', href: '/shop/salwars' },
      { label: 'Palazzo Sets', href: '/shop/salwars?type=palazzo' },
      { label: 'Churidar Sets', href: '/shop/salwars?type=churidar' },
      { label: 'Sharara Sets', href: '/shop/salwars?type=sharara' },
      { label: 'Anarkali Suits', href: '/shop/salwars?type=anarkali' },
    ],
    megaMenu: {
      columns: [
        {
          title: 'By Style & Silhouette',
          links: [
            { label: 'Palazzo Suit Sets', href: '/shop/salwars?type=palazzo' },
            { label: 'Classic Churidar Sets', href: '/shop/salwars?type=churidar' },
            { label: 'Straight Pant Suits', href: '/shop/salwars?type=pant' },
            { label: 'Flared Sharara Sets', href: '/shop/salwars?type=sharara' },
            { label: 'Floor-Length Anarkalis', href: '/shop/salwars?type=anarkali' },
          ],
        },
        {
          title: 'By Occasion',
          links: [
            { label: 'Wedding Guest & Mehendi', href: '/shop/salwars?occasion=wedding' },
            { label: 'Festive Celebrations', href: '/shop/salwars?occasion=festive' },
            { label: 'Office & Everyday Elegance', href: '/shop/salwars?occasion=office' },
            { label: 'Cocktail & Evening Parties', href: '/shop/salwars?occasion=party' },
          ],
        },
        {
          title: 'By Fabric & Weave',
          links: [
            { label: 'Mulberry Silk Blend', href: '/shop/salwars?fabric=silk' },
            { label: 'Flowing Pure Chiffon', href: '/shop/salwars?fabric=chiffon' },
            { label: 'Embroidered Georgette', href: '/shop/salwars?fabric=georgette' },
            { label: 'Breathable Chanderi', href: '/shop/salwars?fabric=chanderi' },
          ],
        },
      ],
      featured: {
        image: '/images/collection-salwars.jpg',
        title: "Editor's Choice: Chiffon Anarkali Set",
        description: 'Powder blue twirl-ready silhouette adorned with delicate artisanal threadwork.',
        href: '/product/chiffon-anarkali-set',
        cta: 'Shop Salwars',
      },
    },
  },
  {
    label: 'Lehengas',
    href: '/shop/lehengas',
    children: [
      { label: 'All Lehengas', href: '/shop/lehengas' },
      { label: 'Bridal Lehengas', href: '/shop/lehengas?type=bridal' },
      { label: 'Party Lehengas', href: '/shop/lehengas?type=party' },
      { label: 'Mirror Work Lehengas', href: '/shop/lehengas?type=mirror-work' },
      { label: 'Designer Lehengas', href: '/shop/lehengas?type=designer' },
    ],
    megaMenu: {
      columns: [
        {
          title: 'By Occasion & Style',
          links: [
            { label: 'Bridal & Wedding Lehengas', href: '/shop/lehengas?type=bridal' },
            { label: 'Sangeet & Cocktail Nights', href: '/shop/lehengas?occasion=party' },
            { label: 'Reception & Black-Tie', href: '/shop/lehengas?occasion=wedding' },
            { label: 'Lightweight Festive Lehengas', href: '/shop/lehengas?type=festive' },
          ],
        },
        {
          title: 'By Embroidery & Craft',
          links: [
            { label: 'Kutch Mirror Work', href: '/shop/lehengas?type=mirror-work' },
            { label: 'Gold Zari & Zardozi', href: '/shop/lehengas?type=zari' },
            { label: 'Gota Patti Embroidery', href: '/shop/lehengas?type=gota-patti' },
            { label: 'Handcrafted Resham Threadwork', href: '/shop/lehengas?type=resham' },
          ],
        },
        {
          title: 'By Fabric',
          links: [
            { label: 'Raw Silk & Brocade', href: '/shop/lehengas?fabric=silk' },
            { label: 'Plush Heritage Velvet', href: '/shop/lehengas?fabric=velvet' },
            { label: 'Ethereal Organza', href: '/shop/lehengas?fabric=organza' },
            { label: 'Heavy Georgette', href: '/shop/lehengas?fabric=georgette' },
          ],
        },
      ],
      featured: {
        image: '/images/collection-lehengas.jpg',
        title: 'Masterpiece: Crimson Mirror Work Lehenga',
        description: 'Authentic hand-embroidered Kutch mirrors on deep crimson raw silk.',
        href: '/product/mirror-work-lehenga',
        cta: 'Shop Lehengas',
      },
    },
  },
  {
    label: 'Sarees',
    href: '/shop/sarees',
    children: [
      { label: 'All Sarees', href: '/shop/sarees' },
      { label: 'Silk Sarees', href: '/shop/sarees?type=silk' },
      { label: 'Banarasi Sarees', href: '/shop/sarees?type=banarasi' },
      { label: 'Tissue Sarees', href: '/shop/sarees?type=tissue' },
      { label: 'Organza Sarees', href: '/shop/sarees?type=organza' },
    ],
    megaMenu: {
      columns: [
        {
          title: 'By Weave & Heritage',
          links: [
            { label: 'Banarasi Tissue Sarees', href: '/shop/sarees?type=banarasi' },
            { label: 'Pure Mulberry Silk Sarees', href: '/shop/sarees?type=silk' },
            { label: 'Sheer Floral Organza', href: '/shop/sarees?type=organza' },
            { label: 'Kanjivaram Style Weaves', href: '/shop/sarees?type=kanjivaram' },
            { label: 'Chanderi Silk-Cotton', href: '/shop/sarees?fabric=chanderi' },
          ],
        },
        {
          title: 'By Occasion',
          links: [
            { label: 'Bridal & Wedding Trousseau', href: '/shop/sarees?occasion=wedding' },
            { label: 'Festive Puja & Celebrations', href: '/shop/sarees?occasion=festive' },
            { label: 'Cocktail & Evening Parties', href: '/shop/sarees?occasion=party' },
            { label: 'Everyday Classic Drapes', href: '/shop/sarees?occasion=casual' },
          ],
        },
        {
          title: 'By Fabric & Sheen',
          links: [
            { label: 'Pure Mulberry Silk', href: '/shop/sarees?fabric=silk' },
            { label: 'Handwoven Tissue Silk', href: '/shop/sarees?fabric=tissue' },
            { label: 'Lightweight Organza', href: '/shop/sarees?fabric=organza' },
            { label: 'Delicate Chiffon', href: '/shop/sarees?fabric=chiffon' },
          ],
        },
      ],
      featured: {
        image: '/images/collection-sarees.jpg',
        title: 'Heritage Weave: Mulberry Silk Saree',
        description: 'Ivory pure mulberry silk with rich gold zari borders that drape like a dream.',
        href: '/product/mulberry-silk-saree',
        cta: 'Shop Sarees',
      },
    },
  },
  {
    label: 'Dupattas',
    href: '/shop/dupattas',
    children: [
      { label: 'All Dupattas', href: '/shop/dupattas' },
      { label: 'Embroidered Dupattas', href: '/shop/dupattas?type=embroidered' },
      { label: 'Gota Patti Dupattas', href: '/shop/dupattas?type=gota-patti' },
      { label: 'Silk & Chiffon Dupattas', href: '/shop/dupattas?fabric=chiffon' },
    ],
    megaMenu: {
      columns: [
        {
          title: 'By Style & Work',
          links: [
            { label: 'Heavy Embroidered Drapes', href: '/shop/dupattas?type=embroidered' },
            { label: 'Jaipur Gota Patti Borders', href: '/shop/dupattas?type=gota-patti' },
            { label: 'Phulkari & Bandhani Art', href: '/shop/dupattas?type=phulkari' },
            { label: 'Hand Block Printed Mulmul', href: '/shop/dupattas?type=block-print' },
          ],
        },
        {
          title: 'By Border & Detailing',
          links: [
            { label: 'Scalloped Embroidered Borders', href: '/shop/dupattas?type=scalloped' },
            { label: 'Gold & Silver Zari Lace', href: '/shop/dupattas?type=zari' },
            { label: 'Handcrafted Tassels & Latkans', href: '/shop/dupattas?type=tassels' },
            { label: 'Minimalist Piping & Borders', href: '/shop/dupattas?type=minimal' },
          ],
        },
        {
          title: 'By Fabric',
          links: [
            { label: 'Pure Organza Silk', href: '/shop/dupattas?fabric=organza' },
            { label: 'Weightless Pure Chiffon', href: '/shop/dupattas?fabric=chiffon' },
            { label: 'Tussar & Matka Silk', href: '/shop/dupattas?fabric=silk' },
            { label: 'Fine Mulmul Cotton', href: '/shop/dupattas?fabric=cotton' },
          ],
        },
      ],
      featured: {
        image: '/images/collection-dupattas.jpg',
        title: 'Artisanal Accent: Embroidered Dupatta',
        description: 'Statement gota patti border hand-finished by master craftspeople in Jaipur.',
        href: '/product/embroidered-dupatta',
        cta: 'Shop Dupattas',
      },
    },
  },
  {
    label: 'New Arrivals',
    href: '/new-arrivals',
    children: [
      { label: 'All New Arrivals', href: '/new-arrivals' },
      { label: "Vidhya's Latest Picks", href: '/vidhyas-picks' },
      { label: 'New Season Kurtis', href: '/shop/kurtis' },
      { label: 'New Festive Sarees', href: '/shop/sarees' },
    ],
    megaMenu: {
      columns: [
        {
          title: 'Latest Additions',
          links: [
            { label: 'New Season Kurtis', href: '/shop/kurtis' },
            { label: 'Latest Salwar & Palazzo Sets', href: '/shop/salwars' },
            { label: 'Bridal & Party Lehengas', href: '/shop/lehengas' },
            { label: 'Fresh Saree Weaves', href: '/shop/sarees' },
          ],
        },
        {
          title: 'Trending Themes',
          links: [
            { label: "Vidhya's Personal Picks", href: '/vidhyas-picks' },
            { label: 'Monsoon Florals & Pastels', href: '/shop/kurtis?fabric=cotton' },
            { label: 'Royal Wedding Edit', href: '/shop/lehengas?type=bridal' },
            { label: 'Handcrafted Luxury Dupattas', href: '/shop/dupattas' },
          ],
        },
        {
          title: 'Special Features',
          links: [
            { label: 'Limited Edition Collections', href: '/new-arrivals' },
            { label: 'Custom Tailoring & Sizing', href: '/size-guide' },
            { label: 'Styling Consultation', href: '/about/vidhya' },
          ],
        },
      ],
      featured: {
        image: '/images/collection-new-arrivals.jpg',
        title: 'Fresh Couture Arrivals',
        description: 'Explore the latest handcrafted pieces personally curated by designer Vidhya.',
        href: '/new-arrivals',
        cta: 'Explore New In',
      },
    },
  },
  {
    label: 'Sale',
    href: '/sale',
    children: [
      { label: 'All Sale Items', href: '/sale' },
      { label: 'Kurtis on Sale', href: '/shop/kurtis' },
      { label: 'Salwar Sets on Sale', href: '/shop/salwars' },
      { label: 'Sarees on Sale', href: '/shop/sarees' },
    ],
    megaMenu: {
      columns: [
        {
          title: 'Curated Deals',
          links: [
            { label: 'Kurtis with Savings', href: '/shop/kurtis' },
            { label: 'Salwar & Palazzo Suits', href: '/shop/salwars' },
            { label: 'Handwoven Sarees', href: '/shop/sarees' },
            { label: 'Festive Lehengas', href: '/shop/lehengas' },
          ],
        },
        {
          title: 'Special Discounts',
          links: [
            { label: 'Up to 25% Off Kurtis', href: '/shop/kurtis' },
            { label: 'Up to 20% Off Festive Wear', href: '/sale' },
            { label: 'End of Season Clearance', href: '/sale' },
            { label: 'Complete Wardrobe Sets', href: '/shop' },
          ],
        },
        {
          title: 'Customer Perks',
          links: [
            { label: 'Free Insured Express Shipping', href: '/shipping' },
            { label: '15-Day Easy Exchanges', href: '/returns' },
            { label: 'WhatsApp Concierge', href: '/contact' },
          ],
        },
      ],
      featured: {
        image: '/images/collection-sale.jpg',
        title: 'Festive Season Clearance',
        description: 'Enjoy exclusive savings on timeless luxury Indian ethnic silhouettes.',
        href: '/sale',
        cta: 'Shop Sale',
      },
    },
  },
];

function getUserDisplayData(user: User | null): { name: string; email: string; avatarUrl?: string } | null {
  if (!user) return null;
  const metadata = user.user_metadata || {};
  return {
    name: metadata['full_name'] || metadata['name'] || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    avatarUrl: metadata['avatar_url'] || metadata['picture'],
  };
}

export function Header({
  logo,
  logoHref = '/',
  brandName = 'Angelika',
  brandTagline = 'Fashions',
  logoUrl = '/images/logo.png',
  navigation = defaultNavigation,
  searchPlaceholder = 'Search for kurtis, sarees, lehengas...',
  showAccount = true,
  showWishlist = true,
  showCart = true,
  cartItems = [],
  cartSubtotal = 0,
  cartTotal = 0,
  onCartUpdateQuantity,
  onCartRemoveItem,
  onCartProceedToCheckout,
  onSearch,
  onApplyCoupon,
  onRemoveCoupon,
  className = '',
}: HeaderProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { user, loading: authLoading } = useAuth();
  const cart = useCart();
  const { count: rawWishlistCount } = useWishlist();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Cart & wishlist state
  const wishlistCount = user ? rawWishlistCount : 0;
  const effectiveCartItems = cartItems.length > 0 ? cartItems : (cart.items as any);
  const effectiveSubtotal = cartSubtotal > 0 ? cartSubtotal : cart.subtotal;
  const effectiveTotal = cartTotal > 0 ? cartTotal : cart.total;
  const effectiveItemCount = cart.itemCount ?? (effectiveCartItems?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) ?? 0);
  const handleUpdateQuantity = onCartUpdateQuantity || cart.updateQuantity;
  const handleRemoveItem = onCartRemoveItem || cart.removeItem;
  const handleProceedToCheckout = onCartProceedToCheckout || (() => {
    if (!user) {
      setShowAuthModal(true);
      toast('Please sign in to proceed to checkout', { icon: '🛍️' });
    } else {
      router.push('/checkout');
    }
  });
  const handleApplyCoupon = onApplyCoupon || (async (code: string) => { await cart.applyCoupon(code); });
  const handleRemoveCoupon = onRemoveCoupon || cart.removeCoupon;

  // Global listener for auth:open event from hooks / components
  useEffect(() => {
    const handleOpenAuth = (e: any) => {
      setShowAuthModal(true);
      if (e.detail?.message) {
        toast(e.detail.message, { icon: '🔒' });
      }
    };
    window.addEventListener('auth:open', handleOpenAuth);
    return () => window.removeEventListener('auth:open', handleOpenAuth);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowSearchResults(true);
      }
      if (e.key === 'Escape') {
        setShowSearchResults(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery.trim());
      } else {
        router.push(`/vidhyas-picks?search=${encodeURIComponent(searchQuery.trim())}`);
      }
      setShowSearchResults(false);
    }
  };

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-200 ease-in-out',
          'bg-white shadow-sm border-b border-[var(--color-whisper)]',
          className
        )}
        role="banner"
      >
        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 gap-2 md:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <button
                className="lg:hidden p-2 rounded-[var(--radius-md)] text-[var(--color-ink)] hover:bg-[var(--color-whisper)] transition-colors"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={isMobileMenuOpen}
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              </button>

              <Link href={logoHref} className="flex-shrink-0 flex items-center gap-2 py-1" aria-label={`${brandName} ${brandTagline} - Home`}>
                {logo || (
                  <div className="flex items-center gap-2">
                    <img
                      src={logoUrl || "/images/logo.png"}
                      alt={`${brandName} ${brandTagline}`}
                      className="h-9 md:h-11 w-auto object-contain rounded-sm"
                    />
                    <div className="hidden sm:flex flex-col">
                      <span className="font-display text-lg md:text-xl font-bold tracking-tight text-[var(--color-ink)] leading-none">
                        {brandName}
                      </span>
                      {brandTagline ? (
                        <span className="text-[9px] tracking-[0.22em] text-[var(--color-gold)] uppercase font-semibold">
                          {brandTagline}
                        </span>
                      ) : null}
                    </div>
                  </div>
                )}
              </Link>

              <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 flex-1 max-w-3xl mx-2 xl:mx-4" role="navigation" aria-label="Main navigation">
                {navigation.map((item, index) => (
                  <NavItemComponent
                    key={item.href}
                    item={item}
                    index={index}
                    searchInputRef={searchInputRef}
                    setShowSearchResults={setShowSearchResults}
                  />
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              <div ref={searchContainerRef} className="hidden sm:block relative flex-1 max-w-md">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-mist)] pointer-events-none"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="search"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchResults(e.target.value.trim().length > 0);
                    }}
                    onFocus={() => { if (searchQuery.trim().length > 0) setShowSearchResults(true); }}

                    className="w-full h-10 pl-10 pr-10 py-2 text-sm bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-md)] focus:border-[var(--color-gold)] focus:outline-none focus:ring-3 focus:ring-[var(--color-gold)]/20 transition-all duration-200 placeholder:text-[var(--color-mist)] [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                    aria-label="Search products"
                    aria-autocomplete="list"
                    aria-controls="search-results"
                    aria-expanded={showSearchResults && searchQuery.length > 0}
                    autoComplete="off"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setShowSearchResults(false);
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--color-mist)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)] transition-colors"
                      aria-label="Clear search"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </form>
                <AnimatePresence>
                  {showSearchResults && searchQuery.trim().length > 0 && (
                    <SearchDropdown
                      query={searchQuery}
                      onClose={() => setShowSearchResults(false)}
                      onSearch={(q) => {
                        setShowSearchResults(false);
                        if (onSearch) onSearch(q);
                        else router.push(`/vidhyas-picks?search=${encodeURIComponent(q)}`);
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-1">
                {showWishlist && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        setShowAuthModal(true);
                        toast('Please sign in to view your wishlist', { icon: '🤍' });
                      } else {
                        router.push('/wishlist');
                      }
                    }}
                    className="p-2 rounded-[var(--radius-md)] text-[var(--color-ink)] hover:bg-[var(--color-whisper)] hover:text-[var(--color-gold)] transition-all duration-200 relative cursor-pointer"
                    aria-label={`Wishlist (${user ? wishlistCount : 0})`}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {wishlistCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#A84557] text-[10px] font-bold text-white leading-none shadow-xs">
                        {wishlistCount > 99 ? '99+' : wishlistCount}
                      </span>
                    )}
                  </button>
                )}

                {showCart && (
                  <CartButton
                    itemCount={effectiveItemCount}
                    subtotal={effectiveSubtotal}
                    total={effectiveTotal}
                    items={effectiveCartItems}
                    shipping={cart.shippingCost || 0}
                    tax={cart.taxAmount || 0}
                    discount={cart.discountAmount || 0}
                    couponCode={cart.appliedCoupon?.code}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onProceedToCheckout={handleProceedToCheckout}
                    onApplyCoupon={handleApplyCoupon}
                    onRemoveCoupon={handleRemoveCoupon}
                    onOpenAuth={() => {
                      setShowAuthModal(true);
                      toast('Please sign in to view your bag', { icon: '🛍️' });
                    }}
                  />
                )}

                {showAccount && (
                  <AccountDropdown
                    user={user}
                    isLoading={authLoading}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        logoUrl={logoUrl}
        brandName={brandName}
        brandTagline={brandTagline}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navigation={navigation}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showSearchResults={showSearchResults}
        setShowSearchResults={setShowSearchResults}
        onSearch={onSearch}
        user={getUserDisplayData(user)}
        cartItemCount={effectiveItemCount}
        onOpenAuth={() => setShowAuthModal(true)}
      />
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
          }}
          defaultTab="signin"
        />
      )}
    </>
  );
}

interface NavItemComponentProps {
  item: NavItem;
  index: number;
  searchInputRef: React.RefObject<HTMLInputElement>;
  setShowSearchResults: (show: boolean) => void;
}

function NavItemComponent({ item, index, searchInputRef, setShowSearchResults }: NavItemComponentProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasChildren = item.children && item.children.length > 0;
  const hasMegaMenu = Boolean(item.megaMenu && item.megaMenu.columns.length > 0);

  const isRightAligned = ['Sarees', 'Dupattas', 'Sale'].includes(item.label);
  const isCenterAligned = ['Lehengas', 'New Arrivals'].includes(item.label);

  const menuAlignmentClass = isRightAligned
    ? 'right-0'
    : isCenterAligned
      ? 'left-1/2 -translate-x-1/2'
      : 'left-0';

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={() => { setIsHovered(true); if (hasChildren || hasMegaMenu) setIsOpen(true); }}
      onMouseLeave={() => { setIsHovered(false); setIsOpen(false); }}
    >
      <Link
        href={item.href}
        className={cn(
          'px-2 xl:px-3 py-1.5 xl:py-2 text-xs xl:text-sm font-medium uppercase tracking-wider transition-colors duration-150 whitespace-nowrap inline-flex items-center',
          'hover:text-[var(--color-gold)]',
          isHovered && 'text-[var(--color-gold)]'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {item.label}
        {(hasChildren || hasMegaMenu) && (
          <svg className="ml-0.5 xl:ml-1 inline h-3.5 w-3.5 xl:h-4 xl:w-4 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        )}
      </Link>

      {isOpen && (hasChildren || hasMegaMenu) && (
        <AnimatePresence>
          <motion.div
            className={cn(
              "absolute top-full z-[var(--z-dropdown)] bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] overflow-hidden",
              hasMegaMenu ? "w-[760px] lg:w-[840px]" : "min-w-[200px] md:min-w-[240px]",
              menuAlignmentClass
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            role="menu"
          >
            {hasMegaMenu && item.megaMenu ? (
              <div className="flex flex-col md:flex-row items-stretch">
                {/* 3 Columns */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
                  {item.megaMenu.columns.map((column, colIndex) => (
                    <div key={colIndex} className="pr-3 border-r border-[var(--color-whisper)] last:border-r-0">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)] mb-3 pb-2 border-b border-[var(--color-whisper)]">
                        {column.title}
                      </h4>
                      <ul className="space-y-1.5" role="list">
                        {column.links.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className="block px-2 py-1 text-sm text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)] rounded-[var(--radius-sm)] transition-colors"
                              role="menuitem"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Featured promo image card */}
                {item.megaMenu.featured && (
                  <Link
                    href={item.megaMenu.featured.href}
                    className="w-full md:w-64 p-4 bg-gradient-to-b from-[var(--color-snow)] to-[var(--color-gold-light)]/40 border-t md:border-t-0 md:border-l border-[var(--color-whisper)] hover:bg-[var(--color-gold)]/10 transition-colors flex flex-col justify-between group"
                  >
                    <div>
                      <div className="aspect-[4/3] rounded-[var(--radius-md)] overflow-hidden mb-3 relative shadow-sm">
                        <img
                          src={item.megaMenu.featured.image}
                          alt={item.megaMenu.featured.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-[10px] uppercase tracking-wider text-white rounded">
                          Featured
                        </div>
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)] mb-1">
                        {item.megaMenu.featured.title}
                      </p>
                      <p className="text-xs text-[var(--color-slate)] mb-3 line-clamp-2 leading-relaxed">
                        {item.megaMenu.featured.description}
                      </p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] group-hover:text-[var(--color-gold)] inline-flex items-center gap-1 transition-colors">
                      {item.megaMenu.featured.cta}
                      <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                )}
              </div>
            ) : hasChildren && (
              <ul className="py-2" role="list">
                {item.children?.map((child) => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      className="block px-4 py-2 text-sm text-[var(--color-slate)] hover:text-[var(--color-gold)] hover:bg-[var(--color-whisper)] transition-colors"
                      role="menuitem"
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

interface CartButtonProps {
  itemCount: number;
  subtotal: number;
  total: number;
  items: CartItem[];
  shipping?: number;
  tax?: number;
  discount?: number;
  couponCode?: string;
  onUpdateQuantity: ((id: string, quantity: number) => void) | undefined;
  onRemoveItem: ((id: string) => void) | undefined;
  onProceedToCheckout: (() => void) | undefined;
  onApplyCoupon: ((code: string) => void) | undefined;
  onRemoveCoupon: (() => void) | undefined;
  onOpenAuth?: () => void;
}

function CartButton({
  itemCount,
  subtotal,
  total,
  items,
  shipping = 0,
  tax = 0,
  discount = 0,
  couponCode,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onApplyCoupon,
  onRemoveCoupon,
  onOpenAuth,
}: CartButtonProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const cart = useCart();
  const [localCart, setLocalCart] = useState<{ items: CartItem[]; itemCount: number; subtotal: number; total: number } | null>(null);

  // Close cart drawer when route changes or if on checkout
  useEffect(() => {
    setIsCartOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleCartOpen = () => {
      // Never open cart drawer on checkout page
      if (pathname === '/checkout') return;
      setIsCartOpen(true);
    };
    const handleCartUpdated = (e: any) => {
      if (e.detail?.items) {
        setLocalCart({
          items: e.detail.items,
          itemCount: e.detail.totals?.itemCount ?? e.detail.items.length,
          subtotal: e.detail.totals?.subtotal ?? 0,
          total: e.detail.totals?.total ?? 0,
        });
      }
    };
    window.addEventListener('cart:peek', handleCartOpen);
    window.addEventListener('cart:open', handleCartOpen);
    window.addEventListener('cart:updated', handleCartUpdated);
    return () => {
      window.removeEventListener('cart:peek', handleCartOpen);
      window.removeEventListener('cart:open', handleCartOpen);
      window.removeEventListener('cart:updated', handleCartUpdated);
    };
  }, [pathname]);

  const activeItems = (localCart?.items && localCart.items.length > 0)
    ? localCart.items
    : (items && items.length > 0)
      ? items
      : (cart.items && cart.items.length > 0)
        ? cart.items
        : [];

  const activeCount = localCart?.itemCount ?? (
    activeItems.length > 0
      ? activeItems.reduce((s: number, i: any) => s + (i.quantity || 1), 0)
      : (cart.itemCount ?? itemCount)
  );
  const activeSubtotal = localCart?.subtotal ?? (subtotal > 0 ? subtotal : cart.subtotal);
  const activeTotal = localCart?.total ?? (total > 0 ? total : cart.total);

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    onProceedToCheckout?.();
  };

  return (
    <>
      <button
        className="relative p-2 rounded-[var(--radius-md)] text-[var(--color-ink)] hover:bg-[var(--color-whisper)] transition-all duration-200 cursor-pointer"
        onClick={() => {
          if (pathname !== '/checkout') {
            setIsCartOpen(true);
          }
        }}
        aria-label={`Shopping bag${activeCount > 0 ? `, ${activeCount} items` : ', empty'}`}
        aria-expanded={isCartOpen}
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1 0 8" />
        </svg>
        {activeCount > 0 && (
          <motion.span
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-gold)] text-[var(--color-ink)] text-xs font-bold flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            aria-label={`${activeCount} items in bag`}
          >
            {activeCount > 99 ? '99+' : activeCount}
          </motion.span>
        )}
      </button>

      <CartDrawer
        isOpen={isCartOpen && pathname !== '/checkout'}
        onClose={() => setIsCartOpen(false)}
        items={activeItems as any}
        subtotal={activeSubtotal}
        total={activeTotal}
        shipping={shipping}
        tax={tax}
        discount={discount}
        couponCode={couponCode}
        onUpdateQuantity={onUpdateQuantity!}
        onRemoveItem={onRemoveItem!}
        onProceedToCheckout={handleCheckoutClick}
        onApplyCoupon={onApplyCoupon!}
        onRemoveCoupon={onRemoveCoupon!}
      />
    </>
  );
}

interface AccountDropdownProps {
  user: User | null;
  isLoading: boolean;
}

function AccountDropdown({ user, isLoading }: AccountDropdownProps) {
  const { signOut } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userData = getUserDisplayData(user);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!userData) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-[var(--color-ink)] bg-white border border-[var(--color-gold)] rounded-[var(--radius-md)] hover:bg-[var(--color-gold)] hover:text-[var(--color-ink)] transition-all duration-150 ml-1 sm:ml-2 shadow-xs whitespace-nowrap"
        aria-label="Sign In"
      >
        <svg className="h-4 w-4 text-[var(--color-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>Sign In</span>
      </Link>
    );
  }

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
    router.push('/login');
  };

  const menuItems = [
    {
      label: 'My Account',
      href: '/account',
      icon: (
        <svg className="h-4 w-4 text-[var(--color-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      label: 'My Orders',
      href: '/account/orders',
      icon: (
        <svg className="h-4 w-4 text-[var(--color-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1 0 8" />
        </svg>
      ),
    },
    {
      label: 'Wishlist',
      href: '/wishlist',
      icon: (
        <svg className="h-4 w-4 text-[var(--color-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
    {
      label: 'Saved Addresses',
      href: '/account/addresses',
      icon: (
        <svg className="h-4 w-4 text-[var(--color-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
    {
      label: 'Angelika Circle Loyalty',
      href: '/account/loyalty',
      icon: (
        <svg className="h-4 w-4 text-[var(--color-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
  ];

  return (
    <div ref={dropdownRef} className="relative inline-block ml-1 sm:ml-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-2.5 py-1.5 text-xs sm:text-sm font-medium text-[var(--color-ink)] bg-white border border-[var(--color-whisper)] rounded-full hover:border-[var(--color-gold)]/60 hover:shadow-xs transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]/40 cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Account menu"
      >
        <Avatar src={userData?.avatarUrl} name={userData?.name || 'User'} size="sm" ring={!!user} />
        <span className="hidden sm:inline-block max-w-[100px] truncate font-medium text-[var(--color-ink)]">
          {userData.name}
        </span>
        <svg
          className={cn(
            'h-3.5 w-3.5 text-[var(--color-mist)] transition-transform duration-200',
            isOpen && 'rotate-180 text-[var(--color-gold)]'
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-64 bg-white border border-[var(--color-whisper)] rounded-2xl shadow-xl overflow-hidden z-50 text-left"
            role="menu"
          >
            {/* User Info Header */}
            <div className="px-4 py-3 bg-[var(--color-snow)]/70 border-b border-[var(--color-whisper)]">
              <p className="text-xs text-[var(--color-slate)] uppercase tracking-wider font-semibold">Signed in as</p>
              <p className="text-sm font-semibold text-[var(--color-ink)] truncate mt-0.5">{userData.name}</p>
              <p className="text-xs text-[var(--color-mist)] truncate">{userData.email}</p>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--color-gold-light)] text-[var(--color-ink)] border border-[var(--color-gold)]/30">
                <span>✦ Angelika Circle</span>
              </div>
            </div>

            {/* Nav Items */}
            <div className="py-1">
              {menuItems.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleNavigate(item.href)}
                  className="w-full px-4 py-2.5 text-sm text-[var(--color-ink)] hover:bg-[var(--color-gold-light)] flex items-center gap-3 transition-colors text-left cursor-pointer"
                  role="menuitem"
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="font-medium text-[var(--color-ink)]">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Sign Out */}
            <div className="p-1 border-t border-[var(--color-whisper)] bg-[var(--color-snow)]/30">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-sm text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded-lg flex items-center gap-3 transition-colors text-left cursor-pointer font-medium"
                role="menuitem"
              >
                <svg className="h-4 w-4 shrink-0 text-[var(--color-error)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface MobileMenuProps {
  logoUrl?: string;
  brandName?: string;
  brandTagline?: string;
  isOpen: boolean;
  onClose: () => void;
  navigation: NavItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showSearchResults: boolean;
  setShowSearchResults: (show: boolean) => void;
  onSearch?: (query: string) => void;
  user: { name: string; email: string; avatarUrl?: string } | null;
  cartItemCount: number;
  onOpenAuth?: () => void;
}

function MobileMenu({
  logoUrl = '/images/logo.png',
  brandName = 'Angelika',
  brandTagline = 'Fashions',
  isOpen,
  onClose,
  navigation,
  searchQuery,
  setSearchQuery,
  showSearchResults,
  setShowSearchResults,
  onSearch,
  user,
  cartItemCount,
  onOpenAuth,
}: MobileMenuProps) {
  const { signOut } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const router = useRouter();
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[var(--z-modal-backdrop)] bg-[var(--color-ink)]/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            className="fixed top-0 right-0 bottom-0 z-[var(--z-modal)] w-full max-w-sm bg-[var(--color-white)] shadow-[var(--shadow-2xl)] flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile menu"
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-whisper)] sticky top-0 bg-[var(--color-white)] z-10">
              <div className="flex items-center gap-2.5">
                <img
                  src={logoUrl || "/images/logo.png"}
                  alt={`${brandName} ${brandTagline}`}
                  className="h-8 w-auto object-contain rounded-sm"
                />
                <div className="flex flex-col">
                  <span className="font-display text-lg font-bold text-[var(--color-ink)] leading-none">{brandName}</span>
                  {brandTagline ? (
                    <span className="text-[8px] tracking-[0.2em] text-[var(--color-gold)] uppercase font-semibold">{brandTagline}</span>
                  ) : null}
                </div>
              </div>
              <motion.button
                className="p-2 rounded-full text-[var(--color-mist)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)] transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                aria-label="Close menu"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="relative">
                <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { setShowSearchResults(false); onClose(); if (onSearch) onSearch(searchQuery.trim()); else router.push(`/vidhyas-picks?search=${encodeURIComponent(searchQuery.trim())}`); } }}>
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-mist)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchResults(e.target.value.trim().length > 0);
                    }}
                    onFocus={() => { if (searchQuery.trim().length > 0) setShowSearchResults(true); }}
                    className="w-full h-12 pl-10 pr-10 text-base bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-md)] focus:border-[var(--color-gold)] focus:outline-none focus:ring-3 focus:ring-[var(--color-gold)]/20 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                    autoComplete="off"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--color-mist)] hover:text-[var(--color-ink)]"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  )}
                </form>
                <AnimatePresence>
                  {showSearchResults && searchQuery.trim().length > 0 && (
                    <SearchDropdown query={searchQuery} onClose={() => { setShowSearchResults(false); onClose(); }} onSearch={(q) => { setShowSearchResults(false); onClose(); if (onSearch) onSearch(q); else router.push(`/vidhyas-picks?search=${encodeURIComponent(q)}`); }} />
                  )}
                </AnimatePresence>
              </div>

              <nav className="space-y-1" role="navigation" aria-label="Mobile navigation">
                {navigation.map((item) => (
                  <MobileNavItem key={item.href} item={item} onClose={onClose} />
                ))}
              </nav>

              <div className="pt-4 border-t border-[var(--color-whisper)] space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (!user) {
                      onOpenAuth?.();
                      toast('Please sign in to view your wishlist', { icon: '🤍' });
                    } else {
                      router.push('/wishlist');
                    }
                  }}
                  className="w-full flex items-center justify-between px-3 py-3 text-[var(--color-ink)] rounded-[var(--radius-md)] hover:bg-[var(--color-whisper)] transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <svg className="h-6 w-6 text-[var(--color-slate)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                    <span className="font-medium">Wishlist</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#A84557] text-white">
                      {wishlistCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push('/cart');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-[var(--color-ink)] rounded-[var(--radius-md)] hover:bg-[var(--color-whisper)] transition-colors cursor-pointer text-left"
                >
                  <svg className="h-6 w-6 text-[var(--color-slate)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1 0 8" /></svg>
                  <span className="font-medium">Bag</span>
                  {cartItemCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-[var(--color-gold)] text-[var(--color-ink)] rounded-full">{cartItemCount}</span>
                  )}
                </button>
              </div>

              {user ? (
                <div className="pt-4 border-t border-[var(--color-whisper)] space-y-3">
                  <div className="flex items-center gap-3 px-3">
                    <Avatar src={user.avatarUrl} name={user.name} size="md" ring />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--color-ink)] truncate">{user.name}</p>
                      <p className="text-sm text-[var(--color-slate)] truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/account"
                    className="flex items-center gap-3 px-3 py-3 text-[var(--color-ink)] rounded-[var(--radius-md)] hover:bg-[var(--color-whisper)] transition-colors"
                  >
                    <svg className="h-5 w-5 text-[var(--color-slate)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /></svg>
                    My Account
                  </Link>
                  <Link
                    href="/account/orders"
                    className="flex items-center gap-3 px-3 py-3 text-[var(--color-ink)] rounded-[var(--radius-md)] hover:bg-[var(--color-whisper)] transition-colors"
                  >
                    <svg className="h-5 w-5 text-[var(--color-slate)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                    My Orders
                  </Link>
                  <Link
                    href="/account/addresses"
                    className="flex items-center gap-3 px-3 py-3 text-[var(--color-ink)] rounded-[var(--radius-md)] hover:bg-[var(--color-whisper)] transition-colors"
                  >
                    <svg className="h-5 w-5 text-[var(--color-slate)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    Saved Addresses
                  </Link>
                  <Link
                    href="/account/loyalty"
                    className="flex items-center gap-3 px-3 py-3 text-[var(--color-ink)] rounded-[var(--radius-md)] hover:bg-[var(--color-whisper)] transition-colors"
                  >
                    <svg className="h-5 w-5 text-[var(--color-slate)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    Loyalty Rewards
                  </Link>
                  <button
                    onClick={async () => {
                      await signOut();
                      onClose();
                      window.location.href = '/login';
                    }}
                    className="flex items-center gap-3 w-full px-3 py-3 text-[var(--color-ink)] rounded-[var(--radius-md)] hover:bg-[var(--color-whisper)] transition-colors"
                  >
                    <svg className="h-5 w-5 text-[var(--color-slate)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /></svg>
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-[var(--color-whisper)] space-y-3">
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold uppercase tracking-wider bg-[var(--color-gold)] text-[var(--color-ink)] rounded-[var(--radius-md)] hover:bg-[var(--color-gold-hover)] transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold uppercase tracking-wider border-2 border-[var(--color-gold)] text-[var(--color-gold)] rounded-[var(--radius-md)] hover:bg-[var(--color-gold-light)] transition-all"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function MobileNavItem({ item, onClose }: { item: NavItem; onClose: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <div className="border border-[var(--color-whisper)] rounded-[var(--radius-md)] overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-4 py-3 text-left font-medium text-[var(--color-ink)] hover:bg-[var(--color-whisper)] transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          {item.label}
          <svg className={cn('h-5 w-5 text-[var(--color-slate)] transition-transform', isOpen && 'rotate-180')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.ul className="bg-[var(--color-snow)] border-t border-[var(--color-whisper)]" role="list" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              {item.children?.map((child) => (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    className="block px-6 py-2.5 text-sm text-[var(--color-slate)] hover:text-[var(--color-gold)] hover:bg-[var(--color-whisper)] transition-colors"
                    onClick={onClose}
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
              {item.megaMenu?.featured && (
                <li className="p-3 border-t border-[var(--color-whisper)]">
                  <Link
                    href={item.megaMenu.featured.href}
                    onClick={onClose}
                    className="flex items-center gap-3 p-2 bg-[var(--color-gold-light)]/60 rounded-[var(--radius-sm)] hover:bg-[var(--color-gold-light)] transition-colors"
                  >
                    <img
                      src={item.megaMenu.featured.image}
                      alt={item.megaMenu.featured.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[var(--color-ink)] truncate">
                        {item.megaMenu.featured.title}
                      </p>
                      <p className="text-[11px] text-[var(--color-gold)] font-medium">
                        {item.megaMenu.featured.cta} →
                      </p>
                    </div>
                  </Link>
                </li>
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className="flex items-center justify-between px-4 py-3 font-medium text-[var(--color-ink)] hover:bg-[var(--color-whisper)] rounded-[var(--radius-md)] transition-colors"
      onClick={onClose}
    >
      {item.label}
    </Link>
  );
}