import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ScanStatusBadge } from "@/components/scan-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { migrate } from "@/lib/db/migrate";
import { requireUser } from "@/lib/auth/session";
import { requireProjectForUser } from "@/lib/services/project-service";
import { getScansForProject } from "@/lib/services/scan-service";
import { formatDateTime } from "@/lib/utils/dates";

export default async function HistoryPage({ params }: { params: Promise<{ projectId: string }> }) {
  await migrate();
  const user = await requireUser();
  const { projectId } = await params;
  const project = await requireProjectForUser(projectId, user.id);
  const scans = await getScansForProject(project.id, user.id);

  return (
    <AppShell>
      <PageHeader title="Scan history" description={project.name} actions={<Link href={`/projects/${project.id}`}><Button variant="secondary"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>} />
      <Card><CardContent className="overflow-x-auto">
        <Table>
          <thead><tr><Th>Started</Th><Th>Completed</Th><Th>Status</Th><Th>Pages</Th><Th>Changes</Th><Th>Contradictions</Th><Th></Th></tr></thead>
          <tbody>{scans.map((scan) => {
            const changes = scan.changes ? JSON.parse(scan.changes).length : 0;
            const contradictions = scan.contradictions ? JSON.parse(scan.contradictions).length : 0;
            return <tr key={scan.id}><Td>{formatDateTime(scan.started_at)}</Td><Td>{formatDateTime(scan.completed_at)}</Td><Td><ScanStatusBadge status={scan.status} /></Td><Td>{scan.snapshot_count}</Td><Td>{changes}</Td><Td>{contradictions}</Td><Td><Link className="text-violet-300" href={`/projects/${project.id}/scans/${scan.id}`}>View</Link></Td></tr>;
          })}</tbody>
        </Table>
      </CardContent></Card>
    </AppShell>
  );
}
