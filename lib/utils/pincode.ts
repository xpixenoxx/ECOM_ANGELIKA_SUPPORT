/**
 * Indian Pincode Auto-Resolution Utility
 * Resolves 6-digit postal codes to City/District, State, and estimated delivery timeline.
 */

export interface PincodeDetails {
  city: string;
  state: string;
  district?: string;
  estimatedDays: number;
  estimatedDateFormatted: string;
}

// Major Indian Prefix Offline Fast-Lookup Table
const PREFIX_MAP: Record<string, { city: string; state: string; days: number }> = {
  // Delhi NCR
  '11': { city: 'New Delhi', state: 'Delhi', days: 2 },
  '12': { city: 'Gurugram', state: 'Haryana', days: 2 },
  '13': { city: 'Ambala', state: 'Haryana', days: 3 },
  '20': { city: 'Noida', state: 'Uttar Pradesh', days: 2 },
  // Mumbai & Maharashtra
  '40': { city: 'Mumbai', state: 'Maharashtra', days: 2 },
  '41': { city: 'Pune', state: 'Maharashtra', days: 3 },
  '42': { city: 'Nashik', state: 'Maharashtra', days: 3 },
  '43': { city: 'Aurangabad', state: 'Maharashtra', days: 3 },
  '44': { city: 'Nagpur', state: 'Maharashtra', days: 3 },
  // Karnataka & Bangalore
  '56': { city: 'Bengaluru', state: 'Karnataka', days: 2 },
  '57': { city: 'Mangaluru', state: 'Karnataka', days: 3 },
  '58': { city: 'Hubballi', state: 'Karnataka', days: 3 },
  '59': { city: 'Belagavi', state: 'Karnataka', days: 3 },
  // Telangana & AP
  '50': { city: 'Hyderabad', state: 'Telangana', days: 2 },
  '51': { city: 'Tirupati', state: 'Andhra Pradesh', days: 3 },
  '52': { city: 'Vijayawada', state: 'Andhra Pradesh', days: 3 },
  '53': { city: 'Visakhapatnam', state: 'Andhra Pradesh', days: 3 },
  // Tamil Nadu
  '60': { city: 'Chennai', state: 'Tamil Nadu', days: 2 },
  '61': { city: 'Thanjavur', state: 'Tamil Nadu', days: 3 },
  '62': { city: 'Madurai', state: 'Tamil Nadu', days: 3 },
  '63': { city: 'Salem', state: 'Tamil Nadu', days: 3 },
  '64': { city: 'Coimbatore', state: 'Tamil Nadu', days: 3 },
  // Gujarat
  '38': { city: 'Ahmedabad', state: 'Gujarat', days: 2 },
  '39': { city: 'Surat', state: 'Gujarat', days: 3 },
  '36': { city: 'Rajkot', state: 'Gujarat', days: 3 },
  // Rajasthan
  '30': { city: 'Jaipur', state: 'Rajasthan', days: 3 },
  '31': { city: 'Udaipur', state: 'Rajasthan', days: 3 },
  '34': { city: 'Jodhpur', state: 'Rajasthan', days: 3 },
  // West Bengal & East
  '70': { city: 'Kolkata', state: 'West Bengal', days: 3 },
  '71': { city: 'Howrah', state: 'West Bengal', days: 3 },
  '75': { city: 'Bhubaneswar', state: 'Odisha', days: 3 },
  // Kerala
  '68': { city: 'Kochi', state: 'Kerala', days: 3 },
  '69': { city: 'Thiruvananthapuram', state: 'Kerala', days: 3 },
  '67': { city: 'Kozhikode', state: 'Kerala', days: 3 },
};

function formatDeliveryDate(days: number): string {
  const target = new Date();
  target.setDate(target.getDate() + days);
  return target.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Resolves an Indian pincode by prefix or online API with graceful fallback.
 */
export async function lookupPincode(pincode: string): Promise<PincodeDetails | null> {
  const cleanPin = pincode.replace(/\D/g, '');
  if (cleanPin.length !== 6) return null;

  // 1. Check fast prefix map
  const prefix2 = cleanPin.substring(0, 2);
  const fastMatch = PREFIX_MAP[prefix2];

  // 2. Try online Indian Post API for exact post office & district lookup
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s max wait

    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        const days = fastMatch ? fastMatch.days : 4;
        return {
          city: po.District || po.Division || fastMatch?.city || 'City',
          state: po.State || fastMatch?.state || '',
          district: po.District,
          estimatedDays: days,
          estimatedDateFormatted: formatDeliveryDate(days),
        };
      }
    }
  } catch (err) {
    // Network / abort error - gracefully proceed to offline fallback
  }

  // 3. Fallback to prefix map if available
  if (fastMatch) {
    return {
      city: fastMatch.city,
      state: fastMatch.state,
      estimatedDays: fastMatch.days,
      estimatedDateFormatted: formatDeliveryDate(fastMatch.days),
    };
  }

  // Generic India fallback
  return {
    city: '',
    state: '',
    estimatedDays: 4,
    estimatedDateFormatted: formatDeliveryDate(4),
  };
}
