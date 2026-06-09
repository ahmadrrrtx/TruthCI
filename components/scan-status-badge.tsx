import { Badge } from "./ui/badge";

export function ScanStatusBadge({ status }: { status?: string | null }) {
  const styles: Record<string, string> = {
    completed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    running: "border-blue-500/40 bg-blue-500/10 text-blue-200",
    pending: "border-yellow-500/40 bg-yellow-500/10 text-yellow-200",
    failed: "border-red-500/40 bg-red-500/10 text-red-200"
  };
  const value = status ?? "none";
  return <Badge className={styles[value] ?? "border-slate-700 bg-slate-800 text-slate-300"}>{value}</Badge>;
}
