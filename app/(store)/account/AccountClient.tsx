'use client';

import { useState, useEffect, useId } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { useCart } from '@/lib/hooks/useCart';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { AddressBookManager } from '@/components/account/AddressBookManager';
import { LoyaltyPortalView } from '@/components/account/LoyaltyPortalView';
import {
  updateCustomerProfileAction,
  type CustomerAccountOverview,
} from '@/lib/actions/customer-account';
import { normalizeAddress } from '@/lib/utils/address';
import {
  Package,
  Heart,
  MapPin,
  User,
  Crown,
  Sparkles,
  ArrowRight,
  Truck,
  ShoppingBag,
  LogOut,
  Check,
  Loader2,
  ShieldCheck,
  Trash2,
  ExternalLink,
  Megaphone,
  LayoutDashboard,
} from 'lucide-react';

const VALID_TABS = new Set(['overview', 'orders', 'wishlist', 'addresses', 'profile', 'loyalty']);

function formatOrderDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getStatusBadgeStyle(status: string): { label: string; className: string } {
  switch ((status || '').toLowerCase()) {
    case 'confirmed':
      return { label: 'Confirmed', className: 'bg-[#EEF2FF] text-[#3730A3] border-[#C7D2FE]' };
    case 'processing':
      return { label: 'Processing', className: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]' };
    case 'shipped':
      return { label: 'In Transit', className: 'bg-[#ECFEFF] text-[#155E75] border-[#A5F3FC]' };
    case 'delivered':
      return { label: 'Delivered', className: 'bg-[#ECFDF3] text-[#067647] border-[#A7F3D0]' };
    case 'cancelled':
      return { label: 'Cancelled', className: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]' };
    default:
      return { label: status || 'Pending', className: 'bg-[#F3EEE8] text-[#5A544B] border-[#E5DDD2]' };
  }
}

