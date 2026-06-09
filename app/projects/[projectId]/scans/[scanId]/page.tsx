import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ContradictionCard } from "@/components/contradiction-card";
import { DiffViewer } from "@/components/diff-viewer";
import { PageHeader } from "@/components/page-header";
import { ReportSummary } from "@/components/report-summary";
import { ScanStatusBadge } from "@/components/scan-status-badge";
import { SnapshotList } from "@/components/snapshot-list";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { migrate } from "@/lib/db/migrate";
import { requireUser } from "@/lib/auth/session";
import { getScanResultForUser } from "@/lib/services/scan-service";
import { formatDateTime } from "@/lib/utils/dates";

export default async function ScanResultPage({ params }: { params: Promise<{ projectId: string; scanId: string }> }) {
  await migrate();
  const user = await requireUser();
  const { projectId, scanId } = await params;
  const { project, scan, snapshots, report } = await getScanResultForUser(scanId, user.id);

  return (
    <AppShell>
      <PageHeader
        title="Scan result"
        description={`${project.name} · ${formatDateTime(scan.started_at)}`}
        actions={<Link href={`/projects/${projectId}`}><Button variant="secondary"><ArrowLeft className="h-4 w-4" /> Back to project</Button></Link>}
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card><CardContent><div className="text-sm text-slate-500">Status</div><div className="mt-2"><ScanStatusBadge status={scan.status} /></div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-slate-500">Pages crawled</div><div className="mt-2 text-2xl font-semibold text-white">{snapshots.length}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-slate-500">Changes</div><div className="mt-2 text-2xl font-semibold text-white">{report?.changesParsed.length ?? 0}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-slate-500">Contradictions</div><div className="mt-2 text-2xl font-semibold text-white">{report?.contradictionsParsed.length ?? 0}</div></CardContent></Card>
      </div>

      {scan.status === "failed" ? <Alert className="mb-6 border-red-500/30 bg-red-950/20 text-red-200">{scan.error ?? "Scan failed."}</Alert> : null}
      {report ? <ReportSummary summary={report.summary} impact={report.impact} explanation={report.explanation} provider={report.ai_provider} /> : null}

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-semibold text-white">Contradictions</h2>
        {report?.contradictionsParsed.length ? <div className="space-y-4">{report.contradictionsParsed.map((contradiction) => <ContradictionCard key={contradiction.id} contradiction={contradiction} />)}</div> : <Alert>No contradictions detected by the MVP rule engine.</Alert>}
      </section>

      <section className="mt-8">
        <Card>
          <CardHeader><CardTitle>Changes</CardTitle></CardHeader>
          <CardContent>{report ? <DiffViewer changes={report.changesParsed} /> : <p className="text-sm text-slate-400">No report generated.</p>}</CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-semibold text-white">Snapshots</h2>
        <SnapshotList snapshots={snapshots} />
      </section>
    </AppShell>
  );
}
