import { dbGet, dbRun } from "@/lib/db/client";

export type ReportRecord = {
  id: string;
  scan_id: string;
  summary: string | null;
  impact: string | null;
  explanation: string | null;
  contradictions: string;
  changes: string;
  ai_provider: string | null;
  created_at: string;
};

export async function insertReport(input: Omit<ReportRecord, "created_at">) {
  await dbRun(
    `
      INSERT INTO reports (id, scan_id, summary, impact, explanation, contradictions, changes, ai_provider)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.id,
      input.scan_id,
      input.summary,
      input.impact,
      input.explanation,
      input.contradictions,
      input.changes,
      input.ai_provider
    ]
  );
}

export async function getReportByScanId(scanId: string) {
  return dbGet<ReportRecord>("SELECT * FROM reports WHERE scan_id = ?", [scanId]);
}
