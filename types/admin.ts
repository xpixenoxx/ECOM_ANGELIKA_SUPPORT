import type { Database } from './database';
import type { ReferralData } from './commerce';

type Tables = Database['public']['Tables'];
type ContentBlock = Tables['content_blocks']['Row'];
type DesignTokens = Tables['design_tokens']['Row'];
type Coupon = Tables['coupons']['Row'];
type Wishlist = Tables['wishlists']['Row'];
type Review = Tables['reviews']['Row'];
type LoyaltyTransaction = Tables['loyalty_transactions']['Row'];
type WhatsAppConversation = Tables['whatsapp_conversations']['Row'];
type Order = Tables['orders']['Row'];
type OrderItem = Tables['order_items']['Row'];

// ============================================
// ADMIN TYPES
// ============================================

export type BlockType =
  | 'container'
  | 'grid'
  | 'columns'
  | 'section'
  | 'spacer'
  | 'heading'
  | 'text'
  | 'rich_text'
  | 'image'
  | 'video'
  | 'button'
  | 'product_grid'
  | 'product_card'
  | 'collection_banner'
  | 'featured_product'
  | 'cart_drawer_trigger'
  | 'instagram_feed'
  | 'whatsapp_button'
  | 'reviews'
  | 'user_generated'
  | 'vidyas_note'
  | 'size_guide'
  | 'fabric_swatch'
  | 'story_timeline'
  | 'custom_html'
  | 'custom_react'
  | 'form'
  | 'accordion'
  | 'tabs';

export interface BlockDefinition {
  type: BlockType;
  label: string;
  icon: string;
  category: 'layout' | 'content' | 'commerce' | 'social' | 'brand' | 'advanced';
  description: string;
  defaultContent: Record<string, any>;
  settingsSchema: BlockSettingsSchema;
  allowedChildren?: BlockType[];
  maxChildren?: number;
}

export interface BlockSettingsSchema {
  [key: string]: {
    type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'color' | 'image' | 'video' | 'product' | 'collection' | 'json';
    label: string;
    description?: string;
    default?: any;
    required?: boolean;
    options?: { value: string; label: string }[];
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
    };
  };
}

export interface ContentBlockData extends ContentBlock {
  blocks?: ContentBlockData[];
  parentId?: string;
  order?: number;
  depth?: number;
}

export interface EditorState {
  blocks: ContentBlockData[];
  selectedId: string | null;
  hoveredId: string | null;
  draggedId: string | null;
  device: 'desktop' | 'tablet' | 'mobile';
  history: ContentBlockData[][];
  historyIndex: number;
  isDirty: boolean;
  isPublishing: boolean;
  lastSaved: Date | null;
}

export interface DevicePreset {
  id: 'desktop' | 'tablet' | 'mobile';
  label: string;
  icon: string;
  width: number;
  height: number;
  breakpoint: string;
}

export const DEVICE_PRESETS: DevicePreset[] = [
  { id: 'desktop', label: 'Desktop', icon: '💻', width: 1440, height: 900, breakpoint: 'lg' },
  { id: 'tablet', label: 'Tablet', icon: '📱', width: 768, height: 1024, breakpoint: 'md' },
  { id: 'mobile', label: 'Mobile', icon: '📲', width: 375, height: 667, breakpoint: 'sm' },
];

export interface DesignTokenEditorState {
  tokens: DesignTokens['tokens'];
  activeVersion: string;
  versions: DesignTokenVersion[];
  activeTab: DesignTokenTab;
  hasChanges: boolean;
  isSaving: boolean;
  isPublishing: boolean;
}

export type DesignTokenTab = 'colors' | 'typography' | 'spacing' | 'shadows' | 'radius' | 'animations' | 'breakpoints' | 'z-index';

export interface DesignTokenVersion {
  version: string;
  tokens: DesignTokens['tokens'];
  is_active: boolean;
  created_by: string;
  created_at: string;
  created_by_name?: string;
}

export interface ColorTokenGroup {
  id: string;
  label: string;
  description: string;
  tokens: string[];
  expanded: boolean;
}

