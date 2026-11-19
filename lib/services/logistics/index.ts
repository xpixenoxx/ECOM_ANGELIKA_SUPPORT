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

  if (status.delhiveryConfigured) {
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
    configured: true,
    error: 'Active carrier flow requires manual AWB assignment for Shiprocket.',
  };
}
