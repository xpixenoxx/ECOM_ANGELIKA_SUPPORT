'use server';

import { revalidatePath } from 'next/cache';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { normalizeAddress } from '@/lib/utils/address';
import { INDIAN_PHONE_REGEX, INDIAN_PINCODE_REGEX, normalizeIndianPhone } from '@/lib/validators/commerce';
import { getCustomerOrders, type CustomerOrder } from './customer-orders';
import { getCartRecommendations, type ProductCardData } from './recommendations';
import { getLatestCircleUpdates } from './circle';
import type { CircleUpdate } from './circle-types';
import {
  DEFAULT_REDEMPTION_RULES,
  LOYALTY_TIERS,
  type LoyaltyTransaction,
} from './loyalty-types';
import type { Address } from '@/types/commerce';
import type { Json } from '@/types/database';

export interface SavedAddress extends Address {
  id?: string;
  label?: string;
  type?: 'Home' | 'Work' | 'Other';
  isDefault?: boolean;
}

export interface CustomerProfileSummary {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  loyalty_points: number;
  loyalty_tier: string;
  created_at: string;
  addresses: SavedAddress[];
}

export interface RedeemedVoucher {
  code: string;
  name: string;
  discountLabel: string;
  minOrderAmount: number;
  isUsed: boolean;
  validUntil: string | null;
  createdAt: string;
}

export interface CustomerLoyaltySummary {
  currentPoints: number;
  tierName: string;
  tierLabel: string;
  nextTierName: string | null;
  nextTierLabel: string | null;
  nextTierMinPoints: number | null;
  pointsToNextTier: number;
  tierProgress: number;
  lifetimePointsEarned: number;
  lifetimePointsRedeemed: number;
  transactions: LoyaltyTransaction[];
  vouchers: RedeemedVoucher[];
}

export interface CustomerAccountOverview {
  isAuthenticated: boolean;
  profile: CustomerProfileSummary | null;
  orders: CustomerOrder[];
  loyalty: CustomerLoyaltySummary;
  circleUpdates: CircleUpdate[];
}

function resolveTierMetrics(points: number) {
  const safePoints = Math.max(0, Math.floor(Number(points) || 0));
  let current = LOYALTY_TIERS[0]!;
  for (const tier of LOYALTY_TIERS) {
    if (safePoints >= tier.minPoints) {
      current = tier;
    }
  }
  const currentIdx = LOYALTY_TIERS.findIndex((t) => t.name === current.name);
  const next = currentIdx >= 0 && currentIdx < LOYALTY_TIERS.length - 1 ? LOYALTY_TIERS[currentIdx + 1]! : null;

  let tierProgress = 100;
  let pointsToNextTier = 0;
  if (next) {
    const span = Math.max(1, next.minPoints - current.minPoints);
    tierProgress = Math.min(100, Math.max(0, Math.round(((safePoints - current.minPoints) / span) * 100)));
    pointsToNextTier = Math.max(0, next.minPoints - safePoints);
  }

  return {
    tierName: current.name,
    tierLabel: current.label,
    nextTierName: next?.name ?? null,
    nextTierLabel: next?.label ?? null,
    nextTierMinPoints: next?.minPoints ?? null,
    pointsToNextTier,
    tierProgress,
  };
}

function extractSavedAddresses(preferences: unknown): SavedAddress[] {
  if (!preferences || typeof preferences !== 'object') return [];
  const raw = (preferences as Record<string, unknown>)['addresses'];
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry: any) => {
      const normalized = normalizeAddress(entry);
      const label =
        typeof entry?.label === 'string' && entry.label.trim()
          ? entry.label.trim()
          : normalized.type;
      return {
        ...normalized,
        label,
      };
    });
}

function extractVoucherCodesFromTransactions(transactions: LoyaltyTransaction[]): string[] {
  const codes = new Set<string>();
  const regex = /\b(CIRCLE-[A-Z0-9]{5,10})\b/g;
  for (const tx of transactions) {
    if (!tx.description) continue;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(tx.description)) !== null) {
      if (match[1]) codes.add(match[1]);
    }
  }
  return Array.from(codes);
}

/**
 * Single fast parallel SSR loader for /account and /account/loyalty.
 * Loads profile, orders, loyalty ledger, redeemed vouchers, and Atelier broadcasts together.
 */
