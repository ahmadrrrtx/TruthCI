import { createId } from "@/lib/utils/ids";
import { insertScan, updateScanStatus, getScanById, listScansForProject, getPreviousCompletedScan } from "@/lib/db/queries/scans";
import { insertSnapshot, listSnapshotsForScan } from "@/lib/db/queries/snapshots";
import { getProjectByScanForUser } from "@/lib/db/queries/projects";
import { requireProjectForUser } from "./project-service";
import { computeSnapshotDiff } from "@/lib/diff/compute-diff";
import { detectContradictions } from "@/lib/contradictions/detect-contradictions";
import { analyzeReport } from "@/lib/ai/analyze-report";
import { createReport, loadParsedReport } from "./report-service";

function buildSnapshotContent(page: { title: string | null; description: string | null; headings: string[]; visibleText: string }) {
  return [
    page.title ? `Title: ${page.title}` : null,
    page.description ? `Description: ${page.description}` : null,
    page.headings.length ? `Headings:\n${page.headings.join("\n")}` : null,
    page.visibleText
  ].filter(Boolean).join("\n\n");
}

export async function runProjectScan(projectId: string, userId: string) {
  const project = await requireProjectForUser(projectId, userId);
  const scan = await insertScan({ id: createId("scan"), project_id: project.id, status: "running" });
  console.log("scan started", { scanId: scan.id, projectId: project.id });

  try {
    const { crawlProject } = await import("@/lib/crawler/crawl");
    const crawledPages = await crawlProject(project.root_url, scan.id);
    for (const page of crawledPages) {
      await insertSnapshot({
        id: createId("snap"),
        scan_id: scan.id,
        url: page.url,
        title: page.title,
        description: page.description,
        content: buildSnapshotContent(page),
        html: page.html,
        screenshot_path: page.screenshotPath,
        links_json: JSON.stringify(page.links)
      });
    }

    const currentSnapshots = await listSnapshotsForScan(scan.id);
    const previousScan = await getPreviousCompletedScan(project.id, scan.id);
    const previousSnapshots = previousScan ? await listSnapshotsForScan(previousScan.id) : [];
    const changes = computeSnapshotDiff(previousSnapshots, currentSnapshots);
    const contradictions = detectContradictions(currentSnapshots);
    const ai = await analyzeReport({
      projectName: project.name,
      rootUrl: project.root_url,
      previousScanAt: previousScan?.completed_at ?? previousScan?.started_at ?? null,
      currentScanAt: new Date().toISOString(),
      changes,
      contradictions,
      currentSnapshots: currentSnapshots.map((snapshot) => ({
        url: snapshot.url,
        title: snapshot.title,
        contentExcerpt: snapshot.content.slice(0, 2000)
      }))
    });

    const report = await createReport({
      scanId: scan.id,
      summary: ai.summary,
      impact: ai.impact,
      explanation: ai.explanation,
      contradictions,
      changes,
      aiProvider: ai.provider
    });

    await updateScanStatus(scan.id, "completed");
    console.log("scan completed", { scanId: scan.id, pages: currentSnapshots.length, changes: changes.length, contradictions: contradictions.length });
    return { scanId: scan.id, status: "completed" as const, reportId: report.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown scan error";
    await updateScanStatus(scan.id, "failed", message);
    console.error("scan failed", { scanId: scan.id, message });
    return { scanId: scan.id, status: "failed" as const, error: message };
  }
}

export async function getScansForProject(projectId: string, userId: string) {
  const project = await requireProjectForUser(projectId, userId);
  return listScansForProject(project.id);
}

export async function getScanResultForUser(scanId: string, userId: string) {
  const project = await getProjectByScanForUser(scanId, userId);
  if (!project) throw Object.assign(new Error("Scan not found"), { status: 404 });
  const scan = await getScanById(scanId);
  if (!scan) throw Object.assign(new Error("Scan not found"), { status: 404 });
  return {
    project,
    scan,
    snapshots: await listSnapshotsForScan(scanId),
    report: await loadParsedReport(scanId)
  };
}
