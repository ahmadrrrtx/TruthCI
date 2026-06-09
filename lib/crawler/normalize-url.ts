import { isProbablyAsset, normalizeUrl, sameOrigin } from "@/lib/utils/urls";

const DENY_PATHS = ["/login", "/signin", "/sign-in", "/signup", "/account", "/checkout", "/cart"];

export function normalizeCrawlUrl(href: string, rootUrl: string) {
  try {
    if (/^(mailto:|tel:|javascript:|data:)/i.test(href)) return null;
    const absolute = new URL(href, rootUrl);
    if (absolute.protocol !== "http:" && absolute.protocol !== "https:") return null;
    const normalized = normalizeUrl(absolute.toString());
    if (!sameOrigin(normalized, rootUrl)) return null;
    if (isProbablyAsset(normalized)) return null;
    const path = new URL(normalized).pathname.toLowerCase();
    if (DENY_PATHS.some((deny) => path.startsWith(deny))) return null;
    return normalized;
  } catch {
    return null;
  }
}
