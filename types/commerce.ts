import type { Database } from './database';

type Tables = Database['public']['Tables'];
type Product = Tables['products']['Row'];
type ProductVariant = Tables['product_variants']['Row'];
type Color = Tables['colors']['Row'];
type Category = Tables['categories']['Row'];
type Profile = Tables['profiles']['Row'];
type Order = Tables['orders']['Row'];
type OrderItem = Tables['order_items']['Row'];
type Review = Tables['reviews']['Row'];
type Coupon = Tables['coupons']['Row'];

// ============================================
// COMMERCE TYPES
// ============================================

export interface ProductWithVariants extends Product {
  variants: (ProductVariant & { color: Color })[];
  images: ProductImage[];
  category: Category | null;
  subcategory: Category | null;
  primary_image: ProductImage | null;
  in_stock: boolean;
  min_price: number;
  max_price: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  variant_id: string | null;
  url: string;
  alt_text: string | null;
  type: 'lifestyle' | 'detail' | 'flat_lay' | 'model' | 'fabric' | 'video';
  sort_order: number;
  is_primary: boolean;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  product_name: string;
  size: string;
  color: string;
  color_hex: string;
  price: number; // in paise
  image: string;
  is_vidyas_pick: boolean;
  inventory_quantity: number;
  max_quantity: number;
}

export interface CartState {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  appliedCoupon: AppliedCoupon | null;
  isLoading: boolean;
  error: string | null;
}

export interface AppliedCoupon {
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping' | 'buy_x_get_y';
  value: number;
  discountAmount: number;
}

export interface CheckoutFormData {
  // Step 1: Contact
  email: string;
  phone: string;
  fullName: string;
  marketingOptIn: boolean;
  whatsappOptIn: boolean;

  // Step 2: Shipping
  shippingAddress: Address;
  billingAddress: Address;
  sameAsBilling: boolean;
  shippingMethod: string;
  shippingCost: number;
  giftWrap: boolean;
  giftMessage: string;

  // Step 3: Payment
  paymentMethod: 'cod' | 'upi' | 'card' | 'wallet' | 'razorpay' | 'stripe';
  paymentDetails?: PaymentDetails;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email?: string;
}

export interface PaymentDetails {
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  stripePaymentIntentId?: string;
  upiId?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimatedDays: string;
  courierPartner: string;
  codAvailable: boolean;
}

export interface OrderSummary {
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  itemCount: number;
}

export interface SizeRecommendation {
  size: string;
  confidence: number;
  ease: {
    bust: number;
    waist: number;
    hip: number;
  };
  reasoning: string;
  alternativeSize?: string;
  fitType: 'tight' | 'regular' | 'relaxed';
}

export interface UserMeasurements {
  bust: number;
  waist: number;
  hip: number;
  shoulder?: number;
  armLength?: number;
  height?: number;
  bodyShape?: 'apple' | 'pear' | 'hourglass' | 'rectangle';
}

export interface SizeChartEntry {
  size: string;
  measurements: {
    bust_min: number;
    bust_max: number;
    waist_min: number;
    waist_max: number;
    hip_min: number;
    hip_max: number;
    length?: number;
    sleeve?: number;
    shoulder?: number;
  };
  fitNotes?: string;
  modelMeasurements?: {
    height: number;
    size: string;
    bust: number;
    hip: number;
  };
}

export interface WishlistItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  product: ProductWithVariants;
  variant: ProductVariant | null;
  color: Color | null;
  notify_on_restock: boolean;
  notify_on_sale: boolean;
  created_at: string;
}

export interface ReviewWithUser extends Review {
  user: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null;
  product: Pick<Product, 'id' | 'name' | 'slug'>;
}

export interface FilterOptions {
  categories: Category[];
  sizes: string[];
  colors: Color[];
  priceRange: { min: number; max: number };
  occasions: string[];
  fabrics: string[];
  inStockOnly: boolean;
  vidyasPicksOnly: boolean;
  onSaleOnly: boolean;
}

export interface SortOption {
  value: string;
  label: string;
  field: string;
  direction: 'asc' | 'desc';
}

export const SORT_OPTIONS: SortOption[] = [
  { value: 'newest', label: 'Newest Arrivals', field: 'created_at', direction: 'desc' },
  { value: 'price-asc', label: 'Price: Low to High', field: 'price', direction: 'asc' },
  { value: 'price-desc', label: 'Price: High to Low', field: 'price', direction: 'desc' },
  { value: 'popularity', label: 'Most Popular', field: 'popularity', direction: 'desc' },
  { value: 'rating', label: 'Highest Rated', field: 'rating', direction: 'desc' },
  { value: 'name-asc', label: 'Name: A to Z', field: 'name', direction: 'asc' },
  { value: 'name-desc', label: 'Name: Z to A', field: 'name', direction: 'desc' },
];

export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SearchResult {
  products: ProductWithVariants[];
  pagination: PaginationParams;
  filters: FilterOptions;
  sort: SortOption;
  query: string;
  suggestions: string[];
}

export interface LoyaltyTier {
  name: 'silver' | 'gold' | 'platinum';
  label: string;
  minPoints: number;
  benefits: string[];
  multiplier: number;
  color: string;
}

export const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    name: 'silver',
    label: 'Silver',
    minPoints: 0,
    benefits: ['5% off on all orders', 'Early access to sales', 'Birthday gift'],
    multiplier: 1,
    color: '#C0C0C0',
  },
  {
    name: 'gold',
    label: 'Gold',
    minPoints: 5000,
    benefits: ['10% off on all orders', 'Free express shipping', 'Priority support', 'Exclusive previews'],
    multiplier: 1.5,
    color: '#FFD700',
  },
  {
    name: 'platinum',
    label: 'Platinum',
    minPoints: 20000,
    benefits: ['15% off on all orders', 'Free international shipping', 'Personal stylist', 'VIP events', 'Custom alterations'],
    multiplier: 2,
    color: '#E5E4E2',
  },
];

export interface ReferralData {
  code: string;
  referrerId: string;
  referredCount: number;
  earnedPoints: number;
  pendingReferrals: number;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  error?: string;
  appliedItems?: string[];
}

export interface ReturnRequest {
  orderId: string;
  orderItemId: string;
  type: 'exchange' | 'return' | 'repair';
  reason: 'size' | 'fit' | 'quality' | 'damaged' | 'wrong_item' | 'changed_mind' | 'other';
  reasonDetail?: string;
  exchangeVariantId?: string;
  exchangeSize?: string;
  exchangeColorId?: string;
  images?: File[];
}

export interface WhatsAppOrderMessage {
  orderNumber: string;
  items: Array<{
    name: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  customerName: string;
  customerPhone: string;
  shippingAddress: Address;
}