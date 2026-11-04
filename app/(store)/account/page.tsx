'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils/cn';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { StaggerContainer, StaggerItem } from '@/components/animations/Stagger';
import { MagneticLinkButton } from '@/components/animations/MagneticLinkButton';
import { MagneticButton } from '@/components/animations/MagneticButton';
import { Counter } from '@/components/animations/MicroInteractions';
import { useAuth } from '@/lib/hooks/useAuth';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { getSupabaseClient } from '@/lib/supabase/client';
import { toast } from '@/components/ui/Toast';

interface RealOrder {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total_amount: number;
  items_count?: number;
}

const accountTabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'orders', label: 'Orders' },
  { value: 'wishlist', label: 'Wishlist' },
  { value: 'addresses', label: 'Addresses' },
  { value: 'profile', label: 'Profile' },
  { value: 'loyalty', label: 'Loyalty' },
];

const statusStyles: Record<string, string> = {
  delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  shipped: 'bg-blue-50 text-blue-700 border border-blue-200',
  processing: 'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  cancelled: 'bg-rose-50 text-rose-700 border border-rose-200',
  returned: 'bg-slate-100 text-slate-700 border border-slate-200',
};

export default function AccountPage() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const wishlist = useWishlist();

  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState<RealOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Profile Form State
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Sync profile data to form
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['overview', 'orders', 'wishlist', 'addresses', 'profile', 'loyalty'].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, []);

  useEffect(() => {
    if (profile) {
      setProfileName(profile.full_name || '');
      setProfilePhone(profile.phone || '');
    } else if (user) {
      setProfileName((user.user_metadata as any)?.full_name || user.email?.split('@')[0] || '');
    }
  }, [profile, user]);

  // Fetch real orders from Supabase for this logged-in user
  useEffect(() => {
    async function fetchOrders() {
      if (!user?.id) {
        setOrders([]);
        setOrdersLoading(false);
        return;
      }

      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('orders')
          .select('id, order_number, status, total_amount, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Orders fetch note:', error.message);
          setOrders([]);
        } else if (data) {
          setOrders(data as RealOrder[]);
        }
      } catch (err) {
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    }

    fetchOrders();
  }, [user?.id]);

  // Handle Profile Update
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdatingProfile(true);

    try {
      const { error } = await updateProfile({
        full_name: profileName.trim(),
        phone: profilePhone.trim() || undefined,
      });

      if (error) {
        toast.error('Failed to update profile', error.message);
      } else {
        toast.success('Profile Updated', 'Your personal details have been saved.');
      }
    } catch {
      toast.error('Error', 'Could not save profile changes.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Derive Real User Details (NO FAKE / MOCK DATA)
  const displayName = profile?.full_name || (user?.user_metadata as any)?.full_name || user?.email?.split('@')[0] || 'Member';
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'Recently';
  const totalOrdersCount = orders.length;
  const wishlistCount = wishlist?.count || 0;

  // Real Loyalty Calculations
  const loyaltyPoints = profile?.loyalty_points ?? 0;
  const rawTier = (profile?.loyalty_tier || 'silver').toLowerCase();
  const loyaltyTier = rawTier === 'platinum' ? 'Platinum Member' : rawTier === 'gold' ? 'Gold Member' : 'Silver Member';

  // Loyalty Progress & Next Milestone
  let nextMilestoneText = '500 pts to Gold';
  let tierProgressPercent = Math.min(100, Math.round((loyaltyPoints / 500) * 100));
  let tierCashback = '2%';

  if (rawTier === 'gold' || (loyaltyPoints >= 500 && loyaltyPoints < 1500)) {
    nextMilestoneText = `${Math.max(0, 1500 - loyaltyPoints)} pts to Platinum`;
    tierProgressPercent = Math.min(100, Math.round(((loyaltyPoints - 500) / 1000) * 100));
    tierCashback = '5%';
  } else if (rawTier === 'platinum' || loyaltyPoints >= 1500) {
    nextMilestoneText = 'Top Elite Tier Reached';
    tierProgressPercent = 100;
    tierCashback = '10%';
  }

  // Real Size Profile Check
  const measurements = (profile?.measurements as Record<string, any>) || {};
  const hasMeasurements = Object.keys(measurements).length > 0;

  return (
    <div className="min-h-screen bg-[var(--color-white)]">
      {/* Page Header with Real Customer Identity */}
      <section className="bg-[var(--color-snow)] border-b border-[var(--color-whisper)] py-8 md:py-10">
        <div className="container-custom px-4 sm:px-6">
          <ScrollReveal variant="fadeUp" className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <Avatar
                src={profile?.avatar_url || undefined}
                name={displayName}
                size="2xl"
                ring
                className="border-2 border-[var(--color-gold)]"
              />
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-[var(--font-display)] text-2xl sm:text-3xl font-medium text-[var(--color-ink)]">
                    Welcome, {displayName}!
                  </h1>
                  <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-[var(--color-gold)] text-[var(--color-ink)] rounded-full tracking-wider uppercase">
                    {loyaltyTier}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--color-slate)] mt-1">
                  Member since {joinedDate} &bull; {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton variant="outline" strength={0.3} asChild>
                <Link href="/wishlist" className="text-xs sm:text-sm font-medium">
                  My Wishlist ({wishlistCount})
                </Link>
              </MagneticButton>
              <MagneticButton variant="primary" strength={0.3} asChild>
                <Link href="/shop" className="text-xs sm:text-sm font-medium">
                  Explore Collections
                </Link>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Real Customer Stats Bar */}
      <section className="py-5 bg-[var(--color-white)] border-b border-[var(--color-whisper)]">
        <div className="container-custom px-4 sm:px-6">
          <StaggerContainer variant="default" className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <StaggerItem variant="scale">
              <Card variant="outlined" padding="sm" className="text-center border-[var(--color-whisper)] bg-[var(--color-snow)]/40">
                <Counter value={totalOrdersCount} className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)]" duration={1} />
                <div className="text-xs text-[var(--color-slate)] font-medium mt-0.5">Total Orders</div>
              </Card>
            </StaggerItem>
            <StaggerItem variant="scale">
              <Card variant="outlined" padding="sm" className="text-center border-[var(--color-whisper)] bg-[var(--color-snow)]/40">
                <Counter value={wishlistCount} className="text-2xl sm:text-3xl font-bold text-[var(--color-gold)]" duration={1} suffix=" ♥" />
                <div className="text-xs text-[var(--color-slate)] font-medium mt-0.5">Wishlist Items</div>
              </Card>
            </StaggerItem>
            <StaggerItem variant="scale">
              <Card variant="outlined" padding="sm" className="text-center border-[var(--color-whisper)] bg-[var(--color-snow)]/40">
                <Counter value={loyaltyPoints} className="text-2xl sm:text-3xl font-bold text-[var(--color-gold)]" duration={1.2} />
                <div className="text-xs text-[var(--color-slate)] font-medium mt-0.5">Loyalty Points</div>
              </Card>
            </StaggerItem>
            <StaggerItem variant="scale">
              <Card variant="outlined" padding="sm" className="text-center border-[var(--color-whisper)] bg-[var(--color-snow)]/40">
                <div className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)] uppercase font-display">{rawTier}</div>
                <div className="text-xs text-[var(--color-slate)] font-medium mt-0.5">Current Tier</div>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Main Account Tabs */}
      <section className="py-8 md:py-10">
        <div className="container-custom px-4 sm:px-6">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Elegant Tab Headers */}
            <TabsList className="flex flex-wrap gap-1.5 sm:gap-2 mb-8 bg-[var(--color-snow)] p-1.5 rounded-xl border border-[var(--color-whisper)]">
              {accountTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="px-4 py-2 text-xs sm:text-sm font-medium tracking-wide transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--color-ink)] data-[state=active]:shadow-xs rounded-lg"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* OVERVIEW TAB - Perfectly Settled 2-Column Layout */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* LEFT COLUMN: 2 Cols Wide (Recent Orders + Quick Actions) */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  {/* 1. Recent Orders Card */}
                  <Card variant="elevated" padding="none" className="border border-[var(--color-whisper)] shadow-sm bg-white overflow-hidden rounded-2xl">
                    <CardHeader className="p-5 sm:p-6 border-b border-[var(--color-whisper)] bg-[var(--color-snow)]/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-[var(--font-display)] text-lg sm:text-xl font-medium text-[var(--color-ink)]">
                            Recent Orders
                          </CardTitle>
                          <p className="text-xs text-[var(--color-slate)] mt-0.5">
                            Track and manage your handcrafted fashion orders
                          </p>
                        </div>
                        {orders.length > 0 && (
                          <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')} className="text-xs text-[var(--color-gold)] font-semibold hover:text-[var(--color-gold-hover)]">
                            View All &rarr;
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {ordersLoading ? (
                        <div className="p-8 text-center text-xs text-[var(--color-slate)] animate-pulse">
                          Loading your order details...
                        </div>
                      ) : orders.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-[var(--color-whisper)] bg-[var(--color-snow)]/60 text-[11px] font-semibold tracking-wider text-[var(--color-slate)] uppercase">
                                <th className="px-5 py-3.5">Order ID</th>
                                <th className="px-5 py-3.5">Date</th>
                                <th className="px-5 py-3.5">Status</th>
                                <th className="px-5 py-3.5 text-right">Total</th>
                                <th className="px-5 py-3.5 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-whisper)] text-xs sm:text-sm">
                              {orders.slice(0, 5).map((order) => {
                                const statusKey = (order.status || 'processing').toLowerCase();
                                return (
                                  <tr key={order.id} className="hover:bg-[var(--color-snow)]/40 transition-colors">
                                    <td className="px-5 py-4 font-mono font-medium text-[var(--color-ink)]">
                                      {order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`}
                                    </td>
                                    <td className="px-5 py-4 text-[var(--color-slate)]">
                                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      })}
                                    </td>
                                    <td className="px-5 py-4">
                                      <span className={cn('px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wider', statusStyles[statusKey] || statusStyles['processing'])}>
                                        {order.status || 'Processing'}
                                      </span>
                                    </td>
                                    <td className="px-5 py-4 text-right font-medium text-[var(--color-ink)]">
                                      ₹{Number(order.total_amount).toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                      <Button variant="ghost" size="sm" asChild className="text-xs font-semibold text-[var(--color-gold)] hover:text-[var(--color-gold-hover)]">
                                        <Link href={`/account/orders/${order.id}`}>View</Link>
                                      </Button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        /* Clear & Attractive Zero-Data Empty State */
                        <div className="py-12 px-6 text-center">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center text-[var(--color-gold)]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          </div>
                          <h3 className="font-display text-lg font-medium text-[var(--color-ink)]">
                            No Orders Placed Yet
                          </h3>
                          <p className="text-xs sm:text-sm text-[var(--color-slate)] max-w-sm mx-auto mt-1 mb-5 leading-relaxed">
                            Your handcrafted orders and tracking details will appear here once placed. Discover our curated collections by Vidhya.
                          </p>
                          <Button variant="primary" size="sm" asChild className="text-xs font-semibold uppercase tracking-wider py-2.5 px-6 shadow-sm">
                            <Link href="/shop">Start Shopping</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 2. Quick Actions Card */}
                  <Card variant="elevated" padding="lg" className="border border-[var(--color-whisper)] shadow-sm bg-white rounded-2xl">
                    <CardTitle className="text-[var(--font-display)] text-lg font-medium text-[var(--color-ink)] mb-4">
                      Quick Actions
                    </CardTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--color-whisper)] hover:border-[var(--color-gold)] hover:bg-[var(--color-snow)] text-left transition-all duration-150 group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="p-2 rounded-lg bg-[var(--color-gold-light)] text-[var(--color-gold)]">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-[var(--color-ink)]">All Orders</p>
                            <p className="text-[11px] text-[var(--color-slate)]">View full order history</p>
                          </div>
                        </div>
                        <span className="text-[var(--color-mist)] group-hover:text-[var(--color-gold)] group-hover:translate-x-0.5 transition-all">&rarr;</span>
                      </button>

                      <Link
                        href="/wishlist"
                        className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--color-whisper)] hover:border-[var(--color-gold)] hover:bg-[var(--color-snow)] text-left transition-all duration-150 group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="p-2 rounded-lg bg-[var(--color-gold-light)] text-[var(--color-gold)]">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-[var(--color-ink)]">My Wishlist</p>
                            <p className="text-[11px] text-[var(--color-slate)]">{wishlistCount} saved item{wishlistCount !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <span className="text-[var(--color-mist)] group-hover:text-[var(--color-gold)] group-hover:translate-x-0.5 transition-all">&rarr;</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setActiveTab('addresses')}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--color-whisper)] hover:border-[var(--color-gold)] hover:bg-[var(--color-snow)] text-left transition-all duration-150 group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="p-2 rounded-lg bg-[var(--color-gold-light)] text-[var(--color-gold)]">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-[var(--color-ink)]">Delivery Addresses</p>
                            <p className="text-[11px] text-[var(--color-slate)]">Manage shipping details</p>
                          </div>
                        </div>
                        <span className="text-[var(--color-mist)] group-hover:text-[var(--color-gold)] group-hover:translate-x-0.5 transition-all">&rarr;</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--color-whisper)] hover:border-[var(--color-gold)] hover:bg-[var(--color-snow)] text-left transition-all duration-150 group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="p-2 rounded-lg bg-[var(--color-gold-light)] text-[var(--color-gold)]">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-[var(--color-ink)]">Profile Settings</p>
                            <p className="text-[11px] text-[var(--color-slate)]">Name, phone & email</p>
                          </div>
                        </div>
                        <span className="text-[var(--color-mist)] group-hover:text-[var(--color-gold)] group-hover:translate-x-0.5 transition-all">&rarr;</span>
                      </button>
                    </div>

                    {/* WhatsApp Concierge */}
                    <div className="mt-4 pt-4 border-t border-[var(--color-whisper)]">
                      <LinkButton
                        variant="whatsapp"
                        href="https://wa.me/91XXXXXXXXXX?text=Hi%20Vidhya,%20I%20need%20assistance%20with%20my%20orders"
                        className="w-full text-xs font-semibold py-2.5 justify-center gap-2"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.8 14.16c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.66-.88-3.23-1.28-5.31-4.54-5.47-4.75-.16-.21-1.31-1.74-1.31-3.32 0-1.58.83-2.36 1.12-2.68.3-.32.65-.4.87-.4.22 0 .43 0 .62.01.2.01.47-.08.73.55.27.65.92 2.25 1 2.41.08.16.13.35.03.56-.1.21-.16.35-.31.53-.16.18-.33.4-.47.54-.16.16-.33.33-.14.66.19.32.84 1.39 1.8 2.25 1.24 1.11 2.29 1.45 2.61 1.61.32.16.51.14.7-.08.19-.22.81-.94 1.03-1.26.22-.32.43-.27.73-.16.3.11 1.92.9 2.25 1.07.33.16.54.24.62.38.08.14.08.82-.16 1.49z"/>
                        </svg>
                        Personal Stylist & Concierge on WhatsApp
                      </LinkButton>
                    </div>
                  </Card>
                </div>

                {/* RIGHT COLUMN: 1 Col Wide (Loyalty Card + Size Profile) */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                  {/* 3. Angelika Circle Loyalty Card */}
                  <Card variant="elevated" padding="lg" className="border border-[var(--color-whisper)] shadow-sm bg-white rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <CardTitle className="text-[var(--font-display)] text-lg font-medium text-[var(--color-ink)]">
                        Angelika Circle
                      </CardTitle>
                      <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-[var(--color-gold)] text-[var(--color-ink)] rounded-full tracking-wider uppercase">
                        {loyaltyTier}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--color-snow)] to-amber-50/40 border border-[var(--color-gold-light)] mb-4">
                      <div className="flex items-baseline justify-between mb-2">
                        <div>
                          <div className="text-3xl sm:text-4xl font-bold text-[var(--color-gold)] font-display">
                            {loyaltyPoints.toLocaleString('en-IN')}
                          </div>
                          <div className="text-xs text-[var(--color-slate)] font-medium">Points Available</div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-[var(--color-ink)]">{tierCashback} Reward</span>
                          <p className="text-[10px] text-[var(--color-slate)]">on every order</p>
                        </div>
                      </div>

                      {/* Tier Progress Bar */}
                      <div className="mt-3">
                        <div className="h-2 bg-[var(--color-whisper)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-hover)] rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(5, tierProgressPercent)}%` }}
                          />
                        </div>
                        <div className="text-[11px] text-[var(--color-slate)] mt-1.5 flex justify-between">
                          <span>{tierProgressPercent}% progress</span>
                          <span className="font-medium text-[var(--color-gold)]">{nextMilestoneText}</span>
                        </div>
                      </div>
                    </div>

                    {/* Member Privileges Pill Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center mb-4">
                      <div className="p-2.5 bg-[var(--color-snow)] rounded-xl border border-[var(--color-whisper)]">
                        <div className="text-sm font-bold text-[var(--color-gold)]">{tierCashback}</div>
                        <div className="text-[10px] text-[var(--color-ink)] font-medium mt-0.5">Cashback</div>
                      </div>
                      <div className="p-2.5 bg-[var(--color-snow)] rounded-xl border border-[var(--color-whisper)]">
                        <div className="text-sm font-bold text-[var(--color-gold)]">Early</div>
                        <div className="text-[10px] text-[var(--color-ink)] font-medium mt-0.5">Sale Access</div>
                      </div>
                      <div className="p-2.5 bg-[var(--color-snow)] rounded-xl border border-[var(--color-whisper)]">
                        <div className="text-sm font-bold text-[var(--color-gold)]">Bespoke</div>
                        <div className="text-[10px] text-[var(--color-ink)] font-medium mt-0.5">Styling</div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('loyalty')}
                      className="w-full text-xs font-semibold border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold-light)] transition-colors py-2.5"
                    >
                      View Rewards & Tiers
                    </Button>
                  </Card>

                  {/* 4. My Size Profile Card */}
                  <Card variant="elevated" padding="lg" className="border border-[var(--color-whisper)] shadow-sm bg-white rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-[var(--font-display)] text-lg font-medium text-[var(--color-ink)]">
                        My Size Profile
                      </CardTitle>
                      {hasMeasurements && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                          Saved
                        </span>
                      )}
                    </div>

                    {hasMeasurements ? (
                      <div className="space-y-3 mb-4">
                        <p className="text-xs text-[var(--color-slate)]">
                          Your bespoke tailoring measurements:
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(measurements).map(([k, v]) => (
                            <div key={k} className="p-2 rounded-lg bg-[var(--color-snow)] border border-[var(--color-whisper)]">
                              <span className="capitalize text-[var(--color-slate)] block text-[10px]">{k.replace('_', ' ')}</span>
                              <span className="font-semibold text-[var(--color-ink)]">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--color-slate)] mb-4 leading-relaxed">
                        Save your measurements once to receive tailored fit recommendations across Kurtis, Salwars, and Lehengas.
                      </p>
                    )}

                    <MagneticLinkButton
                      variant="primary"
                      strength={0.2}
                      href="/size-finder"
                      className="w-full text-xs font-semibold uppercase tracking-wider py-2.5 justify-center"
                    >
                      {hasMeasurements ? 'Update Measurements' : 'Find My Bespoke Size'}
                    </MagneticLinkButton>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* ORDERS TAB */}
            <TabsContent value="orders" className="space-y-6">
              <Card variant="elevated" padding="none" className="border border-[var(--color-whisper)] shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardHeader className="p-6 border-b border-[var(--color-whisper)] bg-[var(--color-snow)]/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)]">
                        Order History
                      </CardTitle>
                      <p className="text-xs text-[var(--color-slate)] mt-0.5">
                        Complete record of your purchases and shipping milestones
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {orders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[var(--color-whisper)] bg-[var(--color-snow)]/60 text-[11px] font-semibold tracking-wider text-[var(--color-slate)] uppercase">
                            <th className="px-6 py-3.5">Order ID</th>
                            <th className="px-6 py-3.5">Date</th>
                            <th className="px-6 py-3.5">Status</th>
                            <th className="px-6 py-3.5 text-right">Total</th>
                            <th className="px-6 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-whisper)] text-sm">
                          {orders.map((order) => {
                            const statusKey = (order.status || 'processing').toLowerCase();
                            return (
                              <tr key={order.id} className="hover:bg-[var(--color-snow)]/40 transition-colors">
                                <td className="px-6 py-4 font-mono font-medium text-[var(--color-ink)]">
                                  {order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`}
                                </td>
                                <td className="px-6 py-4 text-[var(--color-slate)] text-xs">
                                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={cn('px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wider', statusStyles[statusKey] || statusStyles['processing'])}>
                                    {order.status || 'Processing'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-[var(--color-ink)]">
                                  ₹{Number(order.total_amount).toLocaleString('en-IN')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <Button variant="ghost" size="sm" asChild className="text-xs font-semibold text-[var(--color-gold)]">
                                    <Link href={`/account/orders/${order.id}`}>View Details &rarr;</Link>
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-16 px-6 text-center">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center text-[var(--color-gold)]">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <h3 className="font-display text-xl font-medium text-[var(--color-ink)]">
                        No Orders Placed Yet
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--color-slate)] max-w-md mx-auto mt-1 mb-6 leading-relaxed">
                        When you purchase our artisanal kurtis, sarees, or bridal wear, full tracking updates and invoices will be available here.
                      </p>
                      <Button variant="primary" asChild className="text-xs uppercase tracking-wider font-semibold py-3 px-8">
                        <Link href="/shop">Browse Collections</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* WISHLIST TAB */}
            <TabsContent value="wishlist" className="space-y-6">
              <Card variant="elevated" padding="lg" className="border border-[var(--color-whisper)] shadow-sm bg-white rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <CardTitle className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)]">
                      My Wishlist ({wishlistCount})
                    </CardTitle>
                    <p className="text-xs text-[var(--color-slate)] mt-0.5">
                      Your saved pieces and favorites
                    </p>
                  </div>
                  {wishlistCount > 0 && (
                    <Button variant="outline" size="sm" onClick={() => wishlist.clearWishlist()} className="text-xs">
                      Clear Wishlist
                    </Button>
                  )}
                </div>

                {wishlistCount > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlist.items.map((item) => {
                      const prod = item.product;
                      const img = prod?.primary_image?.url || (prod?.images && prod.images[0]?.url) || '/images/collection-kurtis.jpg';
                      const priceVal = (prod as any)?.price || prod?.min_price || 0;
                      const formattedPrice = priceVal > 50000 ? Math.round(priceVal / 100) : priceVal;

                      return (
                        <div key={item.id} className="p-4 rounded-xl border border-[var(--color-whisper)] flex gap-4 items-center">
                          <div className="w-16 h-20 bg-[var(--color-snow)] rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={img}
                              alt={prod?.name || 'Item'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[var(--color-ink)] truncate">
                              {prod?.name || 'Handcrafted Design'}
                            </p>
                            <p className="text-xs font-bold text-[var(--color-gold)] mt-1">
                              ₹{formattedPrice.toLocaleString('en-IN')}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button variant="primary" size="sm" asChild className="text-[10px] py-1 px-3">
                                <Link href={`/product/${prod?.slug || item.product_id}`}>View</Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => wishlist.removeItem(item.product_id, item.variant_id || undefined)}
                                className="text-[10px] text-rose-600 hover:text-rose-700"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-14 text-center">
                    <svg className="h-12 w-12 mx-auto text-[var(--color-gold)] mb-3 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <h3 className="text-[var(--font-display)] text-lg font-medium text-[var(--color-ink)] mb-1">
                      Your Wishlist is Empty
                    </h3>
                    <p className="text-xs text-[var(--color-slate)] mb-5 max-w-sm mx-auto">
                      Click the heart icon on any kurti, saree, or lehenga to save your favorite styles.
                    </p>
                    <Button variant="primary" size="sm" asChild className="text-xs font-semibold uppercase tracking-wider py-2.5 px-6">
                      <Link href="/shop">Discover Styles</Link>
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* ADDRESSES TAB */}
            <TabsContent value="addresses" className="space-y-6">
              <Card variant="elevated" padding="lg" className="border border-[var(--color-whisper)] shadow-sm bg-white rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <CardTitle className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)]">
                      Shipping Addresses
                    </CardTitle>
                    <p className="text-xs text-[var(--color-slate)] mt-0.5">
                      Manage your delivery locations across India
                    </p>
                  </div>
                </div>

                <div className="p-8 text-center border-2 border-dashed border-[var(--color-whisper)] rounded-xl">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center text-[var(--color-gold)]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-[var(--color-ink)]">No Saved Address Yet</h4>
                  <p className="text-xs text-[var(--color-slate)] mt-1 mb-4 max-w-sm mx-auto">
                    Addresses added during checkout will be securely saved here for 1-click ordering.
                  </p>
                  <Button variant="outline" size="sm" asChild className="text-xs font-semibold">
                    <Link href="/checkout">Go to Checkout</Link>
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* PROFILE TAB */}
            <TabsContent value="profile" className="space-y-6">
              <Card variant="elevated" padding="lg" className="border border-[var(--color-whisper)] shadow-sm bg-white rounded-2xl max-w-2xl">
                <CardTitle className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)] mb-1">
                  Profile Information
                </CardTitle>
                <p className="text-xs text-[var(--color-slate)] mb-6">
                  Update your contact details and account preferences
                </p>

                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1.5">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. Ananya Rao"
                      required
                      size="md"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1.5">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      size="md"
                      hint="Email cannot be changed directly for security reasons"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1.5">
                      Phone Number (for order & WhatsApp updates)
                    </label>
                    <Input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      size="md"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      loading={isUpdatingProfile}
                      disabled={isUpdatingProfile}
                      className="text-xs font-semibold uppercase tracking-wider py-3 px-6"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>

                <div className="mt-8 pt-6 border-t border-[var(--color-whisper)] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-[var(--color-ink)]">Account Session</h4>
                    <p className="text-[11px] text-[var(--color-slate)]">Sign out of your Angelika account</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await signOut();
                      window.location.href = '/login?logout=true';
                    }}
                    className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    Sign Out
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* LOYALTY TAB */}
            <TabsContent value="loyalty" className="space-y-6">
              <Card variant="elevated" padding="lg" className="border border-[var(--color-whisper)] shadow-sm bg-white rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <CardTitle className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)]">
                      Angelika Circle Loyalty Rewards
                    </CardTitle>
                    <p className="text-xs text-[var(--color-slate)] mt-0.5">
                      Earn points on every purchase and unlock bespoke couture privileges
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold bg-[var(--color-gold)] text-[var(--color-ink)] rounded-full tracking-wider uppercase">
                    {loyaltyTier}
                  </span>
                </div>

                <div className="text-center py-6 bg-gradient-to-br from-[var(--color-snow)] to-amber-50/50 rounded-2xl border border-[var(--color-gold-light)] mb-8">
                  <div className="text-5xl sm:text-6xl font-bold text-[var(--color-gold)] font-display mb-1">
                    {loyaltyPoints.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--color-slate)] font-medium">Available Loyalty Points</div>
                  <div className="w-64 max-w-full mx-auto mt-4 px-4">
                    <div className="h-2.5 bg-[var(--color-whisper)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-hover)] rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, tierProgressPercent)}%` }}
                      />
                    </div>
                    <div className="text-xs text-[var(--color-slate)] mt-2 flex justify-between">
                      <span>{tierProgressPercent}% complete</span>
                      <span className="font-semibold text-[var(--color-gold)]">{nextMilestoneText}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)]/40 text-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-slate)]">Silver Tier</span>
                    <div className="text-xl font-bold text-[var(--color-ink)] mt-1 mb-2">0 - 499 pts</div>
                    <ul className="text-xs text-[var(--color-slate)] space-y-1 text-left list-disc list-inside">
                      <li>2% Points Cashback</li>
                      <li>Welcome Gift on Signup</li>
                      <li>Standard Support</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl border-2 border-[var(--color-gold)] bg-amber-50/20 text-center relative shadow-xs">
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-bold bg-[var(--color-gold)] text-[var(--color-ink)] rounded-full uppercase tracking-wider">
                      Popular
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">Gold Tier</span>
                    <div className="text-xl font-bold text-[var(--color-ink)] mt-1 mb-2">500 - 1,499 pts</div>
                    <ul className="text-xs text-[var(--color-slate)] space-y-1 text-left list-disc list-inside">
                      <li>5% Points Cashback</li>
                      <li>Early Sale & Festive Access</li>
                      <li>Free Shipping Always</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)]/40 text-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-slate)]">Platinum Tier</span>
                    <div className="text-xl font-bold text-[var(--color-ink)] mt-1 mb-2">1,500+ pts</div>
                    <ul className="text-xs text-[var(--color-slate)] space-y-1 text-left list-disc list-inside">
                      <li>10% Points Cashback</li>
                      <li>Dedicated Personal Stylist</li>
                      <li>Bespoke Custom Tailoring</li>
                    </ul>
                  </div>
                </div>

                {/* Redeem Rewards Strip */}
                <div className="border-t border-[var(--color-whisper)] pt-6">
                  <h4 className="text-[var(--font-display)] text-lg font-medium text-[var(--color-ink)] mb-4">
                    Redeem Points on Next Order
                  </h4>
                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { pts: '500 pts', val: '₹100 Off', code: 'REDEEM100' },
                      { pts: '1,000 pts', val: '₹250 Off', code: 'REDEEM250' },
                      { pts: '2,500 pts', val: '₹750 Off', code: 'REDEEM750' },
                      { pts: '5,000 pts', val: '₹2,000 Off', code: 'REDEEM2000' },
                    ].map((perk, i) => (
                      <div key={i} className="p-3.5 rounded-xl border border-[var(--color-whisper)] text-center bg-[var(--color-snow)]/30">
                        <div className="text-xs font-bold text-[var(--color-gold)]">{perk.pts}</div>
                        <div className="text-sm font-semibold text-[var(--color-ink)] mt-0.5">{perk.val}</div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={loyaltyPoints < parseInt(perk.pts.replace(/[^0-9]/g, ''))}
                          className="w-full text-[11px] mt-2 py-1"
                        >
                          {loyaltyPoints >= parseInt(perk.pts.replace(/[^0-9]/g, '')) ? 'Redeem Code' : 'Earn More Points'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
