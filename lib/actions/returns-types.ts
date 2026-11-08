// ============================================
// RETURNS/EXCHANGES TYPES
// ============================================

import type { Database } from '@/types/database';

type ReturnRow = Database['public']['Tables']['returns']['Row'];
type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderItemRow = Database['public']['Tables']['order_items']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export interface Return extends ReturnRow {}

export interface ReturnWithDetails extends Return {
  order: Pick<OrderRow, 'id' | 'order_number' | 'total_amount' | 'status' | 'created_at'>;
  order_item: Pick<OrderItemRow, 'id' | 'product_name' | 'quantity' | 'unit_price' | 'variant_details'> & {
    product: {
      id: string;
      name: string;
      slug: string;
      images: Array<{ url: string; alt_text: string | null; is_primary: boolean }>;
    };
    variant: {
      id: string;
      size: string;
      color: { id: string; name: string; hex: string };
    } | null;
  };
  user: Pick<ProfileRow, 'id' | 'full_name' | 'email' | 'phone'>;
}

export interface ReturnStatus {
  value: string;
  label: string;
  description: string;
  color: string;
  allowedActions: string[];
  nextStatuses: string[];
}

export const RETURN_STATUSES: ReturnStatus[] = [
  {
    value: 'requested',
    label: 'Requested',
    description: 'Customer has requested return/exchange',
    color: 'var(--color-info)',
    allowedActions: ['approve', 'reject', 'request_more_info'],
    nextStatuses: ['approved', 'rejected', 'more_info_needed'],
  },
  {
    value: 'more_info_needed',
    label: 'More Info Needed',
    description: 'Additional information requested from customer',
    color: 'var(--color-warning)',
    allowedActions: ['approve', 'reject'],
    nextStatuses: ['approved', 'rejected'],
  },
  {
    value: 'approved',
    label: 'Approved',
    description: 'Return/exchange approved, awaiting pickup/drop-off',
    color: 'var(--color-primary)',
    allowedActions: ['schedule_pickup', 'provide_shipping_label', 'mark_received'],
    nextStatuses: ['picked_up', 'received', 'shipped'],
  },
  {
    value: 'picked_up',
    label: 'Picked Up',
    description: 'Return picked up by courier',
    color: 'var(--color-primary)',
    allowedActions: ['mark_received'],
    nextStatuses: ['received'],
  },
  {
    value: 'received',
    label: 'Received',
    description: 'Return received at warehouse',
    color: 'var(--color-primary)',
    allowedActions: ['inspect', 'process_refund', 'process_exchange'],
    nextStatuses: ['inspected', 'refunded', 'exchanged'],
  },
  {
    value: 'inspected',
    label: 'Inspected',
    description: 'Return inspected, decision pending',
    color: 'var(--color-warning)',
    allowedActions: ['process_refund', 'process_exchange', 'reject'],
    nextStatuses: ['refunded', 'exchanged', 'rejected'],
  },
  {
    value: 'refunded',
    label: 'Refunded',
    description: 'Refund processed to customer',
    color: 'var(--color-success)',
    allowedActions: [],
    nextStatuses: [],
  },
  {
    value: 'exchanged',
    label: 'Exchanged',
    description: 'Exchange processed and shipped',
    color: 'var(--color-success)',
    allowedActions: [],
    nextStatuses: [],
  },
  {
    value: 'rejected',
    label: 'Rejected',
    description: 'Return request rejected',
    color: 'var(--color-error)',
    allowedActions: [],
    nextStatuses: [],
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    description: 'Customer cancelled the return request',
    color: 'var(--color-slate)',
    allowedActions: [],
    nextStatuses: [],
  },
];

export const RETURN_TYPES = [
  { value: 'return', label: 'Return', icon: '↩️' },
  { value: 'exchange', label: 'Exchange', icon: '🔄' },
] as const;

export type ReturnType = typeof RETURN_TYPES[number]['value'];

export const RETURN_REASONS = [
  { value: 'size', label: 'Size Issue' },
  { value: 'fit', label: 'Fit & Silhouette' },
  { value: 'quality', label: 'Quality Issue' },
  { value: 'damaged', label: 'Damaged / Defective' },
  { value: 'wrong_item', label: 'Wrong Item / Color' },
  { value: 'changed_mind', label: 'Changed Mind' },
  { value: 'other', label: 'Other' },
  { value: 'wrong_size', label: 'Wrong Size' },
  { value: 'wrong_color', label: 'Wrong Color' },
  { value: 'not_as_described', label: 'Not as Described' },
  { value: 'quality_issue', label: 'Quality Issue' },
  { value: 'late_delivery', label: 'Late Delivery' },
] as const;

export type ReturnReason = typeof RETURN_REASONS[number]['value'];

export interface ReturnListResult {
  success: boolean;
  returns?: ReturnWithDetails[];
  total?: number;
  error?: string;
}

export interface ReturnSingleResult {
  success: boolean;
  return?: ReturnWithDetails;
  error?: string;
}

export interface ReturnMutationResult {
  success: boolean;
  return?: ReturnWithDetails;
  error?: string;
}

export interface ReturnStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  completedRequests: number;
  rejectedRequests: number;
  totalRefundAmount: number;
  avgProcessingDays: number;
  returnRate: number;
  recentReturns: ReturnWithDetails[];
}

export interface ReturnFilters {
  status?: string;
  type?: ReturnType;
  reason?: ReturnReason;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface SchedulePickupInput {
  returnId: string;
  courierPartner: string;
  pickupAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  scheduledAt: string;
}

export interface ProcessRefundInput {
  returnId: string;
  refundAmount: number;
  paymentMethod: 'original' | 'wallet' | 'bank_transfer';
  notes?: string;
}

export interface ProcessExchangeInput {
  returnId: string;
  exchangeVariantId: string;
  notes?: string;
}