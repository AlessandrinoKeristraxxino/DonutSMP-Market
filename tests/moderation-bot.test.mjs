import test from 'node:test';
import assert from 'node:assert/strict';
import { scanContent } from '../lib/moderation/bot.ts';

test('scanContent passes clean Minecraft in-game text and legit trade offers', () => {
  const legitTexts = [
    'Selling 4x Pig Spawners for 1.25M $ each at spawn booth 12',
    'WTS max netherite helmet with Protection IV, price is 850k in-game coins',
    'Great builder, completed my 120k/hr gold farm in 2 days. 10/10 vouch!',
    'Map art 2x2 Sunset frame looks gorgeous on my base wall. Fast delivery at /spawn.',
  ];

  for (const text of legitTexts) {
    const result = scanContent(text);
    assert.equal(result.decision, 'APPROVED', `Expected text to be approved: "${text}"`);
    assert.equal(result.flags.length, 0);
  }
});

test('scanContent rejects real-money trading processors (PayPal, CashApp, Crypto, etc.)', () => {
  const rmtTexts = [
    'I accept payment through PayPal or Venmo',
    'Drop me $10 on cashapp and I give you the shulker',
    'Looking to buy spawners with Bitcoin or USDT',
    'Trading 64 netherite ingots for 10$ Steam Gift Card',
    'Selling my base for Discord Nitro 1 month',
    'Need 500 Robux in exchange for Tier 2 spawner',
    'Price is 15 USD via Zelle',
  ];

  for (const text of rmtTexts) {
    const result = scanContent(text);
    assert.equal(result.decision, 'REJECTED', `Expected RMT rejection for: "${text}"`);
    assert.ok(
      result.flags.some((f) => f.category === 'RMT'),
      `Missing RMT flag for: "${text}"`
    );
  }
});

test('scanContent rejects severe hate speech and slurs', () => {
  const toxicityCases = [
    'You are a complete retard at this game',
    'kys go jump into the void',
  ];

  for (const text of toxicityCases) {
    const result = scanContent(text);
    assert.equal(result.decision, 'REJECTED');
    assert.ok(result.flags.some((f) => f.category === 'SLUR'));
  }
});

test('scanContent queues external invite links for manual review', () => {
  const inviteCases = [
    'Join our trading guild here: discord.gg/donuttraders',
    'Contact me for custom build orders at discord.com/invite/pixelbuilders',
    'Message me on telegram t.me/minecraftbroker',
  ];

  for (const text of inviteCases) {
    const result = scanContent(text);
    assert.equal(
      result.decision,
      'NEEDS_REVIEW',
      `Expected NEEDS_REVIEW for invite: "${text}"`
    );
    assert.ok(result.flags.some((f) => f.category === 'INVITE_LINK'));
  }
});

test('scanContent detects repetitive spam and excessive caps', () => {
  const spam = 'VOUCH FOR THIS GUY AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  const result = scanContent(spam);
  assert.equal(result.decision, 'NEEDS_REVIEW');
  assert.ok(result.flags.some((f) => f.category === 'SPAM'));
});
