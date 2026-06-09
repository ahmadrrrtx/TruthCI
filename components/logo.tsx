import { ShieldCheck } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2 font-semibold tracking-tight text-white">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500 shadow-lg shadow-violet-950/40">
        <ShieldCheck className="h-5 w-5" />
      </div>
      <span>TruthCI</span>
    </div>
  );
}
