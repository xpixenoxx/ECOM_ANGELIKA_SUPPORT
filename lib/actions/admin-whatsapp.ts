'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { OPS_ADMIN_ROLES, logAdminAction, requireAdminRole } from '@/lib/supabase/admin-auth';
import type { Json } from '@/types/database';
import { revalidatePath } from 'next/cache';
import {
  WhatsAppTemplateItem,
  WhatsAppLogRecord,
  WhatsAppChatMessage,
  WhatsAppConversationThread,
  WhatsAppConversationsData,
  OFFICIAL_TEMPLATES,
} from './admin-whatsapp-types';

export async function getWhatsAppLogs(): Promise<WhatsAppLogRecord[]> {
  try {
    const auth = await requireAdminRole(OPS_ADMIN_ROLES);
    if (!auth.authorized) return [];
    const { data, error } = await supabaseAdmin
      .from('whatsapp_conversations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('getWhatsAppLogs error:', error);
      return [];
    }

    const logs: WhatsAppLogRecord[] = (data || []).map((row: any) => {
      const meta = row.metadata || {};
      const params = row.template_params || {};
      const customerName = params.customer_name || meta.customer_name || 'Valued Client';
      const orderNumber = params.order_number || meta.order_number || null;

      return {
        ...row,
        customer_name: customerName,
        order_number: orderNumber,
      };
    });

    return logs;
  } catch (err) {
    console.error('getWhatsAppLogs unexpected error:', err);
    return [];
  }
}

