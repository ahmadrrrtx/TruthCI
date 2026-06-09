import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { ProjectWithLatestScan } from "@/lib/db/queries/projects";
import { formatDateTime } from "@/lib/utils/dates";
import { Card, CardContent } from "./ui/card";
import { ScanStatusBadge } from "./scan-status-badge";

export function ProjectCard({ project }: { project: ProjectWithLatestScan }) {
  let contradictions = 0;
  try { contradictions = project.latest_contradictions ? JSON.parse(project.latest_contradictions).length : 0; } catch {}

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="h-full transition hover:border-violet-500/50 hover:bg-slate-900/70">
        <CardContent>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">{project.name}</h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-400"><ExternalLink className="h-3.5 w-3.5" /> {project.root_url}</p>
            </div>
            <ScanStatusBadge status={project.latest_scan_status} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-900/80 p-3">
              <div className="text-slate-500">Last scan</div>
              <div className="mt-1 text-slate-200">{formatDateTime(project.latest_scan_started_at)}</div>
            </div>
            <div className="rounded-xl bg-slate-900/80 p-3">
              <div className="text-slate-500">Contradictions</div>
              <div className="mt-1 text-slate-200">{contradictions}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
