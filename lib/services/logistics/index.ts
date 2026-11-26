import { getOptionalEnv, getShiprocketConfig } from '@/lib/env';
import {
  assignShiprocketAwb,
  buildShiprocketAdhocOrderPayload,
  createShiprocketOrder,
  type BuildShiprocketOrderInput,
} from '@/lib/services/shiprocket';

export {
  assignShiprocketAwb,
  buildShiprocketAdhocOrderPayload,
  cancelShiprocketShipment,
  checkShiprocketServiceability,
  createShiprocketOrder,
  generateShiprocketLabel,
  generateShiprocketManifest,
  getShiprocketAuthToken,
  mapShiprocketStatus,
  resetShiprocketTokenCache,
  scheduleShiprocketPickup,
  trackShiprocketAwb,
  verifyShiprocketWebhookToken,
} from '@/lib/services/shiprocket';

export interface LogisticsProviderStatus {
  shiprocketConfigured: boolean;
  shiprocketWebhookConfigured: boolean;
  delhiveryConfigured: boolean;
  activeProvider: 'shiprocket' | 'delhivery' | null;
}

export interface ShipmentCreationResult {
  success: boolean;
  configured: boolean;
  provider?: 'shiprocket' | 'delhivery';
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  awbNumber?: string;
  courierCompanyId?: number;
  courierPartner?: string;
  trackingUrl?: string;
  labelUrl?: string;
  weightKg?: number;
  dimensionsCm?: { length: number; breadth: number; height: number };
  usedDefaultWeight?: boolean;
  usedDefaultDimensions?: boolean;
  error?: string;
}

export function getLogisticsProviderStatus(): LogisticsProviderStatus {
  const sr = getShiprocketConfig();
  const delhiveryConfigured = Boolean(getOptionalEnv('DELHIVERY_API_TOKEN'));

  return {
    shiprocketConfigured: sr.configured,
    shiprocketWebhookConfigured: sr.webhookConfigured,
    delhiveryConfigured,
    activeProvider: sr.configured ? 'shiprocket' : delhiveryConfigured ? 'delhivery' : null,
  };
}

/**
 * End-to-end Shiprocket Order Creation + AWB Assignment using authoritative order data.
 * Never uses dummy customer emails, dummy product items, or fake AWBs.
 */
export async function createShipmentWithRealOrderData(
  input: BuildShiprocketOrderInput,
  courierCompanyId?: number | null
): Promise<ShipmentCreationResult> {
  const sr = getShiprocketConfig();
  if (!sr.configured) {
    return {
      success: false,
      configured: false,
      error:
        'Shiprocket API credentials (SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD) are not configured. Configure them in Cloudflare Pages environment variables or enter tracking manually.',
    };
  }

  const built = buildShiprocketAdhocOrderPayload(input);
  if (!built.valid || !built.payload) {
    return {
      success: false,
      configured: true,
      provider: 'shiprocket',
      error: built.errors?.join(' ') || 'Order is missing mandatory fields for Shiprocket.',
    };
  }

  const orderRes = await createShiprocketOrder(built.payload);
  if (!orderRes.success || !orderRes.shiprocketShipmentId) {
    return {
      success: false,
      configured: true,
      provider: 'shiprocket',
      error: orderRes.error || 'Shiprocket order creation failed.',
    };
  }

  const awbRes = await assignShiprocketAwb(orderRes.shiprocketShipmentId, courierCompanyId);
  if (!awbRes.success || !awbRes.awbCode) {
    // Return partial IDs so caller can still persist the created Shiprocket order/shipment for reconciliation
    return {
      success: false,
      configured: true,
      provider: 'shiprocket',
      shiprocketOrderId: orderRes.shiprocketOrderId,
      shiprocketShipmentId: orderRes.shiprocketShipmentId,
      weightKg: built.weightKg,
      dimensionsCm: built.dimensionsCm,
      usedDefaultWeight: built.usedDefaultWeight,
      usedDefaultDimensions: built.usedDefaultDimensions,
      error: awbRes.error || 'Shiprocket order created, but AWB assignment failed.',
    };
  }

  return {
    success: true,
    configured: true,
    provider: 'shiprocket',
    shiprocketOrderId: orderRes.shiprocketOrderId,
    shiprocketShipmentId: orderRes.shiprocketShipmentId,
    awbNumber: awbRes.awbCode,
    courierCompanyId: awbRes.courierCompanyId,
    courierPartner: awbRes.courierName,
    trackingUrl: awbRes.trackingUrl,
    weightKg: built.weightKg,
    dimensionsCm: built.dimensionsCm,
    usedDefaultWeight: built.usedDefaultWeight,
    usedDefaultDimensions: built.usedDefaultDimensions,
  };
}
