import { NextResponse } from "next/server";
import { migrate } from "@/lib/db/migrate";
import { requireApiUser } from "@/lib/auth/session";
import { createProject, getProjectsForUser } from "@/lib/services/project-service";

export const runtime = "nodejs";

function jsonError(error: unknown) {
  const status = typeof error === "object" && error && "status" in error ? Number((error as { status: number }).status) : 500;
  const message = error instanceof Error ? error.message : "Unexpected error";
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    await migrate();
    const user = await requireApiUser();
    return NextResponse.json({ projects: await getProjectsForUser(user.id) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    await migrate();
    const user = await requireApiUser();
    const body = await request.json();
    const project = await createProject(user.id, body);
    return NextResponse.json({ project });
  } catch (error) {
    return jsonError(error);
  }
}