export interface TypographyToken {
  name: string;
  value: {
    fontSize: string;
    lineHeight: string;
    fontWeight: string | number;
    letterSpacing?: string;
    textTransform?: string;
  };
  category: 'display' | 'heading' | 'body' | 'caption' | 'special';
}

export interface SpacingToken {
  name: string;
  value: string;
  px: number;
}

export interface ShadowToken {
  name: string;
  value: string;
  preview: string;
}

export interface RadiusToken {
  name: string;
  value: string;
}

export interface AnimationToken {
  name: string;
  value: string;
  category: 'duration' | 'easing' | 'keyframes' | 'magnetic';
}

export interface ProductEditorState {
  product: ProductEditorData | null;
  activeTab: ProductEditorTab;
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  previewMode: 'desktop' | 'mobile';
  images: ProductImageEditor[];
  variants: VariantEditor[];
}

export type ProductEditorTab = 'basics' | 'variants' | 'images' | 'seo' | 'schedule' | 'inventory' | 'attributes';

export interface ProductEditorData {
  id?: string;
  sku: string;
  slug: string;
  name: string;
  name_hi: string;
  description: string;
  description_hi: string;
  short_description: string;
  category_id: string;
  subcategory_id: string | null;
  fabric: FabricData;
  occasion: string[];
  tags: string[];
  vidyas_note: string;
  vidyas_note_hi: string;
  is_active: boolean;
  is_featured: boolean;
  is_vidyas_pick: boolean;
  gst_slab: 5 | 12 | 18;
  hsn_code: string;
  meta_title: string;
  meta_description: string;
}

export interface FabricData {
  primary: string;
  composition: string;
  origin: string;
  care: string[];
  certifications: string[];
}

export interface ProductImageEditor {
  id: string;
  url: string;
  alt_text: string;
  type: 'lifestyle' | 'detail' | 'flat_lay' | 'model' | 'fabric' | 'video';
  sort_order: number;
  is_primary: boolean;
  variant_id?: string;
  file?: File;
  uploadProgress?: number;
}

