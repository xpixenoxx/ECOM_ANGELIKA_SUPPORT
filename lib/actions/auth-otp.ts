'use server';

import crypto from 'crypto';
import { supabaseAdmin, adminCreateUser } from '@/lib/supabase/admin';
import { sendEmailViaResend, isResendConfigured } from '@/lib/email/resend';
import { getOptionalEnv } from '@/lib/env';
import { checkRateLimit } from '@/lib/utils/rate-limit';
import { escapeHtml } from '@/lib/validators/commerce';
import type { Json } from '@/types/database';

const MAX_OTP_ATTEMPTS = 5;
const OTP_TTL_MS = 10 * 60 * 1000;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_SEND_REQUESTS_PER_WINDOW = 5;
const MAX_VERIFY_ATTEMPTS_PER_WINDOW = 10;

function isProductionEnv(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env['VERCEL_ENV'] === 'production' ||
    process.env['CF_PAGES'] === '1'
  );
}

function hashOtp(email: string, otp: string): string {
  const pepper =
    getOptionalEnv('OTP_SECRET') ||
    getOptionalEnv('SUPABASE_SERVICE_ROLE_KEY') ||
    'angelika-dev-otp-pepper';
  return crypto
    .createHmac('sha256', pepper)
    .update(`${email.toLowerCase()}:${otp}`)
    .digest('hex');
}

