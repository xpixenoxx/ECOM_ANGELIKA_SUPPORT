'use server';

import { randomInt } from '@/lib/utils/edge-crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { OPS_ADMIN_ROLES, logAdminAction, requireAdminRole } from '@/lib/supabase/admin-auth';
import { executeGatewayRefund } from '@/lib/actions/payments';
import { revalidatePath } from 'next/cache';
import {
  Return,
  ReturnWithDetails,
  ReturnStatus,
  ReturnListResult,
  ReturnSingleResult,
  ReturnMutationResult,
  ReturnStats,
  ReturnFilters,
  SchedulePickupInput,
  ProcessRefundInput,
  ProcessExchangeInput,
  RETURN_STATUSES,
  RETURN_TYPES,
  RETURN_REASONS,
} from './returns-types';

// ============================================
// SERVER ACTIONS - RETURNS/EXCHANGES
// ============================================

/**
 * Get return statistics for admin dashboard
 */
export async function getReturnStats(): Promise<ReturnStats> {
  try {
    const auth = await requireAdminRole(OPS_ADMIN_ROLES);
    if (!auth.authorized) {
      return {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        completedRequests: 0,
        rejectedRequests: 0,
        totalRefundAmount: 0,
        avgProcessingDays: 0,
        returnRate: 0,
        recentReturns: [],
      };
    }
    const supabase = supabaseAdmin;

    // Get counts by status
    const statuses = ['requested', 'approved', 'received', 'refunded', 'exchanged', 'rejected', 'cancelled'];
    const counts: Record<string, number> = {};

    for (const status of statuses) {
      const { count } = await supabase
        .from('returns')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);
      counts[status] = count || 0;
    }

    // Total refund amount
    const { data: refundData } = await supabase
      .from('returns')
      .select('refund_amount')
      .eq('status', 'refunded')
      .not('refund_amount', 'is', null);

    const totalRefundAmount = refundData?.reduce((sum, r) => sum + (r.refund_amount || 0), 0) || 0;

    // Average processing days (from requested to refunded/exchanged)
    const { data: completedReturns } = await supabase
      .from('returns')
      .select('created_at, updated_at')
      .in('status', ['refunded', 'exchanged']);

    let avgProcessingDays = 0;
    if (completedReturns && completedReturns.length > 0) {
      const totalDays = completedReturns.reduce((sum, r) => {
        const created = new Date(r.created_at).getTime();
        const updated = new Date(r.updated_at).getTime();
        return sum + (updated - created) / (1000 * 60 * 60 * 24);
      }, 0);
      avgProcessingDays = Math.round(totalDays / completedReturns.length * 10) / 10;
    }

    // Return rate (returns / total delivered orders in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [{ count: totalReturns }, { count: deliveredOrders }] = await Promise.all([
      supabase.from('returns').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'delivered').gte('created_at', thirtyDaysAgo),
    ]);

    const returnRate = deliveredOrders && deliveredOrders > 0 ? ((totalReturns || 0) / deliveredOrders) * 100 : 0;

    // Recent returns
    const { data: recentReturns } = await supabase
      .from('returns')
      .select(`
        *,
        order:orders!returns_order_id_fkey (id, order_number, total_amount, status, created_at),
        order_item:order_items!returns_order_item_id_fkey (
          id,
          product_name,
          quantity,
          unit_price,
          variant_details,
          product:products!order_items_product_id_fkey (id, name, slug, images:product_images (url, alt_text, is_primary)),
          variant:product_variants!order_items_variant_id_fkey (id, size, color:colors (id, name, hex))
        ),
        user:profiles!returns_user_id_fkey (id, full_name, email, phone)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    return {
      totalRequests: Object.values(counts).reduce((a, b) => a + b, 0),
      pendingRequests: (counts['requested'] || 0) + (counts['approved'] || 0) + (counts['picked_up'] || 0) + (counts['received'] || 0) + (counts['inspected'] || 0),
      approvedRequests: counts['approved'] || 0,
      completedRequests: (counts['refunded'] || 0) + (counts['exchanged'] || 0),
      rejectedRequests: counts['rejected'] || 0,
      totalRefundAmount,
      avgProcessingDays,
      returnRate: Math.round(returnRate * 10) / 10,
      recentReturns: recentReturns || [],
    };
  } catch (error) {
    console.error('Get return stats error:', error);
    return {
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      completedRequests: 0,
      rejectedRequests: 0,
      totalRefundAmount: 0,
      avgProcessingDays: 0,
      returnRate: 0,
      recentReturns: [],
    };
  }
}

/**
 * Get returns with filters and pagination
 */
export async function getReturns(
  page = 1,
  limit = 20,
  filters: ReturnFilters = {}
): Promise<ReturnListResult> {
  try {
    const auth = await requireAdminRole(OPS_ADMIN_ROLES);
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Unauthorized' };
    }
    const supabase = supabaseAdmin;

    let query = supabase
      .from('returns')
      .select(`
        *,
        order:orders!returns_order_id_fkey (id, order_number, total_amount, status, created_at, shipping_address),
        order_item:order_items!returns_order_item_id_fkey (
          id,
          product_name,
          quantity,
          unit_price,
          variant_details,
          product:products!order_items_product_id_fkey (id, name, slug, images:product_images (url, alt_text, is_primary)),
          variant:product_variants!order_items_variant_id_fkey (id, size, color:colors (id, name, hex))
        ),
        user:profiles!returns_user_id_fkey (id, full_name, email, phone)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.reason) {
      query = query.eq('reason', filters.reason);
    }
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    const { data: returns, error, count } = await query;

    if (error) {
      console.error('Get returns error:', error);
      return { success: false, error: error.message };
    }

    let finalReturns = returns || [];
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      finalReturns = finalReturns.filter((r: any) =>
        r.order?.order_number?.toLowerCase().includes(q) ||
        r.user?.full_name?.toLowerCase().includes(q) ||
        r.user?.email?.toLowerCase().includes(q) ||
        r.order_item?.product_name?.toLowerCase().includes(q)
      );
    }

    return {
      success: true,
      returns: finalReturns,
      total: count || finalReturns.length,
    };
  } catch (error) {
    console.error('Get returns error:', error);
    return { success: false, error: 'Failed to fetch returns' };
  }
}

