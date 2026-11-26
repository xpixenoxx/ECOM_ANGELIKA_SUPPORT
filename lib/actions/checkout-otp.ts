'use server';

/**
 * Seamless Inline Checkout OTP Verification + Automatic Account Creation & Persistent Login
 *
 * - Works on Cloudflare Pages Edge Runtime (Web Crypto HMAC + Web Fetch).
 * - Multi-channel OTP delivery:
 *     1. Mobile SMS / WhatsApp OTP (when TWOFACTOR_API_KEY, FAST2SMS_API_KEY, MSG91_AUTH_KEY,
 *        or WHATSAPP_ACCESS_TOKEN + WHATSAPP_OTP_TEMPLATE_NAME is configured)
 *     2. Email OTP via Resend (RESEND_API_KEY — 3,000/month free tier, instant delivery)
 * - Upon OTP verification:
 *     - New user: auto-creates a verified Supabase account (no password setup screen needed)
 *       and links any past unlinked guest orders under that email.
 *     - Existing user: signs into their existing account automatically (never duplicates accounts)
 *       and updates missing phone/name cleanly.
 *     - Mints a persistent 400-day Supabase session cookie right in Chrome via official
 *       `auth.admin.generateLink({ type: 'magiclink' })` + `auth.verifyOtp({ token_hash })`.
 */

import { hmacSha256Hex, randomInt, timingSafeEqualStrings } from '@/lib/utils/edge-crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { isResendConfigured, sendEmailViaResend } from '@/lib/email/resend';
import { getOptionalEnv } from '@/lib/env';
import { checkRateLimitAsync } from '@/lib/utils/rate-limit';
import { escapeHtml, INDIAN_PHONE_REGEX, normalizeIndianPhone } from '@/lib/validators/commerce';
import type { Json } from '@/types/database';

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

export interface CheckoutOtpStatus {
  emailOtpReady: boolean;
  mobileOtpReady: boolean;
  mobileProvider: '2factor' | 'fast2sms' | 'msg91' | 'whatsapp' | null;
  anyOtpReady: boolean;
}

function detectMobileOtpProvider(): CheckoutOtpStatus['mobileProvider'] {
  if (getOptionalEnv('TWOFACTOR_API_KEY')) return '2factor';
  if (getOptionalEnv('FAST2SMS_API_KEY')) return 'fast2sms';
  if (getOptionalEnv('MSG91_AUTH_KEY') && getOptionalEnv('MSG91_OTP_TEMPLATE_ID')) return 'msg91';
  if (
    getOptionalEnv('WHATSAPP_ACCESS_TOKEN') &&
    getOptionalEnv('WHATSAPP_PHONE_NUMBER_ID') &&
    getOptionalEnv('WHATSAPP_OTP_TEMPLATE_NAME')
  ) {
    return 'whatsapp';
  }
  return null;
}

export async function getCheckoutOtpStatus(): Promise<CheckoutOtpStatus> {
  const emailOtpReady = isResendConfigured();
  const mobileProvider = detectMobileOtpProvider();
  const mobileOtpReady = Boolean(mobileProvider);
  return {
    emailOtpReady,
    mobileOtpReady,
    mobileProvider,
    anyOtpReady: emailOtpReady || mobileOtpReady,
  };
}

function hashCheckoutOtp(identifier: string, otp: string): string {
  const pepper =
    getOptionalEnv('OTP_SECRET') ||
    getOptionalEnv('SUPABASE_SERVICE_ROLE_KEY') ||
    'angelika-dev-checkout-otp-pepper';
  return hmacSha256Hex(pepper, `checkout:${identifier.toLowerCase()}:${otp}`);
}

