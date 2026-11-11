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
  { value: 'featured', label: 'Featured First' },
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

/**
 * Authoritative color matcher for products across server actions and storefront client components.
 */
export function matchesProductColor(p: any, colorValue: string): boolean {
  if (!p || !colorValue) return false;
  const c = colorValue.toLowerCase().trim();

  // 1. Direct tag matches (e.g. "color:red", "red")
  const tags: string[] = Array.isArray(p.tags) ? p.tags : [];
  const lowerTags = tags.map((t: string) => String(t).toLowerCase().trim());
  if (lowerTags.includes(`color:${c}`) || lowerTags.includes(c)) return true;

  // 2. Structured colors in fabric JSON (e.g. fabric.colors: ['red', 'gold'])
  const fab = p.fabric;
  if (fab && typeof fab === 'object') {
    if (Array.isArray(fab.colors)) {
      if (fab.colors.some((x: any) => String(x).toLowerCase().trim() === c)) {
        return true;
      }
    }
  }

  // 3. Variant colors
  const variants = p.variants || p.product_variants || [];
  if (Array.isArray(variants)) {
    if (variants.some((v: any) => String(v.color || '').toLowerCase().trim() === c)) {
      return true;
    }
  }

  // 4. Semantic / synonym text matches
  const text = `${p.name || ''} ${p.slug || ''} ${lowerTags.join(' ')} ${JSON.stringify(fab || '')}`.toLowerCase();

  switch (c) {
    case 'red':
      return text.includes('red') || text.includes('crimson') || text.includes('ruby') || text.includes('maroon') || text.includes('scarlet');
    case 'blue':
      return text.includes('blue') || text.includes('indigo') || text.includes('navy') || text.includes('sapphire') || text.includes('teal') || text.includes('sky');
    case 'green':
      return text.includes('green') || text.includes('emerald') || text.includes('olive') || text.includes('mint') || text.includes('pista') || text.includes('sage');
    case 'yellow':
      return text.includes('yellow') || text.includes('mustard') || text.includes('haldi') || text.includes('lemon');
    case 'pink':
      return text.includes('pink') || text.includes('blush') || text.includes('rose') || text.includes('peach') || text.includes('coral') || text.includes('rani');
    case 'purple':
      return text.includes('purple') || text.includes('lavender') || text.includes('violet') || text.includes('plum') || text.includes('mauve') || text.includes('magenta');
    case 'black':
      return text.includes('black') || text.includes('noir') || text.includes('charcoal') || text.includes('jet');
    case 'white':
      return text.includes('white') || text.includes('ivory') || text.includes('cream') || text.includes('pearl') || text.includes('off-white') || text.includes('milk');
    case 'gold':
      return text.includes('gold') || text.includes('golden') || text.includes('zari') || text.includes('gota') || text.includes('metallic') || text.includes('champagne');
    case 'multi':
      return text.includes('multi') || text.includes('multicolor') || text.includes('multicolour') || text.includes('multi-color') || text.includes('multi-colour') || text.includes('rainbow') || text.includes('printed') || text.includes('floral');
    default:
      return text.includes(c);
  }
}
