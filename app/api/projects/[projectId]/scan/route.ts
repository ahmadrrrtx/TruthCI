import { NextResponse } from "next/server";
import { migrate } from "@/lib/db/migrate";
import { requireApiUser } from "@/lib/auth/session";
import { runProjectScan } from "@/lib/services/scan-service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    await migrate();
    const user = await requireApiUser();
    const { projectId } = await params;
    const result = await runProjectScan(projectId, user.id);
    return NextResponse.json(result, { status: result.status === "failed" ? 500 : 200 });
  } catch (error) {
    const status = typeof error === "object" && error && "status" in error ? Number((error as { status: number }).status) : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status });
  }
}
