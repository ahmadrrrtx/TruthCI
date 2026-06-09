import type { Contradiction } from "@/lib/contradictions/types";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";

const severityStyle = {
  high: "border-red-500/40 bg-red-500/10 text-red-200",
  medium: "border-yellow-500/40 bg-yellow-500/10 text-yellow-200",
  low: "border-slate-600 bg-slate-800 text-slate-300"
};

export function ContradictionCard({ contradiction }: { contradiction: Contradiction }) {
  return (
    <Card className="border-red-500/20 bg-red-950/10">
      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={severityStyle[contradiction.severity]}>{contradiction.severity}</Badge>
          <Badge>{contradiction.type.replace(/_/g, " ")}</Badge>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-300">{contradiction.explanation}</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"><div className="text-xs text-slate-500">Claim A</div><blockquote className="mt-2 text-sm text-white">“{contradiction.claimA.text}”</blockquote><a className="mt-3 block truncate text-xs text-violet-300" href={contradiction.claimA.url} target="_blank">{contradiction.claimA.url}</a></div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"><div className="text-xs text-slate-500">Claim B</div><blockquote className="mt-2 text-sm text-white">“{contradiction.claimB.text}”</blockquote><a className="mt-3 block truncate text-xs text-violet-300" href={contradiction.claimB.url} target="_blank">{contradiction.claimB.url}</a></div>
        </div>
      </CardContent>
    </Card>
  );
}
