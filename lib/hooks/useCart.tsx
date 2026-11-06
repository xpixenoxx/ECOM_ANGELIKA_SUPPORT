'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CartItem, CartState, AppliedCoupon } from '@/types/commerce';
import { useAuth } from './useAuth';
import { STORE_CATALOGUE, VIDHYAS_PICKS_LIST } from '@/lib/data/store-catalogue';
import toast from 'react-hot-toast';

interface CartContextType extends CartState {
  addItem: (variantId: string, quantity: number, size?: string, productData?: Partial<CartItem>) => Promise<void>;
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

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
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

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
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

    try {
      let items: CartItem[] = localItems;

      if (user) {
        // Query Supabase with a fast 1.5s timeout to prevent freezing the checkout screen
        const fetchRemoteCart = async (): Promise<CartItem[] | null> => {
          const { data: cart } = await supabase
            .from('carts')
            .select('items')
            .eq('user_id', user.id)
            .maybeSingle();

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
                id: item.id || crypto.randomUUID(),
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
          }).then(() => {}, () => {});
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

    // Save to localStorage immediately for guest
    localStorage.setItem('guest_cart', JSON.stringify(newItems));
    localStorage.setItem('cart_count', String(totals.itemCount));
    localStorage.setItem('cart_updated', Date.now().toString());

    // Sync to Supabase if user logged in
    if (user) {
      try {
        await supabase.from('carts').upsert({
          user_id: user.id,
          items: newItems.map(item => ({
            id: item.id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            size: item.size,
          })),
        });
      } catch (error) {
        console.error('Cart sync failed:', error);
      }
    }

    // Notify other components
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items: newItems, totals } }));
  };

  const addItem = async (variantId: string, quantity: number = 1, size?: string, productData?: Partial<CartItem>) => {
    // Optimistic update
    const existingIndex = state.items.findIndex(
      i => i.variant_id === variantId || (productData?.product_name && i.product_name === productData.product_name)
    );
    let newItems: CartItem[];

    if (existingIndex >= 0) {
      newItems = state.items.map((item, index) =>
        index === existingIndex
          ? { ...item, quantity: Math.min(item.quantity + quantity, item.max_quantity) }
          : item
      );
    } else {
      // Fetch variant details
      let variant: any = null;
      try {
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

        if (vById) {
          variant = vById;
        } else {
          // Try finding by product_id
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

          if (vByProd) {
            variant = vByProd;
          }
        }
      } catch (err) {
        console.warn('Supabase variant lookup error:', err);
      }

      if (!variant) {
        // Fallback: fetch product directly or check catalogue / productData
        let prod: any = null;
        try {
          const { data } = await supabase
            .from('products')
            .select(`
              id, name, slug, is_vidyas_pick,
              product_images!product_images_product_id_fkey(url, is_primary)
            `)
            .eq('id', variantId)
            .maybeSingle();
          prod = data;
        } catch (err) {
          console.warn('Supabase product lookup error:', err);
        }

        const catalogueMatch = (typeof STORE_CATALOGUE !== 'undefined' ? STORE_CATALOGUE : []).find(
          p => p.id === variantId || (productData?.product_name && p.title.toLowerCase() === productData.product_name.toLowerCase())
        ) || (typeof VIDHYAS_PICKS_LIST !== 'undefined' ? VIDHYAS_PICKS_LIST : []).find(
          p => p.id === variantId || (productData?.product_name && p.title.toLowerCase() === productData.product_name.toLowerCase())
        );

        const primaryImg = productData?.image ||
          catalogueMatch?.image ||
          prod?.product_images?.find((img: any) => img.is_primary)?.url ||
          prod?.product_images?.[0]?.url ||
          '/images/collection-kurtis.jpg';

        const fallbackItem: CartItem = {
          id: crypto.randomUUID(),
          product_id: prod?.id || catalogueMatch?.id || variantId || crypto.randomUUID(),
          variant_id: variantId || catalogueMatch?.id || crypto.randomUUID(),
          quantity,
          product_name: productData?.product_name || catalogueMatch?.title || prod?.name || 'Handcrafted Luxury Couture',
          size: size || productData?.size || 'Free Size',
          color: productData?.color || catalogueMatch?.color || 'Default',
          color_hex: productData?.color_hex || '#C9A84C',
          price: productData?.price || catalogueMatch?.price || prod?.price || 2999,
          image: primaryImg,
          is_vidyas_pick: productData?.is_vidyas_pick ?? catalogueMatch?.isVidhyasPick ?? prod?.is_vidyas_pick ?? false,
          inventory_quantity: 10,
          max_quantity: 10,
        };

        newItems = [...state.items, fallbackItem];
        await persistCart(newItems);
        toast.success('Added to bag!', { icon: '🛍️' });
        window.dispatchEvent(new CustomEvent('cart:peek', { detail: { variantId } }));
        return;
      }

      const primaryImg = variant.product?.product_images?.find((img: any) => img.is_primary)?.url ||
        variant.product?.product_images?.[0]?.url ||
        '/images/collection-kurtis.jpg';

      const newItem: CartItem = {
        id: crypto.randomUUID(),
        product_id: variant.product?.id || variant.product_id,
        variant_id: variant.id,
        quantity,
        product_name: variant.product?.name || productData?.product_name || 'Product',
        size: size || variant.size || productData?.size || 'Free Size',
        color: productData?.color || 'Default',
        color_hex: productData?.color_hex || '#C9A84C',
        price: variant.price || productData?.price || 0,
        image: primaryImg,
        is_vidyas_pick: variant.product?.is_vidyas_pick || productData?.is_vidyas_pick || false,
        inventory_quantity: variant.inventory_quantity || 10,
        max_quantity: variant.inventory_quantity || 10,
      };

      newItems = [...state.items, newItem];
    }

    await persistCart(newItems);
    toast.success('Added to bag!', { icon: '🛍️' });

    // Trigger mini cart peek
    window.dispatchEvent(new CustomEvent('cart:peek', { detail: { variantId } }));
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return removeItem(itemId);

    const item = state.items.find(i => i.id === itemId);
    if (!item) return;

    const newQuantity = Math.min(quantity, item.max_quantity);
    const newItems = state.items.map(i => i.id === itemId ? { ...i, quantity: newQuantity } : i);
    await persistCart(newItems);
  };

  const removeItem = async (itemId: string) => {
    const newItems = state.items.filter(i => i.id !== itemId);
    await persistCart(newItems);
    toast.success('Removed from bag');
  };

  const clearCart = async () => {
    await persistCart([]);
    if (user) {
      await supabase.from('carts').delete().eq('user_id', user.id);
    }
    localStorage.removeItem('guest_cart');
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

    // 1. Instant check for official privilege vouchers (FIRST10, ROYAL500, COUTURE15)
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
      } catch {}
      return { valid: true };
    }

    // 2. Fallback to Supabase for custom created coupons with fast timeout
    try {
      const fetchCoupon = async () => {
        const { data: coupon, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('code', cleanCode)
          .eq('is_active', true)
          .maybeSingle();

        if (error || !coupon) return null;
        return coupon;
      };

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
      const coupon: any = await Promise.race([fetchCoupon(), timeoutPromise]);

      if (!coupon) {
        return { valid: false, error: 'Invalid or expired coupon code' };
      }

      // Check usage limits
      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        return { valid: false, error: 'Coupon usage limit reached' };
      }

      const minOrderAmount = coupon.min_order_amount
        ? (coupon.min_order_amount > 50000 ? Math.round(coupon.min_order_amount / 100) : coupon.min_order_amount)
        : 0;
      if (minOrderAmount && currentSubtotal < minOrderAmount) {
        return { valid: false, error: `Minimum order ₹${minOrderAmount.toLocaleString('en-IN')}` };
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.type === 'percentage') {
        discountAmount = Math.round((currentSubtotal * coupon.value) / 100);
        if (coupon.max_discount_amount) {
          discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
        }
      } else if (coupon.type === 'fixed') {
        discountAmount = coupon.value;
      } else if (coupon.type === 'free_shipping') {
        discountAmount = state.shippingCost;
      }

      const appliedCoupon: AppliedCoupon = {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount,
      };

      const totals = calculateTotals(state.items, appliedCoupon);
      setState(prev => ({ ...prev, appliedCoupon, ...totals }));
      try {
        toast.success(`Coupon ${coupon.code} applied!`);
      } catch {}
      return { valid: true };
    } catch {
      return { valid: false, error: 'Failed to apply coupon. Please try again.' };
    }
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
    <CartContext.Provider value={{ ...state, addItem, updateQuantity, removeItem, clearCart, syncCart, applyCoupon, removeCoupon, validateCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}