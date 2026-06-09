import type { StructuredChange } from "@/lib/diff/types";
import type { Contradiction } from "@/lib/contradictions/types";

export type AIReportInput = {
  projectName: string;
  rootUrl: string;
  previousScanAt: string | null;
  currentScanAt: string;
  changes: StructuredChange[];
  contradictions: Contradiction[];
  currentSnapshots: Array<{ url: string; title: string | null; contentExcerpt: string }>;
};

export type AIReportOutput = {
  summary: string;
  impact: string;
  explanation: string;
  provider: string | null;
};
