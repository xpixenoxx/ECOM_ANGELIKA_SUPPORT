'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  LoyaltyTransaction,
  LoyaltyTier,
  LoyaltyEarningRule,
  LoyaltyRedemptionRule,
  LoyaltyStats,
  CustomerLoyaltyProfile,
  LoyaltyListResult,
  LoyaltySingleResult,
  LoyaltyMutationResult,
  LoyaltyTransactionType,
  LOYALTY_TIERS,
  LOYALTY_TRANSACTION_TYPES,
  DEFAULT_EARNING_RULES,
  DEFAULT_REDEMPTION_RULES,
} from './loyalty-types';

// ============================================
// SERVER ACTIONS - LOYALTY
// ============================================

/**
 * Get loyalty statistics for admin dashboard
 */
export async function getLoyaltyStats(): Promise<LoyaltyStats> {
  try {
    const supabase = await createClient();

    // Check admin auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      throw new Error('Forbidden - Admin only');
    }

    // Get total members
    const { count: totalMembers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .neq('role', 'admin');

    // Get active members (made a purchase in last 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data: activeUsers } = await supabase
      .from('orders')
      .select('user_id')
      .gte('created_at', ninetyDaysAgo)
      .not('user_id', 'is', null);

    const activeMembers = new Set(activeUsers?.map(o => o.user_id) || []).size;

    // Get total points issued and redeemed
    const { data: transactions } = await supabase
      .from('loyalty_transactions')
      .select('points, type');

    let totalPointsIssued = 0;
    let totalPointsRedeemed = 0;
    const tierDistribution: Record<string, number> = {};

    if (transactions) {
      for (const t of transactions) {
        if (t.points > 0) {
          totalPointsIssued += t.points;
        } else {
          totalPointsRedeemed += Math.abs(t.points);
        }
      }
    }

    // Get tier distribution from profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('loyalty_tier, loyalty_points')
      .neq('role', 'admin');

    if (profiles) {
      for (const p of profiles) {
        const tier = p.loyalty_tier || 'bronze';
        tierDistribution[tier] = (tierDistribution[tier] || 0) + 1;
      }
    }

    // Points expiring soon (within 30 days)
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: pointsExpiringSoon } = await supabase
      .from('loyalty_transactions')
      .select('*', { count: 'exact', head: true })
      .lt('points', 0)
      .not('expires_at', 'is', null)
      .lte('expires_at', thirtyDaysFromNow);

    // Recent transactions
    const { data: recentTransactions } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    const avgPointsPerMember = totalMembers && totalMembers > 0
      ? Math.round(totalPointsIssued / totalMembers)
      : 0;

    return {
      totalMembers: totalMembers || 0,
      activeMembers,
      totalPointsIssued,
      totalPointsRedeemed,
      avgPointsPerMember,
      tierDistribution,
      pointsExpiringSoon: pointsExpiringSoon || 0,
      recentTransactions: recentTransactions || [],
    };
  } catch (error) {
    console.error('Get loyalty stats error:', error);
    return {
      totalMembers: 0,
      activeMembers: 0,
      totalPointsIssued: 0,
      totalPointsRedeemed: 0,
      avgPointsPerMember: 0,
      tierDistribution: {},
      pointsExpiringSoon: 0,
      recentTransactions: [],
    };
  }
}

/**
 * Get loyalty transactions with filters
 */
export async function getLoyaltyTransactions(
  page = 1,
  limit = 20,
  filters?: {
    userId?: string;
    type?: LoyaltyTransactionType;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<LoyaltyListResult> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return { success: false, error: 'Forbidden - Admin only' };
    }

    let query = supabase
      .from('loyalty_transactions')
      .select('*, profiles!loyalty_transactions_user_id_fkey(full_name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    const { data: transactions, error, count } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      transactions: transactions || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Get loyalty transactions error:', error);
    return { success: false, error: 'Failed to fetch transactions' };
  }
}

/**
 * Get customer loyalty profile
 */