function timingSafeHexEqual(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Generate luxury branded HTML email for OTP codes
 */
function generateOtpEmailHtml(params: {
  title: string;
  greetingName?: string;
  description: string;
  otp: string;
  actionNote: string;
}): string {
  const { title, greetingName, description, otp, actionNote } = params;
  const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] || 'http://localhost:3000';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FBF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #111111;">
  <div style="max-width: 560px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #EAE3D9; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
    <!-- Header banner -->
    <div style="background: linear-gradient(135deg, #1C1917 0%, #2A2421 100%); padding: 32px 24px; text-align: center; border-bottom: 3px solid #C9A84C;">
      <p style="margin: 0 0 6px 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #C9A84C; font-weight: 600;">Angelika Atelier &bull; Security</p>
      <h1 style="margin: 0; font-size: 24px; font-weight: 500; color: #FFFFFF; letter-spacing: 1.5px; font-family: Georgia, serif;">ANGELIKA FASHIONS</h1>
      <p style="margin: 6px 0 0 0; font-size: 12px; color: #A8A29E; letter-spacing: 1px; text-transform: uppercase;">Haute Couture &amp; Heritage Silks</p>
    </div>

    <!-- Body content -->
    <div style="padding: 36px 32px; text-align: center;">
      <div style="display: inline-block; background-color: #FDF8ED; border: 1px solid #F3E4B8; color: #9A7718; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px; padding: 4px 14px; border-radius: 20px; margin-bottom: 20px;">
        Security Verification
      </div>

      <h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 600; color: #111111; font-family: Georgia, serif;">
        ${escapeHtml(title)}
      </h2>

      <p style="margin: 0 0 8px 0; font-size: 15px; color: #374151; font-weight: 500;">
        Namaste ${escapeHtml(greetingName || 'Valued Client')},
      </p>

      <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.6; color: #6B7280; max-width: 440px; margin-left: auto; margin-right: auto;">
        ${escapeHtml(description)}
      </p>

      <!-- 6-digit OTP Code Box -->
      <div style="background: linear-gradient(135deg, #FBF8F5 0%, #F5ECE0 100%); border: 2px dashed #C9A84C; border-radius: 14px; padding: 22px 16px; margin: 0 auto 28px auto; max-width: 320px;">
        <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8C6D23; font-weight: 600;">Your 6-Digit Code</p>
        <div style="font-size: 34px; font-weight: 700; letter-spacing: 8px; color: #1C1917; font-family: 'Courier New', Courier, monospace;">
          ${escapeHtml(otp)}
        </div>
      </div>

      <p style="margin: 0 0 24px 0; font-size: 12px; color: #9CA3AF; line-height: 1.5;">
        ${escapeHtml(actionNote)}
      </p>

      <div style="padding-top: 20px; border-top: 1px solid #F3EEE8; font-size: 13px; color: #6B7280;">
        <p style="margin: 0; font-weight: 500; color: #111111;">With warm regards,</p>
        <p style="margin: 4px 0 0 0; font-style: italic; font-family: Georgia, serif; font-size: 15px; color: #C9A84C;">Vidhya</p>
        <p style="margin: 2px 0 0 0; font-size: 12px; color: #9CA3AF;">Founder & Master Artisan &bull; Angelika Fashions</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #F9F7F4; padding: 20px 24px; border-top: 1px solid #EAE3D9; text-align: center; font-size: 11px; color: #9CA3AF; line-height: 1.5;">
      <p style="margin: 0 0 4px 0;">
        This automated verification security dispatch was sent to you from <a href="${escapeHtml(siteUrl)}" style="color: #C9A84C; text-decoration: none;">angelikafashions.com</a>.
      </p>
      <p style="margin: 0;">
        &copy; ${new Date().getFullYear()} Angelika Fashions. All rights reserved. Handcrafted in India.
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * 1. Action: Generate and send Signup OTP to user email
 */
export async function sendSignupOtp(
  email: string,
  fullName: string
): Promise<{ success: boolean; message: string; devCode?: string; emailConfigured: boolean }> {
  try {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (fullName || '').trim();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, message: 'Please provide a valid email address.', emailConfigured: false };
    }

    const rate = checkRateLimit(
      `otp_send_signup:${cleanEmail}`,
      MAX_SEND_REQUESTS_PER_WINDOW,
      RATE_WINDOW_MS
    );
    if (!rate.allowed) {
      return {
        success: false,
        message: `Too many verification code requests. Please try again in ${Math.ceil(rate.retryAfterSeconds / 60)} minutes.`,
        emailConfigured: isResendConfigured(),
      };
    }

    // Check if user already exists in profiles
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingProfile) {
      return {
        success: false,
        message: 'An account with this email address already exists. Please sign in instead.',
        emailConfigured: isResendConfigured(),
      };
    }

    // Cryptographically secure 6-digit OTP; store only salted SHA-256 hash in inactive content block
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashOtp(cleanEmail, otp);
    const key = `otp_signup_${cleanEmail.replace(/[^a-z0-9_]/g, '_')}`;
    const expiresAt = Date.now() + OTP_TTL_MS;

    const payload = {
      otpHash,
      email: cleanEmail,
      fullName: cleanName,
      type: 'signup',
      expiresAt,
      attempts: 0,
    };

    await supabaseAdmin
      .from('content_blocks')
      .upsert(
        {
          key,
          type: 'custom',
          title: `Signup OTP for ${cleanEmail}`,
          content: payload as unknown as Json,
          settings: { kind: 'auth_otp_signup' } as unknown as Json,
          is_active: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    const emailHtml = generateOtpEmailHtml({
      title: 'Verify Your Email Address',
      greetingName: cleanName,
      description:
        'Please enter the 6-digit verification code below on the registration screen to complete your account setup and join the Angelika Circle.',
      otp,
      actionNote: 'This verification code is valid for 10 minutes. If you did not initiate this registration, please safely ignore this message.',
    });

    const resendResult = await sendEmailViaResend({
      to: cleanEmail,
      subject: `Your Angelika Fashions Verification Code: ${otp}`,
      html: emailHtml,
      text: `Namaste ${cleanName},\n\nYour Angelika Fashions account verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
    });

    if (resendResult.success) {
      return {
        success: true,
        message: `We have sent a 6-digit verification code to ${cleanEmail}.`,
        emailConfigured: true,
      };
    }

    console.warn(`[sendSignupOtp] Resend delivery unfulfilled for ${cleanEmail}:`, resendResult.error);

    if (isProductionEnv()) {
      await supabaseAdmin.from('content_blocks').delete().eq('key', key);
      return {
        success: false,
        message: 'Email delivery service is currently unavailable. Please try again later.',
        emailConfigured: false,
      };
    }

    return {
      success: true,
      message: resendResult.error
        ? `Notice: ${resendResult.error}`
        : `Verification code generated (local dev mode).`,
      devCode: otp,
      emailConfigured: false,
    };
  } catch (err: any) {
    console.error('sendSignupOtp error:', err);
    return {
      success: false,
      message: 'Failed to dispatch verification code.',
      emailConfigured: false,
    };
  }
}

/**
 * 2. Action: Verify Signup OTP and create user account
 */
export async function verifySignupOtp(data: {
  email: string;
  otp: string;
  password: string;
  fullName: string;
}): Promise<{ success: boolean; message: string; user?: any }> {
  try {
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const cleanOtp = (data.otp || '').trim();
    const cleanPassword = data.password || '';
    const cleanName = (data.fullName || '').trim();

    if (!cleanEmail || !cleanOtp || !cleanPassword) {
      return { success: false, message: 'All fields are required.' };
    }

    if (cleanPassword.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long.' };
    }

    const rate = checkRateLimit(
      `otp_verify_signup:${cleanEmail}`,
      MAX_VERIFY_ATTEMPTS_PER_WINDOW,
      RATE_WINDOW_MS
    );
    if (!rate.allowed) {
      return { success: false, message: 'Too many verification attempts. Please try again later.' };
    }

    const key = `otp_signup_${cleanEmail.replace(/[^a-z0-9_]/g, '_')}`;

    const { data: record, error: fetchErr } = await supabaseAdmin
      .from('content_blocks')
      .select('id, content')
      .eq('key', key)
      .maybeSingle();

    if (fetchErr || !record) {
      return { success: false, message: 'No active verification code found. Please request a new code.' };
    }

    const content = (
      record.content && typeof record.content === 'object' && !Array.isArray(record.content)
        ? record.content
        : {}
    ) as Record<string, any>;

    // Check expiry
    if (Date.now() > Number(content['expiresAt'] || 0)) {
      await supabaseAdmin.from('content_blocks').delete().eq('id', record.id);
      return { success: false, message: 'Verification code has expired. Please request a new code.' };
    }

    const currentAttempts = Number(content['attempts'] || 0);
    if (currentAttempts >= MAX_OTP_ATTEMPTS) {
      await supabaseAdmin.from('content_blocks').delete().eq('id', record.id);
      return { success: false, message: 'Maximum verification attempts exceeded. Please request a new code.' };
    }

    const storedHash = String(content['otpHash'] || '');
    const submittedHash = hashOtp(cleanEmail, cleanOtp);
    if (!timingSafeHexEqual(storedHash, submittedHash)) {
      const nextAttempts = currentAttempts + 1;
      if (nextAttempts >= MAX_OTP_ATTEMPTS) {
        await supabaseAdmin.from('content_blocks').delete().eq('id', record.id);
        return { success: false, message: 'Maximum verification attempts exceeded. Please request a new code.' };
      }
      await supabaseAdmin
        .from('content_blocks')
        .update({ content: { ...content, attempts: nextAttempts } as unknown as Json })
        .eq('id', record.id);
      return { success: false, message: 'Incorrect verification code. Please check your email and try again.' };
    }

    const newUser = await adminCreateUser(cleanEmail, cleanPassword, {
      full_name: cleanName,
    });

    await supabaseAdmin.from('content_blocks').delete().eq('id', record.id);

    return {
      success: true,
      message: 'Account verified and created successfully! You can now sign in.',
      user: newUser,
    };
  } catch (err: any) {
    console.error('verifySignupOtp error:', err);
    return {
      success: false,
      message: err?.message || 'Failed to verify account. Please try again.',
    };
  }
}

/**
 * 3. Action: Generate and send Password Reset OTP
 */
export async function sendPasswordResetOtp(
  email: string
): Promise<{ success: boolean; message: string; devCode?: string; emailConfigured: boolean }> {
  try {
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, message: 'Please provide a valid email address.', emailConfigured: false };
    }

    const rate = checkRateLimit(
      `otp_send_reset:${cleanEmail}`,
      MAX_SEND_REQUESTS_PER_WINDOW,
      RATE_WINDOW_MS
    );
    if (!rate.allowed) {
      return {
        success: false,
        message: `Too many reset requests. Please try again in ${Math.ceil(rate.retryAfterSeconds / 60)} minutes.`,
        emailConfigured: isResendConfigured(),
      };
    }

    // Direct indexed lookup via profiles (never scan all auth users with listUsers)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (!profile) {
      // Uniform generic response in production avoids account enumeration while non-prod tests work cleanly
      if (isProductionEnv()) {
        return {
          success: true,
          message: `If an account exists for ${cleanEmail}, a password reset code has been dispatched.`,
          emailConfigured: isResendConfigured(),
        };
      }
      return {
        success: false,
        message: 'No registered account was found with this email address.',
        emailConfigured: isResendConfigured(),
      };
    }

    const userName = profile.full_name || 'Client';
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashOtp(cleanEmail, otp);
    const key = `otp_reset_${cleanEmail.replace(/[^a-z0-9_]/g, '_')}`;
    const expiresAt = Date.now() + OTP_TTL_MS;

    const payload = {
      otpHash,
      email: cleanEmail,
      userId: profile.id,
      type: 'password_reset',
      expiresAt,
      attempts: 0,
    };

    await supabaseAdmin
      .from('content_blocks')
      .upsert(
        {
          key,
          type: 'custom',
          title: `Password Reset OTP for ${cleanEmail}`,
          content: payload as unknown as Json,
          settings: { kind: 'auth_otp_reset' } as unknown as Json,
          is_active: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    const emailHtml = generateOtpEmailHtml({
      title: 'Reset Your Account Password',
      greetingName: userName,
      description:
        'We received a request to reset your password. Use the 6-digit verification code below to set a new password for your Angelika Fashions account.',
      otp,
      actionNote: 'This reset code is valid for 10 minutes. If you did not make this request, your account is safe and no action is required.',
    });

    const resendResult = await sendEmailViaResend({
      to: cleanEmail,
      subject: `Your Angelika Fashions Password Reset Code: ${otp}`,
      html: emailHtml,
      text: `Namaste ${userName},\n\nYour password reset code is: ${otp}\n\nEnter this code to set your new password. Valid for 10 minutes.`,
    });

    if (resendResult.success) {
      return {
        success: true,
        message: `We have dispatched a 6-digit password reset code to ${cleanEmail}.`,
        emailConfigured: true,
      };
    }

    console.warn(`[sendPasswordResetOtp] Resend delivery unfulfilled for ${cleanEmail}:`, resendResult.error);

    if (isProductionEnv()) {
      await supabaseAdmin.from('content_blocks').delete().eq('key', key);
      return {
        success: false,
        message: 'Email delivery service is currently unavailable. Please try again later.',
        emailConfigured: false,
      };
    }

    return {
      success: true,
      message: resendResult.error
        ? `Notice: ${resendResult.error}`
        : `Reset code generated (local dev mode).`,
      devCode: otp,
      emailConfigured: false,
    };
  } catch (err: any) {
    console.error('sendPasswordResetOtp error:', err);
    return {
      success: false,
      message: 'Failed to dispatch password reset code.',
      emailConfigured: false,
    };
  }
}

/**
 * 4. Action: Verify Password Reset OTP and update user password
 */
export async function verifyPasswordResetOtp(data: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const cleanOtp = (data.otp || '').trim();
    const newPassword = data.newPassword || '';

    if (!cleanEmail || !cleanOtp || !newPassword) {
      return { success: false, message: 'All fields are required.' };
    }

    if (newPassword.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long.' };
    }

    const rate = checkRateLimit(
      `otp_verify_reset:${cleanEmail}`,
      MAX_VERIFY_ATTEMPTS_PER_WINDOW,
      RATE_WINDOW_MS
    );
    if (!rate.allowed) {
      return { success: false, message: 'Too many reset attempts. Please try again later.' };
    }

    const key = `otp_reset_${cleanEmail.replace(/[^a-z0-9_]/g, '_')}`;

    const { data: record, error: fetchErr } = await supabaseAdmin
      .from('content_blocks')
      .select('id, content')
      .eq('key', key)
      .maybeSingle();

    if (fetchErr || !record) {
      return { success: false, message: 'No active password reset request found. Please request a new code.' };
    }

    const content = (
      record.content && typeof record.content === 'object' && !Array.isArray(record.content)
        ? record.content
        : {}
    ) as Record<string, any>;

    if (Date.now() > Number(content['expiresAt'] || 0)) {
      await supabaseAdmin.from('content_blocks').delete().eq('id', record.id);
      return { success: false, message: 'Reset code has expired. Please request a new code.' };
    }

    const currentAttempts = Number(content['attempts'] || 0);
    if (currentAttempts >= MAX_OTP_ATTEMPTS) {
      await supabaseAdmin.from('content_blocks').delete().eq('id', record.id);
      return { success: false, message: 'Maximum reset attempts exceeded. Please request a new code.' };
    }

    const storedHash = String(content['otpHash'] || '');
    const submittedHash = hashOtp(cleanEmail, cleanOtp);
    if (!timingSafeHexEqual(storedHash, submittedHash)) {
      const nextAttempts = currentAttempts + 1;
      if (nextAttempts >= MAX_OTP_ATTEMPTS) {
        await supabaseAdmin.from('content_blocks').delete().eq('id', record.id);
        return { success: false, message: 'Maximum reset attempts exceeded. Please request a new code.' };
      }
      await supabaseAdmin
        .from('content_blocks')
        .update({ content: { ...content, attempts: nextAttempts } as unknown as Json })
        .eq('id', record.id);
      return { success: false, message: 'Incorrect reset code. Please check your email and try again.' };
    }

    let userId = content['userId'] as string | undefined;
    if (!userId) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (!profile) {
        return { success: false, message: 'User account not found.' };
      }
      userId = profile.id;
    }

    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (updateErr) {
      console.error('updateUserById error:', updateErr);
      return { success: false, message: updateErr.message };
    }

    await supabaseAdmin.from('content_blocks').delete().eq('id', record.id);

    return {
      success: true,
      message: 'Your password has been successfully updated! You can now sign in with your new password.',
    };
  } catch (err: any) {
    console.error('verifyPasswordResetOtp error:', err);
    return {
      success: false,
      message: 'Failed to reset password. Please try again.',
    };
  }
}
