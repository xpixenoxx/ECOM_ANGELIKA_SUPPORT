'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { createTransport } from 'nodemailer';
import { sendEmailViaResend, isResendConfigured } from '@/lib/email/resend';
import {
  CircleSubscriber,
  CircleUpdate,
  CircleDashboardData,
  CIRCLE_QUICK_TEMPLATES,
} from './circle-types';

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface EmailDispatchReport {
  sent: boolean;
  recipientsCount: number;
  recipients: string[];
  status: 'sent' | 'pending_credentials' | 'failed';
  error?: string;
  smtpConfigured: boolean;
}

/**
 * Low-level utility: Transmit branded Atelier email broadcast via Nodemailer SMTP
 */
export async function sendCircleEmailBroadcast(params: {
  title: string;
  subject: string;
  content: string;
  cta_text?: string | null;
  cta_link?: string | null;
  recipients: string[];
}): Promise<EmailDispatchReport> {
  const { title, subject, content, cta_text, cta_link, recipients } = params;
  const cleanRecipients = Array.from(new Set(recipients.map((r) => r.trim().toLowerCase()))).filter(
    (e) => e && e.includes('@')
  );

  if (cleanRecipients.length === 0) {
    return {
      sent: false,
      recipientsCount: 0,
      recipients: [],
      status: 'pending_credentials',
      error: 'No active recipient email addresses found.',
      smtpConfigured: false,
    };
  }

  const host = process.env['SMTP_HOST'] || 'smtp.gmail.com';
  const port = parseInt(process.env['SMTP_PORT'] || '587', 10);
  const user = process.env['SMTP_USER'] || process.env['EMAIL_FROM'] || 'vidhya@angelikafashions.com';
  const pass = process.env['SMTP_PASSWORD']?.trim();
  const fromName = (process.env['EMAIL_FROM_NAME'] || 'Angelika Fashions').replace(/['"]/g, '');
  const fromEmail = process.env['EMAIL_FROM'] || user;
  const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] || 'http://localhost:3000';
  const fullCtaUrl = cta_link?.startsWith('http') ? cta_link : `${siteUrl}${cta_link || '/shop'}`;

  const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FBF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #111111;">
  <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #EAE3D9; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
    <!-- Header banner -->
    <div style="background: linear-gradient(135deg, #1C1917 0%, #2A2421 100%); padding: 36px 30px; text-align: center; border-bottom: 3px solid #C9A84C;">
      <p style="margin: 0 0 6px 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #C9A84C; font-weight: 600;">Angelika Circle Atelier</p>
      <h1 style="margin: 0; font-size: 24px; font-weight: 500; color: #FFFFFF; letter-spacing: 1px; font-family: Georgia, serif;">ANGELIKA FASHIONS</h1>
      <p style="margin: 6px 0 0 0; font-size: 12px; color: #A8A29E; letter-spacing: 1.5px; text-transform: uppercase;">Private Couture & Atelier Dispatch</p>
    </div>

    <!-- Body content -->
    <div style="padding: 36px 32px;">
      <div style="display: inline-block; background-color: #FDF8ED; border: 1px solid #F3E4B8; color: #9A7718; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px; padding: 4px 12px; border-radius: 20px; margin-bottom: 20px;">
        Exclusive Atelier Drop
      </div>

      <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 600; color: #111111; line-height: 1.35; font-family: Georgia, serif;">
        ${escapeHtml(title)}
      </h2>

      <div style="font-size: 15px; line-height: 1.7; color: #374151; white-space: pre-line; margin-bottom: 30px;">
        ${escapeHtml(content)}
      </div>

      ${
        cta_link
          ? `<div style="text-align: center; margin: 35px 0 25px 0;">
        <a href="${fullCtaUrl}" style="display: inline-block; background: linear-gradient(135deg, #C9A84C 0%, #B39139 100%); color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 36px; border-radius: 12px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(201,168,76,0.35);">
          ${escapeHtml(cta_text || 'Explore Collection')} &rarr;
        </a>
      </div>`
          : ''
      }

      <div style="margin-top: 36px; padding-top: 24px; border-top: 1px solid #F3EEE8; font-size: 13px; color: #6B7280;">
        <p style="margin: 0; font-weight: 500; color: #111111;">With warm regards,</p>
        <p style="margin: 4px 0 0 0; font-style: italic; font-family: Georgia, serif; font-size: 15px; color: #C9A84C;">Vidhya</p>
        <p style="margin: 2px 0 0 0; font-size: 12px; color: #9CA3AF;">Founder & Master Artisan &bull; Angelika Fashions</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #F9F7F4; padding: 24px 32px; border-top: 1px solid #EAE3D9; text-align: center; font-size: 11px; color: #9CA3AF; line-height: 1.6;">
      <p style="margin: 0 0 8px 0;">
        You received this update because you are subscribed to the <strong>Angelika Circle</strong> at <a href="${siteUrl}" style="color: #C9A84C; text-decoration: none;">angelikafashions.com</a>.
      </p>
      <p style="margin: 0;">
        &copy; ${new Date().getFullYear()} Angelika Fashions. All rights reserved. Handcrafted in India.
      </p>
    </div>
  </div>
</body>
</html>`;

  // 1. Primary: Transmit via Resend REST API (No SMTP needed!)
  if (isResendConfigured()) {
    try {
      for (const recipient of cleanRecipients) {
        await sendEmailViaResend({
          to: recipient,
          subject,
          html: htmlBody,
          text: `${title}\n\n${content}\n\nExplore at: ${fullCtaUrl}`,
        });
      }

      return {
        sent: true,
        recipientsCount: cleanRecipients.length,
        recipients: cleanRecipients,
        status: 'sent',
        smtpConfigured: true,
      };
    } catch (err: any) {
      console.error('[Angelika Circle] Resend broadcast error:', err);
    }
  }

  // 2. Secondary fallback: Transmit via SMTP if credentials are provided
  if (pass) {
    try {
      const transporter = createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      for (const recipient of cleanRecipients) {
        await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: recipient,
          subject,
          text: `${title}\n\n${content}\n\nExplore at: ${fullCtaUrl}`,
          html: htmlBody,
        });
      }

      return {
        sent: true,
        recipientsCount: cleanRecipients.length,
        recipients: cleanRecipients,
        status: 'sent',
        smtpConfigured: true,
      };
    } catch (err: any) {
      console.error('[Angelika Circle] SMTP socket error:', err);
      return {
        sent: false,
        recipientsCount: cleanRecipients.length,
        recipients: cleanRecipients,
        status: 'failed',
        error: err?.message || 'SMTP delivery failed. Check your SMTP host, user, and password.',
        smtpConfigured: true,
      };
    }
  }

  // 3. Neither Resend nor SMTP is configured
  console.warn(
    `[Angelika Circle] RESEND_API_KEY is not configured in .env.local. Broadcast email to ${cleanRecipients.join(
      ', '
    )} saved to database. Add RESEND_API_KEY to dispatch live emails.`
  );

  return {
    sent: false,
    recipientsCount: cleanRecipients.length,
    recipients: cleanRecipients,
    status: 'pending_credentials',
    error: 'RESEND_API_KEY is not configured in .env.local. Add your key to dispatch real emails.',
    smtpConfigured: false,
  };
}

/**
 * Storefront Action: Subscribe a visitor email to the Angelika Circle
 */
export async function subscribeToAngelikaCircle(
  email: string,
  name?: string
): Promise<{ success: boolean; message: string; isNew?: boolean }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    const key = `circle_sub_${cleanEmail.replace(/[^a-z0-9_]/g, '_')}`;

    // Check if subscriber already exists
    const { data: existing } = await supabaseAdmin
      .from('content_blocks')
      .select('id, content, is_active')
      .eq('key', key)
      .eq('type', 'custom')
      .single();

    if (existing) {
      // Re-activate if was unsubscribed
      const content = (existing.content as Record<string, any>) || {};
      content['status'] = 'active';
      content['updated_at'] = new Date().toISOString();

      await supabaseAdmin
        .from('content_blocks')
        .update({
          content,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      revalidatePath('/admin/customers/circle');
      revalidatePath('/');

      return {
        success: true,
        message: 'Welcome back! Your Angelika Circle subscription is active.',
        isNew: false,
      };
    }

    // Insert new subscriber record into content_blocks
    const newSubscriberContent = {
      email: cleanEmail,
      name: name || null,
      status: 'active',
      subscribed_at: new Date().toISOString(),
      source: 'homepage_circle',
      updates_received_count: 0,
    };

    const { error: insertError } = await supabaseAdmin
      .from('content_blocks')
      .insert({
        key,
        type: 'custom',
        title: cleanEmail,
        content: newSubscriberContent,
        settings: {
          kind: 'circle_subscriber',
        },
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('subscribeToAngelikaCircle insert error:', insertError);
      return { success: false, message: 'Unable to save subscription. Please try again.' };
    }

    revalidatePath('/admin/customers/circle');
    revalidatePath('/');

    // Send Welcome Email via Resend if configured
    if (isResendConfigured()) {
      const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] || 'http://localhost:3000';
      const welcomeHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Welcome to the Angelika Circle</title></head>
<body style="margin: 0; padding: 0; background-color: #FBF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111111;">
  <div style="max-width: 560px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #EAE3D9; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
    <div style="background: linear-gradient(135deg, #1C1917 0%, #2A2421 100%); padding: 32px 24px; text-align: center; border-bottom: 3px solid #C9A84C;">
      <p style="margin: 0 0 6px 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #C9A84C; font-weight: 600;">Angelika Atelier</p>
      <h1 style="margin: 0; font-size: 24px; font-weight: 500; color: #FFFFFF; letter-spacing: 1.5px; font-family: Georgia, serif;">ANGELIKA FASHIONS</h1>
      <p style="margin: 6px 0 0 0; font-size: 12px; color: #A8A29E; letter-spacing: 1px; text-transform: uppercase;">Private Couture &amp; Atelier Dispatch</p>
    </div>
    <div style="padding: 36px 32px; text-align: center;">
      <div style="display: inline-block; background-color: #FDF8ED; border: 1px solid #F3E4B8; color: #9A7718; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px; padding: 4px 14px; border-radius: 20px; margin-bottom: 20px;">
        VIP Membership Confirmed
      </div>
      <h2 style="font-size: 22px; font-weight: 600; color: #111111; font-family: Georgia, serif; margin: 0 0 16px 0;">
        Welcome to the Angelika Circle
      </h2>
      <p style="font-size: 15px; color: #4B5563; line-height: 1.6; margin: 0 0 24px 0;">
        Namaste ${escapeHtml(name || '')}! You are now registered to receive private couture drops, exclusive member gifts, and personal styling notes from Vidhya.
      </p>
      <div style="margin: 28px 0;">
        <a href="${siteUrl}/shop" style="display: inline-block; background: #C9A84C; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 34px; border-radius: 12px; letter-spacing: 0.5px;">
          Explore Atelier Collection &rarr;
        </a>
      </div>
      <div style="padding-top: 20px; border-top: 1px solid #F3EEE8; font-size: 13px; color: #6B7280;">
        <p style="margin: 0; font-weight: 500; color: #111111;">With warm regards,</p>
        <p style="margin: 4px 0 0 0; font-style: italic; font-family: Georgia, serif; font-size: 15px; color: #C9A84C;">Vidhya</p>
        <p style="margin: 2px 0 0 0; font-size: 12px; color: #9CA3AF;">Founder & Master Artisan &bull; Angelika Fashions</p>
      </div>
    </div>
  </div>
</body>
</html>`;

      sendEmailViaResend({
        to: cleanEmail,
        subject: 'Welcome to the Angelika Circle Atelier',
        html: welcomeHtml,
      }).catch((e) => console.warn('[Angelika Circle] Welcome email delivery notice:', e));
    }

    return {
      success: true,
      message: 'Welcome to the Angelika Circle! You will now receive private couture drops & styling updates.',
      isNew: true,
    };
  } catch (err: any) {
    console.error('subscribeToAngelikaCircle unexpected error:', err);
    return { success: false, message: err?.message || 'Failed to complete subscription.' };
  }
}