export async function getCustomerAccountOverview(): Promise<CustomerAccountOverview> {
  const emptyLoyalty: CustomerLoyaltySummary = {
    currentPoints: 0,
    ...resolveTierMetrics(0),
    lifetimePointsEarned: 0,
    lifetimePointsRedeemed: 0,
    transactions: [],
    vouchers: [],
  };

  try {
    const serverSupabase = createServerClient();
    const {
      data: { user },
    } = await serverSupabase.auth.getUser();

    if (!user) {
      return {
        isAuthenticated: false,
        profile: null,
        orders: [],
        loyalty: emptyLoyalty,
        circleUpdates: [],
      };
    }

    const [profileRes, ordersRes, txRes, circleUpdates] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      getCustomerOrders(),
      supabaseAdmin
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50),
      getLatestCircleUpdates(3).catch(() => [] as CircleUpdate[]),
    ]);

    const rawProfile = profileRes.data;
    const addresses = extractSavedAddresses(rawProfile?.preferences);
    const currentPoints = Math.max(0, Number(rawProfile?.loyalty_points ?? 0));
    const tierMetrics = resolveTierMetrics(currentPoints);

    const transactions: LoyaltyTransaction[] = (txRes.data || []) as LoyaltyTransaction[];
    let lifetimePointsEarned = 0;
    let lifetimePointsRedeemed = 0;
    for (const tx of transactions) {
      if (tx.points > 0) lifetimePointsEarned += tx.points;
      else lifetimePointsRedeemed += Math.abs(tx.points);
    }

    // Load status of personal vouchers redeemed by this member
    let vouchers: RedeemedVoucher[] = [];
    const voucherCodes = extractVoucherCodesFromTransactions(transactions);
    if (voucherCodes.length > 0) {
      const { data: couponRows } = await supabaseAdmin
        .from('coupons')
        .select('code, name, type, value, min_order_amount, usage_count, usage_limit, is_active, valid_until, created_at')
        .in('code', voucherCodes)
        .order('created_at', { ascending: false });

      if (Array.isArray(couponRows)) {
        vouchers = couponRows.map((c: any) => {
          const isExhausted =
            !c.is_active ||
            (typeof c.usage_limit === 'number' && Number(c.usage_count || 0) >= c.usage_limit);
          const discountLabel =
            c.type === 'free_shipping'
              ? 'Complimentary Shipping'
              : c.type === 'percentage'
                ? `${c.value}% Off`
                : `₹${Number(c.value || 0).toLocaleString('en-IN')} Off`;
          return {
            code: c.code,
            name: c.name || discountLabel,
            discountLabel,
            minOrderAmount: Number(c.min_order_amount || 0),
            isUsed: isExhausted,
            validUntil: c.valid_until || null,
            createdAt: c.created_at,
          };
        });
      }
    }

    const profile: CustomerProfileSummary = {
      id: user.id,
      email: rawProfile?.email || user.email || '',
      full_name:
        rawProfile?.full_name ||
        (user.user_metadata?.['full_name'] as string | undefined) ||
        (user.user_metadata?.['name'] as string | undefined) ||
        null,
      phone: rawProfile?.phone || (user.user_metadata?.['phone'] as string | undefined) || null,
      avatar_url:
        rawProfile?.avatar_url || (user.user_metadata?.['avatar_url'] as string | undefined) || null,
      role: rawProfile?.role || 'customer',
      loyalty_points: currentPoints,
      loyalty_tier: tierMetrics.tierName,
      created_at: rawProfile?.created_at || user.created_at || new Date().toISOString(),
      addresses,
    };

    return {
      isAuthenticated: true,
      profile,
      orders: ordersRes.orders || [],
      loyalty: {
        currentPoints,
        ...tierMetrics,
        lifetimePointsEarned,
        lifetimePointsRedeemed,
        transactions,
        vouchers,
      },
      circleUpdates,
    };
  } catch (err) {
    console.error('getCustomerAccountOverview error:', err);
    return {
      isAuthenticated: false,
      profile: null,
      orders: [],
      loyalty: emptyLoyalty,
      circleUpdates: [],
    };
  }
}

/**
 * Authenticated customer profile update (scoped strictly to current user.id).
 */
