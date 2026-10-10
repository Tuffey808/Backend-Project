export function normalizeMobile(mobile: unknown): string {
  const digits = String(mobile || '').replace(/\D/g, '');
  if (digits.startsWith('966') && digits.length >= 12) {
    return `0${digits.slice(3)}`;
  }
  if (digits.length === 9 && digits.startsWith('5')) {
    return `0${digits}`;
  }
  return digits;
}

export function paginate<T>(records: T[], page = 1, pageSize = 20) {
  const total = records.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  return {
    count: total,
    prev: current > 1 ? current - 1 : false,
    current,
    next: current < totalPages ? current + 1 : false,
    total_pages: totalPages,
    result: records.slice(start, start + pageSize),
  };
}

export function money(n: number | string | { toString(): string }) {
  return Number(Number(n).toFixed(2));
}

/** KSA VAT 15% on untaxed amount (simple MVP). */
export function taxOn(untaxed: number, rate = 0.15) {
  return money(untaxed * rate);
}
