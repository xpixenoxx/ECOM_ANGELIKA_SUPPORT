/**
 * Formats a number as Indian Rupee (INR) currency
 * e.g., 6999 -> '₹6,999'
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const formatPrice = formatINR;