export async function updateCustomerProfileAction(input: {
  full_name: string;
  phone?: string | null;
}): Promise<{ success: boolean; error?: string; full_name?: string; phone?: string | null }> {
  try {
    const serverSupabase = createServerClient();
    const {
      data: { user },
    } = await serverSupabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Please sign in to update your profile.' };
    }

    const cleanName = (input.full_name || '').trim().slice(0, 120);
    if (cleanName.length < 2) {
      return { success: false, error: 'Please enter your full name (at least 2 characters).' };
    }

    const rawPhone = (input.phone || '').trim();
    let cleanPhone: string | null = null;
    if (rawPhone) {
      const normalized = normalizeIndianPhone(rawPhone);
      if (!INDIAN_PHONE_REGEX.test(normalized)) {
        return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
      }
      cleanPhone = normalized;
    }

    const nowIso = new Date().toISOString();
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: cleanName,
        phone: cleanPhone,
        updated_at: nowIso,
      })
      .eq('id', user.id);

    if (error) {
      return { success: false, error: error.message || 'Could not save profile changes.' };
    }

    // Keep lightweight auth display name aligned (never puts addresses into JWT)
    try {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...(user.user_metadata || {}),
          full_name: cleanName,
        },
      });
    } catch {
      // Non-blocking
    }

    revalidatePath('/account');
    return { success: true, full_name: cleanName, phone: cleanPhone };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unexpected error saving profile.' };
  }
}

/**
 * Authenticated customer saved addresses persistence (replaces fragile client-only RLS updates).
 */
export async function saveCustomerAddressesAction(
  addresses: SavedAddress[]
): Promise<{ success: boolean; addresses?: SavedAddress[]; error?: string }> {
  try {
    const serverSupabase = createServerClient();
    const {
      data: { user },
    } = await serverSupabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Please sign in to manage your saved addresses.' };
    }

    if (!Array.isArray(addresses)) {
      return { success: false, error: 'Invalid address payload.' };
    }
    if (addresses.length > 15) {
      return { success: false, error: 'You can save up to 15 delivery addresses.' };
    }

    const sanitized: SavedAddress[] = [];
    for (const raw of addresses) {
      const normalized = normalizeAddress({
        ...raw,
        type: raw.label || raw.type || 'Home',
      });
      const cleanPhone = normalizeIndianPhone(normalized.phone || '');
      if (!normalized.firstName || !normalized.address1 || !normalized.city || !normalized.state) {
        return { success: false, error: 'Each address must include recipient name, street address, city, and state.' };
      }
      if (!INDIAN_PINCODE_REGEX.test(normalized.postalCode)) {
        return { success: false, error: `Invalid 6-digit PIN code (${normalized.postalCode || 'blank'}).` };
      }
      if (cleanPhone && !INDIAN_PHONE_REGEX.test(cleanPhone)) {
        return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
      }
      const cleanLabel =
        typeof raw.label === 'string' && raw.label.trim() ? raw.label.trim().slice(0, 32) : normalized.type;
      sanitized.push({
        ...normalized,
        id: normalized.id || `addr_${Date.now()}_${sanitized.length}`,
        label: cleanLabel,
        type: normalized.type,
        phone: cleanPhone || normalized.phone,
        country: normalized.country || 'India',
      });
    }

    // Ensure exactly one default when non-empty
    if (sanitized.length > 0 && !sanitized.some((a) => a.isDefault)) {
      sanitized[0]!.isDefault = true;
    }

    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .maybeSingle();

    const currentPrefs =
      existingProfile?.preferences && typeof existingProfile.preferences === 'object'
        ? (existingProfile.preferences as Record<string, any>)
        : {};

    const nextPrefs = {
      ...currentPrefs,
      addresses: sanitized,
    };

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        preferences: nextPrefs as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      return { success: false, error: error.message || 'Could not save addresses.' };
    }

    revalidatePath('/account');
    revalidatePath('/account/addresses');
    revalidatePath('/checkout');

    return { success: true, addresses: sanitized };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unexpected error saving addresses.' };
  }
}

function generateVoucherSuffix(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += chars[bytes[i]! % chars.length];
  }
  return out;
}

/**
 * Redeem Angelika Circle loyalty points for a real single-use checkout voucher code.
 * Uses optimistic concurrency on profiles.loyalty_points to prevent double-spend.
 */
