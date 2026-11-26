import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const {
  blocksMap,
  profilesMap,
  ordersList,
  mockCreateUser,
  mockGenerateLink,
  mockVerifyOtp,
  mockSendEmail,
} = vi.hoisted(() => ({
  blocksMap: new Map<string, any>(),
  profilesMap: new Map<string, any>(),
  ordersList: [] as any[],
  mockCreateUser: vi.fn(),
  mockGenerateLink: vi.fn(),
  mockVerifyOtp: vi.fn(),
  mockSendEmail: vi.fn(),
}));

vi.mock('@/lib/email/resend', () => ({
  isResendConfigured: () => Boolean(process.env['RESEND_API_KEY']),
  sendEmailViaResend: (...args: any[]) => mockSendEmail(...args),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      verifyOtp: (...args: any[]) => mockVerifyOtp(...args),
    },
  })),
}));

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    auth: {
      admin: {
        createUser: (...args: any[]) => mockCreateUser(...args),
        generateLink: (...args: any[]) => mockGenerateLink(...args),
      },
    },
    from: vi.fn((table: string) => {
      if (table === 'content_blocks') {
        return {
          upsert: vi.fn(async (row: any) => {
            blocksMap.set(row.key, { id: `blk_${row.key}`, ...row });
            return { error: null };
          }),
          select: vi.fn(() => ({
            eq: vi.fn((_c: string, val: string) => ({
              maybeSingle: vi.fn(async () => ({
                data: blocksMap.get(val) ?? null,
                error: null,
              })),
            })),
          })),
          update: vi.fn((patch: any) => ({
            eq: vi.fn(async (_c: string, id: string) => {
              for (const [k, v] of blocksMap.entries()) {
                if (v.id === id) blocksMap.set(k, { ...v, ...patch });
              }
              return { error: null };
            }),
          })),
          delete: vi.fn(() => ({
            eq: vi.fn(async (col: string, val: string) => {
              if (col === 'key') blocksMap.delete(val);
              else {
                for (const [k, v] of blocksMap.entries()) {
                  if (v.id === val) blocksMap.delete(k);
                }
              }
              return { error: null };
            }),
          })),
        };
      }
      if (table === 'profiles') {
        return {
          select: vi.fn(() => ({
            ilike: vi.fn((_c: string, email: string) => ({
              maybeSingle: vi.fn(async () => ({
                data: profilesMap.get(email.toLowerCase()) ?? null,
                error: null,
              })),
            })),
          })),
          upsert: vi.fn(async (row: any) => {
            profilesMap.set(String(row.email).toLowerCase(), row);
            return { error: null };
          }),
          update: vi.fn((patch: any) => ({
            eq: vi.fn(async (_c: string, id: string) => {
              for (const [k, v] of profilesMap.entries()) {
                if (v.id === id) profilesMap.set(k, { ...v, ...patch });
              }
              return { error: null };
            }),
          })),
        };
      }
      if (table === 'orders') {
        return {
          update: vi.fn((patch: any) => ({
            is: vi.fn(() => ({
              ilike: vi.fn(async (_c: string, email: string) => {
                for (const ord of ordersList) {
                  if (!ord.user_id && ord.email.toLowerCase() === email.toLowerCase()) {
                    Object.assign(ord, patch);
                  }
                }
                return { error: null };
              }),
            })),
          })),
        };
      }
      return {};
    }),
  },
}));

import {
  getCheckoutOtpStatus,
  sendCheckoutOtp,
  verifyCheckoutOtpAndSignIn,
} from '@/lib/actions/checkout-otp';

