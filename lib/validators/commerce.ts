import { z } from 'zod';

/**
 * Shared Input Validation & Sanitization Utilities for Angelika Fashions
 */

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
export const INDIAN_PINCODE_REGEX = /^[1-9]\d{5}$/;
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/** Normalize any phone string to clean 10-digit Indian mobile number when possible. */
export function normalizeIndianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

/** Escape HTML entities before interpolating strings into transactional emails or SSR templates. */
export function escapeHtml(input: unknown): string {
  const str = String(input ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Strip raw HTML tags from user-supplied text fields. */
export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}

/** Sanitize user search text before interpolating into PostgREST `.or()` filters. */
export function sanitizePostgrestSearchTerm(input: string, maxLength = 100): string {
  return input
    .replace(/[%_(),."'`\\;]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/** Validate safe URL paths (`/...`) or `https://` URLs (blocks `javascript:` / `data:`). */
export const SafeUrlOrPathSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (val) => {
      if (!val) return true;
      if (val.startsWith('/') && !val.startsWith('//')) return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === 'https:' || parsed.protocol === 'http:';
      } catch {
        return false;
      }
    },
    { message: 'URL must be a relative path or valid http(s) URL' }
  );

export const UserRoleSchema = z.enum(['customer', 'designer', 'manager', 'admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const AddressInputSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(80).transform(stripHtmlTags),
  lastName: z.string().trim().min(1, 'Last name is required').max(80).transform(stripHtmlTags),
  address1: z.string().trim().min(4, 'Street address is required').max(250).transform(stripHtmlTags),
  address2: z.string().trim().max(250).optional().default('').transform(stripHtmlTags),
  city: z.string().trim().min(2, 'City is required').max(100).transform(stripHtmlTags),
  state: z.string().trim().min(2, 'State is required').max(100).transform(stripHtmlTags),
  postalCode: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => INDIAN_PINCODE_REGEX.test(v), 'Enter a valid 6-digit Indian pincode'),
  country: z.string().trim().max(80).default('India'),
  phone: z
    .string()
    .trim()
    .transform(normalizeIndianPhone)
    .refine((v) => INDIAN_PHONE_REGEX.test(v), 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().trim().email('Enter a valid email address').optional(),
});

export const OrderItemInputSchema = z.object({
  productId: z.string().uuid().optional().nullable(),
  variantId: z.string().uuid('Valid product variant ID is required'),
  productName: z.string().trim().min(1).max(200).optional(),
  size: z.string().trim().min(1).max(32).optional(),
  color: z.string().trim().max(64).optional(),
  quantity: z.number().int().min(1).max(10),
  imageUrl: z.string().trim().max(2048).optional(),
});

export const CreateOrderInputSchema = z.object({
  items: z.array(OrderItemInputSchema).min(1, 'Cart cannot be empty').max(50),
  shippingAddress: AddressInputSchema,
  billingAddress: AddressInputSchema.optional(),
  paymentMethod: z.enum(['razorpay', 'stripe', 'cod']),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .transform(normalizeIndianPhone)
    .refine((v) => INDIAN_PHONE_REGEX.test(v), 'Enter a valid 10-digit Indian mobile number'),
  notes: z.string().trim().max(500).optional().transform((v) => (v ? stripHtmlTags(v) : undefined)),
  couponCode: z.string().trim().toUpperCase().max(64).optional(),
  giftWrap: z.boolean().optional().default(false),
  giftMessage: z
    .string()
    .trim()
    .max(300)
    .optional()
    .transform((v) => (v ? stripHtmlTags(v) : undefined)),
  whatsappOptIn: z.boolean().optional().default(false),
  idempotencyKey: z.string().trim().min(8).max(128).optional(),
});

export const ProductVariantInputSchema = z.object({
  id: z.string().uuid().optional(),
  size: z.string().trim().min(1).max(32),
  color_id: z.string().uuid().nullable().optional(),
  price: z.number().positive('Variant price must be greater than zero').max(5000000),
  compare_at_price: z.number().nonnegative().nullable().optional(),
  cost_price: z.number().nonnegative().nullable().optional(),
  inventory_quantity: z.number().int().min(0, 'Stock cannot be negative'),
  low_stock_threshold: z.number().int().min(0).max(1000).optional().default(5),
  barcode: z.string().trim().max(64).nullable().optional(),
  weight_grams: z.number().int().min(0).max(100000).nullable().optional(),
  is_active: z.boolean().optional().default(true),
  sort_order: z.number().int().min(0).optional().default(0),
});

export const ProductInputSchema = z.object({
  name: z.string().trim().min(2, 'Product name is required').max(200).transform(stripHtmlTags),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  sku: z.string().trim().min(2).max(80),
  category_id: z.string().uuid('Valid category ID is required'),
  subcategory_id: z.string().uuid().nullable().optional(),
  description: z.string().trim().max(8000).nullable().optional(),
  short_description: z.string().trim().max(500).nullable().optional(),
  occasion: z.array(z.string().trim().max(64)).nullable().optional(),
  tags: z.array(z.string().trim().max(64)).nullable().optional(),
  gst_slab: z.number().min(0).max(28).optional().default(5),
  hsn_code: z.string().trim().max(16).nullable().optional(),
  is_active: z.boolean().optional().default(true),
  is_featured: z.boolean().optional().default(false),
  is_vidyas_pick: z.boolean().optional().default(false),
  vidyas_note: z.string().trim().max(1000).nullable().optional(),
  meta_title: z.string().trim().max(160).nullable().optional(),
  meta_description: z.string().trim().max(320).nullable().optional(),
  variants: z.array(ProductVariantInputSchema).min(1, 'At least one variant is required').optional(),
});

export const CouponInputSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, 'Coupon code must be at least 3 characters')
    .max(40)
    .regex(/^[A-Z0-9_-]+$/, 'Coupon code may contain only A-Z, 0-9, _ and -'),
  name: z.string().trim().min(2).max(120).transform(stripHtmlTags),
  type: z.enum(['percentage', 'fixed', 'free_shipping']),
  value: z.number().min(0).max(100000),
  min_order_amount: z.number().min(0).nullable().optional(),
  max_discount_amount: z.number().min(0).nullable().optional(),
  usage_limit: z.number().int().positive().nullable().optional(),
  user_limit: z.number().int().positive().nullable().optional(),
  first_order_only: z.boolean().optional().default(false),
  valid_from: z.string().datetime({ offset: true }).or(z.string().min(10)).nullable().optional(),
  valid_until: z.string().datetime({ offset: true }).or(z.string().min(10)).nullable().optional(),
  is_active: z.boolean().optional().default(true),
});

