export interface WhatsAppTemplateItem {
  id: string;
  name: string;
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  language: string;
  body: string;
  triggerEvent: string;
  paramPlaceholders: string[];
}

export interface WhatsAppLogRecord {
  id: string;
  phone: string;
  wa_message_id: string;
  type: string;
  status: string;
  template_name: string | null;
  template_params: Record<string, any> | null;
  metadata: Record<string, any> | null;
  user_id: string | null;
  created_at: string;
  customer_name?: string;
  order_number?: string;
}

export interface WhatsAppChatMessage {
  id: string;
  sender: 'customer' | 'concierge' | 'bot';
  text: string;
  time: string;
  timestamp: string;
  status?: string;
}

export interface WhatsAppConversationThread {
  id: string;
  phone: string;
  name: string;
  email?: string;
  userId?: string | null;
  loyaltyTier?: string;
  avatarInitials: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  status: 'active' | 'resolved' | 'bot';
  messages: WhatsAppChatMessage[];
  recentOrder?: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
  } | null;
}

export interface WhatsAppConversationsData {
  threads: WhatsAppConversationThread[];
  stats: {
    totalChats: number;
    activeChats: number;
    resolvedChats: number;
    totalMessages: number;
  };
}

export const OFFICIAL_TEMPLATES: WhatsAppTemplateItem[] = [
  {
    id: 't1',
    name: 'order_confirmed_v2',
    category: 'UTILITY',
    status: 'APPROVED',
    language: 'en_IN',
    body: 'Namaste {{1}}! Your luxury order #{{2}} from Angelika Fashions has been confirmed. Vidhya is personally curating your pieces with love. Track your order: {{3}}',
    triggerEvent: 'Fired immediately on checkout payment success',
    paramPlaceholders: ['Customer Name', 'Order Number', 'Tracking Link'],
  },
  {
    id: 't2',
    name: 'order_dispatched_tracking',
    category: 'UTILITY',
    status: 'APPROVED',
    language: 'en_IN',
    body: 'Greetings {{1}}! Your handcrafted ensemble for order #{{2}} has been dispatched via {{3}}. Tracking AWB: {{4}}. Delivery expected in 2-4 business days.',
    triggerEvent: 'Fired when order status changes to "shipped" in Admin',
    paramPlaceholders: ['Customer Name', 'Order Number', 'Courier Partner', 'AWB Tracking #'],
  },
  {
    id: 't3',
    name: 'out_for_delivery_alert',
    category: 'UTILITY',
    status: 'APPROVED',
    language: 'en_IN',
    body: 'Dear {{1}}, your Angelika package for order #{{2}} is out for delivery today with {{3}} courier partner! Please ensure someone is available at your address.',
    triggerEvent: 'Fired on courier delivery partner out-for-delivery webhook',
    paramPlaceholders: ['Customer Name', 'Order Number', 'Courier Partner'],
  },
  {
    id: 't4',
    name: 'bespoke_styling_followup',
    category: 'MARKETING',
    status: 'APPROVED',
    language: 'en_IN',
    body: 'Namaste {{1}}! Designer Vidhya noticed you explored our festive {{2}} collection. Would you like a personalized 1-on-1 virtual styling session or blouse customization?',
    triggerEvent: 'VIP cart drop-off or concierge consultation request',
    paramPlaceholders: ['Customer Name', 'Category / Collection'],
  },
];

