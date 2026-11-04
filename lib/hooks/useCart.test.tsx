import { renderHook, act, waitFor } from '@testing-library/react';
import { useCart, CartProvider } from './useCart';
import { AuthProvider } from './useAuth';
import { createClient, getSupabaseClient } from '@/lib/supabase/client';
import { ReactNode } from 'react';

// Mock the Supabase client
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

// Wrapper with real providers (CartProvider uses AuthProvider internally)
const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>
    <CartProvider>{children}</CartProvider>
  </AuthProvider>
);

const mockCartItems = [
  {
    id: '1',
    product_id: 'p1',
    variant_id: 'v1',
    quantity: 2,
    products: { id: 'p1', name: 'Test Product', price: 1000, images: ['img1.jpg'] },
    variants: { id: 'v1', size: 'M', color: 'Blue' },
  },
  {
    id: '2',
    product_id: 'p2',
    variant_id: 'v2',
    quantity: 1,
    products: { id: 'p2', name: 'Another Product', price: 2000, images: ['img2.jpg'] },
    variants: { id: 'v2', size: 'L', color: 'Red' },
  },
];

describe('useCart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockReturnValue(mockSupabase);
    (getSupabaseClient as any).mockReturnValue(mockSupabase);
    localStorage.clear();
  });

  const setupCart = (items = mockCartItems) => {
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
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
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

  it('should initialize with empty cart', () => {
    setupCart([]);

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toEqual([]);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.subtotal).toBe(0);
    expect(result.current.loading).toBe(true);
  });

  it('should load cart items', async () => {
    setupCart(mockCartItems);

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.itemCount).toBe(3); // 2 + 1
    expect(result.current.subtotal).toBe(4000); // 1000*2 + 2000*1
  });

  it('should add item to cart', async () => {
    setupCart([]);

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newItem = {
      productId: 'p3',
      variantId: 'v3',
      quantity: 1,
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
    expect(result.current.itemCount).toBe(1);
  });

  it('should update item quantity', async () => {
    setupCart(mockCartItems);

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockSupabase.from.mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    });

    await act(async () => {
      await result.current.updateQuantity('1', 5);
    });

    expect(result.current.items.find(i => i.id === '1')?.quantity).toBe(5);
  });

  it('should remove item from cart', async () => {
    setupCart(mockCartItems);

    const { result } = renderHook(() => useCart(), { wrapper });

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

  it('should clear cart', async () => {
    setupCart(mockCartItems);

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    });

    await act(async () => {
      await result.current.clearCart();
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.itemCount).toBe(0);
  });

  it('should calculate totals correctly', async () => {
    setupCart(mockCartItems);

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.subtotal).toBe(4000);
    expect(result.current.itemCount).toBe(3);
  });

  it('should handle realtime updates', async () => {
    let broadcastCallback: (payload: any) => void;

    setupCart(mockCartItems);

    mockSupabase.channel.mockReturnValue({
      on: vi.fn((event, filter, callback) => {
        broadcastCallback = callback;
        return { subscribe: vi.fn() };
      }),
      subscribe: vi.fn(),
    });

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Simulate realtime insert
    const newItem = {
      id: '3',
      product_id: 'p3',
      variant_id: 'v3',
      quantity: 1,
      products: { id: 'p3', name: 'New Product', price: 1500, images: ['img3.jpg'] },
      variants: { id: 'v3', size: 'S', color: 'Green' },
    };

    act(() => {
      broadcastCallback({
        eventType: 'INSERT',
        new: newItem,
      });
    });

    expect(result.current.items).toHaveLength(3);
    expect(result.current.itemCount).toBe(4);
  });
});