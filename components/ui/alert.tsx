import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function Alert({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300", className)} {...props} />;
}
