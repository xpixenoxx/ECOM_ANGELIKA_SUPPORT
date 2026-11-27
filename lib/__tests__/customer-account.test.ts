import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockUpdateUserById = vi.fn();

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: (...args: any[]) => mockFrom(...args),
    auth: {
      admin: {
        updateUserById: (...args: any[]) => mockUpdateUserById(...args),
      },
    },
  },
}));

import {
  updateCustomerProfileAction,
  saveCustomerAddressesAction,
  redeemCustomerLoyaltyRewardAction,
} from '@/lib/actions/customer-account';

describe('customer-account server actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthenticated profile updates', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await updateCustomerProfileAction({ full_name: 'Priya', phone: '9876543210' });
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/sign in/i);
  });

  it('normalizes +91 mobile numbers and updates profile cleanly', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'priya@example.com', user_metadata: {} } },
    });
    const updateEq = vi.fn().mockResolvedValue({ error: null });
    const updateFn = vi.fn(() => ({ eq: updateEq }));
    mockFrom.mockReturnValue({ update: updateFn });
    mockUpdateUserById.mockResolvedValue({ error: null });

    const res = await updateCustomerProfileAction({
      full_name: '  Priya Sharma  ',
      phone: '+91 98765 43210',
    });

    expect(res.success).toBe(true);
    expect(res.full_name).toBe('Priya Sharma');
    expect(res.phone).toBe('9876543210');
    expect(updateFn).toHaveBeenCalledWith(
      expect.objectContaining({ full_name: 'Priya Sharma', phone: '9876543210' })
    );
  });

  it('validates PIN codes and ensures a default address when saving addresses', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'priya@example.com' } },
    });

    const invalidRes = await saveCustomerAddressesAction([
      {
        id: 'a1',
        firstName: 'Priya',
        lastName: 'Sharma',
        address1: '42 Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '00012',
        country: 'India',
        phone: '9876543210',
      },
    ]);
    expect(invalidRes.success).toBe(false);
    expect(invalidRes.error).toMatch(/PIN code/i);

    const selectChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { preferences: { theme: 'light' } } }),
    };
    const updateEq = vi.fn().mockResolvedValue({ error: null });
    const updateChain = {
      update: vi.fn(() => ({ eq: updateEq })),
    };

    mockFrom.mockImplementationOnce(() => selectChain).mockImplementationOnce(() => updateChain);

    const validRes = await saveCustomerAddressesAction([
      {
        id: 'a1',
        firstName: 'Priya',
        lastName: 'Sharma',
        address1: '42 Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500033',
        country: 'India',
        phone: '+919876543210',
        isDefault: false,
      },
    ]);

    expect(validRes.success).toBe(true);
    expect(validRes.addresses?.[0]?.isDefault).toBe(true);
    expect(validRes.addresses?.[0]?.phone).toBe('9876543210');
  });

  it('prevents loyalty redemption when points are insufficient', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'priya@example.com' } },
    });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'user-1', loyalty_points: 150, loyalty_tier: 'bronze' },
        error: null,
      }),
    });

    const res = await redeemCustomerLoyaltyRewardAction('discount_100');
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/350 more points/i);
  });

  it('redeems points into a real single-use CIRCLE coupon and logs ledger entry', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'priya@example.com' } },
    });

    const profileReadChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'user-1', loyalty_points: 1200, loyalty_tier: 'silver' },
        error: null,
      }),
    };
    const profileDeductChain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: 'user-1', loyalty_points: 700 },
        error: null,
      }),
    };
    const couponInsertChain = {
      insert: vi.fn().mockResolvedValue({ error: null }),
    };
    const txInsertChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'tx-1',
          user_id: 'user-1',
          points: -500,
          type: 'redeem_discount',
          description: 'Redeemed ₹100 Off',
          created_at: new Date().toISOString(),
        },
        error: null,
      }),
    };

    mockFrom
      .mockImplementationOnce(() => profileReadChain)
      .mockImplementationOnce(() => profileDeductChain)
      .mockImplementationOnce(() => couponInsertChain)
      .mockImplementationOnce(() => txInsertChain);

    const res = await redeemCustomerLoyaltyRewardAction('discount_100');
    expect(res.success).toBe(true);
    expect(res.couponCode).toMatch(/^CIRCLE-[A-Z0-9]{6}$/);
    expect(res.newPoints).toBe(700);
    expect(couponInsertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'fixed',
        value: 100,
        usage_limit: 1,
        user_limit: 1,
        is_active: true,
      })
    );
  });
});
