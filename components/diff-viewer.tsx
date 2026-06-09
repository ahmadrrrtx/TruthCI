import type { StructuredChange } from "@/lib/diff/types";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";

export function DiffViewer({ changes }: { changes: StructuredChange[] }) {
  if (changes.length === 0) return <p className="text-sm text-slate-400">No deterministic content changes were detected.</p>;
  return (
    <div className="space-y-4">
      {changes.map((change, index) => (
        <Card key={`${change.url}-${index}`}>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{change.type.replace(/_/g, " ")}</Badge>
              <Badge>{change.significance}</Badge>
              <span className="truncate text-sm text-slate-400">{change.url}</span>
            </div>
            {change.addedText.length ? <div className="mt-4"><div className="text-sm font-medium text-emerald-200">Added</div><ul className="mt-2 space-y-2">{change.addedText.map((line, i) => <li key={i} className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">+ {line}</li>)}</ul></div> : null}
            {change.removedText.length ? <div className="mt-4"><div className="text-sm font-medium text-red-200">Removed</div><ul className="mt-2 space-y-2">{change.removedText.map((line, i) => <li key={i} className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-100">− {line}</li>)}</ul></div> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
