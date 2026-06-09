export type StructuredChange = {
  type: "added_page" | "removed_page" | "modified_page";
  url: string;
  title?: string | null;
  addedText: string[];
  removedText: string[];
  changedRatio: number;
  significance: "low" | "medium" | "high";
};
