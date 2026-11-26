export interface HomepageProductCard {
  id: string;
  slug: string;
  name: string;
  variant_id: string | null;
  price: number;
  compare_at_price: number | null;
  images: Array<{ url: string; alt_text: string | null }>;
  category: { id: string; name: string; slug: string } | null;
  discount: number;
  is_vidyas_pick: boolean;
  is_new: boolean;
}

export interface LookData {
  id: string;
  title: string;
  name?: string;
  description: string | null;
  cover_image: string | null;
  lifestyle_image_url?: string | null;
  lifestyle_image_alt?: string | null;
  products: Array<{
    id: string;
    slug: string;
    name: string;
    price: number;
    compare_at_price?: number | null;
    image: string;
    x_position: number;
    y_position: number;
  }>;
  look_hotspots?: Array<{
    id: string;
    x_percent: number;
    y_percent: number;
    display_order: number;
    products: {
      id: string;
      slug: string;
      name: string;
      price: number;
      compare_at_price?: number | null;
      images: string[];
      thumbnail_url?: string | null;
      default_variant_id?: string;
      variants?: Array<{ id: string; size?: string; price: number }>;
    } | null;
  }>;
}

