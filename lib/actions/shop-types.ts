import type { Database } from '@/types/database';

type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductImageRow = Database['public']['Tables']['product_images']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];

export interface ShopProductCard {
  id: string;
  slug: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  images: ProductImageRow[];
  image?: string;
  defaultVariantId?: string;
  variants?: any[];
  category: CategoryRow | null;
  discount: number;
  is_featured: boolean;
  is_vidyas_pick: boolean;
  created_at: string;
  rating: number;
  review_count: number;
  fabric?: any;
  tags?: string[];
  occasion?: string[];
}

export interface ShopFilters {
  categories?: string[];
  fabrics?: string[];
  colors?: string[];
  sizes?: string[];
  priceRange?: [number, number];
  inStockOnly?: boolean;
  vidhyasPicksOnly?: boolean;
  occasion?: string[];
  type?: string[];
  length?: string[];
  search?: string;
}

export interface ShopSortOption {
  value: string;
  label: string;
}

export const SHOP_SORT_OPTIONS: ShopSortOption[] = [
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'popularity', label: 'Most Popular' },
  { value: 'discount', label: 'Best Discount' },
];

export const SHOP_CATEGORIES = [
  { value: 'kurtis', label: 'Kurtis' },
  { value: 'salwars', label: 'Salwars' },
  { value: 'lehengas', label: 'Lehengas' },
  { value: 'sarees', label: 'Sarees' },
  { value: 'dupattas', label: 'Dupattas' },
];

export const SHOP_FABRICS = [
  { value: 'silk', label: 'Silk' },
  { value: 'cotton', label: 'Cotton' },
  { value: 'georgette', label: 'Georgette' },
  { value: 'organza', label: 'Organza' },
  { value: 'chiffon', label: 'Chiffon' },
  { value: 'velvet', label: 'Velvet' },
  { value: 'chanderi', label: 'Chanderi' },
  { value: 'linen', label: 'Linen' },
];

export const SHOP_COLORS = [
  { value: 'red', label: 'Red', color: '#C02B2B' },
  { value: 'blue', label: 'Blue', color: '#1A73E8' },
  { value: 'green', label: 'Green', color: '#1B7A3D' },
  { value: 'yellow', label: 'Yellow', color: '#B8741A' },
  { value: 'pink', label: 'Pink', color: '#D4A574' },
  { value: 'purple', label: 'Purple', color: '#A890C8' },
  { value: 'black', label: 'Black', color: '#0D0D0D' },
  { value: 'white', label: 'White', color: '#F3EEE8' },
  { value: 'gold', label: 'Gold', color: '#C9A84C' },
  { value: 'multi', label: 'Multicolor', color: 'linear-gradient(45deg, #C02B2B, #1A73E8, #1B7A3D)' },
];

export const SHOP_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'Free Size'];