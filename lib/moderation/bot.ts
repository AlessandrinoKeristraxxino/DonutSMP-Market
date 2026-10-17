/**
 * Automated Moderation Bot for Donut SMP Marketplace.
 *
 * Requirements:
 * 1. Strict Anti-RMT (Real Money Trading) screening.
 *    Donut SMP TOS forbids real-money trading. Flag/reject fiat currency,
 *    PayPal, Venmo, CashApp, Crypto, Gift Cards, Discord Nitro, Robux.
 *    Allow standard in-game notation (e.g. '850k $', '1.5M', '$250k', 'in-game money').
 * 2. Slur & Toxicity Filter.
 * 3. Discord & External Invite Link Filter (anti-phishing / off-platform migration).
 * 4. Spam & Flood Detection (character repeating, excessive capitals).
 */

export type ModerationCategory = 'RMT' | 'SLUR' | 'INVITE_LINK' | 'SPAM';
export type ModerationDecision = 'APPROVED' | 'NEEDS_REVIEW' | 'REJECTED';

export interface ModerationFlag {
  category: ModerationCategory;
  keyword?: string;
  message: string;
  severity: 'HIGH' | 'MEDIUM';
}

export interface ModerationResult {
  decision: ModerationDecision;
  flags: ModerationFlag[];
  summary: string;
}

// Banned RMT payment processors & fiat keywords (strictly prohibited)
const RMT_HARD_KEYWORDS = [
  'paypal',
  'cashapp',
  'cash app',
  'venmo',
  'zelle',
  'revolut',
  'crypto',
  'cryptocurrency',
  'bitcoin',
  'btc',
  'ethereum',
  'eth',
  'usdt',
  'tether',
  'solana',
  'gift card',
  'giftcard',
  'steam card',
  'paysafe',
  'paysafecard',
  'apple pay',
  'google pay',
  'discord nitro',
  'nitro classic',
  'robux',
  'v-bucks',
  'vbucks',
  'fiat',
  'usd',
  'eur',
  'gbp',
  'cad',
  'aud',
  'wire transfer',
  'credit card',
  'debit card',
];

// Slurs and severe hate speech (strictly prohibited)
const BANNED_SLURS = [
  'nigger',
  'nigga',
  'faggot',
  'fag',
  'retard',
  'kike',
  'chink',
  'spic',
  'tranny',
  'ky$ ',
  'kys',
  'kill yourself',
];

// External invite link patterns
const INVITE_PATTERNS = [
  /discord\.gg\/[a-zA-Z0-9]+/i,
  /discord\.com\/invite\/[a-zA-Z0-9]+/i,
  /t\.me\/[a-zA-Z0-9_]+/i,
  /telegram\.me\/[a-zA-Z0-9_]+/i,
  /chat\.whatsapp\.com\/[a-zA-Z0-9]+/i,
];

// Regex for fiat money patterns like "$5", "$10.50", "€10", "£5", "10 usd"
// Must NOT trigger on valid in-game shorthand: "$250k", "$1.5m", "$2b", "850k $"
const FIAT_PRICE_REGEX = /(?:\$|€|£)\s*\d+(?:\.\d{1,2})?(?!\s*(?:k|m|b|t)\b|\s*in-game|\s*\$|\s*coins|\s*server)(?:\s*(?:usd|eur|dollars?|cents?|euros?|bucks?)\b)?/i;
const EXPLICIT_USD_PATTERN = /\b\d+\s*(?:usd|eur|gbp|cad|aud)\b/i;

/**
 * Scans user-submitted text for TOS violations, RMT, slurs, invites, and spam.
 */