/**
 * Get single return with full details
 */
export async function getReturn(id: string): Promise<ReturnSingleResult> {
  try {
    const auth = await requireAdminRole(OPS_ADMIN_ROLES);
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Unauthorized' };
    }
    const supabase = supabaseAdmin;

    const { data: returnData, error } = await supabase
      .from('returns')
      .select(`
        *,
        order:orders!returns_order_id_fkey (id, order_number, total_amount, status, created_at, shipping_address, billing_address),
        order_item:order_items!returns_order_item_id_fkey (
          id,
          product_name,
          quantity,
          unit_price,
          variant_details,
          product:products!order_items_product_id_fkey (id, name, slug, images:product_images (url, alt_text, is_primary)),
          variant:product_variants!order_items_variant_id_fkey (id, size, color:colors (id, name, hex))
        ),
        user:profiles!returns_user_id_fkey (id, full_name, email, phone)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, return: returnData as ReturnWithDetails };
  } catch (error) {
    console.error('Get return error:', error);
    return { success: false, error: 'Failed to fetch return' };
  }
}

/**
 * Update return status
 */
export async function updateReturnStatus(
  id: string,
  status: string,
  adminNotes?: string
): Promise<ReturnMutationResult> {
  try {
    const auth = await requireAdminRole(OPS_ADMIN_ROLES);
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Unauthorized' };
    }
    const supabase = supabaseAdmin;

    // Validate status transition
    const currentReturn = await getReturn(id);
    if (!currentReturn.success || !currentReturn.return) {
      return { success: false, error: 'Return not found' };
    }

    const currentStatus = currentReturn.return.status;
    const statusConfig = RETURN_STATUSES.find(s => s.value === currentStatus);

    if (statusConfig && !statusConfig.nextStatuses.includes(status)) {
      return { success: false, error: `Cannot transition from ${currentStatus} to ${status}` };
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (adminNotes) {
      updateData.admin_notes = adminNotes;
    }

    const { data: updatedReturn, error } = await supabase
      .from('returns')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        order:orders!returns_order_id_fkey (id, order_number, total_amount, status, created_at),
        order_item:order_items!returns_order_item_id_fkey (
          id,
          product_name,
          quantity,
          unit_price,
          variant_details,
          product:products!order_items_product_id_fkey (id, name, slug, images:product_images (url, alt_text, is_primary)),
          variant:product_variants!order_items_variant_id_fkey (id, size, color:colors (id, name, hex))
        ),
        user:profiles!returns_user_id_fkey (id, full_name, email, phone)
      `)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    await logAdminAction({
      actorId: auth.userId,
      action: 'update_return_status',
      entityType: 'return',
      entityId: id,
      afterState: { status, adminNotes },
    });

    revalidatePath('/admin/orders/returns');
    revalidatePath(`/admin/orders/returns/${id}`);
    revalidatePath('/account/orders');

    return { success: true, return: updatedReturn as ReturnWithDetails };
  } catch (error) {
    console.error('Update return status error:', error);
    return { success: false, error: 'Failed to update return status' };
  }
}

/**
 * Inspect returned garment and atomically restore stock if inspection passes
 */