export async function getCustomerLoyaltyProfile(userId: string): Promise<CustomerLoyaltyProfile | null> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return null;
    }

    // Allow users to view their own profile, admins can view any
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && user.id !== userId)) {
      return null;
    }

    // Get customer profile
    const { data: customer } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!customer) return null;

    // Get transactions
    const { data: transactions } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    const currentPoints = customer.loyalty_points || 0;
    const tier = customer.loyalty_tier || 'bronze';

    // Calculate tier progress
    const fallbackTier = LOYALTY_TIERS[0] ?? { name: 'bronze', label: 'Bronze', minPoints: 0, maxPoints: 999, benefits: [], color: 'var(--color-bronze)', icon: '🥉' };
    const currentTier = LOYALTY_TIERS.find(t => t.name === tier) || fallbackTier;
    const nextTier = LOYALTY_TIERS.find(t => t.minPoints > currentTier.minPoints);

    let tierProgress = 0;
    let pointsToNextTier = 0;

    if (nextTier) {
      const tierRange = nextTier.minPoints - currentTier.minPoints;
      const pointsInTier = currentPoints - currentTier.minPoints;
      tierProgress = Math.min(100, Math.max(0, (pointsInTier / tierRange) * 100));
      pointsToNextTier = nextTier.minPoints - currentPoints;
    }

    // Calculate lifetime points
    let lifetimePointsEarned = 0;
    let lifetimePointsRedeemed = 0;

    if (transactions) {
      for (const t of transactions) {
        if (t.points > 0) {
          lifetimePointsEarned += t.points;
        } else {
          lifetimePointsRedeemed += Math.abs(t.points);
        }
      }
    }

    return {
      user: customer,
      currentPoints,
      tier,
      tierProgress,
      pointsToNextTier,
      nextTier: nextTier?.name || null,
      lifetimePointsEarned,
      lifetimePointsRedeemed,
      recentTransactions: transactions || [],
    };
  } catch (error) {
    console.error('Get customer loyalty profile error:', error);
    return null;
  }
}

/**
 * Add loyalty points (admin manual adjustment)
 */
export async function addLoyaltyPoints(
  userId: string,
  points: number,
  type: LoyaltyTransactionType,
  description: string,
  orderId?: string,
  expiresAt?: string
): Promise<LoyaltyMutationResult> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return { success: false, error: 'Forbidden - Admin only' };
    }

    // Create transaction
    const { error: txError } = await supabase
      .from('loyalty_transactions')
      .insert({
        user_id: userId,
        points,
        type,
        description,
        order_id: orderId || null,
        expires_at: expiresAt || null,
      });

    if (txError) {
      return { success: false, error: txError.message };
    }

    // Update user's total points
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('loyalty_points')
      .eq('id', userId)
      .single();

    const newPoints = (currentProfile?.loyalty_points || 0) + points;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        loyalty_points: newPoints,
        loyalty_tier: calculateTier(newPoints),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath('/admin/customers/loyalty');
    revalidatePath('/account/loyalty');

    return { success: true };
  } catch (error) {
    console.error('Add loyalty points error:', error);
    return { success: false, error: 'Failed to add points' };
  }
}

/**
 * Deduct loyalty points (admin manual adjustment)
 */
export async function deductLoyaltyPoints(
  userId: string,
  points: number,
  description: string
): Promise<LoyaltyMutationResult> {
  return addLoyaltyPoints(userId, -Math.abs(points), 'adjust', description);
}

/**
 * Calculate tier based on points
 */
function calculateTier(points: number): string {
  for (let i = LOYALTY_TIERS.length - 1; i >= 0; i--) {
    const tier = LOYALTY_TIERS[i];
    if (tier && points >= tier.minPoints) {
      return tier.name;
    }
  }
  return 'bronze';
}

/**
 * Get earning rules
 */
export async function getEarningRules(): Promise<LoyaltyEarningRule[]> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return DEFAULT_EARNING_RULES;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') return DEFAULT_EARNING_RULES;

    // In a real app, these would be stored in a database table
    // For now, return defaults
    return DEFAULT_EARNING_RULES;
  } catch {
    return DEFAULT_EARNING_RULES;
  }
}

/**
 * Get redemption rules
 */
export async function getRedemptionRules(): Promise<LoyaltyRedemptionRule[]> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return DEFAULT_REDEMPTION_RULES;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') return DEFAULT_REDEMPTION_RULES;

    return DEFAULT_REDEMPTION_RULES;
  } catch {
    return DEFAULT_REDEMPTION_RULES;
  }
}

/**
 * Get all loyalty tiers
 */
export async function getLoyaltyTiers(): Promise<LoyaltyTier[]> {
  return LOYALTY_TIERS;
}

/**
 * Get transaction types
 */
