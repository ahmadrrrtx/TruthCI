import { diffLines } from "diff";
import type { SnapshotRecord } from "@/lib/db/queries/snapshots";
import { normalizeUrl } from "@/lib/utils/urls";
import { normalizeContent, snippetize } from "./normalize-content";
import type { StructuredChange } from "./types";

const IMPORTANT_KEYWORDS = [
  "pricing", "price", "rate limit", "limit", "unlimited", "free", "paid", "enterprise", "sla", "security", "retention", "api", "deprecated", "removed", "credit card", "soc 2", "compliance"
];

function significance(ratio: number, added: string[], removed: string[]): StructuredChange["significance"] {
  const body = [...added, ...removed].join(" ").toLowerCase();
  if (IMPORTANT_KEYWORDS.some((keyword) => body.includes(keyword))) return "high";
  if (ratio >= 0.2) return "high";
  if (ratio >= 0.05) return "medium";
  return "low";
}

function changedRatio(previous: string, added: string[], removed: string[]) {
  const changed = [...added, ...removed].join(" ").length;
  return previous.length ? Math.min(1, changed / previous.length) : 1;
}

export function computeSnapshotDiff(previousSnapshots: SnapshotRecord[], currentSnapshots: SnapshotRecord[]): StructuredChange[] {
  const previousByUrl = new Map(previousSnapshots.map((snapshot) => [normalizeUrl(snapshot.url), snapshot]));
  const currentByUrl = new Map(currentSnapshots.map((snapshot) => [normalizeUrl(snapshot.url), snapshot]));
  const changes: StructuredChange[] = [];

  for (const [url, current] of currentByUrl) {
    const previous = previousByUrl.get(url);
    if (!previous) {
      const addedText = snippetize(normalizeContent(current.content));
      changes.push({ type: "added_page", url, title: current.title, addedText, removedText: [], changedRatio: 1, significance: "high" });
      continue;
    }

    const prev = normalizeContent(previous.content);
    const curr = normalizeContent(current.content);
    if (prev === curr) continue;

    const parts = diffLines(prev, curr);
    const addedText = parts.filter((part) => part.added).flatMap((part) => snippetize(part.value, 5)).slice(0, 10);
    const removedText = parts.filter((part) => part.removed).flatMap((part) => snippetize(part.value, 5)).slice(0, 10);
    const ratio = changedRatio(prev, addedText, removedText);
    changes.push({
      type: "modified_page",
      url,
      title: current.title,
      addedText,
      removedText,
      changedRatio: Number(ratio.toFixed(3)),
      significance: significance(ratio, addedText, removedText)
    });
  }

  for (const [url, previous] of previousByUrl) {
    if (!currentByUrl.has(url)) {
      changes.push({
        type: "removed_page",
        url,
        title: previous.title,
        addedText: [],
        removedText: snippetize(normalizeContent(previous.content)),
        changedRatio: 1,
        significance: "high"
      });
    }
  }

  return changes;
}
