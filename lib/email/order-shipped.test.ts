import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockMaybeSingle = vi.fn();
const mockEq = vi.fn();
const mockUpdate = vi.fn();
const mockInsert = vi.fn();
const mockSendEmailViaResend = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn((table: string) => {
      if (table === 'orders') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: mockMaybeSingle,
            })),
          })),
          update: vi.fn((payload: Record<string, any>) => {
            mockUpdate(payload);
            return {
              eq: mockEq,
            };
          }),
        };
      }
      if (table === 'notifications') {
        return {
          insert: mockInsert,
        };
      }
      return {};
    }),
  },
}));

vi.mock('./resend', () => ({
  sendEmailViaResend: (...args: any[]) => mockSendEmailViaResend(...args),
}));

import { sendOrderShippedEmail } from './order-shipped';

const baseOrder = {
  id: 'ord-uuid-123',
  order_number: 'ORD-MWC4447Q-2328',
  user_id: 'user-1',
  email: 'patron@example.com',
  phone: '9123456789',
  status: 'shipped',
  courier_partner: 'Delhivery',
  tracking_number: 'SR123456789',
  shipped_at: '2026-11-11T12:00:00.000Z',
  shipping_address: {
    firstName: 'Shana',
    lastName: 'Dhoni',
    address1: '123 Heritage Lane',
    city: 'Hyderabad',
    state: 'Andhra Pradesh',
    postalCode: '456789',
  },
  metadata: {},
  order_items: [
    {
      product_name: 'Royal Silk Anarkali',
      quantity: 1,
      unit_price: 6048,
      total_price: 6048,
      variant_details: { size: 'M', color: 'Ivory' },
    },
  ],
};

describe('sendOrderShippedEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEq.mockResolvedValue({ error: null });
    mockInsert.mockResolvedValue({ error: null });
    mockSendEmailViaResend.mockResolvedValue({ success: true, id: 'email-msg-1' });
  });

  it('sends an Order Shipped email with courier and tracking details and marks metadata', async () => {
    mockMaybeSingle.mockResolvedValue({ data: baseOrder, error: null });

    const res = await sendOrderShippedEmail('ord-uuid-123');

    expect(res).toEqual({ success: true, messageId: 'email-msg-1' });
    expect(mockSendEmailViaResend).toHaveBeenCalledTimes(1);
    const emailCall = mockSendEmailViaResend.mock.calls[0][0];
    expect(emailCall.to).toBe('patron@example.com');
    expect(emailCall.subject).toContain('Order Shipped: ORD-MWC4447Q-2328');
    expect(emailCall.html).toContain('Delhivery');
    expect(emailCall.html).toContain('SR123456789');
    expect(emailCall.html).toContain('Royal Silk Anarkali');
    expect(emailCall.text).toContain('SR123456789');

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'order_shipped',
        channel: 'email',
        status: 'sent',
      })
    );
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          shipping_email_sent_awb: 'SR123456789',
          shipping_email_sent_at: expect.any(String),
        }),
      })
    );
  });

  it('skips sending duplicate shipped email for the same AWB', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        ...baseOrder,
        metadata: {
          shipping_email_sent_at: '2026-11-11T12:05:00.000Z',
          shipping_email_sent_awb: 'SR123456789',
        },
      },
      error: null,
    });

    const res = await sendOrderShippedEmail('ord-uuid-123');

    expect(res).toEqual({ success: true, skipped: true });
    expect(mockSendEmailViaResend).not.toHaveBeenCalled();
  });

  it('sends an email if the tracking number changed since last shipped alert', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        ...baseOrder,
        tracking_number: 'SR999999999',
        metadata: {
          shipping_email_sent_at: '2026-11-11T12:05:00.000Z',
          shipping_email_sent_awb: 'SR123456789',
        },
      },
      error: null,
    });

    const res = await sendOrderShippedEmail('ord-uuid-123');

    expect(res).toEqual({ success: true, messageId: 'email-msg-1' });
    expect(mockSendEmailViaResend).toHaveBeenCalledTimes(1);
    expect(mockSendEmailViaResend.mock.calls[0][0].html).toContain('SR999999999');
  });

  it('returns an error cleanly if no valid email exists on the order', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        ...baseOrder,
        email: '',
        shipping_address: { firstName: 'Shana' },
      },
      error: null,
    });

    const res = await sendOrderShippedEmail('ord-uuid-123');

    expect(res).toEqual({ success: false, error: 'Order does not have a valid email address' });
    expect(mockSendEmailViaResend).not.toHaveBeenCalled();
  });
});
