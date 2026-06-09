import { dbAll, dbGet, dbRun } from "@/lib/db/client";

export type ScanRecord = {
  id: string;
  project_id: string;
  started_at: string;
  completed_at: string | null;
  status: "pending" | "running" | "completed" | "failed";
  error: string | null;
};

export type ScanWithCounts = ScanRecord & {
  snapshot_count: number;
  report_id: string | null;
  changes: string | null;
  contradictions: string | null;
};

export async function insertScan(input: Pick<ScanRecord, "id" | "project_id" | "status">) {
  await dbRun("INSERT INTO scans (id, project_id, status) VALUES (?, ?, ?)", [input.id, input.project_id, input.status]);
  return (await getScanById(input.id))!;
}

export async function updateScanStatus(id: string, status: ScanRecord["status"], error?: string | null) {
  if (status === "completed" || status === "failed") {
    await dbRun("UPDATE scans SET status = ?, completed_at = CURRENT_TIMESTAMP, error = ? WHERE id = ?", [status, error ?? null, id]);
  } else {
    await dbRun("UPDATE scans SET status = ?, error = ? WHERE id = ?", [status, error ?? null, id]);
  }
}

export async function getScanById(id: string) {
  return dbGet<ScanRecord>("SELECT * FROM scans WHERE id = ?", [id]);
}

export async function listScansForProject(projectId: string) {
  return dbAll<ScanWithCounts>(
    `
      SELECT s.*,
        COUNT(sn.id) as snapshot_count,
        r.id as report_id,
        r.changes as changes,
        r.contradictions as contradictions
      FROM scans s
      LEFT JOIN snapshots sn ON sn.scan_id = s.id
      LEFT JOIN reports r ON r.scan_id = s.id
      WHERE s.project_id = ?
      GROUP BY s.id
      ORDER BY s.started_at DESC
    `,
    [projectId]
  );
}

export async function getPreviousCompletedScan(projectId: string, currentScanId: string) {
  return dbGet<ScanRecord>(
    `
      SELECT * FROM scans
      WHERE project_id = ? AND id != ? AND status = 'completed'
      ORDER BY started_at DESC
      LIMIT 1
    `,
    [projectId, currentScanId]
  );
}