export interface VariantEditor {
  id?: string;
  product_id: string;
  size: string;
  color_id: string;
  color?: { id: string; name: string; hex: string };
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  inventory_quantity: number;
  low_stock_threshold: number;
  weight_grams: number | null;
  barcode: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface VariantMatrixCell {
  size: string;
  color_id: string;
  variant: VariantEditor | null;
  editing: boolean;
}

export interface OrderEditorState {
  orders: OrderListItem[];
  selectedOrder: OrderDetail | null;
  filters: OrderFilters;
  pagination: PaginationState;
  isLoading: boolean;
  bulkAction: BulkAction | null;
}

export interface OrderListItem {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  status: string;
  payment_status: string;
  total_amount: number;
  item_count: number;
  created_at: string;
  shipping_address: string;
}

export interface OrderDetail {
  id: string;
  order_number: string;
  customer: CustomerInfo;
  items: OrderItemDetail[];
  timeline: OrderTimelineEvent[];
  shipping: ShippingInfo;
  payment: PaymentInfo;
  notes: string;
  vidyas_note: string;
  refunds: RefundInfo[];
}

export interface CustomerInfo {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  loyalty_tier: string;
  total_orders: number;
  total_spent: number;
}

export interface OrderItemDetail {
  id: string;
  product_name: string;
  variant_details: {
    size: string;
    color: string;
    sku: string;
  };
  quantity: number;
  unit_price: number;
  total_price: number;
  product_image: string;
}

export interface OrderTimelineEvent {
  id: string;
  type: 'created' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'refunded' | 'note_added';
  title: string;
  description: string;
  timestamp: string;
  actor: 'system' | 'customer' | 'admin';
  actor_name?: string;
  metadata?: Record<string, any>;
}

export interface ShippingInfo {
  address: Address;
  method: string;
  tracking_number: string | null;
  courier_partner: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  estimated_delivery: string | null;
}

export interface PaymentInfo {
  method: string;
  status: string;
  payment_id: string | null;
  amount: number;
  refunded_amount: number;
  transactions: PaymentTransaction[];
}

export interface PaymentTransaction {
  id: string;
  type: 'payment' | 'refund';
  amount: number;
  status: string;
  gateway: string;
  gateway_transaction_id: string;
  created_at: string;
}

export interface RefundInfo {
  id: string;
  amount: number;
  reason: string;
  status: string;
  processed_at: string | null;
  processed_by: string | null;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email?: string;
}

export interface OrderFilters {
  status: string[];
  payment_status: string[];
  date_range: { from: string | null; to: string | null };
  search: string;
  min_amount: number | null;
  max_amount: number | null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type BulkAction =
  | { type: 'update_status'; status: string }
  | { type: 'assign_courier'; courier: string }
  | { type: 'print_invoices' }
  | { type: 'export_csv' }
  | { type: 'bulk_refund'; amount: number; reason: string };

export interface CustomerEditorState {
  customers: CustomerListItem[];
  selectedCustomer: CustomerDetail | null;
  filters: CustomerFilters;
  pagination: PaginationState;
  segments: CustomerSegment[];
}

export interface CustomerListItem {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  loyalty_tier: string;
  loyalty_points: number;
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
  created_at: string;
  status: 'active' | 'inactive' | 'blocked';
}

export interface CustomerDetail extends CustomerListItem {
  addresses: Address[];
  orders: OrderListItem[];
  wishlist: Wishlist[];
  reviews: Review[];
  whatsapp_conversations: WhatsAppConversation[];
  loyalty_transactions: LoyaltyTransaction[];
  referrals: ReferralData;
  notes: string;
}

export interface CustomerFilters {
  loyalty_tier: string[];
  status: string[];
  date_range: { from: string | null; to: string | null };
  search: string;
  min_orders: number | null;
  min_spent: number | null;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  rules: SegmentRule[];
  customer_count: number;
  is_dynamic: boolean;
}

export interface SegmentRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  value: any;
}

export interface WhatsAppEditorState {
  conversations: WhatsAppConversationListItem[];
  selectedConversation: WhatsAppConversationDetail | null;
  templates: WhatsAppTemplate[];
  flows: WhatsAppFlow[];
  filters: WhatsAppFilters;
  pagination: PaginationState;
  isLoading: boolean;
}

export interface WhatsAppConversationListItem {
  id: string;
  phone: string;
  customer_name: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  status: 'open' | 'closed' | 'pending';
  assigned_to: string | null;
}

export interface WhatsAppConversationDetail {
  id: string;
  phone: string;
  customer: CustomerInfo | null;
  messages: WhatsAppMessage[];
  status: 'open' | 'closed' | 'pending';
  assigned_to: string | null;
  tags: string[];
}

export interface WhatsAppMessage {
  id: string;
  type: 'incoming' | 'outgoing' | 'template' | 'flow' | 'system';
  content: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'document' | 'audio';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  template_name?: string;
  flow_token?: string;
  flow_response?: Record<string, any>;
  ai_handled: boolean;
  human_handoff: boolean;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'marketing' | 'utility' | 'authentication';
  language: string;
  status: 'approved' | 'pending' | 'rejected';
  components: WhatsAppTemplateComponent[];
  created_at: string;
  updated_at: string;
}

export interface WhatsAppTemplateComponent {
  type: 'header' | 'body' | 'footer' | 'button';
  format?: 'text' | 'image' | 'video' | 'document';
  text?: string;
  example?: any;
  buttons?: WhatsAppTemplateButton[];
}

export interface WhatsAppTemplateButton {
  type: 'quick_reply' | 'url' | 'phone_number' | 'copy_code' | 'catalog' | 'flow';
  text: string;
  url?: string;
  phone_number?: string;
  flow_id?: string;
  flow_action?: string;
}

export interface WhatsAppFlow {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  screens: WhatsAppFlowScreen[];
  created_at: string;
  updated_at: string;
}

export interface WhatsAppFlowScreen {
  id: string;
  title: string;
  layout: 'form' | 'radio' | 'checkbox' | 'select' | 'result' | 'custom';
  fields: WhatsAppFlowField[];
  conditions?: WhatsAppFlowCondition[];
  next_screen?: string;
}

export interface WhatsAppFlowField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'phone' | 'select' | 'radio' | 'checkbox' | 'date' | 'location';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface WhatsAppFlowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  next_screen: string;
}

