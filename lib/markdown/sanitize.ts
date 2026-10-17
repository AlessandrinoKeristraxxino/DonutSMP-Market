/**
 * Strict Markdown sanitization and character cleaning for Donut SMP.
 *
 * Security Requirements:
 * - Allow h2-h4 only (h1 is reserved for page titles).
 * - Allow text formatting, lists, tables, blockquotes, code blocks, links.
 * - Disallow all raw HTML (<script>, <iframe>, <object>, <embed>, <style>).
 * - Disallow remote images inside Markdown (images must use site upload pipeline).
 * - Enforce http/https protocols for links with rel="nofollow noopener noreferrer ugc" and target="_blank".
 * - Strip control characters and zero-width characters.
 */

import { defaultSchema } from 'rehype-sanitize';

/**
 * Character limits by context.
 */
export const MARKDOWN_LIMITS = {
  DESCRIPTION: 5000,
  VOUCH: 1500,
  MESSAGE: 1000,
  BIO: 500,
} as const;

/**
 * Strips dangerous control and zero-width characters.
 */
export function cleanMarkdownText(input: string, maxLength?: number): string {
  if (!input || typeof input !== 'string') return '';

  // Strip control chars (excluding newline \n and tab \t) and zero-width/invisible chars
  // \x00-\x08, \x0B, \x0C, \x0E-\x1F, \x7F
  // Zero-width spaces: \u200B-\u200D, \uFEFF, \u200E, \u200F
  let cleaned = input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/[\u200B-\u200D\uFEFF\u200E\u200F]/g, '');

  if (maxLength && cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength);
  }

  return cleaned;
}

/**
 * Custom strict rehype-sanitize schema.
 */
export const strictSanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    'h2',
    'h3',
    'h4',
    'p',
    'strong',
    'em',
    'del',
    'ul',
    'ol',
    'li',
    'blockquote',
    'code',
    'pre',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'hr',
    'a',
    'br',
  ],
  attributes: {
    a: ['href', 'target', 'rel'],
    code: ['className'],
    th: ['align'],
    td: ['align'],
  },
  protocols: {
    href: ['http', 'https'],
  },
  strip: ['script', 'style', 'iframe', 'object', 'embed', 'img', 'svg', 'math'],
};
