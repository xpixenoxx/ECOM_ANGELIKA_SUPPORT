// ============================================
// LOYALTY TYPES
// ============================================

import type { Database } from '@/types/database';

type LoyaltyTransactionRow = Database['public']['Tables']['loyalty_transactions']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export interface LoyaltyTransaction extends LoyaltyTransactionRow {}

export interface LoyaltyTier {
  name: string;
  label: string;
  minPoints: number;
  maxPoints: number | null;
  benefits: string[];
  color: string;
  icon: string;
}

export const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    name: 'bronze',
    label: 'Bronze',
    minPoints: 0,
    maxPoints: 999,
    benefits: ['Earn 1 point per ₹100 spent', 'Birthday bonus: 100 points'],
    color: 'var(--color-bronze)',
    icon: '🥉',
  },
  {
    name: 'silver',
    label: 'Silver',
    minPoints: 1000,
    maxPoints: 4999,
    benefits: ['Earn 1.25 points per ₹100 spent', 'Birthday bonus: 250 points', 'Free shipping on all orders'],
    color: 'var(--color-silver)',
    icon: '🥈',
  },
  {
    name: 'gold',
    label: 'Gold',
    minPoints: 5000,
    maxPoints: 14999,
    benefits: ['Earn 1.5 points per ₹100 spent', 'Birthday bonus: 500 points', 'Free shipping', 'Early access to sales'],
    color: 'var(--color-gold)',
    icon: '🥇',
  },
  {
    name: 'platinum',
    label: 'Platinum',
    minPoints: 15000,
    maxPoints: null,
    benefits: ['Earn 2 points per ₹100 spent', 'Birthday bonus: 1000 points', 'Free shipping', 'Early access', 'Personal stylist', 'Exclusive products'],
    color: 'var(--color-platinum)',
    icon: '💎',
  },
];

export interface LoyaltyEarningRule {
  id: string;
  name: string;
  description: string;
  pointsPerAmount: number;
  amount: number; // Points per this amount (e.g., 100 = per ₹100)
  multiplier: number;
  isActive: boolean;
  appliesTo: 'all' | 'categories' | 'products' | 'tiers';
  applicableIds?: string[];
  tierMultipliers?: Record<string, number>;
}

export interface LoyaltyRedemptionRule {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  rewardType: 'discount_fixed' | 'discount_percent' | 'free_shipping' | 'gift' | 'coupon';
  rewardValue: number; // Discount amount or percentage
  minOrderAmount?: number;
  maxRedemptionsPerUser?: number;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  applicableTiers?: string[];
}

export interface LoyaltyStats {
  totalMembers: number;
  activeMembers: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  avgPointsPerMember: number;
  tierDistribution: Record<string, number>;
  pointsExpiringSoon: number;
  recentTransactions: LoyaltyTransaction[];
}

export interface CustomerLoyaltyProfile {
  user: ProfileRow;
  currentPoints: number;
  tier: string;
  tierProgress: number; // 0-100
  pointsToNextTier: number;
  nextTier: string | null;
  lifetimePointsEarned: number;
  lifetimePointsRedeemed: number;
  recentTransactions: LoyaltyTransaction[];
}

export interface LoyaltyListResult {
  success: boolean;
  transactions?: LoyaltyTransaction[];
  total?: number;
  error?: string;
}

export interface LoyaltySingleResult {
  success: boolean;
  transaction?: LoyaltyTransaction;
  error?: string;
}

export interface LoyaltyMutationResult {
  success: boolean;
  error?: string;
}

export const LOYALTY_TRANSACTION_TYPES = [
  { value: 'earn_purchase', label: 'Earn - Purchase', color: 'var(--color-success)' },
  { value: 'earn_signup', label: 'Earn - Signup Bonus', color: 'var(--color-info)' },
  { value: 'earn_review', label: 'Earn - Review', color: 'var(--color-info)' },
  { value: 'earn_referral', label: 'Earn - Referral', color: 'var(--color-info)' },
  { value: 'earn_birthday', label: 'Earn - Birthday', color: 'var(--color-purple)' },
  { value: 'earn_social', label: 'Earn - Social Share', color: 'var(--color-info)' },
  { value: 'earn_manual', label: 'Earn - Manual Adjustment', color: 'var(--color-warning)' },
  { value: 'redeem_discount', label: 'Redeem - Discount', color: 'var(--color-error)' },
  { value: 'redeem_shipping', label: 'Redeem - Free Shipping', color: 'var(--color-error)' },
  { value: 'redeem_gift', label: 'Redeem - Gift', color: 'var(--color-error)' },
  { value: 'expire', label: 'Expired', color: 'var(--color-slate)' },
  { value: 'adjust', label: 'Manual Adjustment', color: 'var(--color-warning)' },
] as const;

export type LoyaltyTransactionType = typeof LOYALTY_TRANSACTION_TYPES[number]['value'];

export const DEFAULT_EARNING_RULES: LoyaltyEarningRule[] = [
  {
    id: 'purchase_base',
    name: 'Base Purchase Earnings',
    description: 'Earn points on every purchase',
    pointsPerAmount: 1,
    amount: 100,
    multiplier: 1,
    isActive: true,
    appliesTo: 'all',
  },
  {
    id: 'signup_bonus',
    name: 'Signup Bonus',
    description: 'Welcome points for new members',
    pointsPerAmount: 500,
    amount: 1,
    multiplier: 1,
    isActive: true,
    appliesTo: 'all',
  },
  {
    id: 'review_bonus',
    name: 'Review Bonus',
    description: 'Points for writing product reviews',
    pointsPerAmount: 100,
    amount: 1,
    multiplier: 1,
    isActive: true,
    appliesTo: 'all',
  },
  {
    id: 'referral_bonus',
    name: 'Referral Bonus',
    description: 'Points for referring friends',
    pointsPerAmount: 1000,
    amount: 1,
    multiplier: 1,
    isActive: true,
    appliesTo: 'all',
  },
  {
    id: 'birthday_bonus',
    name: 'Birthday Bonus',
    description: 'Annual birthday points',
    pointsPerAmount: 100,
    amount: 1,
    multiplier: 1,
    isActive: true,
    appliesTo: 'all',
  },
];

export const DEFAULT_REDEMPTION_RULES: LoyaltyRedemptionRule[] = [
  {
    id: 'discount_100',
    name: '₹100 Off',
    description: 'Redeem 500 points for ₹100 off',
    pointsRequired: 500,
    rewardType: 'discount_fixed',
    rewardValue: 100,
    minOrderAmount: 500,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: null,
    isActive: true,
  },
  {
    id: 'discount_250',
    name: '₹250 Off',
    description: 'Redeem 1200 points for ₹250 off',
    pointsRequired: 1200,
    rewardType: 'discount_fixed',
    rewardValue: 250,
    minOrderAmount: 1000,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: null,
    isActive: true,
  },
  {
    id: 'discount_500',
    name: '₹500 Off',
    description: 'Redeem 2200 points for ₹500 off',
    pointsRequired: 2200,
    rewardType: 'discount_fixed',
    rewardValue: 500,
    minOrderAmount: 2000,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: null,
    isActive: true,
  },
  {
    id: 'free_shipping',
    name: 'Free Shipping',
    description: 'Redeem 300 points for free shipping',
    pointsRequired: 300,
    rewardType: 'free_shipping',
    rewardValue: 0,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: null,
    isActive: true,
  },
];