const KEYWORDS = [
  "pricing", "docs", "documentation", "api", "developers", "developer", "changelog", "release", "releases", "updates", "plans", "features", "security", "terms", "limits", "support", "status"
];

export function scoreUrl(url: string) {
  const lower = url.toLowerCase();
  let score = 0;
  for (const keyword of KEYWORDS) {
    if (lower.includes(keyword)) score += 10;
  }
  if (/\/pricing\/?$/i.test(lower)) score += 30;
  if (/\/docs?\/?$/i.test(lower)) score += 25;
  if (/\/changelog\/?$/i.test(lower)) score += 20;
  const depth = new URL(url).pathname.split("/").filter(Boolean).length;
  return score - depth;
}

export function prioritizeUrls(urls: string[], rootUrl: string, max: number) {
  const unique = Array.from(new Set(urls));
  unique.sort((a, b) => {
    if (a === rootUrl) return -1;
    if (b === rootUrl) return 1;
    return scoreUrl(b) - scoreUrl(a) || a.localeCompare(b);
  });
  return unique.slice(0, max);
}
