import Link from "next/link";
import { Clock, ExternalLink } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { RunScanButton } from "@/components/run-scan-button";
import { ScanStatusBadge } from "@/components/scan-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { migrate } from "@/lib/db/migrate";
import { requireUser } from "@/lib/auth/session";
import { requireProjectForUser } from "@/lib/services/project-service";
import { getScansForProject } from "@/lib/services/scan-service";
import { formatDateTime } from "@/lib/utils/dates";

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  await migrate();
  const user = await requireUser();
  const { projectId } = await params;
  const project = await requireProjectForUser(projectId, user.id);
  const scans = await getScansForProject(project.id, user.id);
  const latest = scans[0];

  return (
    <AppShell>
      <PageHeader
        title={project.name}
        description={project.root_url}
        actions={<RunScanButton projectId={project.id} />}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent><div className="text-sm text-slate-500">Root URL</div><a className="mt-2 flex items-center gap-2 text-slate-100" href={project.root_url} target="_blank"><ExternalLink className="h-4 w-4" /> {new URL(project.root_url).hostname}</a></CardContent></Card>
        <Card><CardContent><div className="text-sm text-slate-500">Latest status</div><div className="mt-2"><ScanStatusBadge status={latest?.status} /></div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-slate-500">Latest scan</div><div className="mt-2 flex items-center gap-2 text-slate-100"><Clock className="h-4 w-4" /> {formatDateTime(latest?.started_at)}</div></CardContent></Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent scans</CardTitle>
          <Link href={`/projects/${project.id}/history`}><Button variant="secondary">View history</Button></Link>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {scans.length === 0 ? <p className="text-sm text-slate-400">No scans yet. Run the first scan to create a baseline snapshot.</p> : (
            <Table>
              <thead><tr><Th>Started</Th><Th>Status</Th><Th>Pages</Th><Th>Changes</Th><Th>Contradictions</Th><Th></Th></tr></thead>
              <tbody>{scans.slice(0, 8).map((scan) => {
                const changes = scan.changes ? JSON.parse(scan.changes).length : 0;
                const contradictions = scan.contradictions ? JSON.parse(scan.contradictions).length : 0;
                return <tr key={scan.id}><Td>{formatDateTime(scan.started_at)}</Td><Td><ScanStatusBadge status={scan.status} /></Td><Td>{scan.snapshot_count}</Td><Td>{changes}</Td><Td>{contradictions}</Td><Td><Link className="text-violet-300 hover:text-violet-200" href={`/projects/${project.id}/scans/${scan.id}`}>View</Link></Td></tr>;
              })}</tbody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