describe('Inline Checkout OTP Auto-Account Creation & Persistent Session Login', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    blocksMap.clear();
    profilesMap.clear();
    ordersList.length = 0;
    process.env = { ...originalEnv };
    delete process.env['RESEND_API_KEY'];
    delete process.env['TWOFACTOR_API_KEY'];
    delete process.env['FAST2SMS_API_KEY'];
    delete process.env['MSG91_AUTH_KEY'];
    delete process.env['WHATSAPP_OTP_TEMPLATE_NAME'];
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it('detects configured Email and Mobile OTP providers accurately', async () => {
    expect((await getCheckoutOtpStatus()).anyOtpReady).toBe(false);

    process.env['RESEND_API_KEY'] = 're_test_12345';
    const emailOnly = await getCheckoutOtpStatus();
    expect(emailOnly.emailOtpReady).toBe(true);
    expect(emailOnly.mobileOtpReady).toBe(false);
    expect(emailOnly.anyOtpReady).toBe(true);

    process.env['TWOFACTOR_API_KEY'] = '2f_test_key_123';
    const both = await getCheckoutOtpStatus();
    expect(both.mobileOtpReady).toBe(true);
    expect(both.mobileProvider).toBe('2factor');
  });

  it('sends 6-digit OTP via email, auto-creates account on verify, links past orders, and mints session cookie', async () => {
    process.env['RESEND_API_KEY'] = 're_test_12345';
    let capturedOtp = '';
    mockSendEmail.mockImplementationOnce(async (args: any) => {
      const m = String(args.subject).match(/\b(\d{6})\b/);
      capturedOtp = m?.[1] || '';
      return { success: true, id: 'email_otp_1' };
    });

    ordersList.push({ id: 'old-ord-1', email: 'kavya@example.com', user_id: null });
    mockCreateUser.mockResolvedValueOnce({ data: { user: { id: 'new-user-1', email: 'kavya@example.com' } }, error: null });
    mockGenerateLink.mockResolvedValueOnce({ data: { properties: { hashed_token: 'tok_hash_abc' } }, error: null });
    mockVerifyOtp.mockResolvedValueOnce({ data: { user: { id: 'new-user-1', email: 'kavya@example.com' } }, error: null });

    const sendRes = await sendCheckoutOtp({
      email: 'kavya@example.com',
      phone: '9876543210',
      fullName: 'Kavya Rao',
    });
    expect(sendRes.success).toBe(true);
    expect(sendRes.channel).toBe('email');
    expect(capturedOtp).toMatch(/^\d{6}$/);

    // Wrong OTP must be rejected
    const badRes = await verifyCheckoutOtpAndSignIn({
      email: 'kavya@example.com',
      phone: '9876543210',
      otp: '000000',
    });
    expect(badRes.success).toBe(false);

    // Correct OTP auto-creates user, links prior order, and mints persistent session
    const okRes = await verifyCheckoutOtpAndSignIn({
      email: 'kavya@example.com',
      phone: '9876543210',
      otp: capturedOtp,
      fullName: 'Kavya Rao',
    });
    expect(okRes.success).toBe(true);
    expect(okRes.isNewAccount).toBe(true);
    expect(mockCreateUser).toHaveBeenCalledTimes(1);
    expect(mockVerifyOtp).toHaveBeenCalledWith({ token_hash: 'tok_hash_abc', type: 'magiclink' });
    expect(ordersList[0].user_id).toBe('new-user-1');

    // Replaying the same OTP must fail (strict one-time use)
    const replayRes = await verifyCheckoutOtpAndSignIn({
      email: 'kavya@example.com',
      phone: '9876543210',
      otp: capturedOtp,
    });
    expect(replayRes.success).toBe(false);
  });

  it('dispatches Mobile OTP via 2Factor when TWOFACTOR_API_KEY is configured', async () => {
    process.env['TWOFACTOR_API_KEY'] = '2f_test_key_999';
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        expect(url).toContain('https://2factor.in/API/V1/2f_test_key_999/SMS/+919876543210/');
        return new Response(JSON.stringify({ Status: 'Success', Details: 'session_123' }), { status: 200 });
      })
    );

    const res = await sendCheckoutOtp({
      email: 'meera@example.com',
      phone: '9876543210',
      preferredChannel: 'mobile',
    });
    expect(res.success).toBe(true);
    expect(res.channel).toBe('mobile');
    expect(res.maskedTarget).toBe('+91 ••••••3210');
  });
});
