import type { Address } from '@/types/commerce';

/**
 * Canonical Address Normalization Layer
 *
 * Reconciles Checkout Address (`firstName`, `lastName`, `address1`, `postalCode`)
 * and Account SavedAddress (`name`, `address_line1`, `pincode`, `type`, `is_default`)
 * so addresses created anywhere sync cleanly across /account, /account/addresses, and /checkout.
 */

export interface SavedAddressRecord {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  email?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  type: 'Home' | 'Work' | 'Other';
  is_default: boolean;
}

export interface NormalizedAddress {
  id?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  type: 'Home' | 'Work' | 'Other';
  isDefault: boolean;
}

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0]!, lastName: '' };
  return {
    firstName: parts[0]!,
    lastName: parts.slice(1).join(' '),
  };
}

export function normalizeAddress(raw: unknown): NormalizedAddress {
  const src: Record<string, unknown> =
    raw && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};

  const rawFull =
    (typeof src['name'] === 'string' && src['name'].trim()) ||
    (typeof src['fullName'] === 'string' && src['fullName'].trim()) ||
    [src['firstName'], src['lastName']].filter((v) => typeof v === 'string' && v.trim()).join(' ');

  const split = splitFullName(String(rawFull || ''));
  const firstName =
    (typeof src['firstName'] === 'string' && src['firstName'].trim()) || split.firstName;
  const lastName =
    (typeof src['lastName'] === 'string' && src['lastName'].trim()) || split.lastName;
  const fullName = rawFull || [firstName, lastName].filter(Boolean).join(' ').trim();

  const address1 = String(
    src['address1'] ?? src['address_line1'] ?? src['addressLine1'] ?? ''
  ).trim();
  const address2 = String(
    src['address2'] ?? src['address_line2'] ?? src['addressLine2'] ?? ''
  ).trim();
  const postalCode = String(src['postalCode'] ?? src['pincode'] ?? src['postal_code'] ?? '').trim();

  const rawType = String(src['type'] ?? 'Home');
  const type: 'Home' | 'Work' | 'Other' =
    rawType === 'Work' || rawType === 'Office'
      ? 'Work'
      : rawType === 'Other'
        ? 'Other'
        : 'Home';

  return {
    id: typeof src['id'] === 'string' ? src['id'] : undefined,
    firstName,
    lastName,
    fullName,
    address1,
    address2,
    city: String(src['city'] ?? '').trim(),
    state: String(src['state'] ?? '').trim(),
    postalCode,
    country: String(src['country'] ?? 'India').trim() || 'India',
    phone: String(src['phone'] ?? '').trim(),
    email: String(src['email'] ?? '').trim(),
    type,
    isDefault: Boolean(src['isDefault'] ?? src['is_default'] ?? false),
  };
}

export function toCheckoutAddress(raw: Record<string, unknown> | null | undefined): Address {
  const n = normalizeAddress(raw);
  return {
    firstName: n.firstName,
    lastName: n.lastName || n.firstName,
    address1: n.address1,
    address2: n.address2,
    city: n.city,
    state: n.state,
    postalCode: n.postalCode,
    country: n.country,
    phone: n.phone,
    email: n.email || undefined,
  };
}

export function toSavedAddress(
  raw: Record<string, unknown> | null | undefined,
  fallbackId?: string
): SavedAddressRecord {
  const n = normalizeAddress(raw);
  return {
    id: n.id || fallbackId || `addr-${Date.now()}`,
    name: n.fullName,
    firstName: n.firstName,
    lastName: n.lastName,
    phone: n.phone,
    email: n.email || undefined,
    address_line1: n.address1,
    address_line2: n.address2 || undefined,
    city: n.city,
    state: n.state,
    pincode: n.postalCode,
    country: n.country,
    type: n.type,
    is_default: n.isDefault,
  };
}

export function normalizeAddressList(rawList: unknown): SavedAddressRecord[] {
  if (!Array.isArray(rawList)) return [];
  return rawList
    .filter((entry): entry is Record<string, unknown> => Boolean(entry && typeof entry === 'object'))
    .map((entry, idx) => toSavedAddress(entry, `addr-${idx + 1}`));
}
