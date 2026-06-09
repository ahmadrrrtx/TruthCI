import { Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

export function ReportSummary({ summary, impact, explanation, provider }: { summary?: string | null; impact?: string | null; explanation?: string | null; provider?: string | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-violet-300" /> AI explanation <Badge>{provider ?? "fallback"}</Badge></CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div><h3 className="font-medium text-white">Summary</h3><p className="mt-2 text-sm leading-6 text-slate-400">{summary ?? "No summary available."}</p></div>
        <div><h3 className="font-medium text-white">Impact</h3><p className="mt-2 text-sm leading-6 text-slate-400">{impact ?? "No impact available."}</p></div>
        <div><h3 className="font-medium text-white">Explanation</h3><p className="mt-2 text-sm leading-6 text-slate-400">{explanation ?? "No explanation available."}</p></div>
      </CardContent>
    </Card>
  );
}