async function dispatchMobileOtp(
  phone10: string,
  otp: string,
  provider: NonNullable<CheckoutOtpStatus['mobileProvider']>
): Promise<{ success: boolean; error?: string }> {
  try {
    if (provider === '2factor') {
      const apiKey = getOptionalEnv('TWOFACTOR_API_KEY')!;
      const template = getOptionalEnv('TWOFACTOR_OTP_TEMPLATE');
      const url = template
        ? `https://2factor.in/API/V1/${encodeURIComponent(apiKey)}/SMS/+91${phone10}/${otp}/${encodeURIComponent(template)}`
        : `https://2factor.in/API/V1/${encodeURIComponent(apiKey)}/SMS/+91${phone10}/${otp}`;
      const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(12_000) });
      const data: any = await res.json().catch(() => ({}));
      if (res.ok && String(data?.Status || '').toLowerCase() === 'success') {
        return { success: true };
      }
      return { success: false, error: data?.Details || `2Factor SMS error (${res.status})` };
    }

    if (provider === 'fast2sms') {
      const apiKey = getOptionalEnv('FAST2SMS_API_KEY')!;
      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: phone10,
        }),
        signal: AbortSignal.timeout(12_000),
      });
      const data: any = await res.json().catch(() => ({}));
      if (res.ok && data?.return === true) {
        return { success: true };
      }
      return { success: false, error: data?.message || `Fast2SMS error (${res.status})` };
    }

    if (provider === 'msg91') {
      const authKey = getOptionalEnv('MSG91_AUTH_KEY')!;
      const templateId = getOptionalEnv('MSG91_OTP_TEMPLATE_ID')!;
      const res = await fetch('https://control.msg91.com/api/v5/otp', {
        method: 'POST',
        headers: {
          authkey: authKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: templateId,
          mobile: `91${phone10}`,
          otp,
        }),
        signal: AbortSignal.timeout(12_000),
      });
      const data: any = await res.json().catch(() => ({}));
      if (res.ok && data?.type === 'success') {
        return { success: true };
      }
      return { success: false, error: data?.message || `MSG91 error (${res.status})` };
    }

    if (provider === 'whatsapp') {
      const accessToken = getOptionalEnv('WHATSAPP_ACCESS_TOKEN')!;
      const phoneNumberId = getOptionalEnv('WHATSAPP_PHONE_NUMBER_ID')!;
      const templateName = getOptionalEnv('WHATSAPP_OTP_TEMPLATE_NAME')!;
      const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: `91${phone10}`,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en' },
            components: [
              { type: 'body', parameters: [{ type: 'text', text: otp }] },
              { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: otp }] },
            ],
          },
        }),
        signal: AbortSignal.timeout(12_000),
      });
      const data: any = await res.json().catch(() => ({}));
      if (res.ok && data?.messages?.[0]?.id) {
        return { success: true };
      }
      return { success: false, error: data?.error?.message || `WhatsApp OTP error (${res.status})` };
    }

    return { success: false, error: 'Unsupported mobile OTP provider' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Mobile OTP dispatch failed' };
  }
}

