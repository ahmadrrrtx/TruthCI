import { NextResponse } from "next/server";
import { migrate } from "@/lib/db/migrate";
import { requireApiUser } from "@/lib/auth/session";
import { getScanResultForUser } from "@/lib/services/scan-service";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ scanId: string }> }) {
  try {
    await migrate();
    const user = await requireApiUser();
    const { scanId } = await params;
    return NextResponse.json(await getScanResultForUser(scanId, user.id));
  } catch (error) {
    const status = typeof error === "object" && error && "status" in error ? Number((error as { status: number }).status) : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status });
  }
}
