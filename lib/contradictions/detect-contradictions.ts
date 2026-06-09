import type { SnapshotRecord } from "@/lib/db/queries/snapshots";
import { createId } from "@/lib/utils/ids";
import { extractClaimsFromText } from "./claim-rules";
import type { Claim, Contradiction } from "./types";

const OPPOSITES: Record<string, Array<[Claim["polarity"], Claim["polarity"]]>> = {
  usage_limit: [["unlimited", "limited"]],
  rate_limit: [["unlimited", "limited"]],
  pricing: [["free", "paid"]],
  credit_card: [["positive", "negative"]],
  availability: [["available", "unavailable"]],
  support: [["strong", "weak"]],
  sla: [["strong", "weak"]],
  open_source: [["open", "closed"]],
  data_retention: [["long", "short"]],
  security_compliance: [["certified", "pending"]]
};

function severity(type: Contradiction["type"], sameUrl: boolean): Contradiction["severity"] {
  if (sameUrl) return "low";
  if (["pricing", "usage_limit", "rate_limit", "security_compliance", "sla"].includes(type)) return "high";
  return "medium";
}

function explanation(type: Contradiction["type"], a: Claim, b: Claim) {
  const label = type.replace(/_/g, " ");
  return `TruthCI found conflicting ${label} claims. One source says “${a.text}” while another says “${b.text}”. Review the source pages and align public messaging.`;
}

export function detectContradictions(snapshots: SnapshotRecord[]) {
  const claims = snapshots.flatMap((snapshot) => extractClaimsFromText(snapshot.url, snapshot.content));
  const contradictions: Contradiction[] = [];
  const seen = new Set<string>();

  for (const [type, pairs] of Object.entries(OPPOSITES) as Array<[Contradiction["type"], Array<[Claim["polarity"], Claim["polarity"]]>]>) {
    const typedClaims = claims.filter((claim) => claim.type === type);
    for (const [left, right] of pairs) {
      const leftClaims = typedClaims.filter((claim) => claim.polarity === left);
      const rightClaims = typedClaims.filter((claim) => claim.polarity === right);
      for (const a of leftClaims) {
        for (const b of rightClaims) {
          if (a.text === b.text) continue;
          const key = [type, a.url, a.text, b.url, b.text].join("|").toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          contradictions.push({
            id: createId("contr"),
            type,
            severity: severity(type, a.url === b.url),
            claimA: { url: a.url, text: a.text },
            claimB: { url: b.url, text: b.text },
            explanation: explanation(type, a, b)
          });
        }
      }
    }
  }

  return contradictions.slice(0, 30);
}
