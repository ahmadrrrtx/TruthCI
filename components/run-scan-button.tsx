"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlayCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Alert } from "./ui/alert";

export function RunScanButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runScan() {
    setRunning(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/scan`, { method: "POST" });
      const json = await response.json();
      if (!response.ok && json.status !== "failed") throw new Error(json.error ?? "Scan failed");
      if (json.scanId) {
        router.push(`/projects/${projectId}/scans/${json.scanId}`);
        router.refresh();
      } else {
        throw new Error(json.error ?? "Scan did not return a scan ID");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Scan failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <Button onClick={runScan} disabled={running}>
        <PlayCircle className="h-4 w-4" /> {running ? "Scanning…" : "Run scan"}
      </Button>
      {running ? <p className="mt-2 text-xs text-slate-500">Crawling can take up to a minute for the MVP bounded scan.</p> : null}
      {error ? <Alert className="mt-3 border-red-500/30 bg-red-950/20 text-red-200">{error}</Alert> : null}
    </div>
  );
}