export function scanContent(text: string): ModerationResult {
  if (!text || text.trim().length === 0) {
    return {
      decision: 'APPROVED',
      flags: [],
      summary: 'Empty or clean content',
    };
  }

  const normalized = text.toLowerCase();
  const flags: ModerationFlag[] = [];

  // 1. Scan for Slurs & Hate Speech
  for (const slur of BANNED_SLURS) {
    const slurRegex = new RegExp(`\\b${slur}\\b`, 'i');
    if (slurRegex.test(normalized) || (slur === 'kys' && /\bkys\b/i.test(normalized))) {
      flags.push({
        category: 'SLUR',
        keyword: slur,
        message: 'Severe toxicity or hateful language detected',
        severity: 'HIGH',
      });
    }
  }

  // 2. Scan for Hard RMT Keywords
  for (const keyword of RMT_HARD_KEYWORDS) {
    const kwRegex = new RegExp(`\\b${keyword.replace(' ', '\\s+')}\\b`, 'i');
    if (kwRegex.test(normalized)) {
      flags.push({
        category: 'RMT',
        keyword,
        message: `Real-money trading term '${keyword}' is strictly forbidden by Donut SMP TOS`,
        severity: 'HIGH',
      });
    }
  }

  // 3. Scan for Fiat Currency Pricing Patterns
  if (EXPLICIT_USD_PATTERN.test(normalized)) {
    flags.push({
      category: 'RMT',
      message: 'Explicit fiat currency designation detected (USD/EUR)',
      severity: 'HIGH',
    });
  } else if (FIAT_PRICE_REGEX.test(text)) {
    // Check if it looks like "$10" or "$25.00" without k/m/b
    // In Minecraft servers, raw numbers like "$1000" might be in-game money, but small fiat-like numbers like "$5", "$10", "$20" are suspicious.
    const match = text.match(/(?:\$|€|£)\s*(\d+(?:\.\d{1,2})?)/);
    if (match) {
      const val = parseFloat(match[1]);
      if (val < 100 && !/\b(?:k|m|b|thousand|million)\b/i.test(text)) {
        flags.push({
          category: 'RMT',
          message: `Suspicious low-value fiat pattern '${match[0]}' detected`,
          severity: 'MEDIUM',
        });
      }
    }
  }

  // 4. Scan for Unauthorized Discord / External Invite Links
  for (const pattern of INVITE_PATTERNS) {
    if (pattern.test(text)) {
      flags.push({
        category: 'INVITE_LINK',
        message: 'Off-platform invite link detected (trades must be conducted through Donut SMP order tracking)',
        severity: 'MEDIUM',
      });
      break;
    }
  }

  // 5. Spam / Flood Detection
  // Repeating characters like "aaaaaa" or "!!!!!!!" (8 or more)
  if (/(.)\1{7,}/.test(text)) {
    flags.push({
      category: 'SPAM',
      message: 'Excessive character flood detected',
      severity: 'MEDIUM',
    });
  }

  // All-caps spam for messages > 30 chars where > 75% are uppercase
  const lettersOnly = text.replace(/[^a-zA-Z]/g, '');
  if (lettersOnly.length >= 30) {
    const upperCount = (lettersOnly.match(/[A-Z]/g) || []).length;
    if (upperCount / lettersOnly.length > 0.85) {
      flags.push({
        category: 'SPAM',
        message: 'Excessive uppercase / screaming detected',
        severity: 'MEDIUM',
      });
    }
  }

  // Evaluate Decision
  const hasHigh = flags.some((f) => f.severity === 'HIGH');
  const hasMedium = flags.some((f) => f.severity === 'MEDIUM');

  let decision: ModerationDecision = 'APPROVED';
  let summary = 'Content passed automated screening.';

  if (hasHigh) {
    // If slurs or direct RMT processors, mark REJECTED (or NEEDS_REVIEW for staff)
    decision = 'REJECTED';
    summary = `Blocked: ${flags.map((f) => f.message).join('; ')}`;
  } else if (hasMedium) {
    // Borderline fiat patterns, invite links, spam go to manual review
    decision = 'NEEDS_REVIEW';
    summary = `Queued for moderation review: ${flags.map((f) => f.message).join('; ')}`;
  }

  return {
    decision,
    flags,
    summary,
  };
}
