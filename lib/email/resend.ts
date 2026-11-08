/**
 * Zero-dependency Resend REST API Client
 * Dispatches emails via standard HTTPS requests using RESEND_API_KEY.
 * Works seamlessly across Next.js Server Actions, Route Handlers, and Node.js.
 */

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
 * Check if RESEND_API_KEY is configured in the environment
 */
export function isResendConfigured(): boolean {
  return Boolean(process.env['RESEND_API_KEY']?.trim());
}

/**
 * Send an email via Resend REST API
 */
export async function sendEmailViaResend(params: ResendSendEmailParams): Promise<ResendResponse> {
  const apiKey = process.env['RESEND_API_KEY']?.trim();
  const configuredFrom = process.env['EMAIL_FROM']?.trim() || 'Angelika Fashions <onboarding@resend.dev>';
  const from = params.from?.trim() || configuredFrom;
  const toList = Array.isArray(params.to) ? params.to : [params.to];
  const cleanTo = toList.map((e) => e.trim().toLowerCase()).filter((e) => e && e.includes('@'));

  if (cleanTo.length === 0) {
    return { success: false, error: 'No valid recipient email address provided.' };
  }

  // If no API key is configured
  if (!apiKey) {
    console.warn(
      `[Resend API] RESEND_API_KEY is missing in .env.local. Email to ${cleanTo.join(
        ', '
      )} was simulated. Add RESEND_API_KEY to send real emails.`
    );
    return {
      success: false,
      error: 'RESEND_API_KEY is not configured in .env.local.',
      simulated: true,
    };
  }

  try {
    const payload: Record<string, any> = {
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
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data?.message || data?.error || `Resend API error status: ${res.status}`;
      console.error('[Resend Error]', errorMsg);
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
    console.error('[Resend Exception]', err);
    return {
      success: false,
      error: err?.message || 'Network error reaching Resend API.',
    };
  }
}

