"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Alert } from "./ui/alert";

export function CreateProjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [rootUrl, setRootUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, rootUrl })
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Could not create project");
      router.push(`/projects/${json.project.id}`);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error ? <Alert className="border-red-500/30 bg-red-950/20 text-red-200">{error}</Alert> : null}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-200">Project name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme API" required />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-200">Root URL</label>
        <Input value={rootUrl} onChange={(e) => setRootUrl(e.target.value)} placeholder="https://example.com" required />
        <p className="mt-2 text-xs text-slate-500">TruthCI will crawl this origin only and prioritize pricing, docs, API, and changelog pages.</p>
      </div>
      <Button disabled={loading}>{loading ? "Creating…" : "Create project"}</Button>
    </form>
  );
}
