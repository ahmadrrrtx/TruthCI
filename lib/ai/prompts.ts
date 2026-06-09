import type { AIReportInput } from "./types";

export function buildAnalysisMessages(input: AIReportInput) {
  const system = `You are analyzing public product documentation drift for TruthCI.

Use only the structured diffs, contradictions, and excerpts provided.
Do not invent facts.
Do not claim something changed unless it appears in the diff.
Do not claim a contradiction unless it appears in the contradiction list.
Write for a technical founder, product manager, DevRel lead, or docs owner.
Return compact JSON with keys: summary, impact, explanation.`;

  const payload = {
    projectName: input.projectName,
    rootUrl: input.rootUrl,
    previousScanAt: input.previousScanAt,
    currentScanAt: input.currentScanAt,
    changes: input.changes.slice(0, 20),
    contradictions: input.contradictions.slice(0, 20),
    currentSnapshots: input.currentSnapshots.map((snapshot) => ({
      ...snapshot,
      contentExcerpt: snapshot.contentExcerpt.slice(0, 2000)
    }))
  };

  return [
    { role: "system", content: system },
    { role: "user", content: JSON.stringify(payload, null, 2) }
  ];
}
