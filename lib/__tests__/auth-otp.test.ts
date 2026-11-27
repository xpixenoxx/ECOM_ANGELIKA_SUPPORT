import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const {
  contentBlocksStore,
  profilesStore,
  mockCreateUser,
  mockAuthAdminCreateUser,
  mockGenerateLink,
  mockVerifyOtp,
  mockUpdateUserById,
  mockListUsers,
  mockSendEmail,
} = vi.hoisted(() => ({
  contentBlocksStore: new Map<string, any>(),
  profilesStore: new Map<string, any>(),
  mockCreateUser: vi.fn(),
  mockAuthAdminCreateUser: vi.fn(),
  mockGenerateLink: vi.fn(),
  mockVerifyOtp: vi.fn(),
  mockUpdateUserById: vi.fn(),
  mockListUsers: vi.fn(),
  mockSendEmail: vi.fn(),
}));

vi.mock('@/lib/email/resend', () => ({
  sendEmailViaResend: (...args: any[]) => mockSendEmail(...args),
  isResendConfigured: () => false,
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      verifyOtp: (...args: any[]) => mockVerifyOtp(...args),
    },
  }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  adminCreateUser: (...args: any[]) => mockCreateUser(...args),
  supabaseAdmin: {
    auth: {
      admin: {
        listUsers: (...args: any[]) => mockListUsers(...args),
        updateUserById: (...args: any[]) => mockUpdateUserById(...args),
        createUser: (...args: any[]) => mockAuthAdminCreateUser(...args),
        generateLink: (...args: any[]) => mockGenerateLink(...args),
      },
    },
    from: vi.fn((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn((_col: string, val: string) => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: profilesStore.get(val) ?? null,
              error: null,
            }),
          })),
          ilike: vi.fn((_col: string, val: string) => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: profilesStore.get(val.toLowerCase()) ?? null,
              error: null,
            }),
          })),
          upsert: vi.fn(async (row: any) => {
            if (row?.email) profilesStore.set(String(row.email).toLowerCase(), row);
            return { error: null };
          }),
        };
      }
      if (table === 'orders') {
        return {
          update: vi.fn(() => ({
            is: vi.fn(() => ({
              ilike: vi.fn().mockResolvedValue({ error: null }),
            })),
          })),
        };
      }
      if (table === 'content_blocks') {
        let eqKey: string | null = null;
        return {
          upsert: vi.fn(async (row: any) => {
            contentBlocksStore.set(row.key, { id: row.key, ...row });
            return { error: null };
          }),
          select: vi.fn().mockReturnThis(),
          eq: vi.fn((col: string, val: string) => {
            eqKey = val;
            return {
              maybeSingle: vi.fn(async () => ({
                data: eqKey ? contentBlocksStore.get(eqKey) ?? null : null,
                error: null,
              })),
            };
          }),
          update: vi.fn((patch: any) => ({
            eq: vi.fn(async (_c: string, id: string) => {
              const existing = contentBlocksStore.get(id);
              if (existing) {
                contentBlocksStore.set(id, { ...existing, ...patch });
              }
              return { error: null };
            }),
          })),
          delete: vi.fn(() => ({
            eq: vi.fn(async (_c: string, id: string) => {
              contentBlocksStore.delete(id);
              return { error: null };
            }),
          })),
        };
      }
      return {};
    }),
  },
}));

import {
  sendSignupOtp,
  verifySignupOtp,
  sendLoginOtp,
  verifyLoginOtpAndSignIn,
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
} from '@/lib/actions/auth-otp';
import { resetRateLimit } from '@/lib/utils/rate-limit';

