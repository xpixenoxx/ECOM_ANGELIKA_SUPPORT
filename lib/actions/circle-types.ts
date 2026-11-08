export interface CircleSubscriber {
  id: string;
  email: string;
  name?: string | null;
  status: 'active' | 'unsubscribed';
  subscribed_at: string;
  source: string;
  updates_received_count: number;
}

export interface CircleUpdate {
  id: string;
  title: string;
  subject: string;
  content: string;
  cta_text?: string | null;
  cta_link?: string | null;
  banner_image?: string | null;
  status: 'draft' | 'published';
  published_at: string;
  recipients_count: number;
  author_name: string;
  delivery_status?: 'sent' | 'pending_credentials' | 'failed';
  delivery_note?: string | null;
}

export interface CircleDashboardData {
  subscribers: CircleSubscriber[];
  updates: CircleUpdate[];
  stats: {
    totalSubscribers: number;
    activeSubscribers: number;
    totalUpdatesSent: number;
    latestUpdateDate: string | null;
    smtpConfigured?: boolean;
    senderEmail?: string;
  };
}

export const CIRCLE_QUICK_TEMPLATES = [
  {
    title: 'Festive Bridal Couture 2026 Collection Drop',
    subject: 'Namaste from Vidhya: Exclusive Early Access to Our Handcrafted Bridal Trousseau',
    content: 'We are thrilled to unveil our latest Festive Bridal collection. Each ensemble is meticulously handcrafted in pure Varanasi silk, featuring authentic zardozi embroidery and heirloom borders curated personally for the festive wedding season.',
    cta_text: 'Explore Bridal Collection',
    cta_link: '/shop/lehengas',
  },
  {
    title: 'Exclusive Circle Member Privilege: 15% Atelier Gift',
    subject: 'Your Private Angelika Circle Privilege Code: CIRCLE15',
    content: 'As a cherished member of the Angelika Circle, enjoy a complimentary 15% styling gift on all handwoven sarees and anarkali sets this weekend. Use code CIRCLE15 at checkout.',
    cta_text: 'Shop with CIRCLE15',
    cta_link: '/shop/sarees',
  },
  {
    title: 'Bespoke Blouse Stitching & Styling Masterclass',
    subject: 'Atelier Note: How to Measure and Pair Handcrafted Blouses with Vidhya',
    content: 'Discover the art of royal Indian drapery. In our new styling guide, designer Vidhya shares measurement tips for customized necklines, sleeve embellishments, and pairing heritage textiles.',
    cta_text: 'Read Styling Guide',
    cta_link: '/size-finder',
  },
];