export const ReturnRequestInputSchema = z.object({
  orderId: z.string().uuid(),
  orderItemId: z.string().uuid(),
  type: z.enum(['return', 'exchange']),
  reason: z.enum([
    'size',
    'fit',
    'wrong_item',
    'damaged',
    'quality',
    'changed_mind',
    'other',
    'wrong_size',
    'wrong_color',
    'not_as_described',
    'quality_issue',
    'late_delivery',
  ]),
  reasonDetail: z.string().trim().max(1000).optional().transform((v) => (v ? stripHtmlTags(v) : undefined)),
  exchangeVariantId: z.string().uuid().optional().nullable(),
  exchangeSize: z.string().trim().max(32).optional(),
  images: z.array(SafeUrlOrPathSchema).max(6).optional(),
});

export const ReviewInputSchema = z.object({
  productId: z.string().uuid(),
  orderId: z.string().uuid().optional(),
  orderItemId: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(150).optional().transform((v) => (v ? stripHtmlTags(v) : undefined)),
  comment: z
    .string()
    .trim()
    .min(5, 'Please write at least 5 characters')
    .max(2000)
    .transform(stripHtmlTags),
  fitFeedback: z.enum(['runs_small', 'true_to_size', 'runs_large']).optional(),
  images: z.array(SafeUrlOrPathSchema).max(5).optional(),
});

export const StoreSettingsUpdateSchema = z.object({
  site_name: z.string().trim().min(1).max(120).optional(),
  site_tagline: z.string().trim().max(200).optional(),
  logo_url: SafeUrlOrPathSchema.nullable().optional(),
  favicon_url: SafeUrlOrPathSchema.nullable().optional(),
  announcement_bar_enabled: z.boolean().optional(),
  announcement_bar_text: z.string().trim().max(300).optional(),
  announcement_bar_link: SafeUrlOrPathSchema.optional(),
  announcement_bar_bg_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  announcement_bar_text_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  contact_email: z.string().trim().email().or(z.literal('')).optional(),
  contact_phone: z.string().trim().max(32).optional(),
  contact_whatsapp: z.string().trim().max(32).optional(),
  address: z.string().trim().max(500).optional(),
  social_instagram: SafeUrlOrPathSchema.optional(),
  social_facebook: SafeUrlOrPathSchema.optional(),
  social_whatsapp: SafeUrlOrPathSchema.optional(),
  social_youtube: SafeUrlOrPathSchema.optional(),
  free_shipping_threshold: z.number().min(0).max(100000).optional(),
  cod_max_amount: z.number().min(0).max(500000).optional(),
  return_policy_days: z.number().int().min(0).max(90).optional(),
  meta_title: z.string().trim().max(160).optional(),
  meta_description: z.string().trim().max(320).optional(),
});

