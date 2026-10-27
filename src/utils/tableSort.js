const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
export function comparable(value, label = '') {
  if (value == null || value === '' || value === '?') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (value instanceof Date) return value.getTime();
  const text = String(value).trim();
  if (/date|expiry|created|updated|mfg/i.test(label)) {
    const timestamp = Date.parse(text);
    if (!Number.isNaN(timestamp)) return timestamp;
  }
  // Parse complete currency/percentage values, never numbers embedded in names.
  const number = text.replace(/^(?:Rs\.?|PKR|USD|EUR|GBP|[$??])\s*/i, '').replace(/,/g, '').replace(/%$/, '');
  if (/^-?\d+(?:\.\d+)?$/.test(number)) return Number(number);
  return text;
}
export function compareValues(a, b, direction = 'asc', label = '') {
  const av = comparable(a, label), bv = comparable(b, label);
  if (av === null && bv === null) return 0;
  if (av === null) return 1;
  if (bv === null) return -1;
  const result = typeof av === 'number' && typeof bv === 'number' ? av - bv : collator.compare(String(av), String(bv));
  return direction === 'desc' ? -result : result;
}