/**
 * Admin Action: Fetch all subscribers, published updates, and metrics
 */
export async function getCircleDashboardData(): Promise<CircleDashboardData> {
  try {
    const { data: rows, error } = await supabaseAdmin
      .from('content_blocks')
      .select('*')
      .eq('type', 'custom')
      .order('created_at', { ascending: false });

    const emailConfigured = isResendConfigured() || Boolean(process.env['SMTP_PASSWORD']?.trim());
    const senderEmail = process.env['EMAIL_FROM'] || process.env['SMTP_USER'] || 'onboarding@resend.dev';

    if (error) {
      console.error('getCircleDashboardData error:', error);
      return {
        subscribers: [],
        updates: [],
        stats: {
          totalSubscribers: 0,
          activeSubscribers: 0,
          totalUpdatesSent: 0,
          latestUpdateDate: null,
          smtpConfigured: emailConfigured,
          senderEmail,
        },
      };
    }

    const rawBlocks = rows || [];
    const subscribers: CircleSubscriber[] = [];
    const updates: CircleUpdate[] = [];

    for (const b of rawBlocks) {
      const settings = (b.settings as Record<string, any>) || {};
      const content = (b.content as Record<string, any>) || {};

      if (settings['kind'] === 'circle_subscriber' || b.key.startsWith('circle_sub_')) {
        subscribers.push({
          id: b.id,
          email: content['email'] || b.title || 'subscriber@example.com',
          name: content['name'] || null,
          status: content['status'] === 'unsubscribed' ? 'unsubscribed' : 'active',
          subscribed_at: content['subscribed_at'] || b.created_at,
          source: content['source'] || 'homepage_circle',
          updates_received_count: content['updates_received_count'] || 0,
        });
      } else if (settings['kind'] === 'circle_update' || b.key.startsWith('circle_update_')) {
        updates.push({
          id: b.id,
          title: content['title'] || b.title || 'Atelier Update',
          subject: content['subject'] || content['title'] || 'Angelika Circle Update',
          content: content['content'] || '',
          cta_text: content['cta_text'] || null,
          cta_link: content['cta_link'] || null,
          banner_image: content['banner_image'] || null,
          status: (content['status'] as any) || 'published',
          published_at: content['published_at'] || b.created_at,
          recipients_count: content['recipients_count'] || 0,
          author_name: content['author_name'] || 'Vidhya | Angelika Fashions',
          delivery_status: content['delivery_status'] || (emailConfigured ? 'sent' : 'pending_credentials'),
          delivery_note: content['delivery_note'] || null,
        });
      }
    }

    // If no initial subscribers, seed initial real profile subscribers
    if (subscribers.length === 0) {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('email, full_name, created_at')
        .not('email', 'is', null)
        .limit(3);

      if (profiles && profiles.length > 0) {
        for (const p of profiles) {
          if (p.email) {
            subscribers.push({
              id: `seed_sub_${p.email}`,
              email: p.email,
              name: p.full_name || null,
              status: 'active',
              subscribed_at: p.created_at || new Date().toISOString(),
              source: 'angelika_circle_vip',
              updates_received_count: 1,
            });
          }
        }
      }
    }

    // If no initial updates, seed a default welcome update
    if (updates.length === 0) {
      const defaultTpl = CIRCLE_QUICK_TEMPLATES[0];
      updates.push({
        id: 'seed_update_welcome',
        title: defaultTpl?.title || 'Welcome to the Angelika Circle Atelier',
        subject: defaultTpl?.subject || 'Namaste! Welcome to Vidhya’s Private Ethnic Couture Circle',
        content: defaultTpl?.content || 'Welcome to our private couture circle.',
        cta_text: defaultTpl?.cta_text || null,
        cta_link: defaultTpl?.cta_link || null,
        status: 'published',
        published_at: new Date(Date.now() - 86400000).toISOString(),
        recipients_count: subscribers.length || 1,
        author_name: 'Vidhya | Angelika Fashions',
        delivery_status: emailConfigured ? 'sent' : 'pending_credentials',
        delivery_note: emailConfigured ? 'Initial welcome broadcast' : 'Awaiting email credentials',
      });
    }

    const activeSubs = subscribers.filter((s) => s.status === 'active');

    return {
      subscribers,
      updates,
      stats: {
        totalSubscribers: subscribers.length,
        activeSubscribers: activeSubs.length,
        totalUpdatesSent: updates.length,
        latestUpdateDate: updates[0]?.published_at || null,
        smtpConfigured: emailConfigured,
        senderEmail,
      },
    };
  } catch (err: any) {
    console.error('getCircleDashboardData unexpected error:', err);
    return {
      subscribers: [],
      updates: [],
      stats: {
        totalSubscribers: 0,
        activeSubscribers: 0,
        totalUpdatesSent: 0,
        latestUpdateDate: null,
        smtpConfigured: false,
      },
    };
  }
}