describe('OTP Authentication Hardening', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    contentBlocksStore.clear();
    profilesStore.clear();
    resetRateLimit();
    process.env = { ...originalEnv };
    (process.env as any).NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('stores hashed OTP with is_active=false and never exposes plaintext otp in DB', async () => {
    mockSendEmail.mockResolvedValue({ success: false, error: 'Resend not configured' });

    const res = await sendSignupOtp('newbuyer@example.com', 'Aarti Devi');
    expect(res.success).toBe(true);
    expect(res.devCode).toMatch(/^\d{6}$/);

    const stored = contentBlocksStore.get('otp_signup_newbuyer_example_com');
    expect(stored).toBeDefined();
    expect(stored.is_active).toBe(false);
    expect(stored.content.otp).toBeUndefined();
    expect(stored.content.otpHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('never exposes devCode when NODE_ENV=production', async () => {
    (process.env as any).NODE_ENV = 'production';
    mockSendEmail.mockResolvedValue({ success: false, error: 'Resend disabled' });

    const res = await sendSignupOtp('prod@example.com', 'Meera');
    expect(res.success).toBe(false);
    expect(res.devCode).toBeUndefined();
    expect(contentBlocksStore.get('otp_signup_prod_example_com')).toBeUndefined();
  });

  it('locks and deletes OTP record after 5 failed verification attempts', async () => {
    mockSendEmail.mockResolvedValue({ success: true });
    await sendSignupOtp('brute@example.com', 'Kavya');

    for (let i = 0; i < 4; i++) {
      const attempt = await verifySignupOtp({
        email: 'brute@example.com',
        otp: '000000',
        password: 'StrongPassword1!',
        fullName: 'Kavya',
      });
      expect(attempt.success).toBe(false);
      expect(contentBlocksStore.get('otp_signup_brute_example_com')).toBeDefined();
    }

    const fifth = await verifySignupOtp({
      email: 'brute@example.com',
      otp: '000000',
      password: 'StrongPassword1!',
      fullName: 'Kavya',
    });
    expect(fifth.success).toBe(false);
    expect(fifth.message).toMatch(/Maximum verification attempts/i);
    expect(contentBlocksStore.get('otp_signup_brute_example_com')).toBeUndefined();
  });

  it('rate limits password reset OTP dispatch and uses profiles lookup instead of listUsers()', async () => {
    profilesStore.set('reset@example.com', {
      id: 'user-99',
      email: 'reset@example.com',
      full_name: 'Rani',
    });
    mockSendEmail.mockResolvedValue({ success: false });

    for (let i = 0; i < 5; i++) {
      const r = await sendPasswordResetOtp('reset@example.com');
      expect(r.success).toBe(true);
    }

    const blocked = await sendPasswordResetOtp('reset@example.com');
    expect(blocked.success).toBe(false);
    expect(blocked.message).toMatch(/Too many/i);
    expect(mockListUsers).not.toHaveBeenCalled();
  });

  it('verifies password reset OTP cleanly and deletes token on success', async () => {
    profilesStore.set('ok@example.com', {
      id: 'user-77',
      email: 'ok@example.com',
      full_name: 'Neha',
    });
    mockSendEmail.mockResolvedValue({ success: false });
    mockUpdateUserById.mockResolvedValue({ error: null });

    const sent = await sendPasswordResetOtp('ok@example.com');
    expect(sent.success).toBe(true);

    const verified = await verifyPasswordResetOtp({
      email: 'ok@example.com',
      otp: sent.devCode!,
      newPassword: 'NewSecurePassword123!',
    });
    expect(verified.success).toBe(true);
    expect(mockUpdateUserById).toHaveBeenCalledWith('user-77', { password: 'NewSecurePassword123!' });
    expect(contentBlocksStore.get('otp_reset_ok_example_com')).toBeUndefined();
  });

  it('sends hashed login OTP and mints a persistent session via magiclink verification', async () => {
    profilesStore.set('patron@example.com', {
      id: 'user-patron-1',
      email: 'patron@example.com',
      full_name: 'Ananya',
    });
    mockSendEmail.mockResolvedValue({ success: false });
    mockGenerateLink.mockResolvedValue({
      data: { properties: { hashed_token: 'hash-tok-123' } },
      error: null,
    });
    mockVerifyOtp.mockResolvedValue({
      data: { user: { id: 'user-patron-1', email: 'patron@example.com' } },
      error: null,
    });

    const sent = await sendLoginOtp('patron@example.com');
    expect(sent.success).toBe(true);
    expect(sent.devCode).toMatch(/^\d{6}$/);
    const stored = contentBlocksStore.get('otp_login_patron_example_com');
    expect(stored?.is_active).toBe(false);
    expect(stored?.content?.otp).toBeUndefined();

    const verified = await verifyLoginOtpAndSignIn({
      email: 'patron@example.com',
      otp: sent.devCode!,
    });
    expect(verified.success).toBe(true);
    expect(mockGenerateLink).toHaveBeenCalledWith({
      type: 'magiclink',
      email: 'patron@example.com',
    });
    expect(mockVerifyOtp).toHaveBeenCalledWith({
      token_hash: 'hash-tok-123',
      type: 'magiclink',
    });
    expect(contentBlocksStore.get('otp_login_patron_example_com')).toBeUndefined();
  });
});
