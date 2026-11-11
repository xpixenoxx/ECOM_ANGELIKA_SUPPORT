'use server';

import { revalidatePath } from 'next/cache';
import {
  createShiprocketOrder,
  assignShiprocketAWB,
  generateShiprocketPickup,
  generateShiprocketLabel,
  generateShiprocketManifest,
  trackShiprocketAWB,
  checkCourierServiceability,
  isShiprocketConfigured,
} from '@/lib/shipping/shiprocket';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function checkShiprocketStatusAction() {
  return {
    isConfigured: isShiprocketConfigured(),
    pickupLocation: process.env['SHIPROCKET_PICKUP_LOCATION'] || 'Primary',
    pickupPincode: process.env['SHIPROCKET_PICKUP_PINCODE'] || '302001',
  };
}

export async function checkServiceabilityAction(params: {
  pincode: string;
  isCod?: boolean;
}) {
  try {
    return await checkCourierServiceability({
      deliveryPincode: params.pincode,
      isCod: params.isCod,
    });
  } catch (err: any) {
    return {
      configured: isShiprocketConfigured(),
      serviceable: true,
      estimatedDeliveryDays: '3–5 days',
      codAvailable: true,
      error: err.message,
    };
  }
}

export async function createShiprocketOrderAction(orderId: string) {
  try {
    const result = await createShiprocketOrder(orderId);
    revalidatePath('/admin/orders/shipments');
    revalidatePath(`/admin/orders/${orderId}`);
    return result;
  } catch (err: any) {
    console.error('createShiprocketOrderAction error:', err);
    return { success: false, error: err.message || 'Failed to push order to Shiprocket' };
  }
}

export async function assignShiprocketAWBAction(params: {
  orderId: string;
  shipmentId: number;
  courierId?: number;
}) {
  try {
    const result = await assignShiprocketAWB(params);
    revalidatePath('/admin/orders/shipments');
    revalidatePath(`/admin/orders/${params.orderId}`);
    revalidatePath('/account/orders');
    return result;
  } catch (err: any) {
    console.error('assignShiprocketAWBAction error:', err);
    return { success: false, error: err.message || 'Failed to assign AWB in Shiprocket' };
  }
}

export async function generateShiprocketPickupAction(params: {
  orderId: string;
  shipmentId: number;
}) {
  try {
    const result = await generateShiprocketPickup(params);
    revalidatePath('/admin/orders/shipments');
    revalidatePath(`/admin/orders/${params.orderId}`);
    revalidatePath('/account/orders');
    return result;
  } catch (err: any) {
    console.error('generateShiprocketPickupAction error:', err);
    return { success: false, error: err.message || 'Failed to schedule pickup in Shiprocket' };
  }
}

export async function generateShiprocketLabelAction(shipmentId: number) {
  try {
    const result = await generateShiprocketLabel(shipmentId);
    return result;
  } catch (err: any) {
    console.error('generateShiprocketLabelAction error:', err);
    return { success: false, error: err.message || 'Failed to generate shipping label' };
  }
}

export async function generateShiprocketManifestAction(shipmentId: number) {
  try {
    const result = await generateShiprocketManifest(shipmentId);
    return result;
  } catch (err: any) {
    console.error('generateShiprocketManifestAction error:', err);
    return { success: false, error: err.message || 'Failed to generate manifest' };
  }
}

export async function trackShiprocketAWBAction(awbCode: string) {
  try {
    const result = await trackShiprocketAWB(awbCode);
    return { success: true, data: result };
  } catch (err: any) {
    console.error('trackShiprocketAWBAction error:', err);
    return { success: false, error: err.message || 'Failed to fetch tracking data' };
  }
}

export async function trackOrderByIdAction(orderNumberOrId: string) {
  try {
    const cleanQuery = orderNumberOrId.trim().replace(/^#/, '');
    if (!cleanQuery) {
      return { success: false, error: 'Please enter an Order ID or AWB tracking number.' };
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanQuery);
    const orFilter = isUuid
      ? `order_number.ilike.%${cleanQuery}%,id.eq.${cleanQuery},tracking_number.ilike.%${cleanQuery}%`
      : `order_number.ilike.%${cleanQuery}%,tracking_number.ilike.%${cleanQuery}%`;

    // Query order from Supabase
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, status, tracking_number, courier_partner, shipped_at, delivered_at, cancelled_at, cancel_reason, created_at, shipping_address, metadata')
      .or(orFilter)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('trackOrderByIdAction query error:', error);
      return { success: false, error: 'Unable to look up order right now.' };
    }

    if (!order) {
      return { success: false, error: 'No matching order found for this reference.' };
    }

    let liveScans: any[] = [];
    if (order.tracking_number) {
      const tracking = await trackShiprocketAWB(order.tracking_number);
      liveScans = tracking.scans || [];
    } else if (Array.isArray(order.metadata?.['tracking_scans'])) {
      liveScans = order.metadata['tracking_scans'];
    }

    return {
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        courier_partner: order.courier_partner || 'Shiprocket Express',
        tracking_number: order.tracking_number,
        shipped_at: order.shipped_at,
        delivered_at: order.delivered_at,
        cancelled_at: order.cancelled_at || null,
        cancel_reason: order.cancel_reason || null,
        created_at: order.created_at,
        shiprocket_status: (order.metadata as Record<string, any> | null)?.['shiprocket_status'] || null,
        destination_city: (order.shipping_address as any)?.city || 'India',
        destination_state: (order.shipping_address as any)?.state || '',
      },
      liveScans,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to track order' };
  }
}
