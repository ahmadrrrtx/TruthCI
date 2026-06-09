import type { SnapshotRecord } from "@/lib/db/queries/snapshots";
import { Card, CardContent } from "./ui/card";

export function SnapshotList({ snapshots }: { snapshots: SnapshotRecord[] }) {
  if (snapshots.length === 0) return <p className="text-sm text-slate-400">No snapshots saved.</p>;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {snapshots.map((snapshot) => (
        <Card key={snapshot.id}>
          <CardContent>
            <h3 className="truncate font-medium text-white">{snapshot.title ?? "Untitled page"}</h3>
            <a className="mt-1 block truncate text-sm text-violet-300" href={snapshot.url} target="_blank">{snapshot.url}</a>
            <p className="mt-4 line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-slate-400">{snapshot.content.slice(0, 700)}</p>
            {snapshot.screenshot_path ? <p className="mt-3 text-xs text-slate-500">Screenshot: {snapshot.screenshot_path}</p> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
