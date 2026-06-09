import { NextResponse } from "next/server";
import { migrate } from "@/lib/db/migrate";
import { requireApiUser } from "@/lib/auth/session";
import { requireProjectForUser } from "@/lib/services/project-service";
import { getScansForProject } from "@/lib/services/scan-service";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    await migrate();
    const user = await requireApiUser();
    const { projectId } = await params;
    const project = await requireProjectForUser(projectId, user.id);
    const scans = await getScansForProject(project.id, user.id);
    return NextResponse.json({ project, scans });
  } catch (error) {
    const status = typeof error === "object" && error && "status" in error ? Number((error as { status: number }).status) : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status });
  }
}