export async function sendCheckoutOtp(params: {
  email: string;
  phone: string;
  fullName?: string;
  preferredChannel?: 'mobile' | 'email';
}): Promise<{
  success: boolean;
  channel?: 'mobile' | 'email';
  maskedTarget?: string;
  message: string;
}> {
  try {
    const cleanEmail = (params.email || '').trim().toLowerCase();
    const cleanPhone = normalizeIndianPhone(params.phone || '');
    const cleanName = (params.fullName || '').trim();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, message: 'Please enter a valid email address first.' };
    }
    if (!INDIAN_PHONE_REGEX.test(cleanPhone)) {
      return { success: false, message: 'Please enter a valid 10-digit Indian mobile number first.' };
    }

    const rl = await checkRateLimitAsync(`checkout_otp_send:${cleanEmail}:${cleanPhone}`, 5, 15 * 60 * 1000);
    if (!rl.allowed) {
      return {
        success: false,
        message: 'Too many OTP requests. Please wait a few minutes before requesting another code.',
      };
    }

    const status = await getCheckoutOtpStatus();
    if (!status.anyOtpReady) {
      return {
        success: false,
        message: 'OTP delivery provider is not configured yet. Please sign in with Password/Google or continue checkout.',
      };
    }

    const otp = randomInt(100000, 1000000).toString();
    const otpHash = hashCheckoutOtp(cleanEmail, otp);
    const storageKey = `otp_checkout_${cleanEmail.replace(/[^a-z0-9_]/g, '_')}`;

    await supabaseAdmin.from('content_blocks').upsert(
      {
        key: storageKey,
        type: 'custom',
        title: `Checkout OTP for ${cleanEmail}`,
        content: {
          otpHash,
          email: cleanEmail,
          phone: cleanPhone,
          fullName: cleanName,
          expiresAt: Date.now() + OTP_TTL_MS,
          attempts: 0,
        } as unknown as Json,
        settings: { kind: 'checkout_instant_otp' } as unknown as Json,
        is_active: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );

    const tryMobileFirst =
      status.mobileOtpReady &&
      status.mobileProvider &&
      (params.preferredChannel === 'mobile' || !status.emailOtpReady);

    if (tryMobileFirst && status.mobileProvider) {
      const mobileRes = await dispatchMobileOtp(cleanPhone, otp, status.mobileProvider);
      if (mobileRes.success) {
        return {
          success: true,
          channel: 'mobile',
          maskedTarget: `+91 ••••••${cleanPhone.slice(-4)}`,
          message: `6-digit verification code sent to +91 ••••••${cleanPhone.slice(-4)}.`,
        };
      }
      console.warn('[sendCheckoutOtp] Mobile OTP failed, falling back to email if available:', mobileRes.error);
    }

    if (status.emailOtpReady) {
      const emailRes = await sendEmailViaResend({
        to: cleanEmail,
        subject: `${otp} is your Angelika Fashions checkout verification code`,
        html: `<div style="font-family:Georgia,serif;max-width:520px;margin:24px auto;background:#fff;border:1px solid #E5DDD0;border-radius:14px;overflow:hidden;">
          <div style="background:#1A1A1A;padding:24px;text-align:center;border-bottom:3px solid #C9A84C;">
            <p style="margin:0;color:#C9A84C;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;">Instant Checkout Verification</p>
            <h1 style="margin:6px 0 0;color:#fff;font-size:22px;font-weight:500;">ANGELIKA FASHIONS</h1>
          </div>
          <div style="padding:28px;text-align:center;">
            <p style="font-family:sans-serif;font-size:14px;color:#444;">Namaste ${escapeHtml(cleanName || 'Valued Patron')}, enter this code on checkout to confirm your order and automatically save your account:</p>
            <div style="margin:20px auto;padding:18px;max-width:260px;background:#FAF6EE;border:2px dashed #C9A84C;border-radius:12px;font-family:monospace;font-size:32px;font-weight:700;letter-spacing:8px;color:#1A1A1A;">${otp}</div>
            <p style="font-family:sans-serif;font-size:12px;color:#78716C;">Valid for 10 minutes. Never share this code with anyone.</p>
          </div>
        </div>`,
        text: `Your Angelika Fashions checkout verification code is ${otp}. Valid for 10 minutes.`,
      });

      if (emailRes.success) {
        return {
          success: true,
          channel: 'email',
          maskedTarget: cleanEmail,
          message: `6-digit verification code sent to ${cleanEmail}.`,
        };
      }
    }

    await supabaseAdmin.from('content_blocks').delete().eq('key', storageKey);
    return {
      success: false,
      message: 'Could not send verification code right now. Please try again or sign in with password.',
    };
  } catch (err: any) {
    console.error('[sendCheckoutOtp] error:', err);
    return { success: false, message: 'Failed to send verification code.' };
  }
}