export const TaxSettingsSchema = z.object({
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => v === '' || GSTIN_REGEX.test(v), 'Enter a valid 15-character Indian GSTIN or leave blank')
    .nullable()
    .optional(),
  pricesIncludeTax: z.boolean().default(true),
  sellerState: z.string().trim().max(80).optional(),
  apparelLowRate: z.number().min(0).max(28).default(5),
  apparelHighRate: z.number().min(0).max(28).default(12),
  thresholdAmount: z.number().min(0).max(100000).default(1000),
});

export const ExtendedSettingsSchema = z.object({
  shipping: z
    .object({
      standardRate: z.number().min(0).max(10000),
      expressRate: z.number().min(0).max(20000),
      defaultPartner: z.string().trim().min(1).max(80),
      estimatedDays: z.string().trim().min(1).max(80),
    })
    .partial()
    .optional(),
  payments: z
    .object({
      codEnabled: z.boolean(),
      codFee: z.number().min(0).max(2000),
      upiEnabled: z.boolean(),
      intlEnabled: z.boolean(),
    })
    .partial()
    .optional(),
  taxes: TaxSettingsSchema.partial().optional(),
  emails: z
    .object({
      senderName: z.string().trim().min(1).max(120),
      senderEmail: z.string().trim().email().or(z.literal('')),
      replyTo: z.string().trim().email().or(z.literal('')).optional(),
      orderConfirmationEnabled: z.boolean(),
      shipmentNotificationEnabled: z.boolean(),
    })
    .partial()
    .optional(),
  notifications: z
    .object({
      orderSound: z.boolean(),
      vipSmsAlert: z.boolean(),
      lowStockAlert: z.boolean(),
      dailyDigest: z.boolean(),
      lowStockThreshold: z.number().int().min(0).max(500),
    })
    .partial()
    .optional(),
});

export const DesignTokensSaveSchema = z.object({
  tokens: z.record(
    z.string().min(1),
    z.union([z.string(), z.number(), z.boolean(), z.record(z.any())])
  ),
  versionLabel: z.string().trim().max(40).optional(),
});

export const ContactInquirySchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100).transform(stripHtmlTags),
  email: z.string().trim().email('Valid email is required'),
  phone: z.string().trim().max(24).optional().transform((v) => (v ? stripHtmlTags(v) : undefined)),
  subject: z.string().trim().min(2, 'Subject is required').max(160).transform(stripHtmlTags),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(3000).transform(stripHtmlTags),
  inquiryType: z.string().trim().max(64).optional().default('general'),
});

export const WholesaleInquirySchema = z.object({
  businessName: z.string().trim().min(2, 'Business name is required').max(150).transform(stripHtmlTags),
  contactName: z.string().trim().min(2, 'Contact name is required').max(100).transform(stripHtmlTags),
  email: z.string().trim().email('Valid email is required'),
  phone: z
    .string()
    .trim()
    .transform((v) => {
      const cleaned = v.replace(/[\s\-().]/g, '');
      if (cleaned.startsWith('+91') || cleaned.startsWith('91') || /^0?[6-9]\d{9}$/.test(cleaned)) {
        return normalizeIndianPhone(v);
      }
      return cleaned;
    })
    .refine(
      (v) => INDIAN_PHONE_REGEX.test(v) || /^\+?[1-9]\d{6,14}$/.test(v),
      'Valid 10-digit Indian phone or international phone required'
    ),
  city: z.string().trim().min(2, 'City & country required').max(100).transform(stripHtmlTags),
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => v === '' || GSTIN_REGEX.test(v), 'Invalid GSTIN format')
    .optional(),
  estimatedOrderVolume: z.string().trim().min(1).max(100).transform(stripHtmlTags),
  notes: z.string().trim().max(3000).optional().transform((v) => (v ? stripHtmlTags(v) : undefined)),
});

export const NewsletterSubscribeSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').transform((v) => v.toLowerCase()),
  source: z.string().trim().max(64).optional().default('storefront'),
});