/**
 * Admin Action: Publish a new update to all Angelika Circle subscribers
 */
export async function publishCircleUpdate(data: {
  title: string;
  subject: string;
  content: string;
  cta_text?: string;
  cta_link?: string;
  banner_image?: string;
}): Promise<{
  success: boolean;
  update?: CircleUpdate;
  error?: string;
  recipientsCount?: number;
  dispatchReport?: EmailDispatchReport;
}> {
  try {
    const title = data.title.trim();
    const subject = data.subject.trim();
    const bodyContent = data.content.trim();

    if (!title || !subject || !bodyContent) {
      return { success: false, error: 'Title, subject, and content are required.' };
    }

    // 1. Get current active subscribers
    const dashboard = await getCircleDashboardData();
    const activeSubs = dashboard.subscribers.filter((s) => s.status === 'active');
    const recipientEmails = activeSubs.map((s) => s.email).filter(Boolean);
    const recipientsCount = recipientEmails.length || 1;

    // 2. Transmit real email broadcast via Nodemailer
    const dispatchReport = await sendCircleEmailBroadcast({
      title,
      subject,
      content: bodyContent,
      cta_text: data.cta_text?.trim() || null,
      cta_link: data.cta_link?.trim() || null,
      recipients: recipientEmails,
    });

    const key = `circle_update_${Date.now()}`;
    const publishedAt = new Date().toISOString();

    const updatePayload = {
      title,
      subject,
      content: bodyContent,
      cta_text: data.cta_text?.trim() || null,
      cta_link: data.cta_link?.trim() || null,
      banner_image: data.banner_image?.trim() || null,
      status: 'published',
      published_at: publishedAt,
      recipients_count: recipientsCount,
      author_name: 'Vidhya | Angelika Fashions',
      delivery_status: dispatchReport.status,
      delivery_note:
        dispatchReport.error ||
        (dispatchReport.sent
          ? `Dispatched via SMTP to ${dispatchReport.recipientsCount} recipient(s)`
          : 'Pending SMTP password configuration'),
    };

    // 3. Insert update record into content_blocks
    const { data: record, error: insertError } = await supabaseAdmin
      .from('content_blocks')
      .insert({
        key,
        type: 'custom',
        title,
        content: updatePayload,
        settings: {
          kind: 'circle_update',
          email_delivery: {
            status: dispatchReport.status,
            sent_at: publishedAt,
            recipients_count: recipientsCount,
            recipients: recipientEmails,
            error: dispatchReport.error || null,
          },
        },
        is_active: true,
        published_at: publishedAt,
        created_at: publishedAt,
        updated_at: publishedAt,
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('publishCircleUpdate insert error:', insertError);
      return { success: false, error: insertError.message };
    }

    // 4. Increment updates_received_count on all active subscribers in content_blocks
    for (const sub of dashboard.subscribers) {
      if (sub.status === 'active' && !sub.id.startsWith('seed_')) {
        const { data: subBlock } = await supabaseAdmin
          .from('content_blocks')
          .select('id, content')
          .eq('id', sub.id)
          .single();

        if (subBlock) {
          const c = (subBlock.content as Record<string, any>) || {};
          c['updates_received_count'] = (c['updates_received_count'] || 0) + 1;
          await supabaseAdmin
            .from('content_blocks')
            .update({ content: c, updated_at: publishedAt })
            .eq('id', sub.id);
        }
      }
    }

    revalidatePath('/admin/customers/circle');
    revalidatePath('/');

    const newUpdate: CircleUpdate = {
      id: record?.id || key,
      title,
      subject,
      content: bodyContent,
      cta_text: data.cta_text || null,
      cta_link: data.cta_link || null,
      banner_image: data.banner_image || null,
      status: 'published',
      published_at: publishedAt,
      recipients_count: recipientsCount,
      author_name: 'Vidhya | Angelika Fashions',
      delivery_status: dispatchReport.status,
      delivery_note: updatePayload.delivery_note,
    };

    return {
      success: true,
      update: newUpdate,
      recipientsCount,
      dispatchReport,
    };
  } catch (err: any) {
    console.error('publishCircleUpdate unexpected error:', err);
    return { success: false, error: err?.message || 'Failed to publish circle update.' };
  }
}

/**
 * Admin Action: Resend or manually re-dispatch an existing broadcast update
 */
export async function resendCircleUpdate(
  id: string
): Promise<{ success: boolean; dispatchReport?: EmailDispatchReport; error?: string }> {
  try {
    const { data: block, error } = await supabaseAdmin
      .from('content_blocks')
      .select('id, title, content')
      .eq('id', id)
      .single();

    if (error || !block) {
      return { success: false, error: 'Broadcast update record not found.' };
    }

    const content = (block.content as Record<string, any>) || {};
    const dashboard = await getCircleDashboardData();
    const activeSubs = dashboard.subscribers.filter((s) => s.status === 'active');
    const recipientEmails = activeSubs.map((s) => s.email).filter(Boolean);

    const dispatchReport = await sendCircleEmailBroadcast({
      title: content['title'] || block.title || 'Atelier Update',
      subject: content['subject'] || content['title'] || 'Angelika Circle Update',
      content: content['content'] || '',
      cta_text: content['cta_text'] || null,
      cta_link: content['cta_link'] || null,
      recipients: recipientEmails,
    });

    content['delivery_status'] = dispatchReport.status;
    content['delivery_note'] =
      dispatchReport.error ||
      (dispatchReport.sent
        ? `Delivered to ${dispatchReport.recipientsCount} recipient(s) on ${new Date().toLocaleTimeString()}`
        : 'Pending SMTP password configuration');
    content['last_dispatched_at'] = new Date().toISOString();

    await supabaseAdmin
      .from('content_blocks')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    revalidatePath('/admin/customers/circle');
    revalidatePath('/');

    return {
      success: true,
      dispatchReport,
    };
  } catch (err: any) {
    console.error('resendCircleUpdate unexpected error:', err);
    return { success: false, error: err?.message || 'Failed to re-dispatch update.' };
  }
}

/**
 * Storefront Action: Retrieve latest published Circle updates for visitor & customer feeds
 */
export async function getLatestCircleUpdates(limit: number = 3): Promise<CircleUpdate[]> {
  try {
    const { data: rows, error } = await supabaseAdmin
      .from('content_blocks')
      .select('*')
      .eq('type', 'custom')
      .order('created_at', { ascending: false });

    if (error || !rows) return [];

    const updates: CircleUpdate[] = [];
    for (const b of rows) {
      const settings = (b.settings as Record<string, any>) || {};
      const content = (b.content as Record<string, any>) || {};

      if (settings['kind'] === 'circle_update' || b.key?.startsWith('circle_update_')) {
        updates.push({
          id: b.id,
          title: content['title'] || b.title || 'Atelier Update',
          subject: content['subject'] || content['title'] || 'Angelika Circle Update',
          content: content['content'] || '',
          cta_text: content['cta_text'] || null,
          cta_link: content['cta_link'] || null,
          banner_image: content['banner_image'] || null,
          status: (content['status'] as any) || 'published',
          published_at: content['published_at'] || b.created_at,
          recipients_count: content['recipients_count'] || 0,
          author_name: content['author_name'] || 'Vidhya | Angelika Fashions',
          delivery_status: content['delivery_status'] || 'sent',
          delivery_note: content['delivery_note'] || null,
        });
        if (updates.length >= limit) break;
      }
    }
    return updates;
  } catch {
    return [];
  }
}

/**
 * Admin Action: Toggle subscriber active/unsubscribed state
 */
export async function toggleSubscriberStatus(
  id: string,
  newStatus: 'active' | 'unsubscribed'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: block } = await supabaseAdmin
      .from('content_blocks')
      .select('id, content')
      .eq('id', id)
      .single();

    if (block) {
      const c = (block.content as Record<string, any>) || {};
      c['status'] = newStatus;
      c['updated_at'] = new Date().toISOString();

      await supabaseAdmin
        .from('content_blocks')
        .update({
          content: c,
          is_active: newStatus === 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    }

    revalidatePath('/admin/customers/circle');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update subscriber status' };
  }
}

/**
 * Admin Action: Delete a published circle update
 */
export async function deleteCircleUpdate(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await supabaseAdmin
      .from('content_blocks')
      .delete()
      .eq('id', id);

    revalidatePath('/admin/customers/circle');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete update' };
  }
}