export async function verifyCheckoutOtpAndSignIn(params: {
  email: string;
  phone: string;
  otp: string;
  fullName?: string;
}): Promise<{
  success: boolean;
  isNewAccount?: boolean;
  email?: string;
  message: string;
}> {
  try {
    const cleanEmail = (params.email || '').trim().toLowerCase();
    const cleanPhone = normalizeIndianPhone(params.phone || '');
    const cleanOtp = (params.otp || '').replace(/\D/g, '').trim();
    const cleanName = (params.fullName || '').trim();

    if (!cleanEmail || !/^\d{6}$/.test(cleanOtp)) {
      return { success: false, message: 'Please enter the 6-digit verification code.' };
    }

    const rl = await checkRateLimitAsync(`checkout_otp_verify:${cleanEmail}`, 10, 15 * 60 * 1000);
    if (!rl.allowed) {
      return { success: false, message: 'Too many verification attempts. Please try again later.' };
    }

    const storageKey = `otp_checkout_${cleanEmail.replace(/[^a-z0-9_]/g, '_')}`;
    const { data: record } = await supabaseAdmin
      .from('content_blocks')
      .select('id, content')
      .eq('key', storageKey)
      .maybeSingle();

    if (!record) {
      return { success: false, message: 'Verification code expired or not found. Please request a new code.' };
    }

    const content = (
      record.content && typeof record.content === 'object' && !Array.isArray(record.content)
        ? record.content
        : {}
    ) as Record<string, any>;

    if (Date.now() > Number(content['expiresAt'] || 0)) {
      await supabaseAdmin.from('content_blocks').delete().eq('id', record.id);
      return { success: false, message: 'Verification code expired. Please request a new code.' };
    }

    const attempts = Number(content['attempts'] || 0);
    if (attempts >= MAX_OTP_ATTEMPTS) {
      await supabaseAdmin.from('content_blocks').delete().eq('id', record.id);
      return { success: false, message: 'Too many wrong attempts. Please request a new code.' };
    }

    const expectedHash = String(content['otpHash'] || '');
    const actualHash = hashCheckoutOtp(cleanEmail, cleanOtp);
    if (!expectedHash || !timingSafeEqualStrings(expectedHash, actualHash)) {
      const nextAttempts = attempts + 1;
      if (nextAttempts >= MAX_OTP_ATTEMPTS) {
        await supabaseAdmin.from('content_blocks').delete().eq('id', record.id);
      } else {
        await supabaseAdmin
          .from('content_blocks')
          .update({ content: { ...content, attempts: nextAttempts } as unknown as Json })
          .eq('id', record.id);
      }
      return { success: false, message: 'Incorrect verification code. Please check and try again.' };
    }

    // Consume OTP immediately (strict one-time use)
    await supabaseAdmin.from('content_blocks').delete().eq('id', record.id);

    // Resolve or auto-create customer account cleanly
    const resolvedName = cleanName || String(content['fullName'] || '').trim();
    const resolvedPhone = INDIAN_PHONE_REGEX.test(cleanPhone)
      ? cleanPhone
      : String(content['phone'] || '').trim();

    let isNewAccount = false;
    let userId: string | null = null;

    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (existingProfile?.id) {
      userId = existingProfile.id;
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (!existingProfile.phone && resolvedPhone) patch['phone'] = resolvedPhone;
      if (!existingProfile.full_name && resolvedName) patch['full_name'] = resolvedName;
      if (Object.keys(patch).length > 1) {
        await supabaseAdmin.from('profiles').update(patch).eq('id', userId);
      }
    } else {
      // Auto-create confirmed Supabase Auth user with high-entropy internal password (zero friction!)
      const randomPassword = `Af!${hmacSha256Hex(
        `${Date.now()}:${randomInt(100000, 999999)}`,
        cleanEmail
      ).slice(0, 24)}9z`;

      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: randomPassword,
        email_confirm: true,
        user_metadata: {
          full_name: resolvedName || undefined,
          phone: resolvedPhone || undefined,
          role: 'customer',
          created_via: 'checkout_otp',
        },
      });

      if (createErr) {
        // Account might exist in auth.users even if profiles row was absent
        if (!createErr.message.toLowerCase().includes('already')) {
          return { success: false, message: createErr.message || 'Could not initialize your account.' };
        }
      } else if (created?.user?.id) {
        isNewAccount = true;
        userId = created.user.id;
      }
    }

    // Mint a persistent Supabase Auth session cookie directly into Chrome via server-side magiclink verification
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: cleanEmail,
    });

    const tokenHash = linkData?.properties?.hashed_token;
    if (linkErr || !tokenHash) {
      console.error('[verifyCheckoutOtpAndSignIn] generateLink failed:', linkErr?.message);
      return {
        success: false,
        message: 'OTP verified, but session sign-in could not complete. Please sign in with your password.',
      };
    }

    const serverSupabase = createServerClient();
    const { data: verifiedSession, error: verifyErr } = await serverSupabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'magiclink',
    });

    if (verifyErr || !verifiedSession?.user) {
      console.error('[verifyCheckoutOtpAndSignIn] verifyOtp session mint failed:', verifyErr?.message);
      return {
        success: false,
        message: 'OTP verified, but persistent session could not be established. Please try again.',
      };
    }

    const finalUserId = verifiedSession.user.id || userId;
    if (finalUserId) {
      await supabaseAdmin.from('profiles').upsert({
        id: finalUserId,
        email: cleanEmail,
        ...(resolvedName ? { full_name: resolvedName } : {}),
        ...(resolvedPhone ? { phone: resolvedPhone } : {}),
        role: 'customer',
      });

      // Unify any past unlinked guest orders placed with this email into My Orders
      await supabaseAdmin
        .from('orders')
        .update({ user_id: finalUserId })
        .is('user_id', null)
        .ilike('email', cleanEmail);
    }

    return {
      success: true,
      isNewAccount,
      email: cleanEmail,
      message: isNewAccount
        ? 'Verified! Your Angelika Fashions account is ready and stays signed in.'
        : 'Welcome back! Signed in cleanly with your saved details & order history.',
    };
  } catch (err: any) {
    console.error('[verifyCheckoutOtpAndSignIn] error:', err);
    return { success: false, message: 'Verification failed. Please try again.' };
  }
}