export async function redeemCustomerLoyaltyRewardAction(ruleId: string): Promise<{
  success: boolean;
  couponCode?: string;
  discountLabel?: string;
  minOrderAmount?: number;
  validUntil?: string;
  newPoints?: number;
  newTier?: string;
  transaction?: LoyaltyTransaction;
  error?: string;
}> {
  try {
    const serverSupabase = createServerClient();
    const {
      data: { user },
    } = await serverSupabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Please sign in to redeem Angelika Circle rewards.' };
    }

    const rule = DEFAULT_REDEMPTION_RULES.find((r) => r.id === ruleId && r.isActive);
    if (!rule) {
      return { success: false, error: 'Selected reward is no longer available.' };
    }

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, loyalty_points, loyalty_tier')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile) {
      return { success: false, error: 'Unable to load your Angelika Circle balance.' };
    }

    const currentPoints = Math.max(0, Number(profile.loyalty_points || 0));
    if (currentPoints < rule.pointsRequired) {
      const shortfall = rule.pointsRequired - currentPoints;
      return {
        success: false,
        error: `You need ${shortfall.toLocaleString('en-IN')} more points to unlock ${rule.name}.`,
      };
    }

    const newPoints = currentPoints - rule.pointsRequired;
    const nextTierMetrics = resolveTierMetrics(newPoints);

    // Optimistic concurrency guard: only deduct if points haven't changed concurrently
    const { data: updatedProfile, error: deductErr } = await supabaseAdmin
      .from('profiles')
      .update({
        loyalty_points: newPoints,
        loyalty_tier: nextTierMetrics.tierName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .eq('loyalty_points', currentPoints)
      .select('id, loyalty_points')
      .maybeSingle();

    if (deductErr || !updatedProfile) {
      return {
        success: false,
        error: 'Your balance changed while redeeming. Please refresh and try again.',
      };
    }

    const couponCode = `CIRCLE-${generateVoucherSuffix()}`;
    const now = new Date();
    const validUntil = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const couponType =
      rule.rewardType === 'free_shipping'
        ? 'free_shipping'
        : rule.rewardType === 'discount_percent'
          ? 'percentage'
          : 'fixed';

    const { error: couponErr } = await supabaseAdmin.from('coupons').insert({
      code: couponCode,
      name: `Angelika Circle · ${rule.name}`,
      type: couponType,
      value: rule.rewardValue,
      min_order_amount: rule.minOrderAmount || 0,
      usage_limit: 1,
      usage_count: 0,
      user_limit: 1,
      first_order_only: false,
      is_active: true,
      valid_from: now.toISOString(),
      valid_until: validUntil,
    });

    if (couponErr) {
      // Refund points cleanly if coupon creation failed
      await supabaseAdmin
        .from('profiles')
        .update({
          loyalty_points: currentPoints,
          loyalty_tier: resolveTierMetrics(currentPoints).tierName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      return { success: false, error: 'Could not issue reward voucher. Your points were not deducted.' };
    }

    const txType = rule.rewardType === 'free_shipping' ? 'redeem_shipping' : 'redeem_discount';
    const { data: txRow } = await supabaseAdmin
      .from('loyalty_transactions')
      .insert({
        user_id: user.id,
        points: -rule.pointsRequired,
        type: txType,
        description: `Redeemed ${rule.name} · Voucher ${couponCode}`,
      })
      .select('*')
      .single();

    revalidatePath('/account');
    revalidatePath('/account/loyalty');

    const discountLabel =
      couponType === 'free_shipping'
        ? 'Complimentary Shipping'
        : couponType === 'percentage'
          ? `${rule.rewardValue}% Off`
          : `₹${rule.rewardValue.toLocaleString('en-IN')} Off`;

    return {
      success: true,
      couponCode,
      discountLabel,
      minOrderAmount: rule.minOrderAmount || 0,
      validUntil,
      newPoints,
      newTier: nextTierMetrics.tierName,
      transaction: (txRow || undefined) as LoyaltyTransaction | undefined,
    };
  } catch (err: any) {
    console.error('redeemCustomerLoyaltyRewardAction error:', err);
    return { success: false, error: err?.message || 'Failed to redeem reward.' };
  }
}

/**
 * Fetches live database recommendations for the Wishlist page (replaces hardcoded stale slugs).
 */
export async function getWishlistRecommendationsAction(
  excludeIds: string[] = []
): Promise<ProductCardData[]> {
  try {
    return await getCartRecommendations(excludeIds, 4);
  } catch {
    return [];
  }
}
