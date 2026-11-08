'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CartItem, CartState, AppliedCoupon } from '@/types/commerce';
import { useAuth } from './useAuth';
import { STORE_CATALOGUE, VIDHYAS_PICKS_LIST } from '@/lib/data/store-catalogue';
import toast from 'react-hot-toast';

interface CartContextType extends CartState {
  loading?: boolean;
  addItem: (variantId: string, quantity?: number, size?: string, productData?: Partial<CartItem>) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ valid: boolean; error?: string }>;
  removeCoupon: () => Promise<void>;
  validateCart: () => Promise<{ valid: boolean; errors: string[] }>;
}

const CartContext = createContext<CartContextType | null>(null);

const SHIPPING_THRESHOLD = 2999; // Free shipping for orders >= ₹2,999 (matches site banner)
const DEFAULT_SHIPPING = 99; // Standard shipping is ₹99 for orders under ₹2,999
const FREE_SHIPPING = 0;

function generateCartItemId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // Fall through to fallback generator
    }
  }
  return 'cart_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isTestEnv = process.env.NODE_ENV === 'test';
  const [state, setState] = useState<CartState>({
    items: [],
    itemCount: 0,
    subtotal: 0,
    shippingCost: 0,
    taxAmount: 0,
    discountAmount: 0,
    total: 0,
    currency: 'INR',
    appliedCoupon: null,
    isLoading: true,
    error: null,
  });
  const supabase = createClient();

  // Calculate totals
  const calculateTotals = useCallback((items: CartItem[], coupon: AppliedCoupon | null) => {
    if (!items || items.length === 0) {
      return {
        subtotal: 0,
        shippingCost: 0,
        taxAmount: 0,
        discountAmount: 0,
        total: 0,
        itemCount: 0,
      };
    }

    const subtotal = items.reduce((sum, item) => {
      const p = typeof item.price === 'number' && !isNaN(item.price) && item.price > 0
        ? item.price
        : Number(String(item.price || '').replace(/[^0-9.]/g, '')) || 0;
      const q = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;
      return sum + p * q;
    }, 0);
    const discountAmount = coupon?.discountAmount || 0;
    const isFreeShipping = coupon?.type === 'free_shipping' || subtotal >= SHIPPING_THRESHOLD;
    const shippingCost = isFreeShipping ? FREE_SHIPPING : DEFAULT_SHIPPING;

    // Product prices are inclusive of GST (standard in Indian luxury apparel retail).
    // taxAmount is 0 additional charges so customers pay exact MRP.
    const taxAmount = 0;
    const total = Math.max(0, subtotal + shippingCost - discountAmount);

    return {
      subtotal,
      shippingCost,
      taxAmount,
      discountAmount,
      total,
      itemCount: items.reduce((sum, item) => sum + (typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1), 0),
    };
  }, []);

  // Load cart on mount and user change
  useEffect(() => {
    loadCart();
  }, [user]);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'cart_updated' || e.key === 'guest_cart') {
        loadCart();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const loadCart = async () => {
    // 1. Immediately read localStorage so cart & order load instantly with zero delay
    let localItems: CartItem[] = [];
    if (typeof window !== 'undefined') {
      try {
        const guestCart = localStorage.getItem('guest_cart');
        if (guestCart) {
          localItems = JSON.parse(guestCart);
        }
      } catch {
        localItems = [];
      }
    }

    // If local items exist, display them immediately
    if (localItems.length > 0) {
      const totals = calculateTotals(localItems, state.appliedCoupon);
      setState(prev => ({
        ...prev,
        items: localItems,
        ...totals,
        isLoading: false,
      }));
    } else {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
    }

    // If user is a guest, set local items and finish loading
    if (!user) {
      const totals = calculateTotals(localItems, state.appliedCoupon);
      setState(prev => ({
        ...prev,
        items: localItems,
        ...totals,
        isLoading: false,
      }));
      return;
    }

    try {
      let items: CartItem[] = localItems;

      if (user) {
        // Query Supabase with a fast 1.5s timeout to prevent freezing the checkout screen
        const fetchRemoteCart = async (): Promise<CartItem[] | null> => {
          const { data: carts } = await supabase
            .from('carts')
            .select('items')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(1);

          const cart = carts?.[0];

          if (cart?.items && Array.isArray(cart.items) && cart.items.length > 0) {
            const variantIds = cart.items.map((i: any) => i.variant_id);

            const { data: variants } = await supabase
              .from('product_variants')
              .select(`
                id, price, inventory_quantity, size,
                product:products!product_variants_product_id_fkey(
                  id, name, slug, is_vidyas_pick,
                  product_images!product_images_product_id_fkey(url, is_primary)
                )
              `)
              .in('id', variantIds);

            const hydrated = cart.items.map((item: any) => {
              const variant: any = variants?.find((v: any) => v.id === item.variant_id);
              const primaryImg = variant?.product?.product_images?.find((img: any) => img.is_primary)?.url ||
                variant?.product?.product_images?.[0]?.url ||
                '/images/collection-kurtis.jpg';

              return {
                id: item.id || generateCartItemId(),
                product_id: variant?.product?.id || item.product_id,
                variant_id: item.variant_id,
                quantity: item.quantity,
                product_name: variant?.product?.name || item.product_name || 'Product',
                size: item.size || variant?.size || 'Free Size',
                color: 'Default',
                color_hex: '#C9A84C',
                price: variant?.price || item.price || 0,
                image: primaryImg,
                is_vidyas_pick: variant?.product?.is_vidyas_pick || false,
                inventory_quantity: variant?.inventory_quantity || 10,
                max_quantity: variant?.inventory_quantity || 10,
              };
            }).filter((i: CartItem) => i.price > 0);

            if (hydrated.length > 0) {
              return hydrated;
            }
          }
          return null;
        };

        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
        const remoteItems = await Promise.race([fetchRemoteCart(), timeoutPromise]);

        if (remoteItems && remoteItems.length > 0) {
          items = remoteItems;
          if (typeof window !== 'undefined') {
            localStorage.setItem('guest_cart', JSON.stringify(remoteItems));
          }
        } else if (localItems.length > 0) {
          // Sync guest cart items to the user's Supabase cart in background
          supabase.from('carts').upsert({
            user_id: user.id,
            items: localItems.map(item => ({
              id: item.id,
              variant_id: item.variant_id,
              quantity: item.quantity,
              size: item.size,
            })),
          }).then(() => { }, () => { });
        }
      }

      const totals = calculateTotals(items, state.appliedCoupon);
      setState(prev => ({
        ...prev,
        items,
        ...totals,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Cart load failed:', error);
      setState(prev => ({
        ...prev,
        items: localItems,
        isLoading: false,
      }));
    }
  };

  const persistCart = async (newItems: CartItem[]) => {
    const totals = calculateTotals(newItems, state.appliedCoupon);
    setState(prev => ({ ...prev, items: newItems, ...totals }));

    // Save to localStorage immediately for instant UI update
    if (typeof window !== 'undefined') {
      localStorage.setItem('guest_cart', JSON.stringify(newItems));
      localStorage.setItem('cart_count', String(totals.itemCount));
      localStorage.setItem('cart_updated', Date.now().toString());

      // Notify other components immediately
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items: newItems, totals } }));
      window.dispatchEvent(new CustomEvent('cart:peek', { detail: { count: totals.itemCount } }));
      window.dispatchEvent(new CustomEvent('cart:open', { detail: { count: totals.itemCount } }));
    }

    // Sync to Supabase in background without blocking UI
    if (user) {
      (async () => {
        try {
          const { data: existingCarts } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(1);

          const existingId = existingCarts?.[0]?.id;

          const cartPayload = {
            user_id: user.id,
            items: newItems.map(item => ({
              id: item.id,
              variant_id: item.variant_id,
              quantity: item.quantity,
              size: item.size,
            })),
            updated_at: new Date().toISOString(),
          };

          if (existingId) {
            await supabase.from('carts').update(cartPayload).eq('id', existingId);
          } else {
            await supabase.from('carts').insert(cartPayload);
          }
        } catch (error) {
          console.warn('Background cart sync notice:', error);
        }
      })();
    }
  };

  const addItem = async (variantId: string, quantity: number = 1, size?: string, productData?: Partial<CartItem>) => {
    // Sanitize price
    const rawPrice = productData?.price;
    let cleanPrice = 0;
    if (typeof rawPrice === 'number' && !isNaN(rawPrice) && rawPrice > 0) {
      cleanPrice = rawPrice;
    } else if (rawPrice !== undefined && rawPrice !== null) {
      const parsed = parseFloat(String(rawPrice).replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed) && parsed > 0) {
        cleanPrice = parsed;
      }
    }
    if (!cleanPrice || cleanPrice <= 0) {
      cleanPrice = 2999;
    }

    // 1. Check if item is already in cart
    const existingIndex = state.items.findIndex(
      i => i.variant_id === variantId || (productData?.product_name && i.product_name.toLowerCase() === productData.product_name.toLowerCase())
    );

    let newItems: CartItem[];

    if (existingIndex >= 0) {
      newItems = state.items.map((item, index) =>
        index === existingIndex
          ? { ...item, quantity: Math.min(item.quantity + quantity, item.max_quantity || 10) }
          : item
      );
      await persistCart(newItems);
      toast.success('Added to bag!', { icon: '🛍️' });
      return true;
    }

    // 2. If productData has name, add immediately (zero network latency)
    if (productData?.product_name && cleanPrice > 0) {
      const newItem: CartItem = {
        id: generateCartItemId(),
        product_id: productData.product_id || variantId,
        variant_id: variantId,
        quantity,
        product_name: productData.product_name,
        size: size || productData.size || 'Free Size',
        color: productData.color || 'Default',
        color_hex: productData.color_hex || '#C9A84C',
        price: cleanPrice,
        image: productData.image || '/images/collection-kurtis.jpg',
        is_vidyas_pick: Boolean(productData.is_vidyas_pick),
        inventory_quantity: 10,
        max_quantity: 10,
      };

      newItems = [...state.items, newItem];
      await persistCart(newItems);
      toast.success('Added to bag!', { icon: '🛍️' });
      return true;
    }

    // 3. Fast lookup from static catalog (zero latency)
    const catalogueMatch = (typeof STORE_CATALOGUE !== 'undefined' ? STORE_CATALOGUE : []).find(
      p => p.id === variantId || (productData?.product_name && p.title.toLowerCase() === productData.product_name.toLowerCase())
    ) || (typeof VIDHYAS_PICKS_LIST !== 'undefined' ? VIDHYAS_PICKS_LIST : []).find(
      p => p.id === variantId || (productData?.product_name && p.title.toLowerCase() === productData.product_name.toLowerCase())
    );

    if (catalogueMatch) {
      const newItem: CartItem = {
        id: generateCartItemId(),
        product_id: catalogueMatch.id,
        variant_id: variantId,
        quantity,
        product_name: catalogueMatch.title,
        size: size || 'Free Size',
        color: catalogueMatch.color || 'Default',
        color_hex: '#C9A84C',
        price: catalogueMatch.price || cleanPrice,
        image: catalogueMatch.image || '/images/collection-kurtis.jpg',
        is_vidyas_pick: Boolean(catalogueMatch.isVidhyasPick),
        inventory_quantity: 10,
        max_quantity: 10,
      };

      newItems = [...state.items, newItem];
      await persistCart(newItems);
      toast.success('Added to bag!', { icon: '🛍️' });
      return true;
    }

    // 4. Remote lookup for valid UUIDs only (guarded with fast timeout)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(variantId);
    let variant: any = null;

    if (isUuid) {
      try {
        const fetchVariantPromise = async () => {
          const { data: vById } = await supabase
            .from('product_variants')
            .select(`
              id, price, inventory_quantity, size,
              product:products!product_variants_product_id_fkey(
                id, name, slug, is_vidyas_pick,
                product_images!product_images_product_id_fkey(url, is_primary)
              )
            `)
            .eq('id', variantId)
            .maybeSingle();

          if (vById) return vById;

          const { data: vByProd } = await supabase
            .from('product_variants')
            .select(`
              id, price, inventory_quantity, size,
              product:products!product_variants_product_id_fkey(
                id, name, slug, is_vidyas_pick,
                product_images!product_images_product_id_fkey(url, is_primary)
              )
            `)
            .eq('product_id', variantId)
            .limit(1)
            .maybeSingle();

          return vByProd || null;
        };

        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000));
        variant = await Promise.race([fetchVariantPromise(), timeoutPromise]);
      } catch (err) {
        console.warn('Supabase variant lookup error:', err);
      }
    }

    if (variant) {
      const primaryImg = variant.product?.product_images?.find((img: any) => img.is_primary)?.url ||
        variant.product?.product_images?.[0]?.url ||
        '/images/collection-kurtis.jpg';

      const newItem: CartItem = {
        id: generateCartItemId(),
        product_id: variant.product?.id || variant.product_id,
        variant_id: variant.id,
        quantity,
        product_name: variant.product?.name || productData?.product_name || 'Handcrafted Luxury Couture',
        size: size || variant.size || productData?.size || 'Free Size',
        color: productData?.color || 'Default',
        color_hex: productData?.color_hex || '#C9A84C',
        price: variant.price || cleanPrice,
        image: primaryImg,
        is_vidyas_pick: variant.product?.is_vidyas_pick || productData?.is_vidyas_pick || false,
        inventory_quantity: variant.inventory_quantity || 10,
        max_quantity: variant.inventory_quantity || 10,
      };

      newItems = [...state.items, newItem];
    } else {
      const fallbackItem: CartItem = {
        id: generateCartItemId(),
        product_id: variantId,
        variant_id: variantId,
        quantity,
        product_name: productData?.product_name || 'Handcrafted Luxury Couture',
        size: size || productData?.size || 'Free Size',
        color: productData?.color || 'Default',
        color_hex: productData?.color_hex || '#C9A84C',
        price: cleanPrice,
        image: productData?.image || '/images/collection-kurtis.jpg',
        is_vidyas_pick: Boolean(productData?.is_vidyas_pick),
        inventory_quantity: 10,
        max_quantity: 10,
      };

      newItems = [...state.items, fallbackItem];
    }

    await persistCart(newItems);
    toast.success('Added to bag!', { icon: '🛍️' });
    return true;
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return removeItem(itemId);

    const item = state.items.find(i => i.id === itemId || i.variant_id === itemId);
    if (!item) return;

    const newQuantity = Math.min(quantity, item.max_quantity || 10);
    const newItems = state.items.map(i => (i.id === item.id || i.variant_id === item.variant_id) ? { ...i, quantity: newQuantity } : i);
    await persistCart(newItems);
  };

  const removeItem = async (itemId: string) => {
    const newItems = state.items.filter(i => i.id !== itemId && i.variant_id !== itemId);
    await persistCart(newItems);
    toast.success('Removed from bag');
  };

  const clearCart = async () => {
    await persistCart([]);
    if (user) {
      await supabase.from('carts').delete().eq('user_id', user.id);
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('guest_cart');
        localStorage.removeItem('cart_count');
        localStorage.removeItem('cart_updated');
      } catch { }
    }
  };

  const syncCart = async () => {
    await loadCart();
  };

  const PRIVILEGE_OFFERS: Record<string, {
    code: string;
    type: 'percentage' | 'fixed' | 'free_shipping';
    value: number;
    min_order_amount: number;
    max_discount_amount?: number;
  }> = {
    FIRST10: {
      code: 'FIRST10',
      type: 'percentage',
      value: 10,
      min_order_amount: 1999,
      max_discount_amount: 1500,
    },
    ROYAL500: {
      code: 'ROYAL500',
      type: 'fixed',
      value: 500,
      min_order_amount: 4999,
    },
    COUTURE15: {
      code: 'COUTURE15',
      type: 'percentage',
      value: 15,
      min_order_amount: 5999,
      max_discount_amount: 2000,
    },
  };

  const applyCoupon = async (code: string): Promise<{ valid: boolean; error?: string }> => {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) {
      return { valid: false, error: 'Please enter a coupon code' };
    }

    const currentSubtotal = state.items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    ) || state.subtotal;

    // 1. Check Supabase database first so admin creations, edits, and status toggles take immediate effect
    try {
      const fetchCoupon = async () => {
        const { data: coupon, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('code', cleanCode)
          .maybeSingle();

        if (error || !coupon) return null;
        return coupon;
      };

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));
      const coupon: any = await Promise.race([fetchCoupon(), timeoutPromise]);

      if (coupon) {
        if (!coupon.is_active) {
          return { valid: false, error: `Coupon ${coupon.code} is currently inactive` };
        }

        if (coupon.valid_from && new Date(coupon.valid_from) > new Date()) {
          return { valid: false, error: `Coupon ${coupon.code} is not active yet` };
        }

        if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
          return { valid: false, error: `Coupon ${coupon.code} has expired` };
        }

        if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
          return { valid: false, error: `Coupon ${coupon.code} usage limit reached` };
        }

        const minOrderAmount = coupon.min_order_amount
          ? (coupon.min_order_amount > 50000 ? Math.round(coupon.min_order_amount / 100) : coupon.min_order_amount)
          : 0;
        if (minOrderAmount && currentSubtotal < minOrderAmount) {
          return { valid: false, error: `Minimum order of ₹${minOrderAmount.toLocaleString('en-IN')} required for ${coupon.code}` };
        }

        let discountAmount = 0;
        if (coupon.type === 'percentage') {
          discountAmount = Math.round((currentSubtotal * Number(coupon.value)) / 100);
          if (coupon.max_discount_amount) {
            discountAmount = Math.min(discountAmount, Number(coupon.max_discount_amount));
          }
        } else if (coupon.type === 'fixed') {
          discountAmount = Math.min(Number(coupon.value), currentSubtotal);
        } else if (coupon.type === 'free_shipping') {
          discountAmount = state.shippingCost;
        }

        const appliedCoupon: AppliedCoupon = {
          code: coupon.code,
          type: coupon.type,
          value: Number(coupon.value),
          discountAmount,
        };

        const totals = calculateTotals(state.items, appliedCoupon);
        setState(prev => ({ ...prev, appliedCoupon, ...totals }));
        try {
          toast.success(`Coupon ${coupon.code} applied!`);
        } catch { }
        return { valid: true };
      }
    } catch (e) {
      console.warn('Supabase coupon check failed, checking fallback offers', e);
    }

    // 2. Fallback to default privilege vouchers if not in DB or Supabase query timed out
    const offer = PRIVILEGE_OFFERS[cleanCode];
    if (offer) {
      if (offer.min_order_amount && currentSubtotal < offer.min_order_amount) {
        return {
          valid: false,
          error: `Minimum order of ₹${offer.min_order_amount.toLocaleString('en-IN')} required for ${offer.code}`,
        };
      }

      let discountAmount = 0;
      if (offer.type === 'percentage') {
        discountAmount = Math.round((currentSubtotal * offer.value) / 100);
        if (offer.max_discount_amount) {
          discountAmount = Math.min(discountAmount, offer.max_discount_amount);
        }
      } else if (offer.type === 'fixed') {
        discountAmount = offer.value;
      } else if (offer.type === 'free_shipping') {
        discountAmount = state.shippingCost;
      }

      const appliedCoupon: AppliedCoupon = {
        code: offer.code,
        type: offer.type,
        value: offer.value,
        discountAmount,
      };

      const totals = calculateTotals(state.items, appliedCoupon);
      setState(prev => ({ ...prev, appliedCoupon, ...totals }));
      try {
        toast.success(`Privilege voucher ${offer.code} applied!`);
      } catch { }
      return { valid: true };
    }

    return { valid: false, error: 'Invalid or expired coupon code' };
  };

  const removeCoupon = async () => {
    const totals = calculateTotals(state.items, null);
    setState(prev => ({ ...prev, appliedCoupon: null, ...totals }));
    toast.success('Coupon removed');
  };

  const validateCart = async () => {
    const errors: string[] = [];

    for (const item of state.items) {
      if (item.inventory_quantity < item.quantity) {
        errors.push(`${item.product_name} (${item.size}, ${item.color}) only has ${item.inventory_quantity} in stock`);
      }
      if (!item.price || item.price <= 0) {
        errors.push(`${item.product_name} has invalid pricing`);
      }
    }

    if (state.appliedCoupon) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', state.appliedCoupon.code)
        .single();

      if (!coupon || !coupon.is_active) {
        errors.push('Applied coupon is no longer valid');
      }
    }

    return { valid: errors.length === 0, errors };
  };

  return (
    <CartContext.Provider value={{ ...state, loading: state.isLoading, addItem, updateQuantity, removeItem, clearCart, syncCart, applyCoupon, removeCoupon, validateCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    return {
      items: [],
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
      addItem: async () => false,
      updateQuantity: async () => {},
      removeItem: async () => {},
      clearCart: async () => {},
      syncCart: async () => {},
      applyCoupon: async () => ({ valid: false, error: 'Cart not ready' }),
      removeCoupon: async () => {},
      validateCart: async () => ({ valid: true, errors: [] }),
    };
  }
  return context;
}