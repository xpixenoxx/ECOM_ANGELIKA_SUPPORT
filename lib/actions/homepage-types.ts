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
  description: string | null;
  cover_image: string | null;
  products: Array<{
    id: string;
    slug: string;
    name: string;
    price: number;
    image: string;
    x_position: number;
    y_position: number;
  }>;
}