export async function inspectReturn(
  returnId: string,
  passed: boolean,
  notes?: string
): Promise<ReturnMutationResult> {
  try {
    const auth = await requireAdminRole(OPS_ADMIN_ROLES);
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Unauthorized' };
    }

    const { error: rpcErr } = await supabaseAdmin.rpc('complete_return_inspection', {
      p_return_id: returnId,
      p_passed: passed,
      p_notes: notes ?? undefined,
    });

    if (rpcErr) {
      return { success: false, error: rpcErr.message };
    }

    await logAdminAction({
      actorId: auth.userId,
      action: 'inspect_return',
      entityType: 'return',
      entityId: returnId,
      afterState: { passed, notes },
    });

    revalidatePath('/admin/orders/returns');
    revalidatePath('/admin/products/inventory');
    revalidatePath('/account/orders');

    const refreshed = await getReturn(returnId);
    return { success: true, return: refreshed.return };
  } catch (error) {
    console.error('Inspect return error:', error);
    return { success: false, error: 'Failed to inspect return' };
  }
}

/**
 * Schedule pickup for return
 */
export async function schedulePickup(input: SchedulePickupInput): Promise<ReturnMutationResult> {
  try {
    const auth = await requireAdminRole(OPS_ADMIN_ROLES);
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Unauthorized' };
    }
    const supabase = supabaseAdmin;

    const pickupOtp = randomInt(100000, 1000000).toString();

    const { data: updatedReturn, error } = await supabase
      .from('returns')
      .update({
        status: 'picked_up',
        courier_partner: input.courierPartner,
        pickup_address: input.pickupAddress,
        pickup_scheduled_at: input.scheduledAt,
        pickup_otp: pickupOtp,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.returnId)
      .select(`
        *,
        order:orders!returns_order_id_fkey (id, order_number, total_amount, status, created_at),
        order_item:order_items!returns_order_item_id_fkey (
          id,
          product_name,
          quantity,
          unit_price,
          variant_details,
          product:products!order_items_product_id_fkey (id, name, slug, images:product_images (url, alt_text, is_primary)),
          variant:product_variants!order_items_variant_id_fkey (id, size, color:colors (id, name, hex))
        ),
        user:profiles!returns_user_id_fkey (id, full_name, email, phone)
      `)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    await logAdminAction({
      actorId: auth.userId,
      action: 'schedule_return_pickup',
      entityType: 'return',
      entityId: input.returnId,
      afterState: { courierPartner: input.courierPartner, scheduledAt: input.scheduledAt },
    });

    revalidatePath('/admin/orders/returns');
    revalidatePath(`/admin/orders/returns/${input.returnId}`);
    revalidatePath('/admin/products/inventory');
    revalidatePath('/account/orders');

    return { success: true, return: updatedReturn as ReturnWithDetails };
  } catch (error) {
    console.error('Schedule pickup error:', error);
    return { success: false, error: 'Failed to schedule pickup' };
  }
}

/**
 * Process refund for return (enforces amount bounds and invokes gateway refund for prepaid orders)
 */
export async function processRefund(input: ProcessRefundInput): Promise<ReturnMutationResult> {
  try {
    const auth = await requireAdminRole(OPS_ADMIN_ROLES);
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Unauthorized' };
    }
    const supabase = supabaseAdmin;

    const { data: existingReturn, error: retErr } = await supabase
      .from('returns')
      .select(`
        *,
        order:orders!returns_order_id_fkey(id, payment_method, payment_status, total_amount),
        order_item:order_items!returns_order_item_id_fkey(id, unit_price, quantity, total_price)
      `)
      .eq('id', input.returnId)
      .single();

    if (retErr || !existingReturn) {
      return { success: false, error: 'Return not found' };
    }
    if (existingReturn.status === 'refunded') {
      return { success: false, error: 'Return has already been refunded' };
    }

    const orderInfo: any = existingReturn.order;
    const itemInfo: any = existingReturn.order_item;
    const maxItemRefund = Number(
      itemInfo?.total_price ?? Number(itemInfo?.unit_price || 0) * Number(itemInfo?.quantity || 1)
    );
    const boundedAmount = Math.min(
      Math.max(1, Number(input.refundAmount || maxItemRefund)),
      maxItemRefund > 0 ? maxItemRefund : Number(orderInfo?.total_amount || input.refundAmount)
    );

    let refundReference: string | null = null;
    if (
      orderInfo &&
      (orderInfo.payment_method === 'razorpay' || orderInfo.payment_method === 'stripe') &&
      (orderInfo.payment_status === 'paid' || orderInfo.payment_status === 'partially_refunded')
    ) {
      const gw = await executeGatewayRefund(
        existingReturn.order_id,
        boundedAmount,
        input.notes || 'Approved return refund',
        { restoreInventory: false, idempotencyKey: `ret_refund_${input.returnId.replace(/-/g, '')}` }
      );
      if (!gw.success) {
        return { success: false, error: gw.error || 'Gateway refund failed' };
      }
      refundReference = gw.refundId || null;
    }

    const { data: updatedReturn, error } = await supabase
      .from('returns')
      .update({
        status: 'refunded',
        refund_amount: boundedAmount,
        refund_reference: refundReference,
        admin_notes: input.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.returnId)
      .select(`
        *,
        order:orders!returns_order_id_fkey (id, order_number, total_amount, status, created_at),
        order_item:order_items!returns_order_item_id_fkey (
          id,
          product_name,
          quantity,
          unit_price,
          variant_details,
          product:products!order_items_product_id_fkey (id, name, slug, images:product_images (url, alt_text, is_primary)),
          variant:product_variants!order_items_variant_id_fkey (id, size, color:colors (id, name, hex))
        ),
        user:profiles!returns_user_id_fkey (id, full_name, email, phone)
      `)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    await logAdminAction({
      actorId: auth.userId,
      action: 'process_return_refund',
      entityType: 'return',
      entityId: input.returnId,
      afterState: { refundAmount: boundedAmount, paymentMethod: input.paymentMethod, refundReference },
    });

    revalidatePath('/admin/orders/returns');
    revalidatePath(`/admin/orders/returns/${input.returnId}`);
    revalidatePath('/admin/products/inventory');
    revalidatePath('/account/orders');

    return { success: true, return: updatedReturn as ReturnWithDetails };
  } catch (error) {
    console.error('Process refund error:', error);
    return { success: false, error: 'Failed to process refund' };
  }
}

