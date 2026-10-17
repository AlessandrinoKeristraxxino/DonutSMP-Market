/**
 * In-game currency helper utilities for Donut SMP.
 *
 * Requirements:
 * - Store money as BigInt in smallest in-game unit (1 $).
 * - Parse shorthand inputs: '250k', '1.5m', '2b'.
 * - Format back into clean readable shorthand or full comma-separated amounts.
 * - Strictly reject real-money references, negative amounts, or malformed strings.
 */

const CURRENCY_SUFFIXES: Record<string, bigint> = {
  k: 1_000n,
  m: 1_000_000n,
  b: 1_000_000_000n,
  t: 1_000_000_000_000n,
};

/**
 * Parses user input shorthand like "250k", "1.5m", "2b", or "500000" into a BigInt.
 * Returns null if input is invalid, negative, or contains non-currency text.
 */
export function parseCurrency(input: string | number | bigint): bigint | null {
  if (typeof input === 'bigint') {
    return input >= 0n ? input : null;
  }

  if (typeof input === 'number') {
    if (isNaN(input) || !isFinite(input) || input < 0) return null;
    return BigInt(Math.floor(input));
  }

  if (!input || typeof input !== 'string') return null;

  // Normalize: remove commas, currency signs, whitespace, lowercase
  const cleaned = input.trim().replace(/[\$,]/g, '').toLowerCase();
  if (cleaned.length === 0) return null;

  // Explicit check for negative numbers
  if (cleaned.startsWith('-')) return null;

  // Check for RMT terms (real-money trading is strictly banned)
  const rmtTerms = ['usd', 'eur', 'gbp', 'paypal', 'cashapp', 'crypto', 'btc', 'eth', 'giftcard'];
  for (const term of rmtTerms) {
    if (cleaned.includes(term)) {
      return null;
    }
  }

  // Check suffix: k, m, b, t
  const lastChar = cleaned.slice(-1);
  const multiplier = CURRENCY_SUFFIXES[lastChar];

  if (multiplier !== undefined) {
    const numericPart = cleaned.slice(0, -1).trim();
    if (!numericPart || isNaN(Number(numericPart))) return null;

    const num = parseFloat(numericPart);
    if (num < 0 || !isFinite(num)) return null;

    // Scale accurately without float precision loss for fractions
    // e.g. 1.25m -> 125 * 10,000 = 1,250,000
    const parts = numericPart.split('.');
    if (parts.length === 1) {
      return BigInt(parts[0]) * multiplier;
    } else if (parts.length === 2) {
      const whole = BigInt(parts[0] || '0') * multiplier;
      const decimals = parts[1];
      // e.g., multiplier is 1_000_000 (6 zeros), decimals is '25' (length 2) -> fraction is 25 * 10^(6 - 2) = 250_000
      const multStr = multiplier.toString();
      const zeroCount = multStr.length - 1;
      if (decimals.length <= zeroCount) {
        const fractionMultiplier = 10n ** BigInt(zeroCount - decimals.length);
        const fraction = BigInt(decimals) * fractionMultiplier;
        return whole + fraction;
      } else {
        // Truncate sub-unit precision beyond smallest unit
        const truncatedDecimals = decimals.slice(0, zeroCount);
        const fraction = BigInt(truncatedDecimals);
        return whole + fraction;
      }
    }
    return null;
  }

  // Plain integer string
  if (/^\d+$/.test(cleaned)) {
    try {
      return BigInt(cleaned);
    } catch {
      return null;
    }
  }

  // Decimal number without suffix (e.g. "150.50" -> truncate to 150)
  if (/^\d+\.\d+$/.test(cleaned)) {
    const whole = cleaned.split('.')[0];
    return BigInt(whole);
  }

  return null;
}

/**
 * Formats a BigInt into clean player-facing shorthand (e.g., 250K $, 1.5M $, 2.8B $).
 */
export function formatCurrency(amount: bigint | number | null | undefined): string {
  if (amount === null || amount === undefined) return '0 $';

  const big = typeof amount === 'number' ? BigInt(Math.max(0, Math.floor(amount))) : amount;
  if (big < 0n) return '0 $';

  if (big >= 1_000_000_000_000n) {
    const formatted = formatWithDecimals(big, 1_000_000_000_000n);
    return `${formatted}T $`;
  }
  if (big >= 1_000_000_000n) {
    const formatted = formatWithDecimals(big, 1_000_000_000n);
    return `${formatted}B $`;
  }
  if (big >= 1_000_000n) {
    const formatted = formatWithDecimals(big, 1_000_000n);
    return `${formatted}M $`;
  }
  if (big >= 1_000n) {
    const formatted = formatWithDecimals(big, 1_000n);
    return `${formatted}K $`;
  }

  return `${big.toString()} $`;
}

/**
 * Formats full comma-separated representation (e.g., "1,250,000 $").
 */
export function formatCurrencyFull(amount: bigint | number | null | undefined): string {
  if (amount === null || amount === undefined) return '0 $';
  const big = typeof amount === 'number' ? BigInt(Math.max(0, Math.floor(amount))) : amount;
  return `${big.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} $`;
}

function formatWithDecimals(val: bigint, divisor: bigint): string {
  const whole = val / divisor;
  const remainder = val % divisor;

  // 1 or 2 decimals
  const decimalPrecision = 100n;
  const fraction = (remainder * decimalPrecision) / divisor;

  if (fraction === 0n) {
    return whole.toString();
  }

  const fracStr = fraction.toString().padStart(2, '0');
  // Trim trailing zero if needed
  const trimmed = fracStr.endsWith('0') ? fracStr.slice(0, 1) : fracStr;
  return `${whole.toString()}.${trimmed}`;
}
