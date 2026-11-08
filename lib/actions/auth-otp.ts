'use server';

import { supabaseAdmin, adminCreateUser } from '@/lib/supabase/admin';
import { sendEmailViaResend, isResendConfigured } from '@/lib/email/resend';

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
        This automated verification security dispatch was sent to you from <a href="${siteUrl}" style="color: #C9A84C; text-decoration: none;">angelikafashions.com</a>.
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
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please provide a valid email address.', emailConfigured: false };
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

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `otp_signup_${cleanEmail.replace(/[^a-z0-9_]/g, '_')}`;
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const payload = {
      otp,
      email: cleanEmail,
      fullName: cleanName,
      type: 'signup',
      expiresAt,
      attempts: 0,
    };

    // Store in content_blocks
    await supabaseAdmin
      .from('content_blocks')
      .upsert(
        {
          key,
          type: 'custom',
          title: `Signup OTP for ${cleanEmail}`,
          content: payload,
          settings: { kind: 'auth_otp_signup' },
          is_active: true,
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

    const emailConfigured = isResendConfigured();

    return {
      success: true,
      message: emailConfigured
        ? `We have sent a 6-digit verification code to ${cleanEmail}.`
        : `Verification code generated! (Dev mode active: ${otp})`,
      devCode: emailConfigured ? undefined : otp,
      emailConfigured,
    };
  } catch (err: any) {
    console.error('sendSignupOtp error:', err);
    return {
      success: false,
      message: err?.message || 'Failed to dispatch verification code.',
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
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanOtp = data.otp.trim();
    const cleanPassword = data.password;
    const cleanName = data.fullName.trim();

    if (!cleanEmail || !cleanOtp || !cleanPassword) {
      return { success: false, message: 'All fields are required.' };
    }

    const key = `otp_signup_${cleanEmail.replace(/[^a-z0-9_]/g, '_')}`;

    const { data: record, error: fetchErr } = await supabaseAdmin
      .from('content_blocks')
      .select('id, content')
      .eq('key', key)
      .single();

    if (fetchErr || !record) {
      return { success: false, message: 'No active verification code found. Please request a new code.' };
    }

    const content = (record.content as Record<string, any>) || {};

    // Check expiry
    if (Date.now() > (content['expiresAt'] || 0)) {
      return { success: false, message: 'Verification code has expired. Please click Resend Code.' };
    }

    // Check code match
    if (content['otp'] !== cleanOtp) {
      // Increment attempt counter
      content['attempts'] = (content['attempts'] || 0) + 1;
      await supabaseAdmin.from('content_blocks').update({ content }).eq('id', record.id);
      return { success: false, message: 'Incorrect verification code. Please check your email and try again.' };
    }

    // Code is valid! Create real Supabase user
    const newUser = await adminCreateUser(cleanEmail, cleanPassword, {
      full_name: cleanName,
    });

    // Clean up OTP record
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
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please provide a valid email address.', emailConfigured: false };
    }

    // Verify user exists in auth
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = listData?.users.find((u) => u.email?.toLowerCase() === cleanEmail);

    if (!existingUser) {
      return {
        success: false,
        message: 'No registered account was found with this email address.',
        emailConfigured: isResendConfigured(),
      };
    }

    const userName = (existingUser.user_metadata as any)?.full_name || 'Client';

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `otp_reset_${cleanEmail.replace(/[^a-z0-9_]/g, '_')}`;
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const payload = {
      otp,
      email: cleanEmail,
      userId: existingUser.id,
      type: 'password_reset',
      expiresAt,
      attempts: 0,
    };

    // Store in content_blocks
    await supabaseAdmin
      .from('content_blocks')
      .upsert(
        {
          key,
          type: 'custom',
          title: `Password Reset OTP for ${cleanEmail}`,
          content: payload,
          settings: { kind: 'auth_otp_reset' },
          is_active: true,
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

    await sendEmailViaResend({
      to: cleanEmail,
      subject: `Your Angelika Fashions Password Reset Code: ${otp}`,
      html: emailHtml,
      text: `Namaste ${userName},\n\nYour password reset code is: ${otp}\n\nEnter this code to set your new password. Valid for 10 minutes.`,
    });

    const emailConfigured = isResendConfigured();

    return {
      success: true,
      message: emailConfigured
        ? `We have dispatched a 6-digit password reset code to ${cleanEmail}.`
        : `Reset code generated! (Dev mode active: ${otp})`,
      devCode: emailConfigured ? undefined : otp,
      emailConfigured,
    };
  } catch (err: any) {
    console.error('sendPasswordResetOtp error:', err);
    return {
      success: false,
      message: err?.message || 'Failed to dispatch password reset code.',
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
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanOtp = data.otp.trim();
    const newPassword = data.newPassword;

    if (!cleanEmail || !cleanOtp || !newPassword) {
      return { success: false, message: 'All fields are required.' };
    }

    if (newPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    const key = `otp_reset_${cleanEmail.replace(/[^a-z0-9_]/g, '_')}`;

    const { data: record, error: fetchErr } = await supabaseAdmin
      .from('content_blocks')
      .select('id, content')
      .eq('key', key)
      .single();

    if (fetchErr || !record) {
      return { success: false, message: 'No active password reset request found. Please request a new code.' };
    }

    const content = (record.content as Record<string, any>) || {};

    // Check expiry
    if (Date.now() > (content['expiresAt'] || 0)) {
      return { success: false, message: 'Reset code has expired. Please request a new code.' };
    }

    // Check code match
    if (content['otp'] !== cleanOtp) {
      content['attempts'] = (content['attempts'] || 0) + 1;
      await supabaseAdmin.from('content_blocks').update({ content }).eq('id', record.id);
      return { success: false, message: 'Incorrect reset code. Please check your email and try again.' };
    }

    // Find the user ID
    let userId = content['userId'];
    if (!userId) {
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      const user = listData?.users.find((u) => u.email?.toLowerCase() === cleanEmail);
      if (!user) {
        return { success: false, message: 'User account not found.' };
      }
      userId = user.id;
    }

    // Update the password in Supabase Auth
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (updateErr) {
      console.error('updateUserById error:', updateErr);
      return { success: false, message: updateErr.message };
    }

    // Clean up OTP record
    await supabaseAdmin.from('content_blocks').delete().eq('id', record.id);

    return {
      success: true,
      message: 'Your password has been successfully updated! You can now sign in with your new password.',
    };
  } catch (err: any) {
    console.error('verifyPasswordResetOtp error:', err);
    return {
      success: false,
      message: err?.message || 'Failed to reset password. Please try again.',
    };
  }
}

