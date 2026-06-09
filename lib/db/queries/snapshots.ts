import { dbAll, dbRun } from "@/lib/db/client";

export type SnapshotRecord = {
  id: string;
  scan_id: string;
  url: string;
  title: string | null;
  description: string | null;
  content: string;
  html: string | null;
  screenshot_path: string | null;
  links_json: string;
  created_at: string;
};

export async function insertSnapshot(snapshot: Omit<SnapshotRecord, "created_at">) {
  await dbRun(
    `
      INSERT INTO snapshots (id, scan_id, url, title, description, content, html, screenshot_path, links_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      snapshot.id,
      snapshot.scan_id,
      snapshot.url,
      snapshot.title,
      snapshot.description,
      snapshot.content,
      snapshot.html,
      snapshot.screenshot_path,
      snapshot.links_json
    ]
  );
}

export async function listSnapshotsForScan(scanId: string) {
  return dbAll<SnapshotRecord>("SELECT * FROM snapshots WHERE scan_id = ? ORDER BY url ASC", [scanId]);
}