export async function logWhatsAppMessage(data: {
  phone: string;
  templateName: string;
  templateParams: Record<string, any>;
  messageBody: string;
  userId?: string | null;
  status?: string;
}): Promise<{ success: boolean; record?: WhatsAppLogRecord; error?: string }> {
  try {
    const auth = await requireAdminRole(OPS_ADMIN_ROLES);
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Unauthorized' };
    }
    const cleanPhone = data.phone.trim();
    const waId = `wa_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const { data: record, error } = await supabaseAdmin
      .from('whatsapp_conversations')
      .insert({
        phone: cleanPhone,
        type: 'template',
        status: data.status || 'sent',
        template_name: data.templateName,
        template_params: data.templateParams as unknown as Json,
        metadata: {
          message: data.messageBody,
          customer_name: data.templateParams['customer_name'] || null,
          order_number: data.templateParams['order_number'] || null,
          sent_by: 'admin_dashboard',
        },
        wa_message_id: waId,
        user_id: data.userId || null,
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      console.error('logWhatsAppMessage error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/whatsapp/templates');
    revalidatePath('/admin/whatsapp');
    const enrichedRecord: WhatsAppLogRecord = {
      ...record,
      metadata: (record.metadata && typeof record.metadata === 'object' && !Array.isArray(record.metadata))
        ? (record.metadata as Record<string, any>)
        : {},
      template_params: (record.template_params && typeof record.template_params === 'object' && !Array.isArray(record.template_params))
        ? (record.template_params as Record<string, any>)
        : {},
      customer_name: String(data.templateParams['customer_name'] || 'Valued Client'),
      order_number: data.templateParams['order_number'] ? String(data.templateParams['order_number']) : undefined,
    };
    return { success: true, record: enrichedRecord };
  } catch (err: any) {
    console.error('logWhatsAppMessage unexpected error:', err);
    return { success: false, error: err?.message || 'Failed to record WhatsApp message' };
  }
}

export async function getWhatsAppContextData() {
  try {
    const auth = await requireAdminRole(OPS_ADMIN_ROLES);
    if (!auth.authorized) {
      return {
        templates: OFFICIAL_TEMPLATES,
        logs: [],
        orders: [],
        profiles: [],
        stats: {
          totalTemplates: OFFICIAL_TEMPLATES.length,
          totalSent: 0,
          optedInCustomers: 0,
          deliveryRate: 0,
        },
      };
    }
    const [logs, ordersRes, profilesRes] = await Promise.all([
      getWhatsAppLogs(),
      supabaseAdmin
        .from('orders')
        .select('id, order_number, phone, email, shipping_address, total_amount, courier_partner, tracking_number, status, whatsapp_opt_in')
        .order('created_at', { ascending: false })
        .limit(50),
      supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, phone, role, loyalty_tier')
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    const orders = ordersRes.data || [];
    const profiles = profilesRes.data || [];

    const optedInCount = orders.filter((o: any) => o.whatsapp_opt_in !== false).length;

    return {
      templates: OFFICIAL_TEMPLATES,
      logs,
      orders,
      profiles,
      stats: {
        totalTemplates: OFFICIAL_TEMPLATES.length,
        totalSent: logs.length,
        optedInCustomers: optedInCount,
        deliveryRate: 100,
      },
    };
  } catch (err) {
    console.error('getWhatsAppContextData error:', err);
    return {
      templates: OFFICIAL_TEMPLATES,
      logs: [],
      orders: [],
      profiles: [],
      stats: {
        totalTemplates: OFFICIAL_TEMPLATES.length,
        totalSent: 0,
        optedInCustomers: 0,
        deliveryRate: 100,
      },
    };
  }
}

export async function getWhatsAppConversationsData(): Promise<WhatsAppConversationsData> {
  try {
    const auth = await requireAdminRole(OPS_ADMIN_ROLES);
    if (!auth.authorized) {
      return {
        threads: [],
        stats: { totalChats: 0, activeChats: 0, resolvedChats: 0, totalMessages: 0 },
      };
    }
    const [convRes, ordersRes, profilesRes] = await Promise.all([
      supabaseAdmin
        .from('whatsapp_conversations')
        .select('*')
        .order('created_at', { ascending: true }),
      supabaseAdmin
        .from('orders')
        .select('id, order_number, phone, email, shipping_address, total_amount, status, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(100),
      supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, phone, role, loyalty_tier')
        .limit(100),
    ]);

    const rawMessages = convRes.data || [];
    const orders = ordersRes.data || [];
    const profiles = profilesRes.data || [];

    // Map profiles by ID and email
    const profileMap = new Map<string, any>();
    for (const p of profiles) {
      if (p.id) profileMap.set(p.id, p);
      if (p.email) profileMap.set(p.email.toLowerCase(), p);
    }

    // Map recent order by normalized phone
    const orderPhoneMap = new Map<string, any>();
    for (const ord of orders) {
      const addr = (ord.shipping_address as Record<string, any>) || {};
      const phone = ord.phone || addr['phone'];
      if (phone) {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if (!orderPhoneMap.has(cleanPhone)) {
          orderPhoneMap.set(cleanPhone, ord);
        }
      }
    }

    // Only real conversations stored in Supabase whatsapp_conversations are shown
    const seedThreads: WhatsAppConversationThread[] = [];

    // If there are raw messages in Supabase, organize them into threads by phone
    if (rawMessages.length > 0) {
      const messagesByPhone = new Map<string, any[]>();
      for (const msg of rawMessages) {
        const clean = (msg.phone || '').replace(/[^0-9]/g, '');
        if (!clean) continue;
        const list = messagesByPhone.get(clean) || [];
        list.push(msg);
        messagesByPhone.set(clean, list);
      }

      // Merge raw messages into threads
      for (const [phoneClean, msgs] of messagesByPhone.entries()) {
        const matchingSeed = seedThreads.find(
          (t) => t.phone.replace(/[^0-9]/g, '') === phoneClean
        );

        const order = orderPhoneMap.get(phoneClean);
        let customerName = 'Valued Client';
        if (order) {
          const addr = (order.shipping_address as Record<string, any>) || {};
          customerName = [addr['firstName'], addr['lastName']].filter(Boolean).join(' ') || addr['full_name'] || customerName;
        }

        const formattedChatMessages: WhatsAppChatMessage[] = msgs.map((m: any) => {
          const meta = (m.metadata as Record<string, any>) || {};
          const senderType =
            m.type === 'inbound'
              ? 'customer'
              : m.type === 'template'
              ? 'bot'
              : 'concierge';

          const text =
            meta['message'] ||
            (m.template_name ? `Template notification: ${m.template_name}` : 'WhatsApp message');

          const d = new Date(m.created_at);
          const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return {
            id: m.id,
            sender: senderType,
            text,
            time,
            timestamp: m.created_at,
            status: m.status,
          };
        });

        if (matchingSeed) {
          matchingSeed.messages = [...matchingSeed.messages, ...formattedChatMessages];
          const last = matchingSeed.messages[matchingSeed.messages.length - 1];
          if (last) {
            matchingSeed.lastMessage = last.text;
            matchingSeed.lastMessageTime = last.time;
          }
        } else {
          // New thread from Supabase
          const initials = customerName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2) || 'WA';

          const lastMsg = formattedChatMessages[formattedChatMessages.length - 1];

          seedThreads.unshift({
            id: `thread_${phoneClean}`,
            phone: `+${phoneClean}`,
            name: customerName,
            email: order?.email || undefined,
            userId: order?.user_id || null,
            loyaltyTier: 'Client',
            avatarInitials: initials,
            lastMessage: lastMsg ? lastMsg.text : 'New message',
            lastMessageTime: lastMsg ? lastMsg.time : 'Just now',
            unread: 0,
            status: 'active',
            recentOrder: order
              ? {
                  id: order.id,
                  orderNumber: order.order_number,
                  totalAmount: order.total_amount,
                  status: order.status,
                }
              : null,
            messages: formattedChatMessages,
          });
        }
      }
    }

    const activeCount = seedThreads.filter((t) => t.status === 'active').length;
    const resolvedCount = seedThreads.filter((t) => t.status === 'resolved').length;
    const totalMsgs = seedThreads.reduce((acc, t) => acc + t.messages.length, 0);

    return {
      threads: seedThreads,
      stats: {
        totalChats: seedThreads.length,
        activeChats: activeCount,
        resolvedChats: resolvedCount,
        totalMessages: totalMsgs,
      },
    };
  } catch (err) {
    console.error('getWhatsAppConversationsData error:', err);
    return {
      threads: [],
      stats: {
        totalChats: 0,
        activeChats: 0,
        resolvedChats: 0,
        totalMessages: 0,
      },
    };
  }
}

export async function sendWhatsAppConciergeMessage(data: {
  phone: string;
  message: string;
  userId?: string | null;
  customerName?: string;
}): Promise<{ success: boolean; record?: any; error?: string }> {
  try {
    const auth = await requireAdminRole(OPS_ADMIN_ROLES);
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Unauthorized' };
    }
    const cleanPhone = data.phone.trim();
    const waId = `wa_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const { data: record, error } = await supabaseAdmin
      .from('whatsapp_conversations')
      .insert({
        phone: cleanPhone,
        type: 'outbound',
        status: 'sent',
        template_name: null,
        template_params: null,
        metadata: {
          message: data.message.trim(),
          sender: 'concierge',
          customer_name: data.customerName || null,
        },
        wa_message_id: waId,
        user_id: data.userId || null,
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      console.error('sendWhatsAppConciergeMessage error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/whatsapp');
    revalidatePath('/admin/whatsapp/templates');
    return { success: true, record };
  } catch (err: any) {
    console.error('sendWhatsAppConciergeMessage unexpected error:', err);
    return { success: false, error: err?.message || 'Failed to send concierge message' };
  }
}

export interface WhatsAppFlowConfigItem {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'DRAFT';
  triggers: string[];
  stepsCount: number;
}

const DEFAULT_WHATSAPP_FLOWS: WhatsAppFlowConfigItem[] = [
  {
    id: 'f1',
    name: 'Bespoke Sizing & Custom Blouse Measurement',
    description:
      'Guides the customer through taking accurate bust, waist, shoulder, and blouse length measurements via WhatsApp concierge.',
    status: 'ACTIVE',
    triggers: ['Keyword "CUSTOM SIZE"', 'Product Page "Bespoke Size Request" CTA'],
    stepsCount: 5,
  },
  {
    id: 'f2',
    name: 'Instant Order & Dispatch Tracking Flow',
    description:
      'Allows customers to query order status by entering their order number, returning verified courier tracking links.',
    status: 'ACTIVE',
    triggers: ['Keyword "TRACK"', 'Footer "WhatsApp Track" CTA'],
    stepsCount: 3,
  },
  {
    id: 'f3',
    name: 'Bridal Atelier Consultation Booking',
    description:
      'Qualifies bridal inquiries, collects event date, preferences, and connects clients with atelier stylists.',
    status: 'ACTIVE',
    triggers: ['Bridal Lehenga Page "Book Atelier Consultation"', 'Keyword "BRIDAL"'],
    stepsCount: 6,
  },
  {
    id: 'f4',
    name: 'Easy Return / Exchange Initiator',
    description:
      'Self-service guidance flow for initiating reverse pickup and connecting to the returns portal.',
    status: 'ACTIVE',
    triggers: ['Keyword "RETURN"', 'Order Success Email link'],
    stepsCount: 4,
  },
];

export async function getWhatsAppFlowsConfig(): Promise<WhatsAppFlowConfigItem[]> {
  try {
    const auth = await requireAdminRole(OPS_ADMIN_ROLES);
    if (!auth.authorized) return DEFAULT_WHATSAPP_FLOWS;

    const { data } = await supabaseAdmin
      .from('content_blocks')
      .select('content')
      .eq('key', 'whatsapp_flows_config')
      .maybeSingle();

    const content = data?.content as Record<string, unknown> | null;
    if (Array.isArray(content?.['flows'])) {
      return content['flows'] as WhatsAppFlowConfigItem[];
    }
    return DEFAULT_WHATSAPP_FLOWS;
  } catch {
    return DEFAULT_WHATSAPP_FLOWS;
  }
}

export async function saveWhatsAppFlowsConfig(
  flows: WhatsAppFlowConfigItem[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await requireAdminRole(OPS_ADMIN_ROLES);
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Unauthorized' };
    }

    const { error } = await supabaseAdmin.from('content_blocks').upsert(
      {
        key: 'whatsapp_flows_config',
        type: 'whatsapp_flows',
        title: 'WhatsApp Automated Flows Configuration',
        content: { flows } as unknown as Json,
        is_active: false,
        updated_at: new Date().toISOString(),
        updated_by: auth.userId,
      },
      { onConflict: 'key' }
    );

    if (error) return { success: false, error: error.message };

    await logAdminAction({
      actorId: auth.userId,
      action: 'update_whatsapp_flows',
      entityType: 'content_block',
      entityId: 'whatsapp_flows_config',
    });

    revalidatePath('/admin/whatsapp/flows');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save flows configuration' };
  }
}
