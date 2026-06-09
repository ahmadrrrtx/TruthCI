import { getReportByScanId, insertReport } from "@/lib/db/queries/reports";
import { createId } from "@/lib/utils/ids";
import type { StructuredChange } from "@/lib/diff/types";
import type { Contradiction } from "@/lib/contradictions/types";

export async function createReport(input: {
  scanId: string;
  summary: string;
  impact: string;
  explanation: string;
  contradictions: Contradiction[];
  changes: StructuredChange[];
  aiProvider: string | null;
}) {
  const report = {
    id: createId("report"),
    scan_id: input.scanId,
    summary: input.summary,
    impact: input.impact,
    explanation: input.explanation,
    contradictions: JSON.stringify(input.contradictions),
    changes: JSON.stringify(input.changes),
    ai_provider: input.aiProvider
  };
  await insertReport(report);
  return report;
}

export async function loadParsedReport(scanId: string) {
  const report = await getReportByScanId(scanId);
  if (!report) return null;
  return {
    ...report,
    contradictionsParsed: JSON.parse(report.contradictions) as Contradiction[],
    changesParsed: JSON.parse(report.changes) as StructuredChange[]
  };
}
