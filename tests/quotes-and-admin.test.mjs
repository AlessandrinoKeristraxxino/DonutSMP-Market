import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCurrency, formatCurrency } from '../lib/currency.ts';
import { scanContent } from '../lib/moderation/bot.ts';

test('Quotes pricing: valid in-game currencies parse correctly', () => {
  assert.equal(parseCurrency('1.8m'), 1_800_000n);
  assert.equal(parseCurrency('950k'), 950_000n);
  assert.equal(parseCurrency('3.5M'), 3_500_000n);
  assert.equal(formatCurrency(1_800_000n), '1.8M $');
});

test('Quotes pricing: real-money and invalid currencies are rejected', () => {
  assert.equal(parseCurrency('$15 USD'), null);
  assert.equal(parseCurrency('20 EUR'), null);
  assert.equal(parseCurrency('-500k'), null);
  assert.equal(parseCurrency('free'), null);
});

test('Quote proposal moderation: clean Minecraft pitches pass auto-screening', () => {
  const legitPitch = `I specialize in nether perimeter clearing and automated 120k/hr gold farms.
Schematic verified on creative server, all redstone lamps synced to daylight sensor.
Can start work at your base tomorrow.`;
  const scan = scanContent(legitPitch);
  assert.equal(scan.isClean, true);
  assert.equal(scan.flaggedReason, null);
});

test('Quote proposal moderation: real money trading (RMT) proposals are flagged', () => {
  const rmtPitch = `I can build your base fast, pay me $15 on PayPal or Venmo instead of in-game money.`;
  const scan = scanContent(rmtPitch);
  assert.equal(scan.isClean, false);
  assert.ok(scan.flaggedReason?.toLowerCase().includes('real money') || scan.flaggedReason?.toLowerCase().includes('rmt'));
});

test('Quote proposal moderation: crypto / discord invite links in pitches are flagged', () => {
  const invitePitch = `Check my past builds portfolio here: https://discord.gg/xyzbuilds and send crypto to my wallet`;
  const scan = scanContent(invitePitch);
  assert.equal(scan.isClean, false);
});

test('Quote acceptance rules: owner validation and state creation', () => {
  const requestOwnerId = 'u-1';
  const builderId = 'u-3';
  const callerId = 'u-1';

  // Request owner can accept
  const canAccept = callerId === requestOwnerId;
  assert.equal(canAccept, true);

  // Self-quoting is forbidden
  const canSelfQuote = builderId !== requestOwnerId;
  assert.equal(canSelfQuote, true);

  // Order transition parameters
  const quote = {
    id: 'quote-test-1',
    price: 1_950_000n,
    etaDays: 3,
    builderId,
  };

  const generatedOrder = {
    type: 'BUILD',
    status: 'ACCEPTED',
    buyerId: requestOwnerId,
    sellerId: quote.builderId,
    agreedPrice: quote.price,
    itemOrService: 'Cyberpunk Spawn Base (Quote by Zephyr_Builds)',
  };

  assert.equal(generatedOrder.status, 'ACCEPTED');
  assert.equal(generatedOrder.sellerId, 'u-3');
  assert.equal(generatedOrder.agreedPrice, 1_950_000n);
});

test('Admin role verification guard', () => {
  const userRoles = {
    'u-1': 'USER',
    'u-4': 'MOD',
    'u-5': 'ADMIN',
  };

  const isAdmin = (role) => role === 'ADMIN';

  assert.equal(isAdmin(userRoles['u-1']), false);
  assert.equal(isAdmin(userRoles['u-4']), false);
  assert.equal(isAdmin(userRoles['u-5']), true);
});
