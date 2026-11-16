'use server';

import crypto from 'crypto';
import { headers } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { hasValidSupabaseConfig } from '@/lib/env';
import { isResendConfigured, sendEmailViaResend } from '@/lib/email/resend';
import { checkRateLimit } from '@/lib/utils/rate-limit';
import {
  ContactInquirySchema,
  WholesaleInquirySchema,
  NewsletterSubscribeSchema,
  escapeHtml,
} from '@/lib/validators/commerce';
import type { Json } from '@/types/database';

const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_INQUIRIES_PER_WINDOW = 5;

function getClientIp(): string {
  try {
    const hdrs = headers();
    const xff = hdrs.get('x-forwarded-for');
    if (xff) {
      return xff.split(',')[0]?.trim() || 'unknown';
    }
    return hdrs.get('x-real-ip')?.trim() || 'unknown';
  } catch {
    return 'unknown';
  }
}

async function getStoreAlertRecipient(): Promise<string | null> {
  if (!hasValidSupabaseConfig()) return null;
  try {
    const { data } = await supabaseAdmin
      .from('store_settings')
      .select('contact_email')
      .limit(1)
      .maybeSingle();
    const email = data?.contact_email?.trim();
    if (email && email.includes('@') && !email.includes('example.com')) {
      return email;
    }
    return null;
  } catch {
    return null;
  }
}

export interface ContactInquiryInput {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  inquiryType?: string;
  newsletterOptIn?: boolean;
}

