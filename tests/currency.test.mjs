import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCurrency, formatCurrency, formatCurrencyFull } from '../lib/currency.ts';

test('parseCurrency handles standard suffixes (k, m, b, t)', () => {
  assert.equal(parseCurrency('250k'), 250_000n);
  assert.equal(parseCurrency('1.5m'), 1_500_000n);
  assert.equal(parseCurrency('2b'), 2_000_000_000n);
  assert.equal(parseCurrency('1.25b'), 1_250_000_000n);
  assert.equal(parseCurrency('10t'), 10_000_000_000_000n);
});

test('parseCurrency handles plain numbers and formatted numbers with commas', () => {
  assert.equal(parseCurrency('500'), 500n);
  assert.equal(parseCurrency('1,000,000'), 1_000_000n);
  assert.equal(parseCurrency('850000'), 850_000n);
  assert.equal(parseCurrency(12000), 12_000n);
  assert.equal(parseCurrency(500000n), 500_000n);
});

test('parseCurrency rejects negative values, malformed inputs, and real-money keywords', () => {
  assert.equal(parseCurrency('-250k'), null);
  assert.equal(parseCurrency('-50'), null);
  assert.equal(parseCurrency('abc'), null);
  assert.equal(parseCurrency(''), null);
  // RMT terms
  assert.equal(parseCurrency('10usd'), null);
  assert.equal(parseCurrency('20 paypal'), null);
  assert.equal(parseCurrency('5eur'), null);
  assert.equal(parseCurrency('crypto 50'), null);
});

test('formatCurrency outputs clean shorthand', () => {
  assert.equal(formatCurrency(250_000n), '250K $');
  assert.equal(formatCurrency(1_500_000n), '1.5M $');
  assert.equal(formatCurrency(2_000_000_000n), '2B $');
  assert.equal(formatCurrency(500n), '500 $');
  assert.equal(formatCurrency(0n), '0 $');
  assert.equal(formatCurrency(null), '0 $');
});

test('formatCurrencyFull outputs comma-separated values', () => {
  assert.equal(formatCurrencyFull(1_500_000n), '1,500,000 $');
  assert.equal(formatCurrencyFull(250_000n), '250,000 $');
  assert.equal(formatCurrencyFull(850n), '850 $');
});