/**
 * Process exchange for return
 */
export async function processExchange(input: ProcessExchangeInput): Promise<ReturnMutationResult> {
  try {
    const auth = await requireAdminRole(OPS_ADMIN_ROLES);
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Unauthorized' };
    }
    const supabase = supabaseAdmin;

    const { data: variant } = await supabase
      .from('product_variants')
      .select('id, size, inventory_quantity, color:colors (id, name, hex), product:products!product_variants_product_id_fkey (id, name, slug)')
      .eq('id', input.exchangeVariantId)
      .single();

    if (!variant) {
      return { success: false, error: 'Exchange variant not found' };
    }

    if (Number(variant.inventory_quantity || 0) < 1) {
      return { success: false, error: `Selected exchange size (${variant.size}) is currently out of stock` };
    }

    // Reserve 1 unit of replacement variant cleanly
    const { data: decremented } = await supabase
      .from('product_variants')
      .update({
        inventory_quantity: Math.max(0, Number(variant.inventory_quantity) - 1),
        updated_at: new Date().toISOString(),
      })
      .eq('id', variant.id)
      .gte('inventory_quantity', 1)
      .select('id')
      .maybeSingle();

    if (!decremented) {
      return { success: false, error: 'Replacement size stock depleted concurrently. Please choose another variant.' };
    }

    const { data: updatedReturn, error } = await supabase
      .from('returns')
      .update({
        status: 'exchanged',
        exchange_variant_id: input.exchangeVariantId,
        exchange_size: variant.size,
        exchange_color_id: (variant as any).color?.id || (Array.isArray(variant.color) ? (variant.color as any)[0]?.id : null),
        admin_notes: input.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.returnId)
      .select(`
        *,
        order:orders!returns_order_id_fkey (id, order_number, total_amount, status, created_at),
        order_item:order_items!returns_order_item_id_fkey (
          id,
          product_name,
          quantity,
          unit_price,
          variant_details,
          product:products!order_items_product_id_fkey (id, name, slug, images:product_images (url, alt_text, is_primary)),
          variant:product_variants!order_items_variant_id_fkey (id, size, color:colors (id, name, hex))
        ),
        user:profiles!returns_user_id_fkey (id, full_name, email, phone)
      `)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    await logAdminAction({
      actorId: auth.userId,
      action: 'process_return_exchange',
      entityType: 'return',
      entityId: input.returnId,
      afterState: { exchangeVariantId: input.exchangeVariantId, size: variant.size },
    });

    revalidatePath('/admin/orders/returns');
    revalidatePath(`/admin/orders/returns/${input.returnId}`);
    revalidatePath('/admin/products/inventory');
    revalidatePath('/account/orders');

    return { success: true, return: updatedReturn as ReturnWithDetails };
  } catch (error) {
    console.error('Process exchange error:', error);
    return { success: false, error: 'Failed to process exchange' };
  }
}

/**
 * Get return statuses
 */
export async function getReturnStatuses(): Promise<ReturnStatus[]> {
  return RETURN_STATUSES;
}

/**
 * Get return types
 */
export async function getReturnTypes(): Promise<typeof RETURN_TYPES> {
  return RETURN_TYPES;
}

/**
 * Get return reasons
 */
export async function getReturnReasons(): Promise<typeof RETURN_REASONS> {
  return RETURN_REASONS;
}