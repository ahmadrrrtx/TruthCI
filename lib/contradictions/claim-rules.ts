import { createId } from "@/lib/utils/ids";
import type { Claim, Contradiction } from "./types";

export type ClaimRule = {
  type: Contradiction["type"];
  polarity: Claim["polarity"];
  patterns: RegExp[];
  confidence: number;
};

export const CLAIM_RULES: ClaimRule[] = [
  {
    type: "usage_limit",
    polarity: "unlimited",
    confidence: 0.9,
    patterns: [/\bunlimited (usage|requests|api requests|api calls|calls)\b/i, /\bno (usage )?limits\b/i]
  },
  {
    type: "usage_limit",
    polarity: "limited",
    confidence: 0.85,
    patterns: [/\b\d+[\d,.]*\s*(k|m|million)?\s*(requests|api calls|calls)\s*(\/|per)\s*(month|day|minute|hour)\b/i, /\blimited to\s+\d+/i]
  },
  {
    type: "rate_limit",
    polarity: "unlimited",
    confidence: 0.9,
    patterns: [/\bno rate limits?\b/i, /\bunlimited api requests?\b/i]
  },
  {
    type: "rate_limit",
    polarity: "limited",
    confidence: 0.85,
    patterns: [/\brate limits? apply\b/i, /\b429\b/i, /\b\d+[\d,.]*\s*(requests|calls)\s*(\/|per)\s*(second|minute|hour|day|month)\b/i]
  },
  {
    type: "pricing",
    polarity: "free",
    confidence: 0.8,
    patterns: [/\bfree forever\b/i, /\bcompletely free\b/i, /\bno cost\b/i, /\bfree plan\b/i]
  },
  {
    type: "pricing",
    polarity: "paid",
    confidence: 0.85,
    patterns: [/\bstarts? at\s*[$€£]\s*\d+/i, /[$€£]\s*\d+\s*(\/|per)\s*(mo|month|year|yr)/i, /\bpaid plan\b/i, /\bupgrade required\b/i]
  },
  {
    type: "credit_card",
    polarity: "positive",
    confidence: 0.95,
    patterns: [/\bno credit card required\b/i, /\bwithout a credit card\b/i]
  },
  {
    type: "credit_card",
    polarity: "negative",
    confidence: 0.95,
    patterns: [/(?<!no )\bcredit card required\b/i, /\bpayment method required\b/i, /\bbilling information required\b/i]
  },
  {
    type: "availability",
    polarity: "available",
    confidence: 0.75,
    patterns: [/\bavailable (now|today)\b/i, /\bgenerally available\b/i, /\bproduction ready\b/i]
  },
  {
    type: "availability",
    polarity: "unavailable",
    confidence: 0.8,
    patterns: [/\bcoming soon\b/i, /\bwaitlist\b/i, /\bprivate beta\b/i, /\blimited beta\b/i, /\bnot yet available\b/i]
  },
  {
    type: "support",
    polarity: "strong",
    confidence: 0.8,
    patterns: [/\b24\/7 support\b/i, /\bpriority support\b/i, /\bdedicated support\b/i, /\bphone support\b/i]
  },
  {
    type: "support",
    polarity: "weak",
    confidence: 0.8,
    patterns: [/\bemail support only\b/i, /\bcommunity support\b/i, /\bbest effort support\b/i, /\bno support\b/i]
  },
  {
    type: "sla",
    polarity: "strong",
    confidence: 0.9,
    patterns: [/\b99\.9{1,2}% uptime\b/i, /\bsla included\b/i, /\bguaranteed uptime\b/i]
  },
  {
    type: "sla",
    polarity: "weak",
    confidence: 0.9,
    patterns: [/\bno sla\b/i, /\bbest effort availability\b/i, /\buptime not guaranteed\b/i]
  },
  {
    type: "open_source",
    polarity: "open",
    confidence: 0.8,
    patterns: [/\bopen source\b/i, /\bmit licensed\b/i, /\bapache 2\.0\b/i, /\bsource code available\b/i]
  },
  {
    type: "open_source",
    polarity: "closed",
    confidence: 0.8,
    patterns: [/\bclosed source\b/i, /\bproprietary\b/i, /\bsource code not available\b/i]
  },
  {
    type: "data_retention",
    polarity: "long",
    confidence: 0.8,
    patterns: [/\bretained forever\b/i, /\bstored indefinitely\b/i, /\bnever deleted\b/i]
  },
  {
    type: "data_retention",
    polarity: "short",
    confidence: 0.85,
    patterns: [/\bdeleted after\s+\d+\s+(days|months|years)\b/i, /\bretained for\s+\d+\s+(days|months|years)\b/i, /\bautomatically deleted\b/i]
  },
  {
    type: "security_compliance",
    polarity: "certified",
    confidence: 0.95,
    patterns: [/\bsoc 2 certified\b/i, /\bhipaa compliant\b/i, /\bgdpr compliant\b/i, /\biso 27001 certified\b/i]
  },
  {
    type: "security_compliance",
    polarity: "pending",
    confidence: 0.9,
    patterns: [/\bsoc 2 coming soon\b/i, /\bworking toward soc 2\b/i, /\bnot certified\b/i, /\bnot hipaa compliant\b/i]
  }
];

export function extractClaimsFromText(url: string, text: string) {
  const claims: Claim[] = [];
  const sentences = text
    .replace(/\n+/g, ". ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.replace(/\s+/g, " ").trim())
    .filter((sentence) => sentence.length > 8 && sentence.length < 500);

  for (const sentence of sentences) {
    for (const rule of CLAIM_RULES) {
      if (rule.patterns.some((pattern) => pattern.test(sentence))) {
        claims.push({ id: createId("claim"), type: rule.type, polarity: rule.polarity, url, text: sentence, confidence: rule.confidence });
      }
    }
  }
  return claims;
}