export async function submitContactInquiry(
  input: ContactInquiryInput
): Promise<{ success: boolean; referenceId?: string; error?: string }> {
  const parsed = ContactInquirySchema.safeParse({
    name: input.name,
    email: input.email,
    phone: input.phone,
    subject: input.subject,
    message: input.message,
    inquiryType: input.inquiryType || 'general',
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Please review your form inputs.',
    };
  }

  const clientIp = getClientIp();
  const rl = checkRateLimit(
    `inquiry:contact:${clientIp}:${parsed.data.email.toLowerCase()}`,
    MAX_INQUIRIES_PER_WINDOW,
    RATE_WINDOW_MS
  );
  if (!rl.allowed) {
    return {
      success: false,
      error: 'Too many inquiries submitted recently. Please wait a few minutes before trying again.',
    };
  }

  if (!hasValidSupabaseConfig()) {
    return {
      success: false,
      error: 'Concierge inbox database is not configured yet. Please configure Supabase environment credentials.',
    };
  }

  const referenceId = `INQ-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const key = `inquiry_contact_${referenceId}`;
  const nowIso = new Date().toISOString();

  const payload = {
    referenceId,
    kind: 'contact',
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    phone: parsed.data.phone || null,
    subject: parsed.data.subject,
    message: parsed.data.message,
    inquiryType: parsed.data.inquiryType,
    newsletterOptIn: Boolean(input.newsletterOptIn),
    status: 'new',
    submittedAt: nowIso,
  };

  // Persist with is_active: false so public RLS policies never expose customer PII.
  const { error: dbError } = await supabaseAdmin.from('content_blocks').insert({
    key,
    type: 'inquiry_contact',
    title: `${parsed.data.subject} — ${parsed.data.name}`.slice(0, 120),
    content: payload as unknown as Json,
    is_active: false,
    updated_at: nowIso,
  });

  if (dbError) {
    console.error('[submitContactInquiry] DB insert failed:', dbError);
    return {
      success: false,
      error: 'Could not save your inquiry right now. Please try again shortly.',
    };
  }

  if (input.newsletterOptIn) {
    await persistNewsletterSubscription(parsed.data.email.toLowerCase(), 'contact_form');
  }

  const storeRecipient = await getStoreAlertRecipient();
  if (storeRecipient && isResendConfigured()) {
    await sendEmailViaResend({
      to: storeRecipient,
      replyTo: parsed.data.email,
      subject: `[Concierge Inquiry ${referenceId}] ${parsed.data.subject}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #1C1917;">
          <h2 style="margin-bottom: 8px;">New Client Concierge Inquiry (${escapeHtml(referenceId)})</h2>
          <p><strong>Name:</strong> ${escapeHtml(parsed.data.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(parsed.data.email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(parsed.data.phone || 'Not provided')}</p>
          <p><strong>Subject:</strong> ${escapeHtml(parsed.data.subject)}</p>
          <p><strong>Message:</strong><br/>${escapeHtml(parsed.data.message).replace(/\n/g, '<br/>')}</p>
        </div>
      `,
    }).catch((err) => {
      console.error('[submitContactInquiry] Alert email failed:', err);
    });
  }

  return { success: true, referenceId };
}

export interface WholesaleInquiryInput {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  gstin?: string;
  estimatedOrderVolume: string;
  notes?: string;
}

export async function submitWholesaleInquiry(
  input: WholesaleInquiryInput
): Promise<{ success: boolean; referenceId?: string; error?: string }> {
  const parsed = WholesaleInquirySchema.safeParse({
    businessName: input.businessName,
    contactName: input.contactName,
    email: input.email,
    phone: input.phone,
    city: input.city,
    gstin: input.gstin || undefined,
    estimatedOrderVolume: input.estimatedOrderVolume,
    notes: input.notes || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Please check your boutique details.',
    };
  }

  const clientIp = getClientIp();
  const rl = checkRateLimit(
    `inquiry:wholesale:${clientIp}:${parsed.data.email.toLowerCase()}`,
    MAX_INQUIRIES_PER_WINDOW,
    RATE_WINDOW_MS
  );
  if (!rl.allowed) {
    return {
      success: false,
      error: 'Too many wholesale requests submitted recently. Please wait a few minutes.',
    };
  }

  if (!hasValidSupabaseConfig()) {
    return {
      success: false,
      error: 'Wholesale registration storage is not configured yet. Please configure Supabase environment credentials.',
    };
  }

  const referenceId = `B2B-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const key = `inquiry_wholesale_${referenceId}`;
  const nowIso = new Date().toISOString();

  const payload = {
    referenceId,
    kind: 'wholesale',
    businessName: parsed.data.businessName,
    contactName: parsed.data.contactName,
    email: parsed.data.email.toLowerCase(),
    phone: parsed.data.phone,
    city: parsed.data.city,
    gstin: parsed.data.gstin || null,
    estimatedOrderVolume: parsed.data.estimatedOrderVolume,
    notes: parsed.data.notes || null,
    status: 'new',
    submittedAt: nowIso,
  };

  // Store with is_active: false so public queries cannot access B2B partner contact info.
  const { error: dbError } = await supabaseAdmin.from('content_blocks').insert({
    key,
    type: 'inquiry_wholesale',
    title: `${parsed.data.businessName} (${parsed.data.city})`.slice(0, 120),
    content: payload as unknown as Json,
    is_active: false,
    updated_at: nowIso,
  });

  if (dbError) {
    console.error('[submitWholesaleInquiry] DB insert failed:', dbError);
    return {
      success: false,
      error: 'Unable to submit wholesale inquiry right now. Please try again.',
    };
  }

  const storeRecipient = await getStoreAlertRecipient();
  if (storeRecipient && isResendConfigured()) {
    await sendEmailViaResend({
      to: storeRecipient,
      replyTo: parsed.data.email,
      subject: `[Wholesale Partner Request ${referenceId}] ${parsed.data.businessName}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #1C1917;">
          <h2 style="margin-bottom: 8px;">New B2B / Wholesale Inquiry (${escapeHtml(referenceId)})</h2>
          <p><strong>Boutique / Company:</strong> ${escapeHtml(parsed.data.businessName)}</p>
          <p><strong>Contact Person:</strong> ${escapeHtml(parsed.data.contactName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(parsed.data.email)}</p>
          <p><strong>Phone / WhatsApp:</strong> ${escapeHtml(parsed.data.phone)}</p>
          <p><strong>City & Country:</strong> ${escapeHtml(parsed.data.city)}</p>
          ${parsed.data.gstin ? `<p><strong>GSTIN:</strong> ${escapeHtml(parsed.data.gstin)}</p>` : ''}
          <p><strong>Initial Order Volume:</strong> ${escapeHtml(parsed.data.estimatedOrderVolume)}</p>
          ${parsed.data.notes ? `<p><strong>Notes:</strong><br/>${escapeHtml(parsed.data.notes).replace(/\n/g, '<br/>')}</p>` : ''}
        </div>
      `,
    }).catch((err) => {
      console.error('[submitWholesaleInquiry] Alert email failed:', err);
    });
  }

  return { success: true, referenceId };
}

async function persistNewsletterSubscription(email: string, source: string): Promise<void> {
  if (!hasValidSupabaseConfig()) return;
  const normalizedHash = crypto.createHash('sha256').update(email).digest('hex').slice(0, 20);
  const key = `newsletter_sub_${normalizedHash}`;
  await supabaseAdmin
    .from('content_blocks')
    .upsert(
      {
        key,
        type: 'newsletter_subscriber',
        title: `Subscriber ${normalizedHash}`,
        content: {
          email,
          source,
          subscribedAt: new Date().toISOString(),
        } as unknown as Json,
        is_active: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    )
    .then(({ error }) => {
      if (error) console.error('[persistNewsletterSubscription] error:', error);
    });
}

export async function subscribeNewsletter(input: {
  email: string;
  source?: string;
}): Promise<{ success: boolean; error?: string }> {
  const parsed = NewsletterSubscribeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Please enter a valid email address.',
    };
  }

  const clientIp = getClientIp();
  const rl = checkRateLimit(
    `newsletter:${clientIp}:${parsed.data.email}`,
    MAX_INQUIRIES_PER_WINDOW,
    RATE_WINDOW_MS
  );
  if (!rl.allowed) {
    return {
      success: false,
      error: 'Too many subscription attempts. Please try again later.',
    };
  }

  if (!hasValidSupabaseConfig()) {
    return {
      success: false,
      error: 'Newsletter subscription database is not configured yet.',
    };
  }

  await persistNewsletterSubscription(parsed.data.email, parsed.data.source);
  return { success: true };
}
