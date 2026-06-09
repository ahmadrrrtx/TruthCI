export function normalizeContent(content: string) {
  return content
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

export function snippetize(value: string, max = 8) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 20)
    .slice(0, max)
    .map((line) => line.slice(0, 500));
}
