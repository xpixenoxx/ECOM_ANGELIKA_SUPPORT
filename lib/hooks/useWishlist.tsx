'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import { WishlistItem } from '@/types/commerce';
import toast from 'react-hot-toast';

interface WishlistContextType {
  items: WishlistItem[];
  count: number;
  isLoading: boolean;
  addItem: (productId: string, variantId?: string) => Promise<void>;
  removeItem: (productId: string, variantId?: string) => Promise<void>;
  toggleItem: (productId: string, variantId?: string) => Promise<void>;
  isInWishlist: (productId: string, variantId?: string) => boolean;
  clearWishlist: () => Promise<void>;
  syncWishlist: () => Promise<void>;
  updateNotifications: (productId: string, variantId: string | undefined, notifyRestock: boolean, notifySale: boolean) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadWishlist();
  }, [user]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'wishlist_updated') {
        loadWishlist();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const loadWishlist = async () => {
    if (!user) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('wishlists')
        .select(`
          *,
          product:products(
            id, name, slug, images, is_vidyas_pick,
            variants:product_variants(id, size, price, inventory_quantity, color:colors(id, name, hex))
          ),
          variant:product_variants(id, size, price, inventory_quantity, color:colors(id, name, hex))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setItems((data || []) as unknown as WishlistItem[]);
    } catch (error) {
      console.error('Wishlist load failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const persistWishlist = async (newItems: WishlistItem[]) => {
    setItems(newItems);
    localStorage.setItem('wishlist_count', String(newItems.length));
    localStorage.setItem('wishlist_updated', Date.now().toString());
    window.dispatchEvent(new CustomEvent('wishlist:updated', { detail: { items: newItems } }));
  };

  const addItem = async (productId: string, variantId?: string) => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }

    const existing = items.find(i => i.product_id === productId && i.variant_id === variantId);
    if (existing) {
      toast('Already in wishlist', { icon: '❤️' });
      return;
    }

    try {
      const { error } = await supabase.from('wishlists').insert({
        user_id: user.id,
        product_id: productId,
        variant_id: variantId,
        notify_on_restock: false,
        notify_on_sale: false,
      });

      if (error) throw error;

      await loadWishlist();
      toast.success('Added to wishlist!', { icon: '❤️' });
    } catch (error) {
      toast.error('Failed to add to wishlist');
    }
  };

  const removeItem = async (productId: string, variantId?: string) => {
    if (!user) return;

    const item = items.find(i => i.product_id === productId && i.variant_id === variantId);
    if (!item) return;

    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      const newItems = items.filter(i => i.id !== item.id);
      await persistWishlist(newItems);
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const toggleItem = async (productId: string, variantId?: string) => {
    const inWishlist = items.some(i => i.product_id === productId && i.variant_id === variantId);
    if (inWishlist) {
      await removeItem(productId, variantId);
    } else {
      await addItem(productId, variantId);
    }
  };

  const isInWishlist = (productId: string, variantId?: string) => {
    return items.some(i => i.product_id === productId && i.variant_id === variantId);
  };

  const clearWishlist = async () => {
    if (!user) return;

    try {
      await supabase.from('wishlists').delete().eq('user_id', user.id);
      await persistWishlist([]);
      toast.success('Wishlist cleared');
    } catch (error) {
      toast.error('Failed to clear wishlist');
    }
  };

  const syncWishlist = async () => {
    await loadWishlist();
  };

  const updateNotifications = async (productId: string, variantId: string | undefined, notifyRestock: boolean, notifySale: boolean) => {
    if (!user) return;

    const item = items.find(i => i.product_id === productId && i.variant_id === variantId);
    if (!item) return;

    try {
      const { error } = await supabase
        .from('wishlists')
        .update({ notify_on_restock: notifyRestock, notify_on_sale: notifySale })
        .eq('id', item.id);

      if (error) throw error;

      await loadWishlist();
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        count: items.length,
        isLoading,
        addItem,
        removeItem,
        toggleItem,
        isInWishlist,
        clearWishlist,
        syncWishlist,
        updateNotifications,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}