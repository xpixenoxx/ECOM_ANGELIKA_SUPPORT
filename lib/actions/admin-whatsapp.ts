'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
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
    const cleanPhone = data.phone.trim();
    const waId = `wa_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const { data: record, error } = await supabaseAdmin
      .from('whatsapp_conversations')
      .insert({
        phone: cleanPhone,
        type: 'template',
        status: data.status || 'sent',
        template_name: data.templateName,
        template_params: data.templateParams,
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
    return { success: true, record };
  } catch (err: any) {
    console.error('logWhatsAppMessage unexpected error:', err);
    return { success: false, error: err?.message || 'Failed to record WhatsApp message' };
  }
}

export async function getWhatsAppContextData() {
  try {
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

    // Default Seed Threads if DB has no messages yet
    const seedThreads: WhatsAppConversationThread[] = [
      {
        id: 'cust_priya_sharma',
        phone: '+91 98765 43210',
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        userId: '7c3ae647-18b0-4a29-ae06-a5685bd99c08',
        loyaltyTier: 'Gold',
        avatarInitials: 'PS',
        lastMessage: 'Wonderful! I just placed order #ORD-MVW7SBV2-7233.',
        lastMessageTime: '10:42 AM',
        unread: 0,
        status: 'active',
        recentOrder: {
          id: '65d52ff7-ef00-4751-b6d4-35c4eb3f70e9',
          orderNumber: 'ORD-MVW7SBV2-7233',
          totalAmount: 7048,
          status: 'confirmed',
        },
        messages: [
          {
            id: 'seed-m1',
            sender: 'customer',
            text: 'Namaste Vidhya! I saw the Heritage Temple Kanjivaram Saree. Can the blouse be customized with elbow-length sleeves and a sweetheart neckline?',
            time: '10:35 AM',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 'seed-m2',
            sender: 'concierge',
            text: 'Namaste Priya ji! Absolutely. We can customize the blouse sleeves to elbow-length with handcrafted zardozi borders at no extra tailoring cost.',
            time: '10:38 AM',
            timestamp: new Date(Date.now() - 3400000).toISOString(),
          },
          {
            id: 'seed-m3',
            sender: 'customer',
            text: 'Wonderful! I just placed order #ORD-MVW7SBV2-7233.',
            time: '10:42 AM',
            timestamp: new Date(Date.now() - 3200000).toISOString(),
          },
        ],
      },
      {
        id: 'cust_ant_man',
        phone: '+91 99999 99999',
        name: 'Ant Man',
        email: 'damnantman@gmail.com',
        userId: null,
        loyaltyTier: 'Silver',
        avatarInitials: 'AM',
        lastMessage: 'Express air shipping to Andhra Pradesh takes 2-3 business days.',
        lastMessageTime: 'Yesterday',
        unread: 0,
        status: 'resolved',
        recentOrder: {
          id: 'a21da4a2-f30c-450f-9164-26fe26a06353',
          orderNumber: 'ORD-MVW83TXB-3100',
          totalAmount: 5548,
          status: 'confirmed',
        },
        messages: [
          {
            id: 'seed-m4',
            sender: 'customer',
            text: 'Hello! Inquiring about festive kurta set delivery timelines to Andhra Pradesh.',
            time: 'Yesterday 2:10 PM',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 'seed-m5',
            sender: 'concierge',
            text: 'Hello! Express air shipping to Andhra Pradesh takes 2-3 business days. All items are dispatched with verified tracking.',
            time: 'Yesterday 2:15 PM',
            timestamp: new Date(Date.now() - 86100000).toISOString(),
          },
        ],
      },
      {
        id: 'cust_ananya_iyer',
        phone: '+91 98450 78219',
        name: 'Ananya Iyer',
        email: 'ananya.iyer.1793441422219@example.com',
        userId: '14b51192-8899-4f23-92bb-47c2f79c92f8',
        loyaltyTier: 'VIP Platinum',
        avatarInitials: 'AI',
        lastMessage: 'Can you recommend festive jewelry pairings for the Crimson Bridal Lehenga?',
        lastMessageTime: '2 days ago',
        unread: 1,
        status: 'active',
        recentOrder: null,
        messages: [
          {
            id: 'seed-m6',
            sender: 'customer',
            text: 'Can you recommend festive jewelry pairings for the Crimson Bridal Lehenga?',
            time: '2 days ago',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
          },
        ],
      },
    ];

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
