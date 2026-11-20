import { getOptionalEnv } from '@/lib/env';

export interface LogisticsProviderStatus {
  delhiveryConfigured: boolean;
  shiprocketConfigured: boolean;
  activeProvider: 'shiprocket' | 'delhivery' | null;
}

export interface ShipmentCreationResult {
  success: boolean;
  configured: boolean;
  provider?: 'shiprocket' | 'delhivery';
  awbNumber?: string;
  courierPartner?: string;
  trackingUrl?: string;
  labelUrl?: string;
  error?: string;
}

export function getLogisticsProviderStatus(): LogisticsProviderStatus {
  const shiprocketEmail = getOptionalEnv('SHIPROCKET_EMAIL');
  const shiprocketPass = getOptionalEnv('SHIPROCKET_PASSWORD');
  const delhiveryToken = getOptionalEnv('DELHIVERY_API_TOKEN');

  const shiprocketConfigured = Boolean(shiprocketEmail && shiprocketPass);
  const delhiveryConfigured = Boolean(delhiveryToken);

  return {
    delhiveryConfigured,
    shiprocketConfigured,
    activeProvider: shiprocketConfigured ? 'shiprocket' : delhiveryConfigured ? 'delhivery' : null,
  };
}

let cachedShiprocketToken: { token: string; expiresAt: number } | null = null;

export async function getShiprocketAuthToken(): Promise<string> {
  const now = Date.now();
  if (cachedShiprocketToken && cachedShiprocketToken.expiresAt > now + 60000) {
    return cachedShiprocketToken.token;
  }

  const email = getOptionalEnv('SHIPROCKET_EMAIL');
  const password = getOptionalEnv('SHIPROCKET_PASSWORD');
  if (!email || !password) {
    throw new Error('SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD must be configured.');
  }

  const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(15000),
  });

  const data = await res.json();
  if (!res.ok || !data.token) {
    throw new Error(data.message || 'Shiprocket authentication failed.');
  }

  // Shiprocket tokens last 10 days; cache for 7 days
  cachedShiprocketToken = {
    token: data.token,
    expiresAt: now + 7 * 24 * 60 * 60 * 1000,
  };
  return data.token;
}

async function createShiprocketShipment(params: {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  totalAmountInr: number;
  paymentMethod: 'cod' | 'prepaid';
  weightKg?: number;
}): Promise<ShipmentCreationResult> {
  try {
    const token = await getShiprocketAuthToken();
    const pickupLocation = getOptionalEnv('SHIPROCKET_PICKUP_LOCATION') || 'Primary';

    const orderDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const orderPayload = {
      order_id: params.orderNumber,
      order_date: orderDate,
      pickup_location: pickupLocation,
      billing_customer_name: params.customerName || 'Customer',
      billing_last_name: '',
      billing_address: params.address,
      billing_city: params.city,
      billing_pincode: params.pincode,
      billing_state: params.state,
      billing_country: 'India',
      billing_email: getOptionalEnv('STORE_EMAIL') || 'vidhya@angelikafashions.com',
      billing_phone: params.phone,
      shipping_is_billing: true,
      order_items: [
        {
          name: 'Angelika Designer Wear',
          sku: `SKU-${params.orderNumber}`,
          units: 1,
          selling_price: params.totalAmountInr,
          discount: 0,
          tax: 0,
        },
      ],
      payment_method: params.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
      sub_total: params.totalAmountInr,
      length: 20,
      breadth: 15,
      height: 5,
      weight: Number((params.weightKg || 0.7).toFixed(2)),
    };

    const orderRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
      signal: AbortSignal.timeout(15000),
    });

    const orderData = await orderRes.json();
    const shipmentId = orderData?.shipment_id;

    if (!orderRes.ok || !shipmentId) {
      return {
        success: false,
        configured: true,
        provider: 'shiprocket',
        error: orderData?.message || 'Shiprocket order creation failed',
      };
    }

    const awbRes = await fetch('https://apiv2.shiprocket.in/v1/external/courier/assign/awb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ shipment_id: shipmentId }),
      signal: AbortSignal.timeout(15000),
    });

    const awbData = await awbRes.json();
    const awbCode = awbData?.response?.data?.awb_code || awbData?.awb_code;
    const courierName = awbData?.response?.data?.courier_name || awbData?.courier_name || 'Shiprocket Partner';

    if (!awbCode) {
      return {
        success: false,
        configured: true,
        provider: 'shiprocket',
        error: awbData?.message || 'Shiprocket AWB assignment failed. Please assign courier manually.',
      };
    }

    return {
      success: true,
      configured: true,
      provider: 'shiprocket',
      awbNumber: awbCode,
      courierPartner: courierName,
      trackingUrl: `https://shiprocket.co/tracking/${awbCode}`,
    };
  } catch (err: any) {
    return {
      success: false,
      configured: true,
      provider: 'shiprocket',
      error: err?.message || 'Shiprocket API request error',
    };
  }
}

/**
 * Generates an AWB & shipment with configured logistics partner.
 * Never fabricates fake tracking numbers when carrier credentials are absent.
 */
export async function createShipmentAwb(params: {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  totalAmountInr: number;
  paymentMethod: 'cod' | 'prepaid';
  weightKg?: number;
}): Promise<ShipmentCreationResult> {
  const status = getLogisticsProviderStatus();
  if (!status.activeProvider) {
    return {
      success: false,
      configured: false,
      error:
        'Shipping carrier API credentials (Shiprocket or Delhivery) are not configured. Enter the courier tracking number manually or configure carrier credentials in Settings > Shipping.',
    };
  }

  if (status.activeProvider === 'shiprocket') {
    return createShiprocketShipment(params);
  }

  if (status.activeProvider === 'delhivery') {
    try {
      const token = getOptionalEnv('DELHIVERY_API_TOKEN')!;
      const pickupLocation = getOptionalEnv('DELHIVERY_PICKUP_LOCATION') || 'Angelika Fashions Atelier';
      const payload = {
        shipments: [
          {
            name: params.customerName,
            add: params.address,
            pin: params.pincode,
            city: params.city,
            state: params.state,
            country: 'India',
            phone: params.phone,
            order: params.orderNumber,
            payment_mode: params.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
            cod_amount: params.paymentMethod === 'cod' ? params.totalAmountInr : 0,
            total_amount: params.totalAmountInr,
            weight: String(Math.round((params.weightKg || 0.7) * 1000)),
          },
        ],
        pickup_location: { name: pickupLocation },
      };

      const res = await fetch('https://track.delhivery.com/api/cmu/create.json', {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `format=json&data=${encodeURIComponent(JSON.stringify(payload))}`,
        signal: AbortSignal.timeout(15000),
      });

      const data = await res.json();
      const pkg = data?.packages?.[0];
      if (!res.ok || !pkg?.waybill) {
        return {
          success: false,
          configured: true,
          provider: 'delhivery',
          error: pkg?.remarks?.[0] || data?.rmk || 'Delhivery AWB creation failed',
        };
      }

      return {
        success: true,
        configured: true,
        provider: 'delhivery',
        awbNumber: pkg.waybill,
        trackingUrl: `https://www.delhivery.com/track/package/${pkg.waybill}`,
      };
    } catch (err: any) {
      return {
        success: false,
        configured: true,
        provider: 'delhivery',
        error: err?.message || 'Delhivery API request failed',
      };
    }
  }

  return {
    success: false,
    configured: false,
    error: 'No active shipping carrier found.',
  };
}
