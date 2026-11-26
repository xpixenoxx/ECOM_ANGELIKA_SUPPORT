/**
 * Zero-dependency Resend REST API Client (Cloudflare Edge + Node compatible)
 * Dispatches emails via standard HTTPS requests using RESEND_API_KEY.
 * Reads credentials safely via getOptionalEnv so both process.env and Cloudflare
 * request context bindings work consistently and placeholders are rejected.
 */

import { getOptionalEnv } from '@/lib/env';

export interface ResendSendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface ResendResponse {
  success: boolean;
  id?: string;
  error?: string;
  statusCode?: number;
  simulated?: boolean;
}

/**
 * Check if a valid (non-placeholder) RESEND_API_KEY is configured.
 */
export function isResendConfigured(): boolean {
  return Boolean(getOptionalEnv('RESEND_API_KEY'));
}

/**
 * Send an email via Resend REST API.
 * Never reports success when RESEND_API_KEY is missing or Resend returns an error.
 */
export async function sendEmailViaResend(params: ResendSendEmailParams): Promise<ResendResponse> {
  const apiKey = getOptionalEnv('RESEND_API_KEY');
  const configuredFrom =
    getOptionalEnv('EMAIL_FROM') || 'Angelika Fashions <vidhya@angelikafashions.com>';
  const from = params.from?.trim() || configuredFrom;
  const toList = Array.isArray(params.to) ? params.to : [params.to];
  const cleanTo = toList.map((e) => e.trim().toLowerCase()).filter((e) => e && e.includes('@'));

  if (cleanTo.length === 0) {
    return { success: false, error: 'No valid recipient email address provided.' };
  }

  if (!apiKey) {
    console.warn(
      `[Resend] RESEND_API_KEY is not configured; email dispatch skipped for ${cleanTo.length} recipient(s).`
    );
    return {
      success: false,
      error: 'RESEND_API_KEY is not configured.',
      simulated: true,
    };
  }

  try {
    const payload: Record<string, unknown> = {
      from,
      to: cleanTo,
      subject: params.subject,
      html: params.html,
    };

    if (params.text) {
      payload['text'] = params.text;
    }
    if (params.replyTo) {
      payload['reply_to'] = params.replyTo;
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });

    const data: any = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data?.message || data?.error || `Resend API error status: ${res.status}`;
      console.error('[Resend Error]', res.status, errorMsg);
      return {
        success: false,
        error: errorMsg,
        statusCode: res.status,
      };
    }

    return {
      success: true,
      id: data?.id,
      statusCode: res.status,
    };
  } catch (err: any) {
    console.error('[Resend Exception]', err?.message || err);
    return {
      success: false,
      error: err?.message || 'Network error reaching Resend API.',
    };
  }
}