export async function getTransactionTypes(): Promise<typeof LOYALTY_TRANSACTION_TYPES> {
  return LOYALTY_TRANSACTION_TYPES;
}

/**
 * Process order loyalty points (called from checkout/order confirmation)
 */
export async function processOrderLoyalty(orderId: string, userId: string, amount: number): Promise<LoyaltyMutationResult> {
  try {
    const supabase = await createClient();

    // Check if already processed
    const { data: existing } = await supabase
      .from('loyalty_transactions')
      .select('id')
      .eq('order_id', orderId)
      .eq('type', 'earn_purchase')
      .single();

    if (existing) {
      return { success: true }; // Already processed
    }

    // Get user's tier for multiplier
    const { data: profile } = await supabase
      .from('profiles')
      .select('loyalty_tier')
      .eq('id', userId)
      .single();

    const tier = profile?.loyalty_tier || 'bronze';
    const tierInfo = LOYALTY_TIERS.find(t => t.name === tier) || LOYALTY_TIERS[0];

    // Calculate points (base: 1 point per ₹100, multiplied by tier)
    const basePoints = Math.floor(amount / 100);
    const points = Math.floor(basePoints * (tier === 'silver' ? 1.25 : tier === 'gold' ? 1.5 : tier === 'platinum' ? 2 : 1));

    if (points <= 0) return { success: true };

    // Create earn transaction
    const { error: txError } = await supabase
      .from('loyalty_transactions')
      .insert({
        user_id: userId,
        points,
        type: 'earn_purchase',
        description: `Earned from order ${orderId.slice(-8).toUpperCase()}`,
        order_id: orderId,
      });

    if (txError) {
      return { success: false, error: txError.message };
    }

    // Update user points and tier
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('loyalty_points')
      .eq('id', userId)
      .single();

    const newPoints = (currentProfile?.loyalty_points || 0) + points;
    const newTier = calculateTier(newPoints);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        loyalty_points: newPoints,
        loyalty_tier: newTier,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Process order loyalty error:', error);
    return { success: false, error: 'Failed to process loyalty points' };
  }
}

/**
 * Redeem loyalty points for reward
 */
export async function redeemLoyaltyPoints(
  userId: string,
  redemptionRuleId: string,
  orderId?: string
): Promise<LoyaltyMutationResult> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Users can only redeem for themselves unless admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, loyalty_points')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return { success: false, error: 'User not found' };
    }

    const targetUserId = profile.role === 'admin' && userId !== user.id ? userId : user.id;

    // Get the redemption rule
    const rules = await getRedemptionRules();
    const rule = rules.find(r => r.id === redemptionRuleId);

    if (!rule || !rule.isActive) {
      return { success: false, error: 'Invalid redemption rule' };
    }

    // Check user has enough points
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('loyalty_points')
      .eq('id', targetUserId)
      .single();

    const currentPoints = targetProfile?.loyalty_points || 0;

    if (currentPoints < rule.pointsRequired) {
      return { success: false, error: 'Insufficient points' };
    }

    // Check tier eligibility
    if (rule.applicableTiers && rule.applicableTiers.length > 0) {
      const { data: tierProfile } = await supabase
        .from('profiles')
        .select('loyalty_tier')
        .eq('id', targetUserId)
        .single();

      if (!tierProfile || !rule.applicableTiers.includes(tierProfile.loyalty_tier || 'bronze')) {
        return { success: false, error: 'Your tier is not eligible for this reward' };
      }
    }

    // Create redemption transaction
    const { error: txError } = await supabase
      .from('loyalty_transactions')
      .insert({
        user_id: targetUserId,
        points: -rule.pointsRequired,
        type: rule.rewardType === 'free_shipping' ? 'redeem_shipping' :
              rule.rewardType === 'gift' ? 'redeem_gift' : 'redeem_discount',
        description: `Redeemed: ${rule.name}`,
        order_id: orderId || null,
      });

    if (txError) {
      return { success: false, error: txError.message };
    }

    // Update user points
    const newPoints = currentPoints - rule.pointsRequired;
    const newTier = calculateTier(newPoints);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        loyalty_points: newPoints,
        loyalty_tier: newTier,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetUserId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath('/account/loyalty');
    revalidatePath('/admin/customers/loyalty');

    return { success: true };
  } catch (error) {
    console.error('Redeem loyalty points error:', error);
    return { success: false, error: 'Failed to redeem points' };
  }
}