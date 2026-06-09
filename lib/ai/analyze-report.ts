import { callGroq } from "./groq";
import { callCerebras } from "./cerebras";
import { buildAnalysisMessages } from "./prompts";
import type { AIReportInput, AIReportOutput } from "./types";

function fallback(input: AIReportInput): AIReportOutput {
  const contradictionCount = input.contradictions.length;
  const changeCount = input.changes.length;
  return {
    summary: `TruthCI completed the scan. It found ${changeCount} deterministic change${changeCount === 1 ? "" : "s"} and ${contradictionCount} potential contradiction${contradictionCount === 1 ? "" : "s"}.`,
    impact: contradictionCount > 0 ? "Potential user trust impact: public product surfaces may be making conflicting claims. Review high-severity findings first." : changeCount > 0 ? "Potential user impact depends on whether changed pages affect pricing, limits, API behavior, security, or availability expectations." : "No material public drift was detected in this scan.",
    explanation: "AI explanation was unavailable, so this report uses deterministic diff and rule-based contradiction output only.",
    provider: null
  };
}

function parseProviderOutput(raw: string, provider: string): AIReportOutput {
  const cleaned = raw.trim().replace(/^```json/i, "").replace(/^```/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(cleaned) as Partial<AIReportOutput>;
  return {
    summary: parsed.summary ?? "TruthCI generated an AI summary, but the provider returned an incomplete response.",
    impact: parsed.impact ?? "Review detected changes and contradictions for customer-facing impact.",
    explanation: parsed.explanation ?? "No detailed explanation returned.",
    provider
  };
}

export async function analyzeReport(input: AIReportInput): Promise<AIReportOutput> {
  const messages = buildAnalysisMessages(input);
  try {
    return parseProviderOutput(await callGroq(messages), "groq");
  } catch (error) {
    console.warn("Groq analysis failed", error);
  }
  try {
    return parseProviderOutput(await callCerebras(messages), "cerebras");
  } catch (error) {
    console.warn("Cerebras analysis failed", error);
  }
  return fallback(input);
}