export interface WhatsAppFilters {
  status: string[];
  assigned_to: string | null;
  date_range: { from: string | null; to: string | null };
  search: string;
  type: string[];
}

export interface AnalyticsState {
  overview: AnalyticsOverview;
  funnel: FunnelData[];
  cohorts: CohortData[];
  realtime: RealtimeData;
  products: ProductAnalytics[];
  campaigns: CampaignAnalytics[];
  dateRange: { from: string; to: string };
}

export interface AnalyticsOverview {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  conversionRate: number;
  repeatPurchaseRate: number;
  whatsappRevenueShare: number;
  codRate: number;
  returnRate: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
}

export interface FunnelData {
  step: string;
  visitors: number;
  conversionRate: number;
  dropoffRate: number;
}

export interface CohortData {
  cohort: string;
  size: number;
  retention: number[];
  revenue: number[];
}

export interface RealtimeData {
  activeVisitors: number;
  currentPageViews: number;
  activeCarts: number;
  checkingOut: number;
  recentOrders: OrderListItem[];
}

export interface ProductAnalytics {
  product_id: string;
  name: string;
  views: number;
  addToCarts: number;
  purchases: number;
  revenue: number;
  conversionRate: number;
  returnRate: number;
  avgRating: number;
  stockLevel: number;
}

export interface CampaignAnalytics {
  id: string;
  name: string;
  type: 'email' | 'whatsapp' | 'social' | 'referral';
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
  roi: number;
}

export interface SettingsState {
  general: GeneralSettings;
  payments: PaymentSettings;
  shipping: ShippingSettings;
  taxes: TaxSettings;
  emails: EmailSettings;
  webhooks: WebhookSettings;
  notifications: NotificationSettings;
}

export interface GeneralSettings {
  site_name: string;
  site_description: string;
  site_url: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  currency: string;
  timezone: string;
  language: string;
  maintenance_mode: boolean;
  maintenance_message: string;
}

export interface PaymentSettings {
  razorpay_enabled: boolean;
  razorpay_key_id: string;
  razorpay_key_secret: string;
  razorpay_webhook_secret: string;
  stripe_enabled: boolean;
  stripe_publishable_key: string;
  stripe_secret_key: string;
  stripe_webhook_secret: string;
  cod_enabled: boolean;
  cod_max_amount: number;
  cod_fee: number;
  upi_enabled: boolean;
}

export interface ShippingSettings {
  free_shipping_threshold: number;
  default_shipping_cost: number;
  shipping_zones: ShippingZone[];
  courier_partners: CourierPartner[];
  pickup_points_enabled: boolean;
}

export interface ShippingZone {
  id: string;
  name: string;
  states: string[];
  cost: number;
  free_shipping_threshold: number;
  estimated_days: string;
}

export interface CourierPartner {
  id: string;
  name: string;
  api_key: string;
  api_secret: string;
  webhook_url: string;
  enabled: boolean;
  cod_enabled: boolean;
  serviceable_pincodes: string[];
}

export interface TaxSettings {
  gst_enabled: boolean;
  gst_slabs: { rate: number; hsn_code: string; description: string }[];
  inclusive_pricing: boolean;
  invoice_prefix: string;
  invoice_series: string;
}

export interface EmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
  templates: EmailTemplate[];
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  text_content: string;
  variables: string[];
}

export interface WebhookSettings {
  order_created: string;
  order_confirmed: string;
  order_shipped: string;
  order_delivered: string;
  order_cancelled: string;
  payment_received: string;
  payment_failed: string;
  return_requested: string;
  return_completed: string;
  inventory_low: string;
  customer_created: string;
}

export interface NotificationSettings {
  email_new_order: boolean;
  email_low_stock: boolean;
  email_return_request: boolean;
  whatsapp_new_order: boolean;
  whatsapp_return_request: boolean;
  slack_webhook: string;
  discord_webhook: string;
}

export interface AuditLogEntry {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  ip_address: string;
  user_agent: string;
  created_at: string;
}