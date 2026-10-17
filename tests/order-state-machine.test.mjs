import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canTransition,
  executeTransition,
  getAvailableActions,
} from '../lib/orders/state-machine.ts';

test('Standard happy path progression', () => {
  // REQUESTED -> ACCEPTED by Seller
  assert.equal(canTransition('REQUESTED', 'ACCEPT', 'SELLER').allowed, true);
  assert.equal(executeTransition('REQUESTED', 'ACCEPT', 'SELLER'), 'ACCEPTED');

  // ACCEPTED -> IN_PROGRESS by Seller
  assert.equal(canTransition('ACCEPTED', 'START', 'SELLER').allowed, true);
  assert.equal(executeTransition('ACCEPTED', 'START', 'SELLER'), 'IN_PROGRESS');

  // IN_PROGRESS -> DELIVERED by Seller
  assert.equal(canTransition('IN_PROGRESS', 'DELIVER', 'SELLER').allowed, true);
  assert.equal(executeTransition('IN_PROGRESS', 'DELIVER', 'SELLER'), 'DELIVERED');

  // DELIVERED -> COMPLETED by Buyer
  assert.equal(canTransition('DELIVERED', 'COMPLETE', 'BUYER').allowed, true);
  assert.equal(executeTransition('DELIVERED', 'COMPLETE', 'BUYER'), 'COMPLETED');
});

test('Role permission violations are strictly rejected', () => {
  // Buyer cannot accept or deliver
  assert.equal(canTransition('REQUESTED', 'ACCEPT', 'BUYER').allowed, false);
  assert.equal(canTransition('IN_PROGRESS', 'DELIVERED', 'BUYER').allowed, false);

  // Seller cannot confirm completion (only buyer inspects delivery)
  assert.equal(canTransition('DELIVERED', 'COMPLETE', 'SELLER').allowed, false);

  // Cannot transition once completed
  assert.equal(canTransition('COMPLETED', 'CANCEL', 'BUYER').allowed, false);
  assert.equal(canTransition('COMPLETED', 'DISPUTE', 'SELLER').allowed, false);
});

test('Cancellation rules: allowed prior to delivery, rejected after delivery', () => {
  // Can cancel during REQUESTED or IN_PROGRESS
  assert.equal(canTransition('REQUESTED', 'CANCEL', 'BUYER').allowed, true);
  assert.equal(canTransition('IN_PROGRESS', 'CANCEL', 'SELLER').allowed, true);

  // Cannot cancel once DELIVERED (must open DISPUTE instead)
  assert.equal(canTransition('DELIVERED', 'CANCEL', 'BUYER').allowed, false);
  assert.equal(canTransition('DELIVERED', 'CANCEL', 'SELLER').allowed, false);
});

test('Dispute resolution is restricted to MOD or ADMIN', () => {
  // Buyer or Seller can dispute
  assert.equal(canTransition('DELIVERED', 'DISPUTE', 'BUYER').allowed, true);
  assert.equal(canTransition('IN_PROGRESS', 'DISPUTE', 'SELLER').allowed, true);

  // Buyer/Seller cannot resolve dispute
  assert.equal(canTransition('DISPUTED', 'RESOLVE_COMPLETE', 'BUYER').allowed, false);
  assert.equal(canTransition('DISPUTED', 'RESOLVE_CANCEL', 'SELLER').allowed, false);

  // Mod can resolve
  assert.equal(canTransition('DISPUTED', 'RESOLVE_COMPLETE', 'MOD').allowed, true);
  assert.equal(canTransition('DISPUTED', 'RESOLVE_CANCEL', 'ADMIN').allowed, true);
  assert.equal(executeTransition('DISPUTED', 'RESOLVE_COMPLETE', 'MOD'), 'COMPLETED');
});

test('getAvailableActions returns accurate contextual actions', () => {
  const sellerRequestedActions = getAvailableActions('REQUESTED', 'SELLER');
  assert.deepEqual(sellerRequestedActions.sort(), ['ACCEPT', 'CANCEL', 'DISPUTE'].sort());

  const buyerDeliveredActions = getAvailableActions('DELIVERED', 'BUYER');
  assert.deepEqual(buyerDeliveredActions.sort(), ['COMPLETE', 'DISPUTE'].sort());
});
