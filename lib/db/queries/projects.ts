import { dbAll, dbGet, dbRun } from "@/lib/db/client";

export type ProjectRecord = {
  id: string;
  user_id: string;
  name: string;
  root_url: string;
  created_at: string;
};

export type ProjectWithLatestScan = ProjectRecord & {
  latest_scan_id: string | null;
  latest_scan_status: string | null;
  latest_scan_started_at: string | null;
  latest_contradictions: string | null;
};

export async function insertProject(project: ProjectRecord) {
  await dbRun("INSERT INTO projects (id, user_id, name, root_url, created_at) VALUES (?, ?, ?, ?, ?)", [
    project.id,
    project.user_id,
    project.name,
    project.root_url,
    project.created_at
  ]);
  return project;
}

export async function listProjectsForUser(userId: string) {
  return dbAll<ProjectWithLatestScan>(
    `
      SELECT p.*,
        s.id as latest_scan_id,
        s.status as latest_scan_status,
        s.started_at as latest_scan_started_at,
        r.contradictions as latest_contradictions
      FROM projects p
      LEFT JOIN scans s ON s.id = (
        SELECT id FROM scans WHERE project_id = p.id ORDER BY started_at DESC LIMIT 1
      )
      LEFT JOIN reports r ON r.scan_id = s.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `,
    [userId]
  );
}

export async function getProjectForUser(projectId: string, userId: string) {
  return dbGet<ProjectRecord>("SELECT * FROM projects WHERE id = ? AND user_id = ?", [projectId, userId]);
}

export async function getProjectByScanForUser(scanId: string, userId: string) {
  return dbGet<ProjectRecord>(
    `
      SELECT p.* FROM projects p
      INNER JOIN scans s ON s.project_id = p.id
      WHERE s.id = ? AND p.user_id = ?
    `,
    [scanId, userId]
  );
}
