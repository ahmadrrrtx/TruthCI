import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { migrate } from "@/lib/db/migrate";
import { getProjectsForUser } from "@/lib/services/project-service";

export default async function DashboardPage() {
  await migrate();
  const user = await requireUser();
  const projects = await getProjectsForUser(user.id);

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Monitor public product surfaces for drift, changes, and contradictions."
        actions={<Link href="/projects/new"><Button><Plus className="h-4 w-4" /> New project</Button></Link>}
      />
      {projects.length === 0 ? (
        <EmptyState title="No projects yet" description="Create your first monitored product and run a bounded public scan." href="/projects/new" action="Create project" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>
      )}
    </AppShell>
  );
}
