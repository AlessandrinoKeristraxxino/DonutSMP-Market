import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanMarkdownText, strictSanitizeSchema } from '../lib/markdown/sanitize.ts';

test('cleanMarkdownText removes control and zero-width characters', () => {
  const dirty = 'Hello\x00 World\u200B\uFEFF!';
  const cleaned = cleanMarkdownText(dirty);
  assert.equal(cleaned, 'Hello World!');
});

test('cleanMarkdownText respects length limits', () => {
  const longText = 'a'.repeat(200);
  const truncated = cleanMarkdownText(longText, 50);
  assert.equal(truncated.length, 50);
});

test('strictSanitizeSchema bans raw script, iframe, and img tags', () => {
  // Check banned tags in schema
  assert.equal(strictSanitizeSchema.tagNames.includes('script'), false);
  assert.equal(strictSanitizeSchema.tagNames.includes('iframe'), false);
  assert.equal(strictSanitizeSchema.tagNames.includes('img'), false);
  assert.equal(strictSanitizeSchema.tagNames.includes('style'), false);

  // Check allowed safe tags
  assert.equal(strictSanitizeSchema.tagNames.includes('h2'), true);
  assert.equal(strictSanitizeSchema.tagNames.includes('p'), true);
  assert.equal(strictSanitizeSchema.tagNames.includes('strong'), true);
  assert.equal(strictSanitizeSchema.tagNames.includes('a'), true);
});

test('strictSanitizeSchema protocols only permit http and https', () => {
  assert.deepEqual(strictSanitizeSchema.protocols.href, ['http', 'https']);
});