export function AccountClient({ initialData }: { initialData: CustomerAccountOverview }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileFormPrefix = useId();
  const { signOut, refreshProfile } = useAuth();
  const { items: wishlistItems, removeItem: removeWishlistItem } = useWishlist();
  const { addItem: addToBag } = useCart();

  const initialTabParam = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState<string>(
    VALID_TABS.has(initialTabParam) ? initialTabParam : 'overview'
  );

  // Sync URL query param changes
  useEffect(() => {
    const param = searchParams.get('tab');
    if (param && VALID_TABS.has(param) && param !== activeTab) {
      setActiveTab(param);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (nextTab: string) => {
    setActiveTab(nextTab);
    const url = nextTab === 'overview' ? '/account' : `/account?tab=${encodeURIComponent(nextTab)}`;
    router.replace(url, { scroll: false });
  };

  const profile = initialData.profile!;
  const orders = initialData.orders || [];
  const loyalty = initialData.loyalty;
  const circleUpdates = initialData.circleUpdates || [];

  const [profileName, setProfileName] = useState(profile.full_name || '');
  const [profilePhone, setProfilePhone] = useState(profile.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedFlag, setProfileSavedFlag] = useState(false);
  const [addingWishlistId, setAddingWishlistId] = useState<string | null>(null);

  const displayName = profileName.trim() || profile.email.split('@')[0] || 'Member';
  const isAdminStaff = ['admin', 'owner', 'manager', 'designer'].includes(
    (profile.role || '').toLowerCase()
  );

  const latestOrderWithAddress = orders.find((o) => {
    const addr = o.shipping_address;
    return Boolean(
      addr &&
        (addr['address1'] || addr['address_line1']) &&
        addr['city'] &&
        (addr['postalCode'] || addr['postal_code'] || addr['pincode'])
    );
  });
  const recentOrderAddress = latestOrderWithAddress
    ? {
        orderNumber: latestOrderWithAddress.order_number,
        address: normalizeAddress(latestOrderWithAddress.shipping_address),
      }
    : null;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSavedFlag(false);
    try {
      const res = await updateCustomerProfileAction({
        full_name: profileName,
        phone: profilePhone,
      });
      if (!res.success) {
        toast.error(res.error || 'Could not save profile changes.');
        return;
      }
      if (res.full_name) setProfileName(res.full_name);
      if (res.phone !== undefined) setProfilePhone(res.phone || '');
      setProfileSavedFlag(true);
      toast.success('Profile updated.');
      refreshProfile().catch(() => {});
      setTimeout(() => setProfileSavedFlag(false), 3000);
    } catch {
      toast.error('Unexpected error while saving profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddWishlistItemToBag = async (item: (typeof wishlistItems)[number]) => {
    setAddingWishlistId(item.id);
    try {
      const added = await addToBag(
        {
          productId: item.product_id || item.productId || item.id,
          variantId: item.variant_id || item.product_id || item.id,
          product_name: item.name,
          price: item.price,
          image: item.image,
          size: item.size || 'M',
          color: item.color || 'Default',
          color_hex: item.colorHex || '#C9A84C',
          quantity: 1,
        },
        1
      );
      if (added) {
        toast.success(`Added ${item.name} to your bag.`);
      }
    } finally {
      setAddingWishlistId(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login?logout=true';
  };

  const totalSpent = orders
    .filter((o) => (o.status || '').toLowerCase() !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  return (
    <div className="min-h-screen bg-[#EFEAE2] py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Obsidian Member Header Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-[#161310] text-[#FAF6F0] border border-[#C9A84C]/35 p-6 sm:p-8 shadow-[0_20px_50px_rgba(22,19,16,0.2)]">
          <div
            className="pointer-events-none absolute -top-24 -right-16 w-72 h-72 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }}
            aria-hidden="true"
          />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#241E18] border border-[#C9A84C]/50 flex items-center justify-center font-display text-2xl font-semibold text-[#E6C77A] shrink-0">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.14em] bg-[#241F19] border border-[#C9A84C]/50 text-[#E6C77A]">
                    <Crown className="w-3 h-3" /> Angelika Circle · {loyalty.tierLabel}
                  </span>
                  {isAdminStaff && (
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.12em] bg-[#C9A84C] text-[#161310] hover:bg-[#DFBE63] transition-colors"
                    >
                      <LayoutDashboard className="w-3 h-3" /> Atelier Admin →
                    </Link>
                  )}
                </div>
                <h1 className="font-display text-2xl sm:text-4xl font-medium tracking-tight text-[#FAF6F0] mt-1.5 truncate">
                  Welcome back, {displayName}
                </h1>
                <p className="text-xs sm:text-sm text-[#BEB5A7] mt-0.5 truncate">
                  {profile.email} · Member since {formatOrderDate(profile.created_at)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/account/orders"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.14em] bg-[#C9A84C] text-[#161310] hover:bg-[#DFBE63] transition-colors"
              >
                <Package className="w-4 h-4" />
                My Orders ({orders.length})
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.14em] bg-[#25201A] text-[#FAF6F0] border border-[#FAF6F0]/15 hover:border-[#C9A84C]/60 transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-[#E6C77A]" />
                Shop Boutique
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#F5B8B4] hover:bg-[#3A1E1C] transition-colors cursor-pointer"
                aria-label="Sign out of your account"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </section>

        {/* Accessible Scrollable Single-Row Portal Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} variant="pills" className="w-full">
          <div className="rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] p-1.5 shadow-xs">
            <TabsList aria-label="Account sections" className="gap-1.5 flex-nowrap">
              {[
                { id: 'overview', label: 'Overview', icon: Sparkles },
                { id: 'orders', label: 'Orders', icon: Package, count: orders.length },
                { id: 'wishlist', label: 'Wishlist', icon: Heart, count: wishlistItems.length },
                { id: 'addresses', label: 'Addresses', icon: MapPin, count: profile.addresses.length },
                { id: 'loyalty', label: 'Angelika Circle', icon: Crown },
                { id: 'profile', label: 'Profile', icon: User },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={`relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                      isSelected
                        ? '!bg-[#161310] !text-[#FAF6F0] !bg-none border-[#161310] shadow-xs after:content-[""] after:absolute after:inset-x-4 after:bottom-0 after:border-b-2 after:border-[#C9A84C]'
                        : 'bg-transparent text-[#5A544B] border-transparent hover:bg-[#FAF8F4] hover:text-[#1A1A1A]'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[#E6C77A]' : 'text-[#A4832E]'}`} />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isSelected
                              ? 'bg-[#2C261F] text-[#E6C77A]'
                              : 'bg-[#F3EEE8] text-[#5A544B]'
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* 1. OVERVIEW TAB */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                type="button"
                onClick={() => handleTabChange('orders')}
                className="text-left rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] hover:border-[#C9A84C] p-5 transition-all shadow-xs cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-[#FAF4E8] border border-[#E6D5B0] flex items-center justify-center">
                    <Package className="w-5 h-5 text-[#947218]" />
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#A4832E] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="font-display text-3xl font-semibold text-[#1A1A1A] mt-3">{orders.length}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B6258] mt-0.5">
                  Orders Placed
                </p>
                <p className="text-[11px] text-[#74590E] mt-1">
                  ₹{totalSpent.toLocaleString('en-IN')} total wardrobe
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('wishlist')}
                className="text-left rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] hover:border-[#C9A84C] p-5 transition-all shadow-xs cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-[#FAF4E8] border border-[#E6D5B0] flex items-center justify-center">
                    <Heart className="w-5 h-5 text-[#947218]" />
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#A4832E] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="font-display text-3xl font-semibold text-[#1A1A1A] mt-3">
                  {wishlistItems.length}
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B6258] mt-0.5">
                  Saved Pieces
                </p>
                <p className="text-[11px] text-[#74590E] mt-1">Curated wishlist</p>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('loyalty')}
                className="text-left rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] hover:border-[#C9A84C] p-5 transition-all shadow-xs cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-[#FAF4E8] border border-[#E6D5B0] flex items-center justify-center">
                    <Crown className="w-5 h-5 text-[#947218]" />
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#A4832E] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="font-display text-3xl font-semibold text-[#1A1A1A] mt-3">
                  {loyalty.currentPoints.toLocaleString('en-IN')}
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B6258] mt-0.5">
                  Circle Points
                </p>
                <p className="text-[11px] text-[#74590E] mt-1">{loyalty.tierLabel} Tier</p>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('addresses')}
                className="text-left rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] hover:border-[#C9A84C] p-5 transition-all shadow-xs cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-[#FAF4E8] border border-[#E6D5B0] flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#947218]" />
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#A4832E] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="font-display text-3xl font-semibold text-[#1A1A1A] mt-3">
                  {profile.addresses.length}
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B6258] mt-0.5">
                  Saved Addresses
                </p>
                <p className="text-[11px] text-[#74590E] mt-1">Express checkout ready</p>
              </button>
            </div>

            {/* Atelier Broadcasts (if active) */}
            {circleUpdates.length > 0 && (
              <div className="rounded-2xl bg-[#161310] text-[#FAF6F0] border border-[#C9A84C]/35 p-5 sm:p-6">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E6C77A] mb-3">
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Latest Atelier Dispatches</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {circleUpdates.slice(0, 2).map((u) => (
                    <Link
                      key={u.id}
                      href={u.cta_link || '/shop'}
                      className="rounded-xl bg-[#211C16] border border-[#FAF6F0]/10 hover:border-[#C9A84C]/50 p-4 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#FAF6F0] truncate">{u.title}</p>
                        {(u.content || u.subject) && (
                          <p className="text-xs text-[#BEB5A7] mt-0.5 line-clamp-1">
                            {u.content || u.subject}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#E6C77A] shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders Snapshot + Quick Portal Shortcuts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] overflow-hidden shadow-xs">
                <div className="px-6 py-4 bg-[#FAF8F4] border-b border-[#EAE2D6] flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-[#1A1A1A]">Recent Orders</h2>
                    <p className="text-xs text-[#6B6258]">Latest purchases & live courier status</p>
                  </div>
                  <Link
                    href="/account/orders"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#74590E] hover:text-[#1A1A1A]"
                  >
                    All Orders <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {orders.length === 0 ? (
                  <div className="p-10 text-center">
                    <Package className="w-10 h-10 text-[#C9A84C] mx-auto mb-3" />
                    <p className="font-medium text-[#1A1A1A]">No orders placed yet</p>
                    <p className="text-xs text-[#5A544B] mt-1">
                      Explore handcrafted silk kurtis, bridal lehengas, and festive drapes.
                    </p>
                    <Link
                      href="/shop"
                      className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.14em] bg-[#161310] text-[#FAF6F0]"
                    >
                      Start Exploring
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-[#F1EAE0]">
                    {orders.slice(0, 3).map((order) => {
                      const badge = getStatusBadgeStyle(order.status);
                      const firstItem = order.items[0];
                      const trackHref = order.tracking_url
                        ? order.tracking_url
                        : order.tracking_token
                          ? `/track-order?order=${encodeURIComponent(order.order_number)}&token=${encodeURIComponent(order.tracking_token)}`
                          : `/account/orders/${order.id}`;

                      return (
                        <div
                          key={order.id}
                          className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF8F4]/60 transition-colors"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <img
                              src={firstItem?.variant_details?.image || '/images/collection-kurtis.jpg'}
                              alt={firstItem?.product_name || order.order_number}
                              className="w-14 h-16 rounded-xl object-cover border border-[#E5DDD2] shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-[#1A1A1A]">
                                  {order.order_number}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.className}`}
                                >
                                  {badge.label}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-[#1A1A1A] truncate mt-1">
                                {firstItem?.product_name || 'Atelier Ensemble'}
                                {order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''}
                              </p>
                              <p className="text-xs text-[#6B6258] mt-0.5">
                                {formatOrderDate(order.created_at)} · ₹{order.total_amount.toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {order.status.toLowerCase() !== 'cancelled' && (
                              order.tracking_url ? (
                                <a
                                  href={trackHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#74590E] bg-[#FAF4E8] border border-[#E6D5B0] hover:border-[#C9A84C]"
                                >
                                  <Truck className="w-3.5 h-3.5" /> Track
                                </a>
                              ) : (
                                <Link
                                  href={trackHref}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#74590E] bg-[#FAF4E8] border border-[#E6D5B0] hover:border-[#C9A84C]"
                                >
                                  <Truck className="w-3.5 h-3.5" /> Track
                                </Link>
                              )
                            )}
                            <Link
                              href={`/account/orders/${order.id}`}
                              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#161310] text-[#FAF6F0] hover:bg-[#2A2520]"
                            >
                              Details →
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Dedicated Portal Shortcuts */}
              <div className="rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] p-5 space-y-3 shadow-xs">
                <h2 className="font-display text-xl font-semibold text-[#1A1A1A]">Quick Concierge</h2>
                <div className="space-y-2">
                  {[
                    { label: 'Full Orders & Invoices', href: '/account/orders', desc: 'Track shipments, download GST invoices' },
                    { label: 'Dedicated Wishlist', href: '/wishlist', desc: `${wishlistItems.length} saved pieces` },
                    { label: 'Address Book', href: '/account/addresses', desc: 'Manage express delivery destinations' },
                    { label: 'Angelika Circle Lounge', href: '/account/loyalty', desc: 'Redeem points for checkout vouchers' },
                    { label: 'Public Shipment Tracker', href: '/track-order', desc: 'Track any order number instantly' },
                  ].map((shortcut) => (
                    <Link
                      key={shortcut.href}
                      href={shortcut.href}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#FAF8F4] border border-[#EAE2D6] hover:border-[#C9A84C] transition-colors group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1A1A1A] truncate">{shortcut.label}</p>
                        <p className="text-[11px] text-[#6B6258] truncate">{shortcut.desc}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#A4832E] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 2. ORDERS TAB */}
          <TabsContent value="orders" className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#1A1A1A]">Your Orders</h2>
                <p className="text-sm text-[#5A544B]">
                  View recent orders here or open the full Orders Portal for filters, search, and reorder.
                </p>
              </div>
              <Link
                href="/account/orders"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.14em] bg-[#161310] text-[#FAF6F0] hover:bg-[#2A2520] shrink-0"
              >
                Open Full Orders Portal <ArrowRight className="w-4 h-4 text-[#C9A84C]" />
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] p-12 text-center">
                <Package className="w-10 h-10 text-[#C9A84C] mx-auto mb-3" />
                <p className="font-display text-2xl text-[#1A1A1A]">No orders placed yet</p>
                <p className="text-sm text-[#5A544B] mt-1">Your handcrafted acquisitions will appear here.</p>
                <Link
                  href="/shop"
                  className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-[0.14em] bg-[#161310] text-[#FAF6F0]"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const badge = getStatusBadgeStyle(order.status);
                  const paymentLabel =
                    (order.payment_method || '').toLowerCase() === 'cod'
                      ? 'Cash on Delivery'
                      : order.payment_status === 'paid'
                        ? 'Paid · Online'
                        : 'Payment Pending';
                  const trackHref = order.tracking_url
                    ? order.tracking_url
                    : order.tracking_token
                      ? `/track-order?order=${encodeURIComponent(order.order_number)}&token=${encodeURIComponent(order.tracking_token)}`
                      : `/account/orders/${order.id}`;

                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] overflow-hidden shadow-xs"
                    >
                      <div className="px-5 py-3.5 bg-[#FAF8F4] border-b border-[#EAE2D6] flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
                          <div>
                            <span className="text-[#7A7065] uppercase tracking-wider block text-[10px]">Order #</span>
                            <span className="font-mono font-bold text-[#1A1A1A]">{order.order_number}</span>
                          </div>
                          <div>
                            <span className="text-[#7A7065] uppercase tracking-wider block text-[10px]">Date</span>
                            <span className="font-medium text-[#1A1A1A]">{formatOrderDate(order.created_at)}</span>
                          </div>
                          <div>
                            <span className="text-[#7A7065] uppercase tracking-wider block text-[10px]">Total</span>
                            <span className="font-semibold text-[#1A1A1A]">₹{order.total_amount.toLocaleString('en-IN')}</span>
                          </div>
                          <div>
                            <span className="text-[#7A7065] uppercase tracking-wider block text-[10px]">Payment</span>
                            <span className="font-medium text-[#4E4840]">{paymentLabel}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.className}`}>
                            {badge.label}
                          </span>
                          <Link
                            href={`/account/orders/${order.id}`}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#161310] text-[#FAF6F0] hover:bg-[#2A2520]"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>

                      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-3 flex-1 min-w-0">
                          {order.items.slice(0, 2).map((item) => (
                            <div key={item.id} className="flex items-center gap-3.5">
                              <img
                                src={item.variant_details?.image || '/images/collection-kurtis.jpg'}
                                alt={item.product_name}
                                className="w-12 h-14 rounded-lg object-cover border border-[#E5DDD2] shrink-0"
                              />
                              <div className="min-w-0">
                                {item.product_slug ? (
                                  <Link
                                    href={`/product/${item.product_slug}`}
                                    className="text-sm font-semibold text-[#1A1A1A] hover:text-[#74590E] truncate block"
                                  >
                                    {item.product_name}
                                  </Link>
                                ) : (
                                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                                    {item.product_name}
                                  </p>
                                )}
                                <p className="text-xs text-[#6B6258]">
                                  {item.variant_details?.size ? `Size: ${item.variant_details.size} · ` : ''}
                                  Qty: {item.quantity} · ₹{Number(item.total_price).toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-xs text-[#74590E] font-medium">
                              + {order.items.length - 2} more piece{order.items.length - 2 > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>

                        {order.status.toLowerCase() !== 'cancelled' && (
                          <div className="shrink-0">
                            {order.tracking_url ? (
                              <a
                                href={trackHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#74590E] bg-[#FAF4E8] border border-[#E6D5B0] hover:border-[#C9A84C]"
                              >
                                <Truck className="w-3.5 h-3.5" /> Track Shipment
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <Link
                                href={trackHref}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#74590E] bg-[#FAF4E8] border border-[#E6D5B0] hover:border-[#C9A84C]"
                              >
                                <Truck className="w-3.5 h-3.5" /> Track Live →
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* 3. WISHLIST TAB (Fixed price/image/slug + working Add to Bag!) */}
          <TabsContent value="wishlist" className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#1A1A1A]">
                  Saved Wishlist ({wishlistItems.length})
                </h2>
                <p className="text-sm text-[#5A544B]">
                  Move pieces directly to your shopping bag or view your full wishlist board.
                </p>
              </div>
              <Link
                href="/wishlist"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.14em] bg-[#FAF8F4] text-[#1A1A1A] border border-[#DFD5C8] hover:border-[#C9A84C] shrink-0"
              >
                Open Full Wishlist <ArrowRight className="w-4 h-4 text-[#A4832E]" />
              </Link>
            </div>

            {wishlistItems.length === 0 ? (
              <div className="rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] p-12 text-center">
                <Heart className="w-10 h-10 text-[#C9A84C] mx-auto mb-3" />
                <p className="font-display text-2xl text-[#1A1A1A]">Your wishlist is empty</p>
                <p className="text-sm text-[#5A544B] mt-1">
                  Tap the heart icon on any handcrafted garment to save it for later.
                </p>
                <Link
                  href="/shop"
                  className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-[0.14em] bg-[#161310] text-[#FAF6F0]"
                >
                  Discover Collection
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {wishlistItems.map((item) => {
                  const href = `/product/${item.slug || item.product_id}`;
                  const isBusy = addingWishlistId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] overflow-hidden flex flex-col justify-between shadow-xs hover:border-[#C9A84C] transition-all"
                    >
                      <Link href={href} className="block relative aspect-[3/4] bg-[#F5EFE6] overflow-hidden group">
                        <img
                          src={item.image || '/images/collection-kurtis.jpg'}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {item.discount > 0 && (
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#161310] text-[#E6C77A]">
                            {item.discount}% Off
                          </span>
                        )}
                      </Link>
                      <div className="p-4 space-y-3">
                        <div>
                          <Link
                            href={href}
                            className="text-sm font-semibold text-[#1A1A1A] hover:text-[#74590E] line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-base font-bold text-[#1A1A1A]">
                              ₹{Number(item.price || 0).toLocaleString('en-IN')}
                            </span>
                            {item.originalPrice > item.price && (
                              <span className="text-xs text-[#8E8477] line-through">
                                ₹{Number(item.originalPrice).toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isBusy || !item.inStock}
                            onClick={() => handleAddWishlistItemToBag(item)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold uppercase tracking-[0.12em] bg-[#161310] text-[#FAF6F0] hover:bg-[#2A2520] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isBusy ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9A84C]" />
                            ) : (
                              <ShoppingBag className="w-3.5 h-3.5 text-[#E6C77A]" />
                            )}
                            {item.inStock ? 'Add to Bag' : 'Out of Stock'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeWishlistItem(item.product_id || item.id, item.variant_id || undefined)}
                            aria-label={`Remove ${item.name} from wishlist`}
                            className="p-2.5 rounded-xl border border-[#E5DDD2] text-[#B42318] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* 4. ADDRESSES TAB (Full Real Address Book — ZERO Stub!) */}
          <TabsContent value="addresses" className="mt-6">
            <AddressBookManager
              initialAddresses={profile.addresses}
              defaultName={profileName || profile.full_name}
              defaultPhone={profilePhone || profile.phone}
              recentOrderAddress={recentOrderAddress}
              embedded={true}
            />
          </TabsContent>

          {/* 5. LOYALTY TAB (Full Real Redemption & Ledger — ZERO Dead Buttons!) */}
          <TabsContent value="loyalty" className="mt-6">
            <LoyaltyPortalView
              initialLoyalty={loyalty}
              memberName={displayName}
              embedded={true}
            />
          </TabsContent>

          {/* 6. PROFILE TAB */}
          <TabsContent value="profile" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] overflow-hidden shadow-xs">
                <div className="px-6 py-4 bg-[#FAF8F4] border-b border-[#EAE2D6]">
                  <h2 className="font-display text-2xl font-semibold text-[#1A1A1A]">
                    Personal Details
                  </h2>
                  <p className="text-xs text-[#6B6258] mt-0.5">
                    Keep your contact information current for instant WhatsApp & SMS delivery alerts.
                  </p>
                </div>

                <form onSubmit={handleProfileSave} className="p-6 space-y-5">
                  <div>
                    <label
                      htmlFor={`${profileFormPrefix}-name`}
                      className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#3F3A34] mb-1.5"
                    >
                      Full Name
                    </label>
                    <input
                      id={`${profileFormPrefix}-name`}
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#D8CEC0] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/25"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`${profileFormPrefix}-email`}
                      className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#3F3A34] mb-1.5"
                    >
                      Registered Email
                    </label>
                    <input
                      id={`${profileFormPrefix}-email`}
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full h-11 px-3.5 rounded-xl bg-[#F5F1EB] border border-[#E5DDD2] text-sm text-[#6B6258] cursor-not-allowed"
                    />
                    <p className="text-[11px] text-[#7A7065] mt-1">
                      Used for order receipts, login verification, and Angelika Circle tracking.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor={`${profileFormPrefix}-phone`}
                      className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#3F3A34] mb-1.5"
                    >
                      Mobile Number (India)
                    </label>
                    <input
                      id={`${profileFormPrefix}-phone`}
                      name="tel"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#D8CEC0] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/25"
                    />
                  </div>

                  <div className="pt-3 border-t border-[#EAE2D6] flex items-center justify-between gap-3">
                    {profileSavedFlag ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#067647]">
                        <Check className="w-4 h-4" /> Changes saved to your account
                      </span>
                    ) : (
                      <span className="text-xs text-[#7A7065]">Changes apply immediately across checkout</span>
                    )}
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.14em] bg-[#161310] text-[#FAF6F0] hover:bg-[#2A2520] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9A84C]" />}
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              </div>

              <div className="rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] p-6 space-y-4 h-fit shadow-xs">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#947218]" />
                  <h3 className="font-display text-xl font-semibold text-[#1A1A1A]">Account Security</h3>
                </div>
                <p className="text-xs text-[#5A544B] leading-relaxed">
                  Your session stays securely signed in on this browser using encrypted authentication cookies. You can sign out or reset your password at any time.
                </p>
                <div className="space-y-2.5 pt-2">
                  <Link
                    href="/auth/reset-password"
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.12em] bg-[#FAF8F4] text-[#1A1A1A] border border-[#DFD5C8] hover:border-[#C9A84C] transition-colors"
                  >
                    Update Password
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.12em] bg-[#FEF2F2] text-[#B42318] border border-[#FECACA] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out of Device
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
