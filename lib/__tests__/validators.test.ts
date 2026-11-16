import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  isPlaceholderEnvValue,
  getOptionalEnv,
  hasValidSupabaseConfig,
  getServiceHealthFlags,
} from '@/lib/env';
import {
  normalizeIndianPhone,
  escapeHtml,
  stripHtmlTags,
  sanitizePostgrestSearchTerm,
  CreateOrderInputSchema,
  CouponInputSchema,
  TaxSettingsSchema,
  ReturnRequestInputSchema,
} from '@/lib/validators/commerce';
import { normalizeAddress, toCheckoutAddress, toSavedAddress } from '@/lib/utils/address';
import { sanitizeCsvCell, toCsvString } from '@/lib/utils/csv-export';
import { sortGarmentSizes } from '@/lib/utils/product-transform';

describe('Workstream 0: Env, Validators, Address, CSV & Product Helpers', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('lib/env.ts', () => {
    it('detects template placeholders and missing values accurately', () => {
      expect(isPlaceholderEnvValue(undefined)).toBe(true);
      expect(isPlaceholderEnvValue('')).toBe(true);
      expect(isPlaceholderEnvValue('https://your-project-id.supabase.co')).toBe(true);
      expect(isPlaceholderEnvValue('rzp_test_...')).toBe(true);
      expect(isPlaceholderEnvValue('rzp_live_9281a8c9b')).toBe(true);
      expect(isPlaceholderEnvValue('placeholder-anon-key')).toBe(true);
      expect(isPlaceholderEnvValue('https://abcxyz.supabase.co')).toBe(false);
    });

    it('reports boolean-only service health flags safely', () => {
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://your-project-id.supabase.co');
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'your-supabase-anon-key');
      vi.stubEnv('RAZORPAY_WEBHOOK_SECRET', 'real_webhook_secret_123');
      expect(hasValidSupabaseConfig()).toBe(false);
      const flags = getServiceHealthFlags();
      expect(flags.supabaseConfigured).toBe(false);
      expect(flags.razorpayWebhookConfigured).toBe(true);
      expect(Object.values(flags).every((v) => typeof v === 'boolean')).toBe(true);
    });
  });

  describe('lib/validators/commerce.ts', () => {
    it('normalizes 10-digit Indian phone numbers cleanly', () => {
      expect(normalizeIndianPhone('+91 98765 43210')).toBe('9876543210');
      expect(normalizeIndianPhone('09876543210')).toBe('9876543210');
      expect(normalizeIndianPhone('9876543210')).toBe('9876543210');
    });

    it('sanitizes XSS and PostgREST filter injection characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
      expect(stripHtmlTags('Hello <b>World</b>')).toBe('Hello World');
      expect(sanitizePostgrestSearchTerm('kurti,email.ilike.%admin%')).toBe('kurti email ilike admin');
    });

    it('validates CreateOrderInputSchema & normalizes email/phone/pincode', () => {
      const parsed = CreateOrderInputSchema.parse({
        items: [{ variantId: '11111111-1111-4111-8111-111111111111', quantity: 2 }],
        shippingAddress: {
          firstName: 'Ananya',
          lastName: 'Rao',
          address1: '12 MG Road, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          phone: '+91 9876543210',
        },
        paymentMethod: 'razorpay',
        email: 'ANANYA@Example.COM',
        phone: '9876543210',
      });
      expect(parsed.email).toBe('ananya@example.com');
      expect(parsed.phone).toBe('9876543210');
      expect(parsed.shippingAddress.postalCode).toBe('560038');
    });

    it('validates optional Indian GSTIN strictly', () => {
      expect(TaxSettingsSchema.parse({ gstin: '' }).gstin).toBe('');
      expect(TaxSettingsSchema.parse({ gstin: null }).gstin).toBeNull();
      expect(TaxSettingsSchema.parse({ gstin: '29AABCU9603R1ZM' }).gstin).toBe('29AABCU9603R1ZM');
      expect(() => TaxSettingsSchema.parse({ gstin: 'INVALID123' })).toThrow();
    });

    it('validates ReturnRequestInputSchema & CouponInputSchema', () => {
      const coupon = CouponInputSchema.parse({
        code: 'first10',
        name: 'Welcome Offer',
        type: 'percentage',
        value: 10,
      });
      expect(coupon.code).toBe('FIRST10');

      const rma = ReturnRequestInputSchema.parse({
        orderId: '11111111-1111-4111-8111-111111111111',
        orderItemId: '22222222-2222-4222-8222-222222222222',
        type: 'return',
        reason: 'size',
      });
      expect(rma.reason).toBe('size');
    });
  });

  describe('lib/utils/address.ts', () => {
    it('reconciles checkout Address and account SavedAddress bidirectionally', () => {
      const saved = {
        id: 'addr-1',
        name: 'Meera Krishnan',
        address_line1: '44 Boat Club Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600028',
        phone: '9840012345',
        type: 'Home',
        is_default: true,
      };
      const checkout = toCheckoutAddress(saved);
      expect(checkout.firstName).toBe('Meera');
      expect(checkout.lastName).toBe('Krishnan');
      expect(checkout.address1).toBe('44 Boat Club Road');
      expect(checkout.postalCode).toBe('600028');

      const backToSaved = toSavedAddress(checkout as unknown as Record<string, unknown>);
      expect(backToSaved.name).toBe('Meera Krishnan');
      expect(backToSaved.address_line1).toBe('44 Boat Club Road');
      expect(backToSaved.pincode).toBe('600028');
      expect(normalizeAddress(saved).isDefault).toBe(true);
    });
  });

  describe('lib/utils/csv-export.ts & product-transform.ts', () => {
    it('prevents CSV formula injection and preserves UTF-8 quoting', () => {
      expect(sanitizeCsvCell('=CMD("calc")')).toBe('"\'=CMD(""calc"")"');
      expect(sanitizeCsvCell('+SUM(A1:A2)')).toBe('"\'+SUM(A1:A2)"');
      expect(sanitizeCsvCell('Silk Saree, Red')).toBe('"Silk Saree, Red"');
      const csv = toCsvString(['Item', 'Price'], [['Banarasi', 8500]]);
      expect(csv).toContain('Item,Price\r\nBanarasi,8500');
    });

    it('sorts garment sizes in canonical fashion order', () => {
      expect(sortGarmentSizes(['XL', 'S', 'M', 'XS', 'Free Size', 'XXL'])).toEqual([
        'Free Size',
        'XS',
        'S',
        'M',
        'XL',
        'XXL',
      ]);
    });
  });
});
