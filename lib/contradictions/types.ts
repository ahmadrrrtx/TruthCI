export type ClaimPolarity = "positive" | "negative" | "limited" | "unlimited" | "free" | "paid" | "available" | "unavailable" | "strong" | "weak" | "open" | "closed" | "long" | "short" | "certified" | "pending";

export type Claim = {
  id: string;
  type: Contradiction["type"];
  polarity: ClaimPolarity;
  url: string;
  text: string;
  confidence: number;
};

export type Contradiction = {
  id: string;
  type:
    | "usage_limit"
    | "pricing"
    | "credit_card"
    | "availability"
    | "support"
    | "sla"
    | "rate_limit"
    | "open_source"
    | "data_retention"
    | "security_compliance";
  severity: "low" | "medium" | "high";
  claimA: { url: string; text: string };
  claimB: { url: string; text: string };
  explanation: string;
};
