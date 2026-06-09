import { AppShell } from "@/components/app-shell";
import { CreateProjectForm } from "@/components/create-project-form";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";

export default async function NewProjectPage() {
  await requireUser();
  return (
    <AppShell>
      <PageHeader title="Create project" description="Add a public product URL for TruthCI to monitor." />
      <Card className="max-w-2xl"><CardContent><CreateProjectForm /></CardContent></Card>
    </AppShell>
  );
}
