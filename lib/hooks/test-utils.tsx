'use client';

import { createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Profile } from '@/types/database';
import { CartItem, CartState, AppliedCoupon } from '@/types/commerce';

// ============================================
// Mock Auth Context
// ============================================
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, data?: Record<string, any>) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithOtp: (email: string, phone?: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: 'google' | 'github' | 'facebook') => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const MockAuthContext = createContext<AuthContextType | null>(null);

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: { full_name: 'Test User' },
    aud: 'authenticated',
    role: 'authenticated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as User;

  const mockProfile: Profile = {
    id: 'test-user-id',
    email: 'test@example.com',
    full_name: 'Test User',
    phone: '9876543210',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockSession: Session = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: mockUser,
  };

  const value: AuthContextType = {
    user: mockUser,
    profile: mockProfile,
    session: mockSession,
    loading: false,
    signUp: vi.fn().mockResolvedValue({ error: null }),
    signIn: vi.fn().mockResolvedValue({ error: null }),
    signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
    signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue(undefined),
    resetPassword: vi.fn().mockResolvedValue({ error: null }),
    updatePassword: vi.fn().mockResolvedValue({ error: null }),
    updateProfile: vi.fn().mockResolvedValue({ error: null }),
    refreshProfile: vi.fn().mockResolvedValue(undefined),
  };

  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>;
}

// ============================================
// Mock Cart Context
// ============================================
interface CartContextType extends CartState {
  addItem: (variantId: string, quantity: number, size?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ valid: boolean; error?: string }>;
  removeCoupon: () => Promise<void>;
  validateCart: () => Promise<{ valid: boolean; errors: string[] }>;
}

const MockCartContext = createContext<CartContextType | null>(null);

export function MockCartProvider({ children }: { children: ReactNode }) {
  const mockItems: CartItem[] = [];
  const value: CartContextType = {
    items: mockItems,
    itemCount: 0,
    subtotal: 0,
    shippingCost: 0,
    taxAmount: 0,
    discountAmount: 0,
    total: 0,
    currency: 'INR',
    appliedCoupon: null,
    isLoading: false,
    error: null,
    addItem: vi.fn().mockResolvedValue(undefined),
    updateQuantity: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
    clearCart: vi.fn().mockResolvedValue(undefined),
    syncCart: vi.fn().mockResolvedValue(undefined),
    applyCoupon: vi.fn().mockResolvedValue({ valid: true }),
    removeCoupon: vi.fn().mockResolvedValue(undefined),
    validateCart: vi.fn().mockResolvedValue({ valid: true, errors: [] }),
  };

  return <MockCartContext.Provider value={value}>{children}</MockCartContext.Provider>;
}

// ============================================
// Mock Wishlist Context
// ============================================
interface WishlistContextType {
  items: any[];
  itemCount: number;
  loading: boolean;
  error: string | null;
  addItem: (productId: string, variantId: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string, variantId: string) => boolean;
  toggleItem: (productId: string, variantId: string) => Promise<void>;
  moveToCart: (itemId: string) => Promise<void>;
  shareWishlist: () => Promise<string>;
  syncWishlist: () => Promise<void>;
}

const MockWishlistContext = createContext<WishlistContextType | null>(null);

export function MockWishlistProvider({ children }: { children: ReactNode }) {
  const value: WishlistContextType = {
    items: [],
    itemCount: 0,
    loading: false,
    error: null,
    addItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
    clearWishlist: vi.fn().mockResolvedValue(undefined),
    isInWishlist: vi.fn().mockReturnValue(false),
    toggleItem: vi.fn().mockResolvedValue(undefined),
    moveToCart: vi.fn().mockResolvedValue(undefined),
    shareWishlist: vi.fn().mockResolvedValue('https://example.com/wishlist'),
    syncWishlist: vi.fn().mockResolvedValue(undefined),
  };

  return <MockWishlistContext.Provider value={value}>{children}</MockWishlistContext.Provider>;
}

// ============================================
// Mock SizeFinder Context
// ============================================
interface SizeFinderContextType {
  profile: any;
  loading: boolean;
  error: string | null;
  saveProfile: (measurements: any) => Promise<void>;
  getRecommendation: (category: string) => any;
  calculateBodyShape: (measurements: any) => string;
  getSizeChart: (category: string) => any[];
  findBestSize: (measurements: any, sizeChart: any[]) => any;
}

const MockSizeFinderContext = createContext<SizeFinderContextType | null>(null);

export function MockSizeFinderProvider({ children }: { children: ReactNode }) {
  const value: SizeFinderContextType = {
    profile: null,
    loading: false,
    error: null,
    saveProfile: vi.fn().mockResolvedValue(undefined),
    getRecommendation: vi.fn().mockReturnValue({ size: 'M', confidence: 90 }),
    calculateBodyShape: vi.fn().mockReturnValue('hourglass'),
    getSizeChart: vi.fn().mockReturnValue([]),
    findBestSize: vi.fn().mockReturnValue({ size: 'M', matchScore: 95 }),
  };

  return <MockSizeFinderContext.Provider value={value}>{children}</MockSizeFinderContext.Provider>;
}

// ============================================
// Composite Test Providers
// ============================================
export function TestProviders({ children }: { children: ReactNode }) {
  return (
    <MockAuthProvider>
      <MockCartProvider>
        <MockWishlistProvider>
          <MockSizeFinderProvider>
            {children}
          </MockSizeFinderProvider>
        </MockWishlistProvider>
      </MockCartProvider>
    </MockAuthProvider>
  );
}

// Re-export vi for use in test files
import { vi } from 'vitest';
export { vi };