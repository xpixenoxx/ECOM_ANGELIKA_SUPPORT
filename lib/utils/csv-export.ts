/**
 * Formula-Injection-Safe CSV Serialization & Download Utility
 * Used across all Admin exportable modules cleanly.
 */

const FORMULA_TRIGGER_RE = /^[=+\-@\t\r]/;

export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';

  let text: string;
  if (value instanceof Date) {
    text = value.toISOString();
  } else if (typeof value === 'object') {
    text = JSON.stringify(value);
  } else {
    text = String(value);
  }

  // Neutralize spreadsheet formula execution payloads before quoting
  const safe = FORMULA_TRIGGER_RE.test(text) ? `'${text}` : text;
  const escaped = safe.replace(/"/g, '""');

  if (/[",\n\r]/.test(escaped) || safe !== text) {
    return `"${escaped}"`;
  }
  return escaped;
}

export function toCsvString(headers: string[], rows: Array<Array<unknown>>): string {
  const headerLine = headers.map(sanitizeCsvCell).join(',');
  const dataLines = rows.map((row) => row.map(sanitizeCsvCell).join(','));
  // Prepend UTF-8 BOM so Excel renders INR (₹) cleanly
  return `\uFEFF${[headerLine, ...dataLines].join('\r\n')}`;
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<unknown>>
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const csv = toCsvString(headers, rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.href = url;
  link.download = safeName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
