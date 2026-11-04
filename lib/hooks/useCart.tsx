'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CartItem, CartState, AppliedCoupon } from '@/types/commerce';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

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
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      let items: CartItem[] = [];

      if (user) {
        // Load from Supabase
        const { data: cart } = await supabase
          .from('carts')
          .select('items')
          .eq('user_id', user.id)
          .single();

        if (cart?.items) {
          // Hydrate with product details
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

          items = cart.items.map((item: any) => {
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
        }
      } else {
        // Load from localStorage
        const guestCart = localStorage.getItem('guest_cart');
        if (guestCart) {
          try {
            items = JSON.parse(guestCart);
          } catch {
            items = [];
          }
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
        isLoading: false,
        error: 'Failed to load cart',
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

  const addItem = async (variantId: string, quantity: number, size?: string) => {
    // Optimistic update
    const existingIndex = state.items.findIndex(i => i.variant_id === variantId);
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

      if (!variant) {
        // Fallback: fetch product directly if it was a product id without variants
        const { data: prod } = await supabase
          .from('products')
          .select(`
            id, name, slug, is_vidyas_pick,
            product_images!product_images_product_id_fkey(url, is_primary)
          `)
          .eq('id', variantId)
          .maybeSingle();

        if (prod) {
          const primaryImg = (prod as any)?.product_images?.find((img: any) => img.is_primary)?.url ||
            (prod as any)?.product_images?.[0]?.url ||
            '/images/collection-kurtis.jpg';

          const fallbackItem: CartItem = {
            id: crypto.randomUUID(),
            product_id: prod.id,
            variant_id: prod.id,
            quantity,
            product_name: prod.name,
            size: size || 'Free Size',
            color: 'Default',
            color_hex: '#C9A84C',
            price: 2999,
            image: primaryImg,
            is_vidyas_pick: prod.is_vidyas_pick || false,
            inventory_quantity: 10,
            max_quantity: 10,
          };
          newItems = [...state.items, fallbackItem];
          await persistCart(newItems);
          toast.success('Added to bag!', { icon: '🛍️' });
          return;
        }

        toast.error('Product could not be added');
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
        product_name: variant.product?.name || 'Product',
        size: size || variant.size || 'Free Size',
        color: 'Default',
        color_hex: '#C9A84C',
        price: variant.price || 0,
        image: primaryImg,
        is_vidyas_pick: variant.product?.is_vidyas_pick || false,
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

  const applyCoupon = async (code: string) => {
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .lte('valid_from', new Date().toISOString())
      .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`)
      .single();

    if (error || !coupon) {
      return { valid: false, error: 'Invalid or expired coupon code' };
    }

    // Check usage limits
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return { valid: false, error: 'Coupon usage limit reached' };
    }

    const minOrderAmount = coupon.min_order_amount
      ? (coupon.min_order_amount > 50000 ? Math.round(coupon.min_order_amount / 100) : coupon.min_order_amount)
      : 0;
    if (minOrderAmount && state.subtotal < minOrderAmount) {
      return { valid: false, error: `Minimum order ₹${minOrderAmount.toLocaleString('en-IN')}` };
    }

    // Check user limit
    if (user) {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('coupon_code', coupon.code);
      if (count && count >= coupon.user_limit) {
        return { valid: false, error: 'You have already used this coupon' };
      }
    }

    // Check first order only
    if (coupon.first_order_only && user) {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (count && count > 0) {
        return { valid: false, error: 'Coupon valid for first order only' };
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = Math.round(state.subtotal * coupon.value / 100);
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
    toast.success('Coupon applied!');
    return { valid: true };
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