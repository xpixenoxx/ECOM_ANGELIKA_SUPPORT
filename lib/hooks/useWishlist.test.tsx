import { renderHook, act, waitFor } from '@testing-library/react';
import { useWishlist, WishlistProvider } from './useWishlist';
import { AuthProvider } from './useAuth';
import { createClient, getSupabaseClient } from '@/lib/supabase/client';
import { ReactNode } from 'react';

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
  getSupabaseClient: vi.fn(),
}));

const mockSupabase = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
  },
  from: vi.fn(),
  channel: vi.fn(),
};

// Wrapper with real providers (WishlistProvider uses AuthProvider internally)
const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>
    <WishlistProvider>{children}</WishlistProvider>
  </AuthProvider>
);

const mockWishlistItems = [
  {
    id: '1',
    product_id: 'p1',
    variant_id: 'v1',
    products: { id: 'p1', name: 'Wishlist Product', price: 1000, images: ['img1.jpg'] },
    variants: { id: 'v1', size: 'M', color: 'Blue' },
  },
  {
    id: '2',
    product_id: 'p2',
    variant_id: 'v2',
    products: { id: 'p2', name: 'Another Wishlist Item', price: 2000, images: ['img2.jpg'] },
    variants: { id: 'v2', size: 'L', color: 'Red' },
  },
];

describe('useWishlist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockReturnValue(mockSupabase);
    (getSupabaseClient as any).mockReturnValue(mockSupabase);
    localStorage.clear();
  });

  const setupWishlist = (items = mockWishlistItems) => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: items, error: null }),
    });

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: items[0], error: null }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    });

    mockSupabase.channel.mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    });
  };

  it('should initialize with empty wishlist', () => {
    setupWishlist([]);

    const { result } = renderHook(() => useWishlist(), { wrapper });

    expect(result.current.items).toEqual([]);
    expect(result.current.count).toBe(0);
    expect(result.current.loading).toBe(true);
  });

  it('should load wishlist items', async () => {
    setupWishlist(mockWishlistItems);

    const { result } = renderHook(() => useWishlist(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.count).toBe(2);
  });

  it('should add item to wishlist', async () => {
    setupWishlist([]);

    const { result } = renderHook(() => useWishlist(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newItem = {
      productId: 'p3',
      variantId: 'v3',
    };

    mockSupabase.from.mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { ...newItem, id: '3' }, error: null }),
        }),
      }),
    });

    await act(async () => {
      await result.current.addItem(newItem);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.count).toBe(1);
  });

  it('should remove item from wishlist', async () => {
    setupWishlist(mockWishlistItems);

    const { result } = renderHook(() => useWishlist(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    });

    await act(async () => {
      await result.current.removeItem('1');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items.find(i => i.id === '1')).toBeUndefined();
  });

  it('should check if item is in wishlist', async () => {
    setupWishlist(mockWishlistItems);

    const { result } = renderHook(() => useWishlist(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isInWishlist('p1')).toBe(true);
    expect(result.current.isInWishlist('p3')).toBe(false);
  });

  it('should clear wishlist', async () => {
    setupWishlist(mockWishlistItems);

    const { result } = renderHook(() => useWishlist(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    });

    await act(async () => {
      await result.current.clearWishlist();
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it('should toggle item in wishlist', async () => {
    setupWishlist([]);

    const { result } = renderHook(() => useWishlist(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Add item
    mockSupabase.from.mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { product_id: 'p1', variant_id: 'v1', id: '1' }, error: null }),
        }),
      }),
    });

    await act(async () => {
      await result.current.toggleItem({ productId: 'p1', variantId: 'v1' });
    });

    expect(result.current.count).toBe(1);
    expect(result.current.isInWishlist('p1')).toBe(true);

    // Remove item
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    });

    await act(async () => {
      await result.current.toggleItem({ productId: 'p1', variantId: 'v1' });
    });

    expect(result.current.count).toBe(0);
    expect(result.current.isInWishlist('p1')).toBe(false);
  });
});